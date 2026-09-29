/* Our mission: shared behaviour for versions A, B and C.
   Mission copy: the previous our-mission pages (live GemPages /pages/our-mission, read only).
   Products: new-pages/products.js snapshot, written into the HTML as the homepage .pk card.
   This script adds four small things: a gentle fade-up on scroll, the homepage rail scroller,
   the homepage Q&A accordion (version B) and the basket count on "Add to basket".
   All content is in the HTML, so nothing is lost if the script does not run. */
(function(){
  var root=document.querySelector('.om');if(!root)return;
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var reduce=!!(mq&&mq.matches);
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};

  /* ---- fade-up on scroll: only with IntersectionObserver and motion allowed ---- */
  if(!reduce&&'IntersectionObserver' in window){
    var els=$$('[data-rv]',root);
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    root.classList.add('om-js');
    els.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<window.innerHeight)el.classList.add('in');else io.observe(el);
    });
  }

  /* ---- product rails: the homepage scroller ---- */
  var sizers=[];
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
  window.addEventListener('resize',function(){sizers.forEach(function(f){f()})});

  /* ---- Q&A accordion (homepage .ed3 .qa): one open at a time ---- */
  $$('.qa',root).forEach(function(qa){
    var qs=$$('.q',qa);
    qs.forEach(function(q){q.addEventListener('click',function(){
      var open=!q.classList.contains('on');
      qs.forEach(function(o){o.classList.remove('on');o.setAttribute('aria-expanded','false');if(o.nextElementSibling)o.nextElementSibling.classList.remove('on')});
      if(open){q.classList.add('on');q.setAttribute('aria-expanded','true');if(q.nextElementSibling)q.nextElementSibling.classList.add('on')}
    })});
  });

  /* ---- add to basket: header count and a small toast ---- */
  var toast,tt;
  root.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('button[data-add]'):null;if(!b)return;
    var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+1;
    cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
    var card=b.closest('.pk'),nm=card?$('.name',card):null;
    if(!toast){toast=document.createElement('div');toast.className='om-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast)}
    toast.innerHTML='<span><b>Added to basket</b></span><a href="#">View basket ('+n+')</a>';
    if(nm){var s=document.createElement('span');s.textContent=nm.textContent;toast.firstChild.appendChild(s)}
    toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},3200);
    var o=b.getAttribute('data-o')||b.textContent;b.setAttribute('data-o',o);b.textContent='Added';
    clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=o},1600);
  });
})();
