/* PADEL product page. Reads window.PDPCFG, renders into #pdp-root. Needs classic.js first. */
(()=>{
const C=window.PDPCFG,K=window.PADEL;const {P,card,stars,IMG,LVL,gbp,hasImg,add}=K;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const x=P.find(p=>p.n===C.name);const shoe=x.c==='shoe';
const rating=(4.5+((x.i*7)%5)/10).toFixed(1),revs=12+(x.i*37)%180;
const ARW=K.ARW||'→';
const money=n=>'£'+n.toFixed(2);
const S={qty:1,size:null,col:0,img:0,wish:false};

/* gallery */
const shots=shoe?[['ph','Photo: shoe, side profile'],['ph','Photo: sole, herringbone pattern'],['ph','Photo: shoe on court, on foot'],['ph','Photo: heel and upper detail'],['ph2','Photo: lifestyle, player in shoes']]
 :[['img',''],['img rot1',''],['ph','Photo: carbon face, close up'],['img rot2',''],['ph2','Photo: lifestyle, racket in play']];
const sq=([t,n],k,badge)=>`<div class="sq ${t.includes('img')?t.replace('img','zoom'):t==='ph2'?'ph2':''}">${k===0&&badge?badge:''}${t.includes('img')?`<img src="${IMG}" alt="${x.b} ${x.n}, view ${k+1}">`:`<span class="note">${n}</span>`}</div>`;
const badge=x.w?`<span class="badge">Save £${x.w-x.p}</span>`:x.nw?`<span class="badge">New season</span>`:'';
function gallery(){const g=C.gallery;
 if(g==='grid')return `<div style="min-width:0"><div class="gal g2" id="gal">${shots.slice(0,4).map((s,k)=>sq(s,k,badge)).join('')}</div><div class="gal"><div class="dots" id="dots">${shots.slice(0,4).map((s,k)=>`<i class="${k?'':'on'}"></i>`).join('')}</div></div></div>`;
 const thumbs=`<div class="tl">${shots.map((s,k)=>`<button class="${k?'':'on'}" data-img="${k}" aria-label="Image ${k+1}">${s[0].includes('img')?`<img src="${IMG}" alt="">`:''}</button>`).join('')}</div>`;
 const main=`<div class="main"><div id="mainimg">${sq(shots[0],0,badge)}</div><div class="nav2"><button data-step="-1" aria-label="Previous image">←</button><button data-step="1" aria-label="Next image">→</button></div></div>`;
 if(g==='thumbs')return `<div class="gal thumbs">${thumbs}${main}</div>`;
 return `<div class="gal row">${main}${thumbs}</div>`;}

/* buy box parts */
const lvlMeter=x.l?`<div class="lvlm"><div style="display:flex;justify-content:space-between;font-size:14px"><b>Who it is for</b><span class="mute">${LVL[x.l]} players</span></div><div class="tr">${[1,2,3].map(l=>`<i class="${l<=x.l?'on':''}"></i>`).join('')}</div><div class="lb">${[1,2,3].map(l=>`<span class="${l===x.l?'on':''}">${LVL[l]}</span>`).join('')}</div></div>`:'';
const perf={1:[2,5,5],2:[4,4,3],3:[5,3,2]}[x.l]||[3,3,3];
const meters=`<div class="meters">${[['Power',perf[0]],['Control',perf[1]],['Comfort',perf[2]]].map(([t,v])=>`<div><span>${t}</span><span class="m">${[1,2,3,4,5].map(i=>`<i class="${i<=v?'on':''}"></i>`).join('')}</span></div>`).join('')}<div><span>Sweet spot</span><span class="m">${[1,2,3,4,5].map(i=>`<i class="${i<=(6-x.l-(x.l===1?0:1))?'on':''}"></i>`).join('')}</span></div></div>`;
const weight={1:'340 to 355g',2:'355 to 365g',3:'360 to 375g'}[x.l]||'';
const chips=shoe?`<div class="chips2"><span>Sole <b>${x.sh}</b></span><span>Court <b>Artificial grass</b></span></div>`:`<div class="chips2"><span>Level <b>${LVL[x.l]}</b></span><span>Shape <b>${x.sh}</b></span><span>Weight <b>${weight}</b></span></div>`;
const SIZES=['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12'];const OOS=['6','11.5'],LOW=['10.5'];
const shoeOpts=shoe?`<div class="opt"><h4><span>Colour: <b id="coln">White and black</b></span></h4><div class="sw">${[['#F2F2F2','White and black'],['#1E1E1E','Black'],['#2E5BB8','Court blue']].map(([c,n],k)=>`<button class="${k?'':'on'}" data-col="${k}" data-n="${n}" aria-label="${n}"><i style="background:${c}"></i></button>`).join('')}</div></div>
 <div class="opt"><h4><span>Size (UK): <b id="sizen">Select a size</b></span><a href="#" data-sg>Size guide</a></h4><div class="sizes">${SIZES.map(z=>`<button data-size="${z}" ${OOS.includes(z)?'disabled':''}>${z}${LOW.includes(z)?'<span class="lo"></span>':''}</button>`).join('')}</div><p style="font-size:12px;color:var(--mute);margin-top:8px">Orange line means low stock.</p></div>
 <div class="fit"><b>Fit from customer reviews</b><div class="tr"><i style="left:46%"></i></div><div class="lb"><span>Runs small</span><span>True to size</span><span>Runs large</span></div></div>`:'';
const freeDel=x.p>=K.STORE.freeOver;
const heart='<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.8c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.4 0 5.2 3.5 3.6 6.6C19 15.6 12 20 12 20z" fill="none" stroke="#111" stroke-width="1.8"/></svg>';
const truck='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>';
const shield='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/></svg>';
function buy(){return `<div class="buy" id="buy">
 <div class="bl"><a href="#">${x.b}</a><span class="mute">${shoe?'Padel shoes':'Padel rackets'}</span></div>
 <h1>${x.b} ${x.n}</h1>
 <div class="rl">${stars('s')}<b>${rating}</b><a href="#reviews">${revs} reviews</a></div>
 <div class="pr2"><b>${gbp(x.p)}</b>${x.w?`<s>${gbp(x.w)}</s><span class="sv">Save £${x.w-x.p}</span>`:''}</div>
 <div class="kl2"><img src="media/klarna-badge.png" alt="Klarna"><span>3 interest free payments of <b>${money(x.p/3)}</b>. <a href="#" style="text-decoration:underline">Learn more</a></span></div>
 ${chips}${C.meters?meters:lvlMeter}${shoeOpts}
 <div class="atc"><div class="qty2"><button data-qd="-1" aria-label="Less">−</button><span id="qty">1</span><button data-qd="1" aria-label="More">+</button></div><button class="btn big" id="atc" ${shoe?'disabled':''}>${shoe?'Select a size':'Add to bag'}</button><button class="wish" id="wish" aria-label="Save to wishlist">${heart}</button></div>
 ${C.apay?`<button class="apay" data-apay><svg viewBox="0 0 17 20"><path fill="#fff" d="M14 10.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8C4.9 5.5 3.5 6.4 2.8 7.7c-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.5-3.6zM11.7 3.9c.6-.8 1.1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1.1.1 2.1-.5 2.8-1.3z"/></svg>Pay</button>`:''}
 <div class="stock"><div><span class="dot"></span><b>In stock</b>${C.stockNote?`<span class="mute">${C.stockNote}</span>`:''}</div><div>${truck}${freeDel?'<span><b>Free UK delivery</b> on this order</span>':`<span>Free UK delivery on orders over £${K.STORE.freeOver}</span>`}</div><div>${shield}<span>Rated <b>Excellent</b> on Trustpilot</span></div></div>
 ${C.inlineBundle?bundle():''}
 <p class="helpl">${shoe?'Not sure of your size? <a href="#" data-sg>Check the size guide</a>':'Not sure it is right for you? <a href="#">Read our racket guide</a>'}</p></div>`;}

/* bundle */
const ACC=['GB 1200 Overgrip 3 Pack','Frame Protector Tape','Padel Pro Ball 3 Pack','Padel Racket Cover'].map(n=>P.find(p=>p.n===n)).filter(Boolean);
function bundle(){const items=shoe?ACC.slice(2,3):ACC.slice(0,3);
 return `<div class="bund" id="bund"><h3>Complete the set</h3><p class="mute" style="font-size:14px">Most players add these with their ${shoe?'shoes':'racket'}.</p>
 <div class="bi"><input type="checkbox" checked disabled aria-label="This item"><div class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:'<span class="note">This item</span>'}</div><span><b>This item:</b> ${x.b} ${x.n}</span><b>${gbp(x.p)}</b></div>
 ${items.map(a=>`<label class="bi"><input type="checkbox" checked data-bun="${a.i}" data-p="${a.p}"><div class="th"><span class="note">${a.n}</span></div><span>${a.b} ${a.n}</span><b>${gbp(a.p)}</b></label>`).join('')}
 <div class="bt"><span>Total <b id="btot"></b></span><button class="btn" data-bunadd>Add selected to bag</button></div></div>`;}
function btot(){const t=x.p+$$('[data-bun]').filter(i=>i.checked).reduce((a,i)=>a+ +i.dataset.p,0);const e=$('#btot');if(e)e.textContent=gbp(t);}

/* details */
const descTxt=shoe?[`The ${x.n} is built for the quick lateral movement padel demands. A ${x.sh.toLowerCase()} sole grips artificial grass courts without sticking, and a reinforced toe area stands up to drag on the glass.`,'A cushioned midsole keeps you comfortable through long sessions, while the low profile keeps you close to the court for fast changes of direction.']
 :[`The ${x.b} ${x.n} is a ${x.sh.toLowerCase()} racket made for ${LVL[x.l].toLowerCase()} players. ${x.l===1?'A soft core and low balance make it forgiving on off centre hits and easy on the arm.':x.l===2?'A medium core and balanced weight give you more power without losing the touch you need at the net.':'A firm core and head heavy balance turn full swings into finishing smashes for players who can control it.'}`,'Every racket we sell is checked on arrival and shipped in a protective box.'];
const bullets=shoe?['Herringbone sole for artificial grass','Reinforced toe for glass drags','Cushioned midsole','Breathable mesh upper']:[`${x.sh} shape, ${weight}`,`${LVL[x.l]} level`,x.l===3?'18K carbon face':x.l===2?'12K carbon face':'Fibreglass face',x.l===3?'Hard EVA core':x.l===2?'Medium EVA core':'Soft EVA core'];
const specs=shoe?[['Brand',x.b],['Sole',x.sh],['Court','Artificial grass'],['Upper','Mesh and synthetic'],['Drop','8mm'],['Weight','340g (UK 9)']]:[['Brand',x.b],['Shape',x.sh],['Weight',weight],['Balance',x.l===3?'High':x.l===2?'Medium':'Low'],['Core',x.l===3?'Hard EVA':x.l===2?'Medium EVA':'Soft EVA'],['Face',x.l===3?'18K carbon':x.l===2?'12K carbon':'Fibreglass'],['Frame','100% carbon tube'],['Thickness','38mm'],['Level',LVL[x.l]],['Season','2026']];
const delTxt=`<p>Free UK delivery on orders over £${K.STORE.freeOver}. Delivery options and prices are shown at checkout.</p><p>Returns are covered by our returns policy. <a href="#" style="text-decoration:underline">Read the full policy</a>.</p>`;
function details(mode){const D=[['Description',`<div class="desc"><div>${descTxt.map(p=>`<p>${p}</p>`).join('')}</div><ul>${bullets.map(b=>`<li>${b}</li>`).join('')}</ul></div>`],['Specifications',`<div class="spec2">${specs.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>`],['Delivery and returns',delTxt]];
 if(mode==='acc')return `<section class="psec"><div class="acc2">${D.map(([t,b],k)=>`<details ${k?'':'open'}><summary>${t}</summary><div class="in2">${b}</div></details>`).join('')}</div></section>`;
 return `<section class="psec"><div class="ptabs">${D.map(([t],k)=>`<button class="${k?'':'on'}" data-tabp="${k}">${t}</button>`).join('')}</div>${D.map(([t,b],k)=>`<div class="pane ${k?'':'on'}" data-pane="${k}"><h3 class="mh" style="font-family:var(--head);font-size:20px;margin:18px 0 12px">${t}</h3>${b}</div>`).join('')}</section>`;}

/* reviews */
const RV=shoe?[['Great grip','Grips well on our club\'s sand filled courts and they were comfortable straight out of the box.','James T.','Club player','3 days ago',['True to size','Comfortable']],['Comfortable all session','Played two hours on Saturday and no sore feet. The sole feels solid when moving to the glass.','Laura M.','Plays weekly','1 week ago',['True to size']],['Size up half','Lovely shoe but I would go half a size up if you have wide feet.','Sam K.','Beginner','2 weeks ago',['Runs small']]]
 :[['Exactly what I needed','Moved up from a beginner racket and this gives me noticeably more power without feeling hard to control.','Chris D.','Plays weekly','2 days ago',['Power','Control']],['Fast delivery, great racket','Arrived quickly in a proper box. Feels well made and the grip is comfortable.','Aisha P.','Club player','5 days ago',['Build quality']],['Good advice from the team','I asked which racket suited my level and they recommended this one. Really happy with it.','Mark W.','Beginner','1 week ago',['Comfort']],['Lovely balance','Easy to manoeuvre at the net and still has enough for overheads.','Elena R.','Competitive','3 weeks ago',['Balance']]];
const hist=[78,15,5,1,1];
function reviews(){return `<section class="psec" id="reviews"><h2>Customer reviews</h2><div class="rv2"><div class="rsum"><div class="sc2"><b>${rating}</b><div>${stars()}<div class="mute" style="font-size:14px;margin-top:4px">Based on ${revs} reviews</div></div></div>
 <div class="hist">${hist.map((h,k)=>`<div><span>${5-k} star</span><i><b style="width:${h}%"></b></i><span class="mute">${h}%</span></div>`).join('')}</div>${shoe?`<div class="fit" style="margin-bottom:18px"><b>Fit</b><div class="tr"><i style="left:46%"></i></div><div class="lb"><span>Runs small</span><span>True to size</span><span>Runs large</span></div></div>`:''}<button class="btn ol">Write a review</button></div>
 <div class="rlist"><div class="rf">${['All reviews','5 stars','4 stars','Verified buyers'].map((t,k)=>`<button class="${k?'':'on'}">${t}</button>`).join('')}</div>${RV.map(([h,p,n,lv,d,tg])=>`<article class="ri"><div class="who"><b>${n}</b><span>${lv}</span><span>${d}</span></div><div>${stars('s')}<h4>${h}</h4><p>${p}</p><div class="tags">${tg.map(t=>`<span>${t}</span>`).join('')}<span>Verified buyer</span></div></div></article>`).join('')}<button class="btn ol" style="margin-top:20px;align-self:flex-start">Show more reviews</button><p class="phn2">Sample reviews. Replace with live product reviews.</p></div></div></section>`;}

/* extras */
const similar=P.filter(p=>p.c===x.c&&p.i!==x.i&&(shoe||p.l===x.l)).slice(0,4);
const alsoLike=()=>`<section class="psec"><div class="sh"><div class="shl"><h2 style="margin:0">You may also like</h2><p>${shoe?'More padel shoes':'More '+LVL[x.l].toLowerCase()+' rackets'} from the brands we stock.</p></div><a class="shbtn" href="#">Shop all ${ARW}</a></div><div class="grid">${similar.map(card).join('')}</div></section>`;
function compare(){const xs=[x,...similar.slice(0,2)];const row=(h,f)=>`<tr><th>${h}</th>${xs.map((p,k)=>`<td class="${k?'':'me'}">${f(p)}</td>`).join('')}</tr>`;
 return `<section class="psec"><h2>Compare similar rackets</h2><div class="ctab"><table>${row('',p=>`<div class="cimg"><img src="${IMG}" alt=""></div>`)}${row('Racket',p=>`<b>${p.b} ${p.n}</b>${p===x?'<br><span class="mute" style="font-size:12px">This racket</span>':''}`)}${row('Price',p=>p.w?`<b style="color:var(--accent)">${gbp(p.p)}</b> <s class="mute">${gbp(p.w)}</s>`:gbp(p.p))}${row('Level',p=>LVL[p.l])}${row('Shape',p=>p.sh)}${row('Rating',p=>`${stars('s')} ${(4.5+((p.i*7)%5)/10).toFixed(1)}`)}${row('',p=>p===x?'<span class="mute">Viewing</span>':`<button class="btn ol" data-add="${p.i}">Add to bag</button>`)}</table></div></section>`;}
const feats=()=>`<section class="feat2"><div class="wrap"><h2>What makes it different</h2><div class="fg3">${(C.features||[]).map(([t,p,n])=>`<div class="fi"><div class="ph"><span class="note">Photo: ${n}</span></div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></div></section>`;
const story=()=>`<section class="psec">${(C.story||[]).map(([t,p,n],k)=>`<div class="story ${k%2?'flip':''}"><div class="ph"><span class="note">Photo: ${n}</span></div><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</section>`;
const brandBlock=()=>`<section class="psec"><div class="bblock"><div class="blogo">Logo: ${x.b}</div><p><b>About ${x.b}.</b> ${C.brandTxt||'One of the most played brands in European padel, with rackets for every level from first time players to the professional tour.'}</p><a class="shbtn" href="#">Shop ${x.b} ${ARW}</a></div></section>`;
const faq=()=>`<section class="psec"><h2>Questions about this ${shoe?'shoe':'racket'}</h2><div class="faq">${(shoe?[['How do I choose my size?','Padel shoes fit like running shoes. If you are between sizes, our reviewers suggest going half a size up.'],['Which sole do I need?','Herringbone soles suit most artificial grass courts. Choose an omni sole for heavily sanded courts.']]:[['Is this racket right for my level?',`It is designed for ${LVL[x.l].toLowerCase()} players. If you are unsure, our racket guide explains the differences.`],['Does it come with a cover?','Check the specifications for what is included. You can add a racket cover in Complete the set.'],['Can I pay with Klarna?','Yes. Choose Klarna at checkout to split the cost into 3 interest free payments.']]).map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;
const sg=()=>`<div class="sgm" id="sgm"><div class="box2"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:var(--head);font-size:24px">Size guide</h3><button class="x" data-sgx aria-label="Close"></button></div><table><tr><th>UK</th><th>EU</th><th>US</th><th>Foot length</th></tr>${[['7','41','8','25.5cm'],['8','42','9','26.5cm'],['9','43','10','27.5cm'],['10','44.5','11','28.5cm'],['11','46','12','29.5cm']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div></div>`;

function render(){
 const B={details:()=>details(C.details||'tabs'),reviews,also:alsoLike,compare,features:feats,story,brand:brandBlock,faq,bundle:()=>`<section class="psec">${bundle()}</section>`};
 $('#pdp-root').innerHTML=`<div class="wrap"><nav class="crumbs"><a href="./home.html">Home</a><span>/</span><a href="#">${shoe?'Padel shoes':'Padel rackets'}</a><span>/</span><a href="#">${x.b}</a><span>/</span><span>${x.n}</span></nav>
 ${C.hero?`<div class="thero"><span class="note">Photo: ${C.hero[2]}</span><div><h2>${C.hero[0]}</h2><p>${C.hero[1]}</p></div></div>`:''}
 <div class="pdp ${C.fast?'fast':''}">${gallery()}${buy()}</div></div>
 ${C.blocks.map(b=>b==='features'?B[b]():`<div class="wrap">${B[b]()}</div>`).join('')}
 <div class="sbar" id="sbar"><div class="wrap"><div class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:''}</div><div class="nm"><b>${x.b} ${x.n}</b><span>${stars('s')} ${rating} (${revs})</span></div><span class="pr3">${gbp(x.p)}</span><button class="btn" data-sbadd>${shoe?'Choose size':'Add to bag'}</button></div></div>${shoe?sg():''}`;
 btot();
 const sb=$('#sbar'),at=$('#atc'),chk=()=>sb.classList.toggle('on',at.getBoundingClientRect().bottom<0);addEventListener('scroll',chk,{passive:true});chk();
 const gal=$('#gal');if(gal)gal.addEventListener('scroll',()=>{const k=Math.round(gal.scrollLeft/gal.clientWidth);$$('#dots i').forEach((d,j)=>d.classList.toggle('on',j===k));},{passive:true});
}
function setImg(k){S.img=(k+shots.length)%shots.length;$('#mainimg').innerHTML=sq(shots[S.img],S.img,badge);$$('.tl button').forEach((b,j)=>b.classList.toggle('on',j===S.img));}
document.addEventListener('click',e=>{const t=e.target.closest('button,a[data-sg]');if(!t)return;
 if(t.dataset.img!==undefined){setImg(+t.dataset.img);return;}
 if(t.dataset.step){setImg(S.img+ +t.dataset.step);return;}
 if(t.dataset.qd){S.qty=Math.max(1,S.qty+ +t.dataset.qd);$('#qty').textContent=S.qty;return;}
 if(t.id==='atc'||t.dataset.sbadd!==undefined||t.dataset.apay!==undefined){if(shoe&&!S.size){$('#buy').scrollIntoView({behavior:'smooth',block:'center'});$('.sizes').animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});return;}for(let k=0;k<S.qty;k++)add(x.i);return;}
 if(t.id==='wish'){S.wish=!S.wish;t.classList.toggle('on',S.wish);return;}
 if(t.dataset.size){S.size=t.dataset.size;$$('.sizes button').forEach(b=>b.classList.toggle('on',b===t));$('#sizen').textContent='UK '+S.size+(t.querySelector('.lo')?', only 2 left':'');const a=$('#atc');a.disabled=false;a.textContent='Add to bag';return;}
 if(t.dataset.col!==undefined){$$('.sw button').forEach(b=>b.classList.toggle('on',b===t));$('#coln').textContent=t.dataset.n;return;}
 if(t.dataset.bunadd!==undefined){add(x.i);$$('[data-bun]').filter(i=>i.checked).forEach(i=>add(+i.dataset.bun));return;}
 if(t.dataset.tabp!==undefined){$$('.ptabs button').forEach(b=>b.classList.toggle('on',b===t));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.pane===t.dataset.tabp));return;}
 if(t.dataset.sg!==undefined){e.preventDefault();$('#sgm').classList.add('on');return;}
 if(t.dataset.sgx!==undefined){$('#sgm').classList.remove('on');return;}
 if(t.closest('.rf')){$$('.rf button').forEach(b=>b.classList.toggle('on',b===t));return;}
});
document.addEventListener('change',e=>{if(e.target.dataset.bun)btot();});
document.addEventListener('click',e=>{if(e.target.id==='sgm')e.target.classList.remove('on');});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
