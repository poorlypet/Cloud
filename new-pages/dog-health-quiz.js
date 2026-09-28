/* ==========================================================================
   Dog health quiz: shared engine for versions A, B and C.
   Works out what the dog needs from its profile and symptoms, then recommends
   real products from window.PP_TAGS / PP_PRODUCTS (products.js, loaded first).
   Vanilla JS, no external requests. Each version is a root with data-hq="a|b|c".
   ========================================================================== */
(function(){
'use strict';

var PRODUCTS=window.PP_PRODUCTS||[],BY=window.PP_BY_HANDLE||{},TAGS=window.PP_TAGS||{};
if(!Object.keys(BY).length)PRODUCTS.forEach(function(p){BY[p.handle]=p});
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '£'+(Math.round(n*100)/100).toFixed(2)}
function $(sel,el){return (el||document).querySelector(sel)}
function $$(sel,el){return Array.prototype.slice.call((el||document).querySelectorAll(sel))}
function later(fn,ms){return setTimeout(fn,RM?0:ms)}
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

/* ---------- product UI ---------- */
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function photo(p){
  var k=kind(p);
  if(p.img)return '<img class="hq-img" src="'+esc(p.img)+'" alt="" loading="lazy" decoding="async" data-k="'+k+'">';
  return phEl(k);
}
function phEl(k){return '<span class="hq-ph" data-photo="'+k+'" aria-hidden="true"><span class="hq-ph-s"></span><span class="hq-ph-l">'+KIND_LABEL[k]+'</span></span>'}
function priceHtml(p){
  var h='<span class="now">'+money(p.price)+'</span>';
  if(p.compareAt&&p.compareAt>p.price)h+='<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>';
  return h;
}
function revHtml(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  return '<span class="rev">'+stars(p.rating)+'<span class="sr">Rated '+p.rating.toFixed(1)+' out of 5</span><span aria-hidden="true">'+p.rating.toFixed(1)+'</span><em>('+p.reviewCount+')</em></span>';
}
function card(p){
  return '<article class="pk hq-pk"><div class="well hq-well">'+photo(p)+'</div><div class="body">'+
    '<span class="brand">'+esc(p.brand)+'</span><a class="name" href="#">'+esc(cleanTitle(p.title))+'</a>'+revHtml(p)+
    '<p class="price">'+priceHtml(p)+'</p>'+
    '<button class="btn hq-add" type="button" data-h="'+esc(p.handle)+'">Add to basket<span class="sr"> '+esc(cleanTitle(p.title))+'</span></button></div></article>';
}
function mini(p,extra){
  return '<div class="hq-mini"><span class="hq-thumb">'+photo(p)+'</span><span class="hq-mini-t"><span class="hq-mini-b">'+esc(p.brand)+'</span><span class="hq-mini-n">'+esc(cleanTitle(p.title))+'</span></span><span class="hq-mini-p">'+money(p.price)+'</span>'+(extra||'')+'</div>';
}
/* a broken local image falls back to the placeholder */
document.addEventListener('error',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('hq-img')){var s=document.createElement('span');s.innerHTML=phEl(t.getAttribute('data-k')||'care');t.parentNode.replaceChild(s.firstChild,t)}},true);

/* ---------- basket (count in the header plus a small toast) ---------- */
var cnts=$$('.cnt'),bcount=cnts.length?(parseInt(cnts[0].textContent,10)||0):0,toastEl,toastT;
function addToBasket(handles){
  handles=[].concat(handles).filter(function(h){return BY[h]});if(!handles.length)return;
  bcount+=handles.length;
  cnts.forEach(function(c){c.textContent=bcount;c.setAttribute('data-n',bcount)});
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='hq-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  var msg=handles.length===1?'<b>Added to basket</b><span>'+esc(cleanTitle(BY[handles[0]].title))+'</span>':'<b>'+handles.length+' items added to basket</b><span>'+money(total(handles.map(function(h){return BY[h]})))+' in total</span>';
  toastEl.innerHTML='<span class="hq-toast-c" aria-hidden="true">'+bcount+'</span><span class="hq-toast-t">'+msg+'</span><a href="#">View basket ('+bcount+')</a>';
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},4000);
}
function flash(btn,txt){
  if(!btn)return;var o=btn.getAttribute('data-o')||btn.innerHTML;btn.setAttribute('data-o',o);
  btn.classList.add('hq-added');btn.innerHTML='<span class="hq-tick" aria-hidden="true"></span>'+(txt||'Added');
  clearTimeout(btn._t);btn._t=setTimeout(function(){btn.classList.remove('hq-added');btn.innerHTML=o},2200);
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.hq-add[data-h]');
  if(b){addToBasket(b.getAttribute('data-h'));flash(b)}
});

/* ---------- shared result blocks ---------- */
function profileBits(st){
  var b=[];
  if(st.age!=null)b.push(AGE[st.age].t);
  if(st.size!=null&&st.build==null)b.push(SIZE[st.size].t);
  if(st.build!=null){var bb=BUILD.filter(function(x){return x.k===st.build})[0];if(bb)b.push(bb.t)}
  else if(st.breed&&st.breed!=='mixed')b.push(BREED.filter(function(x){return x.k===st.breed})[0].t);
  (st.syms||[]).forEach(function(k){if(SYM[k])b.push(SYM[k].n)});
  (st.extra||[]).forEach(function(k){if(k!=='none')b.push(EXTRA.filter(function(x){return x.k===k})[0].t)});
  return b;
}
function needsHtml(res,st,opt){
  opt=opt||{};
  return res.needs.map(function(n,i){
    return '<article class="hq-need" id="hq-need-'+n.id+'"><div class="hq-need-h"><span class="hq-num" aria-hidden="true">'+(i+1)+'</span><div class="hq-need-t">'+
      '<h3>'+esc(n.t)+'</h3><p>'+esc(n.s)+'</p>'+(n.why.length?'<p class="hq-why">Because of: '+esc(n.why.slice(0,3).join(', ').toLowerCase().replace(/^./,function(c){return c.toUpperCase()}))+'</p>':'')+
      '</div><a class="hq-shop" href="#">Shop '+esc(n.areaName.toLowerCase().replace('&','and'))+' <span aria-hidden="true">›</span></a></div>'+
      '<div class="hq-cards">'+n.items.map(card).join('')+'</div></article>';
  }).join('');
}
function kitHtml(res,st){
  var ps=res.kit,t=total(ps),w=wasTotal(ps);
  return '<div class="hq-kit-in"><p class="hq-eyebrow">Save time</p><h3>Build '+esc(poss(st))+' <em>kit</em></h3><p class="hq-kit-s">Our top pick for each need, in one go.</p>'+
    '<ul class="hq-kit-l">'+ps.map(function(p){return '<li>'+mini(p)+'</li>'}).join('')+'</ul>'+
    '<div class="hq-total"><span>'+ps.length+' items</span><span class="hq-total-v">'+(w>t+.001?'<s>'+money(w)+'</s> ':'')+'<b>'+money(t)+'</b></span></div>'+
    '<button class="btn wide hq-addall" type="button" data-hs="'+ps.map(function(p){return p.handle}).join(',')+'">Add all '+ps.length+' to basket</button>'+
    '<p class="hq-kit-note">'+(t>=39?'This kit qualifies for free UK delivery.':'Free UK delivery on orders over £39.')+'</p></div>';
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.hq-addall[data-hs]');
  if(b){addToBasket(b.getAttribute('data-hs').split(','));flash(b,'Added to basket')}
});

function animateIn(el,dir){
  if(RM||!el)return;el.classList.remove('hq-in-f','hq-in-b');void el.offsetWidth;el.classList.add(dir<0?'hq-in-b':'hq-in-f');
}
function reveal(root){
  var els=$$('.hq-rv',root);
  if(RM||!('IntersectionObserver' in window)){return}
  els.forEach(function(el){el.classList.add('hq-rv-wait')});
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.remove('hq-rv-wait');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){io.observe(el)});
}
function scrollTo(el){if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-16;window.scrollTo({top:y,behavior:RM?'auto':'smooth'})}

/* ==========================================================================
   Stepper: one question per screen, progress bar, Back. Used by A and C.
   step: {id, eyebrow, q, hint, type:'text'|'single'|'multi', key, opts, groups, style, max, cta}
   ========================================================================== */
function Stepper(host,steps,st,done,opt){
  opt=opt||{};
  var i=0,navigated=false;
  host.innerHTML='<div class="hq-card'+(opt.cls?' '+opt.cls:'')+'"><div class="hq-top">'+
    '<button class="hq-back" type="button"><span aria-hidden="true">‹</span> Back</button>'+
    '<div class="hq-prog" role="progressbar" aria-label="Quiz progress" aria-valuemin="1"><span class="hq-bar"></span></div>'+
    '<span class="hq-of"></span></div><div class="hq-stage"></div>'+
    '<div class="hq-foot"><span class="hq-sel" aria-live="polite"></span><button class="btn hq-next" type="button">Continue</button></div></div>';
  var card=$('.hq-card',host),stage=$('.hq-stage',host),back=$('.hq-back',host),bar=$('.hq-bar',host),prog=$('.hq-prog',host),of=$('.hq-of',host),foot=$('.hq-foot',host),next=$('.hq-next',host),sel=$('.hq-sel',host);
  function list(){return steps.filter(function(s){return !s.skip||!s.skip(st)})}
  function val(s){return st[s.key]}
  function optsOf(s){return typeof s.opts==='function'?s.opts(st):s.opts}
  function txt(v){return typeof v==='function'?v(st):(v||'')}
  function render(dir){
    var L=list(),s=L[i],n=L.length;
    back.hidden=i===0&&!opt.backFirst;
    bar.style.width=Math.round((i+1)/(n+1)*100)+'%';
    prog.setAttribute('aria-valuemax',n);prog.setAttribute('aria-valuenow',i+1);prog.setAttribute('aria-valuetext','Question '+(i+1)+' of '+n);
    of.textContent=(i+1)+' of '+n;
    card.setAttribute('data-step',s.id);card.setAttribute('data-type',s.type+(s.style?' '+s.style:''));
    var h='<div class="hq-step">'+(txt(s.eyebrow)?'<p class="hq-eyebrow">'+esc(txt(s.eyebrow))+'</p>':'')+
      '<h2 class="hq-q" tabindex="-1">'+txt(s.q)+'</h2>'+(txt(s.hint)?'<p class="hq-hint">'+esc(txt(s.hint))+'</p>':'');
    if(s.type==='text'){
      h+='<form class="hq-name" novalidate><label class="sr" for="hq-name-'+s.id+'">'+esc(s.label||'Name')+'</label><input id="hq-name-'+s.id+'" type="text" maxlength="20" autocomplete="off" placeholder="'+esc(s.ph||'')+'" value="'+esc(st[s.key]||'')+'"></form>';
      if(s.after)h+=s.after(st);
    }else if(s.groups){
      h+=s.groups(st).map(function(g){return '<div class="hq-grp"><h3>'+esc(g.h)+'</h3><div class="hq-chips" role="group" aria-label="'+esc(g.h)+'">'+g.items.map(function(o){return optBtn(s,o,'chip')}).join('')+'</div></div>'}).join('');
      if(s.none)h+='<button class="hq-none" type="button" data-none>'+esc(txt(s.none))+'</button>';
    }else{
      var st2=s.style||(s.type==='multi'?'tiles':'tiles');
      h+='<div class="hq-opts hq-opts-'+st2+'" role="group" aria-label="'+esc(txt(s.q).replace(/<[^>]+>/g,''))+'">'+optsOf(s).map(function(o){return optBtn(s,o,st2)}).join('')+'</div>';
    }
    h+='</div>';
    stage.innerHTML=h;
    var stepEl=$('.hq-step',stage);animateIn(stepEl,dir);
    bind(s);sync(s);
    if(navigated){var q=$('.hq-q',stage);q&&q.focus({preventScroll:true});if(card.getBoundingClientRect().top<0)scrollTo(card)}
  }
  function optBtn(s,o,style){
    var v=val(s),on=s.type==='multi'?has(v||[],o.k):v===o.k;
    var inner=style==='chip'?esc(o.t):style==='cards'?
      '<span class="hq-oc-ph" data-photo="'+esc(o.k)+'" aria-hidden="true"></span><span class="hq-oc-t"><b>'+esc(o.t)+'</b>'+(o.d?'<span>'+esc(o.d)+'</span>':'')+'</span><span class="hq-check" aria-hidden="true"></span>':
      '<span class="hq-ot"><b>'+esc(o.t)+'</b>'+(o.d?'<span>'+esc(o.d)+'</span>':'')+'</span>'+(s.type==='multi'?'<span class="hq-check" aria-hidden="true"></span>':'<span class="hq-arr" aria-hidden="true">›</span>');
    return '<button type="button" class="hq-o hq-o-'+style+'" data-v="'+esc(o.k)+'"'+(o.x?' data-x="1"':'')+' aria-pressed="'+on+'">'+inner+'</button>';
  }
  function bind(s){
    if(s.type==='text'){
      var f=$('form',stage),inp=$('input',stage);
      inp.addEventListener('input',function(){st[s.key]=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()});sync(s)});
      f.addEventListener('submit',function(e){e.preventDefault();go(1)});
      if(navigated||opt.focusFirst)setTimeout(function(){inp.focus({preventScroll:true})},RM?0:260);
      return;
    }
    $$('.hq-o',stage).forEach(function(b){b.addEventListener('click',function(){
      var raw=b.getAttribute('data-v'),v=isNaN(+raw)||raw===''?raw:+raw;
      if(s.type==='single'){
        st[s.key]=v;$$('.hq-o',stage).forEach(function(x){x.setAttribute('aria-pressed',x===b)});
        if(s.onPick)s.onPick(st,v);
        sync(s);later(function(){go(1)},240);return;
      }
      var a=(st[s.key]||[]).slice(),ix=a.indexOf(v);
      if(ix>-1)a.splice(ix,1);
      else{
        if(b.getAttribute('data-x'))a=[];
        else a=a.filter(function(k){var o=$('.hq-o[data-v="'+k+'"]',stage);return !(o&&o.getAttribute('data-x'))});
        if(s.max&&a.length>=s.max){sel.textContent='You can choose up to '+s.max+'.';card.classList.add('hq-shake');later(function(){card.classList.remove('hq-shake')},400);return}
        a.push(v);
      }
      st[s.key]=a;
      $$('.hq-o',stage).forEach(function(x){var r=x.getAttribute('data-v');x.setAttribute('aria-pressed',has(a,isNaN(+r)?r:+r))});
      sync(s);
    })});
    var none=$('[data-none]',stage);
    if(none)none.addEventListener('click',function(){st[s.key]=[];go(1)});
  }
  function sync(s){
    var v=val(s),n=(v||[]).length;
    if(s.type==='single'){foot.hidden=v==null;next.disabled=false;next.textContent='Continue';sel.textContent='';return}
    foot.hidden=false;
    if(s.type==='text'){next.textContent=v?'Continue':'Skip';sel.textContent='';return}
    if(s.max)$$('.hq-o',stage).forEach(function(o){o.classList.toggle('hq-dim',n>=s.max&&o.getAttribute('aria-pressed')!=='true')});
    next.disabled=!!(s.min&&n<s.min);
    next.textContent=s.cta?s.cta(st,n):'Continue';
    sel.textContent=s.selText?s.selText(st,n):(n?n+' chosen':'');
  }
  function go(d){
    navigated=true;
    var L=list();
    if(d>0&&i>=L.length-1){done(st,api);return}
    if(d<0&&i===0){if(opt.onBackFirst)opt.onBackFirst();return}
    i=Math.max(0,Math.min(L.length-1,i+d));render(d);
  }
  back.addEventListener('click',function(){go(-1)});
  next.addEventListener('click',function(){go(1)});
  var api={goTo:function(id){var L=list();for(var k=0;k<L.length;k++)if(L[k].id===id){i=k;navigated=true;render(-1);return}},restart:function(){i=0;navigated=true;render(-1)},host:host};
  render(0);
  return api;
}

/* ---------- common steps ---------- */
function stepsProfile(){
  return [
    {id:'name',type:'text',key:'name',eyebrow:'About your dog',q:'First, what is your dog called?',hint:'We will use it to make the results about them.',label:'Your dog’s name',ph:'Their name'},
    {id:'age',type:'single',key:'age',eyebrow:function(st){return 'About '+dogName(st)},q:function(st){return 'How old is '+esc(dogName(st))+'?'},opts:AGE},
    {id:'size',type:'single',key:'size',eyebrow:function(st){return 'About '+dogName(st)},q:function(st){return 'How big is '+esc(dogName(st))+'?'},opts:SIZE},
    {id:'breed',type:'single',key:'breed',eyebrow:function(st){return 'About '+dogName(st)},q:function(st){return 'Is '+esc(dogName(st))+' one of these types?'},hint:'Some body shapes need a little extra support.',opts:BREED}
  ];
}
function symGroups(areas){
  return (areas&&areas.length?areas.map(function(k){return AREA[k]}):AREAS).map(function(a){return {h:a.n,items:a.syms.map(function(s){return {k:s.k,t:s.n}})}});
}
function selText(st,n){return n?n+' selected':'Choose as many as you like'}

/* ==========================================================================
   Version A: guided questions, then a full results page.
   ========================================================================== */
function initA(root){
  var app=$('[data-hq-app]',root),st={name:'',age:null,size:null,breed:null,syms:[],extra:[],kinds:[]};
  var steps=stepsProfile().concat([
    {id:'syms',type:'multi',key:'syms',eyebrow:function(st){return 'About '+dogName(st)+'’s health'},q:'What are you noticing?',hint:'Tap everything that applies.',
      groups:function(){return symGroups()},none:function(st){return 'Nothing in particular, just keeping '+dogName(st)+' well'},selText:selText,
      cta:function(st,n){return n?'Continue with '+n:'Continue'}},
    {id:'extra',type:'multi',key:'extra',eyebrow:'Nearly there',q:function(st){return 'Anything else going on with '+esc(dogName(st))+'?'},opts:EXTRA,style:'rows',selText:function(){return ''},
      cta:function(st,n){return n?'Continue':'Skip'}},
    {id:'kinds',type:'multi',key:'kinds',eyebrow:'Last one',q:'What sort of help suits you?',hint:'We will lean towards these in your results.',opts:KINDS,selText:function(){return ''},
      cta:function(st,n){return 'See '+esc(poss(st))+' results'}}
  ]);
  var stepper=Stepper(app,steps,st,showResults);
  function showResults(){
    var res=recommend(st),bits=profileBits(st);
    root.classList.add('hq-done');
    app.innerHTML='<section class="hq-res" aria-labelledby="hq-res-h">'+
      '<div class="hq-res-h hq-rise"><div><p class="hq-eyebrow">Your results</p><h2 id="hq-res-h" tabindex="-1">Here is what <em>'+esc(dogName(st))+'</em> needs</h2>'+
      '<p class="hq-res-s">'+res.needs.length+' areas to focus on, with the products we would choose.</p>'+
      '<ul class="hq-bits" aria-label="Your answers">'+bits.slice(0,8).map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+(bits.length>8?'<li>+'+(bits.length-8)+' more</li>':'')+'</ul></div>'+
      '<div class="hq-res-acts"><button class="btn sec hq-edit" type="button">Change answers</button><button class="hq-link hq-restart" type="button">Start again</button></div></div>'+
      '<div class="hq-res-grid"><div class="hq-needs">'+needsHtml(res,st).replace(/class="hq-need"/g,'class="hq-need hq-rv"')+'</div>'+
      '<aside class="hq-kit hq-rise" aria-label="'+esc(poss(st,true))+' kit">'+kitHtml(res,st)+'</aside></div>'+
      '<p class="hq-calm">Our quiz doesn’t replace your vet.</p></section>';
    reveal(app);
    var h=$('#hq-res-h',app);scrollTo(root.querySelector('.hq-quiz')||app);setTimeout(function(){h.focus({preventScroll:true})},RM?0:400);
    $('.hq-edit',app).addEventListener('click',function(){root.classList.remove('hq-done');stepper=Stepper(app,steps,st,showResults);stepper.goTo('syms')});
    $('.hq-restart',app).addEventListener('click',function(){root.classList.remove('hq-done');st.name='';st.age=st.size=st.breed=null;st.syms=[];st.extra=[];st.kinds=[];stepper=Stepper(app,steps,st,showResults,{focusFirst:true});scrollTo(root)});
  }
}

/* ==========================================================================
   Version B: a chat. Poorly Pet asks, the owner taps replies. The basket
   on the right fills in as soon as we know what the dog is noticing.
   ========================================================================== */
function initB(root){
  var log=$('.hq-log',root),comp=$('.hq-comp',root),bask=$('.hq-bask',root),mbar=$('.hq-mbar',root);
  var st={name:'',age:null,size:null,breed:null,areas:[],syms:[],extra:[],kinds:[]},hist=[],sel={},swaps={},finished=false;
  var Q=[
    {id:'name',type:'text',key:'name',ask:function(){return ['Hello. I’m here to help you find the right things for your dog. It takes about a minute.','First, what’s your dog called?']}},
    {id:'age',type:'single',key:'age',opts:AGE,ask:function(){return [(st.name?'Lovely to meet '+esc(st.name)+'. ':'')+'How old is '+esc(dogName(st))+'?']}},
    {id:'size',type:'single',key:'size',opts:SIZE,ask:function(){return ['And how big is '+esc(dogName(st))+'?']}},
    {id:'breed',type:'single',key:'breed',opts:BREED,ask:function(){return ['Is '+esc(dogName(st))+' one of these types? Some body shapes need a little extra support.']}},
    {id:'areas',type:'multi',key:'areas',opts:AREAS.map(function(a){return {k:a.k,t:a.n}}).concat([{k:'none',t:'Nothing, just keeping them well',x:1}]),
      ask:function(){return ['What have you noticed lately? Pick any areas.']}},
    {id:'syms',type:'multi',key:'syms',skip:function(){return !st.areas.length||has(st.areas,'none')},groups:function(){return symGroups(st.areas)},
      ask:function(){return ['Which of these sound like '+esc(dogName(st))+'? Tap all that apply.']}},
    {id:'extra',type:'multi',key:'extra',opts:EXTRA,ask:function(){return ['Anything else going on?']}},
    {id:'kinds',type:'multi',key:'kinds',opts:KINDS,ask:function(){return ['Last one. What sort of things suit you?']}}
  ];
  function steps(){return Q.filter(function(q){return !q.skip||!q.skip()})}
  function answerText(q){
    var v=st[q.key];
    if(q.type==='text')return v||'I’d rather not say';
    if(q.type==='single')return q.opts.filter(function(o){return o.k===v})[0].t;
    if(!v.length)return q.id==='syms'?'Not sure':'None of these';
    if(q.id==='syms')return v.map(function(k){return SYM[k].n}).join(', ');
    return v.map(function(k){var o=q.opts.filter(function(o){return o.k===k})[0];return o?o.t:k}).join(', ');
  }
  function bot(lines,anim){return lines.map(function(t,j){return '<div class="hq-msg hq-bot'+(anim?' hq-pop':'')+'"'+(anim?' style="animation-delay:'+(RM?0:j*350)+'ms"':'')+'>'+(j===0?'<span class="hq-av" aria-hidden="true">PP</span>':'<span class="hq-av hq-av-s" aria-hidden="true"></span>')+'<p>'+t+'</p></div>'}).join('')}
  function me(t,anim){return '<div class="hq-msg hq-me'+(anim?' hq-pop':'')+'"><p><span class="sr">You: </span>'+esc(t)+'</p></div>'}
  function renderLog(anim){
    var h='',S=steps();
    hist.forEach(function(id){var q=S.filter(function(x){return x.id===id})[0];if(!q)return;h+=bot(q.ask())+me(answerText(q))});
    var cur=current();
    if(cur)h+=bot(cur.ask(),anim);
    else h+=bot(['Thanks. Here’s what I’d put in '+esc(poss(st))+' basket, with the reasons why. Untick anything you don’t need.'],anim);
    log.innerHTML=h;
    log.scrollTop=log.scrollHeight;
  }
  function current(){var S=steps();for(var k=0;k<S.length;k++)if(!has(hist,S[k].id))return S[k];return null}
  function typing(cb){
    if(RM){cb();return}
    var t=document.createElement('div');t.className='hq-msg hq-bot hq-typing';t.innerHTML='<span class="hq-av" aria-hidden="true">PP</span><p><span class="sr">Poorly Pet is typing</span><i></i><i></i><i></i></p>';
    log.appendChild(t);log.scrollTop=log.scrollHeight;setTimeout(cb,550);
  }
  function renderComp(){
    var q=current(),h='';
    var backBtn=hist.length?'<button class="hq-undo" type="button"><span aria-hidden="true">‹</span> Back</button>':'';
    if(!q){comp.innerHTML='<div class="hq-comp-row">'+backBtn+'<button class="hq-link hq-restart" type="button">Start again</button></div>';bindComp(null);return}
    if(q.type==='text'){
      h='<form class="hq-say"><label class="sr" for="hq-b-name">Your dog’s name</label><input id="hq-b-name" type="text" maxlength="20" autocomplete="off" placeholder="Type their name" value="'+esc(st.name)+'"><button class="btn" type="submit">Send</button></form>'+
        '<div class="hq-comp-row">'+backBtn+'<button class="hq-link hq-skip" type="button">Skip</button></div>';
    }else{
      var v=st[q.key],chips;
      if(q.groups)chips=q.groups().map(function(g){return '<div class="hq-rgrp"><span class="hq-rgrp-h">'+esc(g.h)+'</span><div class="hq-replies">'+g.items.map(function(o){return rep(q,o,v)}).join('')+'</div></div>'}).join('');
      else chips='<div class="hq-replies">'+q.opts.map(function(o){return rep(q,o,v)}).join('')+'</div>';
      h='<div class="hq-comp-l" role="group" aria-label="Your reply">'+chips+'</div>'+
        '<div class="hq-comp-row">'+backBtn+(q.type==='multi'?'<button class="btn hq-send" type="button">'+(v&&v.length?'Send':'Skip')+'</button>':'')+'</div>';
    }
    comp.innerHTML=h;bindComp(q);
  }
  function rep(q,o,v){var on=q.type==='multi'?has(v||[],o.k):v===o.k;return '<button class="hq-rep" type="button" data-v="'+esc(o.k)+'"'+(o.x?' data-x="1"':'')+' aria-pressed="'+on+'">'+esc(o.t)+'</button>'}
  function bindComp(q){
    var u=$('.hq-undo',comp);if(u)u.addEventListener('click',undo);
    var r=$('.hq-restart',comp);if(r)r.addEventListener('click',restart);
    if(!q)return;
    if(q.type==='text'){
      var f=$('form',comp),inp=$('input',comp);
      f.addEventListener('submit',function(e){e.preventDefault();st.name=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()});answer(q)});
      $('.hq-skip',comp).addEventListener('click',function(){st.name='';answer(q)});
      if(hist.length||started)inp.focus({preventScroll:true});
      return;
    }
    $$('.hq-rep',comp).forEach(function(b){b.addEventListener('click',function(){
      var raw=b.getAttribute('data-v'),v=isNaN(+raw)?raw:+raw;
      if(q.type==='single'){st[q.key]=v;b.setAttribute('aria-pressed','true');answer(q);return}
      var a=(st[q.key]||[]).slice(),ix=a.indexOf(v);
      if(ix>-1)a.splice(ix,1);else{if(b.getAttribute('data-x'))a=[];else a=a.filter(function(k){return k!=='none'&&k!=='mix'});a.push(v)}
      st[q.key]=a;
      $$('.hq-rep',comp).forEach(function(x){var r=x.getAttribute('data-v');x.setAttribute('aria-pressed',has(a,isNaN(+r)?r:+r))});
      $('.hq-send',comp).textContent=a.length?'Send':'Skip';
    })});
    $('.hq-send',comp).addEventListener('click',function(){
      if(q.id==='areas'){st.syms=st.syms.filter(function(k){return has(st.areas,SYM[k].area)})}
      if(q.id==='extra')st.extra=st.extra.filter(function(k){return k!=='none'});
      answer(q);
    });
  }
  var started=false;
  function answer(q){
    started=true;hist.push(q.id);
    log.insertAdjacentHTML('beforeend',me(answerText(q),true));
    comp.innerHTML='';
    updateBasket();
    typing(function(){renderLog(true);renderComp();var c=current();if(!c)finish();focusComp()});
  }
  function focusComp(){var f=$('.hq-rep,input,.hq-send',comp);if(f&&window.innerWidth>=900)f.focus({preventScroll:true});if(window.innerWidth<900&&comp.getBoundingClientRect().bottom>window.innerHeight)comp.scrollIntoView({block:'end',behavior:RM?'auto':'smooth'})}
  function undo(){
    finished=false;root.classList.remove('hq-done');
    var id=hist.pop();
    renderLog(false);renderComp();updateBasket();
    var f=$('.hq-rep[aria-pressed="true"],.hq-rep,input',comp);f&&f.focus({preventScroll:true});
  }
  function restart(){st.name='';st.age=st.size=st.breed=null;st.areas=[];st.syms=[];st.extra=[];st.kinds=[];hist=[];sel={};swaps={};finished=false;root.classList.remove('hq-done');renderLog(false);renderComp();updateBasket();scrollTo(root);var i=$('input',comp);i&&i.focus({preventScroll:true})}
  function finish(){finished=true;root.classList.add('hq-done');updateBasket();if(window.innerWidth<900)later(function(){scrollTo(bask)},300)}
  /* the recommended basket */
  function knowsNeeds(){return has(hist,'areas')}
  function updateBasket(){
    var head='<div class="hq-bask-h"><p class="hq-eyebrow">'+(finished?'Recommended for '+esc(dogName(st)):'Building as we chat')+'</p><h2 tabindex="-1">'+esc(poss(st,true))+' <em>basket</em></h2></div>';
    if(!knowsNeeds()){
      var known=[['Name',st.name||'',has(hist,'name')],['Age',st.age!=null?AGE[st.age].t:'',st.age!=null&&has(hist,'age')],['Size',st.size!=null?SIZE[st.size].t:'',has(hist,'size')],['Type',st.breed?BREED.filter(function(b){return b.k===st.breed})[0].t:'',has(hist,'breed')]];
      bask.innerHTML=head+'<div class="hq-bask-empty"><p>Your recommendations appear here as soon as you tell us what you are noticing.</p><ul class="hq-known">'+known.map(function(k){return '<li class="'+(k[2]?'on':'')+'"><span>'+k[0]+'</span><b>'+(k[2]?esc(k[1]||'Skipped'):'—')+'</b></li>'}).join('')+'</ul></div>';
      mbar.hidden=true;return;
    }
    var s2={};for(var k in st)s2[k]=st[k];
    if(!has(hist,'syms'))s2.syms=[];
    if(!has(hist,'extra'))s2.extra=[];
    if(!has(hist,'kinds'))s2.kinds=[];
    if(has(s2.areas,'none'))s2.areas=[];
    var res=recommend(s2),h=head+'<div class="hq-bask-l">';
    res.needs.forEach(function(n){
      var pool=n.items.concat(n.more);if(!pool.length)return;
      var ix=(swaps[n.id]||0)%pool.length,pick=pool[ix];
      if(sel[pick.handle]==null)sel[pick.handle]=true;
      h+='<section class="hq-bn"><h3>'+esc(n.t)+'</h3><p>'+esc(n.s)+'</p>'+row(pick,true)+
        (pool.length>1?'<button class="hq-swap" type="button" data-need="'+n.id+'">Show another option <span aria-hidden="true">↻</span></button>':'')+'</section>';
    });
    h+='</div>';
    bask.innerHTML=h+'<div class="hq-bask-f"></div>';
    $$('.hq-swap',bask).forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-need');swaps[id]=(swaps[id]||0)+1;updateBasket();var nb=$('.hq-swap[data-need="'+id+'"]',bask);nb&&nb.focus()})});
    $$('.hq-row input',bask).forEach(function(c){c.addEventListener('change',function(){sel[c.value]=c.checked;c.closest('.hq-row').classList.toggle('off',!c.checked);foot()})});
    foot();
  }
  function row(p){
    var on=sel[p.handle]!==false;
    return '<label class="hq-row'+(on?'':' off')+'"><input type="checkbox" value="'+esc(p.handle)+'"'+(on?' checked':'')+'><span class="hq-box" aria-hidden="true"></span>'+
      '<span class="hq-thumb">'+photo(p)+'</span><span class="hq-row-t"><span class="hq-mini-b">'+esc(p.brand)+'</span><span class="hq-mini-n">'+esc(cleanTitle(p.title))+'</span>'+
      (p.rating?'<span class="hq-row-r">'+stars(p.rating)+'<span>'+p.rating.toFixed(1)+' ('+p.reviewCount+')</span></span>':'')+'</span>'+
      '<span class="hq-row-p">'+money(p.price)+(p.compareAt&&p.compareAt>p.price?'<s>'+money(p.compareAt)+'</s>':'')+'</span></label>';
  }
  function foot(){
    var hs=$$('.hq-row input',bask).filter(function(c){return c.checked}).map(function(c){return c.value}),ps=hs.map(function(h){return BY[h]}),t=total(ps),f=$('.hq-bask-f',bask);
    if(!f)return;
    f.innerHTML='<div class="hq-total"><span>'+ps.length+' item'+(ps.length===1?'':'s')+'</span><span class="hq-total-v"><b>'+money(t)+'</b></span></div>'+
      '<button class="btn wide hq-addall" type="button" data-hs="'+hs.join(',')+'"'+(ps.length?'':' disabled')+'>'+(ps.length?'Add '+ps.length+' to basket':'Nothing selected')+'</button>'+
      '<p class="hq-kit-note">'+(t>=39?'Free UK delivery on this basket.':'Free UK delivery on orders over £39.')+'</p>';
    if(mbar){mbar.hidden=!ps.length;mbar.innerHTML='<span><b>'+esc(poss(st,true))+' basket</b> '+ps.length+' item'+(ps.length===1?'':'s')+' · '+money(t)+'</span><a href="#hq-bask" class="hq-mbar-a">View</a>'}
  }
  mbar&&mbar.addEventListener('click',function(e){if(e.target.closest('a')){e.preventDefault();scrollTo(bask)}});
  renderLog(true);renderComp();updateBasket();
}

/* ==========================================================================
   Version C: start from the problem. Areas (cards), symptoms, two quick
   questions about the dog, then Good / Better / Complete kits.
   ========================================================================== */
function initC(root){
  var app=$('[data-hq-app]',root),st={name:'',age:null,size:null,breed:null,build:null,areas:[],syms:[]},stepper;
  var steps=[
    {id:'areas',type:'multi',key:'areas',max:3,min:1,style:'cards',eyebrow:'Step 1',q:'Where is the <em>problem</em>?',hint:'Pick up to three areas.',
      opts:AREAS.map(function(a){return {k:a.k,t:a.n,d:a.ex}}),selText:function(st,n){return n+' of 3 chosen'},cta:function(){return 'Continue'}},
    {id:'syms',type:'multi',key:'syms',eyebrow:'Step 2',q:'What are you <em>noticing</em>?',hint:'Tap everything that applies.',
      groups:function(st){return symGroups(st.areas)},selText:selText,cta:function(st,n){return n?'Continue with '+n:'Not sure, continue'}},
    {id:'age',type:'single',key:'age',eyebrow:'Step 3',q:'How old is your dog?',opts:AGE,
      hint:'Add their name for a personal kit (optional).',
      pre:true},
    {id:'build',type:'single',key:'build',eyebrow:'Step 4',q:function(st){return 'Which sounds most like '+esc(dogName(st))+'?'},opts:BUILD,
      onPick:function(st,v){var b=BUILD.filter(function(x){return x.k===v})[0];st.size=b.size;st.breed=b.breed}}
  ];
  /* name field sits above the age tiles on step 3 */
  var obs=new MutationObserver(function(){
    var card=$('.hq-card',app);if(!card||card.getAttribute('data-step')!=='age'||$('.hq-cname',app))return;
    var hint=$('.hq-hint',app);if(!hint)return;
    hint.insertAdjacentHTML('afterend','<div class="hq-cname"><label for="hq-c-name">Name</label><input id="hq-c-name" type="text" maxlength="20" autocomplete="off" placeholder="Your dog’s name" value="'+esc(st.name)+'"></div>');
    var inp=$('#hq-c-name',app);inp.addEventListener('input',function(){st.name=inp.value.trim().replace(/^./,function(c){return c.toUpperCase()})});
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var o=$('.hq-o',app);o&&o.focus()}});
  });
  obs.observe(app,{childList:true,subtree:true});
  function start(goto){root.classList.remove('hq-done');stepper=Stepper(app,steps,st,showResults,{cls:'hq-card-c'});if(goto)stepper.goTo(goto)}
  start();
  function showResults(){
    var res=recommend(st),n=dogName(st);
    var needs=res.needs,tiers=makeTiers(needs);
    root.classList.add('hq-done');
    var tabs='<div class="hq-tabs" role="tablist" aria-label="Kits">'+tiers.map(function(t,i){return '<button role="tab" type="button" id="hq-tab-'+t.k+'" aria-controls="hq-tier-'+t.k+'" aria-selected="'+(i===1)+'" tabindex="'+(i===1?0:-1)+'">'+t.n+'</button>'}).join('')+'</div>';
    app.innerHTML='<section class="hq-res hq-res-c" aria-labelledby="hq-res-h">'+
      '<div class="hq-res-h hq-rise"><div><p class="hq-eyebrow">Your results</p><h2 id="hq-res-h" tabindex="-1">Three kits for <em>'+esc(n)+'</em></h2>'+
      '<p class="hq-res-s">Built from what you told us. Pick the one that suits you, or shop product by product below.</p>'+
      '<ul class="hq-bits" aria-label="Your answers">'+profileBits(st).slice(0,7).map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+'</ul></div>'+
      '<div class="hq-res-acts"><button class="btn sec hq-edit" type="button">Change answers</button><button class="hq-link hq-restart" type="button">Start again</button></div></div>'+
      tabs+'<div class="hq-tiers">'+tiers.map(function(t,i){return tierHtml(t,i)}).join('')+'</div>'+
      '<div class="sec-h hq-c-sub"><div><h2>What '+esc(n)+' <em>needs</em></h2><p>Every pick, area by area.</p></div></div>'+
      '<div class="hq-needs hq-needs-c">'+needsHtml(res,st).replace(/class="hq-need"/g,'class="hq-need hq-rv"')+'</div>'+
      '<p class="hq-calm">Our quiz doesn’t replace your vet.</p></section>';
    reveal(app);
    var tabBtns=$$('.hq-tabs [role=tab]',app);
    function pick(i,focus){tabBtns.forEach(function(b,j){b.setAttribute('aria-selected',i===j);b.tabIndex=i===j?0:-1});$$('.hq-tier',app).forEach(function(t,j){t.classList.toggle('on',i===j)});if(focus)tabBtns[i].focus()}
    tabBtns.forEach(function(b,i){b.addEventListener('click',function(){pick(i)});b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();pick((i+(e.key==='ArrowRight'?1:2))%3,true)}})});
    scrollTo(root.querySelector('.hq-c-top')||app);var h=$('#hq-res-h',app);setTimeout(function(){h.focus({preventScroll:true})},RM?0:400);
    $('.hq-edit',app).addEventListener('click',function(){start('syms')});
    $('.hq-restart',app).addEventListener('click',function(){st.name='';st.age=st.size=st.breed=st.build=null;st.areas=[];st.syms=[];start();scrollTo(root)});
  }
  function makeTiers(needs){
    var good=[needs[0].items[0]];
    var better=needs.map(function(n){return n.items[0]});if(better.length<2&&needs[0].items[1])better.push(needs[0].items[1]);
    var complete=better.slice();needs.forEach(function(n){if(n.items[1]&&!has(complete,n.items[1]))complete.push(n.items[1])});
    needs.forEach(function(n){if(n.items[2]&&complete.length<5&&!has(complete,n.items[2]))complete.push(n.items[2])});
    complete=complete.slice(0,6);
    return [
      {k:'good',n:'Good',s:'The one product to start with for '+needs[0].t.toLowerCase()+'.',ps:good},
      {k:'better',n:'Better',s:'Our top pick for each thing '+dogName(st)+' needs.',ps:better,best:1},
      {k:'complete',n:'Complete',s:'Everything, with a second product for each need.',ps:complete}
    ];
  }
  function tierHtml(t,i){
    var tot=total(t.ps),w=wasTotal(t.ps);
    return '<article class="hq-tier'+(t.best?' hq-tier-best':'')+(i===1?' on':'')+'" id="hq-tier-'+t.k+'" role="tabpanel" aria-labelledby="hq-tab-'+t.k+'">'+
      (t.best?'<span class="hq-flag">Our pick</span>':'')+
      '<div class="hq-tier-h"><h3>'+t.n+'</h3><p>'+esc(t.s)+'</p></div>'+
      '<div class="hq-tier-p"><b>'+money(tot)+'</b>'+(w>tot+.001?'<s>'+money(w)+'</s>':'')+'<span>'+t.ps.length+' item'+(t.ps.length===1?'':'s')+'</span></div>'+
      '<ul class="hq-tier-l">'+t.ps.map(function(p){return '<li>'+mini(p)+'</li>'}).join('')+'</ul>'+
      '<button class="btn wide hq-addall'+(t.best?'':' hq-ghost')+'" type="button" data-hs="'+t.ps.map(function(p){return p.handle}).join(',')+'">Add '+t.n+' kit to basket</button></article>';
  }
}

/* ---------- boot ---------- */
var root=document.querySelector('[data-hq]');
if(root){
  var v=root.getAttribute('data-hq');
  if(!PRODUCTS.length){root.insertAdjacentHTML('beforeend','<p class="wrap hq-calm">Products are loading. Please refresh the page.</p>');return}
  if(v==='a')initA(root);else if(v==='b')initB(root);else if(v==='c')initC(root);
  /* A starts on the name question; put the cursor there only if the user clicks Start */
}
window.PPQuiz={recommend:recommend,SYM:SYM,AREAS:AREAS};
})();
