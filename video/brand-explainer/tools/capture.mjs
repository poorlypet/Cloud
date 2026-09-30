// Captures the live poorly-pet.com UI as raster assets (phone viewport 432 px, device scale 3).
// Usage: OUT=assets node tools/capture.mjs <home|condition|collections|symptom|scanner|reviews|assistant|logo|fix|pill>
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.env.OUT;
const man = fs.existsSync(OUT + '/manifest.json') ? JSON.parse(fs.readFileSync(OUT + '/manifest.json')) : {};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: 'http://127.0.0.1:40307' } });
const ctx = await b.newContext({ viewport: { width: 432, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });

// Page helpers, injected once per page
const HELPERS = `
window.__find = (text, o = {}) => {
  const inHead = e => e.closest('header, nav, .hd-mobile, footer');
  const cands = [...document.querySelectorAll('body *')].filter(e => !inHead(e) && e.getBoundingClientRect().width > 0 &&
    [...e.childNodes].some(n => n.nodeType === 3 && (o.exact ? n.textContent.trim() === text : n.textContent.trim().startsWith(text))));
  let e = cands[o.nth || 0];
  if (!e) return null;
  while (e && e.parentElement) {
    const r = e.getBoundingClientRect();
    if (r.width >= (o.minW || 0) && r.height >= (o.minH || 0) && (!o.cls || e.matches(o.cls))) break;
    e = e.parentElement;
  }
  return e;
};
window.__hideFixed = () => { for (const e of document.querySelectorAll('body *')) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') e.style.setProperty('display', 'none', 'important'); } };
window.__clear = e => { const saved = []; let a = e.parentElement; while (a) { saved.push([a, a.getAttribute('style')]); a.style.setProperty('background', 'transparent', 'important'); a.style.setProperty('background-image', 'none', 'important'); a = a.parentElement; } window.__saved = saved; };
window.__restore = () => { for (const [a, s] of window.__saved || []) { if (s === null) a.removeAttribute('style'); else a.setAttribute('style', s); } window.__saved = []; };
`;
async function open(u) {
  const p = await ctx.newPage();
  await p.goto('https://www.poorly-pet.com' + u, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(4500);
  for (let y = 0; y < 14000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(90); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.addScriptTag({ content: HELPERS });
  await p.addStyleTag({ content: '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important} .rv{opacity:1!important;transform:none!important}' });
  return p;
}
async function shot(p, name, text, o = {}) {
  const h = await p.evaluateHandle(([t, o]) => window.__find(t, o), [text, o]);
  const el = h.asElement();
  if (!el) { console.log('MISS', name, text); return; }
  if (o.prep) await el.evaluate(o.prep);
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(250);
  const clear = o.clear !== false;
  if (clear) await el.evaluate(e => window.__clear(e));
  await el.screenshot({ path: `${OUT}/${name}.png`, omitBackground: clear });
  if (clear) await p.evaluate(() => window.__restore());
  const bb = await el.boundingBox();
  man[name] = { w: Math.round(bb.width * 3), h: Math.round(bb.height * 3), src: p.url(), text };
  console.log('ok', name, man[name].w + 'x' + man[name].h);
}
const job = process.argv[2];

if (job === 'home') {
  const p = await open('/');
  const hd = await p.$('header'); await hd.screenshot({ path: OUT + '/header.png' });
  const hb = await hd.boundingBox(); man.header = { w: hb.width * 3, h: hb.height * 3, src: p.url() }; console.log('ok header');
  await p.evaluate(() => window.__hideFixed());
  await shot(p, 'hero-search', 'Search', { cls: 'form, div', minW: 380, minH: 50, exact: true });
  await shot(p, 'btn-condition', 'I know the condition', { minW: 380 });
  await shot(p, 'btn-symptom', "I'm not sure what's wrong", { minW: 380 });
  await shot(p, 'btn-scan', "Scan my dog's symptoms", { minW: 380 });
  await shot(p, 'hero-trust', 'from 101+ owners', { minW: 380 });
  await shot(p, 'scan-card', 'Poorly Pet Symptom Scanner', { cls: '.pp-scancard' });
  await shot(p, 'sym-panel', 'Legs & paws', { minW: 380, minH: 500, clear: false });
  await p.close();
}
if (job === 'condition') {
  const p = await open('/pages/shop-by-condition');
  await p.evaluate(() => window.__hideFixed());
  await shot(p, 'cond-hero', 'Shop by your', { cls: 'section', clear: false });
  for (const [n, t] of [['c-arthritis', 'Arthritis / Osteoarthritis'], ['c-hip', 'Hip Dysplasia'], ['c-ivdd', 'IVDD'], ['c-cruciate', 'Cruciate Ligament'], ['c-back', 'Back Pain / Spinal Issues'], ['c-patella', 'Luxating Patella']])
    await shot(p, n, t, { minW: 380, minH: 180, exact: n === 'c-ivdd' || n === 'c-hip' });
  await p.close();
}
if (job === 'collections') {
  for (const [slug, pre] of [['arthritis', 'pa'], ['limping-or-favouring-a-leg', 'pl']]) {
    const p = await open('/collections/' + slug);
    await p.evaluate(() => window.__hideFixed());
    await shot(p, pre + '-hero', 'Showing', { clear: false, cls: 'section', nth: 0, prep: null });
    const titles = await p.$$eval('.cp-card .cp-title', els => els.map(e => e.textContent.trim()));
    console.log(slug, titles);
    const cards = await p.$$('.cp-card');
    for (let i = 0; i < Math.min(cards.length, 20); i++) {
      await cards[i].scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
      await cards[i].evaluate(e => window.__clear(e));
      await cards[i].screenshot({ path: `${OUT}/${pre}-card-${i}.png`, omitBackground: true });
      await p.evaluate(() => window.__restore());
      const bb = await cards[i].boundingBox(); man[`${pre}-card-${i}`] = { w: Math.round(bb.width * 3), h: Math.round(bb.height * 3), src: p.url(), text: titles[i] };
    }
    // collection header (breadcrumb + title), captured separately
    const top = await p.evaluateHandle(() => document.querySelector('main h1, #MainContent h1').closest('section'));
    await top.asElement().screenshot({ path: `${OUT}/${pre}-top.png` });
    const bb = await top.asElement().boundingBox(); man[pre + '-top'] = { w: bb.width * 3, h: bb.height * 3, src: p.url() };
    await p.close();
  }
}

if (job === 'symptom') {
  const p = await open('/pages/shop-by-symptom');
  await p.evaluate(() => window.__hideFixed());
  for (const [n, t] of [['t-legs', 'Legs & paws'], ['t-skin', 'Skin & coat'], ['t-tummy', 'Tummy & gut'], ['t-ears', 'Ears & eyes'], ['t-mouth', 'Mouth & teeth'], ['t-back', 'Back & spine'], ['t-behaviour', 'Behaviour & mood'], ['t-whole', 'Whole body']])
    await shot(p, n, t, { minW: 150, minH: 130, exact: true });
  for (const [n, t] of [['r-limping', 'Limping or favouring a leg'], ['r-stiff', 'Stiffness after rest'], ['r-slow', 'Slow to get up']])
    await shot(p, n, t, { minW: 380, minH: 100 });
  await shot(p, 'legs-head', 'Often points to', { minW: 380, clear: true });
  // Legs & paws tile in its inactive state
  await p.evaluate(() => window.__find('Skin & coat', { exact: true, minW: 150, minH: 130 }).click()); await p.waitForTimeout(600);
  await shot(p, 't-legs-off', 'Legs & paws', { minW: 150, minH: 130, exact: true });
  await shot(p, 't-skin-on', 'Skin & coat', { minW: 150, minH: 130, exact: true });
  await p.close();
}
if (job === 'scanner') {
  const p = await open('/pages/symptom-scanner');
  await p.evaluate(() => window.__hideFixed());
  await shot(p, 'sc-hero', 'See what your dog', { cls: 'section', clear: false });
  for (const [n, t] of [['sc-capture', 'Capture'], ['sc-analyse', 'Analyse'], ['sc-act', 'Act']]) await shot(p, n, t, { cls: '.sc-step', exact: true });
  await shot(p, 'sc-notdiag', 'Not a diagnosis', { cls: '.sc-tcard' });
  await shot(p, 'sc-btn', 'Start a scan', { cls: 'button' });
  await p.close();
}
if (job === 'reviews') {
  const p = await open('/pages/reviews');
  await p.evaluate(() => window.__hideFixed());
  await shot(p, 'rv-summary', 'Based on', { minW: 360, minH: 150 });
  await p.addStyleTag({ content: '.rv-list{display:block!important}.rv-card{height:auto!important;min-height:0!important;margin-bottom:16px}' });
  await p.waitForTimeout(500);
  for (const [n, t] of [['rv-elbow', 'Elbow support'], ['rv-exactly', 'Exactly as I ordered'], ['rv-settled', 'Much more settled'], ['rv-easy', 'Easy to fine']]) await shot(p, n, t, { cls: 'article' });
  await p.close();
}
if (job === 'assistant') {
  const p = await open('/pages/ai-support-assistant');
  await p.evaluate(() => window.__hideFixed());
  await shot(p, 'ai-hero', 'Tell us what', { cls: 'section', clear: false });
  const panel = async n => { const e = await p.$('.ai-panel'); await e.scrollIntoViewIfNeeded(); await e.evaluate(e => window.__clear(e)); await e.screenshot({ path: `${OUT}/${n}.png`, omitBackground: true }); await p.evaluate(() => window.__restore()); const bb = await e.boundingBox(); man[n] = { w: bb.width * 3, h: bb.height * 3, src: p.url() }; console.log('ok', n); };
  await panel('ai-panel-0');
  const input = p.locator('.ai-panel input, .ai-panel textarea').first();
  await input.fill('What could help my dog with mobility problems?');
  await panel('ai-panel-typed');
  await input.press('Enter');
  await p.waitForTimeout(700);
  await panel('ai-panel-thinking');
  await p.getByText('View support products').first().waitFor({ timeout: 45000 });
  await p.waitForTimeout(1200);
  await panel('ai-panel-reply');
  const msgs = await p.$$('.pp-aimsg');
  for (let i = 0; i < msgs.length; i++) { await msgs[i].evaluate(e => window.__clear(e)); await msgs[i].screenshot({ path: `${OUT}/ai-msg-${i}.png`, omitBackground: true }); await p.evaluate(() => window.__restore()); const bb = await msgs[i].boundingBox(); man['ai-msg-' + i] = { w: bb.width * 3, h: bb.height * 3, text: await msgs[i].innerText() }; console.log('msg', i, JSON.stringify(man['ai-msg-' + i].text).slice(0, 400)); }
  fs.writeFileSync(OUT + '/ai-transcript.txt', await p.locator('.ai-panel').innerText());
  await p.close();
}
if (job === 'logo') {
  const p = await ctx.newPage();
  const r = await p.goto('https://cdn.shopify.com/s/files/1/1047/4042/1964/files/horizontal-lockup-transparent.png?v=1783282661');
  fs.writeFileSync(OUT + '/logo.png', await r.body()); console.log('logo', (await r.body()).length);
}

if (job === 'fix') {
  let p = await open('/pages/symptom-scanner'); await p.evaluate(() => window.__hideFixed());
  await shot(p, 'sc-notdiag', 'Not a diagnosis', { cls: '.sc-tcard', clear: false });
  await shot(p, 'sc-private', 'Private by design', { cls: '.sc-tcard', clear: false });
  await p.close();
  p = await open('/pages/reviews'); await p.evaluate(() => window.__hideFixed());
  await shot(p, 'rv-summary', 'Based on', { minW: 360, minH: 150, clear: false });
  await p.close();
  p = await open('/pages/ai-support-assistant'); await p.evaluate(() => window.__hideFixed());
  const kids = await p.$$eval('.ai-panel > *', els => els.map(e => e.tagName + '.' + [...e.classList].join('.') + ' ' + Math.round(e.getBoundingClientRect().height)));
  console.log('panel kids', kids);
  const each = async (sel, n) => { const e = await p.$(sel); if (!e) { console.log('MISS', sel); return; } await e.scrollIntoViewIfNeeded(); await e.screenshot({ path: `${OUT}/${n}.png` }); const bb = await e.boundingBox(); man[n] = { w: bb.width * 3, h: bb.height * 3, src: p.url() }; console.log('ok', n, bb.height); };
  const kidSel = i => `.ai-panel > :nth-child(${i + 1})`;
  for (let i = 0; i < kids.length; i++) await each(kidSel(i), 'ai-part-' + i);
  const input = p.locator('.ai-panel input, .ai-panel textarea').first();
  await input.fill('What could help my dog with mobility problems?');
  const form = await input.evaluateHandle(e => e.closest('form') || e.parentElement);
  await form.asElement().screenshot({ path: `${OUT}/ai-input-typed.png` });
  await input.fill('');
  await form.asElement().screenshot({ path: `${OUT}/ai-input-empty.png` });
  await input.fill('What could help my dog with mobility problems?');
  await input.press('Enter'); await p.waitForTimeout(600);
  const typing = await p.evaluateHandle(() => { const b = document.querySelector('.pp-aibody'); return b.lastElementChild; });
  console.log('typing el', await typing.evaluate(e => e.className + ' ' + e.getBoundingClientRect().height));
  await typing.asElement().screenshot({ path: `${OUT}/ai-typing.png` });
  await p.getByText('View support products').first().waitFor({ timeout: 45000 }); await p.waitForTimeout(1200);
  const btn = await p.evaluateHandle(() => [...document.querySelectorAll('.pp-aibody button, .pp-aibody a')].find(e => e.textContent.includes('View support products')));
  await btn.asElement().evaluate(e => window.__clear(e)); await btn.asElement().screenshot({ path: `${OUT}/ai-viewbtn.png`, omitBackground: true }); await p.evaluate(() => window.__restore());
  const msgs = await p.$$('.pp-aimsg');
  for (let i = 0; i < msgs.length; i++) { await msgs[i].evaluate(e => window.__clear(e)); await msgs[i].screenshot({ path: `${OUT}/ai-msg-${i}.png`, omitBackground: true }); await p.evaluate(() => window.__restore()); console.log('msg', i, JSON.stringify(await msgs[i].innerText()).slice(0, 500)); }
  await each('.ai-panel', 'ai-panel-reply');
  fs.writeFileSync(OUT + '/ai-transcript.txt', await p.locator('.ai-panel').innerText());
  await p.close();
}

if (job === 'pill') {
  const p = await open('/');
  const el = await p.evaluateHandle(() => [...document.querySelectorAll('body *')].find(e => getComputedStyle(e).position === 'fixed' && e.textContent.trim() === 'Care assistant' && e.getBoundingClientRect().width < 300));
  if (el.asElement()) { await el.asElement().screenshot({ path: `${OUT}/ai-pill.png`, omitBackground: true }); const bb = await el.asElement().boundingBox(); console.log('pill', bb); man['ai-pill'] = { w: bb.width * 3, h: bb.height * 3, src: p.url(), x: bb.x, y: bb.y }; }
  else console.log('MISS pill');
  await p.close();
}

fs.writeFileSync(OUT + '/manifest.json', JSON.stringify(man, null, 1));
await b.close();
