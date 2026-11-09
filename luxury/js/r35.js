/* Axel & Hound · product pages round 4: gallery, lightbox, tabs, panel, size guide, fit finder, related rail */
(function () {
  "use strict";
  var zp = document.querySelector(".zp");
  if (!zp) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* gallery */
  var IM = JSON.parse(zp.dataset.images), i = 0, img = $(".zm img"), ctr = $(".zm .zc");
  function show(n) {
    i = (n + IM.length) % IM.length;
    img.classList.add("fade");
    setTimeout(function () { img.src = IM[i]; img.classList.toggle("cover", IM[i].indexOf("/products/") < 0); img.classList.remove("fade"); }, 120);
    ctr.textContent = (i + 1) + " / " + IM.length;
    $$(".zth button").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.i === i ? "true" : "false"); });
  }
  $$(".zth button").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); show(+b.dataset.i); }); });
  $$(".zm .za").forEach(function (a) { a.addEventListener("click", function (e) { e.stopPropagation(); show(i + (+a.dataset.d)); }); });

  /* lightbox */
  var lb = $(".zlb"), li = $(".zlb .st img"), lc = $(".zlb .lc");
  function lshow(n) {
    i = (n + IM.length) % IM.length; li.src = IM[i]; li.classList.remove("z"); lc.textContent = (i + 1) + " / " + IM.length;
    $$(".zlb .lt button").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.i === i ? "true" : "false"); });
  }
  var box = $(".zm");
  box.addEventListener("click", function () { lshow(i); lb.showModal(); });
  box.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lshow(i); lb.showModal(); } });
  $$(".zlb .lt button").forEach(function (b) { b.addEventListener("click", function () { lshow(+b.dataset.i); }); });
  $$(".zlb .za").forEach(function (a) { a.addEventListener("click", function () { lshow(i + (+a.dataset.d)); }); });
  li.addEventListener("click", function () { li.classList.toggle("z"); });
  $(".zlb [data-close]").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("close", function () { show(i); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") lshow(i + 1); if (e.key === "ArrowLeft") lshow(i - 1); });

  /* the three tabs */
  $$(".ztw").forEach(function (w) {
    var tabs = $$("[role=tab]", w), panels = $$("[role=tabpanel]", w);
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x, j) { x.setAttribute("aria-selected", j === k ? "true" : "false"); x.tabIndex = j === k ? 0 : -1; });
        panels.forEach(function (p, j) { p.hidden = j !== k; });
      });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = (k + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; tabs[n].click(); tabs[n].focus(); }
      });
    });
  });

  /* slide-in panel */
  var pan = $(".zpanel"), sc = $(".zscrim");
  function pset(on) { if (!pan) return; pan.classList.toggle("on", on); sc.classList.toggle("on", on); document.body.style.overflow = on ? "hidden" : ""; if (on) pan.focus(); }
  $$("[data-panel]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.getElementById("tp-" + b.dataset.panel);
      $(".zpanel .ph h2").textContent = b.dataset.title;
      $(".zpanel .pb").innerHTML = t.innerHTML; pset(true);
    });
  });
  $$("[data-pclose]").forEach(function (b) { b.addEventListener("click", function () { pset(false); }); });
  if (sc) sc.addEventListener("click", function () { pset(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pan && pan.classList.contains("on")) pset(false); });

  /* size guide: units and jump link */
  $$(".zunits button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".zunits button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".zsz td[data-cm]").forEach(function (td) { td.textContent = b.dataset.u === "in" ? td.dataset.in : td.dataset.cm; });
    });
  });
  $$("[data-goto]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); var t = document.getElementById(a.dataset.goto); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }); });

  /* fit finder: size, max back, chest min, chest max, neck */
  var S = [["XS", 30, 40, 46, 26], ["S", 35, 46, 52, 30], ["M", 40, 52, 58, 34], ["L", 45, 58, 64, 38], ["XL", 50, 64, 70, 42]], pick = null;
  var fd = $(".zfd");
  $$("[data-fit-open]").forEach(function (b) { b.addEventListener("click", function () { if (fd) { fd.showModal(); var f = $("input", fd); if (f) f.focus(); } }); });
  $$("[data-fd-close]").forEach(function (b) { b.addEventListener("click", function () { fd.close(); }); });
  $$("form.zcalc").forEach(function (form) {
    var wrap = form.parentElement, res = $(".zres", wrap), err = $(".err", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $$("input", form).map(function (x) { return parseFloat(x.value); }), back = v[0], chest = v[1], neck = v[2];
      if (!(back > 0) || !(chest > 0)) { err.textContent = "Enter the back length and chest in centimetres."; res.hidden = true; return; }
      if (back > 55 || chest > 75) { err.textContent = "That is bigger than this coat's largest size. Have a look at our Large and Giant collections."; res.hidden = true; return; }
      err.textContent = "";
      var a = S.findIndex(function (s) { return back <= s[1]; }), c = S.findIndex(function (s) { return chest <= s[3]; });
      if (a < 0) a = S.length - 1; if (c < 0) c = S.length - 1;
      var k = Math.max(a, c), s = S[k], why = ["Back " + back + " cm fits up to " + s[1] + " cm."];
      why.push("Chest " + chest + " cm" + (chest < s[2] ? " is under " + s[2] + " cm, so it will be a little roomy." : " sits within " + s[2] + " to " + s[3] + " cm."));
      if (neck > 0) why.push(neck > s[4] ? "Neck " + neck + " cm is over " + s[4] + " cm, so the collar will sit open." : "Neck " + neck + " cm fits.");
      if (((back > s[1] - 1.5) || (chest > s[3] - 1.5)) && k < S.length - 1) why.push("You are near the top of this size, so choose " + S[k + 1][0] + " for room over a jumper.");
      pick = s[0];
      $("b", res).textContent = "Size " + s[0]; $("p", res).textContent = why.join(" "); res.hidden = false;
      $$(".zsz tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });
    });
    var use = $("[data-use]", wrap);
    if (use) use.addEventListener("click", function () {
      if (fd && fd.open) fd.close();
      var b = $('.szs button[data-s="' + pick + '"]');
      if (b) { b.scrollIntoView({ behavior: "smooth", block: "center" }); if (b.hasAttribute("data-oos")) { var st = $(".stock"); if (st) st.textContent = "Size " + pick + " is out of stock. We restock most sizes within two weeks."; } else b.click(); }
    });
  });

  /* save */
  $$(".zsave").forEach(function (b) { b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.textContent = on ? "Saved" : "Save"; }); });

  /* related rail */
  $$(".zrl").forEach(function (s) {
    var r = $(".rail", s); if (!r) return;
    $$(".arr button", s).forEach(function (b) { b.addEventListener("click", function () { var c = $(".pcd", r); r.scrollBy({ left: (+b.dataset.d) * (c ? c.offsetWidth + 24 : 300) }); }); });
  });
})();
