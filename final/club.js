/* ==========================================================================
   Poorly Pet Club: client-side module. Shared by account-*.html and club-*.html.
   Exposes window.PPClub. No external requests.

   What lives here
   - RULES: the signed-off Club rules (signed-off/home.html Club drawer + Club section).
   - Maths: tier from lifetime spend, points for an order, tier progress, voucher value.
   - Store: the EXAMPLE member's ledger and vouchers, kept in localStorage (try/catch)
     so a redeemed voucher survives a reload in the prototype.
   - API: getAccount() and redeem(). Mocked in the browser until API.endpoint is set.
   - Binders for the Club pages: points calculator [data-club-calc] and the
     "check your points" panel [data-club-check].

   PLUG-IN POINT (real data) ------------------------------------------------
   Set PPClub.API.endpoint = "/apps/account" (the App Proxy of the installed
   "Poorly Pet Account" app, the same one the live /pages/account-dashboard uses).
   The server then must answer:
     GET  <endpoint>?action=club            -> { spend, balance, ledger:[...], vouchers:[...], referralUrl }
     POST <endpoint> {action:"club-redeem", points:500|1000}
                                            -> { code, value, points, balance, voucher:{...} }
   The server is the only place that creates discount codes and changes balances.
   Everything below the endpoint check is the mock. See CLUB-SYSTEM.md.
   ========================================================================== */
(function(){
'use strict';

var RULES={
  tiers:[
    {id:'member',   name:'Member',   from:0,   rate:5, perks:['5 points per £1']},
    {id:'regular',  name:'Regular',  from:150, rate:6, perks:['6 points per £1']},
    {id:'committed',name:'Committed',from:400, rate:8, perks:['8 points per £1']}
  ],
  firstOrderMultiplier:2,
  review:50,
  referral:500,
  birthday:250,
  rewards:[{points:500,value:5},{points:1000,value:10}],
  earlyAccessDays:1
};

/* ---------- maths ---------- */
function num(v){v=parseFloat(String(v==null?'':v).replace(/[^0-9.\-]/g,''));return isFinite(v)?v:0}
function tierFor(spend){var t=RULES.tiers[0];RULES.tiers.forEach(function(x){if(num(spend)>=x.from)t=x});return t}
function nextTier(spend){var s=num(spend);for(var i=0;i<RULES.tiers.length;i++){if(RULES.tiers[i].from>s)return RULES.tiers[i]}return null}
/* points for one order: whole pounds of the product subtotal (after discounts, before delivery)
   x the rate of the tier held BEFORE the order, doubled on a first order */
function pointsFor(subtotal,opt){
  opt=opt||{};
  var t=opt.tier?byId(opt.tier):tierFor(opt.spendBefore||0);
  var p=Math.floor(Math.max(0,num(subtotal)))*t.rate;
  return opt.firstOrder?p*RULES.firstOrderMultiplier:p;
}
function byId(id){for(var i=0;i<RULES.tiers.length;i++){if(RULES.tiers[i].id===id)return RULES.tiers[i]}return RULES.tiers[0]}
/* money off the points buy, using the biggest vouchers first */
function vouchersFor(points){
  var p=Math.max(0,Math.floor(num(points))),tens=Math.floor(p/1000),fives=Math.floor((p%1000)/500);
  return {tens:tens,fives:fives,value:tens*10+fives*5,left:p-tens*1000-fives*500};
}
function progress(spend){
  var s=num(spend),t=tierFor(s),n=nextTier(s);
  if(!n)return {tier:t,next:null,toGo:0,pct:100};
  return {tier:t,next:n,toGo:Math.round((n.from-s)*100)/100,pct:Math.max(0,Math.min(100,Math.round((s-t.from)/(n.from-t.from)*100)))};
}
function balanceOf(ledger){return (ledger||[]).reduce(function(a,e){return e.pending?a:a+e.points},0)}
function pendingOf(ledger){return (ledger||[]).reduce(function(a,e){return e.pending?a+e.points:a},0)}
function money(v){v=num(v);return '£'+(v%1===0?v.toFixed(0):v.toFixed(2))}
function money2(v){return '£'+num(v).toFixed(2)}
function fmt(n){return Math.round(num(n)).toLocaleString('en-GB')}
/* PPC-XXXX-XXXX, no 0/O/1/I/L so it reads cleanly off a phone */
function makeCode(){
  var A='ABCDEFGHJKMNPQRSTUVWXYZ23456789',s='',r;
  var c=window.crypto&&window.crypto.getRandomValues?window.crypto:null;
  for(var i=0;i<8;i++){r=c?c.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296);s+=A[r%A.length]}
  return 'PPC-'+s.slice(0,4)+'-'+s.slice(4);
}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function dateLabel(iso){
  if(!iso)return '';var p=String(iso).split('-');if(p.length<3)return iso;
  var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (+p[2])+' '+m[(+p[1])-1]+' '+p[0];
}

/* ---------- EXAMPLE member (made up, for the prototype only) ----------
   Ledger follows the rules above: #1018 first order doubled at Member rate,
   #1031 took them past £150 (£162.91) so #1044 earned at the Regular rate. */
var EXAMPLE={
  example:true,
  firstName:'Sarah',
  spend:205.89,
  referralUrl:'https://www.poorly-pet.com/?ref=SARAH-4F7K',
  ledger:[
    {date:'2026-09-26',label:'Order #1049, points added when it ships',points:174,pending:true,type:'order'},
    {date:'2026-09-05',label:'Order #1044 (Regular, 6 points per £1)',points:252,type:'order'},
    {date:'2026-07-22',label:'Referral: a friend placed their first order',points:500,type:'referral'},
    {date:'2026-06-10',label:'Order #1031',points:290,type:'order'},
    {date:'2026-06-03',label:'Bramble’s birthday',points:250,type:'birthday'},
    {date:'2026-05-14',label:'Swapped for a £5 voucher',points:-500,type:'redeem'},
    {date:'2026-05-02',label:'Order #1027',points:280,type:'order'},
    {date:'2026-03-20',label:'Verified Judge.me review',points:50,type:'review'},
    {date:'2026-03-12',label:'Order #1018, first order double points',points:460,type:'order'}
  ],
  vouchers:[
    {code:'PPC-7KQ2-M9XD',value:5,points:500,created:'2026-05-14',used:'2026-06-10',usedOn:'#1031'}
  ]
};

/* ---------- store (prototype) ---------- */
var LS='pp_club_example_v1';
function clone(o){return JSON.parse(JSON.stringify(o))}
function load(){
  try{var raw=window.localStorage.getItem(LS);if(raw){var s=JSON.parse(raw);if(s&&s.ledger)return s}}catch(e){}
  return clone(EXAMPLE);
}
function save(s){try{window.localStorage.setItem(LS,JSON.stringify(s))}catch(e){}}
function reset(){try{window.localStorage.removeItem(LS)}catch(e){}state=clone(EXAMPLE);emit();return state}
var state=load();
var subs=[];
function on(fn){subs.push(fn)}
function emit(){subs.forEach(function(fn){try{fn(state)}catch(e){}})}

/* ---------- API (plug-in point) ---------- */
var API={
  endpoint:null, /* e.g. "/apps/account" once the server side exists */
  getAccount:function(){
    if(API.endpoint){
      return fetch(API.endpoint+'?action=club',{headers:{Accept:'application/json'},credentials:'same-origin'})
        .then(function(r){if(!r.ok)throw new Error('club '+r.status);return r.json()})
        .then(function(s){state=s;emit();return s});
    }
    return Promise.resolve(state);
  },
  redeem:function(points){
    points=Math.floor(num(points));
    var reward=null;RULES.rewards.forEach(function(r){if(r.points===points)reward=r});
    if(!reward)return Promise.reject(new Error('Choose 500 or 1,000 points.'));
    if(API.endpoint){
      return fetch(API.endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'club-redeem',points:points})})
        .then(function(r){return r.json().then(function(j){if(!r.ok||j.error)throw new Error(j.error||'Something went wrong. Please try again.');return j})})
        .then(function(j){return API.getAccount().then(function(){return j})});
    }
    /* ---- MOCK: the real server creates a single-use Shopify discount code ---- */
    return new Promise(function(res,rej){
      setTimeout(function(){
        if(balanceOf(state.ledger)<points){rej(new Error('You need '+fmt(points)+' points for this voucher.'));return}
        var v={code:makeCode(),value:reward.value,points:points,created:today(),used:null};
        state.vouchers.unshift(v);
        state.ledger.unshift({date:v.created,label:'Swapped for a '+money(reward.value)+' voucher',points:-points,type:'redeem'});
        save(state);emit();
        res({code:v.code,value:v.value,points:points,balance:balanceOf(state.ledger),voucher:v,mock:true});
      },450);
    });
  }
};

/* ---------- copy to clipboard (with a fallback for file:// and old browsers) ---------- */
function copy(text,btn){
  function done(ok){if(!btn)return;var o=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',o);btn.textContent=ok?'Copied':'Press Ctrl+C';setTimeout(function(){btn.textContent=o},1600)}
  try{
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(function(){done(true)},function(){fallback()});return}
  }catch(e){}
  fallback();
  function fallback(){
    var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(t);done(ok);
  }
}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- Club page binders ---------- */
/* Calculator: <div data-club-calc> containing
   input[data-calc-spend], select/radios [data-calc-tier], input[data-calc-first] (checkbox),
   outputs [data-calc-points] [data-calc-value] [data-calc-note] */
function bindCalc(root){
  var sp=root.querySelector('[data-calc-spend]'),fi=root.querySelector('[data-calc-first]'),
      out=root.querySelector('[data-calc-points]'),val=root.querySelector('[data-calc-value]'),note=root.querySelector('[data-calc-note]'),
      rng=root.querySelector('[data-calc-range]');
  function tierId(){
    var r=root.querySelector('[data-calc-tier]:checked')||root.querySelector('select[data-calc-tier]');
    return r?r.value:'member';
  }
  function run(src){
    if(src===rng&&sp)sp.value=rng.value;
    if(src===sp&&rng)rng.value=Math.min(num(sp.value),num(rng.max||500));
    var s=num(sp&&sp.value),t=byId(tierId()),first=!!(fi&&fi.checked);
    var pts=pointsFor(s,{tier:t.id,firstOrder:first}),v=vouchersFor(pts);
    if(out)out.textContent=fmt(pts);
    if(val)val.textContent=money(v.value);
    if(note){
      var need=500-pts;
      note.textContent=s<=0?'Enter an amount to see your points.':
        (pts<500?'That is '+fmt(pts)+' of the 500 points you need for a £5 voucher. '+fmt(need)+' to go.':
        'Enough for '+(v.tens?v.tens+' × £10':'')+(v.tens&&v.fives?' and ':'')+(v.fives?v.fives+' × £5':'')+' off'+(v.left?', with '+fmt(v.left)+' points left over.':'.'))+
        ' '+t.name+' rate: '+t.rate+' points per £1'+(first?', doubled on a first order.':'.');
    }
  }
  root.addEventListener('input',function(e){run(e.target)});
  root.addEventListener('change',function(e){run(e.target)});
  root.addEventListener('submit',function(e){e.preventDefault()});
  run();
}

/* Check-your-points panel: <div data-club-check> with [data-ck-balance] [data-ck-tier]
   [data-ck-bar] (the fill) [data-ck-next] [data-ck-worth] [data-ck-pending] */
function bindCheck(root){
  function paint(){
    var b=balanceOf(state.ledger),p=progress(state.spend),v=vouchersFor(b),pend=pendingOf(state.ledger);
    set('[data-ck-balance]',fmt(b));
    set('[data-ck-tier]',p.tier.name);
    set('[data-ck-worth]',money(v.value));
    set('[data-ck-pending]',pend?fmt(pend)+' points on their way, added when your order ships.':'');
    set('[data-ck-next]',p.next?'Spend '+money2(p.toGo)+' more to reach '+p.next.name+' ('+p.next.rate+' points per £1).':'You are on our top tier.');
    set('[data-ck-spend]',money2(state.spend));
    var bar=root.querySelector('[data-ck-bar]');if(bar)bar.style.width=p.pct+'%';
    var pb=root.querySelector('[role="progressbar"]');if(pb){pb.setAttribute('aria-valuenow',p.pct);pb.setAttribute('aria-valuetext',p.next?money2(p.toGo)+' to '+p.next.name:'Top tier')}
  }
  function set(sel,t){root.querySelectorAll(sel).forEach(function(el){el.textContent=t})}
  on(paint);paint();
}

function init(){
  document.querySelectorAll('[data-club-calc]').forEach(bindCalc);
  document.querySelectorAll('[data-club-check]').forEach(bindCheck);
  /* in-page contents: highlight the section in view */
  document.querySelectorAll('[data-club-toc]').forEach(function(toc){
    var links=[].slice.call(toc.querySelectorAll('a[href^="#"]')),secs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1))}).filter(Boolean);
    if(!('IntersectionObserver' in window)||!secs.length)return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})}})},{rootMargin:'-20% 0px -70% 0px'});
    secs.forEach(function(s){io.observe(s)});
  });
  document.querySelectorAll('[data-club-reset]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();reset()})});
  /* header shortcuts: the shell's drawers are not on these pages, so go to the pages instead */
  var ab=document.getElementById('account-btn'),cb=document.getElementById('club-btn');
  if(ab)ab.addEventListener('click',function(){location.href=document.body.getAttribute('data-account-url')||'account-sign-in.html'});
  if(cb)cb.addEventListener('click',function(){location.href='club.html'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

window.PPClub={
  RULES:RULES,API:API,
  tierFor:tierFor,nextTier:nextTier,tierById:byId,pointsFor:pointsFor,vouchersFor:vouchersFor,progress:progress,
  balanceOf:balanceOf,pendingOf:pendingOf,makeCode:makeCode,
  get state(){return state},on:on,reset:reset,
  money:money,money2:money2,fmt:fmt,dateLabel:dateLabel,today:today,esc:esc,copy:copy,num:num
};
})();

/* ---------- Club page extras (club-*.html only; no effect on account pages) ----------
   - [data-cl-qa]: the homepage "Ask us" accordion (.qa .q / .a), one answer open at a time.
   - .cl .railwrap: the homepage product rail scroller (arrows + track thumb).
   - .cl [data-add]: a short "Added" confirmation on the product card button (prototype). */
(function(){
'use strict';
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function init(){
  document.querySelectorAll('[data-cl-qa]').forEach(function(box){
    box.addEventListener('click',function(e){
      var q=e.target.closest('.q');if(!q||!box.contains(q))return;
      var open=q.getAttribute('aria-expanded')==='true';
      box.querySelectorAll('.q').forEach(function(b){b.classList.remove('on');b.setAttribute('aria-expanded','false');var a=document.getElementById(b.getAttribute('aria-controls'));if(a)a.classList.remove('on')});
      if(!open){q.classList.add('on');q.setAttribute('aria-expanded','true');var a=document.getElementById(q.getAttribute('aria-controls'));if(a)a.classList.add('on')}
    });
  });
  var ups=[];
  document.querySelectorAll('.cl .railwrap').forEach(function(w){
    var r=w.querySelector('.rail'),pv=w.querySelector('.sarr.prev'),nx=w.querySelector('.sarr.next'),tr=w.querySelector('.track'),th=tr&&tr.querySelector('i');
    if(!r||!pv||!nx||!th)return;
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('cl-fit',max<=2);
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
    }
    function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:RM?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:RM?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});ups.push(up);up();
  });
  window.addEventListener('resize',function(){ups.forEach(function(f){f()})});
  document.querySelectorAll('.cl [data-add]').forEach(function(b){
    b.addEventListener('click',function(){var o=b.getAttribute('data-o')||b.textContent;b.setAttribute('data-o',o);b.textContent='Added';clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=o},1600)});
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
