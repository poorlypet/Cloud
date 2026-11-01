// Drives the real portal in a browser against a local mock Google (see mock-google.mjs). Needs: npm run dev, node test/mock-google.mjs
const { chromium } = require("playwright");
const B = "http://localhost:8799";
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error" && !/fonts|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(B + "/"); await p.waitForSelector("#loginform");
  await p.fill("#name", "Joe"); await p.fill("#email", "hello@poorly-pet.com"); await p.fill("#pw", "correct-horse-battery"); await p.fill("#token", "test-setup-code-123"); await p.click("button[type=submit]");
  await p.waitForSelector(".gbar.warn"); console.log("before connect:", (await p.innerText(".gbar")).replace(/\n/g, " "));
  console.log("sample mode threads:", await p.$$eval(".q", (e) => e.length));
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_01_notconnected.png" });
  // connect (owner)
  await Promise.all([p.waitForURL(/gmail=connected|#\/inbox/), p.click("a[href='/api/gmail/connect']")]);
  await p.waitForSelector(".gbar:not(.warn)"); await p.waitForTimeout(1500);
  console.log("after connect:", (await p.innerText(".gbar")).replace(/\n/g, " "), "| flash:", (await p.$$eval(".allgood", (e) => e.map((x) => x.innerText)).catch(() => [])));
  await p.click("#refresh"); await p.waitForFunction(() => /read|up to date/.test((document.querySelector(".toast") || {}).textContent || ""), null, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(500);
  console.log("to reply:", await p.$$eval(".q .who", (e) => e.map((x) => x.textContent).join(", ")));
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_02_inbox.png" });
  // open the angry one
  await p.click(".q"); await p.waitForSelector(".summary"); await p.waitForTimeout(300);
  console.log("first card summary order:", (await p.innerText(".facts")).replace(/\n/g, " | ").slice(0, 120));
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_03_detail.png", fullPage: true });
  // ignored tab has the supplier and the marketing ones
  await p.goto(B + "/#/inbox"); await p.click("[data-tab=ignored]"); await p.waitForTimeout(300);
  console.log("ignored:", await p.$$eval(".q .who", (e) => e.map((x) => x.textContent).join(", ")));
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_04_ignored.png" });
  // move the SEO one to customers
  await p.click(".q"); await p.waitForSelector("#iscustomer"); await p.click("#iscustomer"); await p.waitForTimeout(800);
  await p.click("[data-tab=reply]"); await p.waitForTimeout(300);
  console.log("to reply now includes moved one:", await p.$$eval(".q .who", (e) => e.map((x) => x.textContent).join(", ")));
  // replied tab
  await p.click("[data-tab=replied]"); console.log("replied:", await p.$$eval(".q .who", (e) => e.map((x) => x.textContent).join(", ")));
  // not a customer modal
  await p.click("[data-tab=reply]"); await p.click(".q:last-child"); await p.waitForSelector("#notcustomer"); await p.click("#notcustomer"); await p.waitForSelector(".modal");
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_05_category.png" }); await p.click("#cancelcat");
  // send is still blocked
  // team page shows gmail card
  await p.click("a[href='#/team']"); await p.waitForSelector("#gdisconnect"); console.log("gmail card:", (await p.innerText("section.panel.block")).replace(/\n/g, " ").slice(0, 140));
  await p.screenshot({ path: "/tmp/claude-0/pp/s2_06_team.png" });
  // staff cannot connect
  await p.evaluate(() => fetch("/api/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Sam", email: "sam@poorly-pet.com", password: "a-long-enough-pass" }) }));
  await p.click("#logout"); await p.waitForSelector("#loginform"); await p.fill("#email", "sam@poorly-pet.com"); await p.fill("#pw", "a-long-enough-pass"); await p.click("button[type=submit]"); await p.waitForSelector(".hdr");
  const r = await p.evaluate(async () => (await fetch("/api/gmail/connect", { redirect: "manual" })).status);
  const r2 = await p.evaluate(async () => (await fetch("/api/gmail/disconnect", { method: "POST" })).status);
  console.log("staff connect ->", r, "| staff disconnect ->", r2);
  // owner disconnect
  await p.click("#logout"); await p.waitForSelector("#loginform"); await p.fill("#email", "hello@poorly-pet.com"); await p.fill("#pw", "correct-horse-battery"); await p.click("button[type=submit]"); await p.waitForSelector(".hdr");
  await p.click("a[href='#/team']"); await p.waitForSelector("#gdisconnect"); await p.click("#gdisconnect"); await p.waitForTimeout(800);
  console.log("after disconnect:", (await p.innerText("section.panel.block")).replace(/\n/g, " ").slice(0, 100));
  console.log("console errors:", errs);
  await b.close();
})();
