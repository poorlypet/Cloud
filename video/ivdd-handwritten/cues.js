/* Timeline and sound cues on the 90 BPM grid (beat = 0.6667 s). This one file drives both the
   film (index.html reads window.TL) and the score (audio/score.py evaluates it with node and
   reads window.CUES), so every pencil scratch, page turn and chime lands on its frame.

   PAGES   [id, start beat, how the page arrives]
   EV      per page: [key, kind, start beat (from page start), length in beats, sound or null]
           kind is what the film does (write, marker, draw, move, pop, press); sound is the cue.
*/
(function (root) {
  const BPM = 90, B = 60 / BPM, END = 50;
  const PAGES = [
    ['intro', 0, null], ['s1', 7, 'wipe'], ['s2', 12, 'lift'], ['s3', 17, 'lift'], ['s4', 22, 'lift'],
    ['s5', 27, 'lift'], ['help', 33, 'wipe'], ['kit', 37, 'lift'], ['end', 46, 'lift'],
  ];
  const SIGN = [['num', 'write', 0.25, 0.3, 'knock'], ['blob', 'marker', 0.3, 0.45, null], ['title', 'write', 0.5, 1.0, 'pencil'], ['line', 'write', 1.75, 1.0, 'pencil']];
  const row = (i, b) => [[`d${i}`, 'draw', b, 0.9, 'sketch'], [`n${i}`, 'write', b + 0.25, 0.8, 'chime'], [`b${i}`, 'write', b + 1.0, 1.0, 'pencil']];
  const EV = {
    intro: [['title', 'write', 0, 0.75, 'marker'], ['hl', 'marker', 0.75, 0.5, 'swipe'], ['sub', 'write', 1.25, 0.75, 'pencil'],
      ['spine', 'draw', 1.75, 1.25, 'sketch'], ['p1', 'write', 2.25, 0.75, 'pencil'], ['p2', 'write', 3.0, 1.0, 'pencil'], ['bulge', 'move', 3.5, 0.6, 'bend']],
    s1: [...SIGN, ['spine', 'draw', 2.5, 0.75, 'sketch'], ['arch', 'move', 3.25, 0.6, 'bend'], ['arrow', 'draw', 3.75, 0.4, 'scribble']],
    s2: [...SIGN, ['burst', 'draw', 2.5, 0.5, 'sketch'], ['yelp', 'pop', 3.0, 0.4, 'yelp'], ['lines', 'draw', 3.25, 0.3, 'scribble'], ['lift', 'draw', 3.5, 0.5, 'sketch']],
    s3: [...SIGN, ['stairs', 'draw', 2.5, 0.75, 'sketch'], ['arc', 'draw', 3.25, 0.5, 'sketch'], ['cross', 'draw', 3.75, 0.35, 'scribble']],
    s4: [...SIGN, ['lines', 'draw', 2.5, 0.9, 'sketch'], ['wobble', 'move', 3.25, 0.5, 'wobble'], ['marks', 'draw', 3.5, 0.4, 'scribble']],
    s5: [['num', 'write', 0.25, 0.3, 'knock'], ['blob', 'marker', 0.3, 0.45, null], ['title', 'write', 0.5, 1.0, 'pencil'],
      ['box', 'marker', 1.5, 0.5, 'swipe'], ['q', 'write', 1.9, 0.9, 'pencil'], ['vet', 'write', 2.9, 0.9, 'pencil'], ['ul', 'draw', 3.8, 0.3, 'scribble'], ['alert', 'draw', 4.0, 0.6, 'sketch'], ['bump', 'press', 4.6, 0.3, 'knock']],
    help: [['title', 'write', 0.2, 0.7, 'pencil'], ['hl', 'marker', 0.9, 0.4, 'swipe'], ['line', 'write', 1.1, 0.9, 'pencil'],
      ['cal', 'draw', 1.5, 0.7, 'sketch'], ['ticks', 'draw', 2.2, 1.2, 'scribble']],
    kit: [['title', 'write', 0.2, 0.7, 'pencil'], ['ul', 'marker', 0.9, 0.4, 'swipe'], ...row(0, 1.25), ...row(1, 3.0), ...row(2, 4.75)],
    end: [['mark', 'marker', 0.05, 0.4, 'resolve'], ['edge', 'draw', 0.2, 0.45, null], ['plus', 'draw', 0.45, 0.35, 'swipe'], ['name', 'write', 0.6, 0.55, 'pencil'],
      ['btn', 'marker', 1.0, 0.4, 'swipe'], ['cta', 'write', 1.15, 0.55, 'pencil'], ['arrowR', 'draw', 1.7, 0.25, 'scribble'], ['url', 'write', 1.8, 0.45, 'pencil'],
      ['small', 'write', 2.1, 0.5, 'pencil'], ['press', 'press', 2.75, 0.3, 'tick']],
  };
  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, DUR: r4(END * B), PAGES: {}, ORDER: [], EV: {} };
  const CUES = [];
  PAGES.forEach(([id, beat, turn], i) => {
    const t0 = r4(beat * B);
    TL.PAGES[id] = { t0, turn, i };
    TL.ORDER.push(id);
    if (turn === 'wipe') CUES.push([r4(t0 - 0.75 * B), 'wipe', r4(1.5 * B)]);
    if (turn === 'lift') CUES.push([t0, 'turn', 0.4]);
    TL.EV[id] = {};
    for (const [key, kind, b, d, sound] of EV[id]) {
      const t = r4(t0 + b * B), dur = r4(d * B);
      TL.EV[id][key] = { t, d: dur, kind };
      if (sound) CUES.push([t, sound, dur]);
    }
  });
  CUES.sort((a, b) => a[0] - b[0]);
  root.TL = TL;
  root.CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
