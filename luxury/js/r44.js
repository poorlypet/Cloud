(function () {
  var FAR = /^(AB3[1-8]|AB4[45]|AB5[2-6]|FK1[7-9]|FK2[01]|HS|IV|KA2[78]|KW|PA2[0-9]|PA[3-7][0-9]|PH(1[5-9]|[2-4][0-9]|50)|ZE|BT|TR2[1-5]|GY|JE|IM)/;
  var OK = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/;
  document.querySelectorAll(".dv-form,.dy-form").forEach(function (f) {
    var out = f.parentNode.querySelector(".dv-res,.dy-res");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = f.postcode.value.trim().toUpperCase().replace(/\s+/g, " ");
      if (!OK.test(v)) { out.textContent = "Please enter a full UK postcode, for example SW1A 1AA."; return; }
      var dy = f.classList.contains("dy-form"), far = FAR.test(v.replace(" ", ""));
      if (dy) { out.textContent = far ? "We deliver to " + v + ". Standard delivery takes 3\u20136 working days there, and express isn\u2019t available." : "We deliver to " + v + ". Standard delivery takes 2\u20134 working days, or 1\u20132 with express."; return; }
      out.textContent = FAR.test(v.replace(" ", ""))
        ? "We deliver to " + v + ". Standard delivery takes 3 to 6 working days there, and next day delivery isn’t available."
        : "We deliver to " + v + ". Standard delivery takes 2 to 4 working days, or order by 2pm for next day delivery.";
    });
  });
})();
