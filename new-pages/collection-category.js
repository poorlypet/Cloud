/* Collection page (category or condition), shared by versions A, B and C.
   Data: products.js (PP_PRODUCTS, PP_TAGS) then offers.js (PPOffers). Cards are the homepage .pk card.
   Everything is written to the URL hash, e.g.
   #c=arthritis&sub=supps&brand=AniForte|Weloca&min=10&max=30&rating=4&for=hip-dysplasia&offer=two-supps&type=Supplement&sort=price-asc&page=2&view=list
   Versions differ only in markup/CSS: A = sidebar always open, B = top dropdown filter bar + sticky toolbar,
   C = header card, sub-category image carousel and a sticky compact sidebar. Mobile: one filter sheet for all. */
(function () {
  'use strict';
  var root = document.querySelector('.cl');
  if (!root || !window.PP_PRODUCTS || !window.PPOffers) return;
  var V = root.getAttribute('data-v') || 'a';
  var PAGE = 24;
  var TAGS = window.PP_TAGS || {};
  var BY = {}; window.PP_PRODUCTS.forEach(function (p) { BY[p.handle] = p; });
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '£' + n.toFixed(2); }
  function money0(n) { return '£' + (Math.round(n) === n ? n : n.toFixed(2)); }

  /* ---------- product type groups (from Shopify productType, which is free text) ---------- */
  var TG = [
    ['kits', 'Care kits', /condition bundle|gift set/i],
    ['supps', 'Supplements', /supplement|digestive support|calming aid|general wellness|pet health/i],
    ['braces', 'Braces & splints', /brace|splint|orthop(a)?edic support|joint support/i],
    ['wheel', 'Wheelchairs', /wheelchair/i],
    ['harness', 'Harnesses & slings', /harness|mobility aid/i],
    ['ramps', 'Ramps', /ramp/i],
    ['firstaid', 'First aid & wound care', /^first aid|, first aid|bandage|wound|aloe|balm/i],
    ['recovery', 'Recovery collars & suits', /recovery|post-op/i],
    ['rehab', 'Heat, cooling & rehab', /rehabilitation|light therapy|heat pad|cooling|therapeutic/i],
    ['boots', 'Boots', /boot/i],
    ['beds', 'Beds & bedding', /bed/i],
    ['dental', 'Dental care', /dental|tooth/i],
    ['flea', 'Flea & tick', /flea/i],
    ['eareye', 'Ear & eye care', /^ear |^eye /i],
    ['groom', 'Shampoo & grooming', /shampoo|groom|conditioner|detangl|deodor|cologne|spa|paw cleaner|drying|towel|wipes|spray|disinfect|sanitis/i],
    ['food', 'Food & treats', /food|treat|topper|diet/i],
    ['feed', 'Bowls & enrichment', /bowl|feeder|feeding|enrichment|lick mat|toy/i]
  ];
  var TGN = { other: 'Other' }; TG.forEach(function (g) { TGN[g[0]] = g[1]; });
  function tgroup(p) { for (var i = 0; i < TG.length; i++) if (TG[i][2].test(p.productType || '')) return TG[i][0]; return 'other'; }
  /* a tidy product type label for the "Product type" facet */
  var TSYN = { 'supplements & healthcare': 'Supplement', 'dog treat': 'Treat', 'treats': 'Treat', 'pet treat': 'Treat', 'orthopedic support': 'Orthopaedic support', 'splint / orthopaedic support': 'Orthopaedic splint', 'brace / orthopaedic support': 'Orthopaedic brace', 'joint support / brace': 'Orthopaedic brace', 'dog lift harness': 'Lift harness', 'dog ramp': 'Ramp', 'dog bed': 'Bed', 'pet bed & bedding': 'Bedding', 'pet bedding': 'Bedding', 'recovery wear': 'Recovery suit', 'recovery shirt': 'Recovery suit', 'dog recovery collar': 'Recovery collar', 'shampoo': 'Shampoo', 'dog shampoo': 'Shampoo', 'no rinse shampoo': 'No-rinse shampoo', 'first aid & wound care': 'First aid', 'first aid & recovery': 'First aid', 'dental': 'Dental care', 'dog toy': 'Toy', 'dog bowl / feeder': 'Bowl', 'slow feeder bowl': 'Bowl' };
  function tlabel(p) {
    var t = String(p.productType || 'Other').split(',')[0].trim(), k = t.toLowerCase();
    if (TSYN[k]) return TSYN[k];
    t = t.replace(/^Dog\s+/i, '').replace(/™/g, '');
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }

  /* supplement sub-categories (every supplement's productType is the same, so group by what it is for) */
  var SUBS = [
    ['joint', 'Joint & mobility', 'For joints & mobility', /joint|mobility|glucosamine|chondroitin|green.?lipped|turmeric|\bhip|arthrit|collagen|\bmsm\b/i],
    ['skin', 'Skin & coat', 'For skin & coat', /skin|coat|itch|omega|salmon|fish.oil|allerg|krill/i],
    ['gut', 'Digestion', 'For digestion', /gut|digest|probiotic|prebiotic|tummy|stool|diarr|pumpkin|fibre|constipation|anal.gland/i],
    ['calm', 'Calming', 'For calm & confidence', /calm|anxi|stress|relax/i],
    ['senior', 'Senior', 'For older dogs', /senior|older|ageing|aging/i],
    ['multi', 'Multivitamins', 'For everyday health', /multi|vitamin|superfood|wellness|immun|\d+.in.1/i],
    ['dental', 'Dental', 'For teeth & breath', /dental|plaque|tartar|breath|teeth|seaweed/i],
    ['urinary', 'Urinary & kidney', 'For kidneys & bladder', /urinary|kidney|bladder|cranberry|renal/i]
  ];
  var FOR = { 'arthritis': 'Arthritis', 'hip-dysplasia': 'Hip dysplasia', 'elbow-dysplasia': 'Elbow dysplasia', 'cruciate-ligament': 'Cruciate ligament', 'luxating-patella': 'Luxating patella', 'rear-leg-weakness': 'Rear leg weakness', 'back-pain': 'Back pain', 'spondylosis': 'Spondylosis', 'ivdd': 'IVDD', 'paralysis': 'Paralysis', 'knuckling': 'Knuckling', 'carpal-hyperextension': 'Carpal hyperextension', 'itchy-skin': 'Itchy skin', 'hot-spots': 'Hot spots', 'seasonal-allergies': 'Seasonal allergies', 'ear-eye-care': 'Ears & eyes', 'digestive-issues': 'Digestive issues', 'kidney-support': 'Kidney support', 'weight-management': 'Weight management', 'anxiety': 'Anxiety', 'separation-anxiety': 'Separation anxiety', 'noise-fear': 'Noise fear', 'dental-disease': 'Dental disease', 'wound-recovery': 'Wound recovery', 'post-surgery-recovery': 'Post-surgery recovery', 'senior-support': 'Senior support' };

  /* ---------- the collections the preview can show ---------- */
  function hasTag(p, re) { return p.tags.some(function (t) { return re.test(t); }); }
  var COLS = {
    supplements: {
      kind: 'category', name: 'Supplements & health', h1: 'Supplements <em>&amp; health</em>',
      crumb: [['Shop by product', '#']], line: 'Joint, skin, gut and calming supplements for dogs who need a little extra support.',
      pick: function () { return window.PP_PRODUCTS.filter(function (p) { return tgroup(p) === 'supps'; }); },
      subs: 'supps',
      about: ['Our supplements range covers joints and mobility, skin and coat, digestion, calming, senior dogs and everyday multivitamins, from specialist UK and European brands.',
        'Most supplements take a few weeks of daily use before you will see a difference, so pick one and give it time. Buy any two supplements and save 10%, or three and save 15%.',
        'If your dog is on medication or has a diagnosed condition, check with your vet before adding a supplement.']
    },
    mobility: {
      kind: 'category', name: 'Mobility & recovery aids', h1: 'Mobility <em>&amp; recovery aids</em>',
      crumb: [['Shop by product', '#']], line: 'Braces, wheelchairs, lifting harnesses, ramps and recovery wear for dogs who need a hand.',
      pick: function () { return window.PP_PRODUCTS.filter(function (p) { return ['braces', 'wheel', 'harness', 'ramps', 'recovery', 'rehab', 'boots'].indexOf(tgroup(p)) > -1; }); },
      subs: 'groups',
      about: ['Braces and splints support a single joint; harnesses and wheelchairs take weight off weak legs; ramps save jumps in and out of the car; recovery suits and collars protect a wound after surgery.',
        'Braces and wheelchairs come in sizes, so measure your dog first using the size guide on each product. Every wheelchair comes with a free fitting.',
        'For a new injury or sudden lameness, see your vet first. Supports work best alongside the plan they give you.']
    },
    arthritis: {
      kind: 'condition', key: 'arthritis', name: 'Arthritis', h1: '<em>Arthritis</em>', crumb: [['Shop by condition', '#'], ['Mobility & joints', '#']],
      line: 'Joint supplements, orthopaedic beds, warmth and ramps for stiff, sore joints.',
      guide: 'What helps with arthritis', tags: /^(arthritis|osteoarthritis|arthritis-support|arthrosis|joint-pain)$/i, kit: 'arthritis-bundle',
      about: ['Arthritis is wear and inflammation inside a joint. It is most common in older and larger dogs, and after old injuries or hip and elbow dysplasia.',
        'Most owners combine a daily joint supplement, a supportive bed kept warm, and fewer jumps: ramps for the car and sofa, and short, regular walks.',
        'Our guides don\'t replace your vet, who can also talk to you about pain relief.']
    },
    'itchy-skin': {
      kind: 'condition', key: 'itchy-skin', name: 'Itchy skin', h1: '<em>Itchy</em> skin', crumb: [['Shop by symptom', '#'], ['Skin & coat', '#']],
      line: 'Soothing sprays and balms, gentle shampoos and skin supplements to calm the itch.',
      guide: 'What helps with itchy skin', tags: /^(itchy-skin|itchy skin|itch-relief|itching|skin-irritation|itch-relief-shampoo|allergy-relief)$/i, kit: 'itchy-skin-bundle',
      about: ['Itching usually comes from fleas, allergies to pollen, dust mites or food, or dry skin. The scratching itself makes the skin sorer, so calming the itch helps it heal.',
        'Most owners combine three things: something on the skin (a spray or balm), a gentle wash, and support from the inside (a skin supplement or fish oil).',
        'Our guides don\'t replace your vet, who can test for allergies and infection.']
    },
    limping: {
      kind: 'condition', key: 'legs-paws/limping-or-favouring-a-leg', area: 'legs-paws', name: 'Limping', h1: '<em>Limping</em> or favouring a leg', crumb: [['Shop by symptom', '#'], ['Legs & paws', '#']],
      line: 'Joint braces, supports, paw care and cold therapy for a dog who is favouring a leg.',
      guide: 'Why is my dog limping?', tags: /^(limping|lameness|sprain|injury-recovery)$/i,
      about: ['A limp can come from a sore paw, a sprain, a knee or hip problem, or arthritis. Check the paw first for thorns, cuts or a broken nail.',
        'Braces support a knee, hock or wrist while it heals; cold packs help in the first days after a knock; paw balm and boots protect sore pads.',
        'A limp that lasts more than a day or two needs your vet. Our guides don\'t replace them.']
    }
  };
  var ORDER = ['supplements', 'mobility', 'arthritis', 'itchy-skin', 'limping'];

  /* ---------- state ---------- */
  var C, ALL, FACETS, FBY, PILLS, KIT = null, S;
  var SORTS = [['rec', 'Recommended'], ['rating', 'Top rated'], ['reviews', 'Most reviewed'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name: A to Z']];
  function blank() { return { sub: '', brand: [], for: [], offer: [], type: [], rating: '', min: null, max: null, sort: 'rec', page: 1, view: S ? S.view : 'grid' }; }

  function load(key) {
    C = COLS[key] || COLS.supplements; C.id = COLS[key] ? key : 'supplements';
    var list;
    if (C.kind === 'condition') {
      var seen = {}; list = [];
      var add = function (h) { if (BY[h] && !seen[h]) { seen[h] = 1; list.push(BY[h]); } };
      (TAGS[C.key] || []).forEach(add);
      if (C.area) (TAGS[C.area] || []).forEach(add);
      window.PP_PRODUCTS.forEach(function (p) { if (hasTag(p, C.tags)) add(p.handle); });
      KIT = C.kit && BY[C.kit] ? BY[C.kit] : null;
      if (KIT) add(KIT.handle);
    } else { list = C.pick(); KIT = null; }
    ALL = list;
    var best = C.kind === 'condition' ? (TAGS[C.key] || []).concat(C.area ? TAGS[C.area] || [] : []) : [];
    ALL.forEach(function (p, i) {
      var txt = p.title + ' ' + p.tags.join(' ') + ' ' + p.productType;
      p._g = tgroup(p); p._t = tlabel(p);
      p._subs = SUBS.filter(function (s) { return s[3].test(txt); }).map(function (s) { return s[0]; });
      p._for = Object.keys(FOR).filter(function (k) { return (TAGS[k] || []).indexOf(p.handle) > -1; });
      p._offers = PPOffers.forProduct(p).map(function (o) { return o.id; });
      p._sale = !!(p.compareAt && p.compareAt > p.price);
      p._name = p.title.replace(/\s*\|\s*/g, ' ').trim();
      var bi = best.indexOf(p.handle);
      p._score = (p.rating ? p.rating * 1.5 + Math.min(p.reviewCount, 20) / 4 : 0) + p._for.length * 0.8 + (bi > -1 ? 30 - bi : 0) + (p === KIT ? 999 : 0);
      p._i = i;
    });
    /* "Recommended": best match first, avoiding two of the same brand side by side where possible */
    var pool = ALL.slice().sort(function (a, b) { return b._score - a._score || a._i - b._i; }), out = [];
    while (pool.length) {
      var last = out.length ? out[out.length - 1].brand : null, k = 0;
      while (k < pool.length && pool[k].brand === last && k < 5) k++;
      if (k >= pool.length) k = 0;
      out.push(pool.splice(k, 1)[0]);
    }
    out.forEach(function (p, i) { p._rec = i; });

    /* quick-filter pills */
    if (C.subs === 'supps') PILLS = SUBS.map(function (s) { return { v: s[0], n: s[1], t: function (p) { return p._subs.indexOf(s[0]) > -1; } }; });
    else {
      var gs = count(ALL, function (p) { return [p._g]; });
      PILLS = gs.map(function (g) { return { v: g, n: TGN[g], t: function (p) { return p._g === g; } }; });
    }
    PILLS = PILLS.filter(function (x) { return ALL.some(x.t); });

    var brands = count(ALL, function (p) { return [p.brand]; });
    var fors = count(ALL, function (p) { return p._for.filter(function (k) { return k !== C.key; }); });
    var types = count(ALL, function (p) { return [p._t]; });
    var offers = PPOffers.all.filter(function (o) { return ALL.some(function (p) { return p._offers.indexOf(o.id) > -1; }); }).map(function (o) { return { v: o.id, n: o.name }; });
    if (ALL.some(function (p) { return p._sale; })) offers.push({ v: 'sale', n: 'Reduced price' });
    FACETS = [
      { f: 'brand', n: 'Brand', multi: true, search: brands.length > 8, opts: brands.map(function (b) { return { v: b, n: b }; }), t: function (p, v) { return p.brand === v; } },
      { f: 'price', n: 'Price', range: true },
      { f: 'rating', n: 'Customer rating', multi: false, opts: [{ v: '4', n: '4 stars & up' }, { v: '3', n: '3 stars & up' }], t: function (p, v) { return (p.rating || 0) >= +v; } },
      { f: 'for', n: C.kind === 'condition' ? 'Also helps with' : 'For', multi: true, opts: fors.map(function (k) { return { v: k, n: FOR[k] }; }), t: function (p, v) { return p._for.indexOf(v) > -1; } },
      { f: 'offer', n: 'Offers', multi: true, opts: offers, t: function (p, v) { return v === 'sale' ? p._sale : p._offers.indexOf(v) > -1; } },
      { f: 'type', n: 'Product type', multi: true, opts: types.map(function (t) { return { v: t, n: t }; }), t: function (p, v) { return p._t === v; } }
    ].filter(function (F) { return F.range || F.opts.length > 1 || F.f === 'offer' && F.opts.length; });
    FBY = {}; FACETS.forEach(function (F) { FBY[F.f] = F; });
    C.lo = Math.floor(Math.min.apply(null, ALL.map(function (p) { return p.price; })));
    C.hi = Math.ceil(Math.max.apply(null, ALL.map(function (p) { return p.price; })));
  }
  function count(list, fn) {
    var m = {}; list.forEach(function (p) { fn(p).forEach(function (k) { m[k] = (m[k] || 0) + 1; }); });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a] || a.localeCompare(b); });
  }

  /* ---------- filtering ---------- */
  function pass(p, skip) {
    if (skip !== 'sub' && S.sub) { var pl = PILLS.filter(function (x) { return x.v === S.sub; })[0]; if (pl && !pl.t(p)) return false; }
    if (skip !== 'price') { if (S.min != null && p.price < S.min) return false; if (S.max != null && p.price > S.max) return false; }
    if (skip !== 'rating' && S.rating && (p.rating || 0) < +S.rating) return false;
    for (var i = 0; i < FACETS.length; i++) {
      var F = FACETS[i]; if (F.range || F.f === 'rating' || F.f === skip) continue;
      var sel = S[F.f]; if (!sel.length) continue;
      if (!sel.some(function (v) { return F.t(p, v); })) return false;
    }
    return true;
  }
  function results() {
    var r = ALL.filter(function (p) { return pass(p); }), s = S.sort;
    r.sort(function (a, b) {
      if (s === 'price-asc') return a.price - b.price || a._rec - b._rec;
      if (s === 'price-desc') return b.price - a.price || a._rec - b._rec;
      if (s === 'rating') return (b.rating || 0) - (a.rating || 0) || b.reviewCount - a.reviewCount || a._rec - b._rec;
      if (s === 'reviews') return b.reviewCount - a.reviewCount || a._rec - b._rec;
      if (s === 'name') return a._name.localeCompare(b._name);
      return a._rec - b._rec;
    });
    return r;
  }
  function applied() {
    var out = [];
    if (S.sub) { var pl = PILLS.filter(function (x) { return x.v === S.sub; })[0]; if (pl) out.push({ f: 'sub', v: S.sub, n: pl.n }); }
    FACETS.forEach(function (F) {
      if (F.range) {
        if (S.min != null || S.max != null) out.push({ f: 'price', v: '', n: (S.min != null ? money0(S.min) : money0(C.lo)) + ' to ' + (S.max != null ? money0(S.max) : money0(C.hi)) });
      } else if (F.f === 'rating') { if (S.rating) out.push({ f: 'rating', v: S.rating, n: S.rating + ' stars & up' }); }
      else S[F.f].forEach(function (v) { var o = F.opts.filter(function (x) { return x.v === v; })[0]; out.push({ f: F.f, v: v, n: o ? o.n : v }); });
    });
    return out;
  }

  /* ---------- URL hash ---------- */
  function toHash() {
    var parts = ['c=' + C.id];
    if (S.sub) parts.push('sub=' + S.sub);
    ['brand', 'for', 'offer', 'type'].forEach(function (f) { if (S[f].length) parts.push(f + '=' + S[f].map(encodeURIComponent).join('|')); });
    if (S.rating) parts.push('rating=' + S.rating);
    if (S.min != null) parts.push('min=' + S.min);
    if (S.max != null) parts.push('max=' + S.max);
    if (S.sort !== 'rec') parts.push('sort=' + S.sort);
    if (S.page > 1) parts.push('page=' + S.page);
    if (S.view === 'list') parts.push('view=list');
    var h = '#' + parts.join('&');
    if (location.hash !== h) { try { history.replaceState(null, '', h); } catch (e) { lastHash = h; location.hash = h; } }
    lastHash = location.hash;
    $$('[data-ver]').forEach(function (a) { a.href = a.getAttribute('data-ver') + h; });
  }
  var lastHash = '';
  function fromHash() {
    var kv = {}; location.hash.replace(/^#/, '').split('&').forEach(function (x) { var i = x.indexOf('='); if (i > 0) kv[x.slice(0, i)] = x.slice(i + 1); });
    var key = kv.c && COLS[kv.c] ? kv.c : 'supplements';
    if (!C || C.id !== key) { load(key); built = false; }
    S = blank();
    if (kv.sub && PILLS.some(function (x) { return x.v === kv.sub; })) S.sub = kv.sub;
    ['brand', 'for', 'offer', 'type'].forEach(function (f) {
      if (!kv[f] || !FBY[f]) return;
      var ok = FBY[f].opts.map(function (o) { return o.v; });
      S[f] = kv[f].split('|').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } }).filter(function (x) { return ok.indexOf(x) > -1; });
    });
    if (kv.rating === '4' || kv.rating === '3') S.rating = kv.rating;
    if (kv.min && !isNaN(+kv.min)) S.min = +kv.min;
    if (kv.max && !isNaN(+kv.max)) S.max = +kv.max;
    if (kv.sort && SORTS.some(function (s) { return s[0] === kv.sort; })) S.sort = kv.sort;
    if (kv.page) S.page = Math.max(1, parseInt(kv.page, 10) || 1);
    S.view = kv.view === 'list' ? 'list' : 'grid';
  }

  /* ---------- the card: exactly the homepage .pk, plus the offer badge and offer line ---------- */
  function stars(r) {
    var h = '<span class="stars" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) { var f = r - (i - 1); h += f >= 1 ? '<i class="on"></i>' : f > 0 ? '<i class="part" style="--f:' + Math.round(f * 100) + '%"></i>' : '<i></i>'; }
    return h + '</span>';
  }
  function helps(p) {
    if (p === KIT) return 'Complete care kit for ' + C.name.toLowerCase();
    if (C.kind === 'condition') return 'For ' + C.name.toLowerCase();
    if (p._for.length) return 'For ' + FOR[p._for[0]].toLowerCase();
    var s = SUBS.filter(function (x) { return p._subs.indexOf(x[0]) > -1; })[0];
    return s ? s[2] : TGN[p._g];
  }
  function img(p, cls) {
    return p.img ? '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(p.img) + '" alt="" loading="lazy" onerror="this.onerror=null;this.remove()">' : '';
  }
  function card(p) {
    var badge = PPOffers.badge(p), line = PPOffers.lines(p)[0], n = p.reviewCount, r = Math.round((p.rating || 0) * 10) / 10;
    var tab = badge ? '<span class="tab sale">' + esc(badge) + '</span>' : (C.kind === 'condition' ? '<span class="tab">' + esc(TGN[p._g]) + '</span>' : '');
    return '<article class="pk' + (p === KIT ? ' cl-kit' : '') + '">' + tab +
      '<a class="well" href="#" tabindex="-1" aria-hidden="true">' + img(p) + '</a>' +
      '<div class="body"><span class="brand">' + esc(p.brand) + '</span><a class="name" href="#">' + esc(p._name) + '</a>' +
      (p.rating ? '<a class="rev" href="#" aria-label="Rated ' + r + ' out of 5 from ' + n + ' review' + (n === 1 ? '' : 's') + '">' + stars(p.rating) + '<span>' + r.toFixed(1) + ' <em>(' + n + ' review' + (n === 1 ? '' : 's') + ')</em></span></a>' : '<span class="rev none" aria-hidden="true"></span>') +
      '<span class="helps">' + esc(helps(p)) + '</span>' +
      '<div class="price"><span class="now">' + money(p.price) + '</span>' + (p._sale ? '<span class="was">' + money(p.compareAt) + '</span><span class="save">Save ' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>' : '') + '</div>' +
      (line ? '<span class="cl-ofl">' + esc(line) + '</span>' : '') +
      '<button class="btn" type="button" data-add="' + esc(p.handle) + '">Add to basket</button></div></article>';
  }

  /* ---------- facet markup (used by the sidebar, the dropdown bar and the mobile sheet) ---------- */
  var uid = 0;
  function facetBody(F, where) {
    var id = 'cl-' + where + '-' + F.f + '-' + (++uid), h = '';
    if (F.range) {
      return '<div class="cl-range" data-range><div class="cl-rin"><label><span>Min</span><span class="cl-cur">£<input type="number" inputmode="decimal" min="0" step="1" data-min placeholder="' + C.lo + '" aria-label="Minimum price in pounds"></span></label>' +
        '<span class="cl-to" aria-hidden="true">to</span><label><span>Max</span><span class="cl-cur">£<input type="number" inputmode="decimal" min="0" step="1" data-max placeholder="' + C.hi + '" aria-label="Maximum price in pounds"></span></label>' +
        '<button class="cl-go" type="button" data-price-go>Go</button></div>' +
        '<div class="cl-presets">' + presets().map(function (x) { return '<button type="button" data-preset="' + x[0] + '-' + x[1] + '">' + esc(x[2]) + '</button>'; }).join('') + '</div></div>';
    }
    if (F.search) h += '<div class="cl-bs"><label class="sr" for="' + id + '-q">Search brands</label><input id="' + id + '-q" type="search" placeholder="Search ' + F.opts.length + ' brands" data-bsearch autocomplete="off"></div>';
    var lim = F.opts.length > 8 && where !== 'dd' ? 6 : 99;
    h += '<div class="cl-opts" id="' + id + '" role="group" aria-label="' + esc(F.n) + '">';
    F.opts.forEach(function (o, i) {
      h += '<label class="cl-opt' + (i >= lim ? ' cl-x' : '') + '"><input type="' + (F.multi ? 'checkbox' : 'radio') + '" name="' + id + '" data-f="' + F.f + '" value="' + esc(o.v) + '">' +
        '<span class="cl-ol">' + (F.f === 'rating' ? stars(+o.v) + '<span>&amp; up</span><span class="sr">' + esc(o.n) + '</span>' : esc(o.n)) + '</span><span class="cl-n" data-cnt="' + F.f + '" data-v="' + esc(o.v) + '"></span></label>';
    });
    h += '</div>';
    if (lim < F.opts.length) h += '<button class="cl-more" type="button" aria-expanded="false" aria-controls="' + id + '" data-n="' + F.opts.length + '">Show all ' + F.opts.length + '</button>';
    return h;
  }
  function presets() {
    var cut = C.hi > 80 ? [[0, 20], [20, 50], [50, 100], [100, 0]] : [[0, 10], [10, 20], [20, 30], [30, 0]];
    return cut.map(function (x) { return [x[0], x[1], x[1] ? (x[0] ? '£' + x[0] + ' to £' + x[1] : 'Under £' + x[1]) : '£' + x[0] + ' and over']; });
  }
  function facetGroup(F, where, open) {
    var id = 'cl-g-' + where + '-' + F.f;
    return '<div class="cl-fg' + (open ? ' open' : '') + '" data-fg="' + F.f + '"><h3><button type="button" class="cl-fh" aria-expanded="' + !!open + '" aria-controls="' + id + '">' + esc(F.n) + '<span class="cl-fsel" data-fsel="' + F.f + '"></span><i class="cl-chev" aria-hidden="true"></i></button></h3>' +
      '<div class="cl-fb" id="' + id + '"' + (open ? '' : ' hidden') + '>' + facetBody(F, where) + '</div></div>';
  }
  function facetList(where, openN) {
    return FACETS.map(function (F, i) { return facetGroup(F, where, i < openN || (F.range ? S.min != null || S.max != null : F.f === 'rating' ? !!S.rating : S[F.f].length > 0)); }).join('');
  }

  /* ---------- build (once per collection) ---------- */
  var built = false;
  function build() {
    built = true;
    var n = ALL.length;
    /* preview switcher */
    var pv = $('#cl-pv');
    if (pv) pv.innerHTML = '<span>Preview</span>' + ORDER.map(function (k) { return '<a href="#c=' + k + '"' + (k === C.id ? ' class="on" aria-current="page"' : '') + '>' + esc(COLS[k].name) + '</a>'; }).join('');
    /* header */
    document.title = C.name + '. Poorly Pet';
    var crumbs = '<nav class="cl-bc" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li>' + C.crumb.map(function (c) { return '<li><a href="' + c[1] + '">' + esc(c[0]) + '</a></li>'; }).join('') + '<li aria-current="page">' + esc(C.name) + '</li></ol></nav>';
    var brands = count(ALL, function (p) { return [p.brand]; }).length;
    var rated = ALL.filter(function (p) { return p.rating; }), rc = rated.reduce(function (a, p) { return a + p.reviewCount; }, 0);
    var avg = rc ? rated.reduce(function (a, p) { return a + p.rating * p.reviewCount; }, 0) / rc : 0;
    var guide = C.guide ? '<a class="cl-guide" href="symptom-guide-a.html"><span>Guide:</span> ' + esc(C.guide) + ' <i aria-hidden="true">›</i></a>' : '';
    var head = $('#cl-head');
    if (V === 'c') {
      head.innerHTML = crumbs + '<div class="cl-hcard"><div class="cl-hl"><h1>' + C.h1 + '</h1><p>' + esc(C.line) + '</p>' + guide + '</div>' +
        '<dl class="cl-facts"><div><dt>Products</dt><dd>' + n + '</dd></div><div><dt>Brands</dt><dd>' + brands + '</dd></div>' +
        (rc ? '<div><dt>Owner rating</dt><dd>' + stars(avg) + ' ' + avg.toFixed(1) + ' <small>(' + rc + ')</small></dd></div>' : '') + '</dl></div>';
    } else {
      head.innerHTML = crumbs + '<div class="cl-ht"><h1>' + C.h1 + '</h1><span class="cl-hn">' + n + ' products</span></div><p class="cl-line">' + esc(C.line) + '</p>' + guide;
    }
    /* offer banner: only the offers that apply here */
    var ob = $('#cl-offer');
    if (ob) {
      var offs = PPOffers.all.filter(function (o) { return ALL.some(function (p) { return p._offers.indexOf(o.id) > -1; }); });
      ob.innerHTML = offs.length ? '<div class="cl-ob"><b>This month</b><ul>' + offs.map(function (o) { return '<li><button type="button" data-offer="' + o.id + '">' + esc(o.name) + '</button></li>'; }).join('') + '</ul><a href="#" class="cl-oball">All offers ›</a></div>' : '';
      ob.hidden = !offs.length;
    }
    /* quick filters */
    var pills = $('#cl-pills');
    if (pills) pills.innerHTML = '<div class="cl-pills" role="group" aria-label="Quick filters"><button type="button" data-sub="" class="cl-pill">All <span data-pn=""></span></button>' +
      PILLS.map(function (x) { return '<button type="button" data-sub="' + x.v + '" class="cl-pill">' + esc(x.n) + ' <span data-pn="' + x.v + '"></span></button>'; }).join('') + '</div>';
    var car = $('#cl-car');
    if (car) {
      car.innerHTML = '<div class="cl-cr" tabindex="0" role="group" aria-label="Shop by type">' + [{ v: '', n: 'Shop all', t: function () { return true; } }].concat(PILLS).map(function (x) {
        var top = ALL.filter(x.t).sort(function (a, b) { return a._rec - b._rec; })[0];
        return '<button type="button" class="cl-ct" data-sub="' + x.v + '"><span class="cl-cw">' + (top ? img(top) : '') + '</span><span class="cl-cn">' + esc(x.n) + '</span><span class="cl-cc" data-pn="' + x.v + '"></span></button>';
      }).join('') + '</div><button class="cl-carr prev" type="button" aria-label="Scroll back">‹</button><button class="cl-carr next" type="button" aria-label="Scroll forward">›</button>';
    }
    /* sidebar / dropdown bar / sheet */
    var side = $('#cl-side');
    if (side) side.innerHTML = '<div class="cl-sh"><h2>Filter</h2><button type="button" class="cl-clear" data-clear>Clear all</button></div><div class="cl-chips cl-schips" data-chips></div>' + facetList('side', V === 'a' ? 3 : 1);
    var fbar = $('#cl-fbar');
    if (fbar) fbar.innerHTML = FACETS.map(function (F) {
      var id = 'cl-dd-' + F.f;
      return '<div class="cl-dd" data-dd="' + F.f + '"><button type="button" class="cl-ddb" aria-expanded="false" aria-controls="' + id + '">' + esc(F.n === 'Customer rating' ? 'Rating' : F.n) + '<span class="cl-fsel" data-fsel="' + F.f + '"></span><i class="cl-chev" aria-hidden="true"></i></button>' +
        '<div class="cl-ddp" id="' + id + '" hidden>' + facetBody(F, 'dd') + '<div class="cl-ddf"><button type="button" class="cl-reset" data-reset="' + F.f + '">Reset</button><button type="button" class="btn sec sm" data-ddclose>Done</button></div></div></div>';
    }).join('');
    $('#cl-sheetbody').innerHTML = '<div class="cl-chips" data-chips></div>' + facetList('sheet', 0);
    /* sort selects */
    $$('select[data-sort]').forEach(function (s) { s.innerHTML = SORTS.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join(''); });
    /* about */
    var ab = $('#cl-about');
    if (ab) ab.innerHTML = '<p>' + esc(C.about[0]) + '</p><div id="cl-abmore" hidden>' + C.about.slice(1).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div><button type="button" class="cl-abt" aria-expanded="false" aria-controls="cl-abmore">Read more</button>';
    var abh = $('#cl-abh'); if (abh) abh.innerHTML = 'About <em>' + esc(C.name.toLowerCase()) + '</em>';
  }

  /* ---------- render (every change) ---------- */
  function render(scrollUp) {
    if (!built) build();
    var r = results(), total = r.length, pages = Math.max(1, Math.ceil(total / PAGE));
    if (S.page > pages) S.page = pages;
    var from = (S.page - 1) * PAGE, slice = r.slice(from, from + PAGE);
    var grid = $('#cl-grid');
    grid.className = 'cl-grid' + (S.view === 'list' ? ' cl-list' : '');
    grid.innerHTML = slice.length ? slice.map(card).join('') : '<div class="cl-empty"><h2>No products match those filters</h2><p>Try removing a filter, or <button type="button" data-clear>clear them all</button>.</p></div>';
    grid.setAttribute('aria-busy', 'false');
    /* counts */
    $$('[data-count]').forEach(function (e) { e.textContent = total + ' product' + (total === 1 ? '' : 's'); });
    $$('[data-showing]').forEach(function (e) { e.textContent = total ? 'Showing ' + (from + 1) + '–' + (from + slice.length) + ' of ' + total : 'No results'; });
    $$('[data-sheetn]').forEach(function (e) { e.textContent = 'Show ' + total + ' result' + (total === 1 ? '' : 's'); });
    var st = $('#cl-status'); if (st) st.textContent = total + ' products found';
    /* pills */
    $$('[data-sub]').forEach(function (b) {
      var v = b.getAttribute('data-sub'); b.setAttribute('aria-pressed', String(S.sub === v));
      b.classList.toggle('on', S.sub === v);
    });
    $$('[data-pn]').forEach(function (e) {
      var v = e.getAttribute('data-pn'), pl = PILLS.filter(function (x) { return x.v === v; })[0];
      var c = ALL.filter(function (p) { return pass(p, 'sub') && (!pl || pl.t(p)); }).length;
      e.textContent = e.classList.contains('cl-cc') ? c + (c === 1 ? ' product' : ' products') : c;
      var b = e.closest('[data-sub]'); if (b) b.disabled = !c && S.sub !== v;
    });
    /* facet inputs + counts */
    var cache = {};
    $$('[data-cnt]').forEach(function (e) {
      var f = e.getAttribute('data-cnt'), v = e.getAttribute('data-v'), F = FBY[f], key = f + '|' + v;
      if (!(key in cache)) cache[key] = ALL.filter(function (p) { return pass(p, f) && F.t(p, v); }).length;
      e.textContent = '(' + cache[key] + ')';
      var inp = e.parentNode.querySelector('input');
      var on = f === 'rating' ? S.rating === v : S[f].indexOf(v) > -1;
      inp.checked = on; inp.disabled = !cache[key] && !on;
      e.parentNode.classList.toggle('cl-zero', !cache[key] && !on);
    });
    $$('[data-min]').forEach(function (i) { if (document.activeElement !== i) i.value = S.min != null ? S.min : ''; });
    $$('[data-max]').forEach(function (i) { if (document.activeElement !== i) i.value = S.max != null ? S.max : ''; });
    $$('[data-preset]').forEach(function (b) { var m = b.getAttribute('data-preset').split('-'); b.setAttribute('aria-pressed', String(S.min === (+m[0] || null) && S.max === (+m[1] || null) && (S.min != null || S.max != null))); });
    $$('[data-fsel]').forEach(function (e) {
      var f = e.getAttribute('data-fsel'), n = f === 'price' ? (S.min != null || S.max != null ? 1 : 0) : f === 'rating' ? (S.rating ? 1 : 0) : S[f].length;
      e.textContent = n ? ' (' + n + ')' : '';
    });
    /* applied chips */
    var ap = applied();
    $$('[data-chips]').forEach(function (e) {
      e.innerHTML = ap.length ? ap.map(function (a) { return '<button type="button" class="cl-chip" data-rm="' + a.f + '" data-v="' + esc(a.v) + '" aria-label="Remove filter ' + esc(a.n) + '">' + esc(a.n) + ' <i aria-hidden="true">×</i></button>'; }).join('') + '<button type="button" class="cl-clearlink" data-clear>Clear all</button>' : '';
      e.hidden = !ap.length;
    });
    $$('[data-clear]').forEach(function (b) { if (b.classList.contains('cl-clear')) b.hidden = !ap.length; });
    $$('[data-fcount]').forEach(function (e) { var n = ap.length; e.textContent = n ? n : ''; e.hidden = !n; });
    $$('select[data-sort]').forEach(function (s) { s.value = S.sort; });
    $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === S.view)); });
    $$('[data-offer]').forEach(function (b) { b.setAttribute('aria-pressed', String(S.offer.indexOf(b.getAttribute('data-offer')) > -1)); });
    /* pagination */
    var pg = $('#cl-pag');
    if (pg) {
      var h = '';
      if (pages > 1) {
        h += '<button type="button" class="cl-pp" data-page="' + (S.page - 1) + '"' + (S.page === 1 ? ' disabled' : '') + ' aria-label="Previous page">‹ <span>Previous</span></button><ol>';
        pageList(S.page, pages).forEach(function (n) {
          h += n === '…' ? '<li class="cl-gap" aria-hidden="true">…</li>' : '<li><button type="button" data-page="' + n + '"' + (n === S.page ? ' aria-current="page" class="on"' : '') + ' aria-label="Page ' + n + '">' + n + '</button></li>';
        });
        h += '</ol><button type="button" class="cl-pp" data-page="' + (S.page + 1) + '"' + (S.page === pages ? ' disabled' : '') + ' aria-label="Next page"><span>Next</span> ›</button>';
      }
      pg.innerHTML = '<p data-showing></p><div class="cl-pgn">' + h + '</div>';
      $$('[data-showing]', pg).forEach(function (e) { e.textContent = total ? 'Showing ' + (from + 1) + '–' + (from + slice.length) + ' of ' + total : ''; });
    }
    toHash();
    if (scrollUp) {
      var top = $('#cl-results'); if (top) { var y = top.getBoundingClientRect().top + window.pageYOffset - (V === 'b' && innerWidth >= 900 ? 80 : 12); if (window.pageYOffset > y) window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); }
    }
  }
  function pageList(p, n) {
    if (n <= 7) return range(1, n);
    if (p <= 4) return range(1, 5).concat(['…', n]);
    if (p >= n - 3) return [1, '…'].concat(range(n - 4, n));
    return [1, '…', p - 1, p, p + 1, '…', n];
  }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

  /* ---------- events ---------- */
  function change(fn, scroll) { fn(); S.page = 1; render(scroll); }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('input[data-f]')) {
      var f = t.getAttribute('data-f'), v = t.value;
      change(function () {
        if (f === 'rating') S.rating = t.checked && S.rating !== v ? v : '';
        else { var i = S[f].indexOf(v); if (t.checked && i < 0) S[f].push(v); if (!t.checked && i > -1) S[f].splice(i, 1); }
      });
    } else if (t.matches('select[data-sort]')) { S.sort = t.value; S.page = 1; render(true); }
  });
  /* radios cannot be unticked by clicking: allow it for rating */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.matches && t.matches('input[type=radio][data-f]') && S.rating === t.value) { e.preventDefault(); change(function () { S.rating = ''; }); return; }
    var b = t.closest && t.closest('button, a'); if (!b) return;
    if (b.hasAttribute('data-sub')) { var v = b.getAttribute('data-sub'); change(function () { S.sub = S.sub === v ? '' : v; }); return; }
    if (b.hasAttribute('data-offer')) { var o = b.getAttribute('data-offer'); change(function () { var i = S.offer.indexOf(o); if (i > -1) S.offer.splice(i, 1); else S.offer.push(o); }, true); return; }
    if (b.hasAttribute('data-rm')) {
      var f = b.getAttribute('data-rm'), rv = b.getAttribute('data-v');
      change(function () { if (f === 'sub') S.sub = ''; else if (f === 'price') { S.min = S.max = null; } else if (f === 'rating') S.rating = ''; else S[f] = S[f].filter(function (x) { return x !== rv; }); });
      focusAfter(); return;
    }
    if (b.hasAttribute('data-clear')) { e.preventDefault(); change(function () { var keep = { sort: S.sort, view: S.view }; S = blank(); S.sort = keep.sort; S.view = keep.view; }); return; }
    if (b.hasAttribute('data-reset')) { var rf = b.getAttribute('data-reset'); change(function () { if (rf === 'price') S.min = S.max = null; else if (rf === 'rating') S.rating = ''; else S[rf] = []; }); return; }
    if (b.hasAttribute('data-preset')) { var m = b.getAttribute('data-preset').split('-'); change(function () { var a = +m[0] || null, z = +m[1] || null; if (S.min === a && S.max === z) S.min = S.max = null; else { S.min = a; S.max = z; } }); return; }
    if (b.hasAttribute('data-price-go')) { applyPrice(b.closest('[data-range]')); return; }
    if (b.hasAttribute('data-page')) { if (b.disabled) return; S.page = +b.getAttribute('data-page'); render(true); var cur = $('#cl-pag [aria-current]'); if (cur) cur.focus({ preventScroll: true }); return; }
    if (b.hasAttribute('data-view')) { S.view = b.getAttribute('data-view'); render(); return; }
    if (b.classList.contains('cl-fh')) { toggleGroup(b); return; }
    if (b.classList.contains('cl-more')) {
      var list = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') !== 'true';
      list.classList.toggle('cl-all', open); b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Show fewer' : 'Show all ' + b.getAttribute('data-n'); return;
    }
    if (b.classList.contains('cl-ddb')) { var dd = b.parentNode; var was = b.getAttribute('aria-expanded') === 'true'; closeDD(); if (!was) openDD(dd); return; }
    if (b.hasAttribute('data-ddclose')) { var d = b.closest('.cl-dd'); closeDD(); d.querySelector('.cl-ddb').focus(); return; }
    if (b.hasAttribute('data-sheet')) { openSheet(b); return; }
    if (b.hasAttribute('data-sheetclose')) { closeSheet(); return; }
    if (b.classList.contains('cl-abt')) {
      var mo = document.getElementById('cl-abmore'), op = b.getAttribute('aria-expanded') !== 'true';
      mo.hidden = !op; b.setAttribute('aria-expanded', String(op)); b.textContent = op ? 'Read less' : 'Read more'; return;
    }
    if (b.hasAttribute('data-add')) { added(b); return; }
    if (b.classList.contains('cl-carr')) { var cr = $('.cl-cr'); cr.scrollBy({ left: (b.classList.contains('prev') ? -1 : 1) * cr.clientWidth * 0.8, behavior: RM ? 'auto' : 'smooth' }); return; }
    if (b.matches('a[href="#"]')) e.preventDefault();
  });
  function focusAfter() {
    setTimeout(function () {
      var c = $$('[data-chips] .cl-chip, [data-chips] .cl-clearlink').filter(function (x) { return x.offsetParent; })[0] || $('#cl-results');
      if (c) c.focus({ preventScroll: true });
    }, 0);
  }
  function applyPrice(box) {
    var a = parseFloat($('[data-min]', box).value), z = parseFloat($('[data-max]', box).value);
    a = isNaN(a) || a <= 0 ? null : a; z = isNaN(z) || z <= 0 ? null : z;
    if (a != null && z != null && a > z) { var t = a; a = z; z = t; }
    change(function () { S.min = a; S.max = z; });
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === 'Enter' && t.matches && (t.matches('[data-min]') || t.matches('[data-max]'))) { e.preventDefault(); applyPrice(t.closest('[data-range]')); }
    if (e.key === 'Escape') {
      if (sheetOpen) closeSheet();
      else { var o = $('.cl-dd.open'); if (o) { closeDD(); o.querySelector('.cl-ddb').focus(); } }
    }
    if (e.key === 'Tab' && sheetOpen) {
      var f = $$('#cl-sheet button:not([disabled]), #cl-sheet input:not([disabled]), #cl-sheet select').filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t.matches('[data-bsearch]')) return;
    var q = t.value.trim().toLowerCase(), box = t.closest('.cl-fb, .cl-ddp');
    box.classList.toggle('cl-searching', !!q);
    $$('.cl-opt', box).forEach(function (l) { l.classList.toggle('cl-hide', !!q && l.textContent.toLowerCase().indexOf(q) < 0); });
  });
  function toggleGroup(b) {
    var g = b.closest('.cl-fg'), open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open)); g.classList.toggle('open', open);
    document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
  }
  /* B: dropdowns */
  function openDD(dd) {
    dd.classList.add('open'); var b = dd.querySelector('.cl-ddb'), p = dd.querySelector('.cl-ddp');
    b.setAttribute('aria-expanded', 'true'); p.hidden = false;
    p.style.left = ''; p.style.right = '';
    var r = p.getBoundingClientRect(); if (r.right > innerWidth - 16) { p.style.left = 'auto'; p.style.right = '0'; }
    var f = p.querySelector('input:not([disabled])'); if (f) f.focus();
  }
  function closeDD() { $$('.cl-dd.open').forEach(function (d) { d.classList.remove('open'); d.querySelector('.cl-ddb').setAttribute('aria-expanded', 'false'); d.querySelector('.cl-ddp').hidden = true; }); }
  document.addEventListener('mousedown', function (e) { if (!e.target.closest('.cl-dd')) closeDD(); });
  document.addEventListener('focusin', function (e) { var o = $('.cl-dd.open'); if (o && !o.contains(e.target)) closeDD(); });
  /* the mobile filter sheet */
  var sheetOpen = false, opener = null;
  function openSheet(b) {
    opener = b; sheetOpen = true; var s = $('#cl-sheet');
    s.hidden = false; document.documentElement.classList.add('cl-lock');
    requestAnimationFrame(function () { s.classList.add('in'); });
    $('.cl-sx', s).focus();
  }
  function closeSheet() {
    sheetOpen = false; var s = $('#cl-sheet'); s.classList.remove('in'); document.documentElement.classList.remove('cl-lock');
    setTimeout(function () { if (!sheetOpen) s.hidden = true; }, RM ? 0 : 220);
    if (opener) opener.focus();
  }
  $('#cl-sheet').addEventListener('click', function (e) { if (e.target === this) closeSheet(); });
  /* add to basket (preview only) */
  function added(b) {
    var t = b.textContent; b.textContent = 'Added'; b.disabled = true;
    var cnt = document.querySelector('.act .cnt, .hdr .cnt'); if (cnt) cnt.textContent = (parseInt(cnt.textContent, 10) || 0) + 1;
    setTimeout(function () { b.textContent = t; b.disabled = false; }, 1400);
  }
  /* C: carousel arrows state */
  function carState() {
    var cr = $('.cl-cr'); if (!cr) return;
    $('.cl-carr.prev').disabled = cr.scrollLeft < 4;
    $('.cl-carr.next').disabled = cr.scrollLeft + cr.clientWidth > cr.scrollWidth - 4;
  }
  document.addEventListener('scroll', function (e) { if (e.target.classList && e.target.classList.contains('cl-cr')) carState(); }, true);
  window.addEventListener('resize', carState);
  /* B: shadow on the sticky toolbar once it sticks */
  var stick = $('.cl-stick');
  if (stick && 'IntersectionObserver' in window) {
    var sen = document.createElement('div'); sen.className = 'cl-sen'; stick.parentNode.insertBefore(sen, stick);
    new IntersectionObserver(function (en) { stick.classList.toggle('stuck', !en[0].isIntersecting); }).observe(sen);
  }

  window.addEventListener('hashchange', function () {
    if (location.hash === lastHash) return;
    var prev = C && C.id; fromHash(); render();
    if (C.id !== prev) { closeSheet && sheetOpen && closeSheet(); carState(); window.scrollTo(0, 0); }
  });
  fromHash(); render(); carState();
})();
