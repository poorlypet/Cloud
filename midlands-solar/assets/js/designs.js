/* Shared behaviour for the five homepage designs (design-1.html … design-5.html).
   Adds the nav, menu, loader, footer and design switcher, then wires up
   scroll motion from data- attributes:

     data-hero            section whose .ln lines and [data-hin] items animate in after the loader
     data-rise            heading that rises into place when reached
     data-up              block that fades up when reached
     data-wipe            .media that wipes open when reached
     data-words           paragraph whose words light up as you scroll through
     data-count           number that counts up (data-d decimals, data-s suffix)
     data-par="12"        drifts up/down by that % of its own height while on screen
     data-drift="1|-1"    wide row that slides sideways while on screen
     data-grow            .media that opens from inset to full width
     data-xpin            section pinned while its [data-track] travels sideways (desktop)
     data-roof            filled with the "panels on a real roof" demo
     data-voices          reviews slider
     data-dup             contents doubled (for looping marquees)

   Needs GSAP + ScrollTrigger; without them everything simply shows. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body, design = body.dataset.design;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 981px)").matches;
  var MS = window.MS = { motion: motion, desktop: desktop, $: $, $$: $$ };

  /* ---------- page furniture ---------- */
  var NAMES = ["Daylight", "Cinema", "Sunrise", "Split", "Mosaic"];
  var LINKS = [["products.html", "Products"], ["work.html", "Our work"], ["funding.html", "Funding"], ["finance.html", "Finance"], ["about.html", "About"], ["contact.html", "Contact"]];
  var logo = body.classList.contains("light") ? "logo-dark.png" : "logo-light.png";
  var cta = '<a class="btn" href="quote/index.html">Get my quote <i>→</i></a>';
  body.insertAdjacentHTML("afterbegin",
    '<div class="loader" id="loader"><div><img src="assets/img/sun-mark.png" alt=""><span id="loadN">000</span></div></div>' +
    '<header class="nav" id="nav"><a class="logo" href="#top" aria-label="Midlands Solar home"><img src="assets/img/' + logo + '" alt="Midlands Solar"></a><ul>' +
    LINKS.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + "</a></li>"; }).join("") +
    '</ul><a class="tel" href="tel:08006546343">0800 654 6343</a>' + cta + '<button class="burger" id="burger" aria-label="Menu"></button></header>' +
    '<nav class="menu" id="menu">' + LINKS.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + cta + "</nav>");
  body.insertAdjacentHTML("beforeend",
    '<footer class="foot"><div class="foot-cols">' +
    '<div><img src="assets/img/logo-light.png" alt="Midlands Solar"><p>Solar panels and battery storage for homes, businesses and farms across the Midlands.</p></div>' +
    '<div><h4>Solar</h4><ul><li><a href="quote/index.html">Get my quote</a></li><li><a href="products.html">Products</a></li><li><a href="work.html">Our work</a></li><li><a href="commercial.html">Commercial</a></li><li><a href="agricultural.html">Agricultural</a></li></ul></div>' +
    '<div><h4>Paying</h4><ul><li><a href="funding.html">Government funding</a></li><li><a href="finance.html">Finance options</a></li><li><a href="about.html">About us</a></li></ul></div>' +
    '<div><h4>Talk to us</h4><ul><li><a href="tel:08006546343">0800 654 6343</a></li><li><a href="tel:07599965786">07599 965 786</a></li><li><a href="mailto:enquiries@midlandssolar.co.uk">enquiries@midlandssolar.co.uk</a></li><li><a href="contact.html">Contact us</a></li></ul></div>' +
    '</div><div class="foot-word" aria-hidden="true">Midlands Solar</div><div class="foot-base"><span>© Midlands Solar Installations Ltd</span><span>MCS certified installer</span></div></footer>' +
    '<div class="switch">' + NAMES.map(function (n, i) {
      return '<a href="design-' + (i + 1) + '.html"' + (String(i + 1) === design ? ' class="on"' : "") + ">" + (i + 1) + (String(i + 1) === design ? " " + n : "") + "</a>";
    }).join("") + "</div>");

  $("#burger").addEventListener("click", function () { body.classList.toggle("open"); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { body.classList.remove("open"); }); });

  /* ---------- postcode bars hand over to the quote tool ---------- */
  $$("[data-pc]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var pc = f.postcode.value.trim().toUpperCase();
      try { sessionStorage.setItem("ms_postcode", pc); } catch (err) {}
      location.href = "quote/index.html?postcode=" + encodeURIComponent(pc);
    });
  });

  /* ---------- reviews slider ---------- */
  $$("[data-voices]").forEach(function (box) {
    var qs = $$("blockquote", box), i = 0, timer, count = $("[data-vn]", box);
    function show(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle("on", k === i); });
      count.textContent = (i + 1) + " / " + qs.length;
      clearInterval(timer);
      timer = setInterval(function () { show(i + 1); }, 6500);
    }
    $("[data-prev]", box).addEventListener("click", function () { show(i - 1); });
    $("[data-next]", box).addEventListener("click", function () { show(i + 1); });
    show(0);
  });

  $$("[data-dup]").forEach(function (el) { el.innerHTML += el.innerHTML; });

  /* ---------- clips play only while on screen ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.15 });
    $$("video[data-v]").forEach(function (v) { io.observe(v); });
  }

  /* ---------- "panels on a real roof" demo ---------- */
  $$("[data-roof]").forEach(function (el) {
    el.classList.add("demo-media");
    el.innerHTML =
      '<img src="assets/img/home-5.jpg" alt="A roof we fitted with solar panels" data-r="img">' +
      '<svg viewBox="0 0 1275 1700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<polygon data-r="roof" points="690,418 1272,1040 2,1022" fill="rgba(242,103,39,.14)" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>' +
      '<g data-r="panels" fill="rgba(242,103,39,.5)" stroke="#F26727" stroke-width="7" stroke-linejoin="round">' +
      '<polygon points="517,641 801,655 797,800 507,786"/><polygon points="357,778 648,795 640,957 330,938"/><polygon points="652,795 948,815 950,980 641,957"/></g></svg>' +
      '<div class="demo-chip" data-r="chip"><i></i>Your home</div>' +
      '<div class="demo-price" data-r="price"><div><span>Roof space used</span><b style="--f:72%"></b></div><div><span>Bill covered</span><b style="--f:58%"></b></div><div class="o"><span>Your price</span><b style="--f:100%"></b></div></div>';
  });
  // one timeline (about 4 units long): pin drops, roof is traced, panels land, price slides up
  MS.roofTimeline = function (el) {
    var q = function (n) { return $('[data-r="' + n + '"]', el); };
    var roof = q("roof"), len = roof.getTotalLength(), panels = $$("polygon", q("panels"));
    gsap.set(roof, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
    gsap.set(panels, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set(q("price"), { yPercent: 130, autoAlpha: 0 });
    gsap.set(q("chip"), { autoAlpha: 0, y: -16 });
    gsap.set(q("img"), { scale: 1.25 });
    return gsap.timeline({ defaults: { ease: "power2.out" } })
      .to(q("img"), { scale: 1, duration: 1 }, 0)
      .to(q("chip"), { autoAlpha: 1, y: 0, duration: 0.4 }, 0.3)
      .to(roof, { strokeDashoffset: 0, duration: 1, ease: "none" }, 1)
      .to(roof, { fillOpacity: 1, duration: 0.4 }, 1.7)
      .to(panels, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.22, ease: "back.out(1.6)" }, 2.1)
      .to(q("price"), { yPercent: 0, autoAlpha: 1, duration: 0.7 }, 3.1)
      .from($$("b", q("price")), { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.12 }, 3.3)
      .to({}, { duration: 0.4 });
  };

  /* ---------- moving photo wall (design 5) ---------- */
  var wall = $("#mosaic");
  if (wall) {
    var M = [["i", "home-1"], ["v", "fly-glades-1"], ["i", "home-drone-1"], ["i", "bat-ecoflow-1"],
      ["v", "fly-snowdon-1"], ["i", "home-3"], ["i", "com-1"], ["i", "home-5"],
      ["i", "home-2"], ["v", "fly-glades-2"], ["i", "bat-sigen"], ["i", "home-6"],
      ["i", "home-drone-2"], ["v", "fly-snowdon-2"], ["i", "home-4"], ["i", "com-3"],
      ["v", "fly-glades-3"], ["i", "bat-ecoflow-3"], ["i", "com-2"], ["i", "bat-fox"],
      ["i", "com-4"], ["v", "battery"], ["i", "bat-growatt"], ["i", "com-5"]];
    for (var c = 0; c < 6; c++) {
      var html = M.slice(c * 4, c * 4 + 4).map(function (it) {
        return it[0] === "v"
          ? '<video src="assets/video/' + it[1] + '.mp4" poster="assets/video/' + it[1] + '.jpg" autoplay muted loop playsinline></video>'
          : '<img src="assets/img/' + it[1] + '.jpg" alt="">';
      }).join("");
      wall.insertAdjacentHTML("beforeend", '<div class="mcol"><div style="--t:' + (38 + c * 7 % 19) + 's">' + html + html + "</div></div>");
    }
  }

  /* ---------- loader ---------- */
  var loader = $("#loader");
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

  // hero entrance as the loader lifts
  var hLines = $$("[data-hero] .ln > span"), hIn = $$("[data-hero] [data-hin]");
  gsap.set(hLines, { yPercent: 110 });
  gsap.set(hIn, { autoAlpha: 0, y: 26 });
  function heroIn() {
    gsap.to(hLines, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.12, delay: 0.25 });
    gsap.to(hIn, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.7 });
  }
  var n = { v: 0 }, loadN = $("#loadN");
  gsap.to(n, { v: 100, duration: 1.2, ease: "power2.inOut",
    onUpdate: function () { loadN.textContent = ("00" + Math.round(n.v)).slice(-3); },
    onComplete: function () { endLoader(heroIn); } });
  setTimeout(function () { endLoader(heroIn); }, 4000);

  // nav hides on the way down, returns on the way up
  var nav = $("#nav");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) {
    nav.classList.toggle("solid", s.scroll() > window.innerHeight * 0.7);
    nav.classList.toggle("hide", s.direction === 1 && s.scroll() > 300 && !body.classList.contains("open"));
  } });

  $$("[data-rise]").forEach(function (h) {
    gsap.from(h, { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 90%" } });
  });

  gsap.set("[data-up]", { autoAlpha: 0, y: 44 });
  ScrollTrigger.batch("[data-up]", { start: "top 90%", once: true, onEnter: function (els) {
    gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 });
  } });

  $$("[data-wipe]").forEach(function (m) {
    var inner = m.querySelector("img,video");
    gsap.set(m, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(inner, { scale: 1.3 });
    ScrollTrigger.create({ trigger: m, start: "top 88%", once: true, onEnter: function () {
      gsap.to(m, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut" });
      gsap.to(inner, { scale: 1, duration: 1.8, ease: "power3.out" });
    } });
  });

  $$("[data-words]").forEach(function (p) {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wd">' + w + "</span>"; }).join(" ");
    gsap.fromTo($$(".wd", p), { opacity: 0.14 }, { opacity: 1, ease: "none", stagger: 0.5,
      scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 42%", scrub: true } });
  });

  $$("[data-count]").forEach(function (b) {
    var end = parseFloat(b.dataset.count), d = +(b.dataset.d || 0), suf = b.dataset.s || "", o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out",
      onUpdate: function () { b.textContent = o.v.toFixed(d) + suf; },
      scrollTrigger: { trigger: b, start: "top 90%" } });
  });

  $$("[data-par]").forEach(function (el) {
    var p = parseFloat(el.dataset.par);
    gsap.fromTo(el, { yPercent: p }, { yPercent: -p, ease: "none",
      scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  $$("[data-drift]").forEach(function (row) {
    var dir = +row.dataset.drift;
    var span = function () { return Math.max(0, row.scrollWidth - window.innerWidth); };
    gsap.fromTo(row, { x: function () { return dir > 0 ? 0 : -span(); } }, { x: function () { return dir > 0 ? -span() : 0; }, ease: "none",
      scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.4, invalidateOnRefresh: true } });
  });

  $$("[data-grow]").forEach(function (m) {
    gsap.fromTo(m, { clipPath: "inset(0% 4.5% 0% 4.5%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: { trigger: m, start: "top 85%", end: "top 12%", scrub: true } });
    gsap.fromTo(m.querySelector("img,video"), { scale: 1.2 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
  });

  if (desktop) {
    $$("[data-xpin]").forEach(function (sec) {
      var track = $("[data-track]", sec);
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
    });
  }

  // closing sun (designs that use the shared .end block) and footer wordmark
  if ($("#sun")) {
    gsap.set("#sun", { x: 0, y: 0, xPercent: -50, yPercent: 78 });
    gsap.to("#sun", { yPercent: 36, ease: "none", scrollTrigger: { trigger: ".end", start: "top bottom", end: "bottom bottom", scrub: true } });
  }
  gsap.from(".foot-word", { yPercent: 40, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });

  // pins are created in more than one script, so put them back in page order
  window.addEventListener("load", function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
