/* Poorly Pet: the cat knowledge for the AI assistant.
   Loads before ai-assistant.js. Provides window.PETAI (symptoms, conditions, popular questions) and links each entry to the
   cat shelves built in pet-cat.js, so answers show real cat products. Used only when the site is on the cat side. */
(function () {
  "use strict";
  var SH = window.SHOPIFY, TAGS = window.PP_TAGS;
  if (!SH || !TAGS) return;
  var SC = SH.collections;
  function P(h) { return (SC[h] && SC[h].products) || []; }

  var URGENT = "Not eating for more than a day, straining in the tray with little or nothing coming out, or breathing with an open mouth are all reasons to ring your vet straight away.";
  var SG = [
    { slug: "over-grooming", name: "Over-grooming", area: "cat-skin-coat", sh: "cat-sym-over-grooming",
      syn: ["licking too much", "overgrooming", "bald patches from licking", "licking fur off", "barbering", "grooming constantly", "pulling fur out", "bald belly", "licking belly"],
      looks: "Licking, chewing or pulling at the fur until it thins out, most often on the belly, inner legs or flanks.",
      why: "Itchy skin from fleas or an allergy is the usual cause. Stress and boredom come next, and sometimes pain under the skin or in a joint.",
      helps: ["Rule out fleas first: use a vet-recommended cat flea treatment on every pet in the home.", "Gentle, fragrance-free skin sprays and wipes soothe sore skin.", "If it follows a change at home, calming support and more hiding places can help.", "Never use a dog flea product on a cat."] },
    { slug: "scratching", name: "Scratching", area: "cat-skin-coat", sh: "cat-sym-scratching",
      syn: ["scratching", "itchy cat", "keeps scratching", "itching", "scabs on neck", "scratching neck", "flea bites", "miliary dermatitis", "itchy skin"],
      looks: "Scratching more than usual, often at the head and neck, with scabs, small crusty spots or red skin.",
      why: "Fleas and flea allergy are the most common cause. Food and environmental allergies, mites and dry skin are the others.",
      helps: ["Check the coat with a flea comb over white paper. Black specks that turn red when damp are flea dirt.", "Treat every pet in the home and wash bedding hot.", "Soothing skin sprays and balms help while the skin heals.", "See your vet if the skin is broken, weepy or it carries on after flea treatment."] },
    { slug: "bald-patches", name: "Hair loss or bald patches", area: "cat-skin-coat", sh: "cat-sym-bald-patches",
      syn: ["hair loss", "bald patch", "bald spots", "losing fur", "thinning fur", "fur falling out", "ringworm", "patchy coat"],
      looks: "Thin or bare areas, sometimes with scabs, scale or red skin.",
      why: "Over-grooming from itch or stress, fleas, mites and ringworm. Ringworm can pass to people, so a vet check is worthwhile.",
      helps: ["Take a photo each week so you can see whether it is spreading.", "Soothing skin care and omega oils support healing skin.", "Wash your hands after handling and see your vet for round, scaly patches."] },
    { slug: "scabs", name: "Scabs or sore patches", area: "cat-skin-coat", sh: "cat-sym-scabs",
      syn: ["scabs", "sore patch", "sore skin", "red skin", "crusty skin", "weepy skin", "cat scabs", "abscess", "cat fight wound", "chin acne", "spots on chin"],
      looks: "Crusty, red or weepy areas, often on the neck, chin or base of the tail.",
      why: "Scratching from fleas or allergies, chin acne, fight wounds, or a small abscess. Cat bite wounds can turn nasty quickly.",
      helps: ["Keep the area clean and dry. Do not pick the scabs.", "Use a cat-safe antiseptic or skin spray.", "A bite wound that is hot, swollen or smelly needs your vet."] },
    { slug: "dandruff", name: "Flaky skin or dandruff", area: "cat-skin-coat", sh: "cat-sym-dandruff",
      syn: ["dandruff", "flaky skin", "dry skin", "white flakes", "scurf", "flakes in fur"],
      looks: "White flakes in the fur, a dry coat, often along the back.",
      why: "Dry skin, poor diet or fatty acids, overweight cats that cannot groom their backs, or mites.",
      helps: ["A little salmon or algae oil in food feeds the skin from inside.", "Brush gently most days.", "A mild oatmeal shampoo or no-rinse wash can help.", "Lots of flakes that move can mean mites, so ask your vet."] },
    { slug: "matted", name: "Matted or tangled fur", area: "cat-skin-coat", sh: "cat-sym-matted",
      syn: ["matted fur", "mats", "tangles", "knots in fur", "matted coat", "knotted"],
      looks: "Clumps of tight fur, usually behind the ears, under the legs or near the tail.",
      why: "Long coats, older or overweight cats that groom less, and sore joints that make grooming hard.",
      helps: ["A detangling spray and a wide comb loosen small tangles.", "Do not cut mats near the skin: it is thin and easily nicked. Ask a groomer or vet.", "Short daily brushing prevents most mats."] },
    { slug: "shedding", name: "Heavy shedding", area: "cat-skin-coat", sh: "cat-sym-shedding",
      syn: ["shedding", "moulting", "molting", "fur everywhere", "loose hair", "cat hair"],
      looks: "Fur on every surface, or a coat that comes out in handfuls.",
      why: "Seasonal moulting is normal. A lot more than usual can point to stress, diet or skin problems.",
      helps: ["A deshedding brush or comb a few times a week takes out loose undercoat.", "Less swallowed hair also means fewer hairballs.", "Omega oils support a healthy coat."] },
    { slug: "scratching-ears", name: "Scratching at the ears", area: "cat-eyes-ears", sh: "cat-sym-scratching-ears",
      syn: ["scratching ears", "ear scratching", "scratching her ears", "ear itch", "itchy ears", "head shaking", "shaking head", "ear mites", "dark wax", "black wax", "coffee grounds"],
      looks: "Pawing at the ears, shaking the head, and dark crumbly wax that looks like coffee grounds.",
      why: "Ear mites are the classic cause, especially in kittens. Wax build-up, allergies and infections are the others.",
      helps: ["Clean the outer ear gently with a cat ear cleaner. Never push cotton buds in.", "Ear mite drops treat the mites; treat every cat and dog in the home.", "Red, swollen or smelly ears, or a head tilt, need a vet."] },
    { slug: "watery-eyes", name: "Watery eyes", area: "cat-eyes-ears", sh: "cat-sym-watery-eyes",
      syn: ["watery eyes", "runny eyes", "weepy eyes", "eye discharge", "crusty eyes", "sticky eyes", "tear stains", "squinting", "eye goo", "sneezing and eyes"],
      looks: "Wet fur under the eyes, brown tear stains or crusty corners, sometimes with sneezing.",
      why: "Cat flu and other viruses, irritation, blocked tear ducts and flat faces. A squint or cloudy eye can be an emergency.",
      helps: ["Wipe gently with a damp pad or cat eye wipe, one fresh pad for each eye.", "Keep their space dust-free.", "See your vet the same day for a closed, cloudy or painful eye."] },
    { slug: "hairballs", name: "Vomiting hairballs", area: "cat-tummy-gut", sh: "cat-sym-hairballs",
      syn: ["hairballs", "hairball", "furball", "coughing up fur", "retching", "gagging", "bringing up hair", "hacking"],
      looks: "Retching and bringing up a wet tube of hair, now and then.",
      why: "Swallowed fur from grooming. One now and then is normal; more than one a week is not.",
      helps: ["Brush often, especially in longhaired cats.", "Hairball pastes and fibre-rich food help it pass.", "Repeated retching with nothing coming up is an emergency."] },
    { slug: "vomiting", name: "Sickness or vomiting", area: "cat-tummy-gut", sh: "cat-sym-vomiting",
      syn: ["vomiting", "being sick", "sick", "throwing up", "keeps being sick", "vomit", "sickness", "upset tummy", "sensitive stomach", "eating too fast"],
      looks: "Bringing up food or yellow froth, sometimes soon after eating.",
      why: "Eating too fast, a food change, hairballs or a sensitive stomach. Repeated vomiting can be a sign of illness.",
      helps: ["Smaller meals more often, or a slow feeder, help cats that gulp.", "Gut support and gentle diets settle sensitive tummies.", "Any cat that vomits repeatedly, is lethargic or cannot keep water down needs a vet."] },
    { slug: "loose-stools", name: "Loose stools", area: "cat-tummy-gut", sh: "cat-sym-loose-stools",
      syn: ["diarrhoea", "diarrhea", "loose stools", "runny poo", "loose poo", "soft stools", "upset tummy", "wet poo"],
      looks: "Soft, runny or smelly stools, sometimes with straining.",
      why: "A food change, an intolerance, parasites or stress. Persistent loose stools need a vet.",
      helps: ["Keep water down and a bland, gentle diet for a day or two.", "Probiotics and soluble fibre help firm stools.", "Blood, black stools or more than two days of diarrhoea need your vet."] },
    { slug: "constipation", name: "Constipation or straining", area: "cat-tummy-gut", sh: "cat-sym-constipation",
      syn: ["constipation", "constipated", "hard stools", "straining to poo", "cannot poo", "dry stools"],
      looks: "Small, hard stools or lots of trips to the tray with little result.",
      why: "Dehydration, too little fibre, hairballs or pain. Straining can look the same as a urinary problem, so check what is coming out.",
      helps: ["Wet food and a water fountain increase hydration.", "A little psyllium husk or fibre can help.", "No stool for two days, or any straining with nothing at all, needs your vet."] },
    { slug: "not-eating", name: "Not eating", area: "cat-tummy-gut", sh: "cat-sym-not-eating",
      syn: ["not eating", "off food", "won't eat", "loss of appetite", "fussy", "fussy eater", "refusing food", "no appetite", "picky"],
      looks: "Leaving food, sniffing and walking away, or eating much less than usual.",
      why: "Dental pain, nausea, stress, a food change or illness. A cat that stops eating can become seriously ill within a couple of days.",
      helps: ["Warm wet food, toppers and pastes tempt a poor appetite.", "Calm, quiet feeding spots help stressed cats.", "No food for more than 24 hours: ring your vet."] },
    { slug: "weight-gain", name: "Putting on weight", area: "cat-tummy-gut", sh: "cat-sym-weight-gain",
      syn: ["overweight", "fat cat", "weight gain", "too fat", "putting on weight", "obese", "chubby"],
      looks: "No visible waist, and you cannot feel the ribs easily.",
      why: "Neutering, indoor life and free-feeding. Extra weight strains joints and raises diabetes risk.",
      helps: ["Measure meals and move to a lower-calorie sterilised or light food.", "Play for ten minutes a day.", "Slow feeders and lick mats stretch mealtimes."] },
    { slug: "straining-to-wee", name: "Straining to wee", area: "cat-toilet", sh: "cat-sym-straining-to-wee",
      syn: ["straining to wee", "cannot wee", "blocked", "straining", "not weeing", "blood in urine", "crying in litter tray", "peeing blood", "frequent litter tray", "weeing little and often", "cystitis", "uti", "urinary"],
      looks: "Lots of trips to the tray, crying or straining, little or no urine, or blood in the urine.",
      why: "Cystitis, crystals and stones. A male cat that cannot pass urine is an emergency, because a blockage can be fatal within a day.",
      helps: [URGENT, "Urinary-support diets help prevent crystals once your vet has checked your cat.", "More water, wet food and clean trays help reduce stress on the bladder."] },
    { slug: "drinking-more", name: "Drinking more than usual", area: "cat-toilet", sh: "cat-sym-drinking-more",
      syn: ["drinking more", "drinking a lot", "thirsty", "excessive thirst", "weeing more", "big wees", "water bowl"],
      looks: "Emptying the water bowl much faster, big puddles in the tray.",
      why: "Kidney disease, diabetes and an overactive thyroid are common in older cats.",
      helps: ["Make a note of how much they drink in a day.", "Book a vet check and ask about a blood and urine test.", "Kidney-support diets may help if your vet confirms kidney disease."] },
    { slug: "accidents", name: "Going outside the tray", area: "cat-toilet", sh: "cat-sym-accidents",
      syn: ["peeing on carpet", "weeing outside tray", "toilet accidents", "toileting indoors", "spraying", "marking", "not using litter tray", "peeing everywhere", "wees on bed"],
      looks: "Wees or poos on the floor, a bed or a laundry pile, or sprays up a wall.",
      why: "A urinary problem, stress, a dirty tray or a change at home. Always rule out a medical cause first.",
      helps: ["One more tray than the number of cats, in quiet places.", "Calming support and pheromone products help stress-related marking.", "Clean accidents with an enzyme cleaner, not bleach or ammonia."] },
    { slug: "bad-breath", name: "Bad breath", area: "cat-mouth-teeth", sh: "cat-sym-bad-breath",
      syn: ["bad breath", "smelly breath", "stinky breath", "halitosis", "tartar", "gingivitis", "red gums", "drooling", "mouth pain", "dropping food", "dental"],
      looks: "Smelly breath, yellow-brown tartar, red gums or dropping food.",
      why: "Plaque and gum disease, which most cats over three have to some degree. A fishy or sweet breath can also point to other illness.",
      helps: ["Brush daily with cat toothpaste, never human.", "Dental powders and chews slow plaque.", "Drooling, pawing at the mouth or refusing food needs a dental check."] },
    { slug: "hiding", name: "Hiding away or stressed", area: "cat-behaviour-mood", sh: "cat-sym-hiding",
      syn: ["hiding", "scared", "stressed", "anxious", "nervous", "frightened", "afraid", "hiding under bed", "new baby", "moved house", "visitors", "fireworks", "new pet", "clingy", "hates the vet", "carrier"],
      looks: "Spends more time hiding, flinches at noise, stops eating or grooming less.",
      why: "A change at home, a new pet, noise or boredom. Illness can also make a cat withdrawn.",
      helps: ["A quiet covered hiding place on a shelf or in a box.", "Pheromone diffusers and calming supplements settle many cats.", "Keep routines steady and give the cat control over visitors."] },
    { slug: "limping", name: "Limping or stiff", area: "cat-legs-mobility", sh: "cat-sym-limping",
      syn: ["limping", "limp", "stiff", "stiff legs", "stiff after sleeping", "not jumping", "slow to jump", "cannot jump", "struggling on stairs", "arthritis", "sore leg", "holding leg up", "lame"],
      looks: "Hesitating before a jump, taking the stairs slowly or limping after a rest.",
      why: "Arthritis is common and often missed in older cats. A single sore leg can be a sprain, a bite or a fracture.",
      helps: ["Steps or a ramp to favourite spots.", "Joint supplements help many cats over a few weeks.", "A warm, soft bed off cold floors.", "Never give human painkillers: paracetamol and ibuprofen are toxic to cats."] },
    { slug: "wound-stitches", name: "A wound or stitches", area: "cat-whole-body", sh: "cat-sym-wound-stitches",
      syn: ["wound", "stitches", "after surgery", "after spay", "after neutering", "post op", "cut", "bite", "licking stitches", "cone", "collar", "recovery suit"],
      looks: "A cut, bite or surgical scar that needs protecting while it heals.",
      why: "Surgery, injuries and fights. Licking can open stitches and cause infection.",
      helps: ["A soft recovery collar or suit stops licking.", "Keep the area clean and dry and check it daily.", "Swelling, discharge or a gap in the stitches means a call to your vet."] },
    { slug: "fleas", name: "Fleas or worms", area: "cat-whole-body", sh: "cat-sym-fleas",
      syn: ["fleas", "flea", "worms", "ticks", "tapeworm", "rice grains", "flea dirt", "parasites", "worming", "wormer"],
      looks: "Black specks in the coat, rice-like segments by the tail or a bloated tummy in kittens.",
      why: "Fleas and worms are picked up indoors and out. Regular treatment is the key.",
      helps: ["Use a vet-recommended cat flea and worm treatment on a regular schedule.", "Treat the house too: wash bedding and vacuum often.", "Never use dog flea products on cats: some are poisonous."] },
    { slug: "low-energy", name: "Low energy or lethargy", area: "cat-whole-body", sh: "cat-sym-low-energy",
      syn: ["lethargic", "low energy", "tired", "sleeping more", "not playing", "slowing down", "listless", "older cat", "old cat", "senior cat", "weight loss", "losing weight"],
      looks: "Sleeping more, less play or interest, a dull coat.",
      why: "Age, pain, kidney or thyroid disease, or an infection.",
      helps: ["A vet check and blood test are worthwhile for older cats.", "Complete daily supplements and senior diets support older cats.", "A cat that hides and will not eat or drink needs a vet urgently."] }
  ];

  var CD = [
    { key: "urinary-problems", sh: "cat-urinary-problems", name: "Urinary problems", re: /urinary|cystitis|bladder|struvite|\bcrystals?\b|blocked/i,
      what: "Cystitis, crystals and stones affect the bladder and urethra. Signs are straining, frequent small wees or blood in the urine.",
      helps: [URGENT, "Urinary-support diets reduce crystals once your vet has diagnosed them.", "Encourage drinking with wet food and a water fountain."], more: ["Keep trays clean, with a quiet spot and plenty of them."] },
    { key: "kidney-support", sh: "cat-kidney-support", name: "Kidney disease", re: /kidney|renal/i,
      what: "Common in older cats. The kidneys slowly lose their ability to filter, so cats drink and wee more, lose weight and eat less.",
      helps: ["Renal veterinary diets, as your vet advises, are the mainstay.", "Fresh water everywhere and wet food.", "Regular blood and urine checks."], more: [] },
    { key: "diabetes", sh: "cat-diabetes", name: "Diabetes", re: /diabet/i,
      what: "The body cannot control blood sugar. Cats drink and wee more and lose weight despite eating well.",
      helps: ["Your vet will start treatment and a low-carbohydrate diet.", "Veterinary diabetic wet and dry diets are available.", "Keep meals on a regular routine."], more: [] },
    { key: "hairballs", sh: "cat-hairballs", name: "Hairballs", re: /hairball|furball/i,
      what: "Swallowed fur collects in the stomach and is brought back up. Common in longhaired cats and heavy groomers.",
      helps: ["Brush regularly.", "Hairball paste or fibre-rich food moves hair through.", "A cat that retches with nothing coming up needs a vet."], more: [] },
    { key: "itchy-skin", sh: "cat-itchy-skin", name: "Itchy skin and allergies", re: /allerg|dermatitis|eczema|itchy skin|\bitch/i,
      what: "Fleas, food and environmental allergies cause scratching, scabs and over-grooming.",
      helps: ["Treat fleas first.", "Soothing skin sprays and shampoos.", "Omega oils and hypoallergenic diets for food allergy."], more: [] },
    { key: "ear-mites", sh: "cat-ear-mites", name: "Ear mites", re: /ear mites?|ear infection|ear problem/i,
      what: "Tiny parasites in the ear cause dark, crumbly wax and a lot of scratching. Very catching between pets.",
      helps: ["Ear mite drops or oil, as directed.", "Clean the outer ear gently with a cat ear cleaner.", "Treat all cats and dogs in the home."], more: [] },
    { key: "arthritis", sh: "cat-arthritis", name: "Arthritis", re: /arthrit|stiff joints|joint pain|\bjoints?\b/i,
      what: "Wear and tear in the joints is very common in older cats and often missed. Cats get stiff, jump less and groom less.",
      helps: ["Joint supplements for a few weeks.", "Steps and ramps to favourite spots.", "Soft, warm bedding."], more: ["Keep your cat at a healthy weight."] },
    { key: "stress-anxiety", sh: "cat-stress-anxiety", name: "Stress and anxiety", re: /anxi|stress|nervous|scared|fireworks|calming|new baby/i,
      what: "Cats hide, over-groom or mark when things change at home. Noise, new pets and house moves are common triggers.",
      helps: ["Pheromone diffusers and sprays.", "Calming supplements.", "Quiet hiding places and steady routines."], more: [] },
    { key: "dental-disease", sh: "cat-dental-disease", name: "Dental disease", re: /dental|gum disease|tartar|plaque|teeth/i,
      what: "Plaque turns into tartar and the gums become red and sore. Most cats over three have some.",
      helps: ["Brush daily with cat toothpaste.", "Dental powders and chews.", "A vet check for drooling or pain."], more: [] },
    { key: "fleas-ticks-worms", sh: "cat-fleas-ticks-worms", name: "Fleas, ticks and worms", re: /\bfleas?\b|ticks?|worms?|worming|parasite/i,
      what: "Parasites picked up indoors and out. Regular treatment protects your cat and your home.",
      helps: ["Vet-recommended cat flea treatments, on schedule.", "Worming tablets or spot-ons.", "Wash bedding and vacuum often."], more: ["Never use dog flea products on cats."] },
    { key: "post-surgery-recovery", sh: "cat-post-surgery-recovery", name: "Recovery after surgery", re: /surgery|operation|spay|neuter|stitches|post.?op|recover/i,
      what: "Your cat is healing after an operation or injury and needs rest, protection and a close eye on the wound.",
      helps: ["Soft recovery collars and suits stop licking.", "Keep indoors and rest for the time your vet advises.", "Check the wound daily."], more: [] },
    { key: "wound-care", sh: "cat-wound-care", name: "Wound care", re: /wound|cut\b|abscess|bite/i,
      what: "Cuts, bites and sore patches need cleaning and protecting. Cat bites can abscess.",
      helps: ["Clean with a cat-safe antiseptic.", "Protect with a dressing or suit if your vet advises.", "Hot, swollen or smelly wounds need a vet."], more: [] },
    { key: "sensitive-tummy", sh: "cat-sensitive-tummy", name: "Sensitive tummy", re: /sensitive (tummy|stomach)|upset tummy|diarrh|vomit|tummy|digest/i, weak: 0,
      what: "Loose stools, sickness or a fussy stomach, often linked to food changes, eating too fast or an intolerance.",
      helps: ["Gentle, easily digested diets.", "Probiotics and prebiotics.", "Smaller meals and a slow feeder."], more: [] }
  ];
  CD.forEach(function (c) { c.page = "/collections/all?c=" + c.sh; });

  var AREAS = { "cat-skin-coat": "cat-sym-area-skin-coat", "cat-eyes-ears": "cat-sym-area-eyes-ears", "cat-tummy-gut": "cat-sym-area-tummy-gut", "cat-toilet": "cat-sym-area-toilet", "cat-mouth-teeth": "cat-sym-area-mouth", "cat-behaviour-mood": "cat-sym-area-behaviour", "cat-legs-mobility": "cat-sym-area-legs", "cat-whole-body": "cat-sym-area-whole-body" };
  var AREA_NAME = { "cat-skin-coat": "Skin & coat", "cat-eyes-ears": "Eyes & ears", "cat-tummy-gut": "Tummy & gut", "cat-toilet": "Toilet habits", "cat-mouth-teeth": "Mouth & teeth", "cat-behaviour-mood": "Behaviour & mood", "cat-legs-mobility": "Legs & mobility", "cat-whole-body": "Whole body" };

  /* each symptom and condition points at its cat shelf, so the assistant can show real products */
  Object.keys(AREAS).forEach(function (a) { TAGS[a] = P(AREAS[a]); });
  SG.forEach(function (s) { TAGS[s.area + "/" + s.slug] = P(s.sh); });
  CD.forEach(function (c) { TAGS[c.key] = P(c.sh); });
  TAGS["senior-support"] = TAGS["senior-support"] || [];

  window.PETAI = {
    sg: SG, conds: CD, areaName: AREA_NAME,
    areas: [
      { id: "cat-skin-coat", name: "Skin & coat", blurb: "Itching, over-grooming, scabs, tangles", tint: "#EAF0E6" },
      { id: "cat-eyes-ears", name: "Eyes & ears", blurb: "Ear scratching, dark wax, weepy eyes", tint: "#E4EED6" },
      { id: "cat-tummy-gut", name: "Tummy & gut", blurb: "Hairballs, sickness, loose stools, appetite", tint: "#F1EEDC" },
      { id: "cat-toilet", name: "Toilet habits", blurb: "Straining, blood in urine, going outside the tray", tint: "#E7EEE9" },
      { id: "cat-mouth-teeth", name: "Mouth & teeth", blurb: "Bad breath, tartar and sore gums", tint: "#EFEAE0" },
      { id: "cat-behaviour-mood", name: "Behaviour & mood", blurb: "Hiding, spraying, stress and fear", tint: "#E9EDDC" },
      { id: "cat-legs-mobility", name: "Legs & mobility", blurb: "Stiffness, not jumping, limping", tint: "#E4EED6" },
      { id: "cat-whole-body", name: "Whole body", blurb: "Wounds, surgery, fleas, slowing down", tint: "#EAF0E6" }
    ],
    linked: [["arthritis", /arthritis/i], ["itchy-skin", /allerg/i], ["stress-anxiety", /anxi|stress/i], ["dental-disease", /gum disease|dental|tartar/i], ["kidney-support", /kidney/i], ["urinary-problems", /urinary|bladder|cystitis/i], ["sensitive-tummy", /diet|digest|tummy/i]],
    start: ["My cat keeps scratching", "Stiff and not jumping", "Upset tummy", "Hiding or stressed", "Recovery after surgery", "Where is my order?"],
    ph: "Describe what you’re seeing, e.g. licking her belly bald",
    pop: [
      { q: "My cat keeps scratching and over-grooming", a: "<p>Fleas and allergies are the usual causes. Ask the assistant for what helps.</p>" },
      { q: "My older cat is stiff and not jumping", a: "<p>Arthritis is very common in older cats. Ask the assistant for what helps.</p>" },
      { q: "My cat is straining in the litter tray", a: "<p>This can be an emergency, especially in male cats. Ask the assistant, and ring your vet if little or nothing is coming out.</p>" },
      { q: "My cat is being sick or bringing up hairballs", a: "<p>Ask the assistant for what helps.</p>" },
      { q: "My cat keeps shaking her head and scratching her ears", a: "<p>Ear mites are the classic cause. Ask the assistant for what helps.</p>" },
      { q: "My cat is stressed and hiding", a: "<p>Ask the assistant for what helps.</p>" },
      { q: "My cat has bad breath and tartar", a: "<p>Ask the assistant for what helps.</p>" },
      { q: "Which flea treatment is safe for cats?", a: "<p>Never use dog flea products on cats. Ask the assistant for cat-safe options.</p>" }
    ],
    topics: [
      ["Itchy skin", "Scratching, over-grooming, scabs and fleas", "My cat has itchy skin"],
      ["Joint pain & stiffness", "Arthritis, not jumping, slow on the stairs", "My older cat is stiff and not jumping"],
      ["Urinary problems", "Straining, blood in the urine, litter tray trouble", "My cat is straining to wee"],
      ["Tummy upsets", "Sickness, hairballs, loose stools and fussy eating", "My cat has an upset tummy"],
      ["Stress & calming", "Hiding, spraying, visitors and vet trips", "My cat is stressed and hiding"],
      ["Recovery after surgery", "Cones, recovery suits, rest and wound care", "My cat is recovering from surgery"]
    ]
  };

  /* the page itself (placeholder, examples and health topic tiles) */
  function fixPage() {
    if (!window.PET || !PET.isCat) return;
    var A = window.PETAI;
    var i = document.getElementById("aia-askq");
    if (i) { i.placeholder = "For example: my cat keeps licking her belly bald"; }
    var lb = document.querySelector('label[for="aia-askq"]'); if (lb) lb.textContent = "Ask about your cat’s health";
    var eg = document.querySelector(".aia-eg");
    if (eg) eg.innerHTML = 'Try: <button type="button" data-aia-q="My cat keeps scratching">my cat keeps scratching</button>, <button type="button" data-aia-q="My older cat is stiff and not jumping">stiff and not jumping</button>';
    var ht = document.querySelector(".aia-ht");
    if (ht) ht.innerHTML = A.topics.map(function (t) { return '<button type="button" data-aia-q="' + t[2] + '"><b>' + t[0] + '</b><span>' + t[1] + '</span></button>'; }).join("");
  }
  fixPage();
  document.addEventListener("DOMContentLoaded", fixPage);
})();
