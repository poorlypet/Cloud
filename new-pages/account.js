/* ==========================================================================
   Your account: shared by account-a.html, account-b.html, account-c.html.
   Needs products.js (PP_PRODUCTS, PP_TAGS) and club.js (PPClub) loaded first.

   EXAMPLE DATA: the customer, orders and dogs below are made up to show the
   layout. On the live site they come from:
   - orders, name, email, addresses: Liquid `customer` object on the page, or the
     "Poorly Pet Account" app proxy (/apps/account?action=bootstrap), as the live
     /pages/account-dashboard already does;
   - dogs: customer metafield custom.dogs (JSON), written by the app proxy
     action "save-dogs"; localStorage "pp_dogs_v1" is the fallback, same key and
     shape as the live page, plus a `birthday` (YYYY-MM-DD) field for Club points;
   - Club: PPClub.API (see club.js and CLUB-SYSTEM.md).
   Every class is prefixed ac-.
   ========================================================================== */
(function(){
'use strict';
var C=window.PPClub,P=window.PP_PRODUCTS||[],TAGS=window.PP_TAGS||{};
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=C.esc,BY={};P.forEach(function(p){BY[p.handle]=p});
var VERSION=(document.querySelector('[data-ac]')||{}).getAttribute?document.querySelector('[data-ac]').getAttribute('data-ac'):'a';

/* ---------- example customer and orders ---------- */
var CUSTOMER={firstName:'Sarah',lastName:'Example',email:'sarah@example.com',since:'March 2026',
  address:['Sarah Example','12 Example Street','Exampletown','EX1 2MP','United Kingdom']};
var ORDERS=[
  {no:'1049',date:'2026-09-26',status:'packing',items:[['itch-relief-chews-for-dogs-skin-allergy-support',1]],delivery:0,note:'Free delivery (Regular)'},
  {no:'1044',date:'2026-09-05',status:'dispatched',items:[['daily-joint-salmon-oil-for-dogs-cats-300ml',1],['natural-vetcare-mobility-50-chews',1]],delivery:0},
  {no:'1031',date:'2026-06-10',status:'delivered',items:[['itch-relief-supplement-for-dogs-120-chews',1],['natural-vetcare-skin-oil-100ml',1],['2-in-1-dog-shampoo-conditioner-with-lavender-jojoba',1]],discount:5,code:'PPC-7KQ2-M9XD',delivery:0},
  {no:'1027',date:'2026-05-02',status:'delivered',items:[['natural-vetcare-mobility-50-chews',1],['daily-joint-salmon-oil-for-dogs-cats-300ml',1],['green-lipped-mussel-powder-for-dogs-cats-80-serving',1]],delivery:0},
  {no:'1018',date:'2026-03-12',status:'delivered',items:[['msm-powder-for-dogs-cats-joint-coat-support-300g',1],['self-heating-pet-pad-no-electricity-needed-48x38cm',1],['100-natural-coconut-oil-for-dogs',1]],delivery:0}
];
var STATUS={packing:['Being packed','ac-st-pack'],dispatched:['Dispatched with Evri','ac-st-go'],delivered:['Delivered','ac-st-done']};
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

/* ---------- product card: the site's .pk ---------- */
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function pk(p,o){
  o=o||{};var sale=p.compareAt&&p.compareAt>p.price,n=p.reviewCount||0;
  return '<article class="pk ac-pk">'+(o.tab?'<span class="tab">'+esc(o.tab)+'</span>':sale?'<span class="tab sale">Offer</span>':'')+
    '<a class="well" href="#">'+(p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy" data-ac-img>':'<span class="ac-noimg" aria-hidden="true"></span>')+'</a>'+
    '<div class="body"><span class="brand">'+esc(p.brand)+'</span><a class="name" href="#">'+esc(cleanTitle(p.title))+'</a>'+
    (p.rating?'<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>':'<span class="rev none" aria-hidden="true"></span>')+
    (o.helps?'<span class="helps">'+esc(o.helps)+'</span>':'')+
    '<div class="price"><span class="now">'+money(p.price)+'</span>'+(sale?'<span class="was">'+money(p.compareAt)+'</span>':'')+'</div>'+
    '<button class="btn" type="button" data-ac-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
}
function thumb(p){return '<span class="ac-th">'+(p&&p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy" data-ac-img>':'<span class="ac-noimg" aria-hidden="true"></span>')+'</span>'}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-ac-img')){var s=document.createElement('span');s.className='ac-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}},true);

/* ---------- basket toast (prototype) ---------- */
var basket=0,toastEl,toastT;
function toast(msg){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='ac-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML=msg;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3200);
}
function addToBasket(hs){
  hs=hs.filter(function(h){return BY[h]});if(!hs.length)return;basket+=hs.length;
  var bc=$('#basket-btn .cnt');if(bc){bc.textContent=basket;bc.setAttribute('data-n',basket)}
  toast('<span><b>'+(hs.length===1?'Added to basket':hs.length+' items added to basket')+'</b>'+esc(hs.length===1?cleanTitle(BY[hs[0]].title):'From your earlier order')+'</span><a href="#">View basket ('+basket+')</a>');
}

/* ==========================================================================
   Renderers. Each fills any element with the matching data attribute.
   ========================================================================== */
function statusChip(o){var s=STATUS[o.status];return '<span class="ac-st '+s[1]+'">'+s[0]+'</span>'}
function renderOrders(el){
  var lim=+el.getAttribute('data-limit')||ORDERS.length,compact=el.hasAttribute('data-compact');
  el.innerHTML='<ul class="ac-orders'+(compact?' ac-orders--c':'')+'">'+ORDERS.slice(0,lim).map(function(o){
    var ps=o.items.map(function(it){return BY[it[0]]}).filter(Boolean);
    return '<li class="ac-o">'+
      '<div class="ac-o-h"><div><b class="ac-o-no">Order #'+o.no+'</b><span class="ac-o-d">'+C.dateLabel(o.date)+' · '+ps.length+' item'+(ps.length===1?'':'s')+' · '+money(orderTotal(o))+'</span></div>'+statusChip(o)+'</div>'+
      (compact?'<div class="ac-o-ths">'+ps.map(thumb).join('')+'</div>':
      '<ul class="ac-o-items">'+o.items.map(function(it){var p=BY[it[0]];if(!p)return '';return '<li>'+thumb(p)+'<span class="ac-o-it"><span class="ac-o-br">'+esc(p.brand)+'</span><a href="#">'+esc(cleanTitle(p.title))+'</a><span class="ac-o-q">Qty '+it[1]+'</span></span><b>'+money(p.price*it[1])+'</b><button class="ac-lnk" type="button" data-ac-add="'+esc(p.handle)+'">Buy again</button></li>'}).join('')+'</ul>'+
      (o.discount?'<p class="ac-o-note">Club voucher '+esc(o.code)+' took '+money(o.discount)+' off.</p>':'')+
      (o.status==='packing'?'<p class="ac-o-note">Points for this order are added the day it ships.</p>':''))+
      '<div class="ac-o-act"><button class="btn sm" type="button" data-ac-reorder="'+o.no+'">Buy it all again</button>'+
      (o.status!=='packing'?'<a class="btn sm sec" href="track-my-order-a.html">Track parcel</a>':'<a class="btn sm sec" href="track-my-order-a.html">Order status</a>')+
      '<a class="ac-lnk" href="#">View order</a>'+(o.status==='delivered'?'<a class="ac-lnk" href="#">Review for 50 points</a>':'')+'</div></li>';
  }).join('')+'</ul>';
}
function buyAgainList(){var seen={},out=[];ORDERS.forEach(function(o){o.items.forEach(function(it){if(!seen[it[0]]&&BY[it[0]]){seen[it[0]]=1;out.push(BY[it[0]])}})});return out}
function renderBuyAgain(el){var n=+el.getAttribute('data-limit')||4;el.innerHTML='<div class="ac-pkg">'+buyAgainList().slice(0,n).map(function(p){return pk(p,{tab:'Bought before'})}).join('')+'</div>'}

function recsFor(d,n){
  var seen={},out=[],bought={};buyAgainList().forEach(function(p){bought[p.handle]=1});
  (d.conditions||[]).forEach(function(c){(TAGS[c]||[]).forEach(function(h){if(!seen[h]&&BY[h]&&!bought[h]){seen[h]=1;out.push({p:BY[h],c:c})}})});
  if(!out.length)(TAGS['senior-support']||[]).slice(0,n).forEach(function(h){if(BY[h])out.push({p:BY[h],c:null})});
  /* interleave conditions so the first row isn't all one condition */
  var byC={},order=[];out.forEach(function(x){var k=x.c||'_';if(!byC[k]){byC[k]=[];order.push(k)}byC[k].push(x)});
  var mix=[];for(var i=0;mix.length<n&&i<40;i++){order.forEach(function(k){if(byC[k][i]&&mix.length<n)mix.push(byC[k][i])})}
  return mix;
}
function renderDogRecs(el){
  var d=activeDog();if(!d){el.innerHTML='';return}
  var n=+el.getAttribute('data-limit')||4,rs=recsFor(d,n);
  var conds=(d.conditions||[]).map(function(c){return CL[c]}).filter(Boolean);
  el.innerHTML='<div class="sec-h"><div><h2>Picked for <em>'+esc(d.name)+'</em></h2><p>'+(conds.length?'From our '+esc(conds.join(', ').toLowerCase())+' ranges.':'Add a condition to '+esc(d.name)+'’s profile to see products for it.')+'</p></div>'+
    (dogs.length>1?'<div class="sec-r ac-dogpick" role="group" aria-label="Choose a dog">'+dogs.map(function(x,i){return '<button type="button" class="ac-chip'+(x.id===d.id?' on':'')+'" aria-pressed="'+(x.id===d.id)+'" data-ac-pick="'+esc(x.id)+'">'+esc(x.name)+'</button>'}).join('')+'</div>':'')+'</div>'+
    '<div class="ac-pkg">'+rs.map(function(x){return pk(x.p,{helps:x.c?'For '+CL[x.c].toLowerCase():''})}).join('')+'</div>';
}
var activeId=dogs[0]&&dogs[0].id;
function activeDog(){for(var i=0;i<dogs.length;i++)if(dogs[i].id===activeId)return dogs[i];activeId=dogs[0]&&dogs[0].id;return dogs[0]}

function dogCard(d,big){
  var nb=nextBirthday(d.birthday),conds=(d.conditions||[]).map(function(c){return CL[c]}).filter(Boolean);
  var facts=[d.breed,d.birthday?ageOf(d.birthday):'',d.weight?d.weight+' kg':''].filter(Boolean);
  return '<article class="ac-dog'+(big?' ac-dog--big':'')+'"><span class="ac-av" aria-hidden="true">'+esc(initial(d.name))+'</span>'+
    '<div class="ac-dog-m"><h3>'+esc(d.name)+'</h3><p class="ac-dog-f">'+(facts.length?esc(facts.join(' · ')):'No details yet')+'</p>'+
    (conds.length?'<ul class="ac-conds">'+conds.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>':'')+
    '<p class="ac-dog-b">'+(nb?'Birthday '+dayMonth(nb.date)+(nb.days===0?', today. 250 points added.':', '+C.RULES.birthday+' Club points in '+nb.days+' day'+(nb.days===1?'':'s')+'.'):'Add a birthday to get '+C.RULES.birthday+' Club points each year.')+'</p></div>'+
    '<div class="ac-dog-a"><button class="btn sm sec" type="button" data-ac-editdog="'+esc(d.id)+'">Edit</button></div></article>';
}
function renderDogs(el){
  var big=el.hasAttribute('data-big');
  el.innerHTML=(dogs.length?'<div class="ac-dogs">'+dogs.map(function(d){return dogCard(d,big)}).join('')+'</div>':'<div class="ac-empty"><p><b>No dogs saved yet.</b> Add your dog so we can show products for their conditions and send birthday points.</p></div>')+
    '<button class="btn ac-adddog" type="button" data-ac-adddog>Add a dog</button>';
}

/* ---------- Club ---------- */
function renderPoints(el){
  var s=C.state,b=C.balanceOf(s.ledger),pr=C.progress(s.spend),v=C.vouchersFor(b),pend=C.pendingOf(s.ledger);
  var T=C.RULES.tiers,max=T[T.length-1].from,pos=Math.min(100,s.spend/max*100);
  el.innerHTML='<div class="ac-pts">'+
    '<div class="ac-pts-bal"><span class="ac-k">Points balance</span><b class="ac-big">'+C.fmt(b)+'</b><span class="ac-pts-w">Worth '+C.money(v.value)+' in vouchers'+(pend?' · '+C.fmt(pend)+' pending':'')+'</span></div>'+
    '<div class="ac-pts-tier"><span class="ac-k">Tier</span><b class="ac-tiername">'+pr.tier.name+'</b><span class="ac-pts-w">'+pr.tier.rate+' points per £1'+(pr.tier.from>0?', free delivery':'')+'</span></div>'+
    '<div class="ac-ladder"><div class="ac-lad-t"><span>'+money(s.spend)+' spent</span><span>'+(pr.next?money(pr.toGo)+' to '+pr.next.name:'Top tier reached')+'</span></div>'+
    '<div class="ac-bar" role="progressbar" aria-label="Spend towards the next tier" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pr.pct+'" aria-valuetext="'+(pr.next?money(pr.toGo)+' to '+pr.next.name:'Top tier')+'"><i style="width:'+pos+'%"></i>'+
    T.map(function(t){return '<span class="ac-mk'+(s.spend>=t.from?' on':'')+'" style="left:'+(t.from/max*100)+'%"></span>'}).join('')+'</div>'+
    '<ol class="ac-lad-l">'+T.map(function(t){return '<li class="'+(t.id===pr.tier.id?'on':'')+'" style="left:'+(t.from/max*100)+'%"><b>'+t.name+'</b><span>'+(t.from?'£'+t.from:'First order')+'</span></li>'}).join('')+'</ol></div></div>';
}
function renderRedeem(el){
  var b=C.balanceOf(C.state.ledger);
  el.innerHTML='<div class="ac-red"><h3 class="ac-h3">Swap points for a voucher</h3><p class="ac-sub">No minimum spend. We create a single-use code for your account.</p><ul class="ac-red-l">'+
    C.RULES.rewards.map(function(r){var ok=b>=r.points;return '<li><span class="ac-red-v">'+C.money(r.value)+' off</span><span class="ac-red-p">'+C.fmt(r.points)+' points'+(ok?'':' <em>· '+C.fmt(r.points-b)+' more needed</em>')+'</span>'+
      '<button class="btn'+(ok?'':' sec')+'" type="button" data-ac-redeem="'+r.points+'"'+(ok?'':' disabled')+'>Get '+C.money(r.value)+' code</button></li>'}).join('')+
    '</ul><div class="ac-red-out" data-ac-redout aria-live="polite"></div></div>';
}
function codeBox(v,fresh){
  return '<div class="ac-code'+(fresh?' ac-code--new':'')+'"><div><span class="ac-k">'+(fresh?'Your '+C.money(v.value)+' voucher code':C.money(v.value)+' voucher')+'</span><b class="ac-code-c">'+esc(v.code)+'</b>'+
    '<span class="ac-code-n">Single use. Enter it in the discount box at checkout, or use the link to add it to your basket.</span></div>'+
    '<div class="ac-code-a"><button class="btn sec sm" type="button" data-ac-copy="'+esc(v.code)+'">Copy code</button><a class="ac-lnk" href="/discount/'+encodeURIComponent(v.code)+'?redirect=/cart">Add to basket</a></div></div>';
}
function renderVouchers(el){
  var vs=C.state.vouchers||[],act=vs.filter(function(v){return !v.used}),used=vs.filter(function(v){return v.used});
  el.innerHTML='<h3 class="ac-h3">Your vouchers</h3>'+
    (act.length?act.map(function(v){return codeBox(v)}).join(''):'<p class="ac-sub">No active vouchers. Swap points above to get one.</p>')+
    (used.length?'<table class="ac-tbl ac-tbl--v"><caption class="sr">Used vouchers</caption><thead><tr><th scope="col">Used code</th><th scope="col">Value</th><th scope="col">Used on</th></tr></thead><tbody>'+
      used.map(function(v){return '<tr><td>'+esc(v.code)+'</td><td>'+C.money(v.value)+'</td><td>Order '+esc(v.usedOn||'')+', '+C.dateLabel(v.used)+'</td></tr>'}).join('')+'</tbody></table>':'');
}
function renderLedger(el){
  var n=+el.getAttribute('data-limit')||99,l=C.state.ledger.slice(0,n);
  el.innerHTML='<table class="ac-tbl ac-led"><caption class="sr">Points history</caption><thead><tr><th scope="col">Date</th><th scope="col">What for</th><th scope="col" class="ac-num">Points</th></tr></thead><tbody>'+
    l.map(function(e){return '<tr'+(e.pending?' class="ac-pend"':'')+'><td>'+C.dateLabel(e.date)+'</td><td>'+esc(e.label)+(e.pending?' <span class="ac-st ac-st-pack">Pending</span>':'')+'</td><td class="ac-num '+(e.points<0?'ac-neg':'ac-pos')+'">'+(e.points>0?'+':'−')+C.fmt(Math.abs(e.points))+'</td></tr>'}).join('')+'</tbody></table>';
}
function renderEarn(el){
  var R=C.RULES;
  el.innerHTML='<table class="ac-tbl ac-earn"><caption class="sr">Ways to earn</caption><tbody>'+
    [['Shopping',C.progress(C.state.spend).tier.rate+' points per £1 at your tier, added the day your order ships'],['Reviews',R.review+' points for a verified Judge.me review'],['Birthdays',R.birthday+' points on your dog’s birthday'],['Referrals',R.referral+' points each when a friend places a first order'],['Early access','Sale prices a day before everyone else']]
    .map(function(r){return '<tr><th scope="row">'+r[0]+'</th><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table><p class="ac-small"><a href="club-a.html">How the Club works ›</a></p>';
}
function renderReferral(el){
  var u=C.state.referralUrl;
  el.innerHTML='<div class="ac-ref"><p class="ac-sub">Share your link. When a friend places their first order, you both get '+C.RULES.referral+' points.</p>'+
    '<div class="ac-ref-row"><label class="sr" for="ac-ref-'+VERSION+'">Your referral link</label><input id="ac-ref-'+VERSION+'" class="ac-in" type="text" readonly value="'+esc(u)+'"><button class="btn sec" type="button" data-ac-copy="'+esc(u)+'">Copy link</button></div>'+
    '<p class="ac-ref-alt"><a class="ac-lnk" href="mailto:?subject='+encodeURIComponent('Poorly Pet')+'&body='+encodeURIComponent('I buy my dog’s health and mobility things from Poorly Pet. Use my link for your first order: '+u)+'">Share by email</a><a class="ac-lnk" href="https://wa.me/?text='+encodeURIComponent(u)+'">Share on WhatsApp</a></p>'+
    '<dl class="ac-kv"><div><dt>Friends who have ordered</dt><dd>1</dd></div><div><dt>Referral points earned</dt><dd>500</dd></div></dl></div>';
}
function renderDetails(el){
  el.innerHTML='<div class="ac-det">'+
    '<section><h3 class="ac-h3">Your details</h3><dl class="ac-kv"><div><dt>Name</dt><dd>'+esc(CUSTOMER.firstName+' '+CUSTOMER.lastName)+'</dd></div><div><dt>Email</dt><dd>'+esc(CUSTOMER.email)+'</dd></div><div><dt>Signing in</dt><dd>Email code, no password</dd></div><div><dt>Customer since</dt><dd>'+CUSTOMER.since+'</dd></div></dl>'+
    '<p class="ac-small"><a class="ac-lnk" href="/account/profile">Edit your details</a></p></section>'+
    '<section><h3 class="ac-h3">Addresses</h3><div class="ac-addr"><span class="ac-badge">Default</span><p>'+CUSTOMER.address.map(esc).join('<br>')+'</p><p class="ac-small"><a class="ac-lnk" href="/account/profile">Edit</a></p></div>'+
    '<button class="btn sec sm" type="button" onclick="location.href=\'/account/profile\'">Add an address</button></section>'+
    '<section><h3 class="ac-h3">Emails from us</h3><p class="ac-sub">Order and dispatch emails always come. Offers and Club news are your choice.</p><label class="ac-check"><input type="checkbox" checked> Send me offers and Club news</label></section>'+
    '</div>';
}

/* ---------- text stats (tiles, headers) ---------- */
function paintStats(){
  var s=C.state,b=C.balanceOf(s.ledger),pr=C.progress(s.spend),o=ORDERS[0],nb=null,nd=null;
  dogs.forEach(function(d){var x=nextBirthday(d.birthday);if(x&&(!nb||x.days<nb.days)){nb=x;nd=d}});
  var map={
    balance:C.fmt(b),worth:C.money(C.vouchersFor(b).value),tier:pr.tier.name,rate:pr.tier.rate+' points per £1',
    next:pr.next?C.money2(pr.toGo)+' to '+pr.next.name:'Top tier',pending:C.fmt(C.pendingOf(s.ledger)),
    lastorder:'#'+o.no,laststatus:STATUS[o.status][0],lastdate:C.dateLabel(o.date),
    dogs:String(dogs.length),dognames:dogs.map(function(d){return d.name}).join(' and ')||'None yet',
    birthday:nd?nd.name+', '+dayMonth(nb.date):'Add a birthday',name:CUSTOMER.firstName,orders:String(ORDERS.length)
  };
  $$('[data-ac-stat]').forEach(function(el){var k=el.getAttribute('data-ac-stat');if(k in map)el.textContent=map[k]});
  $$('[data-ac-tierbar]').forEach(function(el){el.style.width=pr.pct+'%'});
}

function renderAll(){
  $$('[data-ac-orders]').forEach(renderOrders);
  $$('[data-ac-buyagain]').forEach(renderBuyAgain);
  $$('[data-ac-dogs]').forEach(renderDogs);
  $$('[data-ac-dogrecs]').forEach(renderDogRecs);
  $$('[data-ac-points]').forEach(renderPoints);
  $$('[data-ac-rewards]').forEach(renderRedeem);
  $$('[data-ac-vouchers]').forEach(renderVouchers);
  $$('[data-ac-ledger]').forEach(renderLedger);
  $$('[data-ac-earn]').forEach(renderEarn);
  $$('[data-ac-referral]').forEach(renderReferral);
  $$('[data-ac-details]').forEach(renderDetails);
  $$('[data-ac-dogmini]').forEach(function(el){el.innerHTML=dogs.map(function(d){return '<li><span class="ac-av sm" aria-hidden="true">'+esc(initial(d.name))+'</span><span><b>'+esc(d.name)+'</b><span>'+esc([d.breed,ageOf(d.birthday)].filter(Boolean).join(', '))+'</span></span></li>'}).join('')||'<li>No dogs saved yet.</li>'});
  paintStats();
}
function renderClubParts(){['points','rewards','vouchers','ledger','earn'].forEach(function(k){$$('[data-ac-'+k+']').forEach({points:renderPoints,rewards:renderRedeem,vouchers:renderVouchers,ledger:renderLedger,earn:renderEarn}[k])});paintStats()}

/* ==========================================================================
   Tabs / side nav: [data-ac-go="x"] buttons or links, [data-ac-panel="x"] panels.
   ========================================================================== */
var panels=$$('[data-ac-panel]');
function show(id,focus){
  if(!panels.length)return;
  var ok=panels.some(function(p){return p.getAttribute('data-ac-panel')===id});if(!ok)id=panels[0].getAttribute('data-ac-panel');
  panels.forEach(function(p){var on=p.getAttribute('data-ac-panel')===id;p.hidden=!on;if(on&&!p.classList.contains('ac-in'))p.classList.add('ac-in')});
  $$('[data-ac-go]').forEach(function(a){var on=a.getAttribute('data-ac-go')===id;a.classList.toggle('on',on);if(a.getAttribute('role')==='tab')a.setAttribute('aria-selected',on);else if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(focus){var p=$('[data-ac-panel="'+id+'"]');var h=p&&p.querySelector('h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
    var top=$('[data-ac-scrollto]');if(top&&top.getBoundingClientRect().top<0)top.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
}
document.addEventListener('click',function(e){
  var g=e.target.closest('[data-ac-go]');
  if(g){e.preventDefault();var id=g.getAttribute('data-ac-go');try{history.replaceState(null,'','#'+id)}catch(x){}show(id,true);return}
  var a=e.target.closest('[data-ac-add]');if(a){addToBasket([a.getAttribute('data-ac-add')]);return}
  var r=e.target.closest('[data-ac-reorder]');if(r){var o=ORDERS.filter(function(x){return x.no===r.getAttribute('data-ac-reorder')})[0];if(o)addToBasket(o.items.map(function(i){return i[0]}));return}
  var c=e.target.closest('[data-ac-copy]');if(c){C.copy(c.getAttribute('data-ac-copy'),c);return}
  var pick=e.target.closest('[data-ac-pick]');if(pick){activeId=pick.getAttribute('data-ac-pick');$$('[data-ac-dogrecs]').forEach(renderDogRecs);return}
  var ad=e.target.closest('[data-ac-adddog]');if(ad){openDog(null,ad);return}
  var ed=e.target.closest('[data-ac-editdog]');if(ed){openDog(ed.getAttribute('data-ac-editdog'),ed);return}
  var rd=e.target.closest('button[data-ac-redeem]');if(rd&&!rd.disabled){redeem(rd);return}
});
$$('[role="tablist"]').forEach(function(tl){tl.addEventListener('keydown',function(e){
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;var ts=$$('[role="tab"]',tl),i=ts.indexOf(document.activeElement);if(i<0)return;
  e.preventDefault();var n=ts[(i+(e.key==='ArrowRight'?1:ts.length-1))%ts.length];n.focus();n.click();
})});

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
    '</div><div class="ac-dlg-f"><button class="btn" type="submit">Save dog</button><button class="btn sec" type="button" data-ac-close>Cancel</button><button class="ac-lnk ac-del" type="button" data-ac-deldog hidden>Remove this dog</button></div></form></div>';
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
  dlg.hidden=false;document.documentElement.classList.add('ac-lock');setTimeout(function(){f.name.focus()},30);
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
  activeId=rec.id;saveDogs();closeDog();renderAll();
  toast('<span><b>'+esc(rec.name)+' saved</b>'+(rec.birthday?'Birthday points on '+dayMonth(nextBirthday(rec.birthday).date):'Add a birthday any time for birthday points')+'</span>');
}
function delDog(){if(!editing)return;var d=dogs.filter(function(x){return x.id===editing})[0];if(!window.confirm('Remove '+(d?d.name:'this dog')+' from your account?'))return;dogs=dogs.filter(function(x){return x.id!==editing});saveDogs();closeDog();renderAll()}
$$('[data-ac-resetdogs]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();try{window.localStorage.removeItem(LS)}catch(x){}dogs=loadDogs();activeId=dogs[0]&&dogs[0].id;C.reset();renderAll()})});

/* ---------- start ---------- */
renderAll();
if(C.API.endpoint)C.API.getAccount().then(renderClubParts,function(){});show((location.hash||'').slice(1));
window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
document.body.setAttribute('data-account-url',location.pathname.split('/').pop()||'account-a.html');
})();
