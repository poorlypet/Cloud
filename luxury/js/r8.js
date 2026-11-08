/* Axel & Hound · shop-by-category section behaviour
   C2: arrow buttons scroll the rail. C4: hovering a name shows its photo. */
(function () {
  "use strict";
  document.querySelectorAll(".c2").forEach(function (sec) {
    var rail = sec.querySelector(".rail"), prev = sec.querySelector(".prev"), next = sec.querySelector(".next-btn");
    function step() { var t = rail.querySelector(".ct"); return t ? t.getBoundingClientRect().width + 20 : 300; }
    function sync() {
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
    }
    prev.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: "smooth" }); });
    rail.addEventListener("scroll", sync, { passive: true });
    sync();
  });
  document.querySelectorAll(".c4").forEach(function (sec) {
    var names = sec.querySelectorAll(".nm"), imgs = sec.querySelectorAll(".stage img");
    function show(i) {
      names.forEach(function (n, k) { n.classList.toggle("on", k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle("on", k === i); });
    }
    names.forEach(function (n, i) {
      n.addEventListener("mouseenter", function () { show(i); });
      n.addEventListener("focus", function () { show(i); });
    });
  });
})();
