/* Our story: shared behaviour for versions A, B and C.
   Story text: live GemPages /pages/our-story (read only). Products: new-pages/products.js
   snapshot (PP_TAGS.ivdd), written into the HTML as the homepage .pk card.
   This script adds three things only: the pinned chapter sequence, the product rail
   scroller (same behaviour as the homepage), and the basket count on "Add to basket".
   All content is in the HTML, so nothing is lost if the script does not run. */
(function(){
  var root=document.querySelector('.os');if(!root)return;
  /* static .pk markup (the no-JS fallback) is re-rendered through the one site card, PPCard (card.js) */
  if(window.PPCard)PPCard.upgrade(root);
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var reduce=!!(mq&&mq.matches);
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var go=function(y){window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})};

  /* keep the pinned stage clear of the sticky mobile search bar */
  function stkH(){
    var m=$('#msearch');
    if(m){var cs=getComputedStyle(m);if(cs.display!=='none'&&cs.position==='sticky')return m.offsetHeight}
    return 0;
  }
  function stk(){root.style.setProperty('--stk',stkH()+'px')}
  stk();

  var scrollers=[],sizers=[],ticking=false;
  function run(){scrollers.forEach(function(f){f()})}
  function req(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;run()})}

  /* ---- the chapter sequence: pinned, one photo card per chapter, progress along the bottom ---- */
  var alb=$('[data-album]',root);
  if(alb&&!reduce){
    var chs=$$('.os-ch',alb),nb=$$('.os-nav button',alb),n=chs.length,cur=-1;
    alb.classList.add('pin');alb.style.setProperty('--n',n);
    var setC=function(k,f){
      if(k!==cur){
        cur=k;
        chs.forEach(function(c,i){c.classList.toggle('dealt',i<=k);c.classList.toggle('cur',i===k);c.setAttribute('aria-hidden',i===k?'false':'true')});
        nb.forEach(function(b,i){b.classList.toggle('on',i===k);if(i===k)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
      }
      nb.forEach(function(b,i){b.style.setProperty('--f',i<k?1:i===k?f:0)});
    };
    var span=function(){return alb.offsetHeight-(window.innerHeight-stkH())};
    scrollers.push(function(){
      var r=alb.getBoundingClientRect(),p=clamp((stkH()-r.top)/Math.max(1,span()),0,.9999);
      var x=p*n,k=Math.floor(x);
      setC(k,x-k);
    });
    nb.forEach(function(b,i){b.addEventListener('click',function(){
      go(alb.getBoundingClientRect().top+window.pageYOffset-stkH()+span()*(i+.35)/n);
    })});
    setC(0,0);
  }

  /* ---- product rails: the homepage scroller ---- */
  $$('.railwrap',root).forEach(function(w){
    var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    if(!r||!pv||!nx||!th)return;
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('fit',max<=2);
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
    }
    function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:reduce?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:reduce?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});
    sizers.push(up);up();
  });

  /* ---- add to basket: header count and a small toast ---- */
  var toast,tt;
  root.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('button[data-add]'):null;if(!b)return;
    var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+1;
    cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
    var card=b.closest('.pk'),nm=card?$('.name',card):null;
    if(!toast){toast=document.createElement('div');toast.className='os-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast)}
    toast.innerHTML='<span><b>Added to basket</b></span><a href="#">View basket ('+n+')</a>';
    if(nm){var s=document.createElement('span');s.textContent=nm.textContent;toast.firstChild.appendChild(s)}
    toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},3200);
    var o=b.getAttribute('data-o')||b.textContent;b.setAttribute('data-o',o);b.textContent='Added';
    clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=o},1600);
  });

  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('resize',function(){stk();sizers.forEach(function(f){f()});run()});
  run();
})();
