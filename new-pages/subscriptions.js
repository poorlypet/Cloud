/* ==========================================================================
   Poorly Pet Subscribe & Save: data + behaviour shared by subscriptions-a/b/c.html.

   SOURCES (read only, 28 Sep 2026)
   [SUB]    Live GemPages page /pages/subscription (id 623903433082012190):
            tiers "Every 8 weeks 5%", "Every 4 weeks 10%", "Every 2 weeks 15%";
            "How it works" steps; "You're always in control" (skip, pause, change schedule,
            swap products, cancel anytime, reminder emails); FAQs (several products renew
            together; cancel with no fees; an already-charged order is still sent).
   [SUBPOL] Shopify shop policy SUBSCRIPTION_POLICY "Cancellations": change or cancel at any
            time; order confirmation emails link to your order to manage it.
   [TERMS]  Shopify TERMS_OF_SERVICE 10 "Subscriptions": amend, pause or cancel at any time
            before the next billing date, through your account or by contacting us.
   [SHIP]   Shipping policy + BRIEF round 5: free UK delivery over £39, otherwise £3.99.
   [REF]    Refund policy 3: opened supplements / perishables not returnable unless faulty.
   [CLUB]   signed-off Club copy: 5 points for every £1 on every order, added the day it ships.
   Products: new-pages/products.js snapshot (consumables only, picked by productType).
   Prices here are the store's one-off prices; subscribed price = price less the tier %.
   Each version is a root with data-ss="a|b|c". Vanilla JS, no external requests.
   ========================================================================== */
(function(){
'use strict';

var PRODUCTS=window.PP_PRODUCTS||[],BY=window.PP_BY_HANDLE||{};
if(!Object.keys(BY).length)PRODUCTS.forEach(function(p){BY[p.handle]=p});
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var ROOT=document.querySelector('[data-ss]');if(!ROOT)return;
var V=ROOT.getAttribute('data-ss');

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function r2(n){return Math.round(n*100)/100}
function money(n){return '£'+r2(n).toFixed(2)}
function money0(n){var v=r2(n);return '£'+(v%1?v.toFixed(2):v.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function $(s,el){return (el||document).querySelector(s)}
function $$(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))}
function cleanTitle(t){return String(t).replace(/\s*\|\s*/g,', ')}

/* ---------- the real discount structure [SUB] ---------- */
var TIERS=[
  {w:8,pct:5, n:'Every 8 weeks',fit:'Larger packs and items that last longer'},
  {w:4,pct:10,n:'Every 4 weeks',fit:'The usual choice for monthly chews and supplements'},
  {w:2,pct:15,n:'Every 2 weeks',fit:'Fast-used items, or stocking up for more than one dog'}
];
function tier(w){w=+w;for(var i=0;i<TIERS.length;i++)if(TIERS[i].w===w)return TIERS[i];return TIERS[1]}
function subPrice(p,w){return r2(p.price*(1-tier(w).pct/100))}
var FREE=39,SHIP=3.99;

/* ---------- consumables suited to a regular delivery (products.js) ---------- */
var CATS=[
  {k:'supp',n:'Supplements',d:'Joint, skin and gut support that runs out on a schedule.',hs:['msm-powder-for-dogs-cats-joint-coat-support-300g','joint-care-chews-for-dogs-chews-with-glucosamine-turmeric','skin-coat-probiotic-powder-for-dogs-cats','skin-coat-salmon-oil-infusion-for-dogs-300ml']},
  {k:'top',n:'Food toppers',d:'Bone broths and toppers for every bowl.',hs:['chicken-bone-broth-powder-for-dogs-gravy-food-topper','supernature-slurpeez-chicken-bone-broth-powder','rawzeez-complete-for-dogs']},
  {k:'dent',n:'Dental care',d:'Daily dental powders, additives and chews.',hs:['dental-water-additive-for-dogs-fights-bad-breath-plaque','natural-vetcare-daily-dental-powder-200g','plaque-crackerz-dental-bites-for-dogs-250g']},
  {k:'wash',n:'Shampoo & grooming',d:'Shampoos you reach for every few weeks.',hs:['2-in-1-dog-shampoo-conditioner-with-lavender-jojoba','oatmeal-dog-shampoo-for-sensitive-skin-500ml','aloe-kiwi-soothing-dog-shampoo']},
  {k:'flea',n:'Flea & tick',d:'Regular flea and tick care, delivered before you run out.',hs:['fiprotec-small-dog-spot-on-flea-tick-treatment','flea-free-drops-for-dogs-natural-topical-flea-tick-repellent','no-rinse-flea-tick-shampoo-for-dogs']}
];
CATS.forEach(function(c){c.ps=c.hs.map(function(h){return BY[h]}).filter(Boolean)});
var ALL=[];CATS.forEach(function(c){c.ps.forEach(function(p){p._cat=c.n;ALL.push(p)})});

/* ---------- state (per browser, optional) ---------- */
var KEY='pp-subscriptions';
var S={w:4,items:{}};
try{var saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.items){S.w=tier(saved.w).w;Object.keys(saved.items).forEach(function(h){if(BY[h]&&saved.items[h]>0)S.items[h]=Math.min(9,saved.items[h]|0)})}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- the site's product card (.pk) with a frequency selector ---------- */
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function rev(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  var n=p.reviewCount||0;
  return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function well(p){var s=p.img||p.cdn||'';return s?'<img src="'+esc(s)+'" alt="" loading="lazy" data-ss-img>':'<span class="ss-noimg" aria-hidden="true"></span>'}
var uid=0;
function freqOpts(w){return TIERS.map(function(t){return '<option value="'+t.w+'"'+(t.w===+w?' selected':'')+'>'+t.w+' weeks, '+t.pct+'% off</option>'}).join('')}
function priceHtml(p,w){
  var t=tier(w);
  return '<span class="now">'+money(subPrice(p,w))+'</span><span class="was">'+money(p.price)+'</span><span class="save">Save '+t.pct+'%</span>';
}
function pk(p,o){
  o=o||{};var id='ss-f'+(++uid),w=o.w||S.w;
  return '<article class="pk ss-pk" data-h="'+esc(p.handle)+'">'+(o.tab?'<span class="tab">'+esc(o.tab)+'</span>':'')+
    '<a class="well" href="#">'+well(p)+'</a><div class="body"><span class="brand">'+esc(p.brand)+'</span>'+
    '<a class="name" href="#">'+esc(cleanTitle(p.title))+'</a>'+rev(p)+
    '<label class="ss-fl" for="'+id+'"><span class="ss-fcap">Deliver every<span class="sr"> (frequency for '+esc(cleanTitle(p.title))+')</span></span><select class="ss-fs" id="'+id+'" data-ss-freq>'+freqOpts(w)+'</select></label>'+
    '<div class="price" aria-live="polite">'+priceHtml(p,w)+'</div>'+
    '<p class="ss-one">'+money(p.price)+' as a one-off</p>'+
    '<div class="ss-acts"><button class="btn" type="button" data-ss-sub>Subscribe</button><button class="ss-once" type="button" data-ss-once>Add to basket</button></div>'+
    '</div></article>';
}
document.addEventListener('error',function(e){
  var t=e.target;
  if(t&&t.tagName==='IMG'&&t.hasAttribute('data-ss-img')){var s=document.createElement('span');s.className='ss-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);
function setCardFreq(card,w){
  var p=BY[card.getAttribute('data-h')];if(!p)return;
  var s=$('[data-ss-freq]',card);if(s&&+s.value!==+w)s.value=w;
  $('.price',card).innerHTML=priceHtml(p,w);
}

/* ---------- the site's product rail (.railwrap > .rail.prail + .scroller) ---------- */
function rail(ps,label){
  return '<div class="railwrap ss-rw"><div class="rail prail" tabindex="0" aria-label="'+esc(label)+'">'+ps.map(function(p){return pk(p)}).join('')+'</div>'+
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

/* ---------- basket count and toast ---------- */
var toastEl,toastT;
function bump(n){var c=$$('.cnt'),v=(c.length?parseInt(c[0].textContent,10)||0:0)+n;c.forEach(function(x){x.textContent=v;x.setAttribute('data-n',v)});return v}
function toast(title,line){
  var v=parseInt(($('.cnt')||{}).textContent,10)||0;
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='ss-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML='<span><b>'+esc(title)+'</b>'+esc(line)+'</span><a href="#">View basket ('+v+')</a>';
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3600);
}
function flash(btn,txt){var o=btn.getAttribute('data-o')||btn.textContent;btn.setAttribute('data-o',o);btn.textContent=txt;clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent=o},1800)}

/* ---------- tiers table [data-ss-tiers] ---------- */
function tiersTable(){
  return '<table class="ss-t"><caption class="sr">Subscription discount by delivery frequency</caption><thead><tr><th scope="col">Delivered every</th><th scope="col">You save</th><th scope="col" class="ss-t-fit">Good for</th></tr></thead><tbody>'+
    TIERS.map(function(t){return '<tr><th scope="row">'+t.w+' weeks</th><td><b>'+t.pct+'%</b> off every delivery</td><td class="ss-t-fit">'+esc(t.fit)+'</td></tr>'}).join('')+'</tbody></table>';
}
$$('[data-ss-tiers]').forEach(function(el){el.innerHTML=tiersTable()});

/* ---------- worked example table [data-ss-example] (C) ---------- */
$$('[data-ss-example]').forEach(function(el){
  var id='ss-ex-p';
  el.innerHTML='<div class="ss-ex-top"><label for="'+id+'">Example product</label><select class="ss-fs ss-ex-sel" id="'+id+'">'+ALL.map(function(p,i){return '<option value="'+esc(p.handle)+'"'+(i===0?' selected':'')+'>'+esc(cleanTitle(p.title))+' ('+money(p.price)+')</option>'}).join('')+'</select></div><div class="ss-ex-t" aria-live="polite"></div>';
  var sel=$('select',el),out=$('.ss-ex-t',el);
  function draw(){
    var p=BY[sel.value];
    out.innerHTML='<table class="ss-t ss-t-ex"><caption class="sr">Price per delivery for '+esc(cleanTitle(p.title))+'</caption><thead><tr><th scope="col">How you buy</th><th scope="col">Discount</th><th scope="col">Price each delivery</th><th scope="col">You save a year</th></tr></thead><tbody>'+
      '<tr><th scope="row">One-off order</th><td>None</td><td>'+money(p.price)+'</td><td>None</td></tr>'+
      TIERS.map(function(t){var s=subPrice(p,t.w);return '<tr><th scope="row">Every '+t.w+' weeks</th><td>'+t.pct+'%</td><td><b>'+money(s)+'</b></td><td>'+money((p.price-s)*52/t.w)+'</td></tr>'}).join('')+'</tbody></table>'+
      '<p class="ss-small">Yearly saving assumes one item per delivery, all year.</p>';
  }
  sel.addEventListener('change',draw);draw();
});

/* ---------- savings calculator [data-ss-calc] ---------- */
$$('[data-ss-calc]').forEach(function(el,ix){
  var n='ss-c'+ix;
  el.innerHTML=
    '<form class="ss-calc-f" novalidate onsubmit="return false">'+
      '<div class="ss-cf"><label for="'+n+'-m">What do you spend a month on your dog’s regular items?</label>'+
        '<div class="ss-money"><span aria-hidden="true">£</span><input id="'+n+'-m" type="number" inputmode="decimal" min="0" max="1000" step="1" value="40" aria-describedby="'+n+'-mh"></div>'+
        '<input class="ss-range" type="range" min="5" max="200" step="1" value="40" aria-label="Monthly spend">'+
        '<span class="ss-hint" id="'+n+'-mh">Supplements, toppers, dental care, shampoo, flea and tick.</span></div>'+
      '<fieldset class="ss-cf"><legend>How often would you like it delivered?</legend><div class="ss-seg">'+
        TIERS.map(function(t){return '<label><input type="radio" name="'+n+'-w" value="'+t.w+'"'+(t.w===4?' checked':'')+'><span><b>'+t.n+'</b><i>Save '+t.pct+'%</i></span></label>'}).join('')+
      '</div></fieldset>'+
    '</form>'+
    '<div class="ss-calc-r" aria-live="polite"></div>';
  var m=$('input[type=number]',el),rg=$('.ss-range',el),out=$('.ss-calc-r',el);
  function draw(){
    var v=Math.max(0,Math.min(1000,parseFloat(m.value)||0)),w=+($('input[type=radio]:checked',el)||{value:4}).value,t=tier(w);
    var yr=v*12,save=yr*t.pct/100,sub=yr-save,per=sub*w/52,pts=Math.floor(sub)*5;
    out.innerHTML='<p class="ss-big"><span>You would save</span><b>'+money0(save)+'</b><span>a year</span></p>'+
      '<dl class="ss-dl">'+
        '<div><dt>Spend a year now</dt><dd>'+money0(yr)+'</dd></div>'+
        '<div><dt>With Subscribe &amp; Save ('+t.pct+'% off)</dt><dd>'+money0(sub)+'</dd></div>'+
        '<div><dt>Each delivery, every '+w+' weeks</dt><dd>about '+money(per)+'</dd></div>'+
        '<div><dt>Delivery charge</dt><dd>'+(per>FREE?'Free, over £39':'£3.99 each, free over £39')+'</dd></div>'+
        '<div><dt>Club points earned</dt><dd>about '+pts.toLocaleString('en-GB')+' a year</dd></div>'+
      '</dl><p class="ss-small">Savings are on product prices. Club points are 5 for every £1, on subscription orders as on any order.</p>';
  }
  m.addEventListener('input',function(){var v=parseFloat(m.value);if(!isNaN(v))rg.value=Math.max(5,Math.min(200,v));draw()});
  rg.addEventListener('input',function(){m.value=rg.value;draw()});
  $$('input[type=radio]',el).forEach(function(r){r.addEventListener('change',draw)});
  draw();
});

/* ---------- A: product grid with category tabs [data-ss-tabs] ---------- */
$$('[data-ss-tabs]').forEach(function(el){
  var tabs=[{k:'all',n:'All',ps:ALL}].concat(CATS);
  el.innerHTML='<div class="ss-tabs-w"><div class="ss-tabs" role="tablist" aria-label="Product categories">'+tabs.map(function(t,i){return '<button type="button" role="tab" id="ss-tab-'+t.k+'" aria-controls="ss-grid" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'" data-k="'+t.k+'">'+esc(t.n)+' <span>'+t.ps.length+'</span></button>'}).join('')+'</div></div>'+
    '<div class="ss-grid" id="ss-grid" role="tabpanel" aria-labelledby="ss-tab-all"></div>';
  var grid=$('.ss-grid',el),bs=$$('[role=tab]',el);
  function show(k){
    var t=tabs.filter(function(x){return x.k===k})[0]||tabs[0];
    bs.forEach(function(b){var on=b.getAttribute('data-k')===t.k;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
    grid.setAttribute('aria-labelledby','ss-tab-'+t.k);
    grid.innerHTML=t.ps.map(function(p){return pk(p,{tab:t.k==='all'?p._cat:null})}).join('');
    if(!RM){grid.classList.remove('ss-fade');void grid.offsetWidth;grid.classList.add('ss-fade')}
  }
  bs.forEach(function(b,i){
    b.addEventListener('click',function(){show(b.getAttribute('data-k'))});
    b.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();var n=bs[(i+d+bs.length)%bs.length];n.focus();n.click()});
  });
  show('all');
});

/* ---------- B and C: rails by category [data-ss-rails] ---------- */
$$('[data-ss-rails]').forEach(function(el){
  el.innerHTML=CATS.map(function(c){
    return '<section class="ss-rsec" id="ss-cat-'+c.k+'" aria-labelledby="ss-rh-'+c.k+'"><div class="sec-h"><div><h2 id="ss-rh-'+c.k+'">'+esc(c.n)+'</h2><p>'+esc(c.d)+'</p></div><div class="sec-r"><a class="all" href="#">Shop all '+esc(c.n.toLowerCase())+' ›</a></div></div>'+rail(c.ps,c.n)+'</section>';
  }).join('');
  bindRails(el);
});

/* ---------- B: sticky "Your subscription" builder [data-ss-builder] ---------- */
var BUILD=$('[data-ss-builder]');
function syncCards(){$$('.ss-pk').forEach(function(c){setCardFreq(c,S.w)})}
function renderBuilder(){
  if(!BUILD)return;
  var hs=Object.keys(S.items),t=tier(S.w),items=0,full=0;
  hs.forEach(function(h){items+=S.items[h];full+=BY[h].price*S.items[h]});
  var disc=r2(full*t.pct/100),sub=r2(full-disc),ship=hs.length?(sub>FREE?0:SHIP):0,more=r2(FREE-sub);
  $$('input[name=ss-bw]',BUILD).forEach(function(r){r.checked=+r.value===S.w});
  $('.ss-bd-n',BUILD).textContent=items?items+' item'+(items===1?'':'s'):'Empty';
  $('.ss-bd-sum',BUILD).textContent=items?money(sub+ship)+' every '+S.w+' weeks':'Save up to 15%';
  var list=$('.ss-bd-list',BUILD);
  list.innerHTML=hs.length?hs.map(function(h){var p=BY[h],q=S.items[h];return '<li><span class="ss-bd-t"><b>'+esc(cleanTitle(p.title))+'</b><span><s>'+money(p.price)+'</s> '+money(subPrice(p,S.w))+' each</span></span>'+
      '<span class="ss-q" role="group" aria-label="Quantity"><button type="button" data-q="-1" data-h="'+esc(h)+'" aria-label="One fewer">−</button><output>'+q+'</output><button type="button" data-q="1" data-h="'+esc(h)+'" aria-label="One more"'+(q>=9?' disabled':'')+'>+</button></span></li>'}).join('')
    :'<li class="ss-bd-empty">Choose <b>Subscribe</b> on any product to add it here. Everything in one subscription arrives together.</li>';
  $('.ss-bd-tot',BUILD).innerHTML=hs.length?
    '<div><dt>Items</dt><dd>'+money(full)+'</dd></div><div class="ss-bd-d"><dt>Subscribe &amp; Save '+t.pct+'%</dt><dd>−'+money(disc)+'</dd></div><div><dt>Delivery</dt><dd>'+(ship?money(ship):'Free')+'</dd></div><div class="ss-bd-g"><dt>Each delivery</dt><dd>'+money(sub+ship)+'</dd></div>':'';
  $('.ss-bd-note',BUILD).innerHTML=hs.length?(ship?'Add '+money(more)+' more for free UK delivery. ':'')+'You save <b>'+money0(disc*52/S.w)+'</b> a year at this frequency.':'';
  $('.ss-bd-go',BUILD).disabled=!hs.length;
  save();
}
if(BUILD){
  document.body.classList.add('ss-has-bd');
  BUILD.innerHTML=
    '<button class="ss-bd-bar" type="button" aria-expanded="false" aria-controls="ss-bd-p"><span><b>Your subscription</b><span class="ss-bd-n"></span></span><span class="ss-bd-sum"></span><i aria-hidden="true"></i></button>'+
    '<div class="ss-bd-p" id="ss-bd-p"><h2 class="ss-bd-h">Your subscription</h2>'+
    '<fieldset class="ss-bd-w"><legend>Deliver everything</legend>'+TIERS.map(function(t){return '<label><input type="radio" name="ss-bw" value="'+t.w+'"><span><b>'+t.n+'</b><i>Save '+t.pct+'%</i></span></label>'}).join('')+'</fieldset>'+
    '<ul class="ss-bd-list"></ul><dl class="ss-bd-tot"></dl><p class="ss-bd-note" aria-live="polite"></p>'+
    '<button class="btn wide ss-bd-go" type="button">Continue to checkout</button>'+
    '<p class="ss-small">Skip, pause, change or cancel any time before your next billing date.</p></div>';
  $$('input[name=ss-bw]',BUILD).forEach(function(r){r.addEventListener('change',function(){S.w=+r.value;syncCards();renderBuilder()})});
  BUILD.addEventListener('click',function(e){
    var q=e.target.closest('[data-q]');
    if(q){var h=q.getAttribute('data-h');S.items[h]=Math.max(0,Math.min(9,(S.items[h]||0)+(+q.getAttribute('data-q'))));if(!S.items[h])delete S.items[h];renderBuilder();var f=$('[data-q="'+q.getAttribute('data-q')+'"][data-h="'+h+'"]',BUILD);if(f)f.focus()}
  });
  var bar=$('.ss-bd-bar',BUILD);
  bar.addEventListener('click',function(){var o=BUILD.classList.toggle('open');bar.setAttribute('aria-expanded',o)});
  renderBuilder();
}

/* ---------- card events ---------- */
document.addEventListener('change',function(e){
  var s=e.target.closest&&e.target.closest('[data-ss-freq]');if(!s)return;
  var card=s.closest('.ss-pk'),w=+s.value;
  if(BUILD){S.w=w;syncCards();renderBuilder()}else setCardFreq(card,w);
});
document.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;
  var sb=t.closest('[data-ss-sub]'),on=t.closest('[data-ss-once]');
  if(sb||on){
    var card=(sb||on).closest('.ss-pk'),p=BY[card.getAttribute('data-h')],w=+$('[data-ss-freq]',card).value;
    bump(1);
    if(sb){
      if(BUILD){S.items[p.handle]=Math.min(9,(S.items[p.handle]||0)+1);renderBuilder();flash(sb,'Added');if(window.innerWidth<1024&&!BUILD.classList.contains('open'))BUILD.classList.add('pulse'),setTimeout(function(){BUILD.classList.remove('pulse')},700)}
      else flash(sb,'Added');
      toast('Subscription added',cleanTitle(p.title)+', every '+w+' weeks, '+money(subPrice(p,w))+' each delivery');
    }else{flash(on,'Added');toast('Added to basket',cleanTitle(p.title)+', one-off, '+money(p.price))}
    return;
  }
  var a=t.closest('a[href="#"]');
  if(a&&a.closest('[data-ss]'))e.preventDefault();
});

})();
