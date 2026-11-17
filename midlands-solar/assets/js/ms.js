/* Midlands Solar website behaviour.
   Works from data- attributes in the HTML that site.py writes:

     data-hero     its .ln lines and [data-hin] items animate in after the loader
     data-rise     heading that rises into place when reached
     data-up       block that fades up when reached
     data-wipe     .media that wipes open when reached
     data-words    paragraph whose words light up as you scroll through it
     data-count    number that counts up (data-d decimals, data-s suffix)
     data-par      drifts by that % of its own height while on screen
     data-xpin     screen pinned while its [data-track] travels sideways (desktop)
     data-demo     pinned "panels on a real roof" demo with step captions
     data-voices   reviews slider
     data-pc       postcode bar: hands the postcode to the quote tool
     data-form     contact form (posts to data-endpoint when one is set)

   Needs GSAP + ScrollTrigger for motion; without them everything just shows. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap;
  var desktop = window.matchMedia("(min-width: 981px)").matches;

  /* ---------- menu ---------- */
  var burger = $("#burger");
  if (burger) {
    burger.addEventListener("click", function () { body.classList.toggle("open"); });
    $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { body.classList.remove("open"); }); });
  }

  /* ---------- postcode bars ---------- */
  $$("[data-pc]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var pc = f.postcode.value.trim().toUpperCase();
      try { sessionStorage.setItem("ms_postcode", pc); } catch (err) {}
      location.href = (window.MS_QUOTE || "quote/index.html") + "?postcode=" + encodeURIComponent(pc);
    });
  });

  /* ---------- contact forms ---------- */
  $$("[data-form]").forEach(function (f) {
    var msg = $(".msg", f), btn = $("button[type=submit]", f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var url = f.dataset.endpoint;
      msg.hidden = false;
      if (!url) { msg.textContent = "This form isn't connected yet. Please call 0800 654 6343 or email enquiries@midlandssolar.co.uk."; return; }
      btn.disabled = true; msg.textContent = "Sending…";
      fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(f) })
        .then(function (r) { if (!r.ok) throw new Error(); f.reset(); msg.textContent = "Thanks. We've got your message and will be in touch shortly."; })
        .catch(function () { msg.textContent = "Sorry, that didn't send. Please call 0800 654 6343 instead."; })
        .then(function () { btn.disabled = false; });
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

  /* ---------- only one question open at a time ---------- */
  $$(".faq").forEach(function (faq) {
    var all = $$("details", faq);
    all.forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
    });
  });

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

  /* ---------- phones that block autoplay: start the films on the first touch ---------- */
  window.addEventListener("touchstart", function () {
    $$("video[autoplay]").forEach(function (v) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } });
  }, { once: true, passive: true });

  /* ---------- moving photo wall behind the home hero ---------- */
  var wall = $("#mosaic");
  // on Shopify every asset lives in one folder, whose address the theme passes in as MS_BASE
  var IMG = window.MS_BASE || "assets/img/", VID = window.MS_BASE || "assets/video/";
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
          ? '<video src="' + VID + it[1] + '.mp4" poster="' + VID + it[1] + '.jpg" autoplay muted loop playsinline></video>'
          : '<img src="' + IMG + it[1] + '.jpg" alt="">';
      }).join("");
      // each column's list is doubled so it can loop without a visible jump
      wall.insertAdjacentHTML("beforeend", '<div class="mcol"><div style="--t:' + (38 + c * 7 % 19) + 's">' + html + html + "</div></div>");
    }
  }

  /* ---------- product pictures lean towards the pointer ---------- */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 34).toFixed(1));
        el.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 22).toFixed(1));
      });
      el.addEventListener("mouseleave", function () { el.style.removeProperty("--ry"); el.style.removeProperty("--rx"); });
    });
  }

  /* ---------- mouse orb: a dot that follows the pointer and grows over things you can use ---------- */
  var cur = $("#cursor");
  if (cur && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function tick() {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(tick);
    })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      var drag = t.closest(".track"), view = t.closest(".tiles a, a.gcard, .pay a"), link = t.closest("a, button, summary, input, select, textarea");
      cur.classList.toggle("big", !!(drag || view));
      cur.classList.toggle("ring", !drag && !view && !!link);
      if (drag) cur.dataset.label = "Scroll"; else if (view) cur.dataset.label = "View";
    });
  }

  /* ---------- loader ---------- */
  var loader = $("#loader");
  function endLoader(then) {
    if (!loader) return;
    var l = loader; loader = null;
    if (motion) gsap.to(l, { yPercent: -100, duration: 0.8, ease: "power4.inOut", onStart: then, onComplete: function () { l.remove(); } });
    else { l.remove(); if (then) then(); }
  }
  if (!motion) { endLoader(); return; }

  /* =====================  everything below needs GSAP  ===================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true }); // phone address bars resize the page as you scroll
  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // hero entrance as the loader lifts
  var hLines = $$("[data-hero] .ln > span"), hIn = $$("[data-hero] [data-hin]");
  gsap.set(hLines, { yPercent: 110 });
  gsap.set(hIn, { autoAlpha: 0, y: 24 });
  function heroIn() {
    gsap.to(hLines, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.11, delay: 0.2 });
    gsap.to(hIn, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.6 });
  }
  var n = { v: 0 }, loadN = $("#loadN");
  gsap.to(n, { v: 100, duration: 0.9, ease: "power2.inOut",
    onUpdate: function () { loadN.textContent = ("00" + Math.round(n.v)).slice(-3); },
    onComplete: function () { endLoader(heroIn); } });
  setTimeout(function () { endLoader(heroIn); }, 3500);

  $$("#mosaic .mcol").forEach(function (col, i) {
    gsap.to(col, { yPercent: i % 2 ? 9 : -9, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });
  if ($(".hero-in")) gsap.to(".hero-in", { yPercent: -14, autoAlpha: 0.3, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // inner-page heroes: the film opens out from a framed window as the loader lifts, then drifts on scroll
  $$("[data-film]").forEach(function (m) {
    var inner = m.querySelector("video,img");
    gsap.fromTo(m, { clipPath: "inset(14% 9% 14% 9% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.6, ease: "power4.inOut", delay: 0.9 });
    gsap.fromTo(inner, { scale: 1.35 }, { scale: 1.08, duration: 2.6, ease: "power3.out", delay: 0.9 });
    gsap.to(inner, { yPercent: 12, ease: "none", scrollTrigger: { trigger: m.parentNode, start: "top top", end: "bottom top", scrub: true } });
    gsap.to($$(":scope > div:not(.media)", m.parentNode), { yPercent: -16, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: m.parentNode, start: "top top", end: "bottom top", scrub: true } });
  });

  // nav hides on the way down, returns on the way up
  var nav = $("#nav");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) {
    nav.classList.toggle("solid", s.scroll() > window.innerHeight * 0.6);
    nav.classList.toggle("hide", s.direction === 1 && s.scroll() > 300 && !body.classList.contains("open"));
  } });

  $$("[data-rise]").forEach(function (h) {
    gsap.from(h, { yPercent: 35, autoAlpha: 0, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 92%" } });
  });

  gsap.set("[data-up]", { autoAlpha: 0, y: 36 });
  ScrollTrigger.batch("[data-up]", { start: "top 94%", once: true, onEnter: function (els) {
    gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.09 });
  } });

  $$("[data-wipe]").forEach(function (m) {
    var inner = m.querySelector("img,video");
    gsap.set(m, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(inner, { scale: 1.25 });
    ScrollTrigger.create({ trigger: m, start: "top 90%", once: true, onEnter: function () {
      gsap.to(m, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut" });
      gsap.to(inner, { scale: 1, duration: 1.8, ease: "power3.out" });
    } });
  });

  $$("[data-words]").forEach(function (p) {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wd">' + w + "</span>"; }).join(" ");
    gsap.fromTo($$(".wd", p), { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.5,
      scrollTrigger: { trigger: p, start: "top 85%", end: "top 30%", scrub: true } });
  });

  $$("[data-count]").forEach(function (b) {
    var end = parseFloat(b.dataset.count), d = +(b.dataset.d || 0), suf = b.dataset.s || "", o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out",
      onUpdate: function () { b.textContent = o.v.toFixed(d) + suf; },
      scrollTrigger: { trigger: b, start: "top 94%" } });
  });

  $$("[data-par]").forEach(function (el) {
    var p = parseFloat(el.dataset.par);
    gsap.fromTo(el, { yPercent: p }, { yPercent: -p, ease: "none",
      scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // pinned roof demo: pin drops, roof is traced, panels land, price slides up
  $$("[data-demo]").forEach(function (sec) {
    var q = function (k) { return $('[data-r="' + k + '"]', sec); };
    var roof = q("roof"), len = roof.getTotalLength(), panels = $$("polygon", q("panels")), caps = $$(".cap", sec), bar = $(".bar i", sec);
    gsap.set(roof, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
    gsap.set(panels, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set(q("price"), { yPercent: 130, autoAlpha: 0 });
    gsap.set(q("chip"), { autoAlpha: 0, y: -16 });
    gsap.set(q("img"), { scale: 1.22 });
    var tl = gsap.timeline({ defaults: { ease: "power2.out" } })
      .to(q("img"), { scale: 1, duration: 1 }, 0)
      .to(q("chip"), { autoAlpha: 1, y: 0, duration: 0.4 }, 0.2)
      .to(roof, { strokeDashoffset: 0, duration: 0.9, ease: "none" }, 0.9)
      .to(roof, { fillOpacity: 1, duration: 0.3 }, 1.5)
      .to(panels, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.2, ease: "back.out(1.6)" }, 1.8)
      .to(q("price"), { yPercent: 0, autoAlpha: 1, duration: 0.6 }, 2.7)
      .from($$("b", q("price")), { scaleX: 0, transformOrigin: "left", duration: 0.5, stagger: 0.1 }, 2.9)
      .to({}, { duration: 0.3 });
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "+=160%", pin: true, scrub: 0.5, animation: tl,
      onUpdate: function (s) {
        var i = Math.min(caps.length - 1, Math.floor(s.progress * caps.length * 1.04));
        caps.forEach(function (cp, k) { cp.classList.toggle("on", k === i); });
        gsap.set(bar, { scaleX: s.progress });
      } });
  });

  // sideways strips: the screen holds while the row travels across
  {
    $$("[data-xpin]").forEach(function (sec) {
      var track = $("[data-track]", sec);
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist() * 0.8; }, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
    });
  }

  // closing sun and footer wordmark
  if ($("#sun")) {
    gsap.set("#sun", { x: 0, y: 0, xPercent: -50, yPercent: 78 });
    gsap.to("#sun", { yPercent: 38, ease: "none", scrollTrigger: { trigger: ".end", start: "top bottom", end: "bottom bottom", scrub: true } });
  }
  gsap.from(".foot-word", { yPercent: 40, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });

  window.addEventListener("load", function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
