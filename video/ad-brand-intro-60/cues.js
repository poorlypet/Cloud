/* Timeline and sound cues on the 96 BPM grid (beat = 0.625 s, 96 beats = 60 s). This one file
   drives both the film (index.html reads window.TL) and the score (audio/score.py evaluates it
   with node and reads window.CUES), so every chalk scratch, tap, eraser pass and ding lands on
   its frame.

   BOARDS  [id, wx, start beat, arrival]
           wx is the board's slot along one long chalkboard (x = wx * 1080 px).
           'pan'   the camera slides along the board to the next slot, starting at the start beat.
           'erase' the board eraser smears the old writing (5 passes, from 1.25 beats before the
                   start beat), the chalk haze clears, then the new board is written in place.
   EV      per board: [key, kind, start beat (from board start), length in beats, sound or null]
*/
(function (root) {
  const BPM = 96, B = 60 / BPM, END = 96;
  const ERASE_LEAD = 1.25;                 // beats between the eraser's first pass and the new board
  const PASS = 5, PASS_GAP = 0.115, PASS_D = 0.2, CLEAR_AT = 0.62, CLEAR_D = 0.38; // seconds
  const BOARDS = [
    ['hook', 0, 0, 'start'],
    ['relate', 1, 6.5, 'pan'],
    ['map', 1, 15.5, 'erase'],
    ['match', 2, 24, 'pan'],
    ['route2', 2, 34.5, 'erase'],
    ['bundles', 3, 42.5, 'pan'],
    ['whyA', 3, 54.25, 'erase'],
    ['whyB', 4, 60.0, 'pan'],
    ['proof', 4, 68.0, 'erase'],
    ['offer', 5, 77.5, 'pan'],
    ['end', 5, 85.25, 'erase'],
  ];
  const seq = (pre, n, b0, step, d, sound, kind = 'write') => Array.from({ length: n }, (_, i) => [`${pre}${i}`, kind, b0 + i * step, d, sound]);
  const EV = {
    hook: [['h1', 'write', -0.35, 3.1, 'chalk'], ['qs', 'draw', 1.0, 2.2, null], ['alone', 'write', 3.2, 1.2, 'chalk'], ['ul', 'draw', 4.45, 0.45, 'draw']],
    relate: [['head', 'write', 0.3, 0.8, 'chalk'],
      ['bar0', 'draw', 0.75, 0.35, 'draw'], ['q0', 'write', 0.95, 0.55, 'chalk'],
      ['bar1', 'draw', 1.45, 0.35, 'draw'], ['q1', 'write', 1.6, 0.55, 'chalk'],
      ['bar2', 'draw', 2.1, 0.35, 'draw'], ['q2', 'write', 2.25, 0.75, 'chalk'],
      ...seq('g', 6, 2.0, 0.32, 0.42, null), ['scrawl', 'none', 2.0, 2.0, 'scrawl'],
      ['x0', 'draw', 3.35, 0.28, 'strike'], ['x1', 'draw', 3.65, 0.28, 'strike'], ['x2', 'draw', 3.95, 0.3, 'strike'], ['xg', 'draw', 4.3, 0.45, 'strike'],
      ['easy', 'write', 4.8, 1.0, 'chalk'], ['eul', 'draw', 5.8, 0.4, 'draw']],
    map: [['head', 'write', 0.1, 0.8, 'chalk'], ['sub', 'write', 0.9, 1.15, 'chalk'],
      ['circ', 'draw', 2.0, 0.55, 'draw'], ['ctr', 'write', 2.3, 0.6, 'chalk'],
      ...seq('l', 8, 2.9, 0.4, 0.22, null, 'draw'), ...seq('n', 8, 3.0, 0.4, 0.34, 'tap'),
      ['sel', 'draw', 6.4, 0.45, 'draw'], ['pick', 'press', 6.85, 0.3, 'tap'], ['arrow', 'draw', 7.05, 0.75, 'draw']],
    match: [['chipbox', 'draw', 0.15, 0.4, null], ['chip', 'write', 0.3, 0.5, 'chalk'],
      ['sym', 'write', 0.8, 1.3, 'chalk'], ['match', 'write', 2.1, 1.0, 'chalk'],
      ...[0, 1, 2].flatMap(i => { const b = 3.15 + i * 1.15; return [[`d${i}`, 'draw', b, 0.75, 'draw'], [`nm${i}`, 'write', b + 0.15, 0.55, 'chalk'], [`pr${i}`, 'write', b + 0.7, 0.3, 'ding'], [`bn${i}`, 'write', b + 0.95, 0.45, 'chalk']]; })],
    route2: [['head', 'write', 0.1, 0.8, 'chalk'], ['sub', 'write', 0.9, 0.7, 'chalk'],
      ...seq('c', 8, 1.65, 0.3, 0.27, 'tap'), ...seq('dot', 8, 1.6, 0.3, 0.1, null, 'draw'), ['more', 'write', 4.1, 0.35, 'chalk'],
      ['n25', 'write', 4.45, 0.4, 'chalk'], ['ring', 'draw', 4.8, 0.45, 'draw'], ['cond', 'write', 4.85, 0.5, 'chalk'], ['areas', 'write', 5.3, 0.5, 'chalk']],
    bundles: [['head', 'write', 0.15, 0.8, 'chalk'], ['sub', 'write', 0.95, 1.0, 'chalk'],
      ...[0, 1].flatMap(i => { const b = 2.0 + i * 2.55; return [[`box${i}`, 'draw', b, 0.4, 'draw'], [`art${i}`, 'draw', b + 0.2, 0.9, null], [`nm${i}`, 'write', b + 0.3, 0.55, 'chalk'],
        [`ct${i}`, 'write', b + 0.85, 0.5, 'chalk'], [`pr${i}`, 'write', b + 1.35, 0.3, 'ding'], [`was${i}`, 'write', b + 1.65, 0.25, 'chalk'], [`st${i}`, 'draw', b + 1.9, 0.18, 'strike'], [`save${i}`, 'press', b + 2.1, 0.3, 'stamp']]; }),
      ['less', 'write', 7.3, 0.95, 'chalk']],
    whyA: [['head', 'write', 0.1, 1.25, 'chalk'], ['ul', 'draw', 1.35, 0.3, 'draw'], ['trusted', 'write', 1.65, 0.45, 'chalk'],
      ...seq('b', 5, 2.1, 0.3, 0.27, 'tap'), ...seq('tk', 5, 2.05, 0.3, 0.12, null, 'draw')],
    whyB: [['head', 'write', 0.3, 0.7, 'chalk'], ['pct', 'write', 1.0, 0.5, 'chalk'], ['cyc', 'draw', 1.5, 0.4, 'draw'],
      ['skip', 'write', 1.9, 0.7, 'chalk'], ['div', 'draw', 2.65, 0.25, null], ['box', 'draw', 2.75, 0.6, 'draw'],
      ['fast', 'write', 2.9, 0.5, 'chalk'], ['many', 'write', 3.4, 0.7, 'chalk']],
    proof: [['rating', 'write', 0.15, 0.6, 'chalk'], ...seq('s', 5, 0.75, 0.22, 0.25, 'tap', 'draw'), ['fill', 'draw', 1.95, 0.5, null],
      ['from', 'write', 2.05, 0.7, 'chalk'], ['qm', 'write', 2.75, 0.2, null], ['q1', 'write', 2.8, 2.3, 'chalk'], ['john', 'write', 5.15, 0.3, 'chalk'],
      ['q2', 'write', 5.65, 1.0, 'chalk'], ['gee', 'write', 6.7, 0.25, 'chalk']],
    offer: [['pct', 'write', 0.35, 0.55, 'chalk'], ['ding', 'none', 0.9, 0.3, 'ding'], ['first', 'write', 0.9, 0.6, 'chalk'],
      ['ticket', 'draw', 1.5, 0.5, 'draw'], ['use', 'write', 1.8, 0.3, 'chalk'], ['code', 'write', 2.05, 0.55, 'chalk'], ['stamp', 'press', 2.65, 0.3, 'stamp'],
      ['tk0', 'draw', 2.95, 0.15, null], ['free', 'write', 3.05, 0.7, 'tap'], ['tk1', 'draw', 3.8, 0.15, null], ['guar', 'write', 3.9, 0.55, 'tap']],
    end: [['edge', 'draw', 0.15, 0.75, 'draw'], ['fill', 'draw', 0.85, 0.9, 'fill'], ['plus', 'draw', 1.75, 0.45, 'draw'],
      ['name', 'write', 2.05, 0.7, 'chalk'], ['tag', 'write', 2.8, 0.9, 'chalk'],
      ['btn', 'draw', 3.75, 0.5, 'draw'], ['cta', 'write', 3.95, 0.45, 'chalk'], ['arrowR', 'draw', 4.4, 0.25, null], ['url', 'write', 4.6, 0.55, 'chalk'],
      ['off1', 'write', 5.2, 0.55, 'chalk'], ['off2', 'write', 5.7, 0.6, 'chalk'], ['press', 'press', 6.75, 0.3, 'press']],
  };

  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, DUR: r4(END * B), ERASE: { lead: r4(ERASE_LEAD * B), PASS, PASS_GAP, PASS_D, CLEAR_AT, CLEAR_D }, BOARDS: {}, ORDER: [], EV: {} };
  const CUES = [];
  BOARDS.forEach(([id, wx, beat, arrive]) => {
    const t0 = r4(beat * B);
    TL.BOARDS[id] = { t0, wx, arrive };
    TL.ORDER.push(id);
    if (arrive === 'pan') CUES.push([t0, 'slide', 0.7]);
    if (arrive === 'erase') {
      const e0 = r4(t0 - ERASE_LEAD * B);
      TL.BOARDS[id].e0 = e0;
      for (let i = 0; i < PASS; i++) CUES.push([r4(e0 + i * PASS_GAP), 'erase', PASS_D]);
    }
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
