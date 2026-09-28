/* Poorly Pet symptom guide (round 2). One data set, three layouts.
   Load products.js first: it provides PP_PRODUCTS, PP_BY_HANDLE and PP_TAGS.
   The page root carries data-sg="a" | "b" | "c" and this file runs that version.
   Deep links: #<symptom-slug> opens a symptom. */
(function(){
'use strict';

var AREAS=[
  {id:'legs-paws',name:'Legs & paws',blurb:'Limping, stiffness, sore or licked paws',tint:'#E4EED6'},
  {id:'skin-coat',name:'Skin & coat',blurb:'Itching, hot spots, flaky or thin coat',tint:'#EAF0E6'},
  {id:'tummy-gut',name:'Tummy & gut',blurb:'Upsets, wind, appetite and weight',tint:'#F1EEDC'},
  {id:'eyes-ears',name:'Eyes & ears',blurb:'Head shaking, smelly ears, weepy eyes',tint:'#E2ECEA'},
  {id:'mouth-teeth',name:'Mouth & teeth',blurb:'Bad breath, tartar and sore gums',tint:'#EEF1E2'},
  {id:'back-spine',name:'Back & spine',blurb:'Stiff backs, wobbly legs, no jumping',tint:'#E6EDE4'},
  {id:'behaviour-mood',name:'Behaviour & mood',blurb:'Worry, noise fear and restlessness',tint:'#EDEFE6'},
  {id:'whole-body',name:'Whole body',blurb:'Ageing, energy, weight and recovery',tint:'#E8EFE9'}
];

var SYMPTOMS=[
{"slug":"holding-a-paw-up","name":"Holding a paw up","area":"legs-paws","syn":["lifting paw","three legged","hopping","sore paw","won't put weight on leg","cut pad","thorn"],"looks":"Holds one paw off the ground when standing or walking, or only touches it down briefly.","why":"A thorn, grass seed or cut in the pad, a torn nail, a sting, a sprain, or a joint or ligament problem.","helps":["Check between the toes and pads in good light for seeds, cuts or swelling.","Rest on the lead, toilet trips only, for 24 to 48 hours.","Keep the paw clean and dry. A boot or sock stops licking."]},
{"slug":"licking-or-chewing-paws","name":"Licking or chewing paws","area":"legs-paws","syn":["paw licking","chewing feet","itchy feet","red paws","brown stained paws","nibbling toes","yeasty paws"],"looks":"Frequent licking or nibbling at the feet, often with pink-brown staining, red skin between the toes or a yeasty smell.","why":"Allergies to pollen, mites or food, yeast or bacterial infection, a grass seed, dry cracked pads, or boredom and stress.","helps":["Rinse and dry paws after walks, especially in pollen season.","Keep the fur between the pads trimmed short.","A soothing paw balm, and a sock or boot to break the habit."]},
{"slug":"limping-or-favouring-a-leg","name":"Limping or favouring a leg","area":"legs-paws","syn":["limping","limp","lame","lameness","hobbling","walking funny","bad leg","sore leg"],"looks":"An uneven walk, a nod of the head when a front leg hurts, or a hitch in the hips when a back leg hurts.","why":"A minor sprain or paw injury, arthritis, cruciate ligament damage, a slipping kneecap, or hip or elbow dysplasia.","helps":["Rest on the lead for a few days: no running, jumping or stairs.","Non-slip rugs help a sore dog keep its footing.","Never give human painkillers. Ibuprofen and paracetamol are toxic to dogs."]},
{"slug":"scuffed-nails-or-dragging-paws","name":"Scuffed nails or dragging paws","area":"legs-paws","syn":["knuckling","dragging feet","worn nails","scuffing","scraping feet","toes curling over"],"looks":"Worn tops to the nails on the back feet, a scraping sound on walks, or paws that fold over onto the knuckles.","why":"Nerve or spinal problems such as degenerative myelopathy or IVDD, rear-leg weakness with age, or sore joints changing how your dog walks.","helps":["Protective boots or toe grips stop the tops of the paws getting sore.","Walk on grass rather than rough pavements.","A support harness helps on longer walks."]},
{"slug":"slow-to-get-up","name":"Slow to get up","area":"legs-paws","syn":["struggling to stand","difficulty getting up","can't get up","stiff getting up","old dog"],"looks":"Takes a few goes to stand, pushes up with the front legs first, or is stiff for the first few steps.","why":"Arthritis, hip or elbow dysplasia, spondylosis, rear-leg weakness, or extra weight on sore joints.","helps":["A thick, supportive bed away from draughts.","Rugs on slippery floors and a ramp for the car.","Joint supplements help many dogs over a few weeks."]},
{"slug":"stiffness-after-rest","name":"Stiffness after rest","area":"legs-paws","syn":["stiff in the morning","stiff joints","walks it off","creaky","stiff after sleeping"],"looks":"Stiff and slow after sleeping or lying down, then loosens up after a few minutes of moving.","why":"A classic early sign of arthritis, and sometimes hip or elbow dysplasia. Cold, damp weather often makes it worse.","helps":["A warm, padded bed off cold floors.","Little and often exercise, with a gentle warm-up first.","Keep your dog lean: extra weight loads sore joints."]},
{"slug":"constant-licking-of-one-spot","name":"Constant licking of one spot","area":"skin-coat","syn":["licking one spot","lick granuloma","licking leg","obsessive licking","sore patch","licking wrist"],"looks":"Keeps going back to the same patch, often a wrist, leg or flank, leaving a wet, red or bald spot.","why":"A hot spot starting, an allergy, a sore joint underneath, a small wound, or boredom and anxiety.","helps":["Look closely for a wound, lump, seed or parasite.","Stop the licking with a soft cone, body suit or sock.","More walks, chews and puzzle feeders if boredom is part of it."]},
{"slug":"excessive-scratching","name":"Excessive scratching","area":"skin-coat","syn":["itchy","itching","itch","scratching","chewing skin","fleas","rubbing on carpet","itchy bottom","scooting"],"looks":"Scratching, nibbling or rubbing much more than usual, often at night, sometimes with red skin or broken hair. Some itchy dogs scoot their bottom along the floor.","why":"Fleas and mites, pollen, dust mite or food allergies, dry skin, or skin infection. Scooting is often full anal glands, worms or allergy.","helps":["Check for fleas and flea dirt with a flea comb. Treat every pet in the house.","Keep flea and worm treatment up to date all year.","A gentle, soap-free shampoo and omega-3 supplements can help the skin."]},
{"slug":"flaky-skin-or-dandruff","name":"Flaky skin or dandruff","area":"skin-coat","syn":["dandruff","dry skin","flakes","scurf","scaly skin","dull coat"],"looks":"White flakes in the coat, dry or scaly skin, often with a dull coat.","why":"Dry air and central heating, bathing too often, a diet low in healthy fats, allergies, mites or hormone problems.","helps":["Brush regularly to spread the natural oils.","Bathe less often, with a gentle, moisturising dog shampoo.","Omega-3 fish oil or a skin supplement can help."]},
{"slug":"hair-loss-or-bald-patches","name":"Hair loss or bald patches","area":"skin-coat","syn":["bald patches","bald spot","hair loss","alopecia","thinning coat","losing fur","losing hair"],"looks":"Patches where the coat is thin or gone, beyond normal seasonal moulting.","why":"Scratching from fleas or allergies, mites, ringworm, hot spots, or hormone problems such as an underactive thyroid.","helps":["Check for fleas and treat if needed.","Take a photo each week to track it.","Wash your hands after handling, as ringworm can pass to people."]},
{"slug":"raw-weepy-hot-spots","name":"Raw, weepy hot spots","area":"skin-coat","syn":["hot spot","hotspot","wet eczema","moist dermatitis","weeping sore","raw patch","oozing skin"],"looks":"A raw, red, wet patch that appears fast, often within hours, and is usually very sore. The fur around it gets matted.","why":"Something itchy starts it (fleas, allergy, a damp coat, an ear infection) and licking or scratching turns it into a hot spot.","helps":["Stop the licking with a cone or body suit.","Keep the area clean and dry, and clip the fur back if your dog allows.","Towel-dry thick coats well after swimming."]},
{"slug":"red-or-irritated-skin","name":"Red or irritated skin","area":"skin-coat","syn":["red skin","rash","inflamed skin","pink belly","spots","bumps","hives","sore skin"],"looks":"Pink or red skin, often on the belly, armpits, groin or paws, sometimes with small spots or bumps.","why":"Allergies, contact with something irritating (plants, cleaning products), fleas, or bacterial or yeast infection.","helps":["Rinse your dog off after walks through long grass.","Wash bedding in a gentle, fragrance-free product.","Keep flea treatment up to date."]},
{"slug":"appetite-changes","name":"Appetite changes","area":"tummy-gut","syn":["not eating","off food","off his food","off her food","fussy eater","loss of appetite","always hungry","eating more","won't eat"],"looks":"Eating much less or much more than usual, leaving food, or suddenly begging and scavenging.","why":"An upset tummy, dental pain, stress, heat or a change of food. Longer term, gut or other health changes.","helps":["Offer a small, bland meal such as plain chicken and rice.","Check the mouth for broken teeth or sore gums.","Keep feeding times steady, and change food slowly over a week."]},
{"slug":"excessive-wind","name":"Excessive wind","area":"tummy-gut","syn":["wind","gas","farting","flatulence","smelly wind","trumping","bloating"],"looks":"More wind, or smellier wind, than normal, sometimes with a gurgling tummy.","why":"Eating too fast, a recent food change, scavenging, rich treats, or a food that does not suit.","helps":["A slow-feeder bowl for fast eaters.","Cut back on scraps and rich treats.","Change food gradually and consider a probiotic."]},
{"slug":"gurgling-noisy-stomach","name":"Gurgling, noisy stomach","area":"tummy-gut","syn":["stomach noises","rumbling tummy","gurgling tummy","noisy tummy","eating grass","lip licking"],"looks":"Loud rumbling from the tummy, often with lip licking, eating grass or mild discomfort.","why":"An empty tummy, wind, a mild upset from something eaten, or a sensitive gut.","helps":["Smaller meals more often. A late snack helps if it happens on an empty tummy.","A bland diet for a day or two if the tummy seems upset.","A probiotic can help sensitive dogs."]},
{"slug":"loose-stools-or-diarrhoea","name":"Loose stools or diarrhoea","area":"tummy-gut","syn":["diarrhoea","diarrhea","runny poo","loose poo","soft poo","upset tummy","mucus in poo","blood in poo","the runs","scooting"],"looks":"Soft, runny or watery poo, often more frequent than usual, sometimes with mucus.","why":"Scavenging, a change of food, stress, worms or infection. Soft poo can also stop the anal glands emptying, which leads to scooting.","helps":["Plenty of fresh water, and small bland meals for a day or two.","A probiotic paste can help firm things up.","Keep up regular worming."]},
{"slug":"vomiting-or-regurgitation","name":"Vomiting or regurgitation","area":"tummy-gut","syn":["vomiting","vomit","sick","being sick","throwing up","retching","bringing up food","regurgitating","vomiting blood"],"looks":"Vomiting is active heaving from the tummy. Regurgitation is food coming back up with no effort, often undigested, soon after eating.","why":"Scavenging, eating too fast or a change of food. Some dogs simply have a sensitive stomach.","helps":["Rest the tummy, then offer small bland meals for a day.","Offer small sips of water often.","A slow-feeder bowl helps dogs who bring food back after gulping."]},
{"slug":"weight-gain","name":"Weight gain","area":"tummy-gut","syn":["overweight","fat","putting on weight","chubby","obese","heavy","pot belly"],"looks":"You cannot easily feel the ribs, the waist has gone when you look from above, or the tummy sags.","why":"Too much food or too many treats, less exercise, neutering or age. Sometimes an underactive thyroid.","helps":["Weigh food on scales rather than using a scoop.","Count treats as part of the daily allowance.","Add short, extra walks. Hydrotherapy suits dogs with sore joints."]},
{"slug":"head-shaking","name":"Head shaking","area":"eyes-ears","syn":["shaking head","flapping ears","head tilt","tilting head"],"looks":"Shaking or flapping the head often, sometimes holding it tilted to one side.","why":"An ear infection, ear mites, a grass seed in the ear, water in the ear, or allergies.","helps":["Look inside the ear flap for redness, wax or a smell.","Dry ears well after swimming and bathing.","Do not push cotton buds into the ear canal."]},
{"slug":"odour-from-the-ears","name":"Odour from the ears","area":"eyes-ears","syn":["smelly ears","ear smell","yeasty ears","ear discharge","dirty ears","brown wax","ear wax"],"looks":"A yeasty, sour or unpleasant smell from the ears, often with brown or yellow wax.","why":"A yeast or bacterial ear infection, often linked to allergies or trapped moisture in floppy ears.","helps":["Clean the outer ear gently with a dog ear cleaner. Never push cotton buds deep in.","Dry ears after swimming.","Check ears weekly if your dog is prone to problems."]},
{"slug":"red-inflamed-ear-flaps","name":"Red, inflamed ear flaps","area":"eyes-ears","syn":["red ears","inflamed ears","sore ears","hot ears","swollen ear flap","ear blister"],"looks":"The inside of the ear flap is pink or red, warm, and may be bumpy or swollen.","why":"Allergies, ear infection, mites or scratching. A soft, puffy flap can be a blood blister (aural haematoma).","helps":["Keep the ears clean and dry.","A soft cone stops scratching while it settles."]},
{"slug":"scratching-at-ears","name":"Scratching at ears","area":"eyes-ears","syn":["scratching ears","itchy ears","pawing ears","rubbing ears","rubbing head"],"looks":"Scratching at the ears with a back paw, or rubbing the head along the floor or furniture.","why":"Ear infection, mites, allergies, or something stuck in the ear.","helps":["Look and sniff: redness, wax, a smell or pain all point to a problem.","Keep up with flea and mite treatment."]},
{"slug":"weepy-or-red-eyes","name":"Weepy or red eyes","area":"eyes-ears","syn":["runny eyes","watery eyes","tear stains","eye discharge","red eyes","gunky eyes","conjunctivitis","squinting","sore eye"],"looks":"Watery or sticky discharge, tear staining, or redness of the white of the eye or the lining around it.","why":"Allergies, dust or irritation, conjunctivitis, blocked tear ducts, or a scratch on the eye.","helps":["Gently wipe away discharge with cooled boiled water on cotton wool, a fresh piece for each eye.","Keep hair trimmed away from the eyes."]},
{"slug":"bad-breath","name":"Bad breath","area":"mouth-teeth","syn":["smelly breath","halitosis","stinky breath","dog breath","breath smells"],"looks":"Breath that is stronger or more unpleasant than usual, often with tartar or red gums.","why":"Plaque and gum disease in most dogs. Less often something stuck in the teeth, or kidney problems or diabetes.","helps":["Brush daily with a dog toothpaste. Never use human toothpaste.","Dental chews, water additives or plaque powders help alongside brushing."]},
{"slug":"bleeding-or-red-gums","name":"Bleeding or red gums","area":"mouth-teeth","syn":["bleeding gums","red gums","sore gums","gingivitis","blood on toys","swollen gums"],"looks":"A red line along the gums, gums that bleed when chewing or brushing, or blood on toys.","why":"Gum disease from plaque, a broken tooth, or an injury from a stick or bone.","helps":["Brush gently with a soft brush and a dog toothpaste.","Avoid very hard chews such as antlers and bones, which break teeth."]},
{"slug":"dropping-food-slow-chewing","name":"Dropping food or slow chewing","area":"mouth-teeth","syn":["dropping food","chewing on one side","eating slowly","struggling to eat","won't eat hard food","dropping kibble"],"looks":"Chewing on one side, dropping food, eating slowly, or suddenly preferring soft food.","why":"Dental pain from a broken or loose tooth, gum disease or a mouth ulcer, or something stuck in the mouth.","helps":["Soften kibble with warm water for now.","Take a gentle look in the mouth for a broken tooth or anything stuck."]},
{"slug":"pawing-at-the-mouth","name":"Pawing at the mouth","area":"mouth-teeth","syn":["pawing mouth","rubbing face","drooling","gagging","something stuck in mouth","choking"],"looks":"Pawing or rubbing at the mouth or face, often with drooling, lip licking or gagging.","why":"Something stuck between the teeth or across the roof of the mouth (often a stick), a broken tooth, a sting, or dental pain.","helps":["If it is safe, look in the mouth in good light. Only remove an object if it comes out easily.","Do not put your fingers down the throat."]},
{"slug":"yellow-or-brown-tartar","name":"Yellow or brown tartar","area":"mouth-teeth","syn":["tartar","plaque","dirty teeth","brown teeth","yellow teeth","calculus"],"looks":"Hard yellow or brown build-up on the teeth, usually worst on the back teeth and the canines.","why":"Plaque hardening into tartar, which leads on to gum disease. Small breeds are most prone.","helps":["Brush daily with dog toothpaste to stop more building up.","Dental chews and plaque powders help, but will not shift tartar that is already there."]},
{"slug":"hunched-or-arched-posture","name":"Hunched or arched posture","area":"back-spine","syn":["hunched back","arched back","tucked tummy","praying position","stiff back","head held low"],"looks":"Back arched up, head held low, tummy tucked in, or unwilling to turn the head.","why":"Back or neck pain (IVDD, spondylosis), or tummy pain. Front end down and bottom up (the praying position) often means tummy pain.","helps":["Rest: no jumping, stairs or rough play.","Use a harness, not a collar, in case the neck is sore."]},
{"slug":"reluctant-to-jump-or-climb","name":"Reluctant to jump or climb","area":"back-spine","syn":["won't jump","not jumping","won't use stairs","won't get in the car","can't jump on sofa","stairs"],"looks":"Hesitates or refuses to jump into the car or onto the sofa, or struggles with stairs.","why":"Back pain, arthritis, hip dysplasia, spondylosis, or a cruciate or knee problem.","helps":["Use a ramp or steps for the car and sofa.","Gate off the stairs if they are a struggle.","Keep walks gentle and on the lead while things settle."]},
{"slug":"sudden-rear-weakness","name":"Sudden rear weakness","area":"back-spine","syn":["back legs gave way","collapsed","can't walk","paralysed","paralysis","dragging back legs","can't stand","back legs not working"],"looks":"The back legs suddenly go weak, wobbly or cross over, sometimes with a hunched back.","why":"Most often the spine: a slipped disc (IVDD), a strain or an injury.","helps":["Keep your dog calm and still, and carry rather than walk.","A lift harness makes moving them easier and safer.","Non-slip flooring and a low, supportive bed while they recover."]},
{"slug":"wobbly-back-legs","name":"Wobbly back legs","area":"back-spine","syn":["wobbly","unsteady","weak back legs","swaying","ataxia","crossing legs","drunk walking","falling over"],"looks":"A swaying or unsteady back end, legs crossing, or falling over when turning.","why":"Slowly, over weeks: degenerative myelopathy, spondylosis, arthritis or muscle loss with age. Suddenly: IVDD, a spinal injury or an inner ear problem.","helps":["Non-slip flooring and a support harness help.","Short, regular walks keep muscles working.","Physiotherapy and hydrotherapy help many dogs."]},
{"slug":"yelping-when-touched","name":"Yelping when touched","area":"back-spine","syn":["crying when picked up","yelping","yelps","sensitive to touch","crying out","whimpering","in pain"],"looks":"Cries out when picked up, stroked along the back or touched in one spot, or when getting up.","why":"Back or neck pain such as IVDD, a muscle strain, arthritis, or tummy pain.","helps":["Rest, and lift your dog with support under the chest and the back end.","Swap the collar for a harness."]},
{"slug":"destructive-behaviour","name":"Destructive behaviour","area":"behaviour-mood","syn":["chewing furniture","destroying things","digging","scratching doors","ripping things","chewing"],"looks":"Chewing, digging or scratching at doors and furniture, often when left alone or bored.","why":"Boredom, separation anxiety, teething, pent-up energy or stress.","helps":["More exercise and brain work: sniffing games, puzzle feeders, long-lasting chews.","Build up time alone slowly, starting with a few minutes.","Calming aids can take the edge off while you train."]},
{"slug":"hiding-or-unusually-clingy","name":"Hiding or unusually clingy","area":"behaviour-mood","syn":["hiding","clingy","following me everywhere","withdrawn","needy","velcro dog","not himself","not herself"],"looks":"Hiding under furniture, keeping away from the family, or suddenly following you everywhere.","why":"Fear or stress, noise, changes at home, pain or illness, or confusion in older dogs.","helps":["Offer a quiet, covered den your dog can choose to use.","Keep routines steady, and do not force a fuss.","Calming aids can help around known triggers."]},
{"slug":"pacing-or-restlessness","name":"Pacing or restlessness","area":"behaviour-mood","syn":["pacing","restless","can't settle","panting at night","wandering at night","unsettled"],"looks":"Walking about, lying down and getting straight back up, panting, unable to settle, often at night.","why":"Anxiety, pain, needing the toilet, confusion in older dogs, or tummy discomfort.","helps":["A calm evening routine with a late toilet trip.","A comfortable bed in a quiet spot, and a night light for older dogs.","Calming supplements help some dogs."]},
{"slug":"trembling-at-noises","name":"Trembling at noises","area":"behaviour-mood","syn":["fireworks","thunder","scared of noises","shaking","trembling","noise phobia","bangs","scared"],"looks":"Shaking, hiding, panting or trying to escape during fireworks, thunder or loud bangs.","why":"Noise fear, which often gets worse over time if it is not helped.","helps":["Walk before dark in firework season, and close the curtains.","Set up a den and play music or the TV.","Calming aids, and slow sound training with quiet recordings."]},
{"slug":"whining-or-barking-when-alone","name":"Whining or barking when alone","area":"behaviour-mood","syn":["separation anxiety","barking when left","howling","crying when alone","neighbours complaining","can't be left"],"looks":"Barking, howling or whining soon after you leave, sometimes with accidents indoors or chewing at doors.","why":"Separation anxiety, boredom, or a change in routine.","helps":["Practise short absences and build up slowly.","A long-lasting chew or food toy as you leave.","A pet camera shows what really happens while you are out."]},
{"slug":"drinking-more-than-usual","name":"Drinking more than usual","area":"whole-body","syn":["thirsty","drinking a lot","wee","weeing a lot","peeing more","excessive thirst","accidents indoors","urinating more"],"looks":"Emptying the water bowl more often, usually with more weeing or accidents indoors.","why":"Hot weather, exercise or a dry food. It can also go with kidney, urinary or hormone changes, especially in older dogs.","helps":["Never restrict water: keep a fresh bowl in reach all day.","Measure a day's drinking so you know what is normal for your dog.","Kidney and urinary support suits many older dogs."]},
{"slug":"general-stiffness-with-age","name":"General stiffness with age","area":"whole-body","syn":["old dog","slowing down","senior dog","stiff","aging","ageing","getting old"],"looks":"Slower on walks, stiffer after rest, and less keen on stairs, play or jumping as the years go by.","why":"Arthritis is very common in older dogs, often with muscle loss and spondylosis.","helps":["A soft, supportive bed, rugs on slippery floors and a ramp for the car.","Shorter, more frequent walks, and a lean body weight.","Joint supplements and hydrotherapy suit many older dogs."]},
{"slug":"low-energy-or-lethargy","name":"Low energy or lethargy","area":"whole-body","syn":["lethargic","lethargy","tired","sleepy","flat","no energy","quiet","depressed","off colour","not himself","not herself"],"looks":"Sleeping more, less interested in walks or play, slow to respond, not their usual self.","why":"Heat, a busy day, a mild upset or getting older. It can also go with thyroid, heart or other health changes.","helps":["Let them rest somewhere cool and quiet with water.","Keep an eye on eating, drinking, weeing and poo."]},
{"slug":"post-surgery-recovery","name":"Recovering from surgery or injury","area":"whole-body","syn":["after surgery","after an operation","operation","recovery","stitches","wound","cone","spay","neuter","cage rest","crate rest"],"looks":"Your dog is healing after an operation, an injury or a wound, and needs rest and protection.","why":"Neutering, joint surgery such as a cruciate repair, lump removal, or an injury.","helps":["Follow your vet's rest and exercise plan.","A soft cone or recovery suit protects the wound.","Non-slip flooring, a ramp and a support harness."]},
{"slug":"weight-management","name":"Trouble managing weight","area":"whole-body","syn":["losing weight","weight loss","underweight","thin","diet","can't lose weight","skinny"],"looks":"Your dog keeps gaining despite a diet, or is losing weight without trying.","why":"Too many calories or too little exercise. Unplanned weight loss can go with dental, gut or other health changes.","helps":["Weigh your dog monthly and keep a note.","Measure food with scales, and cut back on treats.","Use part of the daily food as training rewards."]}
];

/* ------------------------------------------------------------ lookups */
var BY={},AREA={};
AREAS.forEach(function(a){AREA[a.id]=a;a.items=[]});
SYMPTOMS.forEach(function(s){BY[s.slug]=s;AREA[s.area].items.push(s)});
var PBH=window.PP_BY_HANDLE||{},TAGS=window.PP_TAGS||{};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(sel,el){return (el||document).querySelector(sel)}
function $$(sel,el){return Array.prototype.slice.call((el||document).querySelectorAll(sel))}
function productsFor(s){return (TAGS[s.area+'/'+s.slug]||[]).map(function(h){return PBH[h]}).filter(Boolean).slice(0,6)}
function money(n){return '£'+Number(n).toFixed(2)}
function lower(n){return n.charAt(0).toLowerCase()+n.slice(1)}
function scrollToEl(el,off){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-(off||16);window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}
function setHash(slug){try{history.replaceState(null,'',slug?'#'+slug:location.pathname+location.search)}catch(e){}}
function hashSlug(){var h=decodeURIComponent((location.hash||'').slice(1));if(h.indexOf('/')>-1)h=h.split('/').pop();return BY[h]?h:null}

/* ------------------------------------------------------------ product card (.pk from home.css) */
function stars(r){var h='';for(var i=1;i<=5;i++){if(r>=i)h+='<i class="on"></i>';else if(r>i-1)h+='<i class="part" style="--f:'+Math.round((r-i+1)*100)+'%"></i>';else h+='<i></i>'}return '<span class="stars" aria-hidden="true">'+h+'</span>'}
function ph(p){return '<span class="sg-ph" aria-hidden="true"><span class="sg-ph-pack"><span>'+esc((p.brand||'P').charAt(0))+'</span></span></span>'}
function card(p){
  var url='#';
  var img=p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy">':ph(p);
  var rev=p.rating?'<span class="rev">'+stars(p.rating)+'<span>'+Number(p.rating).toFixed(1)+' <em>('+p.reviewCount+')</em></span></span>':'<span class="rev none" aria-hidden="true"></span>';
  var price='<span class="now">'+money(p.price)+'</span>';
  if(p.compareAt&&p.compareAt>p.price)price+='<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>';
  return '<article class="pk sg-pk">'+(p.compareAt&&p.compareAt>p.price?'<span class="tab sale">Offer</span>':'')+
    '<a class="well" href="'+url+'" tabindex="-1" aria-hidden="true">'+img+'</a>'+
    '<div class="body"><span class="brand">'+esc(p.brand)+'</span><a class="name" href="'+url+'">'+esc(p.title)+'</a>'+rev+
    '<div class="price">'+price+'</div>'+
    '<button class="btn" type="button" data-add="'+esc(p.handle)+'"><span>Add to basket</span></button></div></article>';
}
/* A missing local image falls back to the flat placeholder. */
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.sg-pk .well')){var b=t.closest('.sg-pk').querySelector('[data-add]');t.insertAdjacentHTML('afterend',ph(PBH[b&&b.getAttribute('data-add')]||{}));t.remove()}},true);

/* ------------------------------------------------------------ shared content blocks */
function explain(s){
  return '<div class="sg-ex">'+
    '<div class="sg-exb"><h3>What it looks like</h3><p>'+esc(s.looks)+'</p></div>'+
    '<div class="sg-exb"><h3>Why it happens</h3><p>'+esc(s.why)+'</p></div>'+
    '<div class="sg-exb sg-helps"><h3>What helps</h3><ul>'+s.helps.map(function(h){return '<li>'+esc(h)+'</li>'}).join('')+'</ul></div>'+
  '</div>';
}
function shopAll(s){return '<a class="sg-all" href="#">Shop all '+esc(lower(s.name))+' products <span aria-hidden="true">›</span></a>'}
function prodHead(s,n){return '<div class="sg-ph-h"><h3>Products that <em>help</em></h3><span>'+n+' picks for '+esc(lower(s.name))+'</span></div>'}
function prodGrid(s){var ps=productsFor(s);return prodHead(s,ps.length)+'<div class="sg-grid">'+ps.map(card).join('')+'</div>'+shopAll(s)}

/* ------------------------------------------------------------ basket toast */
var basketN=0,toastT;
(function(){var c=$('.hdr .cnt');if(c)basketN=parseInt(c.textContent,10)||0})();
var toast=document.createElement('div');toast.className='sg-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);
function addToBasket(btn){
  var p=PBH[btn.getAttribute('data-add')];if(!p)return;
  basketN++;
  $$('.cnt').forEach(function(c){c.textContent=basketN;c.setAttribute('data-n',basketN)});
  btn.classList.add('sg-added');btn.querySelector('span').textContent='Added';
  setTimeout(function(){btn.classList.remove('sg-added');btn.querySelector('span').textContent='Add to basket'},1600);
  toast.innerHTML='<span class="sg-toast-ic" aria-hidden="true"></span><span class="sg-toast-t"><b>Added to your basket</b><span>'+esc(p.title)+'</span></span><a class="sg-toast-a" href="#">Basket ('+basketN+')</a>';
  toast.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toast.classList.remove('show')},3800);
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-add]');if(b){e.preventDefault();addToBasket(b)}});

/* ------------------------------------------------------------ search with synonyms */
function norm(x){return String(x).toLowerCase().replace(/[’']/g,'').replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
var STOP={};('my our the a an and or of is are was has have his her its it dog dogs pup puppy keeps keep very lot lots bit been with at on in to from for when he she they me i im what why how does do doing just really seems seem got getting').split(' ').forEach(function(w){STOP[w]=1});
var INDEX=SYMPTOMS.map(function(s){return{s:s,name:norm(s.name),syn:s.syn.map(norm),area:norm(AREA[s.area].name),text:norm(s.looks+' '+s.why)}});
function search(q){
  q=norm(q);if(!q)return [];
  var toks=q.split(' ').filter(function(w){return w.length>2&&!STOP[w]});
  var res=INDEX.map(function(o){
    var sc=0;
    if(o.name.indexOf(q)>-1)sc+=20;
    o.syn.forEach(function(y){if(y===q)sc+=18;else if(y.indexOf(q)>-1||(y.length>3&&q.indexOf(y)>-1))sc+=10});
    if(o.area.indexOf(q)>-1)sc+=6;
    toks.forEach(function(w){if(o.name.indexOf(w)>-1)sc+=4;if(o.syn.some(function(y){return y.indexOf(w)>-1}))sc+=3;if(o.area.indexOf(w)>-1)sc+=2;if(o.text.indexOf(w)>-1)sc+=1});
    return{s:o.s,sc:sc};
  }).filter(function(r){return r.sc>0}).sort(function(a,b){return b.sc-a.sc});
  var strong=res.filter(function(r){return r.sc>=3});
  return (strong.length?strong:res).map(function(r){return r.s});
}

/* Arrow keys move focus through a set of buttons. */
function arrowNav(container,sel,horizontal){
  container.addEventListener('keydown',function(e){
    var keys=horizontal?['ArrowLeft','ArrowRight']:['ArrowUp','ArrowDown'];
    if(keys.indexOf(e.key)<0&&e.key!=='Home'&&e.key!=='End')return;
    var list=$$(sel,container).filter(function(b){return b.offsetParent!==null});var i=list.indexOf(document.activeElement);if(i<0)return;
    e.preventDefault();
    var n=e.key==='Home'?0:e.key==='End'?list.length-1:e.key===keys[1]?Math.min(list.length-1,i+1):Math.max(0,i-1);
    list[n].focus();
  });
}
function animateIn(el){if(reduce||!el)return;el.classList.remove('sg-in');void el.offsetWidth;el.classList.add('sg-in')}

/* Search box with a suggestion list (used by A). */
function suggestBox(input,list,onPick){
  var items=[],act=-1;
  function close(){list.hidden=true;input.setAttribute('aria-expanded','false');act=-1}
  function render(){
    items=search(input.value).slice(0,6);
    if(!input.value.trim()){close();return}
    list.innerHTML=items.length?items.map(function(s,i){return '<li role="option" id="'+list.id+'-'+i+'" data-slug="'+s.slug+'"'+(i===act?' aria-selected="true"':'')+'><span>'+esc(s.name)+'</span><small>'+esc(AREA[s.area].name)+'</small></li>'}).join(''):'<li class="sg-none" role="option" aria-disabled="true">No match yet. Try a word like itchy, limping or fireworks.</li>';
    list.hidden=false;input.setAttribute('aria-expanded','true');
    if(act>-1)input.setAttribute('aria-activedescendant',list.id+'-'+act);else input.removeAttribute('aria-activedescendant');
  }
  input.addEventListener('input',function(){act=-1;render()});
  input.addEventListener('focus',function(){if(input.value.trim())render()});
  input.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'&&items.length){e.preventDefault();act=(act+1)%items.length;render()}
    else if(e.key==='ArrowUp'&&items.length){e.preventDefault();act=act<=0?items.length-1:act-1;render()}
    else if(e.key==='Enter'){e.preventDefault();var s=items[act>-1?act:0];if(s){onPick(s);close()}}
    else if(e.key==='Escape'){close()}
  });
  list.addEventListener('mousedown',function(e){e.preventDefault()});
  list.addEventListener('click',function(e){var li=e.target.closest('[data-slug]');if(li){onPick(BY[li.getAttribute('data-slug')]);close()}});
  document.addEventListener('click',function(e){if(!e.target.closest||(!e.target.closest('.sg-search')))close()});
}

/* ================================================================ A: area tabs, list, detail */
function initA(root){
  var tabs=$('#sga-tabs',root),listEl=$('#sga-list',root),detail=$('#sga-detail',root),panel=$('#sga-panel',root);
  var cur=null,curArea=null;
  tabs.innerHTML=AREAS.map(function(a){return '<button class="sga-tile" type="button" role="tab" id="sga-t-'+a.id+'" aria-controls="sga-panel" aria-selected="false" tabindex="-1" data-area="'+a.id+'">'+
    '<span class="sga-tph" data-photo="'+a.id+'" style="--t:'+a.tint+'" aria-hidden="true"></span>'+
    '<span class="sga-tn">'+esc(a.name)+'</span><span class="sga-tc">'+a.items.length+' symptoms</span></button>'}).join('');
  function setArea(id,focusTab){
    curArea=id;var a=AREA[id];
    $$('.sga-tile',tabs).forEach(function(t){var on=t.getAttribute('data-area')===id;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;if(on&&focusTab)t.focus()});
    panel.setAttribute('aria-labelledby','sga-t-'+id);
    $('#sga-ah',root).textContent=a.name;
    listEl.innerHTML=a.items.map(function(s){return '<li><button type="button" class="sga-sym" data-slug="'+s.slug+'"><span>'+esc(s.name)+'</span><span class="sga-chev" aria-hidden="true">›</span></button></li>'}).join('');
  }
  function show(slug,opts){
    opts=opts||{};var s=BY[slug];if(!s)return;
    if(s.area!==curArea)setArea(s.area);
    cur=slug;
    $$('.sga-sym',listEl).forEach(function(b){var on=b.getAttribute('data-slug')===slug;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
    detail.innerHTML='<div class="sga-dh"><span class="sg-kick">'+esc(AREA[s.area].name)+'</span><h2 id="sga-title">'+esc(s.name)+'</h2></div>'+
      '<div class="sga-cols"><div class="sga-exw">'+explain(s)+'</div><div class="sga-pw">'+prodGrid(s)+'</div></div>';
    animateIn(detail);
    if(opts.hash!==false)setHash(slug);
    if(opts.scroll)scrollToEl(opts.scroll==='panel'?panel:detail,16);
  }
  tabs.addEventListener('click',function(e){var t=e.target.closest('.sga-tile');if(!t)return;setArea(t.getAttribute('data-area'));show(AREA[curArea].items[0].slug)});
  tabs.addEventListener('keydown',function(e){
    var list=$$('.sga-tile',tabs),i=list.indexOf(document.activeElement);if(i<0)return;
    var n=e.key==='ArrowRight'?(i+1)%list.length:e.key==='ArrowLeft'?(i-1+list.length)%list.length:e.key==='Home'?0:e.key==='End'?list.length-1:-1;
    if(n<0)return;e.preventDefault();var id=list[n].getAttribute('data-area');setArea(id,true);show(AREA[id].items[0].slug);
  });
  listEl.addEventListener('click',function(e){var b=e.target.closest('.sga-sym');if(!b)return;show(b.getAttribute('data-slug'),{scroll:window.innerWidth<900?'detail':false})});
  arrowNav(listEl,'.sga-sym');
  suggestBox($('#sga-q',root),$('#sga-sugg',root),function(s){$('#sga-q',root).value=s.name;show(s.slug,{scroll:'panel'})});
  var start=hashSlug();
  show(start||AREAS[0].items[0].slug,{hash:!!start,scroll:start?'panel':false});
  window.addEventListener('hashchange',function(){var h=hashSlug();if(h&&h!==cur)show(h,{scroll:'panel'})});
}

/* ================================================================ B: card grid + sheet */
function initB(root){
  var jump=$('#sgb-jump',root),groups=$('#sgb-groups',root),modal=$('#sgb-modal'),sheet=$('#sgb-sheet'),body=$('#sgb-body'),q=$('#sgb-q',root),count=$('#sgb-count',root);
  jump.innerHTML=AREAS.map(function(a){return '<a href="#area-'+a.id+'" data-area="'+a.id+'">'+esc(a.name)+'</a>'}).join('');
  groups.innerHTML=AREAS.map(function(a){
    return '<section class="sgb-group" id="area-'+a.id+'" aria-labelledby="sgb-h-'+a.id+'"><div class="sgb-gh"><span class="sgb-gph" data-photo="'+a.id+'" style="--t:'+a.tint+'" aria-hidden="true"></span><div><h2 id="sgb-h-'+a.id+'">'+esc(a.name)+'</h2><p>'+esc(a.blurb)+'</p></div></div>'+
      '<ul class="sgb-cards">'+a.items.map(function(s){var n=productsFor(s).length;return '<li data-slug="'+s.slug+'"><button type="button" class="sgb-card" data-open="'+s.slug+'" aria-haspopup="dialog">'+
        '<span class="sgb-ct">'+esc(s.name)+'</span><span class="sgb-cl">'+esc(s.looks)+'</span>'+
        '<span class="sgb-cf"><span>'+n+' products</span><span class="sgb-go" aria-hidden="true">›</span></span></button></li>'}).join('')+'</ul></section>';
  }).join('');
  /* jump bar: smooth scroll + scroll spy */
  jump.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var g=$('#area-'+a.getAttribute('data-area'));scrollToEl(g,(parseFloat(getComputedStyle(jump.parentNode.parentNode).top)||0)+jump.parentNode.parentNode.offsetHeight+20)});
  function spy(){
    var off=jump.getBoundingClientRect().bottom+40,on=null;
    $$('.sgb-group',groups).forEach(function(g){if(!g.hidden&&g.getBoundingClientRect().top<=off)on=g.id.slice(5)});
    if(!on){var first=$$('.sgb-group',groups).filter(function(g){return !g.hidden})[0];on=first&&first.id.slice(5)}
    $$('a',jump).forEach(function(a){var m=a.getAttribute('data-area')===on;if(m!==a.classList.contains('on')){a.classList.toggle('on',m);if(m){a.setAttribute('aria-current','true');var r=a.getBoundingClientRect(),jr=jump.getBoundingClientRect();if(r.left<jr.left||r.right>jr.right)jump.scrollTo({left:a.offsetLeft-16,behavior:reduce?'auto':'smooth'})}else a.removeAttribute('aria-current')}});
    var jw=jump.parentNode.parentNode;jw.classList.toggle('stuck',jw.getBoundingClientRect().top<=(parseFloat(getComputedStyle(jw).top)||0)+1&&window.pageYOffset>0);
  }
  window.addEventListener('scroll',spy,{passive:true});spy();
  /* filter */
  function filter(){
    var v=q.value.trim();
    if(!v){$$('.sgb-cards li',groups).forEach(function(li){li.hidden=false});$$('.sgb-group',groups).forEach(function(g){g.hidden=false});$$('a',jump).forEach(function(a){a.hidden=false});count.textContent='';$('#sgb-clear',root).hidden=true;spy();return}
    var hit={};search(v).forEach(function(s){hit[s.slug]=1});
    $$('.sgb-cards li',groups).forEach(function(li){li.hidden=!hit[li.getAttribute('data-slug')]});
    $$('.sgb-group',groups).forEach(function(g){var any=$$('li',g).some(function(li){return !li.hidden});g.hidden=!any;var a=$('a[data-area="'+g.id.slice(5)+'"]',jump);if(a)a.hidden=!any});
    var n=Object.keys(hit).length;
    count.textContent=n?n+(n===1?' symptom matches':' symptoms match')+' "'+v+'"':'No match yet. Try a word like itchy, limping or fireworks.';
    $('#sgb-clear',root).hidden=false;spy();
  }
  q.addEventListener('input',filter);
  q.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var f=$('.sgb-cards li:not([hidden]) .sgb-card',groups);if(f)f.click()}});
  $('#sgb-clear',root).addEventListener('click',function(){q.value='';filter();q.focus()});
  /* sheet */
  var opener=null,curSlug=null;
  function open(slug,fromBtn){
    var s=BY[slug];if(!s)return;curSlug=slug;opener=fromBtn||document.activeElement;
    var sibs=AREA[s.area].items,i=sibs.indexOf(s),nx=sibs[(i+1)%sibs.length];
    body.innerHTML='<div class="sgb-sh"><div><span class="sg-kick">'+esc(AREA[s.area].name)+'</span><h2 id="sgb-title">'+esc(s.name)+'</h2></div></div>'+
      '<div class="sgb-cols"><div class="sgb-exw">'+explain(s)+'<button type="button" class="sgb-next" data-open="'+nx.slug+'">Next: '+esc(nx.name)+' <span aria-hidden="true">›</span></button></div><div class="sgb-pw">'+prodGrid(s)+'</div></div>';
    if(modal.hidden){modal.hidden=false;document.documentElement.classList.add('sg-lock');void modal.offsetWidth;modal.classList.add('open')}
    body.scrollTop=0;animateIn(body);
    setHash(slug);
    setTimeout(function(){$('#sgb-x').focus()},reduce?0:60);
  }
  function close(){
    if(modal.hidden)return;modal.classList.remove('open');document.documentElement.classList.remove('sg-lock');setHash(null);curSlug=null;
    setTimeout(function(){modal.hidden=true},reduce?0:260);
    var back=opener&&document.contains(opener)?opener:null;if(!back||!back.classList.contains('sgb-card')){back=$('.sgb-card[data-open="'+(opener&&opener.getAttribute&&opener.getAttribute('data-open'))+'"]',groups)||back}
    if(back)back.focus();
  }
  root.addEventListener('click',function(e){var b=e.target.closest('.sgb-card');if(b)open(b.getAttribute('data-open'),b)});
  modal.addEventListener('click',function(e){
    if(e.target.closest('[data-close]'))close();
    var n=e.target.closest('.sgb-next');if(n){var o=opener;open(n.getAttribute('data-open'),o);opener=$('.sgb-card[data-open="'+n.getAttribute('data-open')+'"]',groups)}
  });
  document.addEventListener('keydown',function(e){
    if(modal.hidden)return;
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key==='Tab'){var f=$$('a[href],button:not([disabled]),[tabindex="0"]',sheet).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  });
  var start=hashSlug();if(start)open(start,$('.sgb-card[data-open="'+start+'"]',groups));
  window.addEventListener('hashchange',function(){var h=hashSlug();if(h&&h!==curSlug)open(h,$('.sgb-card[data-open="'+h+'"]',groups))});
}

/* ================================================================ C: two-pane explorer */
function initC(root){
  var listEl=$('#sgc-list',root),pane=$('#sgc-pane',root),q=$('#sgc-q',root),rail=$('#sgc-rail',root),tog=$('#sgc-toggle',root),cur=null,mode='area';
  var sorted=SYMPTOMS.slice().sort(function(a,b){return a.name.localeCompare(b.name)});
  function item(s,withArea){return '<li><button type="button" class="sgc-sym'+(s.slug===cur?' on':'')+'" data-slug="'+s.slug+'"'+(s.slug===cur?' aria-current="true"':'')+'><span>'+esc(s.name)+'</span>'+(withArea?'<small>'+esc(AREA[s.area].name)+'</small>':'')+'</button></li>'}
  function renderList(){
    var v=q.value.trim(),h='';
    if(v){var r=search(v);h=r.length?'<li class="sgc-lh">'+r.length+' '+(r.length===1?'match':'matches')+'</li>'+r.map(function(s){return item(s,true)}).join(''):'<li class="sgc-empty">No match yet. Try itchy, limping or fireworks.</li>'}
    else if(mode==='az'){var L='';sorted.forEach(function(s){var c=s.name.charAt(0).toUpperCase();if(c!==L){L=c;h+='<li class="sgc-lh" aria-hidden="true">'+c+'</li>'}h+=item(s,false)})}
    else AREAS.forEach(function(a){h+='<li class="sgc-lh">'+esc(a.name)+'</li>'+a.items.map(function(s){return item(s,false)}).join('')});
    listEl.innerHTML=h;
  }
  function show(slug,opts){
    opts=opts||{};var s=BY[slug];if(!s)return;cur=slug;
    $$('.sgc-sym',listEl).forEach(function(b){var on=b.getAttribute('data-slug')===slug;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
    var ps=productsFor(s),sibs=AREA[s.area].items,i=sibs.indexOf(s),nx=sibs[(i+1)%sibs.length];
    pane.innerHTML='<div class="sgc-top"><span class="sg-kick">'+esc(AREA[s.area].name)+'</span><h2 id="sgc-title" tabindex="-1">'+esc(s.name)+'</h2><p class="sgc-lead">'+esc(s.looks)+'</p></div>'+
      '<div class="sgc-two"><div class="sg-exb"><h3>Why it happens</h3><p>'+esc(s.why)+'</p></div><div class="sg-exb sg-helps"><h3>What helps</h3><ul>'+s.helps.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div>'+
      '<div class="sgc-prods"><div class="sgc-ph">'+prodHead(s,ps.length)+'<div class="sgc-arrows"><button type="button" class="sgc-arr" data-dir="-1" aria-label="Previous products">‹</button><button type="button" class="sgc-arr" data-dir="1" aria-label="Next products">›</button></div></div>'+
      '<div class="sgc-track" tabindex="0" role="region" aria-label="Products for '+esc(lower(s.name))+'">'+ps.map(card).join('')+'</div>'+
      '<div class="sgc-foot">'+shopAll(s)+'<button type="button" class="sgc-next" data-slug="'+nx.slug+'">Next in '+esc(AREA[s.area].name)+': '+esc(nx.name)+' <span aria-hidden="true">›</span></button></div></div>';
    $('#sgc-cur',root).textContent=s.name;
    animateIn(pane);updArrows();
    if(opts.hash!==false)setHash(slug);
    if(opts.scroll){rail.classList.remove('open');$('#sgc-open',root).setAttribute('aria-expanded','false');var t=pane.getBoundingClientRect().top;if(t<0||t>window.innerHeight*0.6)scrollToEl(root.querySelector('.sgc'),16)}
    if(opts.focus){var h=$('#sgc-title',pane);h&&h.focus({preventScroll:true})}
  }
  function updArrows(){var t=$('.sgc-track',pane);if(!t)return;var a=$$('.sgc-arr',pane);a[0].disabled=t.scrollLeft<4;a[1].disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
  pane.addEventListener('click',function(e){
    var a=e.target.closest('.sgc-arr');if(a){var t=$('.sgc-track',pane);t.scrollBy({left:(+a.getAttribute('data-dir'))*t.clientWidth*0.8,behavior:reduce?'auto':'smooth'})}
    var n=e.target.closest('.sgc-next');if(n){show(n.getAttribute('data-slug'),{scroll:true,focus:true})}
  });
  pane.addEventListener('scroll',function(e){if(e.target.classList&&e.target.classList.contains('sgc-track'))updArrows()},true);
  window.addEventListener('resize',updArrows);
  listEl.addEventListener('click',function(e){var b=e.target.closest('.sgc-sym');if(b)show(b.getAttribute('data-slug'),{scroll:window.innerWidth<900})});
  arrowNav(listEl,'.sgc-sym');
  tog.addEventListener('click',function(e){var b=e.target.closest('button[data-mode]');if(!b)return;mode=b.getAttribute('data-mode');$$('button',tog).forEach(function(x){x.setAttribute('aria-pressed',x===b)});renderList()});
  q.addEventListener('input',renderList);
  q.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var f=$('.sgc-sym',listEl);if(f)show(f.getAttribute('data-slug'),{scroll:window.innerWidth<900})}else if(e.key==='ArrowDown'){var f2=$('.sgc-sym',listEl);if(f2){e.preventDefault();f2.focus()}}});
  $('#sgc-open',root).addEventListener('click',function(){var o=!rail.classList.contains('open');rail.classList.toggle('open',o);this.setAttribute('aria-expanded',o);if(o)q.focus()});
  renderList();
  var start=hashSlug();
  show(start||SYMPTOMS[0].slug,{hash:!!start,scroll:!!start});
  var on=$('.sgc-sym.on',listEl);if(on&&on.scrollIntoView&&window.innerWidth>=900){var box=$('.sgc-listw',root);box.scrollTop=on.offsetTop-box.clientHeight/3}
  window.addEventListener('hashchange',function(){var h=hashSlug();if(h&&h!==cur)show(h,{scroll:true})});
}

var root=document.querySelector('[data-sg]');if(!root)return;
var v=root.getAttribute('data-sg');
if(v==='a')initA(root);else if(v==='b')initB(root);else initC(root);
})();
