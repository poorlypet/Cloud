/* Axel & Hound · product pages round 7: photo tiles, index, progress line, size tab link, find-my-fit pop-up */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var S = [["XS", 30, 40, 46], ["S", 35, 46, 52], ["M", 40, 52, 58], ["L", 45, 58, 64], ["XL", 50, 64, 70]];

  /* photo tiles open the viewer at that photo */
  var lb = $(".zlb");
  $$("[data-lb]").forEach(function (t) {
    t.addEventListener("click", function () {
      var b = $('.zlb .lt button[data-i="' + t.dataset.lb + '"]');
      if (b) b.click();
      if (lb && !lb.open) lb.showModal();
    });
  });

  /* stacked photos: index beside follows the scroll */
  var gs = $$(".gs .gt"), gsr = $$(".gsr button");
  if (gs.length && gsr.length) {
    gsr.forEach(function (b, k) { b.addEventListener("click", function () { gs[k].scrollIntoView({ behavior: "smooth", block: "start" }); }); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = gs.indexOf(e.target);
          gsr.forEach(function (b, j) { b.setAttribute("aria-current", j === k ? "true" : "false"); });
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      gs.forEach(function (g) { io.observe(g); });
    }
  }

  /* progress line under the large photo */
  var pr = $(".gpr i"), zc = $(".gve .zm .zc");
  if (pr && zc && "MutationObserver" in window) {
    new MutationObserver(function () { var k = parseInt(zc.textContent, 10) - 1; pr.style.transform = "translateX(" + (k * 100) + "%)"; }).observe(zc, { childList: true, characterData: true, subtree: true });
  }

  /* "Size guide" opens the size tab under the product */
  function openSize() {
    var t = $('.t7 [data-t7="1"]');
    if (!t) return;
    if (t.tagName === "DETAILS") t.open = true; else t.click();
    t.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $$("[data-sg7]").forEach(function (b) { b.addEventListener("click", openSize); });

  /* find my fit */
  var d = $(".fm7");
  if (d) {
    var f = $(".fm7-f", d), r = $(".fm7-r", d), e = $(".fm7-e", d), pick = null;
    function reset() { f.hidden = false; r.hidden = true; e.textContent = ""; }
    $$("[data-fm]").forEach(function (b) { b.addEventListener("click", function () { reset(); d.showModal(); var i = $("input", f); if (i) i.focus(); }); });
    $$("[data-fm-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    d.addEventListener("click", function (ev) { if (ev.target === d) d.close(); });
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = $$("input", f).map(function (x) { return parseFloat(x.value); }), b = v[0], c = v[1];
      if (!(b > 0) || !(c > 0)) { e.textContent = "Enter both measurements in centimetres."; return; }
      if (b > 55 || c > 75) { e.textContent = "That is bigger than this coat’s largest size. Have a look at our Large and Giant collections."; return; }
      var a = S.findIndex(function (s) { return b <= s[1]; }), ci = S.findIndex(function (s) { return c <= s[3]; });
      if (a < 0) a = S.length - 1; if (ci < 0) ci = S.length - 1;
      var k = Math.max(a, ci), s = S[k], near = ((b > s[1] - 1.5) || (c > s[3] - 1.5)) && k < S.length - 1;
      pick = s[0];
      $(".big", r).textContent = s[0];
      $("p", r).textContent = near ? "A close fit. Choose " + S[k + 1][0] + " if you want room for a jumper underneath." : "A comfortable fit, with room to move.";
      $("[data-fm-use]", r).textContent = "Choose size " + s[0];
      f.hidden = true; r.hidden = false;
      $$(".zsz tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });
    });
    $("[data-fm-again]", r).addEventListener("click", reset);
    $("[data-fm-use]", r).addEventListener("click", function () {
      d.close();
      var btn = $('.szs button[data-s="' + pick + '"]');
      if (!btn) return;
      btn.scrollIntoView({ behavior: "smooth", block: "center" });
      if (btn.hasAttribute("data-oos")) { var st = $(".stock"); if (st) st.textContent = "Size " + pick + " is out of stock. We restock most sizes within two weeks."; }
      else btn.click();
    });
  }
})();
