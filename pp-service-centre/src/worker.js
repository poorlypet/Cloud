import { THREADS } from "./sample.js";
import { noDash, hasDash } from "./nodash.js";
import { authUrl, exchangeCode, saveConnection, disconnect, connectionStatus, profileWithToken, clearTokenCache, kvGet } from "./gmail.js";
import { makeState, checkState } from "./crypto.js";
import { syncInbox } from "./sync.js";
import * as inbox from "./inbox.js";

const COOKIE = "pp_session";
const SESSION_DAYS = 14;
const enc = new TextEncoder();

/* ---------- small helpers ---------- */
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const bad = (msg, status = 400) => json({ error: msg }, status);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const rand = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = Uint8Array.from(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return hex(bits);
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function cookieOf(req, name) {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function currentUser(req, env) {
  const token = cookieOf(req, COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1"
  ).bind(await sha256(token)).first();
  return row || null;
}
async function audit(env, userId, action, detail) {
  await env.DB.prepare("INSERT INTO audit_log (user_id, action, detail) VALUES (?, ?, ?)").bind(userId, action, detail ? String(detail).slice(0, 500) : null).run();
}
async function startSession(env, userId, url) {
  const token = rand(32);
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', ?))")
    .bind(await sha256(token), userId, `+${SESSION_DAYS} days`).run();
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}

/* ---------- threads ---------- */
const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 };

// find the gaps a person still has to fill in, e.g. [[TRACKING_NUMBER|Tracking number]]
function gapsOf(text) {
  const out = [];
  const re = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(text || ""))) if (!out.some((g) => g.key === m[1])) out.push({ key: m[1], label: m[2] });
  return out;
}

async function loadState(env) {
  const { results } = await env.DB.prepare(
    "SELECT t.thread_id, t.status, t.draft, t.offer, t.updated_at, u.name AS by FROM thread_state t LEFT JOIN users u ON u.id = t.updated_by"
  ).all();
  const map = {};
  for (const r of results) map[r.thread_id] = r;
  return map;
}
function shape(t, st, full) {
  const status = (st && st.status) || t.status;
  let draft = st && st.draft != null ? st.draft : t.draft;
  draft = draft == null ? null : noDash(draft);
  const base = {
    id: t.id, category: st && st.status === "needs_reply" && t.category !== "customer" ? "customer" : t.category, status, priority: t.priority, priorityReason: t.priorityReason, sentiment: t.sentiment,
    flags: t.flags, received: t.received, from: t.from, subject: t.subject,
    snippet: t.messages[t.messages.length - 1].body.slice(0, 140),
    needsDecision: !!t.decision && !(st && st.offer), hasDraft: !!draft,
    gaps: gapsOf(draft).length, handledBy: st ? st.by : null
  };
  if (!full) return base;
  return {
    ...base, messages: t.messages, summary: t.summary, customer: t.customer, why: t.why || null,
    decision: t.decision, offer: st && st.offer ? st.offer : null, draft
  };
}

async function api(req, env, url, ctx) {
  const p = url.pathname;
  const method = req.method;

  /* --- public routes --- */
  if (p === "/api/setup-status" && method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
    return json({ needsSetup: row.n === 0 });
  }
  if (p === "/api/setup" && method === "POST") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
    if (row.n > 0) return bad("Setup is already done", 409);
    const b = await req.json().catch(() => ({}));
    if (!env.SETUP_TOKEN || !safeEqual(String(b.token || ""), String(env.SETUP_TOKEN))) return bad("That setup code is not right", 403);
    const email = String(b.email || "").trim().toLowerCase(), name = String(b.name || "").trim(), pw = String(b.password || "");
    if (!validEmail(email) || !name || pw.length < 10) return bad("Enter a name, a valid email and a password of at least 10 characters");
    const salt = rand(16), hash = await hashPassword(pw, salt);
    const r = await env.DB.prepare("INSERT INTO users (email, name, role, pass_hash, pass_salt) VALUES (?, ?, 'owner', ?, ?)").bind(email, name, hash, salt).run();
    const id = r.meta.last_row_id;
    await audit(env, id, "setup", email);
    return json({ ok: true }, 200, { "set-cookie": await startSession(env, id, url) });
  }
  if (p === "/api/login" && method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase(), pw = String(b.password || "");
    const ip = req.headers.get("cf-connecting-ip") || "local";
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE (email = ? OR ip = ?) AND at > datetime('now', '-15 minutes')").bind(email, ip).first();
    if (recent.n >= 8) return bad("Too many tries. Wait 15 minutes and try again.", 429);
    const u = await env.DB.prepare("SELECT id, pass_hash, pass_salt, active FROM users WHERE email = ?").bind(email).first();
    const ok = u && u.active === 1 && safeEqual(await hashPassword(pw, u.pass_salt), u.pass_hash);
    if (!ok) {
      await env.DB.prepare("INSERT INTO login_attempts (email, ip) VALUES (?, ?)").bind(email, ip).run();
      return bad("That email or password is not right", 401);
    }
    await audit(env, u.id, "login", null);
    return json({ ok: true }, 200, { "set-cookie": await startSession(env, u.id, url) });
  }

  /* --- everything below needs a signed-in user --- */
  const user = await currentUser(req, env);
  if (!user) return bad("Please sign in", 401);

  if (p === "/api/logout" && method === "POST") {
    const token = cookieOf(req, COOKIE);
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0` });
  }
  const gmailState = await connectionStatus(env);
  if (p === "/api/me" && method === "GET") {
    return json({ user, mode: { drafts_only: true, sample_data: !gmailState.connected }, gmail: gmailState });
  }

  /* --- Gmail connection (owner connects once) --- */
  if (p === "/api/gmail/status" && method === "GET") return json(gmailState);
  if (p === "/api/gmail/connect" && method === "GET") {
    if (user.role !== "owner") return bad("Only the owner can connect Gmail", 403);
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.ENCRYPTION_KEY) return bad("Gmail is not set up yet. Add the Google client id, secret and ENCRYPTION_KEY in Cloudflare first.", 500);
    const state = await makeState(user.id, env.ENCRYPTION_KEY);
    return Response.redirect(authUrl(env, url.origin + "/api/gmail/callback", state), 302);
  }
  if (p === "/api/gmail/callback" && method === "GET") {
    const back = (q) => Response.redirect(url.origin + "/#/inbox?gmail=" + q, 302);
    if (url.searchParams.get("error")) return back("denied");
    const uid = await checkState(url.searchParams.get("state"), env.ENCRYPTION_KEY || "");
    if (!uid || uid !== user.id || user.role !== "owner") return back("badstate");
    try {
      const tokens = await exchangeCode(env, url.searchParams.get("code"), url.origin + "/api/gmail/callback");
      const prof = await profileWithToken(env, tokens.access_token);
      const want = String(env.MAILBOX || "").toLowerCase();
      if (want && String(prof.emailAddress).toLowerCase() !== want) return back("wrongaccount");
      if (!tokens.refresh_token) return back("norefresh");
      await saveConnection(env, tokens, String(prof.emailAddress).toLowerCase());
      clearTokenCache();
      await audit(env, user.id, "gmail_connected", prof.emailAddress);
      ctx.waitUntil(syncInbox(env, { days: 30 }).catch((e) => console.error("first sync", e.message)));
      return back("connected");
    } catch (e) { console.error("gmail callback", e.message); return back("failed"); }
  }
  if (p === "/api/gmail/disconnect" && method === "POST") {
    if (user.role !== "owner") return bad("Only the owner can disconnect Gmail", 403);
    await disconnect(env); clearTokenCache();
    await audit(env, user.id, "gmail_disconnected", null);
    return json({ ok: true });
  }
  if (p === "/api/sync" && method === "POST") {
    if (!gmailState.connected) return bad("Gmail is not connected yet", 409);
    const last = gmailState.lastSync ? Date.parse(gmailState.lastSync) : 0;
    if (Date.now() - last < 15000) return json({ ok: true, skipped: true, gmail: gmailState });
    try { const stats = await syncInbox(env); return json({ ok: true, stats, gmail: await connectionStatus(env) }); }
    catch (e) { console.error("sync", e.message); return bad("Could not read Gmail just now: " + e.message, 502); }
  }

  /* --- real inbox (Gmail connected) --- */
  if (gmailState.connected && p.startsWith("/api/threads")) {
    if (p === "/api/threads" && method === "GET") return json({ threads: await inbox.listThreads(env) });
    let mm = p.match(/^\/api\/threads\/([\w-]+)$/);
    if (mm && method === "GET") { const t = await inbox.getThread(env, mm[1]); return t ? json({ thread: t }) : bad("Not found", 404); }
    mm = p.match(/^\/api\/threads\/([\w-]+)\/(status|category|send|draft|offer)$/);
    if (mm && method !== "GET") {
      const b = await req.json().catch(() => ({}));
      if (mm[2] === "status") { try { await inbox.setStatus(env, mm[1], b.status); } catch (e) { return bad(e.message); } await audit(env, user.id, "status_" + b.status, mm[1]); return json({ ok: true }); }
      if (mm[2] === "category") {
        try { const r = await inbox.setCategory(env, mm[1], b.category, user.id); if (!r) return bad("Not found", 404); await audit(env, user.id, "category_" + b.category, mm[1] + " " + r.rule); return json({ ok: true, ...r }); }
        catch (e) { return bad(e.message); }
      }
      if (mm[2] === "send") { await audit(env, user.id, "send_attempt_blocked", mm[1]); return bad("Sending is switched off while the portal is being tested. Nothing was sent.", 409); }
      return bad("Drafts arrive in step 3", 409);
    }
  }


  if (p === "/api/threads" && method === "GET") {
    const st = await loadState(env);
    const list = THREADS(Date.now()).map((t) => shape(t, st[t.id], false));
    list.sort((a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) || (new Date(a.received) - new Date(b.received)));
    return json({ threads: list });
  }
  let m = p.match(/^\/api\/threads\/([\w-]+)$/);
  if (m && method === "GET") {
    const t = THREADS(Date.now()).find((x) => x.id === m[1]);
    if (!t) return bad("Not found", 404);
    const st = await loadState(env);
    return json({ thread: shape(t, st[t.id], true) });
  }
  m = p.match(/^\/api\/threads\/([\w-]+)\/(draft|status|offer|send|category)$/);
  if (m && method !== "GET") {
    const t = THREADS(Date.now()).find((x) => x.id === m[1]);
    if (!t) return bad("Not found", 404);
    const b = await req.json().catch(() => ({}));
    const upsert = (fields) =>
      env.DB.prepare(
        `INSERT INTO thread_state (thread_id, ${Object.keys(fields).join(", ")}, updated_by, updated_at) VALUES (?, ${Object.keys(fields).map(() => "?").join(", ")}, ?, datetime('now'))
         ON CONFLICT(thread_id) DO UPDATE SET ${Object.keys(fields).map((k) => `${k} = excluded.${k}`).join(", ")}, updated_by = excluded.updated_by, updated_at = excluded.updated_at`
      ).bind(t.id, ...Object.values(fields), user.id).run();

    if (m[2] === "draft") {
      const draft = noDash(String(b.draft || "")).slice(0, 20000);
      await upsert({ draft });
      await audit(env, user.id, "draft_saved", t.id);
      return json({ ok: true, draft, gaps: gapsOf(draft) });
    }
    if (m[2] === "category") {
      const status = b.category === "customer" ? "needs_reply" : ["supplier", "marketing", "spam"].includes(b.category) ? "ignored" : null;
      if (!status) return bad("Unknown category");
      await upsert({ status });
      await audit(env, user.id, "category_" + b.category, t.id);
      return json({ ok: true, status });
    }
    if (m[2] === "status") {
      const status = ["needs_reply", "done", "ignored"].includes(b.status) ? b.status : null;
      if (!status) return bad("Unknown status");
      await upsert({ status });
      await audit(env, user.id, "status_" + status, t.id);
      return json({ ok: true });
    }
    if (m[2] === "offer") {
      // step 1: the "AI" writes from a prepared reply. In step 3 this becomes a real AI draft.
      const key = String(b.option || ""), note = String(b.note || "").trim().slice(0, 500);
      const base = t.suggestedDrafts && t.suggestedDrafts[key];
      if (!base) return bad("Choose one of the options");
      let draft = base;
      if (note) draft = draft.replace(/\n\nKind regards$/, `\n\n${note}\n\nKind regards`);
      draft = noDash(draft);
      await upsert({ offer: key + (note ? ": " + note : ""), draft });
      await audit(env, user.id, "offer_chosen", t.id + " " + key);
      return json({ ok: true, draft, gaps: gapsOf(draft) });
    }
    if (m[2] === "send") {
      // Sending is switched off while testing. Step 4 turns it on after you have tried it with your own address.
      await audit(env, user.id, "send_attempt_blocked", t.id);
      return bad("Sending is switched off while the portal is being tested. Nothing was sent.", 409);
    }
  }

  /* --- team (owner only) --- */
  if (p === "/api/team" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, email, name, role, active, created_at FROM users ORDER BY created_at").all();
    return json({ team: results, canManage: user.role === "owner" });
  }
  if (user.role !== "owner" && p.startsWith("/api/team")) return bad("Only the owner can change the team", 403);
  if (p === "/api/team" && method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase(), name = String(b.name || "").trim(), pw = String(b.password || "");
    if (!validEmail(email) || !name || pw.length < 10) return bad("Enter a name, a valid email and a password of at least 10 characters");
    const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (exists) return bad("That email already has a login", 409);
    const salt = rand(16), hash = await hashPassword(pw, salt);
    await env.DB.prepare("INSERT INTO users (email, name, role, pass_hash, pass_salt) VALUES (?, ?, 'staff', ?, ?)").bind(email, name, hash, salt).run();
    await audit(env, user.id, "team_add", email);
    return json({ ok: true });
  }
  m = p.match(/^\/api\/team\/(\d+)$/);
  if (m && method === "PATCH") {
    const id = +m[1], b = await req.json().catch(() => ({}));
    if (id === user.id && b.active === false) return bad("You cannot switch off your own login");
    if (typeof b.active === "boolean") {
      await env.DB.prepare("UPDATE users SET active = ? WHERE id = ?").bind(b.active ? 1 : 0, id).run();
      if (!b.active) await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
      await audit(env, user.id, b.active ? "team_enable" : "team_disable", String(id));
    }
    if (b.password) {
      if (String(b.password).length < 10) return bad("Password must be at least 10 characters");
      const salt = rand(16), hash = await hashPassword(String(b.password), salt);
      await env.DB.prepare("UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?").bind(hash, salt, id).run();
      await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
      await audit(env, user.id, "team_password", String(id));
    }
    return json({ ok: true });
  }

  return bad("Not found", 404);
}

export default {
  async scheduled(event, env, ctx) {
    // runs every few minutes: read new customer emails
    ctx.waitUntil((async () => { const c = await connectionStatus(env); if (c.connected) await syncInbox(env).catch((e) => console.error("cron sync", e.message)); })());
  },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(req, env, url, ctx);
    } catch (e) {
      console.error(e);
      return bad("Something went wrong on our side", 500);
    }
    // the app itself: everything that is not /api is the single page
    const res = await env.ASSETS.fetch(req);
    if (res.status === 404 && !/\.\w+$/.test(url.pathname)) return env.ASSETS.fetch(new Request(new URL("/index.html", url), req));
    const h = new Headers(res.headers);
    h.set("x-frame-options", "DENY");
    h.set("referrer-policy", "same-origin");
    h.set("x-content-type-options", "nosniff");
    h.set("content-security-policy", "default-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    return new Response(res.body, { status: res.status, headers: h });
  }
};
