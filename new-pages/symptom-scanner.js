/* Poorly Pet symptom scanner. Photo first: one engine, three layouts (A, B, C).
   Load order: shell.js, products.js (PP_PRODUCTS, PP_BY_HANDLE, PP_TAGS), offers.js (PPOffers), this file.
   The page root carries data-ss="a" | "b" | "c".

   Same flow as the live scanner (GemPages page "Symptom Scanner", /pages/symptom-scanner, Free HTML element):
     1. the owner picks, drops or takes ONE photo
     2. the browser resizes it to max 1024px wide and makes a JPEG data URL (quality 0.85)
     3. POST https://poorlypet-vision.green-mud-a533.workers.dev/symptom-check
        Content-Type: application/json
        { "area": "auto", "kind": "image", "images": ["data:image/jpeg;base64,..."] }
     4. response { summary, see_vet_now, vet_reason, not_assessable,
                   conditions: [ { slug, label, confidence, explanation } ] }
        normalised exactly like the live page. not_assessable (or no conditions) = "we couldn't see enough".
   see_vet_now / vet_reason are read but not shown (owner's rule); the page shows one calm line instead.
   If the Worker can't be reached (offline, blocked preview) the owner can describe the problem instead:
   a local matcher maps their words to the 43 signs of the signed-off symptom guide. */
(function(){
'use strict';

/* ============================================================ CONFIG */
var LIVE = true;                                                                     // false = never call the Worker
var ENDPOINT = 'https://poorlypet-vision.green-mud-a533.workers.dev/symptom-check';  // same URL as the live page
var TIMEOUT = 45000;                                                                 // ms before we give up on a scan
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
  var list=SYMPTOMS.filter(function(s){return score[s.slug]>=.75}).sort(function(a,b){return score[b.slug]-score[a.slug]});
  var top=list.length?score[list[0].slug]:0;
  list=list.filter(function(s){return score[s.slug]>=top*.35}).slice(0,3);
  return list;
}

/* The 16 condition slugs the live Worker returns: our label, and the PP_TAGS key used for products. */
var COND={
  'hot-spots':{label:'Hot spots',tag:'hot-spots',group:'Skin'},
  'itchy-skin':{label:'Itchy skin & allergies',tag:'itchy-skin',group:'Skin'},
  'seasonal-allergies':{label:'Seasonal allergies',tag:'seasonal-allergies',group:'Skin'},
  'ear-infections':{label:'Ear infections',tag:'ear-eye-care',group:'Ears & mouth'},
  'dental-disease':{label:'Dental disease',tag:'dental-disease',group:'Ears & mouth'},
  'arthritis':{label:'Arthritis',tag:'arthritis',group:'Joints'},
  'hip-dysplasia':{label:'Hip dysplasia',tag:'hip-dysplasia',group:'Joints'},
  'elbow-dysplasia':{label:'Elbow dysplasia',tag:'elbow-dysplasia',group:'Joints'},
  'cruciate-ligament':{label:'Cruciate ligament',tag:'cruciate-ligament',group:'Joints'},
  'luxating-patella':{label:'Luxating patella',tag:'luxating-patella',group:'Joints'},
  'paw-conditions':{label:'Paw conditions',tag:'legs-paws',group:'Legs & paws'},
  'knuckling':{label:'Knuckling',tag:'knuckling',group:'Legs & paws'},
  'rear-leg-weakness':{label:'Rear leg weakness',tag:'rear-leg-weakness',group:'Legs & paws'},
  'ivdd':{label:'IVDD',tag:'ivdd',group:'Back'},
  'back-pain':{label:'Back pain',tag:'back-pain',group:'Back'},
  'spondylosis':{label:'Spondylosis',tag:'spondylosis',group:'Back'}
};

/* ------------------------------------------------------------ helpers */
var BY={};SYMPTOMS.forEach(function(s){BY[s.slug]=s});
var PBH=window.PP_BY_HANDLE||{},TAGS=window.PP_TAGS||{},OFF=window.PPOffers||null;
if(!window.PP_BY_HANDLE&&window.PP_PRODUCTS)window.PP_PRODUCTS.forEach(function(p){PBH[p.handle]=p});
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(s,el){return (el||document).querySelector(s)}
function $$(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))}
function money(n){return '£'+(Math.round(n*100)/100).toFixed(2)}
function shopName(l){return /^[A-Z]{3,}$/.test(l)?l:l.charAt(0).toLowerCase()+l.slice(1)}
function scrollToEl(el,off){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-(off||12);window.scrollTo({top:y,behavior:RM?'auto':'smooth'})}

/* ------------------------------------------------------------ photo: resize on the device, exactly like the live page */
function readPhoto(file,cb){
  var ty=(file&&file.type)||'',nm=((file&&file.name)||'').toLowerCase();
  if(!file||ty.indexOf('video')===0||/\.(mov|mp4|m4v|avi|webm|3gp|3g2|mkv|hevc|qt)$/.test(nm)){cb(null,'Please choose a photo (JPG, PNG or HEIC).');return}
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){
    var c=document.createElement('canvas');
    var w=Math.min(1024,img.width),scale=w/img.width;
    c.width=w;c.height=Math.round(img.height*scale);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(url);
    try{cb(c.toDataURL('image/jpeg',0.85))}catch(e){cb(null,'Sorry, that photo couldn’t be read. Please try a JPG or PNG.')}
  };
  img.onerror=function(){URL.revokeObjectURL(url);cb(null,'Sorry, that photo couldn’t be read. Please try a JPG or PNG.')};
  img.src=url;
}

/* ------------------------------------------------------------ the scan request, same as the live page */
function normalize(d){
  d=d||{};
  var conds=(d.conditions||[]).map(function(c){
    return {slug:c.slug||'',label:c.label||(COND[c.slug]||{}).label||c.slug||'Possible match',confidence:Math.round(c.confidence||0),explanation:c.explanation||''};
  });
  return {summary:d.summary||'Here’s what we found.',see_vet_now:!!d.see_vet_now,vet_reason:d.vet_reason||'',conditions:conds,not_assessable:!!d.not_assessable};
}
function fail(kind,e){var x=new Error(kind);x.kind=kind;x.cause=e;return x}
function scanPhoto(data){
  if(!LIVE)return Promise.reject(fail('offline'));
  if(navigator.onLine===false)return Promise.reject(fail('offline'));
  var ctl=window.AbortController?new AbortController():null,timer=ctl?setTimeout(function(){ctl.abort()},TIMEOUT):0;
  return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({area:'auto',kind:'image',images:[data]}),signal:ctl?ctl.signal:undefined})
    .then(function(r){
      clearTimeout(timer);
      return r.json().catch(function(){throw fail('server')}).then(function(d){if(!r.ok&&!(d&&d.conditions))throw fail('server');return normalize(d)});
    },function(e){clearTimeout(timer);throw fail(e&&e.name==='AbortError'?'slow':'offline',e)});
}

/* ------------------------------------------------------------ result model (photo scan or described) */
function productsFor(items){
  var lists=items.map(function(it){return (TAGS[it.tag]||[]).slice()}),take=[4,3,2],out=[],why={};
  function add(h,it){if(PBH[h]&&!why[h]&&out.length<10){why[h]=it;out.push(h)}}
  lists.forEach(function(l,i){l.slice(0,take[i]||1).forEach(function(h){add(h,items[i])})});
  lists.forEach(function(l,i){l.forEach(function(h){add(h,items[i])})});
  return {list:out.map(function(h){return PBH[h]}),why:why};
}
function fromScan(d,photo){
  var items=d.conditions.slice(0,3).map(function(c){
    var m=COND[c.slug]||{};
    return {label:m.label||c.label,text:c.explanation,tag:m.tag||c.slug};
  });
  var pr=productsFor(items);
  return {source:'photo',photo:photo,summary:d.summary,items:items,products:pr.list,why:pr.why};
}
function fromWords(text){
  var list=localScan({text:text});
  var items=list.map(function(s){return {label:s.name,text:s.why,tag:s.area+'/'+s.slug}});
  var pr=productsFor(items);
  if(items[0]&&pr.list.length<8)(TAGS[list[0].area]||[]).forEach(function(h){if(PBH[h]&&!pr.why[h]&&pr.list.length<10){pr.why[h]=items[0];pr.list.push(PBH[h])}});
  return {source:'words',summary:items.length?'Matched from your description, closest first.':'',items:items,products:pr.list,why:pr.why,empty:!items.length};
}

/* ------------------------------------------------------------ the one site product card (PPCard, card.js + css/card.css) in the homepage rail */
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
  return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10).toFixed(1)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function pk(p,helps){
  return PPCard.html(p,{tab:catTab(p),helps:helps||''});
}
/* image error fallback: drop the photo and leave the plain well */
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-ss-img'))t.remove()},true);
function rail(res){
  return '<div class="railwrap ss-rw"><div class="rail prail" tabindex="0" aria-label="Products that help">'+
    res.products.map(function(p){var it=res.why[p.handle];return pk(p,it?'For '+shopName(it.label):'')}).join('')+'</div>'+
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

/* ------------------------------------------------------------ shared result blocks */
function rowsHtml(res){
  return '<ol class="ss-rows">'+res.items.map(function(it,i){
    return '<li class="ss-row"><span class="ss-conf'+(i?'':' ss-c1')+'">'+(i?'Also possible':'Most likely')+'</span>'+
      '<div class="ss-row-t"><h3>'+esc(it.label)+'</h3>'+(it.text?'<p>'+esc(it.text)+'</p>':'')+'</div>'+
      '<a class="ss-shop" href="#">Shop '+esc(shopName(it.label))+' <span aria-hidden="true">›</span></a></li>';
  }).join('')+'</ol>';
}
var CALM='<p class="ss-calm">Our scanner doesn’t replace your vet.</p>';
function emptyWordsHtml(){
  return '<div class="ss-note ss-note-s"><b>No clear match yet</b><p>Try the words you would use to a friend, like “itchy ears”, “limping” or “red skin on the belly”.</p></div>';
}
function fillProducts(res){
  var prod=$('#ss-prod');if(!prod)return;
  prod.hidden=res.empty||!res.products.length;
  if(prod.hidden)return;
  var names=res.items.slice(0,2).map(function(it){return shopName(it.label)});
  $('[data-prod-h]',prod).innerHTML='Products for <em>'+esc(names[0])+'</em>';
  $('[data-prod-p]',prod).textContent=res.products.length+' picks for '+names.join(' and ')+', with this month’s offers.';
  $('[data-prod-all]',prod).textContent='Shop '+names[0]+' ›';
  var body=$('[data-prod-body]',prod);body.innerHTML=rail(res);bindRails(prod);
}
function hideProducts(){var p=$('#ss-prod');if(p)p.hidden=true}

/* ------------------------------------------------------------ the scanner widget (upload -> preview -> scanning -> result) */
var STEPS=['Preparing your photo','Looking for visible signs','Matching to common conditions','Finding products that help'];
var NOTES={
  offline:['The scanner needs an internet connection to scan photos','Check you’re online and try again, or describe what you can see and we’ll match it for you.'],
  slow:['That scan took too long','Please try again in a moment, or describe what you can see instead.'],
  server:['We couldn’t finish that scan','Please try again in a moment, or describe what you can see instead.'],
  unclear:['We couldn’t see enough in that photo','Try a closer, well-lit photo of one area, like one ear, one paw or one patch of skin.']
};
var TRY=[['Itchy ears','scratching his ears and shaking his head'],['Red, itchy skin','red itchy skin on his belly'],['Licking paws','keeps licking and chewing his paws'],['Limping','limping on a back leg after walks']];
var uid=0;
function stageHtml(o){
  var n=++uid;
  return '<div class="ss-stage" data-state="idle">'+
    '<input class="ss-file" type="file" accept="image/*" tabindex="-1" aria-hidden="true" data-in="pick">'+
    '<input class="ss-file" type="file" accept="image/*" capture="environment" tabindex="-1" aria-hidden="true" data-in="cam">'+
    /* idle: drop zone */
    '<div class="ss-drop" data-drop>'+
      '<span class="ss-drop-ic" aria-hidden="true"></span>'+
      '<p class="ss-drop-t">'+(o.dropTitle||'Drop a photo here')+'</p>'+
      '<p class="ss-drop-s">or choose one from your device. JPG, PNG or HEIC.</p>'+
      '<div class="ss-drop-b"><button class="btn sec" type="button" data-choose>Choose a photo</button>'+
      '<button class="btn ss-ghost ss-camb" type="button" data-camera>Take a photo</button></div>'+
      '<p class="ss-err" role="alert" hidden></p>'+
    '</div>'+
    /* ready / scanning: preview */
    '<div class="ss-view" data-view>'+
      '<div class="ss-pic"><img alt="Your photo" data-pic><span class="ss-beam" aria-hidden="true"></span></div>'+
      '<div class="ss-side">'+
        '<div class="ss-ready"><p class="ss-side-t">Photo added</p><p class="ss-side-s">Check it shows the problem clearly, then scan.</p>'+
          '<button class="btn sec ss-go" type="button" data-go>Scan this photo</button>'+
          '<button class="ss-link" type="button" data-retake>Retake or choose another</button></div>'+
        '<div class="ss-busy"><p class="ss-side-t">Scanning your photo</p><ol class="ss-steps">'+STEPS.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol>'+
          '<p class="sr" aria-live="polite" data-live></p></div>'+
        '<div class="ss-done"><p class="ss-side-t">Scan complete</p><p class="ss-side-s">Your results are ready.</p>'+
          '<button class="ss-link" type="button" data-again-s>Scan another photo</button></div>'+
      '</div>'+
    '</div>'+
    /* error / unclear */
    '<div class="ss-note" data-note tabindex="-1"><b data-note-t></b><p data-note-p></p>'+
      '<div class="ss-note-b"><button class="btn sec" type="button" data-retry>Try again</button>'+
      '<button class="btn ss-ghost" type="button" data-retake2>Choose another photo</button>'+
      '<button class="ss-link" type="button" data-describe>Describe it instead</button></div></div>'+
    /* describe: text fallback */
    '<form class="ss-desc" data-desc novalidate><label for="ss-d'+n+'">Describe what you can see</label>'+
      '<textarea id="ss-d'+n+'" rows="3" placeholder="For example: red, itchy skin on his belly and he keeps scratching"></textarea>'+
      '<div class="ss-try"><span>Try:</span>'+TRY.map(function(t){return '<button class="ss-chip" type="button" data-try="'+esc(t[1])+'">'+esc(t[0])+'</button>'}).join('')+'</div>'+
      '<div class="ss-desc-b"><button class="btn sec" type="submit">Find matches</button><button class="ss-link" type="button" data-back>Scan a photo instead</button></div>'+
      '<p class="ss-err" role="alert" hidden data-derr></p></form>'+
    (o.noDescribeLink?'':'<p class="ss-alt" data-alt>No photo to hand? <button class="ss-link" type="button" data-describe>Describe it instead</button></p>')+
  '</div>';
}
function Scanner(host,o){
  o=o||{};
  host.innerHTML=stageHtml(o);
  var el=$('.ss-stage',host),pick=$('[data-in=pick]',el),cam=$('[data-in=cam]',el),drop=$('[data-drop]',el),pic=$('[data-pic]',el);
  var err=$('.ss-drop .ss-err',el),live=$('[data-live]',el),steps=$$('.ss-steps li',el),note=$('[data-note]',el),ta=$('textarea',el),derr=$('[data-derr]',el);
  var S={photo:null,state:'idle',run:0,last:null};
  function set(st){S.state=st;el.setAttribute('data-state',st);if(o.onState)o.onState(st,S)}
  function showErr(m){err.textContent=m;err.hidden=!m}
  function take(file){
    showErr('');
    readPhoto(file,function(d,m){
      if(m){showErr(m);set('idle');return}
      S.photo=d;pic.src=d;set('ready');
      var g=$('[data-go]',el);if(g)g.focus({preventScroll:true});
    });
  }
  function onPick(e){var f=e.target.files&&e.target.files[0];if(f)take(f);try{e.target.value=''}catch(x){}}
  pick.addEventListener('change',onPick);cam.addEventListener('change',onPick);
  $('[data-choose]',el).addEventListener('click',function(){pick.click()});
  $('[data-camera]',el).addEventListener('click',function(){cam.click()});
  drop.addEventListener('click',function(e){if(e.target===drop||e.target.closest('.ss-drop-ic,.ss-drop-t,.ss-drop-s'))pick.click()});
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('on')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('on')})});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)take(f)});
  function reset(focus){
    S.run++;S.photo=null;pic.removeAttribute('src');showErr('');set('idle');
    if(o.onReset)o.onReset();
    if(focus)$('[data-choose]',el).focus({preventScroll:true});
  }
  function retake(){reset(false);pick.click()}
  $('[data-retake]',el).addEventListener('click',retake);
  $('[data-retake2]',el).addEventListener('click',retake);
  function progress(i){steps.forEach(function(li,k){li.className=k<i?'done':k===i?'now':''});if(STEPS[i])live.textContent=STEPS[i]}
  function go(){
    if(!S.photo)return;
    var run=++S.run;set('scanning');progress(0);
    var i=0,tick=setInterval(function(){if(i<STEPS.length-1)progress(++i)},RM?250:700);
    var min=new Promise(function(r){setTimeout(r,RM?300:2400)});
    Promise.all([scanPhoto(S.photo).then(function(d){return {d:d}},function(e){return {e:e}}),min]).then(function(a){
      clearInterval(tick);if(run!==S.run)return;progress(STEPS.length);
      var r=a[0];
      if(r.e){if(window.console)console.warn('Symptom scanner:',r.e.kind,r.e.cause||'');showNote(r.e.kind||'offline');return}
      if(r.d.not_assessable||!r.d.conditions.length){showNote('unclear');return}
      var res=fromScan(r.d,S.photo);S.last=res;set('result');
      if(o.onResult)o.onResult(res);
    });
  }
  function showNote(kind){
    var t=NOTES[kind]||NOTES.server;
    $('[data-note-t]',note).textContent=t[0];$('[data-note-p]',note).textContent=t[1];
    note.setAttribute('data-kind',kind);
    set(kind==='unclear'?'unclear':'error');
    note.focus({preventScroll:true});
  }
  $('[data-go]',el).addEventListener('click',go);
  $('[data-again-s]',el).addEventListener('click',function(){reset(true)});
  $('[data-retry]',el).addEventListener('click',go);
  $$('[data-describe]',el).forEach(function(b){b.addEventListener('click',function(){set('describe');ta.focus()})});
  $('[data-back]',el).addEventListener('click',function(){set(S.photo?'ready':'idle');if(!S.photo)$('[data-choose]',el).focus()});
  function describe(){
    var v=ta.value.trim();
    if(!v){derr.textContent='Add a few words about what you can see.';derr.hidden=false;ta.focus();return}
    derr.hidden=true;
    var res=fromWords(v);
    if(res.empty){derr.textContent='We couldn’t match that. Try the words you would use to a friend, like “itchy ears” or “limping”.';derr.hidden=false;return}
    S.last=res;if(o.onResult)o.onResult(res);
  }
  $('[data-desc]',el).addEventListener('submit',function(e){e.preventDefault();describe()});
  $$('[data-try]',el).forEach(function(b){b.addEventListener('click',function(){ta.value=b.getAttribute('data-try');describe()})});
  return {el:el,reset:reset,set:set,state:function(){return S.state},photo:function(){return S.photo},pick:function(){pick.click()},choose:$('[data-choose]',el)};
}

function faqBind(root){
  $$('.ss-q',root).forEach(function(q){q.addEventListener('click',function(){
    var on=!q.classList.contains('on');q.classList.toggle('on',on);q.setAttribute('aria-expanded',on);q.nextElementSibling.classList.toggle('on',on);
  })});
}
function thumb(res){return res.photo?'<img class="ss-thumb" src="'+res.photo+'" alt="Your photo">':''}

/* ============================================================ VERSION A: big drop zone hero, results below */
function runA(root){
  var rep=$('#ss-rep');
  var grid=$('.ss-a-grid',root);
  var sc=Scanner($('[data-stage]',root),{dropTitle:'Drop a photo of the problem here',onResult:show,onReset:clear,onState:function(st){grid.classList.toggle('ss-has',st!=='idle')}});
  function show(res){
    rep.hidden=false;
    $('[data-rep-h]',rep).innerHTML=res.source==='photo'?'Your scan <em>results</em>':'Your <em>matches</em>';
    $('[data-rep-p]',rep).textContent=res.summary;
    $('[data-rep-body]',rep).innerHTML=rowsHtml(res)+CALM;
    fillProducts(res);scrollToEl(rep);
  }
  function clear(){rep.hidden=true;hideProducts()}
  function again(e){if(e)e.preventDefault();sc.reset(true);scrollToEl($('#ss-scan'))}
  $$('[data-again-top]',root).forEach(function(a){a.addEventListener('click',again)});
}

/* ============================================================ VERSION B: stepped modal launched from a compact page */
function runB(root){
  var modal=$('#ss-modal'),dlg=$('.ss-dlg',modal),resBox=$('[data-dlgres]',modal),rep=$('#ss-rep'),opener=null,last=null;
  var marks=$$('.ss-stepper li',modal);
  var sc=Scanner($('[data-stage]',modal),{noDescribeLink:false,onState:step,onResult:show,onReset:function(){}});
  function step(st){
    var n=st==='scanning'?2:st==='result'?3:1;
    marks.forEach(function(m,i){m.classList.toggle('on',i<n);m.classList.toggle('now',i===n-1);if(i===n-1)m.setAttribute('aria-current','step');else m.removeAttribute('aria-current')});
    resBox.hidden=st!=='result';
  }
  function show(res){
    last=res;sc.set('result');
    resBox.innerHTML='<div class="ss-b-res">'+(res.photo?thumb(res):'')+'<p class="ss-sum">'+esc(res.summary)+'</p></div>'+rowsHtml(res)+CALM+
      '<div class="ss-b-go">'+(res.products.length?'<button class="btn sec" type="button" data-see>See '+res.products.length+' products that help</button>':'')+
      '<button class="ss-link" type="button" data-again>Scan another photo</button></div>';
    var see=$('[data-see]',resBox);if(see)see.addEventListener('click',function(){close();fillPage(res);scrollToEl(rep)});
    $('[data-again]',resBox).addEventListener('click',function(){sc.reset(true)});
    fillPage(res);
    var h=$('.ss-rows',resBox);dlg.scrollTop=0;
    (see||$('[data-again]',resBox)).focus({preventScroll:true});
  }
  function fillPage(res){
    rep.hidden=false;
    $('[data-rep-h]',rep).innerHTML='Your last <em>scan</em>';
    $('[data-rep-p]',rep).textContent=res.summary;
    $('[data-rep-body]',rep).innerHTML=rowsHtml(res);
    fillProducts(res);
  }
  function focusables(){return $$('button:not([disabled]),[href],textarea,input:not([tabindex="-1"]),[tabindex]:not([tabindex="-1"])',dlg).filter(function(x){return x.offsetParent!==null})}
  function open(e){
    opener=e&&e.currentTarget||document.activeElement;
    if(sc.state()==='result'||sc.state()==='error'||sc.state()==='unclear')sc.reset(false);
    modal.hidden=false;document.documentElement.classList.add('ss-lock');
    requestAnimationFrame(function(){modal.classList.add('on')});
    sc.choose.focus({preventScroll:true});
  }
  function close(){
    modal.classList.remove('on');modal.hidden=true;document.documentElement.classList.remove('ss-lock');
    if(opener&&opener.focus)opener.focus({preventScroll:true});
  }
  $$('[data-open-scan]').forEach(function(b){b.addEventListener('click',open)});
  $$('[data-close]',modal).forEach(function(b){b.addEventListener('click',close)});
  modal.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key!=='Tab')return;
    var f=focusables();if(!f.length)return;
    if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}
    else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}
  });
  step('idle');
}

/* ============================================================ VERSION C: split, photo left, results panel right */
function runC(root){
  var panel=$('[data-panel]',root),body=$('[data-panel-body]',panel),head=$('[data-panel-h]',panel),sub=$('[data-panel-p]',panel);
  var EMPTY=body.innerHTML;
  var sc=Scanner($('[data-stage]',root),{dropTitle:'Drop a photo here',onState:state,onResult:show,onReset:clear});
  function state(st){
    panel.setAttribute('data-state',st);
    if(st==='scanning'){head.innerHTML='Scanning…';sub.textContent='This usually takes a few seconds.';body.innerHTML='<ol class="ss-rows ss-skel" aria-hidden="true"><li></li><li></li><li></li></ol>'}
    else if(st==='error'||st==='unclear'){head.innerHTML='No results <em>yet</em>';sub.textContent='See the note beside your photo.';body.innerHTML=EMPTY}
    else if(st==='idle'||st==='ready'){head.innerHTML='Your <em>results</em>';sub.textContent=st==='ready'?'Press “Scan this photo” to fill this in.':'They appear here after the scan.';body.innerHTML=EMPTY}
  }
  function show(res){
    panel.setAttribute('data-state','result');
    head.innerHTML=res.source==='photo'?'Most likely <em>matches</em>':'Closest <em>matches</em>';
    sub.textContent=res.summary;
    body.innerHTML=rowsHtml(res)+CALM+'<div class="ss-c-go">'+(res.products.length?'<a class="btn sec" href="#ss-prod" data-see>See '+res.products.length+' products that help</a>':'')+'<button class="ss-link" type="button" data-again>Scan another photo</button></div>';
    $('[data-again]',body).addEventListener('click',function(){sc.reset(true)});
    var see=$('[data-see]',body);if(see)see.addEventListener('click',function(e){e.preventDefault();scrollToEl($('#ss-prod'))});
    fillProducts(res);
    if(window.innerWidth<900)scrollToEl(panel);
  }
  function clear(){hideProducts()}
}

/* ------------------------------------------------------------ boot */
var root=document.querySelector('[data-ss]');
if(root){
  faqBind(root);
  var v=root.getAttribute('data-ss');
  if(v==='a')runA(root);else if(v==='b')runB(root);else runC(root);
}
})();
