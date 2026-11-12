/* Our story: scroll animations */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = function () { return window.innerHeight; };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  // progress of an element through the viewport: 0 when its top reaches the top, 1 when its bottom reaches the bottom
  function prog(el) { var r = el.getBoundingClientRect(); var d = r.height - vh(); return d > 0 ? clamp(-r.top / d, 0, 1) : (r.top < 0 ? 1 : 0); }

  // reveal on entry
  var rv = document.querySelectorAll("[data-rv]");
  if (reduce || !("IntersectionObserver" in window)) rv.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" });
    rv.forEach(function (e, i) { e.style.transitionDelay = (Array.prototype.indexOf.call(e.parentNode.children, e) % 6) * 90 + "ms"; io.observe(e); });
  }

  var pins = document.querySelectorAll(".sx-pin"), grows = document.querySelectorAll(".sx-grow"), pars = document.querySelectorAll("[data-par]"),
      hz = document.querySelectorAll(".sx-hz"), words = document.querySelectorAll(".sx-words"), heroes = document.querySelectorAll(".sx-hero"),
      slides = document.querySelectorAll(".sx-slide"), dots = document.querySelectorAll(".sx-dots i");

  function hzSize() { hz.forEach(function (s) { var t = s.querySelector(".sx-ht2"); s.style.height = (t.scrollWidth - window.innerWidth + vh()) + "px"; }); }

  function frame() {
    pins.forEach(function (s) {
      var p = prog(s), ms = s.querySelectorAll(".sx-m"), ts = s.querySelectorAll(".sx-step"), n = ms.length, i = Math.min(n - 1, Math.floor(p * n));
      ms.forEach(function (m, j) { m.classList.toggle("on", j === i); if (!reduce) m.style.transform = "scale(" + (1.08 - 0.08 * ((p * n) - j)) + ")"; });
      ts.forEach(function (t, j) { t.classList.toggle("on", j === i); });
      var b = s.querySelector(".sx-bar i"); if (b) b.style.transform = "scaleX(" + p + ")";
    });
    grows.forEach(function (s) {
      var p = reduce ? 1 : clamp(prog(s) * 1.6, 0, 1), m = s.querySelector(".sx-gm"), t = s.querySelector(".sx-gt");
      var ix = (1 - p) * 14, iy = (1 - p) * 18;
      m.style.clipPath = "inset(" + iy + "% " + ix + "% round " + ((1 - p) * 4) + "px)";
      m.firstElementChild.style.transform = "scale(" + (1.2 - 0.2 * p) + ")";
      t.style.opacity = clamp((p - 0.55) / 0.35, 0, 1); t.style.transform = "translateY(" + (1 - clamp((p - 0.55) / 0.35, 0, 1)) * 30 + "px)";
    });
    if (!reduce) pars.forEach(function (m) {
      var r = m.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh()) return;
      var c = (r.top + r.height / 2 - vh() / 2) / vh(); m.style.transform = "translateY(" + (c * -14) + "%)";
    });
    hz.forEach(function (s) {
      var t = s.querySelector(".sx-ht2"), p = prog(s); t.style.transform = "translateX(" + (-(t.scrollWidth - window.innerWidth) * p) + "px)";
      var b = s.querySelector(".sx-bar i"); if (b) b.style.transform = "scaleX(" + p + ")";
    });
    words.forEach(function (w) {
      var r = w.getBoundingClientRect(), p = reduce ? 1 : clamp((vh() * 0.85 - r.top) / (r.height + vh() * 0.35), 0, 1), sp = w.children, n = sp.length;
      for (var k = 0; k < n; k++) sp[k].classList.toggle("lit", k < p * n * 1.05);
    });
    if (!reduce) heroes.forEach(function (h) {
      var r = h.getBoundingClientRect(); if (r.bottom < 0) return; var p = clamp(-r.top / r.height, 0, 1);
      var m = h.firstElementChild; m.style.transform = "translateY(" + p * 18 + "%) scale(" + (1 + p * 0.08) + ")";
      var t = h.querySelector(".sx-ht"); t.style.opacity = 1 - p * 1.4; t.style.transform = "translateY(" + p * -60 + "px)";
    });
    if (slides.length) {
      var best = 0, bd = 1e9; slides.forEach(function (s, j) { var d = Math.abs(s.getBoundingClientRect().top); if (d < bd) { bd = d; best = j; } });
      dots.forEach(function (d, j) { d.classList.toggle("on", j === best); });
      slides.forEach(function (s, j) { s.classList.toggle("cur", j === best); });
    }
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { hzSize(); frame(); });
  hzSize(); frame();
  window.addEventListener("load", function () { hzSize(); frame(); });
})();
