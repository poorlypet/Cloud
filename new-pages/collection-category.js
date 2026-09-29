/* Collection page for a product category (example: Supplements & health). Shared by versions A, B and C.
   Data: products.js (PP_PRODUCTS, PP_TAGS) then offers.js (PPOffers). Cards are the homepage .pk card.
   Filters, sort and "Load more" run on the page and are written to the URL hash, e.g.
   #sub=joint&brand=Zesty%20Paws|Supernature&price=10-20&sort=price-asc */
(function () {
  'use strict';
  var root = document.querySelector('.cg');
  if (!root || !window.PP_PRODUCTS || !window.PPOffers) return;
  var V = root.getAttribute('data-cg') || 'a';
  var PAGE = 24;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '£' + n.toFixed(2); }

  /* ---------- the category: every supplement in the catalogue ---------- */
  var ALL = window.PP_PRODUCTS.filter(function (p) { return PPOffers.test.isSupplement(p); });
  var TAGS = window.PP_TAGS || {};

  /* sub-categories, from titles, tags and product types */
  var SUBS = [
    { id: 'joint', n: 'Joint & mobility', helps: 'For joints & mobility', re: /joint|mobility|glucosamine|chondroitin|green.?lipped|turmeric|\bhip|arthrit|collagen|\bmsm\b/i },
    { id: 'skin', n: 'Skin & coat', helps: 'For skin & coat', re: /skin|coat|itch|omega|salmon|fish.oil|allerg|krill/i },
    { id: 'gut', n: 'Digestion', helps: 'For digestion', re: /gut|digest|probiotic|prebiotic|tummy|stool|diarr|pumpkin|fibre|constipation|anal.gland/i },
    { id: 'calm', n: 'Calming', helps: 'For calm & confidence', re: /calm|anxi|stress|relax/i },
    { id: 'senior', n: 'Senior', helps: 'For older dogs', re: /senior|older|ageing|aging/i },
    { id: 'multi', n: 'Multivitamins', helps: 'For everyday health', re: /multi|vitamin|superfood|wellness|immun|\d+.in.1/i },
    { id: 'dental', n: 'Dental', helps: 'For teeth & breath', re: /dental|plaque|tartar|breath|teeth|seaweed/i },
    { id: 'urinary', n: 'Urinary & kidney', helps: 'For kidneys & bladder', re: /urinary|kidney|bladder|cranberry|renal/i }
  ];
  var FOR = { 'arthritis': 'Arthritis', 'hip-dysplasia': 'Hip dysplasia', 'elbow-dysplasia': 'Elbow dysplasia', 'cruciate-ligament': 'Cruciate ligament', 'luxating-patella': 'Luxating patella', 'rear-leg-weakness': 'Rear leg weakness', 'back-pain': 'Back pain', 'spondylosis': 'Spondylosis', 'ivdd': 'IVDD', 'itchy-skin': 'Itchy skin', 'hot-spots': 'Hot spots', 'seasonal-allergies': 'Seasonal allergies', 'ear-eye-care': 'Ears & eyes', 'digestive-issues': 'Digestive issues', 'kidney-support': 'Kidney support', 'weight-management': 'Weight management', 'anxiety': 'Anxiety', 'separation-anxiety': 'Separation anxiety', 'noise-fear': 'Noise fear', 'dental-disease': 'Dental disease', 'wound-recovery': 'Wound recovery', 'post-surgery-recovery': 'Post-surgery recovery', 'senior-support': 'Senior support' };
  var PRICES = [
    { v: 'u10', n: 'Under £10', t: function (x) { return x < 10; } },
    { v: '10-20', n: '£10 to £20', t: function (x) { return x >= 10 && x < 20; } },
    { v: '20-30', n: '£20 to £30', t: function (x) { return x >= 20 && x < 30; } },
    { v: '30', n: '£30 and over', t: function (x) { return x >= 30; } }
  ];
  var SORTS = [['rec', 'Recommended'], ['reviews', 'Most reviewed'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Customer rating'], ['name', 'Name: A to Z']];

  /* per-product facts used by the filters */
  ALL.forEach(function (p, i) {
    var txt = p.title + ' ' + p.tags.join(' ') + ' ' + p.productType;
    p._i = i;
    p._subs = SUBS.filter(function (s) { return s.re.test(txt); }).map(function (s) { return s.id; });
    p._for = Object.keys(FOR).filter(function (k) { return (TAGS[k] || []).indexOf(p.handle) > -1; });
    var hits = 0; Object.keys(TAGS).forEach(function (k) { if (TAGS[k].indexOf(p.handle) > -1) hits++; });
    p._hits = hits;
    p._offers = PPOffers.forProduct(p);
    p._sale = !!(p.compareAt && p.compareAt > p.price);
    p._score = (p.rating ? p.rating * 2 + Math.min(p.reviewCount, 20) / 4 : 0) + hits * 1.5 + (p._sale ? 1 : 0);
    p._name = p.title.replace(/\s*\|\s*/g, ' ').trim();
  });
  /* "Recommended": best-matched first, never two of the same brand side by side where it can be helped */
  var REC = (function () {
    var pool = ALL.slice().sort(function (a, b) { return b._score - a._score || a._i - b._i; }), out = [];
    while (pool.length) {
      var last = out.length ? out[out.length - 1].brand : null, k = 0;
      while (k < pool.length && pool[k].brand === last && k < 6) k++;
      if (k >= pool.length) k = 0;
      out.push(pool.splice(k, 1)[0]);
    }
    out.forEach(function (p, i) { p._rec = i; });
    return out;
  })();

  var BRANDS = count(ALL, function (p) { return [p.brand]; });
  var FORS = count(ALL, function (p) { return p._for; });
  function count(list, fn) {
    var m = {}; list.forEach(function (p) { fn(p).forEach(function (k) { m[k] = (m[k] || 0) + 1; }); });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a] || a.localeCompare(b); });
  }

  /* ---------- facets ---------- */
  var FACETS = [
    { f: 'brand', n: 'Brand', multi: true, opts: BRANDS.map(function (b) { return { v: b, n: b }; }), t: function (p, v) { return p.brand === v; } },
    { f: 'price', n: 'Price', multi: true, opts: PRICES, t: function (p, v) { return PRICES.filter(function (x) { return x.v === v; })[0].t(p.price); } },
    { f: 'rating', n: 'Rating', multi: false, opts: [{ v: '4', n: '4 stars and up' }, { v: '3', n: '3 stars and up' }], t: function (p, v) { return (p.rating || 0) >= +v; } },
    { f: 'for', n: 'Helps with', multi: true, opts: FORS.map(function (k) { return { v: k, n: FOR[k] }; }), t: function (p, v) { return p._for.indexOf(v) > -1; } },
    { f: 'offer', n: 'Offers', multi: true, opts: [{ v: 'on', n: 'On offer' }, { v: 'sale', n: 'Reduced price' }], t: function (p, v) { return v === 'on' ? p._offers.length > 0 : p._sale; } }
  ];
  var FBY = {}; FACETS.forEach(function (x) { FBY[x.f] = x; });

  var S = blank();
  function blank() { return { sub: '', brand: [], price: [], rating: [], for: [], offer: [], sort: 'rec', show: PAGE }; }

  function pass(p, skip) {
    if (skip !== 'sub' && S.sub && p._subs.indexOf(S.sub) < 0) return false;
    for (var i = 0; i < FACETS.length; i++) {
      var F = FACETS[i], sel = S[F.f];
      if (F.f === skip || !sel.length) continue;
      if (!sel.some(function (v) { return F.t(p, v); })) return false;
    }
    return true;
  }
  function results() {
    var r = ALL.filter(function (p) { return pass(p); });
    var s = S.sort;
    r.sort(function (a, b) {
      if (s === 'price-asc') return a.price - b.price || a._rec - b._rec;
      if (s === 'price-desc') return b.price - a.price || a._rec - b._rec;
      if (s === 'rating') return (b.rating || 0) - (a.rating || 0) || b.reviewCount - a.reviewCount || a._rec - b._rec;
      if (s === 'reviews') return b.reviewCount - a.reviewCount || b._hits - a._hits || a._rec - b._rec;
      if (s === 'name') return a._name.localeCompare(b._name);
      return a._rec - b._rec;
    });
    return r;
  }
  function nActive() { var n = S.sub ? 1 : 0; FACETS.forEach(function (F) { n += S[F.f].length; }); return n; }

  /* ---------- URL hash ---------- */
  function toHash() {
    var parts = [];
    if (S.sub) parts.push('sub=' + S.sub);
    FACETS.forEach(function (F) { if (S[F.f].length) parts.push(F.f + '=' + S[F.f].map(encodeURIComponent).join('|')); });
    if (S.sort !== 'rec') parts.push('sort=' + S.sort);
    if (S.show > PAGE) parts.push('show=' + S.show);
    var h = parts.length ? '#' + parts.join('&') : location.pathname + location.search;
    try { history.replaceState(null, '', h); } catch (e) { location.hash = parts.join('&'); }
  }
  function fromHash() {
    S = blank();
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i < 1) return;
      var k = kv.slice(0, i), v = kv.slice(i + 1);
      if (k === 'sub') { if (SUBS.some(function (s) { return s.id === v; })) S.sub = v; }
      else if (k === 'sort') { if (SORTS.some(function (s) { return s[0] === v; })) S.sort = v; }
      else if (k === 'show') { S.show = Math.max(PAGE, Math.ceil((parseInt(v, 10) || PAGE) / PAGE) * PAGE); }
      else if (FBY[k]) {
        var ok = FBY[k].opts.map(function (o) { return o.v; });
        S[k] = v.split('|').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } }).filter(function (x) { return ok.indexOf(x) > -1; });
        if (!FBY[k].multi) S[k] = S[k].slice(0, 1);
      }
    });
  }

  /* ---------- the card: exactly the homepage .pk, plus the offer badge and offer line ---------- */
  function stars(r) {
    var h = '<span class="stars" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) { var f = r - (i - 1); h += f >= 1 ? '<i class="on"></i>' : f > 0 ? '<i class="part" style="--f:' + Math.round(f * 100) + '%"></i>' : '<i></i>'; }
    return h + '</span>';
  }
  function helps(p) {
    if (p._for.length) return 'For ' + FOR[p._for[0]].toLowerCase();
    var s = SUBS.filter(function (x) { return p._subs.indexOf(x.id) > -1; })[0];
    return s ? s.helps : '';
  }
  function card(p) {
    var badge = PPOffers.badge(p), line = PPOffers.lines(p)[0], n = p.reviewCount;
    return '<article class="pk">' + (badge ? '<span class="tab sale">' + esc(badge) + '</span>' : '') +
      '<a class="well" href="#" tabindex="-1" aria-hidden="true">' + (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</a>' +
      '<div class="body"><span class="brand">' + esc(p.brand) + '</span><a class="name" href="#">' + esc(p._name) + '</a>' +
      (p.rating ? '<a class="rev" href="#" aria-label="Rated ' + (Math.round(p.rating * 10) / 10) + ' out of 5 from ' + n + ' review' + (n === 1 ? '' : 's') + '">' + stars(p.rating) + '<span>' + (Math.round(p.rating * 10) / 10) + ' <em>(' + n + ' review' + (n === 1 ? '' : 's') + ')</em></span></a>' : '<span class="rev none" aria-hidden="true"></span>') +
      '<span class="helps">' + esc(helps(p)) + '</span>' +
      '<div class="price"><span class="now">' + money(p.price) + '</span>' + (p._sale ? '<span class="was">' + money(p.compareAt) + '</span><span class="save">Save ' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>' : '') + '</div>' +
      (line ? '<span class="cg-ofl">' + esc(line) + '</span>' : '') +
      '<button class="btn" type="button" data-add="' + esc(p.handle) + '">Add to basket</button></div></article>';
  }

  /* ---------- build the controls ---------- */
  var uid = 0;
  function facetBody(F) {
    var id = 'cg-fb-' + F.f + '-' + (++uid), lim = F.opts.length > 8 ? 8 : 99;
    var h = '<div class="cg-opts" id="' + id + '" role="group" aria-label="' + esc(F.n) + '">';
    if (!F.multi) h += opt(F, { v: '', n: 'Any rating' }, false);
    F.opts.forEach(function (o, i) { h += opt(F, o, i >= lim); });
    h += '</div>';
    if (lim < F.opts.length) h += '<button class="cg-moreopts" type="button" aria-expanded="false" aria-controls="' + id + '" data-n="' + F.opts.length + '">Show all ' + F.opts.length + '</button>';
    return h;
  }
  function opt(F, o, xtra) {
    return '<label class="cg-opt' + (xtra ? ' cg-x' : '') + '"><input type="' + (F.multi ? 'checkbox' : 'radio') + '" name="cg-' + F.f + '-' + uid + '" data-f="' + F.f + '" value="' + esc(o.v) + '"><span class="cg-ol">' + (F.f === 'rating' && o.v ? stars(+o.v) + '<span class="sr">' + esc(o.n) + '</span><span aria-hidden="true">&amp; up</span>' : esc(o.n)) + '</span><span class="cg-n" data-f="' + F.f + '" data-v="' + esc(o.v) + '"></span></label>';
  }
  function sidebarFacets() {
    return FACETS.map(function (F, i) {
      var id = 'cg-g-' + F.f + '-' + (++uid), open = V === 'c' ? i < 4 : true;
      return '<div class="cg-fg"><h3><button class="cg-fgh" type="button" aria-expanded="' + open + '" aria-controls="' + id + '">' + esc(F.n) + '<span class="cg-sel" data-sel="' + F.f + '"></span></button></h3><div class="cg-fgb" id="' + id + '"' + (open ? '' : ' hidden') + '>' + facetBody(F) + '</div></div>';
    }).join('');
  }
  var facetsEl = $("#cg-fgroups");
  if (facetsEl) facetsEl.innerHTML = sidebarFacets();
  var ddsEl = $('#cg-dds');
  if (ddsEl) {
    ddsEl.innerHTML = FACETS.map(function (F) {
      var id = 'cg-dd-' + F.f;
      return '<div class="cg-dd"><button class="cg-ddb" type="button" aria-expanded="false" aria-controls="' + id + '">' + esc(F.n) + '<span class="cg-sel" data-sel="' + F.f + '"></span><span class="cg-car" aria-hidden="true"></span></button><div class="cg-ddp" id="' + id + '" hidden>' + facetBody(F) + '<div class="cg-ddf"><button class="cg-lnk" type="button" data-clearf="' + F.f + '">Clear</button><button class="btn sec sm" type="button" data-closedd>Done</button></div></div></div>';
    }).join('') + '<button class="cg-ddb cg-allf" type="button" data-openf aria-controls="cg-filters" aria-expanded="false">All filters<span class="cg-sel" data-sel="all"></span></button>';
  }

  /* sort selects */
  $$('select[data-sort]').forEach(function (sel) {
    sel.innerHTML = SORTS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('');
    sel.addEventListener('change', function () { S.sort = sel.value; S.show = PAGE; update(true); });
  });

  /* this month's offers: the five offers from the Offers menu */
  var offEl = $('#cg-offers');
  if (offEl) offEl.innerHTML = PPOffers.all.map(function (o) {
    var n = ALL.filter(function (p) { return p._offers.some(function (x) { return x.id === o.id; }); }).length;
    return '<li><a href="#"><b>' + esc(o.name) + '</b><span>' + (n ? 'On ' + n + ' products here' : 'See the offer') + ' ›</span></a></li>';
  }).join('');

  /* sub-categories: chips (A), tabs (B) or photo tiles (C) */
  var subEl = $('#cg-subs');
  function subCount(id) { return ALL.filter(function (p) { return (!id || p._subs.indexOf(id) > -1) && pass(p, 'sub'); }).length; }
  if (subEl) {
    var kind = subEl.getAttribute('data-kind');
    subEl.innerHTML = (kind === 'tiles' ? '' : '<li><button type="button" data-sub="" aria-pressed="false">All supplements <span class="cg-sn" data-sn=""></span></button></li>') +
      SUBS.map(function (s) {
        if (kind === 'tiles') {
          var top = REC.filter(function (p) { return p._subs.indexOf(s.id) > -1 && p.img; })[0];
          return '<li><button type="button" data-sub="' + s.id + '" aria-pressed="false"><span class="cg-tw">' + (top ? '<img src="' + esc(top.img) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</span><span class="cg-tt"><b>' + esc(s.n) + '</b><span class="cg-sn" data-sn="' + s.id + '"></span></span></button></li>';
        }
        return '<li><button type="button" data-sub="' + s.id + '" aria-pressed="false">' + esc(s.n) + ' <span class="cg-sn" data-sn="' + s.id + '"></span></button></li>';
      }).join('');
  }

  /* ---------- render ---------- */
  var grid = $('#cg-grid'), moreBtn = $('#cg-more'), shown = 0, kitHTML = (function () { var t = $('#cg-kit-tpl'); return t ? t.innerHTML : ''; })();
  function update(push, focusFrom) {
    var r = results(), total = r.length, show = Math.min(S.show, total);
    /* grid */
    var html = r.slice(0, show).map(card);
    if (kitHTML && total > 6 && !nActive()) html.splice(6, 0, kitHTML);
    grid.innerHTML = total ? html.join('') : '<div class="cg-empty"><h3>No products match these filters</h3><p>Try removing a filter, or <button class="cg-lnk" type="button" data-clearall>clear them all</button>.</p></div>';
    shown = show;
    /* counts and progress */
    $$('[data-rc]').forEach(function (el) { el.textContent = total + ' product' + (total === 1 ? '' : 's'); });
    $$('[data-showbtn]').forEach(function (el) { el.textContent = total ? 'Show ' + total + ' result' + (total === 1 ? '' : 's') : 'No results'; });
    var pg = $('#cg-prog'); if (pg) {
      pg.hidden = !total;
      $('[data-prog-t]', pg).textContent = 'Showing ' + show + ' of ' + total;
      $('[data-prog-b]', pg).style.width = (total ? show / total * 100 : 0) + '%';
      $('.cg-bar-p', pg).setAttribute('aria-valuenow', show); $('.cg-bar-p', pg).setAttribute('aria-valuemax', total);
    }
    if (moreBtn) { moreBtn.hidden = show >= total; moreBtn.textContent = 'Load ' + Math.min(PAGE, total - show) + ' more'; }
    /* facet inputs and counts */
    $$('input[data-f]').forEach(function (inp) {
      var f = inp.getAttribute('data-f'), v = inp.value;
      inp.checked = v === '' ? !S[f].length : S[f].indexOf(v) > -1;
    });
    $$('.cg-n').forEach(function (el) {
      var f = el.getAttribute('data-f'), v = el.getAttribute('data-v'), F = FBY[f];
      var n = ALL.filter(function (p) { return pass(p, f) && (v === '' || F.t(p, v)); }).length;
      el.textContent = '(' + n + ')';
      var lab = el.parentNode, inp = $('input', lab);
      lab.classList.toggle('cg-zero', !n && !inp.checked);
    });
    $$('[data-sel]').forEach(function (el) {
      var f = el.getAttribute('data-sel'), n = f === 'all' ? nActive() : S[f].length;
      el.textContent = n ? ' (' + n + ')' : '';
    });
    $$('[data-openf] .cg-fn').forEach(function (el) { var n = nActive(); el.textContent = n ? ' (' + n + ')' : ''; });
    $$('[data-sub]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-sub') === S.sub)); });
    $$('[data-sn]').forEach(function (el) { el.textContent = subCount(el.getAttribute('data-sn')); });
    $$('select[data-sort]').forEach(function (sel) { sel.value = S.sort; });
    /* active filter chips */
    var act = [];
    if (S.sub) act.push(['sub', S.sub, SUBS.filter(function (s) { return s.id === S.sub; })[0].n]);
    FACETS.forEach(function (F) { S[F.f].forEach(function (v) { var o = F.opts.filter(function (x) { return x.v === v; })[0]; act.push([F.f, v, (F.f === 'brand' || F.f === 'offer' ? '' : F.n + ': ') + o.n]); }); });
    $$('[data-active]').forEach(function (el) {
      el.hidden = !act.length;
      el.innerHTML = act.length ? '<ul>' + act.map(function (a) { return '<li><button type="button" data-rm="' + a[0] + '" data-v="' + esc(a[1]) + '" aria-label="Remove filter: ' + esc(a[2]) + '">' + esc(a[2]) + '<span aria-hidden="true">×</span></button></li>'; }).join('') + '</ul><button class="cg-lnk" type="button" data-clearall>Clear all</button>' : '';
    });
    if (push) toHash();
    if (focusFrom != null) { var c = $$('.pk .name', grid)[focusFrom]; if (c) c.focus(); }
  }

  /* ---------- events ---------- */
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t.matches || !t.matches('input[data-f]')) return;
    var f = t.getAttribute('data-f'), v = t.value;
    if (FBY[f].multi) { S[f] = S[f].filter(function (x) { return x !== v; }); if (t.checked) S[f].push(v); }
    else S[f] = v ? [v] : [];
    S.show = PAGE; update(true);
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('button,a') : null; if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-sub')) { var s = t.getAttribute('data-sub'); S.sub = S.sub === s ? '' : s; S.show = PAGE; update(true); }
    else if (t.hasAttribute('data-rm')) {
      var f = t.getAttribute('data-rm'), v = t.getAttribute('data-v');
      if (f === 'sub') S.sub = ''; else S[f] = S[f].filter(function (x) { return x !== v; });
      S.show = PAGE; update(true);
      var nx = $('[data-rm]', root) || $('#cg-grid'); if (nx && nx.focus) { if (!nx.hasAttribute('tabindex') && nx.id === 'cg-grid') nx.setAttribute('tabindex', '-1'); nx.focus(); }
    }
    else if (t.hasAttribute('data-clearall')) { var keep = S.sort; S = blank(); S.sort = keep; update(true); }
    else if (t.hasAttribute('data-clearf')) { S[t.getAttribute('data-clearf')] = []; S.show = PAGE; update(true); }
    else if (t.id === 'cg-more') { var from = shown; S.show += PAGE; update(true, from); }
    else if (t.classList.contains('cg-fgh')) {
      var b = document.getElementById(t.getAttribute('aria-controls')), o = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!o)); b.hidden = o;
    }
    else if (t.classList.contains('cg-moreopts')) {
      var box = document.getElementById(t.getAttribute('aria-controls')), op = t.getAttribute('aria-expanded') === 'true';
      box.classList.toggle('cg-all', !op); t.setAttribute('aria-expanded', String(!op));
      t.textContent = op ? 'Show all ' + t.getAttribute('data-n') : 'Show fewer';
    }
    else if (t.hasAttribute('data-add')) addToBasket(t);
    else if (t.hasAttribute('data-readmore')) {
      var m = document.getElementById(t.getAttribute('aria-controls')), x = t.getAttribute('aria-expanded') === 'true';
      m.hidden = x; t.setAttribute('aria-expanded', String(!x)); t.textContent = x ? 'Read more' : 'Read less';
    }
  });

  /* dropdown facets (version B) */
  var openDD = null;
  function closeDD(focus) { if (!openDD) return; var b = openDD; openDD = null; b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; if (focus) b.focus(); }
  $$('.cg-dd > .cg-ddb').forEach(function (b) {
    b.addEventListener('click', function () {
      var was = openDD === b; closeDD();
      if (!was) { openDD = b; b.setAttribute('aria-expanded', 'true'); var p = document.getElementById(b.getAttribute('aria-controls')); p.hidden = false;
        var r = p.getBoundingClientRect(); p.classList.toggle('cg-right', r.right > window.innerWidth - 16); }
    });
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-closedd]')) { closeDD(true); return; }
    if (openDD && !openDD.parentNode.contains(e.target)) closeDD();
  });

  /* filter drawer: a slide-in panel on phones (and for "All filters" in version B) */
  var drawer = $('#cg-filters'), scrim = $('#cg-scrim'), lastFocus = null;
  function isDrawer() { return drawer && (drawer.classList.contains('cg-drawer') || window.matchMedia('(max-width:899px)').matches); }
  function openDrawer(from) {
    if (!drawer) return; lastFocus = from || document.activeElement;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'cg-dh');
    drawer.classList.add('open'); if (scrim) scrim.classList.add('on'); document.documentElement.classList.add('cg-lock');
    $$('[data-openf]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    setTimeout(function () { var c = $('[data-closef]', drawer); if (c) c.focus(); }, RM ? 0 : 60);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('open')) return;
    drawer.classList.remove('open'); if (scrim) scrim.classList.remove('on'); document.documentElement.classList.remove('cg-lock');
    drawer.removeAttribute('aria-modal'); if (!drawer.classList.contains('cg-drawer')) { drawer.removeAttribute('role'); }
    $$('[data-openf]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-openf]').forEach(function (b) { b.addEventListener('click', function () { closeDD(); openDrawer(b); }); });
  $$('[data-closef],[data-showbtn]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  if (scrim) scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (openDD) closeDD(true); else closeDrawer(); }
    if (e.key === 'Tab' && drawer && drawer.classList.contains('open')) {
      var f = $$('button,input,select,a[href]', drawer).filter(function (x) { return x.offsetParent !== null && !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (drawer && drawer.classList.contains('open') && !isDrawer()) closeDrawer(); });

  /* sticky bar under the phone search (version B) */
  var bar = $('.cg-bar');
  if (bar) {
    var ms = $('.msearch');
    var setTop = function () { bar.style.top = (ms && getComputedStyle(ms).display !== 'none' ? ms.offsetHeight : 0) + 'px'; };
    setTop(); window.addEventListener('resize', setTop);
    var sentinel = document.createElement('div'); sentinel.className = 'cg-sent'; bar.parentNode.insertBefore(sentinel, bar);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('stuck', !en[0].isIntersecting); }).observe(sentinel);
  }

  /* basket count and a small confirmation */
  var toast, toastT;
  function addToBasket(btn) {
    var p = ALL.filter(function (x) { return x.handle === btn.getAttribute('data-add'); })[0]; if (!p) return;
    var cnts = $$('.cnt'), n = (cnts.length ? parseInt(cnts[0].textContent, 10) || 0 : 0) + 1;
    cnts.forEach(function (c) { c.textContent = n; c.setAttribute('data-n', n); });
    if (!toast) { toast = document.createElement('div'); toast.className = 'cg-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.innerHTML = '<span><b>Added to basket</b>' + esc(p._name) + '</span><a href="#">View basket (' + n + ')</a>';
    toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 3200);
    btn.textContent = 'Added'; clearTimeout(btn._t); btn._t = setTimeout(function () { btn.textContent = 'Add to basket'; }, 1600);
  }

  window.addEventListener('hashchange', function () { fromHash(); update(false); });
  fromHash();
  update(false);
  var tot = $('#cg-total'); if (tot) tot.textContent = ALL.length;
  var nb = $('#cg-nbrands'); if (nb) nb.textContent = BRANDS.length;
})();
