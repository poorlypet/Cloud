/* Returns and refunds: shared by versions A, B and C.
   Accordions work like the homepage "Ask us about" panel: one answer open at a time per group. */
(function(){
  'use strict';
  document.querySelectorAll('.rr-qa').forEach(function(g){
    var qs=g.querySelectorAll('.q');
    qs.forEach(function(q){
      q.addEventListener('click',function(){
        var open=!q.classList.contains('on');
        qs.forEach(function(o){o.classList.remove('on');o.setAttribute('aria-expanded','false');if(o.nextElementSibling)o.nextElementSibling.classList.remove('on');});
        if(open){q.classList.add('on');q.setAttribute('aria-expanded','true');if(q.nextElementSibling)q.nextElementSibling.classList.add('on');}
      });
    });
  });
})();
