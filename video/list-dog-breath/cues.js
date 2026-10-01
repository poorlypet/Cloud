/* Timeline and sound cues on the 116 BPM grid (beat = 0.5172 s). This one file drives both the
   film (index.html reads window.TL) and the score (audio/score.py evaluates it with node and reads
   window.CUES), so every chalk scratch, tap, slam, eraser swish and ding lands on its frame.

   The bar starts on beat 2 (beats 0-1 are a pickup under the title), so the downbeats are beats
   2, 6, 10, 14 ... and every item lands on one: 6, 14, 22, 30, 38, then the payoff on 46.

   BOARDS  [id, start beat]. Every board after the hook arrives by eraser: four fast sweeps smear
           the old chalk (starting ERASE_LEAD beats before the start), the haze clears, and the
           new numeral slams on the downbeat.
   EV      per board: [key, kind, start beat (from the board start), length in beats, sound or null]
*/
(function (root) {
  const BPM = 116, B = 60 / BPM, END = 58.5;
  const ERASE_LEAD = 0.8;                                    // beats
  const PASS = 4, PASS_GAP = 0.07, PASS_D = 0.16, CLEAR_AT = 0.36, CLEAR_D = 0.26; // seconds
  const BOARDS = [['hook', 0], ['i1', 6], ['i2', 14], ['i3', 22], ['i4', 30], ['i5', 38], ['pay', 46]];
  const item = () => [
    ['num', 'slam', 0, 0.3, 'slam'], ['name', 'write', 0.1, 0.9, 'chalk'], ['tk', 'draw', 0.25, 0.45, 'tick'],
    ['ul', 'draw', 0.4, 0.45, 'draw'], ['dd', 'draw', 0.8, 1.3, 'draw'], ['line', 'write', 2.0, 0.95, 'chalk'],
    ['fl', 'draw', 2.15, 0.8, 'fill'], ['card', 'draw', 2.95, 0.45, 'draw'], ['pn', 'write', 3.05, 0.8, 'chalk'],
    ['price', 'slam', 4.0, 0.3, 'ding'],
    ['badge', 'slam', 5.0, 0.3, 'stamp'],
    ['spark', 'draw', 6.0, 0.4, 'tap']];
  const EV = {
    hook: [['title', 'static', -0.4, 0.6, null], ['trk', 'draw', -0.5, 1.6, 'draw'], ['ulF', 'draw', -0.25, 1.0, null],
      ['hl', 'write', 0.55, 2.0, 'chalk'], ['five', 'slam', 2.0, 0.3, 'slam'],
      ['tooth', 'draw', 1.0, 1.1, null], ['spark', 'draw', 2.6, 0.4, 'tap'],
      ['tag', 'draw', 2.75, 0.45, 'draw'], ['save', 'write', 2.9, 0.75, 'chalk'], ['arrow', 'draw', 3.7, 0.4, 'tap']],
    i1: item(), i2: item(), i3: item(), i4: item(), i5: item(),
    pay: [['head', 'write', 0.0, 0.8, 'chalk'], ['bump', 'slam', 0, 0.3, 'slam'],
      ['d0', 'draw', 0.3, 0.6, 'draw'], ['p0', 'draw', 0.75, 0.2, 'tap'],
      ['d1', 'draw', 0.8, 0.6, 'draw'], ['p1', 'draw', 1.25, 0.2, 'tap'],
      ['d2', 'draw', 1.3, 0.6, 'draw'], ['fl', 'draw', 1.7, 0.6, 'fill'],
      ['price', 'slam', 2.0, 0.3, 'ding'], ['was', 'write', 2.45, 0.4, 'chalk'], ['strike', 'draw', 2.9, 0.25, 'strike'],
      ['save', 'slam', 3.25, 0.3, 'stamp'],
      ['rev', 'write', 3.7, 1.6, 'chalk'], ['joe', 'write', 5.3, 0.35, 'chalk'],
      ['s0', 'slam', 5.5, 0.2, 'tap'], ['s1', 'slam', 5.625, 0.2, 'tap'], ['s2', 'slam', 5.75, 0.2, 'tap'], ['s3', 'slam', 5.875, 0.2, 'tap'], ['s4', 'slam', 6.0, 0.2, 'tap'],
      ['coupon', 'draw', 6.0, 0.5, 'draw'], ['off', 'write', 6.1, 0.55, 'chalk'], ['code', 'slam', 6.75, 0.3, 'stamp'],
      ['ftick', 'draw', 7.25, 0.25, 'tick'], ['free', 'write', 7.3, 0.6, 'chalk'],
      ['btn', 'draw', 7.8, 0.4, 'draw'], ['shop', 'write', 7.95, 0.3, 'chalk'], ['arr', 'draw', 8.25, 0.2, null], ['url', 'write', 8.35, 0.45, 'chalk'],
      ['press', 'press', 9.0, 0.3, 'press']],
  };

  const r4 = x => Math.round(x * 10000) / 10000;
  const TL = { BPM, B, END, DUR: r4(END * B), ERASE: { PASS, PASS_GAP, PASS_D, CLEAR_AT, CLEAR_D }, BOARDS: {}, ORDER: [], EV: {} };
  const CUES = [];
  BOARDS.forEach(([id, beat]) => {
    const t0 = r4(beat * B);
    TL.BOARDS[id] = { t0, beat };
    TL.ORDER.push(id);
    if (beat > 0) {
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
