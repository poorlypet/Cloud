/* Why Poorly Pet: shared behaviour for versions A, B and C.
   All content is in the HTML. This script only adds motion and interaction,
   and it switches on the animated states by adding .wp-js to <html>. */
(function(){
  var root=document.querySelector('.wp');if(!root)return;
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var reduce=!!(mq&&mq.matches);
  var hasIO='IntersectionObserver' in window;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};

  /* ---- in-page jumps ---- */
  $$('a[data-jump]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=$(a.getAttribute('href'));if(!t)return;
      e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
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

  /* ---- split words (the quote, and the C hero headline) ---- */
  $$('[data-words]').forEach(function(el){
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

  /* ---- reveal on scroll + counters ---- */
  var rv=$$('[data-rv]',root),cn=$$('[data-count]',root);
  if(hasIO){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');
        $$('[data-count]',e.target).forEach(countUp);
        if(e.target.hasAttribute('data-count'))countUp(e.target);
        io.unobserve(e.target);
      });
    },{rootMargin:'0px 0px -12% 0px',threshold:.01});
    rv.forEach(function(el){io.observe(el)});
    cn.forEach(function(el){if(!el.closest('[data-rv]'))io.observe(el)});
  }else{
    rv.forEach(function(el){el.classList.add('in')});
  }

  /* ---- story: sticky photo that follows the chapters ---- */
  var story=$('.wps');
  if(story){
    var chs=$$('.wps-ch',story),phs=$$('.wps-stack .wp-ph',story),bars=$$('.wps-prog button',story),badge=$('.wps-badge',story),cur=-1;
    function setCh(i){
      if(i===cur||i<0)return;cur=i;
      phs.forEach(function(p,k){p.classList.toggle('on',k===i)});
      bars.forEach(function(b,k){b.classList.toggle('on',k===i);b.classList.toggle('done',k<i);if(k===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
      if(badge){
        var y=chs[i].getAttribute('data-year');
        if(reduce){badge.textContent=y}else{badge.classList.add('sw');setTimeout(function(){badge.textContent=y;badge.classList.remove('sw')},180)}
      }
    }
    bars.forEach(function(b,k){b.addEventListener('click',function(){
      chs[k].scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
    })});
    setCh(0);
    if(hasIO){
      var cio=new IntersectionObserver(function(es){
        es.forEach(function(e){if(e.isIntersecting)setCh(chs.indexOf(e.target))});
      },{rootMargin:'-45% 0px -45% 0px'});
      chs.forEach(function(c){cio.observe(c)});
    }
  }

  /* ---- C hero: the panoramic strip drifts sideways as you scroll ---- */
  var strip=$('.whc-strip'),row=strip&&$('.whc-row',strip);
  if(row&&!reduce){
    var tick=0;
    function drift(){
      tick=0;
      var r=strip.getBoundingClientRect(),vh=window.innerHeight;
      if(r.bottom<0||r.top>vh)return;
      var k=(vh-r.top)/(vh+r.height);            /* 0 as it enters, 1 as it leaves */
      row.style.setProperty('--px',(k*-0.12*window.innerWidth).toFixed(1));
    }
    window.addEventListener('scroll',function(){if(!tick)tick=requestAnimationFrame(drift)},{passive:true});
    window.addEventListener('resize',drift);
    drift();
  }

  /* switch on the animated states last, so a script error leaves everything visible */
  document.documentElement.classList.add('wp-js');
})();
