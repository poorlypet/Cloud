/* scale email previews to their frames */
(function(){function fit(){document.querySelectorAll(".em-f").forEach(function(f){f.style.setProperty("--s",f.clientWidth/640);});}window.addEventListener("resize",fit);fit();})();
