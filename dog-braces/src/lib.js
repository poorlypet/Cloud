/* Shared behaviour: carousels with a progress bar, banner slider, mega menu, scalloped badge shape, scroll reveal. */
var UI = (function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Horizontal rail. Expects .rl-t (scrolling track), optional .rl-p / .rl-n buttons, .rl-b > i progress, .rl-c controls wrapper. */
  function rail(wrap) {
    var t = $('.rl-t', wrap), prev = $('.rl-p', wrap), next = $('.rl-n', wrap), bar = $('.rl-b i', wrap), ctl = $('.rl-c', wrap);
    function upd() {
      var max = t.scrollWidth - t.clientWidth, vis = Math.max(t.clientWidth / Math.max(t.scrollWidth, 1) * 100, 10);
      if (bar) { bar.style.width = vis + '%'; bar.style.left = (max > 0 ? (t.scrollLeft / max) * (100 - vis) : 0) + '%'; }
      if (ctl) ctl.classList.toggle('off', max <= 2);
      if (prev) prev.disabled = t.scrollLeft <= 2;
      if (next) next.disabled = t.scrollLeft >= max - 2;
    }
    function step(d) { t.scrollBy({ left: d * Math.max(t.clientWidth * 0.8, 240), behavior: calm ? 'auto' : 'smooth' }); }
    if (prev) prev.onclick = function () { step(-1); };
    if (next) next.onclick = function () { step(1); };
    t.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
    return { update: function () { t.scrollLeft = 0; upd(); } };
  }

  /* Banner slider. Expects .sl slides, .sl-p / .sl-n buttons, .sl-b > i progress, .sl-x play/pause button. */
  function slider(wrap, ms) {
    var slides = $$('.sl', wrap), i = 0, timer = null, playing = !calm, bar = $('.sl-b i', wrap), x = $('.sl-x', wrap);
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k !== i); if ('inert' in s) s.inert = k !== i; });
      if (bar) { bar.style.width = (100 / slides.length) + '%'; bar.style.left = (i * 100 / slides.length) + '%'; }
    }
    function run() { clearInterval(timer); if (playing) timer = setInterval(function () { show(i + 1); }, ms || 6500); }
    function label() { if (x) { x.classList.toggle('paused', !playing); x.setAttribute('aria-label', playing ? 'Pause banners' : 'Play banners'); var t = $('.sl-xt', x); if (t) t.textContent = playing ? 'Pause' : 'Play'; } }
    var p = $('.sl-p', wrap), n = $('.sl-n', wrap);
    if (p) p.onclick = function () { show(i - 1); run(); };
    if (n) n.onclick = function () { show(i + 1); run(); };
    if (x) x.onclick = function () { playing = !playing; label(); run(); };
    $$('[data-go]', wrap).forEach(function (d) { d.onclick = function () { show(+d.dataset.go); run(); }; });
    show(0); label(); run();
    return { show: show };
  }

  /* Mega menu. root holds [data-m] triggers and a .mm box with [data-p] panels. */
  function mega(root) {
    var box = $('.mm', root), cur = null, t = null;
    function open(id) {
      cur = id;
      $$('[data-m]', root).forEach(function (b) { b.setAttribute('aria-expanded', b.dataset.m === id); });
      if (id) $$('[data-p]', box).forEach(function (p) { p.hidden = p.dataset.p !== id; });
      box.classList.toggle('open', !!id);
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-m]');
      if (b) { open(cur === b.dataset.m ? null : b.dataset.m); return; }
      if (e.target.closest('.mm a, .mm button')) open(null);
    });
    if (window.matchMedia && matchMedia('(hover:hover) and (min-width:1000px)').matches) {
      $$('[data-m]', root).forEach(function (b) { b.addEventListener('mouseenter', function () { clearTimeout(t); open(b.dataset.m); }); });
      root.addEventListener('mouseleave', function () { t = setTimeout(function () { open(null); }, 160); });
      root.addEventListener('mouseenter', function () { clearTimeout(t); });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(null); });
    document.addEventListener('click', function (e) { if (cur && !root.contains(e.target)) open(null); });
    return { close: function () { open(null); } };
  }

  /* Path for a scalloped badge centred on 0,0 with n lobes. */
  function scallop(n, r) {
    var pts = [], k;
    for (k = 0; k < n; k++) { var a = (k / n) * Math.PI * 2 - Math.PI / 2; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    var chord = 2 * r * Math.sin(Math.PI / n), rad = (chord / 2 * 1.08).toFixed(2);
    var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (k = 1; k <= n; k++) { var p = pts[k % n]; d += ' A' + rad + ' ' + rad + ' 0 0 1 ' + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }
    return d + 'Z';
  }
  function badges(root) {
    $$('[data-scallop]', root).forEach(function (el) {
      var n = +el.getAttribute('data-scallop') || 14;
      el.insertAdjacentHTML('afterbegin', '<svg class="sc-bg" viewBox="-60 -60 120 120" aria-hidden="true"><path d="' + scallop(n, 50) + '"/></svg>');
    });
  }

  /* Elements with data-r fade up once seen. Content stays visible without JS. */
  function reveal() {
    document.documentElement.classList.add('js');
    var els = $$('[data-r]');
    if (calm || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Simple tab buttons: marks the clicked one and calls back with its data-k. */
  function tabs(el, cb) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]'); if (!b) return;
      $$('button[data-k]', el).forEach(function (c) { var on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-selected', on); });
      cb(b.dataset.k);
    });
  }
  return { $: $, $$: $$, rail: rail, slider: slider, mega: mega, scallop: scallop, badges: badges, reveal: reveal, tabs: tabs, calm: calm };
})();
