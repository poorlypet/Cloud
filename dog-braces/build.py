"""Builds the standalone homepage files from src/.

  v1.html to v5.html      the current five versions (src/v1.html ...)
  home-a/b/c.html         the earlier three (src/a.html ...)

A source page may use:
  /*@file*/ or <!--@file-->   inline another file from src/
  {i:name}                    inline an icon from src/icons.json
  /*@@vendor/file*/           inline a third-party library from src/vendor/ (done last, left untouched)
"""
import json
import pathlib
import re

root = pathlib.Path(__file__).parent
src = root / "src"
icons = json.loads((src / "icons.json").read_text())
PAGES = [("a", "home-a"), ("b", "home-b"), ("c", "home-c")] + [(f"v{n}", f"v{n}") for n in range(1, 6)]


def include(m):
    return (src / m.group(1)).read_text()


def icon(m):
    return ('<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[m.group(1)] + "</svg>")


for name, out in PAGES:
    f = src / f"{name}.html"
    if not f.exists():
        continue
    html = f.read_text()
    for _ in range(3):  # includes may contain includes
        html = re.sub(r"/\*@([\w.-]+)\*/", include, html)
        html = re.sub(r"<!--@([\w.-]+)-->", include, html)
    html = re.sub(r"\{i:([a-z0-9-]+)\}", icon, html)
    assert "—" not in html and "–" not in html, f"dash found in {name}"
    assert "DOG." not in html and "data-dog" not in html, f"dog drawing code left in {name}"
    html = re.sub(r"/\*@@([\w./-]+)\*/", lambda m: (src / m.group(1)).read_text(), html)
    (root / f"{out}.html").write_text(html)
    print("built", f"{out}.html", len(html) // 1024, "KB")
