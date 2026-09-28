/* ==========================================================================
   Work with us (versions A, B, C). No dependencies.

   HOW SENDING WORKS ON THE LIVE SITE (same as contact-us.js)
   The enquiry form is Shopify's standard contact form:
     <form action="/contact" method="post"> with hidden form_type=contact and utf8,
     fields contact[enquiry_type], contact[name], contact[email], contact[organisation],
     contact[website], contact[body], contact[page].
   Shopify emails each submission to the store contact email (hello@poorly-pet.com) and
   redirects back with ?contact_posted=true, which is picked up below to show the success state.
   Set LIVE = true in the theme so a valid form is submitted for real. In this preview
   (LIVE = false) validation runs and the success state is shown without sending.

   The enquiry types are only the three routes the live page offers (brand and product
   partnerships, the vet partner programme, expert and content collaboration) plus
   "Something else".
   ========================================================================== */
(function(){
  'use strict';
  var LIVE=false;
  var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var WEB_RE=/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
  var MIN_MSG=20;
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

  var TYPES={
    brand:{org:'Brand or company name',req:true,inc:['The product, and the dog health need it helps with','Where it is made and where it is sold now','A link to the product or a price list, if you have one']},
    vet:{org:'Practice name',req:true,inc:['Your practice name and where you are based','Roughly how you would like to recommend products to clients']},
    expert:{org:'Organisation or website name',req:false,inc:['Your qualification or area of expertise','The topics you would like to write or advise on','Links to anything you have published']},
    other:{org:'Company or organisation',req:false,inc:null}
  };

  var form=$('[data-wk-form]');
  if(!form)return;
  var wrap=form.closest('[data-wk-wrap]'),ok=$('[data-wk-ok]',wrap),head=$('[data-wk-head]',wrap),sum=$('[data-wk-sum]',form);
  var type=$('#wk-type',form),name=$('#wk-name',form),email=$('#wk-email',form),org=$('#wk-org',form),web=$('#wk-web',form),msg=$('#wk-msg',form);
  var hint=$('[data-wk-hint]',form),count=$('[data-wk-count]',form),orgL=$('[data-wk-orgl]',form),orgOpt=$('[data-wk-orgopt]',form);
  var touched=false;

  function key(){var o=type.options[type.selectedIndex];return o&&o.getAttribute('data-k')||''}
  function applyType(){
    var t=TYPES[key()]||TYPES.other;
    orgL.textContent=t.org;orgOpt.hidden=t.req;org.required=t.req;
    if(t.inc&&key()){$('ul',hint).innerHTML=t.inc.map(function(s){return '<li>'+s+'</li>'}).join('');hint.hidden=false}else hint.hidden=true;
    $$('[data-wk-inc]').forEach(function(el){el.hidden=el.getAttribute('data-wk-inc')!==(key()||'none')});
  }

  /* ---------- validation ---------- */
  function rules(){
    var t=TYPES[key()]||TYPES.other,e=[];
    function add(el,m){e.push({el:el,m:m})}
    if(!type.value)add(type,'Choose what you would like to talk about');
    if(!name.value.trim())add(name,'Enter your name');
    if(!email.value.trim())add(email,'Enter your email address');
    else if(!EMAIL_RE.test(email.value.trim()))add(email,'Enter an email address in the right format, like name@example.co.uk');
    if(t.req&&!org.value.trim())add(org,'Enter your '+t.org.toLowerCase());
    if(web.value.trim()&&!WEB_RE.test(web.value.trim()))add(web,'Enter a website address, like yourbrand.co.uk');
    var m=msg.value.trim();
    if(!m)add(msg,'Tell us a little about your enquiry');
    else if(m.length<MIN_MSG)add(msg,'Tell us a little more, at least '+MIN_MSG+' characters');
    return e;
  }
  function errEl(el){return $('#'+el.id+'-e',form)}
  function mark(el,m){
    var f=el.closest('.wk-f');
    el.setAttribute('aria-invalid',m?'true':'false');errEl(el).textContent=m||'';
    f.classList.toggle('is-ok',!m&&!!el.value.trim());
  }
  function check(el){var e=rules().filter(function(x){return x.el===el})[0];mark(el,e&&e.m)}
  [type,name,email,org,web,msg].forEach(function(el){
    el.addEventListener('blur',function(){if(touched||el.value.trim())check(el)});
    el.addEventListener('input',function(){if(el.getAttribute('aria-invalid')==='true')check(el)});
  });
  type.addEventListener('change',function(){applyType();if(touched||type.value)check(type);if(org.getAttribute('aria-invalid'))check(org);syncTabs(key())});
  msg.addEventListener('input',function(){count.textContent=msg.value.length+' / 3000'});

  form.addEventListener('submit',function(ev){
    ev.preventDefault();touched=true;
    var e=rules(),all=[type,name,email,org,web,msg];
    all.forEach(function(el){var x=e.filter(function(r){return r.el===el})[0];mark(el,x&&x.m)});
    if(e.length){
      $('ul',sum).innerHTML=e.map(function(x){return '<li><a href="#'+x.el.id+'">'+x.m+'</a></li>'}).join('');
      sum.hidden=false;sum.focus({preventScroll:true});sum.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});
      return;
    }
    sum.hidden=true;
    if(LIVE){form.submit();return}
    showOk(type.value,name.value.trim(),email.value.trim(),org.value.trim());
  });
  sum.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a)return;e.preventDefault();
    var t=$(a.getAttribute('href'),form);if(t){t.focus();t.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'})}
  });

  function showOk(tv,n,m,o){
    $('[data-wk-okname]',ok).textContent=n?', '+n.split(' ')[0]:'';
    $('[data-wk-okmail]',ok).textContent=m||'your email address';
    $('[data-wk-oktype]',ok).textContent=tv||'Enquiry';
    $('[data-wk-okorg]',ok).textContent=o;$('[data-wk-okorgrow]',ok).hidden=!o;
    form.hidden=true;if(head)head.hidden=true;ok.hidden=false;
    ok.focus({preventScroll:true});ok.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});
  }
  $('[data-wk-again]',ok).addEventListener('click',function(){
    form.reset();touched=false;count.textContent='0 / 3000';
    $$('.wk-f',form).forEach(function(f){f.classList.remove('is-ok')});
    $$('[aria-invalid]',form).forEach(function(el){el.removeAttribute('aria-invalid')});
    $$('.wk-err',form).forEach(function(el){el.textContent=''});
    applyType();syncTabs('');
    ok.hidden=true;form.hidden=false;if(head)head.hidden=false;type.focus();
  });
  /* Shopify redirects back with ?contact_posted=true after a real submit */
  if(/[?&]contact_posted=true/.test(location.search))showOk('',  '', '', '');

  /* ---------- preset the type from buttons and links ---------- */
  function setType(k){
    var o=$$('option',type).filter(function(x){return x.getAttribute('data-k')===k})[0];
    if(o){type.value=o.value;applyType();check(type);syncTabs(k)}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-wk-type]');if(!b)return;
    e.preventDefault();setType(b.getAttribute('data-wk-type'));
    if(!ok.hidden)return;
    var tgt=$('[data-wk-anchor]')||wrap;
    tgt.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'});
    setTimeout(function(){name.focus({preventScroll:true})},RM?0:450);
  });

  /* ---------- B: audience tabs (keep in step with the form) ---------- */
  var tabs=$$('[role=tab]'),syncing=false;
  function showTab(tab,focus){
    tabs.forEach(function(t){var on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!on});
    if(focus)tab.focus();
  }
  function syncTabs(k){
    if(!tabs.length||syncing||!k||k==='other')return;
    var t=tabs.filter(function(x){return x.getAttribute('data-k')===k})[0];if(t)showTab(t);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){showTab(t);syncing=true;if(ok.hidden)setType(t.getAttribute('data-k'));syncing=false});
    t.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(e.key==='Home')d=-i;if(e.key==='End')d=tabs.length-1-i;
      if(!d&&e.key!=='Home')return;e.preventDefault();
      var n=tabs[(i+d+tabs.length)%tabs.length];showTab(n,true);syncing=true;if(ok.hidden)setType(n.getAttribute('data-k'));syncing=false;
    });
  });

  applyType();
})();
