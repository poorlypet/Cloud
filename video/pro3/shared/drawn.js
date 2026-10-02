/* Drawn condition film: a real photo, a pen sketch over it, then the drawn dog explains the condition.
   Config in window.F (per film), traced lines and pose sizes in window.A (assets/assets.js). */
(() => {
const { $, $$, tl, cue, lines } = K;
const F = window.F, A = window.A, NS = 'http://www.w3.org/2000/svg';
const RED = '#E4574A', TEAL = '#0F4C48', INK = '#2B1A14', LIME = '#DFE43A', PINK = '#F29AA6', CREAM = '#FBF7EF';
const DUR = 53, END = 50.4;

// ---------- helpers ----------
function smooth(p) {
  if (p.length < 3) return 'M' + p.map(q => q.join(' ')).join(' L');
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0]} ${c[1]}`;
  }
  return d;
}
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; }
function div(cls, html, style, parent) { const e = document.createElement('div'); if (cls) e.className = cls; if (html != null) e.innerHTML = html; Object.assign(e.style, style || {}); (parent || $('#stage')).appendChild(e); return e; }
function draw(e, at, dur = 0.6, ease = 'power2.inOut') { tl.fromTo(e, { drawSVG: '0%' }, { drawSVG: '100%', duration: dur, ease, immediateRender: true }, at); }
function write(e, at, dur = 0.8) { tl.fromTo(e, { clipPath: 'inset(-30% 100% -30% -2%)', opacity: 1 }, { clipPath: 'inset(-30% -2% -30% -2%)', duration: dur, ease: 'none', immediateRender: true }, at); cue(at, 'draw'); }
function fadeOut(e, at, d = 0.4) { tl.to(e, { opacity: 0, y: -24, duration: d, ease: 'power2.in' }, at); }
function popIn(e, at, d = 0.45) { tl.fromTo(e, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2.4)', immediateRender: true }, at); }
function gone(e, at, d = 0.3) { if (at < DUR) tl.to(e, { opacity: 0, duration: d }, at); }
function hop(e, at, h = 70) {
  tl.to(e, { y: -h, scaleY: 1.05, scaleX: 0.97, duration: 0.22, ease: 'power2.out' }, at)
    .to(e, { y: 0, scaleY: 1, scaleX: 1, duration: 0.2, ease: 'power2.in' }, at + 0.22)
    .to(e, { scaleY: 0.93, scaleX: 1.04, duration: 0.07, ease: 'power1.out' }, at + 0.42)
    .to(e, { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'elastic.out(1,.4)' }, at + 0.49);
  cue(at + 0.42, 'pop');
}
function hand(txt, x, y, size, col, parent) { const q = document.createElement('p'); q.className = 'hand'; q.innerHTML = txt; Object.assign(q.style, { left: x + 'px', top: y + 'px', fontSize: size + 'px', color: col || INK }); (parent || $('#fxh')).appendChild(q); gsap.set(q, { opacity: 0 }); return q; }
function headline(id, html, size, top, o = {}) {
  const h = document.createElement('h2'); h.className = 'hd' + (o.ctr ? ' ctr' : ''); h.id = id; h.innerHTML = html;
  Object.assign(h.style, { left: (o.ctr ? 60 : 120) + 'px', top: top + 'px', fontSize: size + 'px' }); if (o.ctr) h.style.width = '960px';
  $('#stage').appendChild(h); K.fit(h, o.ctr ? 960 : 840); gsap.set(h, { opacity: 0 }); return h;
}
function say(h, at, out) { tl.set(h, { opacity: 1 }, at); lines(h, at, { mk: 0.7 }); if (out) fadeOut(h, out); }
const box = (b, pose) => { const [nw, nh] = A.poses[pose]; return { x: b.x, y: b.y, w: b.w, h: b.w * nh / nw }; };
const P = (b, fx, fy) => [b.x + fx * b.w, b.y + fy * b.h];
function place(d, b) { gsap.set(d, { left: b.x, top: b.y, width: b.w, height: b.h }); }
function moveTo(d, b, at, dur = 0.9) { tl.to(d, { left: b.x, top: b.y, width: b.w, height: b.h, duration: dur, ease: 'power3.inOut' }, at); }

// ---------- DOM ----------
const S = $('#stage');
S.insertAdjacentHTML('beforeend', `
  <svg id="grain" width="1080" height="1920"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .47  0 0 0 0 .38  0 0 0 .5 0"/></filter><rect width="1080" height="1920" filter="url(#gn)"/></svg>
  <div id="pol"><div id="tape"></div><div id="ph"><img id="photo" src="assets/photo.jpg"><img id="toon" src="assets/toon.jpg"><svg id="lines" viewBox="0 0 ${A.w} ${A.h}" fill="none"></svg></div>
    <p class="hand ctr" id="polcap" style="left:0;font-size:64px">${F.caption}</p></div>
  <div class="dog" id="dogB"><div class="in" id="dogBIn"><img src="assets/${F.poseB}.png"><svg id="dogBSvg" viewBox="0 0 ${A.poses[F.poseB][0]} ${A.poses[F.poseB][1]}"></svg></div></div>
  <div class="dog" id="dogC"><div class="in" id="dogCIn"><img src="assets/${F.poseC}.png"></div></div>
  <svg class="a" id="fx" width="1080" height="1920" style="left:0;top:0;overflow:visible"></svg>
  <div id="fxh"></div>
  <div id="prods"></div>`);
const fx = $('#fx');

// decode the drawings first so the timeline is built against loaded images
window.ready = Promise.all($$('#stage img').map(i => i.decode().catch(() => {}))).then(() => { K.start(1080, 1920, DUR, ['500 80px Domine', '700 80px Domine', '700 40px Figtree', '600 40px Figtree', '800 40px Figtree', '700 60px Caveat', '800 60px Inter'], F.products.map(p => p.img), build); return window.ready; });

function build() {
  window.END = END;
  // ===== polaroid geometry from the photo's aspect =====
  const ar = A.w / A.h; let pw = ar > 1 ? 900 : 760, ph = pw / ar; if (ph > 770) { ph = 770; pw = ph * ar; }
  const polW = pw + 80, polH = ph + 140, polX = (1080 - polW) / 2, polY = Math.max(590, 590 + (910 - polH) / 2);
  gsap.set('#pol', { left: polX, top: polY, width: polW, height: polH });
  gsap.set('#ph', { width: pw, height: ph }); gsap.set('#tape', { left: polW / 2 - 90 });
  gsap.set('#polcap', { width: polW, top: 40 + ph + 14, opacity: 0 });

  const h1 = headline('h1', F.hook, 108, 226), h2 = headline('h2', 'Let’s <em>draw</em><br>it out.', 124, 250);
  // traced pen lines in drawing coordinates
  const sw = 3.8 * A.w / pw;
  const lineEls = A.paths.map(p => el('path', { d: smooth(p.d), stroke: INK, 'stroke-width': Math.max(sw, p.w * 0.8).toFixed(1), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $('#lines')));
  const lens = lineEls.map(e => e.getTotalLength());

  // ===== S1: the real photo =====
  tl.fromTo('#pol', { y: -160, rotation: -10, opacity: 0 }, { y: 0, rotation: -2.5, opacity: 1, duration: 1.1, ease: 'back.out(1.3)' }, 0.15); cue(0.45, 'card');
  say(h1, 0.5, 3.0);
  write('#polcap', 1.5, 0.9);
  tl.fromTo('#photo', { scale: 1.08 }, { scale: 1, duration: 3.4, ease: 'power1.out' }, 0.2);

  // ===== S2: draw it =====
  tl.to('#pol', { rotation: 0, duration: 0.7, ease: 'power3.inOut' }, 3.0);
  say(h2, 3.25, 7.0);
  let t = 3.45; const st = Math.min(0.045, 2.0 / lineEls.length);
  lineEls.forEach((e, i) => { draw(e, t, Math.min(0.75, Math.max(0.18, lens[i] / (A.w * 0.9))), 'power1.inOut'); t += st; });
  [3.5, 4.0, 4.5, 5.0].forEach(x => cue(x, 'draw'));
  tl.fromTo('#photo', { filter: 'grayscale(0) brightness(1) contrast(1)', opacity: 1 }, { filter: 'grayscale(1) brightness(1.5) contrast(.55)', opacity: 0.4, duration: 1.0, ease: 'power1.inOut', immediateRender: false }, 4.5);
  tl.fromTo('#toon', { '--r': -15 }, { '--r': 100, duration: 1.1, ease: 'power2.inOut', immediateRender: true }, 5.75); cue(5.75, 'reveal');
  tl.to('#lines', { opacity: 0, duration: 0.5 }, 6.4);
  tl.to('#pol', { opacity: 0, scale: 0.92, y: 60, duration: 0.5, ease: 'power2.in' }, 7.0);

  // ===== S3: meet the condition =====
  const B = box(F.dogB, F.poseB); place('#dogB', B); gsap.set(['#dogB', '#dogC'], { opacity: 0 });
  tl.fromTo('#dogB', { opacity: 0, scale: 0.6, y: 140 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)', immediateRender: false }, 7.3); cue(7.3, 'whoosh');
  hop('#dogBIn', 8.05, 60);
  say(headline('h3', F.s3.h3, 92, 236), 8.2, 11.3);
  F.s3.fx && F.s3.fx(B, 9.4, 14.2);
  say(headline('h4', F.s3.h4, 92, 236), 11.6, 14.2);

  // ===== S4: what happens (explainer) =====
  const B4 = F.s4.dog ? box(F.s4.dog, F.poseB) : B;
  if (F.s4.dog) moveTo('#dogB', B4, 14.3);
  say(headline('h5', F.s4.h5, 86, 226), 14.75, 18.6);
  EXPLAIN[F.s4.kind](B4, 15.2, 21.0);
  say(headline('h6', F.s4.h6, 80, 226), 18.85, 21.0);
  if (F.s4.dog) moveTo('#dogB', B, 21.0, 0.8);

  // ===== S5: five signs =====
  const st5 = hand('5 signs to watch for', 120, 214, 84, TEAL, S); write(st5, 21.5, 0.9);
  const signT = [22.4, 24.7, 27.0, 29.3, 31.6];
  F.signs.forEach((s, i) => {
    const at = signT[i], out = i < 4 ? signT[i + 1] - 0.35 : 34.0;
    const n = div('num', `<svg width="132" height="132" viewBox="0 0 118 118" style="position:absolute;overflow:visible"><path class="doo" style="stroke:var(--teal);stroke-width:6" d="M60 8 C 92 6, 112 30, 110 60 C 108 92, 84 112, 56 110 C 26 108, 8 86, 9 57 C 10 30, 30 12, 66 10"/></svg><span>${i + 1}</span>`, { left: '108px', top: '338px' });
    const h = document.createElement('h2'); h.className = 'hd'; h.innerHTML = s.t; Object.assign(h.style, { left: '272px', top: '336px', fontSize: '88px' }); S.appendChild(h); K.fit(h, 690);
    gsap.set([n, h], { opacity: 0 }); tl.set([n, h], { opacity: 1 }, at);
    draw(n.querySelector('path'), at, 0.45); tl.from(n.querySelector('span'), { scale: 0, duration: 0.4, ease: 'back.out(2.5)' }, at + 0.2);
    lines(h, at + 0.05, { mk: 0.6 }); cue(at, 'check' + i);
    tl.to([n, h], { opacity: 0, duration: 0.3, ease: 'power2.in' }, out);
    (s.d || []).forEach((d, k) => DOODLE[d.k](B, d, at + 0.45 + k * 0.25, out));
    if (s.r) REACT[s.r](at + 0.5, out);
  });
  gone(st5, 34.0, 0.35);

  // ===== S6: what can help =====
  tl.to('#dogB', { left: -1200, duration: 0.7, ease: 'power3.in' }, 34.0); cue(34.0, 'whoosh');
  say(headline('h7', 'What can <em>help.</em>', 124, 226), 34.5);
  const rest = hand(F.rest, 60, 720, 104, INK, S); Object.assign(rest.style, { width: '960px', textAlign: 'center', lineHeight: '1.1' });
  write(rest, 35.2, 1.1);
  const ru = el('path', { class: 'doo', d: 'M300 990 C 450 966, 640 964, 790 984', style: 'stroke:var(--lime);stroke-width:16' }, fx); draw(ru, 36.2, 0.4);
  gone([rest, ru], 37.0);
  const pT = [37.2, 39.4, 41.6, 43.8];
  F.products.forEach((p, i) => {
    const at = pT[i], im = K.IM[p.img], k = Math.min(520 / im.naturalWidth, (p.maxH || 520) / im.naturalHeight), w = im.naturalWidth * k, hh = im.naturalHeight * k, cy = 900;
    const b = div('prodimg', `<img src="${im.src}">`, { left: 540 - w / 2 + 'px', top: cy - hh / 2 + 'px', width: w + 'px', height: hh + 'px' }, $('#prods'));
    const tag = hand(p.tag, 60, 418, 84, INK, $('#prods')); Object.assign(tag.style, { width: '960px', textAlign: 'center' });
    const nm = div('pname', p.name, { top: '1262px' }, $('#prods')), pr = div('pprice', p.price, { top: '1336px' }, $('#prods'));
    const ring = el('path', { class: 'doo', d: `M560 ${cy - 330} C 770 ${cy - 330}, 885 ${cy - 160}, 880 ${cy + 10} C 870 ${cy + 220}, 710 ${cy + 335}, 530 ${cy + 330} C 330 ${cy + 325}, 195 ${cy + 180}, 202 ${cy - 10} C 210 ${cy - 210}, 360 ${cy - 335}, 600 ${cy - 322}`, style: 'stroke:var(--teal);stroke-width:9' }, fx);
    gsap.set([b, nm, pr], { opacity: 0 });
    draw(ring, at, 0.6); cue(at, 'draw');
    tl.fromTo(b, { opacity: 0, scale: 0.6, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, at + 0.1); cue(at + 0.2, 'pop' + i);
    write(tag, at + 0.25, 0.6);
    tl.fromTo(nm, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, at + 0.4);
    tl.fromTo(pr, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, at + 0.55); cue(at + 0.55, 'tick');
    tl.to(b, { y: -10, duration: 1.2, ease: 'sine.inOut' }, at + 0.7);
    tl.to([b, tag, nm, pr, ring], { opacity: 0, duration: 0.25, ease: 'power2.in' }, at + 2.0);
  });

  // ===== S7: end =====
  fadeOut('#h7', 45.8);
  say(headline('h8', `Find the right support<br>for your dog’s <em>${F.endWord}.</em>`, 84, 226, { ctr: true }), 46.1);
  const C = box(F.dogC, F.poseC); place('#dogC', C);
  tl.fromTo('#dogC', { opacity: 0, y: 500 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: false }, 46.0); cue(46.0, 'lift');
  if (F.endHop !== false) hop('#dogCIn', 46.9, 50);
  (F.endFx || [[C.x - 110, C.y + 190, 'heart'], [C.x + C.w + 110, C.y + 150, 'heart']]).forEach(([x, y, k], j) => DOODLE[k](null, { xy: [x, y] }, 47.4 + j * 0.15, 99));
  S.insertAdjacentHTML('beforeend', `<div id="coupon"><div class="l">10% off your<br>first order</div><div class="c">POORLY10</div></div>
    <div class="btn" id="cta" style="left:120px;top:1330px;width:840px;height:112px;font-size:44px">Shop poorly-pet.com <span id="arr">→</span></div>
    <div class="a ctr" id="trust" style="left:120px;width:840px;top:1462px;font:600 30px/1.3 var(--sans);color:var(--mute)">Free UK delivery over £39</div>`);
  tl.fromTo('#coupon', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.8)' }, 47.6); cue(47.65, 'stamp');
  tl.fromTo('#cta', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 48.1); cue(48.1, 'card');
  tl.fromTo('#trust', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 48.5);
  tl.to('#arr', { x: 14, duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 48.6);
  tl.to('#cta', { scale: 0.96, duration: 0.09, ease: 'power2.in' }, END).to('#cta', { scale: 1, duration: 0.35, ease: 'back.out(3)' }, END + 0.09); cue(END, 'click'); cue(END + 0.1, 'confirm');

  // alive: gentle breathing
  K.frame(tt => { const b = Math.sin(tt * 2.6); for (const e of $$('#dogBIn > img, #dogBIn > svg, #dogCIn > img')) { e.style.transform = `scaleY(${1 + 0.008 * b})`; e.style.transformOrigin = '50% 100%'; } });
}

// ---------- dog reactions ----------
const REACT = {
  hunch: (at) => tl.to('#dogBIn', { scaleY: 0.965, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at),
  jolt: (at) => tl.to('#dogBIn', { y: -30, duration: 0.08, yoyo: true, repeat: 3, ease: 'power1.inOut' }, at),
  lean: (at, out) => tl.to('#dogBIn', { x: 26, duration: 0.5, ease: 'power2.out' }, at + 0.4).to('#dogBIn', { x: 0, duration: 0.5, ease: 'power2.inOut' }, out - 0.5),
  pace: (at) => tl.to('#dogBIn', { x: -40, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at),
  wobble: (at) => tl.to('#dogBIn', { rotation: 1.8, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut', transformOrigin: '50% 100%' }, at).to('#dogBIn', { rotation: 0, duration: 0.2 }, at + 1.1),
  shake: (at) => tl.to('#dogBIn', { x: 7, duration: 0.05, yoyo: true, repeat: 15, ease: 'none' }, at).to('#dogBIn', { x: 0, duration: 0.05 }, at + 0.8),
  sink: (at, out) => tl.to('#dogBIn', { rotation: -2.2, y: 16, duration: 0.6, ease: 'power2.out', transformOrigin: '85% 100%' }, at).to('#dogBIn', { rotation: 0, y: 0, duration: 0.4 }, out),
  slow: (at, out) => tl.to('#dogBIn', { y: 18, scaleY: 0.96, duration: 0.5, ease: 'power2.out' }, at).to('#dogBIn', { y: 0, scaleY: 1, duration: 1.2, ease: 'power1.inOut' }, at + 0.7),
};

// ---------- doodle library (positions in pose fractions, or xy in stage px) ----------
const at2 = (B, d) => d.xy ? d.xy : P(B, d.p[0], d.p[1]);
const DOODLE = {
  marks(B, d, at, out) { const [x, y] = at2(B, d), s = d.s || 1; [[-110, -40, -150, -130], [0, -55, 0, -160], [110, -40, 150, -130]].forEach(([a, b, c, e], k) => { const p = el('path', { class: 'doo', d: `M${x + a * s} ${y + b * s} L${x + c * s} ${y + e * s}`, style: `stroke:${RED};stroke-width:13` }, fx); draw(p, at + k * 0.08, 0.25); gone(p, out); }); cue(at, 'scratch'); },
  bubble(B, d, at, out) { const [x, y] = at2(B, d), s = d.dir || 1, w = d.w || 260;
    const p = el('path', { class: 'doo', style: `stroke:${d.c || RED};stroke-width:9`, d: `M${x} ${y} L${x + s * 40} ${y - 80} C ${x + s * (40 + w)} ${y - 60}, ${x + s * (40 + w)} ${y - 230}, ${x + s * (20 + w / 2)} ${y - 230} C ${x - s * 60} ${y - 230}, ${x - s * 70} ${y - 100}, ${x + s * 10} ${y - 84} Z` }, fx); draw(p, at, 0.5); gone(p, out);
    const q = hand(d.t, s > 0 ? x + 20 : x - 20 - w * 0.8, y - 205, d.size || 92, d.c || RED); write(q, at + 0.35, 0.45); gone(q, out); cue(at + 0.35, 'pop3'); },
  stairs(B, d, at, out) { const [x0, y0] = at2(B, d), u = d.u || 70; let p = `M${x0 - 40} ${y0} L${x0} ${y0}`; for (let k = 0; k < 4; k++) p += ` L${x0 + k * u} ${y0 - (k + 1) * u * 0.86} L${x0 + (k + 1) * u} ${y0 - (k + 1) * u * 0.86}`; p += ` L${x0 + 4 * u} ${y0}`;
    const e = el('path', { class: 'doo', d: p, style: 'stroke-width:11' }, fx); draw(e, at, 0.9); gone(e, out); cue(at, 'draw'); },
  wobble(B, d, at, out) { const [x, y] = at2(B, d), r = d.r || 150; [[-r, -1], [r, 1]].forEach(([dx, s], k) => [0, 1].forEach(j => { const e = el('path', { class: 'doo', style: 'stroke-width:11', d: `M${x + dx + s * j * 34} ${y - 80} C ${x + dx + s * (44 + j * 34)} ${y - 30}, ${x + dx + s * (44 + j * 34)} ${y + 30}, ${x + dx + s * j * 34} ${y + 80}` }, fx); draw(e, at + (k * 2 + j) * 0.07, 0.3); gone(e, out); })); },
  bang(B, d, at, out) { const [x, y] = at2(B, d), q = hand('!', x, y, d.size || 220, RED); tl.fromTo(q, { opacity: 0, scale: 0.2, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(3)', immediateRender: false }, at); gone(q, out); cue(at, 'thud'); },
  q(B, d, at, out) { const [x, y] = at2(B, d), q = hand('?', x, y, d.size || 160, TEAL); tl.fromTo(q, { opacity: 0, scale: 0.3, rotation: -12 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.5)', immediateRender: false }, at); gone(q, out); },
  txt(B, d, at, out) { const [x, y] = at2(B, d), q = hand(d.t, x, y, d.size || 80, d.c || INK); if (d.rot) q.style.transform = `rotate(${d.rot}deg)`; write(q, at, d.dur || 0.6); gone(q, out); },
  zzz(B, d, at, out) { const [x, y] = at2(B, d); ['z', 'z', 'Z'].forEach((z, k) => { const q = hand(z, x + k * 46, y - k * 58, 64 + k * 22, TEAL); tl.fromTo(q, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, at + k * 0.25); tl.to(q, { y: -16, duration: 1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + 0.5 + k * 0.25); gone(q, out); }); },
  moon(B, d, at, out) { const [x, y] = at2(B, d), e = el('path', { class: 'doo', style: `stroke:${TEAL};stroke-width:9`, d: `M${x} ${y - 60} C ${x - 70} ${y - 50}, ${x - 80} ${y + 50}, ${x} ${y + 60} C ${x - 40} ${y + 30}, ${x - 40} ${y - 30}, ${x} ${y - 60}` }, fx); draw(e, at, 0.5); gone(e, out); },
  stink(B, d, at, out) { const [x, y] = at2(B, d), s = d.dir || 1; [0, 1, 2].forEach(k => { const x0 = x + k * 38 * s, e = el('path', { class: 'doo', style: 'stroke:#7FA83A;stroke-width:9', d: `M${x0} ${y} C ${x0 + 30 * s} ${y - 40}, ${x0 - 20 * s} ${y - 80}, ${x0 + 14 * s} ${y - 120} S ${x0 + 30 * s} ${y - 200}, ${x0 + 50 * s} ${y - 230}` }, fx); draw(e, at + k * 0.12, 0.55); tl.to(e, { y: -14, duration: 0.8, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + 0.6); gone(e, out); }); },
  lick(B, d, at, out) { const [x, y] = at2(B, d); [[-60, -30], [40, -50], [0, 30]].forEach(([dx, dy], k) => { const e = el('path', { class: 'doo', style: `stroke:${PINK};stroke-width:9`, d: `M${x + dx - 34} ${y + dy} q 17 -22 34 0 t 34 0` }, fx); draw(e, at + k * 0.15, 0.3); gone(e, out); });
    [[70, 40], [90, 90]].forEach(([dx, dy], k) => { const c = el('path', { d: `M${x + dx} ${y + dy - 18} C ${x + dx + 12} ${y + dy}, ${x + dx + 10} ${y + dy + 14}, ${x + dx} ${y + dy + 14} C ${x + dx - 10} ${y + dy + 14}, ${x + dx - 12} ${y + dy}, ${x + dx} ${y + dy - 18}`, fill: '#8FC7E8', stroke: INK, 'stroke-width': 4 }, fx); popIn(c, at + 0.4 + k * 0.15); gone(c, out); }); },
  flakes(B, d, at, out) { const [x, y] = at2(B, d); for (let k = 0; k < 9; k++) { const fx0 = x + ((k * 137) % 420) - 210, fy0 = y - 200 + (k % 3) * 50, c = el('path', { d: `M${fx0 - 20} ${fy0} L${fx0 + 20} ${fy0} M${fx0} ${fy0 - 20} L${fx0} ${fy0 + 20} M${fx0 - 14} ${fy0 - 14} L${fx0 + 14} ${fy0 + 14} M${fx0 + 14} ${fy0 - 14} L${fx0 - 14} ${fy0 + 14}`, stroke: '#8A98A3', 'stroke-width': 7, 'stroke-linecap': 'round' }, fx);
    tl.fromTo(c, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3, immediateRender: true }, at + k * 0.08); tl.to(c, { y: 260 + (k % 4) * 40, rotation: 90, svgOrigin: `${fx0} ${fy0}`, duration: 1.6, ease: 'none' }, at + 0.3 + k * 0.08); gone(c, out); } cue(at, 'shimmer'); },
  blush(B, d, at, out) { (d.pts || [d.p]).forEach((p, k) => { const [x, y] = P(B, p[0], p[1]), c = el('ellipse', { cx: x, cy: y, rx: d.rx || 60, ry: (d.rx || 60) * 0.6, fill: d.c || '#F06A7A', opacity: 0 }, fx); tl.to(c, { opacity: 0.55, duration: 0.4 }, at + k * 0.15); tl.to(c, { opacity: 0.3, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + 0.5); gone(c, out); }); },
  steps(B, d, at, out) { const [x, y] = at2(B, d); for (let k = 0; k < 6; k++) { const px = x + k * 120, py = y + (k % 2 ? 26 : -26), g = el('g', { opacity: 0 }, fx);
    el('ellipse', { cx: px, cy: py, rx: 22, ry: 18, fill: INK }, g); [[-22, -26], [-7, -34], [9, -34], [24, -26]].forEach(([a, b]) => el('circle', { cx: px + a, cy: py + b, r: 7.5, fill: INK }, g));
    tl.to(g, { opacity: 0.85, duration: 0.15 }, at + k * 0.18); tl.to(g, { opacity: 0, duration: 0.4 }, at + 0.9 + k * 0.18); } cue(at, 'tick'); },
  tremble(B, d, at, out) { const [x, y] = at2(B, d), r = d.r || 260; [-1, 1].forEach(s => [0, 1, 2].forEach(j => { const e = el('path', { class: 'doo', style: 'stroke-width:9', d: `M${x + s * (r + j * 30)} ${y - 50 + j * 10} q ${s * 14} 22 0 44 t 0 44` }, fx); draw(e, at + j * 0.08, 0.25); gone(e, out); })); },
  tear(B, d, at, out) { const [x, y] = at2(B, d), g = el('g', {}, fx);
    el('path', { d: `M${x - 120} ${y - 60} C ${x - 130} ${y - 90}, ${x + 130} ${y - 90}, ${x + 120} ${y - 60} C ${x + 140} ${y}, ${x + 140} ${y + 40}, ${x + 120} ${y + 70} C ${x + 130} ${y + 100}, ${x - 130} ${y + 100}, ${x - 120} ${y + 70} C ${x - 140} ${y + 40}, ${x - 140} ${y}, ${x - 120} ${y - 60} Z`, fill: '#F3D9A4', stroke: INK, 'stroke-width': 8 }, g);
    el('path', { class: 'doo', d: `M${x - 60} ${y - 20} L${x - 30} ${y + 10} L${x - 5} ${y - 20} L${x + 20} ${y + 12} L${x + 50} ${y - 16}`, style: 'stroke-width:8' }, g);
    [[-40, -70], [10, -95], [55, -75]].forEach(([a, b]) => el('circle', { cx: x + a, cy: y + b, r: 16, fill: '#fff', stroke: INK, 'stroke-width': 5 }, g));
    popIn(g, at, 0.5); tl.to(g, { rotation: 6, svgOrigin: `${x} ${y}`, duration: 0.12, yoyo: true, repeat: 5 }, at + 0.5); gone(g, out); cue(at, 'scratch'); },
  car(B, d, at, out) { const [x, y] = at2(B, d), e = el('path', { class: 'doo', style: `stroke:${TEAL};stroke-width:10`, d: `M${x - 140} ${y + 20} L${x - 140} ${y - 20} C ${x - 140} ${y - 40}, ${x - 110} ${y - 44}, ${x - 90} ${y - 46} L${x - 60} ${y - 100} C ${x - 50} ${y - 115}, ${x + 50} ${y - 115}, ${x + 60} ${y - 100} L${x + 95} ${y - 46} C ${x + 130} ${y - 44}, ${x + 145} ${y - 30}, ${x + 145} ${y} L${x + 145} ${y + 20} Z M${x - 80} ${y + 20} m -28 0 a 28 28 0 1 0 56 0 a 28 28 0 1 0 -56 0 M${x + 82} ${y + 20} m -28 0 a 28 28 0 1 0 56 0 a 28 28 0 1 0 -56 0` }, fx);
    draw(e, at, 0.8); tl.to(e, { x: 8, duration: 0.15, yoyo: true, repeat: 7, ease: 'sine.inOut' }, at + 0.8); gone(e, out); cue(at, 'draw'); },
  arrow(B, d, at, out) { const [x, y] = at2(B, d), [dx, dy] = d.from || [-220, -160], x0 = x + dx, y0 = y + dy, mx = x0 + dx * -0.1, my = y + dy * 0.2;
    const e = el('path', { class: 'doo', style: `stroke:${d.c || TEAL};stroke-width:9`, d: `M${x0} ${y0} C ${mx} ${y0 + (y - y0) * 0.1}, ${x - dx * 0.25} ${my}, ${x} ${y}` }, fx);
    const ang = Math.atan2(y - my, x - (x - dx * 0.25)), hx = (a) => x - 34 * Math.cos(ang + a), hy = (a) => y - 34 * Math.sin(ang + a);
    const h = el('path', { class: 'doo', style: `stroke:${d.c || TEAL};stroke-width:9`, d: `M${hx(0.5)} ${hy(0.5)} L${x} ${y} L${hx(-0.5)} ${hy(-0.5)}` }, fx);
    draw(e, at, 0.5); draw(h, at + 0.45, 0.15); gone([e, h], out);
    if (d.t) { const q = hand(d.t, x0 + (d.tx || -40), y0 + (d.ty || -96), d.size || 76, d.c || TEAL); write(q, at + 0.3, 0.5); gone(q, out); } },
  kibble(B, d, at, out) { const [x, y] = at2(B, d); for (let k = 0; k < 4; k++) { const c = el('circle', { cx: x + (k - 1.5) * 40, cy: y, r: 16, fill: '#A0662E', stroke: INK, 'stroke-width': 4 }, fx);
    tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: true }, at + k * 0.2); tl.to(c, { y: 230, duration: 0.6, ease: 'power2.in' }, at + k * 0.2); tl.to(c, { y: 205, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.out' }, at + 0.6 + k * 0.2); gone(c, out); } cue(at + 0.6, 'pop2'); },
  paw(B, d, at, out) { const [x, y] = at2(B, d), g = el('g', {}, fx);
    el('ellipse', { cx: x, cy: y, rx: 44, ry: 36, fill: '#C98B4A', stroke: INK, 'stroke-width': 6 }, g); [[-46, -50], [-16, -68], [18, -68], [48, -50]].forEach(([a, b]) => el('ellipse', { cx: x + a, cy: y + b, rx: 15, ry: 18, fill: '#C98B4A', stroke: INK, 'stroke-width': 5 }, g));
    popIn(g, at); tl.to(g, { x: -30, y: -20, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, at + 0.45);
    [0, 1, 2].forEach(k => { const e = el('path', { class: 'doo', style: 'stroke-width:8', d: `M${x + 80} ${y - 40 + k * 34} l 50 -14` }, fx); draw(e, at + 0.3 + k * 0.08, 0.2); gone(e, out); }); gone(g, out); },
  swirl(B, d, at, out) { const [x, y] = at2(B, d); let p = `M${x} ${y}`; for (let a = 0; a < 14; a++) { const r = 9 + a * 6.5, t = a * 0.9; p += ` L${(x + r * Math.cos(t)).toFixed(1)} ${(y + r * Math.sin(t) * 0.6).toFixed(1)}`; }
    const e = el('path', { class: 'doo', d: p, style: `stroke:${d.c || '#7FA83A'};stroke-width:8` }, fx); draw(e, at, 0.6); tl.to(e, { rotation: 360, svgOrigin: `${x} ${y}`, duration: 1.4, ease: 'none' }, at + 0.6); gone(e, out); },
  wind(B, d, at, out) { const [x, y] = at2(B, d), [sx, sy] = d.step || [-85, -26]; [0, 1, 2].forEach(k => { const cx = x + (k + 1) * sx, cy = y + (k + 1) * sy, r = 34 + k * 12, g = el('path', { d: `M${cx - r} ${cy} a ${r} ${r * 0.8} 0 1 1 ${2 * r} 0 a ${r * 0.6} ${r * 0.5} 0 1 1 ${-r} ${r * 0.3} a ${r * 0.6} ${r * 0.5} 0 1 1 ${-r} ${-r * 0.3} Z`, fill: '#E6EEC9', stroke: '#7FA83A', 'stroke-width': 6 }, fx);
    tl.fromTo(g, { opacity: 0, scale: 0.3, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: true }, at + k * 0.18); tl.to(g, { x: -40, opacity: 0, duration: 0.8 }, out - 0.6); }); cue(at, 'whoosh'); },
  bowl(B, d, at, out) { const [x, y] = at2(B, d), e = el('path', { d: `M${x - 110} ${y - 30} L${x + 110} ${y - 30} C ${x + 100} ${y + 40}, ${x + 70} ${y + 50}, ${x} ${y + 50} C ${x - 70} ${y + 50}, ${x - 100} ${y + 40}, ${x - 110} ${y - 30} Z`, fill: '#9ED2CF', stroke: INK, 'stroke-width': 8 }, fx);
    popIn(e, at, 0.5); gone(e, out); DOODLE.q(B, { xy: [x + 90, y - 230], size: 130 }, at + 0.5, out); },
  heart(B, d, at, out) { const [x, y] = at2(B, d), e = el('path', { class: 'doo', d: `M${x} ${y + 45} C ${x - 75} ${y - 15}, ${x - 45} ${y - 90}, ${x} ${y - 45} C ${x + 45} ${y - 90}, ${x + 75} ${y - 15}, ${x} ${y + 45}`, style: 'stroke:#E4574A;stroke-width:10' }, fx); draw(e, at, 0.5); if (out < 90) gone(e, out); },
  up(B, d, at, out) { const [x, y] = at2(B, d), e = el('path', { class: 'doo', style: `stroke:${TEAL};stroke-width:11`, d: `M${x} ${y} L${x} ${y - 200} M${x - 50} ${y - 150} L${x} ${y - 200} L${x + 50} ${y - 150}` }, fx); draw(e, at, 1.4, 'power1.in'); gone(e, out);
    const q = hand('…', x + 40, y - 120, 110, TEAL); write(q, at + 0.4, 0.8); gone(q, out); },
  speed(B, d, at, out) { const [x, y] = at2(B, d); [0, 1, 2].forEach(k => { const e = el('path', { class: 'doo', style: 'stroke-width:9', d: `M${x} ${y + k * 60} l ${-(110 - k * 20)} 0` }, fx); draw(e, at + k * 0.1, 0.3); gone(e, out); }); },
  rumble(B, d, at, out) { const [x, y] = at2(B, d); [[-1, 0], [1, 0]].forEach(([s]) => [0, 1].forEach(j => { const e = el('path', { class: 'doo', style: 'stroke:#C9773C;stroke-width:9', d: `M${x + s * (150 + j * 34)} ${y - 46} q ${s * 18} 23 0 46 t 0 46` }, fx); draw(e, at + j * 0.1, 0.3); tl.to(e, { x: s * 6, duration: 0.07, yoyo: true, repeat: 11 }, at + 0.3); gone(e, out); }));
    if (d.t) DOODLE.txt(B, { xy: [x - 120, y + 70], t: d.t, c: '#C9773C', size: 84 }, at + 0.3, out); cue(at, 'roll'); },
  glow(B, d, at, out) { (d.pts).forEach((p, k) => { const [x, y] = P(B, p[0], p[1]), r = d.r || 46;
    const c = el('circle', { cx: x, cy: y, r, fill: RED, opacity: 0 }, fx), ring = el('circle', { cx: x, cy: y, r, fill: 'none', stroke: RED, 'stroke-width': 6, opacity: 0 }, fx);
    tl.to(c, { opacity: 0.45, duration: 0.3 }, at + k * 0.2); tl.to(c, { attr: { r: r * 0.75 }, duration: 0.45, yoyo: true, repeat: 5, ease: 'sine.inOut' }, at + 0.3 + k * 0.2);
    tl.fromTo(ring, { attr: { r }, opacity: 0.9 }, { attr: { r: r * 2.4 }, opacity: 0, duration: 1.0, repeat: 2, ease: 'power2.out', immediateRender: false }, at + k * 0.2);
    gone([c, ring], out); cue(at + k * 0.2, 'pop' + k);
    if (p[2]) { const q = hand(p[2], x + (p[3] || 0), y + (p[4] || -110), 84, RED); write(q, at + 0.2 + k * 0.2, 0.4); gone(q, out); } }); },
};

// ---------- lens helper ----------
function lensAt(spot, L, at, out, label) {
  const g = div('lens', '', { left: L[0] - 240 + 'px', top: L[1] - 240 + 'px' }); gsap.set(g, { opacity: 0 });
  const svg = el('svg', { width: 480, height: 480, viewBox: '0 0 480 480' }, g);
  svg.innerHTML = '<defs><radialGradient id="xr" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#4a413e"/><stop offset="1" stop-color="#241e1c"/></radialGradient></defs><rect width="480" height="480" fill="url(#xr)"/>';
  const ang = Math.atan2(spot[1] - L[1], spot[0] - L[0]), ex = L[0] + Math.cos(ang) * 252, ey = L[1] + Math.sin(ang) * 252;
  const c = el('path', { class: 'doo', d: `M${spot[0]} ${spot[1]} L${ex} ${ey}`, style: 'stroke:var(--teal);stroke-width:8;stroke-dasharray:4 18' }, fx);
  const dot = el('circle', { cx: spot[0], cy: spot[1], r: 14, fill: LIME, stroke: TEAL, 'stroke-width': 5 }, fx);
  popIn(dot, at - 0.2, 0.3); draw(c, at, 0.4);
  tl.fromTo(g, { opacity: 0, scale: 0.1, x: spot[0] - L[0], y: spot[1] - L[1] }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.75, ease: 'back.out(1.4)', immediateRender: false }, at + 0.1); cue(at + 0.1, 'lift');
  tl.to(g, { opacity: 0, scale: 0.2, x: spot[0] - L[0], y: spot[1] - L[1], duration: 0.45, ease: 'power3.in' }, out); gone([c, dot], out);
  if (label) { const t = div('tag', label, { left: L[0] + 'px', top: L[1] + 205 + 'px' }); gsap.set(t, { opacity: 0, xPercent: -50 }); popIn(t, at + 2.3); cue(at + 2.3, 'stamp'); tl.to(t, { opacity: 0, duration: 0.3 }, out); }
  return svg;
}
window.DD = { DOODLE: null, REACT: null, P };
const lab = (svg, txt, x, y, at, out, col = CREAM, size = 44) => { const t = el('text', { x, y, 'text-anchor': 'middle', fill: col, style: `font:700 ${size}px Caveat` }, svg); t.textContent = txt; gsap.set(t, { opacity: 0 }); tl.to(t, { opacity: 1, duration: 0.4 }, at); return t; };

// ---------- explainers ----------
const EXPLAIN = {
  // arthritis: the joint's cushioning wears thin
  joint(B, at, out) {
    const s = F.s4, svg = lensAt(P(B, s.spot[0], s.spot[1]), s.lens, at, out, 'ARTHRITIS');
    el('path', { d: 'M150 -10 L150 150 C 150 196, 190 214, 240 214 C 290 214, 330 196, 330 150 L330 -10 Z', fill: CREAM, stroke: INK, 'stroke-width': 7 }, svg);
    el('path', { d: 'M150 490 L150 340 C 150 296, 190 282, 240 282 C 290 282, 330 296, 330 340 L330 490 Z', fill: CREAM, stroke: INK, 'stroke-width': 7 }, svg);
    const c1 = el('path', { d: 'M156 168 C 170 206, 310 206, 324 168 C 330 196, 300 224, 240 224 C 180 224, 150 196, 156 168 Z', fill: LIME, stroke: INK, 'stroke-width': 5 }, svg);
    const c2 = el('path', { d: 'M156 326 C 170 290, 310 290, 324 326 C 330 300, 300 272, 240 272 C 180 272, 150 300, 156 326 Z', fill: LIME, stroke: INK, 'stroke-width': 5 }, svg);
    lab(svg, 'bone', 390, 150, at + 0.8, out); lab(svg, 'cushion', 400, 258, at + 1.0, out, LIME);
    tl.to([c1, c2], { attr: { fill: RED }, duration: 0.5 }, at + 1.8);
    tl.to(c1, { scaleY: 0.45, svgOrigin: '240 200', duration: 0.6 }, at + 1.8); tl.to(c2, { scaleY: 0.45, svgOrigin: '240 296', duration: 0.6 }, at + 1.8);
    [[-90, 0], [0, -10], [90, 0]].forEach(([dx, dy], k) => { const e = el('path', { d: `M${240 + dx} ${248 + dy} l ${dx ? dx * 0.4 : 0} ${-30}`, stroke: '#FFD9A0', 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none' }, svg); draw(e, at + 2.3 + k * 0.1, 0.2); });
    lab(svg, 'worn', 90, 262, at + 2.4, out, '#FFD9A0'); cue(at + 1.8, 'thud');
    DOODLE.glow(B, { pts: [s.spot] , r: 40 }, at - 0.1, out);
  },
  // itchy skin: the itch-scratch loop around the dog
  loop(B, at, out) {
    const cx = B.x + B.w / 2, cy = B.y + B.h / 2, r = F.s4.r || 380, loop = el('circle', { cx, cy, r, class: 'doo', style: `stroke:${RED};stroke-width:10;stroke-dasharray:2 26`, transform: `rotate(-90 ${cx} ${cy})` }, fx);
    draw(loop, at, 1.0); cue(at, 'draw');
    const nodes = [['itchy skin', -90], ['scratching', 30], ['sore skin', 150]];
    nodes.forEach(([t, a], k) => { const x = cx + r * Math.cos(a * Math.PI / 180), y = cy + r * Math.sin(a * Math.PI / 180);
      const pill = div('tag', t, { left: x + 'px', top: y + 'px', background: k === 0 ? LIME : '#fff', border: `5px solid ${RED}`, color: INK }); gsap.set(pill, { opacity: 0, xPercent: -50, yPercent: -50 });
      tl.fromTo(pill, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)', immediateRender: false }, at + 0.6 + k * 0.45); cue(at + 0.6 + k * 0.45, 'pop' + k); gone(pill, out); });
    const dot = el('circle', { r: 18, fill: RED, stroke: INK, 'stroke-width': 4, opacity: 0 }, fx), prog = { a: -90 };
    tl.to(dot, { opacity: 1, duration: 0.2 }, at + 2.0); tl.to(prog, { a: 990, duration: 3.6, ease: 'none' }, at + 2.0); gone([dot, loop], out);
    K.frame(() => { const a = prog.a * Math.PI / 180; dot.setAttribute('cx', cx + r * Math.cos(a)); dot.setAttribute('cy', cy + r * Math.sin(a)); });
    REACT.shake(at + 2.0);
  },
  // anxiety: a heartbeat line that spikes with triggers, then settles
  pulse(B, at, out) {
    const y0 = F.s4.y || 700; let d = `M60 ${y0}`; const spikes = [200, 420, 640, 860];
    for (const sx of spikes) d += ` L${sx - 40} ${y0} L${sx - 20} ${y0 - 30} L${sx} ${y0 + 110} L${sx + 18} ${y0 - 150} L${sx + 36} ${y0 + 40} L${sx + 50} ${y0}`; d += ` L1020 ${y0}`;
    const ecg = el('path', { class: 'doo', d, style: `stroke:${RED};stroke-width:9` }, fx); draw(ecg, at, 2.4, 'none');
    F.s4.triggers.forEach((t, k) => { const q = hand(t, spikes[k] - 90, y0 - 300 + (k % 2) * 80, 72, RED); q.style.left = Math.max(40, Math.min(spikes[k] - q.offsetWidth / 2, 1040 - q.offsetWidth)) + 'px'; write(q, at + 0.35 + k * 0.6, 0.45); cue(at + 0.35 + k * 0.6, 'pop' + k); gone(q, at + 3.5); });
    REACT.shake(at + 0.4); REACT.shake(at + 1.6);
    // settles into a calm teal wave
    tl.to(ecg, { opacity: 0, duration: 0.4 }, at + 3.5);
    const calm = el('path', { class: 'doo', d: `M60 ${y0} C 160 ${y0 - 30}, 220 ${y0 + 30}, 320 ${y0} S 480 ${y0 - 30}, 580 ${y0} S 740 ${y0 + 30}, 840 ${y0} S 980 ${y0 - 20}, 1020 ${y0}`, style: `stroke:${TEAL};stroke-width:9` }, fx);
    draw(calm, at + 3.7, 1.6, 'power1.inOut'); gone(calm, out);
    const cl = hand('calm', 860, y0 - 110, 70, TEAL); write(cl, at + 4.6, 0.4); gone(cl, out);
  },
  // dental: tartar builds on a tooth, then a brush cleans it
  tooth(B, at, out) {
    const s = F.s4, svg = lensAt(P(B, s.spot[0], s.spot[1]), s.lens, at, out, 'DENTAL DISEASE');
    el('path', { d: 'M150 330 C 140 240, 150 120, 200 100 C 220 92, 260 92, 280 100 C 330 120, 340 240, 330 330 C 320 380, 300 420, 290 440 C 280 410, 262 360, 240 360 C 218 360, 200 410, 190 440 C 180 420, 160 380, 150 330 Z', fill: '#FFFDF6', stroke: INK, 'stroke-width': 7 }, svg);
    const gum = el('path', { d: 'M-10 330 C 80 300, 160 318, 240 300 C 320 318, 400 300, 490 330 L490 490 L-10 490 Z', fill: '#F2A6A0', stroke: INK, 'stroke-width': 7 }, svg);
    const tar = el('path', { d: 'M152 300 C 180 270, 210 290, 240 276 C 270 290, 300 270, 330 300 C 320 330, 160 330, 152 300 Z', fill: '#C9A24A', stroke: INK, 'stroke-width': 5 }, svg);
    gsap.set(tar, { scaleY: 0, svgOrigin: '240 320' });
    tl.to(tar, { scaleY: 1.6, duration: 1.0, ease: 'power2.out' }, at + 1.0); tl.to(gum, { attr: { fill: '#E8564C' }, duration: 0.6 }, at + 1.5); cue(at + 1.0, 'thud');
    lab(svg, 'tartar', 380, 230, at + 1.4, out, '#FFD98A'); lab(svg, 'sore gums', 240, 470, at + 1.8, out, '#fff');
    // the brush (at h6)
    const br = el('g', {}, svg); el('rect', { x: 300, y: 205, width: 260, height: 34, rx: 16, fill: TEAL, stroke: INK, 'stroke-width': 5 }, br);
    for (let k = 0; k < 7; k++) el('rect', { x: 306 + k * 13, y: 168, width: 9, height: 40, rx: 4, fill: '#fff', stroke: INK, 'stroke-width': 3 }, br);
    const t2 = at + 3.9; gsap.set(br, { x: 300, opacity: 0 });
    tl.to(br, { x: -150, opacity: 1, duration: 0.4, ease: 'power2.out' }, t2).to(br, { x: -60, duration: 0.14, yoyo: true, repeat: 7, ease: 'sine.inOut' }, t2 + 0.4).to(br, { x: 320, opacity: 0, duration: 0.35 }, t2 + 1.6); cue(t2 + 0.4, 'scratch');
    tl.to(tar, { scaleY: 0, duration: 0.9 }, t2 + 0.5); tl.to(gum, { attr: { fill: '#F2A6A0' }, duration: 0.6 }, t2 + 0.9);
    [[200, 150], [290, 170], [245, 110]].forEach(([x, y], k) => { const sp = el('path', { d: `M${x} ${y - 22} L${x + 6} ${y - 6} L${x + 22} ${y} L${x + 6} ${y + 6} L${x} ${y + 22} L${x - 6} ${y + 6} L${x - 22} ${y} L${x - 6} ${y - 6} Z`, fill: '#FFF2A8', stroke: INK, 'stroke-width': 3, opacity: 0 }, svg);
      tl.fromTo(sp, { opacity: 0, scale: 0.2, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, t2 + 1.5 + k * 0.12); }); cue(t2 + 1.5, 'shimmer');
  },
  // digestive: a drawn gut, then good bacteria take over
  gut(B, at, out) {
    const s = F.s4, g = s.gut.map(([fx0, fy0]) => P(B, fx0, fy0));
    const gp = el('path', { d: smooth(g), fill: 'none', stroke: '#F2A6A0', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.95 }, fx);
    const gp2 = el('path', { d: smooth(g), fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '1 0', opacity: 0.6 }, fx);
    draw(gp, at - 0.3, 1.1); draw(gp2, at - 0.3, 1.1); gone([gp, gp2], out);
    const svg = lensAt(P(B, s.spot[0], s.spot[1]), s.lens, at + 0.6, out, 'GUT HEALTH');
    el('path', { d: 'M-20 150 C 120 110, 360 190, 500 150 L500 330 C 360 370, 120 290, -20 330 Z', fill: '#F7C2BA', stroke: INK, 'stroke-width': 6 }, svg);
    const bad = [[110, 210], [250, 250], [380, 220], [180, 280], [320, 290]].map(([x, y]) => { let d = ''; for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, r = k % 2 ? 14 : 26; d += (k ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * Math.sin(a)).toFixed(1) + ' '; }
      return el('path', { d: d + 'Z', fill: RED, stroke: INK, 'stroke-width': 4 }, svg); });
    gsap.set(bad, { opacity: 0, transformBox: 'fill-box', transformOrigin: '50% 50%' });
    bad.forEach((b, k) => tl.fromTo(b, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, at + 1.3 + k * 0.1));
    lab(svg, 'upset', 240, 120, at + 1.6, out, '#FFD0C8');
    const t2 = at + 3.8;
    const good = [[90, 250], [150, 200], [215, 245], [290, 205], [360, 255], [420, 215], [250, 300], [140, 300], [340, 300]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 20, fill: LIME, stroke: INK, 'stroke-width': 4 }, svg));
    gsap.set(good, { opacity: 0, transformBox: 'fill-box', transformOrigin: '50% 50%' });
    good.forEach((c, k) => { tl.fromTo(c, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, t2 + k * 0.09); cue(t2 + k * 0.09, 'pop' + (k % 5)); });
    tl.to(bad, { opacity: 0, scale: 0.2, duration: 0.4, stagger: 0.1 }, t2 + 0.4);
    lab(svg, 'good bacteria', 240, 400, t2 + 0.6, out, LIME);
    DOODLE.rumble(B, { p: s.spot }, at - 0.2, at + 3.5);
  },
};
window.DD.DOODLE = DOODLE; window.DD.REACT = REACT;
})();
