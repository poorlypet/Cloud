// Reads and updates the real inbox in the database (used once Gmail is connected).
import { noDash } from "./nodash.js";
import { generate } from "./draft.js";
const FREE_MAIL = /@(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|aol|proton|protonmail)\./i;
const parse = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };

const ORDER_RE = /\b(?:PP|SUB)-\d{3,6}\b|(?:order\s*(?:number|no\.?|#)?\s*:?\s*#?)(\d{4,7})\b|#(\d{4,7})\b/i;
export function findOrderNumber(text) {
  const m = String(text || "").match(ORDER_RE);
  return m ? (m[0].startsWith("#") ? m[0] : m[0].replace(/^order\s*(?:number|no\.?|#)?\s*:?\s*/i, "#")) : null;
}

export function shapeRow(r, full) {
  const received = r.last_inbound_at || r.last_message_at;
  const base = {
    id: r.id, category: r.category, status: r.status, priority: r.priority || "normal", priorityReason: r.priority_reason || r.category_reason || "",
    sentiment: r.sentiment || "neutral", flags: parse(r.flags, []), received, from: { name: r.customer_name || r.customer_email, email: r.customer_email },
    subject: r.subject, snippet: r.snippet || "", needsDecision: false, hasDraft: false, gaps: 0, handledBy: null,
    categoryReason: r.category_reason, categorySource: r.category_source
  };
  return full ? base : base;
}

const gapCount = (t) => { const s = new Set(); for (const m of String(t || "").matchAll(/\[\[([A-Z0-9_]+)\|[^\]]+\]\]/g)) s.add(m[1]); return s.size; };

export async function listThreads(env) {
  const { results } = await env.DB.prepare(
    `SELECT t.*, d.decision AS d_decision, d.draft AS d_draft, d.error AS d_error, s.draft AS s_draft, s.offer AS s_offer, u.name AS handled_by
     FROM threads t LEFT JOIN drafts d ON d.thread_id = t.id LEFT JOIN thread_state s ON s.thread_id = t.id LEFT JOIN users u ON u.id = s.updated_by
     WHERE t.last_message_at > datetime('now', '-45 days')
     ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.last_inbound_at ASC LIMIT 300`
  ).all();
  return results.map((r) => {
    const base = shapeRow(r);
    const draft = r.s_draft != null ? r.s_draft : r.d_draft;
    base.needsDecision = !!r.d_decision && !r.s_offer && !draft;
    base.hasDraft = !!draft; base.gaps = gapCount(draft); base.draftError = r.d_error || null; base.handledBy = r.handled_by || null;
    return base;
  });
}

export async function getThread(env, id) {
  const r = await env.DB.prepare("SELECT * FROM threads WHERE id = ?").bind(id).first();
  if (!r) return null;
  const { results: msgs } = await env.DB.prepare("SELECT * FROM messages WHERE thread_id = ? ORDER BY at").bind(id).all();
  const base = shapeRow(r, true);
  const customerMsgs = msgs.filter((m) => !m.from_us);
  const all = msgs.map((m) => m.body).join("\n");
  const order = findOrderNumber(r.subject + "\n" + all);
  const { results: earlier } = await env.DB.prepare("SELECT id, subject, last_message_at FROM threads WHERE customer_email = ? AND id != ? ORDER BY last_message_at DESC LIMIT 6").bind(r.customer_email, id).all();
  const first = await env.DB.prepare("SELECT MIN(last_message_at) AS d FROM threads WHERE customer_email = ?").bind(r.customer_email).first();
  const d = await env.DB.prepare("SELECT * FROM drafts WHERE thread_id = ?").bind(id).first();
  const st = await env.DB.prepare("SELECT s.draft, s.offer, u.name AS by FROM thread_state s LEFT JOIN users u ON u.id = s.updated_by WHERE s.thread_id = ?").bind(id).first();
  const facts = d && d.facts ? parse(d.facts, null) : null;
  const ai = d && d.summary ? parse(d.summary, null) : null;
  const decision = d && d.decision ? parse(d.decision, null) : null;
  const draft = st && st.draft != null ? st.draft : d && d.draft ? d.draft : null;
  const orders = facts && facts.orders ? facts.orders.map((o) => {
    const f = o.fulfillments && o.fulfillments[0], t = f && f.tracking && f.tracking[0];
    return { number: o.name, date: new Date(o.created).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), total: o.total, status: [o.payment, o.fulfilment].map((x) => String(x || "").toLowerCase()).join(", ") + (o.refunded ? ", refunded £" + o.refunded.toFixed(2) : ""), items: o.items.map((x) => x.qty + " x " + x.title), tracking: t ? (t.company ? t.company + " " : "") + t.number : f ? "No tracking number in Shopify" : "Not dispatched" };
  }) : [];
  const cust = facts && facts.customer ? facts.customer : null;
  return {
    ...base,
    messages: msgs.map((m) => ({
      from: m.from_us ? "us" : "customer", name: m.from_us ? "Poorly Pet" : m.from_name || m.from_email, at: m.at, body: m.body || "",
      attachments: parse(m.attachments, []).map((a) => ({ name: a.name, note: `${a.mime || "file"}, ${Math.max(1, Math.round((a.size || 0) / 1024))} KB` }))
    })),
    summary: ai ? { ...ai, checked: facts ? facts.checked : [] } : {
      order_number: order || "Not found in the email", order_date: "Not checked yet", issue: r.subject, wants: d && d.error ? "Draft not available yet" : "Being read, a draft follows in a few minutes",
      pet: "Not known yet", checked: facts ? facts.checked : [], points: [r.category_reason ? "Sorted as " + r.category + ": " + r.category_reason : "", `${msgs.length} message${msgs.length === 1 ? "" : "s"} in this conversation`, customerMsgs.length && msgs.some((m) => (parse(m.attachments, [])).length) ? "Has attachments" : ""].filter(Boolean)
    },
    customer: {
      name: r.customer_name || r.customer_email, email: r.customer_email, since: first && first.d ? new Date(first.d).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "New",
      spend: cust ? cust.spent : null, orders_count: cust ? cust.orders : null, mood: base.sentiment === "angry" ? "Upset" : base.sentiment === "happy" ? "Happy" : "Neutral", pets: ai && ai.pet && !/^not/i.test(ai.pet) ? [ai.pet] : [], pastEmails: earlier.length, orders,
      earlier: earlier.map((e) => ({ subject: e.subject, at: e.last_message_at }))
    },
    why: r.category !== "customer" ? r.category_reason || "Not a customer email" : null,
    decision: decision && !(st && st.offer) && !draft ? decision : null, offer: st && st.offer ? st.offer : null, draft,
    needsDecision: !!decision && !(st && st.offer) && !draft, hasDraft: !!draft, gaps: gapCount(draft), draftError: d ? d.error : null, draftedAt: d ? d.generated_at : null, handledBy: st ? st.by : null
  };
}

export async function setStatus(env, id, status) {
  if (!["needs_reply", "done", "ignored", "replied"].includes(status)) throw new Error("Unknown status");
  await env.DB.prepare("UPDATE threads SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, id).run();
}

// A person says "this one is (not) a customer". We move it, and remember the sender so the next one is right too.
export async function setCategory(env, id, category, userId) {
  if (!["customer", "supplier", "marketing", "spam"].includes(category)) throw new Error("Unknown category");
  const r = await env.DB.prepare("SELECT customer_email, last_from_us, last_inbound_at FROM threads WHERE id = ?").bind(id).first();
  if (!r) return null;
  const status = category === "customer" ? (r.last_from_us ? "replied" : "needs_reply") : "ignored";
  await env.DB.prepare("UPDATE threads SET category = ?, category_source = 'person', category_reason = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(category, "Moved by a person", status, id).run();
  const email = String(r.customer_email || "").toLowerCase();
  const domain = email.split("@")[1];
  const pattern = category !== "customer" && domain && !FREE_MAIL.test(email) ? "@" + domain : email;
  if (email) await env.DB.prepare("INSERT INTO sender_rules (pattern, category, created_by) VALUES (?,?,?) ON CONFLICT(pattern) DO UPDATE SET category = excluded.category, created_by = excluded.created_by").bind(pattern, category, userId).run();
  return { status, rule: pattern };
}

/* ---------- drafts ---------- */
export async function generateFor(env, id, offer) {
  const t = await env.DB.prepare("SELECT * FROM threads WHERE id = ?").bind(id).first();
  if (!t) return null;
  const { results: msgs } = await env.DB.prepare("SELECT * FROM messages WHERE thread_id = ? ORDER BY at").bind(id).all();
  const prev = await env.DB.prepare("SELECT for_inbound_at, offer FROM drafts WHERE thread_id = ?").bind(id).first();
  let out;
  try { out = await generate(env, t, msgs, offer); } catch (e) { out = { error: e.message, facts: null }; }
  const fresh = !prev || prev.for_inbound_at !== t.last_inbound_at;
  await env.DB.prepare(
    `INSERT INTO drafts (thread_id, for_inbound_at, summary, decision, draft, facts, sentiment, error, offer, generated_at) VALUES (?,?,?,?,?,?,?,?,?, datetime('now'))
     ON CONFLICT(thread_id) DO UPDATE SET for_inbound_at=excluded.for_inbound_at, summary=COALESCE(excluded.summary, drafts.summary), decision=excluded.decision, draft=excluded.draft,
       facts=COALESCE(excluded.facts, drafts.facts), sentiment=COALESCE(excluded.sentiment, drafts.sentiment), error=excluded.error, offer=excluded.offer, generated_at=excluded.generated_at`
  ).bind(id, t.last_inbound_at, out.summary ? JSON.stringify(out.summary) : null, out.decision ? JSON.stringify(out.decision) : null, out.draft || null, out.facts ? JSON.stringify(out.facts) : null, out.sentiment || null, out.error || null, offer || null).run();
  if (fresh && !offer) await env.DB.prepare("DELETE FROM thread_state WHERE thread_id = ? AND status IS NULL").bind(id).run();
  if (fresh && !offer) await env.DB.prepare("UPDATE thread_state SET draft = NULL, offer = NULL WHERE thread_id = ?").bind(id).run();
  if (out.sentiment && !out.error) await env.DB.prepare("UPDATE threads SET sentiment = ? WHERE id = ?").bind(out.sentiment, id).run();
  return out;
}

// threads that need a reply and have no draft for the latest customer message yet
export async function draftsDue(env, limit) {
  const { results } = await env.DB.prepare(
    `SELECT t.id FROM threads t LEFT JOIN drafts d ON d.thread_id = t.id
     WHERE t.category = 'customer' AND t.status = 'needs_reply' AND t.last_inbound_at IS NOT NULL AND (d.thread_id IS NULL OR d.for_inbound_at != t.last_inbound_at OR (d.error IS NOT NULL AND d.error != '' AND d.generated_at < datetime('now','-15 minutes')))
     ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.last_inbound_at ASC LIMIT ?`
  ).bind(limit).all();
  return results.map((r) => r.id);
}

export async function saveEdit(env, id, draft, userId) {
  const clean = noDash(String(draft || "")).slice(0, 20000);
  await env.DB.prepare(`INSERT INTO thread_state (thread_id, draft, updated_by, updated_at) VALUES (?,?,?, datetime('now')) ON CONFLICT(thread_id) DO UPDATE SET draft = excluded.draft, updated_by = excluded.updated_by, updated_at = excluded.updated_at`).bind(id, clean, userId).run();
  return clean;
}
export async function chooseOffer(env, id, optionKey, custom, note, userId) {
  const d = await env.DB.prepare("SELECT decision FROM drafts WHERE thread_id = ?").bind(id).first();
  const dec = d && d.decision ? parse(d.decision, null) : null;
  const opt = dec && dec.options.find((o) => o.key === optionKey);
  const text = noDash([custom ? String(custom).trim() : opt ? opt.label : "", note ? String(note).trim() : ""].filter(Boolean).join(". ")).slice(0, 600);
  if (!text) throw new Error("Choose an offer, or type one");
  await env.DB.prepare(`INSERT INTO thread_state (thread_id, offer, draft, updated_by, updated_at) VALUES (?,?,NULL,?, datetime('now')) ON CONFLICT(thread_id) DO UPDATE SET offer = excluded.offer, draft = NULL, updated_by = excluded.updated_by, updated_at = excluded.updated_at`).bind(id, text, userId).run();
  const out = await generateFor(env, id, text);
  return { text, out };
}
