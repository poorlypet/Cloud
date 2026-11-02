// Decides whether an email is from a customer, and how urgent it is. Rules first (free), then the AI for anything unclear.
import { noDash } from "./nodash.js";
export const CATEGORIES = ["customer", "supplier", "marketing", "spam"];

const SUPPLIER_WORDS = /\b(invoice|statement of account|purchase order|remittance|pro-?forma|stock (list|update)|price list|wholesale|trade (account|price)|credit note|our (new )?range|delivery note|rep visit)\b/i;
const MARKETING_WORDS = /\b(unsubscribe|view (this email )?in (your )?browser|limited time|special offer|% off your|seo (audit|services)|rank(ing)? (your )?(website|site)|guest post|backlinks?|boost your|grow your business|webinar|newsletter)\b/i;
const CUSTOMER_WORDS = /\b(order|parcel|delivery|delivered|tracking|refund|return|exchange|replacement|damaged|broken|wrong (item|size)|my (dog|cat|puppy|kitten)|subscription|subscribe|discount code|sizing|size guide|which size|does it fit|arrived|haven'?t received)\b/i;
const URGENT_WORDS = /\b(chargeback|dispute (the )?(payment|charge)|my bank|solicitor|trading standards|legal action|report you|trustpilot|review(s)? everywhere|fraud|scam)\b/i;
const ANGRY_WORDS = /\b(disgusted|furious|appalled|unacceptable|worst|ridiculous|useless|disgrace|livid|fed up|sick of)\b|!!+/i;

export function ruleClassify(m, sender) {
  const text = `${m.subject}\n${m.body}`;
  if (sender && sender.category) return { category: sender.category, confidence: 1, reason: "You told the portal about this sender before", source: "rule" };
  if (m.bulk && !CUSTOMER_WORDS.test(text)) return { category: "marketing", confidence: 0.9, reason: "Bulk mailing with an unsubscribe link", source: "rule" };
  return null;
}
export function heuristicClassify(m) {
  const text = `${m.subject}\n${m.body}`;
  let category = "customer", reason = "No sign it is a supplier or marketing email", confidence = 0.55;
  if (SUPPLIER_WORDS.test(text) && !CUSTOMER_WORDS.test(text)) { category = "supplier"; reason = "Talks about invoices, orders or stock from a supplier"; confidence = 0.7; }
  else if (MARKETING_WORDS.test(text) && !CUSTOMER_WORDS.test(text)) { category = "marketing"; reason = "Reads like a sales or marketing email"; confidence = 0.7; }
  else if (CUSTOMER_WORDS.test(text)) { reason = "Mentions an order, delivery, return or their pet"; confidence = 0.8; }
  const urgent = URGENT_WORDS.test(text), angry = ANGRY_WORDS.test(text);
  const flags = [];
  if (urgent) flags.push(/chargeback|dispute/i.test(text) ? "Chargeback threat" : "Escalation threat");
  if (/trustpilot|review/i.test(text) && urgent) flags.push("Review threat");
  if (angry || urgent) flags.unshift("Complaint");
  return {
    category, confidence, reason, source: "heuristic",
    priority: urgent ? "urgent" : angry ? "high" : /late|not (arrived|received)|damaged|broken|wrong/i.test(text) ? "high" : "normal",
    priorityReason: urgent ? "Threatens a chargeback or public review" : angry ? "Upset customer" : "",
    sentiment: angry || urgent ? "angry" : "neutral", flags: [...new Set(flags)]
  };
}

const TOOL = {
  name: "classify_email",
  description: "Classify an inbound email to the Poorly Pet shop mailbox",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", enum: CATEGORIES, description: "customer = a person who has bought or may buy from the shop and wants help or an answer. supplier = a business we buy from or who sells to us. marketing = newsletters, promotions, cold sales pitches. spam = junk or scams." },
      confidence: { type: "number", description: "0 to 1" },
      reason: { type: "string", description: "One short plain sentence saying why, no dashes" },
      priority: { type: "string", enum: ["urgent", "high", "normal", "low"] },
      priority_reason: { type: "string", description: "Short, no dashes" },
      sentiment: { type: "string", enum: ["angry", "upset", "neutral", "happy"] },
      flags: { type: "array", items: { type: "string", enum: ["Complaint", "Chargeback threat", "Review threat", "Legal threat", "Late delivery", "Damaged item", "Refund", "Return", "Subscription", "Pre-sale", "Thank you", "Wrong item", "Medical concern"] } }
    },
    required: ["category", "confidence", "reason", "priority", "sentiment", "flags"]
  }
};
const SYSTEM = `You sort the inbox of Poorly Pet, a UK online shop selling health, recovery and mobility products for dogs and cats (braces, recovery suits, supplements, beds, ramps). 
Only emails from customers or would-be customers need a reply from the team. Suppliers, marketing and spam do not.
Be careful: a genuine customer must never be filed as marketing or supplier. If unsure, choose customer and give a low confidence.
Emails sent through the shop's contact form arrive from a shop address with the real customer in Reply-To, treat those as customer emails.
Priority: urgent = angry or threatening a chargeback, bank dispute, legal action or public reviews. high = parcel late or missing, damaged or wrong item, a pet in discomfort, or the customer has waited a long time. normal = ordinary questions and returns. low = thank yous and chatty messages.
Never use em dashes or en dashes in anything you write.`;

export async function aiClassify(env, m, sender) {
  const base = env.ANTHROPIC_API_BASE || "https://api.anthropic.com";
  const content = [
    `From: ${m.from.name} <${m.from.email}>`,
    m.replyTo ? `Reply-To: ${m.replyTo.name} <${m.replyTo.email}>` : "",
    `Subject: ${m.subject}`,
    `Has unsubscribe link or bulk headers: ${m.bulk ? "yes" : "no"}`,
    m.attachments && m.attachments.length ? `Attachments: ${m.attachments.map((a) => a.name).join(", ")}` : "",
    "", m.body.slice(0, 3000)
  ].filter((x) => x !== "").join("\n");
  const r = await fetch(base + "/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: env.CLASSIFIER_MODEL || "claude-haiku-5-5", max_tokens: 400, system: SYSTEM,
      tools: [TOOL],
      messages: [{ role: "user", content }]
    })
  });
  if (!r.ok) throw new Error("AI classifier failed (" + r.status + ")");
  const data = await r.json();
  const call = (data.content || []).find((c) => c.type === "tool_use");
  if (!call) throw new Error("AI classifier gave no answer");
  const o = call.input;
  if (!CATEGORIES.includes(o.category)) throw new Error("AI classifier gave an unknown category");
  return {
    category: o.category, confidence: Math.max(0, Math.min(1, Number(o.confidence) || 0.5)), reason: noDash(String(o.reason || "")).slice(0, 200),
    priority: o.priority || "normal", priorityReason: noDash(String(o.priority_reason || "")).slice(0, 160), sentiment: o.sentiment || "neutral",
    flags: Array.isArray(o.flags) ? o.flags.slice(0, 5) : [], source: "ai"
  };
}

// the rules above, then the AI, then the plain heuristics if the AI is not set up or fails
export async function classify(env, m, sender) {
  const rule = ruleClassify(m, sender);
  const base = heuristicClassify(m);
  if (rule) return { ...base, ...rule, priority: rule.category === "customer" ? base.priority : "low" };
  if (env.ANTHROPIC_API_KEY) {
    try { return await aiClassify(env, m, sender); } catch (e) { console.error("classify", e.message); }
  }
  return base;
}

// waiting a long time makes an email more urgent
export function boostForWait(priority, hoursWaiting) {
  const order = ["low", "normal", "high", "urgent"];
  let i = order.indexOf(priority); if (i < 0) i = 1;
  if (hoursWaiting > 48 && i < 3) i = Math.max(i, 2);
  else if (hoursWaiting > 24 && i < 2) i = 2;
  return order[i];
}
