/* Timeline and sound cues on the 118 BPM grid (beat B = 0.5085 s). Bars start on beats 2, 6, 10 ...
   Read by the film (window.TL, window.CUES) and by audio/score.py (through node), so every sound
   lands on its frame.

   beats 0-6    hook: title on screen at frame 0, product strip, tracker preview, tap on tile 1
   beats 6-46   five items, 8 beats (4.07 s) each, landing on bar downbeats 6, 14, 22, 30, 38
   beats 46-53  payoff: the cart opens into the Itchy Skin Bundle
   beats 53-61  end card: review, POORLY10, free delivery, Shop now (tapped on beat 57), hold   */
(function (root) {
  const BPM = 118, B = 60 / BPM;
  const S0 = 6, ITEM = 8, P1 = 46, P2 = 53, END = 61;
  const TYPE_BEATS = 1.25;                      // the benefit chip types in over 1.25 beats
  const cues = [];
  const c = (beat, kind) => cues.push([+(beat * B).toFixed(4), kind]);

  // hook
  c(0, 'impact');
  cues.push([0.06, 'pop4'], [0.12, 'pop6']);                   // the last product tiles land
  c(1.5, 'pop6');
  c(2, 'draw');
  for (let k = 0; k < 5; k++) c(3 + k * 0.125, 'seg' + k);
  c(5, 'click');

  // items
  for (let i = 0; i < 5; i++) {
    const s = S0 + i * ITEM;
    c(s - 0.5, 'whoosh');
    c(s, 'slam'); c(s, 'seg' + i);
    c(s + 0.5, 'swish');
    c(s + 0.75, 'thud');
    c(s + 1.5, 'pop' + (2 + i));
    c(s + 2, 'pop' + (5 + i));
    for (let k = 0; k < 6; k++) c(s + 2 + k * 0.125, 'count' + k);
    for (let k = 0; k < 10; k++) c(s + 2.75 + k * 0.125, 'key');
    c(s + 5, 'click');
    c(s + 5.125, 'pop' + (3 + i));
    c(s + 5.5, 'ding' + i);
  }

  // payoff: bundle
  c(42, 'riser');
  c(P1 - 0.5, 'whoosh');
  c(P1, 'impact');
  c(P1 + 0.25, 'thud');
  c(P1 + 1, 'pop2'); c(P1 + 1.125, 'pop4'); c(P1 + 1.25, 'pop6');
  c(P1 + 1.5, 'pop8');
  for (let k = 0; k < 6; k++) c(P1 + 1.5 + k * 0.125, 'count' + k);
  c(P1 + 2.25, 'draw');
  c(P1 + 2.75, 'stamp');
  c(P1 + 3.5, 'pop5'); c(P1 + 3.75, 'pop7'); c(P1 + 4, 'pop9');
  c(P1 + 4.75, 'tick');

  // end card
  c(P2 - 0.5, 'whoosh');
  c(P2, 'slam');
  c(P2 + 0.75, 'swish');
  for (let k = 0; k < 4; k++) c(P2 + 1 + k * 0.125, 'star' + k);
  c(P2 + 2, 'stamp');
  c(P2 + 2.5, 'tick');
  c(P2 + 3, 'pop8');
  c(P2 + 4, 'click'); c(P2 + 4, 'chord');

  cues.sort((a, b) => a[0] - b[0]);
  root.TL = { BPM, B, S0, ITEM, P1, P2, END, TYPE_BEATS, DUR: END * B };
  root.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
