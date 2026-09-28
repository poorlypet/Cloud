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

  /* ---- split words for the A quote ---- */
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

  /* ================= A: sticky photo that follows the chapters ================= */
  var story=$('.wpa-story');
  if(story){
    var chs=$$('.wpa-ch',story),phs=$$('.wpa-stack .wp-ph',story),bars=$$('.wpa-prog button',story),badge=$('.wpa-badge',story),cur=-1;
    function setCh(i){
      if(i===cur)return;cur=i;
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

  /* ================= B: story carousel ================= */
  var car=$('.wpb-car');
  if(car){
    var track=$('.wpb-track',car),cards=$$('.wpb-card',car),dots=$$('.wpb-dots button',car),
        prev=$('.wpb-prev',car),next=$('.wpb-next',car),count=$('.wpb-count',car),at=-1;
    function mark(i){
      if(i===at)return;at=i;
      cards.forEach(function(c,k){c.classList.toggle('on',k===i);c.setAttribute('aria-hidden',k===i?'false':'true')});
      dots.forEach(function(d,k){d.classList.toggle('on',k===i);d.setAttribute('aria-current',k===i?'true':'false')});
      prev.disabled=i===0;next.disabled=i===cards.length-1;
      if(count)count.textContent='Chapter '+(i+1)+' of '+cards.length;
    }
    function go(i){
      i=Math.max(0,Math.min(cards.length-1,i));
      track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:reduce?'auto':'smooth'});
      mark(i);
    }
    function nearest(){
      var x=track.scrollLeft,b=0,bd=1e9;
      cards.forEach(function(c,k){var d=Math.abs(c.offsetLeft-cards[0].offsetLeft-x);if(d<bd){bd=d;b=k}});
      return b;
    }
    var raf=0;
    track.addEventListener('scroll',function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;mark(nearest())})},{passive:true});
    prev.addEventListener('click',function(){go(at-1)});
    next.addEventListener('click',function(){go(at+1)});
    dots.forEach(function(d,k){d.addEventListener('click',function(){go(k)})});
    track.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();go(at+1)}
      else if(e.key==='ArrowLeft'){e.preventDefault();go(at-1)}
      else if(e.key==='Home'){e.preventDefault();go(0)}
      else if(e.key==='End'){e.preventDefault();go(cards.length-1)}
    });
    mark(0);
  }
  $$('.wpb-fc').forEach(function(b){
    b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true')});
  });

  /* ================= C: draggable timeline ================= */
  var stage=$('.wpc-stage');
  if(stage){
    var range=$('.wpc-range',stage),ps=$$('.wpc-p',stage),stops=$$('.wpc-stops button',stage),
        lbl=$('.wpc-lbl b',stage),seg=100,max=(ps.length-1)*seg,idx=-1,anim=0;
    range.max=max;
    var tints=['#EAF0E6','#F2F4F3','#E4EED6','#F3F6F1','#E4EED6'];
    function show(i){
      if(i===idx)return;idx=i;
      ps.forEach(function(p,k){p.classList.toggle('on',k===i);p.setAttribute('aria-hidden',k===i?'false':'true')});
      stops.forEach(function(s,k){s.classList.toggle('on',k===i);s.setAttribute('aria-pressed',k===i?'true':'false')});
      stage.style.backgroundColor=tints[i%tints.length];
      var h=ps[i].querySelector('h2');
      range.setAttribute('aria-valuetext',ps[i].getAttribute('data-year')+': '+(h?h.textContent:''));
      if(lbl)lbl.textContent=ps[i].getAttribute('data-year');
    }
    function paint(){range.style.setProperty('--p',(range.value/max*100)+'%')}
    function tween(to){
      cancelAnimationFrame(anim);
      var from=+range.value;if(reduce||from===to){range.value=to;paint();show(Math.round(to/seg));return}
      var t0=null;
      (function st(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/350),e=1-Math.pow(1-k,3);
        range.value=from+(to-from)*e;paint();if(k<1)anim=requestAnimationFrame(st)})(performance.now());
      show(Math.round(to/seg));
    }
    function woke(){range.classList.remove('hint')}
    range.addEventListener('input',function(){woke();cancelAnimationFrame(anim);paint();show(Math.round(range.value/seg))});
    range.addEventListener('change',function(){tween(Math.round(range.value/seg)*seg)});
    range.addEventListener('keydown',function(e){
      var k=e.key,i=Math.round(range.value/seg);
      if(k==='ArrowRight'||k==='ArrowUp'){e.preventDefault();woke();tween(Math.min(ps.length-1,i+1)*seg)}
      else if(k==='ArrowLeft'||k==='ArrowDown'){e.preventDefault();woke();tween(Math.max(0,i-1)*seg)}
    });
    stops.forEach(function(s,k){s.addEventListener('click',function(){woke();tween(k*seg)})});
    range.value=0;paint();show(0);
  }
  $$('.wpc-q').forEach(function(q){
    q.addEventListener('click',function(){q.setAttribute('aria-expanded',q.getAttribute('aria-expanded')==='true'?'false':'true')});
  });

  /* switch on the animated states last, so a script error leaves everything visible */
  document.documentElement.classList.add('wp-js');
})();
