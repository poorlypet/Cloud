/* Axel & Hound · round 9: basket maths, tabs, help search, contact forms */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function money(n) { return "£" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); }
  var FREE = 100;

  /* ---------- basket ---------- */
  var bk = $(".v9-bk");
  if (bk) {
    var wrap = $(".v9-lines", bk), empty = $(".v9-empty", bk), disc = 0;
    function lines() { return $$(".v9-line", wrap); }
    function ship() { var r = $(".v9-deliv input:checked", bk); return r ? parseFloat(r.dataset.shipPrice) : 0; }
    function paint() {
      var sub = 0, count = 0;
      lines().forEach(function (l) { var q = +$(".v9-q span", l).textContent, p = +l.dataset.price; sub += p * q; count += q; $("[data-lp]", l).textContent = money(p * q); });
      var s = ship(), std = sub >= FREE ? 0 : 4.95, delivery = s ? s : std, total = Math.max(0, sub - disc) + (count ? delivery : 0);
      $$("[data-sub]", bk).forEach(function (e) { e.textContent = money(sub); });
      $$("[data-ship]", bk).forEach(function (e) { e.textContent = !count ? "–" : delivery ? money(delivery) : "Free"; });
      $$("[data-total]", bk).forEach(function (e) { e.textContent = money(total); });
      $$("[data-third]", bk).forEach(function (e) { e.textContent = money(total / 3); });
      $$("[data-count]", bk).forEach(function (e) { e.textContent = /\(/.test(e.textContent) ? "(" + count + ")" : count + (count === 1 ? " item" : " items"); });
      $$("[data-free]", document).forEach(function (f) {
        var left = Math.max(0, FREE - sub);
        $("[data-freemsg]", f).innerHTML = left ? "Spend <b>" + money(left) + "</b> more for free delivery" : "<b>Free delivery</b> on this order";
        $(".bar i", f).style.width = Math.min(100, sub / FREE * 100) + "%";
      });
      var none = !count;
      if (empty) empty.hidden = !none;
      [wrap, $(".v9-sum", bk), $(".v9-th", bk), $(".b2-sum", bk), $(".b5-add", bk), $(".b3-note", bk)].forEach(function (e) { if (e && e !== wrap) e.hidden = none; });
      $$("[data-free]", document).forEach(function (f) { f.hidden = none; });
    }
    bk.addEventListener("click", function (e) {
      var q = e.target.closest("[data-qd]");
      if (q) { var sp = q.parentNode.querySelector("span"); sp.textContent = Math.max(1, Math.min(9, +sp.textContent + (+q.dataset.qd))); paint(); }
      var rm = e.target.closest("[data-rm]");
      if (rm) { rm.closest(".v9-line").remove(); paint(); }
      var add = e.target.closest("[data-add-on]");
      if (add) {
        var tpl = lines()[0] || null, n = add.dataset.n, p = add.dataset.p, img = add.dataset.img;
        var div = document.createElement("div"); div.className = "v9-line"; div.dataset.price = p;
        div.innerHTML = '<a class="im" href="#"><img src="' + img + '" alt=""></a><div class="tx"><span class="br">Axel &amp; Hound</span><a class="n" href="#">' + n + '</a><span class="v">One size</span><div class="ctl"><div class="v9-q"><button type="button" data-qd="-1" aria-label="One fewer">−</button><span>1</span><button type="button" data-qd="1" aria-label="One more">+</button></div><button type="button" class="rm" data-rm>Remove</button></div></div><span class="lp" data-lp></span>';
        wrap.appendChild(div); add.textContent = "Added"; add.disabled = true; paint();
      }
      var tog = e.target.closest("[data-empty-toggle]");
      if (tog) {
        var on = tog.dataset.on === "1"; tog.dataset.on = on ? "0" : "1";
        tog.textContent = on ? "View the empty basket" : "View with items";
        if (!on) { bk._saved = wrap.innerHTML; wrap.innerHTML = ""; } else if (bk._saved) wrap.innerHTML = bk._saved;
        paint();
      }
    });
    $$(".v9-deliv input", bk).forEach(function (r) { r.addEventListener("change", paint); });
    $$("[data-promo]", bk).forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = $("input", f).value.trim().toUpperCase(), msg = f.parentNode.querySelector(".v9-pmsg");
        if (v === "WELCOME10") { disc = 10; msg.textContent = "WELCOME10 applied: £10 off."; }
        else { disc = 0; msg.textContent = v ? "That code isn’t valid. Try WELCOME10." : "Enter a code."; }
        paint();
      });
    });
    paint();
  }

  /* ---------- tabs (search results, help centre) ---------- */
  $$(".v9-tabs").forEach(function (t) {
    var bs = $$("[data-st]", t), root = t.parentNode;
    bs.forEach(function (b) {
      b.addEventListener("click", function () {
        bs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        $$("[data-sp]", root).forEach(function (p) { p.hidden = p.dataset.sp !== b.dataset.st; });
      });
    });
  });
  $$(".v9-chips button").forEach(function (b) {
    b.addEventListener("click", function () { $$("button", b.parentNode).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
  });
  $$("[data-sform]").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); location.href = "search-1.html"; }); });

  /* ---------- help centre: search filters the answers as you type ---------- */
  $$("[data-hsearch]").forEach(function (f) {
    var input = $("input", f), none = f.parentNode.querySelector(".v9-hnone");
    function run() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      $$(".v9-acc details").forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.hidden = !hit; if (hit) shown++;
        if (q && hit) d.open = true;
      });
      if (q) {
        $$("[data-sp]").forEach(function (p) { p.hidden = false; });
        $$(".v9-tabs").forEach(function (t) { t.hidden = true; });
      } else {
        $$(".v9-tabs").forEach(function (t) { t.hidden = false; var on = $('[aria-selected="true"]', t); if (on) on.click(); });
      }
      $$(".h2-s, .h-pop").forEach(function (s) { s.hidden = q && !$$("details", s).some(function (d) { return !d.hidden; }); });
      if (none) none.hidden = !(q && !shown);
    }
    input.addEventListener("input", run);
    f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  });
  $$(".h2-nav a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function () { $$(".h2-nav a").forEach(function (x) { x.removeAttribute("aria-current"); }); a.setAttribute("aria-current", "true"); });
  });
  $$("[data-helpful]").forEach(function (b) {
    b.addEventListener("click", function () { var p = b.parentNode.querySelector("p"); p.textContent = b.textContent === "Yes" ? "Thank you. Glad it helped." : "Thank you. We’ll use this to improve the page. You can also contact us."; });
  });

  /* ---------- contact: choose a topic first ---------- */
  var c5 = $$("[data-c5]");
  c5.forEach(function (b) {
    b.addEventListener("click", function () {
      c5.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("[data-c5a]").forEach(function (a) { a.hidden = a.dataset.c5a !== b.dataset.c5; });
      var f = $(".c5-f"); if (f) f.hidden = false;
      var a = $('[data-c5a="' + b.dataset.c5 + '"]'); if (a) a.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- contact forms ---------- */
  $$("[data-cform]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $(".v9-ferr", f), bad = [];
      $$("[required]", f).forEach(function (i) {
        var ok = i.value.trim() !== "" && (i.type !== "email" || /.+@.+\..+/.test(i.value));
        i.classList.toggle("bad", !ok); if (!ok) bad.push(i);
      });
      if (bad.length) { err.textContent = "Please fill in the highlighted fields."; bad[0].focus(); return; }
      err.textContent = "";
      var sent = f.nextElementSibling;
      $("[data-sent-email]", sent).textContent = $('[name="email"]', f).value;
      f.hidden = true; sent.hidden = false;
    });
  });
})();
