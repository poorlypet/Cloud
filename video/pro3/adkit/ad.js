/* Poorly Pet painted ad films: the engine of "Built for Marble" made reusable. A film page calls
   AD.film({ dur, fast, modes, flashes, scenes: [...], endCard: {...}, build: A => { A.card(...); A.review(...); ... } }).
   Plates live in frame units (1080x1920); each scene's camera is a Track: plate point (ax,ay) lands on screen (sx,sy) at zoom z.
   Every frame is a pure function of time (K.frame hooks + the GSAP timeline), so stills and renders are deterministic. */
const AD = (() => {
  const { $, $$, tl } = K;
  const FW = 1080, FH = 1920, KA = '../adkit/assets/';
  const kP = 1080 / 1888;                                    // Canva plate px (upscaled 1888 wide) to frame units
  const EZ = {}, ez = n => EZ[n] || (EZ[n] = gsap.parseEase(n));
  const P = (t, a, b, e = 'none') => t <= a ? 0 : t >= b ? 1 : ez(e)((t - a) / (b - a));
  const L = (a, b, k) => a + (b - a) * k;
  const IMGS = [];
  function el(tag, parent, cls, css) { const d = document.createElement(tag); if (cls) d.className = cls; if (css) Object.assign(d.style, css); parent.appendChild(d); return d; }
  function img(parent, src, x, y, w, h, cls) { const i = el('img', parent, cls, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); i.src = src; IMGS.push(i); return i; }
  function glow(parent, cx, cy, rx, ry, col, op) { return el('div', parent, 'glow', { left: cx - rx + 'px', top: cy - ry + 'px', width: 2 * rx + 'px', height: 2 * ry + 'px', background: `radial-gradient(closest-side,${col},rgba(0,0,0,0))`, opacity: op }); }
  const vis = (e, on) => { e.style.visibility = on ? (e.classList.contains('sc') ? 'visible' : 'inherit') : 'hidden'; };

  // ---------- camera ----------
  const rotv = (x, y, d) => { const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
  const toScreen = (st, p) => { const [dx, dy] = rotv((p[0] - st.ax) * st.z, (p[1] - st.ay) * st.z, st.r); return [st.sx + dx, st.sy + dy]; };
  const toPlate = (st, q) => { const [dx, dy] = rotv(q[0] - st.sx, q[1] - st.sy, -st.r); return [st.ax + dx / st.z, st.ay + dy / st.z]; };
  class Track {
    constructor(st) { this.st = { r: 0, ...st }; this.segs = []; }
    to(t0, t1, patch, e = 'sine.inOut') { const a = { ...this.st }, b = { ...a, ...patch }; this.segs.push({ t0, t1, a, b, e: ez(e) }); this.st = b; return this; }
    about(p) { const [sx, sy] = toScreen(this.st, p); this.st = { ...this.st, ax: p[0], ay: p[1], sx, sy }; return this; }
    frame(t0, t1, p, q, z, e = 'sine.inOut') { return this.about(p).to(t0, t1, { z, sx: q[0], sy: q[1], r: 0 }, e); }
    centre(t0, t1, z, e = 'sine.inOut') { const p = [this.st.ax, this.st.ay]; return this.to(t0, t1, { z, sx: 540 + (p[0] - 540) * z, sy: 960 + (p[1] - 960) * z, r: 0 }, e); }
    at(t) {
      let cur = this.segs.length ? this.segs[0].a : this.st;
      for (const s of this.segs) {
        if (t < s.t0) return cur;
        if (t < s.t1) { const k = s.e((t - s.t0) / (s.t1 - s.t0)), o = {}; for (const key in s.a) o[key] = s.a[key] + (s.b[key] - s.a[key]) * k; return o; }
        cur = s.b;
      }
      return cur;
    }
  }
  // T({ z, at: plate point, to: screen point }) or T() for a centred frame at z 1.04
  const T = (o = {}) => { const p = o.at || [540, 960], z = o.z ?? 1.04, q = o.to || [540 + (p[0] - 540) * z, 960 + (p[1] - 960) * z]; return new Track({ z, ax: p[0], ay: p[1], sx: q[0], sy: q[1], r: o.r || 0 }); };
  // keep the visible window V covered by plate bounds B, nudging the translation only
  function cover(st, B = [0, 0, FW, FH], V = [0, 0, FW, FH]) {
    st = { ...st };
    for (let it = 0; it < 6; it++) {
      let moved = false;
      for (const c of [[V[0], V[1]], [V[2], V[1]], [V[0], V[3]], [V[2], V[3]]]) {
        const q = toPlate(st, c), qx = Math.min(B[2], Math.max(B[0], q[0])), qy = Math.min(B[3], Math.max(B[1], q[1]));
        if (Math.abs(qx - q[0]) > 1e-6 || Math.abs(qy - q[1]) > 1e-6) { const [dx, dy] = rotv((qx - q[0]) * st.z, (qy - q[1]) * st.z, st.r); st.sx -= dx; st.sy -= dy; moved = true; }
      }
      if (!moved) break;
    }
    return st;
  }
  const place = (e, st) => { e.style.transform = `translate(${st.sx}px,${st.sy}px) rotate(${st.r}deg) scale(${st.z}) translate(${-st.ax}px,${-st.ay}px)`; };

  // ---------- masks (tilted dry-brush strokes, bottom band first) ----------
  function setMask(e, layers) {
    if (!layers) { e.style.webkitMaskImage = e.style.maskImage = 'none'; return; }
    const im = layers.map(l => l[0]).join(','), pos = layers.map(l => l[1]).join(','), sz = layers.map(l => l[2]).join(',');
    e.style.webkitMaskImage = e.style.maskImage = im; e.style.webkitMaskPosition = e.style.maskPosition = pos; e.style.webkitMaskSize = e.style.maskSize = sz;
  }
  const STY = { 1: 1240, 2: 600, 3: -60 }, SW = 1348, SH = 810;
  const stroke = (n, dir, k) => [`url(${KA}stroke${n}${dir > 0 ? 'a' : 'm'}r.png)`, `${dir > 0 ? L(-SW, -134, k) : L(1080, -134, k)}px ${STY[n] - (SH - 720) / 2}px`, `${SW}px ${SH}px`];
  const fill = a => [`linear-gradient(rgba(0,0,0,${a}),rgba(0,0,0,${a}))`, '0 0', '100% 100%'];
  const strokes3 = (t, a, step, d, dirs = [1, -1, 1]) => [stroke(3, dirs[2], P(t, a + 2 * step, a + 2 * step + d, 'power3.inOut')), stroke(2, dirs[1], P(t, a + step, a + step + d, 'power3.inOut')), stroke(1, dirs[0], P(t, a, a + d, 'power3.inOut'))];

  // ---------- stage ----------
  const stage = $('#stage');
  stage.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="rag" x="-4%" y="-25%" width="108%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.25" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div id="endBg" class="sc" style="background:radial-gradient(ellipse 620px 640px at 540px 560px,#12584F,#0F4C48 75%)"></div>
  <div id="scenes"></div>
  <div id="grade" class="fs top" style="background:#0F4C48;mix-blend-mode:soft-light;opacity:.2"></div>
  <img id="leak" class="fs top" src="${KA}leak.png" style="mix-blend-mode:screen;opacity:0">
  <div id="scrN" class="fs top" style="background:linear-gradient(180deg,rgba(10,58,55,.75) 0%,rgba(10,58,55,.55) 28%,rgba(10,58,55,0) 44%)"></div>
  <div id="scrD" class="fs top" style="background:linear-gradient(180deg,rgba(243,246,241,.84) 0%,rgba(243,246,241,.55) 24%,rgba(243,246,241,0) 42%);opacity:0"></div>
  <div id="vig" class="fs top" style="background:radial-gradient(ellipse 78% 62% at 50% 48%,rgba(10,58,55,0) 58%,rgba(10,58,55,.34) 100%)"></div>
  <div id="txt" class="fs top"><div id="hdr"><i class="rule"></i><span class="lab"></span></div></div>
  <div id="endT" class="sc top" style="background:none">
    <div id="key"></div>
    <div id="wm"><img class="wi" src="${KA}logo-cream.png" alt="Poorly Pet"></div>
    <div id="cat" class="ec"><span class="ct"></span><i class="bl"></i></div>
    <div id="pill"><span>Use code<b>POORLY10</b>· 10% off your first order</span><i class="sheen"></i></div>
    <div id="tc" class="ec">Min. spend £10 · Selected items · T&amp;Cs apply<i class="bl"></i></div>
    <div id="p1" class="ec pr">Rated 4.6/5 from 99 reviews · Free UK delivery over £39<i class="bl"></i></div>
    <div id="p2" class="ec pr">Real people. Every email answered within one working day.<i class="bl"></i></div>
    <div id="url" class="ec"><span class="ut">poorly-pet.com</span><i class="bl"></i><i class="ul"></i></div>
  </div>
  <div id="white" class="fs top" style="background:#FAFCF5;opacity:0"></div>
  <div id="warm" class="fs top" style="background:#FFF4E0;opacity:0"></div>
  <div id="grain" class="fs top" style="mix-blend-mode:overlay;opacity:.42"></div>`;
  IMGS.push($('#wm img'), $('#leak'));
  const grains = [0, 1, 2, 3, 4, 5].map(i => img($('#grain'), `${KA}grain${i}.jpg`, 0, 0, FW, FH));
  ['stroke1ar', 'stroke1mr', 'stroke2ar', 'stroke2mr', 'stroke3ar', 'stroke3mr'].forEach(n => { const i = new Image(); i.src = `${KA}${n}.png`; IMGS.push(i); });

  // ---------- scenes ----------
  // s = { id, plate, a, b, move: Track | (T => Track), img: {x,y,w,h} (default full frame), bg (plate shown under a sliding cut),
  //       cut: {src, box:[x,y,w,h] in 1888 px, eye:[x,y], parallax, swell}, paper, fade:[t0,t1], wipe:{at,step,d,fill:[f0,f1],dirs},
  //       blurIn:[t0,t1,px], blurOut:[t0,t1,px], flash:[t0,t1,amount], dimOut:[t0,t1,amount], glows:[[x,y,rx,ry,col,op,pulse]], arch:[t0,t1], fn(t,st,s) }
  const SC = [];
  function scene(s) {
    const sc = el('div', $('#scenes'), 'sc'); sc.id = s.id;
    const cam = el('div', sc, 'cam'), g = s.img || { x: 0, y: 0, w: FW, h: FH };
    s.pl = img(cam, s.bg || s.plate, g.x, g.y, g.w, g.h, 'pl');
    if (s.filter) s.pl.style.filter = s.filter;
    if (s.cut) { const [x, y, w, h] = s.cut.box.map(v => v * kP), e = s.cut.eye || [540, 960]; s.c = img(cam, s.cut.src, x, y, w, h, 'pl'); s.c.style.transformOrigin = `${e[0] - x}px ${e[1] - y}px`; }
    if (s.paper !== 0) { const p = img(cam, `${KA}paper.jpg`, 0, 0, FW, FH); Object.assign(p.style, { mixBlendMode: 'multiply', opacity: s.paper ?? .5 }); }
    s.gl = (s.glows || []).map(([x, y, rx, ry, col, op, pulse]) => { const d = glow(cam, x, y, rx, ry, col || 'rgba(255,226,170,.95)', op ?? .2); d._op = op ?? .2; d._pulse = pulse || 0; return d; });
    if (s.wipe) sc.classList.add('mk-l');
    s.sc = sc; s.camEl = cam;
    s.track = typeof s.move === 'function' ? s.move(T) : s.move || T().to(s.a, s.b, { z: 1.1 });
    SC.push(s); return s;
  }
  const parallax = (c, st, f, k) => { const cx = toScreen(st, [540, 960])[0] - 540; c.style.transform = `translateX(${f * cx / st.z}px) scale(${1 + .015 * Math.sin(Math.PI * k)})`; };
  function frameScene(s, t) {
    const on = t >= s.a && t < s.b; vis(s.sc, on); if (!on) return;
    let V = [0, 0, FW, FH], ka = 0;
    if (s.arch) { ka = P(t, s.arch[0], s.arch[1], 'power3.inOut'); V = [L(0, 320, ka), L(0, 236, ka), L(FW, 760, ka), L(FH, 756, ka)]; }
    const B = s.img ? [s.img.x, s.img.y, s.img.x + s.img.w, s.img.y + s.img.h] : [0, 0, FW, FH];
    const st = cover(s.track.at(t), B, V); place(s.camEl, st);
    s.sc.style.clipPath = ka > 0 ? `inset(${V[1]}px ${FW - V[2]}px ${FH - V[3]}px ${V[0]}px round ${220 * ka}px ${220 * ka}px 0px 0px)` : 'none';
    s.sc.style.opacity = s.fade ? P(t, s.fade[0], s.fade[1], 'sine.inOut') : 1;
    const f = [];
    if (s.flash) f.push(`brightness(${L(1 + s.flash[2], 1, P(t, s.flash[0], s.flash[1], 'power2.out'))})`);
    if (s.dimOut) f.push(`brightness(${L(1, 1 - s.dimOut[2], P(t, s.dimOut[0], s.dimOut[1], 'power2.in'))})`);
    let bl = 0; if (s.blurIn) bl += s.blurIn[2] * (1 - P(t, s.blurIn[0], s.blurIn[1], 'power2.out')); if (s.blurOut) bl += s.blurOut[2] * P(t, s.blurOut[0], s.blurOut[1], 'power2.in');
    if (bl > .01) f.push(`blur(${bl}px)`);
    s.sc.style.filter = f.length ? f.join(' ') : 'none';
    if (s.wipe) { const w = s.wipe, F = P(t, w.fill[0], w.fill[1], 'sine.inOut'); setMask(s.sc, F >= 1 ? null : [...strokes3(t, w.at, w.step ?? .14, w.d ?? .38, w.dirs), fill(F)]); }
    if (s.c) { const k = P(t, s.a, s.b); if (s.cut.parallax) parallax(s.c, st, s.cut.parallax, k); else if (s.cut.swell !== 0) s.c.style.transform = `scale(${1 + .015 * Math.sin(Math.PI * k)})`; }
    s.gl.forEach(d => { d.style.opacity = d._op * (1 + d._pulse * Math.sin(2 * Math.PI * t / 2.4)); });
    if (s.fn) s.fn(t, st, s);
  }

  // ---------- type ----------
  let MODES = [[0, 'night']];
  const dayAt = t => { let v = MODES[0][1] === 'day' ? 1 : 0; for (let i = 1; i < MODES.length; i++) { const [m0, m] = MODES[i], tgt = m === 'day' ? 1 : 0; v = L(v, tgt, P(t, m0, m0 + .45, 'sine.inOut')); } return v; };
  const isDay = t => dayAt(t + .5) > .5;
  const SWIPES = [];
  function block(lines, o) {
    const ink = o.ink ?? isDay(o.at ?? 0);
    const b = el('div', $('#txt'), 'blk ' + (ink ? 'ink' : 'cr'), { top: o.y + 'px', fontSize: o.size + 'px', lineHeight: o.lh || 1.14, fontWeight: o.w || 600, fontFamily: o.font || '' });
    b.innerHTML = lines.map(l => `<span class="lm"><span class="li">${l.replace(/'/g, '’').replace(/\*(.+?)\*/g, '<span class="mk"><i class="band"></i><span class="t">$1</span><span class="tk" aria-hidden="true">$1</span><i class="bl"></i></span>')}</span></span>`).join('');
    let fs = o.size; const lis = [...b.querySelectorAll('.li')];
    while (fs > (o.min || o.size - 6) && lis.some(li => li.offsetWidth > (o.maxW || 860))) { fs -= 1; b.style.fontSize = fs + 'px'; }
    b.querySelectorAll('.mk').forEach(mk => { const band = mk.querySelector('.band'), bl = mk.querySelector('.bl').offsetTop; mk._bt = bl - 0.80 * fs; mk._bh = 0.98 * fs; band.style.top = mk._bt + 'px'; band.style.height = mk._bh + 'px'; });
    b._fs = fs; return b;
  }
  function rise(b, at, o = {}) {
    const lis = [...b.querySelectorAll('.li')], lms = [...b.querySelectorAll('.lm')], st = o.stagger ?? .09, d = o.dur ?? .65;
    tl.fromTo(lis, { yPercent: 150, filter: `blur(${o.blur ?? 6}px)` }, { yPercent: 0, filter: 'blur(0px)', duration: d, ease: 'expo.out', stagger: st, immediateRender: true }, at);
    tl.set(lms, { overflow: 'visible' }, at + d + st * lis.length);
  }
  function swipe(b, at, dur = .45) {
    const pad = .07 * b._fs;
    b.querySelectorAll('.mk').forEach((mk, i) => {
      const band = mk.querySelector('.band'), tk = mk.querySelector('.tk'), w = mk.offsetWidth, hb = tk.offsetHeight - mk._bt - mk._bh;
      band.style.clipPath = `inset(-30% ${w + pad + 2}px -30% 0)`; tk.style.clipPath = `inset(0 ${w}px 0 0)`;
      SWIPES.push({ a: at + i * .08, d: dur, f: p => { const edge = -pad + p * (w + 2 * pad); band.style.clipPath = `inset(-30% ${w + pad - edge}px -30% 0)`; tk.style.clipPath = `inset(${mk._bt}px ${Math.max(0, w - edge)}px ${hb}px 0)`; } });
    });
  }
  const exit = (b, at, d = .25, y = -20) => tl.to(b, { y, opacity: 0, duration: d, ease: 'power2.in' }, at);
  const card = (lines, o, at, sw, out) => { const b = block(lines, { y: 300, size: 62, at, ...o }); rise(b, at); if (sw != null) swipe(b, sw); if (out != null) exit(b, out); return b; };

  const STAR = col => `<svg class="star" viewBox="0 0 64 64"><path d="M32 3.5 L40.6 22.6 L61.3 24.6 L45.6 38.4 L50.2 58.7 L32 48.1 L13.8 58.7 L18.4 38.4 L2.7 24.6 L23.4 22.6 Z" fill="${col}"/></svg>`;
  function starRow(parent, n, size, y, cls = 'st') {
    const r = el('div', parent, cls, { position: 'absolute', left: '72px', top: y + 'px', display: 'flex', gap: Math.round(size * .2) + 'px' });
    const items = [0, 1, 2, 3, 4].map(i => { const f = Math.max(0, Math.min(1, n - i)), d = el('i', r, '', { position: 'relative', display: 'block', width: size + 'px', height: size + 'px' });
      d.innerHTML = `<span style="position:absolute;inset:0;opacity:.28">${STAR('#E4EED6')}</span><span style="position:absolute;left:0;top:0;height:100%;width:${f * 100}%;overflow:hidden"><span style="position:absolute;left:0;top:0;width:${size}px;height:${size}px">${STAR('#F2B418')}</span></span>`; return d; });
    return { r, items };
  }
  // a verbatim customer review: stars, quote (with *highlight*), name
  function review(o) {
    const y = o.y ?? 300, ink = o.ink ?? isDay(o.at), size = o.size ?? 54;
    const s = starRow($('#txt'), o.stars ?? 5, 46, y);
    const lines = o.q.map((l, i) => (i === 0 ? '“' : '') + l + (i === o.q.length - 1 ? '”' : ''));
    const q = block(lines, { y: y + 86, size, ink, lh: 1.24, maxW: o.maxW || 900, at: o.at });
    const n = el('div', $('#txt'), 'blk ' + (ink ? 'ink' : 'cr'), { top: (y + 86 + q.offsetHeight + 26) + 'px', font: '700 25px/1 Figtree,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: ink ? '#0F4C48' : '#E4EED6' });
    n.innerHTML = `<i style="display:inline-block;width:36px;height:2px;background:#DFE43A;vertical-align:middle;margin-right:16px"></i>${o.name}`;
    tl.fromTo(s.items, { scale: 0, opacity: 0, rotate: -25 }, { scale: 1, opacity: 1, rotate: 0, duration: .45, ease: 'back.out(2.2)', stagger: .07, immediateRender: true }, o.at);
    rise(q, o.at + .2); if (o.sw != null) swipe(q, o.sw);
    tl.fromTo(n, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .5, ease: 'power2.out', immediateRender: true }, o.at + .55);
    if (o.out != null) [s.r, q, n].forEach(e => exit(e, o.out));
    return { s, q, n, bottom: y + 86 + q.offsetHeight + 26 + 25 };
  }
  // the approved rating line, with 4.6 of 5 stars filled
  function rating(o) {
    const y = o.y ?? 300, ink = o.ink ?? isDay(o.at);
    const s = starRow($('#txt'), 4.6, o.star ?? 58, y);
    const b = block([o.line || 'Rated *4.6/5* from 99 reviews'], { y: y + (o.star ?? 58) + 34, size: o.size ?? 52, ink, font: 'Figtree,sans-serif', w: 700, at: o.at });
    tl.fromTo(s.items, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2.2)', stagger: .07, immediateRender: true }, o.at);
    rise(b, o.at + .25); if (o.sw != null) swipe(b, o.sw);
    if (o.out != null) [s.r, b].forEach(e => exit(e, o.out));
    return { s, b };
  }
  // a product: name (serif), its approved one-line claim, price highlighted
  function product(o) {
    const y = o.y ?? 300, ink = o.ink ?? isDay(o.at);
    const a = block([o.name], { y, size: o.size ?? 56, ink, at: o.at });
    const b = block([o.claim], { y: y + 88, size: 40, ink, font: 'Figtree,sans-serif', w: 600, at: o.at });
    const c = block([`*${o.price}*`], { y: y + 154, size: 76, ink, font: 'Figtree,sans-serif', w: 800, at: o.at });
    rise(a, o.at); rise(b, o.at + .15); rise(c, o.at + .3); swipe(c, o.at + .6, .35);
    if (o.out != null) [a, b, c].forEach(e => exit(e, o.out));
  }
  // rows of items in Figtree; each lights from dim to full in turn (times) or all rise together
  function list(rows, o) {
    const ink = o.ink ?? isDay(o.at);
    const b = el('div', $('#txt'), 'lst' + (ink ? '' : ' cr'), { top: o.y + 'px', fontSize: (o.size || 44) + 'px' });
    b.innerHTML = rows.map(r => r.map(x => `<span class="it">${x}</span>`).join('<span class="sep">·</span>')).join('<br>');
    const its = [...b.querySelectorAll('.it')];
    tl.fromTo(b, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', immediateRender: true }, o.at);
    if (o.times) its.forEach((c, i) => { gsap.set(c, { opacity: .42 }); tl.to(c, { opacity: 1, duration: .3 }, o.times[i]); });
    if (o.out != null) exit(b, o.out);
    return b;
  }
  // running header: rule and masked label; items = [[t, 'LABEL'], ...]
  function header(items, off) {
    const H = $('#hdr'), lab = $('#hdr .lab');
    const labs = items.map(([, s]) => { const b = el('b', lab); b.textContent = s; gsap.set(b, { clipPath: 'inset(0 100% 0 0)' }); return b; });
    const labIn = (i, at) => tl.fromTo(labs[i], { clipPath: 'inset(0 100% 0 0)', yPercent: 0 }, { clipPath: 'inset(0 0% 0 0)', duration: .5, ease: 'power2.inOut', immediateRender: true }, at);
    tl.to(H, { opacity: 1, duration: .3 }, items[0][0]); tl.fromTo('#hdr .rule', { scaleX: 0 }, { scaleX: 1, duration: .4, ease: 'power2.out', immediateRender: true }, items[0][0]);
    labIn(0, items[0][0] + .1);
    for (let i = 1; i < items.length; i++) { tl.to(labs[i - 1], { yPercent: -100, duration: .3, ease: 'power2.in' }, items[i][0]); labIn(i, items[i][0] + .2); }
    if (off != null) tl.to(H, { opacity: 0, duration: .3 }, off);
  }
  // end card: logo, category line, offer pill, terms, proof, people, URL; built from T0
  function endCard(o) {
    const T0 = o.T0;
    $('#cat .ct').textContent = o.cat || 'For recovery, comfort and everyday wellbeing.';
    $$('#endT .ec').forEach(e => { const base = { cat: 968, tc: 1118, p1: 1172, p2: 1210, url: 1276 }[e.id]; e.style.top = base - e.querySelector('.bl').offsetTop + 'px'; });
    const ut = $('#url .ut'), ul = $('#url .ul'); Object.assign(ul.style, { left: ut.offsetLeft + 'px', width: ut.offsetWidth + 'px', top: 1296 - parseFloat($('#url').style.top) + 'px' });
    tl.fromTo('#key', { opacity: 0 }, { opacity: 1, duration: .6, immediateRender: true }, T0);
    tl.fromTo('#wm .wi', { yPercent: 110 }, { yPercent: 0, duration: .7, ease: 'expo.out', immediateRender: true }, T0);
    tl.fromTo('#cat', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', immediateRender: true }, T0 + .25);
    tl.fromTo('#pill', { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out', immediateRender: true }, T0 + .5);
    tl.fromTo('#pill b', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .35, ease: 'power1.inOut', immediateRender: true }, T0 + .65);
    tl.fromTo('#tc', { opacity: 0 }, { opacity: 1, duration: .5, immediateRender: true }, T0 + .75);
    tl.fromTo('#p1', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', immediateRender: true }, T0 + .85);
    tl.fromTo('#p2', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', immediateRender: true }, T0 + 1.0);
    tl.fromTo('#url', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', immediateRender: true }, T0 + 1.15);
    tl.fromTo(ul, { scaleX: 0 }, { scaleX: 1, duration: .4, ease: 'power2.inOut', immediateRender: true }, T0 + 1.35);
    if (o.sheen != null) tl.fromTo('#pill .sheen', { x: -260 }, { x: 860, duration: .7, ease: 'sine.inOut', immediateRender: true }, o.sheen);
    else gsap.set('#pill .sheen', { x: -400 });
  }

  // ---------- film ----------
  function film(F) {
    window.FAST = F.fast || [];
    if (F.modes) MODES = F.modes;
    F.scenes.forEach(scene);
    const END = F.endCard ? F.endCard.T0 : F.dur + 1, ARCH = F.endCard ? F.endCard.arch : null;
    K.frame(t => {
      SWIPES.forEach(s => s.f(P(t, s.a, s.a + s.d, 'power2.inOut')));
      SC.forEach(s => frameScene(s, t));
      const day = dayAt(t), endK = ARCH ? P(t, ARCH[0], ARCH[0] + .8) : 0;
      $('#scrD').style.opacity = day * (1 - endK); $('#scrN').style.opacity = (1 - day) * (1 - endK);
      const H = $('#hdr'); H.style.setProperty('--hc', day > .5 ? '#0F4C48' : '#F3F6F1'); H.style.setProperty('--rc', day > .5 ? '#0F4C48' : '#DFE43A'); H.style.textShadow = day > .5 ? 'none' : '0 2px 18px rgba(10,58,55,.4)';
      $('#vig').style.opacity = 1 - .6 * (ARCH ? P(t, ARCH[0], ARCH[1] + .6) : 0);
      $('#grade').style.opacity = .2 * (1 - endK);
      let w = 0, wm = 0; (F.flashes || []).forEach(([a, m, b, col, max]) => { const v = (t < m ? P(t, a, m, 'power2.in') : 1 - P(t, m, b, 'power1.out')) * (max ?? 1); if (col === 'warm') wm = Math.max(wm, v); else w = Math.max(w, v); });
      $('#white').style.opacity = w; $('#warm').style.opacity = wm;
      $('#leak').style.opacity = F.leak ? F.leak(t) : 0;
      vis($('#endBg'), ARCH ? t >= ARCH[0] - .1 : false); vis($('#endT'), t >= END - .1);
      grains.forEach((gi, i) => { gi.style.visibility = Math.floor(t * 30) % 6 === i ? 'visible' : 'hidden'; });
      $('#grain').style.opacity = L(.42, .3, P(t, END - .4, END + .6));
      if (F.frame) F.frame(t);
    });
    window.ready = Promise.all(IMGS.map(i => i.decode().catch(() => {}))).then(() => {
      K.start(FW, FH, F.dur, ['600 62px Domine', '700 62px Domine', '500 30px Figtree', '600 30px Figtree', '700 30px Figtree', '800 30px Figtree'], [], () => {
        if (F.endCard) endCard(F.endCard);
        F.build(A);
      });
      return window.ready;
    });
  }
  const A = { tl, P, L, T, Track, el, img, glow, block, rise, swipe, exit, card, review, rating, list, product, header, toScreen, cover, $, $$, cue: K.cue, FW, FH, kP, isDay };
  return { film, ...A };
})();
