/* Timeline and sound cues on the 120 BPM grid (beat 0.5 s, bar 2 s, 8th 0.25 s, 16th 0.125 s).
   Read by the film (index.html) and by audio/score.py (through node), so every sound lands on its frame.
   Cue names: a trailing number is a variant (pop3) or, for scribbles, the length in tenths of a second (scrib4 = 0.4 s). */
(function (root) {
  const TL = {
    bpm: 120,
    hook: 0,
    items: [2.0, 5.5, 9.0, 12.5, 16.0], // each sign lands on a beat and holds 3.5 s
    helps: 19.5,                         // "What helps at home"
    prod: 22.0,                          // products slam in (drop after the riser)
    offer: 25.0,                         // review, POORLY10, delivery, CTA
    press: 28.5,                         // the CTA button is pressed
    end: 31.0,                           // end frame held from 28.6
  };
  const C = [];
  const add = (t, k) => C.push([+t.toFixed(4), k]);

  // hook: the title is on screen at frame 0, the circle round IVDD is already being drawn
  add(0, 'impact'); add(0, 'scrib4');
  add(0.375, 'swipe');
  add(0.5, 'scrib5'); add(0.75, 'scrib2');
  for (let i = 0; i < 5; i++) add(0.875 + i * 0.125, 'pop' + i * 2);
  add(1.75, 'riserS');

  // the five signs
  TL.items.forEach((t0, k) => {
    add(t0, 'whoosh'); add(t0, 'slam');            // push + giant numeral slams on the downbeat
    add(t0 + 0.125, 'scrib3');                      // circle scribbled round the numeral
    const nw = [3, 5, 6, 6, 6][k];
    for (let i = 0; i < nw; i++) add(t0 + 0.25 + i * 0.0625, 'pop' + (i + k) % 12);
    add(t0 + 0.75, 'scrib6');                       // the doodle draws on
    add(t0 + 1.25, 'swipe');                        // mint highlighter behind the key word
    add(t0 + 1.75, 'scrib5');                       // the supporting line is written
    add(t0 + 2.5, 'tick');  add(t0 + 2.5, 'scrib2'); // tracker box ticked
    add(t0 + 2.75, 'pop' + (k * 2 + 4) % 12);       // the doodle's accent pops
  });

  // what helps at home: four quick ticks
  add(TL.helps, 'whoosh'); add(TL.helps, 'slam');
  add(TL.helps + 0.25, 'swipe');
  [0.5, 0.875, 1.25, 1.625].forEach((d, i) => { add(TL.helps + d, 'tick'); add(TL.helps + d, 'scrib2'); add(TL.helps + d + 0.0625, 'pop' + (3 + i * 2)); });
  add(TL.helps + 1.5, 'riser');                     // 21.0 -> 22.0 build into the products

  // products slam in
  add(TL.prod, 'impact'); add(TL.prod, 'whoosh');
  for (let i = 0; i < 4; i++) add(TL.prod + 0.125 + i * 0.0625, 'pop' + (6 + i));
  add(TL.prod + 0.25, 'ding');                      // the bundle price
  add(TL.prod + 0.5, 'scrib3');                     // was-price struck through
  add(TL.prod + 1.0, 'stamp');                      // SAVE 10%
  add(TL.prod + 1.5, 'slam'); add(TL.prod + 1.625, 'ding');  // ramp
  add(TL.prod + 2.0, 'slam'); add(TL.prod + 2.125, 'ding');  // body lift
  add(TL.prod + 2.5, 'scrib4');                     // circle round the bundle price

  // offer
  add(TL.offer, 'whoosh'); add(TL.offer, 'slam');
  for (let i = 0; i < 5; i++) add(TL.offer + 0.25 + i * 0.0625, 'star' + i);
  add(TL.offer + 0.375, 'scrib8');                  // the review is written
  add(TL.offer + 1.5, 'stamp');                     // POORLY10 coupon
  add(TL.offer + 2.0, 'tick'); add(TL.offer + 2.0, 'scrib2'); // free UK delivery
  add(TL.offer + 2.5, 'pop9'); add(TL.offer + 2.5, 'swish');  // button
  add(TL.offer + 3.0, 'scrib3');                    // url underline
  add(TL.press, 'click'); add(TL.press, 'chord');   // the press, click + chord
  add(TL.press + 0.25, 'swipe');                    // a big mint tick sweeps in behind the end card
  add(TL.press + 0.125, 'scrib5');                  // circle round the button (rhymes with frame 0)

  C.sort((a, b) => a[0] - b[0]);
  root.TL = TL;
  root.CUES = C;
})(typeof window !== 'undefined' ? window : globalThis);
