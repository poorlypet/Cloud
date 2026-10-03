/* "Why owners shop with us." Poorly Pet painted ad: the Marble rule, reviews, real people, delivery. 40 s, 9:16.
   Reviews are verified Judge.me reviews (Janet Hodder, robert), quoted verbatim; see ../adkit/ADS.md. */
const P = '../adplates/assets/', M = '../marble/assets/';
const kR = 1080 / 1427;
AD.film({
  dur: 40,
  fast: [[4.0, 4.7], [8.4, 9.1], [12.0, 12.7], [18.8, 19.5], [25.4, 26.1], [29.2, 29.9], [33.9, 35.5]],
  modes: [[0, 'night'], [8.6, 'day'], [25.6, 'night']],
  scenes: [
    { id: 'photo', plate: '../marble/src/marble.jpg', img: { x: -1236 * kR, y: 0, w: 3574 * kR, h: 2537 * kR }, paper: 0, a: 0, b: 4.65, filter: 'none',
      move: T => T({ z: 1.3, at: [282, 712], to: [470, 900] }).to(0, 4.6, { z: 1.12, sx: 430, sy: 860 }, 'sine.out') },
    { id: 'room', plate: M + 'C07.jpg', a: 4.2, b: 9.05, wipe: { at: 4.2, fill: [4.62, 4.82] },
      move: T => T({ z: 1.3, at: [556, 940], to: [560, 1200] }).to(4.2, 9.0, { z: 1.1, sy: 1150 }, 'sine.out') },
    { id: 'cab', plate: P + 'E1.jpg', a: 8.6, b: 12.65, fade: [8.6, 9.0], flash: [8.6, 9.2, .15],
      move: T => T({ z: 1.3, at: [560, 1100], to: [540, 1150] }).to(8.6, 12.6, { z: 1.08 }, 'sine.out') },
    { id: 'green', plate: M + 'N08.jpg', a: 12.2, b: 19.45, wipe: { at: 12.2, fill: [12.62, 12.82], dirs: [-1, 1, -1] },
      move: T => T({ z: 1.25, at: [530, 1250], to: [540, 1250] }).to(12.2, 19.4, { z: 1.06, sy: 1200 }, 'sine.inOut') },
    { id: 'chew', plate: P + 'D4.jpg', a: 19.0, b: 26.05, fade: [19.0, 19.4],
      move: T => T({ z: 1.3, at: [820, 1300], to: [660, 1320] }).to(19.0, 26.0, { z: 1.1, sx: 640 }, 'sine.inOut') },
    { id: 'house', plate: M + 'C06.jpg', a: 25.6, b: 29.85, wipe: { at: 25.6, fill: [26.02, 26.22] },
      move: T => T({ z: 1.0, at: [558, 1146] }).to(25.6, 29.8, { z: 1.1 }, 'sine.in') },
    { id: 'parcel', plate: M + 'N09.jpg', a: 29.4, b: 40, fade: [29.4, 29.8], flash: [29.4, 30.0, .2], arch: [34.0, 35.35],
      move: T => T({ z: 1.3, at: [265, 1283], to: [420, 1320] }).to(29.4, 34.0, { z: 1.08, sx: 470, sy: 1300 }, 'sine.out')
        .frame(34.0, 35.35, [430, 1215], [540, 500], 0.95, 'power3.inOut').to(35.35, 40, { z: 1.0 }) },
  ],
  endCard: { T0: 34.75, arch: [34.0, 35.35], sheen: 38.0 },
  build: A => {
    A.header([[4.5, 'OUR RULE'], [12.6, 'WHAT CUSTOMERS SAY'], [26.0, 'POORLY PET']], 33.8);
    A.card(['Built for Marble.', '*Here for every dog.*'], { size: 76 }, 0.3, 1.0, 3.95);
    A.card(['If we would not give it', 'to Marble, *we will not sell it.*'], {}, 4.9, 6.0, 8.35);
    A.card(['We say no to far more brands', 'than we *say yes to.*'], {}, 9.1, 10.0, 11.95);
    A.rating({ at: 12.9, sw: 13.55, out: 15.55, y: 300 });
    A.card(['Good and bad,', '*we publish them all.*'], {}, 15.85, 16.6, 18.75);
    A.review({ q: ['Easy ordering', '*and as stated.*'], name: 'Janet H.', stars: 5, at: 19.6, sw: 20.7, out: 22.4 });
    A.review({ q: ['Exactly as I ordered', '*very happy with product*'], name: 'robert', stars: 5, at: 22.7, sw: 23.8, out: 25.4 });
    A.card(['Real people.', 'Every email answered', 'within *one working day.*'], {}, 26.2, 27.3, 29.25);
    A.card(['Tracked UK delivery', '*with Evri.*'], {}, 29.9, 30.6, 31.95);
    A.card(['Free UK delivery', '*over £39*'], {}, 32.15, 32.8, 33.75);
  },
});
