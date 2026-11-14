p = '/home/user/Cloud/luxury/theme/assets/r35.js'
s = open(p).read()
old = '  var IM = JSON.parse(zp.dataset.images), i = 0, img = $(".zm img"), ctr = $(".zm .zc");'
new = '''  var IM = [];
  try { IM = JSON.parse(zp.dataset.images || "[]"); } catch (e) { IM = []; }
  if (!IM.length) IM = $$(".gt img").map(function (im) { return (im.currentSrc || im.src || "").replace(/([?&])width=\\d+/, "$1width=2000"); }).filter(Boolean);
  if (!IM.length) IM = [""];
  var i = 0, img = $(".zm img"), ctr = $(".zm .zc");'''
if old in s:
    s = s.replace(old, new, 1)
    open(p, 'w').write(s)
print('patched' if 'IM = [];' in s else 'not found')
