/* Axel & Hound · collection filters/sort and product page behaviour */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- collection: filter + sort ---------- */
  var grid = $(".cx-grid");
  if (grid) {
    var cards = $$(".pcd[data-price]", grid), count = $$(".cx-count"), chips = $(".cx-chips");
    var LBL = { size: "Size", colour: "Colour", fit: "Fit", price: "Price", sale: "" };
    function chosen() {
      var f = {};
      $$("[data-f]:checked").forEach(function (i) { (f[i.dataset.f] = f[i.dataset.f] || []).push(i.value); });
      return f;
    }
    function inPrice(p, bands) {
      return bands.some(function (b) { var r = b.split("-"); return p >= +r[0] && p <= +r[1]; });
    }
    function apply() {
      var f = chosen(), n = 0;
      cards.forEach(function (c) {
        var ok = Object.keys(f).every(function (k) {
          var v = f[k];
          if (k === "price") return inPrice(+c.dataset.price, v);
          if (k === "sale") return c.dataset.sale === "1";
          var have = (c.dataset[k] || "").split(" ");
          return v.some(function (x) { return have.indexOf(x) > -1; });
        });
        c.hidden = !ok; if (ok) n++;
      });
      count.forEach(function (el) { el.textContent = n + (n === 1 ? " product" : " products"); });
      var empty = $(".cx-empty", grid);
      if (!n && !empty) { empty = document.createElement("p"); empty.className = "cx-empty"; empty.textContent = "Nothing matches those filters. Try removing one."; grid.appendChild(empty); }
      if (n && empty) empty.remove();
      if (chips) {
        var html = "";
        $$("[data-f]:checked").forEach(function (i) {
          var seen = html.indexOf('data-k="' + i.dataset.f + i.value + '"') > -1; if (seen) return;
          html += '<span class="cx-chip">' + (i.dataset.label || i.value) + '<button type="button" data-k="' + i.dataset.f + i.value + '" data-ff="' + i.dataset.f + '" data-fv="' + i.value + '" aria-label="Remove ' + (i.dataset.label || i.value) + '">&times;</button></span>';
        });
        chips.innerHTML = html + (html ? '<button type="button" class="cx-clear" data-clear>Clear all</button>' : "");
      }
    }
    function sync(src) { /* keep matching inputs in sidebar and drawer in step */
      $$('[data-f="' + src.dataset.f + '"][value="' + src.value + '"]').forEach(function (i) { i.checked = src.checked; });
    }
    document.addEventListener("change", function (e) { if (e.target.matches("[data-f]")) { sync(e.target); apply(); } });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ff]");
      if (b) { $$('[data-f="' + b.dataset.ff + '"][value="' + b.dataset.fv + '"]').forEach(function (i) { i.checked = false; }); apply(); }
      if (e.target.closest("[data-clear]")) { $$("[data-f]").forEach(function (i) { i.checked = false; }); apply(); }
    });
    $$(".cx-sort").forEach(function (s) {
      s.addEventListener("change", function () {
        var v = s.value, list = cards.slice();
        if (v === "low") list.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
        else if (v === "high") list.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
        else list.sort(function (a, b) { return a.dataset.i - b.dataset.i; });
        var story = $(".story", grid);
        list.forEach(function (c) { grid.appendChild(c); });
        if (story) grid.insertBefore(story, grid.children[2] || null);
        $$(".cx-sort").forEach(function (o) { o.value = v; });
      });
    });
    /* drawer */
    var fd = $(".fd"), sc = $(".fscrim");
    function fdSet(on) { if (!fd) return; fd.classList.toggle("on", on); sc.classList.toggle("on", on); document.body.style.overflow = on ? "hidden" : ""; if (on) fd.focus(); }
    $$("[data-filters]").forEach(function (b) { b.addEventListener("click", function () { fdSet(true); }); });
    $$("[data-fd-close]").forEach(function (b) { b.addEventListener("click", function () { fdSet(false); }); });
    if (sc) sc.addEventListener("click", function () { fdSet(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && fd && fd.classList.contains("on")) fdSet(false); });
    /* load more */
    var more = $("[data-more]");
    if (more) more.addEventListener("click", function () {
      var p = more.closest(".cx-more"); p.querySelector("p").textContent = "You have seen all " + cards.length + " products";
      p.querySelector(".prog i").style.width = "100%"; more.remove();
    });
    apply();
  }

  /* ---------- product page ---------- */
  var px = $(".px");
  if (px) {
    var state = { colour: null, size: null, qty: 1 };
    var colName = $("[data-colname]"), sizeName = $("[data-sizename]"), msg = $(".msg"), stock = $(".stock");
    $$(".sws button").forEach(function (b, i) {
      if (b.getAttribute("aria-pressed") === "true") state.colour = b.dataset.c;
      b.addEventListener("click", function () {
        $$(".sws button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        state.colour = b.dataset.c; if (colName) colName.textContent = b.dataset.c;
      });
    });
    $$(".szs button").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.hasAttribute("data-oos")) { stock.textContent = "Size " + b.dataset.s + " is out of stock. We restock most sizes within two weeks."; return; }
        $$(".szs button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        state.size = b.dataset.s; if (sizeName) sizeName.textContent = b.dataset.s;
        stock.textContent = b.dataset.low ? "Only " + b.dataset.low + " left in this size" : "In stock, ready to dispatch";
        msg.textContent = "";
      });
    });
    var qv = $(".q span");
    $$(".q button").forEach(function (b) {
      b.addEventListener("click", function () { state.qty = Math.max(1, Math.min(9, state.qty + (+b.dataset.d))); qv.textContent = state.qty; });
    });
    $$(".save").forEach(function (b) {
      b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Remove from saved" : "Save for later"); });
    });
    $$(".atc").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!state.size) { msg.textContent = "Choose a size to add this to your basket."; var s = $(".szs button"); if (s) s.focus(); return; }
        if (window.AHBasket) window.AHBasket.add({ p: px.dataset.img, n: px.dataset.name, v: state.colour + " · Size " + state.size, pr: +px.dataset.price, q: state.qty });
      });
    });
    /* P1 thumbnails */
    $$(".thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".thumbs button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var m = $(".mainimg img"); m.src = b.dataset.src; m.className = b.dataset.flip ? "flip" : "";
      });
    });
    /* P4 slides */
    var slides = $$(".stage img"), dots = $$(".p4 .dots button"), si = 0;
    function show(n) { si = (n + slides.length) % slides.length; slides.forEach(function (s, k) { s.hidden = k !== si; }); dots.forEach(function (d, k) { d.setAttribute("aria-pressed", k === si ? "true" : "false"); }); }
    if (slides.length) {
      dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); }); });
      $$(".p4 .nav").forEach(function (n) { n.addEventListener("click", function () { show(si + (+n.dataset.d)); }); });
      show(0);
    }
    /* P4 tabs */
    var tbs = $$(".p4 [role=tab]"), tps = $$(".p4 [role=tabpanel]");
    tbs.forEach(function (t, i) { t.addEventListener("click", function () { tbs.forEach(function (x, k) { x.setAttribute("aria-selected", k === i ? "true" : "false"); }); tps.forEach(function (p, k) { p.hidden = k !== i; }); }); });
    /* size guide dialog */
    var dlg = $(".sgd");
    $$("[data-sg]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); if (dlg && dlg.showModal) dlg.showModal(); }); });
    $$("[data-sg-close]").forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
  }
})();
