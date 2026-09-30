/* ==========================================================================
   Poorly Pet: AI Support Assistant. Shared by ai-assistant-a/-b/-c.html.

   HOW THE LIVE ASSISTANT WORKS (read from the store, 29 Sep 2026, read only)
   - Live page: /pages/ai-support-agent (Shopify page "AI Support Agent",
     GemPages page 623901671994425886, one section 623901698351432660 holding
     one "Custom Code" element; last published 23 Jul 2026). Its header comment
     calls it /pages/ai-support-assistant, but that handle does not exist.
   - Chat: every message is pushed to history as {role:'user'|'assistant',
     content} and the page POSTs JSON {messages: history.slice(-12)} to a
     Cloudflare Worker that proxies Claude (the key stays in the Worker):
       https://poorlypet-chat.green-mud-a533.workers.dev/chat
     Not streamed. The Worker answers JSON:
       { reply: "plain text",
         urgent: true|false,                        (optional)
         products: [{name, url, image, price, vid, reason}] }  (optional)
     On any error the page falls back to a built-in rule-based engine.
   - The live chat does NOT look up orders. Order tracking lives on
     /pages/track-order (Worker poorlypet-track.green-mud-a533.workers.dev,
     POST {order, email}); this assistant uses that same Worker for
     "where is my order" (see final/track-my-order.js for the response shape).

   FINAL = ai-assistant.html: B's page with C's pop-up chat, dog health first.
   A and C are kept as they were and share this file.

   THIS PREVIEW makes no external requests. LIVE=false answers locally from:
     - dog health: the 43 symptoms of the symptom guide (SG) and the named
       conditions (CONDS), each mapped to PP_TAGS keys; replies say what it may
       be and what helps, then show 3-6 homepage .pk cards with offers, with
       follow-ups "What else helps?" and "Show supplements only",
     - the FAQ data in faqs.js (copied below, same sources and wording) for
       orders, delivery, returns and the rest,
     - the example order from track-my-order.js (clearly labelled example),
     - PP_TAGS / PP_PRODUCTS (products.js) and PPOffers (offers.js).
   On the store set LIVE=true: free-text questions go to the chat Worker (the
   symptom assistant) with the same request shape as today (order, delivery and
   account questions still get the FAQ answer first; the Worker's urgent flag is
   not shown, owner's rule), order lookups go to the track Worker, and
   the local answers remain the fallback if either Worker fails.
   ========================================================================== */
(function(){
'use strict';

/* ------------------------------------------------------------------
   >>> REAL ASSISTANT PLUGS IN HERE <<<
   Same endpoints and payloads as the live store pages:
     chat : POST {messages:[{role,content}, ...last 12]}  -> {reply, urgent?, products?}
     order: POST {order, email}                            -> {found, order | message | error}
   ------------------------------------------------------------------ */
var CHAT_ENDPOINT='https://poorlypet-chat.green-mud-a533.workers.dev/chat';
var TRACK_ENDPOINT='https://poorlypet-track.green-mud-a533.workers.dev';
var LIVE=false; /* true on poorly-pet.com; false in this preview */

function askLive(history){
  return fetch(CHAT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-12)})})
    .then(function(r){return r.ok?r.json():Promise.reject(r.status)});
}
function lookupOrder(order,email){
  if(!LIVE)return new Promise(function(res){setTimeout(function(){res({found:true,order:EXAMPLE})},REDUCE?0:500)});
  return fetch(TRACK_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:order,email:email})})
    .then(function(r){return r.json()});
}

/* ------------------------------------------------------------------
   FAQ DATA: copied from faqs.js (final/faqs.js), same sources and wording.
   Links point at the new preview pages.
   ------------------------------------------------------------------ */
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
 a:'<ul><li>You can cancel your order within <b>14 days</b> of receiving it, without giving a reason (Consumer Contracts Regulations 2013).</li><li>After telling us, you have a further <b>14 days</b> to send the items back, unused and in their original condition and packaging where possible.</li></ul><p>Read the full <a href="#">Returns &amp; Refunds Policy</a>.</p>'},
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
// src: [CLUB] drawer "How you earn" (first-order bonus removed by the owner)
{c:'club',pop:1,q:'How do I earn points?',
 a:'<table class="fq-t"><tr><th scope="row">Shopping</th><td>5 points for every £1, added the day your order ships</td></tr><tr><th scope="row">Reviews</th><td>50 points for a verified Judge.me review</td></tr><tr><th scope="row">Referrals</th><td>500 points when a friend places their first order</td></tr><tr><th scope="row">Birthday</th><td>250 points on your dog’s birthday (set it in your account)</td></tr></table>'},
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

/* Confirmed delivery rate (shop shipping rates, see BRIEF): shown with the delivery-cost answer. */
var EXTRA={'how-much-does-delivery-cost':'<p>Below £39, standard UK delivery is £3.99.</p>'};

/* ------------------------------------------------------------------
   EXAMPLE ORDER for the preview only (same as track-my-order.js).
   Not a real customer or order. Products and prices are real.
   ------------------------------------------------------------------ */
var EXAMPLE={
  example:true,name:'#1234',createdAt:'2026-09-26T10:12:00+01:00',
  financialStatus:'PAID',fulfillmentStatus:'FULFILLED',shipmentStatus:'IN_TRANSIT',
  events:[{status:'PLACED',at:'2026-09-26T10:12:00+01:00'},{status:'LABEL_PRINTED',at:'2026-09-28T09:50:00+01:00'},{status:'IN_TRANSIT',at:'2026-09-28T11:29:00+01:00'}],
  estimatedDelivery:'2026-09-30',estimatedLatest:'2026-10-02',
  tracking:[{company:'Evri',number:'H00EXAMPLE123456',url:'https://www.evri.com/track-a-parcel'}],
  shipping:{title:'Standard Shipping (tracked)',price:0},
  items:[
    {handle:'abdominal-support-sling-for-dogs-with-reduced-mobility',quantity:1},
    {handle:'100-natural-scottish-salmon-oil-for-dogs-cats-500ml',quantity:1},
    {handle:'100-natural-peanut-butter-for-dogs',quantity:1}
  ],
  statusUrl:'#'
};

/* ------------------------------------------------------------------
   SYMPTOMS: the 43 symptoms of the signed-off symptom guide
   (copied from symptom-guide.js, same wording). s.area+"/"+s.slug is
   the PP_TAGS key for its products.
   ------------------------------------------------------------------ */
var SG=[
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

/* ------------------------------------------------------------------
   CONDITIONS: named conditions -> PP_TAGS condition keys (products.js).
   what = one plain line on what it is; helps = what helps at home;
   more = extra tips for "What else helps?". Wording follows the
   signed-off condition pages and symptom guide. Order matters: the
   first condition named in the question wins.
   ------------------------------------------------------------------ */
var CONDS=[
 {key:'ivdd',rel:['back-pain','rear-leg-weakness','paralysis'],name:'IVDD',re:/\bivdd\b|slipped disc|\bdisc (problem|disease)|intervertebral/i,
  what:'A disc in the spine bulging or bursting and pressing on the cord. Dachshunds, Bassets, Corgis and Beagles are most at risk, but any dog can get it.',
  helps:['Strict rest first, often for weeks.','A back brace to stop twisting, and ramps so there is no jumping.','A harness with a handle for toilet trips and stairs.'],
  more:['Grip on hard floors so the back legs don’t slide.','Keep your dog lean to take load off the spine.'],page:'collection.html#ivdd'},
 {key:'spondylosis',rel:['back-pain','arthritis'],name:'Spondylosis',re:/spondylosis/i,
  what:'Small bony bridges form between the bones of the spine with age. Many dogs show no signs; some get a stiff back and slow down.',
  helps:['Steady, regular walks keep the back moving.','A warm, supportive bed off cold floors.','Keep your dog lean.'],more:['Ramps for the car and sofa.']},
 {key:'degenerative-myelopathy',rel:['rear-leg-weakness','knuckling'],name:'Degenerative myelopathy',re:/myelopathy/i,
  what:'A slow nerve condition of the spinal cord that weakens the back legs over months, usually in older dogs. It isn’t painful.',
  helps:['Regular, gentle walks keep your dog moving.','Boots protect scuffed back paws.','A support harness, and later a wheelchair, keep them active.'],more:['Non-slip rugs on hard floors.']},
 {key:'paralysis',rel:['ivdd','degenerative-myelopathy'],name:'Paralysis and mobility loss',re:/paraly|can'?t walk|cannot walk|back legs? (have |has )?(gone|stopped working)/i,
  what:'When the back legs stop working, most often after IVDD or with degenerative myelopathy. Many dogs stay happy and active with the right kit.',
  helps:['A wheelchair gives freedom back once your vet agrees.','A drag bag protects the legs indoors.','A harness with handles for lifting and toilet trips.'],more:['Soft, washable bedding and regular position changes.']},
 {key:'back-pain',rel:['ivdd','spondylosis'],name:'Back pain',re:/back pain|sore back|bad back|\bspine\b|spinal/i,
  what:'A sore back shows as a hunched posture, a yelp when picked up, or not wanting to jump. Causes range from a strain to IVDD or spondylosis.',
  helps:['Rest: no jumping, stairs or rough play.','Ramps for the car and the sofa.','Gentle warmth and a supportive bed.'],more:['A back brace gives support on walks.']},
 {key:'cruciate-ligament',rel:['arthritis'],name:'Cruciate ligament',re:/cruciate|\bacl\b|\bccl\b|knee ligament/i,
  what:'A tear in the ligament that steadies the knee. Dogs often go lame on a back leg, or toe-touch after exercise.',
  helps:['Lead walks only while you get it checked.','A knee brace supports the joint during rest or recovery.','Non-slip floors and a harness with a handle.'],more:['Keep your dog lean.']},
 {key:'luxating-patella',rel:['arthritis'],name:'Luxating patella',re:/patella|kneecap/i,
  what:'The kneecap slips out of its groove, so the dog skips or holds up a back leg for a few steps, then carries on. Common in small breeds.',
  helps:['Keep your dog lean.','A ramp or steps instead of jumping on and off furniture.','A knee brace and joint supplements for support.'],more:['Rugs on slippery floors.']},
 {key:'hip-dysplasia',rel:['arthritis'],name:'Hip dysplasia',re:/hip dysplas|\bhips?\b/i,
  what:'The hip joint forms loosely, so it wears unevenly. It shows as a swaying walk, bunny hopping or stiffness, often in larger breeds.',
  helps:['Keep your dog lean to take load off the hips.','Steady lead walks rather than ball chasing.','A supportive bed and a rear support harness for steps.'],more:['Joint supplements help many dogs over a few weeks.']},
 {key:'elbow-dysplasia',name:'Elbow dysplasia',re:/elbow/i,
  what:'Uneven growth in the elbow joint that leads to front-leg lameness and early arthritis, mostly in larger breeds.',
  helps:['Keep your dog lean.','Short, steady walks on soft ground.','A padded bed and a daily joint supplement.'],more:['Rugs on slippery floors.']},
 {key:'carpal-hyperextension',name:'Carpal hyperextension',re:/carpal|wrist/i,
  what:'The wrist sinks towards the floor because the ligaments that hold it up have weakened or been injured.',
  helps:['A carpal wrap or brace supports the wrist.','Short walks on soft ground.','Keep your dog lean.'],more:[]},
 {key:'knuckling',rel:['degenerative-myelopathy'],name:'Knuckling',re:/knuckl/i,
  what:'The paw folds over so the dog walks on the top of the toes. It usually points to a nerve or spine problem.',
  helps:['Protective boots stop the tops of the paws getting sore.','A no-knuckling sock or splint.','Walk on grass rather than rough pavements.'],more:['A support harness on longer walks.']},
 {key:'rear-leg-weakness',rel:['degenerative-myelopathy','arthritis'],name:'Rear leg weakness',re:/weak (back|hind|rear) legs?|(back|hind|rear) legs? (are |is |getting |going )?(weak|wobbl)/i,
  what:'Weak back legs come from sore joints, muscle loss with age, or nerve and spine problems.',
  helps:['A rear support harness helps on steps and in the car.','Non-slip rugs on hard floors.','Short, regular walks keep the muscles working.'],more:['Joint supplements suit many older dogs.']},
 {key:'arthritis',rel:['hip-dysplasia','senior-support'],name:'Joint pain and stiffness',re:/arthrit|\bjoints?\b/i,
  what:'Wear and inflammation inside a joint. The cushioning cartilage thins, so the joint gets stiff and sore. Most common in older and bigger dogs.',
  helps:['A warm, padded bed off cold floors.','Little and often walks, with a gentle warm-up.','Joint supplements help many dogs over 4 to 6 weeks.'],
  more:['Keep your dog lean: extra weight loads sore joints.','Rugs on slippery floors and a ramp for the car.'],page:'collection.html#arthritis'},
 {key:'hot-spots',rel:['itchy-skin'],name:'Hot spots',re:/hot ?spots?/i,
  what:'A patch of skin that turns red, wet and sore within hours, usually from licking or scratching at an itch.',
  helps:['Clip the hair around it and keep it clean and dry.','A cone or body suit stops the licking.','A soothing spray or balm while it heals.'],more:['Look for the itch behind it: fleas or an allergy.']},
 {key:'seasonal-allergies',rel:['itchy-skin'],name:'Seasonal allergies',re:/seasonal|hay ?fever|pollen/i,
  what:'Itching that comes and goes with the seasons, from pollen, grasses or moulds.',
  helps:['Wipe paws and belly after walks.','Omega 3 every day supports the skin barrier.','Wash bedding weekly in the season.'],more:[]},
 {key:'itchy-skin',rel:['hot-spots','seasonal-allergies'],name:'Itchy skin and allergies',re:/itchy skin|\bitch(y|ing|iness)?\b|allerg/i,
  what:'Often an over-reaction to something ordinary: pollen, grass, dust mites, fleas or a food. The skin gets inflamed, the dog scratches, and the scratching makes it worse.',
  helps:['Omega 3 every day to calm the skin from inside.','A gentle wash and a soothing balm on the outside.','A flea routine all year round.'],
  more:['Most dogs settle in two to three weeks.','Rinse paws and belly after walks in pollen season.'],page:'collection.html#itchy-skin'},
 {key:'ear-eye-care',name:'Ear and eye care',re:/ear (infection|problem|care)|eye (infection|problem|care)|tear stain/i,
  what:'Itchy, smelly or waxy ears and weepy eyes often go with allergies, or with moisture trapped in floppy ears.',
  helps:['Clean ears gently with a dog ear cleaner, never cotton buds.','Dry the ears after swimming and baths.','Wipe the eyes with a clean, damp pad.'],more:[]},
 {key:'digestive-issues',rel:[],name:'Tummy upsets',re:/tummy|stomach|digest|\bgut\b/i,
  what:'Most tummy upsets come from eating something new or unsuitable, a sudden food change, stress, or a sensitive gut.',
  helps:['Small, bland meals for a day or two.','Fresh water always, and change food slowly over 7 to 10 days.','A probiotic supports the gut while it settles.'],more:['A slow-feeder bowl for dogs who gulp.']},
 {key:'dental-disease',rel:[],name:'Teeth and gums',re:/dental|\bteeth\b|\btooth\b|gum disease|tartar|plaque/i,
  what:'Plaque hardens into tartar and the gums get red and sore. Most dogs over three have some.',
  helps:['Brush with a dog toothpaste a few times a week.','Dental chews and water additives in between.','Check the mouth once a month.'],more:[]},
 {key:'kidney-support',rel:['senior-support'],name:'Kidney support',re:/kidney|renal/i,
  what:'Kidneys slow down with age, and your vet will usually suggest a kidney diet and regular checks.',
  helps:['Fresh water always in reach.','Follow your vet’s diet advice.','A kidney support supplement, if your vet agrees.'],more:[]},
 {key:'weight-management',rel:['arthritis'],name:'Weight management',re:/weight management|overweight|obese|\bfat\b|chubby|lose weight|weight loss/i,
  what:'Extra weight loads the joints and the back, and most dogs gain it slowly from treats and extra portions.',
  helps:['Weigh food rather than guessing.','Count treats as part of the daily amount.','Low-calorie treats and toppers help the diet stick.'],more:[]},
 {key:'noise-fear',rel:['anxiety'],name:'Noise fear',re:/firework|thunder|noise|\bbangs?\b/i,
  what:'Fear of bangs, from fireworks and thunder to bins and traffic. It often gets worse each season without help.',
  helps:['Walk earlier on firework nights and close the curtains.','A den to hide in, with background noise on.','Start calming products a few days before.'],more:[]},
 {key:'separation-anxiety',rel:['anxiety'],name:'Separation anxiety',re:/left alone|separation|when (i|we) (leave|go out)|home alone/i,
  what:'Distress when left: barking, whining, chewing or accidents, usually in the first half hour.',
  helps:['Practise very short absences and build up slowly.','A long-lasting chew or lick mat as you leave.','Calming products help some dogs settle.'],more:[]},
 {key:'anxiety',rel:['noise-fear','separation-anxiety'],name:'Anxiety and calming',re:/anxi|stress|nervous|\bcalm|worried dog|scared/i,
  what:'Worry shows as pacing, panting, hiding or clinginess. Changes at home, travel and visitors are common triggers.',
  helps:['A quiet den with a covered crate or bed.','Calm, predictable routines.','Calming chews, sprays or a wrap help many dogs.'],more:['More sniffing walks and puzzle feeders.']},
 {key:'post-surgery-recovery',rel:['wound-recovery','cruciate-ligament'],name:'Recovery after surgery',re:/surgery|operation|\bspay|neuter|castrat|stitches|\bop\b/i,
  what:'Most of recovery is rest, keeping the wound safe and stopping jumping while it heals.',
  helps:['Follow your vet’s rest and exercise plan.','A soft cone or recovery suit protects the wound.','Non-slip flooring, a ramp and a support harness.'],more:['Puzzle feeders and lick mats help with boredom on rest.']},
 {key:'wound-recovery',rel:['post-surgery-recovery'],name:'Wounds and skin repair',re:/wound|\bcuts?\b|graze|bite/i,
  what:'Cuts, grazes and sores heal best when they are kept clean, dry and not licked.',
  helps:['Keep it clean and dry.','A soft cone or recovery suit stops the licking.','A wound spray or powder while it heals.'],more:[]},
 {key:'senior-support',name:'Older dogs',re:/senior|elderly|\bold(er)? dog|getting old|ageing|aging/i,weak:true,
  what:'Older dogs often slow down with stiff joints, less muscle and changes in appetite and sleep.',
  helps:['A soft, supportive bed and rugs on slippery floors.','Shorter, more frequent walks.','A daily joint or senior supplement.'],more:[]}
];


/* ------------------------------------------------------------------ helpers */
var d=document,REDUCE=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function slug(s){return s.toLowerCase().replace(/&/g,' and ').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64).replace(/-+$/,'')}
function strip(h){var x=d.createElement('div');x.innerHTML=String(h).replace(/<(\/p|\/li|\/td|\/th|\/tr|br)[^>]*>/g,'$& ');return (x.textContent||'').replace(/\s+/g,' ').trim()}
function money(n){return n===0?'Free':'£'+Number(n).toFixed(2)}
function wait(ms){return new Promise(function(r){setTimeout(r,REDUCE?0:ms)})}

var CAT={};CATS.forEach(function(c){CAT[c.id]=c});
FAQS=FAQS.filter(function(f){return f.q});
FAQS.forEach(function(f,i){f.id=slug(f.q);f.i=i;f.txt=strip(f.a).toLowerCase();f.lq=f.q.toLowerCase()});
var BYID={};FAQS.forEach(function(f){BYID[f.id]=f});
var POP=FAQS.filter(function(f){return f.pop});

var PRODS=window.PP_PRODUCTS||[],TAGS=window.PP_TAGS||{},BY={};
PRODS.forEach(function(p){BY[p.handle]=p});
var OFF=window.PPOffers||{badge:function(){return null},lines:function(){return []}};

/* ---------- FAQ matching: stop words out, light synonyms, weighted overlap ---------- */
var STOP=' a an and are as at be but by can could do does did for from get got had has have how i if in is it its me my of on or our please so tell than that the their them then there these they this to up us was we what when where which who why will with would you your yours hi hello thanks thank much many any about just need want know ';
var SYN={cost:['cost','price','charge'],much:['cost'],price:['cost','price'],postage:['delivery','postage'],shipping:['delivery','shipping'],deliver:['delivery','deliver'],delivered:['delivered','delivery'],send:['return','send'],back:['return'],refund:['refund'],returns:['return'],returning:['return'],money:['refund'],parcel:['parcel','order'],package:['parcel','order'],arrive:['arrive','arrived'],late:['arrived','arrive'],pay:['pay','payment'],klarna:['klarna','payment'],discount:['discount','code'],voucher:['code','discount'],points:['points','club'],subscription:['subscription','subscribe'],subscribe:['subscribe','subscription'],cancel:['cancel'],broken:['faulty','damaged'],damaged:['damaged','faulty'],wrong:['wrong','faulty'],size:['size','measure'],sizing:['size','measure'],measure:['measure','size'],password:['password'],login:['password','sign'],phone:['contact','email'],contact:['contact','email'],cats:['cats'],cat:['cats'],puppy:['puppies'],medication:['medication'],medicine:['medication']};
function words(q){return q.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9£%\s]/g,' ').split(/\s+/).filter(function(t){return t&&STOP.indexOf(' '+t+' ')<0})}
function stem(w){return w.length>4?w.replace(/(ing|ies|es|s|ed)$/,''):w}
function matchFAQ(q){
  var ws=words(q);if(!ws.length)return null;
  var best=null,second=null;
  FAQS.forEach(function(f){
    var s=0,hit=0;
    ws.forEach(function(w){
      var alts=(SYN[w]||[w]).map(stem),got=0;
      alts.forEach(function(a){if(f.lq.indexOf(a)>-1)got=Math.max(got,4);else if(f.txt.indexOf(a)>-1)got=Math.max(got,1)});
      if(got){hit++;s+=got}
    });
    s+=hit/ws.length*3;
    if(f.pop)s+=.3;
    if(!best||s>best.s){second=best;best={f:f,s:s}}else if(!second||s>second.s)second={f:f,s:s};
  });
  return best&&best.s>=4?{f:best.f,alt:second&&second.s>=4?second.f:null}:null;
}

/* ---------- dog health: match a question to a condition or to the 43 symptoms ---------- */
var AREA_NAME={'legs-paws':'Legs & paws','skin-coat':'Skin & coat','tummy-gut':'Tummy & gut','eyes-ears':'Eyes & ears','mouth-teeth':'Mouth & teeth','back-spine':'Back & spine','behaviour-mood':'Behaviour & mood','whole-body':'Whole body'};
var CBY={};CONDS.forEach(function(c){CBY[c.key]=c});
/* conditions named in a symptom's "why" line: used for "what else helps" and related chips */
var LINKED=[['arthritis',/arthritis/i],['hip-dysplasia',/hip (or elbow )?dysplasia/i],['cruciate-ligament',/cruciate/i],['luxating-patella',/kneecap|patella/i],
  ['ivdd',/ivdd|slipped disc/i],['spondylosis',/spondylosis/i],['degenerative-myelopathy',/myelopathy/i],['itchy-skin',/allerg/i],['hot-spots',/hot spot/i],
  ['dental-disease',/gum disease|dental|tartar/i],['anxiety',/anxi|stress/i],['digestive-issues',/diet|digest|tummy|gut/i],['kidney-support',/kidney/i]];
var HSTOP={};('a an the my his her he she him it its is are was were be been being has have had and or of on in at to for with keeps keep keeping kept '+
  'dog dogs doggy pup our me i we you very really bit lot just seems seem seemed does do did from up this that these them they their there what how why '+
  'when then also some any all as so but if about into again always lately recently since still now think noticed notice seeing see can help helps please').split(' ').forEach(function(w){HSTOP[w]=1});
function hstem(w){var m=w.match(/^(.{3,}?)(ing|ed|es|s|e|y)$/);if(m)w=m[1];if(/([bdfgklmnprt])\1$/.test(w))w=w.slice(0,-1);return w}
var HALIAS={older:'old',elderly:'old',senior:'old',oldie:'old'};
function hwords(t){return String(t||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(function(w){return w&&!HSTOP[w]}).map(function(w){w=HALIAS[w]||w;return hstem(hstem(w))})}
SG.forEach(function(s){
  var seen={};s._syn=[];s._bag={};s.key=s.area+'/'+s.slug;
  s.syn.concat([s.name]).forEach(function(p){var ws=hwords(p);if(!ws.length)return;var k=ws.slice().sort().join(' ');if(seen[k])return;seen[k]=1;s._syn.push(ws);ws.forEach(function(w){s._bag[w]=1})});
});
function scanSymptoms(text){
  var has={};hwords(text).forEach(function(w){has[w]=1});
  var sc={};
  SG.forEach(function(s){
    var v=0;s._syn.forEach(function(ws){if(ws.every(function(w){return has[w]}))v+=Math.pow(ws.length,1.5)});
    Object.keys(has).forEach(function(w){if(s._bag[w])v+=.25});sc[s.slug]=v;
  });
  if(/after (a |the |long )?(walk|exercise|run|play)|morning/i.test(text))sc['stiffness-after-rest']+=.8;
  var list=SG.filter(function(s){return sc[s.slug]>=.75}).sort(function(a,b){return sc[b.slug]-sc[a.slug]});
  var top=list.length?sc[list[0].slug]:0;
  return list.filter(function(s){return sc[s.slug]>=top*.35}).slice(0,3);
}
function findCond(text){for(var i=0;i<CONDS.length;i++){if(CONDS[i].re.test(text))return CONDS[i]}return null}
function uniqProducts(keys,skip){
  var seen={},out=[];(skip||[]).forEach(function(p){seen[p.handle]=1});
  keys.forEach(function(k){(TAGS[k]||[]).forEach(function(h){if(!seen[h]&&BY[h]){seen[h]=1;out.push(BY[h])}})});
  return out;
}
function isSupp(p){return (OFF.test&&OFF.test.isSupplement(p))||kindTab(p)==='Supplements'}
function lowerFirst(n){return /^[A-Z][a-z]/.test(n)?n.charAt(0).toLowerCase()+n.slice(1):n}
/* A health topic: what to say, which products to show first, and a wider pool for the follow-ups. */
function healthTopic(text){
  var c=findCond(text),syms=scanSymptoms(text),older=/senior|elderly|\bold(er)? dog|getting old|ageing|aging/i.test(text);
  if(c&&c.weak&&syms.length)c=null;
  var t;
  if(c){
    var rel=c.rel?c.rel.map(function(k){return CBY[k]}):CONDS.filter(function(x){return x!==c&&!x.weak&&LINKED.some(function(l){return l[0]===x.key&&l[1].test(c.what)})});
    t={kind:'cond',name:c.name,low:lowerFirst(c.name),what:c.what,helps:c.helps.slice(),more:(c.more||[]).slice(),
       keys:[c.key],wider:rel.map(function(x){return x.key}).concat(older&&c.key!=='senior-support'?['senior-support']:[]),
       page:c.page||'#',guide:null,helpsLbl:'For '+lowerFirst(c.name),related:rel.slice(0,1).map(function(x){return x.name})};
  }else if(syms.length){
    var s=syms[0],links=LINKED.filter(function(l){return l[1].test(s.why)}).map(function(l){return l[0]}).filter(function(k){return CBY[k]});
    t={kind:'sym',name:s.name,low:lowerFirst(s.name),what:s.why,helps:s.helps.slice(0,2),more:s.helps.slice(2),
       keys:[s.key].concat(syms.slice(1,2).map(function(x){return x.key})),wider:links.concat(older?['senior-support']:[],syms.slice(2).map(function(x){return x.key}),[s.area]),
       page:'#',guide:'symptom-guide.html#'+s.slug,helpsLbl:'For '+lowerFirst(s.name).replace(/^(.{0,28}\S*).*$/,'$1'),
       related:syms.slice(1,2).map(function(x){return x.name}).concat(links.slice(0,1).map(function(k){return CBY[k].name}))};
    links.slice(0,2).forEach(function(k){(CBY[k].more||[]).concat(CBY[k].helps).forEach(function(h){if(t.more.length<3&&t.more.indexOf(h)<0&&t.helps.indexOf(h)<0)t.more.push(h)})});
  }else return null;
  var first=uniqProducts(t.keys);
  if(older&&t.kind==='sym')first=first.slice(0,4).concat(uniqProducts(['senior-support'],first.slice(0,4)).slice(0,2));
  if(first.length<3)first=first.concat(uniqProducts(t.wider,first)).slice(0,6);
  t.shown=first.slice(0,6);
  t.pool=first.concat(uniqProducts(t.wider,first));
  t.onlySupps=/supplement/i.test(text);
  return t;
}


/* ---------- the one site product card (PPCard, card.js + css/card.css) ---------- */
function cleanTitle(t){return String(t).replace(/\s*[|]\s*\d+\s*(g|ml|kg)\b.*$/i,'')}
function kindTab(p){
  var t=(p.productType||'').toLowerCase()+' '+(p.title||'').toLowerCase();
  if(/bundle|care kit/.test(t))return 'Care kit';
  if(/supplement|chew|powder|oil|capsule|tablet|probiotic/.test(t))return 'Supplements';
  if(/shampoo|conditioner|groom|wipe/.test(t))return 'Grooming';
  if(/spray|balm|gel|cream|lotion|ointment|drops|cleaner/.test(t))return 'Skin, ear & eye';
  if(/wheelchair|brace|harness|sling|ramp|boot|splint|support/.test(t))return 'Mobility aids';
  if(/food|treat|topper|broth|nibble/.test(t))return 'Food & treats';
  if(/bed|mat/.test(t))return 'Beds & comfort';
  if(/toothpaste|dental|brush/.test(t))return 'Dental care';
  return null;
}
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function rev(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  var n=p.reviewCount||0;
  return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function pk(p,helps){
  return PPCard.html(Object.assign({},p,{title:cleanTitle(p.title)}),{tab:kindTab(p)||'',helps:helps||''});
}
function rail(ps,helps,label){
  return '<div class="railwrap aia-rw"><div class="rail prail" tabindex="0" aria-label="'+esc(label||'Products')+'">'+
    ps.map(function(p){return pk(p,helps)}).join('')+'</div>'+
    '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
}
var railUps=[];
function bindRails(root){
  $$('.aia-rw',root).forEach(function(w){
    if(w._b)return;w._b=1;
    var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('aia-fit',max<=2);
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
    }
    function by(k){r.scrollBy({left:k*r.clientWidth*.85,behavior:REDUCE?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:REDUCE?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});
    railUps.push(up);up();setTimeout(up,60);
  });
}
window.addEventListener('resize',function(){railUps.forEach(function(f){f()})});
/* a blocked or missing photo falls back to the plain well */
d.addEventListener('error',function(e){
  var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-aia-img')){var s=d.createElement('span');s.className='aia-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);

/* ---------- basket: header count + button state ---------- */
d.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-add]');if(!b||!b.closest('[data-aia]'))return;
  $$('.cnt').forEach(function(c){var n=(parseInt(c.textContent,10)||0)+1;c.textContent=n;c.setAttribute('data-n',n)});
  b.textContent='Added';b.classList.add('aia-added');
  setTimeout(function(){b.textContent='Add to basket';b.classList.remove('aia-added')},1800);
});

/* ---------- order result (compact version of the track-my-order result) ---------- */
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dparts(s){
  if(!s)return null;
  if(/^\d{4}-\d\d-\d\d$/.test(s)){var a=s.split('-'),dt=new Date(Date.UTC(+a[0],a[1]-1,+a[2],12));return {y:+a[0],m:a[1]-1,d:+a[2],w:dt.getUTCDay()}}
  var t=new Date(s);if(isNaN(t))return null;
  try{var o={};new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'numeric',day:'numeric',weekday:'short'}).formatToParts(t).forEach(function(p){o[p.type]=p.value});return {y:+o.year,m:o.month-1,d:+o.day,w:DAYS.indexOf(o.weekday)}}
  catch(e){return {y:t.getFullYear(),m:t.getMonth(),d:t.getDate(),w:t.getDay()}}
}
function fday(s){var p=dparts(s);return p?DAYS[p.w]+' '+p.d+' '+MONTHS[p.m]:''}
function orderHTML(o,typed){
  var carrier=(o.tracking&&o.tracking[0]&&o.tracking[0].company)||'Evri';
  var s=String(o.shipmentStatus||'').toUpperCase(),ful=String(o.fulfillmentStatus||'').toUpperCase(),hasT=!!(o.tracking&&o.tracking.length),idx=0;
  if(s==='DELIVERED')idx=4;else if(s==='OUT_FOR_DELIVERY'||s==='ATTEMPTED_DELIVERY')idx=3;else if(s==='IN_TRANSIT')idx=2;
  else if(/LABEL|CONFIRMED|READY/.test(s))idx=1;else if(ful==='FULFILLED'||ful==='PARTIALLY_FULFILLED')idx=hasT?2:1;
  var ev={};(o.events||[]).forEach(function(e){var k={PLACED:0,CONFIRMED:1,LABEL_PURCHASED:1,LABEL_PRINTED:1,IN_TRANSIT:2,OUT_FOR_DELIVERY:3,ATTEMPTED_DELIVERY:3,DELIVERED:4}[String(e.status).toUpperCase()];if(k!=null&&!ev[k])ev[k]=e.at});
  if(!ev[0]&&o.createdAt)ev[0]=o.createdAt;
  var steps=['Order placed','Packed','With '+carrier,'Out for delivery','Delivered'];
  var head=['We’ve got your order','Packed and waiting for '+carrier,'Your parcel is with '+carrier,'Out for delivery','Delivered'][idx];
  var eta=idx<4&&o.estimatedDelivery?fday(o.estimatedDelivery)+(o.estimatedLatest?' to '+fday(o.estimatedLatest):''):'';
  var t=hasT?o.tracking[0]:null;
  var items=(o.items||[]).map(function(it){var p=BY[it.handle];return {t:cleanTitle(it.title||(p&&p.title)||'Item'),q:it.quantity||1}});
  return '<div class="aia-ord">'+
    (o.example?'<p class="aia-ex"><b>Example order.</b> This preview shows a made-up order'+(typed?' (you entered '+esc(typed)+')':'')+'. On the live site it shows the real order for the number and email entered.</p>':'')+
    '<span class="aia-lbl">Order '+esc(o.name)+(ev[0]?' · placed '+esc(fday(ev[0])):'')+'</span>'+
    '<b class="aia-oh">'+esc(head)+'</b>'+(eta?'<span class="aia-eta">Estimated delivery <b>'+esc(eta)+'</b></span>':'')+
    '<ol class="aia-steps" aria-label="Delivery progress">'+steps.map(function(x,i){var st=i<idx||(i===4&&idx===4)?'done':i===idx?'now':'todo';return '<li class="is-'+st+'"'+(st==='now'?' aria-current="step"':'')+'><span class="aia-dot" aria-hidden="true"></span><span>'+esc(x)+'</span></li>'}).join('')+'</ol>'+
    (t?'<div class="aia-trk"><span><span class="aia-lbl">'+esc(t.company||carrier)+' tracking reference</span><b>'+esc(t.number)+'</b></span>'+(t.url?'<a class="btn sec sm" href="'+esc(t.url)+'" target="_blank" rel="noopener">Track with '+esc(t.company||carrier)+'<span class="sr"> (opens in a new tab)</span></a>':'')+'</div>':'')+
    (items.length?'<ul class="aia-items">'+items.map(function(x){return '<li><span>'+esc(x.t)+'</span><span>Qty '+x.q+'</span></li>'}).join('')+'</ul>':'')+
    '<a class="aia-more" href="track-my-order.html">Open the full tracking page ›</a></div>';
}

/* ================================================================
   One chat instance per [data-aia] container
   ================================================================ */
var START=['My dog keeps scratching','Stiff in the mornings','Upset tummy','Scared of fireworks','Recovery after surgery','Where is my order?'];
var PH='Describe what you’re seeing, e.g. licking his paws';
var uid=0;

function Chat(root){
  var id='aia'+(++uid),self=this;
  var closeBtn=root.hasAttribute('data-aia-close')?'<button class="aia-x" type="button" data-aia-x aria-label="Close the assistant"><span aria-hidden="true">&times;</span></button>':'';
  root.innerHTML=
    '<div class="aia-ch"><span class="aia-av" aria-hidden="true">pp</span><div class="aia-cht"><h2 class="aia-chn" id="'+id+'-t">Poorly Pet assistant</h2><span>Dog health, products and orders</span></div>'+
    '<button class="aia-mail" type="button" data-aia-handoff>Email our team</button>'+closeBtn+'</div>'+
    '<div class="aia-log" role="log" aria-live="polite" aria-relevant="additions" aria-labelledby="'+id+'-t" tabindex="0"></div>'+
    '<p class="sr" role="status" data-aia-status></p>'+
    '<div class="aia-foot"><div class="aia-sugg" data-aia-sugg role="group" aria-label="Suggested questions"></div>'+
    '<form class="aia-form" autocomplete="off" novalidate><label class="sr" for="'+id+'-in">Type your question</label>'+
    '<input id="'+id+'-in" type="text" placeholder="'+esc(PH)+'" maxlength="400" enterkeyhint="send">'+
    '<button class="btn sec aia-send" type="submit">Send</button></form>'+
    '<p class="aia-fine">Our guides don’t replace your vet.</p></div>';
  var log=$('.aia-log',root),form=$('form',root),input=$('input',root),sugg=$('[data-aia-sugg]',root),status=$('[data-aia-status]',root);
  var history=[],transcript=[],mode=null,pending={},busy=false,topic=null;
  this.root=root;this.input=input;

  function scrollTo(el){
    var top=el?el.offsetTop-12:log.scrollHeight;
    try{log.scrollTo({top:top,behavior:REDUCE?'auto':'smooth'})}catch(e){log.scrollTop=top}
  }
  function add(html,who,cls){
    var m=d.createElement('div');m.className='aia-m '+who+(cls?' '+cls:'');
    m.innerHTML=(who==='me'?'<span class="sr">You said: </span>':'<span class="sr">Assistant: </span>')+html;
    log.appendChild(m);bindRails(m);
    $$('img[data-aia-img]',m).forEach(function(i){if(i.complete&&!i.naturalWidth)i.dispatchEvent(new Event('error'))});
    transcript.push((who==='me'?'You: ':'Assistant: ')+strip(html).slice(0,400));
    if(who==='me')scrollTo();else scrollTo(m);
    return m;
  }
  function typing(on){
    var t=$('.aia-typing',log);
    if(on&&!t){t=d.createElement('div');t.className='aia-typing';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i><i></i><i></i>';log.appendChild(t);scrollTo();status.textContent='The assistant is typing'}
    if(!on&&t){t.remove();status.textContent=''}
  }
  function bot(html,cls,ms){
    typing(true);
    return wait(ms||650).then(function(){typing(false);return add(html,'bot',cls)});
  }
  function chips(list){
    sugg.innerHTML=list.map(function(c){return '<button type="button" class="aia-chip'+(c==='Email our team'?' aia-chip-mail':'')+'">'+esc(c)+'</button>'}).join('');
  }
  sugg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;self.ask(b.textContent);input.focus({preventScroll:true})});
  log.addEventListener('click',function(e){
    var q=e.target.closest('[data-aia-ask]');if(q){e.preventDefault();self.ask(q.getAttribute('data-aia-ask'));return}
    var c=e.target.closest('[data-aia-copy]');if(c){copyChat(c);return}
  });
  $('[data-aia-handoff]',root).addEventListener('click',function(){self.ask('Email our team')});
  form.addEventListener('submit',function(e){e.preventDefault();var v=input.value.trim();if(!v){input.focus();return}input.value='';self.ask(v)});

  function setMode(m){
    mode=m;
    input.type=m==='email'?'email':'text';
    input.setAttribute('inputmode',m==='email'?'email':m==='order'?'text':'text');
    input.setAttribute('autocomplete',m==='email'?'email':'off');
    input.placeholder=m==='order'?'Order number, e.g. 1024 or #1024':m==='email'?'The email you used at checkout':PH;
  }

  /* ----- email handoff with the chat as a prefilled transcript ----- */
  function mailto(){
    var body='Hello Poorly Pet,\n\n[Add anything else here]\n\n--- My chat with the assistant ---\n'+transcript.join('\n');
    if(body.length>1800)body=body.slice(0,1800)+'\n[chat shortened]';
    return 'mailto:hello@poorly-pet.com?subject='+encodeURIComponent('Question from the support assistant')+'&body='+encodeURIComponent(body);
  }
  function copyChat(btn){
    var txt=transcript.join('\n');
    var done=function(){btn.textContent='Chat copied';setTimeout(function(){btn.textContent='Copy the chat'},1600)};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,done);else done();
  }
  function handoff(){
    return bot('<p><b>Email our team.</b> Real people read every email and reply within one working day, Monday to Friday.</p>'+
      '<div class="aia-hand"><a class="btn sec" data-aia-mailto href="'+esc(mailto())+'">Email us with this chat</a>'+
      '<button class="aia-link" type="button" data-aia-copy>Copy the chat</button></div>'+
      '<p class="aia-small">Opens your email app, addressed to <a href="mailto:hello@poorly-pet.com">hello@poorly-pet.com</a>, with this conversation added. If it’s about an order, include your order number.</p>','aia-card')
      .then(function(m){var a=$('[data-aia-mailto]',m);a.addEventListener('click',function(){a.href=mailto()});chips(['Where is my order?','How do I start a return?','How can I contact you?'])});
  }

  /* ----- where is my order ----- */
  function startOrder(){
    setMode('order');pending={};
    return bot('<p>I can check that. What’s your order number? It’s in your order confirmation email, for example #1024.</p>')
      .then(function(){chips(LIVE?['Cancel']:['Use the example order','Cancel'])});
  }
  function orderStep(v){
    if(/^(cancel|stop|never ?mind)$/i.test(v)){setMode(null);return bot('<p>No problem. What else can I help with?</p>').then(function(){chips(START)})}
    if(mode==='order'){
      if(/example/i.test(v)){pending.order='#1234';pending.email='example';return runLookup(true)}
      var n=v.replace(/\s/g,'').match(/^#?(\d{3,8})$/);
      if(!n)return bot('<p>That doesn’t look like an order number. It’s the number starting with # in your confirmation email, for example #1024.</p>').then(function(){chips(LIVE?['Cancel']:['Use the example order','Cancel'])});
      pending.order='#'+n[1];setMode('email');
      return bot('<p>Thanks. And the email address you used at checkout?</p>').then(function(){chips(['Cancel'])});
    }
    if(mode==='email'){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return bot('<p>Please enter the full email address you used at checkout, for example name@example.com.</p>').then(function(){chips(['Cancel'])});
      pending.email=v;return runLookup(false);
    }
  }
  function runLookup(example){
    setMode(null);typing(true);
    return lookupOrder(pending.order,pending.email).then(function(r){
      typing(false);
      if(r&&r.found&&r.order){
        add('<p>Here’s the latest on your order.</p>'+orderHTML(r.order,example?null:pending.order),'bot','aia-wide');
        chips(['When will my order arrive?','My order hasn’t arrived','Email our team']);
      }else{
        add('<p>'+esc(r&&r.message||'We couldn’t find an order with that number and email.')+' Check both against your confirmation email, or our team can look it up for you.</p>','bot');
        chips(['Where is my order?','Email our team']);
      }
    }).catch(function(){
      typing(false);add('<p>Sorry, order tracking isn’t responding right now. Please try again shortly, or email our team with your order number.</p>','bot');chips(['Where is my order?','Email our team']);
    });
  }

  /* ----- local answers ----- */
  function faqAnswer(m){
    var f=m.f;
    return bot('<p class="aia-q">'+esc(f.q)+'</p><div class="aia-a">'+f.a+(EXTRA[f.id]||'')+'</div><a class="aia-more" href="faqs.html#'+esc(f.id)+'">Read more in FAQs ›</a>','aia-faq',700)
      .then(function(){
        var next=[];if(m.alt&&m.alt!==f)next.push(m.alt.q);
        POP.forEach(function(p){if(next.length<3&&p!==f&&p!==m.alt)next.push(p.q)});
        next.push('Email our team');chips(next);
      });
  }
  /* ----- dog health: what it may be, what helps, products (homepage .pk cards) ----- */
  function shopLinks(t){
    return '<p class="aia-links2"><a class="aia-more" href="'+esc(t.page)+'">Shop all for '+esc(t.low)+' ›</a>'+
      (t.guide?'<a class="aia-more" href="'+esc(t.guide)+'">Symptom guide ›</a>':'')+'</p>';
  }
  function healthChips(t){
    var c=['What else helps?','Show supplements only'];
    (t.related||[]).slice(0,1).forEach(function(r){if(r&&r!==t.name)c.push(r)});
    c.push('Email our team');chips(c);
  }
  function list(xs){return '<ul class="aia-ul">'+xs.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'}
  function healthAnswer(t){
    topic=t;
    var ps=t.onlySupps?t.pool.filter(isSupp).slice(0,6):t.shown;
    if(!ps.length)ps=t.shown;
    t.seen=ps.slice();
    var html='<p class="aia-q">'+esc(t.name)+'</p>'+
      '<p><b>'+(t.kind==='sym'?'What it may be':'What it is')+':</b> '+esc(t.what)+'</p>'+
      '<p><b>What helps:</b></p>'+list(t.helps)+
      (ps.length?'<p class="aia-plead">'+(t.onlySupps?'Supplements':'Products')+' owners choose for '+esc(t.low)+':</p>'+rail(ps,t.helpsLbl,'Products for '+t.low)+shopLinks(t):'');
    return bot(html,'aia-wide aia-health',800).then(function(){healthChips(t)});
  }
  function moreHelps(){
    var t=topic;
    if(!t)return bot('<p>Tell me what you’re seeing, for example “my dog keeps licking his paws”, and I’ll suggest what helps.</p>').then(function(){chips(START)});
    var next=t.pool.filter(function(p){return t.seen.indexOf(p)<0}).slice(0,6);
    t.seen=t.seen.concat(next);
    var tips=t.more.length?t.more:[];
    var html='<p class="aia-q">More for '+esc(t.low)+'</p>'+(tips.length?'<p><b>Also worth trying:</b></p>'+list(tips):'')+
      (next.length?'<p class="aia-plead">More products owners use:</p>'+rail(next,t.helpsLbl,'More products for '+t.low)+shopLinks(t):'<p>That’s everything we’d suggest for '+esc(t.low)+'. Our team can help on email.</p>');
    return bot(html,'aia-wide aia-health',700).then(function(){
      var c=['Show supplements only'];(t.related||[]).slice(0,1).forEach(function(r){c.push(r)});c.push('Email our team');chips(c);
    });
  }
  function suppsOnly(){
    var t=topic;
    if(!t)return bot('<p>Which problem are the supplements for? Tell me what you’re seeing, or pick a topic below.</p>').then(function(){chips(START)});
    var ps=t.pool.filter(isSupp).slice(0,6);
    if(!ps.length)return bot('<p>We don’t have a supplement specifically for '+esc(t.low)+'. The products above are the ones owners choose.</p>').then(function(){healthChips(t)});
    t.seen=t.seen.concat(ps.filter(function(p){return t.seen.indexOf(p)<0}));
    return bot('<p class="aia-q">Supplements for '+esc(t.low)+'</p><p>Most need a few weeks of daily use. Check with your vet first if your dog takes medication.</p>'+
      rail(ps,t.helpsLbl,'Supplements for '+t.low)+'<p class="aia-links2"><a class="aia-more" href="#">Shop all supplements ›</a></p>','aia-wide aia-health',700)
      .then(function(){chips(['What else helps?','How long do supplements take to work?','Email our team'])});
  }
  function fallback(){
    return bot('<p>I’m not sure about that one. Tell me what you’re seeing in a few words, for example “scratching at his ears” or “stiff after walks”, pick a topic below, or email our team.</p>')
      .then(function(){chips(['Itchy skin','Joint pain and stiffness','Tummy upsets','Where is my order?','Email our team'])});
  }
  /* order, delivery and account questions go to the FAQ answers, even when a health word appears */
  var ORDERISH=/medication|medicine|puppy|puppies|pregnan|\bcats?\b|store|storing|react|measure|\bsize|sizing|take to work|won'?t eat the|deliver|postage|shipping|return|refund|\border|parcel|subscri|points|\bclub\b|\bpay|discount|\bcode\b|account|password|contact|brands?\b|reviews?\b|genuine|cancel/i;
  function local(text){
    if(/^(hi|hello|hey|good (morning|afternoon|evening))\b[\s!.]*$/i.test(text))return bot('<p>Hello. What’s going on with your dog?</p>').then(function(){chips(START)});
    if(/^(thanks|thank you|cheers|great|ok|okay)\b/i.test(text))return bot('<p>You’re welcome. Anything else?</p>').then(function(){chips(START)});
    var f=matchFAQ(text);
    if(f&&ORDERISH.test(text))return faqAnswer(f);
    var t=healthTopic(text);
    if(t)return healthAnswer(t);
    if(f)return faqAnswer(f);
    return fallback();
  }

  /* ----- live answer (same workflow as the live page), local fallback ----- */
  function live(text){
    var f=matchFAQ(text);
    if(f&&ORDERISH.test(text))return faqAnswer(f);
    typing(true);
    return askLive(history).then(function(dt){
      typing(false);
      var html='<p>'+esc(dt.reply||'').replace(/\n+/g,'</p><p>')+'</p>';
      history.push({role:'assistant',content:dt.reply||''});
      var ps=(dt.products||[]).map(function(x){
        var h=String(x.url||'').split('/products/')[1];h=h&&h.split(/[?#]/)[0];
        return BY[h]||{handle:h||'',title:x.name||'',brand:'',price:Number(x.price)||0,img:x.image||null,productType:''};
      }).slice(0,6);
      var t=healthTopic(text);if(t)topic=t;
      if(ps.length)html+=rail(ps,null,'Suggested products')+'<p class="aia-links2"><a class="aia-more" href="'+esc(t?t.page:'#')+'">Shop all'+(t?' for '+esc(t.low):'')+' ›</a></p>';
      add(html,'bot',ps.length?'aia-wide aia-health':'');
      chips(['What else helps?','Show supplements only','Email our team']);
    }).catch(function(){typing(false);return local(text)});
  }

  this.ask=function(text){
    text=String(text||'').trim();if(!text||busy)return;
    busy=true;
    add('<p>'+esc(text)+'</p>','me');sugg.innerHTML='';
    history.push({role:'user',content:text});
    var p;
    if(mode)p=orderStep(text);
    else if(/^email our team$|\b(speak|talk|chat) (to|with) (a |an |someone|somebody|person|human|real)|\breal person\b|\bhuman\b|\bagent\b/i.test(text))p=handoff();
    else if(/where('?s| is)? (my|the) (order|parcel|package|delivery)|track(ing)? (my|an|the)? ?(order|parcel)|\btrack my\b|order status|status of my order|check (on )?my order|^track/i.test(text))p=startOrder();
    else if(!LIVE&&/^what else (helps|can i do|could help)\??$/i.test(text))p=moreHelps();
    else if(!LIVE&&/^(show )?(me )?(the )?supplements( only)?$|^just supplements$|^only supplements$/i.test(text))p=suppsOnly();
    else if(!LIVE&&topic&&topic.related.indexOf(text)>-1)p=healthAnswer(healthTopic(text)||topic);
    else p=LIVE?live(text):local(text);
    Promise.resolve(p).then(function(){busy=false},function(){busy=false});
  };
  this.focus=function(){input.focus({preventScroll:true})};

  /* greeting */
  add('<p>Hello. Tell me what’s going on with your dog, in your own words. I’ll explain what it may be, what helps, and the products owners choose. I can help with orders and delivery too.</p>','bot');
  transcript=[];
  chips(START);
}

/* ================================================================
   Page wiring for the three versions
   ================================================================ */
var chats=$$('[data-aia]').map(function(r){return new Chat(r)});
if(!chats.length)return;
var chat=chats[0];

/* any [data-aia-q] button or link on the page asks that question */
d.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-aia-q]');if(!b||b.closest('.aia-log'))return;
  e.preventDefault();
  var q=b.getAttribute('data-aia-q');
  if(panel&&!open)openPanel();
  else if(!panel){var r=chat.root.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.5)chat.root.scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'center'})}
  chat.ask(q);chat.focus();
});

/* popular questions lists (B and C) */
$$('[data-aia-pop]').forEach(function(ul){
  var n=+ul.getAttribute('data-aia-pop')||8;
  ul.innerHTML=POP.slice(0,n).map(function(f){return '<li><button type="button" data-aia-q="'+esc(f.q)+'"><span>'+esc(f.q)+'</span><i aria-hidden="true">›</i></button></li>'}).join('');
});
/* FAQ accordion (C) */
$$('[data-aia-acc]').forEach(function(box){
  var n=+box.getAttribute('data-aia-acc')||8;
  box.innerHTML=POP.slice(0,n).map(function(f){return '<details class="aia-q"><summary>'+esc(f.q)+'</summary><div class="aia-qa">'+f.a+(EXTRA[f.id]||'')+'<a class="aia-more" href="faqs.html#'+esc(f.id)+'">Read more in FAQs ›</a></div></details>'}).join('');
});

/* B final and C: floating launcher + pop-up panel (Esc closes, focus goes back) */
var panel=$('[data-aia-panel]'),launch=$('[data-aia-launch]'),open=false,lastFocus=null;
function openPanel(){
  if(!panel)return;open=true;lastFocus=d.activeElement;
  panel.hidden=false;requestAnimationFrame(function(){panel.classList.add('is-open')});
  launch.setAttribute('aria-expanded','true');launch.classList.add('is-open');
  d.documentElement.classList.add('aia-lock');
  railUps.forEach(function(f){f()});chat.focus();
}
function closePanel(){
  if(!panel||!open)return;open=false;
  panel.classList.remove('is-open');launch.setAttribute('aria-expanded','false');launch.classList.remove('is-open');
  d.documentElement.classList.remove('aia-lock');
  setTimeout(function(){if(!open)panel.hidden=true},REDUCE?0:200);
  (lastFocus&&lastFocus!==d.body?lastFocus:launch).focus();
}
if(panel&&launch){
  launch.addEventListener('click',function(){open?closePanel():openPanel()});
  panel.addEventListener('click',function(e){if(e.target.closest('[data-aia-x]'))closePanel()});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&open)closePanel()});
  $$('[data-aia-open]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();openPanel()})});
}
/* hero question box (B final, C) opens the panel and asks; empty just opens it */
$$('[data-aia-askform]').forEach(function(f){
  f.addEventListener('submit',function(e){e.preventDefault();var i=$('input',f),v=i.value.trim();if(!v){if(panel)openPanel();else i.focus();return}i.value='';if(panel)openPanel();chat.ask(v)});
});
})();
