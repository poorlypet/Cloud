/* Axel & Hound · refined category section behaviour
   H1: a small photo follows the cursor over the names. H4: tabs. */
(function () {
  "use strict";
  document.querySelectorAll(".h1").forEach(function (sec) {
    var fl = sec.querySelector(".float"), imgs = fl.querySelectorAll("img"), raf = 0, x = 0, y = 0;
    sec.querySelectorAll(".runon a").forEach(function (a, i) {
      a.addEventListener("mouseenter", function () { imgs.forEach(function (im, k) { im.classList.toggle("on", k === i); }); fl.classList.add("on"); });
      a.addEventListener("mouseleave", function () { fl.classList.remove("on"); });
    });
    sec.addEventListener("mousemove", function (e) {
      x = e.clientX + 120; y = e.clientY + 60;
      if (!raf) raf = requestAnimationFrame(function () { fl.style.left = x + "px"; fl.style.top = y + "px"; raf = 0; });
    });
  });
  document.querySelectorAll(".h4").forEach(function (sec) {
    var tabs = sec.querySelectorAll("[role=tab]"), panels = sec.querySelectorAll("[role=tabpanel]");
    function pick(i) {
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; pick(n); tabs[n].focus(); }
      });
    });
  });
})();
