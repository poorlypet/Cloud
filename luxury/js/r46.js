/* Our story, round 34: custom scroll animations */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var H = function () { return window.innerHeight; }, W = function () { return window.innerWidth; };
  var cl = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  function prog(el) { var r = el.getBoundingClientRect(), d = r.height - H(); return d > 0 ? cl(-r.top / d, 0, 1) : (r.top < 0 ? 1 : 0); }
  function enter(el, a, b) { var r = el.getBoundingClientRect(); return cl((H() * a - r.top) / (H() * (a - b)), 0, 1); }

  // split headings into words that rise into place
  document.querySelectorAll(".sy-split").forEach(function (h) {
    var parts = h.innerHTML.split(/(\s+)/), out = "", k = 0;
    parts.forEach(function (p) {
      if (!p || /^\s+$/.test(p)) { out += p; return; }
      out += '<span class="w"><span style="transition-delay:' + (k++ * 60) + 'ms">' + p + "</span></span>";
    });
    h.innerHTML = out;
  });
  // add the class "in" when things come into view
  var seen = document.querySelectorAll("[data-rv],.sy-split,.sy-wipe,.sy3-l,.sy3-ph");
  if (reduce || !("IntersectionObserver" in window)) seen.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -14% 0px" });
    seen.forEach(function (e) {
      if (e.hasAttribute("data-rv")) e.style.transitionDelay = (Array.prototype.indexOf.call(e.parentNode.children, e) % 6) * 80 + "ms";
      io.observe(e);
    });
  }

  var $$ = function (s) { return document.querySelectorAll(s); };
  var words = $$(".sy-words"), grow2 = $$(".sy-grow2"), route = $$(".sy2-route"), panels = $$(".sy4-p"),
      zoom = $$(".sy5-zoom"), slide = $$(".sy5-slide"), run = $$(".sy5-run");
  function runSize() {
    run.forEach(function (s) { var t = s.querySelector(".sy5-track"); s.style.height = (t.scrollWidth - W() + H() + 80) + "px"; });
  }

  function frame() {
    words.forEach(function (w) {
      var p = reduce ? 1 : enter(w, 0.9, -0.1), sp = w.children;
      for (var i = 0; i < sp.length; i++) sp[i].classList.toggle("lit", i < p * sp.length * 1.08);
    });
    grow2.forEach(function (g) { var p = reduce ? 1 : enter(g, 1, 0.25); g.style.transform = "scale(" + (0.72 + 0.28 * p) + ")"; });
    route.forEach(function (s) {
      var p = prog(s), stops = s.querySelectorAll(".sy2-stop"), n = stops.length, f = p * n, i = Math.min(n - 1, Math.floor(f));
      s.querySelector(".sy2-draw").style.transform = "scaleX(" + Math.min(1, f / n * 1.02) + ")";
      stops.forEach(function (e, j) { e.classList.toggle("on", j === i); });
      s.querySelectorAll(".sy2-line i").forEach(function (e, j) { e.classList.toggle("on", j <= i); e.classList.toggle("cur", j === i); });
    });
    if (!reduce) panels.forEach(function (p, j) {
      var nx = panels[j + 1]; if (!nx) return;
      var t = cl(1 - nx.getBoundingClientRect().top / H(), 0, 1), inn = p.querySelector(".sy4-in");
      inn.style.transform = "scale(" + (1 - 0.06 * t) + ")"; inn.style.opacity = 1 - 0.6 * t;
    });
    zoom.forEach(function (z) {
      var p = reduce ? 0 : prog(z), n = z.querySelector(".sy5-name"), s = z.querySelector(".sy5-sub"), bg = z.querySelector(".sy5-bg");
      n.style.transform = "scale(" + (1 + Math.pow(p, 2.2) * 26) + ")"; n.style.opacity = cl(1 - (p - 0.55) / 0.3, 0, 1);
      s.style.opacity = cl(1 - p * 4, 0, 1); bg.style.transform = "scale(" + (1.25 - 0.25 * p) + ")";
    });
    slide.forEach(function (s) {
      var p = reduce ? 1 : enter(s, 1, 0.2);
      s.querySelector(".sy5-a").style.transform = "translateX(" + (-55 * (1 - p)) + "%)";
      s.querySelector(".sy5-b").style.transform = "translateX(" + (55 * (1 - p)) + "%)";
    });
    if (!reduce) $$(".sy6-hero").forEach(function (h) {
      var r = h.getBoundingClientRect(); if (r.bottom < 0) return; var p = cl(-r.top / r.height, 0, 1);
      h.querySelector(".sy6-bg").style.transform = "translateY(" + p * 20 + "%) scale(" + (1 + p * 0.06) + ")";
      h.querySelector(".sy6-t").style.transform = "translateY(" + p * -40 + "px)"; h.querySelector(".sy6-t").style.opacity = 1 - p * 1.2;
    });
    run.forEach(function (s) { var t = s.querySelector(".sy5-track"), p = prog(s); t.style.transform = "translateX(" + (-(t.scrollWidth - W()) * p) + "px)"; });
  }
  var tk = false;
  window.addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(function () { tk = false; frame(); }); } }, { passive: true });
  window.addEventListener("resize", function () { runSize(); frame(); });
  runSize(); frame();
  window.addEventListener("load", function () { runSize(); frame(); });
})();
