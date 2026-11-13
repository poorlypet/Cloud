/* Winter Sale cards: swatches select a colour; W2 arrows scroll the rail */
(function () {
  "use strict";
  document.querySelectorAll(".sw").forEach(function (sw) {
    var cn = sw.querySelector(".cn");
    sw.querySelectorAll("button[data-c]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        sw.querySelectorAll("button[data-c]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (cn) cn.textContent = b.getAttribute("data-c");
      });
    });
  });
  document.querySelectorAll(".w2").forEach(function (sec) {
    var r = sec.querySelector(".rail"), p = sec.querySelector(".p"), n = sec.querySelector(".n");
    function step() { var c = r.querySelector(".pcd"); return c ? c.offsetWidth + 24 : 300; }
    function sync() { p.disabled = r.scrollLeft < 4; n.disabled = r.scrollLeft + r.clientWidth > r.scrollWidth - 4; }
    p.addEventListener("click", function () { r.scrollBy({ left: -step(), behavior: "smooth" }); });
    n.addEventListener("click", function () { r.scrollBy({ left: step(), behavior: "smooth" }); });
    r.addEventListener("scroll", sync, { passive: true }); sync();
  });
})();
