# Writes d-<condition>/index.html from the film configs below.
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RED, TEAL = '#E4574A', '#0F4C48'
def sit(nw, nh, h=690, top=450): w = h * nw / nh; return {'x': round(540 - w / 2), 'y': top, 'w': round(w)}
FILMS = {
 'arthritis': dict(
  title='Drawn Arthritis Film', hook='Slowing down isn’t<br>just <em>old age.</em>', caption='Real dog. Real garden.',
  poseB='side', poseC='sit', dogB={'x': 60, 'y': 690, 'w': 960}, dogC=sit(670, 1244),
  s3={'h3': 'Arthritis affects a<br>huge number of dogs<br><em>as they age.</em>', 'h4': 'And many more<br>after an <em>injury.</em>',
      'fx': "(B, at, out) => DD.DOODLE.glow(B, { pts: [[0.22, 0.45, 'hips', -70, -140], [0.15, 0.72, 'knees', 40, 20], [0.64, 0.62, 'elbows', 50, -40]] }, at, out)"},
  s4={'kind': 'joint', 'dog': {'x': 290, 'y': 1050, 'w': 720}, 'spot': [0.22, 0.45], 'lens': [540, 790],
      'h5': 'The cushioning in the<br>joint <em>wears thin.</em>', 'h6': 'It can’t be cured,<br>but it can be managed<br><em>really well at home.</em>'},
  signs=[
   {'t': 'Stiff<br><em>after rest.</em>', 'r': 'hunch', 'd': [{'k': 'txt', 'p': [0.1, 0.2], 't': 'creak…', 'c': RED, 'size': 92, 'rot': -8}, {'k': 'marks', 'p': [0.22, 0.42], 's': 0.8}]},
   {'t': 'Slow to<br><em>get up.</em>', 'r': 'slow', 'd': [{'k': 'up', 'xy': [520, 890]}]},
   {'t': 'Slowing<br><em>on walks.</em>', 'r': 'lean', 'd': [{'k': 'txt', 'xy': [300, 740], 't': 'sloooow…', 'c': TEAL, 'size': 96, 'dur': 1.0}]},
   {'t': 'Reluctant<br><em>to jump.</em>', 'r': 'lean', 'd': [{'k': 'stairs', 'xy': [260, 900], 'u': 62}, {'k': 'q', 'xy': [860, 600]}]},
   {'t': 'Licking<br><em>a joint.</em>', 'd': [{'k': 'lick', 'p': [0.66, 0.8]}, {'k': 'arrow', 'p': [0.64, 0.74], 'from': [-260, -170], 't': 'lick lick', 'c': RED, 'tx': -60, 'ty': -96}]},
  ],
  rest='The right routine<br>and support.', endWord='joints',
  products=[{'img': 'msm', 'tag': 'supple joints', 'name': 'MSM Powder · Joint & Coat', 'price': '£14.99'},
            {'img': 'jchews', 'tag': 'a daily joint chew', 'name': 'Joint Care Chews', 'price': '£18.99'},
            {'img': 'pad', 'tag': 'warmth on stiff joints', 'name': 'Self-Heating Pet Pad', 'price': '£17.99'},
            {'img': 'knee', 'tag': 'support for the knee', 'name': 'Knee Brace for Dogs', 'price': '£34.99'}]),
 'itchy': dict(
  title='Drawn Itchy Skin Film', hook='Scratching<br><em>all night?</em>', caption='Real pup. Real itch.',
  poseB='white', poseC='sit', dogB={'x': 256, 'y': 690, 'w': 568}, dogC=sit(696, 1193),
  s3={'h3': 'An over-reaction to<br>something <em>ordinary.</em>', 'h4': 'The scratching<br>makes it <em>worse.</em>',
      'fx': "(B, at, out) => { [[[0.12, 0.25], [-150, -150], 'pollen', -40], [[0.88, 0.25], [140, -150], 'dust mites', -230], [[0.08, 0.86], [-140, 110], 'grass', -40], [[0.92, 0.86], [130, 110], 'a food', -120]].forEach(([p, f, t, tx], k) => DD.DOODLE.arrow(B, { p, from: f, t, c: '#E4574A', tx, ty: f[1] < 0 ? -96 : 20, size: 72 }, at + k * 0.35, out)); DD.REACT.shake(at + 1.6); }"},
  s4={'kind': 'loop', 'dog': {'x': 330, 'y': 930, 'w': 420}, 'r': 360,
      'h5': 'Then it turns<br>into a <em>loop.</em>', 'h6': 'Break it with<br>Omega 3 every day<br>and a <em>gentle wash.</em>'},
  signs=[
   {'t': 'Scratching that<br>wakes them<br><em>at night.</em>', 'r': 'shake', 'd': [{'k': 'moon', 'xy': [900, 760]}, {'k': 'zzz', 'xy': [920, 900]}, {'k': 'marks', 'p': [0.5, 0.3], 's': 0.7}]},
   {'t': 'One paw licked<br><em>rusty brown.</em>', 'd': [{'k': 'arrow', 'p': [0.1, 0.4], 'from': [-120, -230], 't': 'rusty paw', 'c': '#A0522D', 'tx': -20, 'ty': -96}, {'k': 'lick', 'p': [0.12, 0.52]}]},
   {'t': 'Pink skin on<br>the belly and<br><em>armpits.</em>', 'd': [{'k': 'blush', 'pts': [[0.34, 0.5], [0.62, 0.62]], 'rx': 64}, {'k': 'arrow', 'p': [0.64, 0.6], 'from': [230, -140], 't': 'pink', 'c': '#E0607A', 'tx': -10}]},
   {'t': 'Flakes<br><em>on the bed.</em>', 'd': [{'k': 'flakes', 'p': [0.5, 0.45]}]},
   {'t': 'Constant<br><em>licking.</em>', 'r': 'jolt', 'd': [{'k': 'lick', 'p': [0.78, 0.86]}, {'k': 'txt', 'xy': [560, 700], 't': 'lick lick lick', 'c': '#E0607A', 'size': 84}]},
  ],
  rest='Most settle in<br>2–3 weeks.', endWord='itchy skin',
  products=[{'img': 'salmon', 'tag': 'calm it from inside', 'name': 'Scottish Salmon Oil', 'price': '£9.99'},
            {'img': 'chews', 'tag': 'a simple daily chew', 'name': 'Itch Relief Chews', 'price': '£29.99'},
            {'img': 'spray', 'tag': 'hot spots? spray it', 'name': 'Hot Spot & Itch Relief Spray', 'price': '£12.99'},
            {'img': 'oatwash', 'tag': 'a gentle wash', 'name': 'No Rinse Oatmeal Shampoo', 'price': '£8.99'}]),
 'anxiety': dict(
  title='Drawn Anxiety Film', hook='What happens<br>when you <em>leave?</em>', caption='Real dog. Real window.',
  poseB='worried', poseC='sleep', dogB={'x': 326, 'y': 690, 'w': 428}, dogC={'x': 190, 'y': 600, 'w': 700}, endHop=False,
  endFx="[[720, 560, 'zzz'], [200, 700, 'heart']]",
  s3={'h3': 'One of the most<br>common, and most<br><em>misunderstood.</em>', 'h4': 'A stressed dog isn’t<br>being naughty.<br>They’re struggling<br>to <em>cope.</em>',
      'fx': "(B, at, out) => { DD.DOODLE.bubble(B, { p: [0.72, 0.24], t: 'come back…', w: 380, size: 78, c: '#0F4C48' }, at, out); DD.DOODLE.tremble(B, { p: [0.5, 0.62], r: 240 }, at + 1.2, out); DD.REACT.shake(at + 1.2); }"},
  s4={'kind': 'pulse', 'dog': {'x': 376, 'y': 1000, 'w': 328}, 'y': 830, 'triggers': ['fireworks', 'travel', 'separation', 'routine changes'],
      'h5': 'Fireworks, travel,<br>separation, routine<br><em>changes.</em>', 'h6': 'Building a sense of<br>safety can <em>transform</em><br>their quality of life.'},
  signs=[
   {'t': 'Restless<br><em>pacing.</em>', 'r': 'pace', 'd': [{'k': 'steps', 'xy': [240, 1590]}]},
   {'t': 'Whining when<br><em>left alone.</em>', 'r': 'hunch', 'd': [{'k': 'bubble', 'p': [0.86, 0.2], 't': 'whine…', 'w': 300, 'size': 86}]},
   {'t': 'Shaking and<br><em>trembling.</em>', 'r': 'shake', 'd': [{'k': 'tremble', 'p': [0.5, 0.6], 'r': 250}]},
   {'t': 'Destructive<br><em>behaviour.</em>', 'r': 'jolt', 'd': [{'k': 'tear', 'xy': [870, 1380]}]},
   {'t': 'Panting on<br><em>car journeys.</em>', 'd': [{'k': 'car', 'xy': [180, 1390]}, {'k': 'txt', 'xy': [740, 880], 't': 'pant pant…', 'c': TEAL, 'size': 72}]},
  ],
  rest='Build a sense<br>of safety.', endWord='anxiety',
  products=[{'img': 'cspray', 'tag': 'calm in the moment', 'name': 'Lavender Calming Spray', 'price': '£10.99'},
            {'img': 'superchews', 'tag': 'a calming soft chew', 'name': 'Calming SuperChews', 'price': '£19.95'},
            {'img': 'lickimat', 'tag': 'lick to unwind', 'name': 'Lickimat Slomo', 'price': '£12.99'},
            {'img': 'cdrops', 'tag': 'a settled mind', 'name': 'Calming Drops', 'price': '£17.99'}]),
 'dental': dict(
  title='Drawn Dental Film', hook='That breath<br><em>isn’t normal.</em>', caption='Real dog. Real grin.',
  poseB='white', poseC='sit', dogB={'x': 40, 'y': 922, 'w': 1000}, dogC=sit(762, 1301),
  s3={'h3': 'It affects the<br>majority of dogs<br>by <em>middle age.</em>', 'h4': 'Bad breath is usually<br>the <em>first sign.</em>',
      'fx': "(B, at, out) => { DD.DOODLE.stink(B, { p: [0.8, 0.56], dir: 1 }, at, out); DD.DOODLE.stink(B, { p: [0.2, 0.56], dir: -1 }, at + 0.25, out); }"},
  s4={'kind': 'tooth', 'dog': {'x': 140, 'y': 1100, 'w': 800}, 'spot': [0.5, 0.66], 'lens': [540, 760],
      'h5': 'Left unchecked,<br>it causes <em>pain.</em>', 'h6': 'A simple daily routine<br>goes a <em>long way.</em>'},
  signs=[
   {'t': 'Bad<br><em>breath.</em>', 'd': [{'k': 'stink', 'p': [0.8, 0.56], 'dir': 1}, {'k': 'stink', 'p': [0.2, 0.56], 'dir': -1}]},
   {'t': 'Yellow or<br><em>brown tartar.</em>', 'd': [{'k': 'arrow', 'p': [0.42, 0.64], 'from': [-280, -420], 't': 'tartar', 'c': '#B8862B', 'tx': -40}]},
   {'t': 'Bleeding or<br><em>red gums.</em>', 'd': [{'k': 'blush', 'pts': [[0.38, 0.55], [0.62, 0.55]], 'rx': 50, 'c': '#E4574A'}, {'k': 'arrow', 'p': [0.64, 0.55], 'from': [240, -380], 't': 'red gums', 'c': RED, 'tx': -200}]},
   {'t': 'Dropping food or<br><em>slow chewing.</em>', 'd': [{'k': 'kibble', 'p': [0.5, 0.7]}]},
   {'t': 'Pawing at<br><em>the mouth.</em>', 'r': 'jolt', 'd': [{'k': 'paw', 'p': [0.82, 0.74]}]},
  ],
  rest='Brushing. Chewing.<br>A water additive.', endWord='teeth',
  products=[{'img': 'toothkit', 'tag': 'brush in half the time', 'name': 'Toothbrush & Toothpaste Kit', 'price': '£14.99'},
            {'img': 'crackerz', 'tag': 'a crunchy daily treat', 'name': 'Plaque Crackerz Dental Bites', 'price': '£5.99'},
            {'img': 'water', 'tag': 'one capful a day', 'name': 'Dental Water Additive', 'price': '£9.99'},
            {'img': 'seaweed', 'tag': 'clean from the inside', 'name': 'Organic Seaweed Powder', 'price': '£10.99'}]),
 'digestive': dict(
  title='Drawn Digestive Film', hook='Tummy trouble,<br><em>again?</em>', caption='Real dog. Real dinner.',
  poseB='side', poseC='sit', dogB={'x': 50, 'y': 860, 'w': 980}, dogC=sit(601, 1234),
  s3={'h3': 'An occasional<br>upset tummy is<br>part of <em>life.</em>', 'h4': 'Frequent ones need<br>some <em>support.</em>',
      'fx': "(B, at, out) => DD.DOODLE.rumble(B, { p: [0.45, 0.47], t: 'grumble…' }, at, out)"},
  s4={'kind': 'gut', 'spot': [0.44, 0.47], 'lens': [540, 705],
      'gut': [[0.3, 0.36], [0.56, 0.34], [0.58, 0.43], [0.33, 0.45], [0.31, 0.53], [0.57, 0.53], [0.53, 0.6], [0.36, 0.6]],
      'h5': 'Frequent upsets mean<br>digestion needs <em>support.</em>', 'h6': 'Help a sensitive stomach<br>and keep their gut <em>healthy.</em>'},
  signs=[
   {'t': 'Loose<br><em>stools.</em>', 'd': [{'k': 'bang', 'xy': [70, 760], 'size': 200}, {'k': 'txt', 'xy': [150, 840], 't': 'uh oh…', 'c': RED, 'size': 88}]},
   {'t': 'Frequent<br><em>vomiting.</em>', 'r': 'hunch', 'd': [{'k': 'swirl', 'xy': [880, 790]}, {'k': 'txt', 'xy': [560, 720], 't': 'urgh…', 'c': '#7FA83A', 'size': 88}]},
   {'t': 'Lots of<br><em>wind.</em>', 'r': 'jolt', 'd': [{'k': 'wind', 'p': [0.12, 0.33], 'step': [-8, -95]}, {'k': 'txt', 'xy': [250, 760], 't': 'pfft!', 'c': '#7FA83A', 'size': 96}]},
   {'t': 'Appetite<br><em>changes.</em>', 'd': [{'k': 'bowl', 'xy': [880, 1500]}]},
   {'t': 'A noisy<br><em>tummy.</em>', 'r': 'shake', 'd': [{'k': 'rumble', 'p': [0.45, 0.5], 't': 'grumble…'}]},
  ],
  rest='Help a sensitive<br>stomach.', endWord='tummy',
  products=[{'img': 'pumpkin', 'tag': 'simple pumpkin', 'name': '100% Natural Pumpkin Powder', 'price': '£12.99'},
            {'img': 'prepro', 'tag': 'good gut bacteria', 'name': 'Pre & Probiotic Powder', 'price': '£15.99'},
            {'img': 'dchews', 'tag': 'a daily gut chew', 'name': 'Digestive Chews', 'price': '£19.99'},
            {'img': 'broth', 'tag': 'tempt a fussy eater', 'name': 'Chicken Bone Broth Powder', 'price': '£17.95'}]),
}
for name, c in FILMS.items():
    c = dict(c); title = c.pop('title')
    fxs = c['s3'].pop('fx'); endfx = c.pop('endFx', None)
    js = 'window.F = ' + json.dumps(c, ensure_ascii=False, indent=1) + ';\nF.s3.fx = ' + fxs + ';\n' + (f'F.endFx = {endfx};\n' if endfx else '')
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="../shared/kit.css">
<link rel="stylesheet" href="../shared/drawn.css">
</head>
<body>
<div id="stage"></div>
<script src="../shared/lib/gsap.min.js"></script>
<script src="../shared/lib/SplitText.min.js"></script>
<script src="../shared/lib/CustomEase.min.js"></script>
<script src="../shared/lib/DrawSVGPlugin.min.js"></script>
<script src="../shared/kit.js"></script>
<script src="assets/assets.js"></script>
<script>
{js}</script>
<script src="../shared/drawn.js"></script>
</body>
</html>
'''
    open(os.path.join(HERE, 'd-' + name, 'index.html'), 'w').write(html)
    print('wrote', name)
