/* "Two ways in." Poorly Pet painted ad: shop by condition or by symptom. 40 s, 9:16. Verbatim copy, see ../adkit/ADS.md. */
const P = '../adplates/assets/', M = '../marble/assets/';
const reel = (id, plate, a, b, at, to, z) => ({ id, plate, a, b, flash: [a, a + .35, .18], move: T => T({ z: z + .12, at, to }).to(a, b, { z }, 'power2.out') });
AD.film({
  dur: 40,
  fast: [[1.6, 1.8], [3.3, 3.5], [5.0, 5.2], [6.6, 7.4], [25.0, 25.7], [33.9, 35.5]],
  modes: [[0, 'night'], [5.0, 'day']],
  scenes: [
    reel('r1', P + 'W1.jpg', 0, 1.7, [420, 1330], [500, 1250], 1.25),
    reel('r2', P + 'D1.jpg', 1.7, 3.4, [330, 1150], [480, 1250], 1.25),
    reel('r3', P + 'W4.jpg', 3.4, 5.1, [600, 960], [560, 1150], 1.2),
    reel('r4', M + 'N04.jpg', 5.1, 7.25, [430, 968], [520, 1150], 1.2),
    { id: 'wood', plate: P + 'T2.jpg', a: 6.8, b: 25.75, wipe: { at: 6.8, fill: [7.22, 7.42] },
      move: T => T({ z: 1.0, at: [540, 960] }).to(6.8, 11.8, { z: 1.12, sy: 900 }, 'sine.inOut')
        .frame(11.8, 15.5, [650, 950], [560, 1150], 1.3, 'sine.inOut')
        .frame(15.5, 16.4, [330, 1150], [520, 1250], 1.45, 'power3.inOut').to(16.4, 20.3, { z: 1.5, sx: 560 }, 'sine.inOut')
        .frame(20.3, 21.2, [820, 1150], [560, 1250], 1.45, 'power3.inOut').to(21.2, 25.7, { z: 1.5, sx: 520 }, 'sine.inOut') },
    { id: 'shelf', plate: P + 'E1.jpg', a: 25.3, b: 40, fade: [25.3, 25.7], flash: [25.3, 25.9, .15], arch: [34.0, 35.35],
      move: T => T({ z: 1.25, at: [560, 1100], to: [540, 1150] }).to(25.3, 34.0, { z: 1.02, sx: 540, sy: 1060 }, 'sine.inOut')
        .frame(34.0, 35.35, [690, 1420], [540, 500], 0.95, 'power3.inOut').to(35.35, 40, { z: 1.0 }) },
  ],
  endCard: { T0: 34.75, arch: [34.0, 35.35], sheen: 38.0 },
  build: A => {
    [['Itchy skin?', 0.15, 1.5], ['Bad breath?', 1.85, 3.2], ['Hot spots?', 3.55, 4.9], ['Stiff joints?', 5.25, 6.75]]
      .forEach(([s, a, b]) => { const c = A.card([`*${s}*`], { size: 96 }, a, a + .3, b); });
    A.header([[7.2, 'POORLY PET'], [15.6, 'SHOP BY CONDITION'], [20.4, 'SHOP BY SYMPTOM'], [25.5, 'POORLY PET']], 33.8);
    A.card(['When something changes', 'with your dog, it can be', 'hard to know *where to begin.*'], {}, 7.5, 9.6, 11.6);
    A.card(['Two ways in.', 'Both end at the *right shelf.*'], {}, 11.95, 12.9, 15.2);
    A.card(['Know the condition?', '*Go straight to it.*'], {}, 15.6, 16.4, 20.05);
    A.list([['Mobility & Joint', 'Skin & Allergies'], ['Essential Care', 'Behaviour & Mood']], { y: 470, size: 42, at: 16.6, times: [16.9, 17.5, 18.1, 18.7], out: 20.05 });
    A.card(['Not sure?', '*Start with what you can see.*'], {}, 20.4, 21.2, 24.95);
    A.list([['Mouth & teeth', 'Skin & coat'], ['Legs & paws', 'Tummy & gut']], { y: 470, size: 42, at: 21.4, times: [21.7, 22.3, 22.9, 23.5], out: 24.95 });
    A.card(['Everything a poorly dog needs,', '*in one place.*'], {}, 25.8, 26.7, 29.3);
    A.rating({ at: 29.6, sw: 30.25, out: 33.6, y: 300 });
  },
});
