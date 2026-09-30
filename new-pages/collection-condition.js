/* Poorly Pet collection page for a condition or a symptom. Shared by collection-condition-a/b/c.html.
   Load order: shell.js, products.js, offers.js, this file.
   One template, many collections: the hash picks the collection and holds the filters, e.g.
     #arthritis   #ivdd   #itchy-skin   #limping
     #arthritis&type=supplements,comfort&brand=aniforte&price=15-30&rating=4&offer=any&sort=price-asc
   The page root carries data-cc="a" | "b" | "c". Every class is prefixed cc-. */
(function(){
'use strict';

var P=window.PP_PRODUCTS||[],T=window.PP_TAGS||{},BY=window.PP_BY_HANDLE||{},OF=window.PPOffers;
var root=document.querySelector('[data-cc]');if(!root)return;
var V=root.getAttribute('data-cc');
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '£'+(Math.round(n*100)/100).toFixed(2)}
function cleanTitle(t){return String(t).replace(/\s*\|\s*/g,', ')}
function slug(s){return String(s).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

/* ---------- the collections this template can show ---------- */
var PAGES={
  arthritis:{
    name:'Arthritis',low:'arthritis',h1:'Arthritis <em>support</em>',tagKey:'arthritis',
    crumb:[['Shop by condition','#'],['Mobility & Joint','#']],
    line:'Joint supplements, orthopaedic beds, warmth and ramps for stiff, sore joints.',
    storeTags:['arthritis'],also:['legs-paws/stiffness-after-rest','legs-paws/slow-to-get-up','whole-body/general-stiffness-with-age'],
    helps:'For arthritis',
    qa:[
      ['What actually is arthritis?','Wear and inflammation inside a joint. The cushioning cartilage thins, so the joint gets stiff and sore. It is most common in older and bigger dogs, and after old injuries or hip and elbow dysplasia.'],
      ['How would I know?','Stiff after sleeping, then loosens up after a few minutes. Slow to get up. Less keen on stairs, jumping into the car or long walks. Licking at one joint.'],
      ['What helps at home?','A warm, padded bed off cold floors. Little and often walks with a gentle warm-up. Keep them lean. Rugs on slippery floors and a ramp for the car. Joint supplements help many dogs over a few weeks.']
    ],
    kit:{lead:'Inside, a better bed and warmth. The three we would start with.',items:[
      ['natural-vetcare-mobility-50-chews','Inside','A daily joint chew. Give it a few weeks.'],
      ['orthopaedic-memory-foam-mattress-for-dogs','Bed','Thick memory foam, up off cold floors.'],
      ['self-heating-pet-pad-no-electricity-needed-48x38cm','Warmth','Gentle warmth for stiff mornings. No plug needed.']]},
    related:[['hip-dysplasia','Hip dysplasia'],['elbow-dysplasia','Elbow dysplasia'],['spondylosis','Spondylosis'],['cruciate-ligament','Cruciate ligament'],['senior-support','Senior support']],
    relatedSym:[['legs-paws/stiffness-after-rest','Stiffness after rest'],['legs-paws/slow-to-get-up','Slow to get up'],['limping','Limping or favouring a leg'],['whole-body/general-stiffness-with-age','General stiffness with age']]
  },
  ivdd:{
    name:'IVDD',low:'IVDD',h1:'IVDD <em>support</em>',tagKey:'ivdd',
    crumb:[['Shop by condition','#'],['Mobility & Joint','#']],
    line:'Back braces, lift harnesses, ramps and slings for rest and recovery.',
    storeTags:['ivdd'],also:['back-spine','back-spine/hunched-or-arched-posture','back-spine/reluctant-to-jump-or-climb','back-spine/wobbly-back-legs','back-spine/yelping-when-touched'],
    helps:'For IVDD',
    qa:[
      ['What actually is IVDD?','A disc in the spine bulging or bursting and pressing on the cord. Dachshunds, Bassets, Corgis and Beagles are most at risk, but any dog can get it.'],
      ['How would I know?','A hunched back. A yelp when picked up. Reluctant to jump or do the stairs. Back legs that wobble, cross, or suddenly stop working.'],
      ['What do I do at home?','Strict rest first, weeks of it. A back brace to stop twisting, ramps so there is no jumping, grip on hard floors, and a harness with a handle for the toilet trips. Keep them lean.']
    ],
    kit:{lead:'Support, no jumping, and a lift. The three that make rest possible.',items:[
      ['thermal-back-brace-for-dogs-lumbar-spine-support','Support','Holds the spine still and warm. Stops the twist.'],
      ['lightweight-folding-dog-ramp-75kg-capacity-151cm','No jumping','No more jumping on and off the sofa or into the car.'],
      ['balto-body-lift','Lift','A handle for toilet trips and stairs while they heal.']]},
    related:[['back-pain','Back pain'],['spondylosis','Spondylosis'],['rear-leg-weakness','Rear leg weakness'],['degenerative-myelopathy','Degenerative myelopathy'],['paralysis','Paralysis'],['arthritis','Arthritis']],
    relatedSym:[['back-spine/hunched-or-arched-posture','Hunched or arched posture'],['back-spine/reluctant-to-jump-or-climb','Reluctant to jump or climb'],['back-spine/wobbly-back-legs','Wobbly back legs'],['back-spine/yelping-when-touched','Yelping when touched']]
  },
  'itchy-skin':{
    name:'Itchy skin',low:'itchy skin',h1:'Itchy skin <em>relief</em>',tagKey:'itchy-skin',
    crumb:[['Shop by condition','#'],['Skin & Allergies','#']],
    line:'Skin supplements, soothing sprays and balms, and gentle shampoos.',
    storeTags:['itchy-skin','itch-relief'],also:['skin-coat/excessive-scratching','skin-coat/red-or-irritated-skin','skin-coat/constant-licking-of-one-spot','seasonal-allergies'],
    helps:'For itchy skin & allergies',
    qa:[
      ['What actually is it?','An over-reaction to something ordinary. Pollen, grass, dust mites or a food. The skin gets inflamed, the dog scratches, the scratching makes it worse.'],
      ['How do I know that is what it is?','Scratching that wakes them at night. One paw licked rusty brown. Pink skin on the belly and armpits. Flakes on the bed.'],
      ['What do I do about it?','Omega 3 every day to calm the skin from inside. A gentle wash and a balm on the outside. A flea routine underneath it all. Most dogs settle in two to three weeks.']
    ],
    kit:{lead:'Inside, outside and a wash. The three we would start with.',items:[
      ['100-natural-scottish-salmon-oil-for-dogs-cats-500ml','Inside','Calms the skin from the inside. Give it three weeks.'],
      ['dog-skin-itch-relief-balm-natural-organic-60ml','Outside','Goes straight on the sore bits. Stops the licking.'],
      ['natural-gentle-dog-shampoo-suitable-for-sensitive-skin-all-coat-types','Wash','A gentle wash that does not strip the coat.']]},
    related:[['hot-spots','Hot spots'],['seasonal-allergies','Seasonal allergies'],['ear-eye-care','Ear & eye care'],['digestive-issues','Digestive issues']],
    relatedSym:[['skin-coat/excessive-scratching','Excessive scratching'],['legs-paws/licking-or-chewing-paws','Licking or chewing paws'],['skin-coat/red-or-irritated-skin','Red or irritated skin'],['skin-coat/flaky-skin-or-dandruff','Flaky skin or dandruff']]
  },
  limping:{
    name:'Limping',low:'limping',h1:'Limping or <em>favouring a leg</em>',tagKey:'legs-paws/limping-or-favouring-a-leg',symptom:true,
    crumb:[['Shop by symptom','#'],['Legs & paws','#']],crumbName:'Limping or favouring a leg',
    line:'Leg braces, support harnesses and grip for a dog that is sore on one leg.',
    storeTags:[],also:['legs-paws/holding-a-paw-up','cruciate-ligament','legs-paws','luxating-patella'],
    helps:'For limping',
    qa:[
      ['What does limping look like?','An uneven walk. A nod of the head when a front leg hurts, or a hitch in the hips when a back leg hurts.'],
      ['What is usually behind it?','A minor sprain or paw injury, arthritis, cruciate ligament damage, a slipping kneecap, or hip or elbow dysplasia.'],
      ['What helps at home?','Rest on the lead for a few days: no running, jumping or stairs. Non-slip rugs help a sore dog keep its footing. Never give human painkillers: ibuprofen and paracetamol are toxic to dogs.']
    ],
    kit:{lead:'Rest, grip and a helping hand. The three we would start with.',items:[
      ['reusable-hot-cold-therapy-pack-for-pets','Rest','A reusable pack, cold or warm, for rest days.'],
      ['grip-trex-outdoor-dog-boots-with-vibram-sole','Grip','A grippy sole so they keep their footing.'],
      ['rear-support-harness-for-dogs-with-hip-mobility-issues','Support','A handle to take the weight on steps and in the car.']]},
    related:[['arthritis','Arthritis'],['cruciate-ligament','Cruciate ligament'],['luxating-patella','Luxating patella'],['hip-dysplasia','Hip dysplasia'],['elbow-dysplasia','Elbow dysplasia']],
    relatedSym:[['legs-paws/holding-a-paw-up','Holding a paw up'],['legs-paws/stiffness-after-rest','Stiffness after rest'],['legs-paws/slow-to-get-up','Slow to get up'],['legs-paws/licking-or-chewing-paws','Licking or chewing paws']]
  }
};
var ORDER=[['arthritis','Arthritis'],['ivdd','IVDD'],['itchy-skin','Itchy skin'],['limping','Limping']];

/* ---------- product facets ---------- */
var TYPES=[
  ['kits','Care kits'],['supplements','Supplements'],['braces','Braces & supports'],['mobility','Mobility aids'],
  ['comfort','Beds & warmth'],['skin','Skin care & grooming'],['recovery','Recovery & first aid'],['food','Food & treats'],['other','Other care']];
var TYPE_NAME={};TYPES.forEach(function(t){TYPE_NAME[t[0]]=t[1]});
function group(p){
  var t=(p.productType||'').toLowerCase(),ti=(p.title||'').toLowerCase();
  if(t==='condition bundle')return 'kits';
  if(OF&&OF.test.isSupplement(p)||/supplement/.test(t))return 'supplements';
  if(/food|treat|topper/.test(t))return 'food';
  if(/brace|splint|orthop(a)?edic support|joint support/.test(t))return 'braces';
  if(/wheelchair|harness|sling|ramp|stairs|mobility|rehab|boot|lift/.test(t)||/drag bag/.test(ti))return 'mobility';
  if(/bed|mattress|blanket|pad\b|coat|heat|cooling/.test(t))return 'comfort';
  if(/shampoo|conditioner|groom|balm|spray|wipes|gel|cologne|deodor|detangl|cleaner|dental|toothpaste|disinfect/.test(t))return 'skin';
  if(/recovery|first aid|wound|bandage|collar|shirt|therapy|cover|wrap/.test(t))return 'recovery';
  return 'other';
}
var PRICES=[['0-15','Under £15',0,15],['15-30','£15 to £30',15,30],['30-60','£30 to £60',30,60],['60-100','£60 to £100',60,100],['100-','£100 and over',100,1e9]];
function priceBand(p){for(var i=0;i<PRICES.length;i++)if(p.price>=PRICES[i][2]&&p.price<PRICES[i][3])return PRICES[i][0];return ''}
function offersOf(p){return OF?OF.forProduct(p):[]}
function onOffer(p){return offersOf(p).length>0||(p.compareAt&&p.compareAt>p.price)}
var SORTS=[['best','Best match'],['price-asc','Price, low to high'],['price-desc','Price, high to low'],['rating','Top rated'],['name','Name, A to Z']];

/* ---------- build the collection ---------- */
function collection(cfg){
  var out=[],seen={};
  function add(h){if(BY[h]&&!seen[h]){seen[h]=1;out.push(BY[h])}}
  (T[cfg.tagKey]||[]).forEach(add);
  if(cfg.storeTags.length)P.forEach(function(p){if((p.tags||[]).some(function(t){return cfg.storeTags.indexOf(String(t).toLowerCase())>-1}))add(p.handle)});
  cfg.also.forEach(function(k){(T[k]||[]).forEach(add)});
  return out;
}

/* ---------- state <-> hash ---------- */
var S={key:'arthritis',type:[],brand:[],price:[],rating:0,offer:'',sort:'best',tab:'products'};
var LIST=[],CFG=null,SHOWN=0,BRANDS=[];
var PG=document.querySelector('[data-cc-el="grid"][data-page]'),PAGE=PG?+PG.getAttribute('data-page'):12;
function parseHash(){
  var h=decodeURIComponent((location.hash||'').replace(/^#/,'')),parts=h.split('&'),o={key:'',type:[],brand:[],price:[],rating:0,offer:'',sort:'best',tab:'products'};
  parts.forEach(function(x){
    if(!x)return;
    var i=x.indexOf('=');
    if(i<0){if(PAGES[x])o.key=x;else if(x==='legs-paws/limping-or-favouring-a-leg')o.key='limping';return}
    var k=x.slice(0,i),v=x.slice(i+1);
    if(k==='type')o.type=v.split(',').filter(function(t){return TYPE_NAME[t]});
    else if(k==='brand')o.brand=v.split(',').filter(Boolean);
    else if(k==='price')o.price=v.split(',').filter(function(t){return PRICES.some(function(p){return p[0]===t})});
    else if(k==='rating')o.rating=v==='4'?4:0;
    else if(k==='offer')o.offer=v;
    else if(k==='sort')o.sort=SORTS.some(function(s){return s[0]===v})?v:'best';
    else if(k==='tab')o.tab=/^(products|kits|guide)$/.test(v)?v:'products';
  });
  if(!o.key)o.key='arthritis';
  return o;
}
function hashStr(){
  var a=[S.key];
  if(S.type.length)a.push('type='+S.type.join(','));
  if(S.brand.length)a.push('brand='+S.brand.join(','));
  if(S.price.length)a.push('price='+S.price.join(','));
  if(S.rating)a.push('rating='+S.rating);
  if(S.offer)a.push('offer='+S.offer);
  if(S.sort!=='best')a.push('sort='+S.sort);
  if(V==='c'&&S.tab!=='products')a.push('tab='+S.tab);
  return a.join('&');
}
function writeHash(){
  var h='#'+hashStr();
  if(location.hash!==h){try{history.replaceState(null,'',h)}catch(e){location.hash=h}}
  $$('[data-cc-ver]').forEach(function(a){a.setAttribute('href',a.getAttribute('data-cc-ver')+h)});
}

/* ---------- filtering ---------- */
function matches(p,skip){
  if(skip!=='type'&&S.type.length&&S.type.indexOf(group(p))<0)return false;
  if(skip!=='brand'&&S.brand.length&&S.brand.indexOf(slug(p.brand))<0)return false;
  if(skip!=='price'&&S.price.length&&S.price.indexOf(priceBand(p))<0)return false;
  if(skip!=='rating'&&S.rating&&!(p.rating>=S.rating))return false;
  if(skip!=='offer'&&S.offer){
    if(S.offer==='any'){if(!onOffer(p))return false}
    else if(!offersOf(p).some(function(o){return o.id===S.offer}))return false;
  }
  return true;
}
function filtered(){
  var l=LIST.filter(function(p){return matches(p)}),idx={};
  LIST.forEach(function(p,i){idx[p.handle]=i});
  var s=S.sort;
  l.sort(function(a,b){
    if(s==='price-asc')return a.price-b.price||idx[a.handle]-idx[b.handle];
    if(s==='price-desc')return b.price-a.price||idx[a.handle]-idx[b.handle];
    if(s==='rating')return (b.rating||0)-(a.rating||0)||(b.reviewCount||0)-(a.reviewCount||0)||idx[a.handle]-idx[b.handle];
    if(s==='name')return cleanTitle(a.title).localeCompare(cleanTitle(b.title));
    return idx[a.handle]-idx[b.handle];
  });
  return l;
}
function activeCount(){return S.type.length+S.brand.length+S.price.length+(S.rating?1:0)+(S.offer?1:0)}

/* ---------- the one site product card (PPCard, card.js + css/card.css) ---------- */
function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
function rev(p){
  if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
  var n=p.reviewCount||0;
  return '<a class="rev" href="#" aria-label="Rated '+(Math.round(p.rating*10)/10)+' out of 5 from '+n+' review'+(n===1?'':'s')+'">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
}
function img(p,cls){return p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy" data-cc-img'+(cls?' class="'+cls+'"':'')+'>':'<span class="cc-noimg" aria-hidden="true"></span>'}
function pk(p){
  return PPCard.html(Object.assign({},p,{title:cleanTitle(p.title)}),{tab:TYPE_NAME[group(p)]||'',helps:CFG.helps||''});
}
/* a blocked or missing photo falls back to the plain well */
document.addEventListener('error',function(e){
  var t=e.target;
  if(t&&t.tagName==='IMG'&&t.hasAttribute('data-cc-img')){var s=document.createElement('span');s.className='cc-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
},true);

/* ---------- the homepage kit panel (.ed3 .sell) and Ask us panel (.ed3 .talk) ---------- */
function kitItems(){return CFG.kit.items.map(function(k){return {p:BY[k[0]],k:k[1],w:k[2]}}).filter(function(x){return x.p})}
function kitHtml(){
  var it=kitItems(),tot=it.reduce(function(a,x){return a+x.p.price},0),now=Math.round(tot*95)/100;
  return '<div class="sell"><h4>The '+esc(CFG.low)+' kit</h4><p class="lead">'+esc(CFG.kit.lead)+'</p><div class="kit">'+
    it.map(function(x){return '<a class="ki" href="#"><span class="img">'+img(x.p)+'</span><span><span class="k">'+esc(x.k)+'</span><span class="n">'+esc(cleanTitle(x.p.title))+'</span><span class="w">'+esc(x.w)+'</span></span></a>'}).join('')+
    '</div><div class="buy"><span><span class="k">The '+esc(CFG.low)+' kit, all three</span><span class="sv">5% off together</span></span><span class="p">'+money(now)+'<s>'+money(tot)+'</s></span>'+
    '<button class="btn" type="button" data-addkit="'+it.map(function(x){return x.p.handle}).join(',')+'" data-total="'+now+'">Add all three</button></div></div>';
}
function askHtml(){
  return '<div class="talk"><h3>Ask us about <em>'+esc(CFG.low)+'.</em></h3><div class="qa">'+
    CFG.qa.map(function(q,i){return '<button class="q'+(i===0?' on':'')+'" type="button" id="cc-q'+V+i+'" aria-expanded="'+(i===0)+'" aria-controls="cc-a'+V+i+'" data-q="'+i+'">'+esc(q[0])+'</button><div class="a'+(i===0?' on':'')+'" id="cc-a'+V+i+'" role="region" aria-labelledby="cc-q'+V+i+'">'+esc(q[1])+'</div>'}).join('')+
    '</div></div>';
}
function openQ(i,focus){
  $$('.qa').forEach(function(qa){
    $$('.q',qa).forEach(function(b,j){var on=j===i;b.classList.toggle('on',on);b.setAttribute('aria-expanded',on);var a=b.nextElementSibling;if(a)a.classList.toggle('on',on)});
  });
  if(focus){var b=$$('.qa .q').filter(function(x){return x.getAttribute('data-q')==String(i)&&x.offsetParent})[0];if(b){b.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});b.focus({preventScroll:true})}}
}

/* ---------- offers strip ---------- */
function offersHtml(){
  if(!OF)return '';
  return '<ul class="cc-offs">'+OF.all.map(function(o){
    var n=LIST.filter(function(p){return offersOf(p).some(function(x){return x.id===o.id})}).length;
    return '<li><a href="#" class="cc-off'+(S.offer===o.id?' on':'')+'" '+(n?'data-offer="'+o.id+'"':'')+'><b>'+esc(o.name)+'</b><span>'+(n?n+' in '+esc(CFG.low)+' ›':'See the offer ›')+'</span></a></li>';
  }).join('')+'</ul>';
}

/* ---------- facet data ---------- */
function facetCounts(){
  var c={type:{},brand:{},price:{},rating:0,offer:{any:0}};
  LIST.forEach(function(p){
    c.type[group(p)]=(c.type[group(p)]||0)+1;
    var b=slug(p.brand);c.brand[b]=(c.brand[b]||0)+1;
    var pb=priceBand(p);c.price[pb]=(c.price[pb]||0)+1;
    if(p.rating>=4)c.rating++;
    if(onOffer(p))c.offer.any++;
    offersOf(p).forEach(function(o){c.offer[o.id]=(c.offer[o.id]||0)+1});
  });
  return c;
}
function brandList(){
  var m={};LIST.forEach(function(p){var s=slug(p.brand);if(!m[s])m[s]={id:s,name:p.brand,n:0};m[s].n++});
  return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.n-a.n||a.name.localeCompare(b.name)});
}
function offerOpts(c){
  var o=[['any','Any offer',c.offer.any]];
  if(OF)OF.all.forEach(function(x){if(c.offer[x.id])o.push([x.id,x.short.charAt(0).toUpperCase()+x.short.slice(1),c.offer[x.id]])});
  return o;
}
function labelFor(k,v){
  if(k==='type')return TYPE_NAME[v];
  if(k==='brand'){var b=BRANDS.filter(function(x){return x.id===v})[0];return b?b.name:v}
  if(k==='price'){var p=PRICES.filter(function(x){return x[0]===v})[0];return p?p[1]:v}
  if(k==='rating')return '4 stars and up';
  if(k==='offer'){if(v==='any')return 'On offer';var o=OF&&OF.all.filter(function(x){return x.id===v})[0];return o?o.name:v}
  return v;
}

/* ---------- filters UI, three styles ---------- */
var fid=0;
function cb(k,v,label,n,type){
  var id='cc-f'+(++fid),checked=type==='radio'?(k==='rating'?String(S.rating||'')===v:S[k]===v):S[k].indexOf(v)>-1;
  return '<label class="cc-opt" for="'+id+'"><input id="'+id+'" type="'+(type||'checkbox')+'" name="cc-'+k+'-'+V+'" data-f="'+k+'" value="'+esc(v)+'"'+(checked?' checked':'')+'><span class="cc-ol">'+esc(label)+'</span>'+(n!=null?'<span class="cc-on">'+n+'</span>':'')+'</label>';
}
function sidebarHtml(){
  var c=facetCounts();fid=0;
  var types=TYPES.filter(function(t){return c.type[t[0]]});
  var h='<div class="cc-side-h"><h2>Filter</h2><button class="cc-link" type="button" data-clear'+(activeCount()?'':' hidden')+'>Clear all</button></div>';
  h+='<fieldset class="cc-fg"><legend>Product type</legend>'+types.map(function(t){return cb('type',t[0],t[1],c.type[t[0]])}).join('')+'</fieldset>';
  var bl=BRANDS,more=bl.length>6;
  h+='<fieldset class="cc-fg"><legend>Brand</legend><div class="cc-brands'+(more?' cc-short':'')+'">'+bl.map(function(b,i){return (i===6?'<div class="cc-more-b">':'')+cb('brand',b.id,b.name,b.n)}).join('')+(more?'</div>':'')+'</div>'+
    (more?'<button class="cc-link" type="button" data-morebrands aria-expanded="false">Show all '+bl.length+' brands</button>':'')+'</fieldset>';
  h+='<fieldset class="cc-fg"><legend>Price</legend>'+PRICES.filter(function(p){return c.price[p[0]]}).map(function(p){return cb('price',p[0],p[1],c.price[p[0]])}).join('')+'</fieldset>';
  h+='<fieldset class="cc-fg"><legend>Customer rating</legend>'+cb('rating','','Any rating',null,'radio')+cb('rating','4','4 stars and up',c.rating,'radio')+'</fieldset>';
  h+='<fieldset class="cc-fg"><legend>Offers</legend>'+cb('offer','','All products',null,'radio')+offerOpts(c).map(function(o){return cb('offer',o[0],o[1],o[2],'radio')}).join('')+'</fieldset>';
  return h;
}
function chipsHtml(){
  var c=facetCounts();fid=0;
  var types=TYPES.filter(function(t){return c.type[t[0]]});
  var h='<div class="cc-chiprow" role="group" aria-label="Product type">'+
    '<button type="button" class="cc-chip'+(S.type.length?'':' on')+'" data-typeall aria-pressed="'+!S.type.length+'">All <span>'+LIST.length+'</span></button>'+
    types.map(function(t){var on=S.type.indexOf(t[0])>-1;return '<button type="button" class="cc-chip'+(on?' on':'')+'" data-chip="type" data-v="'+t[0]+'" aria-pressed="'+on+'">'+esc(t[1])+' <span>'+c.type[t[0]]+'</span></button>'}).join('')+'</div>';
  function dd(k,label,body,n){return '<details class="cc-dd" data-dd="'+k+'"><summary class="cc-chip'+(n?' on':'')+'">'+label+(n?' ('+n+')':'')+'</summary><div class="cc-pop">'+body+'</div></details>'}
  var offOn=S.offer==='any';
  h+='<div class="cc-ddrow">'+
    dd('brand','Brand',BRANDS.map(function(b){return cb('brand',b.id,b.name,b.n)}).join(''),S.brand.length)+
    dd('price','Price',PRICES.filter(function(p){return c.price[p[0]]}).map(function(p){return cb('price',p[0],p[1],c.price[p[0]])}).join(''),S.price.length)+
    dd('rating','Rating',cb('rating','','Any rating',null,'radio')+cb('rating','4','4 stars and up',c.rating,'radio'),S.rating?1:0)+
    '<button type="button" class="cc-chip cc-offchip'+(S.offer?' on':'')+'" data-offtoggle aria-pressed="'+!!S.offer+'">On offer <span>'+c.offer.any+'</span></button>'+
    '</div>';
  return h;
}
function barHtml(){
  var c=facetCounts();
  function sel(k,label,opts,cur){
    return '<label class="cc-sel"><span>'+label+'</span><select data-fsel="'+k+'"><option value="">All</option>'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(cur===o[0]?' selected':'')+'>'+esc(o[1])+' ('+o[2]+')</option>'}).join('')+'</select></label>';
  }
  return sel('type','Product type',TYPES.filter(function(t){return c.type[t[0]]}).map(function(t){return [t[0],t[1],c.type[t[0]]]}),S.type[0]||'')+
    sel('brand','Brand',BRANDS.map(function(b){return [b.id,b.name,b.n]}),S.brand[0]||'')+
    sel('price','Price',PRICES.filter(function(p){return c.price[p[0]]}).map(function(p){return [p[0],p[1],c.price[p[0]]]}),S.price[0]||'')+
    sel('rating','Rating',[['4','4 stars and up',c.rating]],S.rating?'4':'')+
    '<label class="cc-tog"><input type="checkbox" data-offcheck'+(S.offer?' checked':'')+'><span>On offer ('+c.offer.any+')</span></label>';
}
function activeHtml(){
  var a=[];
  ['type','brand','price'].forEach(function(k){S[k].forEach(function(v){a.push([k,v])})});
  if(S.rating)a.push(['rating','4']);if(S.offer)a.push(['offer',S.offer]);
  if(!a.length)return '';
  return '<span class="cc-act-l">Filtered by</span>'+a.map(function(x){return '<button type="button" class="cc-pill" data-rm="'+x[0]+'" data-v="'+esc(x[1])+'" aria-label="Remove filter '+esc(labelFor(x[0],x[1]))+'">'+esc(labelFor(x[0],x[1]))+' <span aria-hidden="true">×</span></button>'}).join('')+'<button type="button" class="cc-link" data-clear>Clear all</button>';
}
function sortHtml(){
  return '<label class="cc-sort"><span>Sort by</span><select data-sort>'+SORTS.map(function(s){return '<option value="'+s[0]+'"'+(S.sort===s[0]?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select></label>';
}

/* ---------- render ---------- */
function set(name,html){$$('[data-cc-el="'+name+'"]').forEach(function(el){el.innerHTML=html})}
function renderAll(){
  CFG=PAGES[S.key];LIST=collection(CFG);BRANDS=brandList();
  document.title=(CFG.crumbName||CFG.name)+'. Poorly Pet';
  var last=CFG.crumbName||CFG.name;
  set('crumb','<ol>'+CFG.crumb.map(function(c){return '<li><a href="'+c[1]+'">'+esc(c[0])+'</a></li>'}).join('')+'<li aria-current="page">'+esc(last)+'</li></ol>');
  set('h1',CFG.h1);
  set('line',esc(CFG.line));
  set('total',LIST.length+' products');
  set('ask',askHtml());
  set('kit',kitHtml());
  set('kitname','The '+esc(CFG.low)+' kit');
  set('low',esc(CFG.low));
  set('offers',offersHtml());
  set('related',relatedHtml());
  set('kits',kitsTabHtml());
  $$('[data-cc-el="shop"]').forEach(function(a){a.textContent='Shop '+CFG.low+' ›'});
  $$('[data-cc-sw]').forEach(function(a){var on=a.getAttribute('data-cc-sw')===S.key;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  renderFilters();applyList(true);
}
function relatedHtml(){
  function chip(r){var k=r[0],own=PAGES[k];return '<li><a class="cc-rel" href="'+(own?'#'+k:'#')+'"'+(own?' data-go="'+k+'"':'')+'>'+esc(r[1])+'</a></li>'}
  return '<div class="cc-relg"><h3>Related conditions</h3><ul>'+CFG.related.map(chip).join('')+'</ul></div>'+
    '<div class="cc-relg"><h3>Related symptoms</h3><ul>'+CFG.relatedSym.map(chip).join('')+'</ul></div>';
}
function kitsTabHtml(){
  var seen={},ks=[];
  LIST.forEach(function(p){if(group(p)==='kits'&&!seen[p.handle]){seen[p.handle]=1;ks.push(p)}});
  CFG.related.forEach(function(r){var b=BY[r[0]+'-bundle'];if(b&&!seen[b.handle]){seen[b.handle]=1;ks.push(b)}});
  return ks.map(pk).join('');
}
function renderFilters(){
  $$('[data-cc-el="filters"]').forEach(function(el){
    var m=el.getAttribute('data-mode');
    el.innerHTML=m==='side'?sidebarHtml():m==='chips'?chipsHtml():barHtml();
  });
  set('sort',sortHtml());
  updateActive();
}
function updateActive(){
  set('active',activeHtml());
  $$('[data-cc-el="active"]').forEach(function(el){el.hidden=!activeCount()});
  $$('[data-clear]').forEach(function(b){if(b.closest('[data-cc-el="active"]'))return;b.hidden=!activeCount()});
  var n=activeCount();
  $$('[data-cc-el="fcount"]').forEach(function(el){el.textContent=n?' ('+n+')':''});
}
function colCount(g){
  var c=getComputedStyle(g).gridTemplateColumns;return c&&c!=='none'?c.split(' ').filter(Boolean).length:1;
}
var CUR=[];
function applyList(reset){
  CUR=filtered();
  if(reset)SHOWN=Math.min(PAGE,CUR.length);else SHOWN=Math.min(Math.max(SHOWN,PAGE),CUR.length);
  drawGrid();
  set('shown',String(CUR.length));
  set('tabcount',String(LIST.length));
  writeHash();
}
function drawGrid(focusFrom){
  $$('[data-cc-el="grid"]').forEach(function(g){
    if(!CUR.length){g.innerHTML='<div class="cc-empty"><p><b>No products match these filters.</b></p><p>Try removing one, or <button type="button" class="cc-link" data-clear>clear all filters</button>.</p></div>';return}
    var items=CUR.slice(0,SHOWN).map(pk);
    if(g.hasAttribute('data-kitafter')&&!activeCount()){
      var cols=colCount(g),at=Math.min(cols,items.length);
      items.splice(at,0,'<div class="ed3 cc-kitban">'+kitHtml()+'</div>');
    }
    g.innerHTML=items.join('');
    if(focusFrom!=null){var cards=$$('.pk',g);var t=cards[focusFrom];if(t){var n=$('.name',t);if(n)n.focus()}}
  });
  var left=CUR.length-SHOWN;
  set('more',CUR.length?'<p class="cc-prog">You have seen '+SHOWN+' of '+CUR.length+' products</p><span class="cc-bar" aria-hidden="true"><i style="width:'+(CUR.length?Math.round(SHOWN/CUR.length*100):0)+'%"></i></span>'+(left>0?'<button class="btn sec" type="button" data-loadmore>Load '+Math.min(PAGE,left)+' more</button>':''):'');
  set('count','Showing <b>'+Math.min(SHOWN,CUR.length)+'</b> of <b>'+CUR.length+'</b> products');
}

/* ---------- basket: header count and a small toast ---------- */
var toastEl,toastT;
function addToBasket(hs,btn,label){
  hs=[].concat(hs).filter(function(h){return BY[h]});if(!hs.length)return;
  var cnts=$$('.cnt'),n=(cnts.length?parseInt(cnts[0].textContent,10)||0:0)+hs.length;
  cnts.forEach(function(c){c.textContent=n;c.setAttribute('data-n',n)});
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='cc-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.innerHTML='<span><b>'+(hs.length===1?'Added to basket':hs.length+' items added')+'</b>'+esc(hs.length===1?cleanTitle(BY[hs[0]].title):label)+'</span><a href="#">View basket ('+n+')</a>';
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3600);
  if(btn){var o=btn.getAttribute('data-o')||btn.textContent;btn.setAttribute('data-o',o);btn.textContent='Added';clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent=o},1800)}
}

/* ---------- events ---------- */
function toggleArr(k,v){var a=S[k],i=a.indexOf(v);if(i>-1)a.splice(i,1);else a.push(v)}
function changed(keepFilters){renderFilters();applyList(true);if(keepFilters)restoreFocus(keepFilters)}
function restoreFocus(sel){var el=$(sel);if(el)el.focus()}
function clearAll(){S.type=[];S.brand=[];S.price=[];S.rating=0;S.offer=''}

document.addEventListener('click',function(e){
  var t=e.target,b;
  if(!t.closest)return;
  if((b=t.closest('[data-add]'))){e.preventDefault();addToBasket(b.getAttribute('data-add'),b);return}
  if((b=t.closest('[data-addkit]'))){e.preventDefault();addToBasket(b.getAttribute('data-addkit').split(','),b,'The '+CFG.low+' kit, '+money(+b.getAttribute('data-total'))+' with 5% off');return}
  if((b=t.closest('.qa .q'))){var i=+b.getAttribute('data-q');if(b.classList.contains('on')){b.classList.remove('on');b.setAttribute('aria-expanded','false');b.nextElementSibling.classList.remove('on')}else openQ(i);return}
  if((b=t.closest('[data-signs]'))){e.preventDefault();if(V==='c')setTab('guide');openQ(1,true);return}
  if((b=t.closest('[data-offer]'))){e.preventDefault();S.offer=b.getAttribute('data-offer')===S.offer?'':b.getAttribute('data-offer');if(V==='c')setTab('products');set('offers',offersHtml());changed();scrollToList();return}
  if((b=t.closest('[data-clear]'))){e.preventDefault();clearAll();changed();var f=$('[data-cc-el="filters"] input, [data-cc-el="filters"] button, [data-cc-el="filters"] select');set('offers',offersHtml());if(f)f.focus();return}
  if((b=t.closest('[data-rm]'))){var k=b.getAttribute('data-rm'),v=b.getAttribute('data-v');if(k==='rating')S.rating=0;else if(k==='offer')S.offer='';else toggleArr(k,v);set('offers',offersHtml());changed();var nx=$('[data-cc-el="active"] .cc-pill')||$('[data-sort]');if(nx)nx.focus();return}
  if((b=t.closest('[data-chip]'))){toggleArr('type',b.getAttribute('data-v'));changed('[data-chip][data-v="'+b.getAttribute('data-v')+'"]');return}
  if((b=t.closest('[data-typeall]'))){S.type=[];changed('[data-typeall]');return}
  if((b=t.closest('[data-offtoggle]'))){S.offer=S.offer?'':'any';set('offers',offersHtml());changed('[data-offtoggle]');return}
  if((b=t.closest('[data-loadmore]'))){var from=SHOWN;SHOWN=Math.min(SHOWN+PAGE,CUR.length);drawGrid(from);return}
  if((b=t.closest('[data-morebrands]'))){var box=b.previousElementSibling,op=box.classList.toggle('cc-short');b.setAttribute('aria-expanded',!op);b.textContent=op?'Show all '+BRANDS.length+' brands':'Show fewer brands';return}
  if((b=t.closest('[data-ftoggle]'))){var pn=document.getElementById(b.getAttribute('aria-controls'));var open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',open);pn.classList.toggle('cc-open',open);if(open){var fi=$('input,select,button',pn);if(fi)fi.focus()}return}
  if((b=t.closest('[data-fdone]'))){var pn2=b.closest('.cc-side');pn2.classList.remove('cc-open');var tg=$('[data-ftoggle]');if(tg){tg.setAttribute('aria-expanded','false');tg.focus()}scrollToList();return}
  if((b=t.closest('[data-tab]'))){e.preventDefault();setTab(b.getAttribute('data-tab'));return}
  if((b=t.closest('[data-go]'))){e.preventDefault();go(b.getAttribute('data-go'));return}
  if((b=t.closest('[data-cc-sw]'))){e.preventDefault();go(b.getAttribute('data-cc-sw'));return}
  /* close brand/price dropdowns when clicking elsewhere */
  $$('details.cc-dd[open]').forEach(function(d){if(!d.contains(t))d.removeAttribute('open')});
  if((b=t.closest('a[href="#"]'))&&root.contains(b))e.preventDefault();
});
document.addEventListener('change',function(e){
  var t=e.target,k=t.getAttribute('data-f');
  if(k){
    if(t.type==='checkbox')toggleArr(k,t.value);
    else if(k==='rating')S.rating=t.value==='4'?4:0;
    else if(k==='offer')S.offer=t.value;
    if(k==='offer')set('offers',offersHtml());
    var dd=t.closest('details.cc-dd'),ddk=dd&&dd.getAttribute('data-dd');
    var sel='[data-f="'+k+'"][value="'+t.value+'"]';
    changed(sel);
    if(ddk){var nd=$('details.cc-dd[data-dd="'+ddk+'"]');if(nd){nd.setAttribute('open','');restoreFocus(sel)}}
    return;
  }
  if(t.hasAttribute('data-sort')){S.sort=t.value;applyList(true);restoreFocus('[data-sort]');return}
  if((k=t.getAttribute('data-fsel'))){
    if(k==='rating')S.rating=t.value?4:0;else S[k]=t.value?[t.value]:[];
    changed('[data-fsel="'+k+'"]');return;
  }
  if(t.hasAttribute('data-offcheck')){S.offer=t.checked?'any':'';set('offers',offersHtml());changed('[data-offcheck]');return}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var d=$('details.cc-dd[open]');if(d){d.removeAttribute('open');$('summary',d).focus();return}
    var sp=$('.cc-side.cc-open');if(sp){sp.classList.remove('cc-open');var tg=$('[data-ftoggle]');if(tg){tg.setAttribute('aria-expanded','false');tg.focus()}}
  }
  var tab=e.target.closest&&e.target.closest('[role="tab"]');
  if(tab&&(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Home'||e.key==='End')){
    var tabs=$$('[role="tab"]'),i=tabs.indexOf(tab);
    i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    e.preventDefault();setTab(tabs[i].getAttribute('data-tab'));tabs[i].focus();
  }
});
function scrollToList(){var l=$('[data-cc-el="listtop"]');if(l){var y=l.getBoundingClientRect().top+window.pageYOffset-16;if(Math.abs(y-window.pageYOffset)>40)window.scrollTo({top:y,behavior:RM?'auto':'smooth'})}}
function go(k){if(!PAGES[k])return;S={key:k,type:[],brand:[],price:[],rating:0,offer:'',sort:'best',tab:V==='c'?S.tab:'products'};renderAll();setTab(S.tab,true);window.scrollTo({top:0,behavior:RM?'auto':'smooth'})}

/* ---------- version C tabs ---------- */
function setTab(name,silent){
  if(V!=='c')return;
  S.tab=name;
  $$('[role="tab"]').forEach(function(t){var on=t.getAttribute('data-tab')===name;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;t.classList.toggle('on',on)});
  $$('[role="tabpanel"]').forEach(function(p){p.hidden=p.id!=='cc-p-'+name});
  if(name==='products')drawGrid();
  writeHash();
}

window.addEventListener('hashchange',function(){
  var o=parseHash();
  var same=o.key===S.key;
  S=o;
  if(same){renderFilters();applyList(true)}else renderAll();
  setTab(S.tab,true);
});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if($('[data-kitafter]'))drawGrid()},150)});

/* ---------- boot ---------- */
S=parseHash();
$$('[data-cc-el="switch"]').forEach(function(el){
  el.innerHTML='<span>Preview</span>'+ORDER.map(function(o){return '<a href="#'+o[0]+'" data-cc-sw="'+o[0]+'">'+esc(o[1])+'</a>'}).join('');
});
renderAll();
setTab(S.tab,true);
})();
