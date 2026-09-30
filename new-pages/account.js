/* ==========================================================================
   Your account: shared by account-a.html (A1), account-b.html (A2), account-c.html (A3).
   Needs products.js (PP_PRODUCTS, PP_TAGS) and club.js (PPClub) loaded first.

   One layout family: a left account menu and one section at a time. The three
   files only differ in how the menu and the overview are arranged.

   EXAMPLE DATA: the customer, orders and dogs below are made up to show the
   layout. On the live site they come from:
   - orders, name, email, addresses: Liquid `customer` object on the page, or the
     "Poorly Pet Account" app proxy (/apps/account?action=bootstrap), as the live
     /pages/account-dashboard already does;
   - dogs: customer metafield custom.dogs (JSON), written by the app proxy
     action "save-dogs"; localStorage "pp_dogs_v1" is the fallback, same key and
     shape as the live page, plus a `birthday` (YYYY-MM-DD) field for Club points;
   - Club: PPClub.API (see club.js and CLUB-SYSTEM.md).

   Product cards and rails are the homepage's own .pk / .railwrap / .rail.prail /
   .scroller markup, styled only by css/home.css. Every other class is prefixed ac-.
   ========================================================================== */
(function(){
'use strict';
var C=window.PPClub,P=window.PP_PRODUCTS||[],TAGS=window.PP_TAGS||{};
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=C.esc,BY={};P.forEach(function(p){BY[p.handle]=p});
var ROOT=$('[data-ac]'),VERSION=ROOT?ROOT.getAttribute('data-ac'):'a1';
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- example customer and orders ---------- */
var CUSTOMER={firstName:'Sarah',lastName:'Example',email:'sarah@example.com',since:'March 2026',
  address:['Sarah Example','12 Example Street','Exampletown','EX1 2MP','United Kingdom']};
var ORDERS=[
  {no:'1049',date:'2026-09-26',status:'packing',items:[['itch-relief-chews-for-dogs-skin-allergy-support',1]],delivery:0},
  {no:'1044',date:'2026-09-05',status:'dispatched',items:[['daily-joint-salmon-oil-for-dogs-cats-300ml',1],['natural-vetcare-mobility-50-chews',1]],delivery:0},
  {no:'1031',date:'2026-06-10',status:'delivered',items:[['itch-relief-supplement-for-dogs-120-chews',1],['natural-vetcare-skin-oil-100ml',1],['2-in-1-dog-shampoo-conditioner-with-lavender-jojoba',1]],discount:5,code:'PPC-7KQ2-M9XD',delivery:0},
  {no:'1027',date:'2026-05-02',status:'delivered',items:[['natural-vetcare-mobility-50-chews',1],['daily-joint-salmon-oil-for-dogs-cats-300ml',1],['green-lipped-mussel-powder-for-dogs-cats-80-serving',1]],delivery:0},
  {no:'1018',date:'2026-03-12',status:'delivered',items:[['msm-powder-for-dogs-cats-joint-coat-support-300g',1],['self-heating-pet-pad-no-electricity-needed-48x38cm',1],['100-natural-coconut-oil-for-dogs',1]],delivery:0}
];
var STATUS={packing:['Being packed','ac-st-pack'],dispatched:['Dispatched','ac-st-go'],delivered:['Delivered','ac-st-done']};
function orderSub(o){return o.items.reduce(function(a,it){var p=BY[it[0]];return a+(p?p.price*it[1]:0)},0)}
function orderTotal(o){return orderSub(o)-(o.discount||0)+(o.delivery||0)}

/* ---------- conditions: same slugs as the live account page and PP_TAGS ---------- */
var CONDS=[
  ['Mobility and joints',[['arthritis','Arthritis'],['hip-dysplasia','Hip dysplasia'],['elbow-dysplasia','Elbow dysplasia'],['cruciate-ligament','Cruciate ligament'],['luxating-patella','Luxating patella'],['ivdd','IVDD'],['back-pain','Back pain'],['spondylosis','Spondylosis'],['rear-leg-weakness','Rear leg weakness']]],
  ['Neuro and recovery',[['degenerative-myelopathy','Degenerative myelopathy'],['paralysis','Paralysis'],['knuckling','Knuckling'],['post-surgery-recovery','Post-surgery recovery'],['wound-recovery','Wound care']]],
  ['Skin, ears and teeth',[['itchy-skin','Itchy skin'],['hot-spots','Hot spots'],['seasonal-allergies','Seasonal allergies'],['ear-eye-care','Ears and eyes'],['dental-disease','Dental disease']]],
  ['Inside and behaviour',[['digestive-issues','Digestive issues'],['kidney-support','Kidney support'],['weight-management','Weight'],['senior-support','Older dog'],['anxiety','Anxiety'],['noise-fear','Noise fear']]]
];
var CL={};CONDS.forEach(function(g){g[1].forEach(function(c){CL[c[0]]=c[1]})});
var BREEDS=['Labrador Retriever','Golden Retriever','German Shepherd','Cocker Spaniel','Springer Spaniel','Border Collie','Border Terrier','Jack Russell Terrier','Staffordshire Bull Terrier','French Bulldog','English Bulldog','Dachshund','Cavapoo','Cockapoo','Labradoodle','Pug','Beagle','Whippet','Greyhound','Lurcher','Shih Tzu','Chihuahua','Yorkshire Terrier','West Highland Terrier','Boxer','Rottweiler','Bernese Mountain Dog','Great Dane','Mixed breed'];

/* ---------- dogs store (localStorage, try/catch) ---------- */
var LS='pp_dogs_v1';
var EXAMPLE_DOGS=[
  {id:'d1',name:'Bramble',breed:'Labrador Retriever',birthday:'2017-06-03',weight:'31',conditions:['arthritis','hip-dysplasia','senior-support']},
  {id:'d2',name:'Pip',breed:'Border Terrier',birthday:'2020-11-14',weight:'8',conditions:['itchy-skin']}
];
function loadDogs(){try{var r=window.localStorage.getItem(LS);if(r){var d=JSON.parse(r);if(Array.isArray(d))return d}}catch(e){}return JSON.parse(JSON.stringify(EXAMPLE_DOGS))}
function saveDogs(){try{window.localStorage.setItem(LS,JSON.stringify(dogs))}catch(e){}
  /* LIVE: proxyPost({action:"save-dogs",dogs:dogs}) to write customer.metafields.custom.dogs */}
var dogs=loadDogs();

/* ---------- small helpers ---------- */
function money(v){return C.money2(v)}
function ageOf(b){if(!b)return '';var d=new Date(b+'T00:00:00'),n=new Date();if(isNaN(d))return '';var y=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))y--;
  if(y<1){var m=(n.getFullYear()-d.getFullYear())*12+n.getMonth()-d.getMonth();return Math.max(0,m)+' month'+(m===1?'':'s')}return y+' year'+(y===1?'':'s')}
function nextBirthday(b){if(!b)return null;var d=new Date(b+'T00:00:00');if(isNaN(d))return null;var n=new Date();n.setHours(0,0,0,0);var x=new Date(n.getFullYear(),d.getMonth(),d.getDate());if(x<n)x.setFullYear(x.getFullYear()+1);return {date:x,days:Math.round((x-n)/864e5)}}
function dayMonth(dt){return dt.getDate()+' '+['January','February','March','April','May','June','July','August','September','October','November','December'][dt.getMonth()]}
function cleanTitle(t){return String(t).replace(/\s*\|\s*/g,', ')}
function initial(n){return (String(n||'?').trim().charAt(0)||'?').toUpperCase()}
function plural(n,w){return n+' '+w+(n===1?'':'s')}

/* ==========================================================================
   The one site product card (PPCard, card.js + css/card.css) in the homepage rail.
   ========================================================================== */
function tabFor(p){
  var t=(p.productType||'').toLowerCase();
  if(/bundle/.test(t))return 'Care kits';
  if(/supplement|oil|digestive|wellness/.test(t))return 'Supplements';
  if(/shampoo|groom|conditioner/.test(t))return 'Grooming';
  if(/bed|ramp|harness|brace|wheelchair|mobility|support|pad|boot/.test(t))return 'Mobility aids';
  if(/wound|first aid|bandage|recovery/.test(t))return 'Recovery & first aid';
  return '';
}
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function pk(p,o){
  o=o||{};var tab=o.tab!==undefined?o.tab:tabFor(p);
  return PPCard.html(Object.assign({},p,{title:cleanTitle(p.title)}),{tab:tab||'',helps:o.helps||''});
}
function rail(items,label){
  return '<div class="railwrap"><div class="rail prail" tabindex="0" aria-label="'+esc(label)+'">'+items.join('')+'</div>'+
    '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
}
var railUps=[];
function bindRails(root){
  railUps=[];
  $$('.railwrap',root).forEach(function(w){
    var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('ac-fit',max<=2);
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
/* a blocked or missing photo falls back to the plain well (or the plain thumbnail) */
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-ac-img')&&t.parentNode)t.parentNode.removeChild(t)},true);
function thumb(p){return '<span class="ac-th">'+(p&&p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy" data-ac-img>':'')+'</span>'}

/* ---------- basket toast (prototype) ---------- */
var toastEl,toastT;
function toast(msg){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='ac-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML=msg;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3200);
}
function addToBasket(hs,btn){
  hs=hs.filter(function(h){return BY[h]});if(!hs.length)return;
  var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+hs.length;
  cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
  toast('<span><b>'+(hs.length===1?'Added to basket':hs.length+' items added to basket')+'</b>'+esc(hs.length===1?cleanTitle(BY[hs[0]].title):'From your earlier order')+'</span><a href="#">View basket ('+n+')</a>');
  if(btn){var o=btn.getAttribute('data-o')||btn.textContent;btn.setAttribute('data-o',o);btn.textContent='Added';clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent=o},1600)}
}

/* ==========================================================================
   Renderers. Each fills any element with the matching data attribute.
   ========================================================================== */
function statusChip(o){var s=STATUS[o.status];return '<span class="ac-st '+s[1]+'">'+s[0]+'</span>'}
function orderMeta(o){var n=o.items.length;return C.dateLabel(o.date)+' · '+plural(n,'item')+' · '+money(orderTotal(o))}
function trackLink(o){return '<a class="ac-lnk" href="track-my-order-a.html">'+(o.status==='packing'?'Order status':'Track parcel')+'</a>'}

/* latest order, for the overview */
function renderLatest(el){
  var o=ORDERS[0],ps=o.items.map(function(it){return BY[it[0]]}).filter(Boolean);
  el.innerHTML='<div class="ac-o-h"><div><b class="ac-o-no">Order #'+o.no+'</b><span class="ac-o-d">'+orderMeta(o)+'</span></div>'+statusChip(o)+'</div>'+
    '<ul class="ac-o-items">'+ps.map(function(p){return '<li>'+thumb(p)+'<span class="ac-o-it"><span class="ac-o-br">'+esc(p.brand)+'</span><span class="ac-o-nm">'+esc(cleanTitle(p.title))+'</span></span></li>'}).join('')+'</ul>'+
    (o.status==='packing'?'<p class="ac-o-note">Points for this order are added the day it ships.</p>':'')+
    '<div class="ac-o-act"><button class="btn sec sm" type="button" data-ac-reorder="'+o.no+'">Buy it all again</button>'+trackLink(o)+'</div>';
}
/* every order */
function renderOrders(el){
  el.innerHTML='<ul class="ac-orders">'+ORDERS.map(function(o){
    var ps=o.items.map(function(it){return BY[it[0]]}).filter(Boolean);
    return '<li class="ac-o">'+
      '<div class="ac-o-row"><span class="ac-o-ths" aria-hidden="true">'+ps.slice(0,3).map(thumb).join('')+'</span>'+
      '<div class="ac-o-m"><b class="ac-o-no">Order #'+o.no+'</b><span class="ac-o-d">'+orderMeta(o)+'</span></div>'+statusChip(o)+'</div>'+
      '<details class="ac-o-more"><summary>Show '+plural(ps.length,'item')+'</summary><ul class="ac-o-items">'+o.items.map(function(it){var p=BY[it[0]];if(!p)return '';
        return '<li>'+thumb(p)+'<span class="ac-o-it"><span class="ac-o-br">'+esc(p.brand)+'</span><span class="ac-o-nm">'+esc(cleanTitle(p.title))+'</span><span class="ac-o-q">Qty '+it[1]+' · '+money(p.price*it[1])+'</span></span><button class="ac-lnk" type="button" data-add="'+esc(p.handle)+'">Buy again</button></li>'}).join('')+'</ul>'+
      (o.discount?'<p class="ac-o-note">Club voucher '+esc(o.code)+' took '+money(o.discount)+' off.</p>':'')+'</details>'+
      '<div class="ac-o-act"><button class="btn sec sm" type="button" data-ac-reorder="'+o.no+'">Buy it all again</button>'+trackLink(o)+
      (o.status==='delivered'?'<a class="ac-lnk" href="#">Review for 50 points</a>':'')+'</div></li>';
  }).join('')+'</ul>';
}

/* dogs */
function dogLine(d){return [d.breed,d.birthday?ageOf(d.birthday):'',d.weight?d.weight+' kg':''].filter(Boolean).join(' · ')}
function renderDogMini(el){
  el.innerHTML=(dogs.length?'<ul class="ac-mini">'+dogs.map(function(d){return '<li><span class="ac-av sm" aria-hidden="true">'+esc(initial(d.name))+'</span><span class="ac-mini-t"><b>'+esc(d.name)+'</b><span>'+esc(dogLine(d)||'No details yet')+'</span></span><button class="ac-lnk" type="button" data-ac-editdog="'+esc(d.id)+'" aria-label="Edit '+esc(d.name)+'">Edit</button></li>'}).join('')+'</ul>':
    '<p class="ac-sub">No dogs saved yet. Add one to see products for their conditions.</p>')+
    '<button class="btn sec sm" type="button" data-ac-adddog>Add a dog</button>';
}
function renderDogs(el){
  el.innerHTML=dogs.length?'<div class="ac-dogs">'+dogs.map(function(d){
    var nb=nextBirthday(d.birthday),conds=(d.conditions||[]).map(function(c){return CL[c]}).filter(Boolean);
    return '<article class="ac-pan ac-pale ac-dog"><div class="ac-dog-h"><span class="ac-av" aria-hidden="true">'+esc(initial(d.name))+'</span><div><h3>'+esc(d.name)+'</h3><p>'+esc(dogLine(d)||'No details yet')+'</p></div></div>'+
      (conds.length?'<ul class="ac-conds">'+conds.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>':'')+
      '<p class="ac-dog-b">'+(nb?'Birthday '+dayMonth(nb.date)+(nb.days===0?'. '+C.RULES.birthday+' points added today.':'. '+C.RULES.birthday+' points in '+plural(nb.days,'day')+'.'):'Add a birthday for '+C.RULES.birthday+' points a year.')+'</p>'+
      '<button class="btn sec sm" type="button" data-ac-editdog="'+esc(d.id)+'">Edit '+esc(d.name)+'</button></article>';
  }).join('')+'</div>':'<div class="ac-pan ac-pale"><p class="ac-sub">No dogs saved yet. Add your dog to see products for their conditions and get birthday points.</p><button class="btn sec" type="button" data-ac-adddog>Add a dog</button></div>';
}

/* Club: balance and tier progress. data-ac-points="full" (teal panel) or "mini" (menu) */
function renderPoints(el){
  var s=C.state,b=C.balanceOf(s.ledger),pr=C.progress(s.spend),v=C.vouchersFor(b),pend=C.pendingOf(s.ledger);
  var T=C.RULES.tiers,max=T[T.length-1].from,pos=Math.min(100,s.spend/max*100),mini=el.getAttribute('data-ac-points')==='mini';
  var bar='<div class="ac-bar" role="progressbar" aria-label="Spend towards the next tier" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pos)+'" aria-valuetext="'+(pr.next?money(pr.toGo)+' to '+pr.next.name:'Top tier')+'"><i style="width:'+pos+'%"></i>'+
    T.slice(1).map(function(t){return '<span class="ac-mk'+(s.spend>=t.from?' on':'')+'" style="left:'+(t.from/max*100)+'%"></span>'}).join('')+'</div>';
  var next=pr.next?'Spend '+money(pr.toGo)+' more to reach '+pr.next.name+' ('+pr.next.rate+' points per £1).':'You are in the top tier.';
  if(mini){
    el.innerHTML='<span class="ac-k">Club points</span><b class="ac-mini-bal">'+C.fmt(b)+'</b><span class="ac-mini-s">'+pr.tier.name+' member · worth '+C.money(v.value)+'</span>'+bar+
      '<span class="ac-mini-s">'+(pr.next?money(pr.toGo)+' to '+pr.next.name:'Top tier')+'</span>';
    return;
  }
  el.innerHTML='<div class="ac-pts"><div><span class="ac-k">Points balance</span><b class="ac-big">'+C.fmt(b)+'</b><span class="ac-pts-w">Worth '+C.money(v.value)+' in vouchers'+(pend?'. '+C.fmt(pend)+' more on the way.':'.')+'</span></div>'+
    '<div><span class="ac-k">Your tier</span><b class="ac-tier">'+pr.tier.name+'</b><span class="ac-pts-w">'+pr.tier.rate+' points per £1</span></div></div>'+
    '<div class="ac-ladder"><div class="ac-lad-t"><span>'+money(s.spend)+' spent</span><span>'+(pr.next?'Next: '+pr.next.name+' at £'+pr.next.from:'Top tier')+'</span></div>'+bar+'<p class="ac-lad-n">'+next+'</p></div>';
}
function renderRedeem(el){
  var b=C.balanceOf(C.state.ledger);
  el.innerHTML='<ul class="ac-red-l">'+C.RULES.rewards.map(function(r){var ok=b>=r.points;
      return '<li><span class="ac-red-v">'+C.money(r.value)+' off</span><span class="ac-red-p">'+C.fmt(r.points)+' points'+(ok?'':'<em>'+C.fmt(r.points-b)+' more needed</em>')+'</span>'+
      '<button class="btn sec sm" type="button" data-ac-redeem="'+r.points+'"'+(ok?'':' disabled')+'>Get '+C.money(r.value)+' code</button></li>'}).join('')+
    '</ul><div class="ac-red-out" data-ac-redout aria-live="polite"></div>';
}
function codeBox(v,fresh){
  return '<div class="ac-code'+(fresh?' ac-code--new':'')+'"><div><span class="ac-k">'+(fresh?'Your new '+C.money(v.value)+' code':C.money(v.value)+' off, single use')+'</span><b class="ac-code-c">'+esc(v.code)+'</b>'+
    (fresh?'<span class="ac-code-n">Single use, no minimum spend. It is also saved under Vouchers.</span>':'')+'</div>'+
    '<div class="ac-code-a"><button class="btn sec sm" type="button" data-ac-copy="'+esc(v.code)+'">Copy code</button><a class="ac-lnk" href="/discount/'+encodeURIComponent(v.code)+'?redirect=/cart">Add to basket</a></div></div>';
}
function renderVouchers(el){
  var vs=C.state.vouchers||[],act=vs.filter(function(v){return !v.used}),used=vs.filter(function(v){return v.used});
  el.innerHTML='<div class="ac-pan ac-pale"><h3 class="ac-h3">Ready to use</h3>'+
    (act.length?act.map(function(v){return codeBox(v)}).join(''):'<p class="ac-sub">No codes yet. Swap 500 points for £5 off in <a href="#club" data-ac-go="club">Club points</a>.</p>')+'</div>'+
    (used.length?'<h3 class="ac-h3 ac-mt">Used</h3><table class="ac-tbl"><caption class="sr">Used vouchers</caption><thead><tr><th scope="col">Code</th><th scope="col">Value</th><th scope="col">Used on</th></tr></thead><tbody>'+
      used.map(function(v){return '<tr><td>'+esc(v.code)+'</td><td>'+C.money(v.value)+'</td><td>Order '+esc(v.usedOn||'')+', '+C.dateLabel(v.used)+'</td></tr>'}).join('')+'</tbody></table>':'');
}
function renderLedger(el){
  var l=C.state.ledger;
  el.innerHTML='<table class="ac-tbl ac-led"><caption class="sr">Points history</caption><thead><tr><th scope="col">Date</th><th scope="col">What for</th><th scope="col" class="ac-num">Points</th></tr></thead><tbody>'+
    l.map(function(e){return '<tr'+(e.pending?' class="ac-pend"':'')+'><td>'+C.dateLabel(e.date)+'</td><td>'+esc(e.label)+(e.pending?' <span class="ac-st ac-st-pack">On the way</span>':'')+'</td><td class="ac-num '+(e.points<0?'ac-neg':'ac-pos')+'">'+(e.points>0?'+':'−')+C.fmt(Math.abs(e.points))+'</td></tr>'}).join('')+'</tbody></table>';
}
function renderReferral(el){
  var u=C.state.referralUrl;
  el.innerHTML='<div class="ac-pan ac-pale"><p class="ac-sub">When a friend places their first order with your link, you both get '+C.fmt(C.RULES.referral)+' points.</p>'+
    '<div class="ac-ref-row"><label class="sr" for="ac-ref-'+VERSION+'">Your referral link</label><input id="ac-ref-'+VERSION+'" class="ac-in" type="text" readonly value="'+esc(u)+'"><button class="btn sec" type="button" data-ac-copy="'+esc(u)+'">Copy link</button></div>'+
    '<p class="ac-ref-alt"><a class="ac-lnk" href="mailto:?subject='+encodeURIComponent('Poorly Pet')+'&body='+encodeURIComponent('I buy my dog’s health and mobility things from Poorly Pet. Use my link for your first order: '+u)+'">Share by email</a><a class="ac-lnk" href="https://wa.me/?text='+encodeURIComponent(u)+'">Share on WhatsApp</a></p></div>'+
    '<dl class="ac-kv"><div><dt>Friends who have ordered</dt><dd>1</dd></div><div><dt>Referral points earned</dt><dd>500</dd></div></dl>';
}
function renderDetails(el){
  el.innerHTML='<div class="ac-two">'+
    '<section class="ac-pan ac-pale"><h3 class="ac-h3">Your details</h3><dl class="ac-kv"><div><dt>Name</dt><dd>'+esc(CUSTOMER.firstName+' '+CUSTOMER.lastName)+'</dd></div><div><dt>Email</dt><dd>'+esc(CUSTOMER.email)+'</dd></div><div><dt>Signing in</dt><dd>Email code, no password</dd></div><div><dt>Customer since</dt><dd>'+CUSTOMER.since+'</dd></div></dl>'+
    '<a class="btn sec sm" href="/account/profile">Edit details</a></section>'+
    '<section class="ac-pan ac-pale"><h3 class="ac-h3">Delivery address</h3><p class="ac-addr">'+CUSTOMER.address.map(esc).join('<br>')+'</p>'+
    '<div class="ac-o-act"><a class="btn sec sm" href="/account/profile">Edit address</a><a class="ac-lnk" href="/account/profile">Add another address</a></div></section></div>'+
    '<label class="ac-check"><input type="checkbox" checked> Send me offers and Club news by email. Order and dispatch emails always come.</label>';
}

/* ---------- text stats (menu counts, greeting) ---------- */
function paintStats(){
  var s=C.state,b=C.balanceOf(s.ledger),pr=C.progress(s.spend);
  var act=(s.vouchers||[]).filter(function(v){return !v.used}).length;
  var map={balance:C.fmt(b),tier:pr.tier.name,name:CUSTOMER.firstName,orders:String(ORDERS.length),dogs:String(dogs.length),vouchers:String(act),since:CUSTOMER.since};
  $$('[data-ac-stat]').forEach(function(el){var k=el.getAttribute('data-ac-stat');if(k in map)el.textContent=(el.tagName==='SMALL'&&map[k]==='0')?'':map[k]});
  $$('[data-ac-optcount]').forEach(function(o){var k=o.getAttribute('data-ac-optcount');o.textContent=o.getAttribute('data-l')+(map[k]&&map[k]!=='0'?' ('+map[k]+')':'')});
}

/* ---------- the product rail under the account (one per section) ---------- */
function buyAgainList(){var seen={},out=[];ORDERS.forEach(function(o){o.items.forEach(function(it){if(!seen[it[0]]&&BY[it[0]]){seen[it[0]]=1;out.push(BY[it[0]])}})});return out}
function recsFor(d,n){
  var seen={},out=[],bought={};buyAgainList().forEach(function(p){bought[p.handle]=1});
  (d.conditions||[]).forEach(function(c){(TAGS[c]||[]).forEach(function(h){if(!seen[h]&&BY[h]&&!bought[h]){seen[h]=1;out.push({p:BY[h],c:c})}})});
  if(!out.length)(TAGS['senior-support']||[]).slice(0,n).forEach(function(h){if(BY[h])out.push({p:BY[h],c:null})});
  /* interleave conditions so the first cards aren't all one condition */
  var byC={},order=[];out.forEach(function(x){var k=x.c||'_';if(!byC[k]){byC[k]=[];order.push(k)}byC[k].push(x)});
  var mix=[];for(var i=0;mix.length<n&&i<40;i++){order.forEach(function(k){if(byC[k][i]&&mix.length<n)mix.push(byC[k][i])})}
  return mix;
}
var activeId=dogs[0]&&dogs[0].id;
function activeDog(){for(var i=0;i<dogs.length;i++)if(dogs[i].id===activeId)return dogs[i];activeId=dogs[0]&&dogs[0].id;return dogs[0]}
var current='overview';
function renderRail(){
  var sec=$('[data-ac-rail]');if(!sec)return;
  var p=$('[data-ac-panel="'+current+'"]'),kind=p?p.getAttribute('data-rail'):'';
  var box=$('.wrap',sec),html='';
  if(kind==='again'){
    html='<div class="sec-h"><div><h2 id="ac-rail-h">Buy it <em>again</em></h2><p>Things you have ordered before.</p></div><div class="sec-r"><a class="all" href="#">Shop all products ›</a></div></div>'+
      rail(buyAgainList().slice(0,10).map(function(p){return pk(p,{helps:'Ordered before'})}),'Buy it again');
  }else if(kind==='picks'){
    var d=activeDog();
    if(d){
      var rs=recsFor(d,10),conds=(d.conditions||[]).map(function(c){return CL[c]}).filter(Boolean);
      var pick=(current==='dogs'&&dogs.length>1)?'<div class="sec-r ac-dogpick" role="group" aria-label="Choose a dog">'+dogs.map(function(x){return '<button type="button" class="ac-chip'+(x.id===d.id?' on':'')+'" aria-pressed="'+(x.id===d.id)+'" data-ac-pick="'+esc(x.id)+'">'+esc(x.name)+'</button>'}).join('')+'</div>':
        '<div class="sec-r"><a class="all" href="#dogs" data-ac-go="dogs">'+esc(d.name)+'’s profile ›</a></div>';
      html='<div class="sec-h"><div><h2 id="ac-rail-h">Picked for <em>'+esc(d.name)+'</em></h2><p>'+(conds.length?'From our '+esc(conds.join(', ').toLowerCase())+' ranges.':'Add a condition to '+esc(d.name)+'’s profile for better picks.')+'</p></div>'+pick+'</div>'+
        rail(rs.map(function(x){return pk(x.p,{helps:x.c?'For '+CL[x.c].toLowerCase():''})}),'Picked for '+d.name);
    }
  }
  box.innerHTML=html;sec.hidden=!html;
  if(ROOT)ROOT.classList.toggle('ac-norail',!html);
  bindRails(sec);
}

function renderAll(){
  $$('[data-ac-latest]').forEach(renderLatest);
  $$('[data-ac-orders]').forEach(renderOrders);
  $$('[data-ac-dogmini]').forEach(renderDogMini);
  $$('[data-ac-dogs]').forEach(renderDogs);
  renderClubParts();
  $$('[data-ac-referral]').forEach(renderReferral);
  $$('[data-ac-details]').forEach(renderDetails);
  renderRail();
}
function renderClubParts(){
  $$('[data-ac-points]').forEach(renderPoints);$$('[data-ac-rewards]').forEach(renderRedeem);
  $$('[data-ac-vouchers]').forEach(renderVouchers);$$('[data-ac-ledger]').forEach(renderLedger);paintStats();
}

/* ==========================================================================
   Menu: [data-ac-go="x"] links, the A3 phone <select data-ac-select>, [data-ac-panel="x"] sections.
   ========================================================================== */
var panels=$$('[data-ac-panel]');
function show(id,focus){
  if(!panels.length)return;
  if(!panels.some(function(p){return p.getAttribute('data-ac-panel')===id}))id=panels[0].getAttribute('data-ac-panel');
  current=id;
  panels.forEach(function(p){var on=p.getAttribute('data-ac-panel')===id;p.hidden=!on;if(on){p.classList.remove('ac-fade');void p.offsetWidth;p.classList.add('ac-fade')}});
  $$('[data-ac-go]').forEach(function(a){if(!a.closest('.ac-menu'))return;var on=a.getAttribute('data-ac-go')===id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $$('[data-ac-select]').forEach(function(s){s.value=id});
  renderRail();
  if(focus){var p=$('[data-ac-panel="'+id+'"]'),h=p&&p.querySelector('h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
    var top=$('[data-ac-scrollto]');if(top){var y=top.getBoundingClientRect().top;if(y<0||y>window.innerHeight*.6)top.scrollIntoView({behavior:RM?'auto':'smooth'})}}
}
document.addEventListener('click',function(e){
  var g=e.target.closest('[data-ac-go]');
  if(g){e.preventDefault();var id=g.getAttribute('data-ac-go');try{history.replaceState(null,'','#'+id)}catch(x){}show(id,true);return}
  var a=e.target.closest('[data-add]');if(a){addToBasket([a.getAttribute('data-add')],a);return}
  var r=e.target.closest('[data-ac-reorder]');if(r){var o=ORDERS.filter(function(x){return x.no===r.getAttribute('data-ac-reorder')})[0];if(o)addToBasket(o.items.map(function(i){return i[0]}),r);return}
  var c=e.target.closest('[data-ac-copy]');if(c){C.copy(c.getAttribute('data-ac-copy'),c);return}
  var pick=e.target.closest('[data-ac-pick]');if(pick){activeId=pick.getAttribute('data-ac-pick');renderRail();var nb=$('[data-ac-pick="'+activeId+'"]');if(nb)nb.focus();return}
  var ad=e.target.closest('[data-ac-adddog]');if(ad){openDog(null,ad);return}
  var ed=e.target.closest('[data-ac-editdog]');if(ed){openDog(ed.getAttribute('data-ac-editdog'),ed);return}
  var rd=e.target.closest('button[data-ac-redeem]');if(rd&&!rd.disabled){redeem(rd);return}
});
$$('[data-ac-select]').forEach(function(s){s.addEventListener('change',function(){var id=s.value;if(id==='signout'){location.href='/account/logout';return}try{history.replaceState(null,'','#'+id)}catch(x){}show(id,false)})});

/* ---------- redeem ---------- */
function redeem(btn){
  var pts=+btn.getAttribute('data-ac-redeem'),wrap=btn.closest('[data-ac-rewards]');
  $$('button[data-ac-redeem]',wrap).forEach(function(b){b.disabled=true});btn.textContent='Creating your code…';
  C.API.redeem(pts).then(function(res){
    renderClubParts();
    var o2=$('[data-ac-redout]',wrap);
    if(o2){o2.innerHTML=codeBox(res.voucher||{code:res.code,value:res.value},true);var cb=$('[data-ac-copy]',o2);if(cb)cb.focus()}
  },function(err){
    renderClubParts();var o2=$('[data-ac-redout]',wrap);if(o2)o2.innerHTML='<p class="ac-err" role="alert">'+esc(err.message)+'</p>';
  });
}

/* ==========================================================================
   Dog form (dialog). Name, breed, birthday, weight, conditions.
   ========================================================================== */
var dlg,lastFocus,editing=null;
function buildDialog(){
  dlg=document.createElement('div');dlg.className='ac-modal';dlg.hidden=true;
  dlg.innerHTML='<div class="ac-scrim" data-ac-close></div><div class="ac-dlg" role="dialog" aria-modal="true" aria-labelledby="ac-dlg-h">'+
    '<div class="ac-dlg-h"><h2 id="ac-dlg-h">Add a dog</h2><button class="ac-x" type="button" data-ac-close aria-label="Close">×</button></div>'+
    '<form class="ac-form" id="ac-dogform" novalidate><div class="ac-dlg-b">'+
    '<div class="ac-f"><label for="acf-name">Name</label><input class="ac-in" id="acf-name" name="name" type="text" autocomplete="off" required maxlength="40"><span class="ac-ferr" id="acf-name-e" hidden>Please add your dog’s name.</span></div>'+
    '<div class="ac-f2"><div class="ac-f"><label for="acf-breed">Breed</label><input class="ac-in" id="acf-breed" name="breed" type="text" list="acf-breeds" autocomplete="off" maxlength="60"><datalist id="acf-breeds">'+BREEDS.map(function(b){return '<option value="'+esc(b)+'">'}).join('')+'</datalist></div>'+
    '<div class="ac-f"><label for="acf-weight">Weight (kg)</label><input class="ac-in" id="acf-weight" name="weight" type="number" inputmode="decimal" min="0.5" max="120" step="0.1"><span class="ac-hint">Helps with sizing harnesses and wheelchairs</span></div></div>'+
    '<div class="ac-f"><label for="acf-bday">Birthday</label><input class="ac-in ac-in--date" id="acf-bday" name="birthday" type="date"><span class="ac-hint">A best guess is fine. We add '+C.RULES.birthday+' Club points on the day.</span><span class="ac-ferr" id="acf-bday-e" hidden>Please choose a date in the past.</span></div>'+
    '<fieldset class="ac-fs"><legend>Conditions <span>(optional, choose any)</span></legend>'+CONDS.map(function(g){return '<div class="ac-cg"><p>'+esc(g[0])+'</p><div class="ac-cgl">'+g[1].map(function(c){return '<label class="ac-cc"><input type="checkbox" name="cond" value="'+c[0]+'"><span>'+esc(c[1])+'</span></label>'}).join('')+'</div></div>'}).join('')+'</fieldset>'+
    '</div><div class="ac-dlg-f"><button class="btn sec" type="submit">Save dog</button><button class="ac-lnk" type="button" data-ac-close>Cancel</button><button class="ac-lnk ac-del" type="button" data-ac-deldog hidden>Remove this dog</button></div></form></div>';
  document.body.appendChild(dlg);
  dlg.addEventListener('click',function(e){if(e.target.closest('[data-ac-close]'))closeDog();if(e.target.closest('[data-ac-deldog]'))delDog()});
  dlg.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeDog();return}
    if(e.key==='Tab'){var f=$$('button:not([hidden]),input,a[href]',dlg).filter(function(x){return x.offsetParent!==null});var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  });
  $('#ac-dogform',dlg).addEventListener('submit',saveDog);
  $('#acf-bday',dlg).max=C.today();
}
function openDog(id,from){
  if(!dlg)buildDialog();lastFocus=from||document.activeElement;editing=id;
  var d=id?dogs.filter(function(x){return x.id===id})[0]:null,f=$('#ac-dogform',dlg);f.reset();
  $('#ac-dlg-h',dlg).textContent=d?'Edit '+d.name:'Add a dog';
  $$('.ac-ferr',dlg).forEach(function(x){x.hidden=true});$$('.ac-f',dlg).forEach(function(x){x.classList.remove('is-err')});
  if(d){f.name.value=d.name||'';f.breed.value=d.breed||'';f.weight.value=d.weight||'';f.birthday.value=d.birthday||'';$$('input[name="cond"]',f).forEach(function(c){c.checked=(d.conditions||[]).indexOf(c.value)>-1})}
  $('[data-ac-deldog]',dlg).hidden=!d;
  dlg.hidden=false;document.documentElement.classList.add('ac-lock');f.name.focus();
}
function closeDog(){if(!dlg||dlg.hidden)return;dlg.hidden=true;document.documentElement.classList.remove('ac-lock');if(lastFocus&&document.body.contains(lastFocus))lastFocus.focus()}
function saveDog(e){
  e.preventDefault();var f=e.target,name=f.name.value.trim(),b=f.birthday.value,bad=false;
  var nf=f.name.closest('.ac-f'),bf=f.birthday.closest('.ac-f');
  nf.classList.toggle('is-err',!name);$('#acf-name-e',dlg).hidden=!!name;if(!name)bad=true;
  var future=b&&b>C.today();bf.classList.toggle('is-err',!!future);$('#acf-bday-e',dlg).hidden=!future;if(future)bad=true;
  if(bad){(name?f.birthday:f.name).focus();return}
  var rec={id:editing||'d'+Date.now().toString(36),name:name,breed:f.breed.value.trim(),birthday:b,weight:f.weight.value?String(Math.round(parseFloat(f.weight.value)*10)/10):'',
    conditions:$$('input[name="cond"]:checked',f).map(function(c){return c.value})};
  rec.age=ageOf(b); /* kept for the live page, which shows `age` */
  if(editing){dogs=dogs.map(function(x){return x.id===editing?rec:x})}else{dogs.push(rec)}
  if(current==='dogs')activeId=rec.id;saveDogs();closeDog();renderAll();paintStats();
  toast('<span><b>'+esc(rec.name)+' saved</b>'+(rec.birthday?'Birthday points on '+dayMonth(nextBirthday(rec.birthday).date):'Add a birthday any time for birthday points')+'</span>');
}
function delDog(){if(!editing)return;var d=dogs.filter(function(x){return x.id===editing})[0];if(!window.confirm('Remove '+(d?d.name:'this dog')+' from your account?'))return;dogs=dogs.filter(function(x){return x.id!==editing});saveDogs();closeDog();renderAll();paintStats()}
$$('[data-ac-resetdogs]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();try{window.localStorage.removeItem(LS)}catch(x){}dogs=loadDogs();activeId=dogs[0]&&dogs[0].id;C.reset();renderAll()})});

/* ---------- start ---------- */
renderAll();
if(C.API.endpoint)C.API.getAccount().then(renderClubParts,function(){});
show((location.hash||'').slice(1));
window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
})();
