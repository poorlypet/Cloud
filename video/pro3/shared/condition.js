/* "5 signs of <condition>" film, built from a config (window.C). Same structure and timing as the IVDD film:
   hook → what it is (with an animated diagram) → five signs → what can help → four products → offer. */
(() => {
const { $, $$, tl, cue, fit, lines, out, blurIn, show, hide, product, shadow } = K;
const DUR = 54, PRESS = 51.6; window.END = PRESS;

document.getElementById('stage').innerHTML = `
<section class="scene white" id="s1" style="visibility:visible">
  <div id="segs1"></div>
  <h1 class="hd" id="s1h" style="left:120px;top:600px;font-size:190px;line-height:1">5 signs of</h1>
  <h1 class="hd" id="s1h2" style="left:120px;top:800px;font-size:200px;line-height:1"><em>${C.name}.</em></h1>
  <p class="sub" id="s1p" style="left:120px;top:1150px;width:840px">${C.hookSub}</p>
  <div class="a" id="s1band" style="left:0;top:1340px;width:1080px;height:96px;background:var(--teal);color:#fff;font:700 34px/96px var(--sans);letter-spacing:.06em"></div>
</section>
<section class="scene teal" id="s2">
  <h2 class="hd" id="s2h" style="left:120px;top:300px;font-size:92px">${C.what}</h2>
  <svg class="a" id="diag" style="left:0;top:0" width="1080" height="1920" fill="none"></svg>
  <p class="sub" id="s2p" style="left:120px;top:1300px;width:840px">${C.whatSub}</p>
</section>
<section class="scene white" id="s3">
  <div id="segs3"></div>
  <div class="a cap" id="s3cap" style="left:120px;top:290px;color:var(--mute)">The signs</div>
  <div id="numwin"><div id="numcol"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div></div></div>
  <div class="a" id="clist" style="left:120px;top:1300px;width:840px;display:flex;flex-wrap:wrap;gap:14px"></div>
  ${C.signs.map((g, i) => `<h2 class="hd sign" id="g${i + 1}">${g}</h2>`).join('')}
</section>
<section class="scene teal" id="s4">
  <h2 class="hd" id="s4h" style="left:120px;top:300px;font-size:120px">What can<br><em>help.</em></h2>
  <h3 class="hd" id="s4q" style="left:120px;top:640px;font-size:76px">${C.helpLine}</h3>
  <div id="chips"></div>
</section>
<section class="scene pale" id="s5"><div id="prods"></div></section>
<section class="scene white" id="s6">
  <h2 class="hd" id="s6h" style="left:120px;top:250px;width:840px;font-size:96px;text-align:center">Find the right support<br>for your dog’s <em>${C.endWord}.</em></h2>
  <div class="panel" id="tray" style="left:60px;top:520px;width:960px;height:500px;background:var(--pale2)"></div>
  <div id="row"></div>
  <div class="panel" id="offer" style="left:120px;top:1070px;width:840px;height:300px;background:var(--teal);color:#fff">
    <div class="a" style="left:48px;top:42px;font:800 34px/1.15 var(--sans)">10% off your<br>first order</div>
    <div class="a" style="right:48px;top:44px;font:800 76px/1 Inter,sans-serif;letter-spacing:.04em;color:var(--lime)">POORLY10</div>
    <div class="btn" id="cta" style="left:48px;top:168px;width:744px;height:96px">${C.cta} <span id="arr">→</span></div>
  </div>
  <div class="a" id="trust" style="left:120px;width:840px;top:1398px;text-align:center;font:600 28px/1.4 var(--sans);color:var(--mute)">Free UK delivery over £39<br>Ordered before 2pm, packed the same working day</div>
  <div class="a" id="url" style="left:120px;width:840px;top:1540px;text-align:center;font:700 38px/1 var(--sans);color:var(--teal)">poorly-pet.com</div>
</section>`;

/* ---------- diagrams for the "what it is" screen (white on teal, lime for the problem) ---------- */
const W70 = 'rgba(255,255,255,.7)', W12 = 'rgba(255,255,255,.12)', W35 = 'rgba(255,255,255,.35)';
const DIAG = {
  // the itch cycle: three stations on a loop, a lime dot keeps going round
  cycle(svg, at) {
    const cx = 540, cy = 1060, r = 190, st = [['Inflamed', -90], ['Scratch', 30], ['Worse', 150]];
    svg.innerHTML = `<circle id="dring" cx="${cx}" cy="${cy}" r="${r}" stroke="${W35}" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>` +
      st.map(([t, a]) => { const x = cx + Math.cos(a * Math.PI / 180) * r, y = cy + Math.sin(a * Math.PI / 180) * r;
        return `<g class="dn" transform="translate(${x} ${y})"><rect x="-120" y="-40" width="240" height="80" rx="40" fill="#0D4541" stroke="${W70}" stroke-width="3"/><text text-anchor="middle" y="12" fill="#fff" font-family="Figtree" font-weight="700" font-size="34">${t}</text></g>`; }).join('') +
      `<circle id="ddot" r="16" fill="#DFE43A"/>`;
    tl.from('#dring', { opacity: 0, rotate: -60, svgOrigin: `${cx} ${cy}`, duration: 1.2, ease: 'expo.out' }, at);
    tl.from('.dn', { scale: 0, opacity: 0, duration: 0.6, stagger: 0.25, ease: 'back.out(2)', transformOrigin: 'center' }, at + 0.4);
    [0, 1, 2].forEach(i => cue(at + 0.4 + i * 0.25, 'pop' + i));
    K.frame(t => { const a = (t - at) * 1.6 - Math.PI / 2; const d = $('#ddot'); if (!d) return; d.setAttribute('cx', cx + Math.cos(a) * r); d.setAttribute('cy', cy + Math.sin(a) * r); d.style.opacity = t > at + 1 ? 1 : 0; });
  },
  // a joint: two bone ends, the lime cartilage between them wears thin
  joint(svg, at) {
    svg.innerHTML = `<path class="bone" d="M380 820 H700 a60 60 0 0 1 0 120 a40 40 0 0 1 -40 40 H420 a40 40 0 0 1 -40 -40 a60 60 0 0 1 0 -120 Z" fill="${W12}" stroke="${W70}" stroke-width="5"/>
      <rect id="cart1" x="420" y="1000" width="240" height="34" rx="17" fill="#DFE43A"/><rect id="cart2" x="420" y="1052" width="240" height="34" rx="17" fill="#DFE43A"/>
      <path class="bone" d="M380 1290 H700 a60 60 0 0 0 0 -120 a40 40 0 0 0 -40 -40 H420 a40 40 0 0 0 -40 40 a60 60 0 0 0 0 120 Z" fill="${W12}" stroke="${W70}" stroke-width="5"/>`;
    tl.from('.bone', { y: (i) => i ? 200 : -200, opacity: 0, duration: 1.0, stagger: 0.1, ease: 'expo.out' }, at); cue(at, 'card');
    tl.from(['#cart1', '#cart2'], { scaleX: 0, transformOrigin: '50% 50%', duration: 0.7, stagger: 0.1, ease: 'back.out(2)' }, at + 0.6);
    tl.to(['#cart1', '#cart2'], { attr: { height: 10, width: 170 }, x: 35, y: (i) => i ? 12 : 12, opacity: 0.8, duration: 1.4, ease: 'power2.inOut' }, at + 1.8); cue(at + 1.8, 'thud');
    tl.to('.bone', { y: (i) => i ? -26 : 26, duration: 1.4, ease: 'power2.inOut' }, at + 1.8);
  },
  // a tooth: plaque builds up at the gum line
  tooth(svg, at) {
    svg.innerHTML = `<rect id="gum" x="300" y="1090" width="480" height="150" rx="60" fill="${W12}" stroke="${W70}" stroke-width="5"/>
      <path id="tooth" d="M430 840 C380 840 360 900 380 980 C395 1040 405 1110 420 1170 C430 1210 470 1210 480 1170 L500 1090 C505 1070 575 1070 580 1090 L600 1170 C610 1210 650 1210 660 1170 C675 1110 685 1040 700 980 C720 900 700 840 650 840 C610 840 590 860 540 860 C490 860 470 840 430 840 Z" fill="#fff" fill-opacity=".92"/>
      <path id="plaque" d="M392 1040 C420 1060 470 1072 540 1072 C610 1072 660 1060 688 1040 L680 1086 C640 1100 600 1104 540 1104 C480 1104 440 1100 400 1086 Z" fill="#DFE43A"/>`;
    tl.from('#tooth', { y: 120, opacity: 0, duration: 1.0, ease: 'expo.out' }, at); cue(at, 'card');
    tl.from('#gum', { y: 80, opacity: 0, duration: 0.9, ease: 'expo.out' }, at + 0.2);
    tl.from('#plaque', { scaleY: 0, transformOrigin: '50% 100%', opacity: 0, duration: 1.4, ease: 'power2.out' }, at + 1.2); cue(at + 1.2, 'swish');
    tl.to('#gum', { fill: 'rgba(240,97,74,.35)', duration: 0.8 }, at + 2.4);
  },
  // a heartbeat that races, then settles
  pulse(svg, at) {
    const pts = n => { let d = 'M100 1060'; for (let i = 0; i < n; i++) { const x = 100 + i * (880 / n); d += ` L${x + 20} 1060 L${x + 40} ${1060 - 160 * (n > 8 ? 1 : 0.5)} L${x + 55} ${1060 + 90 * (n > 8 ? 1 : 0.5)} L${x + 70} 1060`; } return d + ' L980 1060'; };
    svg.innerHTML = `<path id="hb" d="${pts(12)}" stroke="#DFE43A" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path id="hbase" d="M100 1060 H980" stroke="${W35}" stroke-width="3"/>`;
    tl.from('#hb', { drawSVG: '0%', duration: 1.6, ease: 'none' }, at); cue(at, 'tick');
    tl.to('#hb', { attr: { d: pts(5) }, stroke: '#fff', duration: 1.6, ease: 'power2.inOut' }, at + 2.0); cue(at + 2.0, 'swish');
  },
  // a tummy line: choppy, then calm
  gut(svg, at) {
    const wave = (amp, n) => { let d = 'M100 1060'; for (let i = 1; i <= 64; i++) { const x = 100 + i * 880 / 64; d += ` L${x} ${1060 + Math.sin(i * n) * amp * (0.6 + 0.4 * Math.sin(i * 1.7))}`; } return d; };
    svg.innerHTML = `<path id="gw" d="${wave(110, 1.1)}" stroke="#DFE43A" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>` +
      [0, 1, 2, 3, 4, 5].map(i => `<circle class="bub" cx="${220 + i * 130}" cy="${1200 - (i % 3) * 30}" r="${10 + (i % 3) * 6}" stroke="${W70}" stroke-width="3"/>`).join('');
    tl.from('#gw', { drawSVG: '0%', duration: 1.3, ease: 'power2.out' }, at); cue(at, 'swish');
    tl.from('.bub', { y: 60, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'power2.out' }, at + 0.5);
    tl.to('.bub', { y: -140, opacity: 0, duration: 1.6, stagger: 0.12, ease: 'power1.in' }, at + 1.6);
    tl.to('#gw', { attr: { d: wave(18, 0.35) }, stroke: '#fff', duration: 1.6, ease: 'power2.inOut' }, at + 2.2); cue(at + 2.2, 'thud');
  },
};

function build() {
  const segs = id => { $(id).outerHTML = [0, 1, 2, 3, 4].map(i => `<div class="seg" style="left:${120 + i * 172}px;width:152px"><i></i></div>`).join(''); };
  segs('#segs1'); segs('#segs3');
  $('#chips').outerHTML = C.chips.map((c, i) => `<div class="chip" style="left:120px;top:${880 + i * 108}px"><i></i>${c}</div>`).join('');
  $('#prods').outerHTML = C.products.map((p, i) => `
    <div class="pslide" id="ps${i}" style="position:absolute;left:0;top:0;width:1080px;height:1920px">
      <h2 class="hd ptag" style="left:120px;top:350px;font-size:112px">${p.tag}</h2>
      <div class="shadow" id="psh${i}"></div>
      <div class="prod" id="pp${i}" data-img="${p.img}" data-h="${p.h}" data-cx="540" data-floor="1150"></div>
      <div class="pinfo" style="top:1196px">
        <div style="font:700 26px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)">${p.extra}</div>
        <div style="margin-top:16px;font:700 46px/1.1 var(--sans);color:var(--ink)">${p.name}</div>
        <div style="margin-top:12px;font:500 30px/1.35 var(--sans);color:var(--mute)">${p.line}</div>
      </div>
      <div class="a pprice" style="right:120px;top:1196px;font:800 30px/1 var(--sans);color:var(--teal);text-align:right">${String(i + 1).padStart(2, '0')} / 04</div>
      <div class="a" style="left:120px;top:1408px;font:800 64px/1 var(--sans);letter-spacing:-.02em;color:var(--ink)">${p.price}</div>
      <div class="btn add" style="left:560px;top:1392px;width:400px;height:88px;font-size:34px">Add to basket</div>
      ${p.chips.map((c, j) => `<div class="a pchip" style="${j ? 'right:120px;top:780px' : 'left:120px;top:620px'};display:flex;align-items:center;gap:12px;height:72px;padding:0 26px;border-radius:999px;background:#fff;box-shadow:0 18px 36px -22px rgba(14,42,40,.4);font:700 30px/1 var(--sans);color:var(--ink)"><i style="width:14px;height:14px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px rgba(223,228,58,.3)"></i>${c}</div>`).join('')}
    </div>`).join('') + `<div class="a" id="bag" style="right:120px;top:236px;display:flex;align-items:center;gap:14px;height:72px;padding:0 24px;border-radius:999px;background:var(--teal);color:#fff;font:800 30px/1 var(--sans)"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#DFE43A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><span id="bagn">0</span></div>`;
  $('#row').outerHTML = C.products.map((p, i) => `<div class="shadow rsh"></div><div class="prod rp" data-img="${p.img}" data-h="${p.rowH}" data-floor="960"></div>`).join('');
  $('#clist').innerHTML = C.short.map(n => `<div class="cl" style="display:flex;align-items:center;gap:12px;height:62px;padding:0 22px 0 14px;border-radius:999px;background:var(--pale2);font:700 28px/1 var(--sans);color:var(--ink)"><span style="width:36px;height:36px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 10.5 L8.5 14 L15 6.5" fill="none" stroke="#DFE43A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>${n}</div>`).join('');
  K.marquee('#s1band', C.band, 70);
  K.ambient('#s1', ['#F3F6F1', '#E4EED6', '#F3F6F1'], 0); K.ambient('#s2', ['#11524D', '#0D4541', '#11524D'], 1); K.ambient('#s3', ['#F3F6F1', '#F6F8F4', '#EEF3EA'], 2);
  K.ambient('#s4', ['#11524D', '#0D4541', '#11524D'], 3); K.ambient('#s5', ['#EAF0E6', '#FFFFFF', '#E4EED6'], 4); K.ambient('#s6', ['#F3F6F1', '#FFFFFF', '#F3F6F1'], 5);
  $$('.prod').forEach(product);
  C.products.forEach((p, i) => shadow($('#psh' + i), $('#pp' + i), 1.05, 46));
  { const ps = $$('.rp'), gap = 34, tot = ps.reduce((a, p) => a + p.offsetWidth, 0) + gap * (ps.length - 1); let x = 540 - tot / 2;
    ps.forEach((p, i) => { p.style.left = x + 'px'; x += p.offsetWidth + gap; shadow($$('.rsh')[i], p, 1.05, 30); }); }
  $$('.hd').forEach(h => fit(h, 840));

  // S1 hook (composed at frame 0)
  tl.fromTo('#s1h2 em', { backgroundSize: '0% 62%' }, { backgroundSize: '100% 62%', duration: 0.7, ease: 'expo.inOut' }, 0.15); cue(0.15, 'swish');
  lines('#s1p', 0.9, { stagger: 0.03 });
  $$('#s1 .seg i').forEach((s, i) => tl.to(s, { scaleX: 1, duration: 0.35, ease: 'power2.inOut' }, 1.8 + i * 0.12).to(s, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.35, ease: 'power2.inOut' }, 2.6 + i * 0.12));
  tl.to(['#s1h', '#s1h2'], { scale: 1.03, transformOrigin: '0% 50%', duration: 5, ease: 'none' }, 0);
  tl.from('#s1band', { yPercent: 100, duration: 0.9, ease: 'expo.out' }, 1.2);
  const sheet = (from, to, at) => { show(to, at); tl.fromTo('#' + to, { yPercent: 100, borderRadius: 64 }, { yPercent: 0, borderRadius: 0, duration: 0.9, ease: 'power4.inOut' }, at); cue(at + 0.05, 'whoosh');
    tl.to('#' + from, { yPercent: -18, duration: 0.9, ease: 'power4.inOut' }, at); hide(from, at + 0.95); };
  sheet('s1', 's2', 4.4);
  // S2 what it is
  lines('#s2h', 5.0);
  DIAG[C.diagram]($('#diag'), 5.6);
  lines('#s2p', 8.2, { stagger: 0.03 });
  sheet('s2', 's3', 10.4);
  // S3 the five signs
  const T0 = 11.0, STEP = 3.6;
  blurIn('#s3cap', T0 + 0.4);
  tl.from('#numwin', { yPercent: 40, opacity: 0, duration: 1.0, ease: 'expo.out' }, T0 + 0.3);
  for (let i = 0; i < 5; i++) {
    const at = T0 + 0.5 + i * STEP;
    tl.to($$('#s3 .seg i')[i], { scaleX: 1, duration: STEP - 0.3, ease: 'none' }, at);
    if (i > 0) { tl.to('#numcol', { y: -560 * i, duration: 0.8, ease: 'expo.inOut' }, at - 0.35); cue(at - 0.3, 'tick'); }
    lines('#g' + (i + 1), at, { stagger: 0.06 });
    tl.from($$('.cl')[i], { scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, at + 1.0); cue(at + 1.0, 'check' + i);
    cue(at + 0.6, 'pop' + i);
    if (i < 4) out('#g' + (i + 1), at + STEP - 0.45, { y: -30, dur: 0.4 });
  }
  const S4 = T0 + 0.5 + 5 * STEP + 0.2;
  sheet('s3', 's4', S4 - 0.6);
  // S4 what helps
  lines('#s4h', S4);
  lines('#s4q', S4 + 0.8, { stagger: 0.04 });
  $$('.chip').forEach((c, i) => { tl.from(c, { x: -60, opacity: 0, duration: 0.8, ease: 'expo.out' }, S4 + 1.6 + i * 0.22); cue(S4 + 1.6 + i * 0.22, 'pop' + i); });
  const P0 = S4 + 4.6;
  sheet('s4', 's5', P0 - 0.6);
  // S5 products
  const PS = 3.5;
  tl.from('#bag', { scale: 0, duration: 0.6, ease: 'back.out(2)' }, P0);
  $$('.pslide').forEach((s, i) => {
    const at = P0 + i * PS, p = $('#pp' + i), sh = $('#psh' + i);
    if (i > 0) tl.set(s, { visibility: 'hidden' }, 0).set(s, { visibility: 'visible' }, at - 0.5);
    lines(s.querySelector('.ptag'), at, { stagger: 0.05 });
    tl.from(p, { x: 520, rotate: 4, opacity: 0, duration: 1.1, ease: 'expo.out' }, at - 0.35);
    tl.from(sh, { x: 520, opacity: 0, scaleX: 0.6, duration: 1.1, ease: 'expo.out' }, at - 0.35);
    tl.from(s.querySelector('.pinfo'), { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out' }, at + 0.25);
    tl.from(s.querySelectorAll('.a:not(.pchip)'), { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, at + 0.35);
    tl.to(p, { scale: 1.025, duration: PS, ease: 'none' }, at + 0.6);
    s.querySelectorAll('.pchip').forEach((c, j) => { tl.from(c, { scale: 0.6, opacity: 0, y: 20, duration: 0.7, ease: 'back.out(2)' }, at + 0.7 + j * 0.25); cue(at + 0.7 + j * 0.25, 'pop' + (j + 2)); });
    const add = s.querySelector('.add');
    tl.from(add, { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out' }, at + 0.5);
    tl.to(add, { scale: 0.94, duration: 0.09, ease: 'power2.in' }, at + 2.2).to(add, { scale: 1, duration: 0.45, ease: 'elastic.out(1,0.5)' }, at + 2.29);
    tl.to('#bag', { scale: 1.18, duration: 0.12, ease: 'power2.out' }, at + 2.35).to('#bag', { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' }, at + 2.47);
    tl.set('#bagn', { textContent: String(i + 1) }, at + 2.35);
    cue(at - 0.3, 'whoosh'); cue(at + 0.45, 'ding'); cue(at + 2.2, 'click');
    if (i < 3) {
      tl.to([p, sh], { x: -560, opacity: 0, duration: 0.8, ease: 'power3.in' }, at + PS - 0.6);
      tl.to([s.querySelector('.ptag'), s.querySelector('.pinfo'), add, ...s.querySelectorAll('.a')], { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, at + PS - 0.55);
    }
  });
  // S6 end
  const E0 = P0 + 4 * PS + 0.2;
  sheet('s5', 's6', E0 - 0.6);
  lines('#s6h', E0, { stagger: 0.04 });
  tl.from('#tray', { y: 80, opacity: 0, duration: 1.0, ease: 'expo.out' }, E0 + 0.3);
  $$('.rp').forEach((p, i) => { tl.from(p, { y: 70, opacity: 0, duration: 0.9, ease: 'expo.out' }, E0 + 0.55 + i * 0.1); tl.from($$('.rsh')[i], { opacity: 0, duration: 0.9 }, E0 + 0.6 + i * 0.1); });
  tl.from('#offer', { y: 90, opacity: 0, duration: 1.0, ease: 'expo.out' }, E0 + 1.0); cue(E0 + 1.0, 'card');
  blurIn('#trust', E0 + 1.5); blurIn('#url', E0 + 1.7);
  tl.to('#cta', { scale: 0.95, duration: 0.1, ease: 'power2.in' }, PRESS).to('#cta', { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' }, PRESS + 0.1);
  tl.to('#arr', { x: 12, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' }, PRESS + 0.05);
  cue(PRESS, 'click'); cue(PRESS + 0.02, 'confirm');
}
K.start(1080, 1920, DUR, ['500 100px Domine', '700 100px Domine', '500 40px Figtree', '600 40px Figtree', '700 40px Figtree', '800 40px Figtree', '800 40px Inter'], C.products.map(p => p.img), build);
})();
