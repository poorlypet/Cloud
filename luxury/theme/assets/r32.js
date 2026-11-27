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
    /* ---- filters only offer what this collection actually contains ---- */
    var FAM = [
      ["Black", /\b(black|coal|charcoal|anthracite|noir|onyx|night)\b/],
      ["Grey", /\b(gr[ae]y|stone|slate|ash|graphite|pebble|cement)\b/],
      ["Brown", /\b(brown|choco|chocolate|cognac|tan|camel|hazel|hazelnut|coffee|mocha|moka|tobacco|caramel|chestnut|walnut|cinnamon|rust|toffee|teddy|ginger|mud)\b/],
      ["Cream & beige", /\b(cream|beige|sand|sandy|oat|ivory|ecru|natural|taupe|nude|vanilla|white|bone|linen|cappuccino|snow|powder)\b/],
      ["Green", /\b(green|olive|moss|sage|forest|forrest|khaki|mint|thyme|fern|avocado|cabbage|pistachio|emerald|grass|lime)\b/],
      ["Blue", /\b(blue|navy|denim|indigo|aqua|teal|petrol|ocean|sky|turquoise|santorini)\b/],
      ["Pink & red", /\b(pink|rose|red|berry|coral|blush|burgundy|bordeaux|cherry|raspberry|fuchsia|magenta|salmon|peach|wine)\b/],
      ["Purple", /\b(plum|aubergine|lilac|purple|lavender|mauve|violet)\b/],
      ["Yellow & orange", /\b(yellow|mustard|orange|sunset|banana|lemon|honey|ochre|amber|apricot|terracotta|neon)\b/],
      ["Patterned", /\b(tartan|check|checked|tweed|houndstooth|leo|stripe|striped|pattern|print|plaid|floral|zigzag|dots|camo|herringbone|seersucker)\b/]
    ];
    function slug(t) { return String(t).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
    function tag(c) {
      if (c.dataset.tagged) return; c.dataset.tagged = "1";
      var t = (c.dataset.t || "").toLowerCase(), col = t + " " + (c.dataset.colour || "").toLowerCase().replace(/-/g, " ");
      c.dataset.colour = FAM.filter(function (f) { return f[1].test(col); }).map(function (f) { return slug(f[0]); }).join(" ");
      c.dataset.brand = slug(c.dataset.v || "");
    }
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function group(key) { var i = $('.fd [data-f="' + key + '"]'); return i ? i.closest(".fg") : null; }
    function rebuild(g, key, items) {      /* items: [value, label]; keeps anything already ticked */
      var sig = items.map(function (x) { return x[0]; }).join("|"); if (g.dataset.sig === sig) return; g.dataset.sig = sig;
      var on = $$('[data-f="' + key + '"]:checked', g).map(function (i) { return i.value; });
      var box = g.querySelector(".opts") || g.querySelector("summary").nextElementSibling;
      box.innerHTML = items.map(function (x) { return '<label class="fo"><input type="checkbox" data-f="' + key + '" value="' + x[0] + '" data-label="' + esc(x[1]) + '" id="df-' + key + "-" + x[0] + '">' + esc(x[1]) + "</label>"; }).join("");
      on.forEach(function (v) { var i = $('[data-f="' + key + '"][value="' + v + '"]', g); if (i) i.checked = true; });
    }
    function prune() {
      var all = $$(".pcd[data-price]", grid); all.forEach(tag);
      function tokens(k) { var o = {}; all.forEach(function (c) { (c.dataset[k] || "").split(" ").forEach(function (x) { if (x) o[x] = (o[x] || 0) + 1; }); }); return o; }
      var first = $(".fd .fg"); if (!first) return; var host = first.parentNode;
      /* brand: only when the collection has more than one */
      var brands = {}; all.forEach(function (c) { if (c.dataset.v) brands[c.dataset.brand] = c.dataset.v; });
      var bk = Object.keys(brands).sort(function (a, b) { return brands[a].localeCompare(brands[b]); }), bg = $(".fg[data-brand]", host);
      if (bk.length > 1) {
        if (!bg) { bg = document.createElement("details"); bg.className = "fg"; bg.setAttribute("data-brand", ""); bg.innerHTML = '<summary>Brand</summary><div class="opts"></div>'; host.insertBefore(bg, first); }
        bg.hidden = false; rebuild(bg, "brand", bk.map(function (k) { return [k, brands[k] === "BDEBRUNO" ? "BdeBruno" : brands[k] === "PAIKKA" ? "Paikka" : brands[k]]; }));
      } else if (bg) bg.hidden = true;
      /* size: only sizes these products come in */
      var sg = $(".fg[data-size]", host) || group("size"), sz = tokens("size");
      if (sg) {
        sg.setAttribute("data-size", "");
        var ORD = ["toy", "xxxs", "xxs", "xs", "xs/s", "s", "s/m", "m", "m/l", "l", "l/xl", "xl", "xxl", "xxxl"];
        var have = ORD.filter(function (k) { return sz[k]; }); if (!have.length) have = have.concat(Object.keys(sz).filter(function (k) { return /^\d+(\.\d+)?$/.test(k); }).sort(function (a, b) { return a - b; }));
        sg.hidden = have.length < 2;
        var ssig = have.join("|");
        if (have.length >= 2 && sg.dataset.sig !== ssig) {
          sg.dataset.sig = ssig;
          var son = $$('[data-f="size"]:checked', sg).map(function (i) { return i.value; });
          sg.querySelector(".opts").innerHTML = have.map(function (k) { var L = k === "toy" ? "Toy" : k.toUpperCase(); return '<label class="fs"><input type="checkbox" data-f="size" value="' + k + '" data-label="Size ' + L + '" id="dsz-' + slug(k) + '"><span>' + L + "</span></label>"; }).join("");
          son.forEach(function (v) { var i = $('[data-f="size"][value="' + v + '"]', sg); if (i) i.checked = true; });
        }
      }
      /* fit: only where there are breed-specific cuts */
      var fg = group("fit"), ft = tokens("fit");
      if (fg) { var special = Object.keys(ft).some(function (k) { return k !== "standard"; }); fg.hidden = !special; $$('[data-f="fit"]', fg).forEach(function (i) { var has = special && !!ft[i.value]; i.closest("label").hidden = !has; if (!has) i.checked = false; }); }
      /* colour: grouped into families, only those present */
      var cg = $(".fg[data-colour]", host) || group("colour"), ct = tokens("colour");
      if (cg) { cg.setAttribute("data-colour", ""); var fams = FAM.filter(function (f) { return ct[slug(f[0])]; }).map(function (f) { return [slug(f[0]), f[0]]; }); cg.hidden = fams.length < 2; if (fams.length >= 2) rebuild(cg, "colour", fams); }
      /* price: only bands with something in them */
      var pg = group("price");
      if (pg) { var pl = 0; $$('[data-f="price"]', pg).forEach(function (i) { var has = all.some(function (c) { return inPrice(+c.dataset.price, [i.value]); }); i.closest("label").hidden = !has; if (has) pl++; else i.checked = false; }); pg.hidden = pl < 2; }
    }
    LBL.brand = "Brand";
    function chosen() {
      var f = {};
      $$("[data-f]:checked").forEach(function (i) { (f[i.dataset.f] = f[i.dataset.f] || []).push(i.value); });
      return f;
    }
    function inPrice(p, bands) {
      return bands.some(function (b) { var r = b.split("-"); return p >= +r[0] && p <= +r[1]; });
    }
    function apply() {
      cards = $$(".pcd[data-price]", grid); cards.forEach(tag);
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
      var anyF = Object.keys(f).length > 0;
      Array.prototype.forEach.call(grid.querySelectorAll(".vt2, .story, .cq-ft"), function (v) { v.hidden = anyF; });
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
    prune();
    var pt = 0, seen = cards.length; new MutationObserver(function () { clearTimeout(pt); pt = setTimeout(function () { var n = $$(".pcd[data-price]", grid).length; if (n !== seen) { seen = n; prune(); apply(); } }, 150); }).observe(grid, { childList: true });
    document.addEventListener("change", function (e) { if (e.target.matches("[data-f]")) { sync(e.target); apply(); } });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ff]");
      if (b) { $$('[data-f="' + b.dataset.ff + '"][value="' + b.dataset.fv + '"]').forEach(function (i) { i.checked = false; }); apply(); }
      if (e.target.closest("[data-clear]")) { $$("[data-f]").forEach(function (i) { i.checked = false; }); apply(); }
    });
    $$(".cx-sort").forEach(function (s) {
      s.addEventListener("change", function () {
        var v = s.value, list = $$(".pcd[data-price]", grid);
        grid.dataset.sort = v;
        if (v === "feat") { list.sort(function (a, b) { return (a.dataset.oi || 0) - (b.dataset.oi || 0); }); list.forEach(function (c) { grid.appendChild(c); }); $$(".cx-sort").forEach(function (o) { o.value = v; }); return; }
        if (v === "low") list.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
        else list.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
        var story = $(".story", grid);
        list.forEach(function (c) { grid.appendChild(c); });
        if (story) grid.insertBefore(story, grid.children[2] || null);
        /* film tiles stay after the 4th and 14th pieces whatever the order */
        Array.prototype.forEach.call(grid.querySelectorAll(".cq-ft"), function (t, i) {
          var pcs = Array.prototype.filter.call(grid.children, function (c) { return c.matches(".pcd[data-price]"); });
          grid.insertBefore(t, pcs[Math.min([4, 14][i], pcs.length)] || null);
        });
        $$(".cx-sort").forEach(function (o) { o.value = v; });
      });
    });
    /* drawer */
    var fd = $(".fd"), sc = $(".fscrim");
    function fdSet(on) { if (!fd) return; fd.classList.toggle("on", on); sc.classList.toggle("on", on); document.body.style.overflow = on ? "hidden" : ""; if (on) fd.focus(); }
    /* filters cover the whole collection: once the drawer is opened, the remaining products load in behind */
    var allOn = false;
    function loadAll() { allOn = true; var m = $(".cx-more a.btn-o"); if (m && !m.disabled) m.click(); }
    if (grid) new MutationObserver(function () { if (allOn) setTimeout(loadAll, 250); }).observe(grid, { childList: true });
    $$("[data-filters]").forEach(function (b) { b.addEventListener("click", function () { fdSet(true); loadAll(); }); });
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
/* full product pages: sticky add-to-basket bar, thumbnails for G2/G4 */
(function () {
  "use strict";
  var bar = document.querySelector(".sbar"), atc = document.querySelector(".fp .info .atc");
  if (bar && atc && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { bar.classList.toggle("on", !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe(atc);
    bar.querySelector(".btn-k").addEventListener("click", function () { atc.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { atc.click(); }, 450); });
  }
})();
