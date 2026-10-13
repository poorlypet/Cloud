/* Raqello theme: header, drawers, search, bag, collection filters, product page */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RQ = window.RQ || {};

/* ---------- mega menu ---------- */
const mega = $('#mega');
if (mega) {
  let cur = null, tm;
  const show = k => { clearTimeout(tm); if (cur === k) return; cur = k;
    $$('.mpn', mega).forEach(p => p.hidden = p.dataset.p !== k);
    mega.classList.add('on'); $$('[data-mega]').forEach(b => b.classList.toggle('on', b.dataset.mega === k)); };
  const hide = () => { tm = setTimeout(() => { cur = null; mega.classList.remove('on'); $$('[data-mega]').forEach(b => b.classList.remove('on')); }, 140); };
  $$('[data-mega]').forEach(b => { b.addEventListener('mouseenter', () => show(b.dataset.mega)); b.addEventListener('mouseleave', hide); b.addEventListener('focus', () => show(b.dataset.mega)); });
  $$('.r2 a:not([data-mega])').forEach(a => a.addEventListener('mouseenter', hide));
  mega.addEventListener('mouseenter', () => clearTimeout(tm)); mega.addEventListener('mouseleave', hide);
}

/* ---------- drawers ---------- */
let openEl = null;
const scrim = $('#scrim');
function open(id) {
  close(); openEl = $('#' + id); if (!openEl) return;
  openEl.classList.add('on'); scrim && scrim.classList.add('on'); document.body.classList.add('lock');
  if (id === 'search') setTimeout(() => { const q = $('#q'); q && q.focus(); }, 150);
}
function close() {
  if (openEl) openEl.classList.remove('on');
  $$('.mp.sub.on').forEach(p => p.classList.remove('on')); const mm = $('.mp.main'); if (mm) mm.classList.remove('off');
  $$('.fsheet.on,.lvsheet.on').forEach(s => s.classList.remove('on'));
  openEl = null; scrim && scrim.classList.remove('on'); document.body.classList.remove('lock');
}
window.RQopen = open; window.RQclose = close;
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

/* ---------- toast ---------- */
function toast(t) { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2200); }

/* ---------- bag ---------- */
async function refreshBag(sections) {
  const html = sections && sections['cart-drawer'] ? sections['cart-drawer'] : await (await fetch(location.pathname + '?section_id=cart-drawer')).text();
  const d = new DOMParser().parseFromString(html, 'text/html');
  ['#bagb', '#bagf'].forEach(s => { const a = $(s), b = $(s, d); if (a && b) a.innerHTML = b.innerHTML; });
  const c = await (await fetch(RQ.cartUrl + '.js')).json(); const n = $('#bagn'); if (n) n.textContent = c.item_count;
}
async function addToBag(id, qty = 1, props) {
  const r = await fetch(RQ.cartAdd + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items: [{ id: +id, quantity: qty, properties: props || {} }], sections: 'cart-drawer' }) });
  const j = await r.json();
  if (!r.ok) { toast(j.description || j.message || 'Sorry, that could not be added'); return false; }
  await refreshBag(j.sections);
  const it = j.items && j.items[0]; toast((it ? it.product_title : '') + ' ' + (RQ.added || 'added to bag'));
  return true;
}
async function changeLine(line, quantity) {
  const r = await fetch(RQ.cartChange + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ line: +line, quantity: +quantity, sections: 'cart-drawer' }) });
  const j = await r.json(); await refreshBag(j.sections);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-open],[data-close],#scrim,[data-line],[data-sub],.mback,[data-more],.ftr3 h4,[data-arr]');
  if (!t) return;
  if (t.dataset.add !== undefined) { e.preventDefault(); t.disabled = true; addToBag(t.dataset.add).finally(() => t.disabled = false); }
  else if (t.dataset.open) { if (t.dataset.open === 'bag' && document.body.classList.contains('tpl-cart')) return; e.preventDefault(); open(t.dataset.open); }
  else if (t.dataset.close !== undefined || t.id === 'scrim') close();
  else if (t.dataset.line) { if (document.body.classList.contains('tpl-cart') && t.closest('#cartp')) return; changeLine(t.dataset.line, t.dataset.qty); }
  else if (t.dataset.sub) { $('.mp.main').classList.add('off'); $(`.mp.sub[data-p="${t.dataset.sub}"]`).classList.add('on'); }
  else if (t.classList.contains('mback')) { t.closest('.mp').classList.remove('on'); $('.mp.main').classList.remove('off'); }
  else if (t.dataset.more !== undefined) { const w = t.closest('.seo'); w.classList.toggle('open'); t.textContent = w.classList.contains('open') ? t.dataset.less : t.dataset.moreLabel; }
  else if (t.matches('.ftr3 h4')) t.parentElement.classList.toggle('on');
  else if (t.dataset.arr) { const r = t.closest('section').querySelector('.rail,.tprail'); r && r.scrollBy({ left: +t.dataset.arr * r.clientWidth * .75, behavior: 'smooth' }); }
});

/* ---------- predictive search ---------- */
const q = $('#q'), sres = $('#sres');
if (q && sres) {
  const start = sres.innerHTML; let tm, ctl;
  q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(async () => {
    const v = q.value.trim(); if (!v) { sres.innerHTML = start; return; }
    ctl && ctl.abort(); ctl = new AbortController();
    try { const r = await fetch(`${RQ.searchUrl}?q=${encodeURIComponent(v)}&resources[type]=product,collection,query&resources[limit]=6&section_id=predictive-search`, { signal: ctl.signal });
      const d = new DOMParser().parseFromString(await r.text(), 'text/html'); const s = d.querySelector('.shopify-section'); sres.innerHTML = s ? s.innerHTML : ''; } catch (err) {}
  }, 180); });
}

/* ---------- collection: filters, sort, load more ---------- */
function plpSection() { return $('[data-plp]'); }
async function loadPlp(url, push = true) {
  const sec = plpSection(); if (!sec) return;
  sec.classList.add('busy');
  const u = new URL(url, location.origin); u.searchParams.set('section_id', sec.dataset.plp);
  const html = await (await fetch(u)).text();
  const d = new DOMParser().parseFromString(html, 'text/html');
  ['#fbar', '#fsb', '#tool', '#achips', '#pgrid', '#more', '#lvt'].forEach(s => { const a = $(s, sec), b = $(s, d); if (a && b) a.replaceWith(b); });
  sec.classList.remove('busy');
  u.searchParams.delete('section_id'); if (push) history.replaceState({}, '', u.pathname + u.search);
}
function formUrl(form) {
  const fd = new FormData(form), p = new URLSearchParams();
  for (const [k, v] of fd) if (v !== '') p.append(k, v);
  const s = $('#sort'); if (s && s.value && !p.has('sort_by')) p.set('sort_by', s.value);
  const sq = new URL(location.href).searchParams.get('q'); if (sq && !p.has('q')) p.set('q', sq);
  return location.pathname + '?' + p.toString();
}
document.addEventListener('change', e => {
  const f = e.target.closest('form[data-filters]');
  if (f) { const twin = f.id === 'ff2' ? $('#ff') : $('#ff2'); if (twin && e.target.name) $$(`[name="${CSS.escape(e.target.name)}"]`, twin).forEach(i => { if (i.type === 'checkbox') { if (i.value === e.target.value) i.checked = e.target.checked; } else i.value = e.target.value; });
    loadPlp(formUrl(f)); return; }
  if (e.target.id === 'sort') { const u = new URL(location.href); u.searchParams.set('sort_by', e.target.value); u.searchParams.delete('page'); loadPlp(u); }
});
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-furl]'); if (a) { e.preventDefault(); loadPlp(a.getAttribute('href')); return; }
  const dd = e.target.closest('.dd>button'); if (dd) { const w = dd.parentElement, on = w.classList.contains('on'); $$('.dd.on').forEach(x => x.classList.remove('on')); if (!on) w.classList.add('on'); return; }
  if (!e.target.closest('.dd')) $$('.dd.on').forEach(x => x.classList.remove('on'));
  const fg = e.target.closest('.fg>button'); if (fg) { fg.parentElement.classList.toggle('shut'); return; }
  if (e.target.closest('[data-open-f]')) { $('#fsheet') && $('#fsheet').classList.add('on'); scrim && scrim.classList.add('on'); return; }
  if (e.target.closest('[data-close-f]')) { close(); return; }
  if (e.target.closest('[data-open-lv]')) { $('#lvsheet') && $('#lvsheet').classList.add('on'); scrim && scrim.classList.add('on'); return; }
  if (e.target.closest('[data-close-lv]')) { close(); return; }
  const lm = e.target.closest('[data-loadmore]'); if (lm) {
    const sec = plpSection(); lm.disabled = true;
    const u = new URL(lm.dataset.loadmore, location.origin); u.searchParams.set('section_id', sec.dataset.plp);
    const d = new DOMParser().parseFromString(await (await fetch(u)).text(), 'text/html');
    $$('#pgrid > *', d).forEach(n => $('#pgrid').appendChild(n)); const m = $('#more', d); $('#more').replaceWith(m || document.createElement('div'));
  }
  const vt = e.target.closest('[data-view]'); if (vt) { $$('[data-view]').forEach(b => b.classList.toggle('on', b === vt)); const g = $('#pgrid'); g && g.classList.toggle('two', vt.dataset.view === 'two'); }
});

/* ---------- product page ---------- */
const pf = $('form[data-product-form]');
if (pf) {
  const vjson = $('[data-variants]'); const variants = vjson ? JSON.parse(vjson.textContent) : [];
  const idIn = $('input[name="id"]', pf), atc = $('#atc'), price = $('#ppr');
  const sync = () => {
    const opts = $$('[data-opt]').map(g => { const c = $('input:checked', g); return c ? c.value : null; });
    const v = variants.find(x => x.options.every((o, i) => o === opts[i]));
    $$('[data-opt]').forEach((g, i) => { const lab = $('[data-optv]', g); if (lab) lab.textContent = opts[i] || ''; });
    if (!v) { atc.disabled = true; atc.textContent = atc.dataset.lNa; return; }
    idIn.value = v.id; atc.disabled = !v.available; atc.textContent = v.available ? atc.dataset.lAdd : atc.dataset.lSoldout;
    if (price && v.price_html) price.innerHTML = v.price_html;
    const u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState({}, '', u);
  };
  document.addEventListener('change', e => { if (e.target.closest('[data-opt]')) sync(); });
  pf.addEventListener('submit', async e => { e.preventDefault(); atc.disabled = true; const qn = +($('#qty') ? $('#qty').textContent : 1);
    const ok = await addToBag(idIn.value, qn); atc.disabled = false; if (ok) open('bag'); });
}
document.addEventListener('click', e => {
  const qd = e.target.closest('[data-qd]'); if (qd) { const s = $('#qty'); s.textContent = Math.max(1, +s.textContent + +qd.dataset.qd); return; }
  const bt = e.target.closest('[data-bt]'); if (bt) { const w = bt.closest('.hp'); $$('[data-bt]', w).forEach(b => b.classList.toggle('on', b === bt)); $$('[data-btp]', w).forEach(p => p.classList.toggle('on', p.dataset.btp === bt.dataset.bt)); return; }
  const tp = e.target.closest('[data-tabp]'); if (tp) { const w = tp.closest('.psec'); $$('[data-tabp]', w).forEach(b => b.classList.toggle('on', b === tp)); $$('[data-pane]', w).forEach(p => p.classList.toggle('on', p.dataset.pane === tp.dataset.tabp)); return; }
  const th = e.target.closest('[data-thumb]'); if (th) { const g = $('#gal'); const i = +th.dataset.thumb; g && g.children[i] && g.scrollTo({ left: g.children[i].offsetLeft, behavior: 'smooth' }); }
});
const gal = $('#gal'), dots = $('#dots');
if (gal && dots) gal.addEventListener('scroll', () => { const i = Math.round(gal.scrollLeft / gal.clientWidth); $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });

/* ---------- product recommendations ---------- */
$$('[data-recs]').forEach(async el => {
  try { const r = await fetch(`${RQ.recsUrl}?section_id=${el.dataset.section}&product_id=${el.dataset.recs}&limit=${el.dataset.limit || 4}&intent=${el.dataset.intent || 'related'}`);
    const d = new DOMParser().parseFromString(await r.text(), 'text/html'); const n = d.querySelector('[data-recs]');
    if (n && n.querySelector('.card')) el.innerHTML = n.innerHTML; else el.closest('.shopify-section') && (el.closest('.shopify-section').hidden = true); } catch (err) {}
});

/* ---------- home: statement highlight on scroll ---------- */
$$('.wst').forEach(w => { const m = $('mark', w); if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  w.classList.add('anim');
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(x => { if (x.isIntersecting) { w.classList.add('in'); o.disconnect(); } }), { threshold: .3 }).observe(w); else w.classList.add('in');
  const tick = () => { const r = w.getBoundingClientRect(), vh = innerHeight, p = Math.min(Math.max((vh * .85 - r.top) / (vh * .4), 0), 1); m.style.setProperty('--p', (p * 100).toFixed(1) + '%'); };
  addEventListener('scroll', tick, { passive: true }); tick(); });

/* ---------- article reading progress ---------- */
const ap = $('#aprog i'); if (ap) addEventListener('scroll', () => { const h = document.documentElement; ap.style.width = Math.min(100, h.scrollTop / (h.scrollHeight - innerHeight) * 100) + '%'; }, { passive: true });

/* ---------- account tabs (sign in / create) ---------- */
document.addEventListener('click', e => { const b = e.target.closest('[data-atab]'); if (!b) return; const w = b.closest('.acc2b');
  $$('[data-atab]', w).forEach(x => x.classList.toggle('on', x === b)); $$('[data-apane]', w).forEach(p => p.classList.toggle('on', p.dataset.apane === b.dataset.atab)); });
/* ---------- legal pages: jump to a section ---------- */
const lj = $('#lgjump');
if (lj) { const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  $$('.lgtx h2').forEach(h => { if (!h.id) h.id = slug(h.textContent); const o = document.createElement('option'); o.value = h.id; o.textContent = h.textContent; lj.appendChild(o); });
  lj.addEventListener('change', () => { const t = document.getElementById(lj.value); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); }

/* ---------- about: wordmark zoom ---------- */
const zm = $('#zm');
if (zm) { const st = $('#zst'), hd = $('.hdr'), W = $('#zw'), MK = $('#zmk'), mob = matchMedia('(max-width:760px)'); let hh = 0;
  const sz = () => { hh = hd ? hd.offsetHeight : 0; st.style.top = hh + 'px'; st.style.height = (innerHeight - hh) + 'px'; };
  const f = () => { if (hd && hd.offsetHeight !== hh) sz(); if (mob.matches) { $('#zen').classList.add('on'); $('#zsh').classList.add('on'); return; }
    const r = zm.getBoundingClientRect(), p = Math.min(Math.max((hh - r.top) / (zm.offsetHeight - st.offsetHeight), 0), 1);
    W.style.transform = `scale(${1 + p * p * p * 40})`; MK.style.opacity = 1 - Math.min(Math.max((p - .45) / .25, 0), 1);
    const on = p > .7; $('#zen').classList.toggle('on', on); $('#zsh').classList.toggle('on', on); };
  sz(); addEventListener('resize', () => { sz(); f(); }); addEventListener('scroll', f, { passive: true }); f(); }
})();
