/* Raqello store pages, part two: guide article, contact, legal, 404, no results, account, beginners, sale.
   Registers into window.PGX. Load before pages.js, which passes its helpers in as H. */
(()=>{
const X=window.PGX=window.PGX||{};const I=window.PGXI=window.PGXI||[];
/* placeholder company details for the legal pages, replace once */
const LEGAL={company:'Company name Ltd',number:'00000000',address:'Registered office address',email:'help@yourstore.co.uk',vat:'GB 000 0000 00'};
const fill=s=>s.replace(/\{(\w+)\}/g,(m,k)=>LEGAL[k]||m);
const ORDERS=[['PAD10511','10 October 2026','On its way',[['Pro Team Racket Bag',1],['Padel Pro Ball 3 Pack',2]]],['PAD10482','2 October 2026','Delivered',[['Speed Motion 2026',1],['GB 1200 Overgrip 3 Pack',1]]],['PAD10377','14 August 2026','Delivered',[['Vertex 24 Shoe',1]]]];

/* ---------- guide article ---------- */
const shopFor=(H,k)=>{const [a,b]=k.split(':');const l=a==='level'?H.rk.filter(x=>x.l===+b):a==='shape'?H.rk.filter(x=>x.sh===b):H.P.filter(x=>x.c===b);
 const t=a==='level'?`Shop ${H.LVL[+b].toLowerCase()} rackets`:a==='shape'?`Shop ${b.toLowerCase()} rackets`:{shoe:'Shop padel shoes',acc:'Shop accessories',ball:'Shop balls',bag:'Shop bags'}[b];return [t,l];};
const block=(H,b,v)=>{const [k,x]=b;
 if(k==='p')return `<p>${x}</p>`;
 if(k==='h')return `<h2 id="${H.SLUG(x)}">${x}</h2>`;
 if(k==='ph')return H.PH(x,'aph');
 if(k==='q')return `<blockquote class="apq">${x}</blockquote>`;
 if(k==='tip')return `<aside class="atip"><b>Tip</b><p>${x}</p></aside>`;
 if(k==='shop'){const [t,l]=shopFor(H,x);return `<div class="ashop v${v}"><div class="ah"><b>${t}</b><a class="ul" href="#">See all</a></div><div class="grid">${l.slice(0,v===2?2:v===3?3:4).map(H.card).join('')}</div></div>`;}
 return '';};
X.article=H=>{const GD=window.GD||[];const i=H.G.i||0,g=GD[i];if(!g)return ['<div class="wrap"><p>Guide text not loaded.</p></div>'];const v=H.V;
 const body=g.body.map(b=>block(H,b,v)).join('');
 const sum=`<div class="asum"><b>In short</b><p>${g.sum}</p></div>`;
 const others=GD.filter((x,j)=>j!==i);const rel=others.filter(x=>x.cat===g.cat).concat(others.filter(x=>x.cat!==g.cat)).slice(0,3);
 const G2=x=>H.GC([x.cat,x.t,x.m,x.ph]);
 const next=GD[(i+1)%GD.length];
 const meta=`<span class="amt">${g.cat}<i></i>${g.m} read</span>`;
 const toc=g.body.filter(b=>b[0]==='h').map(b=>`<a href="#${H.SLUG(b[1])}">${b[1]}</a>`).join('');
 const crumb=H.crumbs('The padel guide',g.t);
 if(v===2)return [crumb,`<section class="ahd2"><div class="wrap"><div class="in"><div class="t"><small>${g.cat}</small><h1>${g.t}</h1><p>${g.d}</p><span class="amt">${g.m} read</span></div>${H.PH(g.ph,'ahp')}</div></div></section>`,
  `<section class="sec sx-sec pt0"><div class="wrap"><div class="alay"><aside class="aside"><div class="stk"><b>In this guide</b><nav class="toc">${toc}</nav>${sum}</div></aside><article class="abody">${body}</article></div></div></section>`,
  `<section class="sec sx-sec"><div class="wrap"><a class="anext" href="g-${H.SLUG(next.t)}.html">${H.PH(next.ph,'anp')}<div><small>Next guide</small><h2>${next.t}</h2><span class="ul">Read it, ${next.m}</span></div></a></div></section>`,
  H.SEC(H.SH('More guides','','All guides')+`<div class="gcards c3">${rel.map(G2).join('')}</div>`)];
 if(v===3)return [`<div class="aprog" id="aprog"><i></i></div>`,`<section class="ahd3"><div class="wrap">${crumb.replace('<div class="wrap">','<div>')}<small>${g.cat}, ${g.m} read</small><h1>${g.t}</h1><p>${g.d}</p></div></section>`,
  `<div class="wrap">${H.PH(g.ph,'awide')}</div>`,
  `<section class="sec sx-sec"><div class="wrap"><article class="abody a3">${sum}${body}</article></div></section>`,
  `<section class="anx3"><div class="wrap"><a href="g-${H.SLUG(next.t)}.html"><small>Up next</small><h2>${next.t}</h2><span>${next.cat}, ${next.m} read ${H.ARW}</span></a></div></section>`,
  H.SEC(H.SH('More guides','','All guides')+`<div class="gcards c3">${rel.map(G2).join('')}</div>`)];
 return [crumb,H.HERO({c:'ahero',n:g.ph,k:g.cat,t:g.t,p:g.d,x:`<span class="amt wh">${g.m} read</span>`}),
  `<section class="sec sx-sec"><div class="wrap"><article class="abody">${sum}${body}</article></div></section>`,
  H.SEC(H.SH('More guides','','All guides')+`<div class="gcards c3">${rel.map(G2).join('')}</div>`)];};
I.push((t,H)=>{if(t!=='article'||H.V!==3)return;const b=H.$('#aprog i'),a=H.$('.abody');if(!b||!a)return;const f=()=>{const r=a.getBoundingClientRect();b.style.width=Math.min(Math.max((innerHeight*.4-r.top)/r.height,0),1)*100+'%';};addEventListener('scroll',f,{passive:true});f();});

/* ---------- contact ---------- */
const TOPICS=['An order I have placed','A return or refund','Choosing a racket or kit','Something else'];
const CFORM=(H,c='',t='')=>`<div class="sxform ${c}" id="cform"><h2>Send us a message</h2><p>We usually reply within one working day.</p><form onsubmit="event.preventDefault();this.closest('.sxform').classList.add('done')"><div class="two"><label>Your name<input required></label><label>Email address<input type="email" required></label></div><label>What is it about?<select id="ctopic">${TOPICS.map(x=>`<option ${x===t?'selected':''}>${x}</option>`).join('')}</select></label><label>Order number, if you have one<input placeholder="For example PAD12345"></label><label>Your message<textarea rows="5" required></textarea></label><button class="btn hor">Send message</button></form><div class="ok"><b>Thanks, we have got it.</b> We will reply by email within one working day.</div></div>`;
const HOURS=H=>`<div class="hrs"><div><small>Opening hours</small><b>${H.POL.hours}</b></div><div><small>Email</small><b>${LEGAL.email}</b></div><div><small>Replies</small><b>Within one working day</b></div></div>`;
X.contact=H=>{const v=H.V,c=H.crumbs('Help','Contact us');
 const quick=H.TILES([['Track my order','parcel on a doorstep','Where is my parcel?'],['Start a return','returns label on a box',`${H.POL.days} days on anything unused`],['Delivery','courier at the door',`Free over £${H.POL.free}`]]);
 if(v===2)return [c,`<section class="sec sx-sec pt0"><div class="wrap"><div class="ct2"><div class="l"><small>Contact us</small><h1>Talk to a player, not a script.</h1><p>Our team play padel too. Ask us about an order, a return or which racket suits your game.</p><div class="routes">${[['mail','Email',LEGAL.email],['pin','Order help','Track or change an order'],['rk','Kit advice','Rackets, shoes and sizes']].map(([i,a,b])=>`<div>${H.IC[i]}<span><b>${a}</b><small>${b}</small></span></div>`).join('')}</div>${H.PH('our team in the warehouse','ctp')}</div>${CFORM(H,'grey')}</div></div></section>`,
  H.SEC(H.SH('Quick answers','Most questions are answered here.')+H.FAQP([H.QA('Orders',0),H.QA('Delivery',1),H.QA('Returns',0),H.QA('Returns',3),H.QA('Rackets',0)].filter(Boolean),'customer team on the phone'))];
 if(v===3)return [c,`<section class="sxtitle ctt"><div class="wrap"><small>Contact us</small><h1>What is it about?</h1><p>Choose one and we will point you to the quickest answer, or straight to the team.</p></div></section>`,
  H.SEC(`<div class="ctiles c4 sxt ctopics">${[['An order I have placed','parcel being handed over'],['A return or refund','returns being checked'],['Choosing a racket or kit','player trying a racket'],['Something else','team at their desks']].map(([t,n],k)=>`<button class="ct ca" data-ctopic="${k}">${H.NOTE(n)}<span class="cap"><b>${t}</b></span><span class="arw">${H.ARW}</span></button>`).join('')}</div><div class="ctans" id="ctans"></div>`,'pt0'),
  H.SEC(`<div class="cthrs">${H.PH('our customer team','hp')}<div><h2>Here when you need us</h2>${HOURS(H)}</div></div>`)];
 return [c,H.HERO({n:'our customer team at their desks',k:'Contact us',t:'We are here to help.',p:`${H.POL.hours}. We usually reply within one working day.`}),
  H.SEC(`<div class="sxsplit">${CFORM(H)}<div class="ctside">${H.PH('team packing an order','sp')}${HOURS(H)}</div></div>`),
  H.SEC(H.SH('Quicker ways to get an answer')+quick)];};
const CTA=[[['Orders',0],['Orders',1],['Delivery',2]],[['Returns',0],['Returns',1],['Returns',3]],[['Rackets',0],['Rackets',1],['Rackets',2]],[]];
I.push((t,H)=>{if(t!=='contact'||H.V!==3)return;document.addEventListener('click',e=>{const b=e.target.closest('[data-ctopic]');if(!b)return;const k=+b.dataset.ctopic;H.$$('[data-ctopic]').forEach(x=>x.classList.toggle('on',x===b));
 const qa=CTA[k].map(([c,i])=>H.QA(c,i)).filter(Boolean);H.$('#ctans').innerHTML=`<div class="ctgrid">${qa.length?`<div><h3>Quick answers</h3>${H.FAQ(qa)}</div>`:''}${CFORM(H,'grey',TOPICS[k])}</div>`;H.$('#ctans').scrollIntoView({behavior:'smooth',block:'start'});});});

/* ---------- legal pages, one page each ---------- */
const DOCS=[['privacy','Privacy policy','How we collect and use your information'],['terms','Terms and conditions','The terms that apply when you shop with us'],['cookies','Cookie policy','The cookies we use and how to control them']];
X.legal=H=>{const LG=window.LG||{};const k=H.G.doc||'privacy',d=LG[k];if(!d)return ['<div class="wrap"><p>Legal text not loaded.</p></div>'];const v=H.V;
 const others=`<div class="lgo">${DOCS.filter(x=>x[0]!==k).map(([f,t,s])=>`<a href="${f}.html"><small>Legal</small><b>${t}</b><span>${s}</span><i>${H.ARW}</i></a>`).join('')}<a href="contact.html"><small>Questions</small><b>Contact us</b><span>${LEGAL.email}</span><i>${H.ARW}</i></a></div>`;
 const secs=d.s.map(([h,ps])=>`<section id="${H.SLUG(h)}"><h2>${h}</h2>${ps.map(p=>`<p>${fill(p)}</p>`).join('')}</section>`).join('');
 const upd='Last updated October 2026';
 const ck=k==='cookies'?`<button class="btn ol lgck" type="button">Cookie settings</button>`:'';
 const c=H.crumbs('Legal',d.t);
 if(v===2)return [c,`<section class="sxtitle grey lg2"><div class="wrap"><small>${upd}</small><h1>${d.t}</h1><p>${fill(d.d)}</p>${ck}</div></section>`,
  H.SEC(`<div class="lgacc"><div class="lgtop"><span>${d.s.length} sections</span><button class="ul" data-lgall>Open all</button></div>${d.s.map(([h,ps],j)=>`<details ${j?'':'open'}><summary>${h}</summary><div>${ps.map(p=>`<p>${fill(p)}</p>`).join('')}</div></details>`).join('')}</div>`),H.SEC(H.SH('Other policies')+others)];
 if(v===3)return [c,`<section class="lg3h"><div class="wrap"><div class="in"><small>Legal</small><h1>${d.t}</h1><p>${fill(d.d)}</p><span>${upd}</span>${ck}</div></div></section>`,
  H.SEC(`<div class="lg3"><label class="sel lgj"><select id="lgjump" aria-label="Jump to a section"><option value="">Jump to a section</option>${d.s.map(([h])=>`<option value="${H.SLUG(h)}">${h}</option>`).join('')}</select></label><div class="lgtx">${secs}</div><div class="lgq"><h2>Questions about this policy?</h2><p>Email us at ${LEGAL.email}. Our team is here ${H.POL.hours}.</p><a class="btn" href="contact.html">Contact us</a></div></div>`,'pt0'),H.SEC(H.SH('Other policies')+others)];
 return [c,`<section class="sxtitle lg1"><div class="wrap"><small>Legal</small><h1>${d.t}</h1><p>${fill(d.d)}</p><span class="upd">${upd}</span>${ck}</div></section>`,
  H.SEC(`<div class="lglay"><aside><div class="stk"><b>On this page</b><nav class="toc">${d.s.map(([h])=>`<a href="#${H.SLUG(h)}">${h}</a>`).join('')}</nav></div></aside><div class="lgtx">${secs}</div></div>`,'pt0'),H.SEC(H.SH('Other policies')+others)];};
I.push((t,H)=>{if(t!=='legal')return;document.addEventListener('click',e=>{const b=e.target.closest('[data-lgall]');if(!b)return;const ds=H.$$('.lgacc details'),open=ds.every(d=>d.open);ds.forEach(d=>d.open=!open);b.textContent=open?'Open all':'Close all';});
 document.addEventListener('change',e=>{if(e.target.id==='lgjump'&&e.target.value){const s=document.getElementById(e.target.value);if(s)s.scrollIntoView({behavior:'smooth',block:'start'});}});});

/* ---------- 404 ---------- */
X.notfound=H=>{const v=H.V;const pop=H.rk.slice(4,8);
 const cats=H.TILES([['Padel rackets','rackets on a wall','From first rackets to tour models'],['Shoes','padel shoes on court','Herringbone, omni and clay'],['Bags','racket bag on a bench','Racket bags and backpacks'],['Sale','sale rackets on a bench','Last season, reduced']],'c4');
 if(v===2)return [H.HERO({n:'ball stuck in the wire mesh behind the court',k:'Page not found',t:'This one is stuck in the fence.',p:'The page you were looking for has moved or no longer exists.',x:H.SRCH('Search rackets, brands and more')}),H.SEC(H.BARS(['Padel rackets ','Shoes ','Help centre ']),'pt0'),H.SEC(H.SH('Our best rated rackets','','Shop rackets')+H.GRID(pop))];
 if(v===3)return [H.SEC(`<div class="nf3"><div class="sb">${[['Set','4'],['Games','0'],['Points','4']].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div><h1>Game, set and missing page.</h1><p>We cannot find that page. It may have moved, or the link may be wrong.</p><div class="ia"><a class="btn" href="home.html">Back to the homepage</a><a class="btn ol" href="collection.html">Shop rackets</a></div></div>`,'pt8'),H.SEC(H.SH('Popular right now','','Shop all')+H.GRID(pop))];
 return [`<section class="stage nf1"><div class="wrap"><h1 class="bw" style="--n:4"><span>OUT.</span></h1><div class="scap"><p>That page is out of court. Search for what you need, or start from one of these.</p>${H.SRCH('Search rackets, brands and more')}</div></div></section>`,H.SEC(cats),H.SEC(H.SH('Popular right now','','Shop all')+H.GRID(pop))];};

/* ---------- search, no results ---------- */
X.noresults=H=>{const v=H.V;const q=v===2?'bulpadel vertx':'glow in the dark racket';
 const sbox=`<form class="srbig2" onsubmit="event.preventDefault()">${H.IC.srch}<input value="${q}" aria-label="Search"><button class="btn hor">Search</button></form>`;
 const head=(h,p)=>`<section class="nrh"><div class="wrap">${sbox}<h1>${h}</h1>${p?`<p>${p}</p>`:''}</div></section>`;
 if(v===2){const fix=H.rk.filter(x=>x.b==='Bullpadel');const top=fix.find(x=>/Vertex/.test(x.n))||fix[0];
  return [head(`No results for <span class="q">${q}</span>`,''),H.SEC(`<div class="dym"><div class="t"><small>Did you mean</small><h2><a href="#">Bullpadel Vertex</a>?</h2><p>Showing ${fix.length} results for Bullpadel Vertex instead.</p></div><div class="f">${H.card(top)}</div></div>`,'pt0'),H.SEC(H.SH(`More from Bullpadel`,'','Shop Bullpadel')+H.GRID(fix.filter(x=>x!==top).slice(0,4)))];}
 if(v===3)return [head(`No results for <span class="q">${q}</span>`,''),H.SEC(`<div class="nr3"><div><h2>A few things to try</h2><p>Check the spelling, use fewer words, or search by brand or racket shape, for example <a class="ul" href="#">Nox</a> or <a class="ul" href="#">diamond</a>.</p><p>You can also browse every racket by level, or ask the team and we will help you find it.</p><a class="btn" href="collection.html">Browse rackets</a></div><div class="sxform grey"><h2>Ask the team</h2><p>Tell us what you are looking for and we will reply within one working day.</p><form onsubmit="event.preventDefault();this.closest('.sxform').classList.add('done')"><label>Email address<input type="email" required></label><label>What are you looking for?<input required value="${q}"></label><button class="btn hor">Send</button></form><div class="ok"><b>Thanks.</b> We will be in touch by email.</div></div></div>`,'pt0'),H.SEC(H.SH('Guides that might help','','All guides')+`<div class="gcards c4">${H.GUIDES2.slice(0,4).map(H.GC).join('')}</div>`)];
 return [head(`No results for <span class="q">${q}</span>`,'Check the spelling or try fewer words. Or start from one of these.'),H.SEC(H.TILES([['Padel rackets','rackets on a wall',''],['Shoes','padel shoes on court',''],['Clothing','player in kit',''],['Accessories','grips and tape','']],'c4'),'pt0'),H.SEC(H.SH('Best sellers','','Shop rackets')+H.GRID(H.rk.slice(0,4)))];};

/* ---------- account: sign in and my account ---------- */
X.signin=H=>{const v=H.V;
 const si=`<form class="tfx" onsubmit="event.preventDefault()"><label>Email address<input type="email" required></label><label>Password<input type="password" required></label><a class="ul fp2" href="#">Forgotten your password?</a><button class="btn hor">Sign in</button></form>`;
 const cr=`<form class="tfx" onsubmit="event.preventDefault()"><div class="two"><label>First name<input required></label><label>Last name<input required></label></div><label>Email address<input type="email" required></label><label>Password<input type="password" required></label><label class="cb"><input type="checkbox">Email me about new rackets and sale previews</label><button class="btn hor">Create account</button></form>`;
 const why=`<p class="why">Track orders, start returns and check out faster with your details saved.</p>`;
 if(v===2)return [H.SEC(`<div class="acc2b"><div class="tabs2" role="tablist"><button class="on" data-atab="0">Sign in</button><button data-atab="1">Create account</button></div><div class="pane on" data-apane="0"><h1>Welcome back</h1>${si}</div><div class="pane" data-apane="1"><h1>Create an account</h1>${why}${cr}</div><div class="tps">${H.RST(5)}<span><b>Excellent</b> on Trustpilot</span></div></div>`,'pt8 sic')];
 if(v===3)return [`<section class="acc3"><div class="wrap"><div class="in">${H.PH('player walking onto court with a racket bag','fill')}<div class="card" id="otp"><div class="s0"><small>Your account</small><h1>Sign in or create an account</h1><p>Enter your email and we will send you a 6 digit code. No password needed.</p><form class="tfx" data-otp onsubmit="event.preventDefault()"><label>Email address<input type="email" required></label><button class="btn hor">Send my code</button></form></div><div class="s1"><small>Check your email</small><h1>Enter your code</h1><p>We have sent a 6 digit code. It lasts 10 minutes.</p><div class="otpb">${'<input inputmode="numeric" maxlength="1" aria-label="Digit">'.repeat(6)}</div><a class="btn hor" href="account.html">Continue</a><button class="ul" data-otpback>Use a different email</button></div></div></div></div></section>`];
 return [H.crumbs('Account'),H.SEC(`<div class="acc1"><div class="forms"><div><h1>Sign in</h1>${si}</div><div class="new"><h2>New to Raqello?</h2>${why}${cr}</div></div>${H.PH('player packing a racket bag','sp')}</div>`,'pt0')];};
I.push((t,H)=>{if(t!=='signin')return;document.addEventListener('click',e=>{const b=e.target.closest('[data-atab]');if(b){H.$$('[data-atab]').forEach(x=>x.classList.toggle('on',x===b));H.$$('[data-apane]').forEach(p=>p.classList.toggle('on',p.dataset.apane===b.dataset.atab));}if(e.target.closest('[data-otpback]'))H.$('#otp').classList.remove('on');});
 document.addEventListener('submit',e=>{if(e.target.dataset.otp!==undefined){H.$('#otp').classList.add('on');setTimeout(()=>{const i=H.$('.otpb input');if(i)i.focus();},50);}});
 document.addEventListener('input',e=>{if(e.target.closest('.otpb')&&e.target.value){const n=e.target.nextElementSibling;if(n)n.focus();}});});
const KR=(H,r,when)=>`<div class="kr" id="kr"><div class="im">${H.IMGB(r)}</div><div><small>Your racket</small><h2>${r.b} ${r.n}</h2><p>${H.LVL[r.l]}, ${r.sh}. ${when}</p><a class="ul" href="product.html">View racket</a></div></div>`;
X.account=H=>{const v=H.V;const th=x=>`<i class="oth">${H.IMGB(x)}</i>`;
 const ords=ORDERS.map(([n,d,s,l])=>({n,d,s,l:l.map(([a,q])=>[H.byName(a),q]).filter(r=>r[0])})).map(o=>({...o,t:o.l.reduce((a,[x,q])=>a+x.p*q,0)}));
 const st=s=>`<span class="ost ${s==='Delivered'?'ok':''}">${s}</span>`;
 const nav=a=>`<nav class="anav">${['Orders','Returns','Addresses','Details','Sign out'].map((x,k)=>`<a href="#" class="${k===a?'on':''}">${x}</a>`).join('')}</nav>`;
 if(v===2){const o=ords[0];const steps=['Ordered','Packed','On its way','Delivered'],at=2;
  return [H.SEC(`<div class="acd"><div class="hi"><small>Your account</small><h1>Hi Sam</h1></div><a class="ul" href="#">Sign out</a></div><div class="aord"><div class="t"><small>Latest order, ${o.n}</small><h2>${o.s}</h2><p>Placed ${o.d}. Expected in 3 to 5 working days.</p><ol class="ostp">${steps.map((x,k)=>`<li class="${k<=at?'on':''}">${x}</li>`).join('')}</ol><a class="btn" href="track.html">Track this order</a></div><div class="its">${o.l.map(([x,q])=>`<div>${th(x)}<span><b>${x.b} ${x.n}</b><small>Qty ${q}</small></span></div>`).join('')}</div></div><div class="atiles">${[['Orders','All your past orders','bag'],['Returns',`Start a return within ${H.POL.days} days`,'ret'],['Addresses','Home, work and club','pin'],['Details','Name, email and password','user']].map(([a,b,i])=>`<a href="#">${H.IC[i]}<b>${a}</b><span>${b}</span></a>`).join('')}</div>`,'pt8'),H.SEC(H.SH('Recently viewed')+H.GRID(H.rk.slice(1,5)))];}
 if(v===3){const none=!!H.G.noRacket;const r=none?null:ords[1].l[0][0];const fits=H.P.filter(x=>['Overgrips','Protector tape','Racket covers'].includes(x.t)).slice(0,3);const os=none?ords.filter(o=>!o.l.some(([x])=>x.c==='racket')):ords;
  const kr=none?`<div class="kr kr0" id="kr"><div class="im"><span class="note">Photo: your racket</span></div><div><small>Your racket</small><h2>Which racket do you play with?</h2><p>You have not bought a racket from us yet. Tell us which one you use and we will show you the grips, tape and covers that fit it.</p><label class="sel myr"><select id="myr" aria-label="Your racket"><option value="">Choose your racket</option>${[...new Set(H.rk.map(x=>x.b))].sort().map(b=>`<optgroup label="${b}">${H.rk.filter(x=>x.b===b).map(x=>`<option value="${x.i}">${x.b} ${x.n}</option>`).join('')}</optgroup>`).join('')}</select></label><a class="ul" href="collection.html">Or find a new racket</a></div></div>`:KR(H,r,`Bought ${ords[1].d}.`);
  return [H.SEC(`<div class="acd"><div class="hi"><small>Your account</small><h1>Your kit</h1></div>${nav(0)}</div><div class="kit">${kr}<div class="kf"><b id="kft">${none?'Kit every racket needs':'Made to fit your racket'}</b><div class="grid">${fits.map(H.card).join('')}</div></div></div>`,'pt8'),H.SEC(H.SH('Your orders')+`<div class="ocards">${os.map(o=>`<div class="oc2"><div class="hd"><span><b>${o.n}</b><small>${o.d}</small></span>${st(o.s)}</div><div class="ims">${o.l.map(([x])=>`<span>${H.IMGB(x)}</span>`).join('')}</div><div class="ft"><b>${H.money(o.t)}</b><span><a class="ul" href="#">View order</a><button class="btn ol sm">Buy again</button></span></div></div>`).join('')}</div>`)];}
 return [H.crumbs('My account'),H.SEC(`<div class="acc4"><aside><small>Signed in as</small><b>Sam Taylor</b>${nav(0)}</aside><div><h1>Orders</h1><div class="olist">${ords.map(o=>`<div class="orow"><div class="a"><b>${o.n}</b><small>${o.d}</small></div><div class="ims">${o.l.map(([x])=>th(x)).join('')}</div>${st(o.s)}<b class="tt">${H.money(o.t)}</b><a class="ul" href="#">View order</a></div>`).join('')}</div><p class="fine">Returns can be started from any order within ${H.POL.days} days of delivery.</p></div></div>`,'pt0')];};

I.push((t,H)=>{if(t!=='account')return;document.addEventListener('change',e=>{if(e.target.id!=='myr'||!e.target.value)return;const r=H.P[+e.target.value];H.$('#kr').outerHTML=KR(H,r,'Saved to your account.').replace('View racket</a>','View racket</a> <button class="ul" data-myrx>Change</button>');H.$('#kft').textContent='Made to fit your racket';});
 document.addEventListener('click',e=>{if(e.target.closest('[data-myrx]'))location.reload();});});

/* ---------- beginners ---------- */
X.beginners=H=>{const v=H.V;const b=H.rk.filter(x=>x.l===1),from=c=>H.gbp(Math.min(...H.P.filter(x=>x.c===c).map(x=>x.p)));
 const guides=H.GUIDES2.filter(g=>g[0]==='Beginners').concat([H.GUIDES2[0]]);
 const faq=H.FAQ([H.QA('Rackets',0),['What do I need for my first game?','A racket, a pair of court shoes and a tube of balls. Most clubs will lend you a racket for your first session if you want to try before you buy.'],['Do I need padel shoes?','They help. Running shoes are built to move forwards, and padel is mostly side to side on a sandy surface. Padel shoes grip better and support your ankle.'],['How much should I spend on a first racket?','Between £60 and £130 gets you a proper beginner racket from a brand we stock.']].filter(Boolean));
 if(v===2){const row=(n,k,h,p,l,cta)=>`<div class="bgs ${k%2?'rev':''}">${H.PH(n,'bsp')}<div class="t"><small>${['First','Then','And'][k]||''}</small><h2>${h}</h2><p>${p}</p><div class="grid">${l.slice(0,2).map(H.card).join('')}</div><a class="ul" href="#">${cta}</a></div></div>`;
  return [H.crumbs('Beginners'),`<section class="sxtitle bgt"><div class="wrap"><small>Beginners</small><h1>Everything for your first season.</h1><p>Three things to buy, and three guides to read before you play.</p></div></section>`,
   H.SEC(row('beginner holding a round racket',0,'A racket that forgives you','A round shape and a soft core give you the biggest sweet spot. Look for something between 345 and 365g.',b,'Shop beginner rackets')+row('shoe sole on artificial grass',1,'Shoes that grip the court','Padel is side to side on sand. Court shoes with an omni or herringbone sole keep you on your feet.',H.P.filter(x=>x.c==='shoe'),'Shop padel shoes')+row('tube of balls opened courtside',2,'Fresh balls','Padel balls run at a lower pressure than tennis balls. Bring a new tube to your first game.',H.P.filter(x=>x.c==='ball'),'Shop balls'),'pt0'),
   H.SEC(H.SH('Read before you play','','All guides')+`<div class="gcards c4">${guides.map(H.GC).join('')}</div>`),H.SEC(H.SH('Beginner questions')+H.FAQP([H.QA('Rackets',0),['Do I need padel shoes?','They help. Padel is mostly side to side on a sandy surface, so court shoes grip better and support your ankle.'],['How much should I spend on a first racket?','Between £60 and £130 gets you a proper beginner racket from a brand we stock.']].filter(Boolean),'beginners laughing between points'))];}
 if(v===3){const pick=[...b].sort((a,c)=>a.p-c.p);const three=[pick[0],pick[Math.floor(pick.length/2)],pick[pick.length-1]].filter(Boolean);const why=['The lightest on your wallet. Round, soft and easy to swing.','Our middle pick. A little more power without losing the big sweet spot.','The one to grow into. Still forgiving, with a more premium feel.'];
  return [`<section class="stage bg3"><div class="wrap"><h1 class="bw" style="--n:9"><span>BEGINNERS</span></h1><div class="scap"><p>New to padel? Start with one of these three rackets. They are all round, light and forgiving.</p></div></div></section>`,
   H.SEC(`<div class="pick3">${three.map((x,k)=>`<a class="pk" href="product.html"><div class="im">${H.IMGB(x)}</div><small>${['Best value','Our pick','Grow into it'][k]}</small><h2>${x.b} ${x.n}</h2><p>${why[k]}</p><div class="row"><b>${H.gbp(x.p)}</b><span class="ul">View racket</span></div></a>`).join('')}</div>`),
   H.SEC(H.SH('You will also need')+H.TILES([['Padel shoes','padel shoes on court',`From ${from('shoe')}`],['Balls','new tube of balls',`From ${from('ball')}`],['Overgrips','overgrip being wrapped',`From ${from('acc')}`]])),H.SEC(H.SH('Read before you play','','All guides')+`<div class="gcards c4">${guides.map(H.GC).join('')}</div>`)];}
 return [H.crumbs('Beginners'),H.HERO({n:'friends playing their first game of padel',k:'Beginners',t:'New to padel? Start here.',p:'The kit you need for your first game, and the guides to help you enjoy it.',cta:'Shop beginner rackets',href:'rackets-beginner.html'}),
  H.SEC(H.SH('What you need for your first game')+H.TILES([['A beginner racket','beginner holding a round racket',`From ${H.gbp(Math.min(...b.map(x=>x.p)))}`],['Court shoes','padel shoes on court',`From ${from('shoe')}`],['A tube of balls','tube of balls courtside',`From ${from('ball')}`]])),
  H.SEC(H.SH('Beginner rackets','Light, round and forgiving.','Shop all')+H.GRID(b.slice(0,4))),
  H.SEC(H.SH('Read before you play','','All guides')+`<div class="gcards c4">${guides.map(H.GC).join('')}</div>`),
  H.SEC(H.SH('Beginner questions')+faq)];};

/* ---------- sale, rows by category ---------- */
X.salerows=H=>{const s=H.P.filter(x=>x.w);const off=Math.max(...s.map(x=>Math.round((1-x.p/x.w)*100)));
 const rows=[['Rackets on sale',x=>x.c==='racket','Shop sale rackets'],['Shoes and clothing on sale',x=>x.c==='shoe'||x.c==='cloth','Shop sale kit'],['Bags, balls and accessories',x=>['bag','ball','acc'].includes(x.c),'Shop sale accessories']];
 return [H.crumbs('Sale'),H.HERO({n:'last season\'s rackets on a court bench',k:'Sale',t:`Up to ${off}% off last season.`,p:'Rackets and kit from the brands we stock, reduced. When it is gone, it is gone.'}),
  ...rows.map(([t,f,c])=>{const l=s.filter(f).sort((a,b)=>(b.w-b.p)-(a.w-a.p));return l.length?H.SEC(H.SH(t,`${l.length} reduced`,c)+H.GRID(l.slice(0,4))):'';})];};
})();
