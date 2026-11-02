// Gathers the facts about an email (from Shopify and the earlier emails), then asks the AI for a summary and a draft reply.
import { noDash } from "./nodash.js";
import { orderByName, ordersByEmail, shopifyReady } from "./shopify.js";
import { kvGet } from "./gmail.js";
import { DEFAULT_KNOWLEDGE } from "./knowledge.default.js";

export const DEFAULT_TONE = `Write as the Poorly Pet team, a small, friendly UK shop that sells health, recovery and mobility products for dogs and cats.
Sound like a kind, capable person, not a company. Plain British English, short paragraphs, no jargon, no corporate phrases.
Start with "Hi" and the customer's first name. Use their pet's name when you know it. Thank them or say sorry once, genuinely, near the start.
If we got something wrong, say so plainly and do not make excuses. Say clearly what happens next and when.
Finish with a single warm line, then "Kind regards". Do not write a name or signature after it, the real email signature is added automatically.
Never use em dashes or en dashes anywhere. Use commas, full stops or the word "and" instead.
Never give medical or veterinary advice. If a pet seems unwell, say a vet is the right person and keep our part to products and orders.`;

const money = (n) => "£" + Number(n).toFixed(2);
const day = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
export function workingDaysBetween(fromIso, to = new Date()) {
  let d = new Date(fromIso), n = 0; const end = new Date(to);
  d.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
  while (d < end) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}

const ORDER_NO = /#\d{3,6}\b|\border\s*(?:number|no\.?|#)?\s*:?\s*#?(\d{4,6})\b/gi;
export function orderNumbersIn(text) {
  const out = [];
  for (const m of String(text || "").matchAll(ORDER_NO)) { const n = "#" + (m[1] || m[0].replace(/\D/g, "")); if (!out.includes(n)) out.push(n); }
  return out.slice(0, 3);
}

export async function gatherFacts(env, thread, msgs) {
  const customerText = msgs.filter((m) => !m.from_us).map((m) => m.body).join("\n") + "\n" + (thread.subject || "");
  const facts = { today: new Date().toISOString(), shopify: shopifyReady(env), orders: [], checked: [], customer: null, earlier: [] };
  const { results: earlier } = await env.DB.prepare("SELECT subject, last_message_at FROM threads WHERE customer_email = ? AND id != ? ORDER BY last_message_at DESC LIMIT 5").bind(thread.customer_email, thread.id).all();
  facts.earlier = earlier.map((e) => `${e.subject} (${day(e.last_message_at)})`);
  if (!shopifyReady(env)) { facts.checked.push("Shopify is not connected, so order details were not checked"); return facts; }
  try {
    const numbers = orderNumbersIn(customerText);
    for (const n of numbers) { const o = await orderByName(env, n); if (o) facts.orders.push(o); else facts.checked.push(`Order ${n} not found in the last 60 days, check in Shopify`); }
    if (!facts.orders.length && thread.customer_email) {
      const found = await ordersByEmail(env, thread.customer_email, 4);
      facts.orders.push(...found);
      if (!found.length) facts.checked.push("No orders found for " + thread.customer_email + " in the last 60 days");
    }
    for (const o of facts.orders) {
      const f = o.fulfillments[0];
      const bits = [`Order ${o.name} placed ${day(o.created)}, ${o.payment.toLowerCase()}`];
      if (o.cancelled) bits.push("cancelled");
      else if (f) {
        const wd = workingDaysBetween(f.dispatched);
        bits.push(`dispatched ${day(f.dispatched)} (${wd} working day${wd === 1 ? "" : "s"} ago)`);
        bits.push(f.tracking.length ? `tracking ${f.tracking.map((t) => (t.company ? t.company + " " : "") + t.number).join(", ")}` : "no tracking number recorded in Shopify");
        if (f.delivered) bits.push("marked delivered " + day(f.delivered));
      } else bits.push("not dispatched yet");
      if (o.refunded > 0) bits.push("already refunded " + money(o.refunded));
      facts.checked.push(bits.join(", "));
    }
    const c = facts.orders.find((o) => o.customer);
    if (c) facts.customer = c.customer;
  } catch (e) {
    facts.checked.push("Shopify lookup failed (" + e.message + "), check orders by hand");
    facts.error = e.message;
  }
  return facts;
}

/* ---------- the AI ---------- */
const TOOL = {
  name: "write_reply",
  description: "Summarise a customer email for the team and write the draft reply",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "object", properties: {
        order_number: { type: "string", description: "The order number, or 'None' if there is no order" },
        order_date: { type: "string" }, issue: { type: "string", description: "What went wrong or what they are asking, one sentence" },
        wants: { type: "string", description: "What the customer wants us to do" }, pet: { type: "string", description: "Pet name and type if known, else 'Not mentioned'" },
        points: { type: "array", items: { type: "string" }, description: "2 to 4 short facts the person should know before replying" }
      }, required: ["order_number", "order_date", "issue", "wants", "pet", "points"] },
      sentiment: { type: "string", enum: ["angry", "upset", "neutral", "happy"] },
      needs_decision: { type: ["object", "null"], description: "Set ONLY when the customer asks for a refund, return, replacement, exchange or compensation and no offer has been given yet. Otherwise null.",
        properties: { question: { type: "string" }, help: { type: "string" }, options: { type: "array", items: { type: "object", properties: { key: { type: "string" }, label: { type: "string" } }, required: ["key", "label"] } } } },
      draft: { type: ["string", "null"], description: "The full reply text, or null when a decision is needed first" }
    },
    required: ["summary", "sentiment", "needs_decision", "draft"]
  }
};

const RULES = `You draft replies for the Poorly Pet customer service team. A person reads every draft before it is sent.
FACTS: Use only facts from the DATA section and the BUSINESS KNOWLEDGE. Never invent a tracking number, date, amount, order detail, policy or promise.
If a detail a good reply needs is not in the data, write a gap in exactly this form: [[KEY|Label]], for example [[TRACKING_NUMBER|Tracking number]], [[REFUND_AMOUNT|Refund amount]], [[DELIVERY_DATE|Expected delivery date]], [[COURIER_UPDATE|What the courier says]]. KEY is capital letters and underscores, Label is plain English. Gaps make the person add the detail, so prefer a gap to a guess.
Use known data directly instead of a gap: if the order has a tracking number or dispatch date in DATA, write it out.
DECISIONS: If the customer asks for a refund, return, replacement, exchange or any compensation and no OFFER is given, do not write the reply. Set needs_decision with a clear question and 2 to 4 sensible options based on our policy and the situation, and set draft to null. When an OFFER is given, write the reply around exactly that offer and do not add extra promises.
LATE PARCELS: we dispatch in 1 to 2 working days and delivery takes 2 to 4 working days after that. Only call a parcel late when DATA shows it is beyond that.
ANGRY OR THREATENING CUSTOMERS: stay calm, own the problem, apologise for how they were treated, give a concrete next step. Never argue, never mention their threat.
Never use em dashes or en dashes. Write in British English. Do not write a signature or name after "Kind regards".`;

async function styleExamples(env) {
  const own = await kvGet(env, "tone_examples");
  const { results } = await env.DB.prepare("SELECT body FROM messages WHERE from_us = 1 AND length(body) BETWEEN 200 AND 1400 ORDER BY at DESC LIMIT 6").all();
  const learned = results.map((r) => r.body.trim());
  return { own: own || "", learned };
}

export async function aiDraft(env, thread, msgs, facts, offer) {
  const base = env.ANTHROPIC_API_BASE || "https://api.anthropic.com";
  const knowledge = (await kvGet(env, "knowledge")) || DEFAULT_KNOWLEDGE;
  const tone = (await kvGet(env, "tone_guide")) || DEFAULT_TONE;
  const ex = await styleExamples(env);
  const convo = msgs.slice(-8).map((m) => `${m.from_us ? "POORLY PET" : "CUSTOMER"} (${m.at}):\n${m.body.slice(0, 1800)}`).join("\n\n");
  const data = JSON.stringify({ customer_name: thread.customer_name, customer_email: thread.customer_email, subject: thread.subject, today: facts.today, orders: facts.orders, checked_notes: facts.checked, earlier_emails: facts.earlier, attachments: msgs.flatMap((m) => JSON.parse(m.attachments || "[]")).map((a) => a.name) }, null, 1);
  const system = [RULES, "TONE AND STYLE:\n" + tone,
    ex.own ? "EXAMPLES OF REPLIES THE OWNER LIKES (copy their voice, not their facts):\n" + ex.own : "",
    ex.learned.length ? "RECENT REPLIES WE SENT (copy this voice, not the facts):\n" + ex.learned.map((x, i) => `--- ${i + 1}\n${x}`).join("\n") : "",
    "BUSINESS KNOWLEDGE:\n" + knowledge].filter(Boolean).join("\n\n");
  const user = `CONVERSATION:\n${convo}\n\nDATA (checked by the system):\n${data}\n\n${offer ? `OFFER chosen by the team (write the reply around exactly this): ${offer}\n` : "OFFER: none given yet\n"}\nWrite the summary and the reply now.`;
  const r = await fetch(base + "/v1/messages", {
    method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: env.DRAFT_MODEL || "claude-sonnet-5-5", max_tokens: 2000, system, tools: [TOOL], tool_choice: { type: "tool", name: "write_reply" }, messages: [{ role: "user", content: user }] })
  });
  if (!r.ok) throw new Error("AI drafting failed (" + r.status + ")");
  const d = await r.json();
  const call = (d.content || []).find((c) => c.type === "tool_use");
  if (!call) throw new Error("AI drafting gave no answer");
  return call.input;
}

/* ---------- safety nets on what the AI wrote ---------- */
const GAP = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g;
export function fillKnownGaps(draft, facts) {
  if (!draft) return draft;
  const o = facts.orders[0], f = o && o.fulfillments[0], t = f && f.tracking[0];
  const map = {
    ORDER_NUMBER: o && o.name, ORDER_DATE: o && day(o.created), DISPATCH_DATE: f && day(f.dispatched),
    TRACKING_NUMBER: t && t.number, TRACKING_LINK: t && t.url, COURIER_NAME: t && t.company, COURIER: t && t.company
  };
  return draft.replace(GAP, (m, key) => (map[key] ? map[key] : m));
}
// numbers a reply may mention because they came from the data, the customer, the offer or our published policy
export function verifyFacts(draft, allowedText) {
  if (!draft) return draft;
  const allowed = String(allowedText);
  return draft
    .replace(/#\d{3,6}\b/g, (m) => (allowed.includes(m) ? m : "[[ORDER_NUMBER|Order number]]"))
    .replace(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10,}\b/g, (m) => (allowed.includes(m) ? m : "[[TRACKING_NUMBER|Tracking number]]"))
    .replace(/£\d[\d,]*(?:\.\d{2})?/g, (m) => (allowed.includes(m) || allowed.includes(m.replace(/\.00$/, "")) ? m : "[[REFUND_AMOUNT|Amount]]"));
}
function cleanGaps(text) {
  // a gap must be well formed, anything else the AI invented that looks like a gap is turned into plain text
  return String(text).replace(/\[\[([^\]]*)\]\]/g, (m, inner) => (/^[A-Z0-9_]+\|[^|\]]+$/.test(inner) ? m : inner.split("|").pop()));
}

export async function generate(env, thread, msgs, offer) {
  const facts = await gatherFacts(env, thread, msgs);
  if (!env.ANTHROPIC_API_KEY) return { facts, error: "AI drafting is not set up yet (no Anthropic key)" };
  const out = await aiDraft(env, thread, msgs, facts, offer);
  const knowledge = (await kvGet(env, "knowledge")) || DEFAULT_KNOWLEDGE;
  const allowed = [JSON.stringify(facts.orders), msgs.map((m) => m.body).join("\n"), thread.subject, offer || "", knowledge].join("\n");
  let draft = out.draft ? noDash(cleanGaps(out.draft)) : null;
  draft = fillKnownGaps(draft, facts);
  draft = verifyFacts(draft, allowed);
  const summary = out.summary || {};
  for (const k of Object.keys(summary)) summary[k] = Array.isArray(summary[k]) ? summary[k].map((x) => noDash(String(x))) : noDash(String(summary[k]));
  let decision = out.needs_decision || null;
  if (decision) {
    decision = { key: "offer", question: noDash(String(decision.question || "What are we offering?")), help: noDash(String(decision.help || "")), options: (decision.options || []).slice(0, 5).map((o) => ({ key: String(o.key).slice(0, 40), label: noDash(String(o.label)).slice(0, 120) })) };
    if (offer) decision = null; // the offer has been chosen, the reply is written
  }
  return { facts, summary, sentiment: out.sentiment, decision, draft: decision ? null : draft };
}
