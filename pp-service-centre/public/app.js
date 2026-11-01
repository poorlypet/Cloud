// PP customer service centre: the portal screen. Plain JavaScript, no frameworks, so it stays fast and easy to look after.
const $app = document.getElementById("app");
const S = { me: null, mode: null, threads: [], tab: "reply", current: null, thread: null, team: null, saveTimer: null, saved: "" };

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#DFE43A"/><path d="M26 14h12v12h12v12H38v12H26V38H14V26h12z" fill="#0F4C48"/></svg>`;

async function call(path, opts = {}) {
  const res = await fetch(path, { method: opts.method || "GET", headers: opts.body ? { "content-type": "application/json" } : {}, body: opts.body ? JSON.stringify(opts.body) : undefined, credentials: "same-origin" });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (res.status === 401 && path !== "/api/login") { S.me = null; render(); throw new Error("signed out"); }
  if (!res.ok) { const err = new Error(data.error || "Something went wrong"); err.status = res.status; throw err; }
  return data;
}
function toast(msg, warn) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : ""); t.textContent = msg; t.setAttribute("role", "status");
  document.body.appendChild(t); setTimeout(() => t.remove(), warn ? 7000 : 3500);
}
function ago(iso) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000));
  if (mins < 60) return mins + " min";
  const h = Math.round(mins / 60); if (h < 24) return h + " h";
  return Math.round(h / 24) + " d";
}
function waitClass(t) {
  const h = (Date.now() - new Date(t.received)) / 3600000;
  return h > 24 ? "red" : h > 4 ? "amber" : "";
}
const PRI = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };

/* ---------- routing ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, "").split("/");
  return { page: h[0] || "inbox", id: h[1] || null };
}
window.addEventListener("hashchange", () => { render(); });

/* ---------- views ---------- */
function shell(inner, page) {
  const open = S.threads.filter((t) => t.status === "needs_reply" && t.category === "customer").length;
  return `
  <header class="hdr"><div class="in">
    <a class="logo" href="#/inbox">${LOGO}<span><b>Poorly Pet</b><small>PP customer service centre</small></span></a>
    <nav class="nav" aria-label="Main">
      <a href="#/inbox" class="${page === "inbox" ? "on" : ""}">Inbox<span class="n">${open}</span></a>
      <a href="#/dashboard" class="${page === "dashboard" ? "on" : ""}">Happiness</a>
      <a href="#/team" class="${page === "team" ? "on" : ""}">Team</a>
    </nav>
    <div class="me"><div><b>${esc(S.me.name)}</b><span>${S.me.role === "owner" ? "Owner" : "Staff"}</span></div><button id="logout" type="button">Sign out</button></div>
  </div></header>
  ${S.mode && S.mode.drafts_only ? `<div class="mode"><b>Test mode.</b> Drafts only, sending is switched off.${S.mode.sample_data ? " These are sample emails, Gmail is not connected yet." : ""}</div>` : ""}
  <main class="wrap">${inner}</main>`;
}

function loginView(setup) {
  return `<div class="login"><form class="card" id="loginform" novalidate>
    <div class="logo">${LOGO}<span><b>Poorly Pet</b><small>PP customer service centre</small></span></div>
    <h1>${setup ? "Set up the owner login" : "Welcome back"}</h1>
    <p>${setup ? "This is a one-off step. You will need the setup code from your Cloudflare secrets." : "Sign in to see today's customer emails and the replies waiting for you."}</p>
    ${setup ? `<label class="f" for="name">Your name</label><input class="t" id="name" autocomplete="name">` : ""}
    <label class="f" for="email">Email</label><input class="t" id="email" type="email" autocomplete="username" required>
    <label class="f" for="pw">Password${setup ? " (at least 10 characters)" : ""}</label><input class="t" id="pw" type="password" autocomplete="${setup ? "new-password" : "current-password"}" required>
    ${setup ? `<label class="f" for="token">Setup code</label><input class="t" id="token" type="password" autocomplete="off">` : ""}
    <div id="formerr"></div>
    <button class="btn dark" type="submit">${setup ? "Create login and sign in" : "Sign in"}</button>
  </form></div>`;
}

const TABS = [
  ["reply", "To reply", (t) => t.category === "customer" && t.status === "needs_reply" && !t.needsDecision],
  ["decide", "Needs your decision", (t) => t.category === "customer" && t.status === "needs_reply" && t.needsDecision],
  ["done", "Done", (t) => t.status === "done"],
  ["ignored", "Ignored", (t) => t.status === "ignored"]
];
function inTab(t) { const tab = TABS.find((x) => x[0] === S.tab); return tab[2](t); }

function queueHTML() {
  const list = S.threads.filter(inTab);
  const tabs = TABS.map(([k, label, fn]) => `<button type="button" data-tab="${k}" class="${S.tab === k ? "on" : ""}">${label}<span class="n">${S.threads.filter(fn).length}</span></button>`).join("");
  const items = list.length ? list.map((t) => `
    <button type="button" class="q ${t.priority} ${S.current === t.id ? "on" : ""}" data-open="${t.id}">
      <div class="top"><span class="who">${esc(t.from.name)}</span><span class="wait ${waitClass(t)}">${ago(t.received)}</span></div>
      <div class="sub">${esc(t.subject)}</div>
      <div class="snip">${esc(t.snippet)}</div>
      <div class="meta">
        <span class="pill ${t.priority}">${PRI[t.priority]}</span>
        ${t.flags.map((f) => `<span class="pill ${t.priority === "urgent" ? "urgent" : ""}">${esc(f)}</span>`).join("")}
        ${t.needsDecision ? `<span class="pill high">Decision needed</span>` : t.hasDraft && t.category === "customer" ? (t.gaps ? `<span class="pill urgent">${t.gaps} to fill in</span>` : `<span class="pill ok">Draft ready</span>`) : ""}
      </div>
    </button>`).join("") : `<div class="empty">Nothing here. Nice.</div>`;
  return `<div class="tabs" role="tablist">${tabs}</div><div class="panel queue">${items}</div>`;
}

function summaryHTML(t) {
  const s = t.summary;
  if (t.category !== "customer") return `<section class="panel block summary"><span class="tag">Why it was ignored</span><p style="margin:0">${esc(t.why || "Not a customer email")}</p></section>`;
  return `<section class="panel block summary"><span class="tag">PP summary</span>
    <dl class="facts">
      <div><dt>Order</dt><dd>${esc(s.order_number)}</dd></div><div><dt>Order date</dt><dd>${esc(s.order_date)}</dd></div>
      <div><dt>Pet</dt><dd>${esc(s.pet)}</dd></div><div style="grid-column:1/-1"><dt>Issue</dt><dd>${esc(s.issue)}</dd></div>
      <div style="grid-column:1/-1"><dt>What they want</dt><dd>${esc(s.wants)}</dd></div>
    </dl>
    ${s.points && s.points.length ? `<ul>${s.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
  </section>`;
}
function messagesHTML(t) {
  return `<section class="panel block"><h2>The conversation</h2>${t.messages.map((m) => `
    <div class="msg ${m.from === "us" ? "us" : ""}"><div class="h"><span><b>${esc(m.name)}</b></span><span>${new Date(m.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
      <p>${esc(m.body)}</p>
      ${m.attachments ? `<div class="att">${m.attachments.map((a) => `<div><b>${esc(a.name)}</b>${esc(a.note || "")}</div>`).join("")}</div>` : ""}
    </div>`).join("")}</section>`;
}
function decisionHTML(t) {
  const d = t.decision;
  return `<section class="panel block decision"><h2>${esc(d.question)}</h2><p style="margin:0;color:var(--mute)">${esc(d.help)}</p>
    <div class="opts" role="radiogroup">${d.options.map((o, i) => `<label class="o"><input type="radio" name="opt" value="${esc(o.key)}" ${i === 0 ? "" : ""}> ${esc(o.label)}</label>`).join("")}</div>
    <label class="f" for="offernote">Anything extra to include? (optional)</label>
    <textarea class="t" id="offernote" rows="2" placeholder="For example: a 10 percent code for next time"></textarea>
    <div class="actions"><button class="btn dark" id="writereply" type="button">Write the reply</button></div>
  </section>`;
}
function draftBlockHTML(t) {
  const gaps = gapsIn(t.draft);
  return `<section class="panel block"><h2>Draft reply</h2>
    <div id="gapstatus">${gapStatusHTML(gaps)}</div>
    <div class="editor" id="editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Draft reply" spellcheck="true">${editorHTML(t.draft)}</div>
    <div class="sig">Your Gmail signature for hello@poorly-pet.com is added here when it is sent.</div>
    <div class="checks" id="checks"></div>
    <div class="actions">
      <button class="btn dark" id="send" type="button">Send reply</button>
      <button class="btn ghost" id="savedraft" type="button">Save draft</button>
      <span class="saved" id="savedmsg">${esc(S.saved)}</span><span class="sp"></span>
      <button class="btn ghost sm" id="markdone" type="button" title="Nothing needs sending">Mark done, no reply</button>
      <button class="btn ghost sm" id="notcustomer" type="button">Not a customer email</button>
    </div></section>`;
}
function gapsIn(text) {
  const out = [], re = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g; let m;
  while ((m = re.exec(text || ""))) if (!out.some((g) => g.key === m[1])) out.push({ key: m[1], label: m[2] });
  return out;
}
function gapStatusHTML(gaps) {
  return gaps.length
    ? `<div class="blocker" role="alert"><b>DO NOT SEND until you have added:</b><ul>${gaps.map((g) => `<li>${esc(g.label)}</li>`).join("")}</ul></div>`
    : `<div class="allgood">Nothing missing. Read it through, then send.</div>`;
}
function editorHTML(text) {
  const re = /\[\[([A-Z0-9_]+)\|([^\]]+)\]\]/g; let out = "", last = 0, m;
  const t = text || "";
  while ((m = re.exec(t))) {
    out += esc(t.slice(last, m.index));
    out += `<span class="gapwrap" contenteditable="false"><input class="gap" data-key="${esc(m[1])}" data-label="${esc(m[2])}" placeholder="${esc(m[2])}" size="${Math.max(14, m[2].length + 2)}" aria-label="${esc(m[2])}"></span>`;
    last = m.index + m[0].length;
  }
  return out + esc(t.slice(last));
}
function serialise(node) {
  let out = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) out += n.nodeValue;
    else if (n.nodeName === "BR") out += "\n";
    else if (n.classList && n.classList.contains("gapwrap")) { const i = n.querySelector("input"); out += i.value.trim() || `[[${i.dataset.key}|${i.dataset.label}]]`; }
    else if (n.nodeName === "DIV" || n.nodeName === "P") { if (out && !out.endsWith("\n")) out += "\n"; out += serialise(n); if (!out.endsWith("\n")) out += "\n"; }
    else out += serialise(n);
  });
  return out;
}
const draftText = () => serialise(document.getElementById("editor")).replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "");
const DASH = /[—–―]/;
function refreshChecks() {
  const ed = document.getElementById("editor"); if (!ed) return;
  const text = draftText(), gaps = gapsIn(text);
  document.getElementById("gapstatus").innerHTML = gapStatusHTML(gaps);
  document.getElementById("checks").innerHTML =
    `<span class="${DASH.test(text) ? "no" : "ok"}">${DASH.test(text) ? "Has a dash, it will be removed" : "No em dashes"}</span>` +
    `<span class="${gaps.length ? "no" : "ok"}">${gaps.length ? gaps.length + " gap" + (gaps.length > 1 ? "s" : "") + " to fill" : "No gaps"}</span>` +
    `<span class="ok">${text.split(/\s+/).filter(Boolean).length} words</span>`;
}

function customerHTML(t) {
  const c = t.customer;
  if (!c) return "";
  return `<section class="panel block cust"><h2>${esc(c.name)}</h2>
    <div class="row"><span>Customer since</span><b>${esc(c.since)}</b></div>
    <div class="row"><span>Total spent</span><b>£${c.spend.toFixed(2)}</b></div>
    <div class="row"><span>Mood</span><b>${esc(c.mood)}</b></div>
    <div class="row"><span>Pets</span><b>${c.pets.length ? c.pets.map(esc).join(", ") : "Not known"}</b></div>
    <div class="row"><span>Earlier emails</span><b>${c.pastEmails}</b></div>
    ${c.orders.length ? c.orders.map((o) => `<div class="order"><b>${esc(o.number)}</b> · ${esc(o.date)} · £${o.total.toFixed(2)}<br>${o.items.map(esc).join(", ")}<br><span style="color:var(--mute)">${esc(o.status)}</span><br><span style="color:var(--mute)">Tracking: ${esc(o.tracking)}</span></div>`).join("") : `<div class="order">No orders yet</div>`}
  </section>`;
}

function detailHTML() {
  const t = S.thread;
  if (!t) return `<div class="panel empty">Pick an email from the list to see the summary and the draft reply.</div>`;
  const needsDraft = t.category === "customer";
  return `<div class="detail">
    <button class="btn ghost sm backbtn" id="back" type="button">Back to the list</button>
    <section class="panel block dh"><h1>${esc(t.subject)}</h1><div class="from">${esc(t.from.name)} &lt;${esc(t.from.email)}&gt; · waiting ${ago(t.received)}</div>
      <div class="tags"><span class="pill ${t.priority}">${PRI[t.priority]}</span>${t.flags.map((f) => `<span class="pill ${t.priority === "urgent" ? "urgent" : ""}">${esc(f)}</span>`).join("")}<span class="pill">${esc(t.priorityReason)}</span></div></section>
    ${summaryHTML(t)}
    ${messagesHTML(t)}
    ${needsDraft && t.decision && !t.offer ? decisionHTML(t) : ""}
    ${needsDraft && t.draft ? draftBlockHTML(t) : ""}
    ${t.category !== "customer" ? `<div class="actions"><button class="btn dark" id="iscustomer" type="button">This is a customer email</button></div>` : ""}
  </div>`;
}

function inboxView() {
  return `<div class="inbox"><div>${queueHTML()}</div><div id="detail">${detailHTML()}</div><aside class="stack" id="cust">${S.thread ? customerHTML(S.thread) : ""}</aside></div>`;
}
function dashboardView() {
  return `<section class="panel soon"><h2>Customer happiness</h2><p style="color:var(--mute);max-width:520px;margin:0 auto">Reply times, customer mood and trends will appear here once real emails are flowing. This is built in step 5.</p>
    <div class="tiles"><div class="tile"><b>2h 14m</b>Average first reply</div><div class="tile"><b>92%</b>Happy after reply</div><div class="tile"><b>3</b>Upset customers this week</div><div class="tile"><b>41</b>Replies sent</div></div></section>`;
}
async function teamView() {
  if (!S.team) { try { S.team = await call("/api/team"); } catch (e) { return `<div class="panel empty">${esc(e.message)}</div>`; } }
  const T = S.team;
  return `<div class="grid2"><section class="panel block"><h2>Team</h2><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>
    ${T.team.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role === "owner" ? "Owner" : "Staff"}${u.active ? "" : " (switched off)"}</td>
      <td>${T.canManage && u.id !== S.me.id ? `<button class="btn ghost sm" data-toggle="${u.id}" data-active="${u.active ? 0 : 1}">${u.active ? "Switch off" : "Switch on"}</button> <button class="btn ghost sm" data-reset="${u.id}">New password</button>` : ""}</td></tr>`).join("")}
    </tbody></table></section>
    ${T.canManage ? `<form class="panel block" id="addstaff"><h2>Add a staff login</h2>
      <label class="f" for="sname">Name</label><input class="t" id="sname" required>
      <label class="f" for="semail">Email</label><input class="t" id="semail" type="email" required>
      <label class="f" for="spw">Password (at least 10 characters)</label><input class="t" id="spw" type="password" autocomplete="new-password" required>
      <div id="formerr"></div><button class="btn dark" style="width:100%;margin-top:16px" type="submit">Add login</button>
      <p style="color:var(--mute);font-size:14px">Staff can read emails and send replies. Only you can change the team.</p></form>` : `<section class="panel block"><p style="margin:0;color:var(--mute)">Only the owner can add or remove logins.</p></section>`}</div>`;
}

/* ---------- render + events ---------- */
async function render() {
  if (!S.me) {
    let setup = false;
    try { setup = (await call("/api/setup-status")).needsSetup; } catch (e) {}
    $app.innerHTML = loginView(setup);
    document.getElementById("email").focus();
    document.getElementById("loginform").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = document.getElementById("formerr"); err.innerHTML = "";
      try {
        if (setup) await call("/api/setup", { method: "POST", body: { name: val("name"), email: val("email"), password: val("pw"), token: val("token") } });
        else await call("/api/login", { method: "POST", body: { email: val("email"), password: val("pw") } });
        await boot();
      } catch (ex) { err.innerHTML = `<div class="err" role="alert">${esc(ex.message)}</div>`; }
    });
    return;
  }
  const r = route();
  document.body.classList.toggle("reading", r.page === "inbox" && !!r.id);
  if (r.page === "inbox") {
    if (r.id && r.id !== S.current) await openThread(r.id, true);
    if (!r.id) { S.current = null; S.thread = null; }
    $app.innerHTML = shell(inboxView(), "inbox");
    wireInbox();
  } else if (r.page === "dashboard") {
    $app.innerHTML = shell(dashboardView(), "dashboard");
  } else if (r.page === "team") {
    const v = await teamView();
    $app.innerHTML = shell(v, "team");
    wireTeam();
  } else { location.hash = "#/inbox"; return; }
  document.getElementById("logout").onclick = async () => { await call("/api/logout", { method: "POST" }).catch(() => {}); S.me = null; S.thread = null; S.current = null; S.team = null; S.threads = []; render(); };
}
const val = (id) => (document.getElementById(id) || { value: "" }).value;

async function refreshList() { S.threads = (await call("/api/threads")).threads; }
async function openThread(id, silent) {
  const d = await call("/api/threads/" + id);
  S.current = id; S.thread = d.thread; S.saved = "";
  if (!silent) { location.hash = "#/inbox/" + id; }
}

function wireInbox() {
  document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; location.hash = "#/inbox"; S.current = null; S.thread = null; render(); }));
  document.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => { location.hash = "#/inbox/" + b.dataset.open; }));
  const back = document.getElementById("back"); if (back) back.onclick = () => { location.hash = "#/inbox"; };
  const t = S.thread; if (!t) return;
  const writeBtn = document.getElementById("writereply");
  if (writeBtn) writeBtn.onclick = async () => {
    const opt = document.querySelector('input[name="opt"]:checked');
    if (!opt) return toast("Choose what we are offering first", true);
    writeBtn.disabled = true; writeBtn.textContent = "Writing...";
    try { await call(`/api/threads/${t.id}/offer`, { method: "POST", body: { option: opt.value, note: val("offernote") } }); await reload(); S.tab = "reply"; } catch (e) { toast(e.message, true); writeBtn.disabled = false; writeBtn.textContent = "Write the reply"; }
  };
  const ed = document.getElementById("editor");
  if (ed) {
    refreshChecks();
    const queueSave = () => { refreshChecks(); S.saved = "Unsaved changes"; setSaved(); clearTimeout(S.saveTimer); S.saveTimer = setTimeout(saveDraft, 1500); };
    ed.addEventListener("input", queueSave);
    document.getElementById("savedraft").onclick = () => saveDraft(true);
    document.getElementById("send").onclick = onSend;
    document.getElementById("markdone").onclick = () => setStatus("done", "Marked as done");
    document.getElementById("notcustomer").onclick = () => setStatus("ignored", "Moved to Ignored, it will learn from this");
  }
  const isc = document.getElementById("iscustomer"); if (isc) isc.onclick = () => setStatus("needs_reply", "Moved back to the customer queue");
}
function setSaved() { const s = document.getElementById("savedmsg"); if (s) s.textContent = S.saved; }
async function saveDraft(manual) {
  const ed = document.getElementById("editor"); if (!ed || !S.thread) return;
  try {
    const r = await call(`/api/threads/${S.thread.id}/draft`, { method: "PUT", body: { draft: draftText() } });
    S.saved = "Saved just now"; setSaved(); if (manual) toast("Draft saved");
    return r;
  } catch (e) { S.saved = "Not saved: " + e.message; setSaved(); }
}
async function setStatus(status, msg) {
  await saveDraft();
  try { await call(`/api/threads/${S.thread.id}/status`, { method: "POST", body: { status } }); toast(msg); location.hash = "#/inbox"; S.current = null; S.thread = null; await refreshList(); render(); } catch (e) { toast(e.message, true); }
}
async function reload() { await refreshList(); await openThread(S.current, true); render(); }

function onSend() {
  const gaps = gapsIn(draftText());
  if (!gaps.length) return doSend();
  const bg = document.createElement("div"); bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">This reply is missing information</h2>
    <p style="margin:0 0 6px">The customer would see these gaps:</p><ul style="margin:0;padding-left:20px;color:var(--red);font-weight:700">${gaps.map((g) => `<li>${esc(g.label)}</li>`).join("")}</ul>
    <label class="ck"><input type="checkbox" id="sure"> I understand and want to send it anyway</label>
    <div class="acts"><button class="btn ghost" id="cancelsend" type="button">Go back and fix it</button><button class="btn danger" id="gosend" type="button" disabled>Send anyway</button></div></div>`;
  document.body.appendChild(bg);
  bg.querySelector("#sure").onchange = (e) => (bg.querySelector("#gosend").disabled = !e.target.checked);
  bg.querySelector("#cancelsend").onclick = () => bg.remove();
  bg.querySelector("#gosend").onclick = () => { bg.remove(); doSend(); };
  bg.querySelector("#cancelsend").focus();
}
async function doSend() {
  await saveDraft();
  try { await call(`/api/threads/${S.thread.id}/send`, { method: "POST", body: {} }); toast("Sent"); }
  catch (e) { toast(e.message, true); }
}

function wireTeam() {
  const f = document.getElementById("addstaff");
  if (f) f.addEventListener("submit", async (e) => {
    e.preventDefault(); const err = document.getElementById("formerr"); err.innerHTML = "";
    try { await call("/api/team", { method: "POST", body: { name: val("sname"), email: val("semail"), password: val("spw") } }); S.team = null; toast("Login added"); render(); }
    catch (ex) { err.innerHTML = `<div class="err" role="alert">${esc(ex.message)}</div>`; }
  });
  document.querySelectorAll("[data-toggle]").forEach((b) => (b.onclick = async () => { await call("/api/team/" + b.dataset.toggle, { method: "PATCH", body: { active: b.dataset.active === "1" } }).catch((e) => toast(e.message, true)); S.team = null; render(); }));
  document.querySelectorAll("[data-reset]").forEach((b) => (b.onclick = async () => {
    const pw = prompt("New password (at least 10 characters). Tell them privately."); if (!pw) return;
    try { await call("/api/team/" + b.dataset.reset, { method: "PATCH", body: { password: pw } }); toast("Password changed, they are signed out"); } catch (e) { toast(e.message, true); }
  }));
}

async function boot() {
  try {
    const me = await call("/api/me"); S.me = me.user; S.mode = me.mode; S.team = null;
    await refreshList();
  } catch (e) { S.me = null; }
  render();
}
setInterval(async () => { if (S.me && document.visibilityState === "visible" && route().page === "inbox" && !document.activeElement.closest?.("#editor")) { try { const before = S.threads.length; await refreshList(); if (!document.querySelector(".modal-bg") && !document.getElementById("editor")) { const q = document.querySelector(".queue"); if (q) { const keep = q.scrollTop; document.querySelector(".inbox > div").innerHTML = queueHTML(); wireQueueOnly(); document.querySelector(".queue").scrollTop = keep; } } } catch (e) {} } }, 60000);
function wireQueueOnly() {
  document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; location.hash = "#/inbox"; S.current = null; S.thread = null; render(); }));
  document.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => { location.hash = "#/inbox/" + b.dataset.open; }));
}
boot();
