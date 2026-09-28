/* Our mission: shared behaviour for versions A, B and C.
   Sources (read only, 28 Sep 2026): live GemPages /pages/our-mission (published 30 Jun 2026),
   /pages/why-poorly-pet and /pages/our-story; figures from the signed-off saved pages
   (73 brands, 4.6 from 101 Judge.me reviews, free UK delivery over £39).
   All content is in the HTML. This script only adds motion and interaction, and it
   switches on the animated states by adding .om-js to <html> at the very end, so a
   script error leaves everything visible. */
(function(){
  var root=document.querySelector('.om');if(!root)return;
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var reduce=!!(mq&&mq.matches);
  var hasIO='IntersectionObserver' in window;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  /* keep pinned things clear of the sticky mobile search bar */
  function stk(){
    var m=$('#msearch'),h=0;
    if(m){var cs=getComputedStyle(m);if(cs.display!=='none'&&cs.position==='sticky')h=m.offsetHeight}
    root.style.setProperty('--stk',h+'px');
  }
  stk();window.addEventListener('resize',stk);

  /* ---- split words ---- */
  $$('[data-words]',root).forEach(function(el){
    var i=0;
    (function walk(n){
      [].slice.call(n.childNodes).forEach(function(c){
        if(c.nodeType===3){
          var f=document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function(p){
            if(!p)return;
            if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return}
            var s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=p;f.appendChild(s);
          });
          n.replaceChild(f,c);
        }else if(c.nodeType===1)walk(c);
      });
    })(el);
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

  /* ---- reveal on scroll + counters ---- */
  var rv=$$('[data-rv]',root);
  if(hasIO){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');
        $$('[data-count]',e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    },{rootMargin:'0px 0px -10% 0px',threshold:.01});
    rv.forEach(function(el){io.observe(el)});
  }else{rv.forEach(function(el){el.classList.add('in')})}

  /* one rAF-throttled scroll loop for the scroll-linked pieces */
  var scrollers=[];
  function onScroll(){scrollers.forEach(function(f){f()})}
  var ticking=false;
  function req(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;onScroll()})}

  /* ---- B: statement lights up word by word as you scroll ---- */
  var scrub=$('[data-scrub]',root);
  if(scrub){
    if(reduce){scrub.classList.remove('scrub')}
    else{
      var words=$$('[data-words="scrub"] .w',scrub),bar=$('.omb-bar',scrub);
      scrollers.push(function(){
        var r=scrub.getBoundingClientRect(),vh=window.innerHeight,span=Math.max(1,r.height-vh);
        var p=clamp(-r.top/span,0,1),n=words.length;
        words.forEach(function(w,i){w.style.setProperty("--k",clamp((p*.9+.4)*n-i,0,1))});
        if(bar)bar.style.setProperty('--p',p);
      });
    }
  }

  /* ---- A: pillar columns that expand ---- */
  var pil=$('[data-pil]',root);
  if(pil){
    var ps=$$('.oma-p',pil);
    function openP(k){
      ps.forEach(function(p,i){p.classList.toggle('on',i===k);$('.oma-pb',p).setAttribute('aria-expanded',i===k?'true':'false')});
    }
    var wide=window.matchMedia?matchMedia('(min-width:900px) and (hover:hover)'):null;
    ps.forEach(function(p,i){
      var b=$('.oma-pb',p);
      b.addEventListener('click',function(){
        var isOn=p.classList.contains('on');
        if(isOn&&!(wide&&wide.matches)){p.classList.remove('on');b.setAttribute('aria-expanded','false')}else openP(i);
      });
      p.addEventListener('mouseenter',function(){if(wide&&wide.matches)openP(i)});
    });
  }

  /* ---- A: steps light up while scrolling, line fills ---- */
  var st=$('[data-steps]',root);
  if(st){
    var items=$$('.oma-st',st),fill=$('.oma-fill',st),ctr=$('[data-ctr]',st),box=$('.oma-steps',st);
    if(reduce){items.forEach(function(x){x.classList.add('lit')});if(fill)fill.style.height='calc(100% - 20px)'}
    else scrollers.push(function(){
      var vh=window.innerHeight,line=vh*.55,last=-1;
      items.forEach(function(x,i){var t=x.getBoundingClientRect().top+30;var on=t<line;x.classList.toggle('lit',on);if(on)last=i});
      var br=box.getBoundingClientRect();
      if(fill)fill.style.height=clamp(line-br.top-10,0,br.height-20)+'px';
      if(ctr)ctr.textContent=Math.max(1,last+1);
    });
  }

  /* ---- B: accordion, one open at a time ---- */
  var acc=$('[data-acc]',root);
  if(acc){
    var its=$$('details',acc);
    its.forEach(function(d){
      d.addEventListener('toggle',function(){
        if(!d.open)return;
        its.forEach(function(o){if(o!==d)o.open=false});
        if(!reduce){var b=$('.omb-body',d);b.style.animation='none';b.offsetHeight;b.style.animation='ombIn .5s var(--ease) both'}
      });
    });
  }

  /* ---- B: step sequence that moves on by itself while in view ---- */
  var sp=$('[data-stepper]',root);
  if(sp){
    var tabs=$$('[role="tab"]',sp),pans=$$('[role="tabpanel"]',sp),play=$('[data-play]',sp);
    var cur=0,auto=!reduce,seen=false,t0=0,DUR=6000,raf=0;
    function show(k,focus){
      cur=(k+tabs.length)%tabs.length;
      tabs.forEach(function(t,i){
        t.setAttribute('aria-selected',i===cur?'true':'false');t.tabIndex=i===cur?0:-1;
        t.classList.toggle('done',i<cur);t.style.setProperty('--t',0);
      });
      pans.forEach(function(p,i){
        p.hidden=i!==cur;
        if(i===cur&&!reduce){p.classList.remove('in-anim');p.offsetHeight;p.classList.add('in-anim')}
      });
      if(focus)tabs[cur].focus();
      t0=performance.now();
    }
    function stopAuto(){auto=false;if(play){play.textContent='Play';play.setAttribute('aria-pressed','true')}tabs.forEach(function(t){t.style.setProperty('--t',0)})}
    function tick(now){
      raf=requestAnimationFrame(tick);
      if(!auto||!seen)return;
      var k=(now-t0)/DUR;
      if(k>=1){show(cur+1)}else tabs[cur].style.setProperty('--t',k);
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){stopAuto();show(i)});
      t.addEventListener('keydown',function(e){
        var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
        if(e.key==='Home'){e.preventDefault();stopAuto();show(0,true)}
        else if(e.key==='End'){e.preventDefault();stopAuto();show(tabs.length-1,true)}
        else if(k){e.preventDefault();stopAuto();show(cur+k,true)}
      });
    });
    if(play){
      if(reduce){play.parentNode.style.display='none'}
      play.addEventListener('click',function(){
        if(auto){stopAuto()}else{auto=true;play.textContent='Pause';play.setAttribute('aria-pressed','false');t0=performance.now()}
      });
    }
    sp.addEventListener('focusin',function(e){if(e.target!==play&&auto){stopAuto()}});
    show(0);
    if(hasIO){new IntersectionObserver(function(es){es.forEach(function(e){seen=e.isIntersecting;if(seen)t0=performance.now()-(parseFloat(tabs[cur].style.getPropertyValue('--t'))||0)*DUR})},{threshold:.35}).observe(sp)}
    else seen=true;
    if(!reduce)raf=requestAnimationFrame(tick);
  }

  /* ---- C: value tiles that open ---- */
  var tiles=$('[data-tiles]',root);
  if(tiles){
    var ts=$$('.omc-tile',tiles);
    ts.forEach(function(t,i){
      var b=$('.omc-tb',t);
      b.addEventListener('click',function(){
        var on=!t.classList.contains('on');
        ts.forEach(function(o){o.classList.remove('on');$('.omc-tb',o).setAttribute('aria-expanded','false')});
        if(on){t.classList.add('on');b.setAttribute('aria-expanded','true')}
      });
    });
  }

  /* ---- C: checklist ticks through in order when it comes into view ---- */
  var ck=$('[data-check]',root);
  if(ck&&!reduce){
    var lis=$$('.omc-list li',ck),meter=$('.omc-meter',ck),timers=[];
    function reset(){timers.forEach(clearTimeout);timers=[];lis.forEach(function(l){l.classList.remove('ok')});ck.classList.remove('done');if(meter)meter.style.setProperty('--n',0)}
    function run(){
      reset();
      lis.forEach(function(l,i){timers.push(setTimeout(function(){l.classList.add('ok');if(meter)meter.style.setProperty('--n',i+1)},500+i*650))});
      timers.push(setTimeout(function(){ck.classList.add('done')},500+lis.length*650));
    }
    ck.classList.add('run');reset();
    var rp=$('[data-replay]',ck);if(rp)rp.addEventListener('click',run);
    if(hasIO){var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run();cio.disconnect()}})},{threshold:.25});cio.observe(ck)}
    else run();
  }
  if(ck&&reduce){var r2=$('[data-replay]',ck);if(r2)r2.style.display='none'}

  if(scrollers.length){window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);onScroll()}

  /* switch on the animated states last */
  document.documentElement.classList.add('om-js');
})();
