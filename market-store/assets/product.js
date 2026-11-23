/* pdp-n2.js: product page, version 2. Warm, playful DTC.
   Bright colour blocks from the brand palette, friendly big headings, chunky rounded panels,
   small delights (option pop, live price, points, free delivery meter, kit ticks), and the
   real dogs in their own band. Everything printed comes from pdpcore.js (M) and the store's
   product metafields (M.meta, pdpmeta.js); nothing is typed in.
   Joe's changes, 26 Sept 2026: the gallery is the product's own photos only; the buy box is a
   bordered card led by the metafield snippet; one lime highlight on the page; "Good to know"
   holds every piece of product information (metafield tabs, a real size table, the FAQs),
   who it helps (best for) and the product's overarching category; the kit sits above the
   reviews; Subscribe and save only with the store's real plans; no guarantee; no sticky bar.
   Round two: Subscribe & save mirrors the live site (two stacked radio cards, the plans inside
   the Subscribe & save card), and "Find my size", the fit checker, from the size guide metafield.
   Sections: buy hero, real dogs band, good to know, care kit, owner reviews (only when there
   are some), one recommended row.
   Mobile pass, 27 Sept 2026 (under 900px only; desktop is as it was): the photo with its
   thumbnails under it, the buy area reordered so Add to basket comes fast, the benefit tags as
   one swipe row, "View more" on the snippet and the About text, "Tell me about" as an
   accordion, the reviews as a swipe row, the kit as a 2 by 2 grid. At every width the
   recommended row is the homepage's own "Most popular" section markup (pop-sec). */
PDPCORE.ready(function (M, UI) {
  'use strict';
  var X = M.X, esc = M.esc, money = M.money, P = M.p, $ = X.$, $$ = X.$$, D = M.D;
  var MM = M.meta;                       // the store's metafields for this product, or null
  var root = document.getElementById('pdp');
  if (!root) return;
  document.documentElement.classList.add('n2-page');
  var reduced = !!X.reduced;
  var TICK = '\u2713', STAR = '\u2605';
  // phones and small tablets get their own order and widgets; desktop is untouched
  var MQ = window.matchMedia('(max-width:899px)');

  /* ---------- state -------------------------------------------------------- */
  var SPL = window.PP_BY_HANDLE && window.PP_BY_HANDLE[P.h];
  var PLANS = MM && MM.plans && MM.plans.length ? MM.plans.filter(function (x) { return x && x.option && x.pct > 0; }) : (SPL && SPL.subscription && window.SHOPIFY && window.SHOPIFY.subscriptionPlan ? window.SHOPIFY.subscriptionPlan : []);
  var vi = M.firstVi, qty = 1, sel = M.price(vi).sel.slice(), plan = 'once', pk = 0;
  PLANS.forEach(function (x, k) { if (x.pct > PLANS[pk].pct) pk = k; });
  var pBest = pk;                        // the plan with the lowest price: the Subscribe & save card shows it
  var kitOn = M.kit.slice();

  /* ---------- small helpers ------------------------------------------------ */
  function img(u, n, alt, eager) {
    return '<img src="' + esc(X.sz(u, n)) + '" alt="' + esc(alt || '') + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  function gold(rv, label) {
    return '<span class="n2-st" role="img" aria-label="' + esc(label || ('Rated ' + rv + ' out of 5')) + '">' + X.stars(rv) + '</span>';
  }
  function nf(n) { return Number(n).toLocaleString('en-GB'); }
  function go(el) { if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
  function pop(el) {
    if (!el || reduced) return;
    el.classList.remove('n2-pop'); void el.offsetWidth; el.classList.add('n2-pop');
  }
  // text that shows about three lines on phones, then "View more" (only when it runs longer)
  function clipHTML(html, id) {
    return '<div class="n2-clipw"><div class="n2-clip" id="n2-clip-' + id + '">' + html + '</div>' +
      '<button type="button" class="n2-vm" aria-controls="n2-clip-' + id + '" aria-expanded="false" hidden>View more</button></div>';
  }
  function txt(h) { var d = document.createElement('div'); d.innerHTML = String(h || ''); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function list(a) { return (a || []).map(function (x) { return String(x || '').trim(); }).filter(Boolean); }
  // Joe: no 30 day guarantee anywhere. Store copy that promises one (or a free delivery threshold
  // that disagrees with the store's) is left out, sentence by sentence; everything else is as given
  function clean(html) {
    var bad = function (s) {
      var t = txt(s);
      if (/\b30[\s-]*days?\b|guarantee/i.test(t)) return true;
      var m = /free[^.]*?\bover\s*(?:\u00a3|&pound;)?\s*(\d+)/i.exec(t);
      return !!(m && Number(m[1]) !== Number(M.FREE));
    };
    return String(html || '').replace(/<p>([\s\S]*?)<\/p>/g, function (all, inner) {
      var ss = inner.match(/[^.!?]+(?:[.!?]+|$)\s*/g) || [inner], keep = [];
      ss.forEach(function (s, i) {
        if (bad(s)) return;
        if (/\?\s*$/.test(s) && ss[i + 1] && bad(ss[i + 1])) return;   // a question whose answer went
        keep.push(s);
      });
      var out = keep.join('').trim();
      return out ? '<p>' + out + '</p>' : '';
    });
  }

  // the store title, split on a spaced dash: "Balto Soft" and "Elbow Brace"
  var full = String(P.t), tm = /^(.{3,}?)\s+[-\u2013\u2014]\s+(.+)$/.exec(full);
  var name = tm ? tm[1] : full, desc = tm ? tm[2] : '';

  // the gallery: the product's own images only (the real dogs have their own band)
  var gal = M.imgs.map(function (u) { return { u: u, cut: M.isCut(u) }; });
  var galUrls = gal.map(function (g) { return g.u; });
  var R = M.reviews;
  var revMail = 'mailto:' + M.email + '?subject=' + encodeURIComponent('My review of ' + X.plain(P.t));

  /* ---------- the product's overarching category ----------------------------
     the store's primary category metaobject; else the broad area its conditions sit in */
  var CAT = (function () {
    var c = MM && MM.category;
    if (c && c.name && c.handle) return { eyebrow: c.eyebrow || '', name: c.name, text: c.description || '', href: '/collections/' + c.handle };
    // the area that holds most of this product's conditions (its real Shopify condition collections)
    var mine = window.PPSITE && window.PPSITE.conditionsOf ? window.PPSITE.conditionsOf(P.h) : [];
    var best = null, top = 0;
    X.PP.groups.forEach(function (g) {
      var n = g.items.filter(function (it) { return mine.indexOf(it.s) > -1; }).length;
      if (n > top) { top = n; best = g; }
    });
    if (best) return { eyebrow: 'Part of our range', name: best.area, text: '', href: '/collections/' + best.s, g: best };
    if (M.dept) return { eyebrow: 'Part of our range', name: M.dept.l, text: '', href: '/collections/' + M.dept.s };
    return null;
  })();

  /* ---------- who it helps: the store's "best for", else its benefit tags ------- */
  var bestFor = MM ? list(MM.bestFor) : [], tags = MM ? list(MM.tags) : [], trust = MM ? list(MM.trust) : [];
  var WHO = bestFor.length ? { h: 'Who it helps', items: bestFor }
    : tags.length ? { h: 'What it helps with', items: tags }
    : (!MM && M.points.length ? { h: 'What it helps with', items: M.points } : null);
  // the short lines under the snippet: the benefit tags (or, when those are used above, the trust lines)
  var CHIPS = bestFor.length ? tags : (tags.length ? trust : []);

  /* ========================================================================
     THE BUY HERO
     ======================================================================== */
  function crumbsHTML() {
    var c = M.crumbs.slice(0, -1);
    return '<nav class="n2-crumbs wrap" aria-label="Breadcrumb"><ol>' + c.map(function (x) {
      return '<li><a href="' + esc(x.href) + '">' + esc(x.l) + '</a></li>';
    }).join('') + '</ol></nav>';
  }

  function galHTML() {
    var many = gal.length > 1;
    return '<div class="n2-gal' + (many ? '' : ' n2-one') + '">' +
      (many ? '<div class="n2-thumbs" id="n2-thumbs" role="group" aria-label="Choose a photo">' + gal.map(function (g, i) {
        return '<button type="button" class="n2-th' + (g.cut ? ' n2-cut' : '') + '" data-gi="' + i + '" aria-label="Product photo" aria-pressed="' + (i ? 'false' : 'true') + '">' + img(g.u, 200, '') + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="n2-stage"><div class="n2-track" id="n2-track" tabindex="0" aria-label="Product photos, use the arrow keys to move">' +
      gal.map(function (g, i) {
        return '<button type="button" class="n2-slide' + (g.cut ? ' n2-cut' : '') + '" data-gi="' + i + '" aria-label="Open the photo viewer">' + img(g.u, 1100, name, i === 0) + '</button>';
      }).join('') + '</div>' +
      (many ? '<div class="n2-arrows"><button type="button" class="n2-prev" aria-label="Previous photo">\u2039</button><button type="button" class="n2-next" aria-label="Next photo">\u203a</button></div>' : '') +
      '</div></div>';
  }

  var SIZEHELP = '';
  function optsHTML() {
    return M.opts.filter(function (o) { return !o.hidden; }).map(function (o) {
      if (o.single) return '<div class="n2-opt"><p class="n2-ol"><span>' + esc(o.n) + ': <b>' + esc(o.values[0]) + '</b></span></p></div>';
      var help = '';
      if (o.size) help = sizeTab > -1 ? '<button type="button" class="n2-link" data-n2size>Size guide \u203a</button>'
        : (/brace|splint|harness|sling|wheelchair|collar|shirt|suit|coat|jacket|boot|bed|mattress|crate|carrier|ramp|orthop|recovery|cover|wrap|support/i.test((SPL && SPL.productType) || P.ty || '') ? '<a class="n2-link" href="' + esc(M.ask) + '">Help with sizing \u203a</a>' : '');
      // the fit checker, from the store's size guide metafield
      if (o.size && FIT) help = '<span class="n2-ol-l"><button type="button" class="n2-link" data-n2fit>Find my size \u203a</button>' + help + '</span>';
      if (o.size) SIZEHELP = help;   // Joe: these sit on the row with the kit button, under Add to basket
      return '<div class="n2-opt"><div class="n2-ol"><span id="n2-ol' + o.i + '">' + esc(o.n) + ': <b data-n2sel="' + o.i + '"></b></span></div>' +
        '<div class="n2-vals" role="radiogroup" aria-labelledby="n2-ol' + o.i + '">' + o.values.map(function (v, k) {
          return '<button type="button" class="n2-val" role="radio" aria-checked="false" data-oi="' + o.i + '" data-k="' + k + '"><span>' + esc(v) + '</span><small></small></button>';
        }).join('') + '</div></div>';
    }).join('');
  }

  // Subscribe & save, as the live site does it: two stacked radio cards; choosing Subscribe & save
  // opens the store's own plans (M.meta.plans) inside that card as radio rows, each with its real discount
  function planPrice(k) { return Math.round(D.vars[vi].p * (100 - PLANS[k].pct)) / 100; }
  var DOT = '<span class="n2-dot" aria-hidden="true"></span>';
  function planHTML() {
    if (!PLANS.length) return '';
    return '<div class="n2-bm" role="radiogroup" aria-label="How to buy">' +
      '<div class="n2-bmc on"><button type="button" class="n2-bmb" role="radio" aria-checked="true" data-plan="once">' + DOT +
        '<span class="n2-bm-t">One-time purchase</span><span class="n2-bm-p" id="n2-pl-once"></span><span class="n2-bm-n">Pay once, no commitment</span></button></div>' +
      '<div class="n2-bmc"><button type="button" class="n2-bmb" role="radio" aria-checked="false" tabindex="-1" data-plan="sub"><span class="n2-bm-tag">Save more</span>' + DOT +
        '<span class="n2-bm-t">Subscribe &amp; save</span><span class="n2-bm-p" id="n2-pl-sub"></span><span class="n2-bm-n">Delivered on repeat, cancel anytime</span></button>' +
        '<div class="n2-freq" id="n2-freq" hidden><p class="n2-freq-h" id="n2-fl">Choose your delivery frequency</p>' +
        '<div class="n2-rows" role="radiogroup" aria-labelledby="n2-fl">' + PLANS.map(function (x, k) {
          return '<button type="button" class="n2-fq" role="radio" aria-checked="' + (k === pk ? 'true' : 'false') + '" tabindex="' + (k === pk ? '0' : '-1') + '" data-fq="' + k + '">' + DOT +
            '<span class="n2-fq-t"><b>' + esc(x.option) + '</b><small>' + x.pct + '% off every delivery</small></span><span class="n2-fq-p" data-n2fq="' + k + '"></span></button>';
        }).join('') + '</div>' +
        '<p class="n2-fnote">Skip, pause or cancel any time from your account.</p></div></div>' +
      '</div>';
  }

  function dogLine() {
    if (!M.dogsReal || !M.dogs.length) return '';
    return '<a class="n2-dogline" href="#n2-dogs" data-n2go="n2-dogs"><span class="n2-dstack" aria-hidden="true">' +
      M.dogs.slice(0, 3).map(function (u) { return '<span>' + img(u, 120, '') + '</span>'; }).join('') + '</span><span>See real dogs using it</span></a>';
  }
  // the top step of the real kit ladder (5+ products = 15%)
  var KITMAX = (M.ladder || []).reduce(function (m, r) { return Math.max(m, r[1]); }, 0);
  function buyHTML() {
    var chip = MM && MM.badge ? '<span class="n2-chip">' + esc(MM.badge) + '</span>'
      : (CAT ? '<a class="n2-chip" href="' + esc(CAT.href) + '">' + esc(CAT.name) + '</a>' : '');
    var SP = window.PP_BY_HANDLE && window.PP_BY_HANDLE[P.h];
    var lede = MM && MM.snippet ? MM.snippet : (SP && SP.blurb ? SP.blurb : (M.hwLine || ''));
    var rate = R ? '<a class="n2-rate" href="#reviews" data-n2rev>' + gold(R.avg, 'Rated ' + R.avg.toFixed(1) + ' out of 5') + '<b>' + R.avg.toFixed(1) + '</b><span>' + R.n + (R.n === 1 ? ' review' : ' reviews') + '</span></a>'
      : '<p class="n2-rate n2-rate0" id="reviews"><span>No reviews yet.</span> <a href="' + esc(revMail) + '">Write the first one</a></p>';
    return '<div class="n2-buy">' +
      '<div class="n2-top"><a class="n2-brand" href="/collections/' + esc(X.slug(P.b)) + '">' + esc(P.b) + '</a>' + chip + '</div>' +
      '<h1 class="n2-title"><span class="n2-name">' + esc(name) + '</span>' + (desc ? '<span class="n2-desc">' + esc(desc) + '</span>' : '') + '</h1>' +
      '<div class="n2-meta">' + rate + dogLine() + '</div>' +
      (lede ? '<div class="n2-ledew">' + clipHTML('<p class="n2-lede">' + esc(lede) + '</p>', 'lede') + '</div>' : '') +
      (CHIPS.length ? '<ul class="n2-tags" aria-label="At a glance">' + CHIPS.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="n2-price" aria-live="polite"><span class="n2-now" id="n2-now"></span><s class="n2-was" id="n2-was"></s><span class="n2-save" id="n2-save"></span></div>' +
      planHTML() + optsHTML() +
      '<div class="n2-cta" id="n2-cta"><div class="n2-qty" role="group" aria-label="Quantity"><button type="button" data-n2q="-1" aria-label="One fewer">\u2212</button><output id="n2-q" aria-live="polite">1</output><button type="button" data-n2q="1" aria-label="One more">+</button></div>' +
      '<button class="btn n2-add" id="n2-add" type="button">Add to basket</button></div>' +
      (M.kit.length || SIZEHELP ? '<div class="n2-actrow">' + (M.kit.length ? '<button type="button" class="n2-kitcta" data-n2go="n2-kit"><b>Save up to ' + KITMAX + '%</b> with a care kit \u203a</button>' : '') +
        (SIZEHELP ? '<span class="n2-szlinks">' + SIZEHELP + '</span>' : '') + '</div>' : '') +
      '<div class="n2-perks"><div class="n2-meter" id="n2-meter"></div>' +
      '<button class="n2-club" type="button" id="n2-club"><span class="n2-pp" aria-hidden="true">PP</span><span>Earn <b id="n2-pts"></b> Club points with this</span></button></div>' +
      '</div>';
  }

  /* ========================================================================
     REAL DOGS BAND
     ======================================================================== */
  // true when another product of the same brand shows the very same photos
  var DOGSHARED = (function () {
    var R0 = window.PPE && window.PPE.real, mine0 = R0 && R0[P.h];
    if (!mine0 || !mine0.length) return false;
    return Object.keys(R0).some(function (k) { return k !== P.h && X.PP.products[k] && X.PP.products[k].b === P.b && R0[k] && R0[k][0] === mine0[0]; });
  })();
  function dogsHead() {
    var lh = MM && MM.lifestyleHeading;
    if (lh && lh.length === 2 && String(lh[0]).trim() && String(lh[1]).trim()) {
      var a = String(lh[0]).trim(), b = String(lh[1]).trim();
      return esc(a) + (/[,.:!?]$/.test(a) ? ' ' : ', ') + '<em>' + esc(b) + '</em>';
    }
    return M.dogsReal ? 'Real dogs, real <em>recoveries</em>' : 'See it <em>on a dog</em>';
  }
  // fewer than five photos: repeat them so the row always runs full (taps open the right photo)
  var DOGROW = (function () { var a = M.dogs.slice(); while (a.length && a.length < 10) a = a.concat(M.dogs); return a.slice(0, Math.max(10, M.dogs.length)); })();
  function dogsHTML() {
    if (!M.dogs.length) return '';
    return '<section class="n2-dogs n2-sec wrap" id="n2-dogs" aria-labelledby="n2-dogs-h"><div class="n2-dogs-in">' +
      '<div class="n2-dogs-top"><h2 id="n2-dogs-h">' + dogsHead() + '</h2>' +
      '<p>' + (M.dogsReal ? (DOGSHARED ? 'Photos of real dogs using ' + esc(P.b) + ' products.' : 'Photos of real dogs using the ' + esc(name) + '.') : 'Photos of the ' + esc(name) + ' in use.') + '</p></div>' +
      '<div class="railwrap"><div class="rail n2-dogrow" id="n2dogs" tabindex="0" aria-label="Photos of dogs using it">' +
      DOGROW.map(function (u, i) { return '<button type="button" class="n2-dog" data-di="' + (i % M.dogs.length) + '" aria-label="Open this photo">' + img(u, 600, 'A dog using the ' + name) + '</button>'; }).join('') +
      '</div><div class="scroller" id="n2dogss"><button class="sarr prev" type="button" aria-label="Scroll back"><span>\u2190</span></button>' +
      '<div class="track" id="n2dogst"><i id="n2dogsh"></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>\u2192</span></button></div></div>' +
      '</div></section>';
  }

  /* ========================================================================
     GOOD TO KNOW: every piece of product information, from the metafields
     ======================================================================== */
  /* ---------- the size guide and the fit checker ("Find my size"), both from the store's
     size_guide metafield (M.meta.sizeGuide), as on the live site: measures (a question each),
     columns, sizes with a range per measure, the rule, the tie rule and a weight check ---------- */
  var SG = MM && MM.sizeGuide && (MM.sizeGuide.sizes || []).length ? MM.sizeGuide : null;
  var sgCols = SG ? (SG.columns || []).filter(function (c) { return c && c.key && c.label; }) : [];
  var sgSizes = SG ? SG.sizes.filter(function (s) { return s && s.name; }) : [];
  var FIT = (function () {
    if (!SG || SG.mode === 'guide' || M.sizeIdx < 0) return null;
    var ms = (SG.measure || []).filter(function (m) { return m && m.key && m.q; });
    // the measures the sizes are told apart by; any other (a weight check) is asked but not matched
    var keys = ms.filter(function (m) { return sgSizes.some(function (s) { return s.r && s.r[m.key]; }); }).map(function (m) { return m.key; });
    return keys.length ? { ms: ms, keys: keys } : null;
  })();
  var US = !!(window.PP_MARKET && window.PP_MARKET.code === 'US');   // US store: inches and pounds by default
  var UNIT = US ? 'in' : 'cm';            // the size chart's length unit: cm or in (weights show in kg, or lb in the US)
  var LB = 2.20462;
  function unitOf(key) { var u = 'cm'; ((SG && SG.measure) || []).forEach(function (m) { if (m && m.key === key && m.unit) u = m.unit; }); return u; }
  function n1(v) { return String(Math.round(Number(v) * 10) / 10); }
  function toIn(cm) { return Number(cm) / 2.54; }
  function isKg(key) { return unitOf(key) === 'kg'; }
  function wU() { return US ? 'lb' : 'kg'; }
  function wV(kg) { return US ? Number(kg) * LB : Number(kg); }
  // any "25kg" or "5-10 kg" in a sentence shows in pounds in the US
  function lbText(t) { t = String(t == null ? '' : t); return US ? t.replace(/(\d+(?:\.\d+)?)(\s*(?:-|–|to)\s*)(\d+(?:\.\d+)?)\s*kg\b/gi, function (a, x, d, y) { return Math.round(x * LB) + d + Math.round(y * LB) + ' lb'; }).replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, function (a, x) { return Math.round(x * LB) + ' lb'; }) : t; }
  function fv(v, key, u) { return unitOf(key) === 'cm' && u === 'in' ? n1(toIn(v)) + 'in' : isKg(key) ? n1(wV(v)) + wU() : n1(v) + unitOf(key); }
  function fr(r, key, u) { return unitOf(key) === 'cm' && u === 'in' ? n1(toIn(r[0])) + ' to ' + n1(toIn(r[1])) + 'in' : isKg(key) ? n1(wV(r[0])) + ' to ' + n1(wV(r[1])) + wU() : n1(r[0]) + ' to ' + n1(r[1]) + unitOf(key); }
  // a text cell that is a cm range ("21-36 cm") converts too
  function ftxt(t, u) {
    var m = /^\s*(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*cm\s*$/i.exec(String(t || ''));
    return m ? fr([Number(m[1]), Number(m[2])], '', u) : lbText(t || '');
  }
  function cellText(s, c, u) { var r = s.r && s.r[c.key]; return r && r.length === 2 ? fr(r, c.key, u) : ftxt(s.c && s.c[c.key], u); }
  function fitMail(lines) {
    return 'mailto:' + M.email + '?subject=' + encodeURIComponent('Sizing for the ' + X.plain(P.t)) + (lines && lines.length ? '&body=' + encodeURIComponent(lines.join('\n')) : '');
  }
  // which size: the one that fits every measure; when several do, the store's tie rule ("up": the
  // larger, "centre": the one whose middle is closest); when none does, the one fitting the most
  function fitSize(ans) {
    var keys = FIT.keys;
    var rows = sgSizes.map(function (s, i) {
      var x = { s: s, i: i, fit: 0, off: [], dist: 0, mid: 0 };
      keys.forEach(function (k) {
        var r = s.r && s.r[k], v = ans[k];
        if (!r || r.length !== 2) { x.fit += 1; return; }
        var half = Math.max((r[1] - r[0]) / 2, 0.01);
        if (v >= r[0] && v <= r[1]) x.fit += 1; else { x.off.push(k); x.dist += (v < r[0] ? r[0] - v : v - r[1]) / half; }
        x.mid += Math.abs(v - (r[0] + r[1]) / 2) / half;
      });
      return x;
    });
    var tie = function (a, b) { return SG.tie === 'centre' ? a.mid - b.mid : SG.tie === 'down' ? a.i - b.i : b.i - a.i; };
    var all = rows.filter(function (x) { return x.fit === keys.length; }).sort(tie);
    if (all.length) return { size: all[0].s, also: all.slice(1).map(function (x) { return x.s; }), off: [] };
    var part = rows.filter(function (x) { return x.fit > 0; }).sort(function (a, b) { return (b.fit - a.fit) || (a.dist - b.dist) || tie(a, b); });
    return part.length ? { size: part[0].s, also: [], off: part[0].off } : { size: null, also: [], off: keys.slice() };
  }
  function weightKey() { var k = null; (FIT ? FIT.ms : []).forEach(function (m) { if (!k && (unitOf(m.key) === 'kg' || m.key === 'weight')) k = m.key; }); return k; }
  // the whole decision for a set of answers (each in cm, or kg for weight): used by the modal
  function fitResult(ans) {
    var wc = SG.weightCheck, wk = weightKey(), w = wk ? ans[wk] : null;
    if (wc && w != null && (w < Number(wc.min) || w > Number(wc.max))) return { kind: 'weight', w: w, wk: wk };
    var r = fitSize(ans);
    if (!r.size) return { kind: 'none', off: r.off };
    return { kind: r.off.length ? 'part' : 'fit', size: r.size, also: r.also, off: r.off };
  }
  function sizeTable(sg) {
    if (!sgCols.length || !sgSizes.length) return '';
    var meas = (sg.measure || []).filter(function (m) { return m && m.label && (m.step || m.help); });
    var hasLen = sgCols.some(function (c) {
      return sgSizes.some(function (s) { return cellText(s, c, 'in') !== cellText(s, c, 'cm'); });
    });
    var qn = ['', 'One quick question', 'Two quick questions', 'Three quick questions', 'Four quick questions'][FIT ? FIT.ms.length : 0] || 'A few quick questions';
    return '<h3 class="n2-fith">Getting the fit right</h3>' + (sg.intro ? '<p>' + esc(lbText(sg.intro)) + '</p>' : '') +
      (FIT ? '<div class="n2-fitcta"><div><b>Not sure which size?</b><span>' + qn + ' and we’ll tell you which size, and why.</span></div>' +
        '<button type="button" class="btn" data-n2fit>Find my size</button></div>' : '') +
      (meas.length ? '<h3>How to measure</h3><ul class="n2-how">' + meas.map(function (m) {
        return '<li><b>' + esc(m.label) + '</b><span>' + esc(m.step || m.help) + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<div class="n2-sghead"><h3>Size chart</h3>' + (hasLen ? '<div class="n2-units" role="group" aria-label="Show the sizes in">' +
        '<button type="button" data-n2u="cm" aria-pressed="' + (UNIT === 'cm') + '">cm</button><button type="button" data-n2u="in" aria-pressed="' + (UNIT === 'in') + '">inches</button></div>' : '') + '</div>' +
      '<table class="n2-sg"><thead><tr><th scope="col">Size</th>' + sgCols.map(function (c) { return '<th scope="col">' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      sgSizes.map(function (s, si) {
        return '<tr class="n2-sgr" data-sz="' + esc(String(s.name).toLowerCase()) + '"><th scope="row"><span>' + esc(s.name) + '</span></th>' +
          sgCols.map(function (c, ci) { return '<td data-l="' + esc(c.label) + '" data-n2c="' + ci + '" data-n2s="' + si + '">' + esc(cellText(s, c, UNIT)) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>' +
      (sg.rule ? '<p class="n2-note">' + esc(lbText(sg.rule)) + '</p>' : '') +
      '<p class="n2-note">' + (sg.supplier ? 'Measurements from ' + esc(sg.supplier) + '. ' : '') + 'Between sizes or unsure? <a href="' + esc(fitMail()) + '">Get in touch</a>.</p>';
  }
  function faqPanel(qs) {
    return '<div class="n2-qs">' + qs.map(function (f, i) {
      return '<details class="n2-q"' + (i ? '' : ' open') + '><summary><span>' + esc(f.q) + '</span><i aria-hidden="true"></i></summary><div class="n2-a">' + f.a + '</div></details>';
    }).join('') + '</div>' +
      '<div class="n2-askrow"><a class="btn sec n2-askb" href="' + esc(M.ask) + '">Ask a question</a><span>' + esc(M.reply) + '.</span></div>' +
      '<p class="n2-legal">' + esc(M.legal) + '</p>';
  }

  var TABS = [];
  (function () {
    var has = function (h) { return !!txt(h); };
    if (MM) {
      var consumable = /supplement|chew|powder|food|treat|oil|tablet|capsule|balm|shampoo|spray|paste|drops|wash|cream|gel|probiotic|topper/i.test(String(P.ty || '') + ' ' + P.t);
      var made = String(MM.ingredients || '');
      if (!consumable) made = made.replace(/^<p>\s*not applicable\.?\s*/i, '<p>');
      // about this product, with the store's four key features under it
      var about = has(MM.about) && txt(MM.about) !== txt(MM.snippet) ? MM.about : '';
      var feats = (MM.features || []).filter(function (f) { return f && f.t; });
      var fh = feats.length ? '<div class="n2-fcs">' + feats.map(function (f) {
        return '<div class="n2-fc"><b>' + esc(f.t) + '</b>' + (f.x ? '<p>' + esc(f.x) + '</p>' : '') + '</div>';
      }).join('') + '</div>' : '';
      if (about || fh) TABS.push({ k: 'about', label: about ? 'About' : 'Key features', html: (about ? clipHTML(about, 'about') : '') + (about && fh ? '<h3>Key features</h3>' : '') + fh });
      var sg = MM.sizeGuide ? sizeTable(MM.sizeGuide) : '';
      if (sg) TABS.push({ k: 'size', label: 'Size guide', html: sg, meta: true });
      else M.tabs.forEach(function (t) { if (t.k === 'size') TABS.push({ k: 'size', label: 'Size guide', html: t.html }); });
      if (has(MM.use)) TABS.push({ k: 'use', label: 'How to use', html: MM.use });
      if (has(made)) TABS.push({ k: 'made', label: consumable ? 'Ingredients' : 'What it\u2019s made of', html: made });
      if (has(MM.safety)) TABS.push({ k: 'safety', label: 'Safety and storage', html: MM.safety });
      var dl = clean(MM.delivery);
      if (!has(dl)) M.tabs.forEach(function (t) { if (t.k === 'delivery') dl = t.html; });
      if (has(dl)) TABS.push({ k: 'delivery', label: 'Delivery and returns', html: dl });
      var qs = (MM.faq || []).filter(function (f) { return f && f.q && f.a; });
      if (!qs.length) qs = M.faq;
      if (qs.length) TABS.push({ k: 'faq', label: 'FAQs', html: faqPanel(qs) });
    } else {
      // no metafields for this product: the "Tell me about" tabs from its own description
      M.tabs.forEach(function (t, i) {
        var h0 = t.k === 'delivery' ? clean(t.html) || t.html : t.html;
        // the opening overview reads as the About text: long ones get "View more" on phones
        if (i === 0 && t.k === 'overview') h0 = clipHTML(h0, 'about');
        TABS.push({ k: t.k, label: t.k === 'delivery' ? 'Delivery and returns' : t.label, html: h0 });
      });
      if (M.faq.length) TABS.push({ k: 'faq', label: 'FAQs', html: faqPanel(M.faq) });
    }
  })();
  var sizeTab = -1, faqTab = -1;
  TABS.forEach(function (t, i) { if (t.k === 'size' && sizeTab < 0) sizeTab = i; if (t.k === 'faq') faqTab = i; });

  function sideHTML() {
    var who = WHO ? '<div class="n2-who"><h3>' + esc(WHO.h) + '</h3><ul class="n2-ticks">' + WHO.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '';
    var cat = CAT ? '<a class="n2-cat" href="' + esc(CAT.href) + '">' + (CAT.eyebrow ? '<small>' + esc(CAT.eyebrow) + '</small>' : '') +
      '<b>' + esc(CAT.name) + '</b>' + (CAT.text ? '<span>' + esc(CAT.text) + '</span>' : '') +
      '<i>Shop ' + esc(X.lc(CAT.name)) + ' \u203a</i></a>' : '';
    return who || cat ? '<aside class="n2-side" aria-label="Who it helps and where it sits">' + who + cat + '</aside>' : '';
  }
  function infoHTML() {
    var side = sideHTML();
    if (!TABS.length && !side) return '';
    return '<section class="n2-info n2-sec wrap" id="n2-info" aria-labelledby="n2-info-h">' +
      '<div class="n2-h"><h2 id="n2-info-h">Good to <em class="n2-hl">know</em></h2></div>' +
      '<div class="n2-info-grid' + (side && TABS.length ? '' : ' n2-solo') + '">' +
      (TABS.length ? '<div class="n2-tabs">' +
        '<div class="n2-tabbar"><span class="n2-tabl" id="n2-tabl">Tell me about:</span><div class="n2-tablist" role="tablist" aria-labelledby="n2-tabl" data-n="' + TABS.length + '">' +
        TABS.map(function (t, i) { return '<button type="button" class="n2-tab" role="tab" id="n2-tab' + i + '" aria-controls="n2-pan' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '">' + esc(t.label) + '</button>'; }).join('') +
        '</div></div>' +
        // each panel has its accordion row in front of it: phones show the rows, desktop the tabs
        '<div class="n2-panels">' + TABS.map(function (t, i) {
          return '<h3 class="n2-acch"><button type="button" class="n2-acc" id="n2-acc' + i + '" aria-controls="n2-pan' + i + '" aria-expanded="false"><span>' + esc(t.label) + '</span><i aria-hidden="true"></i></button></h3>' +
            '<div class="n2-panel n2-p-' + t.k + '" role="tabpanel" id="n2-pan' + i + '" aria-labelledby="n2-tab' + i + '" tabindex="0"' + (i ? ' hidden' : '') + '>' + t.html + '</div>';
        }).join('') + '</div>' +
        '</div>' : '') +
      side + '</div></section>';
  }

  /* ========================================================================
     OWNER REVIEWS (Judge.me, this product only; the whole section only when there are some)
     ======================================================================== */
  var RL = [], FEAT = null, rFilter = 0, rAll = false;
  if (R) {
    var seen = {};
    RL = R.list.filter(function (x) {
      var k = (String(x.title || '') + '|' + String(x.body || '')).toLowerCase().replace(/\s+/g, ' ').trim();
      if (!String(x.body || '').trim() && !String(x.title || '').trim()) return false;
      if (seen[k]) return false; seen[k] = 1; return true;
    });
    // the pull quote: a five star review short enough to read in one breath, the fullest such one
    RL.forEach(function (x) {
      var n = String(x.body || '').length;
      if (x.r === 5 && n >= 50 && n <= 170 && (!FEAT || n > FEAT.body.length)) FEAT = x;
    });
    if (!FEAT) RL.forEach(function (x) {
      var n = String(x.body || '').length;
      if (x.r >= 4 && n >= 20 && n <= 260 && (!FEAT || x.r > FEAT.r || (x.r === FEAT.r && n > FEAT.body.length))) FEAT = x;
    });
  }
  function initial(nm) { var c = String(nm || '').trim().charAt(0).toUpperCase(); return /[A-Z0-9]/.test(c) ? c : '?'; }
  function revCard(x, k) {
    return '<article class="n2-rc">' +
      '<div class="n2-rc-top">' + gold(x.r) + (x.date ? '<span class="n2-rc-d">' + esc(x.date) + '</span>' : '') + '</div>' +
      (x.title ? '<h3 class="n2-rc-t">' + esc(x.title) + '</h3>' : '') +
      (x.body ? '<div class="n2-rc-bw"><p class="n2-rc-b" data-clamp>' + esc(x.body) + '</p><button type="button" class="n2-rvm" hidden>View more</button></div>' : '') +
      '<div class="n2-rc-who"><span class="n2-ini n2-ini' + (k % 3) + '" aria-hidden="true">' + esc(initial(x.name)) + '</span><span class="n2-rc-n"><b>' + esc(x.name) + '</b>' +
      (x.verified ? '<span class="n2-ver">' + TICK + ' Verified buyer</span>' : '') + (x.variant ? '<span class="n2-rc-v">' + esc(x.variant) + '</span>' : '') + '</span></div></article>';
  }
  function revHTML() {
    if (!R || !RL.length) return '';
    var hist = R.hist.map(function (h) {
      return '<button type="button" class="n2-hrow" data-star="' + h.s + '" aria-pressed="false"' + (h.n ? '' : ' disabled') + ' aria-label="Show ' + h.s + ' star reviews">' +
        '<span class="n2-hs">' + h.s + ' ' + STAR + '</span><span class="n2-hb"><i style="--w:' + h.pct + '%"></i></span><span class="n2-hn">' + h.n + '</span></button>';
    }).join('');
    return '<section class="n2-revs n2-sec wrap" id="reviews" aria-labelledby="n2-rev-h">' +
      '<div class="n2-h"><h2 id="n2-rev-h">What owners <em>say</em></h2><p>Reviews of this product, collected by Judge.me.</p></div>' +
      '<div class="n2-rband' + (FEAT ? '' : ' n2-nofeat') + '"><div class="n2-rsum">' +
      '<div class="n2-rtop"><b class="n2-ravg">' + R.avg.toFixed(1) + '</b><span class="n2-rof">' + gold(R.avg, 'Rated ' + R.avg.toFixed(1) + ' out of 5') + '<span>from ' + R.n + (R.n === 1 ? ' review' : ' reviews') + '</span></span></div>' +
      '<div class="n2-hist" role="group" aria-label="Filter the reviews by stars">' + hist + '</div>' +
      '<div class="n2-rcta"><a class="btn n2-wr" href="' + esc(revMail) + '" data-ppwr>Write a review</a>' +
      (M.revPoints ? '<p class="n2-rpts"><span class="n2-pp" aria-hidden="true">PP</span>Earn ' + esc(M.revPoints) + ' Club points for a verified review</p>' : '') + '</div>' +
      '</div>' +
      (FEAT ? '<figure class="n2-feat"><div class="n2-feat-s">' + gold(FEAT.r) + '</div><blockquote>\u201c' + esc(FEAT.body) + '\u201d</blockquote>' +
        '<figcaption><b>' + esc(FEAT.name) + '</b>' + (FEAT.date ? '<span>' + esc(FEAT.date) + '</span>' : '') + '</figcaption></figure>' : '') +
      '</div>' +
      '<div class="n2-rstat" id="n2-rstat" hidden></div><div class="n2-rlist" id="n2-rlist"></div>' +
      '<div class="n2-rmore"><button type="button" class="n2-ghost" id="n2-rmore" hidden>Show more reviews</button></div>' +
      '</section>';
  }
  function renderReviews() {
    var box = $('#n2-rlist'); if (!box) return;
    var list = rFilter ? RL.filter(function (x) { return x.r === rFilter; }) : RL.filter(function (x) { return x !== FEAT; });
    // phones: every review in one swipe row, so no "Show more"
    var show = rFilter || rAll || MQ.matches ? list : list.slice(0, 6);
    box.innerHTML = show.map(revCard).join('');
    box.scrollLeft = 0;
    box.classList.toggle('n2-single', show.length < 2);
    box.classList.toggle('n2-two', show.length === 2);
    box.hidden = !show.length;
    var more = $('#n2-rmore');
    more.hidden = show.length >= list.length;
    var st = $('#n2-rstat');
    st.hidden = !rFilter;
    if (rFilter) st.innerHTML = '<span>Showing ' + rFilter + ' star reviews</span><button type="button" class="n2-link" id="n2-rclear">Show all reviews</button>';
    $$('.n2-hrow').forEach(function (b) { b.setAttribute('aria-pressed', Number(b.getAttribute('data-star')) === rFilter ? 'true' : 'false'); });
    clampReviews();
  }
  // phones: each review card shows five lines at most, then "View more"
  function clampReviews() {
    $$('#n2-rlist .n2-rc-bw').forEach(function (w) {
      var b = $('.n2-rc-b', w), btn = $('.n2-rvm', w);
      b.classList.remove('n2-rshut');
      if (!MQ.matches || w.getAttribute('data-open') === '1') { btn.hidden = !(MQ.matches && w.getAttribute('data-open') === '1'); btn.textContent = 'View less'; return; }
      var lh = parseFloat(getComputedStyle(b).lineHeight) || 24;
      if (b.scrollHeight > lh * 5 + 4) { b.classList.add('n2-rshut'); btn.hidden = false; btn.textContent = 'View more'; } else btn.hidden = true;
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.n2-rvm'); if (!btn) return;
    var w = btn.parentNode; w.setAttribute('data-open', w.getAttribute('data-open') === '1' ? '0' : '1'); clampReviews();
  });

  /* ========================================================================
     CARE KIT: this product plus its real companions, with the real ladder
     ======================================================================== */
  // the full store title; the part after a spaced dash is left off the small phone cards
  function kitName(t) {
    var m = /^(.{3,}?)(\s+[-\u2013\u2014]\s+.+)$/.exec(String(t));
    return m ? esc(m[1]) + '<span class="n2-kc-x">' + esc(m[2]) + '</span>' : esc(t);
  }
  function kitCard(h, me) {
    var p = X.prod(h), url = X.purl(h);
    return '<article class="n2-kc' + (me ? ' n2-kc-me on' : (kitOn.indexOf(h) > -1 ? ' on' : '')) + '"' + (me ? '' : ' data-kh="' + esc(h) + '"') + '>' +
      (me ? '<span class="n2-kc-img">' + img(p.img, 400, '') + '</span>' : '<a class="n2-kc-img" href="' + esc(url) + '" tabindex="-1" aria-hidden="true">' + img(p.img, 400, '') + '</a>') +
      '<div class="n2-kc-b"><span class="n2-kc-br">' + esc(p.b) + '</span>' +
      (me ? '<span class="n2-kc-n" data-clamp>' + kitName(p.t) + '</span>' : '<a class="n2-kc-n" data-clamp href="' + esc(url) + '">' + kitName(p.t) + '</a>') +
      '<span class="n2-kc-p"' + (me ? ' id="n2-kc-me"' : '') + '>' + money(me ? D.vars[vi].p : p.p) + '</span></div>' +
      (me ? '<span class="n2-kc-t n2-kc-this">This one ' + TICK + '</span>'
        : '<button type="button" class="n2-kc-t" aria-pressed="' + (kitOn.indexOf(h) > -1 ? 'true' : 'false') + '"></button>') +
      '</article>';
  }
  function kitHTML() {
    if (!M.kit.length) return '';
    return '<section class="n2-kit n2-sec wrap" id="n2-kit" aria-labelledby="n2-kit-h"><div class="n2-kit-in">' +
      '<div class="n2-h"><h2 id="n2-kit-h">Make it a <em>care kit</em></h2><p>' + esc(M.kitLine) + '</p></div>' +
      '<div class="n2-kit-grid"><div class="n2-kit-row" id="n2-kitrow">' + kitCard(M.h, true) + M.kit.map(function (h) { return kitCard(h, false); }).join('') + '</div>' +
      '<div class="n2-kt" id="n2-kt" aria-live="polite"></div></div>' +
      '</div></section>';
  }
  function renderKit() {
    var box = $('#n2-kt'); if (!box) return;
    var t = M.kitTotals(vi, kitOn);
    $$('.n2-kc[data-kh]').forEach(function (c) {
      var on = kitOn.indexOf(c.getAttribute('data-kh')) > -1;
      c.classList.toggle('on', on);
      var b = $('.n2-kc-t', c); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? 'In your kit ' + TICK : 'Add to kit +';
    });
    var me = $('#n2-kc-me'); if (me) me.textContent = money(D.vars[vi].p);
    box.innerHTML = '<span class="n2-kt-l">' + (t.n === 1 ? 'Just this one' : esc(t.word) + ' in your kit') + '</span>' +
      '<span class="n2-kt-p"><b>' + money(t.pay) + '</b>' + (t.off > 0 ? '<s>' + money(t.total) + '</s>' : '') + '</span>' +
      (t.pct ? '<span class="n2-kt-off">Kit discount ' + t.pct + '%, you save ' + money(t.off) + '</span>' : '') +
      '<span class="n2-kt-next">' + esc(t.next) + '.</span>' +
      '<button type="button" class="btn n2-kt-add" id="n2-kt-add"' + (D.vars[vi].a ? '' : ' disabled') + '>' + esc(t.button) + '</button>';
  }

  /* ========================================================================
     ONE ROW OF RECOMMENDED PRODUCTS, the homepage card and scroller
     ======================================================================== */
  // a row led by one condition becomes a row for the product's broad area (Joe: not specific conditions)
  function areaRail() {
    var r = M.rails[0];
    if (!r || r.lead !== 'Recommended for' || !CAT || !CAT.g) return r;
    var pool = [], seen2 = {};
    CAT.g.items.forEach(function (it) { (it.prods || []).forEach(function (x) { if (!seen2[x]) { seen2[x] = 1; pool.push(x); } }); });
    pool = pool.filter(function (x) { return x !== M.h && X.prod(x) && !/-bundle$/.test(x); })
      .sort(function (a, b) { var A = X.prod(a), B = X.prod(b); return (A.rk - B.rk) || (B.rc - A.rc); });
    var noKit = pool.filter(function (x) { return M.kit.indexOf(x) < 0; });
    if (noKit.length >= 4) pool = noKit;
    if (pool.length < 4) return r;
    return { lead: 'More in', em: CAT.name, all: { href: CAT.href, l: 'Shop ' + X.lc(CAT.name) }, items: pool.slice(0, 12) };
  }
  // Joe: the same cards across the site. The row is built with the homepage's own "Most popular
  // with pet parents" section markup and classes (home.html pop-sec), outside the .n2 wrapper so
  // no n2 styles reach it
  function railHTML() {
    var r = areaRail();
    if (!r || !r.items.length) return '';
    return '<section class="pop-sec" aria-labelledby="rec-h"><div class="wrap">' +
      '<div class="sec-h"><div><h2 id="rec-h">' + esc(r.lead) + ' <em>' + esc(r.em) + '</em></h2></div>' +
      '<div class="sec-r"><a class="all" href="' + esc(r.all.href) + '">' + esc(r.all.l) + ' \u203a</a></div></div>' +
      UI.railHTML(r.items, 'recrail') + '</div></section>';
  }

  /* ---------- draw ---------------------------------------------------------- */
  var recHTML = railHTML();
  root.innerHTML = '<div class="n2' + (recHTML ? ' n2-hasrec' : '') + '">' + crumbsHTML() +
    '<section class="n2-hero wrap" aria-label="' + esc(name) + '">' + galHTML() + buyHTML() + '</section>' +
    dogsHTML() + infoHTML() + kitHTML() + revHTML() + '</div>' + recHTML;

  /* ========================================================================
     BEHAVIOUR
     ======================================================================== */
  // ----- the gallery: one track; thumbs and arrows on desktop, a peeking swipe on phones
  var track = $('#n2-track'), slides = $$('.n2-slide', track), gi = 0;
  function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
  function setGi(i) {
    gi = i;
    $$('.n2-th').forEach(function (t, k) {
      var on = k === i; t.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) {
        var box = $('#n2-thumbs');
        if (box && MQ.matches) {
          // phones: the thumbnails are a row under the photo; keep the lit one in view
          var br = box.getBoundingClientRect(), tr = t.getBoundingClientRect(), pad = parseFloat(getComputedStyle(box).paddingLeft) || 0;
          if (tr.left < br.left + pad || tr.right > br.right - pad) box.scrollTo({ left: box.scrollLeft + tr.left - br.left - pad, behavior: reduced ? 'auto' : 'smooth' });
        } else if (box && box.scrollHeight > box.clientHeight) { var top = t.offsetTop - box.offsetTop; if (top < box.scrollTop || top + t.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top - 12; }
      }
    });
    var pv = $('.n2-prev'), nx = $('.n2-next');
    if (pv) pv.disabled = i <= 0; if (nx) nx.disabled = i >= slides.length - 1;
  }
  var aim = -1, aimT = 0;
  function goSlide(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    aim = reduced ? -1 : i; clearTimeout(aimT); aimT = setTimeout(function () { aim = -1; }, 1000);
    track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    setGi(i);
  }
  var graf = 0;
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(graf);
    graf = requestAnimationFrame(function () {
      var i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / Math.max(1, step()))));
      if (aim > -1) { if (i === aim) aim = -1; return; }   // a thumb or arrow is moving it: let it land
      if (i !== gi) setGi(i);
    });
  }, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(gi + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(gi - 1); }
  });
  track.addEventListener('click', function (e) { var s = e.target.closest('.n2-slide'); if (s) UI.lightbox(galUrls, Number(s.getAttribute('data-gi')), name); });
  $$('.n2-th').forEach(function (t) { t.addEventListener('click', function () { goSlide(Number(t.getAttribute('data-gi'))); }); });
  if ($('.n2-prev')) { $('.n2-prev').addEventListener('click', function () { goSlide(gi - 1); }); $('.n2-next').addEventListener('click', function () { goSlide(gi + 1); }); }
  setGi(0);

  // ----- options, price, quantity, perks: one update draws every live number on the page
  function update(changed) {
    var pr = M.price(vi);
    sel = pr.sel.slice();
    var subOn = PLANS.length > 0 && plan === 'sub';
    var now = $('#n2-now'), was = $('#n2-was'), save = $('#n2-save');
    // the price above the cards follows the choice: the chosen plan's price while subscribing
    now.textContent = money(subOn ? planPrice(pk) : pr.now);
    was.textContent = pr.was ? money(pr.was) : ''; was.hidden = subOn || !pr.was;
    save.textContent = pr.save ? 'Save ' + money(pr.save) : ''; save.hidden = subOn || !pr.save;
    if (changed) pop(now);
    // the store's subscription plans: each with its real discount and price
    if (PLANS.length) {
      $('#n2-pl-once').textContent = money(pr.now);
      $('#n2-pl-sub').textContent = money(planPrice(pBest));
      PLANS.forEach(function (x, k) { var s = $('[data-n2fq="' + k + '"]'); if (s) s.textContent = money(planPrice(k)); });
    }
    // every option button: chosen, possible with the other choices, and its own price when prices differ
    M.opts.forEach(function (o) {
      if (o.hidden || o.single) return;
      var b = $('[data-n2sel="' + o.i + '"]'); if (b) b.textContent = sel[o.i] || '';
      var prices = o.values.map(function (v) { var j = M.pick(sel, o.i, v); return j < 0 ? null : D.vars[j].p; });
      var differ = prices.filter(function (x, k) { return x != null && prices.indexOf(x) === k; }).length > 1;
      $$('.n2-val[data-oi="' + o.i + '"]').forEach(function (btn) {
        var k = Number(btn.getAttribute('data-k')), v = o.values[k], on = sel[o.i] === v;
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
        btn.classList.toggle('n2-na', !on && !M.possible(o.i, v, sel));
        btn.disabled = prices[k] == null;
        $('small', btn).textContent = differ && prices[k] != null ? money(prices[k]) : '';
        btn.classList.toggle('n2-hasp', differ);
      });
    });
    var add = $('#n2-add');
    add.disabled = !pr.available;
    if (!add.classList.contains('n2-done')) add.textContent = pr.available ? addLabel() : 'Not available in this choice';
    $('#n2-q').textContent = qty;
    // free delivery meter
    var left = M.freeLeft(vi, qty), meter = $('#n2-meter');
    var pct = Math.max(4, Math.min(100, Math.round((pr.now * qty) / M.FREE * 100)));
    meter.className = 'n2-meter' + (left > 0 ? '' : ' n2-free');
    meter.innerHTML = left > 0
      ? '<span class="n2-mt"><b>' + money(left) + '</b> away from free UK delivery</span><span class="n2-mb" aria-hidden="true"><i style="width:' + pct + '%"></i></span>'
      : '<span class="n2-mtick" aria-hidden="true">' + TICK + '</span><span class="n2-mt"><b>Free UK delivery</b> on this order</span>';
    var pts = $('#n2-pts'); pts.textContent = nf(M.pointsFor(vi, qty)); if (changed) pop($('#n2-club .n2-pp'));
    // the size guide follows the chosen size
    if (M.sizeIdx > -1) {
      var cur = String(sel[M.sizeIdx] || '').toLowerCase();
      $$('.n2-szb,.n2-sgr').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-sz') === cur); });
    }
    renderKit();
    document.dispatchEvent(new Event('n2:update'));
    if (changed) document.dispatchEvent(new CustomEvent('n2:variant', { detail: { id: D.vars[vi].id, title: D.vars[vi].t } }));
  }

  $$('.n2-val[data-oi]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = Number(btn.getAttribute('data-oi')), v = M.opts[i].values[Number(btn.getAttribute('data-k'))];
      var j = M.pick(sel, i, v); if (j < 0) return;
      vi = j; update(true); pop(btn);
    });
  });
  // arrow keys move through a radio group
  $$('.n2-vals').forEach(function (g) {
    g.addEventListener('keydown', function (e) {
      if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
      var bs = $$('.n2-val', g).filter(function (b) { return !b.disabled; }), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); var n = bs[(i + (/Right|Down/.test(e.key) ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
  });
  $$('[data-n2q]').forEach(function (b) {
    b.addEventListener('click', function () { qty = Math.max(1, Math.min(99, qty + Number(b.getAttribute('data-n2q')))); update(true); });
  });
  // one-time purchase or Subscribe & save; the plans open inside the Subscribe & save card
  function radioKeys(g, cls) {
    if (!g) return;
    g.addEventListener('keydown', function (e) {
      if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
      var bs = $$(cls, g), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); e.stopPropagation();
      var n = bs[(i + (/Right|Down/.test(e.key) ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
  }
  $$('.n2-bmb').forEach(function (b) {
    b.addEventListener('click', function () {
      var was = plan; plan = b.getAttribute('data-plan');
      $$('.n2-bmb').forEach(function (x) {
        var on = x === b; x.setAttribute('aria-checked', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; x.parentNode.classList.toggle('on', on);
      });
      var fr = $('#n2-freq'); fr.hidden = plan !== 'sub';
      if (plan === 'sub' && was !== 'sub') pop(fr);
      update(plan !== was);
    });
  });
  $$('.n2-fq').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = Number(b.getAttribute('data-fq')), changed = k !== pk; pk = k;
      $$('.n2-fq').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
      update(changed);
    });
  });
  radioKeys($('.n2-bm'), '.n2-bmb');
  radioKeys($('.n2-rows'), '.n2-fq');

  // the button reads "Subscribe & save" while a plan is chosen; it still adds this variant
  function addLabel() { return PLANS.length && plan === 'sub' ? 'Subscribe & save' : 'Add to basket'; }
  function added(btn) {
    btn.classList.add('n2-done'); btn.textContent = 'Added ' + TICK;
    setTimeout(function () { btn.classList.remove('n2-done'); btn.textContent = addLabel(); update(false); }, 1800);
  }
  $('#n2-add').addEventListener('click', function () { if (M.add(vi, qty, (PLANS.length && plan === 'sub' && PLANS[pk]) ? PLANS[pk].option : null)) added(this); });
  $('#n2-club').addEventListener('click', function () { X.openDrawer('clubdrawer'); });

  // ----- good to know: the tabs (up and down arrows too, the list stands upright on desktop)
  var showTab = null, tl = $('.n2-tablist'), curTab = 0;
  if (tl) {
    showTab = UI.tabs(tl, function (i) { curTab = i; var p = $('#n2-pan' + i); if (p && !reduced && !MQ.matches) pop(p); });
    tl.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var bs = $$('[role="tab"]', tl), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); showTab((i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length, true);
    });
  }
  // phones: "Tell me about" is an accordion, one row per section, the first one open. The same
  // panels serve both; the roles follow the layout (tab panels on desktop, regions on phones)
  // Joe: on phones the accordion starts with every section closed
  var accOpen = TABS.map(function () { return false; });
  function setAcc(i, open) {
    var p = $('#n2-pan' + i), b = $('#n2-acc' + i); if (!p || !b) return;
    accOpen[i] = open; p.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { measureClips(); if (!reduced) pop(p); }
  }
  function accMode(ph) {
    TABS.forEach(function (t, i) {
      var p = $('#n2-pan' + i); if (!p) return;
      if (ph) { p.setAttribute('role', 'region'); p.setAttribute('aria-labelledby', 'n2-acc' + i); p.removeAttribute('tabindex'); p.hidden = !accOpen[i]; }
      else { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'n2-tab' + i); p.setAttribute('tabindex', '0'); p.hidden = i !== curTab; }
    });
  }
  $$('.n2-acc').forEach(function (b, i) { b.addEventListener('click', function () { setAcc(i, !accOpen[i]); }); });
  $$('[data-n2size]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (sizeTab < 0) return;
      if (MQ.matches) { setAcc(sizeTab, true); go($('#n2-acc' + sizeTab)); return; }
      if (showTab) showTab(sizeTab); go($('#n2-info'));
    });
  });
  // the size chart's cm / inches switch: lengths convert, kg stays kg
  $$('[data-n2u]').forEach(function (b) {
    b.addEventListener('click', function () {
      UNIT = b.getAttribute('data-n2u');
      $$('.n2-sg td[data-n2c]').forEach(function (td) { td.textContent = cellText(sgSizes[Number(td.getAttribute('data-n2s'))], sgCols[Number(td.getAttribute('data-n2c'))], UNIT); });
      $$('[data-n2u]').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-n2u') === UNIT ? 'true' : 'false'); });
    });
  });

  // ----- Find my size: a modal, one question at a time, then the size and why
  if (FIT) (function () {
    var box = document.createElement('div');
    box.className = 'n2-fit'; box.hidden = true;
    box.innerHTML = '<div class="n2-fit-scrim" data-fitx></div>' +
      '<div class="n2-fit-box" role="dialog" aria-modal="true" aria-labelledby="n2-fit-e n2-fit-t">' +
      '<div class="n2-fit-top"><div><span id="n2-fit-e">Find my size</span><b id="n2-fit-t">' + esc(name) + '</b></div>' +
      '<button type="button" class="n2-fit-x" aria-label="Close" data-fitx>×</button></div>' +
      '<div class="n2-fit-body" id="n2-fit-body"></div><div class="n2-fit-foot" id="n2-fit-foot"></div></div>';
    document.body.appendChild(box);
    var body = $('#n2-fit-body', box), foot = $('#n2-fit-foot', box), stepI = 0, ans = {}, qu = 'cm', from = null;
    var isLen = function (m) { return unitOf(m.key) === 'cm'; };
    var lc1 = function (s) { s = String(s || ''); return s.charAt(0).toLowerCase() + s.slice(1); };
    var sizeWord = function (nm) { return /\d/.test(nm) ? 'The ' + nm + ' size' : nm; };
    // progress as small bars, never "1 of 2"
    var bars = function (n) { return '<div class="n2-fit-bars" aria-hidden="true">' + FIT.ms.map(function (m, i) { return '<i' + (i < n ? ' class="on"' : '') + '></i>'; }).join('') + '</div>'; };
    function optBtn(nm) {
      var o = M.opts[M.sizeIdx], k = -1;
      o.values.forEach(function (v, j) { if (k < 0 && String(v).toLowerCase() === String(nm).toLowerCase()) k = j; });
      var b = k > -1 ? $('.n2-val[data-oi="' + o.i + '"][data-k="' + k + '"]') : null;
      return b && !b.disabled ? b : null;
    }
    function ask() {
      var m = FIT.ms[stepI], len = isLen(m), v = ans[m.key];
      var val = v == null ? '' : n1(len && qu === 'in' ? toIn(v) : isKg(m.key) ? wV(v) : v);
      body.innerHTML = bars(stepI + 1) +
        '<h3 class="n2-fit-q" id="n2-fit-q">' + esc(m.q) + '</h3>' + (m.help ? '<p class="n2-fit-help" id="n2-fit-help">' + esc(m.help) + '</p>' : '') +
        '<div class="n2-fit-row"><div class="n2-fit-field"><input id="n2-fit-v" type="number" inputmode="decimal" step="any" min="0" autocomplete="off" value="' + val + '"' +
        ' aria-labelledby="n2-fit-q n2-fit-suf" aria-describedby="' + (m.help ? 'n2-fit-help ' : '') + 'n2-fit-err"><span class="n2-fit-suf" id="n2-fit-suf">' + (len ? qu : isKg(m.key) ? wU() : esc(unitOf(m.key))) + '</span></div>' +
        (len ? '<div class="n2-units" role="group" aria-label="Measure in"><button type="button" data-fitu="cm" aria-pressed="' + (qu === 'cm') + '">cm</button>' +
          '<button type="button" data-fitu="in" aria-pressed="' + (qu === 'in') + '">inches</button></div>' : '') +
        '</div><p class="n2-fit-err" id="n2-fit-err" aria-live="polite"></p>';
      foot.innerHTML = (stepI ? '<button type="button" class="n2-ghost" data-fitback>Back</button>' : '') +
        '<button type="button" class="btn n2-fit-go" data-fitnext>' + (stepI === FIT.ms.length - 1 ? 'See my size' : 'Continue') + '</button>';
    }
    function answer() {
      var m = FIT.ms[stepI], inp = $('#n2-fit-v', box), raw = parseFloat(inp.value);
      if (!(raw > 0)) { inp.setAttribute('aria-invalid', 'true'); $('#n2-fit-err', box).textContent = 'Add a measurement to carry on.'; inp.focus(); return; }
      ans[m.key] = isLen(m) && qu === 'in' ? raw * 2.54 : isKg(m.key) && US ? raw / LB : raw;
      stepI += 1; draw();
    }
    function result() {
      var R0 = fitResult(ans), mail = [], lines = [], wc = SG.weightCheck;
      FIT.ms.forEach(function (m) { if (ans[m.key] != null) mail.push(m.label + ': ' + fv(ans[m.key], m.key, qu)); });
      var again = '<button type="button" class="n2-ghost" data-fitagain>Start again</button>';
      var mailBtn = '<a class="btn n2-fit-go" href="' + esc(fitMail(mail)) + '">Email us the measurement</a>';
      var said = function (m) { return unitOf(m.key) === 'kg' ? 'Your dog weighs ' + fv(ans[m.key], m.key, qu) + '.' : 'You measured ' + fv(ans[m.key], m.key, qu) + ' ' + lc1(m.label) + '.'; };
      var top = function (eb, big, cls) { return bars(FIT.ms.length) + '<p class="n2-fit-eb">' + eb + '</p><p class="n2-fit-size' + (cls || '') + '" id="n2-fit-rh" tabindex="-1">' + big + '</p>'; };
      var why = function () { return '<h4 class="n2-fit-wh">Why</h4><ul class="n2-fit-why">' + lines.map(function (l) { return '<li' + (l.ok ? '' : ' class="n2-off"') + '>' + esc(l.t) + '</li>'; }).join('') + '</ul>'; };
      var rule = SG.rule ? '<p class="n2-fit-rule">' + esc(lbText(SG.rule)) + '</p>' : '';
      if (R0.kind === 'weight') {
        // the wrong listing for this weight: say so with the store's own rule
        body.innerHTML = top('Your dog weighs ' + esc(fv(R0.w, R0.wk, qu)), 'Not this one', ' n2-fit-no') +
          (rule || '<p class="n2-fit-rule">This is made for dogs ' + esc(lbText(wc.label)) + '.</p>');
        foot.innerHTML = again + mailBtn; return;
      }
      if (R0.kind === 'none') {
        FIT.ms.forEach(function (m) {
          if (ans[m.key] == null || FIT.keys.indexOf(m.key) < 0) return;
          var lo = Infinity, hi = -Infinity;
          sgSizes.forEach(function (s) { var r = s.r && s.r[m.key]; if (r) { lo = Math.min(lo, r[0]); hi = Math.max(hi, r[1]); } });
          lines.push({ ok: false, t: said(m) + ' The sizes run from ' + fr([lo, hi], m.key, qu) + '.' });
        });
        body.innerHTML = top('Your size', 'No size fits', ' n2-fit-no') + why() + rule;
        foot.innerHTML = again + mailBtn; return;
      }
      var s = R0.size;
      FIT.ms.forEach(function (m) {
        if (ans[m.key] == null) return;
        var r = s.r && s.r[m.key], v = ans[m.key];
        if (r && r.length === 2) lines.push({ ok: v >= r[0] && v <= r[1], t: said(m) + ' ' + sizeWord(s.name) + ' covers ' + fr(r, m.key, qu) + '.' });
        else if (wc && m.key === weightKey()) lines.push({ ok: true, t: said(m) + ' This is made for dogs ' + lbText(wc.label) + '.' });
      });
      if (R0.also.length) {
        var also = R0.also.map(function (x) { return x.name; }).join(' and ');
        lines.push({ ok: true, t: SG.tie === 'centre' ? also + ' fits too. You sit closer to the middle of ' + s.name + '.'
          : also + ' fits too. When two sizes fit, we go for the ' + (SG.tie === 'down' ? 'smaller' : 'larger') + ' one.' });
      }
      var note = '';
      if (R0.kind === 'part') {
        var offL = FIT.ms.filter(function (m) { return R0.off.indexOf(m.key) > -1; }).map(function (m) { return m.label; }).join(' and ');
        note = '<div class="n2-fit-note"><p><b>' + esc(offL) + (R0.off.length > 1 ? ' are' : ' is') + ' outside ' + esc(s.name) + '.</b>' + (SG.rule ? ' ' + esc(lbText(SG.rule)) : '') + '</p>' +
          '<a href="' + esc(fitMail(mail)) + '">Email us the measurement</a></div>';
      }
      body.innerHTML = top('Your size', esc(s.name)) + why() + note;
      foot.innerHTML = again + (optBtn(s.name) ? '<button type="button" class="btn n2-fit-go" data-fitpick="' + esc(s.name) + '">Select size ' + esc(s.name) + '</button>' : mailBtn);
    }
    function draw() {
      if (stepI < FIT.ms.length) ask(); else result();
      body.scrollTop = 0;
      if (!reduced) { body.classList.remove('n2-fin'); void body.offsetWidth; body.classList.add('n2-fin'); }
      var f = $('#n2-fit-v', box) || $('#n2-fit-rh', box);
      if (f) f.focus();
    }
    function open(b) {
      from = b; stepI = 0; ans = {}; qu = UNIT;
      box.hidden = false; document.documentElement.style.overflow = 'hidden';
      draw();
    }
    function close(keep) {
      box.hidden = true; document.documentElement.style.overflow = '';
      if (!keep && from && from.focus) from.focus();
    }
    box.addEventListener('click', function (e) {
      var t = e.target, b;
      if (t.closest('[data-fitx]')) close();
      else if (t.closest('[data-fitnext]')) answer();
      else if (t.closest('[data-fitback]')) { stepI = Math.max(0, stepI - 1); draw(); }
      else if (t.closest('[data-fitagain]')) { stepI = 0; ans = {}; draw(); }
      else if ((b = t.closest('[data-fitpick]'))) {
        // choose that size in the buy box (its price follows), then close
        var ob = optBtn(b.getAttribute('data-fitpick'));
        close(true);
        if (ob) { ob.click(); ob.focus({ preventScroll: true }); ob.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); }
        else if (from && from.focus) from.focus();
      } else if ((b = t.closest('[data-fitu]'))) {
        var u = b.getAttribute('data-fitu'), inp = $('#n2-fit-v', box), v = parseFloat(inp.value);
        if (u !== qu && v > 0) inp.value = n1(u === 'in' ? v / 2.54 : v * 2.54);
        qu = u;
        $$('[data-fitu]', box).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-fitu') === qu ? 'true' : 'false'); });
        $('#n2-fit-suf', box).textContent = qu;
      }
    });
    box.addEventListener('input', function (e) { if (e.target.id === 'n2-fit-v') { e.target.removeAttribute('aria-invalid'); $('#n2-fit-err', box).textContent = ''; } });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Enter' && e.target.id === 'n2-fit-v') { e.preventDefault(); answer(); return; }
      if (e.key !== 'Tab') return;
      // keep the focus inside the modal
      var fs = $$('button, [href], input', $('.n2-fit-box', box)).filter(function (x) { return !x.disabled && x.getClientRects().length; });
      var i = fs.indexOf(document.activeElement);
      if (i < 0) { if (!box.contains(document.activeElement)) { e.preventDefault(); fs[0].focus(); } return; }
      if (e.shiftKey && i === 0) { e.preventDefault(); fs[fs.length - 1].focus(); }
      else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); }
    });
    $$('[data-n2fit]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  })();
  // a description size guide: wrap each size so the chosen one can be lit up
  $$('.n2-panel h3[data-pdsz]').forEach(function (h) {
    var box = document.createElement('div'); box.className = 'n2-szb'; box.setAttribute('data-sz', h.getAttribute('data-pdsz'));
    h.parentNode.insertBefore(box, h);
    var n = h;
    do { var nx = n.nextSibling; box.appendChild(n); n = nx; } while (n && !(n.nodeType === 1 && /^H[1-4]$/.test(n.tagName)));
  });

  // ----- reviews
  $$('[data-n2go]').forEach(function (a) { a.addEventListener('click', function (e) { var t = $('#' + a.getAttribute('data-n2go')); if (t) { e.preventDefault(); go(t); } }); });
  $$('[data-n2rev]').forEach(function (a) { a.addEventListener('click', function (e) { var t = $('#reviews'); if (t) { e.preventDefault(); go(t); } }); });
  if ($('#n2-rlist')) {
    $$('.n2-hrow').forEach(function (b) {
      b.addEventListener('click', function () { var s = Number(b.getAttribute('data-star')); rFilter = rFilter === s ? 0 : s; renderReviews(); });
    });
    $('#n2-rstat').addEventListener('click', function (e) { if (e.target.closest('#n2-rclear')) { rFilter = 0; renderReviews(); } });
    $('#n2-rmore').addEventListener('click', function () { rAll = true; renderReviews(); });
    renderReviews();
    // the bars grow in when the summary comes into view
    var hist = $('.n2-hist');
    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { hist.classList.add('n2-in'); io.disconnect(); } }); }, { threshold: 0.3 });
      io.observe(hist);
    } else hist.classList.add('n2-in');
  }

  // ----- dogs: the photo viewer and the scroller
  $$('.n2-dog').forEach(function (b) { b.addEventListener('click', function () { UI.lightbox(M.dogs, Number(b.getAttribute('data-di')), 'A dog using the ' + name); }); });
  var dogRail = $('#n2dogs');
  if (dogRail) {
    X.scroller(dogRail, $('#n2dogss'), $('#n2dogst'), $('#n2dogsh'));
    var fitDogs = function () { $('#n2dogss').hidden = dogRail.scrollWidth <= dogRail.clientWidth + 2; };
    fitDogs(); window.addEventListener('resize', fitDogs);
    $$('img', dogRail).forEach(function (im) { im.addEventListener('load', fitDogs); });
  }

  // ----- kit
  var kitRow = $('#n2-kitrow');
  if (kitRow) {
    kitRow.addEventListener('click', function (e) {
      var b = e.target.closest('button.n2-kc-t'); if (!b) return;
      var h = b.closest('[data-kh]').getAttribute('data-kh'), i = kitOn.indexOf(h);
      if (i > -1) kitOn.splice(i, 1); else kitOn.push(h);
      renderKit(); pop(b.closest('.n2-kc'));
    });
    $('#n2-kt').addEventListener('click', function (e) {
      var b = e.target.closest('#n2-kt-add'); if (!b) return;
      var on = M.kit.filter(function (h) { return kitOn.indexOf(h) > -1; });
      if (M.addKit(vi, on)) { b.classList.add('n2-done'); b.textContent = 'Added ' + TICK; setTimeout(renderKit, 1800); }
    });
  }

  // ----- recommended row
  if ($('#recrail')) UI.initRail('recrail');

  /* ========================================================================
     PHONES AND SMALL TABLETS (under 900px). Desktop keeps the order it was drawn in
     ======================================================================== */
  // "View more": the text shows three lines, the button opens it in place ("View less" closes it)
  var CLIPS = $$('.n2-clipw').map(function (w) { return { box: $('.n2-clip', w), btn: $('.n2-vm', w), open: false }; });
  function measureClips() {
    CLIPS.forEach(function (c) {
      c.box.classList.remove('n2-shut'); c.box.style.maxHeight = '';
      if (!MQ.matches || !c.box.getClientRects().length) { c.btn.hidden = true; return; }
      var f = c.box.firstElementChild || c.box, lh = parseFloat(getComputedStyle(f).lineHeight) || 24, lim = Math.ceil(lh * 3);
      if (c.box.scrollHeight <= lim + 4) { c.btn.hidden = true; return; }
      c.btn.hidden = false;
      c.btn.textContent = c.open ? 'View less' : 'View more';
      c.btn.setAttribute('aria-expanded', c.open ? 'true' : 'false');
      if (!c.open) { c.box.classList.add('n2-shut'); c.box.style.maxHeight = lim + 'px'; }
    });
  }
  CLIPS.forEach(function (c) {
    c.btn.addEventListener('click', function () {
      c.open = !c.open; measureClips();
      if (!c.open) { var r = c.box.getBoundingClientRect(); if (r.top < 0) window.scrollBy(0, r.top - 24); }
    });
  });

  // the buy area in the order a shopper needs it: photo, name, rating, price, options, Subscribe
  // & save, quantity and Add to basket, delivery, points, promises, then the snippet and tags
  var buy = $('.n2-buy'), meta = $('.n2-meta', buy), gal = $('.n2-gal'), stage = $('.n2-stage', gal), thumbs = $('#n2-thumbs');
  var DESK = Array.prototype.slice.call(buy.children);
  var RANK = ['n2-top', 'n2-title', 'n2-meta', 'n2-price', 'n2-opt', 'n2-bm', 'n2-cta', 'n2-actrow', 'n2-perks', 'n2-prom', 'n2-ledew', 'n2-tags'];
  function rank(el) { for (var i = 0; i < RANK.length; i++) if (el.classList.contains(RANK[i])) return i; return RANK.length; }
  var PHONE = DESK.slice().sort(function (a, b) { return (rank(a) - rank(b)) || (DESK.indexOf(a) - DESK.indexOf(b)); });
  var phone = null;
  function layout() {
    var ph = MQ.matches;
    if (ph !== phone) {
      phone = ph;
      // the thumbnails sit under the photo on phones, beside it on desktop
      // Joe: the thumbnails sit under the photo at every width
      if (thumbs) gal.appendChild(thumbs);
      (ph ? PHONE : DESK).forEach(function (el) { buy.appendChild(el); });
      // "See real dogs using it" leads into the dogs band from the end of the buy area
      var dl = $('.n2-dogline');
      if (dl) meta.appendChild(dl);
      accMode(ph);
      renderReviews();
      if (gi) goSlide(gi);
    }
    document.dispatchEvent(new Event('n2:layout'));
    measureClips(); clampReviews();
  }
  layout();
  if (MQ.addEventListener) MQ.addEventListener('change', layout); else if (MQ.addListener) MQ.addListener(layout);
  var lastW = window.innerWidth, rz = 0;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return; lastW = window.innerWidth;
    clearTimeout(rz); rz = setTimeout(function () { measureClips(); clampReviews(); }, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureClips);

  update(false);
  window.N2 = { M: M, MM: MM, P: P, SP: SPL, X: X, WHO: WHO, CHIPS: CHIPS, CAT: CAT, TABS: TABS, PLANS: PLANS, R: R, name: name, desc: desc, MQ: MQ,
    state: function () { return { vi: vi, qty: qty, plan: plan, price: M.price(vi) }; } };
  document.dispatchEvent(new Event('n2:ready'));

});
