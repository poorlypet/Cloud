/* "Every shelf." Poorly Pet painted ad: the categories we support. 40 s, 9:16. Category and condition names are the
   signed-off navigation (signed-off/home.html:50, shop-by-condition.html:81); see ../adkit/ADS.md. */
const P = '../adplates/assets/', M = '../marble/assets/';
const cat = (id, plate, a, b, at, to, z, o = {}) => ({ id, plate, a, b, wipe: { at: a, fill: [a + .42, a + .62], dirs: o.dirs }, ...o, move: T => T({ z: z + .2, at, to }).to(a, b, { z }, 'sine.out') });
AD.film({
  dur: 40,
  fast: [[5.3, 6.2], [9.5, 10.4], [13.7, 14.6], [17.9, 18.8], [22.1, 23.0], [26.3, 27.0], [29.9, 30.6], [33.9, 35.5]],
  modes: [[0, 'day'], [9.6, 'night'], [13.8, 'day'], [18.0, 'night'], [22.2, 'day'], [30.0, 'night']],
  scenes: [
    { id: 'cab', plate: P + 'E1.jpg', a: 0, b: 6.15, move: T => T({ z: 1.5, at: [560, 1500], to: [540, 1300] }).to(0, 6.1, { z: 1.1, sy: 1050 }, 'sine.inOut') },
    cat('mob', M + 'N06.jpg', 5.5, 10.35, [330, 1400], [560, 1300], 1.05),
    cat('skin', P + 'W1.jpg', 9.7, 14.55, [420, 1330], [520, 1300], 1.2, { dirs: [-1, 1, -1] }),
    cat('ess', P + 'W4.jpg', 13.9, 18.75, [600, 960], [560, 1150], 1.1),
    cat('mood', P + 'E2.jpg', 18.1, 22.95, [560, 1050], [560, 1200], 1.1, { dirs: [-1, 1, -1] }),
    cat('int', P + 'D4.jpg', 22.3, 27.0, [800, 1300], [640, 1300], 1.1),
    { id: 'cab2', plate: P + 'E1.jpg', a: 26.5, b: 30.6, fade: [26.5, 26.9], move: T => T({ z: 1.4, at: [560, 1000], to: [540, 1150] }).to(26.5, 30.6, { z: 1.02, sy: 1000 }, 'sine.inOut') },
    { id: 'marble', plate: M + 'C07.jpg', a: 30.2, b: 40, wipe: { at: 30.2, fill: [30.62, 30.82] }, arch: [34.0, 35.35],
      move: T => T({ z: 1.25, at: [556, 940], to: [540, 1250] }).to(30.2, 34.0, { z: 1.08, sy: 1180 }, 'sine.out')
        .frame(34.0, 35.35, [556, 940], [540, 500], 0.92, 'power3.inOut').to(35.35, 40, { z: 0.96 }) },
  ],
  endCard: { T0: 34.75, arch: [34.0, 35.35], sheen: 38.0 },
  build: A => {
    A.header([[0.2, 'POORLY PET'], [5.8, 'MOBILITY & JOINT'], [10.0, 'SKIN & ALLERGIES'], [14.2, 'ESSENTIAL CARE'], [18.4, 'BEHAVIOUR & MOOD'], [22.6, 'INTERNAL HEALTH'], [26.8, 'POORLY PET']], 33.8);
    A.card(['Everything a poorly dog needs,', '*in one place.*'], {}, 0.4, 1.4, 5.3);
    const area = (rows, a, b) => A.list(rows, { y: 300, size: 54, at: a, times: rows.flat().map((_, i) => a + .3 + .55 * i), out: b });
    area([['Arthritis'], ['Hip dysplasia'], ['IVDD']], 6.0, 9.45);
    area([['Itchy skin & allergies'], ['Hot spots'], ['Seasonal allergies']], 10.2, 13.65);
    area([['Dental disease'], ['Wound & recovery'], ['Recovery']], 14.4, 17.85);
    area([['Anxiety'], ['Separation anxiety'], ['Noise & firework fear']], 18.6, 22.05);
    area([['Digestive issues'], ['Kidney support'], ['Weight management']], 22.8, 26.25);
    A.card(['Sorted by condition', '*and by symptom.*'], {}, 27.0, 27.8, 29.9);
    A.card(['If we would not give it', 'to Marble, *we will not sell it.*'], {}, 30.7, 31.8, 33.75);
  },
});
