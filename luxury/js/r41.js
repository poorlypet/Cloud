/* Axel & Hound · round 14: track an order, account forms, brand finder, email pop-ups, phone menus */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* track an order: needs an order number and an email, then shows the order */
  $$("[data-track]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var o = f.order.value.trim(), m = f.email.value.trim(), err = $(".v9-ferr", f);
      f.order.classList.toggle("bad", !o); f.email.classList.toggle("bad", !/.+@.+\..+/.test(m));
      if (!o || !/.+@.+\..+/.test(m)) { err.textContent = "Enter your order number and the email you ordered with."; return; }
      err.textContent = "";
      var res = $(".tk-res"); if (res) { res.hidden = false; res.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });
  var tkt = $$("[data-tk]");
  tkt.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      tkt.forEach(function (x) { if (x === a) x.setAttribute("aria-current", "page"); else x.removeAttribute("aria-current"); });
      $$("[data-tkp]").forEach(function (p) { p.hidden = p.dataset.tkp !== a.dataset.tk; });
      var r = $(".tk-res"); if (r && a.dataset.tk === "1") r.hidden = true;
    });
  });

  /* account forms: check the fields, then confirm */
  $$("[data-acform]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [];
      $$("[required]", f).forEach(function (i) {
        var ok = i.value.trim() !== "" && (i.type !== "email" || /.+@.+\..+/.test(i.value)) && (i.autocomplete !== "new-password" || i.value.length >= 8);
        i.classList.toggle("bad", !ok); if (!ok) bad.push(i);
      });
      var err = $(".v9-ferr", f);
      if (bad.length) { err.textContent = "Please check the highlighted fields."; bad[0].focus(); return; }
      err.textContent = "";
      var sent = f.nextElementSibling, b = $("button[type=submit]", f).textContent;
      sent.innerHTML = b === "Send reset link" ? "<h2 class=\"zh2\">Check your email</h2><p>If there&rsquo;s an account for that address, we&rsquo;ve sent a link to reset your password.</p>"
        : b === "Save address" ? "<h2 class=\"zh2\">Address saved</h2><p>We&rsquo;ll use it at checkout.</p>"
        : b === "Reset password" ? "<h2 class=\"zh2\">Password updated</h2><p>You can now sign in with your new password.</p>"
        : "<h2 class=\"zh2\">Welcome</h2><p>Taking you to your account&hellip;</p>";
      f.hidden = true; sent.hidden = false;
      if (b === "Sign in" || b === "Create account") setTimeout(function () { location.href = location.pathname.replace(/(acc?\d)-[a-z]+\.html$/, "$1-overview.html"); }, 900);
    });
  });

  /* all brands: type to filter */
  $$("[data-azf] input").forEach(function (i) {
    i.form.addEventListener("submit", function (e) { e.preventDefault(); });
    i.addEventListener("input", function () {
      var q = i.value.trim().toLowerCase();
      $$(".az5-l li").forEach(function (li) { li.hidden = q && li.textContent.toLowerCase().indexOf(q) < 0; });
    });
  });

  /* email pop-up: appears after a moment, gives the code on sign-up */
  var pp = $(".pp");
  if (pp) {
    setTimeout(function () { pp.hidden = false; var i = $("input", pp); if (i && window.innerWidth > 640) i.focus({ preventScroll: true }); }, 1200);
    $$("[data-pp-x]", pp).forEach(function (b) { b.addEventListener("click", function () { pp.hidden = true; }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") pp.hidden = true; });
    var f = $("[data-pp]", pp);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("input", f).value, err = $(".pp-err", pp);
      if (!/.+@.+\..+/.test(v)) { err.textContent = "Please enter a valid email address."; return; }
      err.textContent = ""; f.hidden = true; $(".pp-ok", pp).hidden = false;
      var sm = $(".pp-small", pp); if (sm) sm.hidden = true;
    });
  }

  /* phone menus: replace the standard drawer on these demo pages */
  var mm = $(".mm");
  if (mm) {
    function mset(o) { mm.hidden = !o; document.body.style.overflow = o ? "hidden" : ""; }
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-burger]")) { e.stopImmediatePropagation(); e.preventDefault(); mset(true); }
    }, true);
    $$("[data-mm-x]", mm).forEach(function (b) { b.addEventListener("click", function () { mset(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") mset(false); });
    $$("[data-mm-open]", mm).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        $(".mm-tiles", mm).hidden = true;
        $$("[data-mm-p]", mm).forEach(function (p) { p.hidden = p.dataset.mmP !== a.dataset.mmOpen; });
        mm.scrollTop = 0;
      });
    });
    $$("[data-mm-back]", mm).forEach(function (b) { b.addEventListener("click", function () { $$("[data-mm-p]", mm).forEach(function (p) { p.hidden = true; }); $(".mm-tiles", mm).hidden = false; }); });
    var tabs = $$("[data-mm-t]", mm);
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        $$("[data-mm-tp]", mm).forEach(function (p) { p.hidden = p.dataset.mmTp !== t.dataset.mmT; });
      });
    });
    setTimeout(function () { mset(true); }, 600);
  }
})();
