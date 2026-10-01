/* Timeline and sound cues on a 92 BPM grid (1 beat = 0.6522 s, 92 beats = 60 s).
   This one file drives both the film (index.html reads window.TL) and the score
   (audio/score.py evaluates it with node and reads window.CUES), so every pen stroke,
   marker squeak, page turn, stamp and register ding lands on its frame.

   PAGES  [id, start beat, how the page arrives]   ('lift' = the previous sheet lifts and slides away)
   EV     per page: [key, kind, start beat (from page start), length in beats, sound or null]
*/
(function (root) {
  const BPM = 92, B = 60 / BPM, END = 92;
  const PAGES = [
    ['hook', 0, null],        // 0.0 s   HOOK
    ['signs', 6, 'lift'],     // 3.9 s   RELATE
    ['what', 19, 'lift'],     // 12.4 s  EDUCATE: what it is, who is at risk
    ['rest', 30, 'lift'],     // 19.6 s  EDUCATE: what helps at home (1)
    ['helps', 35.5, 'lift'],  // 23.2 s  EDUCATE: what helps at home (2-5)
    ['bundle', 43.5, 'lift'], // 28.4 s  PRODUCTS
    ['ramp', 52.5, 'lift'],   // 34.2 s
    ['harness', 58.5, 'lift'],// 38.2 s
    ['wheel', 64.5, 'lift'],  // 42.1 s
    ['proof', 69.5, 'lift'],  // 45.3 s  PROOF
    ['offer', 83, 'lift'],    // 54.1 s  OFFER + CTA
  ];
  const SIGNROW = (i, b) => [[`box${i}`, 'draw', b, 0.3, 'sketch'], [`ic${i}`, 'draw', b + 0.15, 0.8, null], [`s${i}`, 'write', b + 0.3, 1.0, 'pencil'], [`tk${i}`, 'draw', b + 1.4, 0.3, 'check']];
  const HELPROW = (i, b) => [[`n${i}`, 'draw', b, 0.3, 'knock'], [`ic${i}`, 'draw', b + 0.1, 0.8, 'sketch'], [`h${i}`, 'write', b + 0.2, 1.05, 'pencil']];
  const EV = {
    hook: [['l1', 'write', -0.3, 2.0, 'pencil'], ['hl', 'marker', 1.35, 0.4, 'swipe'], ['l2', 'write', 1.7, 0.85, 'pencil'], ['ul', 'draw', 2.45, 0.4, 'scribble'],
      ['ivdd', 'write', 2.6, 0.8, 'marker'], ['circ', 'draw', 3.2, 0.75, 'scribble'], ['full', 'write', 3.7, 0.9, 'pencil'],
      ['spine', 'draw', 4.0, 1.1, 'sketch'], ['long', 'write', 4.6, 0.6, null]],
    signs: [['sf', 'write', 0.05, 0.75, 'pencil'], ['title', 'write', 0.6, 1.5, 'pencil'], ['c4', 'draw', 1.9, 0.4, 'scribble'],
      ...SIGNROW(0, 2.0), ...SIGNROW(1, 4.4), ...SIGNROW(2, 6.8), ...SIGNROW(3, 9.2)],
    what: [['title', 'write', 0.1, 1.0, 'pencil'], ['ul', 'draw', 1.05, 0.35, 'scribble'], ['spine', 'draw', 1.1, 1.4, 'sketch'],
      ['lv', 'write', 2.2, 0.45, null], ['ld', 'write', 2.45, 0.4, null], ['lc', 'write', 2.7, 0.55, null],
      ['bulge', 'move', 2.6, 0.6, 'bend'], ['lb', 'write', 3.05, 0.6, 'marker'],
      ['def', 'write', 3.6, 2.0, 'pencil'], ['hlp', 'marker', 5.4, 0.45, 'swipe'],
      ['note', 'move', 5.65, 0.5, 'slap'], ['nt', 'write', 5.95, 0.45, 'pencil'], ['breeds', 'write', 6.3, 1.4, 'pencil'], ['any', 'write', 7.7, 0.75, 'pencil']],
    rest: [['title', 'write', 0.1, 1.35, 'pencil'], ['ul', 'draw', 1.4, 0.35, 'scribble'],
      ['n1', 'draw', 1.5, 0.3, 'knock'], ['line', 'write', 1.6, 1.2, 'pencil'], ['cal', 'draw', 1.9, 0.9, 'sketch'], ['x', 'draw', 2.8, 1.6, 'scribble']],
    helps: [...HELPROW(0, 0.15), ...HELPROW(1, 1.45), ...HELPROW(2, 2.75), ...HELPROW(3, 4.05)],
    bundle: [['title', 'write', 0.1, 0.9, 'pencil'], ['hl', 'marker', 0.85, 0.4, 'swipe'],
      ['brace', 'draw', 1.0, 0.9, 'sketch'], ['lab0', 'write', 1.4, 0.65, null], ['plus', 'draw', 1.65, 0.25, 'scribble'],
      ['bottle', 'draw', 1.8, 0.8, 'sketch'], ['lab1', 'write', 2.2, 0.65, null],
      ['b0', 'write', 2.95, 0.6, 'pencil'], ['k0', 'draw', 3.45, 0.2, 'check'], ['b1', 'write', 3.6, 0.6, 'pencil'], ['k1', 'draw', 4.1, 0.2, 'check'],
      ['b2', 'write', 4.25, 0.55, 'pencil'], ['k2', 'draw', 4.7, 0.2, 'check'],
      ['tag', 'draw', 4.9, 0.45, 'sketch'], ['price', 'write', 5.15, 0.55, 'ding'], ['was', 'write', 5.75, 0.45, 'pencil'], ['strike', 'draw', 6.15, 0.3, 'scribble'],
      ['stamp', 'stamp', 6.5, 0.3, 'stamp']],
    ramp: [['title', 'write', 0.1, 1.1, 'pencil'], ['art', 'draw', 0.45, 1.1, 'sketch'], ['arrow', 'draw', 1.45, 0.3, 'scribble'], ['note', 'write', 1.6, 0.6, null],
      ['tag', 'draw', 1.9, 0.4, 'sketch'], ['price', 'write', 2.1, 0.45, 'ding'],
      ['b0', 'write', 2.6, 0.5, 'pencil'], ['k0', 'draw', 3.0, 0.2, 'check'], ['b1', 'write', 3.1, 0.5, 'pencil'], ['k1', 'draw', 3.5, 0.2, 'check']],
    harness: [['title', 'write', 0.1, 1.0, 'pencil'], ['art', 'draw', 0.45, 1.0, 'sketch'], ['lift', 'move', 1.5, 0.5, 'bend'], ['arrow', 'draw', 1.45, 0.3, 'scribble'], ['note', 'write', 1.6, 0.6, null],
      ['tag', 'draw', 1.9, 0.4, 'sketch'], ['price', 'write', 2.1, 0.45, 'ding'],
      ['b0', 'write', 2.6, 0.5, 'pencil'], ['k0', 'draw', 3.0, 0.2, 'check'], ['b1', 'write', 3.1, 0.5, 'pencil'], ['k1', 'draw', 3.5, 0.2, 'check']],
    wheel: [['title', 'write', 0.05, 0.95, 'pencil'], ['art', 'draw', 0.35, 1.0, 'sketch'], ['name', 'write', 0.95, 0.55, 'pencil'],
      ['tag', 'draw', 1.35, 0.35, null], ['price', 'write', 1.5, 0.45, 'ding'], ['stars', 'draw', 2.0, 0.45, 'star'], ['rate', 'write', 2.1, 0.5, 'pencil']],
    proof: [['stars', 'draw', 0.1, 0.9, 'star'], ['rating', 'write', 0.2, 0.6, 'pencil'], ['sub', 'write', 0.8, 0.75, 'pencil'],
      ['card0', 'move', 1.6, 0.4, 'slap'], ['q0', 'write', 1.9, 2.6, 'pencil'], ['who0', 'write', 4.5, 0.4, null], ['st0', 'draw', 4.6, 0.4, 'star'],
      ['card1', 'move', 5.4, 0.4, 'slap'], ['q1', 'write', 5.7, 2.4, 'pencil'], ['who1', 'write', 8.1, 0.4, null], ['st1', 'draw', 8.2, 0.4, 'star']],
    offer: [['h', 'write', 0.05, 0.9, 'pencil'], ['hl', 'marker', 0.85, 0.35, 'swipe'],
      ['coupon', 'draw', 0.9, 0.55, 'sketch'], ['cut', 'move', 1.0, 0.8, 'tear'], ['code', 'stamp', 1.55, 0.3, 'stamp'], ['codelab', 'write', 1.75, 0.35, null],
      ['d0', 'write', 2.15, 0.6, 'pencil'], ['dk0', 'draw', 2.65, 0.2, 'check'], ['d1', 'write', 2.8, 0.5, 'pencil'], ['dk1', 'draw', 3.2, 0.2, 'check'],
      ['btn', 'marker', 3.45, 0.4, 'swipe'], ['cta', 'write', 3.6, 0.75, 'pencil'], ['arrowR', 'draw', 4.3, 0.25, 'scribble'],
      ['url', 'write', 4.5, 0.45, 'pencil'], ['mark', 'marker', 4.75, 0.35, null], ['name', 'write', 4.85, 0.3, null],
      ['press', 'press', 5.0, 0.3, 'press'], ['resolve', 'move', 5.0, 0.3, 'resolve']],
  };
  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, END, DUR: r4(END * B), PAGES: {}, ORDER: [], EV: {} };
  const CUES = [];
  PAGES.forEach(([id, beat, turn], i) => {
    const t0 = r4(beat * B);
    TL.PAGES[id] = { t0, beat, turn, i };
    TL.ORDER.push(id);
    if (turn === 'lift') CUES.push([r4(t0 - 0.06), 'turn', 0.45]);
    TL.EV[id] = {};
    for (const [key, kind, b, d, sound] of EV[id]) {
      const t = r4(t0 + b * B), dur = r4(d * B);
      TL.EV[id][key] = { t, d: dur, kind };
      if (sound) CUES.push([Math.max(0, t), sound, dur]);
    }
  });
  CUES.sort((a, b) => a[0] - b[0]);
  root.TL = TL;
  root.CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
