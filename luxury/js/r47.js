/* Reviews: filter by collection, load more, score count-up, rise-in */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(document.querySelectorAll(".rz-it"));
  var shown = 12, cat = "All";
  var nEl = document.querySelector(".rz-n"), more = document.querySelector("[data-more]");
  function apply() {
    var match = items.filter(function (it) { return cat === "All" || it.dataset.cat === cat; });
    items.forEach(function (it) { it.hidden = true; });
    match.forEach(function (it, i) { it.hidden = i >= shown; });
    if (nEl) nEl.textContent = Math.min(shown, match.length);
    if (more) more.hidden = shown >= match.length && cat !== "All";
    document.querySelectorAll("[data-cat]").forEach(function (b) {
      if (b.tagName !== "BUTTON") return;
      var on = b.dataset.cat === cat;
      if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", on ? "true" : "false");
      b.classList.toggle("on", on);
    });
  }
  document.querySelectorAll("button[data-cat]").forEach(function (b) {
    b.addEventListener("click", function () { cat = (cat === b.dataset.cat && !b.getAttribute("role")) ? "All" : b.dataset.cat; shown = 12; apply(); });
  });
  if (more) more.addEventListener("click", function () { shown += 8; apply(); });
  apply();

  // the score counts up when it comes into view
  document.querySelectorAll(".rz-count").forEach(function (el) {
    var to = parseFloat(el.dataset.to);
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = to.toFixed(1); return; }
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now(), d = 1600;
      (function step(t) { var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(1); if (p < 1) requestAnimationFrame(step); })(t0);
    });
    io.observe(el);
  });

  // reviews rise in as they come into view
  if (!reduce && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io2.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (it) { it.classList.add("rz-rise"); io2.observe(it); });
  }
})();
