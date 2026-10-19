/* Raqello product page with real product data. Same markup and classes as pdp.js, so pdp.css styles it.
   Reads window.PDPCFG (layout) and window.PRODUCT (real data). Needs classic.js first. */
(()=>{
const C=window.PDPCFG,R=window.PRODUCT,K=window.PADEL;const {add,gbp}=K;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ARW=K.ARW||'→';
const money=n=>'£'+(Math.floor(n*100)/100).toFixed(2);
const S={qty:1,img:0,wish:false};
const name=`${R.b} ${R.n}`;
const fake={i:0,b:R.b,n:R.n,p:R.p};

/* gallery */
const shots=R.imgs;
const sq=(src,k,badge)=>`<div class="sq zoom">${k===0&&badge?badge:''}<img src="${src}" alt="${name}, photo ${k+1}" ${k?'loading="lazy"':''}></div>`;
const badge=`<span class="badge">New season</span>`;
function gallery(){const g=C.gallery;
 if(g==='grid')return `<div style="min-width:0"><div class="gal g2" id="gal">${shots.slice(0,4).map((s,k)=>sq(s,k,badge)).join('')}</div><div class="gal"><div class="dots" id="dots">${shots.slice(0,4).map((s,k)=>`<i class="${k?'':'on'}"></i>`).join('')}</div></div></div>`;
 const thumbs=`<div class="tl">${shots.map((s,k)=>`<button class="${k?'':'on'}" data-img="${k}" aria-label="Photo ${k+1}"><img src="${s}" alt=""></button>`).join('')}</div>`;
 const main=`<div class="main"><div id="mainimg">${sq(shots[0],0,badge)}</div><div class="nav2"><button data-step="-1" aria-label="Previous photo">←</button><button data-step="1" aria-label="Next photo">→</button></div></div>`;
 if(g==='single')return `<div class="gal single"><div class="main"><div id="mainimg">${sq(shots[0],0,badge)}</div><div class="nav2"><button data-step="-1" aria-label="Previous photo">←</button><button data-step="1" aria-label="Next photo">→</button></div><span class="ctr" id="ctr">1 / ${shots.length}</span></div><div class="pbar"><i id="pbar" style="width:${100/shots.length}%"></i></div></div>`;
 if(g==='thumbs')return `<div class="gal thumbs">${thumbs}${main}</div>`;
 return `<div class="gal row">${main}${thumbs}</div>`;}

/* shared parts */
const word=v=>v>=9?'Very high':v>=7?'High':v>=5?'Medium':'Low';
const LV=['Beginner','Intermediate','Advanced'];
const lvlScale=`<div class="hp-lv"><div class="ln">${LV.map(l=>`<span class="${l==='Advanced'?'on':''}"><i></i>${l}</span>`).join('')}</div></div>`;
const bars=(lab)=>`<div class="hp-bars">${R.pf.map(([t,v])=>`<div><div class="lb"><span>${t}</span><span class="mute">${lab==='num'?v+'/10':word(v)}</span></div><div class="ln"><i style="width:${v*10}%"></i></div></div>`).join('')}</div>`;
const specDL=()=>`<dl class="kdl">${R.key.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`;
const chips=`<div class="chips2">${R.key.slice(0,3).map(([a,b])=>`<span>${a} <b>${b}</b></span>`).join('')}</div>`;
const klarna=`<div class="kl2"><img src="media/klarna-badge.png" alt="Klarna"><span>3 interest free payments of <b>${money(R.p/3)}</b>. <a href="#" style="text-decoration:underline">Learn more</a></span></div>`;
const heart='<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.8c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.4 0 5.2 3.5 3.6 6.6C19 15.6 12 20 12 20z" fill="none" stroke="#111" stroke-width="1.8"/></svg>';
const truck='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>';
const ret='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/></svg>';
const atc=`<div class="atc"><div class="qty2"><button data-qd="-1" aria-label="Less">−</button><span id="qty">1</span><button data-qd="1" aria-label="More">+</button></div><button class="btn big" id="atc">Add to bag</button><button class="wish" id="wish" aria-label="Save to wishlist">${heart}</button></div>`;
const perks=`<ul class="perks"><li><span class="dot"></span><span><b>In stock</b></span></li><li>${truck}<span><b>Free UK delivery</b> on this order</span></li><li>${ret}<span><b>14-day returns</b> on unused items</span></li></ul>`;
const head=`<div class="bl"><a href="#">${R.b}</a><span class="mute">Padel rackets</span></div><h1>${name}</h1>`;
const price=`<div class="pr2"><b>${gbp(R.p)}</b></div>`;

function buy(){return `<div class="buy" id="buy">${head}${price}${klarna}
 ${C.facts?`<div class="kf"><div class="kfh"><b>Key specs</b><a href="#specs">All specifications</a></div><dl>${R.key.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div>`:chips}
 ${C.lvl?`<div class="lvlm"><div style="display:flex;justify-content:space-between;font-size:14px"><b>Who it is for</b><span class="mute">Advanced players</span></div><div class="tr">${[1,2,3].map(()=>'<i class="on"></i>').join('')}</div><div class="lb">${LV.map(l=>`<span class="${l==='Advanced'?'on':''}">${l}</span>`).join('')}</div></div>`:''}
 ${atc}
 <div class="stock"><div><span class="dot"></span><b>In stock</b></div><div>${truck}<span><b>Free UK delivery</b> on this order</span></div><div>${ret}<span><b>14-day returns</b> on unused items</span></div></div>
 ${C.inlineBundle?bundle():''}
 <p class="helpl">Not sure it is right for you? <a href="#">Read our racket guide</a></p></div>`;}

function howPlays(st){
 if(st==='tabs2')return `<div class="hp hp-t"><div class="tl2"><button class="on" data-bt="0">How it plays</button><button data-bt="1">Key specs</button><button data-bt="2">Who it is for</button></div><div class="btp on" data-btp="0"><p class="hp-s">${R.plays}</p>${bars()}</div><div class="btp" data-btp="1">${specDL()}<a class="ul allsp" href="#specs">All specifications</a></div><div class="btp" data-btp="2">${lvlScale}<p class="hp-s">${R.best}. If you are newer to padel, a round racket with a lower balance is easier to control.</p></div></div>`;
 const h=`<div class="hp-h"><b>How it plays</b><p>${R.plays}</p></div>`;
 if(st==='row4')return `<div class="hp">${h}<div class="hp-r4">${R.pf.map(([t,v])=>`<div><b>${v}<small>/10</small></b><span>${t==='Manoeuvrability'?'Handling':t}</span><div class="ln"><i style="width:${v*10}%"></i></div></div>`).join('')}</div></div>`;
 if(st==='words')return `<div class="hp">${h}${lvlScale}<p class="hp-w">Best for <b>${R.best.toLowerCase()}</b>.</p></div>`;
 return `<div class="hp">${h}${bars()}</div>`;}
function buyFlow(){return `<div class="buy flow" id="buy">${head}
 <p class="lede">${R.lede} <a href="#desc">Read more</a></p>${price}${klarna}
 <p class="best"><span class="mute">Best for</span> ${R.best}</p>
 ${howPlays(C.hp)}${C.hp==='tabs2'?'':`<details class="kft"><summary>Key specs</summary>${specDL()}<a class="ul allsp" href="#specs">All specifications</a></details>`}
 ${atc}${perks}
 <p class="helpl">Not sure it is right for you? <a href="#">Read our racket guide</a></p></div>`;}

/* bundle */
function bundle(){return `<div class="bund" id="bund"><h3>Complete the set</h3><p class="mute" style="font-size:14px">Picked to go with the ${R.n.split(' ').slice(0,2).join(' ')}.</p>
 <div class="bi"><input type="checkbox" checked disabled aria-label="This item"><div class="th"><img src="${shots[0]}" alt=""></div><span><b>This item:</b> ${name}</span><b>${gbp(R.p)}</b></div>
 ${R.kit.map(a=>`<label class="bi"><input type="checkbox" ${a.on?'checked':''} data-bun="${a.i}" data-p="${a.p}"><div class="th"><img src="${a.img}" alt=""></div><span>${a.n}</span><b>${gbp(a.p)}</b></label>`).join('')}
 <div class="bt"><span>Total <b id="btot"></b></span><button class="btn" data-bunadd>Add selected to bag</button></div></div>`;}
function btot(){const t=R.p+$$('[data-bun]').filter(i=>i.checked).reduce((a,i)=>a+ +i.dataset.p,0);const e=$('#btot');if(e)e.textContent=gbp(t);}

/* details */
const delTxt=`<p>Free UK delivery on orders over £${K.STORE.freeOver}. Delivery options and prices are shown at checkout.</p><p>Return unused items within 14 days. <a href="#" style="text-decoration:underline">Read the returns policy</a>.</p>`;
function details(mode){const D=[['Description',`<div class="desc"><div>${R.desc}</div><ul>${R.bul.map(b=>`<li>${b}</li>`).join('')}</ul></div>`],
 ['How it plays',`<div class="hpx"><p class="hp-s">${R.plays}</p>${bars('num')}</div>`],
 ['Specifications',`<div class="spec2" id="specs">${R.specs.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>`],['Delivery and returns',delTxt]];
 if(mode==='acc')return `<section class="psec"><div class="acc2">${D.map(([t,b],k)=>`<details ${k?'':'open'}><summary>${t}</summary><div class="in2">${b}</div></details>`).join('')}</div></section>`;
 return `<section class="psec"><div class="ptabs">${D.map(([t],k)=>`<button class="${k?'':'on'}" data-tabp="${k}">${t}</button>`).join('')}</div>${D.map(([t,b],k)=>`<div class="pane ${k?'':'on'}" data-pane="${k}"><h3 class="mh" style="font-family:var(--head);font-size:20px;margin:18px 0 12px">${t}</h3>${b}</div>`).join('')}</section>`;}

/* related, in the store's card style */
const rcard=a=>`<a class="card" href="#"><div class="im"><img src="${a.img}" alt="${a.n}" loading="lazy"><button class="add" data-radd>Add to bag</button></div><div class="meta"><div class="br">${a.n.split(' ')[0]}</div><div>${a.n.split(' ').slice(1).join(' ')}</div><div class="pr">${gbp(a.p)}</div>${a.sh?`<div class="sp">${a.lv} · ${a.sh}</div>`:''}</div></a>`;
const alsoLike=()=>`<section class="psec"><div class="sh"><div class="shl"><h2 style="margin:0">You may also like</h2><p>More advanced rackets from Bullpadel.</p></div><a class="shbtn" href="#">Shop all ${ARW}</a></div><div class="grid">${R.also.map(rcard).join('')}</div></section>`;
function compare(){const xs=[{n:name,p:R.p,img:shots[0],sh:'Diamond',pw:R.pf[0][1],ct:R.pf[1][1],me:1},...R.also.slice(0,2)];const row=(h,f)=>`<tr><th>${h}</th>${xs.map((p,k)=>`<td class="${k?'':'me'}">${f(p)}</td>`).join('')}</tr>`;
 return `<section class="psec"><h2>Compare similar rackets</h2><div class="ctab"><table>${row('',p=>`<div class="cimg"><img src="${p.img}" alt=""></div>`)}${row('Racket',p=>`<b>${p.n}</b>${p.me?'<br><span class="mute" style="font-size:12px">This racket</span>':''}`)}${row('Price',p=>gbp(p.p))}${row('Shape',p=>p.sh)}${row('Power',p=>p.pw+'/10')}${row('Control',p=>p.ct+'/10')}${row('',p=>p.me?'<span class="mute">Viewing</span>':`<button class="btn ol" data-radd>Add to bag</button>`)}</table></div></section>`;}
const feats=()=>`<section class="feat2"><div class="wrap"><h2>What makes it different</h2><div class="fg3">${R.feat.map(([t,p,src])=>`<div class="fi"><div class="ph"><img src="${src}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></div></section>`;
const fband=()=>`<section class="fband"><div class="wrap"><div class="ph"><img src="${R.feat[1][2]}" alt="" style="object-fit:cover"><h2>What makes it different</h2></div><div class="f4">${R.feat.map(([t,p])=>`<div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></div></section>`;
const flist=()=>`<section class="psec flist"><div class="ph"><img src="${R.feat[0][2]}" alt="" style="object-fit:cover"></div><div><h2>Why players choose it</h2>${R.feat.map(([t,p])=>`<div class="fl"><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>`;
const story=()=>`<section class="psec">${R.feat.map(([t,p,src],k)=>`<div class="story ${k%2?'flip':''}"><div class="ph"><img src="${src}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</section>`;
const brandBlock=()=>`<section class="psec"><div class="bblock"><div class="blogo">Bullpadel</div><p><b>About Bullpadel.</b> A Spanish padel brand and the racket of choice for Martin Di Nenno, Paquito Navarro and Fede Chingotto.</p><a class="shbtn" href="#">Shop Bullpadel ${ARW}</a></div></section>`;
const faq=()=>`<section class="psec"><h2>Questions about this racket</h2><div class="faq">${[['Is it right for my level?','It is built for advanced players with a fast, full swing. If you are newer to padel, a round racket with a lower balance is easier to control.'],['What is Custom Weight?','A system that lets you add 3, 6 or 9 g to the racket to fine-tune the balance and feel.'],['How much is delivery?',`Free UK delivery on orders over £${K.STORE.freeOver}. Other options are shown at checkout.`],['Can I pay with Klarna?',`Yes. Choose Klarna at checkout to pay in 3 interest free payments of ${money(R.p/3)}.`]].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;

function render(){
 const B={fband,flist,details:()=>details(C.details||'tabs'),also:alsoLike,compare,features:feats,story,brand:brandBlock,faq,bundle:()=>`<section class="psec">${bundle()}</section>`};
 $('#pdp-root').classList.toggle('fin',true);
 $('#pdp-root').innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#">Home</a><span>/</span><a href="#">Padel rackets</a><span>/</span><a href="#">Bullpadel</a><span>/</span><span>${R.n}</span></nav>
 <div class="pdp ${C.hp?'flow':''}">${gallery()}${C.hp?buyFlow():buy()}</div></div>
 ${C.blocks.map((b,k)=>{let h=B[b]();if(!k)h=h.replace('class="psec"','class="psec first" id="desc"');return b==='features'||b==='fband'?h:`<div class="wrap">${h}</div>`;}).join('')}
 <div class="sbar" id="sbar"><div class="wrap"><div class="th"><img src="${shots[0]}" alt=""></div><div class="nm"><b>${name}</b><span>${gbp(R.p)}</span></div><span class="pr3">${gbp(R.p)}</span><button class="btn" data-sbadd>Add to bag</button></div></div>`;
 btot();
 const sb=$('#sbar'),at=$('#atc');if(sb){const chk=()=>sb.classList.toggle('on',at.getBoundingClientRect().bottom<0);addEventListener('scroll',chk,{passive:true});chk();}
 const gal=$('#gal');if(gal)gal.addEventListener('scroll',()=>{const k=Math.round(gal.scrollLeft/gal.clientWidth);$$('#dots i').forEach((d,j)=>d.classList.toggle('on',j===k));},{passive:true});
}
function setImg(k){S.img=(k+shots.length)%shots.length;$('#mainimg').innerHTML=sq(shots[S.img],S.img,badge);$$('.tl button').forEach((b,j)=>b.classList.toggle('on',j===S.img));const c=$('#ctr');if(c){c.textContent=`${S.img+1} / ${shots.length}`;$('#pbar').style.width=`${(S.img+1)/shots.length*100}%`;}}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.img!==undefined){setImg(+t.dataset.img);return;}
 if(t.dataset.step){setImg(S.img+ +t.dataset.step);return;}
 if(t.dataset.qd){S.qty=Math.max(1,S.qty+ +t.dataset.qd);$('#qty').textContent=S.qty;return;}
 if(t.id==='atc'||t.dataset.sbadd!==undefined||t.dataset.bunadd!==undefined||t.dataset.radd!==undefined){e.preventDefault();const o=t.textContent;t.textContent='Added';setTimeout(()=>t.textContent=o,1400);return;}
 if(t.id==='wish'){S.wish=!S.wish;t.classList.toggle('on',S.wish);return;}
 if(t.dataset.bt!==undefined){$$('.tl2 button').forEach(b=>b.classList.toggle('on',b===t));$$('.btp').forEach(p=>p.classList.toggle('on',p.dataset.btp===t.dataset.bt));return;}
 if(t.dataset.tabp!==undefined){$$('.ptabs button').forEach(b=>b.classList.toggle('on',b===t));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.pane===t.dataset.tabp));return;}
});
document.addEventListener('change',e=>{if(e.target.dataset.bun)btot();});
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#specs"]');if(!a)return;const sp=$('#specs'),pn=sp&&sp.closest('.pane');const b=pn&&$(`[data-tabp="${pn.dataset.pane}"]`);if(b)b.click();});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
