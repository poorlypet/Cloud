/* Raqello retail system v2: header, mega menu, search, bag, sections */
(()=>{
const LV={1:{k:'Beginner',d:'Round shapes, soft cores and lighter frames. Forgiving on off centre hits and easy on the arm.',r:'£40 to £120',f:40},
          2:{k:'Intermediate',d:'Teardrop and hybrid shapes that add power without losing touch. For players on court every week.',r:'£120 to £220',f:120},
          3:{k:'Advanced',d:'Diamond shapes, carbon faces and firm cores. Maximum power for players who can control it.',r:'£200 and up',f:200}};
const P=[
 {b:'Head',n:'Speed Motion 2026',p:189,l:2,t:'Staff pick',s:'padel',r:4.8,c:212},
 {b:'Bullpadel',n:'Vertex 04 Hybrid',p:289,l:3,t:'New',s:'padel',r:4.9,c:96},
 {b:'Adidas Padel',n:'Match Light 3.3',p:79,l:1,t:'Best seller',s:'padel',r:4.7,c:388},
 {b:'Nox',n:'AT10 Genius 18K',p:269,w:299,l:3,s:'padel',r:4.8,c:141},
 {b:'Babolat',n:'Counter Veron',p:149,l:2,s:'padel',r:4.6,c:77},
 {b:'StarVie',n:'Aquila Soft',p:99,w:129,l:1,s:'padel',r:4.7,c:165},
 {b:'Siux',n:'Electra ST3 Pro',p:249,l:3,t:'Low stock',s:'padel',r:4.9,c:58},
 {b:'Drop Shot',n:'Canyon 2.0',p:69,l:1,s:'padel',r:4.5,c:120},
 {b:'Varlion',n:'LW Carbon Difusor',p:169,l:2,s:'padel',r:4.6,c:44},
 {b:'Wilson',n:'Bela Pro V2',p:229,l:3,s:'padel',r:4.7,c:63},
 {b:'Joola',n:'Perseus 16mm',p:199,l:3,t:'Pickleball',s:'pickle',r:4.8,c:90},
 {b:'Head',n:'Radical Tour Pickle',p:89,l:2,s:'pickle',r:4.6,c:51},
 {b:'Selkirk',n:'SLK Neo Starter Set',p:59,l:1,t:'Pickleball',s:'pickle',r:4.7,c:132},
 {b:'Franklin',n:'Signature 14mm',p:119,w:139,l:2,s:'pickle',r:4.5,c:38}
];
P.forEach((x,i)=>x.i=i);
const BR=['Bullpadel','Nox','Adidas Padel','Head','Babolat','StarVie','Siux','Varlion','Black Crown','Drop Shot','Vibor-A','Wilson','Royal Padel','Kombat','Joola','Selkirk','Franklin','Dunlop'];
const IMG='media/racket.jpg';
const STAR='<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>';
const stars=(n,cls='')=>`<span class="stars ${cls}">${Array.from({length:5},(_,i)=>`<i style="${i>=Math.round(n)?'background:#DCDCE6':''}">${STAR}</i>`).join('')}</span>`;
const ICON={search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h18M3 17h18"/></svg>'};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const gbp=n=>'£'+n.toFixed(n%1?2:0);
const lvTag=l=>`<span class="lv l${l}"><i>${[1,2,3].map(j=>`<b class="${j<=l?'on':''}"></b>`).join('')}</i>${LV[l].k}</span>`;

function card(x){
  return `<a class="card" href="#"><div class="im"><img src="${IMG}" alt="${x.b} ${x.n}" loading="lazy">${x.t?`<span class="tag${/New|Low/.test(x.t)?' hot':''}">${x.t}</span>`:''}${x.w?`<span class="tag hot">Sale</span>`:''}<button class="add" data-add="${x.i}">Add to bag</button></div>
  <div class="meta"><span class="br">${x.b}</span><span class="pr">${gbp(x.p)}${x.w?`<s>${gbp(x.w)}</s>`:''}</span><span class="nm">${x.n}</span>
  <div class="ft">${lvTag(x.l)}<span class="rate">${stars(x.r)}${x.c}</span></div></div></a>`;}
function filt(f){return f==='pickle'?P.filter(x=>x.s==='pickle'):f==='sale'?P.filter(x=>x.w):/^[123]$/.test(f)?P.filter(x=>x.l==f&&x.s==='padel'):P.filter(x=>x.s==='padel');}

/* ---------- mega menu ---------- */
const MEGA={
 padel:{cols:[['Rackets',['All padel rackets','Round shape','Teardrop shape','Diamond shape','New season 2026','Rackets on sale']],['Gear',['Padel shoes','Bags and backpacks','Balls','Grips and overgrips','Frame protectors','Apparel']],['Shop by level','LV']],ft:['Racket of the month','Head Speed Motion 2026','Shop now']},
 pickle:{cols:[['Paddles',['All paddles','Beginner paddles','Intermediate paddles','Advanced paddles','Paddle sets']],['Gear',['Balls','Nets','Bags','Court shoes','Grips']],['Brands',['Joola','Selkirk','Head','Franklin','Babolat']]],ft:['New to pickleball','Starter sets from £35','Shop sets']},
 level:{cols:[['Beginner',['Rackets under £120','Starter bundles','Comfort grips','Beginner guide']],['Intermediate',['Rackets £120 to £220','Hybrid shapes','Court shoes','Upgrade guide']],['Advanced',['Rackets £200 and up','Pro player rackets','Carbon explained','Tournament bags']]],ft:['Not sure of your level','Take the two minute racket finder','Start finder']},
 brands:{cols:[['Spain',['Bullpadel','Nox','StarVie','Siux','Varlion','Black Crown','Drop Shot','Vibor-A']],['Rest of Europe',['Adidas Padel','Head','Babolat','Dunlop','Royal Padel','Kombat']],['Pickleball',['Joola','Selkirk','Franklin','Wilson']]],ft:['Brand focus','Bullpadel 2026 collection','Shop Bullpadel']}};
function megaHTML(k){const m=MEGA[k];
  return `<div class="wrap in">${m.cols.map(([h,l])=>`<div><h5>${h}</h5>${l==='LV'?`<div class="lvchips">${[1,2,3].map(j=>`<a href="#">${lvTag(j)}<span class="mute" style="font-size:13px">${LV[j].r}</span></a>`).join('')}</div>`:`<ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul>`}</div>`).join('')}
  <a class="ft" href="#"><img src="${IMG}" alt=""><span class="lbl acc">${m.ft[0]}</span><b>${m.ft[1]}</b><span class="link" style="align-self:flex-start">${m.ft[2]}</span></a></div>`;}

/* ---------- header, drawers ---------- */
function header(){
  const a=$('[data-ann]');if(a)a.innerHTML=`<div class="wrap"><span class="side">Free UK delivery over £75</span><span class="mid">${a.dataset.ann||'Demo any racket for 7 days before you buy'}</span><span class="side">Rated Excellent on Trustpilot</span></div>`;
  const h=$('[data-hdr]');if(!h)return;
  h.innerHTML=`<div class="wrap bar"><div style="display:flex;align-items:center;gap:14px"><button class="burger tools" aria-label="Open menu" data-open="menu" style="height:40px;align-items:center">${ICON.menu}</button><a class="logo" href="./">RAQELLO<i>.</i></a></div>
  <nav class="nav"><button data-mega="padel">Padel</button><button data-mega="pickle">Pickleball</button><button data-mega="level">Shop by level</button><button data-mega="brands">Brands</button><a href="#">New in</a><a class="sale" href="#">Sale</a></nav>
  <div class="tools"><button data-open="search" aria-label="Search">${ICON.search}<span class="tx">Search</span></button><a href="#" class="tx" aria-label="Account">${ICON.user}</a><button class="bag" data-open="bag">Bag <b id="bagn">0</b></button></div></div>
  <div class="mega" id="mega"></div>`;
  const mega=$('#mega');let cur=null,tm;
  const show=k=>{clearTimeout(tm);if(cur===k)return;cur=k;mega.innerHTML=megaHTML(k);mega.classList.add('on');$$('.nav [data-mega]').forEach(b=>b.classList.toggle('on',b.dataset.mega===k));};
  const hide=()=>{tm=setTimeout(()=>{cur=null;mega.classList.remove('on');$$('.nav [data-mega]').forEach(b=>b.classList.remove('on'));},120);};
  $$('.nav [data-mega]').forEach(b=>{b.addEventListener('mouseenter',()=>show(b.dataset.mega));b.addEventListener('click',()=>cur===b.dataset.mega?hide():show(b.dataset.mega));b.addEventListener('mouseleave',hide);});
  $$('.nav a').forEach(a=>a.addEventListener('mouseenter',hide));
  mega.addEventListener('mouseenter',()=>clearTimeout(tm));mega.addEventListener('mouseleave',hide);

  document.body.insertAdjacentHTML('beforeend',`<div class="scrim" id="scrim"></div>
  <aside class="search" id="search" aria-label="Search"><div class="wrap"><div class="row">${ICON.search.replace('<svg','<svg width="24" height="24"')}<input id="q" placeholder="Search rackets, brands or levels" autocomplete="off"><button class="x" data-close aria-label="Close search"></button></div><div class="res" id="sres"></div></div></aside>
  <aside class="drawer" id="bag" aria-label="Bag"><div class="top"><h4>Your bag</h4><button class="x" data-close aria-label="Close bag"></button></div><div class="body" id="bagb"></div><div class="foot" id="bagf"></div></aside>
  <aside class="drawer left" id="menu" aria-label="Menu"><div class="top"><a class="logo" href="./">RAQELLO<i>.</i></a><button class="x" data-close aria-label="Close menu"></button></div><div class="body mnav">${Object.entries({padel:'Padel',pickle:'Pickleball',level:'Shop by level',brands:'Brands'}).map(([k,t])=>`<button data-acc>${t}<span>+</span></button><div class="subl">${MEGA[k].cols.map(([h,l])=>(l==='LV'?[1,2,3].map(j=>LV[j].k):l).map(x=>`<a href="#">${x}</a>`).join('')).join('')}</div>`).join('')}<a href="#">New in</a><a href="#" class="acc">Sale</a><a href="#">Account</a></div></aside>
  <div class="toast" id="toast"></div>`);
  $$('[data-acc]').forEach(b=>b.onclick=()=>{const s=b.nextElementSibling;s.classList.toggle('on');b.lastChild.textContent=s.classList.contains('on')?'−':'+';});
}
let openEl=null;
function open(id){close();openEl=$('#'+id);openEl.classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('lock');if(id==='search'){renderSearch('');setTimeout(()=>$('#q').focus(),200);}if(id==='bag')renderBag();}
function close(){if(openEl)openEl.classList.remove('on');openEl=null;const s=$('#scrim');if(s)s.classList.remove('on');document.body.classList.remove('lock');}

/* ---------- search ---------- */
function renderSearch(q){
  q=q.trim().toLowerCase();const r=$('#sres');
  const hit=q?P.filter(x=>`${x.b} ${x.n} ${LV[x.l].k} ${x.s==='pickle'?'pickleball paddle':'padel racket'}`.toLowerCase().includes(q)):P.slice(0,6);
  r.innerHTML=(q?'':`<span class="lbl mute">Popular searches</span><div class="pop">${['Beginner','Bullpadel','Nox','Pickleball','Advanced','Head'].map(s=>`<button data-q="${s}">${s}</button>`).join('')}</div>`)+
   `<span class="lbl mute">${q?`${hit.length} result${hit.length===1?'':'s'} for “${q}”`:'Trending now'}</span>`+
   (hit.length?`<div class="sgrid" style="margin-top:18px">${hit.slice(0,12).map(x=>`<a href="#"><div class="th"><img src="${IMG}" alt=""></div><div class="br lbl mute" style="font-size:10px">${x.b}</div><div class="nm">${x.n}</div><div class="pr">${gbp(x.p)}  ·  ${LV[x.l].k}</div></a>`).join('')}</div>`:`<p style="margin-top:18px">Nothing matches that yet. Try a brand name or a level such as Beginner.</p>`);
  $$('[data-q]',r).forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.q;renderSearch(b.dataset.q);});
}

/* ---------- bag ---------- */
let bag=[];try{bag=JSON.parse(localStorage.getItem('padel-bag')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('padel-bag',JSON.stringify(bag))}catch(e){};const n=bag.reduce((a,b)=>a+b.q,0);const el=$('#bagn');if(el)el.textContent=n;};
function add(i){const e=bag.find(b=>b.i==i);e?e.q++:bag.push({i:+i,q:1});save();const t=$('#toast');t.textContent=`Added ${P[i].n} to your bag`;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200);}
function renderBag(){
  const b=$('#bagb'),f=$('#bagf'),tot=bag.reduce((a,x)=>a+P[x.i].p*x.q,0),left=Math.max(0,75-tot);
  if(!bag.length){b.innerHTML=`<div class="empty"><p>Your bag is empty.</p><button class="btn" data-close>Start shopping</button></div>`;f.innerHTML='';return;}
  b.innerHTML=bag.map(x=>{const p=P[x.i];return `<div class="line"><div class="th"><img src="${IMG}" alt=""></div><div><div class="br">${p.b}</div><div class="nm">${p.n}</div><div style="margin-top:6px">${lvTag(p.l)}</div><div><span class="qty"><button data-q="-1" data-i="${x.i}" aria-label="Fewer">−</button><span>${x.q}</span><button data-q="1" data-i="${x.i}" aria-label="More">+</button></span><button class="rm" data-rm="${x.i}">Remove</button></div></div><div class="pr">${gbp(p.p*x.q)}</div></div>`}).join('');
  f.innerHTML=`<div class="free">${left?`You are ${gbp(left)} away from free delivery`:'You have free UK delivery'}<i><b style="width:${Math.min(100,tot/75*100)}%"></b></i></div><div class="sub"><span>Subtotal</span><span>${gbp(tot)}</span></div><button class="btn acc-bg" style="width:100%">Checkout</button><p class="note-s">Taxes included. Checkout connects when the store goes live.</p>`;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-add],[data-open],[data-close],#scrim,.qty button,[data-rm]');if(!t)return;
  if(t.dataset.add!==undefined){e.preventDefault();add(t.dataset.add);return;}
  if(t.dataset.open){open(t.dataset.open);return;}
  if(t.dataset.close!==undefined||t.id==='scrim'){close();return;}
  if(t.dataset.rm!==undefined){bag=bag.filter(b=>b.i!=t.dataset.rm);save();renderBag();return;}
  if(t.dataset.q){const x=bag.find(b=>b.i==t.dataset.i);x.q+=+t.dataset.q;if(x.q<1)bag=bag.filter(b=>b!==x);save();renderBag();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
document.addEventListener('input',e=>{if(e.target.id==='q')renderSearch(e.target.value);});

/* ---------- sections ---------- */
const SEC={
 usp:()=>`<div class="usp"><div class="wrap">${[['Free delivery','On UK orders over £75'],['Demo before you buy','Try three rackets for 7 days'],['30 day returns','Free and easy'],['Price match','Found it cheaper? Tell us']].map(([a,b])=>`<div><b>${a}</b><span>${b}</span></div>`).join('')}</div></div>`,
 cats:o=>`<section class="sec ${o.tight||''}"><div class="wrap"><div class="sh"><h2 class="d h2">${o.title||'Shop by category'}</h2><a class="link" href="#">View all</a></div><div class="cats" ${o.cols?`style="grid-template-columns:repeat(${o.cols},minmax(0,1fr))"`:''}>${[['Padel rackets',1],['Pickleball',0,'Pickleball paddle and ball'],['Shoes',0,'Padel shoe, side profile'],['Bags',0,'Racket bag, front'],['Balls',0,'Tube of padel balls'],['Apparel',0,'Folded black training tee']].map(([t,img,n])=>`<a class="cat" href="#"><div class="ph">${img?`<img src="${IMG}" alt="">`:`<span class="note">Photo: ${n}</span>`}</div><span class="t">${t}<span>→</span></span></a>`).join('')}</div></div></section>`,
 products:o=>{const id='g'+Math.random().toString(36).slice(2,7);return `<section class="sec ${o.tight||''}"><div class="wrap"><div class="sh"><h2 class="d h2">${o.title||'Best sellers'}</h2>${o.tabs?`<div class="tabs" data-tabs="${id}">${[['all','All padel'],['1','Beginner'],['2','Intermediate'],['3','Advanced'],['pickle','Pickleball']].map(([v,t],i)=>`<button class="${i?'':'on'}" data-f="${v}">${t}</button>`).join('')}</div>`:`<a class="link" href="#">${o.link||'Shop all'}</a>`}</div><div class="grid" id="${id}" data-n="${o.count||4}">${filt(o.filter||'all').slice(0,o.count||4).map(card).join('')}</div></div></section>`;},
 levels:o=>`<section class="sec ${o.tight||''}"><div class="wrap"><div class="sh"><h2 class="d h2">${o.title||'Shop by level'}</h2><p>Every racket we stock is tagged Beginner, Intermediate or Advanced, so you only pay for what your game needs.</p></div><div class="levels">${[1,2,3].map(l=>`<a class="lvc ${o.dark==l?'dark':''}" href="#"><div class="top">${lvTag(l)}<span class="lbl mute">${filt(String(l)).length*14} rackets</span></div><h3 class="d">${LV[l].k}</h3><p>${LV[l].d}</p><div class="px"><span>${LV[l].r}</span><span class="link">Shop ${LV[l].k.toLowerCase()}</span></div></a>`).join('')}</div></div></section>`,
 brands:o=>`<section class="sec ${o.tight||''}"><div class="wrap"><div class="sh"><h2 class="d h2">${o.title||'Shop by brand'}</h2><a class="link" href="#">All brands</a></div><div class="brandg">${BR.slice(0,12).map(b=>`<a href="#">${b}</a>`).join('')}</div></div></section>`,
 reviews:o=>`<section class="sec ${o.tight||''}" ${o.bg?`style="background:${o.bg}"`:''}><div class="wrap tpw"><div class="sum"><b class="big">Excellent</b>${stars(5,'lg')}<p>Rated <b>4.8</b> out of 5 based on <b>2,314 reviews</b></p><span class="tplogo"><svg viewBox="0 0 24 24"><path fill="var(--tp)" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>Trustpilot</span></div>
  <div><div class="revs">${[['Spot on recommendation','I told them I had played for six months and they pointed me to a round racket I would never have picked. My game has come on loads.','Hannah R.','2 days ago'],['Next day and well packed','Ordered a Nox on Monday, playing with it Tuesday night. Price was the best I found anywhere in the UK.','Tom W.','5 days ago'],['Demo scheme is brilliant','Tried three rackets over a week before buying. Sent two back free, no questions. Will not buy rackets anywhere else now.','Priya S.','1 week ago']].map(([h,p,n,d])=>`<div class="rev">${stars(5,'md')}<h4>${h}</h4><p>${p}</p><small><b>${n}</b>  ·  ${d}</small></div>`).join('')}</div><p class="phnote">Placeholder reviews. Live Trustpilot widget goes here.</p></div></div></section>`,
 promo:o=>`<section class="promo ${o.flip?'flip':''}"><div class="m ${o.video?'':'ph'}">${o.video?`<video class="vid" autoplay muted loop playsinline poster="media/${o.video}.jpg" src="media/${o.video}.mp4"></video>`:`<span class="note">Photo: ${o.ph||'lifestyle shot'}</span>`}</div><div class="t">${o.kicker?`<span class="lbl acc">${o.kicker}</span>`:''}<h2 class="d h2">${o.title}</h2><p>${o.text}</p><a class="btn" href="#">${o.cta}</a></div></section>`,
 news:()=>`<section class="news"><div class="wrap in"><div><h2 class="d h2">Join the club</h2><p>New drops from across Europe, early access to sale and level guides written by coaches. One email a week.</p></div><form onsubmit="event.preventDefault();this.querySelector('button').textContent='You are in'"><input id="nl-email" type="email" placeholder="Email address" required><button>Sign up</button></form></div></section>`,
 ftr:()=>{const col=(h,l)=>`<div><h4 class="lbl">${h}</h4><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
  return `<footer class="ftr"><div class="wrap"><div class="cols"><div><span class="logo">Raqello<i class="acc" style="font-style:normal">.</i></span><p style="max-width:300px">Europe's best padel and pickleball brands, sorted by level.</p></div>${col('Shop',['Padel rackets','Pickleball paddles','Shoes','Bags','Balls','Sale'])}${col('By level',['Beginner','Intermediate','Advanced','Racket finder'])}${col('Help',['Delivery','Returns','Racket demos','Contact us'])}${col('Follow',['Instagram','TikTok','YouTube'])}</div><div class="base"><span>© 2026 Raqello</span><span>Privacy  ·  Terms  ·  Cookies</span></div></div></footer>`;}
};
function sections(){
  $$('[data-sec]').forEach(el=>{const o={...el.dataset};el.outerHTML=SEC[o.sec](o);});
  $$('[data-tabs]').forEach(t=>$$('button',t).forEach(b=>b.onclick=()=>{$$('button',t).forEach(x=>x.classList.toggle('on',x===b));const g=$('#'+t.dataset.tabs);g.innerHTML=filt(b.dataset.f).slice(0,+g.dataset.n).map(card).join('');}));
}
document.addEventListener('DOMContentLoaded',()=>{header();sections();save();});
window.PADEL={P,LV,card,lvTag,stars,add,open};
})();
