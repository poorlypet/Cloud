/* PADEL retail v3: data, header, mega menu, search, bag and homepage modules */
(()=>{
// Store settings. Placeholder values: confirm before launch.
const STORE={freeOver:75,tpScore:'4.8',tpCount:'2,314',delivery:['Free UK delivery over £75']};

const IMG='media/racket.jpg';
const LVL={1:'Beginner',2:'Intermediate',3:'Advanced'};
// c: racket, pickle, shoe, bag, ball, acc
const P=[
 ['Bullpadel','Vertex 04 Hybrid 2026',289,0,3,'Diamond','racket',1],
 ['Bullpadel','Hack 03 Comfort',219,249,2,'Diamond','racket',0],
 ['Bullpadel','Indiga Woman',129,0,1,'Round','racket',1],
 ['Bullpadel','Flow Light',99,0,1,'Round','racket',0],
 ['Nox','AT10 Genius 18K',269,299,3,'Teardrop','racket',0],
 ['Nox','ML10 Pro Cup',179,0,2,'Round','racket',1],
 ['Nox','X-One Evo',89,0,1,'Round','racket',0],
 ['Nox','VK10 Luxury',229,0,3,'Diamond','racket',0],
 ['Head','Speed Motion 2026',189,0,2,'Teardrop','racket',1],
 ['Head','Delta Pro',239,279,3,'Diamond','racket',0],
 ['Head','Evo Sanyo',69,0,1,'Round','racket',0],
 ['Babolat','Counter Veron',149,169,2,'Round','racket',0],
 ['Babolat','Technical Viper',259,0,3,'Diamond','racket',1],
 ['Adidas Padel','Match Light 3.3',79,0,1,'Round','racket',0],
 ['Adidas Padel','Metalbone 3.4',279,0,3,'Diamond','racket',1],
 ['StarVie','Aquila Soft',99,129,1,'Round','racket',0],
 ['Siux','Electra ST3 Pro',249,0,3,'Diamond','racket',0],
 ['Joola','Perseus 16mm',199,0,3,'','pickle',1],
 ['Head','Radical Tour Pickle',89,0,2,'','pickle',0],
 ['Selkirk','SLK Neo Starter Set',59,0,1,'','pickle',0],
 ['Franklin','Signature 14mm',119,139,2,'','pickle',0],
 ['Bullpadel','Vertex 24 Shoe',119,0,0,'Herringbone','shoe',1],
 ['Asics','Gel Padel Pro 5',99,0,0,'Omni','shoe',0],
 ['Nox','Pro Team Racket Bag',69,0,0,'','bag',1],
 ['Head','Padel Pro Ball 3 Pack',6,0,0,'','ball',0]
].filter(r=>r[6]!=='pickle').map(([b,n,p,w,l,sh,c,nw],i)=>({i,b,n,p,w,l,sh,c,nw}));

const BRANDS=['Adidas Padel','Asics','Babolat','Black Crown','Bullpadel','Drop Shot','Dunlop','Franklin','Head','Kombat','Nox','Royal Padel','Siux','StarVie','Varlion','Vibor-A','Wilson'];
const STAR='<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>';
const stars=c=>`<span class="stars ${c||''}">${('<i>'+STAR+'</i>').repeat(5)}</span>`;
const tpLogo='<span class="tpw"><svg viewBox="0 0 24 24"><path fill="var(--tp)" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>Trustpilot</span>';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const gbp=n=>'£'+n;
const hasImg=x=>x.c==='racket'||x.c==='pickle';
const spec=x=>[x.l?LVL[x.l]:'',x.sh,x.c==='pickle'?'Pickleball':''].filter(Boolean).join(', ');
const ph=n=>`<div class="ph"><span class="note">Photo: ${n}</span></div>`;

function card(x){
  return `<a class="card" href="#"><div class="im">${hasImg(x)?`<img src="${IMG}" alt="${x.b} ${x.n}" loading="lazy">`:'<span class="note">Product image</span>'}${x.w?`<span class="stag">Save £${x.w-x.p}</span>`:''}<button class="add" data-add="${x.i}">Add to bag</button></div>
  <div class="meta">${x.nw?'<div class="new">New</div>':''}<div class="br">${x.b}</div><div>${x.n}</div><div class="pr">${x.w?`<span class="now">${gbp(x.p)}</span><s>${gbp(x.w)}</s>`:gbp(x.p)}</div>${spec(x)?`<div class="sp">${spec(x)}</div>`:''}</div></a>`;}
const F={
 new:()=>P.filter(x=>x.nw),best:()=>P.filter(x=>x.c==='racket').sort((a,b)=>a.p-b.p).filter((x,i)=>i%2===0).concat(P.filter(x=>x.c==='racket'&&x.l===3)),
 rackets:()=>P.filter(x=>x.c==='racket'),beginner:()=>P.filter(x=>x.c==='racket'&&x.l===1),intermediate:()=>P.filter(x=>x.c==='racket'&&x.l===2),advanced:()=>P.filter(x=>x.c==='racket'&&x.l===3),
 pickle:()=>P.filter(x=>x.c==='pickle'),shoes:()=>P.filter(x=>x.c==='shoe'),sale:()=>P.filter(x=>x.w),
 under100:()=>P.filter(x=>x.c==='racket'&&x.p<100)};
const brand=b=>P.filter(x=>x.b===b&&x.c==='racket');

/* ---------- header and mega menu ---------- */
const MEGA={
 rackets:{cols:[['Shop by brand',['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie','Siux','All brands']],['Shop by level',['Beginner rackets','Intermediate rackets','Advanced rackets']],['Shop by shape',['Round','Teardrop','Diamond']],['Shop by price',['Under £100','£100 to £200','Over £200','Sale rackets']]],pics:['New season rackets','Beginner rackets']},
 brands:{az:1}};
function megaHTML(k){const m=MEGA[k];
  if(m.az){const per=Math.ceil(BRANDS.length/5);return `<div class="wrap in">${[0,1,2,3,4].map(c=>`<ul>${BRANDS.slice(c*per,c*per+per).map(b=>`<li><a href="#">${b}</a></li>`).join('')}</ul>`).join('')}</div>`;}
  return `<div class="wrap in">${m.cols.map(([h,l])=>`<div><h5>${h}</h5><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`).join('')}<div class="pics">${m.pics.map(c=>`<a href="#">${ph(c)}<span class="c">${c}</span></a>`).join('')}</div></div>`;}
const IC={s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>',
 u:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
 b:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
 m:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7h18M3 12h18M3 17h18"/></svg>'};
const CHR='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg>',CHL='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg>';
const ARW='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const PAYM={Visa:'<svg viewBox="0 0 48 16" height="12"><text x="24" y="13" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="15" fill="#1A1F71">VISA</text></svg>',
Mastercard:'<svg viewBox="0 0 34 22" height="20"><circle cx="12" cy="11" r="9" fill="#EB001B"/><circle cx="22" cy="11" r="9" fill="#F79E1B"/><path d="M17 3.6a9 9 0 0 1 0 14.8a9 9 0 0 1 0-14.8z" fill="#FF5F00"/></svg>',
Amex:'<svg viewBox="0 0 44 22" height="22"><rect width="44" height="22" fill="#2E77BC"/><text x="22" y="15" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="10" fill="#fff" letter-spacing=".5">AMEX</text></svg>',
PayPal:'<svg viewBox="0 0 56 16" height="13"><text x="0" y="13" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="14"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text></svg>',
'Apple Pay':'<svg viewBox="0 0 44 18" height="15"><path d="M9.6 4.2c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.3 1.1-.5.5-.9 1.4-.8 2.3.9.1 1.7-.4 2.3-1zm.8 1.3c-1.3-.1-2.3.7-2.9.7s-1.5-.7-2.5-.7C3.7 5.5 2.5 6.3 1.9 7.5.5 9.9 1.5 13.4 2.9 15.3c.6.9 1.4 2 2.4 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.7-.9 2.3-1.8.7-1 1-2 1-2.1 0 0-1.9-.7-1.9-2.9 0-1.8 1.5-2.7 1.6-2.8-.9-1.3-2.2-1.4-2.7-1.5z" fill="#111"/><text x="16" y="14.5" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="13" fill="#111">Pay</text></svg>'};
const MEGA2={
 rackets:{t:'Padel rackets',cols:[['Shop by level',['Beginner rackets','Intermediate rackets','Advanced rackets','Not sure? Racket guide']],['Shop by shape',['Round','Teardrop','Diamond','Hybrid']],['Shop by price',['Under £100','£100 to £200','£200 to £300','Over £300','Sale rackets']]],brands:['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie'],feat:['Speed Motion 2026','Vertex 04 Hybrid 2026']},
 shoes:{t:'Padel shoes',cols:[['Shop by sole',['Herringbone','Omni','Clay','All court']],['Shop by fit',['Men\'s shoes','Women\'s shoes','Junior shoes','Wide fit']],['Popular',['New in','Best sellers','Sale shoes']]],brands:['Asics','Bullpadel','Adidas Padel','Head','Babolat','Joma'],feat:['Vertex 24 Shoe','Gel Padel Pro 5']},
 clothing:{t:'Clothing',cols:[['Men',['T-shirts','Polos','Shorts','Hoodies and jackets']],['Women',['Tops','Skirts and dresses','Shorts','Leggings']],['Kit',['Socks','Caps and visors','Wristbands','Headbands']]],brands:['Bullpadel','Adidas Padel','Head','Nox','Siux','Babolat'],promo:'Player in new season kit, walking off court'},
 bags:{t:'Bags',cols:[['Bags',['Racket bags','Backpacks','Holdalls','Shoe bags']],['By size',['Holds 1 to 2 rackets','Holds 3 to 5 rackets','Holds 6 or more']],['Popular',['New in','Best sellers','Sale bags']]],brands:['Nox','Bullpadel','Head','Adidas Padel','Babolat','StarVie'],feat:['Pro Team Racket Bag']},
 accessories:{t:'Accessories',cols:[['Racket care',['Overgrips','Grips','Protector tape','Racket covers']],['On court',['Balls','Water bottles','Towels','Ball holders']],['Popular',['Gift ideas','Sale accessories']]],brands:['Head','Bullpadel','Nox','Adidas Padel','Dunlop','Wilson'],feat:['Padel Pro Ball 3 Pack']},
 brands:{t:'Brands',az:1}};
function megaHTML(k){const m=MEGA2[k];
  if(m.az){const per=Math.ceil(BRANDS.length/4);return `<div class="wrap in az">${[0,1,2,3].map(c=>`<ul>${BRANDS.slice(c*per,c*per+per).map(b=>`<li><a href="#">${b}</a></li>`).join('')}</ul>`).join('')}<a class="mpromo ph" href="#"><span class="note">Photo: brand campaign image</span><span class="mpt"><small>Brand focus</small><b>Bullpadel 2026</b><span class="ul">Shop Bullpadel</span></span></a></div>`;}
  const feat=(m.feat||[]).map(n=>P.find(x=>x.n===n)).filter(Boolean);
  return `<div class="wrap in">${m.cols.map(([h,l])=>`<div><h5>${h}</h5><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`).join('')}
  <div><h5>Top brands</h5><div class="mlogos">${m.brands.map(b=>`<a href="#">${b}</a>`).join('')}</div></div>
  <div>${feat.length?`<h5>Featured</h5><div class="mfeat">${feat.map(x=>`<a href="#" class="mcard"><span class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:''}</span><span><b>${x.b}</b><span>${x.n}</span><span class="pr">${gbp(x.p)}</span></span></a>`).join('')}</div>`:`<a class="mpromo ph" href="#"><span class="note">Photo: ${m.promo}</span><span class="mpt"><small>New season</small><b>${m.t}</b><span class="ul">Shop now</span></span></a>`}</div>
  </div><div class="mfoot"><div class="wrap"><a class="ul" href="#">View all ${m.t.toLowerCase()}</a><span>Free UK delivery over £${STORE.freeOver}</span></div></div>`;}
function header(){
  const h=$('[data-hdr]');if(!h)return;
  const nav=[['rackets','Padel rackets'],['shoes','Shoes'],['clothing','Clothing'],['bags','Bags'],['','Balls'],['accessories','Accessories'],['brands','Brands'],['','Beginners'],['','Sale']];
  h.innerHTML=`<div class="wrap r1"><div class="lg"><button class="burger2" data-open="menu" aria-label="Menu">${IC.m}</button><a class="logo" href="./">PADEL<i>.</i></a></div>
  <label class="sfield">${IC.s}<input id="sf" type="search" placeholder="Search rackets, brands and more" autocomplete="off" aria-label="Search"></label>
  <div class="tools2"><button class="sbtn" data-open="search" aria-label="Search">${IC.s}</button><a href="#" class="tx">Help</a><a href="#" aria-label="Account">${IC.u}<span class="tx">Account</span></a><button data-open="bag" aria-label="Bag">${IC.b}<span class="tx">Bag</span><span class="cnt" id="bagn">0</span></button></div></div>
  <nav class="r2"><div class="wrap">${nav.map(([k,t])=>k?`<button data-mega="${k}">${t}</button>`:`<a href="#" class="${t==='Sale'?'sale':''}">${t}</a>`).join('')}</div></nav><div class="mega" id="mega"></div>`;
  const mega=$('#mega');let cur=null,tm;
  const show=k=>{clearTimeout(tm);if(cur===k)return;cur=k;mega.innerHTML=megaHTML(k);mega.className='mega on';$$('[data-mega]').forEach(b=>b.classList.toggle('on',b.dataset.mega===k));};
  const hide=()=>{tm=setTimeout(()=>{cur=null;mega.className='mega';$$('[data-mega]').forEach(b=>b.classList.remove('on'));},140);};
  $$('[data-mega]').forEach(b=>{b.onmouseenter=()=>show(b.dataset.mega);b.onmouseleave=hide;b.onclick=()=>cur===b.dataset.mega?hide():show(b.dataset.mega);});
  $$('.r2 a').forEach(a=>a.onmouseenter=hide);mega.onmouseenter=()=>clearTimeout(tm);mega.onmouseleave=hide;
  const mm=Object.fromEntries(Object.values(MEGA2).map(m=>[m.t,m.az?BRANDS:m.cols.flatMap(c=>c[1])]));
  document.body.insertAdjacentHTML('beforeend',`<div class="scrim" id="scrim"></div>
  <aside class="search" id="search"><div class="wrap"><div class="row">${IC.s.replace('<svg','<svg width="22" height="22"')}<input id="q" placeholder="Search rackets, brands and more" autocomplete="off"><button class="x" data-close aria-label="Close"></button></div><div class="res" id="sres"></div></div></aside>
  <aside class="drawer" id="bag"><div class="top">Bag<button class="x" data-close aria-label="Close"></button></div><div class="body" id="bagb"></div><div class="foot" id="bagf"></div></aside>
  <aside class="drawer left" id="menu"><div class="top"><span class="logo">PADEL<i>.</i></span><button class="x" data-close aria-label="Close"></button></div><div class="body mn"><div class="mp main">${Object.entries(MEGA2).map(([k,m])=>`<button class="mi" data-sub="${k}">${m.t}${CHR}</button>`).join('')}<a class="mi" href="#">Balls</a><a class="mi" href="#">Beginners</a><a class="mi sale" href="#">Sale</a>
  <div class="mx"><a href="#">${IC.u}Account</a><a href="#">Help</a><a href="#">Track my order</a></div><div class="mtp"><b>Excellent</b>${stars('s')}<span>${STORE.tpScore} on Trustpilot</span></div></div>
  ${Object.entries(MEGA2).map(([k,m])=>`<div class="mp sub" data-p="${k}"><button class="mback">${CHL}Back</button><div class="mhead"><h3>${m.t}</h3><a class="mva" href="#">View all</a></div>${m.az?`<div class="mgrp">${BRANDS.map(b=>`<a href="#">${b}</a>`).join('')}</div>`:m.cols.map(([h,l])=>`<h6>${h}</h6><div class="mgrp">${l.map(x=>`<a href="#">${x}</a>`).join('')}</div>`).join('')+(m.brands?`<h6>Top brands</h6><div class="mchips">${m.brands.map(b=>`<a href="#">${b}</a>`).join('')}</div>`:'')}</div>`).join('')}</div></aside><div class="toast" id="toast"></div>`);
  $$('[data-sub]').forEach(b=>b.onclick=()=>{$('.mp.main').classList.add('off');$(`.mp.sub[data-p="${b.dataset.sub}"]`).classList.add('on');});
  $$('.mback').forEach(b=>b.onclick=()=>{b.closest('.mp').classList.remove('on');$('.mp.main').classList.remove('off');});
  const sf=$('#sf');sf.addEventListener('focus',()=>{sf.blur();open('search');});
}
let openEl=null;
function open(id){close();openEl=$('#'+id);openEl.classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('lock');if(id==='search'){search('');setTimeout(()=>$('#q').focus(),150);}if(id==='bag')bagView();}
function close(){if(openEl)openEl.classList.remove('on');$$('.mp.sub.on').forEach(p=>p.classList.remove('on'));const mm=$('.mp.main');if(mm)mm.classList.remove('off');openEl=null;const s=$('#scrim');if(s)s.classList.remove('on');document.body.classList.remove('lock');}
function search(q){
  q=q.trim().toLowerCase();const r=$('#sres');
  const hit=q?P.filter(x=>`${x.b} ${x.n} ${spec(x)} ${x.c}`.toLowerCase().includes(q)):F.new();
  r.innerHTML=(q?'':`<h6>Popular searches</h6><div class="pop">${['Bullpadel','Nox','Beginner rackets','Diamond','Shoes','Head'].map(s=>`<button data-q="${s}">${s}</button>`).join('')}</div>`)+
   `<h6>${q?`${hit.length} result${hit.length===1?'':'s'}`:'New in'}</h6>`+
   (hit.length?`<div class="sgrid">${hit.slice(0,6).map(x=>`<a href="#"><div class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:''}</div><b>${x.b}</b><span>${x.n}</span><br><span>${gbp(x.p)}</span></a>`).join('')}</div>`:`<p class="mute">No results. Try a brand name such as Nox, or a level such as Beginner.</p>`);
  $$('[data-q]',r).forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.q;search(b.dataset.q.replace(' rackets',''));});
}
let bag=[];try{bag=JSON.parse(localStorage.getItem('padel-bag7')||'[]').filter(x=>P[x.i])}catch(e){}
function save(){try{localStorage.setItem('padel-bag7',JSON.stringify(bag))}catch(e){}const el=$('#bagn');if(el)el.textContent=bag.reduce((a,b)=>a+b.q,0);}
function add(i){const e=bag.find(b=>b.i==i);e?e.q++:bag.push({i:+i,q:1});save();const t=$('#toast');t.textContent=`${P[i].b} ${P[i].n} added to bag`;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200);}
function bagView(){
  const b=$('#bagb'),f=$('#bagf'),tot=bag.reduce((a,x)=>a+P[x.i].p*x.q,0),left=Math.max(0,STORE.freeOver-tot);
  if(!bag.length){b.innerHTML=`<div class="empty"><p>Your bag is empty.</p><button class="btn" data-close style="margin-top:18px">Continue shopping</button></div>`;f.innerHTML='';return;}
  b.innerHTML=bag.map(x=>{const p=P[x.i];return `<div class="line"><div class="th">${hasImg(p)?`<img src="${IMG}" alt="">`:''}</div><div><b>${p.b}</b><div>${p.n}</div>${spec(p)?`<div class="s">${spec(p)}</div>`:''}<span class="qty"><button data-q="-1" data-i="${x.i}" aria-label="Fewer">−</button><span>${x.q}</span><button data-q="1" data-i="${x.i}" aria-label="More">+</button></span><button class="rm" data-rm="${x.i}">Remove</button></div><b>${gbp(p.p*x.q)}</b></div>`}).join('');
  f.innerHTML=`<div class="free">${left?`Spend ${gbp(left)} more for free UK delivery`:'Your order qualifies for free UK delivery'}<i><b style="width:${Math.min(100,tot/STORE.freeOver*100)}%"></b></i></div><div class="tot"><span>Subtotal</span><span>${gbp(tot)}</span></div><button class="btn" style="width:100%">Checkout</button><p class="small">Checkout connects when the store goes live.</p>`;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-add],[data-open],[data-close],#scrim,.qty button,[data-rm],[data-tab],[data-arr]');if(!t)return;
  if(t.dataset.add!==undefined){e.preventDefault();add(t.dataset.add);}
  else if(t.dataset.open)open(t.dataset.open);
  else if(t.dataset.close!==undefined||t.id==='scrim')close();
  else if(t.dataset.rm!==undefined){bag=bag.filter(b=>b.i!=t.dataset.rm);save();bagView();}
  else if(t.dataset.q){const x=bag.find(b=>b.i==t.dataset.i);x.q+=+t.dataset.q;if(x.q<1)bag=bag.filter(b=>b!==x);save();bagView();}
  else if(t.dataset.tab){const w=t.closest('.sh');$$('[data-tab]',w).forEach(x=>x.classList.toggle('on',x===t));const g=w.nextElementSibling;g.innerHTML=F[t.dataset.tab]().slice(0,+g.dataset.n).map(card).join('');}
  else if(t.dataset.arr){const r=t.closest('.sec').querySelector('.rail');r.scrollBy({left:+t.dataset.arr*r.clientWidth*.75,behavior:'smooth'});}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
document.addEventListener('input',e=>{if(e.target.id==='q')search(e.target.value);});

/* ---------- modules ---------- */
const head=(t,r)=>`<div class="sh"><h2>${t}</h2>${r||'<a class="ul" href="#">View all</a>'}</div>`;
const sec=(o,inner)=>`<section class="sec ${o.cls||''}"><div class="wrap">${inner}</div></section>`;
const SHAPE={Round:'M60 8C30 8 12 30 12 62c0 30 20 50 40 58v28h16v-28c20-8 40-28 40-58C108 30 90 8 60 8z',Teardrop:'M60 6C32 6 14 26 14 54c0 34 22 56 38 66v28h16v-28c16-10 38-32 38-66C106 26 88 6 60 6z',Diamond:'M60 4C40 4 18 22 14 52l40 70v26h12v-26l40-70C102 22 80 4 60 4z'};
const M={
 trust:()=>`<div class="trust"><div class="wrap"><span><b>Excellent</b>${stars()}<span>${STORE.tpScore} out of 5</span>${tpLogo}</span>${STORE.delivery.map(d=>`<span>${d}</span>`).join('')}</div></div>`,
 products:o=>{const tabs=o.tabs?o.tabs.split(','):null;const lab={new:'New in',best:'Best sellers',beginner:'Beginner',pickle:'Pickleball',rackets:'Padel rackets',sale:'Sale',advanced:'Advanced',shoes:'Shoes'};
  return sec(o,head(o.title||'',tabs?`<div class="tabs">${tabs.map((t,i)=>`<button data-tab="${t}" class="${i?'':'on'}">${lab[t]}</button>`).join('')}</div>`:undefined)+`<div class="grid" data-n="${o.n||4}">${F[tabs?tabs[0]:o.f||'new']().slice(0,o.n||4).map(card).join('')}</div>`);},
 rail:o=>sec(o,head(o.title,`<div class="arrows"><button data-arr="-1" aria-label="Previous">←</button><button data-arr="1" aria-label="Next">→</button></div>`)+`<div class="rail">${F[o.f||'rackets']().map(card).join('')}</div>`),
 cats:o=>sec(o,head(o.title||'Shop by category')+`<div class="tiles c${o.cols||6}">${[['Padel rackets',214,1],['Shoes',58,0,'padel shoe on white, side on'],['Bags',41,0,'racket bag, front on'],['Clothing',120,0,'folded training tee and shorts'],['Balls',18,0,'padel ball tubes stacked'],['Accessories',96,0,'overgrips and protector tape']].slice(0,+(o.k||6)).map(([t,c,img,n])=>`<a class="tile" href="#"><div class="ph">${img?`<img src="${IMG}" alt="">`:`<span class="note">Photo: ${n}</span>`}</div><div class="cap"><b>${t}</b><span>${c} products</span></div></a>`).join('')}</div>`),
 collections:o=>sec(o,head(o.title||'Collections')+`<div class="tiles c4">${[['Beginner rackets','Lighter, forgiving rackets for your first year on court.','player on their first lesson, coach feeding balls'],['Intermediate rackets','For regular players ready for more power.','club doubles match, mid rally'],['Advanced rackets','Stiffer, faster rackets for competitive players.','smash at the net, tournament court'],['Pickleball starter sets','Two paddles and balls in one box.','pickleball set laid out on court']].map(([t,d,n])=>`<a class="tile" href="#">${ph(n)}<div class="cap"><b>${t}</b></div><p class="d">${d}</p></a>`).join('')}</div>`),
 brandcamp:o=>sec(o,head(o.title||'Featured brands','<a class="ul" href="#">All brands</a>')+`<div class="tiles c4">${['Bullpadel','Nox','Head','Adidas Padel'].map(b=>`<a class="tile" href="#">${ph(b+' campaign image')}<div class="cap"><b>${b}</b><span class="ul" style="color:var(--fg)">Shop now</span></div></a>`).join('')}</div>`),
 spotlight:o=>{const b=o.b||'Bullpadel';return sec(o,head(b+' 2026','<a class="ul" href="#">Shop '+b+'</a>')+`<div class="split"><a href="#" class="ph" style="min-height:100%;aspect-ratio:auto"><span class="note">Photo: ${b} 2026 campaign image</span></a><div class="grid" style="grid-template-columns:1fr 1fr">${brand(b).slice(0,4).map(card).join('')}</div></div>`);},
 shapes:o=>sec(o,head(o.title||'Shop by shape','<span></span>')+`<div class="shapes">${[['Round','The biggest sweet spot. The easiest shape to learn with.'],['Teardrop','A balance of control and power for regular players.'],['Diamond','Weight in the head for maximum power. Less forgiving.']].map(([t,d])=>`<a class="shape" href="#"><svg viewBox="0 0 120 160" fill="none" stroke="#111" stroke-width="2"><path d="${SHAPE[t]}"/></svg><b>${t}</b><p>${d}</p><span class="ul">Shop ${t.toLowerCase()} rackets</span></a>`).join('')}</div>`),
 soles:o=>sec(o,head(o.title||'Padel shoes by sole','<a class="ul" href="#">All shoes</a>')+`<div class="tiles c3">${[['Herringbone','The all rounder. Good grip on most artificial grass courts.'],['Omni','Pimpled sole for sand filled courts. Grips without sticking.'],['Clay','Deep tread for clay and heavily sanded courts.']].map(([t,d])=>`<a class="tile" href="#">${ph(t+' sole, close up from below')}<div class="cap"><b>${t} sole</b></div><p class="d">${d}</p></a>`).join('')}</div>`),
 journal:o=>sec(o,head(o.title||'Guides','<a class="ul" href="#">All guides</a>')+`<div class="tiles c3">${[['How to choose your first padel racket','Weight, shape and core explained simply.'],['Round, teardrop or diamond','Which racket shape suits the way you play.'],['Padel or pickleball','What is different, and what you need to start.']].map(([t,d])=>`<a class="tile" href="#"><div class="ph" style="aspect-ratio:4/3"><span class="note">Photo: guide header image</span></div><div class="cap"><b>${t}</b></div><p class="d">${d}</p></a>`).join('')}</div>`),
 insta:o=>sec(o,head('@padel','<a class="ul" href="#">Follow on Instagram</a>')+`<div class="tiles c6">${Array.from({length:6},()=>`<a class="tile" href="#">${ph('Instagram post')}</a>`).join('')}</div>`),
 clist:o=>sec(o,`<div class="split" style="align-items:start"><div><div class="sh"><h2>${o.title||'Shop'}</h2></div><div class="clist">${[['Padel rackets',214],['Pickleball paddles',64],['Shoes',58],['Bags',41],['Balls',18],['Grips and overgrips',37],['Clothing',120],['Sale',46]].map(([t,c])=>`<a href="#"><div class="ph"></div><b>${t}</b><span class="mute">${c}</span></a>`).join('')}</div></div><a href="#" class="ph" style="aspect-ratio:4/5"><span class="note">Photo: lifestyle, players walking off court with kit bags</span></a></div>`),
 rotw:o=>{const x=P[o.i||7];return sec(o,head(o.title||'Racket of the week','<span></span>')+`<div class="split" style="align-items:center"><div class="ph" style="aspect-ratio:1;background:var(--pbg)"><img src="${IMG}" alt="" style="position:absolute;inset:10%;width:80%;height:80%;object-fit:contain"></div><div style="padding:0 clamp(0px,4vw,60px)"><div class="mute" style="font-weight:700">${x.b}</div><h3 style="font-size:32px;font-weight:700;letter-spacing:-.02em;line-height:1.1;margin:4px 0 10px">${x.n}</h3><div style="font-size:18px">${gbp(x.p)}</div><div class="spec">${[['Level',LVL[x.l]],['Shape',x.sh],['Weight','355 to 370g'],['Core','Medium EVA'],['Face','12K carbon'],['Balance','Medium']].map(([a,b])=>`<div><span>${a}</span>${b}</div>`).join('')}</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-add="${x.i}">Add to bag</button><a class="btn ol" href="#">View details</a></div></div></div>`);},
 logos:o=>sec(o,head(o.title||'Brands we stock','<a class="ul" href="#">All brands</a>')+`<div class="logos">${['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie','Siux','Joola','Selkirk','Wilson','Asics','Drop Shot'].map(b=>`<a href="#" class="ph"><span class="note">Logo: ${b}</span></a>`).join('')}</div>`),
 acc:o=>sec(o,head(o.title||'Essentials','<a class="ul" href="#">All accessories</a>')+`<div class="tiles c4">${[['Balls','tubes of padel balls'],['Overgrips','overgrips in a fan'],['Protector tape','frame protector tape roll'],['Wristbands','wristbands in black and white']].map(([t,n])=>`<a class="tile" href="#">${ph(n)}<div class="cap"><b>${t}</b><span class="ul" style="color:var(--fg)">Shop</span></div></a>`).join('')}</div>`),
 duo:o=>sec(o,`<div class="tiles c2">${[['Padel','Rackets, shoes and bags from 40 brands','padel player, outdoor glass court'],['Pickleball','Paddles, balls and nets','pickleball player, indoor hall']].map(([t,d,n])=>`<a class="tile" href="#">${ph(n)}<div class="cap"><b style="font-size:20px">${t}</b><span class="ul" style="color:var(--fg)">Shop ${t.toLowerCase()}</span></div><p class="d">${d}</p></a>`).join('')}</div>`),
 prices:o=>sec(o,head(o.title||'Rackets by price','<span></span>')+`<div class="prices">${[['Under £100','Light, forgiving rackets. Ideal if you are just starting out.'],['£100 to £200','Our most popular range for regular club players.'],['Over £200','Carbon rackets for experienced and competitive players.']].map(([t,d])=>`<a href="#"><b>${t}</b><div><p style="max-width:34ch;margin-bottom:12px">${d}</p><span class="ul">Shop now</span></div></a>`).join('')}</div>`),
 reviews:o=>sec(o,`<div class="tpbox"><div class="head"><b>Excellent</b>${stars()}<span>Rated ${STORE.tpScore} / 5 based on ${STORE.tpCount} reviews on</span>${tpLogo}</div><div class="tprev">${[['Great advice on my first racket','Told them I had been playing for six months. They sent a round racket and it has made a real difference.','Hannah R.','2 days ago'],['Fast and well packed','Ordered on Monday and played with it on Tuesday night. Racket arrived in a proper box with protection.','Tom W.','4 days ago'],['Best range I have found','Every brand I was looking at in one place, with the specs laid out clearly. Easy to compare.','Priya S.','1 week ago'],['Easy exchange','Shoes were a size small. Swapped them quickly and the new pair arrived two days later.','Marcus L.','2 weeks ago']].map(([h,p,n,d])=>`<div>${stars('s')}<h4>${h}</h4><p>${p}</p><small>${n}, ${d}</small></div>`).join('')}</div><p class="ph-n">Sample reviews. Replace with the Trustpilot widget.</p></div>`),
 nl:()=>`<section class="nl"><div class="wrap"><div><h3>New arrivals in your inbox</h3><p>Be the first to hear about new rackets and restocks.</p></div><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Subscribed'"><input id="nl" type="email" placeholder="Email address" required aria-label="Email address"><button>Sign up</button></form></div></section>`,
 ftr:()=>{const c=(h,l)=>`<div><h4>${h}</h4><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
  return `<footer class="ftr"><div class="wrap"><div class="cols">${c('Shop',['Padel rackets','Shoes','Bags','Clothing','Accessories','Sale'])}${c('Brands',['Bullpadel','Nox','Head','Babolat','All brands'])}${c('Help',['Delivery','Returns','Track my order','Contact us','FAQs'])}${c('About',['About PADEL','Guides','Instagram','TikTok'])}<div><h4>Customer reviews</h4><p class="tp" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>Excellent</b>${stars('s')}</p><p style="margin-top:6px">${STORE.tpScore} out of 5 from ${STORE.tpCount} reviews</p></div></div><div class="base"><span>© 2026 PADEL</span><span>Privacy policy  ·  Terms  ·  Cookies</span></div></div></footer>`;}
};

/* v4 modules */
const VID=n=>`<video class="vid" autoplay muted loop playsinline poster="media/${n}.jpg" src="media/${n}.mp4"></video>`;
const REV=[['Great advice on my first racket','Told them I had been playing for six months and asked what to buy. The racket they suggested has made a real difference to my game.','Hannah R.','2 days ago',12],
 ['Arrived quickly and well packed','Ordered on Monday and was playing with it by Wednesday. Came in a proper box with plenty of protection.','Tom W.','4 days ago',8],
 ['Best range I have found','Every brand I was looking at in one place, with the specs laid out clearly so it was easy to compare.','Priya S.','1 week ago',4],
 ['Easy exchange on shoes','First pair were a size small. The exchange was simple and the new pair came a few days later.','Marcus L.','2 weeks ago',17],
 ['Fair prices','Checked around before buying and the price here was as good as anywhere. Will be back for a bag.','Dan P.','3 weeks ago',2]];
Object.assign(M,{
 products:o=>sec(o,head(o.title||'New in','<a class="ul" href="#">Shop all</a>')+`<div class="grid">${F[o.f||'new']().slice(0,4).map(card).join('')}</div>`),
 cats:o=>sec(o,head(o.title||'Shop by category')+`<div class="tiles c6">${[['Padel rackets',214,1],['Shoes',58,0,'padel shoe on white, side on'],['Bags',41,0,'racket bag, front on'],['Clothing',120,0,'folded training tee and shorts'],['Balls',18,0,'padel ball tubes stacked'],['Accessories',96,0,'overgrips and protector tape']].map(([t,c,img,n])=>`<a class="tile" href="#"><div class="ph">${img?`<img src="${IMG}" alt="">`:`<span class="note">Photo: ${n}</span>`}</div><div class="cap"><b>${t}</b><span>${c}</span></div></a>`).join('')}</div>`),
 banner:o=>`<section class="banner ${o.v?'':'ph'}">${o.v?VID(o.v):`<span class="note" style="position:absolute">Photo: ${o.ph}</span>`}<div class="in"><div class="wrap"><small>${o.k}</small><h2>${o.t}</h2><p>${o.p}</p><a class="btn wh" href="#">${o.c}</a></div></div></section>`,
 levels:o=>`<section class="sec ${o.cls||''}"><div class="wrap">${head(o.title||'Find the right racket','<a class="ul" href="#">All rackets</a>')}</div><div class="edge c3">${[['Beginner rackets','From £69','new player on court, first lesson'],['Intermediate rackets','From £149','club doubles, mid rally'],['Advanced rackets','From £229','smash at the net, tournament court']].map(([t,p,n])=>`<a href="#">${ph(n)}<div class="cap"><b>${t}</b><span>${p}</span></div></a>`).join('')}</div></section>`,
 brands3:o=>`<section class="sec ${o.cls||''}"><div class="wrap">${head(o.title||'Featured brands','<a class="ul" href="#">All brands</a>')}</div><div class="edge c3">${['Bullpadel','Nox','Head'].map(b=>`<a href="#">${ph(b+' 2026 campaign image')}<div class="cap"><b>${b}</b><span class="ul" style="color:var(--fg)">Shop ${b}</span></div></a>`).join('')}</div></section>`,
 rotw:o=>{const x=P.find(p=>p.n==='Speed Motion 2026');return `<section class="rotw"><div class="im"><img src="${IMG}" alt=""></div><div class="tx"><span class="mute" style="font-weight:700">Racket of the week</span><h3>${x.b} ${x.n}</h3><div style="font-size:20px">${gbp(x.p)}</div><div class="spec">${[['Level',LVL[x.l]],['Shape',x.sh],['Weight','355 to 370g'],['Core','Medium EVA'],['Face','12K carbon'],['Balance','Medium']].map(([a,b])=>`<div><span>${a}</span>${b}</div>`).join('')}</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-add="${x.i}">Add to bag</button><a class="btn ol" href="#">View details</a></div></div></section>`;},
 reviews:()=>`<section class="revband"><div class="wrap in"><div class="score"><b class="big">Excellent</b>${stars()}<p>Rated <b>${STORE.tpScore}</b> out of 5 based on <b>${STORE.tpCount}</b> reviews</p>${tpLogo}<p><a class="ul" href="#">Read all reviews</a></p></div>
  <div><div class="revrail" id="rr">${REV.map(([h,p,n,d,i])=>{const x=P[i]||P[0];return `<article class="rc"><div class="top">${stars('s')}<span>${d}</span></div><h4>${h}</h4><p>${p}</p><div class="who"><b>${n}</b> <span>Verified customer</span></div><div class="bought"><i>${hasImg(x)?`<img src="${IMG}" alt="">`:''}</i><span>Bought ${x.b} ${x.n}</span></div></article>`}).join('')}</div>
  <div class="ctl"><span class="phn">Sample reviews. Replace with the Trustpilot widget.</span><div class="arrows"><button onclick="rr.scrollBy({left:-rr.clientWidth/2,behavior:'smooth'})" aria-label="Previous">←</button><button onclick="rr.scrollBy({left:rr.clientWidth/2,behavior:'smooth'})" aria-label="Next">→</button></div></div></div></div></section>`,
 journal:o=>sec(o,head('Guides','<a class="ul" href="#">All guides</a>')+`<div class="tiles c3">${[['How to choose your first padel racket','Weight, shape and core explained simply.'],['Round, teardrop or diamond','Which racket shape suits the way you play.'],['When to upgrade your racket','The signs it is time to move up a level.']].map(([t,d])=>`<a class="tile" href="#"><div class="ph" style="aspect-ratio:4/3"><span class="note">Photo: guide header image</span></div><div class="cap"><b>${t}</b></div><p class="d">${d}</p></a>`).join('')}</div>`)
});

/* v5 modules */
const CATS=[['Padel rackets','player ready at the net, outdoor court'],['Padel balls','ball tubes and loose balls, studio'],['Padel clothing','three players in kit on court bench'],['Padel footwear','shoe sole mid step, court surface'],['Bags','racket bag on court bench'],['Accessories','grips, overgrips and protector tape']];
const ct=([t,n])=>`<a class="ct" href="#"><span class="note">Photo: ${n}</span><b>${t}</b></a>`;
const LVLS={1:['Beginner','New to padel','Forgiving round rackets with soft cores. Light, easy to swing and kind on the arm.','beginner'],2:['Intermediate','Playing every week','Hybrid and teardrop shapes that add power without losing control.','intermediate'],3:['Advanced','Competing and pushing on','Diamond shapes, carbon faces and firm cores for maximum power.','advanced']};
const from=l=>gbp(Math.min(...F[LVLS[l][3]]().map(x=>x.p)));
const arrows='<div class="arrows"><button data-arr="-1" aria-label="Previous">←</button><button data-arr="1" aria-label="Next">→</button></div>';
Object.assign(M,{
 tbar:()=>`<div class="tbar"><span style="display:inline-flex;gap:10px;align-items:center"><b>Excellent</b>${stars()}<span>${STORE.tpScore} out of 5</span>${tpLogo}<span class="tbn">${STORE.tpScore}</span><span class="tbc">${STORE.tpCount} reviews on</span></span><span>Free UK delivery over £${STORE.freeOver}</span></div>`,
 cat4:o=>sec(o,head(o.title||'Shop by category',' ')+`<div class="ctiles c4 ${o.bl?'bl':''}">${CATS.slice(0,4).map(ct).join('')}</div>`),
 cat6:o=>sec(o,head(o.title||'Shop by category',' ')+`<div class="ctiles c3 ${o.bl?'bl':''}">${CATS.map(ct).join('')}</div>`),
 catrail:o=>sec(o,head(o.title||'Shop by category',arrows)+`<div class="rail ctrail">${CATS.map(ct).join('')}</div>`),
 logostrip:()=>{const L=['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie','Siux','Wilson','Dunlop','Drop Shot','Black Crown','Varlion'];return `<section class="logostrip"><div class="rail">${[...L,...L].map(b=>`<a class="lg" href="#">Logo: ${b}</a>`).join('')}</div></section>`;},
 pbento:o=>sec(o,`<div class="pbento"><a class="pb big" href="#"><span class="note">Photo: new season rackets laid out, studio</span><h3>New season rackets</h3><p>The 2026 ranges from Bullpadel, Nox, Head and Babolat.</p><span class="btn wh">Shop now</span></a><a class="pb acc" href="#"><h3>Sale</h3><span class="btn wh">Shop now</span></a><a class="pb" href="#"><span class="note">Photo: grips, tape and balls flat lay</span><h3>Accessories</h3><span class="btn wh">Shop now</span></a></div>`),
 begin:o=>sec(o,head(o.title||'Best for beginners','<a class="ul" href="#">Shop beginner rackets</a>')+(o.intro?`<div class="begin"><div class="intro"><div class="ph bph"><span class="note">Photo: beginner on court, first lesson</span></div><div><h3>New to padel?</h3><p>Start with a round racket. The sweet spot is bigger, the core is softer and it is far easier to control while you learn.</p></div><a class="ul" href="#">Read our first racket guide</a></div><div class="grid">${F.beginner().slice(0,3).map(card).join('')}</div></div>`:`<div class="grid">${F.beginner().slice(0,4).map(card).join('')}</div>`)),
 sale:o=>sec(o,head(o.title||'Sale','<a class="ul" href="#">Shop all sale</a>')+`<div class="grid">${F.sale().slice(0,4).map(card).join('')}</div>`),
 lsplit:o=>`<section class="${o.cls||''}" style="${o.pad?'padding-top:96px':''}"><div class="wrap">${head(o.title||'Shop your level',' ')}</div><div class="lsplit">${[1,2,3].map(l=>`<a class="lp" href="#"><span class="note">Photo: ${['first lesson, coach feeding balls','club doubles at dusk','tournament smash at the net'][l-1]}</span><small>${LVLS[l][0]}</small><h3>${LVLS[l][1]}</h3><p>${LVLS[l][2]}</p><div class="row"><b>From ${from(l)}</b><span class="btn wh">Shop ${LVLS[l][0].toLowerCase()}</span></div></a>`).join('')}</div></section>`,
 lscroll:()=>`<section class="lvs" id="lvs" data-l="1"><div class="stick"><div class="wrap in"><div class="txt"><small id="lvk">Shop your level</small><h2 id="lvh"></h2><p id="lvp"></p><a class="btn" href="#" id="lvb"></a></div><div class="grid" id="lvg"></div></div><div class="wrap steps">${[1,2,3].map(l=>`<button data-step="${l}">${LVLS[l][0]}</button>`).join('')}</div></div></section>`,
 fsplit:o=>`<section class="fsplit"><div class="ph"><span class="note">Photo: ${o.ph}</span></div><div class="tx"><small style="font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.7">${o.k}</small><h2>${o.t}</h2><p>${o.p}</p><a class="btn wh" href="#">${o.c}</a></div></section>`,
 btiles:o=>sec(o,head(o.title||'Our brands','<a class="ul" href="#">All brands</a>')+`<div class="ctiles c4">${['Bullpadel','Nox','Head','Babolat'].map(b=>ct([b,b+' campaign image'])).join('')}</div>`),
 blist:o=>sec(o,`<div class="blist"><div><div class="sh"><h2>${o.title||'Our brands'}</h2></div><ul>${[['Adidas Padel',22],['Babolat',18],['Black Crown',9],['Bullpadel',41],['Drop Shot',12],['Dunlop',8],['Head',34],['Kombat',6],['Nox',37],['Royal Padel',7],['Siux',19],['StarVie',16],['Varlion',11],['Wilson',14]].map(([b,c])=>`<li><a href="#">${b}<span>${c}</span></a></li>`).join('')}</ul></div><a href="#" class="ph" style="aspect-ratio:4/5"><span class="note">Photo: brand wall in store, rackets hung by brand</span></a></div>`)
});

/* v6 modules */
const pt=(c,k,t,l,n)=>`<a class="pt ${c}" href="#"><span class="note">Photo: ${n}</span><small>${k}</small><h3>${t}</h3><span class="ul">${l}</span></a>`;
Object.assign(M,{
 promo3:o=>sec(o,`<div class="promo3">${pt('big','New season','The 2026 rackets have landed','Shop new season','new season rackets laid out on court')}${pt('','Sale','Last season, reduced','Shop sale','racket on court bench, low light')}${pt('','Accessories','Grips, tape and balls','Shop accessories','overgrips and tape flat lay')}</div>`),
 promorow:o=>sec(o,head(o.title||'Featured','<span></span>')+`<div class="promorow">${pt('','Footwear','Padel shoes','Shop shoes','shoe on court, side on')}${pt('','Bags','Racket bags','Shop bags','racket bag on bench')}${pt('','Clothing','Court clothing','Shop clothing','player in kit, walking off court')}</div>`),
 vbox:o=>sec(o,`<div class="vb">${VID(o.v||'city')}<div class="tx"><small>${o.k}</small><h2>${o.t}</h2><p>${o.p}</p><a class="btn wh" href="#">${o.c}</a></div></div>`),
 rated:o=>`<section class="rated"><div class="bgm">${'<i></i>'.repeat(36)}</div><span class="phn">Background: photo collage of customers playing</span><div class="wrap"><div class="c"><div class="sc">${stars()}<span>${STORE.tpScore}</span></div><h2>Rated: Excellent</h2><p>${STORE.tpCount} customers have reviewed us on Trustpilot</p><a class="btn" href="#">Read all reviews</a></div>${o.cards?`<div class="cards">${REV.slice(0,3).map(([h,p,n,d])=>`<article>${stars('s')}<h4>${h}</h4><p>${p}</p><small>${n}, ${d}</small></article>`).join('')}</div>`:''}</div></section>`,
 bsplit:o=>sec(o,head(o.title||'Best for beginners','<a class="ul" href="#">Shop beginner rackets</a>')+`<div class="bsplit">${pt('big','New to padel?','Start with a round racket','Read our first racket guide','beginner on court, first lesson')}<div class="grid">${F.beginner().slice(0,4).map(card).join('')}</div></div>`),
 salerail:o=>sec(o,head(o.title||'Sale',arrows)+`<div class="rail">${F.sale().map(card).join('')}</div>`)
});

function card(x){const r=(4.5+((x.i*7)%5)/10).toFixed(1),c=12+(x.i*37)%180;
  return `<a class="card" href="#"><div class="im">${hasImg(x)?`<img src="${IMG}" alt="${x.b} ${x.n}" loading="lazy">`:'<span class="note">Product image</span>'}${x.w?`<span class="stag">Save £${x.w-x.p}</span>`:''}<button class="add" data-add="${x.i}">Add to bag</button></div>
  <div class="meta"><div class="br">${x.b}</div><div>${x.n}</div><div class="rt">${stars('s')}<span>${r} (${c})</span></div><div class="pr">${x.w?`<span class="now">${gbp(x.p)}</span><s>${gbp(x.w)}</s>`:gbp(x.p)}</div>${spec(x)?`<div class="sp">${spec(x)}</div>`:''}</div></a>`;}
/* classic modules */
LVLS[1][1]='New';LVLS[1][2]='Light, forgiving round rackets that are easy to swing.';
LVLS[2][1]='Improving';LVLS[2][2]='Hybrid shapes that add power without losing control.';
LVLS[3][1]='Competing';LVLS[3][2]='Diamond shapes and firm cores for maximum power.';
const ctA=([t,n])=>`<a class="ct ca" href="#"><span class="note">Photo: ${n}</span><b>${t}</b><span class="arw">${ARW}</span></a>`;
Object.assign(M,{
 cat4:o=>sec(o,head(o.title||'Shop by category',' ')+`<div class="ctiles c4">${CATS.slice(0,4).map(ctA).join('')}</div>`),
 begin:o=>sec(o,head(o.title||'Best for beginners','<a class="ul" href="#">Shop beginner rackets</a>')+`<div class="begin"><div class="intro"><div class="ph bph"><span class="note">Photo: beginner on court, first lesson</span></div><div><h3>New to padel?</h3><p>Start with a round racket. The sweet spot is bigger, the core is softer and it is far easier to control while you learn.</p></div>
  <div class="ia"><a class="btn" href="#">Read our first racket guide</a></div></div><div class="grid">${F.beginner().slice(0,3).map(card).join('')}</div></div>`),
 klarna:()=>sec({},`<div class="vb kl"><video class="vid" autoplay muted loop playsinline poster="media/klarna.jpg" src="media/klarna.mp4"></video><div class="tx"><img class="kb" src="media/klarna-badge.png" alt="Klarna"><h2>Serve now. Pay later.</h2><p>Split the cost into 3 interest free payments with Klarna.</p><div class="ia"><a class="btn kbtn" href="#">Shop now</a><a class="ul" href="#" style="color:#fff">How Klarna works</a></div><small>18+. T&amp;Cs apply. Credit subject to status.</small></div></div>`),
 rated:()=>`<section class="tpr"><div class="wrap"><div class="tph"><div><h2>What our customers say</h2><p class="tpsum"><b>Excellent</b>${stars()}<span>${STORE.tpScore} out of 5 based on <a href="#">${STORE.tpCount} reviews</a></span>${tpLogo}</p></div><div class="arrows"><button onclick="tprr.scrollBy({left:-tprr.clientWidth/2,behavior:'smooth'})" aria-label="Previous">←</button><button onclick="tprr.scrollBy({left:tprr.clientWidth/2,behavior:'smooth'})" aria-label="Next">→</button></div></div>
  <div class="tprail" id="tprr">${REV.map(([h,p,n,d,i])=>{const x=P[i]||P[0];return `<article class="tpc"><div class="tpt">${stars('s')}<span class="ver"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="8" fill="#6B6B6B"/><path d="M4.5 8.2l2.2 2.1 4.8-4.8" stroke="#fff" stroke-width="1.8" fill="none"/></svg>Verified</span></div><h4>${h}</h4><p>${p}</p><div class="tpw2"><b>${n}</b><span>${d}</span></div><div class="tpb"><i>${hasImg(x)?`<img src="${IMG}" alt="">`:''}</i><span>Bought <b>${x.b} ${x.n}</b></span></div></article>`}).join('')}</div>
  <div class="tpfoot"><span>Showing our latest 5 star reviews</span><span class="phn">Sample reviews. Replace with the Trustpilot widget.</span></div></div></section>`,
 journal:o=>sec(o,head('The padel guide','<a class="ul" href="#">All guides</a>')+`<div class="gtiles">${[['Buying guide','Choosing your first racket','6 min','player choosing between rackets'],['Technique','The bandeja, step by step','4 min','player hitting a bandeja at the net'],['Beginners','Padel rules made simple','3 min','court from behind the glass'],['Kit care','Make your racket last','3 min','racket with protector tape, close up']].map(([t,h,m,n])=>`<a class="gt2" href="#"><span class="note">Photo: ${n}</span><span class="gtag">${t}</span><div class="gb"><h3>${h}</h3><span class="gm">${m} read ${ARW}</span></div></a>`).join('')}</div>`),
 nl:()=>'',
 ftr:()=>{const c=(h,l)=>`<div><h4>${h}</h4><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
  return `<footer class="ftr3"><div class="fnl"><div class="wrap"><div><h3>Get new drops first</h3><p>New rackets, restocks and sale previews.</p></div><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Subscribed'"><input id="fnl" type="email" placeholder="Email address" required aria-label="Email address"><button>Sign up</button></form></div></div>
  <div class="wrap fmain"><div class="fbrand"><a class="logo" href="./">PADEL<i>.</i></a><p>Europe's best padel brands, in one UK store.</p><div class="ftpm"><b>Excellent</b>${stars('s')}<span>${STORE.tpScore} out of 5</span>${tpLogo}</div><div class="fsoc">${['Instagram','TikTok','YouTube','Facebook'].map(x=>`<a href="#">${x}</a>`).join('')}</div></div>
  ${c('Shop',['Padel rackets','Shoes','Clothing','Bags','Balls','Accessories','Sale'])}${c('Rackets',['Beginner','Intermediate','Advanced','Bullpadel','Nox','Head','All brands'])}${c('Help',['Delivery','Returns','Track my order','Pay with Klarna','Contact us','FAQs'])}${c('About',['About PADEL','The padel guide','Careers','Affiliates'])}</div>
  <div class="wrap fbot"><div class="fpay">${Object.entries(PAYM).map(([k,v])=>`<i title="${k}" aria-label="${k}">${v}</i>`).join('')}<img src="media/klarna-badge.png" alt="Klarna"></div><div class="flegal"><span>© 2026 PADEL</span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div></div></footer>`;}
});

const HEADS={'Shop by category':['','Rackets, shoes, clothing and everything in between.'],'Best for beginners':['','Forgiving rackets picked for your first year on court.'],'Shop your level':['','Every racket we stock is matched to a level of player.'],'Sale':['','Last season’s rackets, shoes and bags, reduced.'],'The padel guide':['','Buying advice and tips from players who know the game.']};
function augHeads(){$$('.sh').forEach(sh=>{const h=sh.querySelector('h2');if(!h||h.dataset.aug)return;const k=h.textContent.trim(),d=HEADS[k];h.dataset.aug=1;
 const box=document.createElement('div');box.className='shl';h.replaceWith(box);box.appendChild(h);
 if(d){if(d[0])h.insertAdjacentHTML('beforeend',`<sup>${d[0]}</sup>`);box.insertAdjacentHTML('beforeend',`<p>${d[1]}</p>`);}
 const l=sh.querySelector(':scope > a.ul');if(l){l.className='shbtn';l.insertAdjacentHTML('beforeend',ARW);}});}
function fx(){augHeads();$$('.fmain>div:not(.fbrand)>h4').forEach(h=>{h.setAttribute('role','button');h.tabIndex=0;h.onclick=()=>h.parentElement.classList.toggle('open');});const b=document.getElementById('bgm');if(b){const s=b.closest('.rated');const t=()=>{const r=s.getBoundingClientRect();b.style.transform=`rotate(-28deg) translate3d(0,${(-(r.top)*0.35).toFixed(1)}px,0)`;};addEventListener('scroll',t,{passive:true});t();}
 $$('.chips button').forEach(x=>x.onclick=()=>$$('.chips button').forEach(y=>y.classList.toggle('on',y===x)));}
document.addEventListener('DOMContentLoaded',()=>setTimeout(fx,0));

function lvsInit(){const s=document.getElementById('lvs');if(!s)return;let cur=0;
 const set=l=>{if(l===cur)return;cur=l;s.dataset.l=l;const L=LVLS[l];lvk.textContent='Shop your level: '+L[0];lvh.textContent=L[1];lvp.textContent=L[2];lvb.textContent='Shop '+L[0].toLowerCase()+' rackets';
  const g=document.getElementById('lvg');g.classList.add('fade');setTimeout(()=>{g.innerHTML=F[L[3]]().slice(0,3).map(card).join('');g.classList.remove('fade');},cur===l&&g.children.length?250:0);
  s.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('on',+b.dataset.step===l));};
 const tick=()=>{const r=s.getBoundingClientRect(),p=Math.min(Math.max(-r.top/(s.offsetHeight-innerHeight),0),.999);set(1+Math.floor(p*3));};
 s.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const top=s.getBoundingClientRect().top+scrollY,span=s.offsetHeight-innerHeight;scrollTo({top:top+span*((+b.dataset.step-1)/3+.05),behavior:'smooth'});});
 addEventListener('scroll',tick,{passive:true});set(1);tick();}
document.addEventListener('DOMContentLoaded',()=>setTimeout(lvsInit,0));
document.addEventListener('DOMContentLoaded',()=>{header();$$('[data-m]').forEach(el=>{el.outerHTML=M[el.dataset.m]({...el.dataset});});save();});
window.PADEL={P,card,add,open,F};
})();
