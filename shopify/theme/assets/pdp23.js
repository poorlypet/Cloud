/* Raqello product page: gallery, add-ons and add to bag */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RQ = window.RQ || {};
const gbp = c => '£' + (c / 100).toFixed(2);
const toast = t => { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2200); };
async function refreshBag(sections) {
  const html = sections && sections['cart-drawer'] ? sections['cart-drawer'] : await (await fetch(location.pathname + '?section_id=cart-drawer')).text();
  const d = new DOMParser().parseFromString(html, 'text/html');
  ['#bagb', '#bagf'].forEach(s => { const a = $(s), b = $(s, d); if (a && b) a.innerHTML = b.innerHTML; });
  const c = await (await fetch(RQ.cartUrl + '.js')).json(); const n = $('#bagn'); if (n) n.textContent = c.item_count;
}

const pf = $('form[data-pform23]');
if (pf) {
  const vjson = $('[data-variants]'); const variants = vjson ? JSON.parse(vjson.textContent) : [];
  const idIn = $('input[name="id"]', pf), atc = $('#atc'), price = $('#ppr'), q = $('#qty');
  const qty = () => +(q ? q.textContent : 1);
  const addons = () => $$('.k23i[aria-pressed="true"]');
  const label = () => { if (atc.disabled) return;
    const tot = (+atc.dataset.price || 0) * qty() + addons().reduce((a, b) => a + +b.dataset.p, 0);
    atc.textContent = `${atc.dataset.lAdd} · ${gbp(tot)}`; };
  const sync = () => {
    const opts = $$('[data-opt]').map(g => { const c = $('input:checked', g); return c ? c.value : null; });
    const v = variants.find(x => x.options.every((o, i) => o === opts[i]));
    $$('[data-opt]').forEach((g, i) => { const lab = $('[data-optv]', g); if (lab) lab.textContent = opts[i] || ''; });
    if (!v) { atc.disabled = true; atc.textContent = atc.dataset.lNa; return; }
    idIn.value = v.id; atc.dataset.price = v.price; atc.disabled = !v.available; atc.textContent = atc.dataset.lSoldout;
    if (price && v.price_html) price.innerHTML = v.price_html;
    label();
    const u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState({}, '', u);
  };
  document.addEventListener('change', e => { if (e.target.closest('[data-opt]')) sync(); });
  document.addEventListener('click', e => {
    const k = e.target.closest('.k23i'); if (k) { k.setAttribute('aria-pressed', k.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); label(); return; }
    const d = e.target.closest('[data-q23]'); if (d && q) { q.textContent = Math.max(1, qty() + +d.dataset.q23); label(); }
  });
  pf.addEventListener('submit', async e => {
    e.preventDefault(); atc.disabled = true;
    const items = [{ id: +idIn.value, quantity: qty() }, ...addons().map(b => ({ id: +b.dataset.addon, quantity: 1 }))];
    try {
      const r = await fetch(RQ.cartAdd + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items, sections: 'cart-drawer' }) });
      const j = await r.json();
      if (!r.ok) { toast(j.description || j.message || 'Sorry, that could not be added'); return; }
      await refreshBag(j.sections);
      addons().forEach(b => b.setAttribute('aria-pressed', 'false'));
      window.RQopen ? window.RQopen('bag') : toast(RQ.added || 'Added to bag');
    } finally { atc.disabled = false; label(); }
  });
}

/* desktop: thumbs swap the main photo */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-g23]'); if (g) { const m = $('#m23'); if (m) { m.removeAttribute('srcset'); m.src = g.dataset.src; } $$('[data-g23]').forEach(b => b.classList.toggle('on', b === g)); return; }
  const t = e.target.closest('[data-mt]'); if (t) { const s = $('#ms23'); s && s.scrollTo({ left: s.clientWidth * +t.dataset.mt, behavior: 'smooth' }); }
});

/* mobile: swipe photos, the bar fills as you go */
const ms = $('#ms23');
if (ms) ms.addEventListener('scroll', () => {
  const max = ms.scrollWidth - ms.clientWidth, n = ms.children.length, k = Math.round(ms.scrollLeft / ms.clientWidth), bar = $('.sb23 i');
  if (bar) bar.style.width = (1 / n + (max ? ms.scrollLeft / max : 0) * (1 - 1 / n)) * 100 + '%';
  $$('[data-mt]').forEach((b, j) => { const was = b.classList.contains('on'); b.classList.toggle('on', j === k);
    if (j === k && !was) { const r = b.parentNode; r.scrollTo({ left: b.offsetLeft - r.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' }); } });
}, { passive: true });

/* more from the brand: show the name on hover */
const fn = $('#fn23');
if (fn) { const def = fn.textContent; $$('.fr23 a').forEach(a => { a.addEventListener('mouseenter', () => fn.textContent = a.classList.contains('me') ? def : a.title); a.addEventListener('mouseleave', () => fn.textContent = def); }); }

/* recommendations: swap in Shopify's picks when it has some, otherwise keep the fallback */
$$('[data-recs23]').forEach(async el => {
  try { const r = await fetch(`${RQ.recsUrl}?section_id=${el.dataset.section}&product_id=${el.dataset.recs23}&limit=${el.dataset.limit || 4}&intent=related`);
    const d = new DOMParser().parseFromString(await r.text(), 'text/html'), n = d.querySelector('[data-recs23]');
    if (n && n.querySelector('.card')) el.innerHTML = n.innerHTML;
    else if (!el.querySelector('.card')) { const s = el.closest('.shopify-section'); if (s) s.hidden = true; } } catch (err) {}
});

/* keep the photo clear of the sticky header */
const hb = () => { const h = $('.hdr'), r = $('.p23'); if (h && r) r.style.setProperty('--hdrh', Math.round(h.getBoundingClientRect().height) + 'px'); };
hb(); addEventListener('resize', hb);
})();
