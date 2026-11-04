# Regenerates de-dict.js from i18n/b1.py ... b5.py (each has a dict D and optionally a list RULES of (regex, replacement)).
import importlib, json, re, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'i18n'))
D = {}; RULES = []; WORDS = []
for n in ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']:
    if not os.path.exists(os.path.join(os.path.dirname(__file__), 'i18n', n + '.py')): continue
    m = importlib.import_module(n)
    D.update(getattr(m, 'D', {}))
    RULES += list(getattr(m, 'RULES', []))
    WORDS += list(getattr(m, 'WORDS', []))
def jsre(p): return '/' + p.replace('/', '\\/') + '/'
def jsrep(r): return json.dumps(re.sub(r'\\(\d)', r'$\1', r), ensure_ascii=False)
out = ('/* de-dict.js: German text for the interface. Exact phrases (PP_DE) and patterns with numbers in them (PP_DE_RULES).\n'
       '   Generated from market-store/i18n/*.py. Strings that are not listed stay as they are. */\n'
       'window.PP_DE=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';\n'
       'window.PP_DE_RULES=[' + ','.join('[' + jsre(p) + ',' + jsrep(r) + ']' for p, r in RULES) + '];\n'
       'window.PP_DE_WORDS=[' + ','.join('[' + jsre(p) + 'gi,' + jsrep(r) + ']' for p, r in WORDS) + '];\n')
open(os.path.join(os.path.dirname(__file__), 'de-dict.js'), 'w').write(out)
print(len(D), len(RULES), len(out))
