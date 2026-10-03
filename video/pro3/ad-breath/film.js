/* "That breath isn't normal." Poorly Pet painted ad, dog breath. 40 s, 9:16. Copy is verbatim from the sources in
   ../adkit/ADS.md (signed-off site copy, approved film lines, catalogue prices of 28 Sep 2026). */
const P = '../adplates/assets/';
AD.film({
  dur: 40,
  fast: [[6.7, 7.7], [13.7, 14.5], [27.1, 27.9], [33.9, 35.5]],
  modes: [[0, 'night'], [7.0, 'day']],
  scenes: [
    { id: 'hook', plate: P + 'D1.jpg', a: 0, b: 7.65, glows: [[900, 640, 260, 260, 'rgba(255,214,150,.95)', .22, .05]],
      move: T => T({ z: 1.32, at: [330, 1150], to: [480, 1260] }).to(0, 7.6, { z: 1.12, sx: 470, sy: 1230 }, 'sine.inOut') },
    { id: 'teeth', plate: P + 'D2.jpg', a: 7.0, b: 14.45, paper: .6, wipe: { at: 7.0, fill: [7.42, 7.62] },
      move: T => T({ z: 1.35, at: [330, 1100], to: [400, 1230] }).to(7.0, 10.6, { z: 1.12, sx: 470, sy: 1180 }, 'sine.out').frame(10.6, 14.4, [820, 1250], [600, 1250], 1.42) },
    { id: 'kit', plate: P + 'D3.jpg', a: 14.0, b: 27.85, fade: [14.0, 14.4], flash: [14.0, 14.6, .2],
      move: T => T({ z: 1.0, at: [540, 1300] }).to(14.0, 17.0, { z: 1.05 }, 'sine.inOut')
        .frame(17.0, 17.6, [200, 1380], [380, 1300], 1.55, 'power3.inOut').to(17.6, 19.8, { z: 1.6 })
        .frame(19.8, 20.4, [590, 1220], [470, 1280], 1.6, 'power3.inOut').to(20.4, 22.5, { z: 1.65 })
        .frame(22.5, 23.1, [860, 1280], [560, 1300], 1.5, 'power3.inOut').to(23.1, 25.2, { z: 1.55 })
        .frame(25.2, 25.9, [560, 1250], [540, 1280], 1.05, 'power3.inOut').to(25.9, 27.8, { z: 1.08 }) },
    { id: 'chew', plate: P + 'D4.jpg', a: 27.5, b: 40, fade: [27.5, 27.9], arch: [34.0, 35.35],
      move: T => T({ z: 1.3, at: [820, 1300], to: [660, 1320] }).to(27.5, 34.0, { z: 1.12, sx: 640, sy: 1300 }, 'sine.inOut')
        .frame(34.0, 35.35, [830, 1260], [540, 520], 1.0, 'power3.inOut').to(35.35, 40, { z: 1.05 }) },
  ],
  endCard: { T0: 34.75, arch: [34.0, 35.35], sheen: 38.0 },
  build: A => {
    A.header([[0.2, 'MOUTH & TEETH'], [7.3, 'THE SIGNS'], [10.7, 'WHY IT HAPPENS'], [14.3, 'WHAT HELPS'], [17.1, 'DENTAL CARE'], [27.8, 'POORLY PET']], 33.8);
    A.card(["That breath", "isn't *normal.*"], { size: 92, lh: 1.08 }, 0.3, 0.95, 2.9);
    A.card(['Bad breath is usually', 'the *first sign.*'], {}, 3.2, 4.0, 6.75);
    A.list([['Bad breath'], ['Yellow or brown tartar'], ['Bleeding or red gums']], { y: 300, size: 52, at: 7.6, times: [7.8, 8.5, 9.2], out: 10.5 });
    A.card(['Plaque hardening into tartar,', 'which leads on to', '*gum disease.*'], {}, 10.9, 11.8, 13.85);
    A.card(['A simple daily routine', '*goes a long way.*'], {}, 14.45, 15.3, 16.9);
    A.product({ name: 'Triple-Head Brush', claim: 'Cleans three tooth surfaces in one stroke.', price: '£14.99', at: 17.3, out: 19.75 });
    A.product({ name: 'Plaque Crackerz Dental Bites', claim: 'A crunchy daily treat.', price: '£5.99', at: 20.0, out: 22.45 });
    A.product({ name: 'Dental Water Additive', claim: 'One capful a day.', price: '£9.99', at: 22.7, out: 25.15 });
    A.product({ name: 'Sweet Breath Tablets', claim: 'For bad breath', price: '£4.79', at: 25.4, out: 27.7 });
    A.rating({ at: 28.1, sw: 28.75, out: 31.0, y: 300 });
    A.card(['*Shop dental care*'], { size: 76 }, 31.3, 31.95, 33.75);
  },
});
