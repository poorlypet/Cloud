/* ==========================================================================
   Returns and refunds: behaviour shared by versions A, B and C. Prefix rtn-.
   Everything on the page is plain HTML and readable without this script.
   This adds: "On this page" highlighting (A), topic tabs (C) and the
   quick-answer tool (return checker), which works from the published policy dates only.
   ========================================================================== */
(function(){
'use strict';
var root=document.querySelector('[data-rtn]');
if(!root) return;

/* ---------- dates: working days = Monday to Friday, excluding bank holidays ---------- */
/* England and Wales bank holidays (gov.uk). Used only for the estimate; checkout shows the real one. */
var HOL={'2026-01-01':1,'2026-04-03':1,'2026-04-06':1,'2026-05-04':1,'2026-05-25':1,'2026-08-31':1,'2026-12-25':1,'2026-12-28':1,
         '2027-01-01':1,'2027-03-26':1,'2027-03-29':1,'2027-05-03':1,'2027-05-31':1,'2027-08-30':1,'2027-12-27':1,'2027-12-28':1};
var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function pad(n){return (n<10?'0':'')+n;}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function isWork(d){var w=d.getDay();return w!==0&&w!==6&&!HOL[key(d)];}
function addWork(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());while(n>0){x.setDate(x.getDate()+1);if(isWork(x))n--;}return x;}
function addDays(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;}
function fmt(d,noDay){return (noDay?'':DAYS[d.getDay()]+' ')+d.getDate()+' '+MONTHS[d.getMonth()];}
function parse(v){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');if(!m)return null;var d=new Date(+m[1],+m[2]-1,+m[3]);return isNaN(d)?null:d;}
function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- A: highlight the current section in "On this page" ---------- */
var spy=root.querySelector('[data-rtn-spy]');
if(spy&&'IntersectionObserver' in window){
  var links={},secs=[];
  Array.prototype.forEach.call(spy.querySelectorAll('a[href^="#"]'),function(a){
    var s=document.getElementById(a.getAttribute('href').slice(1));
    if(s){links[s.id]=a;secs.push(s);}
  });
  var set=function(id){for(var k in links){if(k===id)links[k].setAttribute('aria-current','true');else links[k].removeAttribute('aria-current');}};
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting)set(e.target.id);});
  },{rootMargin:'-15% 0px -70% 0px'});
  secs.forEach(function(s){io.observe(s);});
}

/* ---------- C: topic tabs (all panels show without JS) ---------- */
var tabwrap=root.querySelector('[data-rtn-tabs]');
var tabs=[],panels=[];
function activate(id,focus){
  var hit=false;
  tabs.forEach(function(t,i){
    var on=t.getAttribute('aria-controls')===id;
    if(on)hit=true;
    t.setAttribute('aria-selected',on?'true':'false');
    t.tabIndex=on?0:-1;
    panels[i].hidden=!on;
  });
  if(hit&&focus){var p=document.getElementById(id);var top=root.querySelector('.rtn-tabs');if(top)top.scrollIntoView({block:'start'});p.focus({preventScroll:true});}
  return hit;
}
function panelFor(el){while(el&&el!==root){if(el.classList&&el.classList.contains('rtn-c-panel'))return el;el=el.parentNode;}return null;}
if(tabwrap){
  tabs=Array.prototype.slice.call(tabwrap.querySelectorAll('[role=tab]'));
  panels=tabs.map(function(t){return document.getElementById(t.getAttribute('aria-controls'));});
  if(tabs.length&&panels.every(Boolean)){
    root.classList.add('rtn-tabbed');
    panels.forEach(function(p){p.setAttribute('tabindex','-1');});
    var start=tabs[0].getAttribute('aria-controls');
    var h=location.hash.slice(1);
    if(h){var t=document.getElementById(h);var p=t&&(t.classList.contains('rtn-c-panel')?t:panelFor(t));if(p)start=p.id;}
    activate(start,false);
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(e){e.preventDefault();activate(t.getAttribute('aria-controls'),false);if(history.replaceState)history.replaceState(null,'','#'+t.getAttribute('aria-controls'));});
      t.addEventListener('keydown',function(e){
        var j=null;
        if(e.key==='ArrowRight')j=(i+1)%tabs.length;
        else if(e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;
        else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;
        if(j!==null){e.preventDefault();tabs[j].focus();tabs[j].click();}
      });
    });
    /* in-page links that point into another tab switch to it */
    root.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href^="#"]');
      if(!a||a.getAttribute('role')==='tab')return;
      var t=document.getElementById(a.getAttribute('href').slice(1));
      var p=t&&(t.classList.contains('rtn-c-panel')?t:panelFor(t));
      if(!p)return;
      e.preventDefault();
      activate(p.id,false);
      (t===p?root.querySelector('.rtn-tabs'):t).scrollIntoView({block:'start'});
      if(t.tagName==='DETAILS')t.open=true;
    });
  }
}

/* ---------- quick answer tools ---------- */
/* Return checker: 14 days to cancel from receipt (s.1), 30-day guarantee on eligible products (s.6),
   opened consumables not returnable unless faulty (s.3), faulty items replaced or refunded (s.5). */
var MAIL='hello@poorly-pet.com';
var START='mailto:'+MAIL+'?subject='+encodeURIComponent('Return request')+'&body='+encodeURIComponent('Order number:\nItems to return:\nReason (optional):\n');
var FAULT='mailto:'+MAIL+'?subject='+encodeURIComponent('Faulty or damaged item')+'&body='+encodeURIComponent('Order number:\nItem:\nWhat is wrong with it:\n');
Array.prototype.forEach.call(root.querySelectorAll('[data-rtn-chk]'),function(box){
  var inp=box.querySelector('input[type=date]'),out=box.querySelector('.rtn-out');
  if(!inp||!out)return;
  if(!inp.value)inp.value=key(today());
  inp.max=key(today());
  function type(){var r=box.querySelector('input[type=radio]:checked');return r?r.value:'';}
  function run(){
    var t=type();
    if(!t){out.hidden=true;return;}
    var d=parse(inp.value)||today(),now=today();
    var tell=addDays(d,14),guar=addDays(d,30),h='';
    if(t==='faulty'){
      h='<p class="rtn-ot">Yes. We’ll replace it or refund it in full</p>'+
        '<p>If an item is faulty, damaged or not what you ordered, we’ll arrange a replacement or a full refund, including any return postage. This includes opened supplements and consumables.</p>'+
        '<p>Email us your order number and what’s wrong. A photo helps us sort it quickly.</p>'+
        '<a class="btn" href="'+FAULT+'">Tell us about a problem</a>';
    }else if(t==='opened'){
      h='<p class="rtn-ot">Only if it’s faulty</p>'+
        '<p>For hygiene and safety reasons, supplements, consumable health products and perishable items can’t be returned once opened or if any seal is broken, unless they are faulty. This doesn’t affect your statutory rights.</p>'+
        '<p>If it is faulty, choose “Faulty, damaged or wrong item” above.</p>';
    }else if(now<=tell){
      h='<p class="rtn-ot">Yes. Tell us by '+esc(fmt(tell))+'</p>'+
        '<dl class="rtn-kv"><div><dt>Tell us by</dt><dd><b>'+esc(fmt(tell))+'</b></dd></div>'+
        '<div><dt>Send it back</dt><dd>Within 14 days of telling us</dd></div>'+
        '<div><dt>Postage</dt><dd>Paid by you</dd></div>'+
        '<div><dt>Refund</dt><dd>Within 14 days of us receiving it</dd></div></dl>'+
        '<a class="btn" href="'+START+'">Start a return</a>';
    }else if(now<=guar){
      h='<p class="rtn-ot">Your 14 days to cancel ended on '+esc(fmt(tell,1))+'</p>'+
        '<p>Eligible products are still covered by our 30-day money-back guarantee until <b>'+esc(fmt(guar))+'</b>. Email us your order number and the item, and we’ll make it right.</p>'+
        '<a class="btn" href="'+START+'">Email us</a>';
    }else{
      h='<p class="rtn-ot">Both return windows have passed</p>'+
        '<p>Your 14 days to cancel ended on '+esc(fmt(tell,1))+' and the 30-day guarantee on '+esc(fmt(guar,1))+'. If the item is faulty, your rights under the Consumer Rights Act 2015 still apply, so email us and we’ll help.</p>';
    }
    out.innerHTML=h;out.hidden=false;
  }
  box.addEventListener('change',run);inp.addEventListener('input',run);
  run();
});
})();
