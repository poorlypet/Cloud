/* Why Poorly Pet: in-page jumps, and the chapter bar in version A. */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[data-jump]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=document.querySelector(a.getAttribute('href'));if(!t)return;
      e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      if(history.replaceState)history.replaceState(null,'',a.getAttribute('href'));
    });
  });
  var toc=document.querySelector('.wpa-toc');
  if(!toc||!('IntersectionObserver' in window))return;
  var links=[].slice.call(toc.querySelectorAll('a[href^="#"]'));
  function mark(id){links.forEach(function(l){var on=l.getAttribute('href')==='#'+id;l.classList.toggle('on',on);if(on)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current')})}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)mark(e.target.id)})},{rootMargin:'-40% 0px -55% 0px'});
  links.forEach(function(l){var t=document.querySelector(l.getAttribute('href'));if(t)io.observe(t)});
})();
