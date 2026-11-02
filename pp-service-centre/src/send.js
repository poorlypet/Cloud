// Sending a reply from the shared mailbox: signature, same thread, label and archive. Only ever sends when the owner has switched sending on.
import { gmail, gmailReq, kvGet, kvSet, htmlToText, parseAddress } from "./gmail.js";
import { noDash } from "./nodash.js";

const GAP = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

export const sendMode = async (env) => (await kvGet(env, "send_mode")) || "off"; // off | test | live

function b64(str) {
  const bytes = new TextEncoder().encode(str); let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(bin);
}
const wrap = (s) => s.replace(/(.{76})/g, "$1\r\n");
const b64url = (str) => b64(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const hdr = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);

export async function getSignature(env, force) {
  const cached = JSON.parse((await kvGet(env, "signature_cache")) || "null");
  if (!force && cached && Date.now() - cached.at < 3600000) return cached;
  const mailbox = String(env.MAILBOX || "").toLowerCase();
  let list;
  try { list = await gmail(env, "/users/me/settings/sendAs"); }
  catch (e) { throw fail("Could not read your Gmail signature, so nothing was sent. Reconnect Gmail on the Team page and allow all the permissions. (" + e.message + ")", 502); }
  const all = list.sendAs || [];
  const me = all.find((x) => String(x.sendAsEmail).toLowerCase() === mailbox) || all.find((x) => x.isPrimary) || all[0];
  if (!me) throw fail("Could not find the sending address in Gmail.", 502);
  const out = { at: Date.now(), html: me.signature || "", name: me.displayName || "Poorly Pet", email: me.sendAsEmail };
  await kvSet(env, "signature_cache", JSON.stringify(out));
  return out;
}

export function buildRaw({ from, to, subject, text, signatureHtml, inReplyTo, references }) {
  const bodyHtml = esc(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>")}</p>`).join("");
  const html = `<div>${bodyHtml}</div>${signatureHtml ? `<div>${signatureHtml}</div>` : ""}`;
  const plain = text + (signatureHtml ? "\n\n" + htmlToText(signatureHtml) : "");
  const bnd = "pp_" + crypto.randomUUID().replace(/-/g, "");
  const lines = [
    `From: ${from}`, `To: ${to}`, `Subject: ${hdr(subject)}`, "MIME-Version: 1.0",
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`, `References: ${references || inReplyTo}`] : []),
    `Content-Type: multipart/alternative; boundary="${bnd}"`, "",
    `--${bnd}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(b64(plain)),
    `--${bnd}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(b64(html)),
    `--${bnd}--`, ""
  ];
  return b64url(lines.join("\r\n"));
}

async function ensureLabel(env, name) {
  const l = await gmail(env, "/users/me/labels");
  const hit = (l.labels || []).find((x) => x.name === name);
  if (hit) return hit.id;
  return (await gmailReq(env, "POST", "/users/me/labels", { name, labelListVisibility: "labelShow", messageListVisibility: "show" })).id;
}

export async function sendReply(env, threadId, user, opts = {}) {
  const mode = await sendMode(env);
  if (mode === "off") throw fail("Sending is switched off. The owner can switch it on in Settings. Nothing was sent.", 409);
  const t = await env.DB.prepare("SELECT * FROM threads WHERE id = ?").bind(threadId).first();
  if (!t) throw fail("Not found", 404);
  const st = await env.DB.prepare("SELECT draft FROM thread_state WHERE thread_id = ?").bind(threadId).first();
  const dr = await env.DB.prepare("SELECT draft FROM drafts WHERE thread_id = ?").bind(threadId).first();
  let text = noDash(String((st && st.draft) || (dr && dr.draft) || "")).replace(/\r\n/g, "\n").trim();
  if (!text) throw fail("There is no reply written yet.");
  const gaps = [...text.matchAll(GAP)].map((m) => m[2]);
  if (gaps.length && !opts.confirmGaps) throw fail("The reply still has gaps to fill: " + gaps.join(", "), 409);
  text = noDash(text.replace(GAP, (m, k, label) => `[${label}]`));
  const sc = (await kvGet(env, "gmail_scope")) || "";
  if (!/gmail\.send/.test(sc) || !/gmail\.modify/.test(sc)) throw fail("Gmail needs to be reconnected to allow sending. The owner can do this on the Team page.", 409);

  const customer = String(t.customer_email || "").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer)) throw fail("There is no valid customer email address on this thread.");
  const test = mode === "test";
  const to = test ? (await kvGet(env, "test_address")) || user.email : customer;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw fail("The test address is not valid. Set it in Settings.");

  const sig = await getSignature(env);
  const live = await gmail(env, `/users/me/threads/${threadId}`, { format: "metadata", metadataHeaders: ["Message-ID", "References", "Subject", "From"] }).catch(() => null);
  const msgs = (live && live.messages) || [];
  const h = (m, n) => { const x = ((m.payload && m.payload.headers) || []).find((y) => y.name.toLowerCase() === n); return x ? x.value : ""; };
  const mailbox = String(env.MAILBOX || "").toLowerCase();
  const lastIn = [...msgs].reverse().find((m) => parseAddress(h(m, "from")).email !== mailbox) || msgs[msgs.length - 1];
  // a Shopify contact form email did not come from the customer, so the reply is a fresh email rather than a reply in that thread
  const direct = lastIn && parseAddress(h(lastIn, "from")).email === customer;
  const baseSubject = String((lastIn && h(lastIn, "subject")) || t.subject || "Your message to Poorly Pet");
  const subject = (test ? "[TEST, would go to " + customer + "] " : "") + (direct ? (/^re:/i.test(baseSubject) ? baseSubject : "Re: " + baseSubject) : "Your message to Poorly Pet");
  const raw = buildRaw({
    from: `"${String(sig.name).replace(/"/g, "")}" <${sig.email}>`, to, subject, text, signatureHtml: sig.html,
    inReplyTo: direct && lastIn ? h(lastIn, "message-id") : "", references: direct && lastIn ? (h(lastIn, "references") + " " + h(lastIn, "message-id")).trim() : ""
  });
  const sent = await gmailReq(env, "POST", "/users/me/messages/send", direct && !test ? { raw, threadId } : { raw });
  if (test) return { test: true, to, id: sent.id };

  let warning = "";
  try {
    const lab = await ensureLabel(env, "PP replied");
    await gmailReq(env, "POST", `/users/me/threads/${threadId}/modify`, { addLabelIds: [lab], removeLabelIds: ["INBOX", "UNREAD"] });
  } catch (e) { warning = "The reply was sent, but it could not be labelled and archived: " + e.message; }
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE threads SET status = 'replied', last_from_us = 1, updated_at = ? WHERE id = ?").bind(now, threadId),
    env.DB.prepare("INSERT OR IGNORE INTO messages (id, thread_id, from_name, from_email, to_email, at, body, from_us, attachments) VALUES (?,?,?,?,?,?,?,1,'[]')").bind(sent.id, threadId, sig.name, sig.email, customer, now, text)
  ]);
  return { test: false, to: customer, id: sent.id, warning };
}
