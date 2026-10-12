/* PADEL collection page. Reads window.PLPCFG, renders into #plp-root. Needs classic.js first. */
(()=>{
const C=window.PLPCFG,K=window.PADEL;const {P,card,stars,IMG,LVL,gbp,hasImg}=K;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rating=x=>+(4.5+((x.i*7)%5)/10).toFixed(1),revs=x=>12+(x.i*37)%180;
const rackets=P.filter(x=>x.c==='racket');
const BASE={rackets:()=>rackets,sale:()=>rackets.filter(x=>x.w),beginner:()=>rackets.filter(x=>x.l===1)}[C.base]||(()=>rackets.filter(x=>x.b===C.base));
const base=BASE();
const S={brands:new Set(),levels:new Set(C.levels||[]),shapes:new Set(),max:Math.max(...base.map(x=>x.p)),rating:0,sale:false,sort:C.sort||'pop',shown:12,cmp:new Set()};
const MAXP=S.max;
const ARW=K.ARW||'→';
const ico={grid:'<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" fill="currentColor"/><rect x="9" y="1" width="6" height="6" fill="currentColor"/><rect x="1" y="9" width="6" height="6" fill="currentColor"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>',
 list:'<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="3" fill="currentColor"/><rect x="1" y="7" width="14" height="3" fill="currentColor"/><rect x="1" y="12" width="14" height="3" fill="currentColor"/></svg>',
 filt:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>'};

function apply(list,skip){return list.filter(x=>(skip==='b'||!S.brands.size||S.brands.has(x.b))&&(skip==='l'||!S.levels.size||S.levels.has(x.l))&&(skip==='s'||!S.shapes.size||S.shapes.has(x.sh))&&x.p<=S.max&&rating(x)>=S.rating&&(!S.sale||x.w));}
function sorted(list){const l=[...list];const f={pop:(a,b)=>rating(b)*revs(b)-rating(a)*revs(a),new:(a,b)=>(b.nw-a.nw)||(b.i-a.i),low:(a,b)=>a.p-b.p,high:(a,b)=>b.p-a.p,save:(a,b)=>((b.w||b.p)-b.p)-((a.w||a.p)-a.p),rate:(a,b)=>rating(b)-rating(a)}[S.sort];return l.sort(f);}
const uniq=(k,list)=>[...new Set(list.map(x=>x[k]))].filter(Boolean);

/* facets */
function group(id,title,body,open=true){return `<div class="fg ${open?'':'shut'}" data-g="${id}"><button type="button">${title}</button><div class="fo">${body}</div></div>`;}
function checks(key,setKey,vals,label){const pool=apply(base,key);return vals.map(v=>{const n=pool.filter(x=>x[setKey==='brands'?'b':setKey==='levels'?'l':'sh']===v).length;const on=S[setKey].has(v);return `<label class="${!n&&!on?'dis':''}"><input type="checkbox" data-f="${setKey}" value="${v}" ${on?'checked':''} ${!n&&!on?'disabled':''}>${label?label(v):v}<span>${n}</span></label>`;}).join('');}
const G={
 brand:()=>group('brand','Brand',checks('b','brands',uniq('b',base).sort())),
 level:()=>group('level','Level',checks('l','levels',[1,2,3].filter(l=>base.some(x=>x.l===l)),v=>LVL[v])),
 shape:()=>group('shape','Shape',checks('s','shapes',uniq('sh',base).sort())),
 price:()=>group('price','Price',`<div class="rng"><input type="range" min="${Math.min(...base.map(x=>x.p))}" max="${MAXP}" step="5" value="${S.max}" data-f="max" aria-label="Maximum price"><div class="rv"><span>Up to</span><b>${gbp(S.max)}</b></div></div>`),
 rating:()=>group('rating','Customer rating',[4.5,4.7,4.9].map(r=>`<label><input type="checkbox" data-f="rating" value="${r}" ${S.rating===r?'checked':''}>${stars('s')} ${r} and up</label>`).join(''),false),
 sale:()=>group('sale','Offers',`<label class="swt">On sale only<input type="checkbox" data-f="sale" ${S.sale?'checked':''}></label>`)};
const facetsHTML=()=>(C.facets||['brand','level','shape','price','rating','sale']).map(k=>G[k]()).join('');

/* ads */
const AD={
 klarna:w=>`<div class="ad kl ${w}"><img src="media/klarna-badge.png" alt="Klarna"><h3>Serve now. Pay later.</h3><p>Pay in 3 interest free instalments with Klarna.</p><a class="btn" href="#">How it works</a></div>`,
 guide:w=>`<a class="ad ${w}" href="#"><span class="note">Photo: player choosing between rackets</span><small>Racket guide</small><h3>Not sure which racket?</h3><p>Shape, weight and core explained in plain English.</p><span class="btn wh">Read the guide</span></a>`,
 delivery:w=>`<div class="ad or ${w}"><small>On every order over £${K.STORE.freeOver}</small><h3>Free UK delivery</h3><p>Add a grip or a tube of balls to get there.</p><a class="btn" href="#">Shop accessories</a></div>`,
 brand:w=>`<a class="ad ${w}" href="#"><span class="note">Photo: Bullpadel 2026 campaign</span><small>Brand focus</small><h3>Bullpadel 2026</h3><p>The new Vertex, Hack and Neuron ranges.</p><span class="btn wh">Shop Bullpadel</span></a>`,
 video:w=>`<a class="ad ${w}" href="#"><video autoplay muted loop playsinline poster="media/rally.jpg" src="media/rally.mp4"></video><small>On court</small><h3>Built for the way you play</h3><span class="btn wh">Find my level</span></a>`,
 news:w=>`<div class="ad nl ${w}"><span class="note">Photo: sale rackets on court bench</span><small>Sale alerts</small><h3>Be first to the next drop</h3><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Done'"><input type="email" placeholder="Email address" required aria-label="Email"><button>Sign up</button></form></div>`};

/* hero */
function hero(){const n=base.length,h=C.hero;
 const extra=h==='tabs'?`<div class="tabs2">${[['','All'],[1,'Beginner'],[2,'Intermediate'],[3,'Advanced']].map(([v,t])=>`<button data-tab="${v}" class="${(v===''&&!S.levels.size)||S.levels.has(v)?'on':''}">${t}</button>`).join('')}</div>`:'';
 const logo=h==='brand'?`<div class="blogo">Logo: ${C.base}</div>`:'';
 return `<section class="phero ${h==='sale'?'sale':h==='light'?'light':''}">${h==='light'||h==='sale'?'':`<span class="note">Photo: ${C.photo}</span>`}<div class="in"><div>${logo}<h1>${C.title}</h1><p>${C.desc}</p>${extra}</div><span class="cnt">${n} products</span></div></section>`;}

function render(){
 const root=$('#plp-root');
 root.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="./home.html">Home</a><span>/</span>${(C.crumbs||[]).map(c=>`<a href="#">${c}</a><span>/</span>`).join('')}<span>${C.title}</span></nav>
 ${hero()}
 <div class="ptrust"><span>${stars('s')} <b>Excellent</b> 4.8 on Trustpilot</span><span>Free UK delivery over £${K.STORE.freeOver}</span><span><img class="kb" src="media/klarna-badge.png" alt="Klarna"> Pay in 3</span><span>Over 40 brands</span></div>
 ${C.ranges?`<div class="ranges">${C.ranges.map(r=>`<a href="#"><span class="note">Photo: ${r} range</span>${r}</a>`).join('')}</div>`:''}
 ${C.helper?`<div class="helper"><b>Find your first racket</b><div class="hq">Budget <button data-hb="80">Under £80</button><button data-hb="120">Under £120</button><button data-hb="">Any</button></div><div class="hq">Shape <button data-hs="Round">Round</button><button data-hs="">Any</button></div></div>`:''}
 ${C.chips?`<div class="qchips">${C.chips.map(([t,k,v])=>`<button data-qk="${k}" data-qv="${v}">${t}</button>`).join('')}</div>`:''}
 <div class="plp ${C.layout==='top'?'top':''}">${C.layout==='top'?'':`<aside class="facets" id="facets"></aside>`}
 <div><div class="fbar" id="fbar"></div><div class="tool"><span class="count" id="cnt"></span><div class="r"><button class="fbtn" data-open-f>${ico.filt}Filter</button><label class="sel"><select id="sort" aria-label="Sort">${[['pop','Most popular'],['new','Newest'],['low','Price, low to high'],['high','Price, high to low'],['save','Biggest saving'],['rate','Top rated']].map(([v,t])=>`<option value="${v}" ${S.sort===v?'selected':''}>${t}</option>`).join('')}</select></label><div class="vt"><button class="on" data-view="grid" aria-label="Grid view">${ico.grid}</button><button data-view="list" aria-label="List view">${ico.list}</button></div></div></div>
 <div class="achips" id="achips"></div><div class="pgrid ${C.cols===4?'c4':''}" id="pgrid"></div><div class="more" id="more"></div></div></div>
 <section class="pinfo"><div class="seo"><h2>${C.seoTitle}</h2><div class="clip">${C.seo.map(p=>`<p>${p}</p>`).join('')}</div><button class="ul" data-more style="margin-top:12px">Read more</button><div class="related">${(C.related||[]).map(r=>`<a href="#">${r}</a>`).join('')}</div></div>
 <div class="faq"><h2>Questions</h2>${C.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section></div>`;
 document.body.insertAdjacentHTML('beforeend',`<div class="fsheet" id="fsheet"><div class="hd">Filter and sort<button class="x" data-close-f aria-label="Close"></button></div><div class="bd" id="fsb"></div><div class="ft"><button class="btn ol" data-clear>Clear all</button><button class="btn" data-close-f id="fshow">Show results</button></div></div>${C.compare?'<div class="ctray" id="ctray"></div><div class="cmodal" id="cmodal"><div class="box2" id="cbox"></div></div>':''}`);
 update();
}
function facetsAll(){const shut=new Set($$('.fg.shut').map(g=>g.dataset.g)),opened=new Set($$('.fg:not(.shut)').map(g=>g.dataset.g)),openDD=$('.dd.on')?.dataset.dd;const f=$('#facets');if(f)f.innerHTML=facetsHTML();$('#fsb').innerHTML=`<div class="fg"><button type="button" style="pointer-events:none">Sort by</button><div class="fo">${[['pop','Most popular'],['low','Price, low to high'],['high','Price, high to low'],['save','Biggest saving'],['rate','Top rated']].map(([v,t])=>`<label><input type="checkbox" data-f="sort" value="${v}" ${S.sort===v?'checked':''}>${t}</label>`).join('')}</div></div>`+facetsHTML();
 const fb=$('#fbar');if(fb&&C.layout==='top'){fb.innerHTML=['brand','level','shape','price'].map(k=>{const has=k==='brand'?S.brands.size:k==='level'?S.levels.size:k==='shape'?S.shapes.size:S.max<MAXP;return `<div class="dd" data-dd="${k}"><button class="${has?'has':''}">${{brand:'Brand',level:'Level',shape:'Shape',price:'Price'}[k]}${has&&k!=='price'?` (${has})`:''}</button><div class="pop">${G[k]().replace(/^<div class="fg[^>]*><button type="button">[^<]*<\/button>/,'').replace(/<\/div>$/,'')}</div></div>`;}).join('')+`<label class="swt" style="gap:10px;height:42px;border:1px solid var(--line);padding:0 14px">On sale<input type="checkbox" data-f="sale" ${S.sale?'checked':''}></label>`;}
 $$('.fg[data-g]').forEach(g=>{if(shut.has(g.dataset.g))g.classList.add('shut');else if(opened.has(g.dataset.g))g.classList.remove('shut');});if(openDD){const d=$(`.dd[data-dd="${openDD}"]`);if(d)d.classList.add('on');}}
function update(keepFacets){
 const list=sorted(apply(base));const shown=list.slice(0,S.shown);
 $('#cnt').innerHTML=`<b>${list.length}</b> of ${base.length} products`;$('#fshow').textContent=`Show ${list.length} results`;
 let html='';const ads=(C.ads||[]).filter(a=>a.at<=shown.length);
 shown.forEach((x,k)=>{ads.filter(a=>a.at===k).forEach(a=>html+=AD[a.t](a.w2?'w2':''));
  html+=`<div class="pc">${C.compare?`<label class="cmpk"><input type="checkbox" data-cmp="${x.i}" ${S.cmp.has(x.i)?'checked':''}>Compare</label>`:''}${card(x)}</div>`;});
 if(!list.length)html=`<div class="empty2"><p>No rackets match those filters.</p><button class="btn" data-clear style="margin-top:16px">Clear all filters</button></div>`;
 $('#pgrid').innerHTML=html;
 $('#more').innerHTML=list.length>S.shown?`<p>Showing ${S.shown} of ${list.length}</p><div class="bar"><i style="width:${S.shown/list.length*100}%"></i></div><button class="btn ol" data-loadmore>Load more</button>`:list.length?`<p>Showing all ${list.length}</p>`:'';
 const chips=[...[...S.brands].map(v=>['brands',v,v]),...[...S.levels].map(v=>['levels',v,LVL[v]]),...[...S.shapes].map(v=>['shapes',v,v])];
 if(S.max<MAXP)chips.push(['max','',`Up to ${gbp(S.max)}`]);if(S.rating)chips.push(['rating','',`${S.rating} stars and up`]);if(S.sale)chips.push(['sale','','On sale']);
 $('#achips').innerHTML=chips.map(([k,v,t])=>`<button data-rm="${k}" data-v="${v}">${t}</button>`).join('')+(chips.length?'<button class="clr" data-clear>Clear all</button>':'');
 $$('.qchips button').forEach(b=>{const k=b.dataset.qk,v=b.dataset.qv;b.classList.toggle('on',k==='levels'?S.levels.has(+v):k==='shapes'?S.shapes.has(v):k==='max'?S.max==+v:false);});
 $$('.phero [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===''?!S.levels.size:S.levels.size===1&&S.levels.has(+b.dataset.tab)));
 if(!keepFacets)facetsAll();
 if(C.compare)tray();
}
function tray(){const t=$('#ctray');const ids=[...S.cmp];t.classList.toggle('on',ids.length>0);
 t.innerHTML=`<span>${ids.length} of 3 selected</span><div class="th">${ids.map(i=>`<i>${hasImg(P[i])?`<img src="${IMG}" alt="">`:''}</i>`).join('')}</div><button class="btn" data-cmpgo ${ids.length<2?'disabled style="opacity:.5"':''}>Compare</button><button class="x" data-cmpclr aria-label="Clear" style="color:#fff"></button>`;}
function compareModal(){const xs=[...S.cmp].map(i=>P[i]);
 $('#cbox').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:var(--head);font-size:26px;letter-spacing:-.03em">Compare rackets</h3><button class="x" data-cmpx aria-label="Close"></button></div><table><tr><th></th>${xs.map(x=>`<td><div class="cimg"><img src="${IMG}" alt=""></div></td>`).join('')}</tr>${[['Brand',x=>x.b],['Racket',x=>`<b>${x.n}</b>`],['Price',x=>x.w?`<b style="color:var(--accent)">${gbp(x.p)}</b> <s>${gbp(x.w)}</s>`:gbp(x.p)],['Level',x=>LVL[x.l]],['Shape',x=>x.sh],['Rating',x=>`${stars('s')} ${rating(x)} (${revs(x)})`],['',x=>`<button class="btn" data-add="${x.i}">Add to bag</button>`]].map(([h,f])=>`<tr><th>${h}</th>${xs.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</table>`;
 $('#cmodal').classList.add('on');}

document.addEventListener('change',e=>{const t=e.target,f=t.dataset.f;if(t.id==='sort'){S.sort=t.value;update(true);return;}
 if(t.dataset.cmp){const i=+t.dataset.cmp;if(t.checked){if(S.cmp.size>=3){t.checked=false;return;}S.cmp.add(i);}else S.cmp.delete(i);tray();return;}
 if(!f)return;
 if(f==='sort'){S.sort=t.value;$('#sort').value=t.value;}
 else if(f==='max'){S.max=+t.value;}
 else if(f==='rating'){S.rating=t.checked?+t.value:0;}
 else if(f==='sale'){S.sale=t.checked;}
 else{const v=f==='levels'?+t.value:t.value;t.checked?S[f].add(v):S[f].delete(v);}
 S.shown=12;update();});
document.addEventListener('input',e=>{if(e.target.dataset.f==='max'){S.max=+e.target.value;$$('.rng b').forEach(b=>b.textContent=gbp(S.max));}});
document.addEventListener('click',e=>{const t=e.target.closest('button,[data-rm]');if(!t)return;
 if(t.closest('.fg')&&t.parentElement.classList.contains('fg')){t.parentElement.classList.toggle('shut');return;}
 if(t.dataset.view){$$('.vt button').forEach(b=>b.classList.toggle('on',b===t));$('#pgrid').classList.toggle('list',t.dataset.view==='list');return;}
 if(t.dataset.loadmore!==undefined){S.shown+=12;update(true);return;}
 if(t.dataset.rm){const k=t.dataset.rm,v=t.dataset.v;if(k==='max')S.max=MAXP;else if(k==='rating')S.rating=0;else if(k==='sale')S.sale=false;else S[k].delete(k==='levels'?+v:v);update();return;}
 if(t.dataset.clear!==undefined){S.brands.clear();S.levels.clear();S.shapes.clear();S.max=MAXP;S.rating=0;S.sale=false;update();return;}
 if(t.dataset.openF!==undefined){$('#fsheet').classList.add('on');$('#scrim').classList.add('on');return;}
 if(t.dataset.closeF!==undefined){$('#fsheet').classList.remove('on');$('#scrim').classList.remove('on');return;}
 if(t.dataset.qk){const k=t.dataset.qk,v=t.dataset.qv;if(k==='levels'){const n=+v;S.levels.has(n)?S.levels.delete(n):S.levels.add(n);}else if(k==='shapes'){S.shapes.has(v)?S.shapes.delete(v):S.shapes.add(v);}else if(k==='max'){S.max=S.max==+v?MAXP:+v;}update();return;}
 if(t.dataset.tab!==undefined){S.levels.clear();if(t.dataset.tab)S.levels.add(+t.dataset.tab);update();return;}
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
