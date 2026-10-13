/* PADEL lab pages: the racket map and the court. Three versions each.
   Registers into window.PGX. Load before pages.js. Map positions come from each racket's shape and level. */
(()=>{
const X=window.PGX=window.PGX||{};const I=window.PGXI=window.PGXI||[];
const SHP={Round:22,Teardrop:50,Hybrid:58,Diamond:78};
const jt=(i,k)=>((i*k)%11)-5,cl=v=>Math.max(4,Math.min(96,Math.round(v)));
const pow=x=>cl((SHP[x.sh]??50)+(x.l-2)*7+jt(x.i,7));
const ctl=x=>cl(100-pow(x)+jt(x.i,3));
const fgv=x=>cl(100-(x.l*28-12)*.75-((SHP[x.sh]??50)-22)*.25+jt(x.i,9));
const NOTE='<p class="lnote">Where a racket sits is worked out from its shape, balance and level.</p>';
const mini=(H,x,c='')=>`<div class="lcard ${c}"><a class="im" href="product.html">${H.IMGB(x)}</a><div class="tx"><small>${x.b}</small><b>${x.n}</b><span>${H.LVL[x.l]}, ${x.sh}</span><div class="row"><b>${H.gbp(x.p)}</b><button class="btn sm" data-add="${x.i}">Add to bag</button></div></div></div>`;
const bars=x=>`<div class="lbars">${[['Power',pow],['Control',ctl],['Forgiveness',fgv]].map(([t,f])=>`<div><span>${t}</span><i><em style="width:${f(x)}%"></em></i></div>`).join('')}</div>`;
const VID=(n,c='')=>`<div class="lvid ${c}"><span class="note">Video: ${n}</span></div>`;
const hdrH=()=>{const h=document.querySelector('.hdr');return h?h.offsetHeight:0;};
const fitHero=sel=>{const f=()=>document.querySelectorAll(sel).forEach(e=>e.style.minHeight=(innerHeight-hdrH())+'px');f();addEventListener('resize',f);};

/* ---------- the racket map: the slider is the hero ---------- */
const LABEL=n=>n<26?'All about control':n<44?'Control first':n<58?'A bit of both':n<74?'Power first':'All about power';
const SUB=n=>n<36?'Round shapes with the weight low in your hand.':n<62?'Teardrop and hybrid shapes with the weight in the middle.':'Diamond shapes with the weight up in the head.';
const matches=(R,n,b)=>R.filter(x=>x.p<=b).map(x=>({x,m:Math.max(0,Math.round(100-Math.abs(pow(x)-n)*2.2))})).sort((a,c)=>c.m-a.m);
const BUD=(id,c='')=>`<label class="lbud ${c}"><span>Budget</span><select id="${id}"><option value="9999">Any price</option><option value="100">Up to £100</option><option value="150">Up to £150</option><option value="200">Up to £200</option><option value="300">Up to £300</option></select></label>`;
const sorted=H=>[...H.rk].sort((a,b)=>pow(a)-pow(b)||a.p-b.p);
X.map=H=>{const v=H.V;
 if(v===2){const R=sorted(H);return [`<section class="mh2 lhero"><div class="wrap top"><small>The racket map</small><h1>Every racket, from control to power.</h1><p>Drag the row, or the slider. The racket in the middle is yours to look at.</p></div>
  <div class="m2lab"><b id="m2h">A bit of both</b><span id="m2s"></span></div>
  <div class="m2row" id="m2row">${R.map((x,k)=>`<button class="m2c" data-k="${k}" aria-label="${x.b} ${x.n}"><span class="im">${H.IMGB(x)}</span></button>`).join('')}</div>
  <div class="wrap m2bot"><div class="m2d" id="m2d"></div><div class="m2ctl"><span>Control</span><input type="range" id="m2r" min="0" max="${R.length-1}" value="${Math.floor(R.length/2)}" aria-label="Control to power"><span>Power</span></div>${BUD('m2b')}</div></section>`,
  `<section class="sec sx-sec"><div class="wrap">${NOTE}</div></section>`];}
 if(v===3)return [`<section class="mh3 lhero"><div class="wrap"><div class="g"><div class="l"><small>The racket map</small><h1>Turn it up.</h1><p>Turn the dial from control to power. The racket in the middle is your closest match.</p>${BUD('m3b')}<div class="m3t" id="m3t"></div></div>
  <div class="dial" id="dial"><div class="ring" id="ring"></div><button class="knob" id="knob" aria-label="Control to power. Use the arrow keys."></button><div class="ctr" id="m3c"></div><span class="ea">Control</span><span class="eb">Power</span></div></div></div></section>`,
  `<section class="sec sx-sec"><div class="wrap">${NOTE}</div></section>`];
 return [`<section class="mh1 lhero" id="mh1"><div class="glow" id="m1g"></div><div class="wrap"><div class="top"><small>The racket map</small><h1 id="m1h">A bit of both</h1><p id="m1s"></p></div>
  <div class="m1st" id="m1st"></div>
  <div class="m1ctl"><span>Control</span><div class="trk"><div class="fill" id="m1f"></div><input type="range" id="m1r" min="4" max="96" value="50" aria-label="Control to power"></div><span>Power</span></div>
  <div class="m1ft">${BUD('m1b','dk')}<a class="ul" href="#m1res">See every match</a></div></div></section>`,
  `<section class="sec sx-sec" id="m1res"><div class="wrap"><div class="smh"><h2>Your matches</h2><span id="m1n"></span></div><div id="m1grid"></div>${NOTE}</div></section>`];};
I.push((t,H)=>{if(t!=='map')return;const v=H.V;fitHero('.lhero');
 if(v===1){const R=H.rk;let pick=null;
  const draw=()=>{const n=+H.$('#m1r').value,b=+H.$('#m1b').value,l=matches(R,n,b);
   H.$('#m1h').textContent=LABEL(n);H.$('#m1s').textContent=`${SUB(n)} ${l.filter(r=>r.m>=70).length} close matches.`;
   H.$('#m1f').style.width=((n-4)/92*100)+'%';
   H.$('#m1g').style.background=`radial-gradient(55% 70% at ${n}% 62%,rgba(255,77,0,${(.08+n/260).toFixed(2)}),transparent 70%)`;
   const top=l.slice(0,5),best=pick&&top.find(r=>r.x.i===pick)||top[0];const rest=top.filter(r=>r!==best);const ord=[rest[2],rest[0],best,rest[1],rest[3]];
   H.$('#m1st').innerHTML=ord.map((r,k)=>r?`<button class="s s${k} ${r===best?'on':''}" data-pick="${r.x.i}"><span class="im">${H.IMGB(r.x)}</span><span class="tx"><small>${r.m}% match</small><b>${r.x.b} ${r.x.n}</b>${r===best?`<span class="row"><em>${H.gbp(r.x.p)}</em><span class="btn sm" data-add="${r.x.i}">Add to bag</span></span>`:''}</span></button>`:'<span class="s e"></span>').join('');
   H.$('#m1n').textContent=`${l.filter(r=>r.m>=50).length} rackets`;H.$('#m1grid').innerHTML=H.GRID(l.filter(r=>r.m>=50).slice(0,8).map(r=>r.x));};
  document.addEventListener('input',e=>{if(e.target.id==='m1r'){pick=null;draw();}});document.addEventListener('change',e=>{if(e.target.id==='m1b')draw();});
  document.addEventListener('click',e=>{const s=e.target.closest('[data-pick]');if(s&&!e.target.closest('[data-add]')){pick=+s.dataset.pick;draw();}});draw();}
 if(v===2){const R=sorted(H),row=H.$('#m2row'),cs=H.$$('.m2c');let cur=-1;
  const set=k=>{if(k===cur)return;cur=k;const x=R[k];cs.forEach((c,j)=>{c.classList.toggle('on',j===k);c.classList.toggle('near',Math.abs(j-k)===1);});H.$('#m2r').value=k;H.$('#m2h').textContent=LABEL(pow(x));H.$('#m2s').textContent=SUB(pow(x));
   H.$('#m2d').innerHTML=`<div class="a"><small>${x.b}</small><h2>${x.n}</h2><span>${H.LVL[x.l]}, ${x.sh}</span></div>${bars(x)}<div class="c"><b>${H.gbp(x.p)}</b><button class="btn" data-add="${x.i}">Add to bag</button><a class="ul" href="product.html">View racket</a></div>`;};
  const centre=()=>{const m=row.scrollLeft+row.clientWidth/2;let bk=0,bd=1e9;cs.forEach((c,j)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-m);if(d<bd){bd=d;bk=j;}});set(bk);};
  const go=(k,sm)=>{const c=cs[k];row.scrollTo({left:c.offsetLeft+c.offsetWidth/2-row.clientWidth/2,behavior:sm?'smooth':'auto'});set(k);};
  let raf=0;row.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(centre);},{passive:true});
  let dn=null;row.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dn={x:e.clientX,s:row.scrollLeft,m:0};row.classList.add('drag');});
  addEventListener('pointermove',e=>{if(!dn)return;dn.m=Math.abs(e.clientX-dn.x);row.scrollLeft=dn.s-(e.clientX-dn.x);});
  addEventListener('pointerup',()=>{if(!dn)return;const moved=dn.m>5;dn=null;row.classList.remove('drag');if(moved)centre();});
  row.addEventListener('click',e=>{const c=e.target.closest('.m2c');if(c)go(+c.dataset.k,true);});
  document.addEventListener('input',e=>{if(e.target.id==='m2r')go(+e.target.value,false);});
  document.addEventListener('change',e=>{if(e.target.id!=='m2b')return;const b=+e.target.value;cs.forEach((c,j)=>c.classList.toggle('off',R[j].p>b));if(R[cur].p>b){const k=R.findIndex(x=>x.p<=b);if(k>=0)go(k,true);}});
  requestAnimationFrame(()=>go(Math.floor(R.length/2),false));}
 if(v===3){const R=H.rk,dial=H.$('#dial'),knob=H.$('#knob');let n=50;
  const draw=()=>{const a=-135+(n-4)/92*270;knob.style.transform=`rotate(${a}deg) translateY(calc(var(--r) * -1))`;H.$('#ring').style.setProperty('--a',(a+135)+'deg');
   const b=+H.$('#m3b').value,l=matches(R,n,b),x=l[0];
   H.$('#m3c').innerHTML=x?`<span class="im">${H.IMGB(x.x)}</span><small>${LABEL(n)}</small><b>${x.x.b} ${x.x.n}</b><span class="row"><em>${H.gbp(x.x.p)}</em><button class="btn sm" data-add="${x.x.i}">Add to bag</button></span>`:'<small>No rackets in that budget</small>';
   H.$('#m3t').innerHTML=`<b>Also close</b>${l.slice(1,4).map(r=>`<div class="m3r"><span class="pct">${r.m}%</span>${mini(H,r.x)}</div>`).join('')}`;};
  const fromPt=e=>{const r=dial.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);let a=Math.atan2(dx,-dy)*180/Math.PI;a=Math.max(-135,Math.min(135,a));n=Math.round(4+(a+135)/270*92);draw();};
  let on=false;dial.addEventListener('pointerdown',e=>{if(e.target.closest('.ctr button'))return;on=true;dial.setPointerCapture(e.pointerId);fromPt(e);});dial.addEventListener('pointermove',e=>{if(on)fromPt(e);});dial.addEventListener('pointerup',()=>on=false);
  knob.addEventListener('keydown',e=>{if(/Arrow(Right|Up)/.test(e.key)){n=Math.min(96,n+4);draw();e.preventDefault();}if(/Arrow(Left|Down)/.test(e.key)){n=Math.max(4,n-4);draw();e.preventDefault();}});
  document.addEventListener('change',e=>{if(e.target.id==='m3b')draw();});draw();}});

/* ---------- the court: nine shots, on video ---------- */
const SHOTS=[
 ['Serve','Start the point','serve from behind the server, slow motion','Underarm, after one bounce, struck at or below waist height and sent diagonally into the opposite service box. You get two attempts.','Any racket you are comfortable with. Control matters more than power here.','Round','Serving well in padel'],
 ['Return','Defence','return coming off the side glass','Let the serve come off the glass if it needs to, then return low and cross court, or lob to push the serving pair back.','A round or teardrop racket gives you the control to keep it low.','Teardrop',''],
 ['Lob','Defence','lob over the net players from the back','The most important defensive shot. Lift the ball high over the net players so you can take the net back.','A round racket with a soft core makes touch shots easier.','Round','Getting the most from the glass'],
 ['Back glass','Defence','player turning with the ball off the back glass','Let the ball come off the back glass, turn with it and hit once it drops to a comfortable height.','A forgiving racket helps when you are stretched.','Round','Getting the most from the glass'],
 ['Chiquita','Change of pace','soft ball dropped at the net players\' feet','A soft, low ball dropped at the feet of the net players, so they have to volley up to you.','Control first. A round or teardrop shape.','Round',''],
 ['Bandeja','Hold the net','bandeja from behind the player','A flat or sliced overhead that keeps you at the net, played deep to the corner so it comes off the glass low.','A teardrop racket gives you control with enough weight up top.','Teardrop','The bandeja, step by step'],
 ['Vibora','Attack','vibora with side spin, filmed side on','A more aggressive overhead with side spin. Cut across the ball so it skids low off the side glass.','Teardrop or diamond, for spin and bite.','Diamond',''],
 ['Volley','At the net','volley at the net, close up','At the net, punch the ball low with a short swing and a firm wrist. Aim deep down the middle or at their feet.','A light, balanced racket you can move quickly.','Teardrop',''],
 ['Smash','Finish the point','smash out of the court, slow motion','A full overhead to finish the point, hit hard enough to bounce out of the court or into the side glass.','A diamond racket puts the weight in the head for power.','Diamond','']];
const KIT=(H,s)=>H.rk.filter(x=>x.sh===s[5]).sort((a,b)=>b.l-a.l).slice(0,2);
const GL=(H,s)=>s[6]?`<a class="ul" href="g-${H.SLUG(s[6])}.html">Read: ${s[6]}</a>`:'';
const KITB=(H,s,c='')=>`<div class="ckit ${c}"><b>The racket for it</b><p>${s[4]}</p><div class="kg">${KIT(H,s).map(x=>mini(H,x,c)).join('')}</div></div>`;
const ZONES=[['The back','Defend and reset','players defending from the back glass',[0,1,2,3]],['The middle','Change the pace','player moving forward to the net',[4,5,6]],['The net','Win the point','two players at the net, ready',[7,8]]];
X.court=H=>{const v=H.V;
 if(v===2)return [`<section class="cz lhero"><div class="wrap"><div class="top"><small>The court</small><h1>Where you stand decides the shot.</h1></div><div class="zones" id="zones">${ZONES.map(([t,k,n,l],j)=>`<div class="zn ${j===0?'on':''}" data-zn="${j}">${VID(n,'fill')}<div class="cap"><small>${k}</small><h2>${t}</h2><div class="zl">${l.map(i=>`<button data-zs="${i}">${SHOTS[i][0]}<i>${H.ARW}</i></button>`).join('')}</div></div></div>`).join('')}</div></div></section>`,
  `<section class="sec sx-sec" id="czd"><div class="wrap"><div class="czd" id="czb"></div></div></section>`];
 if(v===3)return [`<section class="ci lhero"><div class="wrap"><div class="g"><div class="names"><small>The court</small><p>Nine shots every player needs. Pick one.</p>${SHOTS.map((s,k)=>`<button class="nm" data-ci="${k}"><span>${s[1]}</span>${s[0]}</button>`).join('')}</div><div class="pv"><div class="stk" id="cipv"></div></div></div></div></section>`];
 return [`<section class="cr1 lhero"><div class="rl" id="rl"><div class="bars">${SHOTS.map((s,k)=>`<i data-bar="${k}"><em></em></i>`).join('')}</div>${SHOTS.map((s,k)=>`<div class="sl" data-sl="${k}">${VID(s[2],'fill')}<div class="ov"><div class="wrap"><div class="tx"><small>${s[1]}</small><h2>${s[0]}</h2><p>${s[3]}</p>${GL(H,s)}</div><div class="kt"><b>The racket for it</b>${mini(H,KIT(H,s)[0],'wh')}</div></div></div></div>`).join('')}<button class="nv pv" data-rl="-1" aria-label="Previous shot">←</button><button class="nv nx" data-rl="1" aria-label="Next shot">→</button><button class="pp" id="rlpp">Pause</button><span class="ct" id="rlct"></span></div></section>`,
  H.SEC(H.SH('All nine shots','Tap one to watch it.')+`<div class="rlth">${SHOTS.map((s,k)=>`<button data-rlgo="${k}">${VID(s[2])}<small>${s[1]}</small><b>${s[0]}</b></button>`).join('')}</div>`)];};
I.push((t,H)=>{if(t!=='court')return;const v=H.V;fitHero('.lhero');
 if(v===1){let k=0,tm=null,paused=false;const DUR=8000;const sls=H.$$('.sl'),brs=H.$$('[data-bar]');
  const go=j=>{k=(j+SHOTS.length)%SHOTS.length;sls.forEach((s,i)=>s.classList.toggle('on',i===k));brs.forEach((b,i)=>{b.classList.toggle('done',i<k);b.classList.remove('run');});void brs[k].offsetWidth;if(!paused)brs[k].classList.add('run');H.$('#rlct').textContent=`${k+1} of ${SHOTS.length}`;clearTimeout(tm);if(!paused)tm=setTimeout(()=>go(k+1),DUR);};
  document.addEventListener('click',e=>{const n=e.target.closest('[data-rl]');if(n){go(k+ +n.dataset.rl);return;}const g=e.target.closest('[data-rlgo]');if(g){go(+g.dataset.rlgo);H.$('#rl').scrollIntoView({behavior:'smooth',block:'end'});return;}
   if(e.target.id==='rlpp'){paused=!paused;e.target.textContent=paused?'Play':'Pause';go(k);}});
  go(0);}
 if(v===2){const show=i=>{const s=SHOTS[i];H.$('#czb').innerHTML=`${VID(s[2])}<div class="t"><small>${s[1]}</small><h2>${s[0]}</h2><p>${s[3]}</p>${GL(H,s)}${KITB(H,s)}</div>`;H.$$('[data-zs]').forEach(b=>b.classList.toggle('on',+b.dataset.zs===i));};
  const open=j=>H.$$('.zn').forEach(z=>z.classList.toggle('on',+z.dataset.zn===j));
  H.$$('.zn').forEach(z=>z.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)open(+z.dataset.zn);}));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-zs]');if(b){show(+b.dataset.zs);H.$('#czd').scrollIntoView({behavior:'smooth',block:'start'});return;}const z=e.target.closest('.zn');if(z)open(+z.dataset.zn);});show(5);}
 if(v===3){const pv=H.$('#cipv');const show=i=>{const s=SHOTS[i];H.$$('.nm').forEach(b=>b.classList.toggle('on',+b.dataset.ci===i));pv.innerHTML=`${VID(s[2])}<small>${s[1]}</small><h2>${s[0]}</h2><p>${s[3]}</p>${GL(H,s)}${KITB(H,s)}`;
   if(matchMedia('(max-width:760px)').matches){const b=H.$(`.nm[data-ci="${i}"]`);b.after(H.$('.ci .pv'));}};
  H.$$('.nm').forEach(b=>b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover) and (min-width:761px)').matches)show(+b.dataset.ci);}));
  document.addEventListener('click',e=>{const b=e.target.closest('.nm');if(b)show(+b.dataset.ci);});show(5);}});
})();
