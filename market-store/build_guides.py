# Builds assets/guides-data-de.js: the German guides, from i18n/src/guides-data.js (English) and i18n/src/guides_de_*.json.
import json, glob, subprocess, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, 'i18n', 'src', 'guides-data.js')
js = "global.window={};eval(require('fs').readFileSync(%r,'utf8'));process.stdout.write(JSON.stringify(window.PPGUIDES))" % src
en = json.loads(subprocess.check_output(['node', '-e', js]))
de = {}
for f in sorted(glob.glob(os.path.join(here, 'i18n', 'src', 'guides_de_*.json'))):
    de.update(json.load(open(f, encoding='utf8')))
CATS = {"Behaviour & Mood":"Verhalten & Stimmung","Essential Care":"Basispflege","Internal Health":"Innere Gesundheit","Mobility & Joint":"Mobilität & Gelenke","Neurological":"Neurologisch","Paws & Limbs":"Pfoten & Gliedmaßen","Rehab":"Reha","Skin & Allergies":"Haut & Allergien"}
out = {"cats": [{"key": c["key"], "name": CATS.get(c["name"], c["name"])} for c in en["cats"]], "guides": {}}
missing = []
for k, g in en["guides"].items():
    if k in de: out["guides"][k] = de[k]
    else: out["guides"][k] = g; missing.append(k)
open(os.path.join(here, 'assets', 'guides-data-de.js'), 'w').write('window.PPGUIDES=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(out["guides"]), 'guides,', len(missing), 'still English:', missing[:5])
