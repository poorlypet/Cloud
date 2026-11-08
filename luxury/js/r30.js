/* Newsletter forms: validate, then thank (not yet connected to Klaviyo) */
(function () {
  "use strict";
  document.querySelectorAll(".fq form.f").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var i = f.querySelector("input"), v = i.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { i.value = ""; i.placeholder = "Enter a valid email address"; i.setAttribute("aria-invalid", "true"); i.focus(); return; }
      var p = document.createElement("p"); p.className = "ok"; p.setAttribute("role", "status");
      p.textContent = "Thank you. Your 10% code is on its way."; f.replaceWith(p);
    });
  });
})();
