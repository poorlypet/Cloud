/* Loads a live market page in a browser with the local market files injected where the theme layout will load them. Usage: node test-harness.cjs /de-de/ DE [shot.png] */
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
const [,, url = "/de-de/", code = "DE", shot] = process.argv;
const dir = __dirname, rd = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : "");
const root = url.startsWith("/en-ie") ? "/en-ie/" : "/de-de/";
const cfg = `<script>window.PP_MARKET={code:${JSON.stringify(code)},currency:"EUR",lang:${JSON.stringify(code === "DE" ? "de" : "en")},root:${JSON.stringify(root)}};</script>`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1300, height: 900 }, locale: code === "DE" ? "de-DE" : "en-IE" }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.route("**/*", async (route) => {
    const u = route.request().url();
    if (route.request().resourceType() !== "document" || !u.includes("poorly-pet.com" + root.replace(/\/$/, ""))) return route.continue();
    const r = await route.fetch(); let t = await r.text();
    t = t.replace(/<script src="[^"]*pet-cat\.js[^"]*"><\/script>/, (m) => cfg + "<script>" + rd("eu-catalog.js") + "</script><script>" + rd("de-dict.js") + "</script><script>" + rd("market.js") + "</script>" + m);
    t = t.replace(/(<script src="[^"]*site-data\.js[^"]*"><\/script>)/, (m) => m + "<script>PP_MARKET_ENGINE&&PP_MARKET_ENGINE.late&&PP_MARKET_ENGINE.late()</script>");
    t = t.replace(/(<script src="[^"]*offers\.js[^"]*"><\/script>)/, (m) => m + "<script>PP_MARKET_ENGINE&&PP_MARKET_ENGINE.afterOffers&&PP_MARKET_ENGINE.afterOffers()</script>");
    await route.fulfill({ response: r, body: t });
  });
  await p.goto("https://www.poorly-pet.com" + url, { waitUntil: "domcontentloaded", timeout: 45000 }); await p.waitForTimeout(4000);
  const d = await p.evaluate(() => ({
    lang: document.documentElement.lang, title: document.title, util: (document.querySelector("#util") || {}).innerText,
    cnt: (document.body.innerText.match(/(Showing|Zeige)[^\n]*/) || [""])[0], cards: [...document.querySelectorAll("#cl-grid > *")].slice(0, 3).map(e => e.innerText.replace(/\n/g, " | ").slice(0, 140)),
    hrefs: [...document.querySelectorAll("a[href]")].slice(0, 400).map(a => a.getAttribute("href")).filter(h => h.startsWith("/")).filter(h => !h.startsWith("/de-de") && !h.startsWith("/en-ie")).slice(0, 8),
    pound: (document.body.innerText.match(/£/g) || []).length, euro: (document.body.innerText.match(/€/g) || []).length,
    mb: window.PP_EUCAT ? Object.keys(PP_EUCAT.p).length : 0, sh: window.SHOPIFY ? SHOPIFY.products.length : 0
  }));
  console.log(JSON.stringify(d, null, 1)); console.log("errors:", errs.slice(0, 5));
  if (shot) await p.screenshot({ path: shot });
  await b.close();
})();
