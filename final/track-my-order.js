/* ==========================================================================
   Poorly Pet: Track my order. Shared by track-my-order-a/-b/-c.html.

   HOW THE LIVE PAGE WORKS (read from the store, 28 Sep 2026, read only)
   - Live page: /pages/track-order (Shopify page "Track Order", GemPages page
     625131184564732777, one "Custom Code" element, published 22 Jun 2026).
   - It asks for two things: Order number ("e.g. 1024 or #1024") and the
     Email address used at checkout.
   - On submit it POSTs JSON {order, email} to a Cloudflare Worker:
       https://poorlypet-track.green-mud-a533.workers.dev
     The Worker answers:
       {found:false, message}                      order/email do not match
       {error}                                     something went wrong
       {found:true, order:{
          name:"#1024", financialStatus, fulfillmentStatus,
          tracking:[{number, url, company}],       company is "Evri" in practice
          estimatedDelivery,                       ISO date or null
          items:[{title, quantity}],
          statusUrl                                Shopify order status page
       }}
   - Orders ship with Evri through Shopify Shipping (fulfilment events
     LABEL_PURCHASED, LABEL_PRINTED, IN_TRANSIT ... on recent orders).

   THIS PREVIEW never calls the Worker (no external requests). LIVE=false shows
   the clearly labelled EXAMPLE order below. On the store set LIVE=true.
   Optional Worker extras this page will use if present (all fall back safely):
     order.shipmentStatus   = fulfillments[0].displayStatus (IN_TRANSIT,
                              OUT_FOR_DELIVERY, DELIVERED ...) for steps 4 and 5
     order.events           = [{status, at}] fulfilment event times
     order.createdAt, order.items[].image / .price, order.subtotal, order.total,
     order.shipping         = {title, price}
   ========================================================================== */
(function(){
'use strict';

/* ------------------------------------------------------------------
   >>> REAL LOOKUP PLUGS IN HERE <<<
   Same endpoint and payload as the live /pages/track-order page.
   ------------------------------------------------------------------ */
var ENDPOINT='https://poorlypet-track.green-mud-a533.workers.dev';
var LIVE=false; /* true on poorly-pet.com; false in this preview */

function lookup(order,email){
  if(!LIVE){
    return new Promise(function(res){setTimeout(function(){res({found:true,order:EXAMPLE})},REDUCE?0:420)});
  }
  return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:order,email:email})})
    .then(function(r){return r.json()});
}

/* ------------------------------------------------------------------
   EXAMPLE ORDER for the preview only. Not a real customer or order.
   Products and prices are real (products.js). Timings follow the
   shipping policy: dispatch in 1-2 working days, delivery 2-4 working
   days after dispatch.
   ------------------------------------------------------------------ */
var EXAMPLE={
  example:true,
  name:'#1234',
  createdAt:'2026-09-26T10:12:00+01:00',
  financialStatus:'PAID',
  fulfillmentStatus:'FULFILLED',
  shipmentStatus:'IN_TRANSIT',
  events:[
    {status:'PLACED',at:'2026-09-26T10:12:00+01:00'},
    {status:'LABEL_PRINTED',at:'2026-09-28T09:50:00+01:00'},
    {status:'IN_TRANSIT',at:'2026-09-28T11:29:00+01:00'}
  ],
  estimatedDelivery:'2026-09-30',
  estimatedLatest:'2026-10-02',
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
   Real content from the store (shop shipping + refund policies, the
   live FAQs page and the UK shipping rates). Nothing invented.
   ------------------------------------------------------------------ */
var FAQ=[
  {q:'When will my order arrive?',a:'Orders are typically dispatched within 1 to 2 working days. Standard delivery usually arrives within 2 to 4 working days of dispatch. Please allow extra time during busy periods and bank holidays.'},
  {q:'How much is delivery?',a:'Standard UK delivery is free on orders over £39. Below that, a standard delivery charge of £3.99 applies and is shown at checkout before you pay.'},
  {q:'Who delivers my order?',a:'UK orders go out tracked with Evri. Once your order has been dispatched we email you the Evri tracking details, and you can follow it from this page too.'},
  {q:'Where do you deliver?',a:'We deliver to addresses within the United Kingdom. If you would like to order from outside the UK, please contact us first.'},
  {q:'Can I change my address or cancel my order?',a:'If your order hasn’t been dispatched yet, email us as soon as possible with your order number and we’ll do our best to change the address or items, or cancel it. Once it has shipped we can’t make changes, but you can return it when it arrives.'},
  {q:'My order hasn’t arrived. What should I do?',a:'If your order hasn’t arrived within the expected time, or arrives damaged, email <a href="mailto:hello@poorly-pet.com">hello@poorly-pet.com</a> with your order number and we’ll put it right.'},
  {q:'Tracking says delivered but I can’t find it.',a:'Check the tracking for any delivery notes, then check with neighbours and any safe places around your home. If you still can’t find it within 24 hours, email us with your order number and we’ll look into it with the courier.'},
  {q:'What happens if I miss the delivery?',a:'If a parcel comes back to us because of a missed delivery or an incorrect address, we’ll contact you to arrange redelivery, which may carry an extra charge. Please check your address carefully at checkout.'},
  {q:'How do returns work?',a:'You can cancel within 14 days of receiving your order, then have a further 14 days to send items back unused. We refund within 14 days of receiving the return. Opened health products and supplements can only be returned if faulty. Email us with your order number to start.'}
];

/* ---------- helpers ---------- */
var d=document,REDUCE=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function money(n){return n===0?'Free':'£'+Number(n).toFixed(2)}
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* dates and times always shown in UK time, whatever the viewer's clock says */
var UK;try{UK=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'numeric',day:'numeric',weekday:'short',hour:'numeric',minute:'numeric',hour12:false})}catch(e){UK=null}
function parts(s){
  if(!s)return null;
  if(/^\d{4}-\d\d-\d\d$/.test(s)){var a=s.split('-'),dt=new Date(Date.UTC(+a[0],a[1]-1,+a[2],12));return {y:+a[0],m:a[1]-1,d:+a[2],w:dt.getUTCDay(),h:null,mi:null}}
  var t=new Date(s);if(isNaN(t))return null;
  if(!UK)return {y:t.getFullYear(),m:t.getMonth(),d:t.getDate(),w:t.getDay(),h:t.getHours(),mi:t.getMinutes()};
  var o={};UK.formatToParts(t).forEach(function(p){o[p.type]=p.value});
  return {y:+o.year,m:o.month-1,d:+o.day,w:DAYS.indexOf(o.weekday),h:(+o.hour)%24,mi:+o.minute};
}
function fday(s){var p=parts(s);return p?DAYS[p.w]+' '+p.d+' '+MONTHS[p.m]:''}
function flong(s){var p=parts(s);return p?fday(s)+' '+p.y:''}
function ftime(s){var p=parts(s);if(!p||p.h==null)return '';return (p.h%12||12)+':'+(p.mi<10?'0':'')+p.mi+(p.h<12?'am':'pm')}

var BY={};(window.PP_PRODUCTS||[]).forEach(function(p){BY[p.handle]=p;BY['t:'+p.title.toLowerCase()]=p});
function prod(it){return BY[it.handle]||BY['t:'+String(it.title||'').toLowerCase()]||null}
function cleanTitle(t){return String(t).replace(/\s*[|]\s*\d+\s*(g|ml|kg)\b.*$/i,'')}
function thumb(it){
  var p=prod(it),src=it.image||(p&&(p.img||p.cdn));
  return '<span class="tmo-th">'+(src?'<img src="'+esc(src)+'" alt="" loading="lazy" data-tmo-img>':'<span class="tmo-noimg" aria-hidden="true"></span>')+'</span>';
}
/* a blocked or missing photo falls back to the flat placeholder */
d.addEventListener('error',function(e){
  var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-tmo-img')){var s=d.createElement('span');s.className='tmo-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);
function checkImgs(r){$$('img[data-tmo-img]',r).forEach(function(i){if(i.complete&&!i.naturalWidth){i.dispatchEvent(new Event('error'))}})}

/* ---------- order model: normalise whatever the Worker returns ---------- */
function model(o){
  var carrier=(o.tracking&&o.tracking[0]&&o.tracking[0].company)||'Evri';
  var s=String(o.shipmentStatus||'').toUpperCase(),ful=String(o.fulfillmentStatus||'').toUpperCase();
  var hasTrack=!!(o.tracking&&o.tracking.length),idx=0;
  if(s==='DELIVERED')idx=4;
  else if(s==='OUT_FOR_DELIVERY'||s==='ATTEMPTED_DELIVERY')idx=3;
  else if(s==='IN_TRANSIT')idx=2;
  else if(/LABEL|CONFIRMED|READY/.test(s))idx=1;
  else if(ful==='FULFILLED'||ful==='PARTIALLY_FULFILLED')idx=hasTrack?2:1;
  var ev={};(o.events||[]).forEach(function(e){
    var k={PLACED:0,CONFIRMED:1,LABEL_PURCHASED:1,LABEL_PRINTED:1,READY_FOR_PICKUP:1,IN_TRANSIT:2,OUT_FOR_DELIVERY:3,ATTEMPTED_DELIVERY:3,DELIVERED:4}[String(e.status).toUpperCase()];
    if(k!=null&&!ev[k])ev[k]=e.at;
  });
  if(!ev[0]&&o.createdAt)ev[0]=o.createdAt;
  var steps=[
    {t:'Order placed',d:'We’ve got your order'},
    {t:'Packed',d:'Packed and labelled'},
    {t:'With '+carrier,d:'Collected by '+carrier},
    {t:'Out for delivery',d:'With your '+carrier+' courier'},
    {t:'Delivered',d:'Delivered to your address'}
  ].map(function(x,i){x.at=ev[i]||null;x.state=i<idx?'done':i===idx?'now':'todo';if(i===idx&&idx===4)x.state='done';return x});
  var head=[
    ['We’ve got your order','Orders are typically dispatched within 1 to 2 working days. We’ll email your '+carrier+' tracking link when it leaves us.'],
    ['Packed and waiting for '+carrier,carrier+' will collect it shortly. Your tracking link is on its way by email.'],
    ['Your parcel is with '+carrier,'Standard delivery usually arrives within 2 to 4 working days of dispatch.'],
    ['Out for delivery',carrier+' expects to deliver it today.'],
    ['Delivered','Your parcel has been delivered. Something not right? Email us and we’ll put it right.']
  ][idx];
  var items=(o.items||[]).map(function(it){var p=prod(it);return {it:it,p:p,title:cleanTitle(it.title||(p&&p.title)||'Item'),brand:p?p.brand:'',qty:it.quantity||1,price:it.price!=null?it.price:(p?p.price:null)}});
  var sub=o.subtotal!=null?o.subtotal:items.reduce(function(a,x){return a+(x.price||0)*x.qty},0);
  var ship=o.shipping||null;
  var total=o.total!=null?o.total:sub+(ship&&ship.price||0);
  var eta='';
  if(idx<4&&o.estimatedDelivery){eta=fday(o.estimatedDelivery)+(o.estimatedLatest?' to '+fday(o.estimatedLatest):'')}
  var tr=hasTrack?o.tracking[0]:null;
  return {o:o,idx:idx,carrier:carrier,steps:steps,head:head[0],sub:head[1],items:items,subtotal:sub,ship:ship,total:total,eta:eta,track:tr,
    placed:ev[0]?flong(ev[0]):'',count:items.reduce(function(a,x){return a+x.qty},0)};
}

/* ---------- shared result parts ---------- */
function exampleNote(m){return m.o.example?'<p class="tmo-exnote"><b>Example order.</b> This preview shows a made-up order so you can see the result. On the live site it shows the real order for the number and email entered.</p>':''}
function stepsH(m){
  return '<ol class="tmo-steps" aria-label="Delivery progress">'+m.steps.map(function(s){
    return '<li class="tmo-st is-'+s.state+'"'+(s.state==='now'?' aria-current="step"':'')+'><span class="tmo-dot" aria-hidden="true"></span><span class="tmo-stt">'+esc(s.t)+'</span>'+
      '<span class="tmo-stw">'+(s.at?esc(fday(s.at))+(ftime(s.at)?', '+esc(ftime(s.at)):''):(s.state==='todo'?'To come':''))+'</span></li>';
  }).join('')+'</ol>';
}
function stepsV(m){
  return '<ol class="tmo-vsteps" aria-label="Delivery progress">'+m.steps.slice().reverse().map(function(s){
    return '<li class="tmo-vs is-'+s.state+'"'+(s.state==='now'?' aria-current="step"':'')+'><span class="tmo-dot" aria-hidden="true"></span><div><b>'+esc(s.t)+'</b><span>'+
      (s.at?esc(s.d)+'. '+esc(fday(s.at))+(ftime(s.at)?', '+esc(ftime(s.at)):''):'Not yet')+'</span></div></li>';
  }).join('')+'</ol>';
}
function trackBox(m,cls){
  if(!m.track)return '<div class="tmo-trk '+(cls||'')+'"><div><span class="tmo-lbl">'+esc(m.carrier)+' tracking</span><span class="tmo-trn">Emailed when your order is dispatched</span></div></div>';
  var t=m.track;
  return '<div class="tmo-trk '+(cls||'')+'"><div><span class="tmo-lbl">'+esc(t.company||m.carrier)+' tracking reference</span><span class="tmo-trn">'+esc(t.number||'Available')+'</span></div>'+
    (t.url?'<a class="btn sec tmo-trbtn" href="'+esc(t.url)+'" target="_blank" rel="noopener">Track with '+esc(t.company||m.carrier)+'<span class="sr"> (opens in a new tab)</span></a>':'')+'</div>';
}
function itemRows(m){
  return '<ul class="tmo-items">'+m.items.map(function(x){
    return '<li class="tmo-item">'+thumb(x.it)+'<div class="tmo-itx">'+(x.brand?'<span class="tmo-brand">'+esc(x.brand)+'</span>':'')+
      '<a class="tmo-itn" href="#">'+esc(x.title)+'</a><span class="tmo-itq">Qty '+x.qty+'</span></div>'+
      (x.price!=null?'<span class="tmo-itp">'+money(x.price*x.qty)+'</span>':'')+'</li>';
  }).join('')+'</ul>';
}
function totals(m){
  return '<dl class="tmo-tot"><div><dt>Items ('+m.count+')</dt><dd>'+money(m.subtotal)+'</dd></div>'+
    (m.ship?'<div><dt>Delivery</dt><dd>'+(m.ship.price===0?'Free':money(m.ship.price))+'</dd></div>':'')+
    '<div class="tmo-grand"><dt>Total</dt><dd>'+money(m.total)+'</dd></div></dl>';
}
function helpLinks(){
  return '<ul class="tmo-hl"><li><a href="#">Delivery information</a></li><li><a href="#">Returns and refunds</a></li><li><a href="mailto:hello@poorly-pet.com">Contact us</a></li></ul>';
}
function statusLink(m){return m.o.statusUrl?'<a class="tmo-link" href="'+esc(m.o.statusUrl)+'">View full order details</a>':''}

/* ---------- version renders ---------- */
var R={
  a:function(m){
    return exampleNote(m)+
      '<div class="tmo-rh"><div><span class="tmo-lbl">Order '+esc(m.o.name)+(m.placed?' · placed '+esc(m.placed):'')+'</span><h2 class="tmo-rt" tabindex="-1">'+esc(m.head)+'</h2><p class="tmo-rs">'+esc(m.sub)+'</p></div>'+
      '<button class="tmo-link" type="button" data-tmo-again>Track another order</button></div>'+
      (m.eta?'<p class="tmo-eta">Estimated delivery <b>'+esc(m.eta)+'</b></p>':'')+
      stepsH(m)+trackBox(m)+
      '<h3 class="tmo-h3">In this order</h3>'+itemRows(m)+totals(m)+
      '<div class="tmo-rf">'+statusLink(m)+helpLinks()+'</div>';
  },
  b:function(m){
    return '<div class="wrap">'+exampleNote(m)+
      '<div class="tmo-b-top"><div><span class="tmo-lbl">Order '+esc(m.o.name)+'</span><h2 class="tmo-rt" tabindex="-1">'+esc(m.head)+'</h2><p class="tmo-rs">'+esc(m.sub)+'</p></div>'+
      (m.eta?'<div class="tmo-b-eta"><span class="tmo-lbl">Estimated delivery</span><b>'+esc(m.eta)+'</b></div>':'')+'</div>'+
      stepsH(m)+
      '<div class="tmo-b-grid"><section class="tmo-b-card" aria-labelledby="tmo-pd"><h3 class="tmo-h3" id="tmo-pd">Parcel details</h3>'+
      '<table class="tmo-tbl"><tbody>'+
      '<tr><th scope="row">Carrier</th><td>'+esc(m.carrier)+'</td></tr>'+
      '<tr><th scope="row">Tracking reference</th><td>'+(m.track?'<b>'+esc(m.track.number)+'</b>':'Emailed on dispatch')+'</td></tr>'+
      '<tr><th scope="row">Service</th><td>'+esc(m.ship?m.ship.title:'Standard Shipping (tracked)')+'</td></tr>'+
      (m.placed?'<tr><th scope="row">Ordered</th><td>'+esc(m.placed)+'</td></tr>':'')+
      (m.steps[2].at?'<tr><th scope="row">Dispatched</th><td>'+esc(flong(m.steps[2].at))+'</td></tr>':'')+
      '</tbody></table>'+(m.track&&m.track.url?'<a class="btn sec tmo-trbtn" href="'+esc(m.track.url)+'" target="_blank" rel="noopener">Track with '+esc(m.carrier)+'<span class="sr"> (opens in a new tab)</span></a>':'')+
      '</section><section class="tmo-b-card" aria-labelledby="tmo-io"><h3 class="tmo-h3" id="tmo-io">In this order</h3>'+itemRows(m)+totals(m)+'</section></div>'+
      '<div class="tmo-rf">'+statusLink(m)+helpLinks()+'<button class="tmo-link" type="button" data-tmo-again>Track another order</button></div></div>';
  },
  c:function(m){
    return exampleNote(m)+
      '<div class="tmo-c-oh"><div><h2 class="tmo-rt" tabindex="-1">Order '+esc(m.o.name)+'</h2><p class="tmo-rs">'+(m.placed?'Placed '+esc(m.placed)+' · ':'')+m.count+' item'+(m.count===1?'':'s')+' · '+money(m.total)+'</p></div>'+
      '<span class="tmo-pill is-'+(m.idx===4?'done':'go')+'">'+esc(m.steps[m.idx].t)+'</span></div>'+
      '<div class="tmo-c-grid"><section class="tmo-c-box" aria-labelledby="tmo-cs"><h3 class="tmo-h3" id="tmo-cs">'+esc(m.head)+'</h3>'+
      (m.eta?'<p class="tmo-eta">Estimated delivery <b>'+esc(m.eta)+'</b></p>':'<p class="tmo-rs">'+esc(m.sub)+'</p>')+stepsV(m)+'</section>'+
      '<section class="tmo-c-box" aria-labelledby="tmo-cd"><h3 class="tmo-h3" id="tmo-cd">Delivery</h3>'+
      '<dl class="tmo-kv"><div><dt>Service</dt><dd>'+esc(m.ship?m.ship.title:'Standard Shipping (tracked)')+'</dd></div><div><dt>Carrier</dt><dd>'+esc(m.carrier)+'</dd></div>'+
      '<div><dt>Tracking reference</dt><dd>'+(m.track?esc(m.track.number):'Emailed on dispatch')+'</dd></div></dl>'+
      (m.track&&m.track.url?'<a class="btn sec tmo-trbtn" href="'+esc(m.track.url)+'" target="_blank" rel="noopener">Track with '+esc(m.carrier)+'<span class="sr"> (opens in a new tab)</span></a>':'')+
      '<h3 class="tmo-h3 tmo-mt">Need help with this order?</h3>'+helpLinks()+'</section></div>'+
      '<section class="tmo-c-box tmo-c-items" aria-labelledby="tmo-ci"><h3 class="tmo-h3" id="tmo-ci">Items</h3>'+itemRows(m)+totals(m)+'</section>'+
      '<div class="tmo-rf">'+statusLink(m)+'<button class="tmo-link" type="button" data-tmo-again>Track another order</button></div>';
  }
};

/* ---------- page wiring ---------- */
var root=$('[data-tmo]');if(!root)return;
var V=root.getAttribute('data-tmo');

$$('[data-tmo-faq]').forEach(function(box){
  box.innerHTML=FAQ.map(function(f,i){
    return '<details class="tmo-q"'+(i===0&&box.hasAttribute('data-open-first')?' open':'')+'><summary>'+esc(f.q)+'</summary><div class="tmo-ans"><p>'+f.a+'</p></div></details>';
  }).join('');
});

var form=$('#tmo-form'),res=$('#tmo-result'),msg=$('#tmo-msg'),look=$('[data-tmo-lookup]');
var fo=$('#tmo-order'),fe=$('#tmo-email'),btn=form&&$('button[type="submit"]',form);
if(!form)return;

function setErr(inp,text){
  var f=inp.closest('.tmo-f'),e=$('.tmo-ferr',f);
  f.classList.toggle('is-err',!!text);inp.setAttribute('aria-invalid',text?'true':'false');
  if(e){e.textContent=text||'';e.hidden=!text}
}
function showMsg(t){if(!msg)return;msg.textContent=t||'';msg.hidden=!t}

$$('[data-tmo-example]').forEach(function(b){b.addEventListener('click',function(){
  fo.value='1234';fe.value='name@example.com';setErr(fo,'');setErr(fe,'');showMsg('');form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true}));
})});

form.addEventListener('submit',function(e){
  e.preventDefault();showMsg('');
  var order=fo.value.trim().replace(/^#/,''),email=fe.value.trim(),bad=false;
  if(!order){setErr(fo,'Enter your order number');bad=true}else if(!/^[A-Za-z0-9-]{3,}$/.test(order)){setErr(fo,'Check your order number. It looks like 1024 or #1024');bad=true}else setErr(fo,'');
  if(!email){setErr(fe,'Enter the email you used at checkout');bad=true}else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr(fe,'Enter a valid email address, like name@example.com');bad=true}else setErr(fe,'');
  if(bad){($('[aria-invalid="true"]',form)||fo).focus();return}
  var label=btn.textContent;btn.disabled=true;btn.textContent='Finding your order…';
  lookup(order,email).then(function(r){
    if(r&&r.error){showMsg(r.error);return}
    if(!r||!r.found){showMsg((r&&r.message)||'We couldn’t find that order. Check the order number and email, then try again.');return}
    show(model(r.order));
  }).catch(function(){showMsg('Something went wrong. Please try again in a moment.')})
  .then(function(){btn.disabled=false;btn.textContent=label});
});

function show(m){
  res.innerHTML=R[V](m);
  res.hidden=false;root.classList.add('has-result');
  if(V==='a'&&look)look.hidden=true;
  checkImgs(res);
  if(!REDUCE){res.classList.remove('tmo-in');void res.offsetWidth;res.classList.add('tmo-in')}
  var h=$('.tmo-rt',res);
  var top=res.getBoundingClientRect().top+window.pageYOffset-16;
  if(V!=='a'||window.innerWidth<900)window.scrollTo({top:top,behavior:REDUCE?'auto':'smooth'});
  if(h)h.focus({preventScroll:true});
  $$('[data-tmo-again]',res).forEach(function(b){b.addEventListener('click',again)});
}
function again(){
  res.hidden=true;res.innerHTML='';root.classList.remove('has-result');
  if(look)look.hidden=false;
  fo.value='';fe.value='';
  var top=form.getBoundingClientRect().top+window.pageYOffset-120;
  window.scrollTo({top:Math.max(0,top),behavior:REDUCE?'auto':'smooth'});
  fo.focus({preventScroll:true});
}
})();
