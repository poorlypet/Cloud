/* Timeline, content and sound cues for "5 things that calm an anxious dog".
   124 BPM: one beat = 0.4839 s. The film (index.html) and the score (audio/score.py, which runs
   this file through node) both read it, so every sound lands on its frame.

   Bars start on beat 2 (the hook is a 2-beat pickup plus one bar), so each item lands on a
   downbeat: items at beats 6, 14, 22, 30, 38, the bundle at 46, the offer at 54, the end at 60. */
(function (root) {
  const BPM = 124, B = 60 / BPM;

  // Every price, name and line comes from DATA-PACK-2.md (anxiety section).
  const ITEMS = [
    { bg: 'mint', tile: '#0B2A23', tr: 'diag', head: ['CALMING', '*SuperChews*'], name: 'Calming SuperChews', price: '£19.95',
      line: 'Help calm within 30 minutes', badge: 'Top rated', ill: 'pouch' },
    { bg: 'rust', tile: '#0B2A23', tr: 'split', head: ['LAVENDER', 'CALMING *spray*'], name: 'Lavender Calming Spray', price: '£10.99',
      line: 'Calm and alert – never drowsy', badge: 'Customer favourite', ill: 'spray' },
    { bg: 'paper', tile: '#0C342A', tr: 'bars', head: ['A LICK', '*mat*'], name: 'Lickimat Slomo', price: '£12.99',
      line: 'Licking is naturally soothing', badge: 'Freezer safe', ill: 'mat' },
    { bg: 'deep', tile: '#A8542F', tr: 'push', head: ['PET REMEDY', '*plug* *diffuser*'], name: 'Pet Remedy Plug Diffuser', price: '£24.09',
      line: 'Lasts up to 8 weeks', badge: 'Covers up to 60m²', ill: 'plug' },
    { bg: 'mint', tile: '#A8542F', tr: 'diagR', head: ['ZESTY PAWS', 'CALMING *chews*'], name: 'Zesty Paws Calming Chews', price: '£24.00',
      line: 'No sedative effect', badge: 'Bestseller', ill: 'jar' },
  ];
  // caption words: a lone dash rides with the word before it
  const capWords = s => s.split(' ').reduce((a, w) => (w === '–' ? (a[a.length - 1] += ' –') : a.push(w), a), []);
  const headWords = it => it.head.join(' ').split(' ');

  // beats, relative to each item's downbeat
  const IT = { head0: 0.5, headStep: 0.25, card: 1.5, price: 2, cap0: 2.5, capStep: 0.5, badge: 5.5 };
  const SC = { items: [6, 14, 22, 30, 38], p1: 46, p2: 54, end: 60 };
  // hook (beats from 0)
  const HK = { chips: [0.5, 1.5, 2.5], save: -0.15 }; // the open loop is already slapping on at frame 0
  // bundle page (absolute beats)
  const P1 = { head: [46, 46.5], card: 47, minis: [47.25, 47.5, 47.75], price: 48.5, strike: 49, save: 49.5, review: 50.5, stars: [50.75, 50.875, 51, 51.125, 51.25] };
  // offer page (absolute beats)
  const P2 = { big: 54, sub: 54.5, code: 55, deliv: 55.5, btn: 55.5, press: 56, logo: 56.5 };

  const cues = [];
  const c = (beat, kind) => cues.push([+(beat * B).toFixed(4), kind]);
  // hook: an impact on frame 0, then the three trigger chips pop on the beat
  c(0, 'slam');
  HK.chips.forEach((b, i) => c(b, 'pop' + (4 + i * 2)));
  ITEMS.forEach((it, i) => {
    const S = SC.items[i];
    c(S, 'whoosh'); c(S, 'slam');
    headWords(it).forEach((_, j) => c(S + IT.head0 + j * IT.headStep, 'pop' + (j * 2 + 3)));
    c(S + IT.card, 'slap');
    c(S + IT.price, 'ding');
    capWords(it.line).forEach((_, j) => c(S + IT.cap0 + j * IT.capStep, 'tick' + j));
    c(S + IT.badge, 'stamp');
  });
  c(SC.p1 - 2, 'riser');
  c(SC.p1, 'whoosh'); c(SC.p1, 'slam'); c(P1.head[1], 'pop6');
  c(P1.card, 'slap');
  P1.minis.forEach((b, i) => c(b, 'pop' + (5 + i * 2)));
  c(P1.price, 'ding'); c(P1.strike, 'swish'); c(P1.save, 'stamp');
  c(P1.review, 'pop4');
  P1.stars.forEach((b, i) => c(b, 'star' + i));
  c(SC.p2, 'whoosh'); c(SC.p2, 'slam'); c(P2.sub, 'pop6');
  c(P2.code, 'stamp'); c(P2.deliv, 'pop8');
  c(P2.press, 'click'); c(P2.press, 'chord'); c(P2.logo, 'logo');
  cues.sort((a, b) => a[0] - b[0]);

  root.TL = { BPM, B, ITEMS, IT, SC, HK, P1, P2, capWords, headWords, DUR: +(SC.end * B).toFixed(4) };
  root.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
