/* ==========================================================================
   Poorly Pet FAQs: data + behaviour shared by faqs.html, faqs.html, faqs.html.

   SOURCES (read only, 28 Sep 2026). Every answer below carries a "src:" comment.
   [SHIP]   Shopify shop policy SHIPPING_POLICY "Shipping & Delivery Policy", last updated 22 June 2026
   [REF]    Shopify shop policy REFUND_POLICY "Returns & Refunds Policy", last updated 22 June 2026
   [TERMS]  Shopify shop policy TERMS_OF_SERVICE "Terms & Conditions", last updated 22 June 2026
   [SUBPOL] Shopify shop policy SUBSCRIPTION_POLICY "Cancellations"
   [CO]     Shopify shop policy CONTACT_INFORMATION (Poorly Pet Ltd, company no., registered office)
   [LFAQ]   Live GemPages page /pages/faqs (id 623903678180360734), FAQS array
   [DEL]    Live GemPages page /pages/delivery (id 623903969281835550)
   [SUB]    Live GemPages page /pages/subscription (id 623903433082012190)
   [CONT]   Live GemPages page /pages/contact (id 623880001518830548)
   [TRACK]  Live GemPages page /pages/track-order (id 625131211525718615)
   [PROD]   Shopify Admin products: wheelchair descriptions + variant options (Ortocanis, FreedomRoll);
            vendor list from new-pages/products.js snapshot
   [CLUB]   signed-off/home.html: Club drawer, Club section and account drawer (redesign copy)
   [FOOT]   new-pages/_shell.html footer: payment list, POORLY10, "one working day" reply line
   [STORY]  final/why-poorly-pet.html; [REV] final/customer-reviews.html + shell Judge.me line

   Where the live pages disagree with each other, the dated legal policies win (see report):
   delivery threshold £39 (policy) not £40 (/pages/delivery), dispatch 1-2 working days (policy),
   returns 14 + 14 days with a 30-day guarantee on eligible products (policy), UK only (policy).
   ========================================================================== */
(function(){
'use strict';

var CATS=[
  {id:'orders',  label:'Orders & delivery',  blurb:'Delivery costs, dispatch times, tracking and changing an order.'},
  {id:'returns', label:'Returns & refunds',  blurb:'Your 14-day right to cancel, refunds and faulty items.'},
  {id:'products',label:'Products & sizing',  blurb:'Measuring for wheelchairs and supports, and using supplements.'},
  {id:'payments',label:'Payments & discounts',blurb:'Ways to pay, when you are charged and discount codes.'},
  {id:'club',    label:'Poorly Pet Club',    blurb:'Earning and spending points, and the three tiers.'},
  {id:'subs',    label:'Subscriptions',      blurb:'Subscribe & Save: frequencies, savings and changes.'},
  {id:'account', label:'Your account',       blurb:'Signing in, orders, addresses and your dog’s details.'},
  {id:'about',   label:'About us',           blurb:'Who we are, the brands we stock and how to reach us.'}
];

var M='<a href="mailto:hello@poorly-pet.com">hello@poorly-pet.com</a>';

var FAQS=[
/* ---------------- Orders & delivery ---------------- */
// src: [SHIP] 1 "Where we deliver"
{c:'orders',pop:0,q:'Where do you deliver?',
 a:'<p>We deliver to addresses within the United Kingdom. If you would like to order from outside the UK, please email '+M+' first.</p>'},
// src: [SHIP] 2 "Delivery costs"; £39 threshold also in shell utility bar
{c:'orders',pop:1,q:'How much does delivery cost?',
 a:'<p>Standard UK delivery is <b>free on orders over £39</b>. For orders below £39 a standard delivery charge applies, and it is shown clearly at checkout before you pay.</p>'},
// src: [SHIP] 3 "Dispatch and delivery times"; working-days definition from [DEL] footnote
{c:'orders',pop:1,q:'How long will my order take to arrive?',
 a:'<table class="fq-t"><tr><th scope="row">Dispatch</th><td>Usually within 1 to 2 working days</td></tr><tr><th scope="row">Standard delivery</th><td>Usually 2 to 4 working days after dispatch</td></tr></table><p>The estimate for your order is shown at checkout. Working days are Monday to Friday, excluding UK bank holidays. Please allow extra time during busy periods and around bank holidays.</p>'},
// src: [DEL] "Custom, made-to-order & specialist items" + "Why do some items take longer to arrive?"
{c:'orders',q:'Why is one item taking longer than the rest of my order?',
 a:'<p>A few products, such as made-to-order braces and supports and items from our specialist EU partners, are made or sent directly by the supplier to their own timescales. Where this applies, the expected timeframe is shown on the product page, and the item may arrive in a separate parcel.</p>'},
// src: [SHIP] 4 "Tracking your order"; [TRACK] order number + checkout email form
{c:'orders',pop:1,q:'How do I track my order?',
 a:'<p>Where tracking is available, we email you the tracking details as soon as your order is dispatched. You can also use <a href="#">Track my order</a> with your order number (it is in your order confirmation email) and the email address you used at checkout, or sign in to your account to see all your orders.</p>'},
// src: [LFAQ] "Can I change or cancel my order after placing it?"; [REF] 1 for the 14-day right to cancel
{c:'orders',pop:1,q:'Can I change or cancel my order?',
 a:'<p>If your order has not been dispatched yet, email '+M+' as soon as possible with your order number. We will do our best to change the address or items, or cancel it.</p><p>Once an order has shipped we cannot change it, but you can still cancel under your 14-day right to cancel and return it when it arrives.</p>'},
// src: [SHIP] 6 "Problems with your delivery"; [DEL] "My order hasn't arrived"
{c:'orders',q:'My order hasn’t arrived. What should I do?',
 a:'<p>First check the tracking link in your dispatch email, as most late parcels are running a day behind. If your order has not arrived within the expected timeframe, email '+M+' with your order number and we will put it right.</p>'},
// src: [LFAQ] "My order says delivered but I can't find it"
{c:'orders',q:'Tracking says delivered but I can’t find my parcel.',
 a:'<p>Check the tracking link for any delivery notes, then check with neighbours and any safe places around your home. If you still cannot find it within 24 hours, email '+M+' with your order number and we will investigate with the courier.</p>'},
// src: [SHIP] 5 "Failed or incorrect delivery"
{c:'orders',q:'What happens if my parcel comes back to you?',
 a:'<p>If a parcel is returned to us because of an incorrect address or a missed delivery, we will contact you to arrange redelivery. Redelivery may carry an additional charge, so please check your delivery address carefully at checkout.</p>'},
// src: [LFAQ] "Can I collect my order in person?"
{c:'orders',q:'Can I collect my order in person?',
 a:'<p>No. We are an online-only shop, so every order is sent by courier and we do not offer collection.</p>'},

/* ---------------- Returns & refunds ---------------- */
// src: [REF] 1, 2, 6
{c:'returns',pop:1,q:'What is your returns policy?',
 a:'<ul><li>You can cancel your order within <b>14 days</b> of receiving it, without giving a reason (Consumer Contracts Regulations 2013).</li><li>After telling us, you have a further <b>14 days</b> to send the items back, unused and in their original condition and packaging where possible.</li><li>On top of your legal rights, eligible products come with a <b>30-day money-back guarantee</b>.</li></ul><p>Read the full <a href="#">Returns &amp; Refunds Policy</a>.</p>'},
// src: [REF] 7 "How to start a return"; proof of postage from [LFAQ] "How do I start a return?"
{c:'returns',pop:1,q:'How do I start a return?',
 a:'<p>Email '+M+' with your order number and the items you want to return, and we will guide you through the next steps. Keep your proof of postage until your refund has been processed.</p>'},
// src: [REF] 2 and 5
{c:'returns',q:'Who pays for return postage?',
 a:'<p>If you have changed your mind, the return postage is paid by you. If the item is faulty, damaged or not what you ordered, we cover the return postage.</p>'},
// src: [REF] 3 "Exceptions"
{c:'returns',pop:1,q:'Can I return supplements or other opened items?',
 a:'<p>For hygiene and safety reasons, consumable health products, supplements and perishable items cannot be returned once opened or if any seal is broken, unless they are faulty. This does not affect your statutory rights.</p>'},
// src: [REF] 4 "Refunds"; bank timing note from [LFAQ] "How long do refunds take?"
{c:'returns',pop:1,q:'How long will my refund take?',
 a:'<p>Once we receive your returned item, or proof that you have sent it, we refund you within <b>14 days</b> to your original payment method. Your bank or card provider may take a few extra days to show the money in your account.</p><p>We may reduce a refund to reflect any loss in value caused by handling beyond what is needed to check the goods.</p>'},
// src: [REF] 5 "Faulty or incorrect items"; photo request from [LFAQ] / [DEL]
{c:'returns',q:'My item arrived faulty, damaged or wrong.',
 a:'<p>We are sorry. Email '+M+' with your order number and a photo of the item and its packaging. Under the Consumer Rights Act 2015 we will arrange a replacement or a full refund, including any return postage.</p>'},
// src: [REF] 6 "Our 30-day money-back guarantee"
{c:'returns',q:'How does the 30-day money-back guarantee work?',
 a:'<p>It applies to eligible products and is in addition to your legal rights. If you are not satisfied, get in touch within 30 days of receiving your order and we will make it right.</p>'},
// src: [LFAQ] "I bought a gift — can it be returned by the recipient?"
{c:'returns',q:'Can a gift be returned?',
 a:'<p>Yes, under our normal returns policy. Whoever has the order number can email us to arrange it. Refunds for gift orders go back to the original payment method.</p>'},

/* ---------------- Products & sizing ---------------- */
// src: [PROD] Ortocanis variant option "Distance From Dog's Belly To Ground" per weight band; FreedomRoll "How to Measure Your Dog"
{c:'products',pop:1,q:'How do I measure my dog for a wheelchair?',
 a:'<p>Measure your dog standing naturally on a flat floor. What you need depends on the wheelchair.</p><p><b>Ortocanis adjustable wheelchairs</b>: choose the weight band, then the distance from your dog’s belly to the ground.</p><table class="fq-t fq-t-h"><thead><tr><th scope="col">Weight band</th><th scope="col">Belly to ground options</th></tr></thead><tbody><tr><td>Under 4kg</td><td>0 to 15cm, 15 to 25cm, 25 to 31cm</td></tr><tr><td>4 to 11kg</td><td>7 to 20cm, 20 to 28cm, 28 to 38cm</td></tr><tr><td>11 to 35kg</td><td>25 to 33cm, 33 to 43cm, 43 to 56cm</td></tr><tr><td>Over 35kg</td><td>35 to 43cm, 43 to 51cm, 51 to 64cm</td></tr></tbody></table><p><b>FreedomRoll wheelchair</b> (Large, XL, XXL): take all four measurements and pick the size that fits every one, rather than going by weight or breed.</p><ul><li>Chest: around the widest part of the chest</li><li>Front to back leg length: from the front leg area to the back leg area</li><li>Back leg height: from the floor to the top of the rear leg or hip</li><li>Hip width: across the widest part of the hips</li></ul><p>The full size chart is on each product page. If you are between sizes, email us your measurements.</p>'},
// src: [PROD] FreedomRoll "Suitable for dogs weighing up to 65kg", "Assembly required"; Ortocanis 35kg+ "fitting dogs up to around 70kg"; Ortocanis mini "from under 1kg to 4kg"
{c:'products',q:'Which wheelchair suits my dog’s weight?',
 a:'<ul><li>Ortocanis wheelchairs come in four weight bands: under 4kg (fits from under 1kg), 4 to 11kg, 11 to 35kg, and over 35kg (fits dogs up to around 70kg).</li><li>The FreedomRoll takes dogs up to 65kg in Large, XL and XXL. It needs some assembly when it arrives.</li></ul><p>Weight gets you to the right range; the measurements decide the size.</p>'},
// src: [LFAQ] "How do I find the right size for braces, harnesses or wraps?"
{c:'products',pop:1,q:'How do I find the right size for a brace, harness or recovery suit?',
 a:'<p>Every product that comes in sizes has a size chart on its product page, usually based on measurements such as chest girth, leg circumference or weight. Measure your dog carefully before ordering. If you are between sizes, email '+M+' and we will help you choose.</p>'},
// src: [LFAQ] "How do I know which product is right for my dog?" (tools renamed to the redesign pages)
{c:'products',q:'How do I choose the right product for my dog?',
 a:'<p>Each product page lists the conditions and symptoms it is designed to support. You can also shop by condition or by symptom, take the <a href="dog-health-quiz.html">dog health quiz</a>, or email us and a real person will reply.</p>'},
// src: [LFAQ] "Are your supplements safe to give alongside other medication?"
{c:'products',pop:1,q:'Can I give supplements alongside my dog’s medication?',
 a:'<p>Most of our supplements can be given alongside standard medication, but every dog is different. Check with your vet before starting a new supplement, especially if your dog has a kidney, liver or heart condition or takes prescription medication.</p>'},
// src: [LFAQ] "How long until I see results from supplements or chews?"
{c:'products',q:'How long do supplements take to work?',
 a:'<p>It depends on the product and the dog. Joint supplements usually need 4 to 6 weeks of daily use before you notice a difference. Calming chews and digestive aids can show an effect within a few days to two weeks. Each product page says what to expect.</p>'},
// src: [LFAQ] "My dog won't eat the chews/supplement — any tips?"
{c:'products',q:'My dog won’t eat the supplement. Any tips?',
 a:'<p>Break chews into smaller pieces, or hide them in a little wet food, plain chicken or on a lick mat. Liquid supplements usually work best mixed well into food. If your dog keeps refusing, email us and we can suggest a different format.</p>'},
// src: [LFAQ] "Are your products suitable for cats too?"
{c:'products',q:'Are your products suitable for cats?',
 a:'<p>Some are, particularly skin, digestive and calming products, and this is shown on the product page. Mobility aids such as braces and harnesses are designed for dogs. If you are unsure, ask us before you buy.</p>'},
// src: [LFAQ] "Are your products suitable for puppies or pregnant/nursing dogs?"
{c:'products',q:'Can puppies or pregnant dogs use your products?',
 a:'<p>It varies by product and is noted on each product page. As a rule, check with your vet before giving any supplement to a puppy under 12 months, or to a pregnant or nursing dog.</p>'},
// src: [LFAQ] "What should I do if my dog has a reaction to a product?"
{c:'products',q:'What should I do if my dog reacts to a product?',
 a:'<p>Stop using it and speak to your vet, especially if you notice vomiting, diarrhoea, lethargy, swelling or breathing difficulties. Please also email us so we can look into it.</p>'},
// src: [LFAQ] "How do I store supplements and chews safely?"
{c:'products',q:'How should I store supplements and chews?',
 a:'<p>Somewhere cool and dry, out of direct sunlight, and out of reach of dogs and children. Tasty chews are easy for a dog to eat a whole pack of. Check the use-by date and any storage instructions on the pack.</p>'},

/* ---------------- Payments & discounts ---------------- */
// src: [FOOT] payment list "Ways to pay"; "shown at checkout" from [LFAQ] "What payment methods do you accept?"
{c:'payments',pop:1,q:'Which payment methods do you accept?',
 a:'<p>Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay and Klarna. The options available to you are shown at checkout.</p>'},
// src: [TERMS] 5 "Price and payment"
{c:'payments',q:'When will I be charged?',
 a:'<p>Payment is taken when you place your order. Prices are in pounds sterling and include VAT where applicable. Delivery costs are shown at checkout.</p>'},
// src: [LFAQ] "Is my payment information secure?"
{c:'payments',q:'Is paying on your site secure?',
 a:'<p>Yes. Payments are processed through Shopify’s secure, PCI-DSS compliant checkout. We never see or store your full card details.</p>'},
// src: [FOOT] "Get 10% off your first order. Use code POORLY10 at checkout."; [CLUB] account drawer "Register, 10% off your first order with code POORLY10"
{c:'payments',pop:1,q:'How do I get 10% off my first order?',
 a:'<p>Enter the code <b>POORLY10</b> at checkout on your first order. You can also sign up to our emails at the bottom of any page and we will send you the code.</p>'},
// src: [TERMS] 6 "Your order and our contract"
{c:'payments',q:'When is my order confirmed?',
 a:'<p>You get an acknowledgement email straight after ordering. That confirms we have your order; the sale is confirmed when we send your dispatch confirmation. Occasionally we may have to decline an order, for example if an item is out of stock or priced wrongly.</p>'},
// src: [TERMS] 5 (pricing errors)
{c:'payments',q:'What if a price on the site is wrong?',
 a:'<p>We check prices carefully, but if we find an error in the price of something you have ordered, we will contact you to ask whether you want to go ahead at the correct price.</p>'},
// src: [LFAQ] "Do you offer discounts for multiple dogs or bulk orders?"
{c:'payments',q:'Do you offer discounts for rescues or multi-dog homes?',
 a:'<p>For larger or regular bulk orders, for example for rescues or multi-dog households, email '+M+' and we are happy to talk through options.</p>'},

/* ---------------- Poorly Pet Club ---------------- */
// src: [CLUB] home.html club section "Free to join. Points on every order, money off the next one."
{c:'club',pop:1,q:'What is the Poorly Pet Club?',
 a:'<p>Our free rewards scheme. You earn points on every order and spend them as money off the next one. Join free from the Club button at the top of any page.</p>'},
// src: [CLUB] drawer "How you earn" + club section "Double points on your first order"
{c:'club',pop:1,q:'How do I earn points?',
 a:'<table class="fq-t"><tr><th scope="row">Shopping</th><td>5 points for every £1, added the day your order ships</td></tr><tr><th scope="row">First order</th><td>Double points</td></tr><tr><th scope="row">Reviews</th><td>50 points for a verified Judge.me review</td></tr><tr><th scope="row">Referrals</th><td>500 points when a friend places their first order</td></tr><tr><th scope="row">Birthday</th><td>250 points on your dog’s birthday (set it in your account)</td></tr></table>'},
// src: [CLUB] drawer "Spend on any order: 500 points is £5 off, 1,000 is £10 off, no minimum spend"
{c:'club',pop:1,q:'How do I spend my points?',
 a:'<p>500 points is £5 off and 1,000 points is £10 off. You can use them on any order and there is no minimum spend.</p>'},
// src: [CLUB] drawer "Three tiers"
{c:'club',q:'What are the Club tiers?',
 a:'<table class="fq-t fq-t-h"><thead><tr><th scope="col">Tier</th><th scope="col">When</th><th scope="col">Benefits</th></tr></thead><tbody><tr><td>Member</td><td>From your first order</td><td>5 points per £1</td></tr><tr><td>Regular</td><td>After £150 spent</td><td>6 points per £1, free delivery on every order</td></tr><tr><td>Committed</td><td>After £400 spent</td><td>8 points per £1, free delivery and first look at new brands</td></tr></tbody></table>'},
// src: [CLUB] drawer "Early access: Members see sale prices a day before everyone else"
{c:'club',q:'Do members get early access to sales?',
 a:'<p>Yes. Club members see sale prices a day before everyone else.</p>'},
// src: [CLUB] drawer "Sign in to see your points"; birthday "set it in your account"
{c:'club',q:'Where can I see my points balance?',
 a:'<p>Sign in to your account to see your points and tier. You can add your dog’s birthday there too.</p>'},

/* ---------------- Subscriptions ---------------- */
// src: [SUB] "How it works" + "How do I start a subscription?"
{c:'subs',pop:1,q:'How does Subscribe & Save work?',
 a:'<p>On an eligible product, choose <b>Subscribe &amp; save</b> instead of a one-time purchase, pick how often you want it delivered, then check out as normal. Your discount is applied automatically and each order is charged and sent on schedule.</p>'},
// src: [SUB] "Pick a frequency that fits" tiers
{c:'subs',q:'How much do I save with a subscription?',
 a:'<table class="fq-t fq-t-h"><thead><tr><th scope="col">Delivered every</th><th scope="col">You save</th></tr></thead><tbody><tr><td>8 weeks</td><td>5%</td></tr><tr><td>4 weeks</td><td>10%</td></tr><tr><td>2 weeks</td><td>15%</td></tr></tbody></table><p>The discount applies to every renewal.</p>'},
// src: [SUB] "Reminder emails"
{c:'subs',q:'Will you remind me before I’m charged?',
 a:'<p>Yes. We email you a few days before each renewal, so you have time to skip, change or cancel.</p>'},
// src: [TERMS] 10 "Subscriptions"; [SUB] "Where do I manage my subscription?"
{c:'subs',pop:1,q:'Can I pause, skip or change my subscription?',
 a:'<p>Yes, at any time before the next billing date. Sign in and go to <b>Subscriptions</b> in your account to pause, skip an order, change the frequency or swap products. You can also email us and we will do it for you.</p>'},
// src: [SUB] "What if I want to cancel?"; [SUBPOL] links in order confirmation emails
{c:'subs',q:'How do I cancel a subscription?',
 a:'<p>Cancel any time from your account, or from the link in your order confirmation email. There are no fees and no notice period. If you have already been charged for the next order, that order is still sent, but no more are created.</p>'},
// src: [SUB] "Can I combine multiple products in one subscription?"
{c:'subs',q:'Can I have several products in one subscription?',
 a:'<p>Yes. Add as many eligible products as you like and they renew together on the same schedule.</p>'},
// src: [SUB] "Does delivery work the same as normal orders?"
{c:'subs',q:'Is delivery the same for subscription orders?',
 a:'<p>Yes. Subscription orders use the same delivery options, costs and tracking as one-off orders, including free UK delivery over £39.</p>'},

/* ---------------- Your account ---------------- */
// src: [LFAQ] "Do I need an account to order?"
{c:'account',pop:1,q:'Do I need an account to order?',
 a:'<p>No, you can check out as a guest. An account lets you track orders, manage subscriptions, save addresses and see your order history in one place.</p>'},
// src: [CLUB] account drawer "Save your dog's details: Breed, weight and measurements, so sizing is right first time"
{c:'account',q:'Can I save my dog’s details?',
 a:'<p>Yes. Save your dog’s breed, weight and measurements in your account so sizing is right first time, and add their birthday for Club points.</p>'},
// src: [LFAQ] "I forgot my password — how do I reset it?"
{c:'account',q:'I’ve forgotten my password.',
 a:'<p>On the sign-in page choose <b>Forgotten your password?</b> and enter your email address. We will send you a reset link within a few minutes; check your spam folder if it does not arrive.</p>'},
// src: [LFAQ] "How do I update my email or delivery address?"
{c:'account',q:'How do I update my email or delivery address?',
 a:'<p>Sign in, then change your email under <b>Account details</b> or your delivery addresses under <b>Addresses</b>. Changes apply to future orders. To change the address on an order already placed, email us before it is dispatched.</p>'},
// src: [LFAQ] "Can I view my past orders?"
{c:'account',q:'Where can I see my past orders?',
 a:'<p>Your full order history, with tracking links and invoices where available, is under <b>Order history</b> in your account.</p>'},

/* ---------------- About us ---------------- */
// src: [STORY] why-poorly-pet (Marble, Joe and Lily, Sandbach, end of 2025, 73 brands); [CO] company details
{c:'about',q:'Who are Poorly Pet?',
 a:'<p>Poorly Pet is a UK online shop for dog health, recovery and mobility products. Joe and Lily founded it at the end of 2025 from home in Sandbach, Cheshire, after their Dachshund Marble was diagnosed with IVDD at three.</p><p>Poorly Pet Ltd is registered in England &amp; Wales, company number 17086223.</p>'},
// src: [STORY] "Products from 73 brands"; brand names from [PROD] vendor field in products.js
{c:'about',q:'Which brands do you sell?',
 a:'<p>We stock 73 brands, including our own Poorly Pet range and specialists such as Ortocanis, Bugalugs, OurDogsLife, Supernature, Calibra, Balto and KRUUSE. See <a href="#">All brands</a>.</p>'},
// src: [REV] "Every review is from a real customer, collected by Judge.me. Good and bad, we publish them all."; 4.6 from 101 reviews (shell)
{c:'about',q:'Are your reviews genuine?',
 a:'<p>Yes. Reviews are collected by Judge.me from real customers, and we publish good and bad. We are rated 4.6 out of 5 from 101 reviews. <a href="customer-reviews.html">Read customer reviews</a>.</p>'},
// src: [FOOT] "Real people, not a chatbot. We answer every email within one working day."; [CONT] form + "Office hours Mon–Fri, 9am–5pm"
{c:'about',pop:1,q:'How can I contact you?',
 a:'<p>Email '+M+' or use the form on our <a href="#">contact page</a>. Real people, not a chatbot, answer every email within one working day. Our team works Monday to Friday, 9am to 5pm.</p>'},
// src: [TERMS] 9 "Health disclaimer"
{c:'about',q:'Does your advice replace my vet?',
 a:'<p>No. Our products and guides support your dog’s wellbeing, but they are not a substitute for diagnosis or treatment from a vet. If your dog is unwell, in pain, or you are unsure, speak to your vet.</p>'}
];

/* ---------------- helpers ---------------- */
function slug(s){return s.toLowerCase().replace(/&/g,' and ').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64).replace(/-+$/,'')}
function strip(h){var d=document.createElement('div');d.innerHTML=h.replace(/<(\/p|\/li|\/td|\/th|\/tr|br)[^>]*>/g,'$& ');return (d.textContent||'').replace(/\s+/g,' ').trim()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var CAT={};CATS.forEach(function(c){c.items=[];CAT[c.id]=c});
FAQS.forEach(function(f,i){f.id=slug(f.q);f.i=i;f.txt=strip(f.a);f.lq=f.q.toLowerCase();f.la=f.txt.toLowerCase();CAT[f.c].items.push(f)});
var BYID={};FAQS.forEach(function(f){BYID[f.id]=f});

function tokens(q){return q.toLowerCase().replace(/[^a-z0-9£%\s-]/g,' ').split(/\s+/).filter(function(t){return t.length>1||/\d/.test(t)})}
function search(q){
  var t=tokens(q);if(!t.length)return [];
  var out=[];
  FAQS.forEach(function(f){
    var score=0,lc=CAT[f.c].label.toLowerCase();
    for(var i=0;i<t.length;i++){
      var w=t[i],inQ=f.lq.indexOf(w)>-1,inA=f.la.indexOf(w)>-1,inC=lc.indexOf(w)>-1;
      if(!inQ&&!inA&&!inC)return;
      score+=(inQ?5:0)+(inA?1:0)+(inC?1:0);
    }
    out.push({f:f,s:score});
  });
  out.sort(function(a,b){return b.s-a.s||a.f.i-b.f.i});
  return out.map(function(o){return o.f});
}
function hl(text,q){
  var s=esc(text),t=tokens(q||'');if(!t.length)return s;
  var re=new RegExp('('+t.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')','gi');
  return s.replace(re,'<mark>$1</mark>');
}
function snippet(f,q){
  var t=tokens(q),txt=f.txt,pos=-1;
  for(var i=0;i<t.length&&pos<0;i++)pos=txt.toLowerCase().indexOf(t[i]);
  var st=Math.max(0,pos-60);if(st>0){var sp=txt.indexOf(' ',st);if(sp>-1&&sp<pos)st=sp+1}var s=txt.slice(st,st+170);
  return (st>0?'…':'')+hl(s,q)+(st+170<txt.length?'…':'');
}
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function scrollTo(el){
  if(!el)return;
  var top=el.getBoundingClientRect().top+window.pageYOffset-stickyOffset()-16;
  window.scrollTo({top:top,behavior:reduce?'auto':'smooth'});
}
function stickyOffset(){var s=document.querySelector('.fq-tabs'),m=document.getElementById('msearch'),h=0;if(m){var cs=getComputedStyle(m);if(cs.display!=='none'&&cs.position==='sticky')h=m.offsetHeight}return (s?s.offsetHeight:0)+h}
function setHash(h){try{history.replaceState(null,'',h?'#'+h:location.pathname+location.search)}catch(e){}}
function flash(el){if(!el)return;el.classList.remove('fq-hit');void el.offsetWidth;el.classList.add('fq-hit')}

/* One accordion item. Question is a real button; answer is a region, hidden when closed. */
function itemHTML(f,q,opts){
  opts=opts||{};
  return '<div class="fq-it" id="'+f.id+'" data-id="'+f.id+'">'+
    '<h3 class="fq-qh"><button class="fq-q" type="button" aria-expanded="false" aria-controls="'+f.id+'-a">'+
    '<span class="fq-qt">'+hl(f.q,q)+'</span>'+(opts.cat?'<span class="fq-qc">'+esc(CAT[f.c].label)+'</span>':'')+
    '<span class="fq-chev" aria-hidden="true"></span></button></h3>'+
    '<div class="fq-a" id="'+f.id+'-a" role="region" aria-label="'+esc(f.q)+'" hidden><div class="fq-ai">'+f.a+
    '<div class="fq-foot"><a class="fq-perma" href="#'+f.id+'">Link to this answer</a>'+
    '<span class="fq-help" data-help><span>Was this helpful?</span><button type="button" data-v="y">Yes</button><button type="button" data-v="n">No</button></span></div>'+
    '</div></div></div>';
}
function toggle(it,open,fromUser){
  if(!it)return;
  var b=it.querySelector('.fq-q'),a=it.querySelector('.fq-a');
  if(open===undefined)open=b.getAttribute('aria-expanded')!=='true';
  b.setAttribute('aria-expanded',open?'true':'false');
  a.hidden=!open;it.classList.toggle('open',open);
  if(fromUser){if(open)setHash(it.dataset.id);else if(location.hash==='#'+it.dataset.id)setHash('')}
}
function wireAcc(root){
  root.addEventListener('click',function(e){
    var b=e.target.closest('.fq-q');
    if(b&&root.contains(b)){toggle(b.closest('.fq-it'),undefined,true);return}
    var p=e.target.closest('.fq-perma');
    if(p){e.preventDefault();var id=p.getAttribute('href').slice(1);setHash(id);
      var ok=p.textContent;try{navigator.clipboard&&navigator.clipboard.writeText(location.href.split('#')[0]+'#'+id)}catch(x){}
      p.textContent='Link copied';setTimeout(function(){p.textContent=ok},1600);return}
    var h=e.target.closest('[data-help] button');
    if(h){var w=h.closest('[data-help]');w.innerHTML='<span>'+(h.dataset.v==='y'?'Thanks for letting us know.':'Sorry about that. Email <a href="mailto:hello@poorly-pet.com">hello@poorly-pet.com</a> and we will help.')+'</span>'}
  });
}
function catFromHash(){var h=location.hash.slice(1);return h.indexOf('topic-')===0&&CAT[h.slice(6)]?h.slice(6):null}
function qFromHash(){var h=decodeURIComponent(location.hash.slice(1));return BYID[h]||null}

/* Search box behaviour shared by all versions */
function wireSearch(input,clear,onq){
  var t;
  input.addEventListener('input',function(){clear.hidden=!input.value;clearTimeout(t);t=setTimeout(function(){onq(input.value.trim())},90)});
  input.addEventListener('keydown',function(e){if(e.key==='Escape'&&input.value){input.value='';clear.hidden=true;onq('')}});
  var form=input.closest('form');if(form)form.addEventListener('submit',function(e){e.preventDefault();onq(input.value.trim())});
  clear.addEventListener('click',function(){input.value='';clear.hidden=true;onq('');input.focus()});
}
function countTxt(n){return n+(n===1?' question':' questions')}

var root=document.querySelector('[data-fq]');if(!root)return;
var V=root.getAttribute('data-fq');
var POP=FAQS.filter(function(f){return f.pop});

/* ======================================================================
   A: category sidebar + accordion list (department-store help pattern)
   ====================================================================== */
function initA(){
  var side=root.querySelector('#fqa-side'),sel=root.querySelector('#fqa-sel'),main=root.querySelector('#fqa-main'),
      input=root.querySelector('#fq-q'),clear=root.querySelector('#fq-x'),status=root.querySelector('#fq-status');
  var cur='orders',query='';
  side.innerHTML=CATS.map(function(c){return '<li><a href="#topic-'+c.id+'" data-cat="'+c.id+'"><span>'+esc(c.label)+'</span><span class="fqa-n">'+c.items.length+'</span></a></li>'}).join('');
  sel.innerHTML=CATS.map(function(c){return '<option value="'+c.id+'">'+esc(c.label)+' ('+c.items.length+')</option>'}).join('');
  function render(){
    side.querySelectorAll('a').forEach(function(a){var on=!query&&a.dataset.cat===cur;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    if(query){
      var r=search(query);
      status.textContent=r.length?countTxt(r.length)+' found for “'+query+'”':'No results for “'+query+'”';
      main.innerHTML='<div class="fqa-hd"><h2>Search results</h2><p>'+(r.length?countTxt(r.length)+' matching “'+esc(query)+'”':'')+'</p></div>'+
        (r.length?'<div class="fq-list">'+r.map(function(f){return itemHTML(f,query,{cat:1})}).join('')+'</div>':
        '<div class="fq-empty"><p><b>No answers match “'+esc(query)+'”.</b></p><p>Try a different word, such as “delivery”, “refund” or “wheelchair”, or <a href="#fq-contact">contact us</a>.</p></div>');
      if(r.length===1)toggle(main.querySelector('.fq-it'),true);
    }else{
      var c=CAT[cur];sel.value=cur;status.textContent='';
      main.innerHTML='<div class="fqa-hd"><h2>'+esc(c.label)+'</h2><p>'+esc(c.blurb)+'</p></div><div class="fq-list">'+c.items.map(function(f){return itemHTML(f)}).join('')+'</div>';
    }
  }
  side.addEventListener('click',function(e){var a=e.target.closest('a[data-cat]');if(!a)return;e.preventDefault();go(a.dataset.cat,true)});
  sel.addEventListener('change',function(){go(sel.value,false)});
  function go(id,focus){
    cur=id;query='';input.value='';clear.hidden=true;render();setHash('topic-'+id);
    if(window.innerWidth<900)scrollTo(main);
    if(focus){var h=main.querySelector('h2');h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
  }
  wireSearch(input,clear,function(q){query=q;render();if(!q)setHash('topic-'+cur)});
  wireAcc(main);
  root.querySelectorAll('[data-goto]').forEach(function(a){a.addEventListener('click',function(e){var f=BYID[a.dataset.goto];if(!f)return;e.preventDefault();openQ(f)})});
  function openQ(f){cur=f.c;query='';input.value='';clear.hidden=true;render();var it=document.getElementById(f.id);toggle(it,true);setHash(f.id);scrollTo(it);flash(it)}
  function fromHash(){var f=qFromHash();if(f)return openQ(f);var c=catFromHash();if(c){cur=c;query='';render()}}
  render();fromHash();window.addEventListener('hashchange',fromHash);
}

/* ======================================================================
   B: search-first help centre with topic tiles, popular questions, topic view
   ====================================================================== */
function initB(){
  var input=root.querySelector('#fq-q'),clear=root.querySelector('#fq-x'),status=root.querySelector('#fq-status'),
      view=root.querySelector('#fqb-view'),crumb=root.querySelector('#fqb-crumb');
  var state={v:'home',cat:null,q:''};
  function tiles(){
    return '<section class="fqb-sec" aria-labelledby="fqb-th"><h2 id="fqb-th">Browse by topic</h2><ul class="fqb-tiles">'+CATS.map(function(c){
      return '<li class="fqb-tile"><h3><a href="#topic-'+c.id+'" data-cat="'+c.id+'">'+esc(c.label)+'</a></h3><p>'+esc(c.blurb)+'</p><ul>'+
        c.items.slice(0,3).map(function(f){return '<li><a href="#'+f.id+'" data-q="'+f.id+'">'+esc(f.q)+'</a></li>'}).join('')+
        '</ul><a class="fqb-all" href="#topic-'+c.id+'" data-cat="'+c.id+'">All '+c.items.length+' questions <span aria-hidden="true">›</span></a></li>'}).join('')+'</ul></section>';
  }
  function popular(){
    return '<section class="fqb-sec fqb-pop" aria-labelledby="fqb-ph"><div class="fqb-poph"><h2 id="fqb-ph">Popular questions</h2><p>The questions we are asked most.</p></div><div class="fq-list">'+
      POP.slice(0,10).map(function(f){return itemHTML(f,'',{cat:1})}).join('')+'</div></section>';
  }
  function topic(id){
    var c=CAT[id];
    return '<div class="fqb-topic"><nav class="fqb-tnav" aria-label="Topics"><h2 class="fqb-tnh">Topics</h2><ul>'+CATS.map(function(x){
      return '<li><a href="#topic-'+x.id+'" data-cat="'+x.id+'"'+(x.id===id?' class="on" aria-current="page"':'')+'>'+esc(x.label)+'</a></li>'}).join('')+
      '</ul></nav><div class="fqb-tmain"><div class="fqb-th"><h2 tabindex="-1">'+esc(c.label)+'</h2><p>'+esc(c.blurb)+' '+countTxt(c.items.length)+'.</p></div><div class="fq-list">'+
      c.items.map(function(f){return itemHTML(f)}).join('')+'</div></div></div>';
  }
  function results(q){
    var r=search(q);
    status.textContent=r.length?countTxt(r.length)+' found':'No results';
    if(!r.length)return '<div class="fq-empty"><h2>No answers match “'+esc(q)+'”</h2><p>Check the spelling or try a shorter word, such as “return” or “points”. Or browse a topic below.</p></div>'+tiles();
    var groups={};r.forEach(function(f){(groups[f.c]=groups[f.c]||[]).push(f)});
    return '<div class="fqb-res"><h2 tabindex="-1">'+countTxt(r.length)+' for “'+esc(q)+'”</h2><ol class="fqb-rl">'+r.map(function(f){
      return '<li><a href="#'+f.id+'" data-q="'+f.id+'"><span class="fqb-rq">'+hl(f.q,q)+'</span><span class="fqb-rs">'+snippet(f,q)+'</span><span class="fqb-rc">'+esc(CAT[f.c].label)+'</span></a></li>'}).join('')+'</ol></div>';
  }
  function render(){
    var h='';
    if(state.v==='home'){h=tiles()+popular();crumb.innerHTML='<span aria-current="page">Help centre</span>'}
    else if(state.v==='topic'){h=topic(state.cat);crumb.innerHTML='<a href="#" data-home>Help centre</a><span aria-hidden="true">›</span><span aria-current="page">'+esc(CAT[state.cat].label)+'</span>'}
    else{h=results(state.q);crumb.innerHTML='<a href="#" data-home>Help centre</a><span aria-hidden="true">›</span><span aria-current="page">Search results</span>'}
    view.innerHTML=h;
  }
  function goTopic(id,qid){
    state={v:'topic',cat:id,q:''};input.value='';clear.hidden=true;status.textContent='';render();
    if(qid){var it=document.getElementById(qid);toggle(it,true);setHash(qid);scrollTo(it);flash(it)}
    else{setHash('topic-'+id);scrollTo(view);var hh=view.querySelector('h2[tabindex]');if(hh)hh.focus({preventScroll:true})}
  }
  function goHome(){state={v:'home',cat:null,q:''};input.value='';clear.hidden=true;status.textContent='';render();setHash('');scrollTo(root)}
  root.addEventListener('click',function(e){
    var a=e.target.closest('[data-cat],[data-q],[data-home],[data-goto]');if(!a)return;
    if(a.hasAttribute('data-home')){e.preventDefault();return goHome()}
    if(a.dataset.cat){e.preventDefault();return goTopic(a.dataset.cat)}
    var f=BYID[a.dataset.q||a.dataset.goto];if(f){e.preventDefault();goTopic(f.c,f.id)}
  });
  wireSearch(input,clear,function(q){
    if(q){state={v:'res',cat:null,q:q};render();setHash('')}else if(state.v==='res'){state={v:'home'};status.textContent='';render()}
  });
  wireAcc(view);
  function fromHash(){var f=qFromHash();if(f)return goTopic(f.c,f.id);var c=catFromHash();if(c)goTopic(c)}
  render();fromHash();window.addEventListener('hashchange',fromHash);
}

/* ======================================================================
   C: one long page, sticky topic tabs with scroll-spy, two-column Q&A rows
   ====================================================================== */
function initC(){
  var tabs=root.querySelector('#fqc-tabs'),body=root.querySelector('#fqc-body'),input=root.querySelector('#fq-q'),
      clear=root.querySelector('#fq-x'),status=root.querySelector('#fq-status'),empty=root.querySelector('#fqc-empty');
  tabs.innerHTML=CATS.map(function(c){return '<li><a href="#topic-'+c.id+'" data-cat="'+c.id+'">'+esc(c.label)+'</a></li>'}).join('');
  body.innerHTML=CATS.map(function(c){
    return '<section class="fqc-sec" id="topic-'+c.id+'" aria-labelledby="fqc-h-'+c.id+'"><div class="wrap fqc-grid"><header class="fqc-sh"><h2 id="fqc-h-'+c.id+'">'+esc(c.label)+'</h2><p>'+esc(c.blurb)+'</p><span class="fqc-n">'+countTxt(c.items.length)+'</span></header><div class="fq-list fqc-list">'+
      c.items.map(function(f){return itemHTML(f)}).join('')+
      '</div></div></section>'}).join('');
  var secs=[].slice.call(body.querySelectorAll('.fqc-sec')),links=[].slice.call(tabs.querySelectorAll('a'));
  function setActive(id){links.forEach(function(a){var on=a.dataset.cat===id;a.classList.toggle('on',on);if(on){a.setAttribute('aria-current','true');var s=tabs.parentNode;var l=a.offsetLeft-16;if(l<s.scrollLeft||a.offsetLeft+a.offsetWidth>s.scrollLeft+s.clientWidth)s.scrollLeft=l}else a.removeAttribute('aria-current')})}
  var ticking=false;
  function spy(){ticking=false;var y=stickyOffset()+80,cur=null;secs.forEach(function(s){if(s.offsetParent&&s.getBoundingClientRect().top<=y)cur=s.id.slice(6)});setActive(cur||(secs.filter(function(s){return s.offsetParent})[0]||{id:'topic-'}).id.slice(6))}
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(spy)}},{passive:true});
  tabs.addEventListener('click',function(e){var a=e.target.closest('a[data-cat]');if(!a)return;e.preventDefault();var s=document.getElementById('topic-'+a.dataset.cat);if(s.hidden)return;scrollTo(s);setHash('topic-'+a.dataset.cat);setActive(a.dataset.cat)});
  wireAcc(body);
  /* default state: only the first question in each topic is open */
  function resetOpen(){secs.forEach(function(s){[].forEach.call(s.querySelectorAll('.fq-it'),function(it,i){toggle(it,i===0)})})}
  function filter(q){
    var hit=q?search(q):FAQS,set={};hit.forEach(function(f){set[f.id]=1});
    FAQS.forEach(function(f){var r=document.getElementById(f.id);r.hidden=!set[f.id];r.querySelector('.fq-qt').innerHTML=hl(f.q,q);if(q)toggle(r,!!set[f.id])});
    if(!q)resetOpen();
    secs.forEach(function(s){var n=s.querySelectorAll('.fq-it:not([hidden])').length;s.hidden=!n;s.querySelector('.fqc-n').textContent=q?n+' of '+countTxt(CAT[s.id.slice(6)].items.length):countTxt(n)});
    links.forEach(function(a){a.parentNode.hidden=document.getElementById('topic-'+a.dataset.cat).hidden});
    empty.hidden=!!hit.length||!q;
    if(empty.hidden===false)empty.querySelector('b').textContent='“'+q+'”';
    status.textContent=q?(hit.length?countTxt(hit.length)+' match “'+q+'”':'No results for “'+q+'”'):'';
    spy();
  }
  wireSearch(input,clear,function(q){filter(q);if(q){var first=body.querySelector('.fqc-sec:not([hidden])');if(first)scrollTo(first)}});
  function fromHash(){var f=qFromHash();if(f){if(input.value){input.value='';clear.hidden=true;filter('')}var r=document.getElementById(f.id);toggle(r,true);scrollTo(r);flash(r);return}
    var c=catFromHash();if(c)scrollTo(document.getElementById('topic-'+c))}
  function setTop(){var m=document.getElementById('msearch'),h=0;if(m){var cs=getComputedStyle(m);if(cs.display!=='none'&&cs.position==='sticky')h=m.offsetHeight}root.style.setProperty('--fq-top',h+'px')}
  setTop();window.addEventListener('resize',setTop);
  resetOpen();spy();
  if(location.hash)setTimeout(fromHash,60);
  window.addEventListener('hashchange',fromHash);
}

if(V==='a')initA();else if(V==='b')initB();else initC();
window.PP_FAQS={cats:CATS,faqs:FAQS};
})();
