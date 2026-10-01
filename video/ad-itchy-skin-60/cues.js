/* Timeline and sound cues on the 104 BPM grid (1 beat = 0.5769 s, 104 beats = 60 s).
   This one file drives both the film (index.html reads window.TL) and the score
   (audio/score.py evaluates it with node and reads window.CUES), so every marker squeak,
   sticky-note thwap, eraser rub and price ding lands on its frame.

   PAGES  [id, start beat, how the board arrives]   'wipe' = felt eraser clears the old board,
                                                    'slide' = a new board slides in from the right
   EV     per board: [key, kind, beat from board start, length in beats, sound or null]
          kind is what the film does: write (marker text), draw (marker strokes), slap (a sticky
          note lands; its time is the moment of impact), hl (highlighter swipe), pop, tear, press.
*/
(function (root) {
  const BPM = 104, B = 60 / BPM, END = 104;
  const PAGES = [
    ['hook', 0, null], ['relate', 7, 'wipe'], ['cause', 19, 'slide'], ['cycle', 28, 'wipe'],
    ['helps', 36, 'slide'], ['bundle', 48, 'wipe'], ['singles', 61, 'slide'], ['proof', 73, 'wipe'], ['offer', 88, 'slide'],
  ];
  const WIPE_LEAD = 1.2, SLIDE_LEAD = 0.6; // beats before a board's start that its transition begins
  const note = (i, L) => [[`n${i}`, 'slap', L, 0.3, 'thwap'], [`b${i}`, 'draw', L + 0.15, 0.25, 'squeak'],
    [`x${i}`, 'write', L + 0.35, 0.8, 'marker'], [`k${i}`, 'draw', L + 1.25, 0.3, 'tick']];
  const comp = (i, r) => [[`d${i}`, 'draw', r, 0.7, 'stroke'], [`n${i}`, 'write', r + 0.3, 0.5, 'marker'], [`b${i}`, 'write', r + 0.8, 0.8, 'marker']];
  const single = (i, r) => [[`t${i}`, 'slap', r, 0.3, 'thwap'], [`d${i}`, 'draw', r + 0.15, 0.7, 'stroke'], [`n${i}`, 'write', r + 0.35, 0.6, 'marker'],
    [`p${i}`, 'write', r + 0.95, 0.35, 'marker'], [`g${i}`, 'pop', r + 1.3, 0.2, 'ding'], [`b${i}`, 'write', r + 1.35, 0.6, 'marker']];
  const EV = {
    hook: [['l1', 'write', -0.12, 0.75, 'marker'], ['l2', 'write', 0.7, 0.9, 'marker'], ['l3', 'write', 1.7, 1.0, 'marker'],
      ['u1', 'draw', 2.8, 0.3, 'squeak'], ['u2', 'draw', 3.2, 0.3, 'squeak'], ['u3', 'draw', 3.6, 0.3, 'squeak'],
      ['moon', 'draw', 2.9, 0.9, 'stroke'], ['scr', 'write', 3.9, 0.9, 'marker']],
    relate: [['title', 'write', 0.15, 1.1, 'marker'], ['hl', 'hl', 1.3, 0.45, 'hl'], ...note(0, 1.7), ...note(1, 3.3), ...note(2, 4.9), ...note(3, 6.5)],
    cause: [['t1', 'write', 0.1, 0.75, 'marker'], ['t2', 'write', 0.85, 0.6, 'marker'], ['line', 'write', 1.6, 1.6, 'marker'], ['hl', 'hl', 3.25, 0.4, 'hl'],
      ['arrow', 'draw', 3.6, 0.35, 'squeak'], ['s0', 'slap', 4.0, 0.3, 'thwap'], ['s1', 'slap', 4.45, 0.3, 'thwap'], ['s2', 'slap', 4.9, 0.3, 'thwap'], ['s3', 'slap', 5.35, 0.3, 'thwap']],
    cycle: [['title', 'write', 0.15, 1.0, 'marker'], ['loop', 'draw', 1.2, 1.5, 'stroke'], ['a', 'write', 1.5, 0.6, 'marker'], ['b', 'write', 2.1, 0.5, 'marker'],
      ['c', 'write', 2.6, 0.6, 'marker'], ['heads', 'draw', 3.1, 0.4, 'squeak'], ['spin', 'spin', 3.4, 0.5, null], ['rep', 'write', 3.5, 0.6, 'marker'], ['note', 'slap', 4.5, 0.3, 'thwap']],
    helps: [['title', 'write', 0.1, 0.8, 'marker'], ['ul', 'draw', 0.9, 0.35, 'squeak'], ['in', 'slap', 1.35, 0.3, 'thwap'], ['inx', 'write', 1.65, 0.9, 'marker'],
      ['out', 'slap', 2.75, 0.3, 'thwap'], ['outx', 'write', 3.05, 0.9, 'marker'], ['br', 'draw', 4.1, 0.45, 'stroke'], ['flea', 'write', 4.5, 1.0, 'marker'],
      ['settle', 'write', 5.75, 1.4, 'marker'], ['hl', 'hl', 7.25, 0.4, 'hl']],
    bundle: [['title', 'write', 0.15, 1.1, 'marker'], ['price', 'write', 1.35, 0.6, 'marker'], ['ding', 'pop', 1.95, 0.2, 'ding'], ['was', 'write', 2.2, 0.45, 'marker'],
      ['strike', 'draw', 2.7, 0.3, 'squeak'], ['save', 'slap', 3.1, 0.3, 'thwap'], ...comp(0, 3.8), ...comp(1, 5.3), ...comp(2, 6.8)],
    singles: [['title', 'write', 0.1, 1.1, 'marker'], ...single(0, 1.3), ...single(1, 3.5), ...single(2, 5.7)],
    proof: [['score', 'write', 0.15, 0.8, 'marker'], ['s0', 'pop', 1.0, 0.3, 'pop'], ['s1', 'pop', 1.3, 0.3, 'pop'], ['s2', 'pop', 1.6, 0.3, 'pop'],
      ['s3', 'pop', 1.9, 0.3, 'pop'], ['s4', 'pop', 2.2, 0.3, 'pop'], ['from', 'write', 2.6, 1.0, 'marker'], ['note', 'slap', 3.8, 0.3, 'thwap'],
      ['q', 'write', 4.1, 4.5, 'marker'], ['who', 'write', 8.7, 0.6, 'marker']],
    offer: [['coupon', 'slap', 0.25, 0.3, 'thwap'], ['off', 'write', 0.55, 0.9, 'marker'], ['code', 'write', 1.5, 0.9, 'marker'], ['tear', 'tear', 2.6, 0.4, 'tear'],
      ['p0', 'slap', 3.3, 0.3, 'thwap'], ['p1', 'slap', 4.0, 0.3, 'thwap'], ['p2', 'slap', 4.7, 0.3, 'thwap'],
      ['btn', 'draw', 6.6, 0.6, 'stroke'], ['cta', 'write', 7.1, 0.9, 'marker'], ['arrow', 'draw', 8.0, 0.3, 'squeak'], ['url', 'write', 8.6, 0.9, 'marker'],
      ['mark', 'pop', 9.6, 0.3, 'pop'], ['press', 'press', 12.0, 0.3, 'press']],
  };
  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, DUR: r4(END * B), PAGES: {}, ORDER: [], EV: {}, WIPE_LEAD, SLIDE_LEAD };
  const CUES = [];
  PAGES.forEach(([id, beat, turn], i) => {
    const t0 = r4(beat * B);
    TL.PAGES[id] = { t0, beat, turn, i };
    TL.ORDER.push(id);
    if (turn === 'wipe') CUES.push([r4(t0 - WIPE_LEAD * B), 'wipe', r4(1.4)]);
    if (turn === 'slide') CUES.push([r4(t0 - SLIDE_LEAD * B), 'slide', 0.5]);
    TL.EV[id] = {};
    for (const [key, kind, b, d, sound] of EV[id]) {
      const t = r4(t0 + b * B), dur = r4(d * B);
      TL.EV[id][key] = { t, d: dur, kind };
      if (sound) CUES.push([t, sound, dur]);
    }
  });
  CUES.push([r4(100 * B), 'resolve', 2.0]);
  CUES.sort((a, b) => a[0] - b[0]);
  root.TL = TL;
  root.CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
