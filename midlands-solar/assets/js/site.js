/* Midlands Solar: small, dependency-free behaviours.
   Header, scroll reveals, parallax, count-ups, the sticky "how it works"
   steps, the draggable work rail, gallery filter + lightbox, forms. */
(function () {
  "use strict";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header: solid after the hero, hides on scroll down ---------- */
  var head = document.querySelector(".site-head"), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (head) {
      head.classList.toggle("solid", y > 80 || head.hasAttribute("data-solid"));
      head.classList.toggle("away", y > 500 && y > lastY && !document.documentElement.classList.contains("menu-open"));
    }
    lastY = y;
    var sc = document.querySelector(".sticky-cta");
    if (sc) sc.classList.toggle("show", y > 600);
    parallax();
    reveal();
  }
  var burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", function () {
    var open = document.documentElement.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });

  /* ---------- parallax on [data-parallax] ---------- */
  var plx = $$("[data-parallax]");
  function parallax() {
    if (REDUCE) return;
    var vh = window.innerHeight;
    plx.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = "translate3d(0," + (p * -(+el.dataset.parallax || 40)).toFixed(1) + "px,0)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- reveal on scroll ----------
     Checked on every scroll (not only by an observer) so nothing can be left
     invisible if the page jumps. */
  var pending = $$("[data-reveal],[data-count]");
  function reveal() {
    if (!pending.length) return;
    var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) return true;
      el.classList.add("in");
      if (el.hasAttribute("data-count")) countUp(el);
      return false;
    });
  }

  function countUp(el) {
    var to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    var pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    if (REDUCE) { el.textContent = pre + to.toFixed(dec) + suf; return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + (to * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- sticky "how the quote works" ---------- */
  var stage = document.querySelector(".how-stage"), steps = $$(".how-step");
  if (stage && steps.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (s) { s.classList.toggle("on", s === e.target); });
        stage.dataset.step = e.target.dataset.step;
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { so.observe(s); });
  }

  /* ---------- draggable rail ---------- */
  $$(".rail").forEach(function (rail) {
    var down = false, x0 = 0, s0 = 0;
    rail.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; x0 = e.clientX; s0 = rail.scrollLeft; rail.classList.add("drag"); });
    window.addEventListener("pointermove", function (e) { if (down) rail.scrollLeft = s0 - (e.clientX - x0); });
    window.addEventListener("pointerup", function () { down = false; rail.classList.remove("drag"); });
  });

  /* ---------- gallery filter + lightbox ---------- */
  var chips = $$(".chips button");
  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.toggle("on", c === b); });
      $$(".gallery figure").forEach(function (f) { f.hidden = b.dataset.f !== "all" && f.dataset.cat !== b.dataset.f; });
    });
  });
  $$(".gallery figure").forEach(function (f) {
    f.addEventListener("click", function () {
      var lb = document.createElement("div"); lb.className = "lightbox";
      var im = document.createElement("img"); im.src = f.querySelector("img").src; im.alt = f.querySelector("img").alt;
      lb.appendChild(im); document.body.appendChild(lb);
      var close = function () { lb.remove(); document.removeEventListener("keydown", key); };
      var key = function (e) { if (e.key === "Escape") close(); };
      lb.addEventListener("click", close); document.addEventListener("keydown", key);
    });
  });

  /* ---------- postcode bars: straight into the solar quote ---------- */
  $$("form.pc").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = f.querySelector("input").value.trim();
      try { if (v) sessionStorage.setItem("ms_postcode", v); } catch (err) {}
      location.href = f.dataset.quote + (v ? "?postcode=" + encodeURIComponent(v) : "");
    });
  });

  /* ---------- enquiry forms ---------- */
  $$("form.form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".msg"), ep = f.dataset.endpoint;
      if (!f.checkValidity()) { msg.hidden = false; msg.textContent = "Please fill in your name, phone number and a valid email."; return; }
      if (!ep) { msg.hidden = false; msg.textContent = "Preview only: this form isn't connected yet, so nothing was sent."; return; }
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      fetch(ep, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; f.reset(); msg.hidden = false; msg.textContent = "Thanks. We've got your message and will be in touch within one working day."; })
        .catch(function () { msg.hidden = false; msg.textContent = "That didn't send. Please call us on 0800 654 6343."; });
    });
  });

  onScroll();
})();
