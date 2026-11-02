import assert from "node:assert/strict";
import { encrypt, decrypt, makeState, checkState } from "../src/crypto.js";
import { parseMessage, customerOf, stripQuoted, htmlToText } from "../src/gmail.js";
import { heuristicClassify, boostForWait } from "../src/classify.js";
import { syncInbox } from "../src/sync.js";
import { saveConnection } from "../src/gmail.js";
import * as inbox from "../src/inbox.js";
import { makeDB } from "./d1shim.mjs";
import { startMock } from "./mock-google.mjs";
import { THREADS, LIST, MAILBOX } from "./fixtures.mjs";

const KEY = "a-test-encryption-key-that-is-long-enough-123";

/* ---- crypto ---- */
const sealed = await encrypt("rt-secret", KEY);
assert.notEqual(sealed, "rt-secret");
assert.equal(await decrypt(sealed, KEY), "rt-secret");
await assert.rejects(() => decrypt(sealed, KEY + "x"));
const st = await makeState(7, KEY);
assert.equal(await checkState(st, KEY), 7);
assert.equal(await checkState(st.replace(/.$/, "x"), KEY), null);           // tampered
assert.equal(await checkState(st, KEY + "x"), null);                          // wrong key
assert.equal(await checkState(st, KEY, -1), null);                            // expired
console.log("ok crypto");

/* ---- reading messages ---- */
const get = (tid, i = 0) => parseMessage(THREADS.find((t) => t.id === tid).messages[i], MAILBOX);
const angry = get("th-angry", 2);
assert.ok(!angry.body.includes("wrote:") && !angry.body.includes("> Hi Helen"), "quoted reply is removed");
assert.equal(get("th-angry", 1).fromUs, true);
assert.equal(get("th-angry", 0).fromUs, false);
const form = get("th-form");
assert.equal(customerOf(form).email, "tom.w@example.com", "contact form customer is the Reply-To");
assert.equal(customerOf(get("th-wismo")).email, "aisha.r@example.com");
const html = get("th-html");
assert.ok(html.body.includes("Which size neck brace") && !html.body.includes("color:red") && !html.body.includes("<"), "html turned into plain text");
const sup = get("th-supplier");
assert.equal(sup.attachments[0].name, "invoice-2290.pdf");
assert.equal(get("th-news").bulk, true);
assert.equal(stripQuoted("Hello\n\nOn Mon, 1 Jan 2026 at 10:00, X <x@y.com> wrote:\n> old"), "Hello");
assert.equal(htmlToText("<p>A &amp; B</p><p>C</p>"), "A & B\n\nC");
console.log("ok reading messages");

/* ---- rules ---- */
assert.equal(heuristicClassify(get("th-supplier")).category, "supplier");
assert.equal(heuristicClassify(get("th-seo")).category, "marketing");
assert.equal(heuristicClassify(get("th-wismo")).category, "customer");
assert.equal(heuristicClassify(angry).priority, "urgent");
assert.deepEqual(heuristicClassify(angry).flags.includes("Chargeback threat"), true);
assert.equal(boostForWait("normal", 30), "high");
assert.equal(boostForWait("low", 60), "high");
assert.equal(boostForWait("urgent", 100), "urgent");
console.log("ok rules");

/* ---- full sync against the pretend Google ---- */
const mock = await startMock(8802);
const base = "http://localhost:8802";
const mkEnv = (extra = {}) => ({
  DB: makeDB(), ENCRYPTION_KEY: KEY, MAILBOX, GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "sec",
  GOOGLE_TOKEN_URL: base + "/token", GMAIL_API_BASE: base + "/gmail", ANTHROPIC_API_BASE: base, ANTHROPIC_API_KEY: "sk-test", ...extra
});
let env = mkEnv();
await saveConnection(env, { refresh_token: "rt-1" }, MAILBOX);
const stats = await syncInbox(env);
assert.equal(stats.listed, 8); assert.equal(stats.read, 8); assert.equal(stats.errors, 0);
const rows = Object.fromEntries((await env.DB.prepare("SELECT * FROM threads").all()).results.map((r) => [r.id, r]));
assert.equal(rows["th-angry"].category, "customer"); assert.equal(rows["th-angry"].priority, "urgent"); assert.equal(rows["th-angry"].status, "needs_reply");
assert.equal(rows["th-wismo"].category, "customer");
assert.equal(rows["th-form"].customer_email, "tom.w@example.com");
assert.equal(rows["th-supplier"].category, "supplier"); assert.equal(rows["th-supplier"].status, "ignored");
assert.equal(rows["th-news"].category, "marketing"); assert.equal(rows["th-news"].category_source, "rule");  // no AI call needed
assert.equal(rows["th-seo"].category, "marketing"); assert.equal(rows["th-seo"].status, "ignored");
assert.equal(rows["th-replied"].status, "replied", "we answered last so it is not in the to-reply queue");
assert.equal(rows["th-html"].status, "needs_reply");
assert.equal(mock.calls.ai, 7, "the bulk newsletter is sorted by a free rule, the other seven by the AI");
assert.equal(mock.calls.token, 1, "one token refresh reused for every call");
console.log("ok sync", JSON.stringify(stats));

// reading again does nothing new
const again = await syncInbox(env);
assert.equal(again.read, 0); assert.equal(again.skipped, 8);

// the list and detail the portal shows
const list = await inbox.listThreads(env);
assert.equal(list[0].id, "th-angry", "urgent first");
const detail = await inbox.getThread(env, "th-angry");
assert.equal(detail.messages.length, 3);
assert.equal(detail.messages[1].from, "us");
assert.equal(detail.summary.order_number, "#1431");
assert.equal((await inbox.getThread(env, "th-form")).summary.order_number, "#10459");
assert.equal((await inbox.getThread(env, "th-supplier")).messages[0].attachments[0].name, "invoice-2290.pdf");

// a person corrects the sort: the sender is remembered and the person's decision is never overwritten
await inbox.setCategory(env, "th-seo", "customer", 1);
assert.equal((await env.DB.prepare("SELECT status FROM threads WHERE id='th-seo'").first()).status, "needs_reply");
LIST.find((t) => t.id === "th-seo").historyId = "206"; // pretend a new message arrived
await syncInbox(env);
const seo = await env.DB.prepare("SELECT category, category_source FROM threads WHERE id='th-seo'").first();
assert.equal(seo.category, "customer"); assert.equal(seo.category_source, "person");
await inbox.setCategory(env, "th-supplier", "supplier", 1);
const rule = await env.DB.prepare("SELECT pattern FROM sender_rules WHERE category='supplier'").first();
assert.equal(rule.pattern, "@karnlea.example", "a whole supplier domain is remembered");
console.log("ok list, detail and corrections");

// marking done sticks until the customer writes again
await inbox.setStatus(env, "th-wismo", "done");
LIST.find((t) => t.id === "th-wismo").historyId = "302";
await syncInbox(env);
assert.equal((await env.DB.prepare("SELECT status FROM threads WHERE id='th-wismo'").first()).status, "done");
console.log("ok done sticks");

// a person can bring back an email we already replied to, and it stays until something new happens
await inbox.setStatus(env, "th-replied", "needs_reply");
LIST.find((t) => t.id === "th-replied").historyId = "407";
await syncInbox(env);
assert.equal((await env.DB.prepare("SELECT status FROM threads WHERE id='th-replied'").first()).status, "needs_reply");
// and an ignored email can be brought back too, even a supplier one
await inbox.setCategory(env, "th-news", "customer", 1);
assert.equal((await env.DB.prepare("SELECT status FROM threads WHERE id='th-news'").first()).status, "needs_reply");
console.log("ok bring back to reply");

// no AI key: the plain rules still sort the inbox
env = mkEnv({ ANTHROPIC_API_KEY: undefined });
await saveConnection(env, { refresh_token: "rt-1" }, MAILBOX);
LIST.forEach((t) => (t.historyId += "x"));
const s2 = await syncInbox(env);
assert.equal(s2.errors, 0);
const r2 = Object.fromEntries((await env.DB.prepare("SELECT id, category FROM threads").all()).results.map((r) => [r.id, r.category]));
assert.equal(r2["th-supplier"], "supplier"); assert.equal(r2["th-seo"], "marketing"); assert.equal(r2["th-angry"], "customer");
console.log("ok works without the AI key");


/* ---- step 3: Shopify lookups and AI drafts ---- */
env = mkEnv({ SHOPIFY_SHOP: "x.myshopify.com", SHOPIFY_BASE: base, SHOPIFY_CLIENT_ID: "shop-id", SHOPIFY_CLIENT_SECRET: "shop-secret" });
await saveConnection(env, { refresh_token: "rt-1" }, MAILBOX);
{ const { clearTokenCache: c } = await import("../src/gmail.js"); c(); }
LIST.forEach((t) => (t.historyId += "y"));
const s3 = await syncInbox(env, { draftLimit: 10 });
assert.ok(s3.drafted >= 4, "drafts were written: " + JSON.stringify(s3));
const full = await inbox.getThread(env, "th-wismo");
assert.equal(full.summary.order_number, "#1466");
assert.ok(full.summary.checked.some((c) => /#1466/.test(c) && /no tracking number recorded/.test(c)), "Shopify said there is no tracking");
assert.ok(full.draft.includes("[[TRACKING_NUMBER|Tracking number]]"), "missing tracking becomes a gap the person must fill");
assert.equal(full.gaps, 1);
assert.equal(full.customer.orders[0].number, "#1466");
assert.equal(full.customer.spend, 118);
// a known tracking number is filled in, never left as a gap
const hel = await inbox.getThread(env, "th-angry");
assert.equal(hel.needsDecision, true, "a refund request needs an offer chosen first");
assert.ok(hel.decision.options.length >= 2 && hel.draft === null);
assert.ok(hel.summary.checked.some((c) => /#1431/.test(c) && /H01ABC1234567890/.test(c)));
// choosing an offer writes the reply around it, and invented facts are caught
const chosen = await inbox.chooseOffer(env, "th-angry", "refund", "", "and a goodwill 10 percent code", 1);
const after = await inbox.getThread(env, "th-angry");
assert.ok(after.draft && after.draft.includes("Full refund now"), "the draft uses the chosen offer");
assert.ok(!after.draft.includes("ZZ99FAKE12345"), "an invented tracking number is removed");
assert.ok(!after.draft.includes("999.99"), "an invented amount is removed");
assert.ok(after.draft.includes("[[TRACKING_NUMBER|Tracking number]]") && after.draft.includes("[[REFUND_AMOUNT|Amount]]"), "removed facts become gaps");
assert.ok(!/[\u2014\u2013]/.test(after.draft), "no dashes in the draft");
assert.equal(after.needsDecision, false);
// a person's edit is kept, and a new customer message starts a fresh draft
await inbox.saveEdit(env, "th-wismo", "Hi Aisha, edited by a person \u2014 test", 1);
assert.ok(!/\u2014/.test((await inbox.getThread(env, "th-wismo")).draft), "dash removed from a person's edit too");
// the AI sees our tone guide and the business knowledge
assert.ok(mock.calls.lastDraftSystem.includes("Never use em dashes"));
assert.ok(mock.calls.lastDraftSystem.includes("Free standard UK delivery") || mock.calls.lastDraftSystem.includes("free on orders over"), "business knowledge reached the AI");
// no Shopify keys: drafts still work, with a note that orders were not checked
env = mkEnv({});
await saveConnection(env, { refresh_token: "rt-1" }, MAILBOX);
LIST.forEach((t) => (t.historyId += "z"));
const s4 = await syncInbox(env, { draftLimit: 10 });
const noShop = await inbox.getThread(env, "th-wismo");
assert.ok(noShop.summary.checked[0].includes("Shopify is not connected"));
// no AI key: a clear message instead of a draft
env = mkEnv({ ANTHROPIC_API_KEY: undefined });
await saveConnection(env, { refresh_token: "rt-1" }, MAILBOX);
LIST.forEach((t) => (t.historyId += "w"));
await syncInbox(env, { draftLimit: 10 });
assert.ok((await inbox.getThread(env, "th-wismo")).draftError.includes("no Anthropic key"));
console.log("ok shopify lookups and drafts");

// a bad Google token is reported, not hidden
env = mkEnv();
await saveConnection(env, { refresh_token: "wrong" }, MAILBOX);
const { clearTokenCache } = await import("../src/gmail.js"); clearTokenCache();
await assert.rejects(() => syncInbox(env), /Google said no/);

mock.close();
console.log("gmail and sync tests passed");
