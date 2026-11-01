// Google sign in and the Gmail API. Everything here only READS mail in step 2 (scope gmail.readonly).
import { encrypt, decrypt } from "./crypto.js";

export const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "openid", "email"];
const urls = (env) => ({
  auth: env.GOOGLE_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth",
  token: env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token",
  api: env.GMAIL_API_BASE || "https://gmail.googleapis.com/gmail/v1"
});

export function authUrl(env, redirectUri, state) {
  const p = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri, response_type: "code", scope: SCOPES.join(" "),
    access_type: "offline", prompt: "consent", state, login_hint: env.MAILBOX || ""
  });
  return `${urls(env).auth}?${p}`;
}

async function tokenRequest(env, params) {
  const r = await fetch(urls(env).token, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, ...params })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Google said no: " + (data.error_description || data.error || r.status));
  return data;
}
export async function exchangeCode(env, code, redirectUri) {
  return tokenRequest(env, { grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

/* ---- storing the connection ---- */
export async function kvGet(env, key) {
  const r = await env.DB.prepare("SELECT value FROM kv WHERE key = ?").bind(key).first();
  return r ? r.value : null;
}
export async function kvSet(env, key, value) {
  await env.DB.prepare("INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value == null ? null : String(value)).run();
}
export async function saveConnection(env, tokens, email) {
  if (tokens.refresh_token) await kvSet(env, "gmail_refresh", await encrypt(tokens.refresh_token, env.ENCRYPTION_KEY));
  await kvSet(env, "gmail_email", email);
  await kvSet(env, "gmail_connected_at", new Date().toISOString());
}
export async function disconnect(env) {
  for (const k of ["gmail_refresh", "gmail_email", "gmail_connected_at", "gmail_error"]) await env.DB.prepare("DELETE FROM kv WHERE key = ?").bind(k).run();
}
export async function connectionStatus(env) {
  const email = await kvGet(env, "gmail_email");
  return {
    connected: !!(email && (await kvGet(env, "gmail_refresh"))), email,
    lastSync: await kvGet(env, "last_sync_at"), lastError: await kvGet(env, "gmail_error")
  };
}

let cached = null; // access token cached for the life of this worker instance
async function accessToken(env) {
  if (cached && cached.exp > Date.now() + 60000) return cached.token;
  const enc = await kvGet(env, "gmail_refresh");
  if (!enc) throw new Error("Gmail is not connected");
  const t = await tokenRequest(env, { grant_type: "refresh_token", refresh_token: await decrypt(enc, env.ENCRYPTION_KEY) });
  cached = { token: t.access_token, exp: Date.now() + (t.expires_in || 3600) * 1000 };
  return cached.token;
}
export const clearTokenCache = () => { cached = null; };

export async function gmail(env, path, params) {
  const url = new URL(urls(env).api + path);
  if (params) for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.append(k, v);
  const r = await fetch(url, { headers: { authorization: "Bearer " + (await accessToken(env)) } });
  if (r.status === 401) clearTokenCache();
  if (!r.ok) throw new Error(`Gmail ${path} failed (${r.status})`);
  return r.json();
}

/* ---- reading a message ---- */
const b64urlDecode = (s) => {
  const bin = atob(String(s).replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder("utf-8").decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};
export function htmlToText(html) {
  return String(html || "")
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>|<\/(div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
// cut off the quoted older emails and the long footers so we keep just what the customer wrote this time
export function stripQuoted(text) {
  const t = String(text || "").replace(/\r\n/g, "\n");
  const cut = t.search(/\n(On .{5,200}wrote:|-{2,} ?Original Message ?-{2,}|From: .+\nSent: |>{1} )/);
  return (cut > 0 ? t.slice(0, cut) : t).trim();
}
function header(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : "";
}
export function parseAddress(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim(), email: m[2].trim().toLowerCase() };
  return { name: "", email: s.toLowerCase() };
}
function walk(part, out) {
  if (!part) return;
  if (part.filename && part.body && (part.body.attachmentId || part.body.size)) {
    out.attachments.push({ name: part.filename, mime: part.mimeType, size: part.body.size || 0, attachmentId: part.body.attachmentId || null });
  } else if (part.mimeType === "text/plain" && part.body && part.body.data) out.plain += b64urlDecode(part.body.data) + "\n";
  else if (part.mimeType === "text/html" && part.body && part.body.data) out.html += b64urlDecode(part.body.data) + "\n";
  (part.parts || []).forEach((p) => walk(p, out));
}
export function parseMessage(msg, mailbox) {
  const hs = (msg.payload && msg.payload.headers) || [];
  const out = { plain: "", html: "", attachments: [] };
  walk(msg.payload, out);
  const from = parseAddress(header(hs, "From")), replyTo = parseAddress(header(hs, "Reply-To"));
  const fromUs = from.email === String(mailbox || "").toLowerCase();
  const bulk = !!header(hs, "List-Unsubscribe") || /bulk|list|junk/i.test(header(hs, "Precedence")) || /auto-/i.test(header(hs, "Auto-Submitted"));
  return {
    id: msg.id, threadId: msg.threadId, at: new Date(Number(msg.internalDate) || Date.parse(header(hs, "Date")) || Date.now()).toISOString(),
    from, replyTo: replyTo.email ? replyTo : null, to: parseAddress(header(hs, "To")).email, subject: header(hs, "Subject"),
    fromUs, bulk, labels: msg.labelIds || [],
    body: stripQuoted(out.plain.trim() || htmlToText(out.html)).slice(0, 8000), attachments: out.attachments
  };
}

// Shopify contact form emails come "from" Shopify with the customer in Reply-To, so the customer is the Reply-To address
const MAILERS = /(^|@)(shopify(email)?\.com|mailer|no-?reply|donotreply)/i;
export function customerOf(m) {
  if (m.replyTo && (MAILERS.test(m.from.email) || /contact form|new customer message/i.test(m.subject))) return m.replyTo;
  return m.from;
}

export async function profileWithToken(env, accessToken) {
  const r = await fetch(urls(env).api + "/users/me/profile", { headers: { authorization: "Bearer " + accessToken } });
  if (!r.ok) throw new Error("Could not read the Gmail profile (" + r.status + ")");
  return r.json();
}
