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
  /* ---- 2. the cat shelves are built in both modes (an account can hold a cat while the site shows dogs); only cat mode shows them ---- */
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
  var HX = /shampoo|groom|skin|coat|wipes|paw|flea|brush|balm|spray|comb/;
  var AREAS = [
    { area: "Urinary & kidney", s: "cat-area-urinary-kidney", items: [
      { s: "cat-urinary-problems", l: "Urinary problems", re: /\burin(e|ary)\b|cystitis|struvite|bladder|\bph\b/, info: "Straining, frequent trips to the litter tray or blood in the urine. Always worth a call to your vet, and urgent if your cat cannot pass urine." },
      { s: "cat-struvite-crystals", l: "Struvite & bladder stones", re: /struvite|crystal|calculi|urinary support|\bph\b/, info: "Diets that help dissolve and prevent urinary crystals and stones, as your vet advises." },
      { s: "cat-kidney-support", l: "Kidney support", re: /kidney|renal|cardiac/, info: "Diets and daily support for cats with reduced kidney function, as your vet advises." },
      { s: "cat-diabetes", l: "Diabetes", re: /diabet/, info: "Low-carbohydrate veterinary diets to help keep blood sugar steady, alongside your vet's treatment plan." },
      { s: "cat-litter-tray", l: "Litter & toileting", re: /litter|urine test|tray/, info: "Litter and test kits to keep an eye on toilet habits at home." } ] },
    { area: "Skin & allergies", s: "cat-area-skin-allergies", items: [
      { s: "cat-itchy-skin", l: "Itchy skin & allergies", re: /itch|allerg|derma|eczema|skin (care|spray|support|balm|soothing|irritation|conditions?)|skin & coat|immunity/, info: "Scratching, over-grooming, scabs or flaky skin. Fleas, allergies and stress are the usual suspects." },
      { s: "cat-hot-spots", l: "Sore patches & hot spots", re: /hot.?spot|soothing|medi fresh|antiseptic spray/, info: "Red, sore or weepy patches from licking and scratching. Keep them clean and protected." },
      { s: "cat-dry-flaky-skin", l: "Dry & flaky skin", re: /dry skin|flaky|moistur|oatmeal|skin & coat/, info: "Dandruff, dull fur and dry skin. Gentle shampoos and omega oils help from the inside and out." },
      { s: "cat-food-allergy", l: "Food intolerance", re: /hypoallergenic|hydrolys|allerg|limited ingredient/, ex: /shampoo|groom|wipes|brush|spray/, info: "Itchy skin or loose stools that come back with certain foods. Hypoallergenic and limited-ingredient diets." },
      { s: "cat-ear-problems", l: "Ear problems", re: /\bears?\b|ear care|\botic/, info: "Head shaking, scratching at the ears or dark wax. Gentle cleaning keeps ears comfortable." },
      { s: "cat-ear-mites", l: "Ear mites", re: /ear mite|mites?\b.*ear|ear.*mite|mite/, info: "Dark, crumbly wax and constant ear scratching are the classic signs. Treat all pets in the home." },
      { s: "cat-eye-problems", l: "Eye problems", re: /\beyes?\b|tear.?stain/, info: "Watery or crusty eyes and tear staining, cleaned gently." } ] },
    { area: "Tummy & digestion", s: "cat-area-digestive", items: [
      { s: "cat-hairballs", l: "Hairballs", re: /hairball|furball|malt/, info: "Hair swallowed while grooming that comes back up. Fibre, malt and a good brush help." },
      { s: "cat-sensitive-tummy", l: "Sensitive tummy", re: /digest|probiotic|gastro|stomach|prebiotic|diarrh|tummy|gut/, info: "Loose stools, sickness or a fussy stomach. Gentle diets and gut support." },
      { s: "cat-diarrhoea", l: "Diarrhoea & loose stools", re: /diarrh|gastro|slippery elm|psyllium|probiotic|prebiotic|artichoke/, ex: HX, info: "Firming the stool and settling the gut. Speak to your vet if it lasts more than a day or two." },
      { s: "cat-constipation", l: "Constipation", re: /psyllium|fibre|fiber|husk|laxative|hairball/, ex: /shampoo|wipes|brush|spray|comb/, info: "Straining or small, hard stools. Fibre and hydration can help; ask your vet if it persists." },
      { s: "cat-weight", l: "Weight management", re: /light|weight|sterilised|sterilized|indoor|diet|neutered/, ex: /shampoo|wipes|brush|spray|comb|collar/, info: "Indoor and neutered cats put weight on easily. Lower-calorie, high-protein foods keep them lean." },
      { s: "cat-kitten", l: "Kitten care", re: /kitten/, info: "Complete foods and gentle care for growing kittens." },
      { s: "cat-senior", l: "Senior cats", re: /senior|mature|ageing|aging|7\+|11\+/, info: "Foods and support for older cats with changing needs." } ] },
    { area: "Mobility & joints", s: "cat-area-joints", items: [
      { s: "cat-arthritis", l: "Arthritis & stiff joints", re: /joint|arthrit|glucosamine|chondro|mobility|\bhip\b|green lipped|mussel|devil.?s claw|rose hip/, info: "Slower to jump, stiff after rest or less keen on the stairs. Very common in older cats." },
      { s: "cat-joint-supplements", l: "Joint supplements", re: /joint|glucosamine|mussel|devil.?s claw|rose hip|flexifit|4joints/, info: "Daily powders, pastes and treats with glucosamine and green-lipped mussel." },
      { s: "cat-injury-support", l: "Injury & support", re: /brace|splint|bandage|support tape|sleeve|compression|sprain/, info: "Braces, bandages and tape to support a sore leg while it heals, as your vet advises." },
      { s: "cat-fractures", l: "Fractures & broken bones", re: /fracture|splint|bone fracture|brace/, info: "Braces and splints that support a leg alongside your vet's care." },
      { s: "cat-hock-leg", l: "Hock, leg & joint braces", re: /hock|pull brace|neck brace|splint brace|brace/, info: "Supports for hocks, front legs and necks, fitted as your vet advises." },
      { s: "cat-bone-health", l: "Bone & calcium", re: /calcium|bone|eggshell|colostrum/, info: "Calcium and mineral support for growing, pregnant or older cats." } ] },
    { area: "Behaviour & mood", s: "cat-area-behaviour", items: [
      { s: "cat-stress-anxiety", l: "Stress & anxiety", re: /calm|stress|anxi|pheromone|feliway|relax|bach|wellbeing/, info: "Hiding, over-grooming, spraying or a change at home. Calming support for nervous cats." },
      { s: "cat-boredom", l: "Boredom & enrichment", re: /lick|enrichment|toy|slow feed|puzzle|play/, info: "Lick mats and slow feeders to keep clever cats busy and calm." },
      { s: "cat-travel-vet", l: "Vet visits & travel", re: /carrier|crate|pheromone|feliway|calm.?down/, info: "Take the edge off carrier trips and vet visits." },
      { s: "cat-fussy-eating", l: "Fussy eating", re: /topper|paste|nibbles|palatab|tempt|appetite/, info: "Tempting toppers, pastes and wet foods for cats that turn their nose up." } ] },
    { area: "Recovery", s: "cat-area-recovery", items: [
      { s: "cat-post-surgery-recovery", l: "Post-surgery recovery", re: /recovery|collar|\bcone\b|surgery|post.?op|stitch|\bsuit\b|vet bedding|underpad/, info: "Protecting stitches, keeping them comfortable and helping them heal after an operation." },
      { s: "cat-wound-care", l: "Wound care", re: /wound|dressing|sterile|antiseptic|gauze|bandage/, info: "Cleaning, dressing and protecting cuts and sore patches." },
      { s: "cat-cones", l: "Cones & recovery collars", re: /collar|\bcone\b|buster|eco soft|neck/, info: "Stop licking and scratching while stitches and sore skin heal." },
      { s: "cat-recovery-food", l: "Recovery food", re: /recovery (wet )?food|recovery.*(dog and cat|cats)|convalescence|critical care|recuperat/, ex: /collar|suit|shirt|bed|pad/, info: "Energy-dense foods for cats that are poorly or getting their strength back." },
      { s: "cat-immune", l: "Immune & general health", re: /immun|colostrum|vitamin|multi|superfood|complete|4in1|feline 40|taurine|yeast/, ex: HX, info: "Daily vitamin, mineral and amino-acid support for overall health." } ] },
    { area: "Mouth & teeth", s: "cat-area-mouth-teeth", items: [
      { s: "cat-dental-disease", l: "Dental disease", re: /dental|teeth|tooth|plaque|breath/, info: "Bad breath, tartar and sore gums. Daily care keeps teeth healthier for longer." },
      { s: "cat-tartar", l: "Tartar & plaque", re: /dental powder|plaque|tartar|toothpaste|toothbrush|dental/, info: "Powders, pastes and brushes that tackle build-up before it becomes gum disease." } ] },
    { area: "Essential care", s: "cat-area-essential-care", items: [
      { s: "cat-fleas-ticks-worms", l: "Fleas, ticks & worms", re: /\bflea|\btick|worm|parasite|\bmites?\b|repel/, info: "Treatment and prevention for the parasites cats pick up indoors and out." },
      { s: "cat-flea-treatments", l: "Flea treatment & prevention", re: /\bflea|spot on|collar.*flea|flea.*collar|repellent|fiprotec|house spray/, info: "Spot-ons, collars, sprays and shampoos for fleas and ticks. Never use dog products on cats." },
      { s: "cat-worming", l: "Worming", re: /worm/, info: "Tablets and spot-ons for roundworm and tapeworm." },
      { s: "cat-grooming-coat", l: "Grooming & coat", re: /groom|brush|comb|shampoo|\bcoat\b|nail|cologne|wipes/, info: "Brushing, bathing and coat care for a comfortable, healthy coat." },
      { s: "cat-shedding", l: "Shedding & matted fur", re: /deshed|detangl|dematt|rake|slicker|comb|brush/, info: "Brushes and sprays that cut down on loose hair and tackle tangles." },
      { s: "cat-bathing", l: "Bathing & waterless wash", re: /shampoo|waterless|dry shampoo|no.?rinse|cologne|bath/, info: "Shampoos and no-rinse washes for cats that hate the bath." },
      { s: "cat-paws-claws", l: "Paws & claws", re: /paw|nail|claw/, info: "Paw cleaners, balms and nail clippers." } ] }
  ];
  var SYMS = [
    { area: "Skin & coat", s: "cat-sym-area-skin-coat", syms: [
      { s: "cat-sym-over-grooming", l: "Over-grooming", re: /itch|allerg|calm|stress|anxi|pheromone/ },
      { s: "cat-sym-scratching", l: "Scratching", re: /itch|allerg|flea|mites?/ },
      { s: "cat-sym-bald-patches", l: "Hair loss or bald patches", re: /itch|allerg|derma|immunity|skin & coat/, ex: /brush|comb|collar/ },
      { s: "cat-sym-scabs", l: "Scabs or sore patches", re: /hot.?spot|soothing|antiseptic|wound|itchy skin|skin spray/ },
      { s: "cat-sym-dandruff", l: "Flaky skin or dandruff", re: /oatmeal|moistur|dry skin|flaky|skin & coat/ },
      { s: "cat-sym-dull-coat", l: "Dull or greasy coat", re: /coat|omega|salmon oil|brewer/, ex: HX },
      { s: "cat-sym-matted", l: "Matted or tangled fur", re: /detangl|dematt|rake|comb|slicker|conditioning/ },
      { s: "cat-sym-shedding", l: "Heavy shedding", re: /deshed|brush|comb|slicker|glove/ },
      { s: "cat-sym-smelly-coat", l: "Smelly coat", re: /cologne|deodori|shampoo|wipes|spray|fresh/ } ] },
    { area: "Eyes & ears", s: "cat-sym-area-eyes-ears", syms: [
      { s: "cat-sym-scratching-ears", l: "Scratching at the ears", re: /\bears?\b|ear care|mite/ },
      { s: "cat-sym-head-shaking", l: "Head shaking", re: /\bears?\b|mite|ear care/ },
      { s: "cat-sym-dark-wax", l: "Dark wax or ear odour", re: /\bears?\b|ear cleaner|ear wipes|mite/ },
      { s: "cat-sym-watery-eyes", l: "Watery eyes", re: /\beyes?\b|tear/ },
      { s: "cat-sym-tear-stains", l: "Tear staining", re: /\beyes?\b|tear|facial|wipes/ },
      { s: "cat-sym-crusty-eyes", l: "Crusty or sticky eyes", re: /\beyes?\b|facial|wipes|saline/ } ] },
    { area: "Tummy & gut", s: "cat-sym-area-tummy-gut", syms: [
      { s: "cat-sym-hairballs", l: "Vomiting hairballs", re: /hairball|furball|malt|slippery elm/, ex: HX },
      { s: "cat-sym-vomiting", l: "Sickness or vomiting", re: /gastro|digest|sensitive|stomach|probiotic|slippery elm/, ex: HX },
      { s: "cat-sym-loose-stools", l: "Loose stools", re: /gastro|digest|slippery elm|psyllium|probiotic|prebiotic|moor/, ex: HX },
      { s: "cat-sym-constipation", l: "Constipation or straining", re: /psyllium|fibre|husk|hairball/, ex: /shampoo|wipes|brush|spray|comb/ },
      { s: "cat-sym-wind", l: "Wind or gurgling tummy", re: /gastro|probiotic|prebiotic|artichoke|digestive support/, ex: HX },
      { s: "cat-sym-not-eating", l: "Not eating", re: /appetite|topper|paste|tempt|palatab|recovery (wet )?food/ },
      { s: "cat-sym-weight-gain", l: "Putting on weight", re: /light|weight|sterilised|indoor|neutered/, ex: /shampoo|wipes|brush|spray|comb|collar/ },
      { s: "cat-sym-weight-loss", l: "Losing weight", re: /recovery|convalescence|appetite|tempt|senior|mature/, ex: HX } ] },
    { area: "Toilet habits", s: "cat-sym-area-toilet", syms: [
      { s: "cat-sym-straining-to-wee", l: "Straining to wee", re: /\burin(e|ary)\b|cystitis|struvite|bladder/ },
      { s: "cat-sym-blood-urine", l: "Blood in the urine", re: /\burin(e|ary)\b|cystitis|struvite|bladder|urine test/ },
      { s: "cat-sym-frequent-wee", l: "Weeing little and often", re: /\burin(e|ary)\b|cystitis|struvite|bladder|urine test/ },
      { s: "cat-sym-drinking-more", l: "Drinking more than usual", re: /renal|kidney|diabet|urine test/ },
      { s: "cat-sym-accidents", l: "Going outside the tray", re: /urin(e|ary)|pheromone|litter|odour|cleaner/ } ] },
    { area: "Mouth & teeth", s: "cat-sym-area-mouth", syms: [
      { s: "cat-sym-bad-breath", l: "Bad breath", re: /dental|teeth|tooth|plaque|breath/ },
      { s: "cat-sym-tartar", l: "Yellow or brown tartar", re: /dental|plaque|tartar|toothpaste|toothbrush/ },
      { s: "cat-sym-red-gums", l: "Red or bleeding gums", re: /dental|gum|plaque|toothpaste/ },
      { s: "cat-sym-drooling", l: "Drooling or dropping food", re: /dental|plaque|tooth|toothpaste/ } ] },
    { area: "Behaviour & mood", s: "cat-sym-area-behaviour", syms: [
      { s: "cat-sym-hiding", l: "Hiding away or stressed", re: /calm|stress|anxi|pheromone|feliway|relax/ },
      { s: "cat-sym-spraying", l: "Spraying or marking", re: /calm|stress|pheromone|feliway|enzym/ },
      { s: "cat-sym-scared", l: "Scared of visitors or noise", re: /calm|stress|anxi|pheromone|relax|bach/ },
      { s: "cat-sym-vet-fear", l: "Hates the carrier or vet", re: /calm|pheromone|relax|carrier|crate|bach/ },
      { s: "cat-sym-bored", l: "Bored or too fast at meals", re: /lick|slow feed|enrichment|toy|bowl/ },
      { s: "cat-sym-clingy", l: "Unusually clingy or restless", re: /calm|stress|anxi|relax|bach/ } ] },
    { area: "Legs & mobility", s: "cat-sym-area-legs", syms: [
      { s: "cat-sym-limping", l: "Limping or stiff", re: /joint|brace|bandage|mobility|sprain|support tape/ },
      { s: "cat-sym-stiff-rest", l: "Stiff after resting", re: /joint|glucosamine|mussel|devil|flexifit|4joints|mobility/ },
      { s: "cat-sym-not-jumping", l: "Not jumping any more", re: /joint|glucosamine|mussel|devil|flexifit|4joints|mobility/ },
      { s: "cat-sym-stairs", l: "Struggling on the stairs", re: /joint|glucosamine|mussel|flexifit|mobility|brace/ },
      { s: "cat-sym-paw-licking", l: "Licking or chewing paws", re: /paw|itch|allerg|balm|wipes/ },
      { s: "cat-sym-holding-leg", l: "Holding a leg up", re: /brace|splint|fracture|bandage/ },
      { s: "cat-sym-claw-problems", l: "Overgrown or split claws", re: /nail|claw|clipper|paw/ } ] },
    { area: "Whole body", s: "cat-sym-area-whole-body", syms: [
      { s: "cat-sym-wound-stitches", l: "A wound or stitches", re: /wound|recovery|collar|\bsuit\b|bandage|dressing/ },
      { s: "cat-sym-after-surgery", l: "Recovering after an operation", re: /recovery|collar|\bsuit\b|post.?op|vet bedding|underpad|convalescence/ },
      { s: "cat-sym-fleas", l: "Fleas or worms", re: /\bflea|\btick|worm|parasite/ },
      { s: "cat-sym-low-energy", l: "Low energy or lethargy", re: /superfood|feline 40|4in1|taurine|colostrum|vitamin|multi/, ex: HX },
      { s: "cat-sym-senior-slowing", l: "Slowing down with age", re: /senior|mature|joint|mobility|feline 40/ } ] }
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
  if (!PET.isCat) return;
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

  /* "Real pets, real results" cards: the four cat photos (story-cat-1 to 4). The words are placeholders for real owner quotes. */
  var CS = [
    ["Injury & support", "cat-injury-support", "Jessy", "Albie", "Seeing Jessy need extra support has been worrying.", "Here she is wearing her hock brace during some quiet time outside. We\u2019re taking things gently and following our vet\u2019s advice."],
    ["Post-surgery recovery", "cat-post-surgery-recovery", "Binx", "Catherine", "Binx is having some well-earned rest after surgery.", "Here she is in her little recovery suit, taking it easy at home. For now, it\u2019s all about quiet days and plenty of company."],
    ["Wound care", "cat-wound-care", "Roger", "Vivi", "Roger is taking a break while his wound heals.", "His cone is there to stop him reaching the area. We\u2019re keeping a close eye on him and following his care instructions."],
    ["Sensitive tummy", "cat-sensitive-tummy", "Storm", "Ada", "With Storm\u2019s sensitive tummy, we pay close attention to mealtimes.", "We\u2019re keeping track of what he eats and how he gets on. We just want our ginger boy to feel comfortable and enjoy his food."]];
  C.stories = CS.map(function (x) { return { dog: x[2], owner: x[3], head: x[4], q: x[5], cond: x[0], coll: x[1], cap: 1 }; });

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
    ["#dogs", "#reviews"].forEach(function (s) { var e = D.querySelector(s); if (e) e.setAttribute("data-pet-keep", ""); });
    var rh = D.querySelector("#dogs-h"); if (rh) rh.innerHTML = "Real pets, <em>real results</em>";
    var rp = D.querySelector("#dogs-h + p"); if (rp) rp.textContent = "Cats and the care that helps them.";
    var rv = D.querySelector("#rev-h + p"); if (rv) rv.textContent = "Our Judge.me rating, and what owners tell us.";
    var sub = D.querySelector("#shop-h + p"); if (sub) sub.textContent = "Everything a poorly cat needs, in one place.";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixStatic); else fixStatic();
})();
