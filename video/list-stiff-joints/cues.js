/* Timeline and sound cues on the 112 BPM grid. The single source of timing:
   index.html reads window.EV (named event times) and audio/score.py reads window.CUES
   (it runs this file with node). Beat = 0.5357 s, 16th = 0.1339 s, 32nd = 0.0670 s.

   Bars start on beats 2, 6, 10 ... (beats 0-2 are a pickup). Items land on bar downbeats:
   beats 6, 14, 22, 30, 38. The offer lands on beat 46, the button is pressed on beat 54,
   and the film ends on beat 58.5.

   Typing runs at 5 characters per 16th (37.3 cps) or 6 per 16th (44.8 cps), and the key
   sounds fall on 32nds over each typed span, so they play as part of the groove. */
(function (root) {
  const BPM = 112, B = 60 / BPM;
  const CPS = 5 / (B / 4), FAST = 6 / (B / 4);
  const s = beat => +(beat * B).toFixed(4);
  const EV = { BPM, B, CPS, FAST, s };
  const CUES = [];
  const cue = (beat, kind) => CUES.push([s(beat), kind]);
  // key clicks on 32nds over a typed span of n characters at the given speed
  const keys = (beat, n, cps = CPS) => { const span = n / cps / B * 8; for (let k = 0; k < span; k++) cue(beat + k / 8, k % 2 ? 'key' : 'keyA'); };

  /* ---- hook: beats 0-6 ---- */
  EV.h1 = s(-0.2);  keys(0, 9, FAST);                 // "Stiff after rest?" is already typing at frame 0
  EV.h1x = s(1);   cue(1, 'tick');                   // its box ticks
  EV.h2 = s(1);    keys(1, 17, FAST);                 // "Slowing on walks?"
  EV.h2x = s(2);   cue(2, 'tick');
  EV.hSel = s(2);  cue(2, 'swish');                   // mint selection sweeps STIFF JOINTS
  EV.hStamp = s(3); cue(3, 'stamp');                  // WATCH TILL #5
  EV.hRail = s(4); [0, 1, 2, 3, 4].forEach(i => cue(4 + i * 0.25, 'pop' + i)); // tracker boxes ripple
  EV.hDing = s(5.5); cue(5.5, 'ding');               // carriage return, then the line feed
  cue(6, 'ratchet');

  /* ---- five items, 8 beats each ---- */
  const NAMES = [10, 15, 12, 16, 20];                 // characters typed for each item name
  const LINES = [31, 31, 24, 27, 36];                 // supporting line lengths
  const RC = [10, 15, 12, 12, 12];                    // receipt names
  EV.items = [];
  for (let i = 0; i < 5; i++) {
    const L = 6 + 8 * i, e = {};
    e.out = s(L - 0.45);                              // previous page starts leaving
    e.land = s(L);  cue(L, 'slam'); if (i) cue(L, i === 2 ? 'ratchet' : 'whoosh');
    e.name = s(L + 0.25); keys(L + 0.25, NAMES[i]);
    e.line = s(L + 1.25); keys(L + 1.25, LINES[i], FAST);
    if (i === 3) { e.sel = s(L + 2.5); cue(L + 2.5, 'swish'); e.fix = s(L + 2.75); cue(L + 2.75, 'stamp'); }
    else if (i === 4) { e.hl = [s(L + 2.75), s(L + 3), s(L + 3.25)]; e.hl.forEach((_, k) => cue(L + 2.75 + k * 0.25, 'swish')); }
    else { e.hl = [s(L + 2.75)]; cue(L + 2.75, 'swish'); }
    const R = i === 4 ? 3.5 : 3.25;
    e.rc = s(L + R); cue(L + R, 'print');
    e.rcName = s(L + R + 0.25); keys(L + R + 0.25, RC[i] + 8, FAST);
    e.price = s(L + 4.5); cue(L + 4.5, 'ding'); cue(L + 4.5, 'thud');
    e.sub = s(L + 5); keys(L + 5, 14, FAST);
    e.tick = s(L + 6); cue(L + 6, 'check');
    e.end = s(L + 8);
    EV.items.push(e);
  }

  /* ---- offer: beats 46-58.5 ---- */
  const P = 46;
  cue(42, 'riser');
  EV.pOut = s(P - 0.45);
  EV.pay = s(P);        cue(P, 'impact');
  EV.print = s(P - 0.35); cue(P - 0.25, 'printlong');
  EV.orGet = s(P); keys(P, 10);
  EV.bundle = s(P + 0.5);  cue(P + 0.5, 'slam');
  EV.parts = [s(P + 1), s(P + 1.25), s(P + 1.5)]; [0, 1, 2].forEach(k => cue(P + 1 + k * 0.25, 'pop' + (k * 2 + 4)));
  EV.was = s(P + 2);  keys(P + 2, 10);
  EV.strike = s(P + 2.5); cue(P + 2.5, 'strike');
  EV.now = s(P + 3);  cue(P + 3, 'ding'); cue(P + 3, 'slam');
  EV.save = s(P + 3.5);   cue(P + 3.5, 'stamp');
  EV.swap = s(P + 4.5); cue(P + 4.5, 'swish');
  EV.review = s(P + 4.75); keys(P + 4.75, 84, FAST);
  EV.code = s(P + 6);   cue(P + 6, 'stamp');
  EV.free = s(P + 6.5); keys(P + 6.5, 25, FAST);
  EV.btn = s(P + 7);    cue(P + 7, 'pop6');
  EV.press = s(P + 8);  cue(P + 8, 'click'); cue(P + 8, 'chord');
  EV.DUR = s(58.5);

  root.EV = EV; root.CUES = CUES.sort((a, b) => a[0] - b[0]);
})(typeof window !== 'undefined' ? window : globalThis);
