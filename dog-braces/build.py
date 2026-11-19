"""Builds the three standalone homepage files from src/.

Each src/<v>.html may use:
  /*@file*/ or <!--@file-->   inline another file from src/
  {i:name}                    inline an icon from src/icons.json
"""
import json
import pathlib
import re

root = pathlib.Path(__file__).parent
src = root / "src"
icons = json.loads((src / "icons.json").read_text())


def include(m):
    return (src / m.group(1)).read_text()


def icon(m):
    return ('<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[m.group(1)] + "</svg>")


for v in "abc":
    f = src / f"{v}.html"
    if not f.exists():
        continue
    html = f.read_text()
    for _ in range(2):  # includes may contain includes
        html = re.sub(r"/\*@([\w.-]+)\*/", include, html)
        html = re.sub(r"<!--@([\w.-]+)-->", include, html)
    html = re.sub(r"\{i:([a-z0-9-]+)\}", icon, html)
    assert "—" not in html and "–" not in html, f"dash found in {v}"
    (root / f"home-{v}.html").write_text(html)
    print("built", f"home-{v}.html", len(html) // 1024, "KB")
