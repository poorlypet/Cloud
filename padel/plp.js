/* PADEL collection page. Reads window.PLPCFG, renders into #plp-root. Needs classic.js first. */
(()=>{
const C=window.PLPCFG,K=window.PADEL;const {tpLogo,P,card,stars,IMG,LVL,gbp,hasImg}=K;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rating=x=>+(4.5+((x.i*7)%5)/10).toFixed(1),revs=x=>12+(x.i*37)%180;
const rackets=P.filter(x=>x.c==='racket');
const BASE=C.cat?()=>P.filter(x=>(C.cat==='all'||x.c===C.cat)&&(!C.newOnly||x.nw)&&(!C.saleOnly||x.w)):C.q?()=>P.filter(x=>x.c!=='pickle'&&new RegExp(C.q,'i').test(x.b+' '+x.n)):{rackets:()=>rackets,sale:()=>rackets.filter(x=>x.w),beginner:()=>rackets.filter(x=>x.l===1)}[C.base]||(()=>rackets.filter(x=>x.b===C.base));const UNIT=C.unit||'rackets';const FK={brands:'b',levels:'l',shapes:'sh',types:'t',genders:'g',cats:'c'};
const base=BASE();
const S={brands:new Set(),levels:new Set(C.levels||[]),shapes:new Set(C.shapes||[]),types:new Set(C.types||[]),genders:new Set(),cats:new Set(),max:Math.min(C.maxP||1e9,Math.max(...base.map(x=>x.p))),max0:Math.max(...base.map(x=>x.p)),rating:0,sale:false,sort:C.sort||'pop',shown:12,cmp:new Set()};
const MAXP=S.max0;
const ARW=K.ARW||'→';
const ico={two:'<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="14" fill="currentColor"/><rect x="9" y="1" width="6" height="14" fill="currentColor"/></svg>',grid:'<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" fill="currentColor"/><rect x="9" y="1" width="6" height="6" fill="currentColor"/><rect x="1" y="9" width="6" height="6" fill="currentColor"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>',
 list:'<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="3" fill="currentColor"/><rect x="1" y="7" width="14" height="3" fill="currentColor"/><rect x="1" y="12" width="14" height="3" fill="currentColor"/></svg>',
 filt:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>'};

function apply(list,skip){return list.filter(x=>(skip==='b'||!S.brands.size||S.brands.has(x.b))&&(skip==='l'||!S.levels.size||S.levels.has(x.l))&&(skip==='s'||!S.shapes.size||S.shapes.has(x.sh))&&(skip==='t'||!S.types.size||S.types.has(x.t))&&(skip==='g'||!S.genders.size||S.genders.has(x.g))&&(!S.cats.size||S.cats.has(x.c))&&x.p<=S.max&&rating(x)>=S.rating&&(!S.sale||x.w));}
function sorted(list){const l=[...list];const f={pop:(a,b)=>rating(b)*revs(b)-rating(a)*revs(a),new:(a,b)=>(b.nw-a.nw)||(b.i-a.i),low:(a,b)=>a.p-b.p,high:(a,b)=>b.p-a.p,save:(a,b)=>((b.w||b.p)-b.p)-((a.w||a.p)-a.p),rate:(a,b)=>rating(b)-rating(a)}[S.sort];return l.sort(f);}
const uniq=(k,list)=>[...new Set(list.map(x=>x[k]))].filter(Boolean);

/* facets */
function group(id,title,body,open=true){return `<div class="fg ${open?'':'shut'}" data-g="${id}"><button type="button">${title}</button><div class="fo">${body}</div></div>`;}
function checks(key,setKey,vals,label){const pool=apply(base,key);return vals.map(v=>{const n=pool.filter(x=>x[FK[setKey]]===v).length;const on=S[setKey].has(v);return `<label class="${!n&&!on?'dis':''}"><input type="checkbox" data-f="${setKey}" value="${v}" ${on?'checked':''} ${!n&&!on?'disabled':''}>${label?label(v):v}<span>${n}</span></label>`;}).join('');}
const G={
 brand:()=>group('brand','Brand',checks('b','brands',uniq('b',base).sort())),
 level:()=>group('level','Level',checks('l','levels',[1,2,3].filter(l=>base.some(x=>x.l===l)),v=>LVL[v])),
 shape:()=>group('shape',C.shapeLabel||'Shape',checks('s','shapes',uniq('sh',base).sort())),
 type:()=>group('type','Type',checks('t','types',uniq('t',base).sort())),
 gender:()=>group('gender','Fit',checks('g','genders',uniq('g',base))),
 price:()=>group('price','Price',`<div class="rng"><input type="range" min="${Math.min(...base.map(x=>x.p))}" max="${MAXP}" step="5" value="${S.max}" data-f="max" aria-label="Maximum price"><div class="rv"><span>Up to</span><b>${gbp(S.max)}</b></div></div>`),
 rating:()=>group('rating','Customer rating',[4.5,4.7,4.9].map(r=>`<label><input type="checkbox" data-f="rating" value="${r}" ${S.rating===r?'checked':''}>${stars('s')} ${r} and up</label>`).join(''),false),
 sale:()=>group('sale','Offers',`<label class="swt">On sale only<input type="checkbox" data-f="sale" ${S.sale?'checked':''}></label>`)};
const facetsHTML=()=>(C.facets||['brand','level','shape','price','rating','sale']).map(k=>G[k]()).join('');

/* ads */
const AD={
 klarna:w=>w?`<div class="ad kl2 w2"><div class="kv"><video autoplay muted loop playsinline poster="media/klarna.jpg" src="media/klarna.mp4"></video></div><div class="kt"><img src="media/klarna-badge.png" alt="Klarna"><h3>Serve now. Pay later.</h3><p>Split any racket into 3 interest free payments.</p><div class="kx"><span>£189 racket</span><b>3 × £63.00</b></div><ol><li>Choose Klarna at checkout</li><li>Pay the first instalment today</li><li>The rest every 30 days</li></ol><a class="btn" href="#">How Klarna works</a><small>18+. T&amp;Cs apply. Credit subject to status.</small></div></div>`:`<div class="ad kl"><img src="media/klarna-badge.png" alt="Klarna"><h3>Serve now. Pay later.</h3><div class="kx"><span>£189 racket</span><b>3 × £63.00</b></div><p>Split any order into 3 interest free payments.</p><a class="btn" href="#">How it works</a></div>`,
 guide:w=>`<a class="ad ${w}" href="#"><span class="note">Photo: player choosing between rackets</span><small>Racket guide</small><h3>Not sure which racket?</h3><p>Shape, weight and core explained in plain English.</p><span class="btn wh">Read the guide</span></a>`,
 delivery:w=>`<div class="ad or ${w}"><small>On every order over £${K.STORE.freeOver}</small><h3>Free UK delivery</h3><p>Add a grip or a tube of balls to get there.</p><a class="btn" href="#">Shop accessories</a></div>`,
 brand:w=>`<a class="ad ${w}" href="#"><span class="note">Photo: Bullpadel 2026 campaign</span><small>Brand focus</small><h3>Bullpadel 2026</h3><p>The new Vertex, Hack and Neuron ranges.</p><span class="btn wh">Shop Bullpadel</span></a>`,
 video:w=>`<a class="ad ${w}" href="#"><video autoplay muted loop playsinline poster="media/${C.adVid||'rally'}.jpg" src="media/${C.adVid||'rally'}.mp4"></video><small>On court</small><h3>Built for the way you play</h3><span class="btn wh">Find my level</span></a>`,
 kvt:w=>`<a class="ad klv" href="#"><video autoplay muted loop playsinline poster="media/klarna.jpg" src="media/klarna.mp4"></video><img src="media/klarna-badge.png" alt="Klarna"><h3>Pay in 3 interest free payments.</h3><small>18+. T&amp;Cs apply.</small></a>`,
 kvw:w=>`<a class="ad klv w2" href="#"><video autoplay muted loop playsinline poster="media/klarna.jpg" src="media/klarna.mp4"></video><img src="media/klarna-badge.png" alt="Klarna"><h3>Pay in 3 interest free payments.</h3><small>18+. T&amp;Cs apply.</small></a>`,
 ph:w=>`<div class="ad phd ${w}"><span class="note">Photo or video placeholder</span></div>`,
 kstrip:w=>`<a class="kst" href="#"><img src="media/klarna-badge.png" alt="Klarna"><span><b>Pay in 3 interest free payments</b> with Klarna at checkout.</span><span class="ul">Learn more</span><small>18+. T&amp;Cs apply.</small></a>`,
 news:w=>`<div class="ad nl ${w}"><span class="note">Photo: sale rackets on court bench</span><small>Sale alerts</small><h3>Be first to the next drop</h3><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Done'"><input type="email" placeholder="Email address" required aria-label="Email"><button>Sign up</button></form></div>`};

/* hero */
const LV=[['','All'],[1,'Beginner'],[2,'Intermediate'],[3,'Advanced']];
const isOn=v=>v===''?!S.levels.size:S.levels.size===1&&S.levels.has(v);
const tabsHTML=cls=>`<div class="${cls}">${LV.map(([v,t])=>`<button data-lv="${v}" class="${isOn(v)?'on':''}">${t}</button>`).join('')}</div>`;
const VID=n=>`<video class="hv" autoplay muted loop playsinline poster="media/${n}.jpg" src="media/${n}.mp4"></video>`;
const ARW2='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PH=n=>C.phNote?`<div class="hv phn3"><span class="note">Photo: ${C.phNote}</span></div>`:`<img class="hv" src="media/hero${n}.jpg" alt="">`;
const minP=l=>gbp(Math.min(...base.filter(x=>x.l===l).map(x=>x.p)));
const LD={'':['All rackets','Every level'],1:['Beginner','First year on court'],2:['Intermediate','Playing every week'],3:['Advanced','League and competition']};
const MLV=n=>{const fr=v=>v===''?'Every level':'From '+minP(v);const L=['',1,2,3];
 if(n===1)return `<div class="mlv m1"><div class="hd"><b>Your level</b><button data-lv="" class="${isOn('')?'on':''}">Show all</button></div><div class="trk">${[1,2,3].map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><i></i><b>${LD[v][0]}</b></button>`).join('')}</div></div>`;
 if(n===2)return `<div class="mlv m2">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}">${v===''?'<span class="all">All</span>':`<img src="${IMG}" alt="">`}<b>${LD[v][0]}</b><small>${fr(v)}</small></button>`).join('')}</div>`;
 if(n===3)return `<div class="mlv m3"><span>Show me rackets for</span><label><select data-lvsel aria-label="Level">${L.map(v=>`<option value="${v}">${v===''?'every level':LD[v][0].toLowerCase()+' players'}</option>`).join('')}</select></label></div>`;
 if(n===4)return `<div class="mlv m4">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><i></i><span><b>${LD[v][0]}</b><small>${LD[v][1]}</small></span><em>${fr(v)}</em></button>`).join('')}</div>`;
 const LPH={'':'players of every level on court',1:'first lesson, coach feeding balls',2:'club doubles at dusk',3:'tournament smash at the net'};
 if(n===6)return `<div class="mlv m6">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><span class="note">Photo: ${LPH[v]}</span><span class="cap"><b>${LD[v][0]}</b><small>${fr(v)}</small></span></button>`).join('')}</div>`;
 if(n===7)return '';
 if(n===11){const b=C.lvb||1,lab='<b id="lvlab">All levels</b>';
  if(b===1)return `<button class="mlv m11 b1" data-open-lv><span>Choose your level</span>${lab}<i class="chev"></i></button>`;
  if(b===2)return `<button class="mlv m11 b2" data-open-lv><span class="ic"><i></i><i></i><i></i></span><span class="tx"><small>Your level</small>${lab}</span><span class="ch">Change</span></button>`;
  if(b===3)return `<button class="mlv m11 b3" data-open-lv><span class="tx"><b>What level do you play?</b><small>Showing: <span id="lvlab">All levels</span></small></span><span class="go">Choose</span></button>`;
  if(b===4)return `<button class="mlv m11 b4" data-open-lv><span>Level</span>${lab}<i class="chev"></i></button>`;
  return `<div class="mlv m11 b5"><div class="tx"><small>Rackets for</small>${lab}</div><button class="btn hor" data-open-lv>Choose your level</button></div>`;}

 if(n===8)return `<div class="mlv m8">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}">${v===''?'All':LD[v][0]}</button>`).join('')}</div>`;
 if(n===9)return `<div class="mlv m9">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}">${v===''?'All':LD[v][0]}</button>`).join('')}</div>`;
 if(n===10)return `<div class="mlv m10"><div class="t"><h1>${C.title}</h1><button data-lv="" class="${isOn('')?'on':''}">All levels</button></div><div class="strips">${[1,2,3].map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><span class="note">Photo: ${LPH[v]}</span><span class="cap"><b>${LD[v][0]}</b><small>${fr(v)}</small></span></button>`).join('')}</div><div class="tps">${stars('s')}<span><b>Excellent</b> on Trustpilot</span></div></div>`;
 return `<div class="mlv m5"><div class="hd"><b>Choose your level</b></div><div class="row">${L.map(v=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><span class="lb lb${v||0}"><i></i><i></i><i></i></span><b>${v===''?'All':LD[v][0]}</b></button>`).join('')}</div></div>`;};
const SRF=()=>`<form class="srbig" onsubmit="event.preventDefault()"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input value="${C.q}" aria-label="Search"><button class="btn hor">Search</button></form>`;
const catN=c=>base.filter(x=>x.c===c).length;
function searchHero(n){const brand=`<a class="srbrand" href="#"><span class="note">Photo: ${C.qBrand} campaign</span><div><span class="lg">Logo: ${C.qBrand}</span><p>Visit the ${C.qBrand} store for the full range and new season</p></div><span class="btn wh">Shop ${C.qBrand}</span></a>`;
 const rel=`<div class="srrel"><b>Related</b>${(C.qRel||[]).map(t=>`<a href="#">${t}</a>`).join('')}</div>`;
 if(C.sv===2)return `<section class="srhd s2">${SRF()}<h1>${n} results for <span class="q">${C.q}</span></h1><div class="srtabs"><button class="on">Products <small>${n}</small></button><button>Guides <small>2</small></button><button>Brands <small>1</small></button></div></section>`;
 if(C.sv===3)return `<section class="srhd s3">${SRF()}<h1><span class="q">${C.q}</span> <small>${n} results</small></h1><div class="ctiles c4 srcats">${[['Rackets','racket','rackets on a wall'],['Shoes','shoe','padel shoes on court'],['Bags','bag','racket bag on a bench'],['Accessories','acc','grips and tape']].map(([t,c,p])=>`<a class="ct ca" href="#"><span class="note">Photo: ${p}</span><span class="cap"><b>${t}</b><span>${catN(c)} ${C.qBrand}</span></span><span class="arw">${K.ARW||''}</span></a>`).join('')}</div></section>`;
 return `<section class="srhd s1"><div class="srt"><h1>${n} results for <span class="q">${C.q}</span></h1>${rel}</div></section>`;}
const AFTER=()=>C.after==='guides'?`<section class="srafter"><div class="sh"><div class="shl"><h2>Guides about ${C.qBrand}</h2><p>Help choosing between the range.</p></div><a class="shbtn" href="#">All guides ${K.ARW||''}</a></div><div class="gtiles">${[['Buying guide',`${C.qBrand} rackets explained`,'5 min','racket range laid out'],['Buying guide','Round, teardrop or diamond?','5 min','three racket shapes'],['Footwear','Choosing padel shoes','5 min','shoe sole on court'],['Kit care','Make your racket last','3 min','racket with protector tape']].map(([t,h,m,n])=>`<a class="gt2" href="#"><span class="note">Photo: ${n}</span><span class="gtag">${t}</span><div class="gb"><h3>${h}</h3><span class="gm">${m} read ${K.ARW||''}</span></div></a>`).join('')}</div></section>`:C.story?`<section class="bstory"><div class="ph"><span class="note">Photo: ${C.story[2]}</span></div><div class="tx"><small>About ${C.title}</small><h2>${C.story[0]}</h2><p>${C.story[1]}</p><a class="btn wh" href="#">Our ${C.title} guide</a></div></section>`:'';
function hero(){const n=base.length,h=C.hero;
 if(h==='search')return searchHero(n);
 if(h==='saleword'){const off=Math.max(...base.map(x=>x.w?Math.round((1-x.p/x.w)*100):0));return `<section class="h-sw"><h1 class="sw">SALE</h1><div class="in"><p>${C.desc}</p><b>Up to ${off}% off</b></div></section>`;}
 if(h==='pbox')return `<section class="h-vbox h-ph">${PH(C.ph)}<div class="in"><div><h1>${C.title}</h1><p>${C.desc}</p></div><span class="cnt">${n} rackets</span></div></section>${tabsHTML('segs')}`;
 if(h==='pover')return `<section class="h-vbox h-ph h-po">${C.phNote?`<div class="hv phn3"><span class="note">Photo: ${C.phNote}</span></div>`:C.fin?`<picture><source media="(max-width:760px)" srcset="media/${C.phm||'hero'+C.ph}.jpg"><img class="hv" src="media/hero${C.ph}.jpg" alt=""></picture>`:PH(C.ph)}<div class="in"><div>${C.logo?`<span class="blogo2">Logo: ${C.logo}</span>`:''}<h1>${C.title}</h1><p>${C.desc}</p>${C.fin?`<div class="htp">${stars('s')}<span><b>Excellent</b> on Trustpilot</span></div>`:''}${C.noLv?'':tabsHTML('wtabs')}</div>${C.noCnt?'':`<span class="cnt">${n} rackets</span>`}</div>${C.fin?`<a class="hrv" href="#" aria-label="Rated Excellent on Trustpilot">${stars('s')}</a>`:''}</section>${C.mlv?MLV(C.mlv):''}${C.fin&&!C.mlv&&!C.noLv?`<div class="lvm">${LV.map(([v,t])=>`<button data-lv="${v}" class="${isOn(v)?'on':''}"><b>${t}</b><small>${v===''?'Every level':'From '+minP(v)}</small></button>`).join('')}</div>`:''}${C.fin?`<div class="cnth"><span><b id="cntm">${n}</b> ${UNIT}</span>${C.cat?'':'<a class="ul" href="#">Need help choosing?</a>'}</div>`:''}`;
 if(h==='pstrip')return `<section class="h-strip"><div class="t"><div>${C.logo?`<span class="blogo2 dk">Logo: ${C.logo}</span>`:''}<h1>${C.title}</h1></div><div><p>${C.desc}</p><span class="cnt">${n} rackets from over 40 brands</span></div></div><div class="ps">${PH(C.ph)}</div>${tabsHTML('utabs')}</section>`;
 if(h==='psplit')return `<section class="h-psplit"><div class="t">${C.logo?`<span class="blogo2">Logo: ${C.logo}</span>`:`<span class="cnt">${n} rackets</span>`}<h1>${C.title}</h1><p>${C.desc}</p>${tabsHTML('btabs')}</div><div class="m">${PH(C.ph)}</div></section>`;
 if(h==='plinks')return `<section class="h-vbox h-ph">${PH(C.ph)}<div class="in"><div><h1>${C.title}</h1><p>${C.desc}</p></div></div></section><div class="lvb">${[1,2,3].map(l=>`<button data-lv="${l}" class="${isOn(l)?'on':''}"><span><b>${LVL[l]}</b><small>From ${minP(l)}</small></span><i>${ARW2}</i></button>`).join('')}<button data-lv="" class="${isOn('')?'on':''}"><span><b>All rackets</b><small>${n} rackets</small></span><i>${ARW2}</i></button></div>`;
 if(h==='vbox')return `<section class="h-vbox">${VID(C.heroVid)}<div class="in"><div><h1>${C.title}</h1><p>${C.desc}</p></div><span class="cnt">${n} rackets</span></div></section>${tabsHTML('segs')}`;
 if(h==='split')return `<section class="h-split"><div class="t"><h1>${C.title}</h1><p>${C.desc}</p>${tabsHTML('segs dk')}</div><div class="m">${VID(C.heroVid)}</div></section>`;
 if(h==='cards')return `<section class="h-cards"><div class="t"><h1>${C.title}</h1><p>${C.desc}</p><button class="ul" data-lv="" style="color:#fff">Show all ${n} rackets</button></div>${[1,2,3].map(l=>`<button class="lc2 ${isOn(l)?'on':''}" data-lv="${l}"><img src="${IMG}" alt=""><span><b>${LVL[l]}</b><small>From ${minP(l)}</small></span></button>`).join('')}</section>`;
 if(h==='klarna')return `<section class="h-vbox h-kl">${VID(C.heroVid)}<div class="in"><div><h1>${C.title}</h1><p>${C.desc}</p></div><div class="klchip"><img src="media/klarna-badge.png" alt="Klarna"><span><b>Pay in 3</b> interest free on every racket</span></div></div></section>${tabsHTML('segs')}`;
 if(h==='min')return `<section class="h-min"><div class="t"><span class="mute" style="font-weight:700;font-size:13px">${n} rackets from over 40 brands</span><h1>${C.title}</h1><p>${C.desc}</p>${tabsHTML('utabs')}</div><div class="m">${VID(C.heroVid)}</div></section>`;
 const extra=h==='tabs'?tabsHTML('tabs2'):'';
 const logo=h==='brand'?`<div class="blogo">Logo: ${C.base}</div>`:'';
 return `<section class="phero ${h==='sale'?'sale':h==='light'?'light':''}">${h==='light'||h==='sale'?'':`<span class="note">Photo: ${C.photo}</span>`}<div class="in"><div>${logo}<h1>${C.title}</h1><p>${C.desc}</p>${extra}</div><span class="cnt">${n} products</span></div></section>`;}

function render(){
 const root=$('#plp-root');
 root.classList.toggle('fin',!!C.fin);if(C.mh)root.classList.add('mh'+C.mh);if(C.cls)root.classList.add(...C.cls.split(' '));if(C.mlv)root.classList.add('mlv'+C.mlv);root.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="./home.html">Home</a><span>/</span>${(C.crumbs||[]).map(c=>`<a href="#">${c}</a><span>/</span>`).join('')}<span>${C.title}</span></nav>
 ${hero()}
 ${C.fin?`<div class="ptm"><b>Excellent</b>${stars('s')}<span class="n">${K.STORE.tpScore}</span>${tpLogo}</div>`:''}${C.trust2?`<div class="ptrust t2"><span>${stars('s')}<b>Excellent</b> on Trustpilot</span><span><img class="kb" src="media/klarna-badge.png" alt="Klarna">Pay in 3</span></div>`:`<div class="ptrust"><span>${stars('s')} <b>Excellent</b> 4.8 on Trustpilot</span><span>Free UK delivery over £${K.STORE.freeOver}</span><span><img class="kb" src="media/klarna-badge.png" alt="Klarna"> Pay in 3</span>${C.noBrands?'':'<span>Over 40 brands</span>'}</div>`}
 ${C.tiles?`<div class="ranges tys">${C.tiles.map(([r,n,v])=>`<a href="#" data-ty="${v||r}"><span class="note">Photo: ${n}</span>${r}</a>`).join('')}</div>`:''}${C.ranges?`<div class="ranges">${C.ranges.map(r=>`<a href="#"><span class="note">Photo: ${r} range</span>${r}</a>`).join('')}</div>`:''}
 ${C.helper?`<div class="helper"><b>Find your first racket</b><div class="hq">Budget <button data-hb="80">Under £80</button><button data-hb="120">Under £120</button><button data-hb="">Any</button></div><div class="hq">Shape <button data-hs="Round">Round</button><button data-hs="">Any</button></div></div>`:''}
 ${C.chips?`<div class="qchips">${C.chips.map(([t,k,v])=>`<button data-qk="${k}" data-qv="${v}">${t}</button>`).join('')}</div>`:''}
 <div class="plp ${C.layout==='top'?'top':''}">${C.layout==='top'?'':`<aside class="facets" id="facets"></aside>`}
 <div><div class="fbar" id="fbar"></div><div class="tool"><span class="count" id="cnt"></span><div class="r"><button class="fbtn" data-open-f>${ico.filt}Filter</button>${C.mlv===7?`<button class="lvbtn" data-open-lv>Level <b id="lvlab">All</b></button>`:''}<label class="sel srt"><span class="slx">Sort</span><select id="sort" aria-label="Sort">${[['pop','Most popular'],['new','Newest'],['low','Price, low to high'],['high','Price, high to low'],['save','Biggest saving'],['rate','Top rated']].map(([v,t])=>`<option value="${v}" ${S.sort===v?'selected':''}>${t}</option>`).join('')}</select></label><div class="vt ${C.view2?'v2':''}"><button class="on" data-view="grid" aria-label="Grid view">${ico.grid}</button>${C.view2?'<button data-view="two" aria-label="Two per row">'+ico.two+'</button>':'<button data-view="list" aria-label="List view">${ico.list}</button>'}</div></div></div>
 <div class="achips" id="achips"></div><div class="pgrid ${C.cols===4?'c4':''}" id="pgrid"></div><div class="more" id="more"></div></div></div>
 ${AFTER()}${C.noInfo?'':`<section class="pinfo"><div class="seo"><h2>${C.seoTitle}</h2><div class="clip">${C.seo.map(p=>`<p>${p}</p>`).join('')}</div><button class="ul" data-more style="margin-top:12px">Read more</button>${C.fin?'':`<div class="related">${(C.related||[]).map(r=>`<a href="#">${r}</a>`).join('')}</div>`}</div>
 <div class="faq"><h2>Questions</h2>${C.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>${C.fin?`<div class="related r1">${(C.related||[]).map(r=>`<a href="#">${r}</a>`).join('')}</div>`:''}</section>`}</div>`;
 if(C.mlv===7||C.mlv===11)document.body.insertAdjacentHTML('beforeend',`<div class="lvsheet" id="lvsheet"><div class="hd">Choose your level<button class="x" data-close-lv aria-label="Close"></button></div>${['',1,2,3].map(v=>`<button class="lvr" data-lv="${v}"><span class="ph"></span><span><b>${LD[v][0]}</b><small>${LD[v][1]}</small></span><em>${v===''?'':'From '+minP(v)}</em></button>`).join('')}</div>`);
 document.body.insertAdjacentHTML('beforeend',`<div class="fsheet" id="fsheet"><div class="hd">Filter and sort<button class="x" data-close-f aria-label="Close"></button></div><div class="bd" id="fsb"></div><div class="ft"><button class="btn ol" data-clear>Clear all</button><button class="btn" data-close-f id="fshow">Show results</button></div></div>${C.compare?'<div class="ctray" id="ctray"></div><div class="cmodal" id="cmodal"><div class="box2" id="cbox"></div></div>':''}`);
 update();
}
function facetsAll(){const shut=new Set($$('.fg.shut').map(g=>g.dataset.g)),opened=new Set($$('.fg:not(.shut)').map(g=>g.dataset.g)),openDD=$('.dd.on')?.dataset.dd;const f=$('#facets');if(f)f.innerHTML=facetsHTML();$('#fsb').innerHTML=`<div class="fg"><button type="button" style="pointer-events:none">Sort by</button><div class="fo">${[['pop','Most popular'],['low','Price, low to high'],['high','Price, high to low'],['save','Biggest saving'],['rate','Top rated']].map(([v,t])=>`<label><input type="checkbox" data-f="sort" value="${v}" ${S.sort===v?'checked':''}>${t}</label>`).join('')}</div></div>`+facetsHTML();
 const fb=$('#fbar');if(fb&&C.layout==='top'){fb.innerHTML=(C.fbar||['brand','level','shape','price']).map(k=>{const has=k==='price'?S.max<MAXP:S[{brand:'brands',level:'levels',shape:'shapes',type:'types',gender:'genders'}[k]].size;return `<div class="dd" data-dd="${k}"><button class="${has?'has':''}">${{brand:'Brand',level:'Level',shape:C.shapeLabel||'Shape',price:'Price',type:'Type',gender:'Fit'}[k]}${has&&k!=='price'?` (${has})`:''}</button><div class="pop">${G[k]().replace(/^<div class="fg[^>]*><button type="button">[^<]*<\/button>/,'').replace(/<\/div>$/,'')}</div></div>`;}).join('')+`<label class="swt" style="gap:10px;height:42px;border:1px solid var(--line);padding:0 14px">On sale<input type="checkbox" data-f="sale" ${S.sale?'checked':''}></label>`;}
 $$('.fg[data-g]').forEach(g=>{if(shut.has(g.dataset.g))g.classList.add('shut');else if(opened.has(g.dataset.g))g.classList.remove('shut');});if(openDD){const d=$(`.dd[data-dd="${openDD}"]`);if(d)d.classList.add('on');}}
function update(keepFacets){
 const list=sorted(apply(base));let N=S.shown;if(C.fill){const cl=C.cols||3,cells=m=>m+(C.ads||[]).filter(a=>a.at<m).reduce((t,a)=>t+(a.w2?2:1),0);while(cells(N)%cl&&N<list.length)N++;}const shown=list.slice(0,N);
 {const cm=$('#cntm');if(cm)cm.textContent=list.length;}$('#cnt').innerHTML=`<b>${list.length}</b> of ${base.length} products`;$('#fshow').textContent=`Show ${list.length} results`;
 let html='';const ads=(C.ads||[]).filter(a=>a.at<=shown.length);
 shown.forEach((x,k)=>{ads.filter(a=>a.at===k).forEach(a=>html+=AD[a.t](a.w2?'w2':''));
  html+=`<div class="pc">${C.fin?`<button class="wl" aria-label="Save to wishlist" onclick="this.classList.toggle('on')"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.8c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.4 0 5.2 3.5 3.6 6.6C19 15.6 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>`:''}${C.compare?`<label class="cmpk"><input type="checkbox" data-cmp="${x.i}" ${S.cmp.has(x.i)?'checked':''}>Compare</label>`:''}${card(x)}${C.klCard?`<div class="kc">or 3 payments of <b>£${(x.p/3).toFixed(2)}</b> with <img src="media/klarna-badge.png" alt="Klarna"></div>`:''}</div>`;});
 if(!list.length)html=`<div class="empty2"><p>No ${UNIT} match those filters.</p><button class="btn" data-clear style="margin-top:16px">Clear all filters</button></div>`;
 $('#pgrid').innerHTML=html;
 $('#more').innerHTML=list.length>N?`<div class="mbox"><p>You have seen <b>${N}</b> of <b>${list.length}</b> ${UNIT}</p><div class="bar"><i style="width:${N/list.length*100}%"></i></div><button class="btn" data-loadmore>Show ${Math.min(12,list.length-N)} more ${UNIT}</button></div>`:list.length?`<p>You have seen all ${list.length} ${UNIT}</p>`:'';
 const chips=[...[...S.brands].map(v=>['brands',v,v]),...[...S.levels].map(v=>['levels',v,LVL[v]]),...[...S.shapes].map(v=>['shapes',v,v]),...[...S.types].map(v=>['types',v,v]),...[...S.genders].map(v=>['genders',v,v])];
 if(S.max<MAXP)chips.push(['max','',`Up to ${gbp(S.max)}`]);if(S.rating)chips.push(['rating','',`${S.rating} stars and up`]);if(S.sale)chips.push(['sale','','On sale']);
 $('#achips').innerHTML=chips.map(([k,v,t])=>`<button data-rm="${k}" data-v="${v}">${t}</button>`).join('')+(chips.length?'<button class="clr" data-clear>Clear all</button>':'');
 $$('.qchips button').forEach(b=>{const k=b.dataset.qk,v=b.dataset.qv;b.classList.toggle('on',k==='levels'?S.levels.has(+v):k==='shapes'?S.shapes.has(v):k==='max'?S.max==+v:false);});
 $$('[data-lv]').forEach(b=>b.classList.toggle('on',isOn(b.dataset.lv===''?'':+b.dataset.lv)));$$('[data-ty]').forEach(a=>a.classList.toggle('on',S[C.tileKey||'types'].has(a.dataset.ty)));{const ll=$('#lvlab');if(ll)ll.textContent=S.levels.size===1?LD[[...S.levels][0]][0]:'All levels';}{const ls=$('[data-lvsel]');if(ls)ls.value=S.levels.size===1?String([...S.levels][0]):'';}
 if(!keepFacets)facetsAll();
 if(C.compare)tray();
}
function tray(){const t=$('#ctray');const ids=[...S.cmp];t.classList.toggle('on',ids.length>0);
 t.innerHTML=`<span>${ids.length} of 3 selected</span><div class="th">${ids.map(i=>`<i>${hasImg(P[i])?`<img src="${IMG}" alt="">`:''}</i>`).join('')}</div><button class="btn" data-cmpgo ${ids.length<2?'disabled style="opacity:.5"':''}>Compare</button><button class="x" data-cmpclr aria-label="Clear" style="color:#fff"></button>`;}
function compareModal(){const xs=[...S.cmp].map(i=>P[i]);
 $('#cbox').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:var(--head);font-size:26px;letter-spacing:-.03em">Compare rackets</h3><button class="x" data-cmpx aria-label="Close"></button></div><table><tr><th></th>${xs.map(x=>`<td><div class="cimg"><img src="${IMG}" alt=""></div></td>`).join('')}</tr>${[['Brand',x=>x.b],['Racket',x=>`<b>${x.n}</b>`],['Price',x=>x.w?`<b style="color:var(--accent)">${gbp(x.p)}</b> <s>${gbp(x.w)}</s>`:gbp(x.p)],['Level',x=>LVL[x.l]],['Shape',x=>x.sh],['Rating',x=>`${stars('s')} ${rating(x)} (${revs(x)})`],['',x=>`<button class="btn" data-add="${x.i}">Add to bag</button>`]].map(([h,f])=>`<tr><th>${h}</th>${xs.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</table>`;
 $('#cmodal').classList.add('on');}

document.addEventListener('change',e=>{const t=e.target,f=t.dataset.f;if(t.dataset.lvsel!==undefined){const b=$(`[data-lv="${t.value}"]`);if(b)b.click();return;}if(t.id==='sort'){S.sort=t.value;const sl=$('#sortl');if(sl)sl.textContent={pop:'Popular',new:'Newest',low:'Price low',high:'Price high',save:'Saving',rate:'Top rated'}[t.value];update(true);return;}
 if(t.dataset.cmp){const i=+t.dataset.cmp;if(t.checked){if(S.cmp.size>=3){t.checked=false;return;}S.cmp.add(i);}else S.cmp.delete(i);tray();return;}
 if(!f)return;
 if(f==='sort'){S.sort=t.value;$('#sort').value=t.value;}
 else if(f==='max'){S.max=+t.value;}
 else if(f==='rating'){S.rating=t.checked?+t.value:0;}
 else if(f==='sale'){S.sale=t.checked;}
 else{const v=f==='levels'?+t.value:t.value;t.checked?S[f].add(v):S[f].delete(v);}
 S.shown=12;update();});
document.addEventListener('input',e=>{if(e.target.dataset.f==='max'){S.max=+e.target.value;$$('.rng b').forEach(b=>b.textContent=gbp(S.max));}});
document.addEventListener('click',e=>{const ty=e.target.closest('[data-ty]');if(ty){e.preventDefault();const v=ty.dataset.ty,k=C.tileKey||'types';const on=S[k].size===1&&S[k].has(v);S[k].clear();if(!on)S[k].add(v);S.shown=12;update();return;}const t=e.target.closest('button,[data-rm],[data-lv]');if(!t)return;if(t.dataset.openLv!==undefined){$('#lvsheet').classList.add('on');return;}if(t.dataset.closeLv!==undefined){$('#lvsheet').classList.remove('on');return;}if(t.classList.contains('lvr'))setTimeout(()=>$('#lvsheet').classList.remove('on'),180);
 if(t.closest('.fg')&&t.parentElement.classList.contains('fg')){t.parentElement.classList.toggle('shut');return;}
 if(t.dataset.view){$$('.vt button').forEach(b=>b.classList.toggle('on',b===t));$('#pgrid').classList.toggle('list',t.dataset.view==='list');$('#pgrid').classList.toggle('two',t.dataset.view==='two');return;}
 if(t.dataset.loadmore!==undefined){S.shown+=12;update(true);return;}
 if(t.dataset.rm){const k=t.dataset.rm,v=t.dataset.v;if(k==='max')S.max=MAXP;else if(k==='rating')S.rating=0;else if(k==='sale')S.sale=false;else S[k].delete(k==='levels'?+v:v);update();return;}
 if(t.dataset.clear!==undefined){S.brands.clear();S.levels.clear();S.shapes.clear();S.types.clear();S.genders.clear();S.cats.clear();S.max=MAXP;S.rating=0;S.sale=false;update();return;}
 if(t.dataset.openF!==undefined){$('#fsheet').classList.add('on');$('#scrim').classList.add('on');return;}
 if(t.dataset.closeF!==undefined){$('#fsheet').classList.remove('on');$('#scrim').classList.remove('on');return;}
 if(t.dataset.qk){const k=t.dataset.qk,v=t.dataset.qv;if(k==='levels'){const n=+v;S.levels.has(n)?S.levels.delete(n):S.levels.add(n);}else if(k==='shapes'){S.shapes.has(v)?S.shapes.delete(v):S.shapes.add(v);}else if(k==='max'){S.max=S.max==+v?MAXP:+v;}update();return;}
 if(t.dataset.lv!==undefined){S.levels.clear();if(t.dataset.lv)S.levels.add(+t.dataset.lv);update();return;}
 if(t.dataset.hb!==undefined){S.max=t.dataset.hb?+t.dataset.hb:MAXP;t.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===t));update();return;}
 if(t.dataset.hs!==undefined){S.shapes.clear();if(t.dataset.hs)S.shapes.add(t.dataset.hs);t.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===t));update();return;}
 if(t.dataset.more!==undefined){t.closest('.seo').classList.toggle('open');t.textContent=t.closest('.seo').classList.contains('open')?'Read less':'Read more';return;}
 if(t.dataset.cmpgo!==undefined){compareModal();return;}
 if(t.dataset.cmpclr!==undefined){S.cmp.clear();update(true);return;}
 if(t.dataset.cmpx!==undefined){$('#cmodal').classList.remove('on');return;}
 const dd=t.closest('.dd');if(dd&&t.parentElement===dd){const was=dd.classList.contains('on');$$('.dd').forEach(d=>d.classList.remove('on'));if(!was)dd.classList.add('on');return;}
});
document.addEventListener('click',e=>{if(!e.target.closest('.dd'))$$('.dd').forEach(d=>d.classList.remove('on'));if(e.target.id==='scrim')$('#fsheet')&&$('#fsheet').classList.remove('on');if(e.target.id==='cmodal')e.target.classList.remove('on');},true);
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
