/* New puppy: build-your-bundle totals (version 4) */
(function () {
  "use strict";
  document.querySelectorAll(".p4").forEach(function (sec) {
    var boxes = sec.querySelectorAll(".pk input"), cnt = sec.querySelector("[data-n]"), sub = sec.querySelector("[data-sub]"),
        off = sec.querySelector("[data-off]"), tot = sec.querySelector("[data-tot]"), note = sec.querySelector("[data-note]");
    function gbp(n) { return "£" + (n % 1 ? n.toFixed(2) : n); }
    function sync() {
      var n = 0, s = 0;
      boxes.forEach(function (b) { if (b.checked) { n++; s += +b.value; } });
      var rate = n >= 4 ? 0.15 : n >= 3 ? 0.1 : 0, d = Math.round(s * rate * 100) / 100;
      cnt.textContent = n + (n === 1 ? " piece" : " pieces");
      sub.textContent = gbp(s); off.textContent = d ? "−" + gbp(d) : "£0"; tot.textContent = gbp(s - d);
      note.textContent = n >= 4 ? "15% off applied." : n === 3 ? "Add one more piece for 15% off." : "Choose 3 pieces for 10% off, 4 or more for 15%.";
    }
    boxes.forEach(function (b) { b.addEventListener("change", sync); });
    sync();
  });
})();
