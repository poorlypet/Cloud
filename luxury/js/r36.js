/* Axel & Hound · product pages round 5: find-my-fit drawer, size picker, details list */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  /* size, max back, chest min, chest max, neck */
  var S = [["XS", 30, 40, 46, 26], ["S", 35, 46, 52, 30], ["M", 40, 52, 58, 34], ["L", 45, 58, 64, 38], ["XL", 50, 64, 70, 42]];

  /* ---------- find my fit drawer ---------- */
  var d = $(".yf");
  if (d) {
    var steps = $$(".yf-st", d), res = $(".yf-res", d), next = $(".yf-next", d), back = $(".yf-back", d), bar = $(".yf-pr i", d);
    var unit = "cm", at = 0, pick = null;
    function cm(v) { return unit === "in" ? Math.round(v * 2.54 * 10) / 10 : v; }
    function val(k) { return parseFloat($("input", steps[k]).value); }
    function go(n) {
      at = n;
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      res.hidden = n !== 3;
      bar.style.width = ((n + 1) / 4 * 100) + "%";
      back.disabled = n === 0;
      next.textContent = n < 2 ? "Next" : n === 2 ? "Find my size" : "Choose size " + pick;
      if (n < 3) { var f = $("input", steps[n]); setTimeout(function () { f.focus(); }, 50); }
      $(".yf-b", d).scrollTop = 0;
    }
    function rowHTML(label, v, lo, hi, txt) {
      var p = Math.max(4, Math.min(96, (v - lo) / (hi - lo) * 100));
      return '<div><div class="r"><b>' + label + " " + v + ' cm</b><span>' + txt + '</span></div><div class="b"><i style="left:' + p + '%"></i></div><div class="e"><span>' + lo + ' cm</span><span>' + hi + " cm</span></div></div>";
    }
    function result() {
      var b = cm(val(0)), c = cm(val(1)), n = cm(val(2));
      if (b > 55 || c > 75) { $(".yf-err", steps[1]).textContent = "That is bigger than this coat’s largest size. Have a look at our Large and Giant collections."; return false; }
      var a = S.findIndex(function (s) { return b <= s[1]; }), ci = S.findIndex(function (s) { return c <= s[3]; });
      if (a < 0) a = S.length - 1; if (ci < 0) ci = S.length - 1;
      var k = Math.max(a, ci), s = S[k], prev = k ? S[k - 1] : [0, s[1] - 5, 0, 0, s[4] - 4];
      pick = s[0];
      $(".yf-big", d).textContent = s[0];
      var near = ((b > s[1] - 1.5) || (c > s[3] - 1.5)) && k < S.length - 1;
      $(".yf-sum", d).textContent = near ? "Your dog is near the top of size " + s[0] + ". It will fit closely; choose " + S[k + 1][0] + " if you want room for a jumper underneath." : "A comfortable fit, with room to move. This coat is cut for the dachshund shape, so length matters most.";
      $$(".yf-strip span", d).forEach(function (x) { x.classList.toggle("on", x.dataset.s === pick); });
      var h = rowHTML("Back", b, prev[1], s[1], "fits up to " + s[1] + " cm");
      h += rowHTML("Chest", c, s[2], s[3], c < s[2] ? "a little roomy" : "within the range");
      if (n > 0) h += rowHTML("Neck", n, prev[4], s[4], n > s[4] ? "collar will sit open" : "fits");
      $(".yf-bars", d).innerHTML = h;
      $(".yf-note", d).textContent = "Free 14-day returns, so you can swap sizes at no cost.";
      $$(".zsz tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });
      return true;
    }
    next.addEventListener("click", function () {
      if (at < 3) {
        var v = val(at), e = $(".yf-err", steps[at]);
        if (at < 2 && !(v > 0)) { e.textContent = "Enter a measurement to continue."; return; }
        e.textContent = "";
        if (at === 2) { if (result()) go(3); else go(1); return; }
        go(at + 1); return;
      }
      d.close();
      var btn = $('.szs button[data-s="' + pick + '"]');
      if (btn) {
        btn.scrollIntoView({ behavior: "smooth", block: "center" });
        if (btn.hasAttribute("data-oos")) { var st = $(".stock"); if (st) st.textContent = "Size " + pick + " is out of stock. We restock most sizes within two weeks."; } else btn.click();
      }
    });
    back.addEventListener("click", function () { if (at > 0) go(at - 1); });
    $$("input", d).forEach(function (f) { f.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); next.click(); } }); });
    $$(".yfu button", d).forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.yu === unit) return;
        var to = b.dataset.yu;
        $$("input", d).forEach(function (f) { var v = parseFloat(f.value); if (v > 0) f.value = to === "in" ? (v / 2.54).toFixed(1) : Math.round(v * 2.54); f.placeholder = to === "in" ? f.placeholder.replace(/\d+/, function (m) { return Math.round(m / 2.54); }) : f.placeholder.replace(/\d+/, function (m) { return Math.round(m * 2.54); }); });
        unit = to;
        $$(".yfu button", d).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $$(".yf-in em", d).forEach(function (x) { x.textContent = unit === "in" ? "in" : "cm"; });
        if (at === 3) result();
      });
    });
    $$("[data-fit2]").forEach(function (b) { b.addEventListener("click", function () { go(at === 3 ? 3 : 0); d.showModal(); }); });
    $$("[data-yf-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  }

  /* ---------- size picker (size 4) ---------- */
  var y4 = $(".ys4");
  if (y4) {
    var data = JSON.parse($(".ys4-d", y4).textContent), u = 0, cur = 2;
    function paint() {
      var r = data[cur];
      $$(".ys4-n", y4).forEach(function (b) { b.textContent = r[1 + (+b.dataset.k)][u]; });
      $(".ys4-w b", y4).textContent = r[4];
      $$(".ys4-p button", y4).forEach(function (b) { b.setAttribute("aria-selected", +b.dataset.y === cur ? "true" : "false"); });
    }
    $$(".ys4-p button", y4).forEach(function (b) { b.addEventListener("click", function () { cur = +b.dataset.y; paint(); }); });
    $$(".zunits button", y4).forEach(function (b) { b.addEventListener("click", function () { u = b.dataset.u === "in" ? 1 : 0; paint(); }); });
    paint();
  }

  /* ---------- details list (details 5) ---------- */
  $$(".yd5").forEach(function (w) {
    var bs = $$(".yd5-l button", w), ims = $$(".yd5-m img", w);
    bs.forEach(function (b, k) {
      b.addEventListener("click", function () {
        bs.forEach(function (x, j) { x.setAttribute("aria-selected", j === k ? "true" : "false"); });
        ims.forEach(function (im, j) { im.hidden = j !== k; });
      });
    });
  });
})();
