/* Axel & Hound · product pages round 7: photo tiles, index, progress line, size tab link, find-my-fit pop-up */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var S = [["XS", 30, 40, 46], ["S", 35, 46, 52], ["M", 40, 52, 58], ["L", 45, 58, 64], ["XL", 50, 64, 70]];
  /* the product's own size chart, when it has one: [size, back max, -, chest max] */
  (function () {
    var t = document.querySelector(".zsz table"); if (!t) return;
    var hs = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.toLowerCase(); });
    var bi = hs.findIndex(function (h) { return /back/.test(h); }), ci = hs.findIndex(function (h) { return /chest|brust/.test(h); });
    if (bi < 0 && ci < 0) return;
    function top(txt) { var n = (txt || "").match(/[0-9]+(?:[.,][0-9]+)?/g); return n ? parseFloat(n[n.length - 1].replace(",", ".")) : NaN; }
    var rows = [].map.call(t.querySelectorAll("tbody tr"), function (tr) {
      var c = tr.querySelectorAll("td");
      return [tr.getAttribute("data-s"), bi >= 0 ? top(c[bi] && c[bi].textContent) : 999, 0, ci >= 0 ? top(c[ci] && c[ci].textContent) : 999];
    }).filter(function (r) { return r[0]; });
    if (rows.length) { S = rows; window.AH_SIZES = rows; }
  })();

  /* information column: sticks, but when it is taller than the screen it scrolls first and sticks at its bottom */
  var gi = $(".gi");
  if (gi) {
    var fit = function () {
      var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hh")) || 84;
      gi.style.top = Math.min(hh + 24, window.innerHeight - gi.offsetHeight - 24) + "px";
    };
    fit(); window.addEventListener("resize", fit);
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(gi);
  }

  /* phones: swipeable photo row gets a counter and dots */
  var gg = $(".p8 .gg");
  if (gg) {
    var tiles = $$(".gt", gg), cnt = document.createElement("span"), dots = document.createElement("div");
    cnt.className = "gcount"; cnt.textContent = "1 / " + tiles.length;
    dots.className = "gdots"; dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = tiles.map(function (t, k) { return '<i class="' + (k ? "" : "on") + '"></i>'; }).join("");
    gg.parentNode.insertBefore(cnt, gg.nextSibling); cnt.parentNode.insertBefore(dots, cnt.nextSibling);
    var di = $$("i", dots), raf = 0;
    gg.addEventListener("scroll", function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var k = Math.round(gg.scrollLeft / (gg.clientWidth || 1));
        cnt.textContent = (k + 1) + " / " + tiles.length;
        di.forEach(function (d, j) { d.classList.toggle("on", j === k); });
      });
    }, { passive: true });
  }

  /* size as a drop-down row */
  $$(".sdd").forEach(function (dd) {
    var btn = $(".sdd-b", dd), panel = $(".sdd-p", dd);
    function set(o) { panel.hidden = !o; btn.setAttribute("aria-expanded", o ? "true" : "false"); }
    btn.addEventListener("click", function () { set(panel.hidden); });
    $$(".szs button", panel).forEach(function (b) { b.addEventListener("click", function () { if (!b.hasAttribute("data-oos")) set(false); }); });
    document.addEventListener("click", function (e) { if (!dd.contains(e.target) && !panel.hidden) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { set(false); btn.focus(); } });
  });

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
    $$("[data-fm]").forEach(function (b) { b.addEventListener("click", function () { reset(); var ch = $("[data-fm-chart]", d), src = document.querySelector(".t7-sz"); if (ch && src && !ch.firstChild) ch.innerHTML = src.innerHTML; d.showModal(); var i = $("input", f); if (i) i.focus(); }); });
    $$("[data-fm-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    d.addEventListener("click", function (ev) { if (ev.target === d) d.close(); });
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = $$("input", f).map(function (x) { return parseFloat(x.value); }), b = v[0], c = v[1];
      if (!(b > 0) || !(c > 0)) { e.textContent = "Enter both measurements in centimetres."; return; }
      var L = S[S.length - 1]; if (b > L[1] + 2 || c > L[3] + 2) { e.textContent = "That is bigger than the largest size of this piece. Have a look at our Large and Giant collections."; return; }
      var a = S.findIndex(function (s) { return b <= s[1]; }), ci = S.findIndex(function (s) { return c <= s[3]; });
      if (a < 0) a = S.length - 1; if (ci < 0) ci = S.length - 1;
      var k = Math.max(a, ci), s = S[k], near = ((b > s[1] - 1.5) || (c > s[3] - 1.5)) && k < S.length - 1;
      pick = s[0];
      $(".big", r).textContent = s[0];
      $("p", r).textContent = near ? "A close fit. Choose " + S[k + 1][0] + " if you want room for a jumper underneath." : "A comfortable fit, with room to move.";
      $("[data-fm-use]", r).textContent = "Choose size " + s[0];
      f.hidden = true; r.hidden = false;
      $$(".zsz tr[data-s], .fm7-chart tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });
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
