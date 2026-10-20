/* Raqello product page v2. window.PDPCFG.layout = 1..5, window.PRODUCT = real data. Needs classic.js first. */
(()=>{
const C=window.PDPCFG,R=window.PRODUCT,K=window.PADEL,gbp=K.gbp;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const TPS='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>';
const st=(n=5)=>`<span class="rvst" aria-label="${n} out of 5 stars">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}">${TPS}</i>`).join('')}</span>`;
const tpw=`<span class="tpw"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00B67A" d="M12 2.5l2.8 6.6 7.2.6-5.5 4.7 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7l7.2-.6z"/></svg>Trustpilot</span>`;
const money=n=>'£'+(Math.floor(n*100)/100).toFixed(2);
const name=`${R.b} ${R.n}`, model=R.n.replace(' Martin Di Nenno','');
const word=v=>v>=9?'Very high':v>=7?'High':v>=5?'Medium':'Low';
const ph=(s,k)=>`<div class="ph"><img src="${s}" alt="${name}, photo ${k+1}" ${k?'loading="lazy"':''}></div>`;
const heart='<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.8c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.4 0 5.2 3.5 3.6 6.6C19 15.6 12 20 12 20z" fill="none" stroke="#111" stroke-width="1.8"/></svg>';
const shots=R.imgs.slice(0,4);
const klarna=`<p class="kl"><img src="media/klarna-badge.png" alt="Klarna"><span>3 interest free payments of <b>${money(R.p/3)}</b></span></p>`;
const facts=`<p class="facts">${R.key.map(([a,b])=>`<span>${a} <b>${b}</b></span>`).join('')}</p>`;
const cta=`<div class="cta"><button class="btn big" data-atc>Add to bag</button><button class="wish" aria-label="Save to wishlist">${heart}</button></div>`;
const note=`<p class="note2"><span>In stock</span><span>Free UK delivery</span><span>14-day returns</span></p>`;
const play=`<dl class="play">${R.pf.map(([t,v])=>`<div><dt>${t==='Manoeuvrability'?'Handling':t}</dt><dd>${word(v)}</dd></div>`).join('')}</dl>`;
const swipe=(id)=>`<div class="swipe" id="${id}">${shots.map(ph).join('')}</div>`;
const dots=(id)=>`<div class="dots" data-for="${id}">${shots.map((_,k)=>`<i class="${k?'':'on'}"></i>`).join('')}</div>`;
const head=`<div><p class="brand">${R.b}</p><h1>${name}</h1></div>`;

const FOLD={
6:()=>`<section class="sq6 wrap"><div class="gl"><div class="main6"><img id="m6" src="${R.imgs[0]}" alt="${name}"></div><div class="th6">${R.imgs.slice(0,5).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div></div>
 <div class="in6"><p class="brand">${R.b}</p><h1>${name}</h1><p class="price">${gbp(R.p)}</p>${klarna}<p class="lede">${R.lede}</p>
 <dl class="ks6">${R.key.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>${cta}${note}</div></section>`,
1:()=>`<section class="fold wrap"><div class="media"><div class="thumbs">${shots.map((s,k)=>`<button class="${k?'':'on'}" data-to="g1" data-i="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div>${swipe('g1')}${dots('g1')}</div>
 <div class="info">${head}<p class="price">${gbp(R.p)}</p>${klarna}${facts}${cta}${note}</div></section>`,
2:()=>`<section class="fold wrap"><div class="left">${head}<p class="lede">${R.best}.</p>${play}</div>
 <div class="stage">${ph(shots[0],0)}<button class="arr l" data-step="-1" aria-label="Previous photo">←</button><button class="arr r" data-step="1" aria-label="Next photo">→</button><span class="ctr">1 / ${shots.length}</span></div>
 <div class="right"><div class="pr-row"><p class="price">${gbp(R.p)}</p>${klarna}</div>${cta}${note}</div></section>`,
3:()=>`<section class="fold wrap"><div class="strip">${R.imgs.slice(0,5).map(ph).join('')}</div>
 <div class="bar"><div class="t">${head}</div><div class="facts">${R.key.map(([a,b])=>`<span>${a} <b>${b}</b></span>`).join('')}</div><div class="p"><p class="price">${gbp(R.p)}</p>${klarna}${cta}</div></div></section>`,
4:()=>`<section class="fold wrap"><div class="card2">${swipe('g4')}${dots('g4')}</div>
 <div class="panel"><div class="seg" role="tablist"><button class="on" data-pane="0">Overview</button><button data-pane="1">Specs</button><button data-pane="2">Delivery</button></div>
  <div class="pane on" data-p="0">${head}<p class="lede mob-hide">${R.lede}</p></div>
  <div class="pane" data-p="1">${play}${facts}</div>
  <div class="pane" data-p="2"><p class="lede">Free UK delivery on orders over £${K.STORE.freeOver}. Return unused items within 14 days.</p></div>
  <div class="t"><p class="price">${gbp(R.p)}</p></div>${klarna}${cta}</div></section>`,
5:()=>`<section class="fold wrap"><h1 class="ttl"><small>${R.b} · Martin Di Nenno</small>${model}</h1>
 <div class="hero">${swipe('g5')}${dots('g5')}</div>
 <div class="buyf"><div class="row"><p class="price">${gbp(R.p)}</p><p class="sub">In stock</p></div>${klarna}${cta}<p class="sub">Free UK delivery. 14-day returns.</p></div></section>`};

const about=`<section class="sec wrap" id="about"><div class="about"><div><h2>About the ${model}</h2>${R.desc}</div><div><h2>Specifications</h2><dl class="spec">${R.specs.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div></div></section>`;
const tech=`<section class="sec wrap"><h2>Technology</h2><div class="tech">${R.feat.map(([t,p])=>`<div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>`;
const kit=`<section class="sec wrap"><div class="kitw"><h2>Complete the set</h2><div class="kit">${R.kit.map(a=>`<label><input type="checkbox" ${a.on?'checked':''} data-p="${a.p}"><span class="th"><img src="${a.img}" alt=""></span><span>${a.n}</span><b>${gbp(a.p)}</b></label>`).join('')}</div><div class="kitf"><span>Racket and selected items: <b id="ktot"></b></span><button class="btn" data-atc>Add all to bag</button></div></div></section>`;
const rel=`<section class="sec wrap"><h2>You may also like</h2><div class="rel">${R.also.map(a=>`<a href="#"><span class="ph"><img src="${a.img}" alt="" loading="lazy"></span><span><b>${a.n}</b></span><span>${gbp(a.p)}</span></a>`).join('')}</div></section>`;
const faq=`<section class="sec wrap faq"><h2>Questions</h2>${[['Is it right for my level?','It suits advanced players with a fast, full swing. If you are newer to padel, a round racket with a lower balance is easier to control.'],['What is Custom Weight?','A system that lets you add 3, 6 or 9 g to fine-tune the balance and feel.'],['How much is delivery?',`Free UK delivery on orders over £${K.STORE.freeOver}. Other options are shown at checkout.`],['Can I pay with Klarna?',`Yes. Choose Klarna at checkout to pay in 3 interest free payments of ${money(R.p/3)}.`]].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`;
const BELOW={6:[about,tech,rel,faq],1:[about,tech,rel,faq],2:[tech,about,rel,faq],3:[about,tech,rel,faq],4:[about,tech,rel,faq],5:[tech,about,rel,faq]};


const sqs=(n)=>R.imgs.slice(0,n).map((s,k)=>`<div class="sqi"><img src="${s}" alt="${name}, photo ${k+1}" ${k?'loading="lazy"':''}></div>`).join('');
const bigT=`<h1 class="bigt"><small>${R.b} · Martin Di Nenno</small>${model}</h1>`;
const buyCol=(t)=>`<div class="bc">${t||`<div><p class="brand">${R.b}</p><h1>${name}</h1></div>`}<p class="price">${gbp(R.p)}</p>${klarna}<p class="lede">${R.lede}</p><dl class="ks6">${R.key.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>${cta}${note}</div>`;
const band=(txt,dark)=>`<section class="band ${dark?'dk':''}"><div class="bph"><span class="bn">Photo: ${txt}</span></div><div class="bt"><p class="brand">${R.b} · ${model}</p><h2>${['Built to finish points','The Di Nenno racket','Power with a plan','Made for the net','Explosive by design'][(C.layout-7)%5]}</h2></div></section>`;
FOLD[7]=()=>`<section class="w7 fw"><div class="g4">${sqs(4)}</div>${buyCol()}</section>`;
FOLD[8]=()=>`<section class="w8 fw"><div class="gv"><div class="vth">${R.imgs.slice(0,5).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div><div class="sqi main"><img id="m6" src="${R.imgs[0]}" alt="${name}"></div></div>${buyCol()}</section>`;
FOLD[9]=()=>`<section class="w9 fw"><div class="peek" id="pk">${sqs(5)}</div>${buyCol(bigT)}</section>`;
FOLD[10]=()=>`<section class="w10 fw"><div class="stack">${sqs(4)}</div>${buyCol()}</section>`;
FOLD[11]=()=>`<section class="w11"><div class="bleed"><div class="sqi"><img id="m6" src="${R.imgs[0]}" alt="${name}"></div><div class="dots11">${R.imgs.slice(0,5).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"></button>`).join('')}</div></div>${buyCol(bigT)}</section>`;
Object.assign(BELOW,{7:[band('player with the racket on court, full width'),tech,about,rel,faq],8:[about,band('Bullpadel brand image, full width',1),tech,rel,faq],9:[band('racket close up in action, full width'),about,tech,rel,faq],10:[tech,about,band('Di Nenno at the net, full width',1),rel,faq],11:[band('brand campaign image, full width'),tech,about,rel,faq]});


/* ===== 12-16: retailer-style right columns, everything in the buy column ===== */
const ico={truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
 ret:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/></svg>',
 card:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>'};
const accs=(open)=>`<div class="acc">${[['Description',R.desc],['Specifications',`<dl class="sl">${R.specs.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`],['How it plays',`<p>${R.plays}</p><dl class="sl">${R.pf.map(([t,v])=>`<div><dt>${t==='Manoeuvrability'?'Handling':t}</dt><dd>${word(v)}</dd></div>`).join('')}</dl>`],['Technology',`<dl class="sl tl">${R.feat.map(([t,p])=>`<div><dt>${t}</dt><dd>${p}</dd></div>`).join('')}</dl>`],['Delivery and returns',`<p>Free UK delivery on orders over £${K.STORE.freeOver}. Return unused items within 14 days.</p>`]].map(([t,b],k)=>`<details ${k===open?'open':''}><summary>${t}</summary><div class="ab">${b}</div></details>`).join('')}</div>`;
const usps=`<ul class="usp"><li>${ico.truck}<span>Free UK delivery over £${K.STORE.freeOver}</span></li><li>${ico.ret}<span>14-day returns</span></li><li>${ico.card}<span>Pay in 3 with Klarna</span></li></ul>`;
const thumbsV=`<div class="vt">${R.imgs.slice(0,6).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div>`;
const mainImg=`<div class="mi"><img id="m6" src="${R.imgs[0]}" alt="${name}"></div>`;
const gThumbs=`<div class="gx">${thumbsV}${mainImg}</div>`;
const gGrid=`<div class="gg">${R.imgs.slice(0,4).map((s,k)=>`<div class="mi"><img src="${s}" alt="${name}, photo ${k+1}" ${k?'loading="lazy"':''}></div>`).join('')}</div>`;
const also=`<div class="also"><p class="lab">More from Bullpadel</p><div class="row">${R.also.slice(0,4).map(a=>`<a href="#" title="${a.n}"><img src="${a.img}" alt="${a.n}"></a>`).join('')}</div></div>`;
FOLD[12]=()=>`<section class="r12 rx">${gThumbs}<div class="rc"><h1>${name}</h1><p class="sub">Advanced padel racket</p><p class="price">${gbp(R.p)}</p>${klarna}<button class="pill dark" data-atc>Add to bag</button><button class="pill">Favourite ${heart}</button><p class="lede">${R.lede}</p>${accs(-1)}</div></section>`;
FOLD[13]=()=>`<section class="r13 rx">${gGrid}<div class="rc"><p class="crumbline">Padel rackets · Bullpadel</p><h1 class="caps">${name}</h1><p class="price">${gbp(R.p)}</p>${klarna}${also}<button class="sqbtn" data-atc>Add to bag <span>→</span></button>${usps}${accs(0)}</div></section>`;
FOLD[14]=()=>`<section class="r14 rx">${gThumbs}<div class="rc"><p class="brand">${R.b}</p><h1>${name}</h1><div class="tags"><span>${R.key[0][1]}</span><span>${R.key[1][1]} balance</span><span>Advanced</span></div><div class="pbox"><div class="pp"><p class="price">${gbp(R.p)}</p><p class="stk">In stock</p></div>${klarna}${cta}</div>${usps}${accs(1)}</div></section>`;
FOLD[15]=()=>`<section class="r15 rx">${gGrid}<div class="rc"><div class="seg"><button class="on" data-pane="0">Overview</button><button data-pane="1">Specs</button><button data-pane="2">Delivery</button></div><div class="pane on" data-p="0"><h1>${name}</h1><p class="lede">${R.lede}</p></div><div class="pane" data-p="1"><dl class="sl">${R.specs.slice(2).map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div><div class="pane" data-p="2"><p class="lede">Free UK delivery on orders over £${K.STORE.freeOver}. Return unused items within 14 days. Pay in 3 with Klarna.</p></div><div class="buyrow"><p class="price">${gbp(R.p)}</p><button class="btn big" data-atc>Add to bag</button></div>${klarna}</div></section>`;
FOLD[16]=()=>`<section class="r16">${mainImg}<div class="rc c"><p class="brand">${R.b} · Martin Di Nenno</p><h1>${model}</h1><p class="lede">${R.best}.</p><p class="price">${gbp(R.p)}</p>${klarna}<button class="pill dark wide" data-atc>Add to bag</button><div class="thr">${R.imgs.slice(0,5).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div></div></section>`;
Object.assign(BELOW,{12:[band('brand image, full width'),rel],13:[band('player on court, full width',1),rel],14:[band('racket in action, full width'),rel],15:[band('Di Nenno campaign image, full width',1),rel],16:[about,band('brand campaign image, full width'),rel,faq]});


/* ===== 17-21: Classic family ===== */
const cTop=`<h1>${name}</h1><p class="sub">Advanced padel racket</p><p class="price">${gbp(R.p)}</p>${klarna}`;
const cBtn=`<button class="pill dark" data-atc>Add to bag</button>`;
const cLede=`<p class="lede">${R.lede}</p>`;
const tags=`<div class="ctags">${R.key.map(([a,b])=>`<span>${a}: <b>${b}</b></span>`).join('')}</div>`;
const thumbsH=`<div class="ht">${R.imgs.slice(0,6).map((s,k)=>`<button class="${k?'':'on'}" data-six="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div>`;
const arrows=`<div class="ar"><button data-sx="-1" aria-label="Previous photo">←</button><span id="sxc">1 / 6</span><button data-sx="1" aria-label="Next photo">→</button></div>`;
const swatch=`<div class="sw2"><p class="lab">More from Bullpadel</p><div class="row">${R.also.slice(0,4).map(a=>`<a href="#" title="${a.n}"><img src="${a.img}" alt="${a.n}"></a>`).join('')}</div></div>`;
FOLD[17]=()=>`<section class="cl cl17">${gThumbs}<div class="rc">${cTop}${cBtn}${cLede}${accs(-1)}</div></section>`;
FOLD[18]=()=>`<section class="cl cl18"><div class="gh">${mainImg}${thumbsH}</div><div class="rc">${cTop}${cBtn}${cLede}${accs(-1)}</div></section>`;
FOLD[19]=()=>`<section class="cl cl19"><div class="ga">${mainImg}${arrows}</div><div class="rc">${cTop}${tags}${cBtn}${accs(-1)}</div></section>`;
FOLD[20]=()=>`<section class="cl cl20">${gThumbs}<div class="rc">${cTop}${swatch}${cBtn}${usps}${accs(-1)}</div></section>`;
FOLD[21]=()=>`<section class="cl cl21">${gThumbs}<div class="rc">${cTop}${cBtn}${cLede}${tags}${accs(0)}</div></section>`;
Object.assign(BELOW,{17:[band('brand image, full width'),rel],18:[band('brand image, full width'),rel],19:[band('brand image, full width'),rel],20:[band('brand image, full width'),rel],21:[band('brand image, full width'),rel]});
let sx=0;
document.addEventListener('click',e=>{const t=e.target.closest('[data-sx]');if(!t)return;sx=(sx+ +t.dataset.sx+6)%6;$('#m6').src=R.imgs[sx];$('#sxc').textContent=`${sx+1} / 6`;});


/* ===== 22: More from Bullpadel, richer ===== */
const fam=[{n:name,img:R.imgs[0],p:R.p,me:1},...R.also.slice(0,4)];
FOLD[22]=()=>`<section class="cl cl22">${gThumbs}<div class="rc">
 <div class="topline"><a href="#" class="bl">${R.b}</a><span class="new">New 2026</span></div>
 <h1>${name}</h1><a class="rl22" href="#reviews">${st(5)} <b>4.7</b> <span>(24 reviews)</span></a><p class="sub">Advanced padel racket · Martin Di Nenno's own model</p>
 <div class="prow"><p class="price">${gbp(R.p)}</p><span class="instock">In stock</span></div>${klarna}
 <div class="tiles">${[['Shape','Diamond'],['Balance','High'],['Level','Advanced'],['Core','MultiEVA']].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
 <div class="fam"><div class="fh"><b>More from Bullpadel</b><a href="#">View all</a></div><div class="frow">${fam.map(a=>`<a href="#" class="${a.me?'me':''}" title="${a.n}"><img src="${a.img}" alt="${a.n}"></a>`).join('')}</div><p class="fn" id="fn">Selected: ${R.n}</p></div>
 <button class="go" data-atc>Add to bag · ${gbp(R.p)}</button>
 <ul class="u3"><li>${ico.truck}<span><b>Free delivery</b>UK orders over £${K.STORE.freeOver}</span></li><li>${ico.ret}<span><b>14-day returns</b>On unused items</span></li><li>${ico.card}<span><b>Klarna</b>Pay in 3, interest free</span></li></ul>
 <div class="feel"><p class="fh2">How it plays</p><p>${R.plays}</p><dl>${R.pf.map(([t,v])=>`<div><dt>${t==='Manoeuvrability'?'Handling':t}</dt><dd>${word(v)}</dd></div>`).join('')}</dl></div>
 ${accs(-1).replace(/<details ><summary>How it plays<\/summary>.*?<\/details>/s,'')}</div></section>`;
const why=`<section class="why22 wrap"><p class="k">Why the ${model}</p><h2>Built for players who finish points</h2><div class="w4">${R.feat.map(([t,p])=>`<div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>`;
BELOW[22]=[band('brand image, full width'),why,rel,faq];


/* reviews (design samples, replaced by live product reviews in Shopify) */
const RV=[[5,'Proper power on the smash','Moved up from a Vertex and the extra pace on overheads is obvious straight away. Needs a full swing but rewards it.','James T.','Plays 3x a week','Advanced'],[5,'Feels solid and well made','Heavy in the head but stable on volleys. Grip is comfortable and the finish looks great.','Sofia R.','Club league','Advanced'],[4,'Great racket, takes time to adjust','Brilliant for attacking. Defending off the back glass took a few sessions to get used to.','Dan M.','Plays weekly','Intermediate']];
const reviews=`<section class="rv22 wrap" id="reviews"><div class="rvh"><div><p class="k">Reviews</p><h2>What players say</h2></div><button class="rvw">Write a review</button></div>
 <div class="rvg"><div class="rvs"><b>4.7</b>${st(5)}<p>Based on 24 reviews</p>${[[5,79],[4,17],[3,4],[2,0],[1,0]].map(([s,p])=>`<div class="rvhr"><span>${s}★</span><i><b style="width:${p}%"></b></i><span>${p}%</span></div>`).join('')}</div>
 <div class="rvl">${RV.map(([n,h,p,who,how,lv])=>`<div class="rvi"><div class="rvtop">${st(n)}<span class="rvver">Verified buyer</span></div><h3>${h}</h3><p>${p}</p><p class="rvwho"><b>${who}</b> · ${how} · ${lv}</p></div>`).join('')}<p class="rvsmp">Sample reviews for the design. Live product reviews show here once the store is running.</p></div></div></section>`;
BELOW[22]=[band('brand image, full width'),why,reviews,rel,faq];

/* ===== 23: wide layout, add-ons in the buy box ===== */
const kcat=n=>/bag/i.test(n)?'Bag':/grip/i.test(n)?'Grip':/ball/i.test(n)?'Balls':/protect|guard/i.test(n)?'Protector':'Extra';
const ksplit=n=>{const m=n.match(/^(.*?)(?:,\s*([^,]+))?$/);return [m[1].replace(/^Bullpadel /,''),m[2]||''];};
const plus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12M6 12h12"/></svg>';
const tick='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const kit23=`<div class="k23"><div class="k23h"><b>Add to your racket</b><span>Tap to add to your order.</span></div><div class="k23g">${R.kit.map((a,i)=>{const [t,v]=ksplit(a.n);return `<button class="k23i" data-k="${i}" data-p="${a.p}" aria-pressed="false"><span class="k23im"><img src="${a.img}" alt=""></span><span class="k23t"><small>${kcat(a.n)}</small><b>${t} <em>${v}</em></b><span>${gbp(a.p)}</span></span><span class="k23b">${plus}${tick}</span></button>`}).join('')}</div><a href="#" class="k23l">Want more choice? Shop all accessories</a></div>`;
const help23=`<a class="h23" href="mailto:${K.STORE.email||'hello@raqello.com'}"><span class="h23a"><i></i><i></i></span><span class="h23t"><b>Need help choosing?</b>Honest advice on rackets and sizing</span><span class="h23l">Message us <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></span></a>`;
const pts23=[['Diamond shape','high balance for maximum leverage on the smash'],['X-Tend Carbon 12K','a reactive, elastic face with plenty of pace'],["Di Nenno's racket",'the 2026 Xplo, built for attacking players']];
FOLD[23]=()=>`<nav class="bc23 w23"><a href="#">Home</a><span>/</span><a href="#">Padel rackets</a><span>/</span><a href="#">Advanced</a><span>/</span><b>${name}</b></nav>
<section class="cl cl22 cl23 w23">${gThumbs}<div class="ms23"><div class="ms23s" id="ms23">${R.imgs.slice(0,8).map((src,k)=>`<div><img src="${src}" alt="${name}, photo ${k+1}" ${k?'loading="lazy"':''}></div>`).join('')}</div><div class="mt23">${R.imgs.slice(0,8).map((src,k)=>`<button class="${k?'':'on'}" data-mt="${k}" aria-label="Photo ${k+1}"><img src="${src}" alt=""></button>`).join('')}</div><div class="sb23" aria-hidden="true"><i style="width:${100/Math.min(8,R.imgs.length)}%"></i></div></div><div class="rc">
 <p class="lv23">Advanced · ${R.b}</p>
 <h1>${name}</h1><a class="rl22" href="#reviews">${st(5)} <b>4.7</b> <span>(24 reviews)</span></a>
 <div class="pr23"><p class="price">${gbp(R.p)}</p></div>${klarna}
 <ul class="pt23">${pts23.map(([a,b])=>`<li>${tick}<span><b>${a}</b> ${b}</span></li>`).join('')}</ul>
 <div class="fam"><div class="fh"><b>More from ${R.b}</b><a href="#">View all</a></div><div class="frow">${fam.map(a=>`<a href="#" class="${a.me?'me':''}" title="${a.n}"><img src="${a.img}" alt="${a.n}"></a>`).join('')}</div><p class="fn" id="fn">Selected: ${R.n}</p></div>
 <div class="buy23"><div class="q23"><button data-q="-1" aria-label="Decrease quantity">−</button><span id="q23">1</span><button data-q="1" aria-label="Increase quantity">+</button></div><button class="go" data-atc id="go23">Add to bag · ${gbp(R.p)}</button></div>
 ${kit23}${help23}
 <ul class="d23">${[[ico.truck,'Free UK delivery',`On orders over £${K.STORE.freeOver}`],[ico.card,'Klarna','Pay in 3, interest free'],[ico.ret,'14-day returns','On unused items']].map(([i,a,b])=>`<li>${i}<span><b>${a}</b>${b}</span></li>`).join('')}</ul>
</div></section>`;
const band23=`<section class="bs23"><div class="bs23i" role="img" aria-label="${R.b} brand image"><span class="bn">Brand image: brand collection metafield custom.brand_banner</span></div><div class="bs23t w23"><div><p class="bs23b">${R.b}</p><p class="bs23l">Pro-level padel from Spain</p></div><a href="#" class="bs23c">Shop ${R.b}</a></div></section>`;
const ov23=`<section class="ov23 w23"><div><p class="k">Overview</p><h2>About the ${model}</h2>${R.desc}</div><dl>${R.specs.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></section>`;
const tech23=`<section class="tc23 w23"><p class="k">The tech, explained</p><h2>What makes it hit</h2><div>${R.feat.map(([t,p,img])=>`<div><span><img src="${img}" alt="" loading="lazy"></span><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>`;
BELOW[23]=[ov23,band23,tech23,reviews,rel,faq];
document.addEventListener('scroll',e=>{const m=e.target;if(m.id!=='ms23')return;const t=m.parentNode.querySelector('.sb23 i'),max=m.scrollWidth-m.clientWidth,k=Math.round(m.scrollLeft/m.clientWidth);m.parentNode.querySelectorAll('[data-mt]').forEach((b,j)=>b.classList.toggle('on',j===k));t.style.transform=`translateX(${max?(m.scrollLeft/max)*(100/parseFloat(t.style.width)-1)*100:0}%)`;},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-mt]');if(!b)return;const m=$('#ms23');m.scrollTo({left:m.clientWidth*+b.dataset.mt,behavior:'smooth'});});
let q23=1;const tot23=()=>{const ex=$$('.k23i[aria-pressed="true"]').reduce((a,b)=>a+ +b.dataset.p,0);const g=$('#go23');if(g)g.textContent=`Add to bag · ${gbp(Math.round((R.p*q23+ex)*100)/100)}`;};
document.addEventListener('click',e=>{const k=e.target.closest('.k23i');if(k){k.setAttribute('aria-pressed',k.getAttribute('aria-pressed')==='true'?'false':'true');tot23();return;}
 const q=e.target.closest('[data-q]');if(q){q23=Math.max(1,q23+ +q.dataset.q);$('#q23').textContent=q23;tot23();}},true);

function ktot(){const t=R.p+$$('.kit input:checked').reduce((a,i)=>a+ +i.dataset.p,0);const e=$('#ktot');if(e)e.textContent=gbp(t);}
function render(){
 const root=$('#pdp-root');root.className=`p2 L${C.layout}`;
 root.innerHTML=FOLD[C.layout]()+BELOW[C.layout].join('');
 const hb=()=>{const hh=$('.hdr');if(hh)root.style.setProperty('--hdrh',Math.round(hh.getBoundingClientRect().height)+'px');const h=$('.hdr');root.style.setProperty('--hh',Math.max(0,Math.round(h?h.getBoundingClientRect().bottom+scrollY:120))+'px');};hb();addEventListener('resize',hb);
 ktot();
 $$('.swipe').forEach(s=>s.addEventListener('scroll',()=>{const k=Math.round(s.scrollLeft/s.clientWidth);$$(`.dots[data-for="${s.id}"] i`).forEach((d,j)=>d.classList.toggle('on',j===k));$$(`.thumbs [data-to="${s.id}"]`).forEach((b,j)=>b.classList.toggle('on',j===k));},{passive:true}));
}
let idx=0;
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.six!==undefined){$('#m6').src=R.imgs[+t.dataset.six];$$('[data-six]').forEach(b=>b.classList.toggle('on',b===t));return;}
 if(t.dataset.to){const s=$('#'+t.dataset.to);s.scrollTo({left:s.clientWidth*+t.dataset.i,behavior:'smooth'});return;}
 if(t.dataset.step){idx=(idx+ +t.dataset.step+shots.length)%shots.length;$('.stage .ph img').src=shots[idx];$('.stage .ctr').textContent=`${idx+1} / ${shots.length}`;return;}
 if(t.dataset.pane!==undefined){$$('.seg button').forEach(b=>b.classList.toggle('on',b===t));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.p===t.dataset.pane));return;}
 if(t.dataset.atc!==undefined){if(t.id==='go23'){t.textContent='Added to bag';setTimeout(tot23,1400);return;}const o=t.textContent;t.textContent='Added to bag';setTimeout(()=>t.textContent=o,1400);return;}
 if(t.classList.contains('wish')){t.classList.toggle('on');return;}
});
document.addEventListener('change',e=>{if(e.target.closest('.kit'))ktot();});
document.addEventListener('mouseover',e=>{const a=e.target.closest('.frow a');const f=$('#fn');if(a&&f)f.textContent=(a.classList.contains('me')?'Selected: ':'')+a.title;});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
