/* Poorly Pet: the cat side of the site.
   Loads after shopify-data.js and site-config.js, and before site-data.js.
   1. Adds the cat range (pet-cat-products.js) to the product list in both modes, so everything is searchable.
   2. In cat mode only, swaps the dog taxonomy, menus and homepage copy for the cat version.
   Everything on the cat side is built from the same product list by the rules below, so a new cat product
   lands on the right shelves as soon as it is in the list. */
(function () {
  "use strict";
  var PET = window.PET, SH = window.SHOPIFY, PP = window.PP, S = window.PPSITE;
  if (!PET || !SH || !PP || !S) return;

  /* ---- 1. register the cat range, in both modes ---- */
  var have = {};
  SH.products.forEach(function (p) { have[p.handle] = 1; });
  /* until a product has its own photo (they only exist once the product is active), cards show a quiet paw tile */
  var PH = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F1F5EF"/><g fill="#A9BDB4"><ellipse cx="100" cy="124" rx="34" ry="27"/><ellipse cx="58" cy="90" rx="14" ry="19"/><ellipse cx="86" cy="64" rx="14" ry="20"/><ellipse cx="114" cy="64" rx="14" ry="20"/><ellipse cx="142" cy="90" rx="14" ry="19"/></g></svg>');
  (window.PETCATP || []).forEach(function (p) { if (!have[p.handle]) { if (!p.cdn) { p.cdn = PH; p.img = PH; } SH.products.push(p); have[p.handle] = 1; } });
  SH.products.forEach(function (p) { p.sp = PET.speciesOf(p.title, p.tags, p.productType); });
  if (!PET.isCat) return;

  /* ---- 2. cat mode ---- */
  var SC = SH.collections;
  var CP = SH.products.filter(function (p) { return p.sp !== "dog" && !/-bundle$/.test(p.handle); });
  function T(p) { return (p.title + " " + (p.productType || "") + " " + (p.tags || []).join(" ")).toLowerCase(); }
  function ty(p) { return String(p.productType || "").toLowerCase(); }
  var PREF = ["Pets Purest", "AniForte", "Pet Remedy", "Beaphar", "Vetsaver", "Balto", "Medical Pet Shirts", "Johnsons", "LickiMat", "Bugalugs Pet Care", "Millpledge", "Calibra", "KRUUSE", "True Dog UK"];
  function score(p) { var i = PREF.indexOf(p.brand); return (p.reviewCount ? -50 : 0) + (i < 0 ? 40 : i); }
  function sorted(list) { return list.slice().sort(function (a, b) { return score(a) - score(b) || (a.title < b.title ? -1 : 1); }); }
  function handles(list) { return sorted(list).map(function (p) { return p.handle; }); }
  function coll(h, title, list) { SC[h] = { title: title, description: "", paragraphs: [], image: null, products: handles(list) }; return SC[h].products; }

  /* conditions, grouped like the dog side */
  var AREAS = [
    { area: "Urinary & kidney", s: "cat-area-urinary-kidney", items: [
      { s: "cat-urinary-problems", l: "Urinary problems", re: /\burin(e|ary)\b|cystitis|struvite|bladder|\bph\b/, info: "Straining, frequent trips to the litter tray or blood in the urine. Always worth a call to your vet, and urgent if your cat cannot pass urine." },
      { s: "cat-kidney-support", l: "Kidney support", re: /kidney|renal/, info: "Diets and daily support for cats with reduced kidney function, as your vet advises." } ] },
    { area: "Skin & allergies", s: "cat-area-skin-allergies", items: [
      { s: "cat-itchy-skin", l: "Itchy skin & allergies", re: /itch|allerg|derma|eczema|hot.?spot|skin (care|spray|support|balm|soothing|irritation|conditions?)|skin & coat/, info: "Scratching, over-grooming, scabs or flaky skin. Fleas, allergies and stress are the usual suspects." },
      { s: "cat-ear-problems", l: "Ear problems", re: /\bears?\b|ear care|\botic/, info: "Head shaking, scratching at the ears or dark wax. Gentle cleaning keeps ears comfortable." },
      { s: "cat-eye-problems", l: "Eye problems", re: /\beyes?\b|tear.?stain/, info: "Watery or crusty eyes and tear staining, cleaned gently." } ] },
    { area: "Tummy & digestion", s: "cat-area-digestive", items: [
      { s: "cat-hairballs", l: "Hairballs", re: /hairball|furball|malt/, info: "Hair swallowed while grooming that comes back up. Fibre, malt and a good brush help." },
      { s: "cat-sensitive-tummy", l: "Sensitive tummy", re: /digest|probiotic|gastro|stomach|prebiotic|diarrh|tummy|\bgut\b/, ex: /shampoo|groom|skin|coat|wipes|paw|flea|brush|balm|spray|comb/, info: "Loose stools, sickness or a fussy stomach. Gentle diets and gut support." } ] },
    { area: "Mobility & joints", s: "cat-area-joints", items: [
      { s: "cat-arthritis", l: "Arthritis & stiff joints", re: /joint|arthrit|glucosamine|chondro|mobility|\bhip\b/, info: "Slower to jump, stiff after rest or less keen on the stairs. Very common in older cats." },
      { s: "cat-injury-support", l: "Injury & support", re: /brace|splint|bandage|support tape|sleeve|compression|sprain/, info: "Braces, bandages and tape to support a sore leg while it heals, as your vet advises." } ] },
    { area: "Behaviour & mood", s: "cat-area-behaviour", items: [
      { s: "cat-stress-anxiety", l: "Stress & anxiety", re: /calm|stress|anxi|pheromone|feliway|relax/, info: "Hiding, over-grooming, spraying or a change at home. Calming support for nervous cats." } ] },
    { area: "Recovery", s: "cat-area-recovery", items: [
      { s: "cat-post-surgery-recovery", l: "Post-surgery recovery", re: /recovery|collar|\bcone\b|surgery|post.?op|stitch|\bsuit\b|vet bedding|underpad/, info: "Protecting stitches, keeping them comfortable and helping them heal after an operation." },
      { s: "cat-wound-care", l: "Wound care", re: /wound|dressing|sterile|antiseptic|gauze|bandage/, info: "Cleaning, dressing and protecting cuts and sore patches." } ] },
    { area: "Mouth & teeth", s: "cat-area-mouth-teeth", items: [
      { s: "cat-dental-disease", l: "Dental disease", re: /dental|teeth|tooth|plaque|breath/, info: "Bad breath, tartar and sore gums. Daily care keeps teeth healthier for longer." } ] },
    { area: "Essential care", s: "cat-area-essential-care", items: [
      { s: "cat-fleas-ticks-worms", l: "Fleas, ticks & worms", re: /\bflea|\btick|worm|parasite|\bmites?\b|repel/, info: "Treatment and prevention for the parasites cats pick up indoors and out." },
      { s: "cat-grooming-coat", l: "Grooming & coat", re: /groom|brush|comb|shampoo|\bcoat\b|nail|cologne|wipes/, info: "Brushing, bathing and coat care for a comfortable, healthy coat." } ] }
  ];
  var SYMS = [
    { area: "Skin & coat", s: "cat-sym-area-skin-coat", syms: [
      { s: "cat-sym-over-grooming", l: "Over-grooming", re: /itch|\bskin\b|allerg|flea|calm|stress|anxi/ },
      { s: "cat-sym-scratching", l: "Scratching", re: /itch|allerg|flea|\bskin\b|mites?/ } ] },
    { area: "Eyes & ears", s: "cat-sym-area-eyes-ears", syms: [
      { s: "cat-sym-scratching-ears", l: "Scratching at the ears", re: /\bears?\b|ear care/ },
      { s: "cat-sym-watery-eyes", l: "Watery eyes", re: /\beyes?\b|tear/ } ] },
    { area: "Tummy & gut", s: "cat-sym-area-tummy-gut", syms: [
      { s: "cat-sym-hairballs", l: "Vomiting hairballs", re: /hairball|furball|malt|digest|probiotic/, ex: /shampoo|groom|skin|coat|wipes|paw|flea|brush|balm|spray|comb/ },
      { s: "cat-sym-not-eating", l: "Not eating", re: /appetite|topper|wet food|palatab|tempt|milk|recovery/ } ] },
    { area: "Toilet habits", s: "cat-sym-area-toilet", syms: [
      { s: "cat-sym-straining-to-wee", l: "Straining to wee", re: /\burin(e|ary)\b|cystitis|struvite|bladder/ } ] },
    { area: "Mouth & teeth", s: "cat-sym-area-mouth", syms: [
      { s: "cat-sym-bad-breath", l: "Bad breath", re: /dental|teeth|tooth|plaque|breath/ } ] },
    { area: "Behaviour & mood", s: "cat-sym-area-behaviour", syms: [
      { s: "cat-sym-hiding", l: "Hiding away or stressed", re: /calm|stress|anxi|pheromone|feliway|relax/ } ] },
    { area: "Legs & mobility", s: "cat-sym-area-legs", syms: [
      { s: "cat-sym-limping", l: "Limping or stiff", re: /joint|brace|bandage|sleeve|mobility|sprain|support tape/ } ] },
    { area: "Whole body", s: "cat-sym-area-whole-body", syms: [
      { s: "cat-sym-wound-stitches", l: "A wound or stitches", re: /wound|recovery|collar|\bsuit\b|bandage|dressing/ },
      { s: "cat-sym-fleas", l: "Fleas or worms", re: /\bflea|\btick|worm|parasite/ } ] }
  ];
  /* departments (the tiles under Shop by product). Each product goes to the first department whose rule matches its type. */
  var DEPTS = [
    { h: "cat-dept-recovery", l: "Recovery & first aid", ls: "Recovery & first aid", re: /wound|bandage|recovery|support tape|scissors|vet bedding|underpad/, subs: [
      ["Wound care", /wound/], ["Bandages & tape", /bandage|tape|scissors/], ["Recovery collars", /collar/], ["Recovery suits & sleeves", /suit|shirt|sleeve/], ["Vet bedding & pads", /bedding|underpad/] ] },
    { h: "cat-dept-mobility", l: "Braces & mobility", ls: "Mobility aids", re: /brace|splint/, subs: [["Leg braces", /brace|splint/]] },
    { h: "cat-dept-calming", l: "Calming & enrichment", ls: "Calming", re: /calming|enrichment|toy|lick/, subs: [["Calming support", /calming/], ["Lick mats & enrichment", /lick|enrichment/], ["Toys", /toy/]] },
    { h: "cat-dept-dental", l: "Dental care", ls: "Dental care", re: /dental/, subs: [] },
    { h: "cat-dept-flea-worming", l: "Flea, tick & worming", ls: "Flea & worming", re: /flea|wormer|tick|parasite|repellent/, subs: [["Flea treatments", /flea/], ["Wormers", /worm/], ["Ticks & parasites", /tick|parasite/]] },
    { h: "cat-dept-skin-ear-eye", l: "Skin, ear & eye care", ls: "Skin, ear & eye", re: /skin|\bear\b|\beye\b|coat spray|paw/, subs: [["Skin care", /skin|coat spray/], ["Ear care", /\bear\b/], ["Eye care", /\beye\b/], ["Paw care", /paw/]] },
    { h: "cat-dept-grooming", l: "Shampoo & grooming", ls: "Grooming", re: /shampoo|groom|brush|comb|nail|cologne|wipes/, subs: [["Shampoo", /shampoo/], ["Brushes & combs", /brush|comb/], ["Grooming kits & wipes", /kit|bundle|wipes|cologne/], ["Nail care", /nail/]] },
    { h: "cat-dept-food-treats", l: "Food, treats & toppers", ls: "Food & treats", re: /food|treat|topper|milk/, subs: [["Dry food", /dry food/], ["Wet food", /wet food/], ["Veterinary diets", /veterinary/], ["Treats", /treat/], ["Toppers & milk", /topper|milk/]] },
    { h: "cat-dept-supplements", l: "Supplements & health", ls: "Supplements", re: /supplement|medication/, subs: [["Joint supplements", /joint|mobility/], ["Digestive support", /digest/], ["Calming supplements", /calming/], ["Itch & skin support", /itch|skin/], ["Medication aids", /medication/]] },
    { h: "cat-dept-home", l: "Litter & home", ls: "Litter & home", re: /.*/, subs: [["Litter", /litter/], ["Urine test kits", /urine/], ["Household cleaners", /cleaner/], ["ID tags", /\bid\b/]] }
  ];

  var BYH = {}; SH.products.forEach(function (p) { BYH[p.handle] = p; });
  function brandsOf(hs) { var b = {}; hs.forEach(function (h) { var p = BYH[h]; if (p && p.brand) b[p.brand] = (b[p.brand] || 0) + 1; }); return Object.keys(b).sort(function (x, z) { return b[z] - b[x]; }).slice(0, 6); }
  /* ---- build the groups ---- */
  var used = {};
  var groups = [], condOfArea = {};
  AREAS.forEach(function (a) {
    var items = [], areaProds = {};
    a.items.forEach(function (it) {
      var list = CP.filter(function (p) { return it.re.test(T(p)) && !(it.ex && it.ex.test(ty(p))); });
      if (!list.length) return;
      var hs = coll(it.s, it.l, list);
      hs.forEach(function (h) { areaProds[h] = 1; used[h] = 1; });
      items.push({ s: it.s, l: it.l, n: hs.length, info: it.info, acute: 0, prods: hs.slice(0, 12) });
    });
    if (!items.length) return;
    var all = Object.keys(areaProds);
    SC[a.s] = { title: a.area, description: "", paragraphs: [], image: null, products: all };
    groups.push({ area: a.area, s: a.s, n: all.length, items: items, brands: brandsOf(all) });
  });
  var allCond = {};
  groups.forEach(function (g) { g.items.forEach(function (it) { allCond[it.s] = it; }); });

  var symptoms = [], symGroups = [];
  SYMS.forEach(function (a) {
    var out = [], hsAll = {};
    a.syms.forEach(function (y) {
      var list = CP.filter(function (p) { return y.re.test(T(p)) && !(y.ex && y.ex.test(ty(p))); });
      if (!list.length) return;
      var hs = coll(y.s, y.l, list);
      hs.forEach(function (h) { hsAll[h] = 1; });
      var c = [];
      Object.keys(allCond).forEach(function (k) { var n = hs.filter(function (h) { return SC[k].products.indexOf(h) > -1; }).length; if (n) c.push([k, n]); });
      c.sort(function (x, z) { return z[1] - x[1]; });
      symptoms.push({ s: y.s, l: y.l, n: hs.length, c: c.slice(0, 5), prods: hs.slice(0, 12) });
      out.push(y.s);
    });
    if (!out.length) return;
    var br = {}; Object.keys(hsAll).forEach(function (h) { var p = SH.products.filter(function (x) { return x.handle === h; })[0]; if (p && p.brand) br[p.brand] = (br[p.brand] || 0) + 1; });
    var brands = Object.keys(br).sort(function (x, z) { return br[z] - br[x]; }).slice(0, 6);
    SC[a.s] = { title: a.area, description: "", paragraphs: [], image: null, products: Object.keys(hsAll) };
    symGroups.push({ area: a.area, s: a.s, n: Object.keys(hsAll).length, syms: out, brands: brands });
  });

  var taxonomy = [], planned = [], placed = {};
  DEPTS.forEach(function (d) {
    var mine = CP.filter(function (p) { if (placed[p.handle]) return false; return d.re.test(ty(p)) || (d.h === "cat-dept-home"); });
    mine.forEach(function (p) { placed[p.handle] = 1; });
    var hs = coll(d.h, d.l, mine), subs = [], cats = [], seen = {};
    d.subs.forEach(function (sub, i) {
      var sl = mine.filter(function (p) { return sub[1].test(ty(p)) || sub[1].test(p.title.toLowerCase()); });
      if (!sl.length) return;
      var sh = d.h + "-" + sub[0].toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      var sp = coll(sh, sub[0], sl);
      subs.push({ l: sub[0], s: sh, n: sp.length, prods: sp });
      cats.push({ handle: sh, title: sub[0], handles: sp });
    });
    var needs = groups.map(function (g) { var set = {}; SC[g.s].products.forEach(function (h) { set[h] = 1; }); return { l: g.area, s: g.s, n: hs.filter(function (h) { return set[h]; }).length }; })
      .filter(function (x) { return x.n; }).sort(function (x, z) { return z.n - x.n; }).slice(0, 4).map(function (x) { return { l: x.l, s: x.s }; });
    taxonomy.push({ l: d.l, ls: d.ls, s: d.h, n: hs.length, subs: subs, brands: brandsOf(hs), needs: needs });
    planned.push({ handle: d.h, title: d.l, categories: cats, handles: hs });
  });
  taxonomy = taxonomy.filter(function (t) { return t.n; });

  /* best sellers: the first product of each department in turn, then the second, and so on */
  var best = [], rows = DEPTS.map(function (d) { return SC[d.h].products.slice(0, 3); });
  for (var r = 0; r < 3; r++) rows.forEach(function (row) { if (row[r] && best.length < 12) best.push(row[r]); });
  coll("cat-best-sellers", "Most popular for cats", best.map(function (h) { return SH.products.filter(function (p) { return p.handle === h; })[0]; }));
  SC["cat-best-sellers"].products = best;
  coll("cat-all", "All products for cats", CP);
  coll("cat-sale", "Cat offers", CP.filter(function (p) { return p.compareAt && p.compareAt > p.price; }));

  /* ---- hand the data to the site ---- */
  PP.groups = groups; PP.symGroups = symGroups; PP.symptoms = symptoms; PP.taxonomy = taxonomy;
  PP.depts = taxonomy.map(function (t) { return { l: t.l, n: t.n, prods: SC[t.s].products.slice(0, 10) }; });
  PP.best = best; PP.sale = SC["cat-sale"].products;
  S.planned = { _about: "Cat departments, built in pet-cat.js", departments: planned, other: [], supplementTypes: [] };
  S.planned.supplementTypes = ["Cat Supplement", "Dog & Cat Supplement", "Cat Digestive Supplement", "Dog & Cat Digestive Supplement", "Cat Dental Supplement", "Dog & Cat Dental Supplement", "Dog & Cat Calming Supplement", "Dog & Cat Joint Supplement", "Dog & Cat Itch Support Supplement", "Dog & Cat Milk Supplement"];
  S.tagAlias = S.tagAlias || {};

  PET.map = { "best-sellers": "cat-best-sellers", "all": "cat-all", "sale": "cat-sale", "supplements": "cat-dept-supplements", "wheelchairs": "cat-dept-recovery" };
  PET.coll = function (h) { return PET.map[h] || h; };
  PET.hrefs = { "Recovery & mobility": "/collections/cat-dept-recovery", "Offers": "/pages/offers" };
  S.menus = {
    main: ["Shop by condition", "Shop by symptom", "Shop by product", "Recovery & mobility", "Offers", "Advice", "Help & resources"],
    help: S.menus.help, footer: S.menus.footer, explore: S.menus.explore
  };

  /* ---- homepage copy ---- */
  function pick(re, notRe) { var l = CP.filter(function (p) { return re.test(T(p)) && !(notRe && notRe.test(T(p))); }); return l.length ? sorted(l)[0].handle : null; }
  function nn(a) { return a.filter(Boolean); }
  var C = PP.content;
  C.brand = Object.assign({}, C.brand, { line: "UK pet health, recovery and mobility specialist" });
  C.hero = { lead: "Find the right support for your", words: ["over-grooming", "hairballs", "itchy skin", "stress", "bad breath", "a sore tummy", "recovery"], t: "Tell us what you can see. We match it to vet-reviewed products from the best brands.", btn1: ["I know the condition", "/pages/shop-by-condition"], btn2: ["Not sure? Start with a symptom", "/pages/shop-by-symptom"], how: C.hero && C.hero.how || [] };
  C.welcome = { lead: "Welcome to", t: "The UK's specialist shop for poorly pets. Health, recovery and mobility, every one vet reviewed before we list it.", btn1: ["Shop by condition", "/pages/shop-by-condition"], btn2: ["Shop by symptom", "/pages/shop-by-symptom"], popular: [["Itchy skin", "cat-itchy-skin"], ["Urinary problems", "cat-urinary-problems"], ["Hairballs", "cat-hairballs"], ["Stress & anxiety", "cat-stress-anxiety"], ["Post-surgery recovery", "cat-post-surgery-recovery"]].filter(function (x) { return SC[x[1]]; }) };
  C.heroSlides = [{ k: "welcome" }];
  C.legal = "Poorly Pet is a UK online retailer. Nothing on this site replaces veterinary advice. If your cat is in pain, deteriorating or unwell, speak to your vet.";

  /* reviews: placeholders until real cat reviews exist. They show in preview so the layout can be judged. */
  var phC = ["Post-surgery recovery", "Urinary problems", "Itchy skin", "Stress & anxiety"], phS = ["cat-post-surgery-recovery", "cat-urinary-problems", "cat-itchy-skin", "cat-stress-anxiety"];
  C.stories = phC.map(function (c, i) { return { dog: "Cat name", owner: "Owner", head: "Headline from the owner goes here", q: "Owner review goes here once real cat reviews come in.", cond: c, coll: phS[i] }; });

  var f1 = { s: "cat-itchy-skin", l: "over-grooming", head: "over-grooming", sub: "One of the most common reasons owners come to us.",
    learn: [
      { k: "What it is", t: "Licking, chewing or pulling at the coat far more than usual. A little grooming is normal. Bald patches, sore skin or grooming that never stops is not." },
      { k: "What to look for", t: "Thinning fur on the tummy, legs or flanks. Scabs or red skin. A cat that seems unable to leave one spot alone, or grooms more when anything changes at home." },
      { k: "What actually helps", t: "Rule out fleas first, with a treatment that does not lapse. Then look at skin, allergies and stress: a gentle skin routine, a calmer home and plenty to do. Your vet can help find the cause." },
      { k: "When to see the vet", t: "Bald patches, broken or bleeding skin, or grooming that is getting worse. Over-grooming can have a medical cause, so it is worth a check." } ],
    kit: nn([pick(/flea/, /dog/), pick(/skin|itch/, /shampoo/), pick(/shampoo/)]), kitWhy: ["Fleas are the first thing to rule out.", "Soothes sore, itchy skin.", "A gentle wash that does not strip the coat."], kitLabels: ["Fleas", "Skin", "Wash"],
    prods: nn([pick(/flea/), pick(/skin|itch/), pick(/calm/), pick(/shampoo/), pick(/groom|brush/), pick(/supplement/), pick(/spray/), pick(/wipes/)]),
    signs: [], causes: [], plan: [], quiz: null, tips: [] };
  f1.prods = SC["cat-itchy-skin"] ? SC["cat-itchy-skin"].products.slice(0, 8) : f1.prods;
  var f2 = { s: "cat-urinary-problems", l: "Urinary problems", head: "Urinary problems", sub: "Cystitis, crystals and cats who strain.",
    learn: [
      { k: "What it is", t: "Problems with the bladder and urinary tract, from cystitis to crystals and stones. Stress and not drinking enough are common triggers." },
      { k: "What to look for", t: "Frequent trips to the litter tray, straining, crying out, weeing outside the tray, or licking at the area. Blood in the urine." },
      { k: "What actually helps", t: "More water through the day, a diet your vet recommends, plenty of clean litter trays and a calm home. Urinary support products can help once your vet has ruled out anything serious." },
      { k: "When to see the vet", t: "A cat that is straining and passing little or no urine needs a vet straight away, especially a male cat. Do not wait." } ],
    kit: nn([pick(/urinary.*wet|wet.*urinary|urinary/), pick(/urine test/), pick(/calm/)]), kitWhy: ["Supports a healthy urinary tract.", "Check at home between vet visits.", "Less stress, fewer flare-ups."], kitLabels: ["Support", "Test", "Calm"],
    prods: SC["cat-urinary-problems"] ? SC["cat-urinary-problems"].products.slice(0, 8) : [], tips: [], signs: [], causes: [], plan: [], quiz: null };
  C.focus = f1; C.focus2 = f2;
  window.PETFOCUS = { f1: f1, f2: f2 };

  /* the homepage has a few fixed links and headings in its HTML; point them at the cat shelves */
  function fixStatic() {
    var D = document;
    function setEm(sel, t) { var e = D.querySelector(sel); if (e) e.textContent = t; }
    setEm("#focus-h em", f1.l); setEm("#cond-h em", f2.l.toLowerCase());
    var m = [["#focus-sec", f1], ["#cond-sec", f2]];
    m.forEach(function (x) {
      var a = D.querySelector(x[0] + " .sec-r .all"); if (a) { a.setAttribute("href", "/collections/" + x[1].s); a.textContent = "Shop " + x[1].l.toLowerCase() + (x[0] === "#cond-sec" ? " support" : "") + " \u203A"; }
      var h = D.querySelector(x[0] + " .focus-prods h3"); if (h) h.textContent = "Products for " + x[1].l.toLowerCase();
    });
    D.querySelectorAll('a[href^="/collections/"]').forEach(function (a) {
      var h = a.getAttribute("href").replace("/collections/", "");
      if (PET.map[h]) a.setAttribute("href", "/collections/" + PET.map[h]);
    });
    var sub = D.querySelector("#shop-h + p"); if (sub) sub.textContent = "Everything a poorly cat needs, in one place.";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixStatic); else fixStatic();
})();
