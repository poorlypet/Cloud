/* Timeline and sound cues on the 96 BPM grid (beat 0.625 s, 8th 0.3125 s, 16th 0.15625 s, 32nd 0.078125 s).
   All times are in BEATS. The film (index.html) and the score (audio/score.py) both read this file.
   A cue is [beat, kind] or [beat, kind, count, stepInBeats]; with a count it repeats, and a kind
   ending in '#' gets the repeat index appended (count# -> count0, count1, ...). */
window.BPM = 96;
window.TL = {"type0": 0.25, "mark": 2, "hero": 3, "feats": 4, "ch1": 6, "cards": 7, "count1": 9, "tap1": 11, "morph1": 11.5, "chips": 12.25, "prods": 13.5,
  "ch2": 16, "tiles": 17, "count2": 19.25, "tap2": 20, "push2": 20.5, "rows": 21.5, "bubble": 23,
  "ch3": 24, "qtype": 24.75, "send": 27.75, "dots": 28, "reply": 29, "sugg": 30.5,
  "ch4": 33, "brackets": 34, "shutter": 35, "scan": 35.5, "step1": 36.5, "step2": 37.5, "disc": 38.5,
  "close": 41, "logo": 42, "tag": 43, "url": 44, "trust": 45, "end": 48};
window.CUES = [[0, "draw"], [0.375, "key", 11, 0.125], [1.875, "key", 12, 0.125], [1, "pop2"], [1.125, "pop3"], [1.25, "pop4"], [2, "pop6"], [2.5, "draw"], [3, "swish"],
  [4, "pop5"], [4.25, "pop6"], [4.5, "pop7"], [4.75, "pop8"],
  [6, "whoosh"], [7, "pop3"], [7.25, "pop4"], [7.5, "pop5"], [7.75, "pop6"], [8, "pop7"], [8.25, "pop8"], [9, "tick"],
  [11, "click"], [11.5, "morph"], [12.25, "pop4"], [12.5, "pop6"], [12.75, "pop8"], [13.5, "card"], [13.75, "card"], [14, "card"], [14.25, "card"],
  [16, "whoosh"], [17, "pop#", 8, 0.25], [19.25, "tick"], [20, "click"], [20.5, "push"], [21.5, "card"], [22, "card"], [22.5, "card"], [23, "pop7"],
  [24, "click"], [24.05, "bloom"], [24.875, "key", 23, 0.125], [27.75, "send"], [28, "typing"], [29, "chime"], [30.5, "pop5"], [30.75, "pop7"], [31, "pop9"],
  [33, "whoosh"], [34, "draw"], [34.25, "pop4"], [35, "click"], [35, "shutter"], [35.25, "step0"], [35.5, "scan"], [35.5, "count#", 5, 0.25],
  [36.5, "step1"], [37.5, "step2"], [38.5, "stamp"],
  [41, "whoosh"], [42, "logo"], [43, "swish"], [44, "tick"], [45, "star#", 5, 0.25]];
