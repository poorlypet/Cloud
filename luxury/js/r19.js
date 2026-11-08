/* Shop by size filter (version 2): pills swap the product row */
(function () {
  "use strict";
  document.querySelectorAll(".z2").forEach(function (sec) {
    var pills = sec.querySelectorAll(".pills button"), sets = sec.querySelectorAll("[data-set]");
    pills.forEach(function (b, i) {
      b.addEventListener("click", function () {
        pills.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        sets.forEach(function (s, k) { s.hidden = k !== i; });
      });
    });
  });
})();
