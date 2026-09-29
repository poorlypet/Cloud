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

   THIS PREVIEW makes no external requests. LIVE=false answers locally from:
     - the FAQ data in faqs.js (copied below, same sources and wording),
     - the example order from track-my-order.js (clearly labelled example),
     - PP_TAGS / PP_PRODUCTS (products.js) and PPOffers (offers.js).
   On the store set LIVE=true: free-text questions go to the chat Worker with
   the same request shape as today, order lookups go to the track Worker, and
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
 a:'<p>Each product page lists the conditions and symptoms it is designed to support. You can also shop by condition or by symptom, take the <a href="dog-health-quiz-a.html">dog health quiz</a>, or email us and a real person will reply.</p>'},
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
 a:'<p>Yes. Reviews are collected by Judge.me from real customers, and we publish good and bad. We are rated 4.6 out of 5 from 101 reviews. <a href="customer-reviews-a.html">Read customer reviews</a>.</p>'},
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
   Symptom words -> PP_TAGS keys (products.js). Best match first.
   ------------------------------------------------------------------ */
var SYMPTOMS=[
  {re:/hot ?spots?|raw patch|weepy/i,keys:['hot-spots','skin-coat/raw-weepy-hot-spots'],label:'hot spots',helps:'For hot spots'},
  {re:/itch|scratch|allerg|red skin|irritated skin|rash/i,keys:['skin-coat/excessive-scratching','itchy-skin','skin-coat/red-or-irritated-skin'],label:'itchy skin',helps:'For itchy skin'},
  {re:/flak|dandruff|dry skin|dry coat/i,keys:['skin-coat/flaky-skin-or-dandruff','skin-coat'],label:'dry, flaky skin',helps:'For dry, flaky skin'},
  {re:/hair loss|bald|losing (hair|fur)/i,keys:['skin-coat/hair-loss-or-bald-patches'],label:'hair loss',helps:'For skin and coat'},
  {re:/(lick|chew)\w* (at )?(his |her |their )?paws?|paws? (lick|chew)/i,keys:['legs-paws/licking-or-chewing-paws'],label:'paw licking',helps:'For sore paws'},
  {re:/ears?\b|head shak/i,keys:['eyes-ears/scratching-at-ears','ear-eye-care','eyes-ears/odour-from-the-ears'],label:'ear care',helps:'For ears'},
  {re:/eyes?\b|tear stain/i,keys:['eyes-ears/weepy-or-red-eyes','ear-eye-care'],label:'eye care',helps:'For eyes'},
  {re:/knuckl|drag\w* (his |her |their )?(back )?(paw|feet|foot)|scuff/i,keys:['knuckling','legs-paws/scuffed-nails-or-dragging-paws'],label:'knuckling',helps:'For knuckling'},
  {re:/paraly|can'?t walk|cannot walk|wheelchair|back legs? (have )?gone/i,keys:['paralysis'],label:'mobility loss',helps:'For mobility loss'},
  {re:/wobbl|back legs? weak|weak back legs|rear (leg )?weak|hind legs?/i,keys:['rear-leg-weakness','back-spine/wobbly-back-legs'],label:'rear leg weakness',helps:'For rear leg weakness'},
  {re:/ivdd|disc|slipped|yelp|back pain|spine|hunch/i,keys:['ivdd','back-pain','back-spine/yelping-when-touched'],label:'back support',helps:'For back support'},
  {re:/cruciate|acl|ccl|knee/i,keys:['cruciate-ligament'],label:'knee support',helps:'For knee support'},
  {re:/patella|skipp/i,keys:['luxating-patella'],label:'luxating patella',helps:'For luxating patella'},
  {re:/hip/i,keys:['hip-dysplasia'],label:'hip support',helps:'For hips'},
  {re:/elbow/i,keys:['elbow-dysplasia'],label:'elbow support',helps:'For elbows'},
  {re:/wrist|carpal/i,keys:['carpal-hyperextension'],label:'carpal support',helps:'For wrists'},
  {re:/limp|lame|favour/i,keys:['legs-paws/limping-or-favouring-a-leg','arthritis'],label:'limping',helps:'For limping'},
  {re:/stiff|arthrit|joint|slow to get up|struggl\w* to get up|old dog|older dog|senior/i,keys:['arthritis','legs-paws/stiffness-after-rest','senior-support'],label:'stiff joints',helps:'For stiff joints'},
  {re:/breath|teeth|tooth|tartar|plaque|gums?\b|dental/i,keys:['dental-disease','mouth-teeth/bad-breath'],label:'teeth and breath',helps:'For teeth and breath'},
  {re:/diarrh|loose (stool|poo)|runny poo|upset (tummy|stomach)|tummy|stomach|vomit|being sick|wind\b|gassy|farting|gut/i,keys:['digestive-issues','tummy-gut/loose-stools-or-diarrhoea'],label:'a settled tummy',helps:'For a settled tummy'},
  {re:/firework|thunder|noise/i,keys:['noise-fear'],label:'noise fear',helps:'For noise fear'},
  {re:/left alone|separation|when i leave|home alone/i,keys:['separation-anxiety','anxiety'],label:'separation anxiety',helps:'For calm when alone'},
  {re:/anxi|stress|nervous|calm|pacing|restless/i,keys:['anxiety','behaviour-mood/pacing-or-restlessness'],label:'calm and confidence',helps:'For calm and confidence'},
  {re:/overweight|weight|obese|\bfat\b|chubby/i,keys:['weight-management'],label:'a healthy weight',helps:'For a healthy weight'},
  {re:/kidney|drinking (a lot|more|loads)/i,keys:['kidney-support'],label:'kidney support',helps:'For kidney support'},
  {re:/surgery|operation|spay|neuter|stitches|wound|cone|recover/i,keys:['post-surgery-recovery','wound-recovery'],label:'recovery',helps:'For recovery'}
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

/* ---------- symptoms -> products ---------- */
function matchSymptom(q){
  for(var i=0;i<SYMPTOMS.length;i++){if(SYMPTOMS[i].re.test(q))return SYMPTOMS[i]}
  return null;
}
function productsFor(s){
  var seen={},out=[];
  s.keys.forEach(function(k){(TAGS[k]||[]).forEach(function(h){if(!seen[h]&&BY[h]){seen[h]=1;out.push(BY[h])}})});
  return out.slice(0,8);
}

/* ---------- the site's product card (.pk, exactly as the homepage) ---------- */
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
  var badge=OFF.badge(p),line=OFF.lines(p)[0],tab=kindTab(p),sale=p.compareAt&&p.compareAt>p.price,src=p.img||'';
  return '<article class="pk">'+(badge?'<span class="tab aia-otab">'+esc(badge)+'</span>':tab?'<span class="tab">'+esc(tab)+'</span>':'')+
    '<a class="well" href="#">'+(src?'<img src="'+esc(src)+'" alt="" loading="lazy" data-aia-img>':'<span class="aia-noimg" aria-hidden="true"></span>')+'</a>'+
    '<div class="body"><span class="brand">'+esc(p.brand)+'</span><a class="name" href="#">'+esc(cleanTitle(p.title))+'</a>'+rev(p)+
    (helps?'<span class="helps">'+esc(helps)+'</span>':'')+
    '<div class="price"><span class="now">'+money(p.price)+'</span>'+(sale?'<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>':'')+'</div>'+
    (line?'<p class="aia-oline">'+esc(line)+'</p>':'')+
    '<button class="btn" type="button" data-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
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
    '<a class="aia-more" href="track-my-order-a.html">Open the full tracking page ›</a></div>';
}

/* ================================================================
   One chat instance per [data-aia] container
   ================================================================ */
var START=['Where is my order?','How much is delivery?','How do I start a return?','My dog has itchy skin','How does Subscribe & Save work?','Email our team'];
var uid=0;

function Chat(root){
  var id='aia'+(++uid),self=this;
  var closeBtn=root.hasAttribute('data-aia-close')?'<button class="aia-x" type="button" data-aia-x aria-label="Close the assistant"><span aria-hidden="true">&times;</span></button>':'';
  root.innerHTML=
    '<div class="aia-ch"><span class="aia-av" aria-hidden="true">pp</span><div class="aia-cht"><h2 class="aia-chn" id="'+id+'-t">Poorly Pet assistant</h2><span>Answers from our FAQs and product range</span></div>'+
    '<button class="aia-mail" type="button" data-aia-handoff>Email our team</button>'+closeBtn+'</div>'+
    '<div class="aia-log" role="log" aria-live="polite" aria-relevant="additions" aria-labelledby="'+id+'-t" tabindex="0"></div>'+
    '<p class="sr" role="status" data-aia-status></p>'+
    '<div class="aia-foot"><div class="aia-sugg" data-aia-sugg role="group" aria-label="Suggested questions"></div>'+
    '<form class="aia-form" autocomplete="off" novalidate><label class="sr" for="'+id+'-in">Type your question</label>'+
    '<input id="'+id+'-in" type="text" placeholder="Ask about an order, delivery, returns or a product" maxlength="400" enterkeyhint="send">'+
    '<button class="btn sec aia-send" type="submit">Send</button></form>'+
    '<p class="aia-fine">Answers come from our FAQs and products. Our guides don’t replace your vet.</p></div>';
  var log=$('.aia-log',root),form=$('form',root),input=$('input',root),sugg=$('[data-aia-sugg]',root),status=$('[data-aia-status]',root);
  var history=[],transcript=[],mode=null,pending={},busy=false;
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
    input.placeholder=m==='order'?'Order number, e.g. 1024 or #1024':m==='email'?'The email you used at checkout':'Ask about an order, delivery, returns or a product';
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
    return bot('<p class="aia-q">'+esc(f.q)+'</p><div class="aia-a">'+f.a+(EXTRA[f.id]||'')+'</div><a class="aia-more" href="faqs-a.html#'+esc(f.id)+'">Read more in FAQs ›</a>','aia-faq',700)
      .then(function(){
        var next=[];if(m.alt&&m.alt!==f)next.push(m.alt.q);
        POP.forEach(function(p){if(next.length<3&&p!==f&&p!==m.alt)next.push(p.q)});
        next.push('Email our team');chips(next);
      });
  }
  function symptomAnswer(s){
    var ps=productsFor(s);
    if(!ps.length)return fallback();
    return bot('<p>These are the products owners most often choose for '+esc(s.label)+'. If it doesn’t settle, your vet can find the cause.</p>'+rail(ps,s.helps,'Products for '+s.label)+'<a class="aia-more" href="#">Shop all for '+esc(s.label)+' ›</a>','aia-wide',800)
      .then(function(){chips(['How long do supplements take to work?','Can I give supplements alongside my dog’s medication?','Email our team'])});
  }
  function fallback(){
    return bot('<p>I’m not sure about that one. Try asking another way, pick a question below, or email our team and a real person will reply within one working day.</p>')
      .then(function(){chips(['Where is my order?','How much is delivery?','How do I start a return?','Email our team'])});
  }
  function local(text){
    if(/^(hi|hello|hey|good (morning|afternoon|evening))\b[\s!.]*$/i.test(text))return bot('<p>Hello. What can I help with today?</p>').then(function(){chips(START)});
    if(/^(thanks|thank you|cheers|great|ok|okay)\b/i.test(text))return bot('<p>You’re welcome. Anything else?</p>').then(function(){chips(START)});
    var s=matchSymptom(text),f=matchFAQ(text);
    if(s&&!(f&&/supplement|medication|puppy|puppies|cat|store|react/i.test(text)))return symptomAnswer(s);
    if(f)return faqAnswer(f);
    return fallback();
  }

  /* ----- live answer (same workflow as the live page), local fallback ----- */
  function live(text){
    typing(true);
    return askLive(history).then(function(dt){
      typing(false);
      var html='';
      if(dt.urgent)html+='<p><b>From what you describe, please speak to your vet.</b></p>';
      html+='<p>'+esc(dt.reply||'').replace(/\n+/g,'</p><p>')+'</p>';
      history.push({role:'assistant',content:dt.reply||''});
      var ps=(dt.products||[]).map(function(x){
        var h=String(x.url||'').split('/products/')[1];h=h&&h.split(/[?#]/)[0];
        return BY[h]||{handle:h||'',title:x.name||'',brand:'',price:Number(x.price)||0,img:x.image||null,productType:''};
      });
      if(ps.length)html+=rail(ps,null,'Suggested products');
      add(html,'bot',ps.length?'aia-wide':'');
      chips(['Where is my order?','Email our team']);
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
    else p=LIVE?live(text):local(text);
    Promise.resolve(p).then(function(){busy=false},function(){busy=false});
  };
  this.focus=function(){input.focus({preventScroll:true})};

  /* greeting */
  add('<p>Hello. I can help with orders, delivery, returns and our products, and suggest products for common problems. For anything else, our team is on email.</p>','bot');
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
  box.innerHTML=POP.slice(0,n).map(function(f){return '<details class="aia-q"><summary>'+esc(f.q)+'</summary><div class="aia-qa">'+f.a+(EXTRA[f.id]||'')+'<a class="aia-more" href="faqs-a.html#'+esc(f.id)+'">Read more in FAQs ›</a></div></details>'}).join('');
});

/* C: floating launcher + panel */
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
/* C: hero question box opens the panel and asks */
$$('[data-aia-askform]').forEach(function(f){
  f.addEventListener('submit',function(e){e.preventDefault();var i=$('input',f),v=i.value.trim();if(!v){i.focus();return}i.value='';if(panel)openPanel();chat.ask(v)});
});
})();
