/* Poorly Pet symptom guide. One data set, three ways in.
   The page root carries data-sg="a" | "b" | "c" and this file runs the matching version.
   Deep links: #<symptom-slug> opens a symptom, #<area-id> opens an area. */
(function(){
'use strict';

/* ------------------------------------------------------------------ data */

var AREAS=[
  {id:'legs-paws',name:'Legs & paws'},
  {id:'skin-coat',name:'Skin & coat'},
  {id:'tummy-gut',name:'Tummy & gut'},
  {id:'eyes-ears',name:'Eyes & ears'},
  {id:'mouth-teeth',name:'Mouth & teeth'},
  {id:'back-spine',name:'Back & spine'},
  {id:'behaviour-mood',name:'Behaviour & mood'},
  {id:'whole-body',name:'Whole body'}
];

var URG={
  today:{label:'Vet today',desc:'Call your vet now. Do not wait to see if it settles.'},
  book:{label:'Book a vet',desc:'Not usually an emergency, but get it checked in the next few days. Sooner if it gets worse.'},
  home:{label:'Try at home first',desc:'Often fine to manage at home to start with. See a vet if it is no better in a few days or a warning sign appears.'}
};

/* Signs that mean a vet now, whatever the symptom. */
var EMERGENCY=[
  'Collapse, fainting, or suddenly unable to stand',
  'Struggling to breathe, or blue, grey or very pale gums',
  'A swollen, tight tummy with retching but nothing coming up',
  'Straining to wee with little or nothing coming out',
  'Sudden weakness or paralysis in the legs',
  'A fit lasting more than five minutes, or more than one in a day',
  'Vomiting blood, or poo that is bloody or black',
  'Has eaten something poisonous: chocolate, grapes or raisins, xylitol, rat bait, antifreeze or human medicines',
  'Heavy panting, drooling or wobbliness after heat or exercise',
  'Heavy bleeding, a deep wound, or hit by a car',
  'An eye injury, or an eye that is suddenly cloudy or held shut',
  'Severe pain: crying out, trembling, cannot settle'
];

/* urgency is the usual starting point; the vet text says when it is more urgent than that. */
var SYMPTOMS=[
/* Legs & paws */
{slug:'holding-a-paw-up',name:'Holding a paw up',area:'legs-paws',urgency:'book',
 syn:['lifting paw','three legged','hopping','sore paw','won\'t put weight on leg','cut pad','thorn'],
 looks:'Holds one paw off the ground when standing or walking, or only touches it down briefly.',
 causes:'A thorn, grass seed or cut in the pad, a torn nail, a sting, a sprain, or a joint or ligament problem.',
 conditions:['Paw care','Cruciate ligament injury','Luxating patella'],
 home:['Check between the toes and pads in good light for seeds, cuts or swelling.','Rest on the lead, toilet trips only, for 24 to 48 hours.','Keep the paw clean and dry. A boot or sock stops licking.'],
 vet:'Book a vet if it is no better after 48 hours or keeps coming back. Vet today if the leg hangs or looks bent, swells quickly, bleeds heavily, or your dog will not put any weight on it.'},
{slug:'licking-or-chewing-paws',name:'Licking or chewing paws',area:'legs-paws',urgency:'home',
 syn:['paw licking','chewing feet','itchy feet','red paws','brown stained paws','nibbling toes','yeasty paws'],
 looks:'Frequent licking or nibbling at the feet, often with pink-brown staining, red skin between the toes or a yeasty smell.',
 causes:'Allergies to pollen, mites or food, yeast or bacterial infection, a grass seed, dry cracked pads, or boredom and stress.',
 conditions:['Itchy skin & allergies','Seasonal allergies','Paw care','Anxiety'],
 home:['Rinse and dry paws after walks, especially in pollen season.','Keep the fur between the pads trimmed short.','A soothing paw balm, and a sock or boot to break the habit.'],
 vet:'Book a vet if it lasts more than a week or two, one paw is swollen, or there is pus, a lump or a strong smell. One suddenly swollen paw can mean a grass seed, which needs taking out.'},
{slug:'limping-or-favouring-a-leg',name:'Limping or favouring a leg',area:'legs-paws',urgency:'book',
 syn:['limping','limp','lame','lameness','hobbling','walking funny','bad leg','sore leg'],
 looks:'An uneven walk, a nod of the head when a front leg hurts, or a hitch in the hips when a back leg hurts.',
 causes:'A minor sprain or paw injury, arthritis, cruciate ligament damage, a slipping kneecap, or hip or elbow dysplasia.',
 conditions:['Arthritis','Cruciate ligament injury','Hip dysplasia','Elbow dysplasia','Luxating patella'],
 home:['Rest on the lead for a few days: no running, jumping or stairs.','Check the paw and nails for anything obvious.','Non-slip rugs help a sore dog keep its footing.','Never give human painkillers. Ibuprofen and paracetamol can poison dogs.'],
 vet:'Book a vet if it lasts more than two or three days or keeps coming back. Vet today if your dog cannot bear any weight, the leg is at an odd angle, or there is heavy swelling or obvious pain.'},
{slug:'scuffed-nails-or-dragging-paws',name:'Scuffed nails or dragging paws',area:'legs-paws',urgency:'book',
 syn:['knuckling','dragging feet','worn nails','scuffing','scraping feet','toes curling over'],
 looks:'Worn tops to the nails on the back feet, a scraping sound on walks, or paws that fold over onto the knuckles.',
 causes:'Nerve or spinal problems such as degenerative myelopathy or IVDD, rear-leg weakness with age, or sore joints changing how your dog walks.',
 conditions:['Knuckling','Degenerative myelopathy','IVDD (disc disease)','Rear-leg weakness','Nerve weakness'],
 home:['Protective boots or toe grips stop the tops of the paws getting sore.','Walk on grass rather than rough pavements.','Film a short walk to show your vet.'],
 vet:'Book a vet: dragging and knuckling usually point to nerves, not paws, and need a proper check. Vet today if it comes on suddenly or your dog loses the use of the back legs.'},
{slug:'slow-to-get-up',name:'Slow to get up',area:'legs-paws',urgency:'book',
 syn:['struggling to stand','difficulty getting up','can\'t get up','stiff getting up','old dog'],
 looks:'Takes a few goes to stand, pushes up with the front legs first, or is stiff for the first few steps.',
 causes:'Arthritis, hip or elbow dysplasia, spondylosis, rear-leg weakness, or extra weight on sore joints.',
 conditions:['Arthritis','Hip dysplasia','Spondylosis','Rear-leg weakness','Weight management'],
 home:['A thick, supportive bed away from draughts.','Rugs on slippery floors and a ramp for the car.','Short, regular walks rather than one long one.','Joint supplements help some dogs over a few weeks.'],
 vet:'Book a vet if it is new or getting worse, so pain can be treated properly. Vet today if your dog suddenly cannot get up at all.'},
{slug:'stiffness-after-rest',name:'Stiffness after rest',area:'legs-paws',urgency:'book',
 syn:['stiff in the morning','stiff joints','walks it off','creaky','stiff after sleeping'],
 looks:'Stiff and slow after sleeping or lying down, then loosens up after a few minutes of moving.',
 causes:'A classic early sign of arthritis. Also hip or elbow dysplasia and spondylosis. Cold, damp weather often makes it worse.',
 conditions:['Arthritis','Hip dysplasia','Elbow dysplasia','Spondylosis'],
 home:['A warm, padded bed off cold floors.','A gentle warm-up walk before anything energetic.','Little and often exercise. Hydrotherapy suits many stiff dogs.','Keep your dog lean: extra weight loads sore joints.'],
 vet:'Book a vet to find the cause and talk about pain relief. Stiffness is often pain, even when a dog does not cry.'},

/* Skin & coat */
{slug:'constant-licking-of-one-spot',name:'Constant licking of one spot',area:'skin-coat',urgency:'home',
 syn:['licking one spot','lick granuloma','licking leg','obsessive licking','sore patch','licking wrist'],
 looks:'Keeps going back to the same patch, often a wrist, leg or flank, leaving a wet, red or bald spot.',
 causes:'A hot spot starting, an allergy, a sore joint underneath, a small wound, or boredom and anxiety.',
 conditions:['Hot spots','Itchy skin & allergies','Arthritis','Anxiety'],
 home:['Look closely for a wound, lump, seed or parasite.','Stop the licking with a soft cone, body suit or sock.','More walks, chews and puzzle feeders if boredom is part of it.'],
 vet:'Book a vet if it lasts more than a few days, the skin breaks or it keeps coming back. Licking over a joint can be a sign of pain.'},
{slug:'excessive-scratching',name:'Excessive scratching',area:'skin-coat',urgency:'home',
 syn:['itchy','itching','itch','scratching','chewing skin','fleas','rubbing on carpet','itchy bottom','scooting'],
 looks:'Scratching, nibbling or rubbing much more than usual, often at night, sometimes with red skin or broken hair. Some itchy dogs scoot their bottom along the floor.',
 causes:'Fleas and mites, pollen, dust mite or food allergies, dry skin, or skin infection. Scooting is often full anal glands, worms or allergy.',
 conditions:['Itchy skin & allergies','Seasonal allergies','Hot spots'],
 home:['Check for fleas and flea dirt with a flea comb. Treat every pet in the house.','Keep flea and worm treatment up to date all year.','A gentle, soap-free shampoo and omega-3 supplements can help the skin.'],
 vet:'Book a vet if the itch stops your dog sleeping, lasts more than a week or two, or the skin is broken, smelly or weeping. Vet today for a suddenly swollen face or hives with breathing trouble.'},
{slug:'flaky-skin-or-dandruff',name:'Flaky skin or dandruff',area:'skin-coat',urgency:'home',
 syn:['dandruff','dry skin','flakes','scurf','scaly skin','dull coat'],
 looks:'White flakes in the coat, dry or scaly skin, often with a dull coat.',
 causes:'Dry air and central heating, bathing too often, a diet low in healthy fats, allergies, mites or hormone problems.',
 conditions:['Itchy skin & allergies','Seasonal allergies'],
 home:['Brush regularly to spread the natural oils.','Bathe less often, with a gentle, moisturising dog shampoo.','Omega-3 fish oil or a skin supplement can help.'],
 vet:'Book a vet if the flakes seem to move (this can be mites), or come with hair loss, itching, weight gain, thirst or slowing down.'},
{slug:'hair-loss-or-bald-patches',name:'Hair loss or bald patches',area:'skin-coat',urgency:'book',
 syn:['bald patches','bald spot','hair loss','alopecia','thinning coat','losing fur','losing hair'],
 looks:'Patches where the coat is thin or gone, beyond normal seasonal moulting.',
 causes:'Scratching from fleas or allergies, mites, ringworm, hot spots, or hormone problems such as an underactive thyroid.',
 conditions:['Itchy skin & allergies','Hot spots'],
 home:['Check for fleas and treat if needed.','Note whether it itches, and take a photo each week to track it.','Wash your hands after handling: ringworm can pass to people.'],
 vet:'Book a vet: bald patches need a proper diagnosis, often from a simple skin test. Sooner if patches spread, are round and crusty, or come with weight gain or thirst.'},
{slug:'raw-weepy-hot-spots',name:'Raw, weepy hot spots',area:'skin-coat',urgency:'book',
 syn:['hot spot','hotspot','wet eczema','moist dermatitis','weeping sore','raw patch','oozing skin'],
 looks:'A raw, red, wet patch that appears fast, often within hours, and is usually very sore. The fur around it gets matted.',
 causes:'Something itchy starts it (fleas, allergy, a damp coat, an ear infection) and licking or scratching turns it into a hot spot.',
 conditions:['Hot spots','Itchy skin & allergies','Seasonal allergies'],
 home:['Stop the licking with a cone or body suit.','Keep the area clean and dry, and clip the fur back if your dog allows.','Towel-dry thick coats well after swimming.'],
 vet:'Book a vet within a day or two: most hot spots need treatment to settle. Sooner if it is spreading fast, very painful, or your dog seems off colour.'},
{slug:'red-or-irritated-skin',name:'Red or irritated skin',area:'skin-coat',urgency:'home',
 syn:['red skin','rash','inflamed skin','pink belly','spots','bumps','hives','sore skin'],
 looks:'Pink or red skin, often on the belly, armpits, groin or paws, sometimes with small spots or bumps.',
 causes:'Allergies, contact with something irritating (plants, cleaning products), fleas, or bacterial or yeast infection.',
 conditions:['Itchy skin & allergies','Seasonal allergies','Hot spots'],
 home:['Rinse your dog off after walks through long grass.','Wash bedding in a gentle, fragrance-free product.','Keep flea treatment up to date.'],
 vet:'Book a vet if it spreads, has pus or crusts, or does not settle in a few days. Vet today if the face, lips or eyes swell suddenly, or there are hives with breathing trouble.'},

/* Tummy & gut */
{slug:'appetite-changes',name:'Appetite changes',area:'tummy-gut',urgency:'book',
 syn:['not eating','off food','off his food','off her food','fussy eater','loss of appetite','always hungry','eating more','won\'t eat'],
 looks:'Eating much less or much more than usual, leaving food, or suddenly begging and scavenging.',
 causes:'An upset tummy, dental pain, stress, heat or a change of food. Longer term, kidney, hormone or gut problems.',
 conditions:['Digestive issues','Dental disease','Kidney support','Anxiety'],
 home:['Offer a small, bland meal such as plain chicken and rice.','Check the mouth for broken teeth or sore gums.','Keep feeding times steady, and change food slowly over a week.'],
 vet:'Book a vet if an adult dog has eaten little for more than a day or two, or a puppy for more than a day. Vet today if not eating comes with vomiting, a swollen tummy or real lethargy.'},
{slug:'excessive-wind',name:'Excessive wind',area:'tummy-gut',urgency:'home',
 syn:['wind','gas','farting','flatulence','smelly wind','trumping','bloating'],
 looks:'More wind, or smellier wind, than normal, sometimes with a gurgling tummy.',
 causes:'Eating too fast, a recent food change, scavenging, rich treats, or a food that does not suit.',
 conditions:['Digestive issues'],
 home:['A slow-feeder bowl for fast eaters.','Cut back on scraps and rich treats.','Change food gradually and consider a probiotic.'],
 vet:'Book a vet if it comes with diarrhoea, weight loss or a poor appetite. Vet today if the tummy is swollen and tight and your dog is retching without bringing anything up.'},
{slug:'gurgling-noisy-stomach',name:'Gurgling, noisy stomach',area:'tummy-gut',urgency:'home',
 syn:['stomach noises','rumbling tummy','gurgling tummy','noisy tummy','eating grass','lip licking'],
 looks:'Loud rumbling from the tummy, often with lip licking, eating grass or mild discomfort.',
 causes:'An empty tummy, wind, a mild upset from something eaten, or a sensitive gut.',
 conditions:['Digestive issues'],
 home:['Smaller meals more often. A late snack helps if it happens on an empty tummy.','A bland diet for a day or two if the tummy seems upset.','A probiotic can help sensitive dogs.'],
 vet:'Book a vet if it happens most days or comes with diarrhoea, vomiting or weight loss. Vet today if the tummy is bloated or painful, or your dog is retching.'},
{slug:'loose-stools-or-diarrhoea',name:'Loose stools or diarrhoea',area:'tummy-gut',urgency:'home',
 syn:['diarrhoea','diarrhea','runny poo','loose poo','soft poo','upset tummy','mucus in poo','blood in poo','the runs','scooting'],
 looks:'Soft, runny or watery poo, often more often and more urgent than usual, sometimes with mucus.',
 causes:'Scavenging, a change of food, stress, worms or infection. Soft poo can also stop the anal glands emptying, which leads to scooting.',
 conditions:['Digestive issues'],
 home:['Plenty of fresh water, and small bland meals for a day or two.','A probiotic paste can help firm things up.','Keep up regular worming.'],
 vet:'Book a vet if it lasts more than 48 hours. Vet today if there is a lot of blood, it looks like raspberry jam, your dog is also vomiting, is weak or very flat, or is a young puppy, elderly or already unwell.'},
{slug:'vomiting-or-regurgitation',name:'Vomiting or regurgitation',area:'tummy-gut',urgency:'book',
 syn:['vomiting','vomit','sick','being sick','throwing up','retching','bringing up food','regurgitating','vomiting blood'],
 looks:'Vomiting is active heaving from the tummy. Regurgitation is food coming back up with no effort, often undigested, soon after eating.',
 causes:'Scavenging, eating too fast or a food change. Repeated vomiting can mean a blockage, pancreatitis, kidney problems or poisoning.',
 conditions:['Digestive issues','Kidney support'],
 home:['After a single vomit in a bright, happy dog, offer small bland meals for a day.','Offer small sips of water often.','A slow-feeder bowl helps dogs who bring food back after gulping.'],
 vet:'Vet today if there is blood or what looks like coffee grounds, your dog vomits several times or cannot keep water down, the tummy is swollen, they may have eaten something toxic or a toy, or they seem weak. Book a vet if it keeps happening.'},
{slug:'weight-gain',name:'Weight gain',area:'tummy-gut',urgency:'home',
 syn:['overweight','fat','putting on weight','chubby','obese','heavy','pot belly'],
 looks:'You cannot easily feel the ribs, the waist has gone when you look from above, or the tummy sags.',
 causes:'Too much food or too many treats, less exercise, neutering or age. Sometimes an underactive thyroid.',
 conditions:['Weight management','Arthritis'],
 home:['Weigh food on scales rather than using a scoop.','Count treats as part of the daily allowance.','Add short, extra walks. Hydrotherapy suits dogs with sore joints.'],
 vet:'Book a weight check with your vet or vet nurse for a safe target. Sooner if the weight gain comes with thirst, hair loss, tiredness or a pot belly.'},

/* Eyes & ears */
{slug:'head-shaking',name:'Head shaking',area:'eyes-ears',urgency:'book',
 syn:['shaking head','flapping ears','head tilt','tilting head'],
 looks:'Shaking or flapping the head often, sometimes holding it tilted to one side.',
 causes:'An ear infection, ear mites, a grass seed in the ear, water in the ear, or allergies.',
 conditions:['Ear & eye care','Itchy skin & allergies'],
 home:['Look inside the ear flap for redness, wax or a smell.','Dry ears well after swimming and bathing.','Do not push cotton buds into the ear canal.'],
 vet:'Book a vet within a day or two: many ear problems need drops, and a grass seed must be removed. Vet today if there is a sudden head tilt with wobbliness or flicking eyes. Book promptly if the ear flap puffs up like a cushion.'},
{slug:'odour-from-the-ears',name:'Odour from the ears',area:'eyes-ears',urgency:'book',
 syn:['smelly ears','ear smell','yeasty ears','ear discharge','dirty ears','brown wax','ear wax'],
 looks:'A yeasty, sour or unpleasant smell from the ears, often with brown or yellow wax.',
 causes:'A yeast or bacterial ear infection, often linked to allergies or trapped moisture in floppy ears.',
 conditions:['Ear & eye care','Itchy skin & allergies'],
 home:['Clean the outer ear gently with a dog ear cleaner. Never push cotton buds deep in.','Dry ears after swimming.','Check ears weekly if your dog is prone to problems.'],
 vet:'Book a vet if there is a smell with discharge, redness or pain. Infections need the right drops, and cleaning alone rarely clears them.'},
{slug:'red-inflamed-ear-flaps',name:'Red, inflamed ear flaps',area:'eyes-ears',urgency:'book',
 syn:['red ears','inflamed ears','sore ears','hot ears','swollen ear flap','ear blister'],
 looks:'The inside of the ear flap is pink or red, warm, and may be bumpy or swollen.',
 causes:'Allergies, ear infection, mites or scratching. A soft, puffy flap can be a blood blister (aural haematoma).',
 conditions:['Ear & eye care','Itchy skin & allergies','Seasonal allergies'],
 home:['Keep the ears clean and dry.','A soft cone stops scratching while it settles.'],
 vet:'Book a vet if the redness lasts more than a day or two, or there is discharge or a smell. Book promptly if the flap swells up like a cushion.'},
{slug:'scratching-at-ears',name:'Scratching at ears',area:'eyes-ears',urgency:'book',
 syn:['scratching ears','itchy ears','pawing ears','rubbing ears','rubbing head'],
 looks:'Scratching at the ears with a back paw, or rubbing the head along the floor or furniture.',
 causes:'Ear infection, mites, allergies, or something stuck in the ear.',
 conditions:['Ear & eye care','Itchy skin & allergies'],
 home:['Look and sniff: redness, wax, a smell or pain all point to a problem.','Keep up with flea and mite treatment.'],
 vet:'Book a vet if it lasts more than a day or two, or there is a smell, discharge, or pain when you touch the ear.'},
{slug:'weepy-or-red-eyes',name:'Weepy or red eyes',area:'eyes-ears',urgency:'book',
 syn:['runny eyes','watery eyes','tear stains','eye discharge','red eyes','gunky eyes','conjunctivitis','squinting','sore eye'],
 looks:'Watery or sticky discharge, tear staining, or redness of the white of the eye or the lining around it.',
 causes:'Allergies, dust or irritation, conjunctivitis, blocked tear ducts, or a scratch on the eye.',
 conditions:['Ear & eye care','Seasonal allergies'],
 home:['Gently wipe away discharge with cooled boiled water on cotton wool, a fresh piece for each eye.','Keep hair trimmed away from the eyes.'],
 vet:'Vet today if your dog is squinting, holding the eye shut, the eye looks cloudy or blue, or there has been an injury: eyes can get worse very fast. Book a vet for thick yellow or green discharge, or anything lasting more than a day or two.'},

/* Mouth & teeth */
{slug:'bad-breath',name:'Bad breath',area:'mouth-teeth',urgency:'book',
 syn:['smelly breath','halitosis','stinky breath','dog breath','breath smells'],
 looks:'Breath that is stronger or more unpleasant than usual, often with tartar or red gums.',
 causes:'Plaque and gum disease in most dogs. Less often something stuck in the teeth, or kidney problems or diabetes.',
 conditions:['Dental disease','Kidney support'],
 home:['Brush daily with a dog toothpaste. Never use human toothpaste.','Dental chews, water additives or plaque powders help alongside brushing.'],
 vet:'Book a vet check if the smell is new or strong, or comes with tartar, bleeding gums or trouble eating. Sooner if the breath smells sweet or of ammonia, or comes with thirst or weight loss.'},
{slug:'bleeding-or-red-gums',name:'Bleeding or red gums',area:'mouth-teeth',urgency:'book',
 syn:['bleeding gums','red gums','sore gums','gingivitis','blood on toys','swollen gums'],
 looks:'A red line along the gums, gums that bleed when chewing or brushing, or blood on toys.',
 causes:'Gum disease from plaque, a broken tooth, or an injury from a stick or bone.',
 conditions:['Dental disease'],
 home:['Once your vet has checked the mouth, brush gently with a soft brush and dog toothpaste.','Avoid very hard chews such as antlers and bones, which break teeth.'],
 vet:'Book a vet: bleeding gums usually mean gum disease that needs treating. Vet today if bleeding will not stop, or the gums look pale, white, blue or grey.'},
{slug:'dropping-food-slow-chewing',name:'Dropping food or slow chewing',area:'mouth-teeth',urgency:'book',
 syn:['dropping food','chewing on one side','eating slowly','struggling to eat','won\'t eat hard food','dropping kibble'],
 looks:'Chewing on one side, dropping food, eating slowly, or suddenly preferring soft food.',
 causes:'Dental pain from a broken or loose tooth, gum disease or a mouth ulcer, or something stuck in the mouth.',
 conditions:['Dental disease'],
 home:['Soften kibble with warm water for now.','Take a gentle look in the mouth for a broken tooth or anything stuck.'],
 vet:'Book a vet: dogs hide dental pain well, and this is often the only sign. Vet today if your dog cannot eat or close the mouth, or the face is swollen.'},
{slug:'pawing-at-the-mouth',name:'Pawing at the mouth',area:'mouth-teeth',urgency:'today',
 syn:['pawing mouth','rubbing face','drooling','gagging','something stuck in mouth','choking'],
 looks:'Pawing or rubbing at the mouth or face, often with drooling, lip licking or gagging.',
 causes:'Something stuck between the teeth or across the roof of the mouth (often a stick), a broken tooth, a sting, or dental pain.',
 conditions:['Dental disease'],
 home:['If it is safe, look in the mouth in good light. Only remove an object if it comes out easily.','Do not put your fingers down the throat.'],
 vet:'Vet today if something is wedged, your dog is gagging or drooling heavily, the face or tongue is swelling, or there is any trouble breathing. Book a vet if it settles but keeps coming back.'},
{slug:'yellow-or-brown-tartar',name:'Yellow or brown tartar',area:'mouth-teeth',urgency:'book',
 syn:['tartar','plaque','dirty teeth','brown teeth','yellow teeth','calculus'],
 looks:'Hard yellow or brown build-up on the teeth, usually worst on the back teeth and the canines.',
 causes:'Plaque hardening into tartar, which leads on to gum disease. Small breeds are most prone.',
 conditions:['Dental disease'],
 home:['Brush daily with dog toothpaste to stop more building up.','Dental chews and plaque powders help, but will not shift tartar that is already there.'],
 vet:'Book a vet check: tartar that is already there needs a scale and polish under anaesthetic. Sooner if the gums are red or bleeding, or your dog is eating differently.'},

/* Back & spine */
{slug:'hunched-or-arched-posture',name:'Hunched or arched posture',area:'back-spine',urgency:'book',
 syn:['hunched back','arched back','tucked tummy','praying position','stiff back','head held low'],
 looks:'Back arched up, head held low, tummy tucked in, or unwilling to turn the head.',
 causes:'Back or neck pain (IVDD, spondylosis), or tummy pain. Front end down and bottom up (the praying position) often means tummy pain.',
 conditions:['IVDD (disc disease)','Back pain','Spondylosis','Digestive issues'],
 home:['Strict rest: no jumping, stairs or play.','Use a harness, not a collar, in case the neck is sore.'],
 vet:'Book a vet for the same or next day: this is usually pain. Vet today if there is any weakness or wobbling in the legs, the tummy is swollen, or your dog is vomiting.'},
{slug:'reluctant-to-jump-or-climb',name:'Reluctant to jump or climb',area:'back-spine',urgency:'book',
 syn:['won\'t jump','not jumping','won\'t use stairs','won\'t get in the car','can\'t jump on sofa','stairs'],
 looks:'Hesitates or refuses to jump into the car or onto the sofa, or struggles with stairs.',
 causes:'Back pain, arthritis, hip dysplasia, spondylosis, or a cruciate or knee problem.',
 conditions:['Back pain','Arthritis','Hip dysplasia','Spondylosis','IVDD (disc disease)'],
 home:['Use a ramp or steps for the car and sofa.','Gate off the stairs if they are a struggle.','Keep walks gentle and on the lead until your dog has been checked.'],
 vet:'Book a vet: a dog that stops jumping is usually telling you something hurts. Vet today if it comes with sudden weakness or crying out.'},
{slug:'sudden-rear-weakness',name:'Sudden rear weakness',area:'back-spine',urgency:'today',
 syn:['back legs gave way','collapsed','can\'t walk','paralysed','paralysis','dragging back legs','can\'t stand','back legs not working'],
 looks:'The back legs suddenly go weak, wobbly, cross over or stop working, sometimes with crying out or a hunched back.',
 causes:'A slipped disc (IVDD), a spinal stroke, an injury, or other causes that need urgent checks.',
 conditions:['IVDD (disc disease)','Paralysis','Rear-leg weakness','Back pain'],
 home:['Keep your dog as still as possible. Carry them, ideally on a flat board or a firm blanket.','No walking, jumping or stairs.','Phone your vet before you set off so they are ready.'],
 vet:'Vet today, straight away. Sudden weakness or paralysis in the back legs is an emergency, and quick treatment can make a real difference to recovery. Also urgent if your dog cannot wee.'},
{slug:'wobbly-back-legs',name:'Wobbly back legs',area:'back-spine',urgency:'book',
 syn:['wobbly','unsteady','weak back legs','swaying','ataxia','crossing legs','drunk walking','falling over'],
 looks:'A swaying or unsteady back end, legs crossing, or falling over when turning.',
 causes:'Slowly, over weeks: degenerative myelopathy, spondylosis, arthritis or muscle loss with age. Suddenly: IVDD, a spinal injury or an inner ear problem.',
 conditions:['Degenerative myelopathy','Rear-leg weakness','IVDD (disc disease)','Nerve weakness','Knuckling'],
 home:['Non-slip flooring and a support harness help.','Short, regular walks keep muscles working.','Physiotherapy and hydrotherapy help many dogs.'],
 vet:'Book a vet if it has come on slowly. Vet today if it came on suddenly, is getting worse by the hour, or your dog cannot stand or wee.'},
{slug:'yelping-when-touched',name:'Yelping when touched',area:'back-spine',urgency:'book',
 syn:['crying when picked up','yelping','yelps','sensitive to touch','crying out','whimpering','in pain'],
 looks:'Cries out when picked up, stroked along the back or touched in one spot, or when getting up.',
 causes:'Back or neck pain such as IVDD, a muscle strain, arthritis, or tummy pain.',
 conditions:['IVDD (disc disease)','Back pain','Arthritis','Spondylosis'],
 home:['Rest, and lift your dog with support under the chest and the back end.','Swap the collar for a harness.'],
 vet:'Book a vet for the same or next day: this is clear pain. Vet today if there is any weakness, wobbling or dragging of the legs.'},

/* Behaviour & mood */
{slug:'destructive-behaviour',name:'Destructive behaviour',area:'behaviour-mood',urgency:'home',
 syn:['chewing furniture','destroying things','digging','scratching doors','ripping things','chewing'],
 looks:'Chewing, digging or scratching at doors and furniture, often when left alone or bored.',
 causes:'Boredom, separation anxiety, teething, pent-up energy or stress.',
 conditions:['Separation anxiety','Anxiety','Restlessness'],
 home:['More exercise and brain work: sniffing games, puzzle feeders, long-lasting chews.','Build up time alone slowly, starting with a few minutes.','Calming aids can take the edge off while you train.'],
 vet:'Book a vet if it is new in an adult or older dog: pain or illness can change behaviour. A qualified behaviourist helps with separation problems.'},
{slug:'hiding-or-unusually-clingy',name:'Hiding or unusually clingy',area:'behaviour-mood',urgency:'book',
 syn:['hiding','clingy','following me everywhere','withdrawn','needy','velcro dog','not himself','not herself'],
 looks:'Hiding under furniture, keeping away from the family, or suddenly following you everywhere.',
 causes:'Fear or stress, noise, changes at home, pain or illness, or confusion in older dogs.',
 conditions:['Anxiety','Noise & firework fear','Separation anxiety'],
 home:['Offer a quiet, covered den your dog can choose to use.','Keep routines steady, and do not force a fuss.','Calming aids can help around known triggers.'],
 vet:'Book a vet if it is new and there is no obvious reason: dogs often hide when they are in pain or unwell. Vet today if it comes with not eating, vomiting, a swollen tummy or weakness.'},
{slug:'pacing-or-restlessness',name:'Pacing or restlessness',area:'behaviour-mood',urgency:'book',
 syn:['pacing','restless','can\'t settle','panting at night','wandering at night','unsettled'],
 looks:'Walking about, lying down and getting straight back up, panting, unable to settle, often at night.',
 causes:'Anxiety, pain, needing the toilet, confusion in older dogs, or tummy discomfort.',
 conditions:['Restlessness','Anxiety','Arthritis'],
 home:['A calm evening routine with a late toilet trip.','A comfortable bed in a quiet spot, and a night light for older dogs.','Calming supplements help some dogs.'],
 vet:'Vet today if restlessness comes with a swollen tummy, retching with nothing coming up, or pale gums: this can be bloat, which is an emergency. Book a vet if it is new or keeps happening.'},
{slug:'trembling-at-noises',name:'Trembling at noises',area:'behaviour-mood',urgency:'home',
 syn:['fireworks','thunder','scared of noises','shaking','trembling','noise phobia','bangs','scared'],
 looks:'Shaking, hiding, panting or trying to escape during fireworks, thunder or loud bangs.',
 causes:'Noise fear, which often gets worse over time if it is not helped.',
 conditions:['Noise & firework fear','Anxiety'],
 home:['Walk before dark in firework season, and close the curtains.','Set up a den and play music or the TV.','Calming aids, and slow sound training with quiet recordings.'],
 vet:'Book a vet well before firework season if your dog panics badly: there are treatments that work. Book a vet too if your dog trembles with no noise around, as shaking can mean pain or feeling unwell.'},
{slug:'whining-or-barking-when-alone',name:'Whining or barking when alone',area:'behaviour-mood',urgency:'home',
 syn:['separation anxiety','barking when left','howling','crying when alone','neighbours complaining','can\'t be left'],
 looks:'Barking, howling or whining soon after you leave, sometimes with accidents indoors or chewing at doors.',
 causes:'Separation anxiety, boredom, or a change in routine.',
 conditions:['Separation anxiety','Anxiety'],
 home:['Practise short absences and build up slowly.','A long-lasting chew or food toy as you leave.','A pet camera shows what really happens while you are out.'],
 vet:'Book a vet or a qualified behaviourist if your dog panics, hurts itself, or it is getting worse.'},

/* Whole body */
{slug:'drinking-more-than-usual',name:'Drinking more than usual',area:'whole-body',urgency:'book',
 syn:['thirsty','drinking a lot','wee','weeing a lot','peeing more','excessive thirst','accidents indoors','urinating more'],
 looks:'Emptying the water bowl more often, usually with more weeing or accidents indoors.',
 causes:'Hot weather, exercise or a dry food. If it carries on: kidney disease, diabetes, Cushing\'s disease, a womb infection in unspayed females, or some medicines.',
 conditions:['Kidney support'],
 home:['Never restrict water.','Measure how much your dog drinks in 24 hours to tell your vet.','Take a fresh wee sample in a clean pot to the appointment.'],
 vet:'Book a vet in the next few days: extra thirst is worth a blood and urine test. Vet today if an unspayed female is also off colour or has discharge, or your dog is vomiting, weak, or straining with little wee coming out.'},
{slug:'general-stiffness-with-age',name:'General stiffness with age',area:'whole-body',urgency:'book',
 syn:['old dog','slowing down','senior dog','stiff','aging','ageing','getting old'],
 looks:'Slower on walks, stiffer after rest, and less keen on stairs, play or jumping as the years go by.',
 causes:'Arthritis is very common in older dogs, often with muscle loss and spondylosis.',
 conditions:['Arthritis','Spondylosis','Rear-leg weakness','Hydrotherapy','Physiotherapy'],
 home:['A soft, supportive bed, rugs on slippery floors and a ramp for the car.','Shorter, more frequent walks, and a lean body weight.','Joint supplements and hydrotherapy suit many older dogs.'],
 vet:'Book a vet: "just getting old" is often pain that can be treated. Regular senior checks are worth it.'},
{slug:'low-energy-or-lethargy',name:'Low energy or lethargy',area:'whole-body',urgency:'book',
 syn:['lethargic','lethargy','tired','sleepy','flat','no energy','quiet','depressed','off colour','not himself','not herself'],
 looks:'Sleeping more, less interested in walks or play, slow to respond, not their usual self.',
 causes:'Heat, a busy day, a mild illness, pain or infection. If it carries on: an underactive thyroid, heart or kidney disease, and more.',
 conditions:['Kidney support','Arthritis','Weight management'],
 home:['Let them rest somewhere cool and quiet with water.','Keep an eye on eating, drinking, weeing and poo.'],
 vet:'Vet today if it is sudden or severe, or comes with pale gums, collapse, fast breathing, vomiting, a swollen tummy or not eating. Book a vet if it lasts more than a day or two.'},
{slug:'post-surgery-recovery',name:'Recovering from surgery or injury',area:'whole-body',urgency:'home',
 syn:['after surgery','after an operation','operation','recovery','stitches','wound','cone','spay','neuter','cage rest','crate rest'],
 looks:'Your dog is healing after an operation, an injury or a wound, and needs rest and protection.',
 causes:'Neutering, joint surgery such as a cruciate repair, lump removal, or an injury.',
 conditions:['Post-Surgery Recovery','Wound & recovery','Recovery','Physiotherapy','Hydrotherapy'],
 home:['Follow your vet\'s rest and exercise plan exactly.','A soft cone or recovery suit to protect the wound.','Non-slip flooring, a ramp and a support harness.','Check the wound twice a day.'],
 vet:'Call your vet the same day if the wound is red, hot, swollen, smelly, oozing or open, or your dog is not eating or seems in more pain.'},
{slug:'weight-management',name:'Trouble managing weight',area:'whole-body',urgency:'book',
 syn:['losing weight','weight loss','underweight','thin','diet','can\'t lose weight','skinny'],
 looks:'Your dog keeps gaining despite a diet, or is losing weight without trying.',
 causes:'Too many calories or too little exercise. Weight loss you cannot explain can mean dental, gut, kidney, thyroid or other illness.',
 conditions:['Weight management','Digestive issues','Kidney support'],
 home:['Weigh your dog monthly and keep a note.','Measure food with scales, and cut back on treats.','Use part of the daily food as training rewards.'],
 vet:'Book a vet if your dog is losing weight without trying, or not losing weight on a proper diet. Both are worth a check.'}
];

/* ------------------------------------------------------------------ helpers */

var BY={},AREA={};
SYMPTOMS.forEach(function(s){BY[s.slug]=s});
AREAS.forEach(function(a){a.items=SYMPTOMS.filter(function(s){return s.area===a.id});AREA[a.id]=a});
var MAIL='hello@poorly-pet.com';

function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lcFirst(t){return t.charAt(0).toLowerCase()+t.slice(1)}
function $(sel,root){return(root||document).querySelector(sel)}
function $$(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function scrollTo(el){if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
function setHash(h){try{history.replaceState(null,'',h?'#'+h:location.pathname+location.search)}catch(e){}}
function pill(u){return '<span class="sg-pill sg-u-'+u+'"><i aria-hidden="true"></i>'+URG[u].label+'</span>'}

/* symptoms that share a linked condition, best overlap first */
function related(s){
  return SYMPTOMS.filter(function(o){return o!==s}).map(function(o){
    var n=o.conditions.filter(function(c){return s.conditions.indexOf(c)>-1}).length;
    return {o:o,n:n+(o.area===s.area?.5:0)};
  }).filter(function(x){return x.n>=1}).sort(function(a,b){return b.n-a.n}).slice(0,3).map(function(x){return x.o});
}

/* the detail block every version shows. opts.h = heading tag, opts.vetFirst puts the vet box first */
function detail(s,opts){
  opts=opts||{};var h=opts.h||'h4';
  var looks='<div class="sg-db sg-db-looks"><'+h+'>What it looks like</'+h+'><p>'+esc(s.looks)+'</p></div>';
  var cause='<div class="sg-db sg-db-cause"><'+h+'>Often linked to</'+h+'><p>'+esc(s.causes)+'</p><ul class="sg-conds" aria-label="Related conditions">'+
    s.conditions.map(function(c){return '<li><a href="#">'+esc(c)+'</a></li>'}).join('')+'</ul></div>';
  var home='<div class="sg-db sg-db-home"><'+h+'>What you can do at home</'+h+'><ul class="sg-tips">'+
    s.home.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul></div>';
  var vet='<div class="sg-db sg-vet sg-u-'+s.urgency+'"><'+h+'>When it is a vet job</'+h+'><p>'+esc(s.vet)+'</p></div>';
  var rel=related(s);
  var out='<div class="sg-det">'+(opts.vetFirst?vet+looks+cause+home:looks+cause+home+vet)+
    '<div class="sg-acts"><a class="btn sg-shop" href="#">Shop for '+esc(lcFirst(s.name))+'</a>'+
    '<a class="sg-ask" href="mailto:'+MAIL+'?subject='+encodeURIComponent('Question about '+lcFirst(s.name))+'">Not sure? Ask us ›</a></div>'+
    (rel.length?'<p class="sg-rel"><span>Also see</span>'+rel.map(function(o){return '<a href="#'+o.slug+'">'+esc(o.name)+'</a>'}).join('')+'</p>':'')+
    '</div>';
  return out;
}

/* ------------------------------------------------------------------ search (version A) */

var STOP={};('my our the a an and or of is are was has have his her its it dog dogs pup puppy keeps keep very lot lots bit been with at on in to from for when he she they me i im what why how does do doing just really seems seem got getting').split(' ').forEach(function(w){STOP[w]=1});
function norm(t){return String(t).toLowerCase().replace(/&/g,' and ').replace(/[\u2019']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function stem(w){return w.length>4?w.replace(/(ing|ed|es|s|y)$/,''):w}
/* word-prefix match, so "ear" finds "ears" but not "year" */
function has(t,w){
  var T=' '+t+' ';
  if(T.indexOf(' '+w+' ')>-1)return 1;
  if(T.indexOf(' '+w)>-1)return .7;
  var st=stem(w);return st!==w&&st.length>=3&&T.indexOf(' '+st)>-1?.7:0;
}
var INDEX=SYMPTOMS.map(function(s){
  return {s:s,f:[
    {w:10,t:norm(s.name)},
    {w:8,t:s.syn.map(norm).join(' | ')},
    {w:4,t:norm(s.conditions.join(' | '))},
    {w:3,t:norm(AREA[s.area].name)},
    {w:1,t:norm(s.looks+' '+s.causes)}
  ]};
});
function score(toks,all){
  var out=[];
  INDEX.forEach(function(x){
    var sc=0,ok=true,any=false;
    toks.forEach(function(w){
      var best=0;
      x.f.forEach(function(f){var m=has(f.t,w)*f.w;if(m>best)best=m});
      if(best)any=true;else ok=false;sc+=best;
    });
    if(all?!ok:!any)return;
    var nq=toks.join(' '),nm=x.f[0].t;
    if(nm.indexOf(nq)===0)sc+=6;else if(nm.indexOf(nq)>-1)sc+=3;
    /* show which plain word matched when the name itself did not */
    var syn=null;
    if(!toks.some(function(w){return has(nm,w)})){
      syn=x.s.syn.filter(function(v){var n=norm(v);return toks.some(function(w){return has(n,w)})})[0]||null;
    }
    out.push({s:x.s,score:sc,syn:syn});
  });
  out.sort(function(a,b){return b.score-a.score||a.s.name.localeCompare(b.s.name)});
  return out;
}
/* words that suggest an emergency, mapped to the EMERGENCY list */
var EMERG_RX=[
  [/collaps|faint|unconscious|can ?t stand|cannot stand/,0],
  [/breath|choking|blue gums|grey gums|pale gums|white gums/,1],
  [/bloat|swollen (tummy|belly|stomach)|tight (tummy|belly)|retching/,2],
  [/(cant|cannot|not|unable to|straining to|trying to) (wee|pee|urinate)|straining/,3],
  [/paralys|cant walk|cannot walk|back legs (gone|gave way|not working)/,4],
  [/seizure|fitting|convuls|\bfits?\b/,5],
  [/blood|black poo|bloody/,6],
  [/poison|chocolate|grape|raisin|xylitol|rat bait|antifreeze|ibuprofen|paracetamol/,7],
  [/heatstroke|heat stroke|overheat/,8],
  [/bleeding heavily|heavy bleeding|hit by a car|road accident|deep wound/,9],
  [/eye injury|cloudy eye|eye (shut|closed)/,10]
];
function emergencies(q){var n=norm(q);return EMERG_RX.filter(function(r){return r[0].test(n)}).map(function(r){return EMERGENCY[r[1]]})}

function search(q){
  var toks=norm(q).split(' ').filter(function(w){return w&&!STOP[w]});
  if(!toks.length)return null;
  var r=score(toks,true);
  /* nothing has every word: fall back to anything with a strong match on some of them */
  if(!r.length&&toks.length>1)r=score(toks,false).filter(function(x){return x.score>=5.6});
  return r;
}

/* ------------------------------------------------------------------ version A: search first */

function initA(root){
  var input=$('#sg-q',root),clear=$('#sg-qx',root),list=$('#sg-cards',root),count=$('#sg-count',root),chips=$('#sg-chips',root),empty=$('#sg-empty',root),alarm=$('#sg-alarm',root);
  var area='all';

  chips.innerHTML='<button type="button" class="sg-chip" data-area="all" aria-pressed="true">All <span>'+SYMPTOMS.length+'</span></button>'+
    AREAS.map(function(a){return '<button type="button" class="sg-chip" data-area="'+a.id+'" aria-pressed="false">'+esc(a.name)+' <span>'+a.items.length+'</span></button>'}).join('');

  var sorted=SYMPTOMS.slice().sort(function(a,b){return a.name.localeCompare(b.name)});
  list.innerHTML=sorted.map(function(s){
    return '<li class="sg-card sg-u-'+s.urgency+'" id="sg-c-'+s.slug+'" data-slug="'+s.slug+'">'+
      '<h3 class="sg-ch"><button type="button" class="sg-cbtn" aria-expanded="false" aria-controls="sg-p-'+s.slug+'" id="sg-b-'+s.slug+'">'+
      '<span class="sg-cn">'+esc(s.name)+'</span>'+
      '<span class="sg-cm"><span class="sg-ca">'+esc(AREA[s.area].name)+'</span>'+pill(s.urgency)+'</span>'+
      '<span class="sg-hit" hidden></span>'+
      '<span class="sg-cl">'+esc(s.looks)+'</span>'+
      '<span class="sg-tg" aria-hidden="true"></span></button></h3>'+
      '<div class="sg-cp" id="sg-p-'+s.slug+'" role="region" aria-labelledby="sg-b-'+s.slug+'" hidden></div></li>';
  }).join('');
  var cards={};$$('.sg-card',list).forEach(function(li){cards[li.dataset.slug]=li});

  function open(slug,on,push){
    var li=cards[slug];if(!li)return;
    var b=$('.sg-cbtn',li),p=$('.sg-cp',li);
    if(on&&!p.innerHTML)p.innerHTML=detail(BY[slug],{h:'h4'});
    b.setAttribute('aria-expanded',on?'true':'false');p.hidden=!on;li.classList.toggle('on',on);
    if(push)setHash(on?slug:'');
  }

  function run(){
    var q=input.value,res=search(q),shown=0;
    clear.hidden=!q;
    var order=res?res:sorted.map(function(s){return{s:s}});
    var seen={};
    order.forEach(function(r){
      var li=cards[r.s.slug];seen[r.s.slug]=1;
      var vis=area==='all'||r.s.area===area;
      li.hidden=!vis;if(vis)shown++;
      var hit=$('.sg-hit',li);
      if(r.syn){hit.hidden=false;hit.textContent='Matches "'+r.syn+'"'}else{hit.hidden=true}
      list.appendChild(li);
    });
    SYMPTOMS.forEach(function(s){if(!seen[s.slug]){cards[s.slug].hidden=true;list.appendChild(cards[s.slug])}});
    var an=area==='all'?'':' in '+AREA[area].name;
    count.textContent=q.trim()?(shown?shown+(shown===1?' symptom matches':' symptoms match')+' "'+q.trim()+'"'+an:''):shown+' symptoms'+an+', A to Z';
    empty.hidden=!!shown;
    var em=q.trim()?emergencies(q):[];
    alarm.hidden=!em.length;
    if(em.length)$('ul',alarm).innerHTML=em.map(function(t){return '<li>'+esc(t)+'</li>'}).join('');
    if(!shown)$('#sg-empty-q',root).textContent=q.trim()?'"'+q.trim()+'"'+an:'this area';
  }
  var t;input.addEventListener('input',function(){clearTimeout(t);t=setTimeout(run,60)});
  input.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&input.value){input.value='';run()}
    if(e.key==='Enter'){e.preventDefault();var first=$$('.sg-card',list).filter(function(li){return!li.hidden})[0];if(first){open(first.dataset.slug,true,true);$('.sg-cbtn',first).focus()}}
  });
  $('form',root)&&$('form',root).addEventListener('submit',function(e){e.preventDefault()});
  clear.addEventListener('click',function(){input.value='';run();input.focus()});
  chips.addEventListener('click',function(e){
    var b=e.target.closest('.sg-chip');if(!b)return;
    area=b.dataset.area;
    $$('.sg-chip',chips).forEach(function(c){c.setAttribute('aria-pressed',c===b?'true':'false')});
    run();
  });
  $$('[data-try]',root).forEach(function(b){b.addEventListener('click',function(){input.value=b.dataset.try;run();input.focus()})});
  list.addEventListener('click',function(e){
    var b=e.target.closest('.sg-cbtn');if(!b)return;
    var li=b.closest('.sg-card');open(li.dataset.slug,b.getAttribute('aria-expanded')!=='true',true);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='/'&&!/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){e.preventDefault();input.focus()}
  });

  run();
  return {
    symptom:function(slug){
      input.value='';area='all';
      $$('.sg-chip',chips).forEach(function(c){c.setAttribute('aria-pressed',c.dataset.area==='all'?'true':'false')});
      run();open(slug,true,false);
      var li=cards[slug];scrollTo(li);$('.sg-cbtn',li).focus({preventScroll:true});
    },
    area:function(id){
      input.value='';area=id;
      $$('.sg-chip',chips).forEach(function(c){c.setAttribute('aria-pressed',c.dataset.area===id?'true':'false')});
      run();scrollTo(chips);
    }
  };
}

/* ------------------------------------------------------------------ version B: body map */

function initB(root){
  var map=$('#sg-map',root),panel=$('#sg-panel',root),body=$('#sg-pbody',root),head=$('#sg-phead',root),crumb=$('#sg-crumb',root);
  var cur={area:null,slug:null};

  /* size the label pills to their text */
  function fitLabels(){
    $$('.sg-lbl',map).forEach(function(g){
      var t=$('text',g),r=$('rect',g);if(!t||!r)return;
      try{var b=t.getBBox();r.setAttribute('x',b.x-12);r.setAttribute('y',b.y-6);r.setAttribute('width',b.width+24);r.setAttribute('height',b.height+12)}catch(e){}
    });
  }
  fitLabels();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitLabels);

  function mark(){
    $$('[data-area]',root).forEach(function(el){
      var on=el.dataset.area===cur.area;
      el.classList.toggle('on',on);
      if(el.hasAttribute('aria-pressed'))el.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  function crumbs(parts){
    crumb.innerHTML=parts.map(function(p,i){
      return i<parts.length-1?'<button type="button" data-go="'+p.go+'">'+esc(p.t)+'</button><i aria-hidden="true">›</i>':'<span>'+esc(p.t)+'</span>';
    }).join('');
    crumb.hidden=parts.length<2;
  }
  function start(){
    cur={area:null,slug:null};mark();crumbs([]);
    head.innerHTML='Where are you <em>seeing it?</em>';
    body.innerHTML='<p class="sg-lead">Pick a part of the dog, or one of these.</p><ul class="sg-alist">'+AREAS.map(function(a){
      return '<li><button type="button" class="sg-arow" data-open-area="'+a.id+'"><b>'+esc(a.name)+'</b><span>'+a.items.slice(0,2).map(function(s){return esc(s.name)}).join(' · ')+' and more</span></button></li>';
    }).join('')+'</ul>';
    setHash('');
  }
  function showArea(id,focus){
    var a=AREA[id];cur={area:id,slug:null};mark();
    crumbs([{t:'All areas',go:''},{t:a.name}]);
    head.innerHTML=esc(a.name);
    body.innerHTML='<p class="sg-lead">'+a.items.length+' symptoms. Choose the closest match.</p><ul class="sg-slist">'+a.items.map(function(s){
      return '<li><button type="button" class="sg-srow sg-u-'+s.urgency+'" data-open="'+s.slug+'"><b>'+esc(s.name)+'</b>'+pill(s.urgency)+'<span>'+esc(s.looks)+'</span></button></li>';
    }).join('')+'</ul>';
    setHash(id);
    if(focus)land();
  }
  function showSymptom(slug,focus){
    var s=BY[slug],a=AREA[s.area];cur={area:s.area,slug:slug};mark();
    crumbs([{t:'All areas',go:''},{t:a.name,go:a.id},{t:s.name}]);
    head.innerHTML=esc(s.name);
    body.innerHTML='<div class="sg-pu">'+pill(s.urgency)+'<span>'+esc(URG[s.urgency].desc)+'</span></div>'+detail(s,{h:'h3'});
    setHash(slug);
    if(focus)land();
  }
  /* on a phone the panel sits under the map: bring it into view and move focus to its heading */
  function land(){
    head.focus({preventScroll:true});
    var r=panel.getBoundingClientRect();
    if(r.top<0||r.top>window.innerHeight*.6)scrollTo(panel);
  }

  function pickArea(id){
    if(id==='behaviour-mood'||id==='whole-body'||AREA[id])showArea(id,true);
  }
  $$('.sg-hs',map).forEach(function(g){
    g.addEventListener('click',function(){pickArea(g.dataset.area)});
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pickArea(g.dataset.area)}});
  });
  root.addEventListener('click',function(e){
    var el=e.target.closest('[data-open-area],[data-open],[data-go],.sg-tile');
    if(!el||!root.contains(el))return;
    if(el.dataset.openArea)showArea(el.dataset.openArea,true);
    else if(el.dataset.open)showSymptom(el.dataset.open,true);
    else if(el.classList.contains('sg-tile'))showArea(el.dataset.area,true);
    else if(el.hasAttribute('data-go')){el.dataset.go?showArea(el.dataset.go,true):(start(),head.focus())}
  });

  /* the list fallback */
  $('#sg-azg',root).innerHTML=AREAS.map(function(a){
    return '<div class="sg-azb"><h3>'+esc(a.name)+'</h3><ul>'+a.items.map(function(s){
      return '<li><a href="#'+s.slug+'"><span class="sg-dot sg-u-'+s.urgency+'" aria-hidden="true"></span>'+esc(s.name)+'<span class="sr"> ('+URG[s.urgency].label+')</span></a></li>';
    }).join('')+'</ul></div>';
  }).join('');

  start();
  return {
    symptom:function(slug){showSymptom(slug,false);scrollTo($('#sg-bm',root));head.focus({preventScroll:true})},
    area:function(id){showArea(id,false);scrollTo($('#sg-bm',root))}
  };
}

/* ------------------------------------------------------------------ version C: urgency first */

function initC(root){
  var list=$('#sg-list',root),idx=$('#sg-idx',root),filters=$('#sg-ufil',root),group=$('#sg-grp',root),note=$('#sg-cnote',root);
  var mode='az',show={today:true,book:true,home:true};

  /* the triage question */
  var yes=$('#sg-yes',root),no=$('#sg-no',root),out=$('#sg-now',root);
  yes.addEventListener('click',function(){out.hidden=false;yes.setAttribute('aria-pressed','true');no.setAttribute('aria-pressed','false');$('h3',out).focus()});
  no.addEventListener('click',function(){out.hidden=true;no.setAttribute('aria-pressed','true');yes.setAttribute('aria-pressed','false');var h=$('#sg-list-h',root);scrollTo(h);h.focus({preventScroll:true})});

  /* counts on the traffic-light filters */
  $$('[data-u]',filters).forEach(function(b){
    var n=SYMPTOMS.filter(function(s){return s.urgency===b.dataset.u}).length;
    $('.n',b).textContent=n;
    b.addEventListener('click',function(){
      var u=b.dataset.u,on=b.getAttribute('aria-pressed')==='true';
      /* never allow all three off */
      if(on&&Object.keys(show).filter(function(k){return show[k]}).length===1)return;
      show[u]=!on;b.setAttribute('aria-pressed',show[u]?'true':'false');render(true);
    });
  });
  $$('button',group).forEach(function(b){b.addEventListener('click',function(){
    mode=b.dataset.mode;$$('button',group).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});render(true);
  })});

  var openSet={};
  function row(s){
    var on=!!openSet[s.slug];
    return '<li class="sg-row sg-u-'+s.urgency+(on?' on':'')+'" id="sg-r-'+s.slug+'" data-slug="'+s.slug+'">'+
      '<h4 class="sg-rh"><button type="button" class="sg-rbtn" aria-expanded="'+on+'" aria-controls="sg-rp-'+s.slug+'" id="sg-rb-'+s.slug+'">'+
      '<span class="sg-lamp" aria-hidden="true"></span><span class="sg-rn">'+esc(s.name)+'</span>'+
      '<span class="sg-ra">'+esc(AREA[s.area].name)+'</span>'+pill(s.urgency)+'<span class="sg-tg" aria-hidden="true"></span></button></h4>'+
      '<div class="sg-rp" id="sg-rp-'+s.slug+'" role="region" aria-labelledby="sg-rb-'+s.slug+'"'+(on?'':' hidden')+'>'+(on?detail(s,{h:'h5',vetFirst:true}):'')+'</div></li>';
  }
  function render(keepPos){
    var items=SYMPTOMS.filter(function(s){return show[s.urgency]}).sort(function(a,b){return a.name.localeCompare(b.name)});
    var groups=[];
    if(mode==='az'){
      var by={};items.forEach(function(s){var L=s.name.charAt(0).toUpperCase();(by[L]=by[L]||[]).push(s)});
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(L){groups.push({id:'sg-g-'+L.toLowerCase(),t:L,short:L,items:by[L]||[]})});
    }else{
      AREAS.forEach(function(a){groups.push({id:'sg-g-'+a.id,t:a.name,short:a.name.replace(' & ',' & '),items:items.filter(function(s){return s.area===a.id})})});
    }
    list.innerHTML=groups.filter(function(g){return g.items.length}).map(function(g){
      return '<section class="sg-grp'+(mode==='az'?' az':'')+'" id="'+g.id+'" aria-labelledby="'+g.id+'-h"><h3 id="'+g.id+'-h" tabindex="-1">'+esc(g.t)+'</h3><ul>'+g.items.map(row).join('')+'</ul></section>';
    }).join('');
    idx.className='sg-idx '+(mode==='az'?'az':'ar');
    idx.setAttribute('aria-label',mode==='az'?'Jump to a letter':'Jump to an area');
    idx.innerHTML='<ul>'+groups.map(function(g){
      return g.items.length?'<li><a href="#'+g.id+'" data-jump="'+g.id+'">'+esc(g.short)+'</a></li>':'<li><span aria-hidden="true">'+esc(g.short)+'</span></li>';
    }).join('')+'</ul>';
    var n=items.length;
    note.textContent=n===SYMPTOMS.length?'All '+n+' symptoms':'Showing '+n+' of '+SYMPTOMS.length+' symptoms';
  }
  function toggle(slug,on,push){
    var li=$('#sg-r-'+slug,list);if(!li)return;
    var b=$('.sg-rbtn',li),p=$('.sg-rp',li);
    if(on){openSet[slug]=1;if(!p.innerHTML)p.innerHTML=detail(BY[slug],{h:'h5',vetFirst:true})}else delete openSet[slug];
    b.setAttribute('aria-expanded',on?'true':'false');p.hidden=!on;li.classList.toggle('on',on);
    if(push)setHash(on?slug:'');
  }
  list.addEventListener('click',function(e){
    var b=e.target.closest('.sg-rbtn');if(!b)return;
    var li=b.closest('.sg-row');toggle(li.dataset.slug,b.getAttribute('aria-expanded')!=='true',true);
  });
  idx.addEventListener('click',function(e){
    var a=e.target.closest('[data-jump]');if(!a)return;e.preventDefault();
    var g=document.getElementById(a.dataset.jump);scrollTo(g);$('h3',g).focus({preventScroll:true});
    $$('a',idx).forEach(function(x){x.classList.toggle('on',x===a)});
  });

  /* sticky offset: on a phone the site's search strip is already stuck to the top */
  function stick(){var ms=$('#msearch');var h=ms&&getComputedStyle(ms).display!=='none'?ms.offsetHeight:0;root.style.setProperty('--sg-top',h+'px')}
  stick();window.addEventListener('resize',stick);

  render();
  function reveal(s){
    if(!show[s.urgency]){show[s.urgency]=true;$('[data-u="'+s.urgency+'"]',filters).setAttribute('aria-pressed','true');render()}
  }
  return {
    symptom:function(slug){var s=BY[slug];reveal(s);toggle(slug,true,false);var li=$('#sg-r-'+slug,list);scrollTo(li);$('.sg-rbtn',li).focus({preventScroll:true})},
    area:function(id){
      if(mode!=='area'){mode='area';$$('button',group).forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode==='area'?'true':'false')});render()}
      var g=document.getElementById('sg-g-'+id);if(g){scrollTo(g);$('h3',g).focus({preventScroll:true})}
    }
  };
}

/* ------------------------------------------------------------------ boot */

var root=document.querySelector('[data-sg]');if(!root)return;
var v=root.getAttribute('data-sg');
var api=v==='a'?initA(root):v==='b'?initB(root):initC(root);

/* shared bits: the emergency list and the counts */
$$('[data-sg-emergency]').forEach(function(ul){ul.innerHTML=EMERGENCY.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')});
$$('[data-sg-count]').forEach(function(el){el.textContent=SYMPTOMS.length});

function route(){
  var h='';try{h=decodeURIComponent(location.hash.slice(1))}catch(e){}
  if(BY[h])api.symptom(h);else if(AREA[h])api.area(h);
}
window.addEventListener('hashchange',route);
if(location.hash)setTimeout(route,0);

window.PPSymptoms={areas:AREAS,symptoms:SYMPTOMS,urgency:URG,emergency:EMERGENCY};
})();
