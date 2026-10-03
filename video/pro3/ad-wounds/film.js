/* "A hot, weepy patch." Poorly Pet painted ad, wounds and hot spots. 40 s, 9:16. Verbatim copy, see ../adkit/ADS.md.
   The review is Jane's verified 4-star Judge.me review; it is shown with no product name (Judge.me mis-tags it). */
const P = '../adplates/assets/';
AD.film({
  dur: 40,
  fast: [[7.5, 8.4], [11.4, 12.2], [20.0, 20.8], [33.9, 35.5]],
  modes: [[0, 'night'], [7.8, 'day']],
  scenes: [
    { id: 'patch', plate: P + 'W1.jpg', a: 0, b: 8.45, glows: [[140, 690, 220, 220, 'rgba(255,214,150,.95)', .25, .05]],
      move: T => T({ z: 1.12, at: [420, 1330], to: [480, 1300] }).to(0, 8.4, { z: 1.42, sx: 500, sy: 1300 }, 'sine.inOut') },
    { id: 'cone', plate: P + 'W4.jpg', a: 7.8, b: 12.2, wipe: { at: 7.8, fill: [8.22, 8.42] },
      move: T => T({ z: 1.35, at: [600, 960], to: [560, 1180] }).to(7.8, 12.2, { z: 1.12, sx: 540, sy: 1160 }, 'sine.out') },
    { id: 'suit', plate: P + 'W3.jpg', a: 11.8, b: 20.85, fade: [11.8, 12.2], flash: [11.8, 12.4, .15],
      move: T => T({ z: 1.3, at: [620, 1250], to: [560, 1260] }).to(11.8, 15.6, { z: 1.12, sx: 560, sy: 1250 }, 'sine.out').to(15.6, 20.8, { z: 1.05, sx: 520 }, 'sine.inOut') },
    { id: 'sleeve', plate: P + 'W2.jpg', a: 20.4, b: 40, wipe: { at: 20.4, fill: [20.82, 21.02], dirs: [-1, 1, -1] }, arch: [34.0, 35.35],
      move: T => T({ z: 1.3, at: [520, 1150], to: [540, 1250] }).to(20.4, 29.5, { z: 1.12, sx: 540, sy: 1220 }, 'sine.inOut')
        .frame(29.5, 34.0, [600, 1250], [560, 1300], 1.05).frame(34.0, 35.35, [470, 900], [540, 500], 0.95, 'power3.inOut').to(35.35, 40, { z: 1.0 }) },
  ],
  endCard: { T0: 34.75, arch: [34.0, 35.35], sheen: 38.0 },
  build: A => {
    A.header([[0.2, 'SKIN & ALLERGIES'], [8.1, 'WHAT HELPS'], [12.0, 'RECOVERY & FIRST AID'], [20.6, 'WHAT CUSTOMERS SAY'], [29.6, 'POORLY PET']], 33.8);
    A.card(['A hot,', '*weepy patch.*'], { size: 92, lh: 1.08 }, 0.3, 1.0, 2.75);
    A.card(['A raw, red, wet patch that', 'appears fast, often within', 'hours, and is usually *very sore.*'], { size: 58 }, 3.0, 5.4, 7.6);
    A.card(['Stop the licking with', 'a *cone or body suit.*'], {}, 8.5, 9.3, 11.55);
    A.card(['A soft cone or recovery suit', '*protects the wound.*'], {}, 12.3, 13.1, 15.4);
    A.list([['Recovery suits & shirts'], ['Recovery collars', 'Wound care'], ['Hot spots']], { y: 300, size: 50, at: 15.7, times: [16.0, 16.7, 17.4, 18.1], out: 20.2 });
    A.review({ q: ['now my boy has a sleeve', 'he cannot get off, is', '*extremely comfortable*'], name: 'Jane', stars: 4, at: 20.9, sw: 22.6, out: 25.4 });
    A.review({ q: ['the service from', 'poorly pet was *110%*'], name: 'Jane', stars: 4, at: 25.7, sw: 26.9, out: 29.3 });
    A.rating({ at: 29.6, sw: 30.25, out: 32.0, y: 300 });
    A.card(['*Shop poorly-pet.com*'], { size: 70 }, 32.2, 32.8, 33.75);
  },
});
