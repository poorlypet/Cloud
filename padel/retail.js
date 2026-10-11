/* PADEL retail v3: data, header, mega menu, search, bag and homepage modules */
(()=>{
// Store settings. Placeholder values: confirm before launch.
const STORE={freeOver:75,tpScore:'4.8',tpCount:'2,314',delivery:['Free UK delivery over £75','Next working day delivery','Order by 2pm for same day dispatch']};

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
 ['Head','Delta Pro',239,0,3,'Diamond','racket',0],
 ['Head','Evo Sanyo',69,0,1,'Round','racket',0],
 ['Babolat','Counter Veron',149,0,2,'Round','racket',0],
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
].map(([b,n,p,w,l,sh,c,nw],i)=>({i,b,n,p,w,l,sh,c,nw}));

const BRANDS=['Adidas Padel','Asics','Babolat','Black Crown','Bullpadel','Drop Shot','Dunlop','Franklin','Head','Joola','Kombat','Nox','Royal Padel','Selkirk','Siux','StarVie','Varlion','Vibor-A','Wilson'];
const STAR='<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>';
const stars=c=>`<span class="stars ${c||''}">${('<i>'+STAR+'</i>').repeat(5)}</span>`;
const tpLogo='<span class="tpw"><svg viewBox="0 0 24 24"><path fill="var(--tp)" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>Trustpilot</span>';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const gbp=n=>'£'+n;
const hasImg=x=>x.c==='racket'||x.c==='pickle';
const spec=x=>[x.l?LVL[x.l]:'',x.sh,x.c==='pickle'?'Pickleball':''].filter(Boolean).join(', ');
const ph=n=>`<div class="ph"><span class="note">Photo: ${n}</span></div>`;

function card(x){
  return `<a class="card" href="#"><div class="im">${hasImg(x)?`<img src="${IMG}" alt="${x.b} ${x.n}" loading="lazy">`:'<span class="note">Product image</span>'}<button class="add" data-add="${x.i}">Add to bag</button></div>
  <div class="meta">${x.nw?'<div class="new">New</div>':''}<div class="br">${x.b}</div><div>${x.n}</div><div class="pr">${gbp(x.p)}${x.w?`<s>${gbp(x.w)}</s>`:''}</div>${spec(x)?`<div class="sp">${spec(x)}</div>`:''}</div></a>`;}
const F={
 new:()=>P.filter(x=>x.nw),best:()=>P.filter(x=>x.c==='racket').sort((a,b)=>a.p-b.p).filter((x,i)=>i%2===0).concat(P.filter(x=>x.c==='racket'&&x.l===3)),
 rackets:()=>P.filter(x=>x.c==='racket'),beginner:()=>P.filter(x=>x.c==='racket'&&x.l===1),intermediate:()=>P.filter(x=>x.c==='racket'&&x.l===2),advanced:()=>P.filter(x=>x.c==='racket'&&x.l===3),
 pickle:()=>P.filter(x=>x.c==='pickle'),shoes:()=>P.filter(x=>x.c==='shoe'),sale:()=>P.filter(x=>x.w),
 under100:()=>P.filter(x=>x.c==='racket'&&x.p<100)};
const brand=b=>P.filter(x=>x.b===b&&x.c==='racket');

/* ---------- header and mega menu ---------- */
const MEGA={
 rackets:{cols:[['Shop by brand',['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie','Siux','All brands']],['Shop by level',['Beginner rackets','Intermediate rackets','Advanced rackets']],['Shop by shape',['Round','Teardrop','Diamond']],['Shop by price',['Under £100','£100 to £200','Over £200','Sale rackets']]],pics:['New season rackets','Beginner rackets']},
 pickle:{cols:[['Paddles',['All paddles','Beginner paddles','Intermediate paddles','Advanced paddles','Paddle sets']],['Balls and nets',['Indoor balls','Outdoor balls','Portable nets']],['Brands',['Joola','Selkirk','Franklin','Head']],['Accessories',['Bags','Grips','Edge guards']]],pics:['Pickleball paddles','Starter sets']},
 brands:{az:1}};
function megaHTML(k){const m=MEGA[k];
  if(m.az){const per=Math.ceil(BRANDS.length/5);return `<div class="wrap in">${[0,1,2,3,4].map(c=>`<ul>${BRANDS.slice(c*per,c*per+per).map(b=>`<li><a href="#">${b}</a></li>`).join('')}</ul>`).join('')}</div>`;}
  return `<div class="wrap in">${m.cols.map(([h,l])=>`<div><h5>${h}</h5><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`).join('')}<div class="pics">${m.pics.map(c=>`<a href="#">${ph(c)}<span class="c">${c}</span></a>`).join('')}</div></div>`;}
const IC={s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>',
 u:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
 b:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
 m:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7h18M3 12h18M3 17h18"/></svg>'};
function header(){
  const h=$('[data-hdr]');if(!h)return;
  h.innerHTML=`<div class="wrap bar"><div><nav class="nav"><button data-mega="rackets">Padel rackets</button><button data-mega="pickle">Pickleball</button><a href="#">Shoes</a><a href="#">Bags</a><a href="#">Accessories</a><button data-mega="brands">Brands</button><a class="sale" href="#">Sale</a></nav><div class="tools burger" style="justify-content:flex-start"><button data-open="menu" aria-label="Menu">${IC.m}</button></div></div>
  <a class="logo" href="./">PADEL<i>.</i></a>
  <div class="tools"><button data-open="search" aria-label="Search">${IC.s}<span class="tx">Search</span></button><a href="#" aria-label="Account">${IC.u}</a><button data-open="bag" aria-label="Bag">${IC.b}<span class="cnt" id="bagn">0</span></button></div></div><div class="mega" id="mega"></div>`;
  const mega=$('#mega');let cur=null,tm;
  const show=k=>{clearTimeout(tm);if(cur===k)return;cur=k;mega.innerHTML=megaHTML(k);mega.className='mega on'+(MEGA[k].az?' az':'');$$('[data-mega]').forEach(b=>b.classList.toggle('on',b.dataset.mega===k));};
  const hide=()=>{tm=setTimeout(()=>{cur=null;mega.className='mega';$$('[data-mega]').forEach(b=>b.classList.remove('on'));},120);};
  $$('[data-mega]').forEach(b=>{b.onmouseenter=()=>show(b.dataset.mega);b.onmouseleave=hide;b.onclick=()=>cur===b.dataset.mega?hide():show(b.dataset.mega);});
  $$('.nav a').forEach(a=>a.onmouseenter=hide);mega.onmouseenter=()=>clearTimeout(tm);mega.onmouseleave=hide;
  const mm={'Padel rackets':MEGA.rackets.cols.flatMap(c=>c[1]),'Pickleball':MEGA.pickle.cols.flatMap(c=>c[1]),'Brands':BRANDS};
  document.body.insertAdjacentHTML('beforeend',`<div class="scrim" id="scrim"></div>
  <aside class="search" id="search"><div class="wrap"><div class="row">${IC.s.replace('<svg','<svg width="22" height="22"')}<input id="q" placeholder="Search for a brand, racket or level" autocomplete="off"><button class="x" data-close aria-label="Close"></button></div><div class="res" id="sres"></div></div></aside>
  <aside class="drawer" id="bag"><div class="top">Bag<button class="x" data-close aria-label="Close"></button></div><div class="body" id="bagb"></div><div class="foot" id="bagf"></div></aside>
  <aside class="drawer left" id="menu"><div class="top"><span class="logo">PADEL<i>.</i></span><button class="x" data-close aria-label="Close"></button></div><div class="body mnav">${Object.entries(mm).map(([t,l])=>`<button data-acc>${t}<span>+</span></button><div class="sub">${l.map(x=>`<a href="#">${x}</a>`).join('')}</div>`).join('')}<a href="#">Shoes</a><a href="#">Bags</a><a href="#">Accessories</a><a href="#" style="color:var(--accent)">Sale</a><a href="#">Account</a></div></aside><div class="toast" id="toast"></div>`);
  $$('[data-acc]').forEach(b=>b.onclick=()=>{const s=b.nextElementSibling;s.classList.toggle('on');b.lastChild.textContent=s.classList.contains('on')?'−':'+';});
}
let openEl=null;
function open(id){close();openEl=$('#'+id);openEl.classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('lock');if(id==='search'){search('');setTimeout(()=>$('#q').focus(),150);}if(id==='bag')bagView();}
function close(){if(openEl)openEl.classList.remove('on');openEl=null;const s=$('#scrim');if(s)s.classList.remove('on');document.body.classList.remove('lock');}
function search(q){
  q=q.trim().toLowerCase();const r=$('#sres');
  const hit=q?P.filter(x=>`${x.b} ${x.n} ${spec(x)} ${x.c==='pickle'?'pickleball paddle':x.c}`.toLowerCase().includes(q)):F.new();
  r.innerHTML=(q?'':`<h6>Popular searches</h6><div class="pop">${['Bullpadel','Nox','Beginner rackets','Pickleball','Shoes','Head'].map(s=>`<button data-q="${s}">${s}</button>`).join('')}</div>`)+
   `<h6>${q?`${hit.length} result${hit.length===1?'':'s'}`:'New in'}</h6>`+
   (hit.length?`<div class="sgrid">${hit.slice(0,12).map(x=>`<a href="#"><div class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:''}</div><b>${x.b}</b><span>${x.n}</span><br><span>${gbp(x.p)}</span></a>`).join('')}</div>`:`<p class="mute">No results. Try a brand name such as Nox, or a level such as Beginner.</p>`);
  $$('[data-q]',r).forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.q;search(b.dataset.q.replace(' rackets',''));});
}
let bag=[];try{bag=JSON.parse(localStorage.getItem('padel-bag3')||'[]').filter(x=>P[x.i])}catch(e){}
function save(){try{localStorage.setItem('padel-bag3',JSON.stringify(bag))}catch(e){}const el=$('#bagn');if(el)el.textContent=bag.reduce((a,b)=>a+b.q,0);}
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
 cats:o=>sec(o,head(o.title||'Shop by category')+`<div class="tiles c${o.cols||6}">${[['Padel rackets',214,1],['Pickleball',64,1],['Shoes',58,0,'padel shoe on white, side on'],['Bags',41,0,'racket bag, front on'],['Balls',18,0,'padel ball tubes stacked'],['Accessories',96,0,'overgrips and protector tape']].slice(0,+(o.k||6)).map(([t,c,img,n])=>`<a class="tile" href="#"><div class="ph">${img?`<img src="${IMG}" alt="">`:`<span class="note">Photo: ${n}</span>`}</div><div class="cap"><b>${t}</b><span>${c} products</span></div></a>`).join('')}</div>`),
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
  return `<footer class="ftr"><div class="wrap"><div class="cols">${c('Shop',['Padel rackets','Pickleball','Shoes','Bags','Accessories','Sale'])}${c('Brands',['Bullpadel','Nox','Head','Babolat','All brands'])}${c('Help',['Delivery','Returns','Track my order','Contact us','FAQs'])}${c('About',['About PADEL','Guides','Instagram','TikTok'])}<div><h4>Customer reviews</h4><p class="tp" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>Excellent</b>${stars('s')}</p><p style="margin-top:6px">${STORE.tpScore} out of 5 from ${STORE.tpCount} reviews</p></div></div><div class="base"><span>© 2026 PADEL</span><span>Privacy policy  ·  Terms  ·  Cookies</span></div></div></footer>`;}
};
document.addEventListener('DOMContentLoaded',()=>{header();$$('[data-m]').forEach(el=>{el.outerHTML=M[el.dataset.m]({...el.dataset});});save();});
window.PADEL={P,card,add,open,F};
})();
