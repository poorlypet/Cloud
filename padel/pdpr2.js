/* Raqello product page v2. window.PDPCFG.layout = 1..5, window.PRODUCT = real data. Needs classic.js first. */
(()=>{
const C=window.PDPCFG,R=window.PRODUCT,K=window.PADEL,gbp=K.gbp;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
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

function ktot(){const t=R.p+$$('.kit input:checked').reduce((a,i)=>a+ +i.dataset.p,0);const e=$('#ktot');if(e)e.textContent=gbp(t);}
function render(){
 const root=$('#pdp-root');root.className=`p2 L${C.layout}`;
 root.innerHTML=FOLD[C.layout]()+BELOW[C.layout].join('');
 const hb=()=>{const h=$('.hdr');root.style.setProperty('--hh',Math.max(0,Math.round(h?h.getBoundingClientRect().bottom+scrollY:120))+'px');};hb();addEventListener('resize',hb);
 ktot();
 $$('.swipe').forEach(s=>s.addEventListener('scroll',()=>{const k=Math.round(s.scrollLeft/s.clientWidth);$$(`.dots[data-for="${s.id}"] i`).forEach((d,j)=>d.classList.toggle('on',j===k));$$(`.thumbs [data-to="${s.id}"]`).forEach((b,j)=>b.classList.toggle('on',j===k));},{passive:true}));
}
let idx=0;
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.six!==undefined){$('#m6').src=R.imgs[+t.dataset.six];$$('[data-six]').forEach(b=>b.classList.toggle('on',b===t));return;}
 if(t.dataset.to){const s=$('#'+t.dataset.to);s.scrollTo({left:s.clientWidth*+t.dataset.i,behavior:'smooth'});return;}
 if(t.dataset.step){idx=(idx+ +t.dataset.step+shots.length)%shots.length;$('.stage .ph img').src=shots[idx];$('.stage .ctr').textContent=`${idx+1} / ${shots.length}`;return;}
 if(t.dataset.pane!==undefined){$$('.seg button').forEach(b=>b.classList.toggle('on',b===t));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.p===t.dataset.pane));return;}
 if(t.dataset.atc!==undefined){const o=t.textContent;t.textContent='Added to bag';setTimeout(()=>t.textContent=o,1400);return;}
 if(t.classList.contains('wish')){t.classList.toggle('on');return;}
});
document.addEventListener('change',e=>{if(e.target.closest('.kit'))ktot();});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
