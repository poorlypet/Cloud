/* nkuku-style carousels: arrows scroll by one card and sit over the photos */
(function () {
  "use strict";
  document.querySelectorAll(".nk .car").forEach(function (car) {
    var tr = car.querySelector(".nktrack"), nx = car.querySelector(".nkav.nx"), pv = car.querySelector(".nkav.pv");
    function place() { var im = tr.querySelector(".ph"); if (im) { var y = im.offsetHeight / 2 + "px"; nx.style.top = y; pv.style.top = y; } }
    function step() { var it = tr.querySelector(".nkit"); return it ? it.getBoundingClientRect().width + 12 : 300; }
    function sync() { pv.disabled = tr.scrollLeft < 4; nx.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 4; }
    nx.addEventListener("click", function () { tr.scrollBy({ left: step() }); });
    pv.addEventListener("click", function () { tr.scrollBy({ left: -step() }); });
    tr.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", place); window.addEventListener("load", place);
    place(); sync();
  });
})();
/* reviews: two soft arrows scroll the row */
(function () {
  "use strict";
  document.querySelectorAll(".tpw .tcar").forEach(function (c) {
    var tr = c.querySelector(".trvs"), pv = c.querySelector(".tprev"), nx = c.querySelector(".tnext");
    function step() { var r = tr.querySelector(".tr"); return r ? r.getBoundingClientRect().width + 32 : 300; }
    function sync() { pv.disabled = tr.scrollLeft < 4; nx.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 4; }
    pv.addEventListener("click", function () { tr.scrollBy({ left: -step() }); });
    nx.addEventListener("click", function () { tr.scrollBy({ left: step() }); });
    tr.addEventListener("scroll", sync, { passive: true }); sync();
  });
})();
