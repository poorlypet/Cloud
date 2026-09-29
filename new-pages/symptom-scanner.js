/* Poorly Pet symptom scanner. One engine, three layouts (A, B, C).
   Load order: shell.js, products.js (PP_PRODUCTS, PP_BY_HANDLE, PP_TAGS), offers.js (PPOffers), this file.
   The page root carries data-ss="a" | "b" | "c".

   How the live scanner works (GemPages page "Symptom Scanner", /pages/symptom-scanner, one Free HTML element):
   the owner uploads ONE photo, the browser resizes it to max 1024px wide JPEG (quality 0.85) as a data URL,
   and POSTs JSON to a Cloudflare Worker:
     POST https://poorlypet-vision.green-mud-a533.workers.dev/symptom-check
     Content-Type: application/json
     { "area": "auto", "kind": "image", "images": ["data:image/jpeg;base64,..."] }
   and gets back
     { summary, see_vet_now, vet_reason, not_assessable,
       conditions: [ { slug, label, confidence, explanation } ] }
   where slug is one of the 16 condition slugs in LIVE_COND below. This page keeps that request shape.
   With LIVE = false (preview) a local engine matches the owner's words and picked signs to the
   43 symptoms of the signed-off symptom guide, using its synonyms. */
(function(){
'use strict';

/* ============================================================ CONFIG */
var LIVE = false;                                                          // true = call the live Worker when a photo is added
var ENDPOINT = 'https://poorlypet-vision.green-mud-a533.workers.dev/symptom-check';   // same URL as the live page
var SEND_TEXT = false;   // the live Worker was built for {area, kind, images}. Set true only once it accepts "notes" too.
/* ==================================================================== */

var AREAS=[{"id":"legs-paws","name":"Legs & paws","blurb":"Limping, stiffness, sore or licked paws"},{"id":"skin-coat","name":"Skin & coat","blurb":"Itching, hot spots, flaky or thin coat"},{"id":"tummy-gut","name":"Tummy & gut","blurb":"Upsets, wind, appetite and weight"},{"id":"eyes-ears","name":"Eyes & ears","blurb":"Head shaking, smelly ears, weepy eyes"},{"id":"mouth-teeth","name":"Mouth & teeth","blurb":"Bad breath, tartar and sore gums"},{"id":"back-spine","name":"Back & spine","blurb":"Stiff backs, wobbly legs, no jumping"},{"id":"behaviour-mood","name":"Behaviour & mood","blurb":"Worry, noise fear and restlessness"},{"id":"whole-body","name":"Whole body","blurb":"Ageing, energy, weight and recovery"}];
var SYMPTOMS=[
{"slug":"holding-a-paw-up","name":"Holding a paw up","area":"legs-paws","syn":["lifting paw","three legged","hopping","sore paw","won't put weight on leg","cut pad","thorn"],"looks":"Holds one paw off the ground when standing or walking, or only touches it down briefly.","why":"A thorn, grass seed or cut in the pad, a torn nail, a sting, a sprain, or a joint or ligament problem.","helps":"Check between the toes and pads in good light for seeds, cuts or swelling."},
{"slug":"licking-or-chewing-paws","name":"Licking or chewing paws","area":"legs-paws","syn":["paw licking","chewing feet","itchy feet","red paws","brown stained paws","nibbling toes","yeasty paws"],"looks":"Frequent licking or nibbling at the feet, often with pink-brown staining, red skin between the toes or a yeasty smell.","why":"Allergies to pollen, mites or food, yeast or bacterial infection, a grass seed, dry cracked pads, or boredom and stress.","helps":"Rinse and dry paws after walks, especially in pollen season."},
{"slug":"limping-or-favouring-a-leg","name":"Limping or favouring a leg","area":"legs-paws","syn":["limping","limp","lame","lameness","hobbling","walking funny","bad leg","sore leg"],"looks":"An uneven walk, a nod of the head when a front leg hurts, or a hitch in the hips when a back leg hurts.","why":"A minor sprain or paw injury, arthritis, cruciate ligament damage, a slipping kneecap, or hip or elbow dysplasia.","helps":"Rest on the lead for a few days: no running, jumping or stairs."},
{"slug":"scuffed-nails-or-dragging-paws","name":"Scuffed nails or dragging paws","area":"legs-paws","syn":["knuckling","dragging feet","worn nails","scuffing","scraping feet","toes curling over"],"looks":"Worn tops to the nails on the back feet, a scraping sound on walks, or paws that fold over onto the knuckles.","why":"Nerve or spinal problems such as degenerative myelopathy or IVDD, rear-leg weakness with age, or sore joints changing how your dog walks.","helps":"Protective boots or toe grips stop the tops of the paws getting sore."},
{"slug":"slow-to-get-up","name":"Slow to get up","area":"legs-paws","syn":["struggling to stand","difficulty getting up","can't get up","stiff getting up","old dog"],"looks":"Takes a few goes to stand, pushes up with the front legs first, or is stiff for the first few steps.","why":"Arthritis, hip or elbow dysplasia, spondylosis, rear-leg weakness, or extra weight on sore joints.","helps":"A thick, supportive bed away from draughts."},
{"slug":"stiffness-after-rest","name":"Stiffness after rest","area":"legs-paws","syn":["stiff in the morning","stiff joints","walks it off","creaky","stiff after sleeping"],"looks":"Stiff and slow after sleeping or lying down, then loosens up after a few minutes of moving.","why":"A classic early sign of arthritis, and sometimes hip or elbow dysplasia. Cold, damp weather often makes it worse.","helps":"A warm, padded bed off cold floors."},
{"slug":"constant-licking-of-one-spot","name":"Constant licking of one spot","area":"skin-coat","syn":["licking one spot","lick granuloma","licking leg","obsessive licking","sore patch","licking wrist"],"looks":"Keeps going back to the same patch, often a wrist, leg or flank, leaving a wet, red or bald spot.","why":"A hot spot starting, an allergy, a sore joint underneath, a small wound, or boredom and anxiety.","helps":"Look closely for a wound, lump, seed or parasite."},
{"slug":"excessive-scratching","name":"Excessive scratching","area":"skin-coat","syn":["itchy","itching","itch","scratching","chewing skin","fleas","rubbing on carpet","itchy bottom","scooting"],"looks":"Scratching, nibbling or rubbing much more than usual, often at night, sometimes with red skin or broken hair. Some itchy dogs scoot their bottom along the floor.","why":"Fleas and mites, pollen, dust mite or food allergies, dry skin, or skin infection. Scooting is often full anal glands, worms or allergy.","helps":"Check for fleas and flea dirt with a flea comb. Treat every pet in the house."},
{"slug":"flaky-skin-or-dandruff","name":"Flaky skin or dandruff","area":"skin-coat","syn":["dandruff","dry skin","flakes","scurf","scaly skin","dull coat"],"looks":"White flakes in the coat, dry or scaly skin, often with a dull coat.","why":"Dry air and central heating, bathing too often, a diet low in healthy fats, allergies, mites or hormone problems.","helps":"Brush regularly to spread the natural oils."},
{"slug":"hair-loss-or-bald-patches","name":"Hair loss or bald patches","area":"skin-coat","syn":["bald patches","bald spot","hair loss","alopecia","thinning coat","losing fur","losing hair"],"looks":"Patches where the coat is thin or gone, beyond normal seasonal moulting.","why":"Scratching from fleas or allergies, mites, ringworm, hot spots, or hormone problems such as an underactive thyroid.","helps":"Check for fleas and treat if needed."},
{"slug":"raw-weepy-hot-spots","name":"Raw, weepy hot spots","area":"skin-coat","syn":["hot spot","hotspot","wet eczema","moist dermatitis","weeping sore","raw patch","oozing skin"],"looks":"A raw, red, wet patch that appears fast, often within hours, and is usually very sore. The fur around it gets matted.","why":"Something itchy starts it (fleas, allergy, a damp coat, an ear infection) and licking or scratching turns it into a hot spot.","helps":"Stop the licking with a cone or body suit."},
{"slug":"red-or-irritated-skin","name":"Red or irritated skin","area":"skin-coat","syn":["red skin","rash","inflamed skin","pink belly","spots","bumps","hives","sore skin"],"looks":"Pink or red skin, often on the belly, armpits, groin or paws, sometimes with small spots or bumps.","why":"Allergies, contact with something irritating (plants, cleaning products), fleas, or bacterial or yeast infection.","helps":"Rinse your dog off after walks through long grass."},
{"slug":"appetite-changes","name":"Appetite changes","area":"tummy-gut","syn":["not eating","off food","off his food","off her food","fussy eater","loss of appetite","always hungry","eating more","won't eat"],"looks":"Eating much less or much more than usual, leaving food, or suddenly begging and scavenging.","why":"An upset tummy, dental pain, stress, heat or a change of food. Longer term, gut or other health changes.","helps":"Offer a small, bland meal such as plain chicken and rice."},
{"slug":"excessive-wind","name":"Excessive wind","area":"tummy-gut","syn":["wind","gas","farting","flatulence","smelly wind","trumping","bloating"],"looks":"More wind, or smellier wind, than normal, sometimes with a gurgling tummy.","why":"Eating too fast, a recent food change, scavenging, rich treats, or a food that does not suit.","helps":"A slow-feeder bowl for fast eaters."},
{"slug":"gurgling-noisy-stomach","name":"Gurgling, noisy stomach","area":"tummy-gut","syn":["stomach noises","rumbling tummy","gurgling tummy","noisy tummy","eating grass","lip licking"],"looks":"Loud rumbling from the tummy, often with lip licking, eating grass or mild discomfort.","why":"An empty tummy, wind, a mild upset from something eaten, or a sensitive gut.","helps":"Smaller meals more often. A late snack helps if it happens on an empty tummy."},
{"slug":"loose-stools-or-diarrhoea","name":"Loose stools or diarrhoea","area":"tummy-gut","syn":["diarrhoea","diarrhea","runny poo","loose poo","soft poo","upset tummy","mucus in poo","blood in poo","the runs","scooting"],"looks":"Soft, runny or watery poo, often more frequent than usual, sometimes with mucus.","why":"Scavenging, a change of food, stress, worms or infection. Soft poo can also stop the anal glands emptying, which leads to scooting.","helps":"Plenty of fresh water, and small bland meals for a day or two."},
{"slug":"vomiting-or-regurgitation","name":"Vomiting or regurgitation","area":"tummy-gut","syn":["vomiting","vomit","sick","being sick","throwing up","retching","bringing up food","regurgitating","vomiting blood"],"looks":"Vomiting is active heaving from the tummy. Regurgitation is food coming back up with no effort, often undigested, soon after eating.","why":"Scavenging, eating too fast or a change of food. Some dogs simply have a sensitive stomach.","helps":"Rest the tummy, then offer small bland meals for a day."},
{"slug":"weight-gain","name":"Weight gain","area":"tummy-gut","syn":["overweight","fat","putting on weight","chubby","obese","heavy","pot belly"],"looks":"You cannot easily feel the ribs, the waist has gone when you look from above, or the tummy sags.","why":"Too much food or too many treats, less exercise, neutering or age. Sometimes an underactive thyroid.","helps":"Weigh food on scales rather than using a scoop."},
{"slug":"head-shaking","name":"Head shaking","area":"eyes-ears","syn":["shaking head","flapping ears","head tilt","tilting head"],"looks":"Shaking or flapping the head often, sometimes holding it tilted to one side.","why":"An ear infection, ear mites, a grass seed in the ear, water in the ear, or allergies.","helps":"Look inside the ear flap for redness, wax or a smell."},
{"slug":"odour-from-the-ears","name":"Odour from the ears","area":"eyes-ears","syn":["smelly ears","ear smell","yeasty ears","ear discharge","dirty ears","brown wax","ear wax"],"looks":"A yeasty, sour or unpleasant smell from the ears, often with brown or yellow wax.","why":"A yeast or bacterial ear infection, often linked to allergies or trapped moisture in floppy ears.","helps":"Clean the outer ear gently with a dog ear cleaner. Never push cotton buds deep in."},
{"slug":"red-inflamed-ear-flaps","name":"Red, inflamed ear flaps","area":"eyes-ears","syn":["red ears","inflamed ears","sore ears","hot ears","swollen ear flap","ear blister"],"looks":"The inside of the ear flap is pink or red, warm, and may be bumpy or swollen.","why":"Allergies, ear infection, mites or scratching. A soft, puffy flap can be a blood blister (aural haematoma).","helps":"Keep the ears clean and dry."},
{"slug":"scratching-at-ears","name":"Scratching at ears","area":"eyes-ears","syn":["scratching ears","itchy ears","pawing ears","rubbing ears","rubbing head"],"looks":"Scratching at the ears with a back paw, or rubbing the head along the floor or furniture.","why":"Ear infection, mites, allergies, or something stuck in the ear.","helps":"Look and sniff: redness, wax, a smell or pain all point to a problem."},
{"slug":"weepy-or-red-eyes","name":"Weepy or red eyes","area":"eyes-ears","syn":["runny eyes","watery eyes","tear stains","eye discharge","red eyes","gunky eyes","conjunctivitis","squinting","sore eye"],"looks":"Watery or sticky discharge, tear staining, or redness of the white of the eye or the lining around it.","why":"Allergies, dust or irritation, conjunctivitis, blocked tear ducts, or a scratch on the eye.","helps":"Gently wipe away discharge with cooled boiled water on cotton wool, a fresh piece for each eye."},
{"slug":"bad-breath","name":"Bad breath","area":"mouth-teeth","syn":["smelly breath","halitosis","stinky breath","dog breath","breath smells"],"looks":"Breath that is stronger or more unpleasant than usual, often with tartar or red gums.","why":"Plaque and gum disease in most dogs. Less often something stuck in the teeth, or kidney problems or diabetes.","helps":"Brush daily with a dog toothpaste. Never use human toothpaste."},
{"slug":"bleeding-or-red-gums","name":"Bleeding or red gums","area":"mouth-teeth","syn":["bleeding gums","red gums","sore gums","gingivitis","blood on toys","swollen gums"],"looks":"A red line along the gums, gums that bleed when chewing or brushing, or blood on toys.","why":"Gum disease from plaque, a broken tooth, or an injury from a stick or bone.","helps":"Brush gently with a soft brush and a dog toothpaste."},
{"slug":"dropping-food-slow-chewing","name":"Dropping food or slow chewing","area":"mouth-teeth","syn":["dropping food","chewing on one side","eating slowly","struggling to eat","won't eat hard food","dropping kibble"],"looks":"Chewing on one side, dropping food, eating slowly, or suddenly preferring soft food.","why":"Dental pain from a broken or loose tooth, gum disease or a mouth ulcer, or something stuck in the mouth.","helps":"Soften kibble with warm water for now."},
{"slug":"pawing-at-the-mouth","name":"Pawing at the mouth","area":"mouth-teeth","syn":["pawing mouth","rubbing face","drooling","gagging","something stuck in mouth","choking"],"looks":"Pawing or rubbing at the mouth or face, often with drooling, lip licking or gagging.","why":"Something stuck between the teeth or across the roof of the mouth (often a stick), a broken tooth, a sting, or dental pain.","helps":"If it is safe, look in the mouth in good light. Only remove an object if it comes out easily."},
{"slug":"yellow-or-brown-tartar","name":"Yellow or brown tartar","area":"mouth-teeth","syn":["tartar","plaque","dirty teeth","brown teeth","yellow teeth","calculus"],"looks":"Hard yellow or brown build-up on the teeth, usually worst on the back teeth and the canines.","why":"Plaque hardening into tartar, which leads on to gum disease. Small breeds are most prone.","helps":"Brush daily with dog toothpaste to stop more building up."},
{"slug":"hunched-or-arched-posture","name":"Hunched or arched posture","area":"back-spine","syn":["hunched back","arched back","tucked tummy","praying position","stiff back","head held low"],"looks":"Back arched up, head held low, tummy tucked in, or unwilling to turn the head.","why":"Back or neck pain (IVDD, spondylosis), or tummy pain. Front end down and bottom up (the praying position) often means tummy pain.","helps":"Rest: no jumping, stairs or rough play."},
{"slug":"reluctant-to-jump-or-climb","name":"Reluctant to jump or climb","area":"back-spine","syn":["won't jump","not jumping","won't use stairs","won't get in the car","can't jump on sofa","stairs"],"looks":"Hesitates or refuses to jump into the car or onto the sofa, or struggles with stairs.","why":"Back pain, arthritis, hip dysplasia, spondylosis, or a cruciate or knee problem.","helps":"Use a ramp or steps for the car and sofa."},
{"slug":"sudden-rear-weakness","name":"Sudden rear weakness","area":"back-spine","syn":["back legs gave way","collapsed","can't walk","paralysed","paralysis","dragging back legs","can't stand","back legs not working"],"looks":"The back legs suddenly go weak, wobbly or cross over, sometimes with a hunched back.","why":"Most often the spine: a slipped disc (IVDD), a strain or an injury.","helps":"Keep your dog calm and still, and carry rather than walk."},
{"slug":"wobbly-back-legs","name":"Wobbly back legs","area":"back-spine","syn":["wobbly","unsteady","weak back legs","swaying","ataxia","crossing legs","drunk walking","falling over"],"looks":"A swaying or unsteady back end, legs crossing, or falling over when turning.","why":"Slowly, over weeks: degenerative myelopathy, spondylosis, arthritis or muscle loss with age. Suddenly: IVDD, a spinal injury or an inner ear problem.","helps":"Non-slip flooring and a support harness help."},
{"slug":"yelping-when-touched","name":"Yelping when touched","area":"back-spine","syn":["crying when picked up","yelping","yelps","sensitive to touch","crying out","whimpering","in pain"],"looks":"Cries out when picked up, stroked along the back or touched in one spot, or when getting up.","why":"Back or neck pain such as IVDD, a muscle strain, arthritis, or tummy pain.","helps":"Rest, and lift your dog with support under the chest and the back end."},
{"slug":"destructive-behaviour","name":"Destructive behaviour","area":"behaviour-mood","syn":["chewing furniture","destroying things","digging","scratching doors","ripping things","chewing"],"looks":"Chewing, digging or scratching at doors and furniture, often when left alone or bored.","why":"Boredom, separation anxiety, teething, pent-up energy or stress.","helps":"More exercise and brain work: sniffing games, puzzle feeders, long-lasting chews."},
{"slug":"hiding-or-unusually-clingy","name":"Hiding or unusually clingy","area":"behaviour-mood","syn":["hiding","clingy","following me everywhere","withdrawn","needy","velcro dog","not himself","not herself"],"looks":"Hiding under furniture, keeping away from the family, or suddenly following you everywhere.","why":"Fear or stress, noise, changes at home, pain or illness, or confusion in older dogs.","helps":"Offer a quiet, covered den your dog can choose to use."},
{"slug":"pacing-or-restlessness","name":"Pacing or restlessness","area":"behaviour-mood","syn":["pacing","restless","can't settle","panting at night","wandering at night","unsettled"],"looks":"Walking about, lying down and getting straight back up, panting, unable to settle, often at night.","why":"Anxiety, pain, needing the toilet, confusion in older dogs, or tummy discomfort.","helps":"A calm evening routine with a late toilet trip."},
{"slug":"trembling-at-noises","name":"Trembling at noises","area":"behaviour-mood","syn":["fireworks","thunder","scared of noises","shaking","trembling","noise phobia","bangs","scared"],"looks":"Shaking, hiding, panting or trying to escape during fireworks, thunder or loud bangs.","why":"Noise fear, which often gets worse over time if it is not helped.","helps":"Walk before dark in firework season, and close the curtains."},
{"slug":"whining-or-barking-when-alone","name":"Whining or barking when alone","area":"behaviour-mood","syn":["separation anxiety","barking when left","howling","crying when alone","neighbours complaining","can't be left"],"looks":"Barking, howling or whining soon after you leave, sometimes with accidents indoors or chewing at doors.","why":"Separation anxiety, boredom, or a change in routine.","helps":"Practise short absences and build up slowly."},
{"slug":"drinking-more-than-usual","name":"Drinking more than usual","area":"whole-body","syn":["thirsty","drinking a lot","wee","weeing a lot","peeing more","excessive thirst","accidents indoors","urinating more"],"looks":"Emptying the water bowl more often, usually with more weeing or accidents indoors.","why":"Hot weather, exercise or a dry food. It can also go with kidney, urinary or hormone changes, especially in older dogs.","helps":"Never restrict water: keep a fresh bowl in reach all day."},
{"slug":"general-stiffness-with-age","name":"General stiffness with age","area":"whole-body","syn":["old dog","slowing down","senior dog","stiff","aging","ageing","getting old"],"looks":"Slower on walks, stiffer after rest, and less keen on stairs, play or jumping as the years go by.","why":"Arthritis is very common in older dogs, often with muscle loss and spondylosis.","helps":"A soft, supportive bed, rugs on slippery floors and a ramp for the car."},
{"slug":"low-energy-or-lethargy","name":"Low energy or lethargy","area":"whole-body","syn":["lethargic","lethargy","tired","sleepy","flat","no energy","quiet","depressed","off colour","not himself","not herself"],"looks":"Sleeping more, less interested in walks or play, slow to respond, not their usual self.","why":"Heat, a busy day, a mild upset or getting older. It can also go with thyroid, heart or other health changes.","helps":"Let them rest somewhere cool and quiet with water."},
{"slug":"post-surgery-recovery","name":"Recovering from surgery or injury","area":"whole-body","syn":["after surgery","after an operation","operation","recovery","stitches","wound","cone","spay","neuter","cage rest","crate rest"],"looks":"Your dog is healing after an operation, an injury or a wound, and needs rest and protection.","why":"Neutering, joint surgery such as a cruciate repair, lump removal, or an injury.","helps":"Follow your vet's rest and exercise plan."},
{"slug":"weight-management","name":"Trouble managing weight","area":"whole-body","syn":["losing weight","weight loss","underweight","thin","diet","can't lose weight","skinny"],"looks":"Your dog keeps gaining despite a diet, or is losing weight without trying.","why":"Too many calories or too little exercise. Unplanned weight loss can go with dental, gut or other health changes.","helps":"Weigh your dog monthly and keep a note."}
];

/* The 16 condition slugs the live Worker returns, with the PP_TAGS key used for products. */
var LIVE_COND={
  'hot-spots':{label:'Hot spots',tag:'hot-spots',area:'skin-coat'},
  'itchy-skin':{label:'Itchy skin & allergies',tag:'itchy-skin',area:'skin-coat'},
  'seasonal-allergies':{label:'Seasonal allergies',tag:'seasonal-allergies',area:'skin-coat'},
  'ear-infections':{label:'Ear infections',tag:'ear-eye-care',area:'eyes-ears'},
  'dental-disease':{label:'Dental disease',tag:'dental-disease',area:'mouth-teeth'},
  'arthritis':{label:'Arthritis',tag:'arthritis',area:'legs-paws'},
  'hip-dysplasia':{label:'Hip dysplasia',tag:'hip-dysplasia',area:'legs-paws'},
  'cruciate-ligament':{label:'Cruciate ligament',tag:'cruciate-ligament',area:'legs-paws'},
  'luxating-patella':{label:'Luxating patella',tag:'luxating-patella',area:'legs-paws'},
  'elbow-dysplasia':{label:'Elbow dysplasia',tag:'elbow-dysplasia',area:'legs-paws'},
  'rear-leg-weakness':{label:'Rear leg weakness',tag:'rear-leg-weakness',area:'back-spine'},
  'knuckling':{label:'Knuckling',tag:'knuckling',area:'legs-paws'},
  'paw-conditions':{label:'Paw conditions',tag:'legs-paws',area:'legs-paws'},
  'ivdd':{label:'IVDD',tag:'ivdd',area:'back-spine'},
  'back-pain':{label:'Back pain',tag:'back-pain',area:'back-spine'},
  'spondylosis':{label:'Spondylosis',tag:'spondylosis',area:'back-spine'}
};
/* our areas -> the live Worker's "area" values (it accepts auto, skin, ears, mouth, gait, back) */
var LIVE_AREA={'skin-coat':'skin','eyes-ears':'ears','mouth-teeth':'mouth','legs-paws':'gait','back-spine':'back'};
/* conditions named in a symptom's "why" text, shown as links under a match */
var LINKED=[
  ['arthritis',/arthritis/i,'Arthritis'],['hip-dysplasia',/hip (or elbow )?dysplasia/i,'Hip dysplasia'],
  ['cruciate-ligament',/cruciate/i,'Cruciate ligament'],['luxating-patella',/kneecap|patella/i,'Luxating patella'],
  ['ivdd',/ivdd/i,'IVDD'],['spondylosis',/spondylosis/i,'Spondylosis'],['degenerative-myelopathy',/myelopathy/i,'Degenerative myelopathy'],
  ['itchy-skin',/allerg/i,'Itchy skin & allergies'],['hot-spots',/hot spot/i,'Hot spots'],['dental-disease',/gum disease|dental|tartar/i,'Dental disease'],
  ['anxiety',/anxi|stress/i,'Anxiety'],['weight-management',/weight/i,'Weight'],['digestive-issues',/diet|digest|tummy|gut/i,'Digestive issues']
];

/* ------------------------------------------------------------ lookups */
var BY={},AREA={};
AREAS.forEach(function(a){AREA[a.id]=a;a.items=[]});
SYMPTOMS.forEach(function(s){BY[s.slug]=s;AREA[s.area].items.push(s)});
var PBH=window.PP_BY_HANDLE||{},TAGS=window.PP_TAGS||{},OFF=window.PPOffers||null;
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(s,el){return (el||document).querySelector(s)}
function $$(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))}
function money(n){return '£'+(Math.round(n*100)/100).toFixed(2)}
function lower(n){return n.charAt(0).toLowerCase()+n.slice(1)}
function scrollToEl(el,off){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-(off||12);window.scrollTo({top:y,behavior:RM?'auto':'smooth'})}
function guideUrl(slug){return 'symptom-guide-a.html#'+slug}

/* ------------------------------------------------------------ local matching engine */
var STOP={};('a an the my his her he she him it its is are was were be been being has have had and or of on in at to for with keeps keep keeping kept '+
  'dog dogs doggy pup our me i we you very really bit lot just seems seem seemed does do did from up this that these them they their there '+
  'when then also some any all as so but if about into again always lately recently since still now been think noticed notice seeing see has').split(' ').forEach(function(w){STOP[w]=1});
function stem(w){
  var m=w.match(/^(.{3,}?)(ing|ed|es|s|e|y)$/);if(m)w=m[1];
  if(/([bdfgklmnprt])\1$/.test(w))w=w.slice(0,-1);
  return w;
}
function words(t){
  return String(t||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(function(w){return w&&!STOP[w]}).map(stem);
}
SYMPTOMS.forEach(function(s){
  var seen={};s._syn=[];s._bag={};
  s.syn.concat([s.name]).forEach(function(p){
    var ws=words(p);if(!ws.length)return;var k=ws.slice().sort().join(' ');if(seen[k])return;seen[k]=1;
    s._syn.push(ws);ws.forEach(function(w){s._bag[w]=1});
  });
});
var HINTS=[
  [/after (a |the |long |their |his |her )?(walk|walks|exercise|run|runs|play)/,{'stiffness-after-rest':.8}],
  [/(back|hind|rear) legs?/,{'limping-or-favouring-a-leg':.3,'wobbly-back-legs':.3}],
  [/\bears?\b/,{'scratching-at-ears':.2,'head-shaking':.2,'odour-from-the-ears':.2}]
];

function localScan(st){
  var text=st.text||'',tw=words(text),has={};tw.forEach(function(w){has[w]=1});
  var low=text.toLowerCase(),picks=st.picks||[],score={};
  SYMPTOMS.forEach(function(s){
    var sc=0;
    s._syn.forEach(function(ws){if(ws.every(function(w){return has[w]}))sc+=Math.pow(ws.length,1.5)});
    var ov=0;Object.keys(has).forEach(function(w){if(s._bag[w])ov++});sc+=ov*.25;
    score[s.slug]=sc;
  });
  HINTS.forEach(function(h){if(h[0].test(low))Object.keys(h[1]).forEach(function(k){if(score[k]>0||h[1][k]>=.8)score[k]+=h[1][k]})});
  picks.forEach(function(k){if(k in score)score[k]+=3});
  if(st.area)AREA[st.area].items.forEach(function(s){if(score[s.slug]>0)score[s.slug]+=.4});
  var list=SYMPTOMS.filter(function(s){return score[s.slug]>=.75}).sort(function(a,b){return score[b.slug]-score[a.slug]});
  var top=list.length?score[list[0].slug]:0;
  list=list.filter(function(s){return score[s.slug]>=top*.35}).slice(0,3);
  return build(list.map(function(s){return {sym:s}}),st,'local');
}

/* ------------------------------------------------------------ result model shared by local and live */
function build(hits,st,source,summary){
  var items=hits.map(function(h,i){
    if(h.sym){var s=h.sym;return {rank:i,name:s.name,area:s.area,areaName:AREA[s.area].name,why:s.why,tip:s.helps,link:guideUrl(s.slug),
      tag:s.area+'/'+s.slug,linked:LINKED.filter(function(c){return c[1].test(s.why)}).slice(0,3)}}
    var c=h.cond,m=LIVE_COND[c.slug]||{};
    return {rank:i,name:c.label||m.label||c.slug,area:m.area||'',areaName:m.area?AREA[m.area].name:'',why:c.explanation||'',tip:'',link:'#',
      tag:m.tag||'',linked:[]};
  });
  /* products: best of the first match, then the others, then the area */
  var lists=items.map(function(it){return (TAGS[it.tag]||[]).slice()}),take=[4,3,2],out=[],why={};
  function add(h,it){if(PBH[h]&&!why[h]&&out.length<10){why[h]=it;out.push(h)}}
  lists.forEach(function(l,i){l.slice(0,take[i]).forEach(function(h){add(h,items[i])})});
  lists.forEach(function(l,i){l.forEach(function(h){add(h,items[i])})});
  if(items[0]&&items[0].area)(TAGS[items[0].area]||[]).forEach(function(h){if(out.length<8)add(h,items[0])});
  if(st.age==='senior'&&items.length)(TAGS['senior-support']||[]).slice(0,2).forEach(function(h){if(out.length>=10)out.pop();add(h,items[0])});
  return {source:source,items:items,products:out.map(function(h){return PBH[h]}),helps:why,summary:summary||'',empty:!items.length,dog:st.name||''};
}

/* ------------------------------------------------------------ >>> REAL SCANNER PLUGS IN HERE <<<
   Same request and response as the live /pages/symptom-scanner page. Only used when LIVE is true
   and the owner added a photo (the live Worker reads photos). Anything else uses localScan().
   The live response's see_vet_now / vet_reason are deliberately not shown (owner's round 2 rule). */
function realScanner(st){
  var body={area:LIVE_AREA[st.area]||'auto',kind:'image',images:[st.photo]};
  if(SEND_TEXT)body.notes=st.text||'';
  return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(function(d){
      d=d||{};
      if(d.not_assessable||!(d.conditions||[]).length)return null;
      var hits=(d.conditions||[]).slice(0,3).map(function(c){return {cond:{slug:c.slug||'',label:c.label||'',explanation:c.explanation||''}}});
      return build(hits,st,'live',d.summary||'');
    });
}
function scan(st){
  var wait=new Promise(function(r){setTimeout(r,RM?0:650)});
  var job=(LIVE&&st.photo)?realScanner(st).catch(function(e){if(window.console)console.warn('Scanner offline, using local match',e);return null})
    .then(function(r){return r||localScan(st)}):Promise.resolve(localScan(st));
  return Promise.all([job,wait]).then(function(a){return a[0]});
}

/* ------------------------------------------------------------ photo: resize on the device, like the live page */
function readPhoto(file,cb){
  if(!file||!/^image\//.test(file.type||'')){cb(null,'Please choose a photo (JPG, PNG or HEIC).');return}
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){
    var w=Math.min(1024,img.width),c=document.createElement('canvas');c.width=w;c.height=Math.round(img.height*w/img.width);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    try{cb(c.toDataURL('image/jpeg',.85))}catch(e){cb(null,'Sorry, that photo could not be read.')}
  };
  img.onerror=function(){URL.revokeObjectURL(url);cb(null,'Sorry, that photo could not be read. Try a JPG or PNG.')};
  img.src=url;
}
function photoField(id,small){
  return '<div class="ss-photo'+(small?' ss-photo-s':'')+'" data-photo>'+
    '<input class="ss-file" type="file" id="'+id+'" accept="image/*">'+
    '<label class="ss-drop" for="'+id+'"><span class="ss-cam" aria-hidden="true"></span><span><b>Add a photo</b><span>Optional. Close up, in good light.</span></span></label>'+
    '<div class="ss-prev" hidden><img alt="Your photo"><span class="ss-prev-t"><b>Photo added</b><span>Sent with your scan</span></span><button class="ss-link ss-rm" type="button">Remove</button></div>'+
    '<p class="ss-err" role="alert" hidden></p></div>';
}
function bindPhoto(box,st,onChange){
  var inp=$('.ss-file',box),drop=$('.ss-drop',box),prev=$('.ss-prev',box),err=$('.ss-err',box);
  function set(d){st.photo=d||null;prev.hidden=!d;drop.hidden=!!d;if(d)$('img',prev).src=d;if(onChange)onChange(d)}
  inp.addEventListener('change',function(){
    var f=inp.files&&inp.files[0];if(!f)return;err.hidden=true;
    readPhoto(f,function(d,msg){if(msg){err.textContent=msg;err.hidden=false;return}set(d)});
    try{inp.value=''}catch(e){}
  });
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('on')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('on')})});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)readPhoto(f,function(d,msg){if(msg){err.textContent=msg;err.hidden=false}else set(d)})});
  $('.ss-rm',box).addEventListener('click',function(){set(null)});
  return {clear:function(){set(null)}};
}

/* ------------------------------------------------------------ the site's product card (.pk) and rail */
function catTab(p){
  var t=(p.productType||'').toLowerCase()+' '+(p.title||'').toLowerCase();
  if(/bundle|gift set/.test(t))return 'Care kit';
  if(/wheelchair|brace|splint|harness|ramp|mobility|boot|knee|hock|carpal|rehab|lift/.test(t))return 'Mobility aids';
  if(/calming/.test(t))return 'Calming';
  if(/dental|tooth|breath/.test(t))return 'Dental care';
  if(/ear |ear$|eye |wipes/.test(t))return 'Skin, ear & eye';
  if(/flea|tick|worm/.test(t))return 'Flea & worming';
  if(/supplement|digestive|wellness|pet health|healthcare|joint/.test(t))return 'Supplements';
  if(/first aid|wound|bandage|recovery|collar|cone|cover|therapy|heat|cool/.test(t))return 'Recovery & first aid';
  if(/bed|blanket|mat|bedding/.test(t))return 'Beds & comfort';
  if(/food|treat|topper|diet|chew/.test(t))return 'Food & treats';
  if(/shampoo|groom|spray|balm|gel|conditioner|towel|cologne|paw/.test(t))return 'Grooming';
  return '';
}
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function rev(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  var n=p.reviewCount||0;
  return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function pk(p,helps){
  var badge=OFF?OFF.badge(p):null,line=OFF?(OFF.lines(p)[0]||''):'',tab=catTab(p),sale=p.compareAt&&p.compareAt>p.price,src=p.img||p.cdn||'';
  return '<article class="pk">'+(badge?'<span class="tab sale">'+esc(badge)+'</span>':tab?'<span class="tab">'+esc(tab)+'</span>':'')+
    '<a class="well" href="#">'+(src?'<img src="'+esc(src)+'" alt="" loading="lazy" data-ss-img>':'<span class="ss-noimg" aria-hidden="true"></span>')+'</a>'+
    '<div class="body"><span class="brand">'+esc(p.brand)+'</span><a class="name" href="#">'+esc(p.title)+'</a>'+rev(p)+
    (helps?'<span class="helps">'+esc(helps)+'</span>':'')+
    '<div class="price"><span class="now">'+money(p.price)+'</span>'+(sale?'<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>':'')+'</div>'+
    (line?'<span class="ss-offer">'+esc(line)+'</span>':'')+
    '<button class="btn" type="button" data-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
}
document.addEventListener('error',function(e){
  var t=e.target;
  if(t&&t.tagName==='IMG'&&t.hasAttribute('data-ss-img')){var s=document.createElement('span');s.className='ss-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);
function rail(res){
  return '<div class="railwrap ss-rw"><div class="rail prail" tabindex="0" aria-label="Products that help">'+
    res.products.map(function(p){var it=res.helps[p.handle];return pk(p,it?'For '+lower(it.name):'')}).join('')+'</div>'+
    '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
}
var railUps=[];
function bindRails(root){
  $$('.ss-rw',root).forEach(function(w){
    if(w._ss)return;w._ss=1;
    var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('ss-fit',max<=2);
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
    }
    function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:RM?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:RM?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});
    railUps.push(up);up();
  });
}
window.addEventListener('resize',function(){railUps.forEach(function(f){f()})});

/* basket: header count and a small toast */
var toastEl,toastT;
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-add]');if(!b)return;
  var p=PBH[b.getAttribute('data-add')];if(!p)return;
  var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+1;
  cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='ss-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML='<span><b>Added to basket</b>'+esc(p.title)+'</span><a href="#">View basket ('+n+')</a>';
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3600);
  var o=b.getAttribute('data-o')||b.textContent;b.setAttribute('data-o',o);b.textContent='Added';clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=o},1800);
});

/* ------------------------------------------------------------ shared report blocks */
function headline(res){
  if(res.empty)return 'No clear match yet';
  return (res.dog?esc(res.dog)+'\u2019s closest match: ':'Closest match: ')+esc(lower(res.items[0].name));
}
function hitHtml(it){
  return '<li class="ss-hit'+(it.rank===0?' ss-top':'')+'"><div class="ss-hit-h"><span class="ss-rank">'+(it.rank===0?'Closest match':'Also possible')+'</span>'+
    (it.areaName?'<span class="ss-area">'+esc(it.areaName)+'</span>':'')+'</div>'+
    '<h3>'+esc(it.name)+'</h3>'+
    (it.why?'<p><b>Usually down to:</b> '+esc(it.why)+'</p>':'')+
    (it.tip?'<p><b>Try first:</b> '+esc(it.tip)+'</p>':'')+
    (it.linked.length?'<p class="ss-linked"><b>Linked to:</b> '+it.linked.map(function(c){return '<a href="#">'+esc(c[2])+'</a>'}).join(', ')+'</p>':'')+
    '<a class="ss-more" href="'+esc(it.link)+'">'+(it.link==='#'?'Shop '+esc(lower(it.name))+' ›':'Read more in the symptom guide ›')+'</a></li>';
}
function hitsHtml(res){return '<ol class="ss-hits">'+res.items.map(hitHtml).join('')+'</ol>'}
function emptyHtml(){
  return '<div class="ss-empty"><p>We could not match that to a sign in our guide. Try the words you would use to a friend, like <b>itchy ears</b>, <b>limping</b> or <b>upset tummy</b>, or browse by area.</p>'+
    '<div class="ss-areas">'+AREAS.map(function(a){return '<a href="symptom-guide-a.html#'+a.items[0].slug+'">'+esc(a.name)+'</a>'}).join('')+'</div></div>';
}
function summaryLine(res){
  if(res.empty)return 'Nothing matched closely enough.';
  if(res.summary)return res.summary;
  var n=res.items.length;
  return n===1?'One sign in our guide fits what you described.':'Most likely first. '+n+' signs in our guide fit what you described.';
}
function faqBind(root){
  $$('.ss-q',root).forEach(function(q){q.addEventListener('click',function(){
    var on=!q.classList.contains('on');q.classList.toggle('on',on);q.setAttribute('aria-expanded',on);q.nextElementSibling.classList.toggle('on',on);
  })});
}
function fillResults(res,st){
  var rep=$('#ss-rep'),prod=$('#ss-prod');
  if(rep){
    rep.hidden=false;
    $('[data-rep-h]',rep).innerHTML=headline(res).replace(/(match: )(.*)$/,'$1<em>$2</em>');
    $('[data-rep-p]',rep).textContent=summaryLine(res);
    $('[data-rep-body]',rep).innerHTML=res.empty?emptyHtml():hitsHtml(res);
  }
  if(prod){
    prod.hidden=res.empty||!res.products.length;
    if(!prod.hidden){
      $('[data-prod-p]',prod).textContent=res.products.length+' picks for '+lower(res.items[0].name)+(res.items.length>1?' and related signs':'')+'.';
      $('[data-prod-body]',prod).innerHTML=rail(res);bindRails(prod);
    }
  }
}
function busy(btn,on){if(!btn)return;if(on){btn.setAttribute('data-o',btn.innerHTML);btn.innerHTML='Scanning…';btn.disabled=true}else{btn.innerHTML=btn.getAttribute('data-o')||btn.innerHTML;btn.disabled=false}}
function needWords(st){return !st.text.trim()&&!(st.picks&&st.picks.length)&&!(LIVE&&st.photo)}
var NEED_MSG='Add a few words about what you are seeing'+(LIVE?'':' (in this preview the scan reads your words; the photo goes to the live scanner)')+'.';

/* ============================================================ VERSION A: one panel, results below */
function runA(root){
  var st={text:'',photo:null,picks:[],area:null,name:'',age:''};
  var form=$('#ss-form',root),ta=$('#ss-desc',root),btn=$('.ss-go',root),msg=$('.ss-msg',root);
  $('[data-photo-slot]',root).innerHTML=photoField('ss-file-a');
  bindPhoto($('[data-photo]',root),st);
  function go(){
    st.text=ta.value;st.name=($('#ss-name',root).value||'').trim();st.age=$('#ss-age',root).value;
    if(needWords(st)){msg.textContent=NEED_MSG;msg.hidden=false;ta.focus();return}
    msg.hidden=true;busy(btn,true);
    scan(st).then(function(res){busy(btn,false);fillResults(res,st);scrollToEl($('#ss-rep'))});
  }
  form.addEventListener('submit',function(e){e.preventDefault();go()});
  $$('[data-try]',root).forEach(function(b){b.addEventListener('click',function(){ta.value=b.getAttribute('data-try');go()})});
  $$('[data-again]',root).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();ta.value='';scrollToEl($('#ss-scan'));setTimeout(function(){ta.focus({preventScroll:true})},RM?0:500)})});
}

/* ============================================================ VERSION B: guided, where then what */
function runB(root){
  var st={text:'',photo:null,picks:[],area:null,name:'',age:''};
  var s1=$('[data-step="1"]',root),s2=$('[data-step="2"]',root),btn=$('.ss-go',root),msg=$('.ss-msg',root),ta=$('#ss-desc',root);
  var segs=$$('.ss-seg i',root),cnt=$('.ss-count',root);
  $('[data-areas]',root).innerHTML=AREAS.map(function(a){return '<button class="ss-tile" type="button" data-area="'+a.id+'"><b>'+esc(a.name)+'</b><span>'+esc(a.blurb)+'</span></button>'}).join('');
  $('[data-photo-slot]',root).innerHTML=photoField('ss-file-b',true);
  bindPhoto($('[data-photo]',root),st);
  function show(n){
    s1.hidden=n!==1;s2.hidden=n!==2;segs.forEach(function(s,i){s.classList.toggle('on',i<n)});cnt.innerHTML='Step <b>'+n+'</b> of 2';
    var t=n===1?s1:s2;t.classList.remove('ss-in');void t.offsetWidth;t.classList.add('ss-in');
  }
  function pickArea(id){
    st.area=id;st.picks=[];
    $$('.ss-tile',root).forEach(function(t){t.setAttribute('aria-pressed',t.getAttribute('data-area')===id)});
    var a=AREA[id];
    $('[data-where]',root).textContent=a?a.name:'Anywhere';
    $('[data-chips]',root).innerHTML=a?a.items.map(function(s){return '<button class="ss-chip" type="button" aria-pressed="false" data-pick="'+s.slug+'">'+esc(s.name)+'</button>'}).join(''):'';
    $('[data-chips-h]',root).hidden=!a;
    ta.placeholder=a?'Anything else? For example: worse after walks, started last week':'For example: he keeps scratching his ears and shaking his head';
    show(2);scrollToEl($('#ss-scan'),8);
  }
  $('[data-areas]',root).addEventListener('click',function(e){var b=e.target.closest('[data-area]');if(b)pickArea(b.getAttribute('data-area'))});
  $('[data-skip]',root).addEventListener('click',function(){pickArea(null)});
  $('[data-back]',root).addEventListener('click',function(){show(1)});
  $('[data-chips]',root).addEventListener('click',function(e){
    var c=e.target.closest('[data-pick]');if(!c)return;var k=c.getAttribute('data-pick'),on=c.getAttribute('aria-pressed')!=='true';
    c.setAttribute('aria-pressed',on);st.picks=on?st.picks.concat(k):st.picks.filter(function(x){return x!==k});msg.hidden=true;
  });
  btn.addEventListener('click',function(){
    st.text=ta.value;
    if(needWords(st)){msg.textContent=st.area?'Pick one or more signs, or describe what you are seeing.':NEED_MSG;msg.hidden=false;return}
    msg.hidden=true;busy(btn,true);
    scan(st).then(function(res){busy(btn,false);fillResults(res,st);scrollToEl($('#ss-rep'))});
  });
  $$('[data-again]',root).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();ta.value='';st.picks=[];show(1);scrollToEl($('#ss-scan'))})});
  show(1);
}

/* ============================================================ VERSION C: chat-style scan with a report card */
function runC(root){
  var st={text:'',photo:null,picks:[],area:null,name:'',age:''};
  var log=$('.ss-log',root),form=$('.ss-compose',root),inp=$('#ss-say',root),card=$('.ss-card',root),stage='describe';
  $('[data-photo-slot]',root).innerHTML=photoField('ss-file-c',true);
  var photo=$('[data-photo]',root);
  function scrollLog(){log.scrollTo({top:log.scrollHeight,behavior:RM?'auto':'smooth'})}
  function say(who,html,quick){
    var d=document.createElement('div');d.className='ss-msgc '+(who==='me'?'ss-me':'ss-bot');
    d.innerHTML='<div class="ss-bub">'+html+'</div>'+(quick?'<div class="ss-quick">'+quick.map(function(q){return '<button type="button" class="ss-chip" data-q="'+esc(q)+'">'+esc(q)+'</button>'}).join('')+'</div>':'');
    $$('.ss-quick',log).forEach(function(q){q.remove()});
    log.appendChild(d);scrollLog();return d;
  }
  function typing(){var d=say('bot','<span class="ss-dots" aria-label="Scanning"><i></i><i></i><i></i></span>');return d}
  var START=['Scratching ears and shaking head','Limping on a back leg after walks','Licking his paws','Upset tummy'];
  function start(){
    log.innerHTML='';stage='describe';st.text='';st.photo=null;st.age='';st._shown=0;
    say('bot','Hello. What are you seeing? Describe it in your own words, and add a photo if it helps.',START);
    card.classList.remove('on');$('[data-card]',card).innerHTML='<p class="ss-card-empty">Your report appears here after the scan: the closest matches, what usually causes them, and what helps.</p>';
    $('#ss-prod').hidden=true;
  }
  function finish(){
    var t=typing();
    scan(st).then(function(res){
      t.remove();
      if(res.empty){stage='describe';say('bot','I could not match that to a sign in our guide. Try the words you would use to a friend, like "itchy ears" or "limping".',START);return}
      say('bot','Closest match: <b>'+esc(lower(res.items[0].name))+'</b>'+(res.items.length>1?', with '+(res.items.length-1)+' other possible sign'+(res.items.length>2?'s':''):'')+'. Your report is ready, and the products that help are below.',['Scan something else']);
      stage='done';
      $('[data-card]',card).innerHTML='<h3 class="ss-card-h">'+headline(res)+'</h3><p class="ss-card-p">'+esc(summaryLine(res))+'</p>'+hitsHtml(res)+
        '<a class="btn sec ss-card-go" href="#ss-prod">See '+res.products.length+' products that help</a>';
      card.classList.add('on');
      fillResults(res,st);
      if(window.innerWidth<900)setTimeout(function(){scrollToEl(card)},RM?0:250);
    });
  }
  function handle(text){
    text=(text||'').trim();
    if(stage==='done'){if(/something else/i.test(text)||!text){start();return}stage='describe';st.text='';st._shown=0}
    if(stage==='describe'){
      if(text)say('me',esc(text));
      if(st.photo&&!st._shown){st._shown=1;say('me','<img class="ss-chimg" src="'+st.photo+'" alt="Your photo">')}
      st.text=(st.text?st.text+' ':'')+text;
      if(needWords(st)){say('bot','Thanks for the photo. Add a few words about what you are seeing and I will match it.');return}
      stage='age';
      say('bot','Thanks. How old is your dog? It helps us pick the right products.',['Puppy','Adult','Senior (7+)','Skip']);
      return;
    }
    if(stage==='age'){
      say('me',esc(text||'Skip'));st.age=/senior|old|7|8|9|1[0-9]/i.test(text)?'senior':/pup/i.test(text)?'puppy':'';
      stage='scan';finish();
    }
  }
  form.addEventListener('submit',function(e){e.preventDefault();var v=inp.value;inp.value='';handle(v);pc.clear()});
  log.addEventListener('click',function(e){var q=e.target.closest('[data-q]');if(q)handle(q.getAttribute('data-q'))});
  var pc=bindPhoto(photo,st,function(d){if(d&&stage==='done')stage='describe'});
  pc.clear=(function(orig){return function(){var p=st.photo;orig();st.photo=p}})(pc.clear);
  $$('[data-again]',root).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();start();scrollToEl($('#ss-scan'))})});
  $$('[data-try]',root).forEach(function(b){b.addEventListener('click',function(){start();scrollToEl($('#ss-scan'));handle(b.getAttribute('data-try'))})});
  start();
}

/* ------------------------------------------------------------ boot */
var root=document.querySelector('[data-ss]');
if(root){
  faqBind(root);
  var v=root.getAttribute('data-ss');
  if(v==='a')runA(root);else if(v==='b')runB(root);else runC(root);
}
})();
