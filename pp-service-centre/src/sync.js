// Reads the Gmail inbox, files each thread in the database and sorts customer emails from the rest.
import { gmail, parseMessage, customerOf, kvGet, kvSet } from "./gmail.js";
import { classify, boostForWait } from "./classify.js";

const MAX_PER_RUN = 20;   // threads read per run, the rest are picked up by the next run a few minutes later
const noDashText = (s) => String(s || "").replace(/\s*[—–]\s*/g, ", ");

async function senderRule(env, email) {
  const domain = "@" + String(email).split("@")[1];
  return env.DB.prepare("SELECT pattern, category FROM sender_rules WHERE pattern = ? OR pattern = ? ORDER BY length(pattern) DESC LIMIT 1").bind(email, domain).first();
}

export async function syncInbox(env, opts = {}) {
  const mailbox = (await kvGet(env, "gmail_email")) || env.MAILBOX;
  if (!mailbox) throw new Error("Gmail is not connected");
  const days = opts.days || 30;
  const stats = { listed: 0, read: 0, classified: 0, skipped: 0, errors: 0 };
  const list = await gmail(env, "/users/me/threads", { q: `in:inbox newer_than:${days}d`, maxResults: 100 });
  const ids = (list.threads || []).map((t) => ({ id: t.id, historyId: t.historyId }));
  stats.listed = ids.length;

  // only look at threads that are new or changed since last time
  const known = {};
  if (ids.length) {
    const marks = ids.map(() => "?").join(",");
    const { results } = await env.DB.prepare(`SELECT id, history_id FROM threads WHERE id IN (${marks})`).bind(...ids.map((x) => x.id)).all();
    for (const r of results) known[r.id] = r.history_id;
  }
  const todo = ids.filter((t) => known[t.id] !== t.historyId).slice(0, MAX_PER_RUN);
  stats.skipped = ids.length - todo.length;

  for (const t of todo) {
    try {
      const full = await gmail(env, "/users/me/threads/" + t.id, { format: "full" });
      const msgs = (full.messages || []).map((m) => parseMessage(m, mailbox)).sort((a, b) => a.at.localeCompare(b.at));
      if (!msgs.length) continue;
      stats.read++;
      const last = msgs[msgs.length - 1];
      const lastInbound = [...msgs].reverse().find((m) => !m.fromUs);
      const firstInbound = msgs.find((m) => !m.fromUs);
      const who = customerOf(firstInbound || last);
      const existing = await env.DB.prepare("SELECT category, category_source FROM threads WHERE id = ?").bind(t.id).first();

      // a person's decision is never overwritten by the AI
      let cls = null;
      if (existing && existing.category_source === "person") cls = { category: existing.category, source: "person" };
      else if (lastInbound) {
        cls = await classify(env, { ...lastInbound, bulk: lastInbound.bulk, from: who === lastInbound.from ? lastInbound.from : who, replyTo: lastInbound.replyTo }, await senderRule(env, who.email));
        stats.classified++;
      }
      cls = cls || { category: existing ? existing.category : "customer", source: "rule" };

      const fromUs = last.fromUs ? 1 : 0;
      let status = !lastInbound ? "replied" : fromUs ? "replied" : "needs_reply";
      if (cls.category !== "customer") status = "ignored";
      const waitHours = lastInbound ? (Date.now() - Date.parse(lastInbound.at)) / 3600000 : 0;
      const priority = cls.category === "customer" ? boostForWait(cls.priority || "normal", waitHours) : "low";

      await env.DB.prepare(
        `INSERT INTO threads (id, history_id, subject, customer_name, customer_email, last_message_at, last_inbound_at, last_from_us, category, category_source, category_reason, confidence,
           priority, priority_reason, sentiment, flags, status, message_count, snippet, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET history_id=excluded.history_id, subject=excluded.subject, customer_name=excluded.customer_name, customer_email=excluded.customer_email,
           last_message_at=excluded.last_message_at, last_inbound_at=excluded.last_inbound_at, last_from_us=excluded.last_from_us, category=excluded.category, category_source=excluded.category_source,
           category_reason=excluded.category_reason, confidence=excluded.confidence, priority=excluded.priority, priority_reason=excluded.priority_reason, sentiment=excluded.sentiment, flags=excluded.flags,
           status=CASE WHEN threads.status IN ('done') AND excluded.status = 'needs_reply' AND threads.last_inbound_at = excluded.last_inbound_at THEN threads.status WHEN threads.status = 'needs_reply' AND threads.last_from_us = 1 AND excluded.status = 'replied' THEN threads.status ELSE excluded.status END,
           message_count=excluded.message_count, snippet=excluded.snippet, updated_at=excluded.updated_at`
      ).bind(
        t.id, t.historyId, noDashText(last.subject || firstInbound?.subject || "(no subject)"), who.name || who.email, who.email, last.at, lastInbound ? lastInbound.at : null, fromUs,
        cls.category, cls.source, cls.reason || null, cls.confidence == null ? null : cls.confidence, priority, cls.priorityReason || null, cls.sentiment || "neutral",
        JSON.stringify(cls.flags || []), status, msgs.length, (lastInbound || last).body.slice(0, 160)
      ).run();

      for (const m of msgs) {
        await env.DB.prepare(
          `INSERT INTO messages (id, thread_id, from_name, from_email, to_email, at, body, from_us, attachments) VALUES (?,?,?,?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET body=excluded.body, attachments=excluded.attachments`
        ).bind(m.id, t.id, m.from.name, m.from.email, m.to, m.at, m.body, m.fromUs ? 1 : 0, JSON.stringify(m.attachments || [])).run();
      }
    } catch (e) {
      stats.errors++;
      console.error("sync thread", t.id, e.message);
    }
  }
  await kvSet(env, "last_sync_at", new Date().toISOString());
  await kvSet(env, "gmail_error", stats.errors && !stats.read ? "Some emails could not be read, check the Gmail connection" : "");
  return stats;
}
