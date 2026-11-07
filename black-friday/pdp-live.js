/* pdp-live.js: new products are not in the build-time data files (pdpdata, pdpmeta), so their page data is
   built here from the live product and its metafields (snippets/live-meta.liquid). Products that are already in
   those files keep their page data, but their prices are refreshed from the live product so a sale shows. Runs before pdpcore.js. */
(function () {
  'use strict';
  var LP = window.LIVE_PRODUCT, LM = window.LIVE_META;
  if (!LP || !LP.handle) return;
  var h = LP.handle;
  var D = (window.PPD = window.PPD || {}), M = (window.PPM = window.PPM || {});
  var E = (window.PPE = window.PPE || { reviews: {}, dogs: {}, kinds: {} });
  E.real = E.real || {}; E.dogs = E.dogs || {};
  var url = function (u) { return String(u || '').replace(/^\/\//, 'https://'); };
  var pounds = function (c) { return Math.round(Number(c) || 0) / 100; };
  var keep = function (a) { return (a || []).filter(function (x) { return x != null && String(x).trim() !== ''; }); };
  var imgUrl = function (i) { return url(typeof i === 'string' ? i : (i && (i.src || i.url)) || ''); };

  // options, variants, photos and the description
  if (!D[h]) {
    var vs = LP.variants || [];
    var names = (LP.options || []).map(function (o) { return typeof o === 'string' ? o : (o && o.name) || ''; }).filter(Boolean);
    if (!names.length) names = ['Title'];
    var opts = names.map(function (n, i) {
      var seen = [], vals = [];
      vs.forEach(function (v) { var x = v['option' + (i + 1)]; if (x != null && seen.indexOf(x) < 0) { seen.push(x); vals.push(x); } });
      return { n: n, v: vals };
    });
    var imgs = keep((LP.images || []).map(imgUrl));
    if (!imgs.length && LP.featured_image) imgs = [imgUrl(LP.featured_image)];
    D[h] = {
      sec: [['', LP.description || '']], sub: false, opts: opts, imgs: imgs,
      vars: vs.map(function (v) {
        return { t: v.title, o: names.map(function (n, i) { return v['option' + (i + 1)]; }), p: pounds(v.price), c: v.compare_at_price && v.compare_at_price > v.price ? pounds(v.compare_at_price) : null, a: !!v.available, sku: v.sku || '', id: v.id };
      })
    };
  } else if (D[h].vars && LP.variants) {
    // a product that is already in the data files: take its prices and stock from the live product
    D[h].vars.forEach(function (v, i) {
      var lv = null, k, x;
      for (k = 0; k < LP.variants.length && !lv; k++) { x = LP.variants[k]; if (v.id && x.id == v.id) lv = x; }
      for (k = 0; k < LP.variants.length && !lv; k++) { x = LP.variants[k]; if (x.title === v.t) lv = x; }
      if (!lv && LP.variants.length === D[h].vars.length) lv = LP.variants[i];
      if (lv) { v.p = pounds(lv.price); v.c = lv.compare_at_price && lv.compare_at_price > lv.price ? pounds(lv.compare_at_price) : null; v.a = !!lv.available; }
    });
  }

  if (!LM) return;

  // the content blocks (what the metafields are for)
  if (!M[h]) {
    var lh = null;
    if (LM.lh) { var w = String(LM.lh).trim().split(/\s+/); if (w.length > 1) lh = [w.slice(0, -1).join(' '), w[w.length - 1]]; }
    var cat = LM.cat && LM.cat.name && LM.cat.handle ? { name: LM.cat.name, handle: LM.cat.handle, eyebrow: LM.cat.eyebrow || '', description: LM.cat.description || '' } : null;
    M[h] = {
      snippet: LM.snippet || '', label: LM.label || '', badge: LM.badge || '',
      tags: keep(LM.tags), bestFor: keep(LM.bestFor), trust: keep(LM.trust),
      features: (LM.features || []).filter(function (f) { return f && f.t && f.x; }),
      about: LM.about || '', ingredients: LM.ingredients || '', use: LM.use || '', safety: LM.safety || '', delivery: LM.delivery || '',
      faq: (LM.faq || []).filter(function (f) { return f && f.q && f.a; }),
      sizeGuide: null, lifestyleHeading: lh, days: LM.days || null, category: cat, plans: []
    };
  }

  // photos of real dogs and lifestyle photos (videos are added to the page by pdp-live-dom.js)
  var real = (LM.real || []).filter(function (x) { return x && x.t === 'image' && x.u; }).map(function (x) { return url(x.u); });
  if (real.length) E.real[h] = real;
  var life = keep(LM.life).map(url);
  if (life.length && !(E.dogs[h] || []).length) E.dogs[h] = life;
})();
