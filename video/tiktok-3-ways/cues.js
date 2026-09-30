/* Timing for "3 ways": one source for the film (index.html) and the score (audio/score.py).
   90 BPM: 1 beat = 0.667 s, a quarter-beat = 0.1667 s (5 frames at 30 fps).
   AT holds the named moments in BEATS. CUES is built from AT, in SECONDS.
   The music counts bars from beat 1 (beat 0 is a pickup), so bar downbeats fall on
   beats 1, 5, 9, 13 ... and the kick plays on beats 1 and 3 of each bar. */
(function (w) {
  const BPM = 90, BEAT = 60 / BPM;
  const AT = {
    // hook
    hookType: 0.25, hookLine: 3, hookArrow: 3.5,
    // 1. start with what you're seeing
    scroll1: 5, s1Type: 5.75, s1Chips: 7, s1Caption: 9, s1Tap: 9.5, s1Fold: 10, s1Rows: [10.5, 11.25, 12],
    // 2. ask Poorly Pet AI
    scroll2: 15, s2Type: 16, s2Badges: 17.25, s2Input: 18.25, s2Send: 20.5, s2Dots: 21, s2Reply: 21.75, s2Note: 23.5,
    // 3. scan a photo
    scroll3: 27, s3Type: 28, s3Finder: 28.75, s3Shutter: 30, s3Scan: 30.5, s3Steps: [30, 31, 32], s3Stat: 32, s3Note: 32.5,
    // recap and lockup
    scroll4: 35.5, rTicks: [37, 38, 39], rMark: 40, rTag: 40.5, rUrl: 41.5, rCode: 42, rUnder: 43,
  };
  // typed runs: [start beat, characters, characters per second]
  const TYPE = {
    hook: [AT.hookType, 36, 30],
    s1: [AT.s1Type, 30, 30],
    s2: [AT.s2Type, 18, 30],
    s2Input: [AT.s2Input, 30, 22],
    s3: [AT.s3Type, 13, 30],
  };
  const out = [];
  const add = (beat, kind) => out.push([Math.round(beat * BEAT * 1e4) / 1e4, kind]);
  for (const [b0, n, cps] of Object.values(TYPE)) { // a soft key on every quarter-beat while typing
    const end = b0 + (n / cps) / BEAT;
    for (let b = b0; b < end - 0.05; b += 0.25) add(b, 'key');
  }
  add(AT.hookLine, 'note'); add(AT.hookArrow, 'draw');
  for (const s of ['scroll1', 'scroll2', 'scroll3', 'scroll4']) add(AT[s], 'scroll');
  for (let i = 0; i < 8; i++) add(AT.s1Chips + i * 0.25, 'chip' + i);
  add(AT.s1Caption, 'note'); add(AT.s1Tap, 'tap'); add(AT.s1Fold, 'fold');
  AT.s1Rows.forEach((b, i) => add(b, 'row' + i));
  for (let i = 0; i < 3; i++) add(AT.s2Badges + i * 0.25, 'badge' + i);
  add(AT.s2Send, 'send'); add(AT.s2Dots, 'dots'); add(AT.s2Reply, 'reply'); add(AT.s2Note, 'note');
  add(AT.s3Finder, 'draw'); add(AT.s3Shutter, 'shutter'); add(AT.s3Scan, 'scan');
  AT.s3Steps.forEach((b, i) => add(b, 'step' + i));
  add(AT.s3Stat, 'stat'); add(AT.s3Note, 'note');
  AT.rTicks.forEach((b, i) => add(b, 'tick' + i));
  add(AT.rMark, 'logo'); add(AT.rUrl, 'note'); add(AT.rCode, 'badge3'); add(AT.rUnder, 'draw');
  out.sort((a, b) => a[0] - b[0]);
  w.BPM = BPM; w.BEAT = BEAT; w.AT = AT; w.TYPE = TYPE; w.CUES = out;
})(typeof window !== 'undefined' ? window : globalThis);
