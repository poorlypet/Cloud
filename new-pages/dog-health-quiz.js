/* ==========================================================================
   Dog health quiz: shared engine for versions A, B and C.
   Seven questions (name, age, size, body type, areas, signs, anything else).
   Works out what the dog needs from its profile and symptoms, then recommends
   real products from window.PP_TAGS / PP_PRODUCTS (products.js, loaded first).
   Product cards and rails are the site's own .pk / .railwrap markup, styled by
   css/home.css. Answers are remembered in this browser (localStorage).
   Each version is a root with data-hq="a|b|c". Vanilla JS.
   ========================================================================== */
(function(){
'use strict';

var PRODUCTS=window.PP_PRODUCTS||[],BY=window.PP_BY_HANDLE||{},TAGS=window.PP_TAGS||{};
if(!Object.keys(BY).length)PRODUCTS.forEach(function(p){BY[p.handle]=p});
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '£'+(Math.round(n*100)/100).toFixed(2)}
function $(sel,el){return (el||document).querySelector(sel)}
function $$(sel,el){return Array.prototype.slice.call((el||document).querySelectorAll(sel))}
function has(a,v){return a.indexOf(v)>-1}
function cleanTitle(t){return String(t).replace(/\s*\|\s*/g,', ')}

/* ---------- data: areas and the 43 real symptoms (signed-off/shop-by-symptom.html) ---------- */
var AREAS=[
 {k:'legs-paws',n:'Legs & paws',ex:'Limping, stiffness, slow to get up',s:[
  ['limping-or-favouring-a-leg','Limping or favouring a leg','joints'],['stiffness-after-rest','Stiffness after rest','joints'],
  ['slow-to-get-up','Slow to get up','joints'],['holding-a-paw-up','Holding a paw up','joints'],
  ['licking-or-chewing-paws','Licking or chewing paws','skin'],['scuffed-nails-or-dragging-paws','Scuffed nails or dragging paws','grip']]},
 {k:'back-spine',n:'Back & spine',ex:'Reluctant to jump, wobbly back legs',s:[
  ['reluctant-to-jump-or-climb','Reluctant to jump or climb','back'],['wobbly-back-legs','Wobbly back legs','back'],
  ['hunched-or-arched-posture','Hunched or arched posture','back'],['yelping-when-touched','Yelping when touched','back'],
  ['sudden-rear-weakness','Sudden rear weakness','back']]},
 {k:'skin-coat',n:'Skin & coat',ex:'Scratching, hot spots, flaky skin',s:[
  ['excessive-scratching','Excessive scratching','skin'],['red-or-irritated-skin','Red or irritated skin','skin'],
  ['raw-weepy-hot-spots','Raw, weepy hot spots','skin'],['constant-licking-of-one-spot','Constant licking of one spot','skin'],
  ['flaky-skin-or-dandruff','Flaky skin or dandruff','skin'],['hair-loss-or-bald-patches','Hair loss or bald patches','skin']]},
 {k:'tummy-gut',n:'Tummy & gut',ex:'Loose stools, wind, appetite changes',s:[
  ['loose-stools-or-diarrhoea','Loose stools or diarrhoea','tummy'],['excessive-wind','Excessive wind','tummy'],
  ['gurgling-noisy-stomach','Gurgling, noisy stomach','tummy'],['vomiting-or-regurgitation','Vomiting or regurgitation','tummy'],
  ['appetite-changes','Appetite changes','tummy'],['weight-gain','Weight gain','weight']]},
 {k:'eyes-ears',n:'Eyes & ears',ex:'Scratching at ears, head shaking',s:[
  ['scratching-at-ears','Scratching at ears','ears'],['head-shaking','Head shaking','ears'],
  ['odour-from-the-ears','Odour from the ears','ears'],['red-inflamed-ear-flaps','Red, inflamed ear flaps','ears'],
  ['weepy-or-red-eyes','Weepy or red eyes','ears']]},
 {k:'mouth-teeth',n:'Mouth & teeth',ex:'Bad breath, tartar, sore gums',s:[
  ['bad-breath','Bad breath','teeth'],['yellow-or-brown-tartar','Yellow or brown tartar','teeth'],
  ['bleeding-or-red-gums','Bleeding or red gums','teeth'],['dropping-food-slow-chewing','Dropping food or slow chewing','teeth'],
  ['pawing-at-the-mouth','Pawing at the mouth','teeth']]},
 {k:'behaviour-mood',n:'Behaviour & mood',ex:'Worried alone, scared of noises',s:[
  ['whining-or-barking-when-alone','Whining or barking when alone','calm'],['trembling-at-noises','Trembling at noises','calm'],
  ['pacing-or-restlessness','Pacing or restlessness','calm'],['hiding-or-unusually-clingy','Hiding or unusually clingy','calm'],
  ['destructive-behaviour','Destructive behaviour','calm']]},
 {k:'whole-body',n:'Whole body',ex:'Slowing down, low energy, weight',s:[
  ['general-stiffness-with-age','General stiffness with age','senior'],['low-energy-or-lethargy','Low energy or lethargy','senior'],
  ['weight-management','Trouble managing weight','weight'],['post-surgery-recovery','Recovering from surgery or injury','recovery'],
  ['drinking-more-than-usual','Drinking more than usual','kidney']]}
];
var AREA={},SYM={};
AREAS.forEach(function(a){AREA[a.k]=a;a.syms=a.s.map(function(x){var k=a.k+'/'+x[0];SYM[k]={k:k,n:x[1],need:x[2],area:a.k};return SYM[k]})});

/* What a dog can need. {n} is the dog's name. */
var NEEDS={
 joints:{t:'Joint and mobility support',s:'Daily joint support, plus comfort at home, to keep {n} moving easily.',tags:['arthritis'],area:'legs-paws'},
 back:{t:'Back and spine care',s:'A supported spine and fewer big jumps help {n} stay comfortable.',tags:['back-pain'],area:'back-spine'},
 grip:{t:'Grip and paw protection',s:'Boots and braces protect {n}’s paws and help with footing on walks.',tags:['knuckling','rear-leg-weakness'],area:'legs-paws'},
 skin:{t:'Itch relief and skin care',s:'Soothe the itch on the outside and feed the skin from the inside.',tags:['itchy-skin','seasonal-allergies'],area:'skin-coat'},
 ears:{t:'Ear and eye care',s:'Gentle, regular cleaning keeps {n}’s ears and eyes comfortable.',tags:['ear-eye-care'],area:'eyes-ears'},
 teeth:{t:'Clean teeth and fresh breath',s:'A minute of dental care a day makes a real difference for {n}.',tags:['dental-disease'],area:'mouth-teeth'},
 tummy:{t:'A settled tummy',s:'Gut support and gentle food help settle {n}’s digestion.',tags:['digestive-issues'],area:'tummy-gut'},
 weight:{t:'A healthy weight',s:'Lighter food, smarter treats and slower meals help {n} stay trim.',tags:['weight-management'],area:'whole-body'},
 calm:{t:'Calm and confidence',s:'Calming support and something to focus on help {n} feel settled.',tags:['anxiety'],area:'behaviour-mood'},
 senior:{t:'Senior support',s:'All-round support for an older dog, from joints to energy.',tags:['senior-support'],area:'whole-body'},
 recovery:{t:'Recovery and healing',s:'Protect the wound and keep {n} comfortable while they heal.',tags:['post-surgery-recovery','wound-recovery'],area:'whole-body'},
 kidney:{t:'Kidney support',s:'Gentle daily support for kidney health and hydration.',tags:['kidney-support'],area:'whole-body'}
};
/* primary need per area, used when an area is chosen without symptoms */
var AREA_NEED={'legs-paws':'joints','back-spine':'back','skin-coat':'skin','tummy-gut':'tummy','eyes-ears':'ears','mouth-teeth':'teeth','behaviour-mood':'calm','whole-body':'senior'};

var AGE=[{k:0,t:'Puppy',d:'Under 1 year'},{k:1,t:'Adult',d:'1 to 7 years'},{k:2,t:'Senior',d:'7 to 10 years'},{k:3,t:'Golden oldie',d:'Over 10 years'}];
var SIZE=[{k:0,t:'Small',d:'Under 10kg, like a Jack Russell'},{k:1,t:'Medium',d:'10 to 25kg, like a Cocker Spaniel'},{k:2,t:'Large',d:'25 to 45kg, like a Labrador'},{k:3,t:'Giant',d:'Over 45kg, like a Great Dane'}];
var BREED=[{k:'long',t:'Long back, short legs',d:'Dachshund, Corgi, Basset Hound'},{k:'flat',t:'Flat-faced',d:'Pug, French Bulldog, Bulldog'},{k:'working',t:'Working or sporting',d:'Labrador, Spaniel, Collie'},{k:'mixed',t:'Mixed, or none of these',d:'Crossbreeds and everyone else'}];


/* ---------- product kind, used for placeholders and the "what suits you" question ---------- */
var KIND_LABEL={supp:'Supplement',food:'Food & treats',home:'Support & comfort',care:'Care',kit:'Care kit'};
function kind(p){
  if(p._k)return p._k;
  var t=(p.productType||'').toLowerCase(),all=t+' '+(p.title||'').toLowerCase(),k;
  if(/bundle|gift set/.test(t))k='kit';
  else if(/shampoo|groom|spray|balm|wipe|gel|clean|conditioner|dental|toothpaste|first aid|bandage|wound|disinfect|sanitis|cologne|flea|tick|glove|towel/.test(t))k='care';
  else if(/supplement|digestive support|wellness|pet health|healthcare/.test(t))k='supp';
  else if(/food|treat|topper|diet/.test(t))k='food';
  else if(/bed|ramp|stairs|mobility|blanket|mat|pad|wheelchair|harness|brace|splint|boot|rehab|support|jacket|coat|carrier|bowl|feeder|toy|enrichment|lead|collar|shirt|wear|cover|wrap|light/.test(t))k='home';
  else if(/chew|powder|oil|capsule|tablet|probiotic/.test(all))k='supp';
  else k='care';
  p._k=k;return k;
}

/* ---------- the recommender ---------- */
function dogName(st,cap){var n=(st.name||'').trim();return n?n:(cap?'Your dog':'your dog')}
function poss(st,cap){var n=(st.name||'').trim();return n?n+'’s':(cap?'Your dog’s':'your dog’s')}
function fill(s,st){return s.replace(/\{n\}’s/g,poss(st)).replace(/\{n\}/g,dogName(st))}

function recommend(st){
  var syms=st.syms||[],extra=st.extra||[],kinds=(st.kinds||[]).filter(function(k){return k!=='mix'});
  var score={},why={},keys={};
  function need(n,sc,reason){score[n]=(score[n]||0)+sc;why[n]=why[n]||[];if(reason&&!has(why[n],reason))why[n].push(reason)}
  function key(n,k,w){if(!TAGS[k])return;keys[n]=keys[n]||{};keys[n][k]=Math.max(keys[n][k]||0,w)}
  syms.forEach(function(k){var s=SYM[k];if(!s)return;need(s.need,10,s.n);key(s.need,k,10);key(s.need,s.area,3)});
  (st.areas||[]).forEach(function(a){
    var any=syms.some(function(k){return SYM[k]&&SYM[k].area===a});
    if(!any){var n=AREA_NEED[a];need(n,7,AREA[a].n);key(n,a,8)}
  });
  if(has(syms,'skin-coat/raw-weepy-hot-spots')||has(syms,'skin-coat/constant-licking-of-one-spot'))key('skin','hot-spots',8);
  if(has(syms,'behaviour-mood/whining-or-barking-when-alone')||has(syms,'behaviour-mood/destructive-behaviour'))key('calm','separation-anxiety',8);
  if(has(syms,'behaviour-mood/trembling-at-noises'))key('calm','noise-fear',8);
  if(has(syms,'back-spine/wobbly-back-legs')||has(syms,'back-spine/sudden-rear-weakness'))key('back','rear-leg-weakness',6);
  if(has(syms,'legs-paws/holding-a-paw-up')||has(syms,'legs-paws/limping-or-favouring-a-leg'))key('joints','cruciate-ligament',4);
  if(has(syms,'legs-paws/scuffed-nails-or-dragging-paws'))key('grip','knuckling',8);
  /* the dog: age, size, breed type */
  var age=st.age,size=st.size,breed=st.breed;
  if(age>=2){need('senior',age===3?7:4,AGE[age].t);key('senior','senior-support',7);if(score.joints){score.joints+=3;key('joints','senior-support',3)}if(score.back)key('back','spondylosis',4)}
  if(age===0){if(score.calm)key('calm','anxiety',6)}
  if(breed==='long'){
    if(score.back){score.back+=6;key('back','ivdd',10);why.back.push('Long back, short legs')}
    else if(score.joints){score.joints+=2;key('joints','ivdd',3)}
    else{need('back',3,'Long back, short legs');key('back','ivdd',7)}
  }
  if(size>=2){if(score.joints){score.joints+=3;key('joints','hip-dysplasia',6);key('joints','elbow-dysplasia',4);why.joints.push(SIZE[size].t+' dog')}}
  if(breed==='working'&&score.joints){score.joints+=1;key('joints','cruciate-ligament',5)}
  if(breed==='flat'){if(score.skin)score.skin+=2;if(score.ears)score.ears+=2}
  /* anything else going on */
  if(has(extra,'surgery')){need('recovery',12,'Recovering from an operation');key('recovery','post-surgery-recovery',9);key('recovery','wound-recovery',7)}
  if(has(extra,'weight')){need('weight',9,'A little extra weight');key('weight','weight-management',8);key('weight','whole-body/weight-management',9)}
  if(has(extra,'older')){need('senior',8,'Slowing down with age');key('senior','senior-support',8);key('senior','whole-body/general-stiffness-with-age',7)}
  /* nothing specific: keep them well, by profile */
  if(!Object.keys(score).length){
    if(age>=2){need('senior',6,AGE[age].t);key('senior','senior-support',8)}
    if(breed==='long'){need('back',5,'Long back, short legs');key('back','ivdd',8)}
    if(size>=2||breed==='working'){need('joints',5,'Keeping joints well');key('joints','arthritis',6)}
    if(breed==='flat'){need('skin',4,'Flat-faced breeds');key('skin','itchy-skin',6)}
    if(age===0){need('calm',4,'Puppy');key('calm','anxiety',6)}
    need('teeth',3,'Everyday care');key('teeth','dental-disease',6);
    if(Object.keys(score).length<2){need('joints',2,'Everyday care');key('joints','arthritis',5)}
  }
  /* every need also draws on its own condition and area lists */
  Object.keys(score).forEach(function(n){var d=NEEDS[n];d.tags.forEach(function(t){key(n,t,5)});key(n,d.area,2)});

  var order=Object.keys(score).sort(function(a,b){return score[b]-score[a]}).slice(0,4);
  var used={};
  var needs=order.map(function(n){
    var sc={},ks=keys[n]||{};
    Object.keys(ks).forEach(function(k){(TAGS[k]||[]).forEach(function(h,i){sc[h]=(sc[h]||0)+ks[k]*Math.max(.35,1-i*.09)})});
    var list=Object.keys(sc).filter(function(h){return BY[h]&&!used[h]}).map(function(h){
      var p=BY[h],s=sc[h];
      if(p.rating)s+=(p.rating-3.5)*.6+Math.log(1+p.reviewCount)*.35;
      if(kinds.length){var kk=kind(p);if(has(kinds,kk))s+=6;else if(kk!=='kit')s-=1}
      return {p:p,s:s};
    }).sort(function(a,b){return b.s-a.s}).map(function(x){return x.p});
    var items=list.slice(0,6);items.slice(0,3).forEach(function(p){used[p.handle]=1});
    var d=NEEDS[n];
    return {id:n,t:d.t,s:fill(d.s,st),why:why[n]||[],area:d.area,areaName:AREA[d.area].n,items:items.slice(0,3),more:items.slice(3,6)};
  }).filter(function(x){return x.items.length});
  return {needs:needs,kit:needs.length>=3?needs.slice(0,3).map(function(x){return x.items[0]}):topN(needs,3)};
}
function topN(needs,n){var out=[];for(var r=0;r<3&&out.length<n;r++)needs.forEach(function(x){if(x.items[r]&&out.length<n)out.push(x.items[r])});return out}
function total(ps){return ps.reduce(function(a,p){return a+p.price},0)}
function wasTotal(ps){return ps.reduce(function(a,p){return a+(p.compareAt&&p.compareAt>p.price?p.compareAt:p.price)},0)}

/* ---------- labels ---------- */
var HELPS={joints:'For stiff joints',back:'For back support',grip:'For grip and paws',skin:'For itchy skin',ears:'For ears and eyes',teeth:'For teeth and breath',tummy:'For a settled tummy',weight:'For a healthy weight',calm:'For calm and confidence',senior:'For older dogs',recovery:'For recovery',kidney:'For kidney support'};
var KIND_TAB={supp:'Supplements',food:'Food & treats',home:'Support & comfort',care:'Care',kit:'Care kit'};

/* ---------- the site's product card (.pk, from signed-off/home.html) ---------- */
function imgSrc(p){return p.img||p.cdn||''}
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function rev(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  var n=p.reviewCount||0;
  return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function well(p){
  var s=imgSrc(p);
  return s?'<img src="'+esc(s)+'" alt="" loading="lazy" data-hq-img>':'<span class="hq-noimg" aria-hidden="true"></span>';
}
function pk(p,o){
  o=o||{};
  var tab=o.tab!==undefined?o.tab:KIND_TAB[kind(p)],sale=p.compareAt&&p.compareAt>p.price;
  return '<article class="pk">'+(tab?'<span class="tab">'+esc(tab)+'</span>':'')+
    '<a class="well" href="#">'+well(p)+'</a><div class="body"><span class="brand">'+esc(p.brand)+'</span>'+
    '<a class="name" href="#">'+esc(cleanTitle(p.title))+'</a>'+rev(p)+
    (o.helps?'<span class="helps">'+esc(o.helps)+'</span>':'')+
    '<div class="price"><span class="now">'+money(p.price)+'</span>'+(sale?'<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>':'')+'</div>'+
    '<button class="btn" type="button" data-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
}
/* a blocked or missing photo falls back to a plain placeholder */
document.addEventListener('error',function(e){
  var t=e.target;
  if(t&&t.tagName==='IMG'&&t.hasAttribute('data-hq-img')){var s=document.createElement('span');s.className='hq-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);

/* ---------- the site's product rail (.railwrap > .rail.prail + .scroller) ---------- */
function rail(ps,o){
  o=o||{};
  return '<div class="railwrap hq-rw"><div class="rail prail" tabindex="0" aria-label="'+esc(o.label||'Products')+'">'+
    ps.map(function(p,i){return pk(p,{helps:o.helps,tab:(i===0&&o.top)?'Top pick':undefined})}).join('')+'</div>'+
    '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
}
var railUps=[];
function bindRails(root){
  $$('.hq-rw',root).forEach(function(w){
    if(w._hq)return;w._hq=1;
    var r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      w.classList.toggle('hq-fit',max<=2);
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
    }
    function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:RM?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:RM?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});
    railUps.push(up);up();
  });
}
window.addEventListener('resize',function(){railUps.forEach(function(f){f()})});

/* ---------- basket: header count and a small toast ---------- */
var toastEl,toastT;
function addToBasket(hs,btn){
  hs=[].concat(hs).filter(function(h){return BY[h]});if(!hs.length)return;
  var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+hs.length;
  cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='hq-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML='<span><b>'+(hs.length===1?'Added to basket':hs.length+' items added')+'</b>'+esc(hs.length===1?cleanTitle(BY[hs[0]].title):money(total(hs.map(function(h){return BY[h]})))+' in total')+'</span><a href="#">View basket ('+n+')</a>';
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3600);
  if(btn){var o=btn.getAttribute('data-o')||btn.textContent;btn.setAttribute('data-o',o);btn.textContent='Added';clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent=o},1800)}
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-add]');
  if(b){e.preventDefault();addToBasket(b.getAttribute('data-add').split(','),b)}
  var a=e.target.closest&&e.target.closest('a[href="#"]');
  if(a&&a.closest('[data-hq]'))e.preventDefault();
});

/* ---------- state, remembered in this browser between visits ---------- */
var KEY='pp-dog-health-quiz';
function newState(){return {name:'',age:null,size:null,breed:null,areas:[],syms:[],extra:[],seen:{}}}
function load(){
  var n=newState(),s=null;
  try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){s=null}
  if(!s||typeof s!=='object')return n;
  if(typeof s.name==='string')n.name=s.name.slice(0,20);
  ['age','size'].forEach(function(k){if(s[k]===0||s[k]===1||s[k]===2||s[k]===3)n[k]=s[k]});
  if(BREED.some(function(b){return b.k===s.breed}))n.breed=s.breed;
  if(Array.isArray(s.areas))n.areas=s.areas.filter(function(a){return AREA[a]||a==='none'}).slice(0,3);
  if(Array.isArray(s.syms))n.syms=s.syms.filter(function(k){return SYM[k]});
  if(Array.isArray(s.extra))n.extra=s.extra.filter(function(k){return EXTRA.some(function(x){return x.k===k})});
  if(s.seen&&typeof s.seen==='object')Object.keys(s.seen).forEach(function(k){n.seen[k]=1});
  return n;
}
function save(st){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function wipe(st){var n=newState();Object.keys(n).forEach(function(k){st[k]=n[k]});try{localStorage.removeItem(KEY)}catch(e){}}
function anyAnswer(st){return !!(st.name||st.age!=null||st.size!=null||st.breed||st.areas.length||Object.keys(st.seen).length)}
function realAreas(st){return (st.areas||[]).filter(function(a){return AREA[a]})}
function clean(st){
  var ar=realAreas(st);
  return {name:st.name,age:st.age,size:st.size,breed:st.breed,areas:ar,
    syms:(st.syms||[]).filter(function(k){return SYM[k]&&has(ar,SYM[k].area)}),
    extra:(st.extra||[]).filter(function(k){return k!=='none'}),kinds:[]};
}
function profile(st){
  var b=[],c=clean(st);
  if(st.age!=null)b.push(AGE[st.age].t);
  if(st.size!=null)b.push(SIZE[st.size].t);
  if(st.breed&&st.breed!=='mixed')BREED.forEach(function(x){if(x.k===st.breed)b.push(x.t)});
  c.syms.forEach(function(k){b.push(SYM[k].n)});
  if(!c.syms.length)c.areas.forEach(function(a){b.push(AREA[a].n)});
  c.extra.forEach(function(k){EXTRA.forEach(function(x){if(x.k===k)b.push(x.t)})});
  return b;
}
function chipsHtml(st){var p=profile(st);return p.length?'<ul class="hq-prof">'+p.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul>':''}
/* the phone header's search bar stays stuck to the top: keep scroll targets clear of it */
function topOff(){var m=$('.msearch');if(!m)return 0;var cs=getComputedStyle(m);return cs.display!=='none'&&(cs.position==='sticky'||cs.position==='fixed')?m.offsetHeight:0}
function scrollTop(el,pad){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-topOff()-(pad==null?16:pad);window.scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'})}
/* only scroll when the top of the quiz has gone out of view */
function keepInView(el){if(!el)return;var r=el.getBoundingClientRect();if(r.top<topOff()-2)scrollTop(el)}
function T(v,st){return typeof v==='function'?v(st):(v||'')}
function nm(st){return esc(dogName(st))}

/* ---------- the questions: the same seven for every version ---------- */
var EXTRA=[{k:'older',t:'Slowing down with age',d:'Stiffer, sleepier or slower on walks'},{k:'weight',t:'Carrying a little extra weight',d:'A bit round in the middle'},{k:'surgery',t:'Recovering from an operation',d:'Or healing from an injury'},{k:'none',t:'None of these',d:'Nothing else to add',x:1}];
var AREA_OPTS=AREAS.map(function(a){return {k:a.k,t:a.n,d:a.ex}}).concat([{k:'none',t:'Nothing in particular',d:'Just keeping them well',x:1}]);
var STEPS=[
  {id:'name',label:'Name',type:'text',key:'name',q:'What is your dog <em>called</em>?',hint:'So we can make the results about them. You can skip this.'},
  {id:'age',label:'Age',type:'single',key:'age',opts:AGE,q:function(st){return 'How old is <em>'+nm(st)+'</em>?'}},
  {id:'size',label:'Size',type:'single',key:'size',opts:SIZE,q:function(st){return 'How big is <em>'+nm(st)+'</em>?'}},
  {id:'breed',label:'Body type',type:'single',key:'breed',opts:BREED,q:function(st){return 'Is '+nm(st)+' one of these <em>types</em>?'},hint:'Some body shapes need a little extra support.'},
  {id:'areas',label:'Noticing',type:'multi',key:'areas',opts:AREA_OPTS,max:3,min:1,q:'Where are you <em>noticing</em> something?',hint:'Pick up to three areas.'},
  {id:'syms',label:'Signs',type:'multi',key:'syms',q:'What are you <em>seeing</em>?',hint:'Tap all that apply, or skip if you are not sure.',
    groups:function(st){return realAreas(st).map(function(k){var a=AREA[k];return {k:k,h:a.n,items:a.syms.map(function(s){return {k:s.k,t:s.n}})}})},
    skip:function(st){return !realAreas(st).length&&st.areas.length>0}},
  {id:'extra',label:'Also',type:'multi',key:'extra',opts:EXTRA,q:function(st){return 'Anything else going on with <em>'+nm(st)+'</em>?'},hint:'Optional. Pick any that fit.'}
];
var STEP={};STEPS.forEach(function(s){STEP[s.id]=s});
function vis(st){return STEPS.filter(function(s){return !s.skip||!s.skip(st)})}
function ready(s,st){
  if(s.type==='single')return st[s.key]!=null;
  if(s.type==='multi'&&s.min)return (st[s.key]||[]).length>=s.min;
  return true;
}
function done(s,st){return ready(s,st)&&(s.type==='single'||!!st.seen[s.id])}
function allDone(st){return vis(st).every(function(s){return done(s,st)})}
function firstOpen(st){var L=vis(st);for(var k=0;k<L.length;k++)if(!done(L[k],st))return k;return L.length-1}
function reachable(s,st){var L=vis(st),k=L.indexOf(s);return k>-1&&k<=firstOpen(st)||done(s,st)}
function answerText(s,st){
  var c=clean(st);
  if(s.type==='text')return st.name||(st.seen.name?'No name given':'');
  if(s.type==='single'){var o=s.opts.filter(function(x){return x.k===st[s.key]})[0];return o?o.t:''}
  if(s.id==='areas'){if(has(st.areas,'none'))return 'Nothing in particular';return c.areas.map(function(a){return AREA[a].n}).join(', ')}
  if(s.id==='syms'){if(c.syms.length)return c.syms.map(function(k){return SYM[k].n}).join(', ');return st.seen.syms?'Nothing specific':''}
  if(s.id==='extra'){if(c.extra.length)return c.extra.map(function(k){return EXTRA.filter(function(x){return x.k===k})[0].t}).join(', ');return st.seen.extra?'Nothing else':''}
  return '';
}
function ctaText(s,st,last){
  if(last&&ready(s,st))return 'See '+poss(st)+' results';
  if(s.type==='text'&&!st.name)return 'Skip';
  if(s.type==='multi'&&!s.min&&!(st[s.key]||[]).length)return 'Skip';
  return 'Continue';
}

/* ---------- rendering one question ---------- */
function optHtml(s,o,st,chip){
  var multi=s.type==='multi',v=st[s.key],on=multi?has(v||[],o.k):v===o.k;
  var a=' data-v="'+esc(o.k)+'"'+(o.x?' data-x="1"':'')+' aria-pressed="'+on+'"';
  if(chip)return '<button type="button" class="hq-chip"'+a+'>'+esc(o.t)+'</button>';
  return '<button type="button" class="hq-o'+(multi?' hq-multi':'')+'"'+a+'><span class="hq-o-m" aria-hidden="true"></span><span class="hq-o-t"><b>'+esc(o.t)+'</b>'+(o.d?'<span>'+esc(o.d)+'</span>':'')+'</span></button>';
}
function bodyHtml(s,st,uid){
  uid=uid||s.id;
  if(s.type==='text')return '<form class="hq-name" novalidate><label class="sr" for="hq-in-'+uid+'">Your dog’s name</label><input id="hq-in-'+uid+'" type="text" maxlength="20" autocomplete="off" autocapitalize="words" enterkeyhint="next" placeholder="Their name" value="'+esc(st[s.key]||'')+'"></form>';
  if(s.groups)return '<div class="hq-groups">'+s.groups(st).map(function(g){var id='hq-g-'+uid+'-'+g.k;return '<div class="hq-grp" role="group" aria-labelledby="'+id+'"><h3 id="'+id+'">'+esc(g.h)+'</h3><div class="hq-chips">'+g.items.map(function(o){return optHtml(s,o,st,1)}).join('')+'</div></div>'}).join('')+'</div>';
  return '<div class="hq-opts hq-n'+s.opts.length+'" role="group" aria-label="Answers">'+s.opts.map(function(o){return optHtml(s,o,st)}).join('')+'</div>';
}
function qHtml(s,st,uid,tag){
  tag=tag||'h2';
  return '<'+tag+' class="hq-q" id="hq-q-'+(uid||s.id)+'" tabindex="-1">'+T(s.q,st)+'</'+tag+'>'+(s.hint?'<p class="hq-hint">'+esc(T(s.hint,st))+'</p>':'');
}
function parseV(raw){return /^\d+$/.test(raw)?+raw:raw}
/* wire a rendered question: onChange after any edit, onPick(pointer) after a single choice or Enter in the name */
function bindQ(host,s,st,onChange,onPick){
  if(s.type==='text'){
    var f=$('form',host),inp=$('input',host);
    inp.addEventListener('input',function(){st[s.key]=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()});onChange&&onChange()});
    f.addEventListener('submit',function(e){e.preventDefault();onPick&&onPick(false)});
    return;
  }
  host.addEventListener('click',function(e){
    var b=e.target.closest('.hq-o,.hq-chip');if(!b||!host.contains(b))return;
    var v=parseV(b.getAttribute('data-v')),bs=$$('.hq-o,.hq-chip',host);
    if(s.type==='single'){
      st[s.key]=v;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      onChange&&onChange();onPick&&onPick(e.detail>0);return;
    }
    var arr=(st[s.key]||[]).slice();
    if(has(arr,v))arr.splice(arr.indexOf(v),1);
    else{
      if(b.hasAttribute('data-x'))arr=[];
      else arr=arr.filter(function(k){var o=$('[data-v="'+k+'"]',host);return !(o&&o.hasAttribute('data-x'))});
      arr.push(v);
      if(s.max&&arr.length>s.max)arr.shift();
    }
    st[s.key]=arr;
    bs.forEach(function(x){x.setAttribute('aria-pressed',has(arr,parseV(x.getAttribute('data-v'))))});
    onChange&&onChange();
  });
  /* arrow keys move between answers */
  host.addEventListener('keydown',function(e){
    var b=e.target.closest&&e.target.closest('.hq-o,.hq-chip');if(!b)return;
    var d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!d)return;
    var bs=$$('.hq-o,.hq-chip',host),k=bs.indexOf(b)+d;if(k<0||k>=bs.length)return;
    e.preventDefault();bs[k].focus();
  });
}
function focusQ(el,s){
  if(!el)return;
  if(s.type==='text'){var inp=$('input',el);if(inp){inp.focus({preventScroll:true});return}}
  var h=$('.hq-q',el);h&&h.focus({preventScroll:true});
}

/* ---------- one question at a time (A and B) ---------- */
function Stepper(o){
  var st=o.st,L=vis(st),i=firstOpen(st),t;
  function sync(){
    var s=L[i],last=i===L.length-1;
    o.next.disabled=!ready(s,st);o.next.textContent=ctaText(s,st,last);
    if(o.skip)o.skip.hidden=!(allDone(st)&&!last);
  }
  function render(dir,focus){
    L=vis(st);i=Math.max(0,Math.min(i,L.length-1));var s=L[i];
    o.back.hidden=i===0;
    o.host.innerHTML='<div class="hq-step'+(dir&&!RM?(dir>0?' hq-in-f':' hq-in-b'):'')+'" data-step="'+s.id+'">'+qHtml(s,st)+bodyHtml(s,st)+'</div>';
    var step=$('.hq-step',o.host);
    bindQ(step,s,st,function(){save(st);sync();o.onChange&&o.onChange(s)},function(ptr){
      if(s.type==='text'){go(1);return}
      if(ptr){clearTimeout(t);t=setTimeout(function(){go(1)},RM?80:320)}
    });
    sync();o.onStep&&o.onStep(i,L.length,s);
    if(focus)focusQ(step,s);
  }
  function go(d){
    clearTimeout(t);
    var s=L[i];
    if(d>0){
      if(!ready(s,st))return;
      st.seen[s.id]=1;save(st);L=vis(st);
      if(i>=L.length-1){o.onChange&&o.onChange(s);o.onDone();return}
    }
    i=Math.max(0,Math.min(L.length-1,i+d));render(d,true);
  }
  function to(id){L=vis(st);var k=L.map(function(x){return x.id}).indexOf(id);if(k<0)return;var d=k>=i?1:-1;i=k;render(d,true)}
  o.back.addEventListener('click',function(){go(-1)});
  o.next.addEventListener('click',function(){go(1)});
  if(o.skip)o.skip.addEventListener('click',function(){if(allDone(st))o.onDone()});
  render(0,false);
  return {go:go,to:to,render:render,current:function(){return L[i]},restart:function(){i=0;render(0,true)}};
}
function segs(el,i,n){
  var h='';for(var k=0;k<n;k++)h+='<span class="'+(k<i?'done':k===i?'on':'')+'"></span>';
  el.innerHTML=h;el.setAttribute('aria-valuenow',i+1);el.setAttribute('aria-valuemax',n);el.setAttribute('aria-valuetext','Question '+(i+1)+' of '+n);
}

/* ---------- shared result blocks ---------- */
function resHead(st,r){
  return '<div class="hq-rh"><div class="hq-rh-t"><h2 tabindex="-1">What <em>'+nm(st)+'</em> needs</h2>'+
    '<p>'+(r.needs.length===1?'One thing will help most':(['','','Two','Three','Four'][r.needs.length]||r.needs.length)+' things will help most')+', matched to your answers. Top pick first.</p>'+chipsHtml(st)+'</div>'+
    '<div class="hq-rh-b"><button class="hq-ghost" type="button" data-edit>Edit answers</button><button class="hq-ghost" type="button" data-again>Start again</button></div></div>';
}
function needHead(n,i,tag){
  tag=tag||'h3';
  return '<div class="sec-h"><div><'+tag+' id="hq-nh-'+n.id+'">'+esc(n.t)+'</'+tag+'><p>'+esc(n.s)+'</p></div><div class="sec-r"><a class="all" href="#">Shop '+esc(n.areaName.toLowerCase())+' ›</a></div></div>';
}
function needRail(n){return rail(n.items.concat(n.more),{helps:HELPS[n.id],top:true,label:n.t})}
function needSecs(r){return r.needs.map(function(n,i){return '<section class="hq-need" id="hq-n-'+n.id+'" aria-labelledby="hq-nh-'+n.id+'">'+needHead(n,i)+needRail(n)+'</section>'}).join('')}
function delivery(t){return t>=39?'Qualifies for free UK delivery.':'Free UK delivery on orders over £39.'}
function addAll(ps){return '<button class="btn" type="button" data-add="'+ps.map(function(p){return p.handle}).join(',')+'">Add all '+ps.length+' to basket</button>'}
function needOf(r,p){var n=r.needs.filter(function(x){return has(x.items,p)})[0];return n?HELPS[n.id]:''}
function thumb(p){return '<span class="hq-th">'+well(p)+'</span>'}
var VET='<p class="hq-vet">Our guides don’t replace your vet.</p>';
function allMatches(r){var seen={};r.needs.forEach(function(n){n.items.concat(n.more).forEach(function(p){seen[p.handle]=1})});return Object.keys(seen).length}

/* ==========================================================================
   A: a centred card stepper, with a slim summary of answers at the side.
   ========================================================================== */
function initA(root){
  var st=load(),stage=$('#hq-stage',root),box=$('.hq-a-box',stage),card=$('.hq-a-card',stage),res=$('#hq-res',root);
  var sum=$('.hq-sum',stage),tog=$('.hq-a-sumtog',stage),reset=$('.hq-reset',stage);
  function side(cur){
    var L=vis(st),n=L.filter(function(s){return done(s,st)}).length;
    sum.innerHTML=L.map(function(s){
      var v=answerText(s,st),d=done(s,st),on=cur&&s.id===cur.id,go=reachable(s,st)&&!on;
      return '<li class="'+(on?'is-on ':'')+(d?'is-done':'')+'"><button type="button" data-goto="'+s.id+'"'+(go?'':' disabled')+(on?' aria-current="step"':'')+'>'+
        '<span class="hq-sum-k">'+esc(s.label)+'</span><span class="hq-sum-v">'+(v?esc(v):on?'Answering now':'Not yet')+'</span>'+
        (go&&d?'<span class="hq-sum-e" aria-hidden="true">Edit</span>':'')+'</button></li>';
    }).join('');
    $('[data-n]',tog).textContent=n+' of '+L.length;
    reset.hidden=!anyAnswer(st);
  }
  var flow=Stepper({st:st,host:$('[data-q]',stage),back:$('.hq-back',stage),next:$('.hq-next',stage),skip:$('[data-skip]',stage),
    onStep:function(i,n,s){segs($('.hq-seg',stage),i,n);$('.hq-count',stage).innerHTML='Question <b>'+(i+1)+'</b> of '+n;side(s);keepInView(card)},
    onChange:function(){side(flow&&flow.current())},
    onDone:show});
  sum.addEventListener('click',function(e){var b=e.target.closest('[data-goto]');if(b&&!b.disabled){flow.to(b.getAttribute('data-goto'));if(window.innerWidth<1024){stage.classList.remove('hq-sum-open');tog.setAttribute('aria-expanded','false')}}});
  tog.addEventListener('click',function(){var o=stage.classList.toggle('hq-sum-open');tog.setAttribute('aria-expanded',o)});
  reset.addEventListener('click',function(){wipe(st);flow.restart()});
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();if(!res.hidden)return scrollTop(res);scrollTop(stage);setTimeout(function(){focusQ(card,flow.current())},RM?0:400)})});
  function show(){
    var r=recommend(clean(st));
    res.innerHTML=resHead(st,r)+needSecs(r)+kitCard(r,st)+VET;
    box.hidden=true;res.hidden=false;bindRails(res);
    $('[data-edit]',res).addEventListener('click',function(){res.hidden=true;box.hidden=false;flow.to('name');scrollTop(stage)});
    $('[data-again]',res).addEventListener('click',function(){wipe(st);res.hidden=true;box.hidden=false;flow.restart();scrollTop(stage)});
    scrollTop(res);$('h2',res).focus({preventScroll:true});
  }
}
function kitCard(r,st){
  var ps=r.kit,t=total(ps),w=wasTotal(ps);
  return '<section class="hq-kit" aria-labelledby="hq-kit-h"><div class="hq-kit-in">'+
    '<div class="hq-kit-l"><h2 id="hq-kit-h">'+esc(poss(st,true))+' <em>starter kit</em></h2><p>Our top pick for each need, in one basket.</p>'+
    '<div class="hq-kit-tot"><span>'+ps.length+' items</span>'+(w>t+.001?'<s>'+money(w)+'</s>':'')+'<b>'+money(t)+'</b></div>'+addAll(ps)+
    '<p class="hq-kit-note">'+delivery(t)+'</p></div>'+
    '<div class="hq-kit-cards">'+ps.map(function(p){return pk(p,{helps:needOf(r,p),tab:null})}).join('')+'</div></div></section>';
}

/* ==========================================================================
   B: questions on the left, a "Your dog" card on the right that fills in.
   ========================================================================== */
function initB(root){
  var st=load(),stage=$('#hq-stage',root),grid=$('.hq-b-grid',stage),main=$('.hq-b-main',stage),prof=$('.hq-b-card',stage),res=$('#hq-res',root),reset=$('.hq-reset',stage),last={};
  function row(id,val,cur){
    var s=STEP[id],d=done(s,st),on=cur&&cur.id===id,go=reachable(s,st)&&!on;
    return '<li><button type="button" class="hq-b-row'+(on?' is-on':'')+'" data-goto="'+id+'"'+(go?'':' disabled')+'><span class="k">'+esc(s.label)+'</span><span class="v'+(val?'':' none')+'">'+(val||(on?'Answering now':'Not yet'))+'</span>'+(go&&d?'<span class="e" aria-hidden="true">Edit</span>':'<span></span>')+'</button></li>';
  }
  function card(cur){
    var c=clean(st),L=vis(st),name=(st.name||'').trim();
    var sub=[];if(st.age!=null)sub.push(AGE[st.age].t);if(st.size!=null)sub.push(SIZE[st.size].t.toLowerCase());
    var tags=[];c.areas.forEach(function(a){var ss=c.syms.filter(function(k){return SYM[k].area===a});if(ss.length)ss.forEach(function(k){tags.push(SYM[k].n)});else tags.push(AREA[a].n)});
    if(has(st.areas,'none'))tags.push('Nothing in particular');
    c.extra.forEach(function(k){EXTRA.forEach(function(x){if(x.k===k)tags.push(x.t)})});
    var br=st.breed?BREED.filter(function(x){return x.k===st.breed})[0].t:'';
    var rows=row('age',esc(answerText(STEP.age,st)),cur)+row('size',esc(answerText(STEP.size,st)),cur)+row('breed',esc(br),cur)+
      '<li><button type="button" class="hq-b-row'+(cur&&(cur.id==='areas'||cur.id==='syms')?' is-on':'')+'" data-goto="areas"'+(reachable(STEP.areas,st)&&!(cur&&cur.id==='areas')?'':' disabled')+'><span class="k">Noticing</span><span class="v'+(tags.length?'':' none')+'">'+(tags.length?'<span class="hq-b-tags">'+tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</span>':(cur&&(cur.id==='areas'||cur.id==='syms'||cur.id==='extra')?'Answering now':'Not yet'))+'</span>'+(done(STEP.areas,st)&&!(cur&&cur.id==='areas')?'<span class="e" aria-hidden="true">Edit</span>':'<span></span>')+'</button></li>';
    var r=recommend(c),n=allMatches(r),ps=topN(r.needs,3),started=st.age!=null||c.areas.length;
    prof.innerHTML='<div class="hq-b-id"><span class="hq-b-av" aria-hidden="true">'+esc(name?name.charAt(0).toUpperCase():'?')+'</span><div><h2 class="hq-b-nm">'+(name?esc(name):'Your dog')+'</h2><p class="hq-b-sub">'+(sub.length?esc(sub.join(', ')):'Fills in as you answer')+'</p></div>'+
      (name||reachable(STEP.name,st)&&cur&&cur.id!=='name'?'<button type="button" class="hq-b-rename" data-goto="name">'+(name?'Rename':'Add name')+'</button>':'')+'</div>'+
      '<ul class="hq-b-rows">'+rows+'</ul>'+
      '<div class="hq-b-match" aria-live="polite">'+(started?'<b class="hq-b-num">'+n+'</b><p>products match '+(allDone(st)?esc(dogName(st)):'so far')+'</p><span class="hq-b-thumbs" aria-hidden="true">'+ps.map(thumb).join('')+'</span>':'<p>Answer a few questions to see what matches.</p>')+'</div>';
    /* a gentle flash on anything that has just changed */
    $$('.hq-b-row',prof).forEach(function(b){var k=b.getAttribute('data-goto'),v=$('.v',b).textContent;if(last[k]!==undefined&&last[k]!==v&&!RM){b.classList.add('is-new')}last[k]=v});
    reset.hidden=!anyAnswer(st);
  }
  var flow=Stepper({st:st,host:$('[data-q]',stage),back:$('.hq-back',stage),next:$('.hq-next',stage),skip:$('[data-skip]',stage),
    onStep:function(i,n,s){$('.hq-count',stage).innerHTML='Question <b>'+(i+1)+'</b> of '+n;var b=$('.hq-b-bar',stage);$('i',b).style.width=Math.round(i/n*100)+'%';b.setAttribute('aria-valuenow',i+1);b.setAttribute('aria-valuemax',n);card(s);keepInView(main)},
    onChange:function(s){card(flow?flow.current():s)},onDone:show});
  prof.addEventListener('click',function(e){var b=e.target.closest('[data-goto]');if(b&&!b.disabled){flow.to(b.getAttribute('data-goto'));if(window.innerWidth<1024)scrollTop(main)}});
  reset.addEventListener('click',function(){wipe(st);last={};flow.restart()});
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();if(!res.hidden)return scrollTop(res);scrollTop(stage);setTimeout(function(){focusQ(main,flow.current())},RM?0:400)})});
  function show(){
    var r=recommend(clean(st)),ps=r.kit,t=total(ps),w=wasTotal(ps);
    res.innerHTML='<div class="hq-b-rl">'+resHead(st,r)+needSecs(r)+VET+'</div>'+
      '<aside class="hq-b-kit" aria-labelledby="hq-kit-h"><div class="hq-b-kin"><h2 id="hq-kit-h">'+esc(poss(st,true))+' <em>kit</em></h2><p>Our top pick for each need.</p><ul>'+
      ps.map(function(p){return '<li>'+thumb(p)+'<span class="hq-b-kn"><span>'+esc(needOf(r,p))+'</span>'+esc(cleanTitle(p.title))+'</span><b>'+money(p.price)+'</b></li>'}).join('')+'</ul>'+
      '<div class="hq-b-tot"><span>'+ps.length+' items'+(w>t+.001?' <s>'+money(w)+'</s>':'')+'</span><b>'+money(t)+'</b></div>'+addAll(ps)+'<p class="hq-b-note">'+delivery(t)+'</p></div></aside>';
    grid.hidden=true;res.hidden=false;bindRails(res);
    $('[data-edit]',res).addEventListener('click',function(){res.hidden=true;grid.hidden=false;flow.to('name');scrollTop(stage)});
    $('[data-again]',res).addEventListener('click',function(){wipe(st);last={};res.hidden=true;grid.hidden=false;flow.restart();scrollTop(stage)});
    scrollTop(res);$('h2',res).focus({preventScroll:true});
  }
}

/* ==========================================================================
   C: a checklist. Each question folds into a one-line answer once done and the
   next one opens below. Results appear underneath and update if you change
   an answer.
   ========================================================================== */
function initC(root){
  var st=load(),stage=$('#hq-stage',root),list=$('.hq-c-list',stage),res=$('#hq-res',root),end=$('.hq-c-end',stage),go=$('[data-results]',stage),reset=$('.hq-reset',stage);
  var openId=null,shown=false,tm,tr;
  list.innerHTML=STEPS.map(function(s,k){
    return '<li class="hq-c-it" data-id="'+s.id+'"><div class="hq-c-hd"><span class="hq-c-n" aria-hidden="true"></span>'+
      '<div class="hq-c-tt"><h3 class="hq-c-q" id="hq-cq-'+s.id+'"></h3><p class="hq-c-a"></p></div>'+
      '<button class="hq-c-chg" type="button" aria-controls="hq-cb-'+s.id+'" aria-expanded="false">Change<span class="sr"> answer</span></button></div>'+
      '<div class="hq-c-bd" id="hq-cb-'+s.id+'" role="region" aria-labelledby="hq-cq-'+s.id+'"><div class="hq-c-bi"><div class="hq-c-pad"><div data-body></div>'+
      '<div class="hq-c-foot"><button class="btn hq-next" type="button">Continue</button></div></div></div></div></li>';
  }).join('');
  function li(id){return $('.hq-c-it[data-id="'+id+'"]',list)}
  function fillBody(s){
    var el=li(s.id),b=$('[data-body]',el);
    b.innerHTML=(s.hint?'<p class="hq-hint">'+esc(T(s.hint,st))+'</p>':'')+bodyHtml(s,st,'c-'+s.id);
    bindQ(b,s,st,function(){save(st);changed(s)},function(ptr){if(s.type==='text'){next(s);return}if(ptr){clearTimeout(tm);tm=setTimeout(function(){next(s)},RM?80:320)}});
  }
  function paint(){
    var L=vis(st),n=L.filter(function(s){return done(s,st)}).length;
    STEPS.forEach(function(s){
      var el=li(s.id),k=L.indexOf(s),on=openId===s.id,d=done(s,st),can=k>-1&&reachable(s,st);
      el.hidden=k<0;if(k<0)return;
      el.classList.toggle('is-open',on);el.classList.toggle('is-done',d&&!on);el.classList.toggle('is-locked',!can&&!on);
      $('.hq-c-n',el).textContent=k+1;
      $('.hq-c-q',el).innerHTML=T(s.q,st);
      $('.hq-c-a',el).textContent=answerText(s,st);
      var chg=$('.hq-c-chg',el);chg.hidden=!(can&&!on&&d);chg.setAttribute('aria-expanded',on);
      var bd=$('.hq-c-bd',el);if(on){bd.removeAttribute('inert');bd.removeAttribute('aria-hidden')}else{bd.setAttribute('inert','');bd.setAttribute('aria-hidden','true')}
      var nx=$('.hq-next',el),lastQ=k===L.length-1;nx.disabled=!ready(s,st);nx.textContent=lastQ&&ready(s,st)?(shown?'Update results':'See '+poss(st)+' results'):ctaText(s,st,false);
    });
    $('.hq-count',stage).innerHTML='<b>'+n+'</b> of '+L.length+' answered';
    var bar=$('.hq-c-bar',stage);$('i',bar).style.width=Math.round(n/L.length*100)+'%';bar.setAttribute('aria-valuenow',n);bar.setAttribute('aria-valuemax',L.length);
    var ok=allDone(st);end.hidden=!ok||openId!==null&&!shown;go.textContent=shown?'Jump to results':'See '+poss(st)+' results';
    reset.hidden=!anyAnswer(st);
  }
  function open(id,focus){
    openId=id;
    if(id){fillBody(STEP[id])}
    paint();
    if(id&&focus){var el=li(id);setTimeout(function(){focusQ(el,STEP[id]);var r=el.getBoundingClientRect();if(r.top<topOff()||r.top>window.innerHeight*.6)scrollTop(el,24)},RM?0:60)}
  }
  function next(s){
    clearTimeout(tm);if(!ready(s,st))return;
    st.seen[s.id]=1;save(st);
    var L=vis(st),k=L.indexOf(s),nx=null;
    for(var j=k+1;j<L.length;j++)if(!done(L[j],st)){nx=L[j];break}
    if(!nx)for(j=0;j<k;j++)if(!done(L[j],st)){nx=L[j];break}
    if(nx)open(nx.id,true);
    else{open(null);if(shown)render();else show()}
  }
  function changed(s){
    if(s.id==='areas'){if(!STEP.syms.skip(st))fillBody(STEP.syms)}
    paint();
    if(shown){clearTimeout(tr);tr=setTimeout(function(){if(allDone(st))render()},450)}
  }
  list.addEventListener('click',function(e){
    var hd=e.target.closest('.hq-c-hd');if(!hd)return;
    var el=hd.closest('.hq-c-it'),id=el.getAttribute('data-id'),s=STEP[id];
    if(openId===id||!reachable(s,st))return;
    open(id,true);
  });
  list.addEventListener('click',function(e){var b=e.target.closest('.hq-next');if(b){var id=b.closest('.hq-c-it').getAttribute('data-id');next(STEP[id])}});
  go.addEventListener('click',function(){if(shown)scrollTop(res);else show()});
  reset.addEventListener('click',function(){wipe(st);shown=false;res.hidden=true;res.innerHTML='';open('name',true)});
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();scrollTop(stage);var id=openId||(!allDone(st)&&vis(st)[firstOpen(st)].id);if(id){if(!openId)open(id);setTimeout(function(){focusQ(li(id),STEP[id])},RM?0:400)}})});
  function render(){
    var r=recommend(clean(st)),ps=r.kit,t=total(ps),w=wasTotal(ps);
    res.innerHTML=resHead(st,r)+
      '<div class="hq-c-tabs" role="tablist" aria-label="What '+esc(dogName(st))+' needs">'+r.needs.map(function(n,i){return '<button type="button" role="tab" id="hq-t'+i+'" aria-controls="hq-p'+i+'" aria-selected="'+(i===0)+'"'+(i?' tabindex="-1"':'')+'>'+esc(n.t)+'</button>'}).join('')+'</div>'+
      r.needs.map(function(n,i){return '<div class="hq-c-panel" role="tabpanel" id="hq-p'+i+'" aria-labelledby="hq-t'+i+'"'+(i?' hidden':'')+'>'+needHead(n,i)+needRail(n)+'</div>'}).join('')+
      '<section class="hq-strip" aria-labelledby="hq-kit-h"><div class="hq-strip-l"><h2 id="hq-kit-h">'+esc(poss(st,true))+' <em>kit</em></h2><p>Our top pick for each need, in one basket.</p></div>'+
      '<ul class="hq-strip-items">'+ps.map(function(p){return '<li>'+thumb(p)+'<span class="hq-strip-nm"><span>'+esc(p.brand)+'</span>'+esc(cleanTitle(p.title))+'</span><b>'+money(p.price)+'</b></li>'}).join('')+'</ul>'+
      '<div class="hq-strip-r"><div class="hq-strip-tot"><span>'+ps.length+' items</span>'+(w>t+.001?'<s>'+money(w)+'</s>':'')+'<b>'+money(t)+'</b></div>'+addAll(ps)+'<p>'+delivery(t)+'</p></div></section>'+VET;
    res.hidden=false;bindRails(res);
    var tabs=$$('[role=tab]',res);
    function sel(k){tabs.forEach(function(tb,j){tb.setAttribute('aria-selected',j===k);tb.tabIndex=j===k?0:-1;var p=$('#hq-p'+j,res);p.hidden=j!==k;if(j===k&&!RM){p.classList.remove('hq-fadein');void p.offsetWidth;p.classList.add('hq-fadein')}});railUps.forEach(function(f){f()})}
    tabs.forEach(function(tb,j){tb.addEventListener('click',function(){sel(j)});tb.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var k=(j+d+tabs.length)%tabs.length;sel(k);tabs[k].focus()}})});
    $('[data-edit]',res).addEventListener('click',function(){scrollTop(stage);open(vis(st)[0].id,true)});
    $('[data-again]',res).addEventListener('click',function(){wipe(st);shown=false;res.hidden=true;res.innerHTML='';scrollTop(stage);open('name',true)});
    paint();
  }
  function show(){shown=true;render();scrollTop(res);$('h2',res).focus({preventScroll:true})}
  /* start: open the first unanswered question, or show everything folded if all answered */
  var L0=vis(st);open(allDone(st)&&anyAnswer(st)?null:L0[firstOpen(st)].id,false);
}

$$('[data-hq]').forEach(function(root){var v=root.getAttribute('data-hq');if(v==='a')initA(root);else if(v==='b')initB(root);else if(v==='c')initC(root)});
})();
