/* Product range and the body area / condition / symptom matching used by the homepage finder. */
var BR = (function () {
  var areas = [
    { id: 'wrist', s: 'Wrist', name: 'Front leg and wrist', note: 'Carpal joint and front paw' },
    { id: 'elbow', s: 'Elbow', name: 'Elbow', note: 'Front leg, upper joint' },
    { id: 'back', s: 'Back', name: 'Back and spine', note: 'Neck to tail' },
    { id: 'hip', s: 'Hips', name: 'Hips', note: 'Hip joints and pelvis' },
    { id: 'knee', s: 'Knee', name: 'Knee', note: 'Stifle joint, back leg' },
    { id: 'hock', s: 'Hock', name: 'Hock', note: 'Ankle joint, back leg' },
    { id: 'rearpaw', s: 'Lower leg', name: 'Lower back leg and paw', note: 'Below the hock' },
    { id: 'whole', s: 'Whole body', name: 'Whole body and mobility', note: 'Lifting, walking, getting about' }
  ];

  var symptoms = [
    { id: 'limp', name: 'Limping' },
    { id: 'hold', name: 'Holding a leg up' },
    { id: 'swell', name: 'Swelling around a joint' },
    { id: 'drop', name: 'Dropped wrist or hock' },
    { id: 'knuckle', name: 'Knuckling over on the paw' },
    { id: 'scuff', name: 'Scuffed nails or toes' },
    { id: 'stiff', name: 'Stiff after rest' },
    { id: 'stairs', name: 'Struggling with stairs or the car' },
    { id: 'stand', name: 'Struggling to stand up' },
    { id: 'hop', name: 'Bunny hopping or skipping' },
    { id: 'wobble', name: 'Wobbly back legs' },
    { id: 'drag', name: 'Dragging the back legs' },
    { id: 'hunch', name: 'Hunched back or reluctant to jump' },
    { id: 'lick', name: 'Licking or chewing at a joint' }
  ];

  var products = [
    { id: 'carpal-brace', name: 'Carpal Brace', type: 'brace', sup: 'Firm support', areas: ['wrist'], d: 'Steadies a weak or dropped wrist while your dog stays active.' },
    { id: 'carpal-wrap', name: 'Carpal Wrap', type: 'wrap', sup: 'Light support', areas: ['wrist'], d: 'Soft compression and warmth for sore or arthritic wrists.' },
    { id: 'carpal-splint', name: 'Carpal Splint', type: 'splint', sup: 'Rigid support', areas: ['wrist'], d: 'Holds the wrist still for serious injuries and recovery.' },
    { id: 'leg-bootie-splint', name: 'Leg Bootie Splint', type: 'splint', sup: 'Rigid support', areas: ['wrist', 'rearpaw'], d: 'Supports the lower leg and keeps the paw in the right position.' },
    { id: 'elbow-brace', name: 'Elbow Brace', type: 'brace', sup: 'Firm support', areas: ['elbow'], d: 'Cushions and supports the elbow joint.' },
    { id: 'back-brace', name: 'Back Brace', type: 'brace', sup: 'Firm support', areas: ['back'], d: 'Supports the spine and limits twisting.' },
    { id: 'hip-brace', name: 'Hip Brace', type: 'brace', sup: 'Firm support', areas: ['hip'], d: 'Steadies loose or sore hips on walks and at home.' },
    { id: 'knee-brace', name: 'Knee Brace', type: 'brace', sup: 'Firm support', areas: ['knee'], d: 'Stabilises the knee joint.' },
    { id: 'hock-brace', name: 'Hock Brace', type: 'brace', sup: 'Firm support', areas: ['hock'], d: 'Supports an unstable or injured hock.' },
    { id: 'hock-wrap', name: 'Hock Wrap', type: 'wrap', sup: 'Light support', areas: ['hock'], d: 'Soft compression and warmth for sore hocks.' },
    { id: 'rear-leg-splint', name: 'Rear Leg Splint', type: 'splint', sup: 'Rigid support', areas: ['hock', 'rearpaw'], d: 'Holds the lower back leg still while it heals.' },
    { id: 'rear-lift-harness', name: 'Rear Lift Harness', type: 'mobility', sup: 'Lifting aid', areas: ['hip', 'back', 'knee', 'whole'], d: 'Lets you take the weight off the back legs on stairs and walks.' },
    { id: 'full-body-lift-harness', name: 'Full Body Lift Harness', type: 'mobility', sup: 'Lifting aid', areas: ['back', 'whole'], d: 'Front and rear handles so you can support your dog from both ends.' },
    { id: 'drag-bag', name: 'Drag Bag', type: 'mobility', sup: 'Protection', areas: ['back', 'whole'], d: 'Protects the chest and legs of dogs who pull themselves along.' }
  ];

  var conditions = [
    { id: 'carpal-hyper', name: 'Carpal hyperextension', areas: ['wrist'], syms: ['drop', 'limp', 'swell'], products: ['carpal-brace', 'carpal-splint'] },
    { id: 'wrist-sprain', name: 'Wrist sprain or strain', areas: ['wrist'], syms: ['limp', 'swell', 'hold', 'lick'], products: ['carpal-wrap', 'carpal-brace'] },
    { id: 'arthritis', name: 'Arthritis', areas: ['wrist', 'elbow', 'hip', 'knee', 'hock'], syms: ['stiff', 'limp', 'stairs', 'lick'], products: ['carpal-wrap', 'carpal-brace', 'elbow-brace', 'hip-brace', 'knee-brace', 'hock-wrap', 'hock-brace'] },
    { id: 'knuckling', name: 'Knuckling or nerve damage', areas: ['wrist', 'rearpaw'], syms: ['knuckle', 'scuff', 'wobble'], products: ['leg-bootie-splint', 'carpal-splint', 'rear-leg-splint'] },
    { id: 'lower-leg', name: 'Lower leg injury', areas: ['wrist', 'rearpaw'], syms: ['limp', 'hold', 'swell'], products: ['carpal-splint', 'leg-bootie-splint', 'rear-leg-splint'] },
    { id: 'elbow-dysplasia', name: 'Elbow dysplasia', areas: ['elbow'], syms: ['limp', 'stiff', 'swell'], products: ['elbow-brace'] },
    { id: 'hygroma', name: 'Elbow hygroma or callus', areas: ['elbow'], syms: ['swell', 'lick'], products: ['elbow-brace'] },
    { id: 'ivdd', name: 'IVDD or slipped disc', areas: ['back'], syms: ['hunch', 'wobble', 'drag', 'stand'], products: ['back-brace', 'rear-lift-harness', 'full-body-lift-harness', 'drag-bag'] },
    { id: 'spondylosis', name: 'Spondylosis', areas: ['back'], syms: ['stiff', 'hunch'], products: ['back-brace'] },
    { id: 'dm', name: 'Degenerative myelopathy', areas: ['back', 'rearpaw', 'whole'], syms: ['wobble', 'knuckle', 'scuff', 'drag', 'stand'], products: ['rear-lift-harness', 'full-body-lift-harness', 'drag-bag', 'leg-bootie-splint'] },
    { id: 'hip-dysplasia', name: 'Hip dysplasia', areas: ['hip'], syms: ['hop', 'stiff', 'stand', 'stairs', 'wobble'], products: ['hip-brace', 'rear-lift-harness'] },
    { id: 'cruciate', name: 'Cruciate ligament injury', areas: ['knee'], syms: ['limp', 'hold', 'swell', 'stiff'], products: ['knee-brace', 'rear-lift-harness'] },
    { id: 'patella', name: 'Luxating patella', areas: ['knee'], syms: ['hop', 'hold'], products: ['knee-brace'] },
    { id: 'achilles', name: 'Achilles tendon injury', areas: ['hock'], syms: ['drop', 'limp', 'swell'], products: ['hock-brace', 'rear-leg-splint'] },
    { id: 'hock-sprain', name: 'Hock sprain or instability', areas: ['hock'], syms: ['limp', 'swell', 'hold'], products: ['hock-wrap', 'hock-brace'] },
    { id: 'paralysis', name: 'Paralysis or back leg weakness', areas: ['back', 'whole'], syms: ['drag', 'stand', 'wobble'], products: ['drag-bag', 'rear-lift-harness', 'full-body-lift-harness'] },
    { id: 'senior', name: 'Weakness in older dogs', areas: ['hip', 'whole'], syms: ['stand', 'stairs', 'stiff', 'wobble'], products: ['rear-lift-harness', 'full-body-lift-harness', 'hip-brace'] },
    { id: 'post-op', name: 'Recovery after surgery', areas: ['wrist', 'elbow', 'back', 'hip', 'knee', 'hock', 'rearpaw', 'whole'], syms: ['limp', 'stand', 'stairs'], products: ['carpal-splint', 'elbow-brace', 'back-brace', 'hip-brace', 'knee-brace', 'hock-brace', 'rear-leg-splint', 'rear-lift-harness', 'full-body-lift-harness'] }
  ];

  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function has(arr, v) { return arr.indexOf(v) > -1; }

  function conditionsFor(area) {
    return conditions.filter(function (c) { return !area || has(c.areas, area); });
  }
  function symptomsFor(area, cond) {
    var pool = conditionsFor(area).filter(function (c) { return !cond || c.id === cond; });
    return symptoms.filter(function (s) { return pool.some(function (c) { return has(c.syms, s.id); }); });
  }
  /* sel = { area, cond, syms: [] }. Returns { items: [{ p, why }], likely: [condition names] } */
  function match(sel) {
    var syms = sel.syms || [], score = {}, why = {}, likely = [];
    conditionsFor(sel.area).forEach(function (c) {
      if (sel.cond && c.id !== sel.cond) return;
      var hits = syms.filter(function (s) { return has(c.syms, s); }).length;
      if (syms.length && !sel.cond && !hits) return;
      if (hits && !sel.cond) likely.push({ n: c.name, h: hits });
      c.products.forEach(function (pid) {
        if (sel.area && !has(find(products, pid).areas, sel.area)) return;
        score[pid] = (score[pid] || 0) + 1 + hits * 2;
        (why[pid] = why[pid] || []).push(c.name);
      });
    });
    var items = products.filter(function (p) { return score[p.id]; })
      .sort(function (a, b) { return score[b.id] - score[a.id]; })
      .map(function (p) { return { p: p, why: why[p.id] }; });
    likely.sort(function (a, b) { return b.h - a.h; });
    return { items: items, likely: likely.slice(0, 3).map(function (l) { return l.n; }) };
  }

  var info = {
    'carpal-hyper': 'The ligaments at the back of the wrist are stretched or torn, so the wrist sinks towards the ground.',
    'wrist-sprain': 'Soft tissue around the wrist is overstretched, often after a jump or an awkward landing.',
    'arthritis': 'Wear of the joint cartilage that causes pain and stiffness. Most common in older dogs.',
    'knuckling': 'The paw is not placed correctly and the dog walks on the top of the toes. Usually a nerve problem.',
    'lower-leg': 'Soft tissue injuries or healing fractures below the wrist or hock that need to be held still.',
    'elbow-dysplasia': 'The elbow joint develops abnormally, leading to lameness and early arthritis. Common in larger breeds.',
    'hygroma': 'A fluid-filled swelling over the point of the elbow, caused by repeated pressure on hard floors.',
    'ivdd': 'A disc in the spine bulges or bursts and presses on the spinal cord, causing pain, weakness or paralysis.',
    'spondylosis': 'Bony spurs form along the spine, usually with age, and can cause stiffness.',
    'dm': 'A progressive disease of the spinal cord that gradually reduces strength and coordination in the back legs.',
    'hip-dysplasia': 'The ball and socket of the hip do not fit together properly, so the joint is loose and wears.',
    'cruciate': 'The ligament that stabilises the knee is partly or fully torn. A very common cause of back leg lameness.',
    'patella': 'The kneecap slips out of its groove, causing a skipping step. Common in small breeds.',
    'achilles': 'The tendon at the back of the hock is strained or torn, so the hock drops towards the ground.',
    'hock-sprain': 'Ligaments around the hock are stretched or damaged, leaving the joint unstable.',
    'paralysis': 'Loss of some or all movement in the back legs, from spinal injury or disease.',
    'senior': 'Muscle loss and stiff joints make standing, stairs and longer walks harder.',
    'post-op': 'Controlled support and help with lifting while a repair heals, as directed by your vet.'
  };
  conditions.forEach(function (c) { c.info = info[c.id]; });
  var levels = [
    { type: 'wrap', n: 1, move: 'Full movement', mv: 100, name: 'Wrap', sup: 'Light support', d: 'Soft compression and warmth. For mild strains, arthritis and everyday comfort. Full movement is kept.' },
    { type: 'brace', n: 2, move: 'Controlled movement', mv: 55, name: 'Brace', sup: 'Firm support', d: 'Stabilises the joint while allowing controlled movement. For instability, ligament injuries and long-term conditions.' },
    { type: 'splint', n: 3, move: 'Joint held still', mv: 12, name: 'Splint', sup: 'Rigid support', d: 'Holds the joint still. For serious injuries, knuckling and recovery after surgery, usually on your vet\'s advice.' },
    { type: 'mobility', n: 0, move: 'You take the weight', mv: 0, name: 'Lifting and mobility', sup: 'Lifting aid', d: 'Harnesses that let you take your dog\'s weight, and protection for dogs that cannot use their back legs.' }
  ];
  var LV = { wrap: 1, brace: 2, splint: 3, mobility: 0 };
  function tidy(t) { return t.toLowerCase().replace('ivdd', 'IVDD').replace('achilles', 'Achilles'); }
  function areaText(p) { return p.areas.map(function (a) { return find(areas, a).name; }).join(', '); }
  /* conditions a product is used for, optionally limited to the ones that matched */
  function uses(p) { return conditions.filter(function (c) { return has(c.products, p.id) && c.id !== 'post-op'; }).map(function (c) { return c.name; }); }
  function byType(t) { return products.filter(function (p) { return !t || p.type === t; }); }
  var regions = [
    { id: 'front', name: 'Front leg', areas: ['wrist', 'elbow'] },
    { id: 'rear', name: 'Back leg', areas: ['knee', 'hock', 'rearpaw'] },
    { id: 'spine', name: 'Spine and hips', areas: ['back', 'hip'] },
    { id: 'mob', name: 'Lifting and mobility', areas: ['whole'] }
  ];
  /* how conditions are grouped in menus */
  var condGroups = [
    { name: 'Front leg', ids: ['carpal-hyper', 'wrist-sprain', 'knuckling', 'lower-leg', 'elbow-dysplasia', 'hygroma'] },
    { name: 'Back leg', ids: ['cruciate', 'patella', 'achilles', 'hock-sprain'] },
    { name: 'Spine and hips', ids: ['ivdd', 'spondylosis', 'dm', 'hip-dysplasia'] },
    { name: 'Joints and mobility', ids: ['arthritis', 'paralysis', 'senior', 'post-op'] }
  ].map(function (g) { return { name: g.name, list: g.ids.map(function (id) { return find(conditions, id); }) }; });
  var typeName = { brace: 'Braces', splint: 'Splints', wrap: 'Wraps', mobility: 'Lifting and mobility' };
  var typeOne = { brace: 'Brace', splint: 'Splint', wrap: 'Wrap', mobility: 'Mobility aid' };
  /* conditions grouped by the first region they belong to */
  function condsByRegion() {
    return regions.map(function (r) {
      return { region: r, list: conditions.filter(function (c) { return c.id !== 'post-op' && has(r.areas, c.areas[0]); }) };
    });
  }

  return { areas: areas, symptoms: symptoms, products: products, conditions: conditions, levels: levels, regions: regions, LV: LV,
    typeName: typeName, typeOne: typeOne, find: find, has: has, conditionsFor: conditionsFor, symptomsFor: symptomsFor, match: match,
    tidy: tidy, areaText: areaText, uses: uses, byType: byType, condsByRegion: condsByRegion, condGroups: condGroups };
})();
