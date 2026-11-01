// A local imitation of Google sign in, the Gmail API and the Anthropic API, so the whole flow can be tried with no real accounts.
import http from "node:http";
import { LIST, byId, MAILBOX } from "./fixtures.mjs";

export function startMock(port = 8801, opts = {}) {
  const calls = { token: 0, list: 0, thread: 0, ai: 0, profile: 0 };
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, "http://x");
    const body = await new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => r(d)); });
    const send = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };

    if (u.pathname === "/auth") { // pretend the person approved on Google's screen
      const redirect = new URL(u.searchParams.get("redirect_uri"));
      if (opts.deny) redirect.searchParams.set("error", "access_denied");
      else redirect.searchParams.set("code", "good-code");
      redirect.searchParams.set("state", u.searchParams.get("state"));
      res.writeHead(302, { location: redirect.toString() }); return res.end();
    }
    if (u.pathname === "/token") {
      calls.token++;
      const p = new URLSearchParams(body);
      if (p.get("grant_type") === "authorization_code") return p.get("code") === "good-code" ? send(200, { access_token: "at-1", refresh_token: "rt-1", expires_in: 3600 }) : send(400, { error: "invalid_grant" });
      if (p.get("grant_type") === "refresh_token") return p.get("refresh_token") === "rt-1" ? send(200, { access_token: "at-2", expires_in: 3600 }) : send(400, { error: "invalid_grant" });
    }
    if (u.pathname.startsWith("/gmail/")) {
      if (!/^Bearer at-/.test(req.headers.authorization || "")) return send(401, { error: "no token" });
      if (u.pathname === "/gmail/users/me/profile") { calls.profile++; return send(200, { emailAddress: opts.account || MAILBOX, historyId: "999" }); }
      if (u.pathname === "/gmail/users/me/threads") { calls.list++; return send(200, { threads: LIST }); }
      const m = u.pathname.match(/^\/gmail\/users\/me\/threads\/([\w-]+)$/);
      if (m && byId[m[1]]) { calls.thread++; return send(200, { id: m[1], historyId: byId[m[1]].historyId, messages: byId[m[1]].messages }); }
    }
    if (u.pathname === "/v1/messages") { // a tiny pretend AI
      calls.ai++;
      const text = JSON.parse(body).messages[0].content.toLowerCase();
      const angry = /disgust|dispute the payment|leave reviews/.test(text);
      let category = "customer", reason = "Asks about an order, a parcel or their pet";
      if (/invoice|payment terms/.test(text)) { category = "supplier"; reason = "A supplier invoice"; }
      else if (/rank your website|backlinks|free audit/.test(text)) { category = "marketing"; reason = "Cold sales email about search ranking"; }
      return send(200, { content: [{ type: "tool_use", name: "classify_email", input: {
        category, confidence: 0.93, reason, priority: angry ? "urgent" : "normal", priority_reason: angry ? "Threatens a bank dispute and reviews" : "Ordinary customer question",
        sentiment: angry ? "angry" : "neutral", flags: angry ? ["Complaint", "Chargeback threat", "Review threat"] : category === "customer" ? ["Pre-sale"] : []
      } }] });
    }
    send(404, { error: "mock: not found " + u.pathname });
  });
  return new Promise((resolve) => server.listen(port, () => resolve({ server, calls, close: () => server.close() })));
}
if (process.argv[1] && process.argv[1].endsWith("mock-google.mjs")) startMock(8801).then(() => console.log("mock Google on http://localhost:8801"));
