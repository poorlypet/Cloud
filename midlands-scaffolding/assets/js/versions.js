/* Extra behaviour for the five homepage versions. Runs alongside site.js. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var motion = !!(window.gsap && window.ScrollTrigger) && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = matchMedia("(min-width: 901px)").matches;

  // moving photo wall (v3): each column's photos are doubled so the loop has no jump
  var wall = $("#wall");
  if (wall) {
    var P = ["job-09", "job-05", "job-01", "job-03", "job-11", "job-04", "job-06", "job-08", "job-10", "job-02", "job-12", "job-07"];
    for (var c = 0; c < 6; c++) {
      var list = [0, 1, 2, 3].map(function (k) { return P[(c * 2 + k * 3) % P.length]; });
      var h = list.map(function (p) { return '<img src="assets/img/' + p + '.jpg" alt="">'; }).join("");
      wall.insertAdjacentHTML("beforeend", '<div class="wcol"><div style="--t:' + (40 + c * 7 % 17) + 's">' + h + h + "</div></div>");
    }
  }

  // myth / fact switcher (v5)
  var sw = $$(".mf-sw button"), panes = $$(".mf-pane"), mi = 0, mt;
  function mf(n) {
    mi = (n + panes.length) % panes.length;
    panes.forEach(function (p, k) { p.classList.toggle("on", k === mi); });
    sw.forEach(function (b, k) { b.classList.toggle("on", k === mi); });
    clearTimeout(mt); mt = setTimeout(function () { mf(mi + 1); }, 7000);
  }
  if (panes.length) { sw.forEach(function (b, k) { b.addEventListener("click", function () { mf(k); }); }); mf(0); }

  // sticky photo that changes with each service (v4)
  var pics = $$(".v4-pics img"), svcs = $$(".v4-svc"), cnt = $(".v4-pics .count");
  function pic(i) { pics.forEach(function (p, k) { p.classList.toggle("on", k === i); }); if (cnt) cnt.textContent = (i + 1) + " / " + pics.length; }
  if (pics.length) {
    pic(0);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) pic(svcs.indexOf(e.target)); }); }, { rootMargin: "-45% 0px -45% 0px" });
      svcs.forEach(function (s) { io.observe(s); });
    }
  }

  if (!motion) return;
  gsap.registerPlugin(ScrollTrigger);

  // v1: photo opens out from its curved corner, floating cards drift on scroll
  if ($(".v1-pic")) {
    gsap.fromTo(".v1-pic .ph", { clipPath: "inset(18% 0% 0% 30% round 32px 32px 32px 140px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px 32px 32px 140px)", duration: 1.6, ease: "power4.inOut", delay: 0.4 });
    gsap.from(".v1-pic .ph img", { scale: 1.3, duration: 2.2, ease: "power3.out", delay: 0.4 });
    gsap.from([".v1-float", ".v1-badge"], { autoAlpha: 0, y: 40, duration: 1, ease: "back.out(1.6)", stagger: 0.15, delay: 1.2 });
  }
  // v2: the services slide past sideways while the screen holds (desktop)
  var pan = $(".v2-pan");
  if (pan && desktop) {
    var tr = $(".v2-track", pan), d = function () { return tr.scrollWidth - window.innerWidth; };
    gsap.to(tr, { x: function () { return -d(); }, ease: "none", scrollTrigger: { trigger: pan, start: "top top", end: function () { return "+=" + d(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    $$(".v2-card > img", pan).forEach(function (im) { gsap.fromTo(im, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: pan, start: "top top", end: function () { return "+=" + d(); }, scrub: true } }); });
  }
  // v3: the wall drifts as you scroll away
  $$(".wcol").forEach(function (c, i) { gsap.to(c, { yPercent: i % 2 ? 10 : -10, ease: "none", scrollTrigger: { trigger: ".v3-hero", start: "top top", end: "bottom top", scrub: true } }); });
  // v5: each post shrinks a little as the next one stacks on top
  var posts = $$(".post");
  posts.forEach(function (p, i) {
    if (i === posts.length - 1) return;
    gsap.to(p, { scale: 0.92, filter: "brightness(.75)", ease: "none", scrollTrigger: { trigger: posts[i + 1], start: "top bottom", end: "top 15%", scrub: true } });
  });
  // counters of photos in v4 and section headings in all
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
