/* ==========================================================================
   Dog health quiz: shared engine for versions A, B and C.
   Works out what the dog needs from its profile and symptoms, then recommends
   real products from window.PP_TAGS / PP_PRODUCTS (products.js, loaded first).
   Product cards use the site's own .pk card markup, styled by css/home.css.
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
var EXTRA=[{k:'older',t:'Slowing down with age'},{k:'weight',t:'Carrying a little extra weight'},{k:'surgery',t:'Recovering from an operation or injury'},{k:'none',t:'None of these',x:1}];
var KINDS=[{k:'supp',t:'Daily supplements',d:'Chews, powders and oils'},{k:'home',t:'Support and comfort',d:'Beds, ramps, braces and harnesses'},{k:'care',t:'Soothing care',d:'Shampoos, sprays, balms, dental'},{k:'food',t:'Food and treats',d:'Gentle food, toppers, healthy treats'},{k:'mix',t:'Show me a mix',d:'The best of everything',x:1}];
/* C: size and breed type in one question */
var BUILD=[{k:'s',t:'Small and light',d:'Under 10kg',size:0,breed:'mixed'},{k:'m',t:'Medium',d:'10 to 25kg',size:1,breed:'mixed'},{k:'l',t:'Large or giant',d:'Over 25kg, like a Labrador',size:2,breed:'working'},{k:'long',t:'Long back, short legs',d:'Dachshund, Corgi, Basset',size:0,breed:'long'},{k:'flat',t:'Flat-faced',d:'Pug, French Bulldog, Bulldog',size:1,breed:'flat'}];

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

/* ---------- state helpers ---------- */
function newState(){return {name:'',age:null,size:null,breed:null,build:null,areas:[],syms:[],extra:[]}}
function realAreas(st){return (st.areas||[]).filter(function(a){return AREA[a]})}
function clean(st){
  var ar=realAreas(st);
  return {name:st.name,age:st.age,size:st.size,breed:st.breed,areas:ar,
    syms:(st.syms||[]).filter(function(k){return SYM[k]&&has(ar,SYM[k].area)}),
    extra:(st.extra||[]).filter(function(k){return k!=='none'}),kinds:[]};
}
function profile(st){
  var b=[];
  if(st.age!=null)b.push(AGE[st.age].t);
  if(st.build!=null){BUILD.forEach(function(x){if(x.k===st.build)b.push(x.t)})}
  else{if(st.size!=null)b.push(SIZE[st.size].t);if(st.breed&&st.breed!=='mixed')BREED.forEach(function(x){if(x.k===st.breed)b.push(x.t)})}
  clean(st).syms.forEach(function(k){b.push(SYM[k].n)});
  clean(st).extra.forEach(function(k){EXTRA.forEach(function(x){if(x.k===k)b.push(x.t)})});
  return b;
}
function chipsHtml(st){return '<ul class="hq-prof">'+profile(st).map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul>'}
/* the phone header's search bar stays stuck to the top: keep the stage clear of it */
function topOff(){var m=$('.msearch');if(!m)return 0;var cs=getComputedStyle(m);return cs.display!=='none'&&(cs.position==='sticky'||cs.position==='fixed')?m.offsetHeight:0}
function setTop(){document.documentElement.style.setProperty('--hq-top',topOff()+'px')}
setTop();window.addEventListener('resize',setTop);
function scrollTop(el){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-topOff();window.scrollTo({top:y,behavior:RM?'auto':'smooth'})}
function T(v,st){return typeof v==='function'?v(st):(v||'')}
function nm(st){return esc(dogName(st))}

/* ---------- the questions ---------- */
var AREA_OPTS=AREAS.map(function(a){return {k:a.k,t:a.n,d:a.ex,ph:1}}).concat([{k:'none',t:'Nothing in particular',d:'Just keeping them well',x:1,ph:1}]);
var Q={
  name:{id:'name',type:'text',key:'name',q:'What is your dog <em>called</em>?',hint:'So we can make the results about them.',ph:'Their name'},
  age:{id:'age',type:'single',key:'age',opts:AGE,q:function(st){return 'How old is <em>'+nm(st)+'</em>?'}},
  size:{id:'size',type:'single',key:'size',opts:SIZE,q:function(st){return 'How big is <em>'+nm(st)+'</em>?'}},
  breed:{id:'breed',type:'single',key:'breed',opts:BREED,q:function(st){return 'Is '+nm(st)+' one of these <em>types</em>?'},hint:'Some body shapes need a little extra support.'},
  areas:{id:'areas',type:'multi',key:'areas',opts:AREA_OPTS,max:3,min:1,style:'area',q:'Where are you <em>noticing</em> something?',hint:'Pick up to three.'},
  syms:{id:'syms',type:'multi',key:'syms',q:'What are you <em>seeing</em>?',hint:'Tap all that apply.',
    groups:function(st){return realAreas(st).map(function(k){var a=AREA[k];return {h:a.n,items:a.syms.map(function(s){return {k:s.k,t:s.n}})}})},
    skip:function(st){return !realAreas(st).length}},
  extra:{id:'extra',type:'multi',key:'extra',opts:EXTRA,q:function(st){return 'Anything else going on with <em>'+nm(st)+'</em>?'},hint:'Optional. Skip if not.'}
};
function optBtn(s,o,st,style){
  var v=st[s.key],on=s.type==='multi'?has(v||[],o.k):v===o.k;
  var inner=style==='chip'?esc(o.t):
    (o.ph?'<span class="hq-o-ph" data-photo="'+esc(o.k)+'" aria-hidden="true"></span>':'')+
    '<span class="hq-o-t"><b>'+esc(o.t)+'</b>'+(o.d?'<span>'+esc(o.d)+'</span>':'')+'</span><span class="hq-o-i" aria-hidden="true"></span>';
  return '<button type="button" class="hq-o hq-o-'+style+(s.type==='multi'?' hq-multi':'')+'" data-v="'+esc(o.k)+'"'+(o.x?' data-x="1"':'')+' aria-pressed="'+on+'">'+inner+'</button>';
}
function bodyHtml(s,st,style){
  if(s.type==='text')return '<form class="hq-name" novalidate><label class="sr" for="hq-in-'+s.id+'">Your dog’s name</label><input id="hq-in-'+s.id+'" type="text" maxlength="20" autocomplete="off" placeholder="'+esc(s.ph||'')+'" value="'+esc(st[s.key]||'')+'"></form>';
  if(s.groups)return '<div class="hq-groups">'+s.groups(st).map(function(g){return '<div class="hq-grp"><h3>'+esc(g.h)+'</h3><div class="hq-chips" role="group" aria-label="'+esc(g.h)+'">'+g.items.map(function(o){return optBtn(s,o,st,'chip')}).join('')+'</div></div>'}).join('')+'</div>';
  var sty=s.style||style||'tile';
  return '<div class="hq-opts hq-opts-'+sty+' hq-n'+s.opts.length+'" role="group">'+s.opts.map(function(o){return optBtn(s,o,st,sty)}).join('')+'</div>';
}
function parseV(raw){return /^\d+$/.test(raw)?+raw:raw}
/* wire a rendered question: onChange after any edit, onPick after a single choice */
function bindQ(host,s,st,onChange,onPick){
  if(s.type==='text'){
    var f=$('form',host),inp=$('input',host);
    inp.addEventListener('input',function(){st[s.key]=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()});onChange&&onChange()});
    f.addEventListener('submit',function(e){e.preventDefault();onPick&&onPick()});
    return;
  }
  host.addEventListener('click',function(e){
    var b=e.target.closest('.hq-o');if(!b||!host.contains(b))return;
    var v=parseV(b.getAttribute('data-v')),bs=$$('.hq-o',host);
    if(s.type==='single'){
      st[s.key]=v;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      onChange&&onChange();onPick&&onPick();return;
    }
    var arr=(st[s.key]||[]).slice(),on=has(arr,v);
    if(on)arr.splice(arr.indexOf(v),1);
    else{
      if(b.hasAttribute('data-x'))arr=[];
      else arr=arr.filter(function(k){var o=$('.hq-o[data-v="'+k+'"]',host);return !(o&&o.hasAttribute('data-x'))});
      arr.push(v);
      if(s.max&&arr.length>s.max)arr.shift();
    }
    st[s.key]=arr;
    bs.forEach(function(x){x.setAttribute('aria-pressed',has(arr,parseV(x.getAttribute('data-v'))))});
    onChange&&onChange();
  });
}
function ready(s,st){
  if(s.type==='single')return st[s.key]!=null;
  if(s.type==='multi'&&s.min)return (st[s.key]||[]).length>=s.min;
  return true;
}
function ctaText(s,st,last){
  if(last&&ready(s,st))return 'See '+esc(poss(st))+' results';
  if(s.type==='text'&&!st.name)return 'Skip';
  if(s.type==='multi'&&!s.min&&!(st[s.key]||[]).length)return last?'See '+esc(poss(st))+' results':'Skip';
  return 'Continue';
}

/* ---------- one-question-at-a-time flow (A and B) ---------- */
function Flow(o){
  var i=0,st=o.st,L;
  function list(){return o.steps.filter(function(s){return !s.skip||!s.skip(st)})}
  function sync(){var s=L[i],last=i===L.length-1;o.next.disabled=!ready(s,st);o.next.innerHTML=ctaText(s,st,last)}
  function render(dir,focus){
    L=list();if(i>=L.length)i=L.length-1;var s=L[i];
    o.back.hidden=i===0;
    o.q.innerHTML='<div class="hq-step'+(dir&&!RM?(dir>0?' hq-in-f':' hq-in-b'):'')+'" data-step="'+s.id+'"><h2 class="hq-q" tabindex="-1">'+T(s.q,st)+'</h2>'+
      (s.hint?'<p class="hq-hint">'+esc(T(s.hint,st))+'</p>':'')+bodyHtml(s,st,o.style)+'</div>';
    var step=$('.hq-step',o.q);
    bindQ(step,s,st,function(){sync();o.onChange&&o.onChange()},function(){
      if(s.type==='text'){go(1);return}
      clearTimeout(o._t);o._t=setTimeout(function(){go(1)},RM?60:260);
    });
    sync();var cur=o.steps.indexOf(s),tot=o.steps.filter(function(x,k){return !x.skip||!x.skip(st)||k>cur}).length;o.onStep&&o.onStep(i,tot,s);
    if(focus){
      if(s.type==='text'){var inp=$('input',step);inp&&inp.focus({preventScroll:true})}
      else{$('.hq-q',step).focus({preventScroll:true})}
    }
  }
  function go(d){
    if(d>0&&!ready(L[i],st))return;
    if(d>0&&i===L.length-1){o.onDone();return}
    L=list();i=Math.max(0,Math.min(L.length-1,i+d));render(d,true);
  }
  o.back.addEventListener('click',function(){go(-1)});
  o.next.addEventListener('click',function(){go(1)});
  render(0,false);
  return {go:go,reset:function(){i=0;render(0,true)},render:render,focus:function(){render(0,true)}};
}
function progSegs(el,i,n){
  var h='';for(var k=0;k<n;k++)h+='<span class="'+(k<i?'done':k===i?'on':'')+'"></span>';
  el.innerHTML=h;el.setAttribute('aria-valuenow',i+1);el.setAttribute('aria-valuemax',n);el.setAttribute('aria-valuetext','Question '+(i+1)+' of '+n);
}

/* ---------- shared result blocks ---------- */
function needHead(n,i,tag){
  tag=tag||'h3';
  return '<div class="sec-h"><div><'+tag+'>'+esc(n.t)+'</'+tag+'><p>'+esc(n.s)+'</p></div><div class="sec-r"><a class="all" href="#">Shop '+esc(n.areaName.toLowerCase())+' ›</a></div></div>';
}
function needRail(n){return rail(n.items.concat(n.more),{helps:HELPS[n.id],top:true,label:n.t})}
function kitBand(res,st,cls){
  var ps=res.kit,t=total(ps),w=wasTotal(ps);
  return '<section class="hq-kit'+(cls?' '+cls:'')+'" aria-labelledby="hq-kit-h"><div class="wrap hq-kit-in">'+
    '<div class="hq-kit-l"><h2 id="hq-kit-h">'+esc(poss(st,true))+' <em>starter kit</em></h2><p>Our top pick for each need, in one basket.</p>'+
    '<div class="hq-kit-tot"><span>'+ps.length+' items</span>'+(w>t+.001?'<s>'+money(w)+'</s>':'')+'<b>'+money(t)+'</b></div>'+
    '<button class="btn" type="button" data-add="'+ps.map(function(p){return p.handle}).join(',')+'">Add all '+ps.length+' to basket</button>'+
    '<p class="hq-kit-note">'+(t>=39?'Qualifies for free UK delivery.':'Free UK delivery on orders over £39.')+'</p></div>'+
    '<div class="hq-kit-cards">'+ps.map(function(p,i){var n=res.needs.filter(function(x){return x.items[0]===p})[0];return pk(p,{helps:n?HELPS[n.id]:'',tab:null})}).join('')+'</div>'+
    '</div></section>';
}
var VET='<p class="hq-vet">Our guides don’t replace your vet.</p>';

/* ==========================================================================
   A: a full-screen stepper. One question fills the screen, big tiles.
   ========================================================================== */
function initA(root){
  var st=newState(),stage=$('#hq-stage',root),res=$('#hq-res',root);
  var flow=Flow({st:st,steps:[Q.name,Q.age,Q.size,Q.breed,Q.areas,Q.syms,Q.extra],style:'tile',
    q:$('[data-q]',stage),back:$('.hq-back',stage),next:$('.hq-next',stage),
    onStep:function(i,n){progSegs($('.hq-a-prog',stage),i,n);$('.hq-a-of',stage).textContent=(i+1)+' of '+n;if(started&&Math.abs(stage.getBoundingClientRect().top-topOff())>4)scrollTop(stage)},
    onDone:function(){show()}});
  var started=false;
  function start(){started=true;stage.hidden=false;res.hidden=true;scrollTop(stage);setTimeout(function(){flow.focus()},RM?0:350)}
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();start()})});
  stage.addEventListener('pointerdown',function(){started=true},{once:true});
  function show(){
    var r=recommend(clean(st)),cur=0;
    res.innerHTML='<div class="wrap hq-a-rin"><div class="hq-a-rh"><div><h2 tabindex="-1">Here is what <em>'+nm(st)+'</em> needs</h2>'+chipsHtml(st)+'</div>'+
      '<button class="hq-again" type="button">Start again</button></div>'+
      '<div class="hq-a-tabs" role="tablist" aria-label="Needs">'+r.needs.map(function(n,i){return '<button type="button" role="tab" id="hq-t'+i+'" aria-controls="hq-p'+i+'" aria-selected="'+(i===0)+'"'+(i?' tabindex="-1"':'')+'><span>'+(i+1)+'</span><b>'+esc(n.t)+'</b></button>'}).join('')+'</div>'+
      r.needs.map(function(n,i){return '<div class="hq-a-panel" role="tabpanel" id="hq-p'+i+'" aria-labelledby="hq-t'+i+'"'+(i?' hidden':'')+'>'+needHead(n,i)+needRail(n)+'</div>'}).join('')+
      '</div>'+kitBand(r,st)+'<div class="wrap">'+VET+'</div>';
    stage.hidden=true;res.hidden=false;bindRails(res);
    var tabs=$$('[role=tab]',res);
    function sel(k){tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===k);t.tabIndex=j===k?0:-1;$('#hq-p'+j,res).hidden=j!==k});railUps.forEach(function(f){f()})}
    tabs.forEach(function(t,j){t.addEventListener('click',function(){sel(j)});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){var k=(j+d+tabs.length)%tabs.length;sel(k);tabs[k].focus()}})});
    $('.hq-again',res).addEventListener('click',function(){var n=newState();Object.keys(n).forEach(function(k){st[k]=n[k]});stage.hidden=false;res.hidden=true;res.innerHTML='';scrollTop(stage);flow.reset()});
    scrollTop(res);$('h2',res).focus({preventScroll:true});
  }
}

/* ==========================================================================
   B: split screen. Question on the left, live picks on the right.
   ========================================================================== */
function initB(root){
  var st=newState(),stage=$('#hq-stage',root),live=$('[data-live]',stage),liveH=$('[data-live-h]',stage),liveS=$('[data-live-s]',stage),lastKey='';
  function refresh(){
    var r=recommend(clean(st)),ps=topN(r.needs,6);
    liveH.innerHTML='Picked for <em>'+nm(st)+'</em> so far';
    liveS.textContent=r.needs.length?'Matched to: '+r.needs.map(function(n){return n.t.toLowerCase()}).join(', ').replace(/^./,function(c){return c.toUpperCase()})+'.':'';
    var key=ps.map(function(p){return p.handle}).join();
    if(key===lastKey)return;lastKey=key;
    var needOf=function(p){var n=r.needs.filter(function(x){return has(x.items,p)})[0];return n?HELPS[n.id]:''};
    live.innerHTML='<div class="railwrap hq-rw'+(RM?'':' hq-fade')+'"><div class="rail prail" tabindex="0" aria-label="Picked so far">'+ps.map(function(p){return pk(p,{helps:needOf(p)})}).join('')+'</div>'+
      '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
    bindRails(live);
  }
  var flow=Flow({st:st,steps:[Q.name,Q.age,Q.size,Q.breed,Q.areas,Q.syms,Q.extra],style:'row',
    q:$('[data-q]',stage),back:$('.hq-back',stage),next:$('.hq-next',stage),onChange:refresh,
    onStep:function(i,n){$('.hq-b-of',stage).textContent='Question '+(i+1)+' of '+n;$('.hq-b-bar i',stage).style.width=Math.round((i+1)/n*100)+'%';refresh()},
    onDone:function(){show()}});
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();scrollTop(stage);setTimeout(function(){flow.focus()},RM?0:350)})});
  var res=$('#hq-res',root);
  function show(){
    var r=recommend(clean(st)),ps=r.kit,t=total(ps);
    res.innerHTML='<div class="hq-b-sum"><div class="hq-b-sin"><h2 tabindex="-1">What <em>'+nm(st)+'</em> needs</h2>'+chipsHtml(st)+
      '<ol class="hq-b-needs">'+r.needs.map(function(n,i){return '<li><a href="#hq-n-'+n.id+'"><span>'+(i+1)+'</span>'+esc(n.t)+'</a></li>'}).join('')+'</ol>'+
      '<div class="hq-b-kit"><h3>Top pick for each need</h3><ul>'+ps.map(function(p){return '<li><span class="hq-b-th">'+well(p)+'</span><span class="hq-b-kn">'+esc(cleanTitle(p.title))+'</span><b>'+money(p.price)+'</b></li>'}).join('')+'</ul>'+
      '<div class="hq-b-tot"><span>'+ps.length+' items</span><b>'+money(t)+'</b></div><button class="btn" type="button" data-add="'+ps.map(function(p){return p.handle}).join(',')+'">Add all '+ps.length+' to basket</button>'+
      '<p>'+(t>=39?'Qualifies for free UK delivery.':'Free UK delivery on orders over £39.')+'</p></div>'+
      '<button class="hq-again" type="button">Start again</button></div></div>'+
      '<div class="hq-b-list">'+r.needs.map(function(n,i){return '<section class="hq-b-need" id="hq-n-'+n.id+'" aria-label="'+esc(n.t)+'">'+needHead(n,i)+needRail(n)+'</section>'}).join('')+VET+'</div>';
    stage.hidden=true;res.hidden=false;bindRails(res);
    $('.hq-again',res).addEventListener('click',function(){var n=newState();Object.keys(n).forEach(function(k){st[k]=n[k]});lastKey='';stage.hidden=false;res.hidden=true;res.innerHTML='';scrollTop(stage);flow.reset()});
    $$('.hq-b-needs a',res).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();scrollTop($(a.getAttribute('href'),res))})});
    scrollTop(res);$('h2',res).focus({preventScroll:true});
  }
}

/* ==========================================================================
   C: four full-height panels revealed one after another, then results.
   ========================================================================== */
function initC(root){
  var st=newState(),flowEl=$('#hq-stage',root),panels=$$('.hq-c-p',root),res=$('#hq-res',root);
  var P1=$('[data-p="1"]',root),P2=$('[data-p="2"]',root),P3=$('[data-p="3"]',root),P4=$('[data-p="4"]',root);
  /* panel 1: areas */
  $('[data-body]',P1).innerHTML=bodyHtml(Q.areas,st,'area');
  bindQ($('[data-body]',P1),Q.areas,st,function(){sync();fill2()});
  /* panel 2: symptoms for the chosen areas */
  function fill2(){
    var b=$('[data-body]',P2);
    if(!realAreas(st).length){b.innerHTML='<p class="hq-c-empty">Nothing specific to pick. We will focus on keeping '+nm(st)+' well.</p>';return}
    b.innerHTML=bodyHtml(Q.syms,st);
    bindQ(b,Q.syms,st,sync);
  }
  /* panel 3: the dog */
  var AGE_Q={id:'age',type:'single',key:'age',opts:AGE},BUILD_Q={id:'build',type:'single',key:'build',opts:BUILD};
  $('[data-age]',P3).innerHTML=bodyHtml(AGE_Q,st,'seg');
  $('[data-build]',P3).innerHTML=bodyHtml(BUILD_Q,st,'seg');
  bindQ($('[data-age]',P3),AGE_Q,st,sync);
  bindQ($('[data-build]',P3),BUILD_Q,st,function(){BUILD.forEach(function(x){if(x.k===st.build){st.size=x.size;st.breed=x.breed}});sync()});
  var inp=$('input',P3);inp.addEventListener('input',function(){st.name=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()});P4Q()});
  /* panel 4: anything else */
  function P4Q(){$('h2',P4).innerHTML='Anything else going on with <em>'+nm(st)+'</em>?'}
  $('[data-body]',P4).innerHTML=bodyHtml(Q.extra,st,'tile');
  bindQ($('[data-body]',P4),Q.extra,st,sync);
  fill2();
  function sync(){
    $('[data-next]',P1).disabled=!realAreas(st).length&&!has(st.areas,'none');
    $('[data-next]',P3).disabled=st.age==null||st.build==null;
    var n=clean(st).syms.length;$('[data-next]',P2).textContent=n?'Continue with '+n:'Skip';
  }
  sync();
  function open(p){p.hidden=false;if(!RM){p.classList.remove('hq-c-show');void p.offsetWidth;p.classList.add('hq-c-show')}scrollTop(p);setTimeout(function(){var h=$('h2',p);h&&h.focus({preventScroll:true})},RM?0:450)}
  $$('[data-next]',root).forEach(function(b){b.addEventListener('click',function(){
    var p=b.closest('.hq-c-p'),k=+p.getAttribute('data-p');
    if(k<4)open(panels[k]);else show();
  })});
  $$('[data-start]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();scrollTop(P1);setTimeout(function(){$('h2',P1).focus({preventScroll:true})},RM?0:350)})});
  function show(){
    var r=recommend(clean(st));
    res.innerHTML='<section class="hq-c-rh"><div class="wrap"><h2 tabindex="-1">Here is what <em>'+nm(st)+'</em> needs</h2>'+chipsHtml(st)+
      '<ol class="hq-c-over">'+r.needs.map(function(n,i){return '<li><a href="#hq-n-'+n.id+'"><span>'+(i+1)+'</span><b>'+esc(n.t)+'</b><i>'+esc(n.s)+'</i></a></li>'}).join('')+'</ol>'+
      '<button class="hq-again" type="button">Start again</button></div></section>'+
      r.needs.map(function(n,i){return '<section class="hq-c-need'+(i%2?' hq-alt':'')+'" id="hq-n-'+n.id+'" aria-label="'+esc(n.t)+'"><div class="wrap">'+needHead(n,i,'h2')+needRail(n)+'</div></section>'}).join('')+
      kitBand(r,st)+'<div class="wrap">'+VET+'</div>';
    res.hidden=false;bindRails(res);
    $('.hq-again',res).addEventListener('click',function(){location.hash='';location.reload()});
    $$('.hq-c-over a',res).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();scrollTop($(a.getAttribute('href'),res))})});
    scrollTop(res);$('h2',res).focus({preventScroll:true});
  }
}

$$('[data-hq]').forEach(function(root){var v=root.getAttribute('data-hq');if(v==='a')initA(root);else if(v==='b')initB(root);else if(v==='c')initC(root)});
})();
