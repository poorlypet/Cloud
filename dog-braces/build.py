"""Builds the three standalone homepage files from src/ (shared CSS, data and footer are inlined)."""
import pathlib, re

root = pathlib.Path(__file__).parent
src = root / "src"

def include(m):
    return (src / m.group(1)).read_text()

for v in "abc":
    f = src / f"{v}.html"
    if not f.exists():
        continue
    html = f.read_text()
    html = re.sub(r"/\*@([\w.]+)\*/", include, html)
    html = re.sub(r"<!--@([\w.]+)-->", include, html)
    assert "—" not in html and "–" not in html, f"dash found in {v}"
    (root / f"home-{v}.html").write_text(html)
    print("built", f"home-{v}.html")
