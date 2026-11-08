/* Reviews: centred quote slider (version 2), advances every 7s */
(function () {
  "use strict";
  document.querySelectorAll(".r2").forEach(function (sec) {
    var sl = sec.querySelectorAll(".slide"), dots = sec.querySelectorAll(".dots button"), i = 0, t = 0;
    function show(n) { i = n; sl.forEach(function (s, k) { s.hidden = k !== n; }); dots.forEach(function (d, k) { d.setAttribute("aria-pressed", k === n ? "true" : "false"); }); }
    function go() { clearInterval(t); if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) t = setInterval(function () { show((i + 1) % sl.length); }, 7000); }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); go(); }); });
    show(0); go();
  });
})();
