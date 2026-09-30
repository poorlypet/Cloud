/* ==========================================================================
   Poorly Pet Subscribe & Save: behaviour shared by subscriptions-a/b/c.html.
   The product cards are static homepage .pk markup in each page; this file only
   runs the rail scrollers, the FAQ accordion, "Add to basket" and the
   small savings calculator (version C).

   FACTS (read only, 28 Sep 2026)
   [SUB]    Live GemPages page /pages/subscription: every 8 weeks 5%, every 4 weeks 10%,
            every 2 weeks 15%; skip, pause, change schedule, cancel any time; reminder
            email before each order.
   [SUBPOL] Shopify SUBSCRIPTION_POLICY / TERMS 10: change, pause or cancel any time
            before the next billing date, in your account or by contacting us.
   [SHIP]   Shipping policy: UK delivery £3.99, free over £39.
   [CLUB]   Club: 5 points for every £1, on every order.
   Products: the 16 consumables from new-pages/products.js (one-off prices);
   the card line "Save 10% on subscription" is price less 10% (every 4 weeks).
   ========================================================================== */
(function(){
'use strict';
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function $(s,el){return (el||document).querySelector(s)}
function $$(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))}
/* ---------- the one site product card: static .pk markup re-rendered through PPCard (card.js).
   The subscription price becomes the card's info line (an offer line takes precedence, as everywhere). ---------- */
if(window.PPCard)PPCard.upgrade(document,{helps:function(c,p){
  var x=c.querySelector('.ss-subp'),t=x?x.textContent:'',m=t.match(/(\d+)%[^£]*(£[\d.]+)/);
  return m?'Subscribe for '+m[2]+', save '+m[1]+'%':(c.querySelector('.helps')||{}).textContent||'';
}});


/* ---------- rails: homepage scroller (arrows + track), hidden when all cards fit ---------- */
var ups=[];
$$('.ss-rw').forEach(function(w){
  var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),tr=$('.track',w),th=$('.track i',w);
  if(!r||!pv||!nx||!tr||!th)return;
  function up(){
    var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
    w.classList.toggle('ss-fit',max<=2);
    th.style.width=Math.min(100,vis*100)+'%';
    th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
    pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
  }
  function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:RM?'auto':'smooth'})}
  pv.addEventListener('click',function(){by(-1)});
  nx.addEventListener('click',function(){by(1)});
  tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:RM?'auto':'smooth'})});
  r.addEventListener('scroll',up,{passive:true});
  ups.push(up);up();
});
window.addEventListener('resize',function(){ups.forEach(function(f){f()})});
window.addEventListener('load',function(){ups.forEach(function(f){f()})});

/* ---------- FAQ accordion (as the homepage "Ask us about" panel) ---------- */
$$('.ss-faq .q').forEach(function(q){
  q.addEventListener('click',function(){
    var a=q.nextElementSibling,open=q.getAttribute('aria-expanded')==='true';
    q.setAttribute('aria-expanded',String(!open));q.classList.toggle('on',!open);
    if(a)a.classList.toggle('on',!open);
  });
});

/* ---------- Add to basket: header count and a short confirmation on the button ---------- */
document.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;
  var b=t.closest('.pk [data-add]');
  if(b){
    $$('.cnt').forEach(function(c){var v=(parseInt(c.textContent,10)||0)+1;c.textContent=v;c.setAttribute('data-n',v)});
    if(!b._o)b._o=b.textContent;
    b.textContent='Added';b.classList.add('ss-added');
    clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=b._o;b.classList.remove('ss-added')},1800);
    return;
  }
  var a=t.closest('a[href="#"]');
  if(a&&a.closest('main'))e.preventDefault();
});

/* ---------- compact savings calculator [data-ss-calc] ---------- */
var TIERS={8:5,4:10,2:15};
$$('[data-ss-calc]').forEach(function(el){
  var m=$('input[type=number]',el),out=$('.ss-res',el);
  if(!m||!out)return;
  function money(n){var v=Math.round(n);return '£'+String(v).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
  function draw(){
    var v=Math.max(0,Math.min(1000,parseFloat(m.value)||0));
    var r=$('input[type=radio]:checked',el),w=r?+r.value:4,pct=TIERS[w]||10;
    var yr=v*12,save=yr*pct/100,per=(yr-save)*w/52;
    out.innerHTML='<b>'+money(save)+'</b><span>saved a year at '+pct+'% off, every '+w+' weeks.</span>'+
      '<small>About £'+per.toFixed(2)+' per delivery. '+(per>39?'Delivery is free over £39.':'Delivery £3.99, free over £39.')+' Club points on every order.</small>';
  }
  m.addEventListener('input',draw);
  $$('input[type=radio]',el).forEach(function(r){r.addEventListener('change',draw)});
  draw();
});
})();
