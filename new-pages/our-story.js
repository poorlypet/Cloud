/* Our story: shared behaviour for versions A, B and C.
   Sources (read only, 28 Sep 2026): live GemPages /pages/our-story (published 23 Jul 2026),
   /pages/our-mission and /pages/why-poorly-pet; figures from the signed-off saved pages
   (73 brands, 4.6 from 101 Judge.me reviews, free UK delivery over £39).
   All content is in the HTML. This script only adds motion and interaction, and it
   switches on the animated states by adding .os-js to <html> at the very end, so a
   script error leaves everything visible. */
(function(){
  var root=document.querySelector('.os');if(!root)return;
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var reduce=!!(mq&&mq.matches);
  var hasIO='IntersectionObserver' in window;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var wideQ=window.matchMedia?matchMedia('(min-width:900px)'):null;
  var isWide=function(){return !!(wideQ&&wideQ.matches)};
  var go=function(y){window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})};

  /* keep pinned things clear of the sticky mobile search bar */
  function stkH(){
    var m=$('#msearch');
    if(m){var cs=getComputedStyle(m);if(cs.display!=='none'&&cs.position==='sticky')return m.offsetHeight}
    return 0;
  }
  function stk(){root.style.setProperty('--stk',stkH()+'px')}
  stk();

  /* ---- in-page jumps ---- */
  $$('a[data-jump]',root).forEach(function(a){
    a.addEventListener('click',function(e){
      var t=$(a.getAttribute('href'));if(!t)return;
      e.preventDefault();go(t.getBoundingClientRect().top+window.pageYOffset-stkH());
    });
  });

  /* ---- count up ---- */
  function countUp(el){
    if(el.dataset.done)return;el.dataset.done='1';
    var end=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),pre=el.dataset.pre||'';
    if(reduce){el.textContent=pre+end.toFixed(dec);return}
    var t0=null,dur=1400;
    function step(t){
      if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);
      el.textContent=pre+(end*e).toFixed(dec);
      if(k<1)requestAnimationFrame(step);
    }
    el.textContent=pre+(0).toFixed(dec);requestAnimationFrame(step);
  }

  /* ---- reveal on scroll + counters + chapter reveals ---- */
  var rv=$$('[data-rv],[data-ch]',root);
  if(hasIO){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');
        $$('[data-count]',e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    },{rootMargin:'0px 0px -12% 0px',threshold:.01});
    rv.forEach(function(el){io.observe(el)});
  }else{rv.forEach(function(el){el.classList.add('in')})}

  var scrollers=[],sizers=[];
  var ticking=false;
  function run(){scrollers.forEach(function(f){f()})}
  function req(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;run()})}
  function resize(){stk();sizers.forEach(function(f){f()});run()}

  /* ---- A: horizontal timeline driven by vertical scroll ---- */
  var tl=$('[data-htl]',root);
  if(tl){
    var track=$('.osa-track',tl),cards=$$('.osa-card',tl),yb=$$('.osa-years button',tl),dist=0;
    function setYear(k){yb.forEach(function(b,i){b.classList.toggle('on',i===k);b.classList.toggle('done',i<k);if(i===k)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')})}
    function pinned(){return tl.classList.contains('pin')}
    function size(){
      var want=isWide()&&!reduce;
      tl.classList.toggle('pin',want);
      track.style.transform='';
      if(want){
        dist=Math.max(0,track.scrollWidth-document.documentElement.clientWidth);
        tl.style.height=(window.innerHeight-stkH()+dist)+'px';
      }else{tl.style.height=''}
    }
    function curFromTrack(){
      /* the card whose left edge has passed the middle of the screen */
      var mid=document.documentElement.clientWidth*.5,k=0;
      cards.forEach(function(c,i){if(i<yb.length&&c.getBoundingClientRect().left<mid)k=i});
      return k;
    }
    scrollers.push(function(){
      if(!pinned())return;
      var r=tl.getBoundingClientRect(),p=clamp((stkH()-r.top)/Math.max(1,dist),0,1);
      track.style.transform='translate3d('+(-p*dist)+'px,0,0)';
      setYear(curFromTrack());
    });
    track.addEventListener('scroll',function(){if(!pinned())setYear(curFromTrack())},{passive:true});
    yb.forEach(function(b,i){b.addEventListener('click',function(){
      var c=cards[i];
      if(pinned()){
        var off=c.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft);
        go(tl.getBoundingClientRect().top+window.pageYOffset-stkH()+clamp(off,0,dist));
      }else{
        track.scrollTo({left:c.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft),behavior:reduce?'auto':'smooth'});
      }
    })});
    sizers.push(size);size();setYear(0);
  }

  /* ---- B: drag to compare ---- */
  var cmp=$('[data-cmp]',root);
  if(cmp){
    var rg=$('.osb-range',cmp);
    cmp.classList.add('live');
    function setX(v){cmp.style.setProperty('--x',v+'%')}
    rg.addEventListener('input',function(){setX(rg.value)});
    setX(rg.value);
    /* a gentle nudge the first time it is seen, so it reads as draggable */
    if(!reduce&&hasIO){
      var nio=new IntersectionObserver(function(es){es.forEach(function(e){
        if(!e.isIntersecting)return;nio.disconnect();
        var t0=null;
        (function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1600);var v=50+Math.sin(k*Math.PI*2)*14*(1-k);if(document.activeElement!==rg){rg.value=Math.round(v);setX(v)}if(k<1)requestAnimationFrame(step)})(performance.now());
      })},{threshold:.6});
      nio.observe(cmp);
    }
  }

  /* ---- C: pinned photo stack, one print dealt per chapter ---- */
  var alb=$('[data-album]',root);
  if(alb&&!reduce){
    var chs=$$('.osc-ch',alb),nb=$$('.osc-nav button',alb),n=chs.length,curC=-1;
    alb.classList.add('pin');alb.style.setProperty('--n',n);
    function setC(k,f){
      if(k!==curC){
        curC=k;
        chs.forEach(function(c,i){c.classList.toggle('dealt',i<=k);c.classList.toggle('cur',i===k);c.setAttribute('aria-hidden',i===k?'false':'true')});
        nb.forEach(function(b,i){b.classList.toggle('on',i===k);if(i===k)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
      }
      nb.forEach(function(b,i){b.style.setProperty('--f',i<k?1:i===k?f:0)});
    }
    function span(){return alb.offsetHeight-(window.innerHeight-stkH())}
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

  /* ---- C: values rail with arrows ---- */
  var rail=$('[data-rail]',root);
  if(rail){
    var ab=$$('.osc-arrows button',root);
    function upd(){
      var max=rail.scrollWidth-rail.clientWidth-2;
      if(ab[0])ab[0].disabled=rail.scrollLeft<=2;
      if(ab[1])ab[1].disabled=rail.scrollLeft>=max;
    }
    ab.forEach(function(b){b.addEventListener('click',function(){
      var li=rail.querySelector('li');var step=li?li.getBoundingClientRect().width+16:300;
      rail.scrollBy({left:step*+b.dataset.dir,behavior:reduce?'auto':'smooth'});
    })});
    rail.addEventListener('scroll',upd,{passive:true});sizers.push(upd);upd();
  }

  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('resize',resize);
  run();

  /* switch on the animated states last */
  document.documentElement.classList.add('os-js');
  resize();
})();
