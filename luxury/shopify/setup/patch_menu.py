import re
T = '/home/user/Cloud/luxury/theme/'
p = T + 'assets/r5.js'; s = open(p).read()

# two photos per category, first one that has been uploaded wins ("a|b")
PICS = {
  'beds':    ('menu-beds.jpg|home-category-beds.jpg', 'home-category-beds.jpg|story-collect-beds.jpg'),
  'walking': ('menu-walking.jpg|home-category-walking.jpg', 'home-category-walking.jpg|story-collect-walking.jpg'),
  'coats':   ('menu-coats.jpg|story-collect-coats.jpg', 'home-category-coats.jpg'),
  'dining':  ('menu-dining.jpg|home-category-dining.jpg', 'home-category-dining.jpg|story-collect-dining.jpg'),
  'play':    ('menu-play.jpg|home-category-play.jpg', 'home-category-play.jpg|story-collect-play.jpg'),
  'travel':  ('menu-travel.jpg|home-category-travel.jpg', 'home-category-travel.jpg|story-collect-travel.jpg'),
  'gifts':   ('menu-gifts.jpg|home-category-gifts.jpg', 'home-category-gifts.jpg'),
}
for k, (a, b) in PICS.items():
    s = re.sub(r'(key: "%s", label: "[^"]*", )hero: "[^"]*"' % k, r'\1hero: "%s", hero2: "%s"' % (a, b), s)
# Walking: the first photo is captioned Harnesses
s = s.replace('f: [{ p: "labCollar", t: "Collars", n: "Leather Collar, Cognac", pr: 65 },\n          { p: "goldenWalk", t: "Leads"',
              'f: [{ p: "labCollar", t: "Harnesses", n: "Padded Harness, Olive", pr: 79 },\n          { p: "goldenWalk", t: "Leads"')
# New In: four links and four square photos
s = re.sub(r'\{ key: "new", label: "New In", g: \[\{ t: "New in", l: \[[^\]]*\] \}\], f: \[\],\n\s*tiles: \[[^\]]*\] \}',
  '{ key: "new", label: "New In", g: [{ t: "New in", l: ["New beds", "New collars & leads", "New knitwear", "Shop all new in"] }], f: [],\n'
  '      tiles: [{ p: "menu-new-beds.jpg", t: "New beds" }, { p: "menu-new-collars-leads.jpg", t: "New collars & leads" }, { p: "menu-new-knitwear.jpg", t: "New knitwear" }, { p: "home-category-coats.jpg|story-collect-coats.jpg", t: "New in" }] }', s)

# photo lookup: whole stills map from the shop, keys without extension, "a|b" fallbacks
a = s.index('  function src(k, w) {'); b = s.index('\n  }\n', a) + 4
s = s[:a] + '''  function pick(k) {
    var m = (window.AH && AH.media) || {}, ks = String(k).split("|");
    for (var i = 0; i < ks.length; i++) { var u = m[ks[i].replace(/\\.(jpg|png)$/, "")]; if (u) return u; }
    return "";
  }
  function src(k, w) {
    var u = pick(k);
    return u ? u + (u.indexOf("?") < 0 ? "?" : "&") + "width=" + w : (window.AH && AH.blank) || "";
  }
''' + s[b:]
s = s.replace("""((window.AH && AH.media && AH.media[k]) ? "" : ' class="ah-blank"')""", """(pick(k) ? "" : ' class="ah-blank"')""")

# new layouts
pic = '''  function pic(k, t, sq) {
    return '<a class="mw-pic" href="#"><span class="ph"><img src="' + src(k, 600) + '" alt="" loading="lazy" decoding="async"' + (pick(k) ? "" : ' class="ah-blank"') + '></span><span class="mw-t">' + esc(t) + '</span><span class="mw-s">Shop now</span></a>';
  }
'''
s = s.replace('  function tile(f, ratio) {', pic + '  function tile(f, ratio) {', 1)
s = s.replace('''    newin: function (c) {''', '''    mw: function (c) {
      return '<div class="mw"><div class="mw-cols">' + c.g.slice(0, 3).map(function (g) { return '<div class="col"><p class="hd">' + esc(g.t) + "</p>" + links(g.l) + "</div>"; }).join("") +
        '<div class="col"><p class="hd">Featured</p>' + links(FEAT) + '<a class="ln all" href="#">Shop all ' + esc(c.label.toLowerCase()) + '</a></div></div>' +
        '<div class="mw-pics">' + pic(c.hero, c.f[0].t) + pic(c.hero2, c.f[1].t) + "</div></div>";
    },
    mwnew: function (c) {
      return '<div class="mw"><div class="mw-cols" style="grid-template-columns:minmax(0,1fr)"><div class="col"><p class="hd">New in</p>' + links(c.g[0].l) + '</div></div>' +
        '<div class="mw-pics sq">' + c.tiles.map(function (f) { return pic(f.p, f.t, true); }).join("") + "</div></div>";
    },
    newin: function (c) {''', 1)
s = s.replace('p.innerHTML = band + (c.tiles ? LAYOUTS.newin(c) : layout(c));', 'p.innerHTML = band + (c.tiles ? LAYOUTS.mwnew(c) : LAYOUTS.mw(c));')
open(p, 'w').write(s)
print(s.count('hero2'), 'mwnew' in s, 'Harnesses", n: "Padded' in s)

# the whole stills map goes to the page; the menu picks from it
L = T + 'layout/theme.liquid'; t = open(L).read()
t = re.sub(r'      media: \{[^\n]*\},\n', '      media: {{ shop.metafields.custom.ah_media.value.stills | json }},\n', t, count=1)
if "r50.css" not in t:
    t = t.replace("{{ 'r49.css' | asset_url | stylesheet_tag }}", "{{ 'r49.css' | asset_url | stylesheet_tag }}\n  {{ 'r50.css' | asset_url | stylesheet_tag }}")
open(L, 'w').write(t)
print(t.count('r50.css'), 'value.stills | json' in t)
