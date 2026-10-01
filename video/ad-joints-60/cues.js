/* Timeline and sound cues on the 84 BPM grid (beat = 0.7143 s, 84 beats = 60.0 s).
   This one file drives both the film (index.html reads window.TL) and the score
   (audio/score.py evaluates it with node and reads window.CUES), so every pen scratch,
   tape tear, card press and stamp thunk lands on its frame.

   PAGES  [id, start beat]. Every page after the first slides in like a turned scrapbook spread.
   EV     per page: [key, kind, start beat (from page start), length in beats, sound or null]
          kinds: write (handwriting), draw (pen doodle), card (slides in, pressed down, taped),
          stamp (rubber stamp thunk), tag (price tag swings in on its string), marker (highlight),
          peel (cards are un-taped and slide off), pop, press (the CTA button is pressed).
          A 'card' sound expands to a press (landing) and a tape tear.
*/
(function (root) {
  const BPM = 84, B = 60 / BPM, END = 84;
  const PAGES = [
    ['hook', 0], ['relate', 7], ['good', 18], ['routine', 24], ['bundle', 34],
    ['nourish', 43], ['warmth', 53], ['proof', 61], ['offer', 71],
  ];
  const sign = (i, b) => [[`c${i}`, 'card', b, 0.6, 'card'], [`d${i}`, 'draw', b + 0.45, 0.8, 'scratch'],
    [`s${i}`, 'write', b + 0.55, 0.75, 'pen'], [`k${i}`, 'draw', b + 1.3, 0.35, 'tick']];
  const step = (i, b) => [[`r${i}`, 'card', b, 0.6, 'tape'], [`n${i}`, 'stamp', b + 0.6, 0.3, 'stamp'],
    [`d${i}`, 'draw', b + 0.45, 0.9, 'scratch'], [`w${i}`, 'write', b + 0.5, 0.8, 'pen'], [`s${i}`, 'write', b + 1.25, 0.85, 'pen']];
  const duo = (x, b) => [[`p${x}`, 'card', b, 0.6, 'card'], [`d${x}`, 'draw', b + 0.4, 0.8, 'scratch'], [`n${x}`, 'write', b + 0.7, 0.6, 'pen'],
    [`t${x}`, 'tag', b + 1.3, 1.2, 'ding'], [`b${x}`, 'write', b + 1.6, 1.0, 'pen']];
  const EV = {
    hook: [['t1', 'write', -0.5, 1.55, 'pen'], ['t2', 'write', 1.25, 1.35, 'pen'], ['jc', 'card', 2.3, 0.6, 'card'],
      ['joint', 'draw', 2.75, 1.1, 'scratch'], ['st', 'card', 2.75, 0.6, 'tape'], ['t3', 'write', 3.15, 1.5, 'pen'], ['creak', 'draw', 3.9, 0.5, 'tick']],
    relate: [['h', 'write', 0.25, 1.0, 'pen'], ...sign(0, 1.05), ...sign(1, 2.85), ...sign(2, 4.65), ...sign(3, 6.45), ['peel', 'peel', 10.0, 0.9, 'peel']],
    good: [['gs', 'card', 0.25, 0.6, 'tape'], ['gh', 'write', 0.45, 0.9, 'pen'], ['gc', 'card', 0.85, 0.6, 'card'], ['gb', 'write', 1.25, 2.1, 'pen'],
      ['hl', 'marker', 2.75, 0.55, 'marker'], ['house', 'draw', 3.0, 0.9, 'scratch']],
    routine: [['h', 'write', 0.2, 1.0, 'pen'], ...step(0, 1.0), ...step(1, 3.35), ...step(2, 5.7)],
    bundle: [['h', 'write', 0.2, 1.0, 'pen'], ['pol', 'card', 0.55, 0.6, 'card'],
      ['d0', 'draw', 1.1, 0.65, 'scratch'], ['l0', 'write', 1.35, 0.45, 'pen'], ['d1', 'draw', 1.7, 0.65, 'scratch'], ['l1', 'write', 1.95, 0.45, 'pen'],
      ['d2', 'draw', 2.3, 0.65, 'scratch'], ['l2', 'write', 2.55, 0.45, 'pen'], ['cap', 'write', 3.05, 1.3, 'pen'],
      ['tag', 'tag', 4.0, 1.2, 'ding'], ['save', 'stamp', 4.8, 0.3, 'stamp'], ['rate', 'stamp', 5.45, 0.3, 'stamp'], ['peel', 'peel', 8.1, 0.8, 'peel']],
    nourish: [['h', 'write', 0.2, 1.0, 'pen'], ...duo('A', 0.6), ['sA', 'stamp', 3.0, 0.3, 'stamp'], ...duo('B', 3.2), ['sB', 'stamp', 5.6, 0.3, 'stamp'],
      ['sub', 'card', 6.15, 0.6, 'tape'], ['subw', 'write', 6.45, 1.2, 'pen']],
    warmth: [['h', 'write', 0.2, 1.0, 'pen'], ...duo('A', 0.5), ['sA', 'stamp', 1.15, 0.3, 'stamp'], ...duo('B', 2.4), ['sB', 'stamp', 3.05, 0.3, 'stamp']],
    proof: [['big', 'write', 0.2, 0.75, 'pen'], ['stars', 'draw', 0.8, 1.0, 'stars'], ['sub', 'write', 1.35, 1.0, 'pen'],
      ['r1', 'card', 2.2, 0.6, 'card'], ['q1', 'write', 2.6, 2.2, 'pen'], ['a1', 'write', 4.85, 0.55, 'pen'],
      ['r2', 'card', 5.3, 0.6, 'card'], ['q2', 'write', 5.7, 1.4, 'pen'], ['a2', 'write', 7.15, 0.5, 'pen']],
    offer: [['h1', 'write', 0.2, 0.7, 'pen'], ['h2', 'write', 0.85, 0.85, 'pen'], ['cp', 'card', 1.4, 0.6, 'card'], ['cw', 'write', 1.85, 0.4, 'pen'],
      ['code', 'stamp', 2.35, 0.3, 'stamp'], ['f1', 'card', 3.0, 0.6, 'tape'], ['van', 'draw', 3.3, 0.6, 'scratch'], ['f1w', 'write', 3.35, 0.85, 'pen'],
      ['f2', 'card', 4.0, 0.6, 'tape'], ['shield', 'draw', 4.3, 0.6, 'scratch'], ['f2w', 'write', 4.35, 0.75, 'pen'],
      ['btn', 'draw', 5.1, 0.6, 'scratch'], ['bt', 'write', 5.45, 0.9, 'pen'], ['url', 'write', 6.25, 0.7, 'pen'],
      ['logo', 'pop', 6.95, 0.4, 'pop'], ['name', 'write', 7.1, 0.5, 'pen'], ['press', 'press', 8.0, 0.4, 'click']],
  };
  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, DUR: r4(END * B), PAGES: {}, ORDER: [], EV: {} };
  const CUES = [];
  PAGES.forEach(([id, beat], i) => {
    const t0 = r4(beat * B);
    TL.PAGES[id] = { t0, i };
    TL.ORDER.push(id);
    if (i > 0) CUES.push([r4(t0 - 0.04), 'slide', 0.6]);
    TL.EV[id] = {};
    for (const [key, kind, b, d, sound] of EV[id]) {
      const t = r4(t0 + b * B), dur = r4(d * B);
      TL.EV[id][key] = { t, d: dur, kind };
      if (!sound) continue;
      if (sound === 'card') { CUES.push([r4(t + 0.22), 'press', 0.2]); CUES.push([r4(t + 0.34), 'tear', 0.25]); }
      else if (sound === 'tape') CUES.push([r4(t + 0.3), 'tear', 0.25]);
      else CUES.push([Math.max(0, t), sound, dur]);
    }
  });
  CUES.sort((a, b) => a[0] - b[0]);
  root.TL = TL;
  root.CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
