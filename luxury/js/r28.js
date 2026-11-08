/* Happy dogs: clips play only while on screen; reel arrows; thumbnails swap the main clip */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vids = document.querySelectorAll(".hdg video");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { io.observe(v); });
  }
  document.querySelectorAll(".hdg.v3").forEach(function (s) {
    var r = s.querySelector(".row"), pv = s.querySelector(".hp"), nx = s.querySelector(".hn");
    function st() { var t = r.querySelector(".vt"); return t ? t.getBoundingClientRect().width + 14 : 300; }
    function sync() { pv.disabled = r.scrollLeft < 4; nx.disabled = r.scrollLeft + r.clientWidth > r.scrollWidth - 4; }
    pv.addEventListener("click", function () { r.scrollBy({ left: -st() }); });
    nx.addEventListener("click", function () { r.scrollBy({ left: st() }); });
    r.addEventListener("scroll", sync, { passive: true }); sync();
  });
  document.querySelectorAll(".hdg.v4").forEach(function (s) {
    var v = s.querySelector(".main video"), cap = s.querySelector(".main .cap");
    s.querySelectorAll(".th").forEach(function (b) {
      b.addEventListener("click", function () {
        s.querySelectorAll(".th").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        v.poster = b.dataset.poster; v.src = b.dataset.src; cap.innerHTML = b.dataset.cap;
        if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
    });
  });
})();
