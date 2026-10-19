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
const BELOW={1:[about,tech,kit,rel,faq],2:[tech,about,rel,kit,faq],3:[about,kit,tech,rel,faq],4:[about,tech,kit,rel,faq],5:[tech,kit,about,rel,faq]};

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
 if(t.dataset.to){const s=$('#'+t.dataset.to);s.scrollTo({left:s.clientWidth*+t.dataset.i,behavior:'smooth'});return;}
 if(t.dataset.step){idx=(idx+ +t.dataset.step+shots.length)%shots.length;$('.stage .ph img').src=shots[idx];$('.stage .ctr').textContent=`${idx+1} / ${shots.length}`;return;}
 if(t.dataset.pane!==undefined){$$('.seg button').forEach(b=>b.classList.toggle('on',b===t));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.p===t.dataset.pane));return;}
 if(t.dataset.atc!==undefined){const o=t.textContent;t.textContent='Added to bag';setTimeout(()=>t.textContent=o,1400);return;}
 if(t.classList.contains('wish')){t.classList.toggle('on');return;}
});
document.addEventListener('change',e=>{if(e.target.closest('.kit'))ktot();});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
