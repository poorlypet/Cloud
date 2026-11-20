/* Motion layer, driven by data- attributes in the HTML:

     data-hero     its .ln lines and [data-hin] items animate in after the loading screen lifts
     data-rise     heading that rises into place when reached
     data-up       block that fades up when reached (neighbours stagger)
     data-wipe     photo slot or panel that wipes open when reached
     data-words    paragraph whose words light up as you scroll through it
     data-par      drifts by that % of its own height while on screen
     data-draw     SVG path that draws itself when reached
     data-pop      badge that pops in when reached
     data-curve    curved section edge whose wave moves as you scroll
     data-xpin     screen pinned while its [data-track] travels sideways (desktop)
     data-tilt     card that leans towards the pointer
     data-cur      label the pointer orb shows over this element ("View", "Drag")

   Needs GSAP + ScrollTrigger; without them (or with reduced motion) everything simply shows. */
var FX = (function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lenis = null, live = false;

  function scrollTo(el, off) {
    if (typeof el === 'string') el = $(el);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: off == null ? -150 : off });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + (off == null ? -150 : off), behavior: calm ? 'auto' : 'smooth' });
  }
  function refresh() { if (live) ScrollTrigger.refresh(); }

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
  function tilt() {
    if (!fine || calm) return;
    document.addEventListener('mousemove', function (e) {
      var el = e.target.closest ? e.target.closest('[data-tilt]') : null; if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2));
      el.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2));
    });
    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest ? e.target.closest('[data-tilt]') : null;
      if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty('--ry'); el.style.removeProperty('--rx'); }
    });
  }

  function init(opts) {
    opts = opts || {};
    pointer(); tilt();
    var loader = $('#loader'), started = false;
    function ready() { if (started) return; started = true; if (opts.ready) opts.ready(); }
    var hasGsap = !!(window.gsap && window.ScrollTrigger);
    if (!hasGsap || calm) {
      if (loader) loader.remove();
      document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null; if (!a) return;
        var el = a.getAttribute('href').length > 1 && document.getElementById(a.getAttribute('href').slice(1));
        if (el) { e.preventDefault(); scrollTo(el); }
      });
      ready();
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
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null; if (!a) return;
      var el = a.getAttribute('href').length > 1 && document.getElementById(a.getAttribute('href').slice(1));
      if (el) { e.preventDefault(); scrollTo(el); }
    });

    /* loading screen, then the hero entrance */
    var hLines = $$('[data-hero] .ln > span'), hIn = $$('[data-hero] [data-hin]'), hPop = $$('[data-hero] [data-hpop]'), hDraw = $$('[data-hero] [data-hdraw]');
    gsap.set(hLines, { yPercent: 112 });
    gsap.set(hIn, { autoAlpha: 0, y: 26 });
    gsap.set(hPop, { scale: 0, rotation: -50 });
    hDraw.forEach(function (path) { var len = path.getTotalLength(); gsap.set(path, { strokeDasharray: len, strokeDashoffset: len }); });
    function heroIn() {
      ready();
      gsap.to(hLines, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.1, delay: 0.15 });
      gsap.to(hIn, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, delay: 0.5, clearProps: 'transform' });
      gsap.to(hDraw, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', delay: 0.3 });
      gsap.to(hPop, { scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.6)', delay: 0.9, stagger: 0.12 });
    }
    function endLoader() {
      if (!loader) return;
      var l = loader; loader = null;
      gsap.to(l, { yPercent: -112, duration: 0.9, ease: 'power4.inOut', onStart: heroIn, onComplete: function () { l.remove(); } });
    }
    if (loader) {
      var bar = $('.ld-b i', loader);
      gsap.to(bar, { scaleX: 1, duration: 0.95, ease: 'power2.inOut', onComplete: endLoader });
      setTimeout(endLoader, 3500);
    } else heroIn();

    /* header hides on the way down, returns on the way up */
    var hd = $('.hd');
    if (hd) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
      var open = !!$('.mm.open') || document.body.classList.contains('open');
      hd.classList.toggle('hide', s.direction === 1 && s.scroll() > 420 && !open);
    } });

    $$('[data-rise]').forEach(function (h) {
      gsap.from(h, { yPercent: 40, autoAlpha: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 93%' } });
    });
    gsap.set('[data-up]', { autoAlpha: 0, y: 34 });
    ScrollTrigger.batch('[data-up]', { start: 'top 95%', once: true, onEnter: function (els) {
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' });
    } });
    $$('[data-wipe]').forEach(function (m) {
      gsap.set(m, { clipPath: 'inset(100% 0% 0% 0%)' });
      ScrollTrigger.create({ trigger: m, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(m, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut', clearProps: 'clipPath' });
      } });
    });
    $$('[data-words]').forEach(function (p) {
      p.innerHTML = p.innerHTML.trim().split(/\s+(?![^<]*>)/).map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' ');
      gsap.fromTo($$('.wd', p), { opacity: 0.18 }, { opacity: 1, ease: 'none', stagger: 0.5,
        scrollTrigger: { trigger: p, start: 'top 86%', end: 'top 34%', scrub: true } });
    });
    $$('[data-par]').forEach(function (el) {
      var p = parseFloat(el.dataset.par);
      gsap.fromTo(el, { yPercent: p }, { yPercent: -p, ease: 'none',
        scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-draw]').forEach(function (path) {
      var len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: path.closest('section,div') || path, start: 'top 88%' } });
    });
    $$('[data-pop]').forEach(function (el) {
      gsap.from(el, { scale: 0, rotation: -40, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: el, start: 'top 94%' } });
    });
    /* curved edges: the wave rolls as the edge travels up the screen */
    $$('[data-curve]').forEach(function (svg) {
      var path = $('path', svg), to = svg.getAttribute('data-curve');
      if (path && to) gsap.to(path, { attr: { d: to }, ease: 'none', scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    /* sideways strips (desktop): the screen holds while the row travels across */
    if (window.matchMedia('(min-width: 981px)').matches) {
      $$('[data-xpin]').forEach(function (sec) {
        var track = $('[data-track]', sec);
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist() * 0.85; }, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
      });
    }
    /* pinned explainer: captions swap and the section's data-step updates as you scroll through it */
    $$('[data-steps]').forEach(function (sec) {
      var caps = $$('.cap', sec), bar = $('.bar i', sec);
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=' + (caps.length * 60) + '%', pin: true, scrub: 0.5,
        onUpdate: function (st) {
          var i = Math.min(caps.length - 1, Math.floor(st.progress * caps.length * 1.02));
          caps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
          sec.setAttribute('data-step', i);
          if (bar) gsap.set(bar, { scaleX: st.progress });
        } });
    });
    /* closing circle and footer wordmark */
    if ($('#orb')) {
      gsap.set('#orb', { x: 0, y: 0, xPercent: -50, yPercent: 94 });
      gsap.to('#orb', { yPercent: 83, ease: 'none', scrollTrigger: { trigger: $('#orb').parentNode, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    }
    if ($('.fw')) gsap.from('.fw', { yPercent: 45, ease: 'none', scrollTrigger: { trigger: $('.fw').parentNode, start: 'top bottom', end: 'bottom bottom', scrub: true } });

    window.addEventListener('load', function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
  }
  return { init: init, scrollTo: scrollTo, refresh: refresh, calm: calm };
})();
