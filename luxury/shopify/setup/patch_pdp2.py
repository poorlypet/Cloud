p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()
js = '''<script>
document.addEventListener("click", function (e) {
  var t = e.target.closest(".ga-t"); if (!t) return;
  var i = t.getAttribute("data-i");
  document.querySelectorAll(".ga-t").forEach(function (x) { x.classList.toggle("on", x === t); });
  document.querySelectorAll(".p8 .gg .gt").forEach(function (g, k) { g.classList.toggle("on", String(k) === i); });
});
</script>
'''
if 'closest(".ga-t")' not in s:
    s = s.replace('{% schema %}', js + '{% schema %}', 1)
open(p, 'w').write(s)
print('ok')
