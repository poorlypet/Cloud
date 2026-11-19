/* Product range and the body area / condition / symptom matching used by the homepage finder. */
var BR = (function () {
  var areas = [
    { id: 'wrist', name: 'Front leg and wrist', note: 'Carpal joint and front paw' },
    { id: 'elbow', name: 'Elbow', note: 'Front leg, upper joint' },
    { id: 'back', name: 'Back and spine', note: 'Neck to tail' },
    { id: 'hip', name: 'Hips', note: 'Hip joints and pelvis' },
    { id: 'knee', name: 'Knee', note: 'Stifle joint, back leg' },
    { id: 'hock', name: 'Hock', note: 'Ankle joint, back leg' },
    { id: 'rearpaw', name: 'Lower back leg and paw', note: 'Below the hock' },
    { id: 'whole', name: 'Whole body and mobility', note: 'Lifting, walking, getting about' }
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

  function card(p, why) {
    var w = why && why.length ? '<p class="pc-why">Used for ' + why.slice(0, 2).join(', ').toLowerCase().replace('ivdd', 'IVDD') + '</p>' : '';
    return '<article class="pc"><a class="ph" href="#">Product photo</a><div class="pc-b">' +
      '<p class="pc-sup">' + p.sup + '</p><h3><a href="#">' + p.name + '</a></h3>' +
      '<p class="pc-d">' + p.d + '</p>' + w +
      '<div class="pc-f"><span class="pc-p">£00.00</span><a class="btn sm" href="#">Choose size</a></div></div></article>';
  }
  function grid(el, items, showWhy) {
    el.innerHTML = items.map(function (it) { return card(it.p || it, showWhy ? it.why : null); }).join('');
  }

  return { areas: areas, symptoms: symptoms, products: products, conditions: conditions,
    find: find, conditionsFor: conditionsFor, symptomsFor: symptomsFor, match: match, card: card, grid: grid };
})();
