/* Motion for versions 1A and 1B, driven by attributes in the HTML:

     data-tilt="a,b"  pictures inside lean towards the pointer (a = side to side, b = up and down, in degrees)
     data-hero        its .ln lines, [data-hin] items and [data-land] pictures arrive after the loading screen lifts
     data-lines       heading whose .ln lines slide up from behind a mask when reached
     data-up          block that eases up when reached
     data-land        picture that drops into place with a slight turn when reached
     data-words       paragraph whose words light up as you scroll through it
     data-par         drifts by that % of its own height while on screen
     data-flex        curved edge that bends with scroll speed and springs back (value = the bent shape)
     data-rib         lettering and review stars laid along a curve; slides along it as you scroll
     data-stack       pile of pictures; the one for the current [data-step] comes to the top
     data-drag        row you can drag sideways with the mouse
     data-mag         button that leans towards the pointer
     data-cur         label the pointer dot shows over this element

   Needs GSAP + ScrollTrigger for the scroll effects; without them (or with reduced motion) everything simply shows. */
var FX = (function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lenis = null, live = false, ribbons = [];

  function scrollTo(el, off) {
    if (typeof el === 'string') el = $(el);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: off == null ? -120 : off });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + (off == null ? -120 : off), behavior: calm ? 'auto' : 'smooth' });
  }
  function refresh() { if (live) ScrollTrigger.refresh(); }

  /* ---------- pointer dot ---------- */
  function pointer() {
    var cur = $('#cursor');
    if (!cur || !fine || calm) return;
    var mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cur.classList.add('on'); });
    (function tick() { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(tick); })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      var big = t.closest('[data-cur]'), link = t.closest('a, button, summary, input, select, textarea, label');
      cur.classList.toggle('big', !!big);
      cur.classList.toggle('ring', !big && !!link);
      if (big) cur.dataset.label = big.getAttribute('data-cur');
    });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
  }

  /* ---------- pictures lean towards the pointer ---------- */
  function tilt() {
    if (!fine || calm) return;
    var cur = null, raf = 0, ev = null;
    function clear() { if (cur) { cur.style.removeProperty('--ry'); cur.style.removeProperty('--rx'); cur = null; } }
    function apply() {
      raf = 0; if (!cur || !ev) return;
      var r = cur.getBoundingClientRect(), k = (cur.getAttribute('data-tilt') || '20,14').split(',');
      cur.style.setProperty('--ry', (((ev.clientX - r.left) / r.width - 0.5) * (+k[0] || 20)).toFixed(2));
      cur.style.setProperty('--rx', ((0.5 - (ev.clientY - r.top) / r.height) * (+k[1] || 14)).toFixed(2));
    }
    document.addEventListener('mousemove', function (e) {
      var el = e.target.closest ? e.target.closest('[data-tilt]') : null;
      if (el !== cur) { clear(); cur = el; }
      ev = e; if (cur && !raf) raf = requestAnimationFrame(apply);
    });
    document.addEventListener('mouseleave', clear);
  }

  /* ---------- buttons that lean towards the pointer ---------- */
  function magnets() {
    if (!fine || calm) return;
    $$('[data-mag]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- rows you can drag sideways ---------- */
  function drags() {
    $$('[data-drag]').forEach(function (t) {
      var down = false, sx = 0, sl = 0, v = 0, lx = 0, lt = 0, moved = 0, raf = 0;
      t.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true; sx = lx = e.clientX; sl = t.scrollLeft; lt = performance.now(); v = 0; moved = 0; cancelAnimationFrame(raf);
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx, now = performance.now();
        moved = Math.max(moved, Math.abs(dx));
        if (moved > 6) t.classList.add('drag');
        t.scrollLeft = sl - dx;
        v = (e.clientX - lx) / Math.max(now - lt, 1); lx = e.clientX; lt = now;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return;
        down = false;
        setTimeout(function () { t.classList.remove('drag'); }, 0);
        (function glide() { if (Math.abs(v) < 0.02) return; t.scrollLeft -= v * 16; v *= 0.94; raf = requestAnimationFrame(glide); })();
      });
      t.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
      t.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
  }

  /* ---------- lettering and stars along a curve ---------- */
  function starPath(r) {
    var d = '', i, a, rr;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; rr = i % 2 ? r * 0.44 : r; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(2) + ' ' + (Math.sin(a) * rr).toFixed(2); }
    return d + 'Z';
  }
  function ribbon(svg) {
    var path = $('[data-rbp]', svg), NS = 'http://www.w3.org/2000/svg', shift = 0, start = +(svg.getAttribute('data-start') || 40);
    var items = $$('[data-rb]', svg).map(function (el) {
      var o = { el: el, stars: el.getAttribute('data-rb') === 'stars', gap: +(el.getAttribute('data-gap') || 0), line: el.hasAttribute('data-line') };
      if (o.stars) {
        o.size = +(el.getAttribute('data-size') || 10); o.dy = +(el.getAttribute('data-dy') || 0); o.n = [];
        for (var i = 0; i < 5; i++) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', starPath(o.size)); el.appendChild(p); o.n.push(p); }
      }
      return o;
    });
    function place() {
      if (!svg.getBoundingClientRect().width) return;
      var total = path.getTotalLength(), c = start + shift;
      items.forEach(function (o) {
        if (o.line) c = start + shift;
        if (o.stars) {
          var step = o.size * 2.3;
          o.n.forEach(function (p, i) {
            var s = Math.min(total - 1, Math.max(0, c + o.size + i * step)), a = path.getPointAtLength(s), b = path.getPointAtLength(s + 1), ang = Math.atan2(b.y - a.y, b.x - a.x);
            p.setAttribute('transform', 'translate(' + (a.x - Math.sin(ang) * o.dy).toFixed(2) + ' ' + (a.y + Math.cos(ang) * o.dy).toFixed(2) + ') rotate(' + (ang * 180 / Math.PI).toFixed(2) + ')');
          });
          c += step * 5 + o.gap;
        } else {
          o.el.setAttribute('startOffset', c.toFixed(1));
          c += o.el.getComputedTextLength() + o.gap;
        }
      });
    }
    place();
    return { svg: svg, place: place, set: function (v) { shift = v; place(); }, travel: +(svg.getAttribute('data-travel') || 0) };
  }
  function ribbonsInit() {
    ribbons = $$('[data-rib]').map(ribbon);
    var again = function () { ribbons.forEach(function (r) { r.place(); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
    window.addEventListener('resize', again);
    window.addEventListener('load', again);
  }

  /* ---------- pile of pictures ---------- */
  function stacks() {
    $$('[data-stack]').forEach(function (sec) {
      var cards = $$('[data-card]', sec), steps = $$('[data-step]', sec), n = cards.length, cur = -1, hover = false;
      function set(i) {
        if (i === cur) return; cur = i;
        cards.forEach(function (c, k) { c.setAttribute('data-pos', (k - i + n) % n); });
        steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      }
      steps.forEach(function (s, k) {
        s.addEventListener('mouseenter', function () { hover = true; set(k); });
        s.addEventListener('mouseleave', function () { hover = false; });
        s.addEventListener('click', function () { set(k); });
      });
      cards.forEach(function (c, k) { c.addEventListener('click', function () { set(k); }); });
      set(0);
      if (live) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 55%', onUpdate: function (s) { if (!hover) set(Math.min(n - 1, Math.floor(s.progress * n))); } });
    });
  }

  /* ---------- curved edges that bend with scroll speed and spring back ---------- */
  function flex() {
    var RE = /-?\d*\.?\d+/g;
    var list = $$('[data-flex]').map(function (el) {
      var p = el.tagName.toLowerCase() === 'path' ? el : $('path', el), a = p.getAttribute('d');
      return { p: p, A: a.match(RE).map(Number), B: el.getAttribute('data-flex').match(RE).map(Number), parts: a.split(RE) };
    });
    if (!list.length) return;
    var k = 0, v = 0, target = 0, active = false;
    function draw() {
      list.forEach(function (o) {
        var s = o.parts[0], i;
        for (i = 0; i < o.A.length; i++) s += (o.A[i] + (o.B[i] - o.A[i]) * k).toFixed(1) + o.parts[i + 1];
        o.p.setAttribute('d', s);
      });
      ribbons.forEach(function (r) { r.place(); });
    }
    function tick() {
      v += (target - k) * 0.09; v *= 0.82; k += v; target *= 0.9;
      if (Math.abs(v) < 0.0008 && Math.abs(k) < 0.002 && Math.abs(target) < 0.002) { k = 0; active = false; gsap.ticker.remove(tick); }
      draw();
    }
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
      target = Math.max(-0.7, Math.min(1, s.getVelocity() / 2600));
      if (!active) { active = true; gsap.ticker.add(tick); }
    } });
  }

  function init(opts) {
    opts = opts || {};
    pointer(); tilt(); magnets(); drags(); ribbonsInit();
    var loader = $('#loader'), started = false;
    function ready() { if (started) return; started = true; if (opts.ready) opts.ready(); }
    function anchors() {
      document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null; if (!a) return;
        var h = a.getAttribute('href'), el = h.length > 1 && document.getElementById(h.slice(1));
        if (el) { e.preventDefault(); scrollTo(el); }
      });
    }
    if (!(window.gsap && window.ScrollTrigger) || calm) {
      if (loader) loader.remove();
      anchors(); stacks(); ready();
      return;
    }
    live = true;
    document.documentElement.classList.add('fx');
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.05 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    anchors();

    /* loading count, then the hero arrives */
    var hLines = $$('[data-hero] .ln > span'), hIn = $$('[data-hero] [data-hin]'), hLand = $$('[data-hero] [data-land]'), hRib = $$('[data-hero] .rib');
    gsap.set(hLines, { yPercent: 112 });
    gsap.set(hIn, { autoAlpha: 0, y: 18 });
    gsap.set(hLand, { autoAlpha: 0, y: 150, rotation: function (i) { return i % 2 ? -9 : 9; } });
    gsap.set(hRib, { autoAlpha: 0 });
    function heroIn() {
      ready();
      gsap.to(hLines, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.1, delay: 0.15 });
      gsap.to(hIn, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.5, clearProps: 'transform' });
      gsap.to(hLand, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.5, ease: 'expo.out', stagger: 0.14, delay: 0.35 });
      gsap.to(hRib, { autoAlpha: 1, duration: 0.9, delay: 0.9 });
      /* the lettering runs out along the curve as it appears */
      ribbons.forEach(function (r) { var o = { v: -70 }; r.set(-70); gsap.to(o, { v: 0, duration: 1.7, ease: 'power3.out', delay: 0.8, onUpdate: function () { r.set(o.v); } }); });
    }
    function endLoader() {
      if (!loader) return;
      var l = loader; loader = null;
      gsap.to(l, { yPercent: -114, duration: 0.9, ease: 'power4.inOut', onStart: heroIn, onComplete: function () { l.remove(); } });
    }
    if (loader) {
      var n = { v: 0 }, num = $('#loadN');
      gsap.to(n, { v: 100, duration: 0.85, ease: 'power2.inOut',
        onUpdate: function () { if (num) num.textContent = ('00' + Math.round(n.v)).slice(-3); },
        onComplete: endLoader });
      setTimeout(endLoader, 3500);
    } else heroIn();

    /* header hides on the way down, returns on the way up */
    var hd = $('.hd');
    if (hd) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
      var open = !!$('.mm.open');
      hd.classList.toggle('solid', s.scroll() > 8);
      hd.classList.toggle('hide', s.direction === 1 && s.scroll() > 420 && !open);
    } });

    /* lettering slides along the hero curve while the hero is on screen */
    ribbons.forEach(function (r) {
      if (!r.travel) return;
      var o = { v: 0 };
      gsap.to(o, { v: r.travel, ease: 'none', onUpdate: function () { r.set(o.v); },
        scrollTrigger: { trigger: r.svg.parentNode, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    });

    $$('[data-lines]').forEach(function (h) {
      var ls = $$('.ln > span', h);
      gsap.set(ls, { yPercent: 112 });
      ScrollTrigger.create({ trigger: h, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(ls, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: 0.09 });
      } });
    });
    gsap.set('[data-up]', { autoAlpha: 0, y: 26 });
    ScrollTrigger.batch('[data-up]', { start: 'top 95%', once: true, onEnter: function (els) {
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' });
    } });
    $$('[data-land]').forEach(function (el, i) {
      if (el.closest('[data-hero]')) return;
      gsap.set(el, { autoAlpha: 0, y: 110, rotation: i % 2 ? -8 : 8 });
      ScrollTrigger.create({ trigger: el, start: 'top 96%', once: true, onEnter: function () {
        gsap.to(el, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.4, ease: 'expo.out' });
      } });
    });
    $$('[data-words]').forEach(function (p) {
      p.innerHTML = p.innerHTML.trim().split(/\s+(?![^<]*>)/).map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' ');
      gsap.fromTo($$('.wd', p), { opacity: 0.2 }, { opacity: 1, ease: 'none', stagger: 0.5,
        scrollTrigger: { trigger: p, start: 'top 86%', end: 'top 36%', scrub: true } });
    });
    $$('[data-par]').forEach(function (el) {
      var p = parseFloat(el.dataset.par);
      gsap.fromTo(el, { yPercent: p }, { yPercent: -p, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    flex(); stacks();
    if ($('.fw')) gsap.from('.fw', { yPercent: 46, ease: 'none', scrollTrigger: { trigger: $('.fw').parentNode, start: 'top bottom', end: 'bottom bottom', scrub: true } });

    window.addEventListener('load', function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
  }
  return { init: init, scrollTo: scrollTo, refresh: refresh, calm: calm };
})();
