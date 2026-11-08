/* Shop by dog: breed tabs (version 5) */
(function () {
  "use strict";
  document.querySelectorAll(".d5").forEach(function (sec) {
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
