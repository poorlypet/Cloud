/* Shared film kit: GSAP timeline seeked per frame, so every frame is a pure function of time. */
gsap.registerPlugin(SplitText, CustomEase, DrawSVGPlugin);
CustomEase.create('pro', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('whip', 'M0,0 C0.7,0 0.2,1 1,1');
const K = (() => {
  const Q = new URLSearchParams(location.search);
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'pro' } });
  const CUES = []; const cue = (t, k) => CUES.push([+t.toFixed(3), k]);
  const frameHooks = [];
  // fit a nowrap headline into a width by stepping its font size down
  function fit(el, maxW) { let fs = parseFloat(getComputedStyle(el).fontSize); while (el.scrollWidth > maxW + 1 && fs > 30) { fs -= 2; el.style.fontSize = fs + 'px'; } }
  // masked line reveal; highlighted <em> words get one lime marker block per line
  function lines(el, at, o = {}) {
    if (typeof el === 'string') el = $(el);
    const st = SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'ln' });
    tl.from(st.words, { yPercent: 150, rotate: o.rot ?? 3, transformOrigin: '0% 100%', duration: o.dur ?? 1.1, stagger: o.stagger ?? 0.05, ease: 'expo.out' }, at);
    const ems = [...el.querySelectorAll('em')];
    if (ems.length && !el.closest('.teal,.deep')) tl.fromTo(ems, { backgroundSize: '0% 62%' }, { backgroundSize: '100% 62%', duration: 0.6, stagger: 0.1, ease: 'expo.inOut' }, at + (o.mk ?? 0.6));
    if (!o.silent) cue(at + 0.04, 'swish');
    return st;
  }
  function out(el, at, o = {}) { tl.to(el, { yPercent: o.y ?? -40, opacity: 0, duration: o.dur ?? 0.5, ease: 'power3.in' }, at); }
  function blurIn(el, at, o = {}) { tl.from(el, { opacity: 0, y: o.y ?? 26, filter: 'blur(12px)', duration: o.dur ?? 0.9, ease: 'power3.out' }, at); }
  function show(id, at) { tl.set('#' + id, { visibility: 'visible' }, at); }
  function hide(id, at) { tl.set('#' + id, { visibility: 'hidden' }, at); }
  // product image sized by height, standing on a floor at cx
  const IM = {};
  function product(el) {
    const im = IM[el.dataset.img], h = +el.dataset.h, w = Math.round(im.naturalWidth * h / im.naturalHeight);
    el.style.width = w + 'px'; el.style.height = h + 'px';
    if (el.dataset.floor) el.style.top = (+el.dataset.floor - h) + 'px';
    if (el.dataset.cx) el.style.left = (+el.dataset.cx - w / 2) + 'px';
    if (!el.querySelector('img')) { const i = document.createElement('img'); i.src = im.src; el.appendChild(i); }
    return el;
  }
  function shadow(sh, p, spread = 1.1, ht = 40) {
    const w = p.offsetWidth * spread, cx = p.offsetLeft + p.offsetWidth / 2, fl = p.offsetTop + p.offsetHeight;
    Object.assign(sh.style, { width: w + 'px', height: ht + 'px', left: (cx - w / 2) + 'px', top: (fl - ht / 2) + 'px' });
  }
  function load(names, base = '../shared/assets/') { return Promise.all(names.map(n => new Promise(r => { const im = new Image(); im.onload = () => { IM[n] = im; r(); }; im.src = base + n + '.png'; }))); }
  function stars(n, size = 34, fill = 1) {
    return `<span class="stars">${[0, 1, 2, 3, 4].map(i => { const f = Math.max(0, Math.min(1, n - i)); return `<span style="position:relative;display:block;width:${size}px;height:${size}px"><svg style="position:absolute" width="${size}" height="${size}" viewBox="0 0 64 64"><path d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23 Z" fill="rgba(14,42,40,.14)"/></svg><span style="position:absolute;left:0;top:0;height:${size}px;width:${size * f}px;overflow:hidden"><svg width="${size}" height="${size}" viewBox="0 0 64 64"><path d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23 Z" fill="var(--gold)"/></svg></span></span>`; }).join('')}</span>`;
  }
  function start(W, H, DUR, fonts, imgs, build) {
    const stage = $('#stage'); stage.style.width = W + 'px'; stage.style.height = H + 'px';
    window.W = W; window.H = H; window.DUR = DUR; window.FPS = 30; window.CUES = CUES;
    window.renderFrame = t => { tl.seek(Math.min(t, DUR), false); frameHooks.forEach(f => f(t)); };
    window.ready = Promise.all([...fonts.map(f => document.fonts.load(f)), load(imgs)]).then(() => { build(); tl.set({}, {}, DUR); window.renderFrame(0); return true; });
    if (!Q.has('render')) {
      const fitStage = () => { const k = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `translate(${(innerWidth - W * k) / 2}px,0) scale(${k})`; };
      addEventListener('resize', fitStage); fitStage();
      window.ready.then(() => { const t0 = performance.now(); const loop = now => { window.renderFrame(((now - t0) / 1000) % DUR); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
    }
  }
  // ambient layer: three large soft rounded shapes drifting behind a scene's content
  function ambient(scene, cols, seed = 0) {
    const sc = typeof scene === 'string' ? $(scene) : scene, W = sc.offsetWidth || 1080, H = sc.offsetHeight || 1920;
    const spec = [[-0.18, 0.08, 0.62, 0], [0.62, 0.42, 0.55, 1], [0.05, 0.78, 0.5, 2]];
    const els = spec.map(([x, y, r, i]) => { const d = document.createElement('div'); d.className = 'amb';
      Object.assign(d.style, { position: 'absolute', left: x * W + 'px', top: y * H + 'px', width: r * W + 'px', height: r * W + 'px', borderRadius: '42% 58% 55% 45% / 50% 42% 58% 50%', background: cols[i % cols.length], pointerEvents: 'none' });
      sc.prepend(d); return d; });
    frameHooks.push(t => { if (sc.style.visibility === 'hidden') return; els.forEach((d, i) => { const ph = seed + i * 2.1;
      d.style.transform = `translate(${Math.sin(t * 0.22 + ph) * 70}px,${Math.cos(t * 0.17 + ph) * 60}px) rotate(${t * (6 + i * 3) * (i % 2 ? -1 : 1) + ph * 20}deg) scale(${1 + 0.05 * Math.sin(t * 0.3 + ph)})`; }); });
  }
  // a band of text scrolling sideways forever
  function marquee(el, text, speed = 60) {
    el = typeof el === 'string' ? $(el) : el; el.style.overflow = 'hidden'; el.style.whiteSpace = 'nowrap';
    const inner = document.createElement('div'); inner.style.cssText = 'display:inline-block;will-change:transform'; inner.innerHTML = (text + '&nbsp;').repeat(8); el.appendChild(inner);
    const sc = el.closest('.scene');
    frameHooks.push(t => { if (sc && sc.style.visibility === 'hidden') return; const unit = inner.scrollWidth / 8; inner.style.transform = `translateX(${-((t * speed) % unit)}px)`; });
  }
  return { $, $$, tl, cue, fit, lines, out, blurIn, show, hide, product, shadow, stars, start, ambient, marquee, frame: f => frameHooks.push(f), IM };
})();
