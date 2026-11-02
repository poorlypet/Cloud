const { chromium } = require("playwright");
const B = "http://localhost:8799";
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error" && !/fonts|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(B + "/"); await p.waitForSelector("#loginform");
  await p.fill("#name", "Joe"); await p.fill("#email", "hello@poorly-pet.com"); await p.fill("#pw", "correct-horse-battery"); await p.fill("#token", "test-setup-code-123"); await p.click("button[type=submit]");
  await p.waitForSelector(".gbar");
  await Promise.all([p.waitForURL(/gmail=connected|#\/inbox/), p.click("a[href='/api/gmail/connect']")]);
  await p.waitForSelector(".gbar:not(.warn)"); await p.waitForTimeout(6000);
  await p.click("#refresh").catch(() => {}); await p.waitForTimeout(3000);
  console.log("queue:", await p.$$eval(".q .who", (e) => e.map((x) => x.textContent).join(", ")));
  // settings: sending card
  await p.click("a[href='#/settings']"); await p.waitForSelector("#sendcard");
  console.log("sig:", (await p.innerText(".sigbox")).replace(/\n/g, " "));
  await p.selectOption("#sendmode", "test"); await p.fill("#testaddr", "me@example.com"); await p.click("#savesend"); await p.waitForTimeout(800);
  await p.screenshot({ path: "/tmp/claude-0/pp/s4_settings.png", fullPage: true });
  // dashboard
  await p.click("a[href='#/dashboard']"); await p.waitForSelector(".tiles"); await p.waitForTimeout(300);
  console.log("dash:", (await p.innerText(".tiles")).replace(/\n/g, " "));
  await p.screenshot({ path: "/tmp/claude-0/pp/s4_dash.png", fullPage: true });
  // send a test
  await p.click("a[href='#/inbox']"); await p.waitForSelector(".q");
  const rows = await p.$$(".q");
  for (const r of rows) { await r.click(); await p.waitForTimeout(500); if (await p.$("#send")) break; }
  if (await p.$("#send")) {
    await p.click("#send"); await p.waitForTimeout(300);
    if (await p.$("#sure")) { await p.check("#sure"); await p.click("#gosend"); }
    await p.waitForTimeout(1500);
    console.log("toast:", await p.$$eval(".toast", (e) => e.map((x) => x.textContent).join("|")));
  } else console.log("no thread with a draft yet");
  await p.screenshot({ path: "/tmp/claude-0/pp/s4_sent.png", fullPage: true });
  console.log("errors:", errs);
  await b.close();
})();
