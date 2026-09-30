/* Timings and sound cues on the 80 BPM grid (beat 0.75 s, eighth 0.375 s, sixteenth 0.1875 s).
   The film (index.html) reads TM for every entrance, and audio/score.py reads CUES (via node),
   so each sound lands on the frame where its motion starts. */
(function (root) {
  const B = 0.75;
  const TM = {
    // 1. deep green: the hook
    type1: { t0: 0.2, cps: 12, parts: [['Your dog'], ['\n'], ["can't tell you"]] },
    hurts: [3 * B, 3.5 * B],             // "what" "hurts." rise on the beat
    hurtsLine: 4 * B,                    // mint underline draws
    // 2. paper: noticing
    push1: 5 * B,
    notice: 5.5 * B, wordStep: B / 4,
    obs: [7 * B, 8 * B, 9 * B],          // one observation per beat
    // 3. deep green: the turn
    push2: 12 * B,
    turn: 12.5 * B,
    card: 15 * B,
    split: 16 * B,
    pills: [16.5 * B, 17 * B, 17.5 * B],
    // 4. mint: describe it, or show us
    wipe3: 19 * B,
    describe: 19.5 * B,
    showUs: 20.5 * B,
    pulse: 20 * B,                       // the soft kick and sub enter (the score reads this)
    chat: 21 * B,
    type2: { t0: 21 * B + 0.3, cps: 17, parts: [['stiff after walks…']] },
    scanner: 23 * B,
    scan: 23.5 * B,
    scanDone: 25 * B,
    // 5. paper: trust
    push4: 26 * B,
    vet: 26.5 * B,
    products: 27.5 * B,
    stars: [29 * B, 29.25 * B, 29.5 * B, 29.75 * B, 30 * B],
    score: 30 * B,
    review: 30.5 * B,
    type3: { t0: 30.5 * B + 0.2, cps: 34, parts: [['“Really helping our elderly lab with his arthritic shoulder. Great quality”']] },
    reviewer: 34 * B,
    // 6. deep green: lockup
    push5: 35 * B,
    mark: 36 * B,
    word: 36.5 * B,
    tag: [37 * B, 37.5 * B],
    url: 38 * B,
    small: 38.5 * B,
    DUR: 30,
  };

  const CUES = [];
  const keys = (spec, kind = 'key') => {
    let n = 0;
    for (const [s] of spec.parts) for (const ch of s) { if (s === '\n') continue; n++; if (ch.trim()) CUES.push([+(spec.t0 + n / spec.cps).toFixed(4), kind]); }
  };
  keys(TM.type1);
  CUES.push([TM.hurts[0], 'word'], [TM.hurts[1], 'word'], [TM.hurtsLine, 'draw']);
  CUES.push([TM.push1, 'push'], [TM.notice, 'word']);
  TM.obs.forEach((t, i) => CUES.push([t, 'write' + i], [t + B / 2, 'draw']));
  CUES.push([TM.push2, 'push'], [TM.turn, 'word'], [TM.card, 'card'], [TM.split, 'split']);
  TM.pills.forEach((t, i) => CUES.push([t, 'pill' + i]));
  CUES.push([TM.wipe3, 'push'], [TM.describe, 'word'], [TM.showUs, 'word'], [TM.chat, 'card']);
  keys(TM.type2, 'soft');
  CUES.push([TM.scanner, 'card'], [TM.scan, 'scan'], [TM.scanDone, 'chime']);
  CUES.push([TM.push4, 'push'], [TM.vet, 'tick'], [TM.products, 'count']);
  TM.stars.forEach((t, i) => CUES.push([t, 'star' + i]));
  CUES.push([TM.review, 'card']);
  keys(TM.type3, 'soft');
  CUES.push([TM.reviewer, 'tick'], [TM.push5, 'push'], [TM.mark, 'logo'], [TM.url, 'tick']);
  CUES.sort((a, b) => a[0] - b[0]);

  root.TM = TM; root.CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
