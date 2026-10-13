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
const fitHero=sel=>{const f=()=>document.querySelectorAll(sel).forEach(e=>e.style.minHeight=(innerHeight-hdrH()-4)+'px');f();addEventListener('resize',f);};

/* ---------- the racket map: one screen, built once, animated with transitions ---------- */
const LABEL=n=>n<26?'All about control':n<44?'Control first':n<58?'A bit of both':n<74?'Power first':'All about power';
const SUB=n=>n<36?'Round shapes, weight low in your hand.':n<62?'Teardrop and hybrid shapes, weight in the middle.':'Diamond shapes, weight up in the head.';
const BUD=(id,c='')=>`<label class="lbud ${c}"><span>Budget</span><select id="${id}"><option value="9999">Any price</option><option value="100">Up to £100</option><option value="150">Up to £150</option><option value="200">Up to £200</option><option value="300">Up to £300</option></select></label>`;
const sorted=H=>[...H.rk].sort((a,b)=>pow(a)-pow(b)||a.p-b.p);
const nearest=(L,n)=>L.reduce((b,x)=>Math.abs(pow(x)-n)<Math.abs(pow(b)-n)?x:b,L[0]);
const fitExact=sel=>{const f=()=>document.querySelectorAll(sel).forEach(e=>e.style.height=(innerHeight-hdrH()-4)+'px');f();addEventListener('resize',f);};
const swapText=(el,t)=>{if(!el||el.textContent===t)return;el.classList.add('fo');setTimeout(()=>{el.textContent=t;el.classList.remove('fo');},140);};
const SLIDER=(id,max,val)=>`<div class="mctl"><span>Control</span><input type="range" id="${id}" min="0" max="${max}" value="${val}" step="1" aria-label="Control to power"><span>Power</span></div>`;
X.map=H=>{const v=H.V,R=sorted(H);
 if(v===2)return [`<section class="mf mfb"><div class="wrap g"><div class="mhd"><div><small>The racket map</small><h1 id="bL">A bit of both</h1></div><p id="bS"></p></div>
  <div class="mline" id="bLine">${R.map((x,k)=>`<a class="bc" href="product.html" data-k="${k}"><span class="im">${H.IMGB(x)}</span><span class="tx"><small>${x.b}</small><b>${x.n}</b><span>${H.LVL[x.l]}, ${x.sh}</span><em>${H.gbp(x.p)}</em></span></a>`).join('')}</div>
  <div class="mft">${SLIDER('bR',96,50)}${BUD('bB')}</div></div></section>`,`<section class="sec sx-sec"><div class="wrap">${NOTE}</div></section>`];
 if(v===3)return [`<section class="mf mfc" id="mfc"><div class="mcl" id="cC"><small>Control</small><b id="cCv">50%</b></div><div class="mcr" id="cP"><small>Power</small><b id="cPv">50%</b></div>
  <div class="mhd wrap"><small>The racket map</small><h1>Drag the line to the way you play.</h1></div>
  <div class="mcm" id="cMid"><div class="mpic" id="cPic"><span class="ly on">${H.IMGB(R[0])}</span><span class="ly">${H.IMGB(R[0])}</span></div><div class="mcn"><small id="cB"></small><b id="cN"></b><span><em id="cPr"></em><button class="btn sm" id="cAdd" data-add="">Add to bag</button></span></div></div>
  <button class="mhdl" id="cH" aria-label="Drag between control and power. Use the arrow keys."><i></i></button></section>`,`<section class="sec sx-sec"><div class="wrap">${NOTE}</div></section>`];
 return [`<section class="mf mfa"><div class="wrap g"><div class="mhd"><small>The racket map</small><h1 id="aL">A bit of both</h1></div>
  <div class="mstg"><div class="mil"><p id="aS"></p><div class="lbars" id="aBars">${['Power','Control','Forgiveness'].map(t=>`<div><span>${t}</span><i><em></em></i></div>`).join('')}</div></div>
  <div class="mpic" id="aPic"><span class="ly on">${H.IMGB(R[0])}</span><span class="ly">${H.IMGB(R[0])}</span></div>
  <div class="mir"><small id="aB"></small><b id="aN"></b><span id="aM"></span><em id="aPr"></em><button class="btn" id="aAdd" data-add="">Add to bag</button><div class="malt" id="aAlt"></div></div></div>
  ${SLIDER('aR',96,50)}</div></section>`,`<section class="sec sx-sec"><div class="wrap">${NOTE}</div></section>`];};
I.push((t,H)=>{if(t!=='map')return;const v=H.V,R=sorted(H);fitExact('.mf');
 const pic=(box,x,dir)=>{const ls=box.querySelectorAll('.ly'),on=box.querySelector('.ly.on'),off=[...ls].find(l=>l!==on);if(on.dataset.i==String(x.i))return;off.innerHTML=H.IMGB(x);off.dataset.i=x.i;off.style.setProperty('--dx',(dir>0?24:-24)+'px');off.classList.remove('on','out');void off.offsetWidth;off.classList.add('on');on.style.setProperty('--dx',(dir>0?-24:24)+'px');on.classList.remove('on');on.classList.add('out');};
 if(v===1){let last=null,lastN=50;const s=H.$('#aR');
  const draw=()=>{const n=+s.value,x=nearest(R,n),dir=n-lastN;lastN=n;swapText(H.$('#aL'),LABEL(n));swapText(H.$('#aS'),SUB(n));
   if(last!==x){pic(H.$('#aPic'),x,dir);last=x;['aB','aN','aM','aPr'].forEach((id,k)=>swapText(H.$('#'+id),[x.b,x.n,`${H.LVL[x.l]}, ${x.sh}`,H.gbp(x.p)][k]));H.$('#aAdd').dataset.add=x.i;
    H.$$('#aBars em').forEach((e,k)=>e.style.width=[pow,ctl,fgv][k](x)+'%');
    const alts=R.filter(y=>y!==x).sort((a,b)=>Math.abs(pow(a)-n)-Math.abs(pow(b)-n)).slice(0,2);H.$('#aAlt').innerHTML=`<small>Also close</small>${alts.map(y=>`<button data-aj="${pow(y)}"><span class="im">${H.IMGB(y)}</span><span><b>${y.n}</b><em>${H.gbp(y.p)}</em></span></button>`).join('')}`;}
   s.style.setProperty('--p',(n/96*100)+'%');};
  s.addEventListener('input',draw);document.addEventListener('click',e=>{const b=e.target.closest('[data-aj]');if(b){s.value=b.dataset.aj;draw();}});draw();}
 if(v===2){const s=H.$('#bR'),cs=H.$$('.bc');
  const draw=()=>{const n=+s.value,b=+H.$('#bB').value;swapText(H.$('#bL'),LABEL(n));swapText(H.$('#bS'),SUB(n));s.style.setProperty('--p',(n/96*100)+'%');
   const L=R.filter(x=>x.p<=b);if(!L.length)return;const best=nearest(L,n),bi=L.indexOf(best),st=Math.max(0,Math.min(L.length-5,bi-2));
   cs.forEach(c=>{const x=R[+c.dataset.k],j=L.indexOf(x);const pos=j<0?null:j-st;c.style.setProperty('--x',pos===null?(R.indexOf(x)<R.indexOf(best)?-1.2:5.2):pos);c.classList.toggle('vis',pos!==null&&pos>=0&&pos<5);c.classList.toggle('on',x===best);});};
  s.addEventListener('input',draw);document.addEventListener('change',e=>{if(e.target.id==='bB')draw();});draw();}
 if(v===3){const sec=H.$('#mfc'),h=H.$('#cH');let n=50,last=null,drag=false;
  const draw=()=>{sec.style.setProperty('--s',(100-n)+'%');H.$('#cCv').textContent=(100-n)+'%';H.$('#cPv').textContent=n+'%';const x=nearest(R,n);
   if(last!==x){pic(H.$('#cPic'),x,last?pow(x)-pow(last):1);last=x;swapText(H.$('#cB'),x.b);swapText(H.$('#cN'),x.n);swapText(H.$('#cPr'),H.gbp(x.p));H.$('#cAdd').dataset.add=x.i;}};
  const fromX=cx=>{const r=sec.getBoundingClientRect();n=Math.round(Math.max(4,Math.min(96,100-(cx-r.left)/r.width*100)));draw();};
  h.addEventListener('pointerdown',e=>{drag=true;sec.classList.add('drag');h.setPointerCapture(e.pointerId);});h.addEventListener('pointermove',e=>{if(drag)fromX(e.clientX);});h.addEventListener('pointerup',()=>{drag=false;sec.classList.remove('drag');});
  sec.addEventListener('click',e=>{if(e.target.closest('.mid,.hdl,a,button'))return;fromX(e.clientX);});
  h.addEventListener('keydown',e=>{if(/Arrow(Right|Up)/.test(e.key)){n=Math.max(4,n-4);draw();e.preventDefault();}if(/Arrow(Left|Down)/.test(e.key)){n=Math.min(96,n+4);draw();e.preventDefault();}});draw();}});

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
  document.addEventListener('click',e=>{const b=e.target.closest('[data-zs]');if(b){show(+b.dataset.zs);const el=H.$('#czb');scrollTo({top:el.getBoundingClientRect().top+scrollY-hdrH()-24,behavior:'smooth'});return;}const z=e.target.closest('.zn');if(z)open(+z.dataset.zn);});show(5);}
 if(v===3){const pv=H.$('#cipv');const show=i=>{const s=SHOTS[i];H.$$('.nm').forEach(b=>b.classList.toggle('on',+b.dataset.ci===i));pv.innerHTML=`${VID(s[2])}<small>${s[1]}</small><h2>${s[0]}</h2><p>${s[3]}</p>${GL(H,s)}${KITB(H,s)}`;
   if(matchMedia('(max-width:760px)').matches){const b=H.$(`.nm[data-ci="${i}"]`);b.after(H.$('.ci .pv'));}};
  H.$$('.nm').forEach(b=>b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover) and (min-width:761px)').matches)show(+b.dataset.ci);}));
  document.addEventListener('click',e=>{const b=e.target.closest('.nm');if(b)show(+b.dataset.ci);});show(5);}});
})();
