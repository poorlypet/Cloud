/* Axel & Hound · product pages round 3: gallery, lightbox, find my fit, sticky bar */
(function () {
  "use strict";
  var pq = document.querySelector(".pq");
  if (!pq) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var IM = JSON.parse(pq.dataset.images), i = 0;
  var mainImg = $(".pq .pmain img"), ctr = $(".pq .pmain .ctr");

  function show(n) {
    i = (n + IM.length) % IM.length;
    mainImg.classList.add("fade");
    setTimeout(function () { mainImg.src = IM[i]; mainImg.classList.remove("fade"); }, 120);
    if (ctr) ctr.textContent = (i + 1) + " / " + IM.length;
    $$(".pq .th button, .pq .dotrow button").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.i === i ? "true" : "false"); });
  }
  $$(".pq .th button, .pq .dotrow button").forEach(function (b) { b.addEventListener("click", function () { show(+b.dataset.i); }); });
  $$(".pq .pmain .ar").forEach(function (a) { a.addEventListener("click", function (e) { e.stopPropagation(); show(i + (+a.dataset.d)); }); });

  /* lightbox */
  var lb = $(".lb"), li = $(".lb .lbst img"), lc = $(".lb .lc");
  function lshow(n) {
    i = (n + IM.length) % IM.length; li.src = IM[i]; li.classList.remove("z"); lc.textContent = (i + 1) + " / " + IM.length;
    $$(".lb .lth button").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.i === i ? "true" : "false"); });
  }
  function openLb() { lshow(i); lb.showModal(); }
  var mainBox = $(".pq .pmain");
  mainBox.addEventListener("click", openLb);
  mainBox.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); } });
  $$(".lb .lth button").forEach(function (b) { b.addEventListener("click", function () { lshow(+b.dataset.i); }); });
  $$(".lb .ar").forEach(function (a) { a.addEventListener("click", function () { lshow(i + (+a.dataset.d)); }); });
  li.addEventListener("click", function () { li.classList.toggle("z"); });
  $(".lb [data-lb-close]").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("close", function () { show(i); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") lshow(i + 1); if (e.key === "ArrowLeft") lshow(i - 1); });

  /* find my fit: size, max back length, chest min, chest max, neck */
  var SIZES = [["XS", 30, 40, 46, 26], ["S", 35, 46, 52, 30], ["M", 40, 52, 58, 34], ["L", 45, 58, 64, 38], ["XL", 50, 64, 70, 42]];
  var fit = $(".fit"), form = $(".fit form"), res = $(".fit .res"), err = $(".fit .err"), pick = null;
  $$("[data-fit]").forEach(function (b) { b.addEventListener("click", function () { fit.showModal(); var f = $("#fbk"); if (f) f.focus(); }); });
  $$("[data-fit-close]").forEach(function (b) { b.addEventListener("click", function () { fit.close(); }); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var back = parseFloat($("#fbk").value), chest = parseFloat($("#fch").value), neck = parseFloat($("#fnk").value);
    if (!(back > 0) || !(chest > 0)) { err.textContent = "Enter at least the back length and chest in centimetres."; res.hidden = true; return; }
    if (back > 55 || chest > 75) { err.textContent = "Those measurements are bigger than this coat's largest size. Have a look at our Large and Giant collections."; res.hidden = true; return; }
    err.textContent = "";
    var byBack = SIZES.findIndex(function (s) { return back <= s[1]; });
    var byChest = SIZES.findIndex(function (s) { return chest <= s[3]; });
    if (byBack < 0) byBack = SIZES.length - 1;
    if (byChest < 0) byChest = SIZES.length - 1;
    var k = Math.max(byBack, byChest), s = SIZES[k], why = [];
    why.push("Back length " + back + " cm fits up to " + s[1] + " cm.");
    why.push("Chest " + chest + " cm" + (chest < s[2] ? " is under " + s[2] + " cm, so it will be a little roomy." : " sits within " + s[2] + " to " + s[3] + " cm."));
    if (neck > 0) why.push(neck > s[4] ? "Neck " + neck + " cm is over " + s[4] + " cm, so the collar will sit open." : "Neck " + neck + " cm fits.");
    var near = (back > s[1] - 1.5) || (chest > s[3] - 1.5);
    pick = s[0];
    $(".fit .res .sz").textContent = "Size " + s[0];
    $(".fit .res .why").textContent = why.join(" ") + (near && k < SIZES.length - 1 ? " You are near the top of this size, so choose " + SIZES[k + 1][0] + " if you want room for a jumper underneath." : "");
    res.hidden = false;
  });
  $(".fit [data-use]").addEventListener("click", function () {
    var b = $('.szs button[data-s="' + pick + '"]');
    fit.close();
    if (b) {
      if (b.hasAttribute("data-oos")) $(".stock").textContent = "Size " + pick + " is out of stock. We restock most sizes within two weeks.";
      else b.click();
    }
    var r = $(".szsec .rec");
    if (r) { r.hidden = false; r.textContent = "Recommended for your dog: size " + pick + "."; }
  });

  /* sticky add-to-basket bar */
  var bar = $(".sbar"), atc = $(".pq .info .atc");
  if (bar && atc && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { bar.classList.toggle("on", !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe(atc);
    $(".btn-k", bar).addEventListener("click", function () { atc.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { atc.click(); }, 450); });
  }
})();
