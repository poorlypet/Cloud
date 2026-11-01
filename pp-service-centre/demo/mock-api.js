/* Demo only: a tiny in-browser stand-in for the Cloudflare API, so the portal can be tried without a server.
   Nothing here is stored anywhere, it all resets when the page is reloaded. */
(function () {
  const BASE = window.__DEMO.now, SHIFT = Date.now() - BASE;
  const RAW = window.__DEMO.threads;
  const shiftIso = (s) => new Date(new Date(s).getTime() + SHIFT).toISOString();
  const THREADS = RAW.map((t) => ({ ...t, received: shiftIso(t.received), messages: t.messages.map((m) => ({ ...m, at: shiftIso(m.at) })) }));
  const state = {}; // thread id -> { status, draft, offer }
  let signedIn = true, user = { id: 1, email: "hello@poorly-pet.com", name: "Joe", role: "owner" };
  const team = [{ id: 1, email: "hello@poorly-pet.com", name: "Joe", role: "owner", active: 1 }, { id: 2, email: "lily@poorly-pet.com", name: "Lily", role: "staff", active: 1 }];
  const RANK = { urgent: 0, high: 1, normal: 2, low: 3 };
  const res = (data, status = 200) => Promise.resolve(new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } }));
  const gapsOf = (text) => { const out = [], re = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g; let m; while ((m = re.exec(text || ""))) if (!out.some((g) => g.key === m[1])) out.push({ key: m[1], label: m[2] }); return out; };
  function shape(t, full) {
    const st = state[t.id] || {};
    const status = st.status || t.status;
    let draft = st.draft != null ? st.draft : t.draft; draft = draft == null ? null : noDash(draft);
    const base = { id: t.id, category: t.category, status, priority: t.priority, priorityReason: t.priorityReason, sentiment: t.sentiment, flags: t.flags, received: t.received, from: t.from, subject: t.subject, snippet: t.messages[t.messages.length - 1].body.slice(0, 140), needsDecision: !!t.decision && !st.offer, hasDraft: !!draft, gaps: gapsOf(draft).length, handledBy: null };
    return full ? { ...base, messages: t.messages, summary: t.summary, customer: t.customer, why: t.why || null, decision: t.decision, offer: st.offer || null, draft } : base;
  }
  const realFetch = window.fetch.bind(window);
  window.fetch = async function (path, opts = {}) {
    if (typeof path !== "string" || !path.startsWith("/api/")) return realFetch(path, opts);
    const method = (opts.method || "GET").toUpperCase();
    const body = opts.body ? JSON.parse(opts.body) : {};
    await new Promise((r) => setTimeout(r, 120));
    if (path === "/api/setup-status") return res({ needsSetup: false });
    if (path === "/api/login") { signedIn = true; return res({ ok: true }); }
    if (!signedIn) return res({ error: "Please sign in" }, 401);
    if (path === "/api/logout") { signedIn = false; return res({ ok: true }); }
    if (path === "/api/me") return res({ user, mode: { drafts_only: true, sample_data: true }, gmail: { connected: true, email: "hello@poorly-pet.com", lastSync: new Date(Date.now() - 2 * 60000).toISOString(), lastError: "" } });
    if (path === "/api/sync") return res({ ok: true, skipped: true, gmail: { connected: true, email: "hello@poorly-pet.com", lastSync: new Date().toISOString(), lastError: "" } });
    if (path === "/api/gmail/disconnect") return res({ ok: true });
    if (path === "/api/threads") { const list = THREADS.map((t) => shape(t)); list.sort((a, b) => RANK[a.priority] - RANK[b.priority] || new Date(a.received) - new Date(b.received)); return res({ threads: list }); }
    let m = path.match(/^\/api\/threads\/([\w-]+)$/);
    if (m) { const t = THREADS.find((x) => x.id === m[1]); return t ? res({ thread: shape(t, true) }) : res({ error: "Not found" }, 404); }
    m = path.match(/^\/api\/threads\/([\w-]+)\/(draft|status|offer|send|category)$/);
    if (m) {
      const t = THREADS.find((x) => x.id === m[1]); if (!t) return res({ error: "Not found" }, 404);
      const st = (state[t.id] = state[t.id] || {});
      if (m[2] === "draft") { st.draft = noDash(String(body.draft || "")); return res({ ok: true, draft: st.draft, gaps: gapsOf(st.draft) }); }
      if (m[2] === "status") { st.status = body.status; return res({ ok: true }); }
      if (m[2] === "category") { st.status = body.category === "customer" ? "needs_reply" : "ignored"; return res({ ok: true }); }
      if (m[2] === "offer") {
        const base = t.suggestedDrafts && t.suggestedDrafts[body.option]; if (!base) return res({ error: "Choose one of the options" }, 400);
        let d = base; const note = String(body.note || "").trim(); if (note) d = d.replace(/\n\nKind regards$/, "\n\n" + note + "\n\nKind regards");
        st.draft = noDash(d); st.offer = body.option + (note ? ": " + note : ""); return res({ ok: true, draft: st.draft });
      }
      if (m[2] === "send") return res({ error: "Sending is switched off in this demo. Nothing was sent." }, 409);
    }
    if (path === "/api/team" && method === "GET") return res({ team, canManage: user.role === "owner" });
    if (path === "/api/team" && method === "POST") {
      if (!body.email || !body.name || String(body.password || "").length < 10) return res({ error: "Enter a name, a valid email and a password of at least 10 characters" }, 400);
      team.push({ id: team.length + 2, email: body.email, name: body.name, role: "staff", active: 1 }); return res({ ok: true });
    }
    m = path.match(/^\/api\/team\/(\d+)$/);
    if (m) { const u = team.find((x) => x.id === +m[1]); if (u && typeof body.active === "boolean") u.active = body.active ? 1 : 0; return res({ ok: true }); }
    return res({ error: "Not found" }, 404);
  };
})();
