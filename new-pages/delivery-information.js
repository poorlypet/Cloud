/* ==========================================================================
   Delivery information: behaviour shared by versions A, B and C. Prefix dlv-.
   Everything on the page is plain HTML and readable without this script.
   This adds: "On this page" highlighting (A), topic tabs (C) and the
   quick-answer tool (delivery estimate), which works from the published policy dates only.
   ========================================================================== */
(function(){
'use strict';
var root=document.querySelector('[data-dlv]');
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
var spy=root.querySelector('[data-dlv-spy]');
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
var tabwrap=root.querySelector('[data-dlv-tabs]');
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
  if(hit&&focus){var p=document.getElementById(id);var top=root.querySelector('.dlv-tabs');if(top)top.scrollIntoView({block:'start'});p.focus({preventScroll:true});}
  return hit;
}
function panelFor(el){while(el&&el!==root){if(el.classList&&el.classList.contains('dlv-c-panel'))return el;el=el.parentNode;}return null;}
if(tabwrap){
  tabs=Array.prototype.slice.call(tabwrap.querySelectorAll('[role=tab]'));
  panels=tabs.map(function(t){return document.getElementById(t.getAttribute('aria-controls'));});
  if(tabs.length&&panels.every(Boolean)){
    root.classList.add('dlv-tabbed');
    panels.forEach(function(p){p.setAttribute('tabindex','-1');});
    var start=tabs[0].getAttribute('aria-controls');
    var h=location.hash.slice(1);
    if(h){var t=document.getElementById(h);var p=t&&(t.classList.contains('dlv-c-panel')?t:panelFor(t));if(p)start=p.id;}
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
      var p=t&&(t.classList.contains('dlv-c-panel')?t:panelFor(t));
      if(!p)return;
      e.preventDefault();
      activate(p.id,false);
      (t===p?root.querySelector('.dlv-tabs'):t).scrollIntoView({block:'start'});
      if(t.tagName==='DETAILS')t.open=true;
    });
  }
}

/* ---------- quick answer tools ---------- */
/* Delivery estimate: dispatch in 1 to 2 working days, then 2 to 4 working days with Evri (shipping policy s.3). */
Array.prototype.forEach.call(root.querySelectorAll('[data-dlv-est]'),function(box){
  var inp=box.querySelector('input'),out=box.querySelector('.dlv-out');
  if(!inp||!out)return;
  if(!inp.value)inp.value=key(today());
  function run(){
    var d=parse(inp.value)||today();
    var d1=addWork(d,1),d2=addWork(d,2),a1=addWork(d1,2),a2=addWork(d2,4);
    out.innerHTML='<p class="dlv-ot">Usually arrives between '+esc(fmt(a1))+' and '+esc(fmt(a2))+'</p>'+
      '<dl class="dlv-kv"><div><dt>Dispatched</dt><dd>'+esc(fmt(d1))+' or '+esc(fmt(d2))+'</dd></div>'+
      '<div><dt>Delivered</dt><dd>2 to 4 working days after dispatch, with Evri</dd></div>'+
      '<div><dt>Cost</dt><dd>£3.99, or <b>free on orders over £39</b></dd></div></dl>'+
      '<p class="dlv-fine">An estimate from our standard timescales. Working days are Monday to Friday, excluding bank holidays (England and Wales dates used here). Checkout shows the estimate for your order.</p>';
    out.hidden=false;
  }
  inp.addEventListener('input',run);inp.addEventListener('change',run);
  run();
});
})();
