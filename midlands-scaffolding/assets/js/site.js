/* Midlands Solar Scaffolding: behaviour for every page.
   Everything is visible without this file; when GSAP loads it adds the motion. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var motion = !!(window.gsap && window.ScrollTrigger) && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = matchMedia("(min-width: 901px)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- menu ---------- */
  var burger = $("#burger");
  if (burger) {
    burger.addEventListener("click", function () { body.classList.toggle("open"); burger.setAttribute("aria-expanded", body.classList.contains("open")); });
    $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { body.classList.remove("open"); }); });
  }

  /* ---------- copy the phone number (tel: links don't work for every viewer) ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var t = b.dataset.copy, label = b.textContent;
      var ok = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = label; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, ok); else ok();
    });
  });

  /* ---------- forms: show a confirmation (this preview has nowhere to send them) ---------- */
  $$("form.form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      f.classList.add("sent");
      var b = $("button[type=submit]", f); if (b) b.disabled = true;
    });
  });

  /* ---------- hero slideshow ---------- */
  var slides = $$(".slides img"), dots = $$(".dots button"), si = 0, st;
  function show(n) {
    si = (n + slides.length) % slides.length;
    slides.forEach(function (im, k) { im.classList.toggle("on", k === si); });
    dots.forEach(function (d, k) { d.classList.remove("on"); if (k === si) { void d.offsetWidth; d.classList.add("on"); } });
    clearTimeout(st); st = setTimeout(function () { show(si + 1); }, 6000);
  }
  if (slides.length) { dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); }); }); show(0); }

  /* ---------- myth cards flip ---------- */
  $$(".myth").forEach(function (m) {
    var flip = function () { m.classList.toggle("flip"); m.setAttribute("aria-pressed", m.classList.contains("flip")); };
    m.addEventListener("click", flip);
    m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  /* ---------- learn: safe-scaffold hotspots and list ---------- */
  var pins = $$(".spot .pin"), items = $$(".safe-list li");
  function pick(i) {
    pins.forEach(function (p, k) { p.classList.toggle("on", k === i); });
    items.forEach(function (li, k) { li.classList.toggle("on", k === i); });
  }
  pins.forEach(function (p, k) { p.addEventListener("click", function () { pick(k); }); });
  items.forEach(function (li, k) { li.addEventListener("click", function () { pick(k); }); li.tabIndex = 0; li.addEventListener("keydown", function (e) { if (e.key === "Enter") pick(k); }); });
  if (items.length) pick(0);

  /* ---------- learn: scaffold types ---------- */
  var tabs = $$(".type-tabs button"), panes = $$(".type-pane");
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x, j) { x.classList.toggle("on", j === k); x.setAttribute("aria-selected", j === k); });
      panes.forEach(function (x, j) { x.classList.toggle("on", j === k); });
    });
  });

  /* ---------- work: filter and lightbox ---------- */
  var figs = $$(".gal figure");
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filters button").forEach(function (x) { x.classList.toggle("on", x === b); });
      figs.forEach(function (f) { f.classList.toggle("out", b.dataset.f !== "all" && f.dataset.cat.indexOf(b.dataset.f) < 0); });
    });
  });
  var lb = $("#lb"), li = 0;
  function openLb(i) {
    var vis = figs.filter(function (f) { return !f.classList.contains("out"); });
    li = (i + vis.length) % vis.length;
    $("img", lb).src = $("img", vis[li]).src; $("img", lb).alt = $("img", vis[li]).alt;
    lb.classList.add("on"); lb.dataset.vis = vis.length;
  }
  if (lb) {
    figs.forEach(function (f) { f.addEventListener("click", function () { var vis = figs.filter(function (x) { return !x.classList.contains("out"); }); openLb(vis.indexOf(f)); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { openLb(li - 1); });
    $(".nx", lb).addEventListener("click", function () { openLb(li + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("on")) return; if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") openLb(li - 1); if (e.key === "ArrowRight") openLb(li + 1); });
  }

  /* ---------- the scaffold that builds itself (home page) ---------- */
  // Front elevation of a two-storey house; each stage is one part of a real scaffold.
  var rig = $("#rig");
  if (rig) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 800 700"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Drawing of a scaffold going up in front of a two-storey house, one part at a time");
    var add = function (tag, attrs, parent) { var el = document.createElementNS(NS, tag); for (var k in attrs) el.setAttribute(k, attrs[k]); (parent || svg).appendChild(el); return el; };
    var grp = function (n) { return add("g", { "class": "stage", "data-stage": n }); };
    // house
    add("rect", { x: 150, y: 270, width: 500, height: 370, "class": "brick" });
    add("polygon", { points: "120,280 400,110 680,280", "class": "roof" });
    add("rect", { x: 520, y: 140, width: 44, height: 80, "class": "brick" });
    [[195, 320], [335, 320], [475, 320], [195, 470], [475, 470]].forEach(function (w) { add("rect", { x: w[0], y: w[1], width: 110, height: 90, rx: 4, "class": "win" }); });
    add("rect", { x: 350, y: 500, width: 80, height: 140, rx: 4, "class": "win" });
    add("line", { x1: 40, y1: 640, x2: 760, y2: 640, "class": "house" });
    var X = [130, 300, 470, 640], GROUND = 640, L1 = 470, L2 = 290;
    // 0 base plates and sole boards
    var g0 = grp(0);
    X.forEach(function (x) { add("rect", { x: x - 30, y: GROUND - 8, width: 60, height: 8, rx: 2, "class": "sole" }, g0); add("rect", { x: x - 14, y: GROUND - 14, width: 28, height: 6, "class": "plate" }, g0); });
    // 1 standards
    var g1 = grp(1);
    X.forEach(function (x) { add("line", { x1: x, y1: GROUND - 14, x2: x, y2: 200, "class": "tube" }, g1); });
    // 2 ledgers
    var g2 = grp(2);
    [L1, L2].forEach(function (y) { add("line", { x1: X[0] - 20, y1: y, x2: X[3] + 20, y2: y, "class": "tube" }, g2); });
    // 3 transoms and boards
    var g3 = grp(3);
    [L1, L2].forEach(function (y) { add("rect", { x: X[0] - 10, y: y - 12, width: X[3] - X[0] + 20, height: 12, rx: 2, "class": "board" }, g3); });
    // 4 guardrails and toe boards
    var g4 = grp(4);
    [L1, L2].forEach(function (y) {
      add("line", { x1: X[0] - 20, y1: y - 100, x2: X[3] + 20, y2: y - 100, "class": "tube" }, g4);
      add("line", { x1: X[0] - 20, y1: y - 55, x2: X[3] + 20, y2: y - 55, "class": "tube" }, g4);
      add("rect", { x: X[0] - 10, y: y - 30, width: X[3] - X[0] + 20, height: 18, rx: 2, "class": "toe" }, g4);
    });
    // 5 bracing
    var g5 = grp(5);
    add("line", { x1: X[0], y1: GROUND - 14, x2: X[1], y2: L1, "class": "tube" }, g5);
    add("line", { x1: X[1], y1: L1, x2: X[2], y2: L2, "class": "tube" }, g5);
    add("line", { x1: X[3], y1: GROUND - 14, x2: X[2], y2: L1, "class": "tube" }, g5);
    add("line", { x1: X[3] + 60, y1: GROUND - 6, x2: X[3], y2: L2, "class": "tube" }, g5);
    // 6 ladder and gate
    var g6 = grp(6);
    add("line", { x1: 80, y1: GROUND, x2: 120, y2: L1 - 90, "class": "ladder" }, g6);
    add("line", { x1: 110, y1: GROUND, x2: 150, y2: L1 - 90, "class": "ladder" }, g6);
    for (var r = 0; r < 9; r++) { var t = r / 9, y = GROUND - t * (GROUND - L1 + 90); add("line", { x1: 80 + 40 * t + 1, y1: y - 10, x2: 110 + 40 * t - 1, y2: y - 10, "class": "ladder" }, g6); }
    add("rect", { x: X[0] + 6, y: L2 - 100, width: 50, height: 88, rx: 4, "class": "gate" }, g6);
    // 7 inspected and tagged
    var g7 = grp(7);
    add("rect", { x: X[1] - 13, y: 560, width: 26, height: 40, rx: 4, "class": "tag" }, g7);
    add("rect", { x: X[1] + 26, y: 556, width: 168, height: 38, rx: 10, "class": "label-bg" }, g7);
    add("text", { x: X[1] + 40, y: 581, "class": "label" }, g7).textContent = "Inspected · ready";
    rig.appendChild(svg);
  }

  /* ---------- quote planner ---------- */
  var plan = $("#planner");
  if (plan) {
    var steps = $$(".qstep", plan), qi = 0, bar = $(".qbar i", plan), count = $("#qCount");
    var back = $("#qBack"), next = $("#qNext");
    var val = function (n) { var c = $('input[name="' + n + '"]:checked', plan); return c ? c.value : ""; };
    function go(n) {
      qi = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.classList.toggle("on", k === qi); });
      bar.style.width = ((qi + 1) / steps.length * 100) + "%";
      count.textContent = "Step " + (qi + 1) + " of " + steps.length;
      back.style.visibility = qi === 0 ? "hidden" : "visible";
      next.hidden = qi === steps.length - 1;
    }
    back.addEventListener("click", function () { go(qi - 1); });
    next.addEventListener("click", function () {
      var need = $("input[type=radio]", steps[qi]);
      if (need && !$("input[type=radio]:checked", steps[qi])) { steps[qi].querySelector(".opts").animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 300 }); return; }
      go(qi + 1);
    });
    plan.addEventListener("change", function (e) {
      update();
      if (e.target.type === "radio" && qi < steps.length - 1) setTimeout(function () { go(qi + 1); }, 260);
    });
    // live drawing of the job
    var pv = $("#pvSvg");
    function update() {
      var storeys = { bungalow: 1, house2: 2, house3: 3, commercial: 3 }[val("property")] || 2;
      var where = val("where") || "front";
      var job = val("job");
      var H = 90 * storeys, top = 300 - H;
      pv.innerHTML = "";
      var add = function (tag, a) { var el = document.createElementNS(NS, tag); for (var k in a) el.setAttribute(k, a[k]); pv.appendChild(el); return el; };
      add("rect", { x: 60, y: top, width: 240, height: H, "class": "pv-house" });
      add("polygon", { points: (50) + "," + top + " 180," + (top - 70) + " 310," + top, "class": "pv-roof" });
      if (where === "chimney" || job === "chimney") add("rect", { x: 230, y: top - 70, width: 24, height: 44, "class": "pv-house" });
      for (var s = 0; s < storeys; s++) { var wy = top + 22 + s * 90; [90, 165, 240].forEach(function (wx) { add("rect", { x: wx, y: wy, width: 40, height: 44, rx: 2, "class": "pv-win" }); }); }
      if (where === "chimney") {
        [222, 262].forEach(function (x) { add("line", { x1: x, y1: top - 80, x2: x, y2: top - 20, "class": "pv-scaf" }); });
        add("line", { x1: 212, y1: top - 40, x2: 272, y2: top - 40, "class": "pv-scaf" });
        add("rect", { x: 214, y: top - 44, width: 56, height: 6, "class": "pv-board" });
      } else {
        var xs = [44, 128, 212, 316], lifts = storeys;
        xs.forEach(function (x) { add("line", { x1: x, y1: 300, x2: x, y2: top - 30, "class": "pv-scaf" }); });
        for (var l = 1; l <= lifts; l++) {
          var y = 300 - l * 90 + (l === lifts ? 10 : 0);
          add("line", { x1: 34, y1: y, x2: 326, y2: y, "class": "pv-scaf" });
          add("rect", { x: 40, y: y - 6, width: 280, height: 6, "class": "pv-board" });
          add("line", { x1: 34, y1: y - 44, x2: 326, y2: y - 44, "class": "pv-scaf" });
        }
        add("line", { x1: 44, y1: 300, x2: 128, y2: 210, "class": "pv-scaf" });
      }
      add("line", { x1: 10, y1: 300, x2: 350, y2: 300, stroke: "#59616B", "stroke-width": 3 });
      var label = { front: "Front", back: "Back", side: "One side", frontback: "Front and back", all: "All the way round", chimney: "Chimney only" }[where] || "Front";
      var t = add("text", { x: 180, y: 330, "text-anchor": "middle", fill: "#A9B3BC", "font-size": 15, "font-family": "Satoshi, Arial, sans-serif", "font-weight": 700 }); t.textContent = label + " elevation";
      var names = function (n, map) { var v = val(n); return v ? map[v] : "Not chosen yet"; };
      $("#sJob").textContent = names("job", { solar: "Solar panel install", roof: "Roof repairs", chimney: "Chimney work", gutters: "Gutters and fascias", build: "Building or extension", paint: "Painting or rendering" });
      $("#sProp").textContent = names("property", { bungalow: "Bungalow", house2: "Two-storey house", house3: "Three-storey house", commercial: "Commercial building" });
      $("#sWhere").textContent = label;
      $("#sLifts").textContent = where === "chimney" ? "Chimney stack only" : storeys + (storeys === 1 ? " lift" : " lifts") + " of boards";
      $("#sWhen").textContent = names("when", { asap: "As soon as possible", two: "Within 2 weeks", month: "Within a month", flex: "I'm flexible" });
      $("#sLong").textContent = names("long", { w1: "About a week", w4: "2 to 4 weeks", m3: "1 to 3 months", unsure: "Not sure yet" });
    }
    // a link like quote.html#roof starts with that job ticked
    var pre = location.hash.replace("#", ""), r0 = pre && $('input[name="job"][value="' + pre + '"]', plan);
    if (r0) { r0.checked = true; }
    update(); go(r0 ? 1 : 0);
    $("#planForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!this.reportValidity()) return;
      $(".planner-flow", plan).hidden = true; $(".done", plan).classList.add("on");
    });
  }

  /* ---------- loader ---------- */
  var loader = $("#loader");
  function endLoader(then) {
    if (!loader) { if (then) then(); return; }
    var l = loader; loader = null;
    if (motion) gsap.to(l, { autoAlpha: 0, duration: 0.6, ease: "power2.out", onStart: then, onComplete: function () { l.remove(); } });
    else { l.remove(); if (then) then(); }
  }
  if (!motion) { endLoader(); return; }

  /* =====================  motion (needs GSAP)  ===================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var lines = $$("[data-hero] .ln > span"), hin = $$("[data-hero] [data-hin]");
  gsap.set(lines, { yPercent: 110 }); gsap.set(hin, { autoAlpha: 0, y: 22 });
  function heroIn() {
    gsap.to(lines, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.1, delay: 0.1 });
    gsap.to(hin, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.45 });
    $$(".wave .rim").forEach(function (r) { var n = r.getTotalLength(); gsap.fromTo(r, { strokeDasharray: n, strokeDashoffset: n }, { strokeDashoffset: 0, duration: 1.8, ease: "power3.inOut", delay: 0.3 }); });
  }
  window.addEventListener("load", function () { endLoader(heroIn); });
  setTimeout(function () { endLoader(heroIn); }, 2500);

  // nav: turns white once past the hero, hides on the way down
  var nav = $("#nav");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) {
    nav.classList.toggle("solid", body.classList.contains("solidnav") || s.scroll() > window.innerHeight * 0.55);
    nav.classList.toggle("hide", s.direction === 1 && s.scroll() > 400 && !body.classList.contains("open"));
  } });

  $$("[data-rise]").forEach(function (h) { gsap.from(h, { y: 40, autoAlpha: 0, duration: 1, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 92%" } }); });
  ScrollTrigger.batch("[data-up]", { start: "top 94%", once: true, onEnter: function (els) { gsap.from(els, { y: 36, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }); } });
  $$("[data-wipe]").forEach(function (m) {
    var im = $("img", m);
    gsap.fromTo(m, { clipPath: "inset(12% 12% 12% 12% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: { trigger: m, start: "top 95%", end: "top 40%", scrub: true } });
    if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
  });
  $$(".phero > img").forEach(function (im) { gsap.to(im, { yPercent: 14, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top top", end: "bottom top", scrub: true } }); });

  // the scaffold builds stage by stage while the screen holds
  var build = $("#build");
  if (build) {
    var stages = $$("[data-stage]", build), stepEls = $$(".step", build), meter = $$(".meter i", build);
    stages.forEach(function (g) {
      $$("line", g).forEach(function (l) { var len = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 }); });
      gsap.set($$("rect, text", g), { autoAlpha: 0, scaleY: 0.2, transformOrigin: "50% 100%" });
    });
    var tl = gsap.timeline();
    stages.forEach(function (g, i) {
      tl.addLabel("s" + i, i)
        .set($$("line", g), { autoAlpha: 1 }, i)
        .to($$("line", g), { strokeDashoffset: 0, duration: 0.7, stagger: 0.05, ease: "power2.inOut" }, i)
        .to($$("rect, text", g), { autoAlpha: 1, scaleY: 1, duration: 0.5, stagger: 0.04, ease: "back.out(1.6)" }, i + 0.15)
        .to($$("line.tube", g), { stroke: "#46B6D3", duration: 0.2 }, i)
        .to($$("line.tube", g), { stroke: "#C9D2D9", duration: 0.4 }, i + 0.8);
    });
    tl.to({}, { duration: 0.6 });
    ScrollTrigger.create({ trigger: build, start: "top top", end: "+=" + (stages.length * 32) + "%", pin: true, scrub: 0.5, animation: tl,
      onUpdate: function (s) {
        var k = Math.min(stepEls.length - 1, Math.floor(s.progress * stepEls.length * 1.02));
        stepEls.forEach(function (e, j) { e.classList.toggle("on", j === k); });
        meter.forEach(function (m, j) { m.classList.toggle("on", j <= k); });
      } });
  }

  // sideways strip (desktop pins; phones swipe)
  if (desktop) {
    $$("[data-xpin]").forEach(function (sec) {
      var track = $("[data-track]", sec);
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist() * 0.8; }, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
    });
  }

  // service-area rings pulse out from Wolverhampton
  $$(".radar .ring").forEach(function (r, i) { gsap.fromTo(r, { scale: 0.4, autoAlpha: 0.8, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 0, duration: 3.6, repeat: -1, delay: i * 1.2, ease: "power1.out" }); });
  $$(".radar .town").forEach(function (t, i) { gsap.from(t, { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(2)", delay: i * 0.06, scrollTrigger: { trigger: ".radar", start: "top 80%" } }); });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
