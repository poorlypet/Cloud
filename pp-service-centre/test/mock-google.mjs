// A local imitation of Google sign in, the Gmail API and the Anthropic API, so the whole flow can be tried with no real accounts.
import http from "node:http";
import { LIST, byId, MAILBOX } from "./fixtures.mjs";

const DAY = 86400000;
const iso = (d) => new Date(Date.now() - d * DAY).toISOString();
const ORDERS = {
  "#1431": { name: "#1431", createdAt: iso(9), cancelledAt: null, displayFinancialStatus: "PAID", displayFulfillmentStatus: "FULFILLED", returnStatus: "NO_RETURN", totalPriceSet: { shopMoney: { amount: "46.99", currencyCode: "GBP" } }, totalRefundedSet: { shopMoney: { amount: "0.0" } }, shippingLine: { title: "Standard Shipping" }, customer: { displayName: "Helen Marsh", numberOfOrders: "4", amountSpent: { amount: "312.40" }, createdAt: iso(700), defaultEmailAddress: { emailAddress: "helen.marsh@example.com" } }, shippingAddress: { city: "Leeds", zip: "LS1" }, lineItems: { nodes: [{ title: "Medical Recovery Suit", quantity: 1, variantTitle: "L" }] }, fulfillments: [{ createdAt: iso(7), status: "SUCCESS", displayStatus: "IN_TRANSIT", deliveredAt: null, estimatedDeliveryAt: null, inTransitAt: iso(6), trackingInfo: [{ company: "Evri", number: "H01ABC1234567890", url: "https://www.evri.com/track/H01ABC1234567890" }] }] },
  "#1466": { name: "#1466", createdAt: iso(6), cancelledAt: null, displayFinancialStatus: "PAID", displayFulfillmentStatus: "FULFILLED", returnStatus: "NO_RETURN", totalPriceSet: { shopMoney: { amount: "79.00", currencyCode: "GBP" } }, totalRefundedSet: { shopMoney: { amount: "0.0" } }, shippingLine: { title: "Standard Shipping" }, customer: { displayName: "Aisha Rahman", numberOfOrders: "2", amountSpent: { amount: "118.00" }, createdAt: iso(300), defaultEmailAddress: { emailAddress: "aisha.r@example.com" } }, shippingAddress: { city: "Bristol", zip: "BS1" }, lineItems: { nodes: [{ title: "Folding dog ramp 151cm", quantity: 1, variantTitle: null }] }, fulfillments: [{ createdAt: iso(4), status: "SUCCESS", displayStatus: "FULFILLED", deliveredAt: null, estimatedDeliveryAt: null, inTransitAt: null, trackingInfo: [] }] },
  "#1459": { name: "#1459", createdAt: iso(8), cancelledAt: null, displayFinancialStatus: "PAID", displayFulfillmentStatus: "FULFILLED", returnStatus: "NO_RETURN", totalPriceSet: { shopMoney: { amount: "64.99", currencyCode: "GBP" } }, totalRefundedSet: { shopMoney: { amount: "0.0" } }, shippingLine: { title: "Standard Shipping" }, customer: { displayName: "Tom Whitaker", numberOfOrders: "1", amountSpent: { amount: "64.99" }, createdAt: iso(8), defaultEmailAddress: { emailAddress: "tom.w@example.com" } }, shippingAddress: { city: "York", zip: "YO1" }, lineItems: { nodes: [{ title: "Hock brace", quantity: 1, variantTitle: "M" }] }, fulfillments: [{ createdAt: iso(5), status: "SUCCESS", displayStatus: "DELIVERED", deliveredAt: iso(2), estimatedDeliveryAt: null, inTransitAt: iso(4), trackingInfo: [{ company: "Evri", number: "H09XYZ7654321098", url: "https://www.evri.com/track/H09XYZ7654321098" }] }] }
};

export function startMock(port = 8801, opts = {}) {
  const calls = { token: 0, list: 0, thread: 0, ai: 0, profile: 0, shopify: 0, drafts: 0, lastDraftSystem: "", lastDraftUser: "" };
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
    if (u.pathname === "/admin/oauth/access_token") { const p = new URLSearchParams(body); return p.get("client_id") === "shop-id" && p.get("client_secret") === "shop-secret" && p.get("grant_type") === "client_credentials" ? send(200, { access_token: "shpat-mock", expires_in: 86399 }) : send(400, { error: "invalid_client" }); }
    if (u.pathname.startsWith("/admin/api/") && u.pathname.endsWith("/graphql.json")) {
      if (req.headers["x-shopify-access-token"] !== "shpat-mock") return send(401, { errors: "bad token" });
      calls.shopify++;
      const q = JSON.parse(body).variables.q || "";
      const byName = q.match(/^name:(#\d+)$/);
      if (byName) return send(200, { data: { orders: { nodes: ORDERS[byName[1]] ? [ORDERS[byName[1]]] : [] } } });
      const byEmail = q.match(/^email:(.+)$/);
      return send(200, { data: { orders: { nodes: Object.values(ORDERS).filter((o) => o.customer.defaultEmailAddress.emailAddress === byEmail[1]) } } });
    }
    if (u.pathname === "/v1/messages" && JSON.parse(body).tools && JSON.parse(body).tools[0].name === "write_reply") { // the pretend drafting AI
      calls.drafts++;
      const b = JSON.parse(body); calls.lastDraftSystem = b.system; const text = b.messages[0].content; calls.lastDraftUser = text;
      const offerMatch = text.match(/OFFER chosen by the team \(write the reply around exactly this\): (.+)/);
      const data = JSON.parse(text.slice(text.indexOf("DATA (checked by the system):\n") + 30, text.indexOf("\n\nOFFER")));
      const lower = text.split("\n\nDATA")[0].toLowerCase();
      const first = (data.customer_name || "there").split(" ")[0];
      const summary = { order_number: (data.orders[0] || {}).name || (text.match(/#\d{3,6}/) || [])[0] || "None", order_date: data.orders[0] ? "from Shopify" : "n/a", issue: data.subject, wants: /refund/.test(lower) ? "A refund" : "An answer", pet: /barney/.test(lower) ? "Barney (dog)" : /pickle/.test(lower) ? "Pickle (cat)" : "Not mentioned", points: ["Made by the pretend AI"] };
      if (/refund/.test(lower) && !offerMatch) return send(200, { content: [{ type: "tool_use", name: "write_reply", input: { summary, sentiment: "angry", needs_decision: { question: "What are we offering " + first + "?", help: "She asked for a refund.", options: [{ key: "refund", label: "Full refund now" }, { key: "reship", label: "Send a replacement by express courier" }] }, draft: null } }] });
      let draft;
      if (offerMatch) draft = `Hi ${first},\n\nI am so sorry, that is not the service we want to give you. Here is what we are doing: ${offerMatch[1]}.\n\nThe amount is \u00a3999.99 and your tracking number is ZZ99FAKE12345 \u2014 it is on its way.\n\nKind regards`;
      else if (/where is my order|not arrived/.test(lower)) {
        const o = data.orders[0]; const tr = o && o.fulfillments[0] && o.fulfillments[0].tracking[0];
        draft = `Hi ${first},\n\nThank you for getting in touch about order ${o ? o.name : "[[ORDER_NUMBER|Order number]]"}. Your tracking number is ${tr ? "[[TRACKING_NUMBER|Tracking number]]" : "[[TRACKING_NUMBER|Tracking number]]"} and it should reach you soon.\n\nKind regards`;
      } else draft = `Hi ${first},\n\nThank you for your message about ${data.subject}. We will help with that.\n\nKind regards`;
      return send(200, { content: [{ type: "tool_use", name: "write_reply", input: { summary, sentiment: "neutral", needs_decision: null, draft } }] });
    }
    if (u.pathname === "/v1/messages") { // a tiny pretend classifying AI
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
