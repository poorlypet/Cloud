/* Axel & Hound · round 16: centred tabs and filter chips */
(function () {
  "use strict";
  document.querySelectorAll(".ss-tabs").forEach(function (t) {
    var bs = t.querySelectorAll("[data-sst]"), root = t.closest("section") || document;
    bs.forEach(function (b) {
      b.addEventListener("click", function () {
        bs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        root.querySelectorAll("[data-ssp]").forEach(function (p) { p.hidden = p.dataset.ssp !== b.dataset.sst; });
      });
    });
  });
  document.querySelectorAll(".ss-chips button").forEach(function (b) {
    b.addEventListener("click", function () { b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
  });
})();
