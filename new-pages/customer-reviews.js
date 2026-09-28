/* ==========================================================================
   Customer reviews: data. Shared by customer-reviews-a/b/c.html.

   WHERE THIS CAME FROM (pulled 28 Sep 2026)
   The Shopify Admin API (store "Poorly Pet", www.poorly-pet.com). Judge.me writes
   its widget data into metafields, and that is what these arrays are:
     - shop.metafields.judgeme.all_reviews_widget_v2025_data  (summary, histogram)
     - shop.metafields.judgeme.reviews_grid                   (latest 25 + featured)
     - product.metafields.judgeme.review_widget_data          (first 5 reviews of each product)
     - product.metafields.reviews.rating / rating_count       (per product stats)
   plus three reviews of the 4-11kg wheelchair that were on the signed-off product
   page but are past Judge.me's first page of five in the metafield.
   Text is verbatim (HTML entities decoded; two emoji removed to match site style).
   Judge.me reports 101 reviews in total; 83 of them are here.

   LIVE DATA: PLUG JUDGE.ME IN HERE
   Shape follows Judge.me's widget JSON (rating, title, body, reviewer_name,
   created_at, verified_buyer, product_title, product_handle). To go live, replace
   the literal arrays below with the real feed and nothing else has to change:
     a) In the Shopify theme (preferred, no token in the browser):
        <script type="application/json" id="jdgm-data">
          {{ shop.metafields.judgeme.all_reviews_widget_v2025_data | json }}
        </script>
        then CR_DATA.reviews = JSON.parse(document.getElementById('jdgm-data').textContent).all_reviews
        (paginate with Judge.me's widget endpoint for pages after the first).
     b) Or server side: GET https://judge.me/api/v1/reviews?shop_domain=<store>.myshopify.com
        &api_token=<PRIVATE token, never in the page>&per_page=100&page=1
     Per product: product.metafields.judgeme.review_widget_data (reviews + histogram).
   ========================================================================== */
window.CR_DATA={
  /* Judge.me all-reviews summary, real figures from the metafield */
  summary:{average_rating:4.61,number_of_reviews:101,number_of_product_reviews:100,number_of_shop_reviews:1,
    histogram:{5:71,4:22,3:7,2:1,1:0},updated_at:"2026-09-24"},
  categories:["Mobility & recovery aids","Supplements & health","Recovery & first aid","Food, treats & toppers","Shampoo & grooming","Skin, ear & eye care","Dental care","Calming & enrichment","Beds & comfort","Flea, tick & worming","Walking & out and about","Condition bundles"],
  /* Judge.me per-product stats (product.metafields.judgeme.review_widget_data), keyed by handle */
  productStats:{"2-in-1-dog-shampoo-conditioner-with-lavender-jojoba":{"avg":4.33,"count":3,"histogram":[1,2,0,0,0]},"antiseptic-skin-wound-healing-spray-for-dogs-250ml":{"avg":3.5,"count":2,"histogram":[0,1,1,0,0]},"chicken-bone-broth-powder-for-dogs-gravy-food-topper":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"calming-salmon-oil-blend-for-dogs-cats-300ml":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"apple-cider-vinegar-supplement-for-dogs-500ml":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"flagline-lightweight-dog-harness-with-handle-3-clip-points":{"avg":4.5,"count":2,"histogram":[1,1,0,0,0]},"dog-elbow-pads-support-brace-for-hygromas-dysplasia":{"avg":4.0,"count":1,"histogram":[0,1,0,0,0]},"self-heating-pet-pad-no-electricity-needed-48x38cm":{"avg":4.71,"count":7,"histogram":[6,0,1,0,0]},"joint-care-chews-for-dogs-chews-with-glucosamine-turmeric":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"oatmeal-dog-shampoo-for-sensitive-skin-500ml":{"avg":4.0,"count":1,"histogram":[0,1,0,0,0]},"msm-powder-for-dogs-cats-joint-coat-support-300g":{"avg":4.89,"count":9,"histogram":[8,1,0,0,0]},"100-natural-chicken-nibbles-for-dogs-cats-100g":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"knee-brace-for-dogs-joint-support-injury-recovery":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"pumpkin-puree-powder-for-dogs-30-servings":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"pawprint-cohesive-bandage-for-pets-self-adhesive-vetwrap":{"avg":5.0,"count":2,"histogram":[2,0,0,0,0]},"henry-wag-microfibre-dog-drying-bag":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"adjustable-dog-wheelchair-for-dogs-under-4kg":{"avg":4.83,"count":6,"histogram":[5,1,0,0,0]},"adjustable-dog-wheelchair-for-dogs-between-4-11kg":{"avg":4.12,"count":8,"histogram":[5,0,2,1,0]},"adjustable-dog-wheelchair-for-dogs-between-11-35kg":{"avg":5.0,"count":6,"histogram":[6,0,0,0,0]},"adjustable-dog-wheelchair-for-dogs-over-35kg":{"avg":4.8,"count":5,"histogram":[4,1,0,0,0]},"arthritis-bundle":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"anxiety-bundle":{"avg":4.0,"count":3,"histogram":[1,1,1,0,0]},"back-pain-bundle":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"ivdd-bundle":{"avg":4.0,"count":1,"histogram":[0,1,0,0,0]},"knuckling-bundle":{"avg":4.0,"count":1,"histogram":[0,1,0,0,0]},"dental-bundle":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"burgess-sensitive-lamb-rice-dry-dog-food-12-5kg":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]},"earth-rated-dog-3-in-1-shampoo-short-hair-coat":{"avg":4.0,"count":1,"histogram":[0,1,0,0,0]},"george-barclay-climacool-dog-cooling-jacket":{"avg":3.0,"count":1,"histogram":[0,0,1,0,0]},"freedomroll-adjustable-dog-wheelchair-mobility-support":{"avg":4.79,"count":19,"histogram":[16,2,1,0,0]},"100-natural-coconut-oil-for-dogs":{"avg":5.0,"count":1,"histogram":[1,0,0,0,0]}},
  /* Every active product in the Shopify catalogue: [title, handle, category]. Feeds the "which product" search. */
  catalogue:[["100% Natural Chicken Nibbles for Dogs & Cats | 100g","100-natural-chicken-nibbles-for-dogs-cats-100g","Food, treats & toppers"],["100% Natural Coconut Oil for Dogs","100-natural-coconut-oil-for-dogs","Supplements & health"],["100% Natural Peanut Butter for Dogs","100-natural-peanut-butter-for-dogs","Food, treats & toppers"],["100% Natural Pumpkin Powder for Dogs & Cats - 250g","100-natural-pumpkin-powder-for-dogs-cats-250g","Supplements & health"],["100% Natural Scottish Salmon Oil for Dogs & Cats","100-natural-scottish-salmon-oil-for-dogs-cats-500ml","Supplements & health"],["100% Natural Turkey Nibbles for Dogs & Cats | 100g","100-natural-turkey-nibbles-for-dogs-cats-100g","Food, treats & toppers"],["2-in-1 Detangler & Leave in Conditioner with Raspberry & Lemon for Dogs","2-in-1-detangler-leave-in-conditioner-with-raspberry-lemon-for-dogs","Shampoo & grooming"],["2-in-1 Dog Shampoo & Conditioner with Lavender & Jojoba","2-in-1-dog-shampoo-conditioner-with-lavender-jojoba","Shampoo & grooming"],["21 in 1 Multifunctional Supplement Chews for Dogs","21-in-1-multifunctional-supplement-chews-for-dogs","Supplements & health"],["3 in 1 Raspberry & Lemon Dog Shampoo, Conditioner & Detangler","3-in-1-raspberry-lemon-dog-shampoo-conditioner-detangler","Shampoo & grooming"],["Abdominal Support Sling for Dogs with Reduced Mobility","abdominal-support-sling-for-dogs-with-reduced-mobility","Mobility & recovery aids"],["Adjustable Dog Wheelchair - For Dogs Between 11-35kg","adjustable-dog-wheelchair-for-dogs-between-11-35kg","Mobility & recovery aids"],["Adjustable Dog Wheelchair - For Dogs Between 4-11kg","adjustable-dog-wheelchair-for-dogs-between-4-11kg","Mobility & recovery aids"],["Adjustable Dog Wheelchair - For Dogs Over 35kg","adjustable-dog-wheelchair-for-dogs-over-35kg","Mobility & recovery aids"],["Adjustable Dog Wheelchair - For Dogs Under 4kg","adjustable-dog-wheelchair-for-dogs-under-4kg","Mobility & recovery aids"],["Adjustable Double Diner Bowl Set with Slow Feeder for Dogs","adjustable-double-diner-bowl-set-with-slow-feeder-for-dogs","Food, treats & toppers"],["Adjustable Wooden Dog & Cat Ramp - 3 Sizes, 6 Heights","adjustable-wooden-dog-cat-ramp-3-sizes-6-heights","Mobility & recovery aids"],["All Natural Antibacterial Botanical Toothpaste for Dogs","all-natural-antibacterial-botanical-toothpaste-for-dogs","Dental care"],["All Natural Chicken Flavour Seaweed Dental Sticks for Dogs","all-natural-chicken-flavour-seaweed-dental-sticks-for-dogs","Dental care"],["Aloe & Kiwi Soothing Dog Shampoo","aloe-kiwi-soothing-dog-shampoo","Shampoo & grooming"],["Aloe Vera Soothing Gel for Pets","aloe-vera-soothing-gel-for-pets","Skin, ear & eye care"],["Anal Gland Supplement Chews for Dogs","anal-gland-supplement-chews-for-dogs","Supplements & health"],["Animonda Integra Protect Intestinal Dry Dog Food 4kg","animonda-integra-protect-intestinal-dry-dog-food-4kg","Food, treats & toppers"],["Anti-Anxiety Donut Dog Bed","anti-anxiety-donut-dog-bed-pink","Beds & comfort"],["Anti-Plaque Dental Rinse for Cats & Dogs - 250ml","anti-plaque-dental-rinse-for-cats-dogs","Dental care"],["Antibacterial Itch Relief Spray for Dogs - 250ml","antibacterial-itch-relief-spray-for-dogs-250ml","Skin, ear & eye care"],["Antiseptic Dental Spray for Pets 200ml","antiseptic-dental-spray-for-pets-200ml","Dental care"],["Antiseptic First Aid Wound & Skin Spray for Pets 200ml","antiseptic-first-aid-wound-skin-spray-for-pets-200ml","Recovery & first aid"],["Antiseptic Flea & Tick Relief Spray for Dogs 200ml","antiseptic-flea-tick-relief-spray-for-dogs-200ml","Flea, tick & worming"],["Antiseptic Itchy Skin & Hot Spot Relief Spray 200ml","antiseptic-itchy-skin-hot-spot-relief-spray-200ml","Skin, ear & eye care"],["Antiseptic Skin & Wound Healing Spray for Dogs 250ml","antiseptic-skin-wound-healing-spray-for-dogs-250ml","Recovery & first aid"],["Anxiety Bundle","anxiety-bundle","Condition bundles"],["Apple Cider Vinegar Supplement for Dogs 500ml","apple-cider-vinegar-supplement-for-dogs-500ml","Supplements & health"],["Aqueos Anti-Bacterial/Anti-Itch Dog Shampoo","aqueos-anti-bacterialanti-itch-dog-shampoo","Shampoo & grooming"],["Aqueos Antibacterial Canine Liquid Soap 600ml","aqueos-antibacterial-canine-liquid-soap-600ml","Recovery & first aid"],["Aqueos Blood Stop Powder For Pets (30g)","aqueos-blood-stop-powder-for-pets-30g","Recovery & first aid"],["Aqueos Canine Disinfectant & Deodoriser 200ml","aqueos-canine-disinfectant-deodoriser-200ml","Recovery & first aid"],["Aqueos Canine Disinfectant & Deodoriser Spray 750ml","aqueos-canine-disinfectant-deodoriser-spray-750ml","Recovery & first aid"],["Aqueos Disinfectant Wipes for Dogs & Owners (Jumbo Tub)","aqueos-disinfectant-wipes-for-dogs-owners-jumbo-tub","Recovery & first aid"],["Aqueos Quick Wash, No Rinse Anti-Bacterial Dog Shampoo or Face Wash","aqueos-quick-wash-no-rinse-anti-bacterial-dog-shampoo-or-face-wash","Shampoo & grooming"],["Aqueos Super Soft Disinfectant Wipes Tub For Dogs","aqueos-super-soft-disinfectant-wipes-tub-for-dogs","Recovery & first aid"],["Aqueos Weekly Deep Clean Disinfectant & Sanitising Fogger","aqueos-weekly-deep-clean-disinfectant-sanitising-fogger","Recovery & first aid"],["Arthritis Bundle","arthritis-bundle","Condition bundles"],["B-Calm CBD Calming Pet Bedding Spray 100ml","b-calm-cbd-calming-pet-bedding-spray-100ml","Calming & enrichment"],["B-Calm CBD Calming Pet Bedding Spray 30ml","b-calm-cbd-calming-pet-bedding-spray-30ml","Calming & enrichment"],["Baby Fresh Detangling Spray for Dogs","baby-fresh-detangling-spray-for-dogs","Shampoo & grooming"],["Baby Fresh Dog Conditioner","baby-fresh-dog-conditioner","Shampoo & grooming"],["Baby Fresh Dog Shampoo","baby-fresh-dog-shampoo","Shampoo & grooming"],["Baby Fresh Dog Shampoo & Cologne Gift Set","baby-fresh-dog-shampoo-cologne-gift-set","Condition bundles"],["Baby Fresh Dry Shampoo for Dogs","baby-fresh-dry-shampoo-for-dogs","Shampoo & grooming"],["Baby Powder Scented Grooming Wipes for Dogs - 100 Pack","baby-powder-scented-grooming-wipes-for-dogs-100-pack","Shampoo & grooming"],["Back Pain Bundle","back-pain-bundle","Condition bundles"],["Balto Link - Rear Legs Control","balto-link-rear-legs-control","Mobility & recovery aids"],["Balto® Body Lift – Body Harness with Handles","balto-body-lift","Mobility & recovery aids"],["Balto® Bone – Fracture Brace","balto-bone","Mobility & recovery aids"],["Balto® Flexor - Adjustable Hock Brace","balto-flexor-adjustable-hock-brace","Mobility & recovery aids"],["Balto® Hock – Hock Brace","balto-hock","Mobility & recovery aids"],["Balto® Joint – Carpal Compression Band","balto-joint","Mobility & recovery aids"],["Balto® Jump – Knee Brace","balto-jump","Mobility & recovery aids"],["Balto® Life – Hip Dysplasia Brace","balto-life","Mobility & recovery aids"],["Balto® Ligatek – Adjustable Hinged Knee Brace","balto-ligatek","Mobility & recovery aids"],["Balto® Lux – Shoulder Brace","balto-lux","Mobility & recovery aids"],["Balto® Neck Eco – E-Collar Alternative","balto-neck-eco","Recovery & first aid"],["Balto® Neck – Rigid Neck Brace","balto-neck","Mobility & recovery aids"],["Balto® Pull – Brace for Hyperflexion Phalanges","balto-pull","Mobility & recovery aids"],["Balto® Soft Plus – Double Elbow Brace","balto-soft-plus","Mobility & recovery aids"],["Balto® Soft – Elbow Brace","balto-soft","Mobility & recovery aids"],["Balto® Splint – Carpal/Metatarsal Laxity Splint","balto-splint","Mobility & recovery aids"],["Balto® Up – Rear Harness Support","balto-up","Mobility & recovery aids"],["Beef Bone Broth for Dogs - Gravy Food Topper","beef-bone-broth-for-dogs-gravy-food-topper","Supplements & health"],["Beef Bone Broth Powder for Dogs & Cats — 250ml","beef-bone-broth-powder-for-dogs-cats-250ml","Supplements & health"],["Best in Breed Dog Shampoo","best-in-breed-dog-shampoo","Shampoo & grooming"],["Biko Brace - Walking Aid for Ataxia & Degenerative Myelopathy","biko-brace-walking-aid-for-ataxia-degenerative-myelopathy","Mobility & recovery aids"],["Black Cherry Dog Conditioner 500ml","black-cherry-dog-conditioner-500ml","Shampoo & grooming"],["Blueberry Spa™ Facial Wash for Dogs","blueberry-spatm-facial-wash-for-dogs","Shampoo & grooming"],["Blueberry Spa™ No Rinse Facial Wash & Shampoo with Blueberry & Colloidal Oatmeal for Dogs","blueberry-spatm-no-rinse-facial-wash-shampoo-with-blueberry-colloidal-oatmeal-for-dogs","Shampoo & grooming"],["Bug Off Natural Shampoo Bar & Balm for Dogs","bug-off-natural-shampoo-bar-balm-for-dogs","Shampoo & grooming"],["Burgess Sensitive Lamb & Rice Dry Dog Food 12.5kg","burgess-sensitive-lamb-rice-dry-dog-food-12-5kg","Food, treats & toppers"],["Burgess Sensitive Salmon & Rice Dry Dog Food 12.5kg","burgess-sensitive-salmon-rice-dry-dog-food-12-5kg","Food, treats & toppers"],["Burgess Sensitive Turkey & Rice Dry Dog Food 12.5kg","burgess-sensitive-turkey-rice-dry-dog-food-12-5kg","Food, treats & toppers"],["Calibra Crunchy Gastrointestinal Support Dog Snack 120g","calibra-vd-dog-crunchy-snack-gastrointestinal-120g","Food, treats & toppers"],["Calibra Expert Nutrition Mobility Dog Food","calibra-dog-expert-nutrition-mobility","Food, treats & toppers"],["Calibra Gastrointestinal & Pancreas Support Low Fat Dog Food","calibra-vd-dog-gastrointestinal-pancreas-low-fat","Food, treats & toppers"],["Calibra Gastrointestinal Pancreas Support Dog Food","calibra-vd-dog-gastrointestinal-pancreas","Food, treats & toppers"],["Calibra Hypoallergenic Rabbit & Insect Dog Food 6x400g","calibra-vd-dog-hypoallergenic-rabbit-insect-6x400g","Food, treats & toppers"],["Calibra Hypoallergenic Salmon & Insect Wet Dog Food 6x400g","calibra-vd-dog-hypoallergenic-salmon-insect-6x400g","Food, treats & toppers"],["Calibra Hypoallergenic Skin & Coat Support Dog Food","calibra-vd-dog-hypoallergenic-skin-coat-support","Food, treats & toppers"],["Calibra Joint & Mobility Dog Food","calibra-vd-dog-joint-mobility","Food, treats & toppers"],["Calibra Joint & Mobility Low Calorie Dog Food","calibra-vd-dog-joint-mobility-low-calorie","Food, treats & toppers"],["Calibra Oral Care Expert Nutrition Dog Food","calibra-dog-expert-nutrition-oral-care","Food, treats & toppers"],["Calibra Renal & Cardiac Support Dry Dog Food","calibra-vd-dog-renal-cardiac","Food, treats & toppers"],["Calibra Renal Support Wet Dog Food 6x400g Cans","calibra-vd-dog-renal-can-6x400g","Food, treats & toppers"],["Calibra Semi Moist Hypoallergenic Dog Snack 120g","calibra-vd-dog-semi-moist-snack-hypoallergenic-120g","Food, treats & toppers"],["Calibra Semi Moist Mobility Support Dog Snack 120g","calibra-vd-dog-semi-moist-snack-mobility-support-120g","Food, treats & toppers"],["Calibra Ultra Hypoallergenic Insect Dog Food","calibra-vd-dog-ultra-hypoallergenic-insect","Food, treats & toppers"],["Calibra Veterinary Diet Diabetes & Obesity Dry Dog Food","veterinary-diet-diabetes-obesity-dry-dog-food","Food, treats & toppers"],["Calibra Weight Management Crunchy Dog Snack 120g","calibra-vd-dog-crunchy-snack-weight-management-120g","Food, treats & toppers"],["Calming Aid Probiotic Powder for Dogs & Cats","calming-aid-probiotic-powder-for-dogs-cats","Supplements & health"],["Calming Drops for Dogs - Natural Anxiety Relief (200ml)","calming-drops-for-dogs-natural-anxiety-relief-200ml","Supplements & health"],["Calming Hemp Oil for Dogs & Cats - 300ml","calming-hemp-oil-for-dogs-cats-300ml-1","Supplements & health"],["Calming Salmon Oil Blend for Dogs & Cats (300ml)","calming-salmon-oil-blend-for-dogs-cats-300ml","Supplements & health"],["Calming Spray for Dogs - Lavender Stress & Anxiety Relief (250ml)","calming-spray-for-dogs-lavender-stress-anxiety-relief-250ml","Calming & enrichment"],["Calming SuperChews for Anxious Dogs - Natural Soft Chews","calming-superchews-for-anxious-dogs-natural-soft-chews","Supplements & health"],["Calming Supplement Chews for Dogs","calming-supplement-chews-for-dogs","Supplements & health"],["Canine Prime 40-in-1 Daily Superfood Supplement for Dogs","canine-prime-40-in-1-daily-superfood-supplement-for-dogs","Supplements & health"],["Carpal Brace for Dogs - Adjustable Immobilisation Support","carpal-brace-for-dogs-adjustable-immobilisation-support","Mobility & recovery aids"],["Carpal Hyperextension Bundle","carpal-hyperextension-bundle","Condition bundles"],["Carpal Splint for Dogs - Wrist Joint Immobilisation","carpal-splint-for-dogs-wrist-joint-immobilisation","Mobility & recovery aids"],["Cervical Immobiliser Collar for Dogs - Cone Alternative","cervical-immobiliser-collar-for-dogs-cone-alternative","Walking & out and about"],["Chew Bars with Turmeric for Dogs - Natural Himalayan Cheese","chew-bars-with-turmeric-for-dogs-natural-himalayan-cheese","Food, treats & toppers"],["Chicken Bone Broth Powder for Dogs | Gravy Food Topper","chicken-bone-broth-powder-for-dogs-gravy-food-topper","Supplements & health"],["Classic Copper Body Shirt for Dogs & Cats - Post-Op Recovery","classic-copper-body-shirt-for-dogs-cats-post-op-recovery","Recovery & first aid"],["Cloud Inflatable Recovery Collar for Dogs","cloud-inflatable-recovery-collar-for-dogs","Recovery & first aid"],["Cold Pressed Organic Coconut Oil for Dogs 340g","cold-pressed-organic-coconut-oil-for-dogs-340g","Supplements & health"],["Collagen Powder for Dogs & Cats - Joint, Tendon & Coat Support 250g","collagen-powder-for-dogs-cats-joint-tendon-coat-support-250g","Supplements & health"],["Colloidal silver spray 20ppm / 50ml Bottle","colloidal-silver-spray-20ppm-50ml-bottle","Shampoo & grooming"],["Cooling Mat for Dogs","cooling-mat-for-dogs","Beds & comfort"],["Copper-Infused Front Legs Recovery Body Shirt for Dogs","copper-infused-front-legs-recovery-body-shirt-for-dogs","Recovery & first aid"],["Cruciate Ligament Bundle","cruciate-ligament-bundle","Condition bundles"],["Daily Calming Salmon Oil for Dogs & Cats - 300ml","daily-calming-salmon-oil-for-dogs-cats-300ml","Supplements & health"],["Daily Joint Salmon Oil for Dogs & Cats - 300ml","daily-joint-salmon-oil-for-dogs-cats-300ml","Supplements & health"],["Daily Spritz, Natural Deodorising & Detangling Spray for Dogs","daily-spritz-natural-deodorising-detangling-spray-for-dogs","Shampoo & grooming"],["Danish Design Crate Bumper - Olive","danish-design-crate-bumper-olive","Beds & comfort"],["Danish Design Crate Mattress - Olive","danish-design-crate-mattress-olive","Beds & comfort"],["Danish Design Elden Deluxe Slumber Bed - Fern","danish-design-elden-deluxe-slumber-bed-fern","Beds & comfort"],["Danish Design Elden Deluxe Slumber Bed - Rust","danish-design-elden-deluxe-slumber-bed-rust","Beds & comfort"],["Danish Design Elden Deluxe Slumber Bed - Stone","danish-design-elden-deluxe-slumber-bed-stone","Beds & comfort"],["Danish Design Green Fleece Herringbone Quilted Mattress","danish-design-green-fleece-herringbone-quilted-mattress","Beds & comfort"],["Dental Bundle","dental-bundle","Condition bundles"],["Dental Cleaning Wipes for Dogs - 50 Wipes per Pack","dental-cleaning-wipes-for-dogs-50-wipes-per-pack","Dental care"],["Dental Gel for Dogs 100ml - Plaque & Gum Care","dental-gel-for-dogs-100ml-plaque-gum-care","Dental care"],["Dental Water Additive for Dogs - Fights Bad Breath & Plaque","dental-water-additive-for-dogs-fights-bad-breath-plaque","Dental care"],["Digestive Bundle","digestive-bundle","Condition bundles"],["Digestive Chews for Dogs - 140 Chews, 30 Billion CFU Pre & Probiotics","digestive-chews-for-dogs-140-chews-30-billion-cfu-pre-probiotics","Supplements & health"],["Digestive Supplement Soft Chews for Dogs - 120 Chews","digestive-supplement-soft-chews-for-dogs-120-chews","Supplements & health"],["Dog Carpal Wrap for Wrist Support & Joint Protection","dog-carpal-wrap-for-wrist-support-joint-protection","Mobility & recovery aids"],["Dog Conditioner for All Coat Types, Softening & Detangling Support","dog-conditioner-for-all-coat-types-softening-detangling-support","Shampoo & grooming"],["Dog Elbow Pads - Support Brace for Hygromas & Dysplasia","dog-elbow-pads-support-brace-for-hygromas-dysplasia","Mobility & recovery aids"],["Dog First Aid Antiseptic Spray 250ml - Hypochlorous Formula","dog-first-aid-antiseptic-spray-250ml-hypochlorous-formula","Recovery & first aid"],["Dog Itch & Allergy Relief Drops 200ml","dog-itch-allergy-relief-drops-200ml","Supplements & health"],["Dog Paw Cleaner - Henry Wag","dog-paw-cleaner-henry-wag","Shampoo & grooming"],["Dog Skin Itch Relief Balm - Natural & Organic, 60ml","dog-skin-itch-relief-balm-natural-organic-60ml","Skin, ear & eye care"],["Dog Toothbrush & Toothpaste Dental Kit - Triple-Head Brush","dog-toothbrush-toothpaste-dental-kit-triple-head-brush","Dental care"],["DogMaze Mini Slow Feeder Bowl for Dogs - Black","dogmaze-mini-slow-feeder-bowl-for-dogs-black","Food, treats & toppers"],["Dogslife First Aid Kit","dogslife-first-aid-kit","Recovery & first aid"],["Double Front Leg Sleeve Recovery Shirt for Dogs","double-front-leg-sleeve-recovery-shirt-for-dogs","Recovery & first aid"],["Dr John Hypoallergenic Chicken & Oats Dry Dog Food 12.5kg","dr-john-hypoallergenic-chicken-oats-dry-dog-food-12-5kg","Food, treats & toppers"],["Dr John Hypoallergenic Lamb & Rice Dry Dog Food 12.5kg","dr-john-hypoallergenic-lamb-rice-dry-dog-food-12-5kg","Food, treats & toppers"],["Drag Bag for Paralysed & Disabled Dogs","drag-bag-for-paralysed-disabled-dogs","Mobility & recovery aids"],["Dual Sided Silicone Slow Feeder & Lick Mat Bowl for Dogs","dual-sided-silicone-slow-feeder-lick-mat-bowl-for-dogs","Food, treats & toppers"],["Ear Cover for Dogs & Cats - Post-Op & Wound Protection","ear-cover-for-dogs-cats-post-op-wound-protection","Recovery & first aid"],["Ear Infections Bundle","ear-infections-bundle","Condition bundles"],["Earth Rated Dog 3-in-1 Shampoo Short Hair Coat","earth-rated-dog-3-in-1-shampoo-short-hair-coat","Shampoo & grooming"],["Earth Rated Dog Ear Wipes Oatmeal Scent","earth-rated-dog-ear-wipes-oatmeal-scent-1x60","Shampoo & grooming"],["Earth Rated Dog No Rinse Shampoo with White Tea and Basil Scent","earth-rated-dog-no-rinse-shampoo-with-white-tea-and-basil-scent","Shampoo & grooming"],["Elbow Brace for Dogs - Joint Support & Post-Surgery Aid","elbow-brace-for-dogs-joint-support-post-surgery-aid","Mobility & recovery aids"],["Elbow Dysplasia Bundle","elbow-dysplasia-bundle","Condition bundles"],["Elizabethan Smart Recovery Collar for Pets - 7 Sizes","elizabethan-smart-recovery-collar-for-pets-7-sizes","Recovery & first aid"],["Epilepsy Support Tincture for Dogs, Specialist Herbal Support Blend","epilepsy-support-tincture-for-dogs-specialist-herbal-support-blend","Supplements & health"],["EZ Soft Recovery Collar with Flexstay Technology","ez-soft-recovery-collar-with-flexstay-technology","Recovery & first aid"],["Fibre Complex, Daily Fibre Support for Digestion & Anal Glands","fibre-complex-daily-fibre-support-for-digestion-anal-glands","Supplements & health"],["Fiprotec Small Dog Spot-On Flea & Tick Treatment","fiprotec-small-dog-spot-on-flea-tick-treatment","Flea, tick & worming"],["Flagline Lightweight Dog Harness with Handle & 3 Clip Points","flagline-lightweight-dog-harness-with-handle-3-clip-points","Walking & out and about"],["Flea and Tick Dog Shampoo with Neem Oil","flea-and-tick-dog-shampoo-with-neem-oil","Shampoo & grooming"],["Flea Free Drops for Dogs, Natural Topical Flea & Tick Repellent","flea-free-drops-for-dogs-natural-topical-flea-tick-repellent","Flea, tick & worming"],["Flea Free Pet Spray, Natural Herbal Support for Fleas","flea-free-pet-spray-natural-herbal-support-for-fleas","Flea, tick & worming"],["Flea Shampoo for Dogs, Natural Herbal Cleansing Shampoo with Neem","flea-shampoo-for-dogs-natural-herbal-cleansing-shampoo-with-neem","Flea, tick & worming"],["Flexi Protect Joint Support Soft Chews for Dogs","flexi-protect-joint-support-soft-chews-for-dogs","Supplements & health"],["Float Coat Dog Life Jacket for Water Safety & Hydrotherapy","float-coat-dog-life-jacket-for-water-safety-hydrotherapy","Walking & out and about"],["Foldable Fabric Pet Crate & Carrier","foldable-fabric-pet-crate-carrier","Walking & out and about"],["Fragrance Free Hydrating Detangling Spray for Dogs","fragrance-free-hydrating-detangling-spray-for-dogs","Shampoo & grooming"],["FreedomRoll Adjustable Dog Wheelchair - Mobility Support","freedomroll-adjustable-dog-wheelchair-mobility-support","Mobility & recovery aids"],["Front Leg Splint for Dogs - Fractures & Carpal Injuries","front-leg-splint-for-dogs-fractures-carpal-injuries","Mobility & recovery aids"],["Full Body Support Harness for Dogs - Post-Op & Mobility Aid","full-body-support-harness-for-dogs-post-op-mobility-aid","Walking & out and about"],["George Barclay ClimaCOOL Dog Cooling Jacket","george-barclay-climacool-dog-cooling-jacket","Beds & comfort"],["Goats Milk Powder for Dogs & Cats 250g - 100% Natural","goats-milk-powder-for-dogs-cats-250g-100-natural","Supplements & health"],["GoGo Motion Joint Care for Dogs - Chicken Flavour 300g","gogo-motion-joint-care-for-dogs-chicken-flavour-300g","Supplements & health"],["Grass Green Supplement Chews for Dogs","grass-green-supplement-chews-for-dogs","Supplements & health"],["Green House Flea Spray 400ml","green-house-flea-spray-6x400ml","Flea, tick & worming"],["Green Lipped Mussel Powder for Dogs & Cats | 80 Servings","green-lipped-mussel-powder-for-dogs-cats-80-serving","Supplements & health"],["Grip Trex Outdoor Dog Boots with Vibram Sole (Set of 2)","grip-trex-outdoor-dog-boots-with-vibram-sole","Walking & out and about"],["Grooming Dog Wipes 100 Pack - Unscented & Compostable","grooming-dog-wipes-100-pack-unscented-compostable","Shampoo & grooming"],["Guardian Home Flea Spray 500ml","guardian-home-flea-spray-6x500ml","Flea, tick & worming"],["Gut Health Powder Supplement for Dogs - 100g","gut-health-powder-supplement-for-dogs-100g","Supplements & health"],["Handmade Himalayan Cheese Bones 100% Natural Treat for Dogs","handmade-himalayan-cheese-bones-100-natural-treat-for-dogs","Food, treats & toppers"],["Handmade Himalayan Cheese Popcorn Bites for Dogs","handmade-himalayan-cheese-popcorn-bites-for-dogs","Food, treats & toppers"],["Hemp Seed Oil for Dogs - Natural Calming & Coat Support","hemp-seed-oil-for-dogs-natural-calming-coat-support","Supplements & health"],["Henry Wag Dog Cleaning Towel","henry-wag-dog-cleaning-towel","Shampoo & grooming"],["Henry Wag Dog Cooling Mat","pet-cool-mat","Beds & comfort"],["Henry Wag Folding Fabric Travel Crate","folding-fabric-travel-crate","Walking & out and about"],["Henry Wag Microfibre Dog Drying Bag","henry-wag-microfibre-dog-drying-bag","Shampoo & grooming"],["Henry Wag Microfibre Drying Coat","henry-wag-microfibre-drying-coat","Shampoo & grooming"],["Henry Wag Noodle Glove Drying Towel","henry-wag-noodle-glove-drying-towel","Shampoo & grooming"],["Henry Wag Pet Towel Glove","henry-wag-pet-towel-glove","Shampoo & grooming"],["Henry Wag Refresh Drying Coat","henry-wag-refresh-drying-coat","Shampoo & grooming"],["Himalayan Cheese Topper Natural Protein Supplement for Dogs","himalayan-cheese-topper-natural-protein-supplement-for-dogs","Supplements & health"],["Hind Leg Recovery Shirt for Dogs & Cats - Two-Sleeve","hind-leg-recovery-shirt-for-dogs-cats-two-sleeve","Recovery & first aid"],["Hind Legs Copper Body Shirt for Post-Op & Wound Care","hind-legs-copper-body-shirt-for-post-op-wound-care","Recovery & first aid"],["Hip & Joint Supplement Chews for Dogs","hip-joint-supplement-chews-for-dogs","Supplements & health"],["Hip Brace for Dogs with Dysplasia & Arthritis","hip-brace-for-dogs-with-dysplasia-arthritis","Mobility & recovery aids"],["Hip Dysplasia Bundle","hip-dysplasia-bundle","Condition bundles"],["Hock & Achilles Bundle","hock-achilles-bundle","Condition bundles"],["Hock Splint Brace for Dogs - Tarsus Support & Stabiliser","hock-splint-brace-for-dogs-tarsus-support-stabiliser","Mobility & recovery aids"],["Hock Splint for Dogs - Tarsal Joint Immobiliser","hock-splint-for-dogs-tarsal-joint-immobiliser","Mobility & recovery aids"],["Hock Wrap Brace for Dogs - Tarsal Joint Support","hock-wrap-brace-for-dogs-tarsal-joint-support","Mobility & recovery aids"],["Hot Spot & Itch Relief Spray for Dogs 250ml","hot-spot-itch-relief-spray-for-dogs-250ml","Recovery & first aid"],["Hot Spots Bundle","hot-spots-bundle","Condition bundles"],["Hydrotherapy Bundle","hydrotherapy-bundle","Condition bundles"],["Inflatable Recovery Collar for Dogs","inflatable-recovery-collar-for-dogs-nylon-blue-xxl","Recovery & first aid"],["Instant Ice Pack - No-Freeze Emergency Cold Therapy","instant-ice-pack-no-freeze-emergency-cold-therapy","Recovery & first aid"],["Itch & Immunity Supplement Chews for Dogs","itch-immunity-supplement-chews-for-dogs","Supplements & health"],["Itch + Immunity No Rinse Paw Cleaner for Dogs","itch-immunity-no-rinse-paw-cleaner-for-dogs","Shampoo & grooming"],["Itch + Immunity No Rinse Shampoo for Dogs","itch-immunity-no-rinse-shampoo-for-dogs","Shampoo & grooming"],["Itch + Immunity Shampoo for Dogs","itch-immunity-shampoo-for-dogs","Shampoo & grooming"],["Itch + Immunity Skin + Ear Pads for Dogs","itch-immunity-skin-ear-pads-for-dogs","Shampoo & grooming"],["Itch + Immunity Skin Spray for Dogs","itch-immunity-skin-spray-for-dogs","Shampoo & grooming"],["Itch Relief Chews for Dogs - Skin & Allergy Support","itch-relief-chews-for-dogs-skin-allergy-support","Supplements & health"],["Itch Relief Supplement for Dogs - 120 Chews","itch-relief-supplement-for-dogs-120-chews","Supplements & health"],["Itchy Skin Bundle","itchy-skin-bundle","Condition bundles"],["IVDD Bundle","ivdd-bundle","Condition bundles"],["Johnsons Stool Firmer For Dogs","johnsons-stool-firmer-for-dogs-1x6","Supplements & health"],["Johnsons Stool-Eze For Dogs","johnsons-stool-eze-for-dogs-1x6","Supplements & health"],["Johnsons Sweet Breath Tablets For Dogs and Cats 1x6","johnsons-sweet-breath-tablets-for-dogs-and-cats-1x6","Dental care"],["Joint & Hip Supplement Drops for Dogs (200ml)","joint-hip-supplement-drops-for-dogs-200ml","Supplements & health"],["Joint Care Chews for Dogs - Chews with Glucosamine & Turmeric","joint-care-chews-for-dogs-chews-with-glucosamine-turmeric","Supplements & health"],["K9 Combo Nosode for Dogs, All-in-One Homeopathic Support Blend","k9-combo-nosode-for-dogs-all-in-one-homeopathic-support-blend","Supplements & health"],["Karnlea Beef Bone Broth for Dogs and Cats 500ml","karnlea-beef-bone-broth-for-dogs-and-cats-500ml","Supplements & health"],["Karnlea Chicken Bone Broth for Dogs and Cats 500ml","karnlea-chicken-bone-broth-for-dogs-and-cats-500ml","Supplements & health"],["Karnlea Goat Milk Powder for Dogs and Cats 200g","karnlea-goat-milk-powder-for-dogs-and-cats-200g","Supplements & health"],["Karnlea Pumpkin Powder for Dogs 200g","karnlea-pumpkin-powder-for-dogs-200g","Supplements & health"],["Karnlea Slippery Elm and Marshmallow Root Powder for Dogs and Cats 100g","karnlea-slippery-elm-and-marshmallow-root-powder-for-dogs-and-cats-100g","Supplements & health"],["Kennel Cough Nosode, Natural Homeopathic Support for Dogs","kennel-cough-nosode-natural-homeopathic-support-for-dogs","Supplements & health"],["Kidney & Urinary Support Supplement for Dogs","kidney-urinary-support-supplement-for-dogs","Supplements & health"],["Kidney Disease Bundle","kidney-disease-bundle","Condition bundles"],["Knee Brace for Dogs - Joint Support & Injury Recovery","knee-brace-for-dogs-joint-support-injury-recovery","Mobility & recovery aids"],["Knee Immobiliser for Dogs | ACL, Patella Luxation Support","knee-immobiliser-for-dogs-acl-patella-luxation-support","Mobility & recovery aids"],["Knuckling Bundle","knuckling-bundle","Condition bundles"],["Lavender & Chamomile 4 in 1 Calming Dog Shampoo","lavender-chamomile-4-in-1-calming-dog-shampoo","Shampoo & grooming"],["Lavender & Chamomile Dog Conditioner","lavender-chamomile-dog-conditioner","Shampoo & grooming"],["Lavender & Chamomile Dog Deodorising Spray with Odour Neutraliser","lavender-chamomile-dog-deodorising-spray-with-odour-neutraliser","Shampoo & grooming"],["Leg Bootie Splint for Dogs - Knuckling & Limb Support","leg-bootie-splint-for-dogs-knuckling-limb-support","Mobility & recovery aids"],["Lepto 30c Nosode, Natural Homeopathic Support for Dogs","lepto-30c-nosode-natural-homeopathic-support-for-dogs","Supplements & health"],["Lick Mat for Dogs with Spreader & Brush","lick-mat-for-dogs-with-spreader-brush","Calming & enrichment"],["Lickimat Playdate Slow Licking Mat","lickimat-playdate-slow-licking-mat","Calming & enrichment"],["Lickimat Slomo Slow Feeder Lick Mat for Dogs","lickimat-slomo-slow-feeder-lick-mat-for-dogs","Calming & enrichment"],["Lightweight Folding Dog Ramp - 75kg Capacity, 151cm","lightweight-folding-dog-ramp-75kg-capacity-151cm","Mobility & recovery aids"],["Limb Weights for Muscle Strengthening & Rehabilitation in Dogs","limb-weights-for-muscle-strengthening-rehabilitation-in-dogs","Mobility & recovery aids"],["Low Voltage Electrically Heated Pet Pad - 30-35°C","low-voltage-electrically-heated-pet-pad-30-35-c","Recovery & first aid"],["Luxating Patella Bundle","luxating-patella-bundle","Condition bundles"],["Luxury 2 in 1 Dog Shampoo & Conditioner with Papaya Coconut","luxury-2-in-1-dog-shampoo-conditioner-with-papaya-coconut","Shampoo & grooming"],["Luxury Papaya & Coconut Dog Conditioner","luxury-papaya-coconut-dog-conditioner","Shampoo & grooming"],["Mango & Banana Dog Shampoo (5L), 5L","mango-banana-dog-shampoo-5l-5l","Shampoo & grooming"],["Maxi White Whitening Dog Shampoo with Pineapple & Passionfruit","maxi-white-whitening-dog-shampoo-with-pineapple-passionfruit","Shampoo & grooming"],["Medical Pet Shirt for Dogs - Post-Op Recovery Shirt","medical-pet-shirt-for-dogs-post-op-recovery-shirt","Recovery & first aid"],["Medical Pet Shirt Front Leg Sleeve for Dogs","medical-pet-shirt-front-leg-sleeve-for-dogs","Recovery & first aid"],["MSM Powder for Dogs & Cats - Joint & Coat Support 300g","msm-powder-for-dogs-cats-joint-coat-support-300g","Supplements & health"],["Muscle & Joint Probiotic Powder for Dogs & Cats","muscle-joint-probiotic-powder-for-dogs-cats","Supplements & health"],["Muscle & Joint Salmon Oil for Pets (300ml)","muscle-joint-salmon-oil-for-pets-300ml","Supplements & health"],["Muscle & Joint Support Hemp Oil for Pets (300ml)","muscle-joint-support-hemp-oil-for-pets-300ml","Supplements & health"],["Natural & Gentle Dog Shampoo, Suitable for Sensitive Skin & All Coat Types","natural-gentle-dog-shampoo-suitable-for-sensitive-skin-all-coat-types","Shampoo & grooming"],["Natural Air Dried Chicken Meat Strips for Dogs 100g","natural-air-dried-chicken-meat-strips-for-dogs-100g","Food, treats & toppers"],["Natural Calming Drops for Dogs & Cats | 50ml","natural-calming-drops-for-dogs-cats-50ml","Supplements & health"],["Natural Calming Supplement Powder for Dogs","natural-calming-supplement-powder-for-dogs","Supplements & health"],["Natural Deer Antler Supplement Powder for Dogs","natural-deer-antler-supplement-powder-for-dogs","Supplements & health"],["Natural Digestive Support Powder for Dogs & Cats | 100g","natural-digestive-support-powder-for-dogs-cats-100g","Supplements & health"],["Natural Flea, Tick & Mite Home Spray 500ml","natural-flea-tick-mite-home-spray-4x500ml","Flea, tick & worming"],["Natural Joint & Hip Supplement Powder for Dogs","natural-joint-hip-supplement-powder-for-dogs","Supplements & health"],["Natural Nibbles ProCare+ Joint & Mobility","natural-nibbles-procare-joint-mobility","Food, treats & toppers"],["Natural Paw Balm for Dogs, Soothing Support for Dry & Cracked Paws","natural-paw-balm-for-dogs-soothing-support-for-dry-cracked-paws","Supplements & health"],["Natural Plaque & Tartar Remover Powder for Dogs","natural-plaque-tartar-remover-powder-for-dogs","Supplements & health"],["Natural Pre & Probiotic Powder for Dogs & Cats 100g","natural-pre-probiotic-powder-for-dogs-cats-100g","Supplements & health"],["Natural Tummy Settler for Dogs & Cats - 250ml","natural-tummy-settler-for-dogs-cats-250ml","Supplements & health"],["Natural Turkey Meat Strips for Dogs | Grain-Free | 100g","natural-turkey-meat-strips-for-dogs-grain-free-100g","Food, treats & toppers"],["Natural Turmeric Curcumin Capsules for Dogs & Cats - 60 Caps","natural-turmeric-curcumin-capsules-for-dogs-cats-60-caps","Supplements & health"],["Natural VetCare Calm & Settle 50 Chews","natural-vetcare-calm-amp-settle-50-chews","Calming & enrichment"],["Natural VetCare Daily Dental Powder 200g","natural-vetcare-daily-dental-powder-200g","Dental care"],["Natural VetCare Daily Multivit 50 Chews","natural-vetcare-daily-multivit-50-chews","Supplements & health"],["Natural VetCare Gut Balance 50 Chews","natural-vetcare-gut-balance-50-chews","Supplements & health"],["Natural VetCare Mobility 50 Chews","natural-vetcare-mobility-50-chews","Supplements & health"],["Natural VetCare Skin Oil 100ml","natural-vetcare-skin-oil-100ml","Supplements & health"],["Natural Wormwood Herbal Drops for Dogs & Cats 50ml","natural-wormwood-herbal-drops-for-dogs-cats-50ml","Supplements & health"],["Nerve Weakness Bundle","nerve-weakness-bundle","Condition bundles"],["No Flap Ear Wrap for Dogs - Aural Haematoma Recovery","no-flap-ear-wrap-for-dogs-aural-haematoma-recovery","Recovery & first aid"],["No Rinse Baby Fresh Dog Shampoo","no-rinse-baby-fresh-dog-shampoo","Shampoo & grooming"],["No Rinse Flea & Tick Shampoo for Dogs","no-rinse-flea-tick-shampoo-for-dogs","Flea, tick & worming"],["No Rinse Lavender & Chamomile Dog Shampoo","no-rinse-lavender-chamomile-dog-shampoo","Shampoo & grooming"],["No Rinse Oatmeal Dog Shampoo with Coconut & Lime","no-rinse-oatmeal-dog-shampoo-with-coconut-lime","Shampoo & grooming"],["No Rinse Papaya & Coconut Dog Shampoo & Conditioner","no-rinse-papaya-coconut-dog-shampoo-conditioner","Shampoo & grooming"],["No-Knuckling Sling for Dogs - Proprioceptive Corrector","no-knuckling-sling-for-dogs-proprioceptive-corrector","Mobility & recovery aids"],["Noise Fear Bundle","noise-fear-bundle","Condition bundles"],["Oatmeal Dog Conditioner 500ml","oatmeal-dog-conditioner-500ml","Shampoo & grooming"],["Oatmeal Dog Conditioner with Coconut & Lime","oatmeal-dog-conditioner-with-coconut-lime","Shampoo & grooming"],["Oatmeal Dog Deodorising Spray with Coconut & Lime Fragrance","oatmeal-dog-deodorising-spray-with-coconut-lime-fragrance","Shampoo & grooming"],["Oatmeal Dog Shampoo for Sensitive Skin - 500ml","oatmeal-dog-shampoo-for-sensitive-skin-500ml","Shampoo & grooming"],["Oatmeal Dog Shampoo with Coconut & Lime Fragrance","oatmeal-dog-shampoo-with-coconut-lime-fragrance","Shampoo & grooming"],["Oatmeal Moisturising Cream for Dogs","oatmeal-moisturising-cream-for-dogs","Skin, ear & eye care"],["Oatmeal Nose & Paw Balm Pot for Dogs","oatmeal-nose-paw-balm-pot-for-dogs","Skin, ear & eye care"],["Oatmeal Nose & Paw Balm Stick for Dogs","oatmeal-nose-paw-balm-stick-for-dogs","Skin, ear & eye care"],["Obesity Bundle","obesity-bundle","Condition bundles"],["One in a Million Detangling Spray for Dogs","one-in-a-million-detangling-spray-for-dogs","Shampoo & grooming"],["One in a Million Dog Shampoo","one-in-a-million-dog-shampoo","Shampoo & grooming"],["Organic Seaweed Powder – Dental & Thyroid Support for Dogs & Cats","organic-seaweed-powder-dental-thyroid-support-for-dogs-cats","Supplements & health"],["Orthopaedic Memory Foam Mattress for Dogs","orthopaedic-memory-foam-mattress-for-dogs","Mobility & recovery aids"],["Pablo & Co. Pet Stairs for Cats & Dogs - Grey Boucle","pablo-co-pet-stairs-for-cats-dogs-grey-boucle","Mobility & recovery aids"],["Pablo & Co. Pet Stairs for Cats & Dogs - Pistachio","pablo-co-pet-stairs-for-cats-dogs-pistachio","Mobility & recovery aids"],["Pablo & Co. Pet Stairs for Cats & Dogs - White Boucle","pablo-co-pet-stairs-for-cats-dogs-white-boucle","Mobility & recovery aids"],["Paw & Nose Balm for Dogs - Soothes Dry & Cracked Skin","paw-nose-balm-for-dogs-soothes-dry-cracked-skin","Skin, ear & eye care"],["PAW 2-in-1 Slow Feeder & Lick Pad","paw-2-in-1-slow-feeder-lick-pad","Food, treats & toppers"],["Paw Conditions Bundle","paw-conditions-bundle","Condition bundles"],["PAW Planet Lick Mat","paw-planet-lick-mat","Calming & enrichment"],["Pawprint Cohesive Bandage for Pets - Self-Adhesive Vetwrap","pawprint-cohesive-bandage-for-pets-self-adhesive-vetwrap","Recovery & first aid"],["Paws & Nose Balm for Dogs 50ml","paws-nose-balm-for-dogs-50ml","Skin, ear & eye care"],["Peake Pet Care's Soothing Ear Cleaner","peake-pet-cares-soothing-ear-cleaner","Supplements & health"],["Pet Refresh Wipes for Dogs & Cats - Quick Clean Between Washes","pet-refresh-wipes-for-dogs-cats-quick-clean-between-washes","Shampoo & grooming"],["Pet Remedy Natural Calming Diffuser Refill 2x40ml","pet-remedy-natural-calming-diffuser-refill-2x40ml","Calming & enrichment"],["Pet Remedy Natural Calming Plug Diffuser With Oil 40ml","pet-remedy-natural-calming-plug-diffuser-with-oil-40ml","Calming & enrichment"],["Photizo® Vetcare Silent – Red Light Therapy Device","photizo-vetcare-silent-red-light-therapy-device","Recovery & first aid"],["Physio Balance Beam for Dogs - Rehabilitation & Core Training","physio-balance-beam-for-dogs-rehabilitation-core-training","Mobility & recovery aids"],["Physio Tactile Balance Discus for Dogs","physio-tactile-balance-discus-for-dogs-33-cm","Mobility & recovery aids"],["Physio Tactile Peanut Balance Ball for Dogs - 40 cm","physio-tactile-peanut-balance-ball-for-dogs-40-cm","Mobility & recovery aids"],["Physio Tactile Peanut Balance Ball for Dogs - 60 cm","physio-tactile-peanut-balance-ball-for-dogs-60-cm","Mobility & recovery aids"],["Physio Tactile Peanut Balance Ball for Dogs – 50 cm","physio-tactile-peanut-balance-ball-for-dogs-50-cm","Mobility & recovery aids"],["Physio Tactile Podo Balance Pods for Dogs, Pack of 4","physio-tactile-podo-balance-pods-for-dogs-pack-of-4","Mobility & recovery aids"],["Physiotherapy Bundle","physiotherapy-bundle","Condition bundles"],["Plaque Crackerz Dental Bites for Dogs 250g","plaque-crackerz-dental-bites-for-dogs-250g","Dental care"],["Plaque Seaweed Powder for Dogs & Cats | 80 Servings","plaque-seaweed-powder-for-dogs-cats-80-servings","Supplements & health"],["Plastic Pet Ramp for Dogs & Cats","plastic-pet-ramp-for-dogs-cats","Mobility & recovery aids"],["Post Surgery Recovery Bundle","post-surgery-recovery-bundle","Condition bundles"],["Post Surgical Castration Recovery Shirt for Male Dogs","post-surgical-castration-recovery-shirt-for-male-dogs","Recovery & first aid"],["Post Surgical Recovery Shirt for Dogs","post-surgical-recovery-shirt-for-dogs","Recovery & first aid"],["Post-Surgery Head Cover - Cone Alternative for Dogs","post-surgery-head-cover-cone-alternative-for-dogs","Recovery & first aid"],["Pre & Probiotic Digestive Supplement Powder for Dogs","pre-probiotic-digestive-supplement-powder-for-dogs","Supplements & health"],["Pre & Probiotic Supplement Chews for Dogs","pre-probiotic-supplement-chews-for-dogs","Supplements & health"],["Pre, Post + Probiotic Detangling + Conditioning Spray for Dogs","pre-post-probiotic-detangling-conditioning-spray-for-dogs","Shampoo & grooming"],["Pre, Post + Probiotic Ear Cleaner for Dogs","pre-post-probiotic-ear-cleaner-for-dogs","Shampoo & grooming"],["Pre, Post + Probiotic Ear Wipes for Dogs","pre-post-probiotic-ear-wipes-for-dogs","Shampoo & grooming"],["Pre, Post + Probiotic Itchy Skin Spray for Dogs","pre-post-probiotic-itchy-skin-spray-for-dogs","Shampoo & grooming"],["Pre, Post + Probiotic No Rinse Paw Cleaner for Dogs","pre-post-probiotic-no-rinse-paw-cleaner-for-dogs","Shampoo & grooming"],["Pre, Post + Probiotic No Rinse Shampoo for Dogs","pre-post-probiotic-no-rinse-shampoo-for-dogs","Shampoo & grooming"],["Prebiotic Balm Stick for Dogs (40g)","prebiotic-balm-stick-for-dogs-40g","Shampoo & grooming"],["Probiotic Digestive Fibre Pellet Supplement for Dogs","probiotic-digestive-fibre-pellet-supplement-for-dogs","Supplements & health"],["Pumpkin Powder Supplement for Dogs (200g)","pumpkin-powder-supplement-for-dogs-200g","Supplements & health"],["Pumpkin Powder – High-Fibre Digestive Support for Dogs & Cats","pumpkin-powder-high-fibre-digestive-support-for-dogs-cats","Supplements & health"],["Pumpkin Probiotic Powder for Dogs - 30 Servings","pumpkin-probiotic-powder-for-dogs-30-servings","Supplements & health"],["Pumpkin Puree Powder for Dogs - 30 Servings","pumpkin-puree-powder-for-dogs-30-servings","Supplements & health"],["Pumpkin Supplement Chews for Dogs","pumpkin-supplement-chews-for-dogs","Supplements & health"],["Puparazzi™ Baby Fresh Puppy Shampoo","puparazzitm-baby-fresh-puppy-shampoo","Shampoo & grooming"],["Puparazzi™ Flea & Tick Puppy Shampoo","puparazzitm-flea-tick-puppy-shampoo","Shampoo & grooming"],["Puparazzi™ Lavender & Chamomile 4 in 1 Puppy Shampoo","puparazzitm-lavender-chamomile-4-in-1-puppy-shampoo","Shampoo & grooming"],["Puparazzi™ Luxury 2 in 1 Puppy Shampoo & Conditioner","puparazzitm-luxury-2-in-1-puppy-shampoo-conditioner","Shampoo & grooming"],["Puparazzi™ Oatmeal Puppy Shampoo","puparazzitm-oatmeal-puppy-shampoo","Shampoo & grooming"],["Pure & Natural Duo Sheep/Salmon Oil 300ml","pure-amp-natural-duo-sheep-salmon-oil-300ml","Supplements & health"],["Rapz Splash Eazy Tear Cohesive Bandage for Pets","rapz-splash-eazy-tear-cohesive-bandage-for-pets","Recovery & first aid"],["Rawhide Free Peanut Butter Medium Bones for Dogs 2pk","rawhide-free-peanut-butter-medium-bones-for-dogs-2pk","Food, treats & toppers"],["Rawzeez Complete for Dogs","rawzeez-complete-for-dogs","Food, treats & toppers"],["Rear Leg Splint for Dogs & Cats - Hock & Paw Immobiliser","rear-leg-splint-for-dogs-cats-hock-paw-immobiliser","Mobility & recovery aids"],["Rear Leg Weakness Bundle","rear-leg-weakness-bundle","Condition bundles"],["Rear Lift Harness for Dogs with Hind Leg Mobility Problems","rear-lift-harness-for-dogs-with-hind-leg-mobility-problems","Walking & out and about"],["Rear Support Harness for Dogs with Hip & Mobility Issues","rear-support-harness-for-dogs-with-hip-mobility-issues","Mobility & recovery aids"],["Reflective Training Long Lead for Dogs","reflective-training-long-lead-for-dogs","Walking & out and about"],["Rehab Carpal Joint Protection Wrap for Dogs","rehab-carpal-joint-protection-wrap-for-dogs-size-s","Mobility & recovery aids"],["Restlessness Bundle","restlessness-bundle","Condition bundles"],["Reusable Hot & Cold Therapy Pack for Pets","reusable-hot-cold-therapy-pack-for-pets","Recovery & first aid"],["River Rock Foraging Slow Feeder Mat for Dogs","river-rock-foraging-slow-feeder-mat-for-dogs","Food, treats & toppers"],["Scottish Salmon Oil Supplement Chews for Dogs","scottish-salmon-oil-supplement-chews-for-dogs","Supplements & health"],["Seasonal Allergies Bundle","seasonal-allergies-bundle","Condition bundles"],["Self-Heating Pet Pad","self-heating-pet-pad-no-electricity-needed-48x38cm","Beds & comfort"],["Separation Anxiety Bundle","separation-anxiety-bundle","Condition bundles"],["Silicone Bone Lick Mat for Dogs","silicone-bone-lick-mat-for-dogs-small-blue","Calming & enrichment"],["Silicone Finger Toothbrush for Dogs & Cats - 5 Pack","silicone-finger-toothbrush-for-dogs-cats-5-pack","Dental care"],["Silicone Finger Toothbrushes for Dogs - Pack of 5","silicone-finger-toothbrushes-for-dogs-pack-of-5","Dental care"],["Silicone Lick Treat Mat for Dogs - Mental Enrichment","silicone-lick-treat-mat-for-dogs-mental-enrichment","Calming & enrichment"],["Skin & Coat Hemp Oil for Dogs & Cats (300ml)","skin-coat-hemp-oil-for-dogs-cats-300ml","Supplements & health"],["Skin & Coat Liquid Supplement for Dogs (200ml)","skin-coat-liquid-supplement-for-dogs-200ml","Supplements & health"],["Skin & Coat Probiotic Powder for Dogs & Cats","skin-coat-probiotic-powder-for-dogs-cats","Supplements & health"],["Skin & Coat Salmon Oil Infusion for Dogs (300ml)","skin-coat-salmon-oil-infusion-for-dogs-300ml","Supplements & health"],["Skin & Coat Supplement Chews for Dogs - 140 Chews","skin-coat-supplement-chews-for-dogs-140-chews","Supplements & health"],["Slippery Elm Bark Powder – Digestive Health Supplement for Pets","products-slippery-elm-bark","Supplements & health"],["Slow Feeder Anti-Gulp Bowl for Small Pets","slow-feeder-anti-gulp-bowl-for-small-pets-7-18cm","Food, treats & toppers"],["Soothing Ear Cleaner Solution for Dogs","soothing-ear-cleaner-solution-for-dogs","Skin, ear & eye care"],["Soothing Ear Wipes for Dogs (100 wipes)","soothing-ear-wipes-for-dogs-100-wipes","Skin, ear & eye care"],["SPIN Spiral Feeding Accessory (50% Recycled Plastic)","spin-spiral-feeding-accessory-50-recycled-plastic","Food, treats & toppers"],["Spondylosis Bundle","spondylosis-bundle","Condition bundles"],["Spooky Edition: Pumpkin Latte Dog Shampoo","spooky-edition-pumpkin-latte-dog-shampoo","Shampoo & grooming"],["Spring Clover Foraging Slow Feeder Mat for Dogs","spring-clover-foraging-slow-feeder-mat-for-dogs","Food, treats & toppers"],["Stinky Dog Deodorising Spray with Odour Neutraliser","stinky-dog-deodorising-spray-with-odour-neutraliser","Shampoo & grooming"],["Stinky Dog Shampoo with Odour Neutraliser","stinky-dog-shampoo-with-odour-neutraliser","Shampoo & grooming"],["Super Joints Hip & Joint Support Supplement for Dogs 150g","super-joints-hip-joint-support-supplement-for-dogs-150g","Supplements & health"],["Superfood Blend for Dogs, Daily Nutritional Boost for Any Diet","superfood-blend-for-dogs-daily-nutritional-boost-for-any-diet","Supplements & health"],["Supernature Apple Cider Vinegar for Dogs 500ml","supernature-apple-cider-vinegar-for-dogs-500ml","Supplements & health"],["Supernature Cruncheez Cheese & Bacon Biscuit Batons 250g","supernature-cruncheez-cheese-bacon-biscuit-batons-250g","Food, treats & toppers"],["Supernature Cruncheez Chicken & Chia Biscuit Bones 250g","supernature-cruncheez-chicken-chia-biscuit-bones-250g","Food, treats & toppers"],["Supernature Cruncheez Pork & Pumpkin Biscuits 250g","supernature-cruncheez-pork-pumpkin-biscuits-250g","Food, treats & toppers"],["Supernature Oileez Flaxseed Oil 500ml","supernature-oileez-flaxseed-oil-500ml","Supplements & health"],["Supernature Oileez Hemp Seed Oil 500ml","supernature-oileez-hemp-seed-oil-500ml","Supplements & health"],["Supernature Oileez Salmon Oil 500ml","supernature-oileez-salmon-oil-500ml","Supplements & health"],["Supernature Pumpkin Powder with Pre, Post & Probiotics","supernature-pumpkin-powder-with-pre-post-probiotics","Supplements & health"],["Supernature Pumpkinz Dried Pumpkin Powder","supernature-pumpkinz-dried-pumpkin-powder","Supplements & health"],["Supernature Pumpkinz Dried Pumpkin Powder with Goats Milk","supernature-pumpkinz-dried-pumpkin-powder-with-goats-milk","Supplements & health"],["Supernature Pumpkinz Dried Pumpkin Powder with Turmeric","supernature-pumpkinz-dried-pumpkin-powder-with-turmeric","Supplements & health"],["Supernature Slurpeez Beef Bone Broth Powder","supernature-slurpeez-beef-bone-broth-powder","Food, treats & toppers"],["Supernature Slurpeez Chicken Bone Broth Powder","supernature-slurpeez-chicken-bone-broth-powder","Food, treats & toppers"],["Supernature Slurpeez Fish Bone Broth Powder 60g","supernature-slurpeez-fish-bone-broth-powder-60g","Food, treats & toppers"],["Supernature Slurpeez Pork Bone Broth Powder 60g","supernature-slurpeez-pork-bone-broth-powder-60g","Food, treats & toppers"],["Supernature Super Collagen Boost Supplement 250g","supernature-super-collagen-boost-supplement-250g","Supplements & health"],["Supernature Super Gut Pre, Post & Probiotic Supplement 150g","supernature-super-gut-pre-post-probiotic-supplement-150g","Supplements & health"],["Supernature Super Spirulina Supplement 300g","supernature-super-spirulina-supplement-300g","Supplements & health"],["Supernature X LickiMat® Beef Lickeez For Dogs","supernature-x-lickimat®-beef-lickeez-for-dogs","Calming & enrichment"],["Supernature X LickiMat® Chicken Lickeez For Dogs","supernature-x-lickimat®-chicken-lickeez-for-dogs","Calming & enrichment"],["Tactical K9 Rubber Treat Dispenser Ball Dog Toy","tactical-k9-rubber-treat-dispenser-ball-dog-toy","Calming & enrichment"],["Tactical K9 Treat Dispenser Bouncer Dog Toy","tactical-k9-treat-dispenser-bouncer-dog-toy","Calming & enrichment"],["Tactical K9 Treat Dispenser Cone for Dogs","tactical-k9-treat-dispenser-cone-for-dogs","Calming & enrichment"],["Tactical K9 Treat Dispenser Twister for Dogs","tactical-k9-treat-dispenser-twister-for-dogs","Calming & enrichment"],["Tangle Tame 2-in-1 Dog Detangler & Leave-in Conditioner Spray for Dogs","tangle-tame-2-in-1-dog-detangler-leave-in-conditioner-spray-for-dogs","Shampoo & grooming"],["Tangle Tame 3-in-1 Dog Shampoo, Conditioner & Detangler","tangle-tame-3-in-1-dog-shampoo-conditioner-detangler","Shampoo & grooming"],["Tasty Liver Paste for Dogs & Cats 75g","tasty-liver-paste-for-dogs-cats-12x75g","Food, treats & toppers"],["Tasty Salmon Paste for Dogs & Cats 75g","tasty-salmon-paste-for-dogs-cats-12x75g","Food, treats & toppers"],["Tasty Turkey Paste for Dogs & Cats 75g","tasty-turkey-paste-for-dogs-cats-12x75g","Food, treats & toppers"],["Tear Stain Eye Wipes for Dogs (100 Wipes)","tear-stain-eye-wipes-for-dogs-100-wipes","Skin, ear & eye care"],["Telescopic Dog Car Ramp 1800mm - 90kg Capacity","telescopic-dog-car-ramp-1800mm-90kg-capacity","Mobility & recovery aids"],["Thermal Back Brace for Dogs - Lumbar & Spine Support","thermal-back-brace-for-dogs-lumbar-spine-support","Mobility & recovery aids"],["Thermal Blanket for Dogs with Arthritis & Joint Pain","thermal-blanket-for-dogs-with-arthritis-joint-pain","Beds & comfort"],["Treat Dispenser Dumbbell Dog Toy","treat-dispenser-dumbbell-dog-toy","Calming & enrichment"],["Turmeric Bone Broth Powder Supplement for Dogs & Cats","turmeric-bone-broth-powder-supplement-for-dogs-cats","Supplements & health"],["Urinary Tract Supplement Chews for Dogs","urinary-tract-supplement-chews-for-dogs","Supplements & health"],["Vanilla & Shea Butter Dog Conditioner 500ml","vanilla-shea-butter-dog-conditioner-500ml","Shampoo & grooming"],["Waterproof Thermal Coat for Dogs with Arthritis & Active Dogs","waterproof-thermal-coat-for-dogs-with-arthritis-active-dogs","Recovery & first aid"],["Wild Lemongrass All in 1 Dog Shampoo with Shed Control","wild-lemongrass-all-in-1-dog-shampoo-with-shed-control","Shampoo & grooming"],["Wild Lemongrass Dog Deodorising Spray with Shed Control","wild-lemongrass-dog-deodorising-spray-with-shed-control","Shampoo & grooming"],["Wound & Skin Repair Powder for Dogs 50g","wound-skin-repair-powder-for-dogs-50g","Recovery & first aid"],["Wound Ointment with Calendula & Aloe Vera - 30ml","wound-ointment-with-calendula-aloe-vera","Recovery & first aid"],["Wrinkle Wash for Dogs, Support for Smelly, Damp & Irritated Skin Folds","wrinkle-wash-for-dogs-support-for-smelly-damp-irritated-skin-folds","Shampoo & grooming"],["Yeast & Itch Shampoo for Dogs, For Yeasty or Itchy Skin","yeast-itch-shampoo-for-dogs-for-yeasty-or-itchy-skin","Shampoo & grooming"],["Yeast Support Powder for Dogs, Natural Support for Itchy Skin, Paws & Ears","yeast-support-powder-for-dogs-natural-support-for-itchy-skin-paws-ears","Supplements & health"],["Zebra Print Medical Recovery Shirt for Dogs","zebra-print-medical-recovery-shirt-for-dogs","Recovery & first aid"],["Zesty Paws 5-in-1 Chews - Turkey","zesty-paws-5-in-1-chews-turkey","Supplements & health"],["Zesty Paws 9-in-1 Senior Advanced Chews - Turkey","zesty-paws-9-in-1-senior-advanced-chews-turkey","Supplements & health"],["Zesty Paws Aller-Immune Chews - Salmon","zesty-paws-aller-immune-chews-salmon","Supplements & health"],["Zesty Paws Calming Chews - Turkey","zesty-paws-calming-chews-turkey","Supplements & health"],["Zesty Paws Cat & Dog Dental Powder","zesty-paws-cat-dog-dental-powder","Supplements & health"],["Zesty Paws Cranberry Urinary Care Chews","zesty-paws-cranberry-urinary-care-chews","Supplements & health"],["Zesty Paws Hip & Joint Chews - Turkey","zesty-paws-hip-joint-chews-turkey","Supplements & health"],["Zesty Paws Probiotic Chews - Pumpkin","zesty-paws-probiotic-chews-pumpkin","Supplements & health"],["Zingy 2-in-1 Shampoo & Conditioner with Grapefruit & Orange","zingy-2-in-1-shampoo-conditioner-with-grapefruit-orange","Shampoo & grooming"],["Zingy Dog Cologne with Grapefruit & Orange","zingy-dog-cologne-with-grapefruit-orange","Shampoo & grooming"],["Zoomy Hyaluronic Acid Liquid Joint Supplement for Dogs","hyaluronic-acid-liquid-joint-supplement-for-dogs","Supplements & health"]],
  /* The reviews. Judge.me shape. */
  reviews:[
    {"id":"30086501-a232-5ee1-9537-adcafc3866c6","rating":5,"title":"","body":"Exactly as I ordered very happy with product","reviewer_name":"robert","created_at":"2026-09-24","verified_buyer":true,"product_title":"Pawprint Cohesive Bandage for Pets - Self-Adhesive Vetwrap","product_handle":"pawprint-cohesive-bandage-for-pets-self-adhesive-vetwrap","category":"Recovery & first aid","pictures_count":0,"is_shop_review":false,"source":"Judge.me via Shop app"},
    {"id":"0f479a79-bca7-5003-8f62-d947238138ea","rating":5,"title":"","body":"Colour range was excellent along with the price","reviewer_name":"robert","created_at":"2026-09-24","verified_buyer":true,"product_title":"Pawprint Cohesive Bandage for Pets - Self-Adhesive Vetwrap","product_handle":"pawprint-cohesive-bandage-for-pets-self-adhesive-vetwrap","category":"Recovery & first aid","pictures_count":0,"is_shop_review":false,"source":"Judge.me via Shop app"},
    {"id":"56bdc888-5dc0-4dbe-ad51-f4fc13442ae0","rating":5,"title":"Elbow support","body":"Really helping our elderly lab with his arthritic shoulder. Great quality","reviewer_name":"Lisa Wellington","created_at":"2026-09-19","verified_buyer":false,"product_title":"100% Natural Coconut Oil for Dogs","product_handle":"100-natural-coconut-oil-for-dogs","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"7e10fed7-dc32-5ec4-826c-e35abf75f579","rating":4,"title":"","body":"I ordered a blue harness (above) but received a grey one, just kept it as I quite like the colour on my dog and it took so long to arrive. I've used this style harness before and it is excellent for my disabled dog who sometimes needs a bit of help. Old one on the right, new one on left.","reviewer_name":"Anne McNair","created_at":"2026-09-10","verified_buyer":true,"product_title":"Flagline Lightweight Dog Harness with Handle & 3 Clip Points","product_handle":"flagline-lightweight-dog-harness-with-handle-3-clip-points","category":"Walking & out and about","pictures_count":0,"is_shop_review":false,"source":"Judge.me via Shop app"},
    {"id":"7d6d1038-0db0-41f6-a0c2-753058865a6d","rating":5,"title":"","body":"Easy to fine on browers, Easy ordering and as stated.","reviewer_name":"Janet Hodder","created_at":"2026-09-07","verified_buyer":true,"product_title":"Poorly Pet (store review)","product_handle":null,"category":"Store review","pictures_count":0,"is_shop_review":true,"source":"Judge.me"},
    {"id":"0b0ca6d0-5403-4d47-a37b-a05f82875638","rating":5,"title":"","body":"Pooch was having problems with iffy tummy and her bowels. She's had it for 2 weeks now and so far so good. Doesn't seem to be eating as much grass as she usually does to empty her tummy.","reviewer_name":"Janet Hodder","created_at":"2026-09-07","verified_buyer":true,"product_title":"Pumpkin Puree Powder for Dogs - 30 Servings","product_handle":"pumpkin-puree-powder-for-dogs-30-servings","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"214c4fc7-9890-4d4f-860f-122748fc4773","rating":4,"title":"Amazing product and service","body":"Unfortunately our Rottweiler had a very sore wound on his leg and we could not find anything big enough for him to wear; we came across poorly pets by accident but were so glad we did, just after purchasing the sleeve our dog had got to the wound and chewed it worse, we contacted poorly pets who kindly expedited the item to arrive quicker and now my boy has a sleeve he cannot get off, is extremely comfortable and the service from poorly pet was 110%\nI cannot fault the product or the service and have poorly pets on my bookmark if ever we are in need of them again","reviewer_name":"Jane","created_at":"2026-09-04","verified_buyer":true,"product_title":"2-in-1 Dog Shampoo & Conditioner with Lavender & Jojoba","product_handle":"2-in-1-dog-shampoo-conditioner-with-lavender-jojoba","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"pdp-lee","rating":5,"title":"Can't put a price tag on it","body":"So glad I bought this. Seeing my dog excited to go outside again is priceless.","reviewer_name":"Lee","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me, as saved on the signed-off product page"},
    {"id":"pdp-joe-moore","rating":3,"title":"GREAT","body":"Can't fault it does exactly what it says on the tin! Found website handy as well to get correct sizing","reviewer_name":"Joe Moore","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me, as saved on the signed-off product page"},
    {"id":"pdp-gee","rating":5,"title":"Bailey got his legs back","body":"My Bailey lost use of his back legs and WOW this product has give him his life back. He's happier in himself and we feel like we've got our dog back. Thanks Poorly pet... I love that places like this exist!","reviewer_name":"Gee","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me, as saved on the signed-off product page"},
    {"id":"ff63fb05-710b-41f0-8a98-81649e22bd1d","rating":5,"title":"Good","body":"Good product","reviewer_name":"Kay","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Over 35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-over-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"f710a4d8-83f2-461a-8ba9-8ef9ef7f060b","rating":5,"title":"Do you do this for humans??","body":"Do you do this for humans?? I brought this back in April a long with the Muscle and joint salmon oil and wow the difference I have seen! I couldn't leave the house without my dog getting worked up and he would always tear something up when I had gone since taking this I've noticed he's a lot calmer still gets a little worked up but nothing like before. It's helped me because I now don't panic as much about going out and leaving him!","reviewer_name":"Amie Fulham","created_at":"2026-08-06","verified_buyer":false,"product_title":"Calming Salmon Oil Blend for Dogs & Cats (300ml)","product_handle":"calming-salmon-oil-blend-for-dogs-cats-300ml","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"f70e3146-b6a5-442f-8895-d7f99e9f63d7","rating":5,"title":"Fab customer service & product","body":"Never leave reviews but not only was the product good the customer service was exceptional! There was a small issue with delivery didn't really sit with Poorly pet but they still wanted to help and make sure I sorted it. Thanks again :)","reviewer_name":"Liv","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 11-35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-11-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"f2852630-a501-4a8e-92fc-b6a5b5781136","rating":5,"title":"Happy dog","body":"My dog Sabby loves these and best of all they are all natural. Noticed a real difference in her joints and mobility","reviewer_name":"David&Gary","created_at":"2026-08-06","verified_buyer":false,"product_title":"Joint Care Chews for Dogs - Chews with Glucosamine & Turmeric","product_handle":"joint-care-chews-for-dogs-chews-with-glucosamine-turmeric","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"f0b3df4f-8d8c-4964-ab0a-478d08e63b68","rating":5,"title":"Thanks for your help :)","body":"Happy customer, good product very pleased.","reviewer_name":"Bethany P","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"ee9d3624-7c76-4f36-a505-4b1732b17bc4","rating":5,"title":"","body":"Only just started using these on my dog so can't comment on the products yet but I would like to comment on how helpful poorly pet have been with answering my questions big thanks to Lily.","reviewer_name":"Sabrina","created_at":"2026-08-06","verified_buyer":false,"product_title":"Back Pain Bundle","product_handle":"back-pain-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"e841eb76-401b-4136-986a-34054b7423b8","rating":5,"title":"Good product","body":"Considering I thought my dog was never going to walk again what a life changing thing! Just ordered dog bag next for colder months","reviewer_name":"AMUL","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"e5f4f4f8-bb51-4a0b-bb1d-530ac44161ad","rating":5,"title":"Can't thank you enough","body":"Never leave reviews really... bad I know. But we honestly can’t thank you enough for giving our boy some of his independence back. Before getting the wheelchair, he could barely make it across the garden without his back legs giving way, and we were having to support him everywhere.\n\nIt took a little patience to get the frame adjusted properly, but once it was fitted correctly, the difference was incredible. Within a few short practice sessions, he was moving around by himself and enjoying being outside again.\n\nSeeing him interested in walks, sniffing around the garden and looking more like his old self has been emotional for all of us. It has genuinely improved his quality of life and given us more precious time together. We only wish we had bought it sooner.","reviewer_name":"Jenny","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"e28d242f-8430-41c9-9b48-6e2e8eece841","rating":5,"title":"","body":"My dogs been using this for a week and at first he didn't seem to like it but with some practice and chicken as treats he's off and loving life. It's really hard to know what's best for them but his tail is wagging and he seems to have his energy back which makes me happy","reviewer_name":"MRS Y","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"e1f16541-cf9d-4cf0-b45d-cd61331fdb58","rating":5,"title":"","body":"So glad things like this exist now for dogs!","reviewer_name":"Sue T","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 11-35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-11-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"dea57850-fc97-4a03-b49a-90e5c12c26b1","rating":5,"title":"Made a real difference","body":"Took a few adjustments and some practice, but our dog is now moving around much more confidently. The frame feels strong, the harness is comfortable and the wheels move smoothly. Lovely to see him enjoying the garden again.","reviewer_name":"Sarah","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"d52ab9ab-bee2-4a2b-a76c-d9289defef09","rating":5,"title":"Website + product = lifesaver","body":"This website has been a lifesaver. After my dog was diagnosed with IVDD, finding the right support was overwhelming, but Poorly Pet made it so much easier. This product along with advice have really helped improve her comfort and mobility. Never seen anything like this before where you can pin point what might be wrong with your pooch love it.","reviewer_name":"John combs","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 11-35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-11-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"d2364003-43b9-4be0-996d-839c827ea299","rating":4,"title":"Thank you","body":"Assembly was straightforward, although I recommend taking your time with the adjustments to get the best fit. Customer support also answered a couple of sizing questions before I ordered, which gave me extra confidence.","reviewer_name":"Erin","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Over 35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-over-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"d17656bd-dece-4471-9430-a211d26bb85c","rating":5,"title":"","body":"Just what I needed. Gigi is one happy dog now","reviewer_name":"Pam","created_at":"2026-08-06","verified_buyer":false,"product_title":"Henry Wag Microfibre Dog Drying Bag","product_handle":"henry-wag-microfibre-dog-drying-bag","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"ce39c323-a073-40ff-84b9-4b63020854d8","rating":3,"title":"","body":"My older dog has so much more confidence now. I only wish I'd bought it sooner.","reviewer_name":"Colin","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"cd01f030-b586-4060-9e50-920927d3bc01","rating":5,"title":"Wheely love this product","body":"Sorry!! Couldn't help myself with the above :) But for context I went from crying for 2 weeks straight thinking my dog had lost use of her back legs to being able to laugh again now she's happy and walking with this product. It's not cheap but the quality is spot on along with instructions and to see Lara (my dog) happy again is priceless for me.","reviewer_name":"Lisa Rock","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"c9bbf53b-7334-4aa0-b46c-2c202d92037b","rating":4,"title":"Helpful for car journeys","body":"Bought this mainly because our Labrador gets nervous and pants constantly in the car. I sprayed his blanket before setting off and he settled down much quicker than usual. The drops are easy enough to add to his food and he hasn’t noticed them. It hasn’t completely stopped his anxiety, but there has definitely been an improvement.","reviewer_name":"Hallie","created_at":"2026-08-06","verified_buyer":false,"product_title":"Anxiety Bundle","product_handle":"anxiety-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"c76e6c33-3cfe-401b-9cbe-00bf505d7998","rating":4,"title":"Just what my dog needed","body":"Good price and just what my dog needed! I did the test on the website and it was spot on.","reviewer_name":"john","created_at":"2026-08-06","verified_buyer":false,"product_title":"Dog Elbow Pads - Support Brace for Hygromas & Dysplasia","product_handle":"dog-elbow-pads-support-brace-for-hygromas-dysplasia","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"c53c3c92-6ac5-4994-88ab-5b6c6cc5ce14","rating":4,"title":"Useful and doesn’t bother my dog","body":"Easy to spray onto minor scrapes and my dog doesn’t flinch or try to run away when I use it. The area dried quickly and stayed clean. The bottle is larger than I expected, so it should last a long time.","reviewer_name":"Terry Anne","created_at":"2026-08-06","verified_buyer":false,"product_title":"Antiseptic Skin & Wound Healing Spray for Dogs 250ml","product_handle":"antiseptic-skin-wound-healing-spray-for-dogs-250ml","category":"Recovery & first aid","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"b2f86864-5527-4d95-a128-a2eefdf97535","rating":5,"title":"Solid frame and easy to move","body":"Bought for our 30kg crossbreed after surgery left him with reduced movement in his back legs. It took a few adjustments to get the balance right, but the frame now supports him well and the wheels move smoothly on paths and grass. The straps are comfortable, although we added a little extra padding around one area because he has very sensitive skin. Overall, it is a sturdy wheelchair at a much more manageable price than many alternatives.","reviewer_name":"Yaz","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"b1b5c2a5-d352-48ad-8dab-ca2a9a442fa8","rating":5,"title":"Perfect size for a very small dog","body":"Our chihuahua is just under 4kg and most wheelchairs we found were far too large or heavy. This one fits him really well and the different adjustments made it possible to get the height and length right.\n\nHe was unsure during the first fitting, but after a few gentle practice sessions indoors he started walking with it. It feels lightweight but still sturdy, and he can use it in the garden without needing to be lifted out constantly. Very happy with it.","reviewer_name":"Lila","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Under 4kg","product_handle":"adjustable-dog-wheelchair-for-dogs-under-4kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"9bb97acc-d670-4b09-93ff-bdd907aa21bb","rating":5,"title":"Great quality and fast shipping!","body":"Great quality and fast shipping!","reviewer_name":"Jenny f","created_at":"2026-08-06","verified_buyer":false,"product_title":"Flagline Lightweight Dog Harness with Handle & 3 Clip Points","product_handle":"flagline-lightweight-dog-harness-with-handle-3-clip-points","category":"Walking & out and about","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"94da2a6b-bf16-4c48-9d7a-830a325e4544","rating":3,"title":"Great for little cuts after walks","body":"Our spaniel regularly picks up tiny scratches when running through bushes, so I wanted something gentle that we could use as soon as we got home. This is quick to spray on, doesn’t have a strong smell and, most importantly, doesn’t appear to sting.\n\nWe’ve used it on two small grazes so far and both stayed clean while healing. The 250ml bottle is also a decent size and should last us a while. A very useful first-aid product to have in the cupboard.","reviewer_name":"Dawn","created_at":"2026-08-06","verified_buyer":false,"product_title":"Antiseptic Skin & Wound Healing Spray for Dogs 250ml","product_handle":"antiseptic-skin-wound-healing-spray-for-dogs-250ml","category":"Recovery & first aid","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"91032566-4cb9-4c49-ab10-9d4f935167e8","rating":5,"title":"Great thing","body":"Don't know what I did before this, my dog Daisy lost use of her legs and we honestly didn't know anything like this was out there for dogs. It's so good great things like this exist.","reviewer_name":"Lisa H","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Under 4kg","product_handle":"adjustable-dog-wheelchair-for-dogs-under-4kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"8df91ef9-992a-44f6-9a38-0c20950c0af0","rating":5,"title":"Smells insane","body":"Love this product so much! I take it to my dog groomers so they can use it on my dog.","reviewer_name":"Nel","created_at":"2026-08-06","verified_buyer":false,"product_title":"2-in-1 Dog Shampoo & Conditioner with Lavender & Jojoba","product_handle":"2-in-1-dog-shampoo-conditioner-with-lavender-jojoba","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"83bcd36f-4f2a-41fb-84df-8feecbb192f3","rating":5,"title":"Great all rounder","body":"The product is amazing has really helped my dog murphy get use of his back legs again which is so great to see. But for me the great thing was the support we received from customer service. I had a few questions because I really didn't know how these things worked or how my dog would learn to use it and Joe who we spoke to was 5* for me! So with the product and customer service combined I would love to give more than 5*. Thanks again Joe!","reviewer_name":"jamie wagstaff","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 11-35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-11-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"7cbbe7c4-c237-4e16-9d01-f5dccc20f61c","rating":4,"title":"","body":"Was really pleased to see an IVDD bundle as the products add up when you buy them separate","reviewer_name":"Danny","created_at":"2026-08-06","verified_buyer":false,"product_title":"IVDD Bundle","product_handle":"ivdd-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"727fd47b-bb94-4b20-adb4-75f085f0c16e","rating":5,"title":"","body":"Really impressed and good price","reviewer_name":"Lisa L","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"720edb70-a601-4e34-8a6f-3772f2ee9b3a","rating":3,"title":"Customer service 10/10","body":"Brought this and there was an issue with sizing and I must say the customer service was 10/10, Lynn you are a star!","reviewer_name":"Jenny l","created_at":"2026-08-06","verified_buyer":false,"product_title":"George Barclay ClimaCOOL Dog Cooling Jacket","product_handle":"george-barclay-climacool-dog-cooling-jacket","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"6bb3ed3d-61fe-4684-9529-89dbc524df1e","rating":4,"title":"Took some adjusting, but works well","body":"It took us a few attempts to get the straps and height right, but once fitted, our little dog moved around much more comfortably. Lightweight, secure and easier to use than expected.","reviewer_name":"Zia","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Under 4kg","product_handle":"adjustable-dog-wheelchair-for-dogs-under-4kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"5f9c13dc-c1dd-47d6-8666-41f629a77221","rating":5,"title":"Would recommend","body":"Searched high and low on the internet, came across this one. Messaged them as I was a little unsure on size customer service was spot on helped me so much and product is great can tell it's made well","reviewer_name":"Jay","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"583ef775-fc55-47ac-92b1-9eadbb57577a","rating":2,"title":"SPOT ON","body":"Never leave reviews but this is one good product! I have two one for outdoors and one for in and got to say it brought me so much happiness seeing my dog happy again. \n\nThe customer service is spot on can't fault the help I received, even got a follow up email to make sure I was getting on okay. Just brought some of the supplement stuff so will update on these soon.","reviewer_name":"danny o","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 4-11kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-4-11kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"56253f89-5172-4e72-b19a-3822a234ce57","rating":3,"title":"Great during fireworks","body":"Our rescue dog is terrified of fireworks, so we wanted something gentle to help her feel more secure. We made her a quiet area with the warming pad and used the spray on her bedding before the noise started. She still knew the fireworks were there, but she wasn’t pacing around the house like she normally does. The three products work really well together and the pad has become her favourite place to sleep.","reviewer_name":"Sue S","created_at":"2026-08-06","verified_buyer":false,"product_title":"Anxiety Bundle","product_handle":"anxiety-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"5608f9f4-6962-42a5-ab48-672d866c5c07","rating":5,"title":"Good value but allow time for fitting","body":"Assembly was straightforward, but finding the correct height and strap position took us a few tries. Once fitted properly, our Labrador looked comfortable and was able to walk without dragging his back legs.\n\nHe is still learning how to turn, but there has already been a noticeable improvement in his confidence. A good affordable option for larger dogs.","reviewer_name":"Anne","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"554c5bf9-36b6-4df6-96ec-eb90795d019c","rating":5,"title":"He can enjoy proper walks again","body":"We bought this for our 11-year-old German Shepherd after his back legs became increasingly weak. He could still move them slightly, but he was struggling to support his own weight and we were having to use a lifting harness whenever he went outside.\n\nThe wheelchair took us a little while to assemble and adjust correctly. There are several different adjustment points, so I would definitely recommend measuring carefully and being patient with the first fitting. Once we had the height and width right, it felt secure and supported him without putting too much pressure around his chest.\n\nHe was hesitant at first and mostly stood still, but after a few short sessions with treats he started moving forward. Within a week, he was happily going around the garden and joining us for short walks again. The larger wheels roll well on paths and short grass, although we avoid very uneven or muddy ground.\n\nIt hasn’t turned him into a young dog again, but it has given him some independence and allowed him to enjoy being outside without us carrying his back end. Seeing him interested in walks again has been worth every penny.","reviewer_name":"Tony J","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"54c5d075-6062-473d-8967-7c24ba0dfeeb","rating":5,"title":"","body":"Good stuff and my dogs breath is deffo improving","reviewer_name":"Joe","created_at":"2026-08-06","verified_buyer":false,"product_title":"Dental Bundle","product_handle":"dental-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"548cbd19-ccf0-42ed-b075-4c6abc99447a","rating":5,"title":"","body":"Always a little skeptical but saw this recommended on a dog site I follow on facebook. My dog Oscar has been having these for 3 months now and can see a real difference he doesn't seem in as much pain (due to old age) and can see he has a more energy.","reviewer_name":"Karen j","created_at":"2026-08-06","verified_buyer":false,"product_title":"Arthritis Bundle","product_handle":"arthritis-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"54358d10-6de9-4bca-b54e-1f2140353ced","rating":5,"title":"Much more settled in the evenings","body":"Our spaniel gets very restless in the evenings, especially when there are noises outside. We’ve been using the drops daily and put the heated pad inside her bed. After around a week she seemed noticeably more settled and now chooses to lie on the pad most nights. The spray has also been useful before visitors arrive. Really pleased with the bundle so far.","reviewer_name":"Kay","created_at":"2026-08-06","verified_buyer":false,"product_title":"Anxiety Bundle","product_handle":"anxiety-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"51b2de6d-0097-41d2-b575-13ed6ec11e06","rating":5,"title":"Very good","body":"Very happy so far seems good and dog seems happier. Fast delivery and was updates regularly","reviewer_name":"Thomas","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Between 11-35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-between-11-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"4faf795f-b359-45b8-9075-149276f68819","rating":5,"title":"Happy customer","body":"Cheapest I've found on the market, arrived quick. Signed up for the subscription service so it's one less thing to think about.","reviewer_name":"Karen L","created_at":"2026-08-06","verified_buyer":false,"product_title":"Burgess Sensitive Lamb & Rice Dry Dog Food 12.5kg","product_handle":"burgess-sensitive-lamb-rice-dry-dog-food-12-5kg","category":"Food, treats & toppers","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"486a769d-2c8f-4f74-93db-484508dc6858","rating":5,"title":"life changing for my Stanley","body":"This has genuinely made a huge difference to my dog's quality of life. Seeing him able to explore and enjoy walks again has been worth every penny. I would definitely recommend it to anyone looking for a reliable mobility aid for a dog with rear leg issues.","reviewer_name":"Genna J","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Over 35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-over-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"483418e6-8d51-48b6-8961-dd3f5b333d5f","rating":5,"title":"Just what my Richmond needed","body":"My old boy richmond needed some extra support brought this along with the joint supplements and the improvement has been amazin. He seems happier and more comfortable in the space of 3 months. Sent Poorly pet a video of the improvement i've seen from him getting off the sofa in pain to running up the garden :)","reviewer_name":"kay D","created_at":"2026-08-06","verified_buyer":false,"product_title":"Knee Brace for Dogs - Joint Support & Injury Recovery","product_handle":"knee-brace-for-dogs-joint-support-injury-recovery","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"43cd0c4b-d738-4595-9d31-8238313b7376","rating":5,"title":"One word... amazing!!","body":"My dachshund was diagnosed with IVDD and lost the use of his back legs. It was such a difficult time, but this wheelchair has helped him get back outside and enjoy life again. It took a few days for him to get used to it, but now he gets excited whenever he sees it. It's lightweight, easy to adjust, and gives him the support he needs without slowing him down. Seeing him wagging his tail on walks again has been amazing. I'm so grateful we found this.","reviewer_name":"Jamie T","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Over 35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-over-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"23dce123-31eb-40c5-baa3-6d10b51dd512","rating":5,"title":"My dog lovesss this","body":"My dog is obsessed with this, he had gone off his food and now I sprinkle this on top he's straight over. Also noticed a real difference in his gut health which is what I originally brought it for. Thanks Poorly pet!","reviewer_name":"Tammy","created_at":"2026-08-06","verified_buyer":false,"product_title":"Chicken Bone Broth Powder for Dogs | Gravy Food Topper","product_handle":"chicken-bone-broth-powder-for-dogs-gravy-food-topper","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"23cbd7ca-10aa-4dd4-a55f-8097d7ebe860","rating":4,"title":"Would love to leave before and after photos....Wow great product","body":"My dogs coat is so shiny, didn't notice too much of a difference at first but after 2 months I can REALLY see the difference so came back and left a review. \n\nWould be good if poorly pet could leave the option to leave photos of before and after hence the 4*.","reviewer_name":"Yasmin","created_at":"2026-08-06","verified_buyer":false,"product_title":"Earth Rated Dog 3-in-1 Shampoo Short Hair Coat","product_handle":"earth-rated-dog-3-in-1-shampoo-short-hair-coat","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"2017dc58-284d-4ab0-8439-39c6f54fa1dd","rating":5,"title":"Gave our little dachshund her independence back","body":"We bought this for our miniature dachshund after she lost most of the movement in her back legs following problems with her spine. We were nervous about ordering a wheelchair online, but we measured her carefully and the frame was straightforward to adjust once it arrived.\n\nIt took her a couple of short sessions to understand what to do, but treats and plenty of encouragement helped. By the third day she was moving around the garden confidently and following us again instead of having to be carried everywhere. The wheelchair is surprisingly light and doesn’t seem to restrict her front legs.\n\nThe biggest difference has been seeing her interested in walks and sniffing around again. She can also go to the toilet while wearing it, which makes things much easier. It does take a little patience to get the straps sitting correctly, but once fitted properly it feels secure without being uncomfortable. Seeing her moving independently again has made it completely worth it.","reviewer_name":"Reanne S","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Under 4kg","product_handle":"adjustable-dog-wheelchair-for-dogs-under-4kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"2001346f-0a41-4e81-b3e1-a3926fba5f7a","rating":5,"title":"","body":"Really good product, got 10% off as it was my first order as well. Came well packaged, delivery good and fast. Would 100% recommend this wheelchair, love that it adjusts! Good price point as well.","reviewer_name":"Dawn","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Under 4kg","product_handle":"adjustable-dog-wheelchair-for-dogs-under-4kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"1d5fc225-7e83-48e6-b0a8-973bf2fb7ad7","rating":5,"title":"","body":"Can't fault","reviewer_name":"Yang","created_at":"2026-08-06","verified_buyer":false,"product_title":"Adjustable Dog Wheelchair - For Dogs Over 35kg","product_handle":"adjustable-dog-wheelchair-for-dogs-over-35kg","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"15aa113f-1988-4789-b698-93d4de127c0e","rating":5,"title":"Solid frame and easy to move","body":"Bought for our 30kg crossbreed after surgery left him with reduced movement in his back legs. It took a few adjustments to get the balance right, but the frame now supports him well and the wheels move smoothly on paths and grass.\n\nThe straps are comfortable, although we added a little extra padding around one area because he has very sensitive skin. Overall, it is a sturdy wheelchair at a much more manageable price than many alternatives.","reviewer_name":"Seb","created_at":"2026-08-06","verified_buyer":false,"product_title":"FreedomRoll Adjustable Dog Wheelchair - Mobility Support","product_handle":"freedomroll-adjustable-dog-wheelchair-mobility-support","category":"Mobility & recovery aids","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"123d26ef-fbe0-496c-8b55-4b9836255b5a","rating":4,"title":"","body":"Love the bundles saves me some ££","reviewer_name":"David","created_at":"2026-08-06","verified_buyer":false,"product_title":"Knuckling Bundle","product_handle":"knuckling-bundle","category":"Condition bundles","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"123cd8b3-8fb2-48ca-bba3-25155f907224","rating":4,"title":"Great","body":"Good stuff and good price compared to other places","reviewer_name":"Matt Blanks","created_at":"2026-08-06","verified_buyer":false,"product_title":"2-in-1 Dog Shampoo & Conditioner with Lavender & Jojoba","product_handle":"2-in-1-dog-shampoo-conditioner-with-lavender-jojoba","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"10e567ab-94c3-4b4f-86f4-2f3007e4c74a","rating":5,"title":"Love this","body":"Happy dog = happy owner. Thanks poorly pet :)","reviewer_name":"Mary Gerr","created_at":"2026-08-06","verified_buyer":false,"product_title":"Apple Cider Vinegar Supplement for Dogs 500ml","product_handle":"apple-cider-vinegar-supplement-for-dogs-500ml","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"0f42bf4e-3c85-46b3-a5bc-57b4f0b10149","rating":4,"title":"Helped my dogs skin","body":"Brought this a long with other items and this has done what it says my dogs skin is so much better, less flaky which means less itching","reviewer_name":"Amie Fulham","created_at":"2026-08-06","verified_buyer":false,"product_title":"Oatmeal Dog Shampoo for Sensitive Skin - 500ml","product_handle":"oatmeal-dog-shampoo-for-sensitive-skin-500ml","category":"Shampoo & grooming","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"29a035b2-bc34-42df-8915-5bd487cc27c8","rating":5,"title":"","body":"Happy","reviewer_name":"alison","created_at":"2026-07-13","verified_buyer":false,"product_title":"Self-Heating Pet Pad","product_handle":"self-heating-pet-pad-no-electricity-needed-48x38cm","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"96f796a7-33fe-4c9d-bef2-417d40a83200","rating":5,"title":"Great product","body":"Worked really well for my dogs joints, noticed an improvement in around 2 weeks.","reviewer_name":"Sue","created_at":"2026-07-07","verified_buyer":false,"product_title":"100% Natural Chicken Nibbles for Dogs & Cats | 100g","product_handle":"100-natural-chicken-nibbles-for-dogs-cats-100g","category":"Food, treats & toppers","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"9b5bdff9-812d-4261-8754-b70cd063487e","rating":5,"title":"","body":"Hab schnell eine Besserung bemerkt","reviewer_name":"Birgit David","created_at":"2026-06-02","verified_buyer":false,"product_title":"MSM Powder for Dogs & Cats - Joint & Coat Support 300g","product_handle":"msm-powder-for-dogs-cats-joint-coat-support-300g","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"5f364570-b61f-4005-98af-9cca4afe2c59","rating":5,"title":"","body":"Zur Wirksamkeit kann ich noch nichts sagen er bekommt es erst seit 2 Wochen","reviewer_name":"Ingrid","created_at":"2026-05-31","verified_buyer":false,"product_title":"MSM Powder for Dogs & Cats - Joint & Coat Support 300g","product_handle":"msm-powder-for-dogs-cats-joint-coat-support-300g","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"4866ec48-f7de-4609-b850-62ad1bf9d13c","rating":5,"title":"","body":"Meine beiden Senioren bekommen es und vertragen es sehr gut.","reviewer_name":"Erika Niggemann","created_at":"2026-05-30","verified_buyer":false,"product_title":"MSM Powder for Dogs & Cats - Joint & Coat Support 300g","product_handle":"msm-powder-for-dogs-cats-joint-coat-support-300g","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"f709259d-af3f-46e3-b539-b937bc5ef936","rating":4,"title":"Fingers crossed!","body":"We've only been using this for a few days so it's hard to tell if it's doing much good yet, but my little dog is happy to eat the food with a bit of this added so that's a definite plus.There real test will be in the summer months, I'm just hoping it helps a bit, I'm not expecting miracles, but would be nice to see her a little less uncomfortable in-between taking her medications.Would I recommend? I can't say if it works or not yet, but at this price I'd say it's worth a try just to see if it helps your itchy best friend. So yes, currently I'm happy to recommend.","reviewer_name":"N D.","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"d0677439-6b1e-4b18-b02a-0b2ac128ed30","rating":5,"title":"Very Happy","body":"We've ordered a few of Our Dogs Life liquid supplements and been really happy with them all and this is no exception.  You're getting a good sized 200ml bottle here. Our girl isn’t a fussy eater at all so hiding this in her food works very well for us as she happily eats away blissfully unaware.  It is very easy to use and measure out with the built in pump dispenser and no mess at all.  So far so good and she’s already showing signs of being happier since starting to take it.","reviewer_name":"souvlaki space station","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"9d0d9fed-2893-4185-baf1-43df567f53e9","rating":5,"title":"Could do with being more descriptive","body":"Whilst you can work out that this is meant to be put in with food, its not well advertised and can see some people rubbing this in the skin as there is only 1 image on the whole ad stating this and even then, it just says feeding guide and a ml dosage.Time will tell if this works, will be the 3rd or 4th thing i have tried from Amazon to stop the dog from itching, fingers crossed and will report back if it works or not in a month or so.","reviewer_name":"XenomorphUK","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"53265e21-bc70-44f2-b104-c97fca7dbdf4","rating":4,"title":"our dog seems happy with this being applied.","body":"it's hard to quantify the effect of this kind of product,  but when using it on our dog, she accepts it well enough, but isn't obsessive about trying to lick it back off again (some products, she does this)it seems like it's soothing on the skin for her. we have tried a lot of itch products with her, and this seems alright.","reviewer_name":"Mrs. Sheena leversedge -. Wood","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"52b09013-141e-4d15-af56-72843112f4c1","rating":4,"title":"Could be a better bottle but seems okay with the dog","body":"Our dog hasn't truned her nose up at her food after we;ve added some of this so that's all good. It's also a bit soon to tell if it's workign yet and it's not quite the right season for my dog's allergies but I will update this review later if I find any improvement.What I'm not so keen on is the bottle. Firstly the instructions are a bit lacking aalthough there is lots of information about the ingredients which is good. I don't think the design of the pump is that great though. It says that the pump dispenses 2 ml but for my dog I need to add 0.5 ml to her food, which makes this a bit of a guessing game as to how much I have to dispense. I suppose in time I will get it right but at the moment I'm not sure if I'm giving her too little or too much.Anyway, apart from that this product looks okay. It's vegan, non-gmo, ethically farmed and all natural ingredients.","reviewer_name":"Amazon Reviewer","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me, imported from Amazon"},
    {"id":"52222598-ec9e-4f06-b8bd-49f7ffac165d","rating":4,"title":"Dog seems to like it","body":"200ml Allergy & Itch Relief DropsThe bottle comes with a pump that dispenses the drops cleanly. My dog is 33 kgs so he gets 3 ml per day. I just squirt it on his food and mix it up. I was worried that he may not like it as he can be fussy but he has been eating his food as per usual. I can't comment on effectiveness yet as it's too soon but I will update when I can.","reviewer_name":"Amazon Review Princess","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":1,"is_shop_review":false,"source":"Judge.me, imported from Amazon"},
    {"id":"2dd7bfb2-e525-4c41-9102-407769ac4231","rating":4,"title":"Good product for dog skin relief.","body":"Good product for dog skin relief.Lovely product but not sure if it will work only time will tell.There is two things I am not sure about with this product.1. it has a strong odor (and my dog is really fussy)2. it is quite difficult if you have got a small dog to work out how to get such a small dosage out of the bottle without wasting too much.Great value for money if it works.","reviewer_name":"THE1RAT","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":3,"is_shop_review":false,"source":"Judge.me, imported from Amazon"},
    {"id":"03accf42-4d2b-4de8-a4bc-e1be198ffbdf","rating":4,"title":"No issues","body":"Nice bottle with pump. Added to food with no issues. No flare ups currently so difficult to ascertain efficacy, but no ill effects.","reviewer_name":"Saga","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"018a13af-06be-4423-bddc-0b83080d28de","rating":4,"title":"Nice idea but not yet sure of results","body":"Our dog itches occasionally and we are always unsure if it's an allergy or not. We thought this would be good to have on hand to test. She doesn't like or not like the topping - it just went on like a plain topping and she ate it unfazed.It's really hard to tell how effective this has been but I will update this review after some time with any changes.","reviewer_name":"CMD","created_at":"2026-04-23","verified_buyer":false,"product_title":"Dog Itch & Allergy","product_handle":"dog-itch-allergy-relief-drops","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"d44d695c-d9a0-4ad1-a741-4510744aa116","rating":5,"title":"","body":"My cat loves hers, zip on one end so easy to wash and washed up nicely would buy again","reviewer_name":"colette mason","created_at":"2026-04-12","verified_buyer":false,"product_title":"Self-Heating Pet Pad","product_handle":"self-heating-pet-pad-no-electricity-needed-48x38cm","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"ea1cf760-b840-4572-9d72-698c7149aff9","rating":5,"title":"","body":"Fab cosy pad for bottom of pet crate.Makes it more snug underneath a pet blanket.","reviewer_name":"richie ritch","created_at":"2026-04-05","verified_buyer":false,"product_title":"Self-Heating Pet Pad","product_handle":"self-heating-pet-pad-no-electricity-needed-48x38cm","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"a8f3b572-5cf4-4229-978d-c9b481bfcce3","rating":5,"title":"","body":"Sehr gut.","reviewer_name":"Ralf Kroeller","created_at":"2026-03-13","verified_buyer":false,"product_title":"MSM Powder for Dogs & Cats - Joint & Coat Support 300g","product_handle":"msm-powder-for-dogs-cats-joint-coat-support-300g","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"ea24ce0f-e1e8-4220-a22c-7a6a631bb8a7","rating":5,"title":"","body":"This seems to have helped my dog with his healing from and injury. I didn't want to give him strong meds, it's helped reduce inflammation and managed his pain. I noticed it started working after a week with my dog and when I stopped giving it to him for 2 days to see if he still needed it I noticed he started to struggle with pain and inflammation again. He also doesn't mind the taste he takes it on his food without him spitting it out as he usually does with other meds or supplements, he is an extremely fussy eater sniffs everything carefully before every bite.","reviewer_name":"Melinda Constantinou","created_at":"2026-02-11","verified_buyer":false,"product_title":"MSM Powder for Dogs & Cats - Joint & Coat Support 300g","product_handle":"msm-powder-for-dogs-cats-joint-coat-support-300g","category":"Supplements & health","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"c03c4cbf-14e4-44f4-aea2-a40b98718273","rating":5,"title":"","body":"A good quality blanket - keeps them warm. Washes ok too.","reviewer_name":"Chris Christopher","created_at":"2025-12-21","verified_buyer":false,"product_title":"Self-Heating Pet Pad","product_handle":"self-heating-pet-pad-no-electricity-needed-48x38cm","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"},
    {"id":"4b039ec2-f2ee-430f-9175-9f5db3009c88","rating":5,"title":"","body":"Our cat loves this to sleep in outside in their cat house","reviewer_name":"michael","created_at":"2025-12-09","verified_buyer":false,"product_title":"Self-Heating Pet Pad","product_handle":"self-heating-pet-pad-no-electricity-needed-48x38cm","category":"Beds & comfort","pictures_count":0,"is_shop_review":false,"source":"Judge.me"}
  ]
};

/* ==========================================================================
   Customer reviews: behaviour. One file for all three versions.
   Each page marks its root with data-crv="a" | "b" | "c".
   Product photos, brands and prices come from new-pages/products.js
   (window.PP_PRODUCTS, keyed by Shopify handle). Load it before this file.
   If it is missing, products show a neutral tile instead of a photo.
   ========================================================================== */
(function(){
'use strict';
var D=window.CR_DATA;if(!D)return;
var doc=document,root=doc.querySelector('[data-crv]');
var V=root?root.getAttribute('data-crv'):'';
var RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

function $(s,r){return (r||doc).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||doc).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fdate(iso){var p=String(iso).split('-');return (+p[2])+' '+MON[+p[1]-1]+' '+p[0]}
function one(n){return (Math.round(n*10)/10).toFixed(1)}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
var WORD={5:'Excellent',4:'Great',3:'Okay',2:'Poor',1:'Bad'};
var NUMW={5:'five',4:'four',3:'three',2:'two',1:'one'};

/* ---- product catalogue with photos (products.js), keyed by handle ---- */
var PPM={};
(function(){
  var P=window.PP_PRODUCTS;if(!P)return;
  var arr=Array.isArray(P)?P:Object.keys(P).map(function(k){var o=P[k]||{};if(!o.handle)o.handle=k;return o});
  arr.forEach(function(p){if(p&&p.handle)PPM[p.handle]=p});
})();
function pp(h){return h&&PPM[h]||null}
function money(p){
  if(!p||p.price==null||p.price==='')return '';
  if(typeof p.price==='number')return '£'+p.price.toFixed(2);
  var s=String(p.price);return /£/.test(s)?s:'£'+s;
}
function initial(t){var m=String(t||'').match(/[A-Za-z]/);return m?m[0].toUpperCase():'P'}
function thumb(h,title,cls){
  var p=pp(h),c='crv-th'+(cls?' '+cls:'');
  if(p&&p.img)return '<span class="'+c+'" data-t="'+esc(title||'')+'"><img src="'+esc(p.img)+'" alt="" loading="lazy" decoding="async"></span>';
  return '<span class="'+c+' crv-th--ph" aria-hidden="true"><span>'+(h?esc(initial(title)):'pp')+'</span></span>';
}

/* ---- photos are external (Shopify CDN): if one fails, swap in the placeholder tile ---- */
function phFallback(img){
  var box=img.closest&&img.closest('.crv-th');if(!box||box.classList.contains('crv-th--ph'))return;
  box.classList.add('crv-th--ph');box.setAttribute('aria-hidden','true');
  box.innerHTML='<span>'+esc(initial(box.getAttribute('data-t')||''))+'</span>';
}
doc.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG')phFallback(t)},true);
function checkImgs(r){$$('.crv-th img',r).forEach(function(i){if(i.complete&&!i.naturalWidth&&i.getAttribute('src'))phFallback(i)})}

/* ---- stars: the Judge.me square language from home.css (.tp) ---- */
function tp(r,size){
  var h='<span class="tp'+(size?' '+size:'')+'" aria-hidden="true">';
  for(var i=1;i<=5;i++){
    var f=Math.max(0,Math.min(1,r-(i-1)));
    if(f>=0.99)h+='<i></i>';
    else if(f<=0.01)h+='<i class="off"></i>';
    else h+='<i class="part" style="--f:'+Math.round(f*100)+'%"><b>★</b></i>';
  }
  return h+'</span>';
}
function rstars(r,size){return '<span class="crv-st" role="img" aria-label="Rated '+(Math.round(r*10)/10)+' out of 5">'+tp(r,size||'sm')+'</span>'}

/* ---- the product index: products with reviews here, with Judge.me stats ---- */
var CAT={};D.catalogue.forEach(function(p){CAT[p[1]]={title:p[0],handle:p[1],cat:p[2]}});
var PIDX={},PLIST=[],RBY={};
D.reviews.forEach(function(r){
  RBY[r.id]=r;
  if(!r.product_handle)return;
  var p=PIDX[r.product_handle];
  if(!p){
    var c=CAT[r.product_handle];
    p=PIDX[r.product_handle]={handle:r.product_handle,title:c?c.title:r.product_title,cat:r.category,reviews:[],judge:D.productStats[r.product_handle]||null};
    PLIST.push(p);
  }
  p.reviews.push(r);
});
PLIST.forEach(function(p){
  if(p.judge){p.avg=p.judge.avg;p.count=p.judge.count}
  else{var s=0;p.reviews.forEach(function(r){s+=r.rating});p.avg=s/p.reviews.length;p.count=p.reviews.length}
  if(p.count<p.reviews.length)p.count=p.reviews.length;
});
PLIST.sort(function(a,b){return b.count-a.count||b.avg-a.avg||a.title.localeCompare(b.title)});
function product(h){
  if(!h)return null;
  if(PIDX[h])return PIDX[h];
  var c=CAT[h]||(pp(h)?{title:pp(h).title,handle:h}:null);if(!c)return null;
  return {handle:h,title:c.title,cat:c.cat,reviews:[],avg:0,count:0};
}
function ptitle(r){var p=r.product_handle&&PIDX[r.product_handle];return p?p.title:r.product_title}

/* ---- filtering and sorting ---- */
var SORTS={
  newest:function(a,b){return a.created_at<b.created_at?1:a.created_at>b.created_at?-1:0},
  highest:function(a,b){return b.rating-a.rating||SORTS.newest(a,b)},
  lowest:function(a,b){return a.rating-b.rating||SORTS.newest(a,b)}
};
function select(st){
  return D.reviews.filter(function(r){
    return (!st.stars||r.rating===st.stars)&&(!st.product||r.product_handle===st.product);
  }).sort(SORTS[st.sort||'newest']);
}
var STARS_HELD=[5,4,3,2,1].filter(function(s){return D.reviews.some(function(r){return r.rating===s})});

/* ---- one review card ---- */
var CLAMP=230;
function shortText(t){
  if(t.length<=CLAMP+50)return null;
  var s=t.slice(0,CLAMP),i=s.lastIndexOf(' ');if(i>120)s=s.slice(0,i);
  return s.replace(/[\s,.;:\-]+$/,'')+'…';
}
function paras(t){return t.split(/\n+/).filter(Boolean).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')}
function prodLine(r){
  if(!r.product_handle)return '<div class="crv-prod">'+thumb(null,'')+'<span class="crv-pn">A review of the Poorly Pet shop</span></div>';
  var t=ptitle(r);
  return '<div class="crv-prod">'+thumb(r.product_handle,t)+'<a class="crv-pn" href="#">'+esc(t)+'</a>'+
    '<button type="button" class="crv-rt" data-crv-write="'+esc(r.product_handle)+'" aria-label="Review '+esc(t)+'">Review this</button></div>';
}
function card(r,o){
  o=o||{};
  var sh=shortText(r.body),bid='crv-b-'+r.id;
  return '<article class="crv-card'+(o.cls?' '+o.cls:'')+'">'+
    '<div class="crv-meta">'+rstars(r.rating)+(r.verified_buyer?'<span class="crv-ver">Verified buyer</span>':'')+
      '<time class="crv-date" datetime="'+esc(r.created_at)+'">'+fdate(r.created_at)+'</time></div>'+
    (r.title?'<h3 class="crv-t">'+esc(r.title)+'</h3>':'')+
    '<div class="crv-body" id="'+bid+'">'+(sh?'<p>'+esc(sh)+'</p>':paras(r.body))+'</div>'+
    (sh?'<button type="button" class="crv-more" aria-expanded="false" aria-controls="'+bid+'" data-id="'+esc(r.id)+'">Read more</button>':'')+
    '<p class="crv-by">'+esc(r.reviewer_name||'Anonymous')+'</p>'+
    (o.noProd?'':prodLine(r))+
  '</article>';
}
doc.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.crv-more');if(!b)return;
  var r=RBY[b.dataset.id],body=doc.getElementById(b.getAttribute('aria-controls'));if(!r||!body)return;
  var open=b.getAttribute('aria-expanded')!=='true';
  body.innerHTML=open?paras(r.body):'<p>'+esc(shortText(r.body))+'</p>';
  b.setAttribute('aria-expanded',open?'true':'false');b.textContent=open?'Show less':'Read more';
});

/* ---- paged list: shows N, "Show more" adds N and moves focus to the first new card ---- */
function Pager(list,more,page,render,after){
  var items=[],shown=0;
  function add(focus){
    var from=shown,to=Math.min(items.length,shown+page),h='';
    for(var i=from;i<to;i++)h+=render(items[i]);
    list.insertAdjacentHTML('beforeend',h);shown=to;
    if(more)more.hidden=shown>=items.length;
    if(after)after(shown,items.length,from);
    if(focus){var c=list.children[from];if(c){c.setAttribute('tabindex','-1');c.focus({preventScroll:false})}}
  }
  if(more)more.addEventListener('click',function(){add(true)});
  this.set=function(arr){items=arr;shown=0;list.innerHTML='';add(false)};
}

/* ---- rating split: real Judge.me distribution (all 101 reviews) ---- */
var HIST=[5,4,3,2,1].map(function(s){return D.summary.histogram[s]||0});
function histHTML(){
  var t=D.summary.number_of_reviews,h='<ul class="crv-hist" aria-label="How the '+t+' reviews split">';
  [5,4,3,2,1].forEach(function(s,i){
    var n=HIST[i],pc=t?n/t*100:0;
    h+='<li><span class="crv-hs">'+s+' <span aria-hidden="true">★</span><span class="sr"> stars</span></span>'+
      '<span class="crv-hb" aria-hidden="true"><i style="width:'+pc.toFixed(1)+'%"></i></span><span class="crv-hn">'+n+'</span></li>';
  });
  return h+'</ul>';
}

/* ---- star filter chips and sort ---- */
function chips(el,st,onChange){
  var opts=[0].concat(STARS_HELD);
  el.innerHTML=opts.map(function(s){
    return '<button type="button" class="crv-chip" data-s="'+s+'" aria-pressed="'+(st.stars===s)+'">'+(s?s+' <span aria-hidden="true">★</span><span class="sr"> star</span>':'All')+'</button>';
  }).join('');
  el.addEventListener('click',function(e){
    var b=e.target.closest('.crv-chip');if(!b)return;
    st.stars=+b.dataset.s;
    $$('.crv-chip',el).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    onChange();
  });
}
function statusText(n,st){
  var w=st.stars?NUMW[st.stars]+'-star ':'';
  return n?'Showing '+n+' '+w+'review'+(n===1?'':'s'):'No '+w+'reviews here yet';
}

/* ---- fill the shared counters in the page ---- */
$$('[data-crv-avg]').forEach(function(e){e.textContent=one(D.summary.average_rating)});
$$('[data-crv-count]').forEach(function(e){e.textContent=D.summary.number_of_reviews});
$$('[data-crv-loaded]').forEach(function(e){e.textContent=D.reviews.length});
$$('[data-crv-stars]').forEach(function(e){e.innerHTML=rstars(D.summary.average_rating,e.getAttribute('data-crv-stars'))});
$$('[data-crv-hist]').forEach(function(e){e.innerHTML=histHTML()});

/* ==========================================================================
   WRITE A REVIEW: one modal, four short steps, then a thank you.
   Opened by any element with [data-crv-write]; a value is a product handle
   and preselects that product (the flow then starts at the stars).
   ========================================================================== */
var M=(function(){
  var TOTAL=4;
  var wrap=doc.createElement('div');
  wrap.className='crv-modal'+(V?' crv-m-'+V:'');wrap.id='crv-modal';wrap.hidden=true;
  var stars='';for(var s=1;s<=5;s++)stars+='<input type="radio" class="sr" name="crv-rating" id="crv-r'+s+'" value="'+s+'"><label for="crv-r'+s+'" data-v="'+s+'"><span class="sr">'+s+' star'+(s>1?'s':'')+', '+WORD[s]+'</span></label>';
  wrap.innerHTML=
  '<div class="crv-mbg" data-crv-close></div>'+
  '<div class="crv-mp" role="dialog" aria-modal="true" aria-labelledby="crv-h1">'+
    '<div class="crv-mtop">'+
      '<div class="crv-prog"><span class="crv-pl" id="crv-pl">Step 1 of 4</span><span class="crv-pbar" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>'+
      '<button type="button" class="crv-x" data-crv-close aria-label="Close"><span aria-hidden="true"></span></button>'+
    '</div>'+
    '<form class="crv-mf" novalidate>'+
      '<div class="crv-mbody">'+
        '<section class="crv-step" data-step="1">'+
          '<h2 class="crv-mh" id="crv-h1" tabindex="-1">Which product are you reviewing?</h2>'+
          '<p class="crv-ms">Search, or pick one of our most reviewed.</p>'+
          '<div class="crv-srch"><span class="mag" aria-hidden="true"></span><label class="sr" for="crv-q">Search products</label>'+
            '<input id="crv-q" type="search" autocomplete="off" placeholder="Search products, e.g. wheelchair" role="combobox" aria-expanded="true" aria-controls="crv-opts" aria-autocomplete="list"></div>'+
          '<p class="crv-oh" id="crv-oh">Most reviewed</p>'+
          '<ul class="crv-opts" id="crv-opts" role="listbox" aria-labelledby="crv-oh"></ul>'+
          '<p class="crv-err" id="crv-e1" role="alert"></p>'+
        '</section>'+
        '<section class="crv-step" data-step="2" hidden>'+
          '<div class="crv-chosen"></div>'+
          '<h2 class="crv-mh" id="crv-h2" tabindex="-1">How would you rate it?</h2>'+
          '<fieldset class="crv-rate"><legend class="sr">Your rating</legend><div class="crv-rrow" data-v="0">'+stars+'</div></fieldset>'+
          '<p class="crv-rw" aria-hidden="true">Tap a star</p>'+
          '<p class="crv-err" id="crv-e2" role="alert"></p>'+
        '</section>'+
        '<section class="crv-step" data-step="3" hidden>'+
          '<div class="crv-chosen"></div>'+
          '<h2 class="crv-mh" id="crv-h3" tabindex="-1">Tell other owners how it went</h2>'+
          '<div class="crv-f"><label for="crv-title">Headline <span>(optional)</span></label><input id="crv-title" type="text" maxlength="100" placeholder="Sum it up in a few words"></div>'+
          '<div class="crv-f"><label for="crv-body">Your review</label><textarea id="crv-body" rows="6" maxlength="5000" placeholder="What did you buy it for, and how has it helped?" aria-describedby="crv-e3"></textarea><p class="crv-err" id="crv-e3"></p></div>'+
        '</section>'+
        '<section class="crv-step" data-step="4" hidden>'+
          '<h2 class="crv-mh" id="crv-h4" tabindex="-1">Nearly done</h2>'+
          '<p class="crv-ms">Use the email you ordered with and your review is marked verified.</p>'+
          '<div class="crv-f"><label for="crv-name">Your name</label><input id="crv-name" type="text" autocomplete="name" maxlength="60" placeholder="Shown with your review" aria-describedby="crv-e4n"><p class="crv-err" id="crv-e4n"></p></div>'+
          '<div class="crv-f"><label for="crv-email">Email</label><input id="crv-email" type="email" autocomplete="email" inputmode="email" placeholder="Never shown" aria-describedby="crv-e4e"><p class="crv-err" id="crv-e4e"></p></div>'+
          '<div class="crv-f"><span class="crv-fl" id="crv-phl">Photos <span>(optional, up to 5)</span></span>'+
            '<div class="crv-ph"><label class="crv-add" for="crv-file"><span aria-hidden="true">+</span> Add photos</label><input id="crv-file" class="sr" type="file" accept="image/*" multiple aria-labelledby="crv-phl"><ul class="crv-thumbs" aria-label="Chosen photos"></ul></div>'+
            '<p class="crv-err" id="crv-e4p" role="alert"></p></div>'+
        '</section>'+
        '<section class="crv-step crv-thx" data-step="5" hidden>'+
          '<span class="crv-tick" aria-hidden="true"></span>'+
          '<h2 class="crv-mh" id="crv-h5" tabindex="-1">Thank you</h2>'+
          '<p class="crv-ms crv-thx-s"></p>'+
          '<div class="crv-club"><b>50 Club points</b><span>go to your Poorly Pet Club account once we match your email to an order and mark the review verified.</span></div>'+
        '</section>'+
      '</div>'+
      '<div class="crv-mnav">'+
        '<button type="button" class="crv-back">Back</button>'+
        '<button type="submit" class="btn sec crv-next">Next</button>'+
        '<button type="button" class="crv-again" hidden>Review another</button>'+
        '<button type="button" class="btn sec crv-done" data-crv-close hidden>Done</button>'+
      '</div>'+
    '</form>'+
  '</div>';
  doc.body.appendChild(wrap);

  var panel=$('.crv-mp',wrap),form=$('form',wrap),q=$('#crv-q',wrap),opts=$('#crv-opts',wrap),oh=$('#crv-oh',wrap);
  var back=$('.crv-back',wrap),next=$('.crv-next',wrap),again=$('.crv-again',wrap),done=$('.crv-done',wrap);
  var row=$('.crv-rrow',wrap),rw=$('.crv-rw',wrap),mbody=$('.crv-mbody',wrap);
  var inp={title:$('#crv-title',wrap),body:$('#crv-body',wrap),name:$('#crv-name',wrap),email:$('#crv-email',wrap),file:$('#crv-file',wrap)};
  var st={step:1,product:null,rating:0,files:[],sent:false},opener=null,items=[],act=-1,closeT=null;

  /* step 1: product search with thumbnails */
  function words(s){return s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(' ').filter(Boolean)}
  var ALL=D.catalogue.map(function(c){return c[1]});
  PLIST.forEach(function(p){if(!CAT[p.handle])ALL.push(p.handle)});
  function search(v){
    var w=words(v);if(!w.length)return PLIST.slice(0,8);
    var res=[];
    ALL.forEach(function(h){
      var p=product(h);if(!p)return;
      var t=p.title.toLowerCase(),ok=w.every(function(x){return t.indexOf(x)>-1});
      if(ok)res.push({p:p,sc:(t.indexOf(w[0])===0?2:0)+(p.count?1:0)});
    });
    return res.sort(function(a,b){return b.sc-a.sc||b.p.count-a.p.count||a.p.title.localeCompare(b.p.title)}).slice(0,8).map(function(x){return x.p});
  }
  function drawOpts(){
    var v=q.value.trim();items=search(v);act=-1;q.removeAttribute('aria-activedescendant');
    oh.textContent=v?(items.length?'Matching products':'No products match “'+v+'”'):'Most reviewed';
    opts.innerHTML=items.map(function(p,i){
      var sel=st.product&&st.product.handle===p.handle;
      return '<li role="option" id="crv-o'+i+'" data-i="'+i+'" aria-selected="'+(sel?'true':'false')+'">'+thumb(p.handle,p.title)+
        '<span class="crv-ot"><b>'+esc(p.title)+'</b><span>'+(p.count?tp(p.avg,'xs')+' '+one(p.avg)+' · '+plural(p.count,'review'):'Be the first to review it')+'</span></span></li>';
    }).join('');
  }
  function moveAct(d){
    if(!items.length)return;
    act=(act+d+items.length)%items.length;
    $$('[role=option]',opts).forEach(function(o,i){o.classList.toggle('act',i===act)});
    var o=$('#crv-o'+act,opts);q.setAttribute('aria-activedescendant',o.id);o.scrollIntoView({block:'nearest'});
  }
  q.addEventListener('input',drawOpts);
  q.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();moveAct(1)}
    else if(e.key==='ArrowUp'){e.preventDefault();moveAct(-1)}
    else if(e.key==='Enter'&&act>-1){e.preventDefault();pick(items[act])}
  });
  opts.addEventListener('click',function(e){var li=e.target.closest('[role=option]');if(li)pick(items[+li.dataset.i])});
  function pick(p){if(!p)return;setProduct(p);err(1,'');go(2)}
  function setProduct(p){
    st.product=p;
    var h=p?'<div class="crv-chip-p">'+thumb(p.handle,p.title)+'<span><small>Reviewing</small><b>'+esc(p.title)+'</b></span>'+
      '<button type="button" class="crv-change">Change</button></div>':'';
    $$('.crv-chosen',wrap).forEach(function(c){c.innerHTML=h});
  }
  wrap.addEventListener('click',function(e){if(e.target.closest('.crv-change')){go(1);q.focus()}});

  /* step 2: big stars */
  var viaPointer=false,advT=null;
  function paint(v){row.setAttribute('data-v',v||0);rw.textContent=v?WORD[v]:'Tap a star'}
  row.addEventListener('pointerdown',function(){viaPointer=true});
  row.addEventListener('mouseover',function(e){var l=e.target.closest('label');if(l)paint(+l.dataset.v)});
  row.addEventListener('mouseleave',function(){paint(st.rating)});
  row.addEventListener('change',function(e){
    st.rating=+e.target.value;paint(st.rating);err(2,'');
    clearTimeout(advT);
    if(viaPointer){advT=setTimeout(function(){if(st.step===2)go(3)},RM?150:420)}
    viaPointer=false;
  });

  /* step 4: photos */
  var thumbs=$('.crv-thumbs',wrap);
  function drawThumbs(){
    thumbs.innerHTML=st.files.map(function(x,i){return '<li><img src="'+x.url+'" alt=""><button type="button" data-i="'+i+'" aria-label="Remove photo '+(i+1)+'">×</button></li>'}).join('');
  }
  inp.file.addEventListener('change',function(){
    var msg='';
    Array.prototype.forEach.call(inp.file.files,function(f){
      if(!/^image\//.test(f.type)){msg='Photos only, please (JPG or PNG).';return}
      if(f.size>10*1024*1024){msg='Each photo needs to be under 10MB.';return}
      if(st.files.length>=5){msg='Up to 5 photos.';return}
      st.files.push({file:f,url:URL.createObjectURL(f)});
    });
    inp.file.value='';drawThumbs();err('4p',msg);
  });
  thumbs.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;var i=+b.dataset.i;
    URL.revokeObjectURL(st.files[i].url);st.files.splice(i,1);drawThumbs();
    var nb=$('button',thumbs);(nb||$('.crv-add',wrap)).focus();
  });
  $('.crv-add',wrap).addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.file.click()}});
  $('.crv-add',wrap).setAttribute('tabindex','0');$('.crv-add',wrap).setAttribute('role','button');

  /* validation */
  function err(k,m){
    var e=$('#crv-e'+k,wrap);if(e)e.textContent=m||'';
    var map={3:inp.body,'4n':inp.name,'4e':inp.email};
    if(map[k])map[k].setAttribute('aria-invalid',m?'true':'false');
    return !m;
  }
  function valid(n){
    if(n===1)return err(1,st.product?'':'Pick the product you bought to carry on.')||(q.focus(),false);
    if(n===2)return err(2,st.rating?'':'Tap a star to rate it.')||($('input[name=crv-rating]',wrap).focus(),false);
    if(n===3){var b=inp.body.value.trim();return err(3,b.length<3?'Write a few words about how it went.':'')||(inp.body.focus(),false)}
    if(n===4){
      var nm=err('4n',inp.name.value.trim()?'':'Add your name, first name is fine.');
      var em=inp.email.value.trim(),okE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
      var e2=err('4e',em?(okE?'':'That email doesn’t look right.'):'Add your email so we can check your order.');
      if(!nm){inp.name.focus();return false}
      if(!e2){inp.email.focus();return false}
      return true;
    }
    return true;
  }

  /* moving between steps */
  function go(n){
    st.step=n;
    $$('.crv-step',wrap).forEach(function(s){
      var on=+s.dataset.step===n;s.hidden=!on;
      if(on&&!RM){s.classList.remove('in');void s.offsetWidth;s.classList.add('in')}
    });
    var thx=n===5;
    $('#crv-pl',wrap).textContent=thx?'All done':'Step '+n+' of '+TOTAL;
    $$('.crv-pbar i',wrap).forEach(function(i,k){i.classList.toggle('on',k<n)});
    back.hidden=thx||n===1;next.hidden=thx;again.hidden=!thx;done.hidden=!thx;
    next.textContent=n===4?'Post review':'Next';
    panel.setAttribute('aria-labelledby','crv-h'+n);
    if(n===1)drawOpts();
    if(n===2)paint(st.rating);
    mbody.scrollTop=0;
    var h=$('#crv-h'+n,wrap);if(h&&!wrap.hidden)h.focus({preventScroll:true});
  }
  back.addEventListener('click',function(){if(st.step>1)go(st.step-1)});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(st.step<4){if(valid(st.step))go(st.step+1);return}
    if(!valid(4))return;
    var review={
      platform:'shopify',
      product_handle:st.product.handle,product_title:st.product.title,
      rating:st.rating,title:inp.title.value.trim(),body:inp.body.value.trim(),
      name:inp.name.value.trim(),email:inp.email.value.trim(),
      pictures:st.files.map(function(x){return x.file})
    };
    /* ------------------------------------------------------------------
       JUDGE.ME REVIEW SUBMISSION PLUGS IN HERE.
       Live, send `review` to Judge.me instead of stopping here:
         POST https://judge.me/api/v1/reviews
           { shop_domain:'<store>.myshopify.com', platform:'shopify',
             id:<Shopify product id for review.product_handle>,
             name, email, rating, title, body,
             picture_urls:[...] }   // upload the photos first, then pass their URLs
       (the public endpoint Judge.me's own review form uses; no private token
       needed). Show the thank-you only when that request succeeds; on failure
       keep the form and say "That didn't send, please try again."
       Judge.me holds the review for checking, marks it verified if the email
       matches an order, and the Club app then adds the 50 points.
       ------------------------------------------------------------------ */
    if(window.console)console.info('[preview] review not sent anywhere',review);
    st.sent=true;
    var first=review.name.split(' ')[0];
    $('.crv-thx-s',wrap).innerHTML='Thanks, '+esc(first)+'. Your '+review.rating+'-star review of <b>'+esc(review.product_title)+'</b> is with us. It goes live once it’s been checked.';
    go(5);
  });
  again.addEventListener('click',function(){reset();go(1);});

  function reset(){
    form.reset();st.files.forEach(function(x){URL.revokeObjectURL(x.url)});
    st={step:1,product:null,rating:0,files:[],sent:false};
    drawThumbs();setProduct(null);paint(0);q.value='';
    ['1','2','3','4n','4e','4p'].forEach(function(k){err(k,'')});
  }

  /* open / close, focus trap, Esc, backdrop */
  function focusables(){return $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]):not([type=file]),textarea,select,[tabindex="0"]',panel).filter(function(x){return !x.closest('[hidden]')&&x.getClientRects().length})}
  function trap(e){
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key!=='Tab')return;
    var f=focusables();
    var a=f[0],z=f[f.length-1];
    if(!f.length){e.preventDefault();return}
    if(!panel.contains(doc.activeElement)){e.preventDefault();a.focus();return}
    if(e.shiftKey&&doc.activeElement===a){e.preventDefault();z.focus()}
    else if(!e.shiftKey&&doc.activeElement===z){e.preventDefault();a.focus()}
  }
  function open(handle,from){
    clearTimeout(closeT);
    opener=from||doc.activeElement;
    if(st.sent)reset();
    var p=product(handle);
    wrap.hidden=false;doc.documentElement.classList.add('crv-lock');
    requestAnimationFrame(function(){wrap.classList.add('open')});
    if(p){setProduct(p);go(2)}else go(st.product&&st.step>1?st.step:1);
    doc.addEventListener('keydown',trap);
  }
  function close(){
    if(wrap.hidden)return;
    wrap.classList.remove('open');doc.removeEventListener('keydown',trap);clearTimeout(advT);
    closeT=setTimeout(function(){wrap.hidden=true;doc.documentElement.classList.remove('crv-lock')},RM?0:260);
    if(opener&&opener.focus&&doc.contains(opener))opener.focus();
    if(st.sent)reset();
  }
  wrap.addEventListener('click',function(e){if(e.target.closest('[data-crv-close]'))close()});
  doc.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-crv-write]');if(!t||wrap.contains(t))return;
    e.preventDefault();open(t.getAttribute('data-crv-write')||'',t);
  });
  return {open:open,close:close};
})();
window.CRV_WRITE=M;

/* ==========================================================================
   Version A: centred single column
   ========================================================================== */
function initA(){
  var st={stars:0,sort:'newest'},status=$('#crv-status');
  var pg=new Pager($('#crv-list'),$('#crv-more'),8,function(r){return card(r)});
  function run(){var l=select(st);pg.set(l);status.textContent=statusText(l.length,st)}
  chips($('#crv-chips'),st,run);
  $('#crv-sort').addEventListener('change',function(e){st.sort=e.target.value;run()});
  run();
}

/* ==========================================================================
   Version B: product-led. Pick a product, see its reviews.
   ========================================================================== */
function initB(){
  var st={product:'',stars:0,sort:'newest'},picker=$('#crv-picker'),panel=$('#crv-panel'),status=$('#crv-status'),head=$('#crv-lhead');
  function tile(p){
    return '<li><button type="button" class="crv-tile" data-h="'+esc(p?p.handle:'')+'" aria-pressed="'+(p?'false':'true')+'">'+
      (p?thumb(p.handle,p.title):'<span class="crv-th crv-th--all" aria-hidden="true"><span>'+one(D.summary.average_rating)+'</span></span>')+
      '<span class="crv-tn">'+esc(p?p.title:'All products')+'</span>'+
      '<span class="crv-tm">'+(p?tp(p.avg,'xs')+' '+p.count:plural(D.summary.number_of_reviews,'review'))+'</span></button></li>';
  }
  picker.innerHTML=tile(null)+PLIST.map(tile).join('');
  var track=$('#crv-track');
  $$('[data-crv-scroll]').forEach(function(b){b.addEventListener('click',function(){track.scrollBy({left:(+b.dataset.crvScroll)*track.clientWidth*0.8,behavior:RM?'auto':'smooth'})})});
  var ps=$('#crv-psearch');
  ps.addEventListener('input',function(){
    var w=ps.value.toLowerCase().trim(),n=0;
    $$('li',picker).forEach(function(li,i){var t=li.textContent.toLowerCase();var on=!w||i===0||t.indexOf(w)>-1;li.hidden=!on;if(on&&i)n++});
    $('#crv-pcount').textContent=w?(n?plural(n,'product')+' found':'No reviewed products match. You can still review it.'):'';
  });
  picker.addEventListener('click',function(e){
    var b=e.target.closest('.crv-tile');if(!b)return;
    $$('.crv-tile',picker).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    st.product=b.dataset.h;st.stars=0;
    $$('#crv-chips .crv-chip').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.s==='0'?'true':'false')});
    drawPanel();run();
    if(window.innerWidth<900){var t=$('#crv-results');t.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
  });
  function drawPanel(){
    var p=st.product&&PIDX[st.product];
    if(!p){
      panel.innerHTML='<div class="crv-pov">'+
        '<p class="crv-k">All products</p>'+
        '<div class="crv-big"><b>'+one(D.summary.average_rating)+'</b><span>out of 5</span></div>'+
        rstars(D.summary.average_rating,'')+
        '<p class="crv-of"><b>Excellent</b> from '+D.summary.number_of_reviews+' reviews on Judge.me</p>'+histHTML()+
        '<button type="button" class="btn sec wide" data-crv-write>Write a review</button></div>';
      head.textContent='Latest reviews';
      return;
    }
    var x=pp(p.handle),pr=money(x);
    panel.innerHTML='<div class="crv-pcard">'+
      '<div class="crv-well">'+(x&&x.img?'<img src="'+esc(x.img)+'" alt="'+esc(p.title)+'">':'<span class="crv-th crv-th--ph crv-th--xl" aria-hidden="true"><span>'+esc(initial(p.title))+'</span></span>')+'</div>'+
      '<div class="crv-pbody">'+(x&&x.brand?'<p class="crv-brand">'+esc(x.brand)+'</p>':'')+
      '<h2 class="crv-pname">'+esc(p.title)+'</h2>'+
      '<p class="crv-prate">'+rstars(p.avg)+' <b>'+one(p.avg)+'</b> <span>from '+plural(p.count,'review')+'</span></p>'+
      (pr?'<p class="crv-price">'+esc(pr)+'</p>':'')+
      '<a class="btn wide" href="#">View product</a>'+
      '<button type="button" class="crv-rt crv-rt--lg" data-crv-write="'+esc(p.handle)+'">Review this product</button></div></div>';
    head.textContent='Reviews of this product';
  }
  var pg=new Pager($('#crv-list'),$('#crv-more'),6,function(r){return card(r,{noProd:!!st.product})});
  function run(){
    var l=select(st),p=st.product&&PIDX[st.product];
    pg.set(l);
    var t=statusText(l.length,st);
    if(p&&!st.stars&&p.count>l.length)t+=' of '+p.count+' (the rest load from Judge.me on the live site)';
    status.textContent=t;
  }
  chips($('#crv-chips'),st,run);
  $('#crv-sort').addEventListener('change',function(e){st.sort=e.target.value;run()});
  drawPanel();run();
}

/* ==========================================================================
   Version C: C's teal score band on top, then B's product-led showcase
   (choose a product, sticky product panel, that product's reviews),
   drawn with C's review cards, segmented star filter and "Show more".
   ========================================================================== */
function vline(r){
  return '<span class="crv-c-who"><b>'+esc(r.reviewer_name||'Anonymous')+'</b>'+
    (r.verified_buyer?'<span class="crv-c-vb">Verified buyer</span>':'')+
    '<time class="crv-c-vd" datetime="'+esc(r.created_at)+'">'+fdate(r.created_at)+'</time></span>';
}
function pchip(r){
  if(!r.product_handle)return '<span class="crv-c-pc crv-c-pc--shop">'+thumb(null,'')+'<span>Review of the Poorly Pet shop</span></span>';
  var t=ptitle(r);
  return '<a class="crv-c-pc" href="#">'+thumb(r.product_handle,t)+'<span>'+esc(t)+'</span></a>';
}
function cardC(r,noProd){
  var sh=shortText(r.body),bid='crv-b-'+r.id;
  return '<article class="crv-c-card">'+
    '<div class="crv-c-side">'+rstars(r.rating,'sm')+vline(r)+(noProd?'':pchip(r))+'</div>'+
    '<div class="crv-c-main">'+
      (r.title?'<h3 class="crv-c-t">'+esc(r.title)+'</h3>':'')+
      '<div class="crv-body crv-c-b" id="'+bid+'">'+(sh?'<p>'+esc(sh)+'</p>':paras(r.body))+'</div>'+
      (sh?'<button type="button" class="crv-more" aria-expanded="false" aria-controls="'+bid+'" data-id="'+esc(r.id)+'">Read more</button>':'')+
    '</div>'+
  '</article>';
}
function initC(){
  var st={product:'',stars:0,sort:'newest'};
  var picker=$('#crv-picker'),panel=$('#crv-panel'),status=$('#crv-status'),head=$('#crv-lhead');
  var list=$('#crv-list'),ptext=$('#crv-ptext'),pbar=$('#crv-pbar'),res=$('#crv-results');

  /* product tiles: "All products" first, then every reviewed product */
  function tile(p){
    return '<li><button type="button" class="crv-c-tile" data-h="'+esc(p?p.handle:'')+'" aria-pressed="'+(p?'false':'true')+'">'+
      (p?thumb(p.handle,p.title,'crv-c-timg'):'<span class="crv-th crv-c-timg crv-c-tall" aria-hidden="true"><b>'+one(D.summary.average_rating)+'</b></span>')+
      '<span class="crv-c-tn">'+esc(p?p.title:'All products')+'</span>'+
      '<span class="crv-c-tm">'+(p?tp(p.avg,'xs')+'<span>'+one(p.avg)+' · '+p.count+'</span>':'<span>'+plural(D.summary.number_of_reviews,'review')+'</span>')+'</span></button></li>';
  }
  picker.innerHTML=tile(null)+PLIST.map(tile).join('');
  checkImgs(picker);
  var track=$('#crv-track');
  $$('[data-crv-scroll]').forEach(function(b){b.addEventListener('click',function(){track.scrollBy({left:(+b.dataset.crvScroll)*track.clientWidth*0.8,behavior:RM?'auto':'smooth'})})});
  var ps=$('#crv-psearch');
  ps.addEventListener('input',function(){
    var w=ps.value.toLowerCase().trim(),n=0;
    $$('li',picker).forEach(function(li,i){var t=li.querySelector('.crv-c-tn').textContent.toLowerCase();var on=!w||i===0||t.indexOf(w)>-1;li.hidden=!on;if(on&&i)n++});
    track.scrollLeft=0;
    $('#crv-pcount').textContent=w?(n?plural(n,'product')+' found':'No reviewed products match. You can still review it with Write a review.'):'';
  });
  picker.addEventListener('click',function(e){
    var b=e.target.closest('.crv-c-tile');if(!b)return;
    setProduct(b.dataset.h);
    if(res.getBoundingClientRect().top<0||window.innerWidth<900)res.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
  });
  function setProduct(h){
    st.product=h||'';st.stars=0;
    $$('.crv-c-tile',picker).forEach(function(x){x.setAttribute('aria-pressed',x.dataset.h===st.product?'true':'false')});
    $$('.crv-segb',seg).forEach(function(x){x.setAttribute('aria-pressed',x.dataset.s==='0'?'true':'false')});
    drawPanel();run();
  }

  /* the sticky side panel */
  function drawPanel(){
    var p=st.product&&PIDX[st.product];
    if(!p){
      panel.innerHTML='<div class="crv-c-pall">'+
        '<h3 class="crv-c-pname">All products</h3>'+
        '<p class="crv-c-prate">'+rstars(D.summary.average_rating,'sm')+' <b>'+one(D.summary.average_rating)+'</b> <span>from '+plural(D.summary.number_of_reviews,'review')+'</span></p>'+
        '<p class="crv-c-phint">'+PLIST.length+' products have reviews here. Choose one above to see what owners say about it.</p>'+
        '<button type="button" class="btn sec wide" data-crv-write>Write a review</button></div>';
      head.innerHTML='All <em>reviews</em>';
      return;
    }
    var x=pp(p.handle),pr=money(x);
    panel.innerHTML='<div class="crv-c-pcard">'+
      '<div class="crv-c-well">'+(x&&x.img?'<span class="crv-th crv-c-wimg" data-t="'+esc(p.title)+'"><img src="'+esc(x.img)+'" alt="'+esc(p.title)+'"></span>':'<span class="crv-th crv-th--ph crv-c-wimg" aria-hidden="true"><span>'+esc(initial(p.title))+'</span></span>')+'</div>'+
      '<div class="crv-c-pbody">'+(x&&x.brand?'<p class="crv-c-brand">'+esc(x.brand)+'</p>':'')+
      '<h3 class="crv-c-pname">'+esc(p.title)+'</h3>'+
      '<p class="crv-c-prate">'+rstars(p.avg,'sm')+' <b>'+one(p.avg)+'</b> <span>from '+plural(p.count,'review')+'</span></p>'+
      (pr?'<p class="crv-c-price">'+esc(pr)+'</p>':'')+
      '<div class="crv-c-pact"><a class="btn wide" href="#">View product</a>'+
      '<button type="button" class="crv-c-rbtn" data-crv-write="'+esc(p.handle)+'">Review this product</button></div></div></div>';
    checkImgs(panel);
    head.innerHTML='Reviews of <em>this product</em>';
  }

  /* the list */
  var pg=new Pager(list,$('#crv-more'),8,function(r){return cardC(r,!!st.product)},function(n,t){
    ptext.textContent=t?'Showing '+n+' of '+t:'';
    pbar.style.width=(t?n/t*100:0).toFixed(1)+'%';
    $('.crv-c-pager').hidden=!t;
    checkImgs(list);
  });
  function run(){
    var l=select(st),p=st.product&&PIDX[st.product];
    pg.set(l);
    var t=statusText(l.length,st);
    if(p&&!st.stars&&p.count>l.length)t+=' of '+p.count+'; the rest load from Judge.me on the live site';
    status.textContent=t;
    if(!l.length)list.innerHTML='<div class="crv-c-empty"><p>No reviews match this filter yet.</p><button type="button" class="crv-c-reset">Show all stars</button></div>';
  }
  var seg=$('#crv-chips');
  seg.innerHTML=[0].concat(STARS_HELD).map(function(s){
    return '<button type="button" class="crv-segb" data-s="'+s+'" aria-pressed="'+(st.stars===s)+'">'+(s?s+'<span class="crv-segs" aria-hidden="true"></span><span class="sr"> star</span>':'All')+'</button>';
  }).join('');
  function setStars(s){st.stars=s;$$('.crv-segb',seg).forEach(function(x){x.setAttribute('aria-pressed',+x.dataset.s===s?'true':'false')});run()}
  seg.addEventListener('click',function(e){var b=e.target.closest('.crv-segb');if(b)setStars(+b.dataset.s)});
  list.addEventListener('click',function(e){if(e.target.closest('.crv-c-reset'))setStars(0)});
  $('#crv-sort').addEventListener('change',function(e){st.sort=e.target.value;run()});
  drawPanel();run();
}

if(V==='a')initA();else if(V==='b')initB();else if(V==='c')initC();
})();
