"""Builds the standalone homepage files from src/.

  v1a.html, v1b.html      the current two versions, both built on version 1 (src/v1a.html ...)
  v1.html to v5.html      the earlier five versions (src/v1.html ...)
  home-a/b/c.html         the first three (src/a.html ...)

A source page may use:
  /*@file*/ or <!--@file-->   inline another file from src/
  {i:name}                    inline an icon from src/icons.json
  /*@font:Family:weight:file*/  embed a font from src/fonts/ so the page needs nothing from the network
  /*@@vendor/file*/           inline a third-party library from src/vendor/ (done last, left untouched)
"""
import base64
import json
import pathlib
import re

root = pathlib.Path(__file__).parent
src = root / "src"
icons = json.loads((src / "icons.json").read_text())
PAGES = [("a", "home-a"), ("b", "home-b"), ("c", "home-c")] + [(f"v{n}", f"v{n}") for n in range(1, 6)] + [("v1a", "v1a"), ("v1b", "v1b")]


def include(m):
    return (src / m.group(1)).read_text()


def font(m):
    data = base64.b64encode((src / "fonts" / m.group(3)).read_bytes()).decode()
    return (f'@font-face{{font-family:"{m.group(1)}";font-weight:{m.group(2)};font-style:normal;font-display:swap;'
            f'src:url(data:font/woff2;base64,{data}) format("woff2")}}')


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
    html = re.sub(r"/\*@font:([^:*]+):(\d+):([\w.-]+)\*/", font, html)
    html = re.sub(r"\{i:([a-z0-9-]+)\}", icon, html)
    assert "—" not in html and "–" not in html, f"dash found in {name}"
    assert "DOG." not in html and "data-dog" not in html, f"dog drawing code left in {name}"
    html = re.sub(r"/\*@@([\w./-]+)\*/", lambda m: (src / m.group(1)).read_text(), html)
    (root / f"{out}.html").write_text(html)
    print("built", f"{out}.html", len(html) // 1024, "KB")
