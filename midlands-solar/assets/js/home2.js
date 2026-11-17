/* Midlands Solar homepage: scroll motion.
   Needs GSAP + ScrollTrigger (and Lenis for smooth scrolling). If any of them
   fail to load the page still reads top to bottom with everything visible. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motion = hasGsap && !calm;
  var desktop = window.matchMedia("(min-width: 981px)").matches;

  /* ---------- hero version (video or mosaic), chosen by the #hash ---------- */
  var MOSAIC = [
    ["i", "home-1"], ["v", "fly-glades-1"], ["i", "home-drone-1"], ["i", "bat-ecoflow-1"],
    ["v", "fly-snowdon-1"], ["i", "home-3"], ["i", "com-1"], ["i", "home-5"],
    ["i", "home-2"], ["v", "fly-glades-2"], ["i", "bat-sigen"], ["i", "home-6"],
    ["i", "home-drone-2"], ["v", "fly-snowdon-2"], ["i", "home-4"], ["i", "com-3"],
    ["v", "fly-glades-3"], ["i", "bat-ecoflow-3"], ["i", "com-2"], ["i", "bat-fox"],
    ["i", "com-4"], ["v", "battery"], ["i", "bat-growatt"], ["i", "com-5"]
  ];
  var mosaicBuilt = false;
  function buildMosaic() {
    if (mosaicBuilt) return;
    mosaicBuilt = true;
    var wall = $("#mosaic"), cols = 6, per = MOSAIC.length / cols;
    for (var c = 0; c < cols; c++) {
      var items = MOSAIC.slice(c * per, c * per + per);
      var html = items.map(function (it) {
        return it[0] === "v"
          ? '<video src="assets/video/' + it[1] + '.mp4" poster="assets/video/' + it[1] + '.jpg" autoplay muted loop playsinline></video>'
          : '<img src="assets/img/' + it[1] + '.jpg" alt="">';
      }).join("");
      var col = document.createElement("div");
      col.className = "mcol";
      // the list is doubled so the column can loop without a visible jump
      col.innerHTML = '<div style="--t:' + (38 + c * 7 % 19) + 's">' + html + html + "</div>";
      wall.appendChild(col);
    }
    if (motion) {
      $$(".mcol", wall).forEach(function (col, i) {
        gsap.to(col, { yPercent: i % 2 ? 9 : -9, ease: "none",
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      });
    }
  }
  function setHero(kind) {
    kind = kind === "mosaic" ? "mosaic" : "video";
    document.body.classList.toggle("hero-mosaic", kind === "mosaic");
    document.body.classList.toggle("hero-video", kind === "video");
    if (kind === "mosaic") buildMosaic();
    $$("#switch button").forEach(function (b) { b.classList.toggle("on", b.dataset.hero === kind); });
    var v = $(".hero-bg-video video");
    if (v) { if (kind === "video") { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
  }
  setHero(location.hash.replace("#", ""));
  $$("#switch button").forEach(function (b) {
    b.addEventListener("click", function () {
      history.replaceState(null, "", "#" + b.dataset.hero);
      setHero(b.dataset.hero);
      window.scrollTo(0, 0);
    });
  });

  /* ---------- postcode bars: hand the postcode to the quote tool ---------- */
  $$("[data-pc]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var pc = f.postcode.value.trim().toUpperCase();
      try { sessionStorage.setItem("ms_postcode", pc); } catch (err) {}
      location.href = "quote/index.html?postcode=" + encodeURIComponent(pc);
    });
  });

  /* ---------- menu ---------- */
  $("#burger").addEventListener("click", function () { document.body.classList.toggle("open"); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("open"); }); });

  /* ---------- reviews ---------- */
  (function () {
    var qs = $$("#voices blockquote"), i = 0, timer;
    function show(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle("on", k === i); });
      $("#vN").textContent = (i + 1) + " / " + qs.length;
      clearInterval(timer);
      timer = setInterval(function () { show(i + 1); }, 6500);
    }
    $("#vPrev").addEventListener("click", function () { show(i - 1); });
    $("#vNext").addEventListener("click", function () { show(i + 1); });
    show(0);
  })();

  /* ---------- gallery clips play only while on screen ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.2 });
    $$("video[data-v]").forEach(function (v) { io.observe(v); });
  }

  /* ---------- cursor + image that follows the pointer over "What we fit" ---------- */
  var cur = $("#cursor"), flt = $("#kitFloat");
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var mx = 0, my = 0, cx = 0, cy = 0, fx = 0, fy = 0;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function tick() {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      flt.style.left = fx + "px"; flt.style.top = fy + "px";
      requestAnimationFrame(tick);
    })();
    $$("#workTrack figure").forEach(function (f) {
      f.addEventListener("mouseenter", function () { cur.classList.add("big"); cur.dataset.label = "Scroll"; });
      f.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
    });
    $$("#kitRows a").forEach(function (a) {
      a.addEventListener("mouseenter", function () { $("img", flt).src = a.dataset.img; flt.classList.add("on"); });
      a.addEventListener("mouseleave", function () { flt.classList.remove("on"); });
    });
  }

  /* ---------- loader ---------- */
  var loader = $("#loader"), loadN = $("#loadN");
  function endLoader(then) {
    if (!loader) return;
    var l = loader; loader = null;
    if (motion) gsap.to(l, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onStart: then, onComplete: function () { l.remove(); } });
    else { l.remove(); if (then) then(); }
  }
  if (!motion) { endLoader(); return; }

  /* =====================  everything below needs GSAP  ===================== */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // hero entrance, run as the loader lifts
  gsap.set(".hero .ln > span", { yPercent: 110 });
  gsap.set([".hero-row > *", ".hero-foot"], { autoAlpha: 0, y: 24 });
  gsap.set(".hero-bg-video", { scale: 1.18 });
  function heroIn() {
    gsap.to(".hero .ln > span", { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.12, delay: 0.25 });
    gsap.to([".hero-row > *", ".hero-foot"], { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.75 });
    gsap.to(".hero-bg-video", { scale: 1, duration: 2.4, ease: "power3.out" });
  }
  var n = { v: 0 };
  gsap.to(n, { v: 100, duration: 1.3, ease: "power2.inOut",
    onUpdate: function () { loadN.textContent = ("00" + Math.round(n.v)).slice(-3); },
    onComplete: function () { endLoader(heroIn); } });
  setTimeout(function () { endLoader(heroIn); }, 4000); // safety net

  // hero drifts and darkens as you leave it
  gsap.to(".hero-in", { yPercent: -18, autoAlpha: 0.25, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-bg-video video", { yPercent: 14, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

  // nav: hides scrolling down, returns scrolling up
  var nav = $("#nav");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) {
    nav.classList.toggle("solid", s.scroll() > window.innerHeight * 0.7);
    nav.classList.toggle("hide", s.direction === 1 && s.scroll() > 300 && !document.body.classList.contains("open"));
  } });

  // statement: words light up as you scroll through
  var say = $("#sayText");
  say.innerHTML = say.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wd">' + w + "</span>"; }).join(" ");
  gsap.to("#sayText .wd", { opacity: 1, ease: "none", stagger: 0.5,
    scrollTrigger: { trigger: say, start: "top 82%", end: "bottom 42%", scrub: true } });

  // demo: pinned; the roof is found, outlined, filled with panels, then priced
  (function () {
    var steps = $$("#demoSteps li"), roof = $("#dRoof"), len = roof.getTotalLength();
    gsap.set(roof, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
    gsap.set("#dPanels polygon", { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set("#dPrice", { yPercent: 130, autoAlpha: 0 });
    gsap.set("#dChip", { autoAlpha: 0, y: -16 });
    gsap.set("#demoImg", { scale: 1.25 });
    function on(i) { steps.forEach(function (s, k) { s.classList.toggle("on", k === i); }); }
    var tl = gsap.timeline({ defaults: { ease: "power2.out" },
      scrollTrigger: { trigger: "#demo", start: "top top", end: "+=320%", pin: true, scrub: 0.6,
        onUpdate: function (s) { on(Math.min(3, Math.floor(s.progress * 4.2))); } } });
    tl.to("#demoImg", { scale: 1, duration: 1 }, 0)
      .to("#dChip", { autoAlpha: 1, y: 0, duration: 0.4 }, 0.3)
      .to(roof, { strokeDashoffset: 0, duration: 1, ease: "none" }, 1)
      .to(roof, { fillOpacity: 1, duration: 0.4 }, 1.7)
      .to("#dPanels polygon", { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.22, ease: "back.out(1.6)" }, 2.1)
      .to("#dPrice", { yPercent: 0, autoAlpha: 1, duration: 0.7 }, 3.1)
      .from("#dPrice b", { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.12 }, 3.3)
      .to({}, { duration: 0.5 });
  })();

  // work: the page pins and the strip travels sideways (desktop)
  if (desktop) {
    var track = $("#workTrack");
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, { x: function () { return -dist(); }, ease: "none",
      scrollTrigger: { trigger: "#work", start: "top top", end: function () { return "+=" + dist(); },
        pin: true, scrub: 0.5, invalidateOnRefresh: true } });
  }

  // headings rise out of their own line
  $$("h2").forEach(function (h) {
    if (h.closest(".demo") || h.closest(".end")) return;
    gsap.from(h, { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: "power4.out",
      scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  gsap.from("#kitRows a", { yPercent: 60, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
    scrollTrigger: { trigger: "#kitRows", start: "top 80%" } });

  // numbers count up
  $$("#nums b").forEach(function (b) {
    var end = parseFloat(b.dataset.n), d = +(b.dataset.d || 0), suf = b.dataset.s || "", o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out",
      onUpdate: function () { b.textContent = o.v.toFixed(d) + suf; },
      scrollTrigger: { trigger: b, start: "top 88%" } });
  });
  gsap.from("#nums div", { yPercent: 30, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.12,
    scrollTrigger: { trigger: "#nums", start: "top 80%" } });

  gsap.from(".pay a", { autoAlpha: 0, y: 50, duration: 1, ease: "power3.out", stagger: 0.15,
    scrollTrigger: { trigger: ".pay", start: "top 80%" } });

  // closing: the sun comes up behind the last call to action
  gsap.set("#sun", { x: 0, y: 0, xPercent: -50, yPercent: 78 });
  gsap.to("#sun", { yPercent: 36, ease: "none",
    scrollTrigger: { trigger: "#end", start: "top bottom", end: "bottom bottom", scrub: true } });
  gsap.from("#end .ln > span", { yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.12,
    scrollTrigger: { trigger: "#end", start: "top 55%" } });
  gsap.from(".foot-word", { yPercent: 40, ease: "none",
    scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
