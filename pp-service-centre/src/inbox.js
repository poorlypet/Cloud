// Reads and updates the real inbox in the database (used once Gmail is connected).
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

export async function listThreads(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM threads WHERE last_message_at > datetime('now', '-45 days') ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, last_inbound_at ASC LIMIT 300"
  ).all();
  return results.map((r) => shapeRow(r));
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
  return {
    ...base,
    messages: msgs.map((m) => ({
      from: m.from_us ? "us" : "customer", name: m.from_us ? "Poorly Pet" : m.from_name || m.from_email, at: m.at, body: m.body || "",
      attachments: parse(m.attachments, []).map((a) => ({ name: a.name, note: `${a.mime || "file"}, ${Math.max(1, Math.round((a.size || 0) / 1024))} KB` }))
    })),
    summary: {
      order_number: order || "Not found in the email", order_date: "Looked up in step 3", issue: r.subject, wants: "AI summary arrives in step 3",
      pet: "Not known yet", points: [r.category_reason ? "Sorted as " + r.category + ": " + r.category_reason : "", `${msgs.length} message${msgs.length === 1 ? "" : "s"} in this conversation`, customerMsgs.length && msgs.some((m) => (parse(m.attachments, [])).length) ? "Has attachments" : ""].filter(Boolean)
    },
    customer: {
      name: r.customer_name || r.customer_email, email: r.customer_email, since: first && first.d ? new Date(first.d).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "New",
      spend: null, mood: base.sentiment === "angry" ? "Upset" : base.sentiment === "happy" ? "Happy" : "Neutral", pets: [], pastEmails: earlier.length, orders: [],
      earlier: earlier.map((e) => ({ subject: e.subject, at: e.last_message_at }))
    },
    why: r.category !== "customer" ? r.category_reason || "Not a customer email" : null, decision: null, offer: null, draft: null
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
