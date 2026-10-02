"""Marble brand film score v2, 'Marble's Theme' (treatment-v2.json final.music_map): 75 BPM, 89.6 s, D major / B minor.

Composed in MIDI, one file per instrument group, each rendered as its own stem with real samples
(FluidR3_GM via FluidSynth, its reverb and chorus off). Then per-stem EQ and a synthetic convolution
hall, 2:1 bus glue, -14 LUFS and a look-ahead true-peak limiter at -1.6 dBTP (headroom for AAC, so the MP4 stays under -1 dBTP). There are no synthesised
sound effects or ambience: every sound is a sampled instrument (the reversed piano is a reversed stem).

All times are the final 89.6 s timeline. The treatment's 86.4 s draft times map as: t < 48.0 unchanged,
48.0 <= t < 65.6 -> t + 1.6, t >= 65.6 -> t + 3.2. The two inserted half bars make bar 15 (strict rest,
D/F# held 46.4-49.6) and bar 21 (blue hour, Em7 held 65.6-68.8) bars of 6/4, so between them the music's
downbeats fall half a bar off the 3.2 s grid (49.6, 52.8 ... 65.6), and from 70.4 they are back on it.

    python3 score.py            writes audio/score.wav (48 kHz, 16-bit PCM, stereo, 4,300,800 samples)
"""
import os, subprocess, tempfile
import numpy as np, mido, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter, oaconvolve, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR, DUR = 48000, 89.6
N = int(round(SR * DUR))                     # 4,300,800 samples
TPB, BEAT = 480, 0.8                         # 75 BPM: one beat = 0.8 s, one bar = 3.2 s
SYNC = (0.0, 0.8, 4.8, 6.4, 7.75, 18.4, 19.2, 22.0, 28.8, 32.0, 36.8, 41.6, 44.8, 45.6, 46.4, 52.8, 56.4, 57.2,
        58.0, 58.8, 59.2, 60.0, 73.6, 77.6, 78.4, 79.2, 80.0, 80.8, 84.8)        # picture hits: never humanised
DMAJ = {2, 4, 6, 7, 9, 11, 1}
TMP = os.path.join(tempfile.gettempdir(), 'marble-score')
rng = np.random.default_rng(75)

# ---------- harmony: time, bass, close upper voicing (>= C3) shared by the pad and the string bed ----------
HARM = [(0.0, 38, (50, 57)), (3.2, 47, (54, 59, 61)), (4.4, 0, ()), (4.8, 35, (54, 59)),          # D, Bm(add9), breath
        (6.4, 43, (54, 59, 62)), (8.0, 45, (57, 62, 64)), (8.8, 45, (57, 61, 64)),                 # Gmaj7 Asus4 A
        (9.6, 50, (54, 57, 62)), (11.2, 43, (54, 59, 62)), (12.0, 40, (55, 59, 62)),               # much-loved: D Gmaj7 Em7
        (12.8, 47, (54, 59, 62)), (14.4, 45, (55, 59, 62)), (16.0, 40, (52, 55, 59, 62)),          # Bm G/A Em7
        (16.8, 42, (54, 59, 61)), (17.6, 43, (55, 59, 62, 64)), (19.2, 50, (54, 59, 62)),          # F#sus4 Em7/G Bm/D
        (20.0, 40, (52, 55, 59, 62)), (20.8, 42, (54, 59, 61)), (21.4, 42, (54, 58, 61)), (21.9, 0, ()),  # Em7 F#sus4 F#, lamp out
        (22.4, 35, (54, 59, 62)), (24.0, 43, (55, 59, 62)), (25.6, 42, (54, 57, 62)),              # search: Bm G D/F#
        (27.2, 40, (55, 59, 64)), (28.0, 45, (57, 61, 64)), (28.8, 50, (54, 57, 62)),              # Em A | long back: D
        (30.4, 49, (57, 61, 64)), (32.0, 47, (54, 57, 62)), (33.6, 43, (55, 59, 62)),              # A/C# Bm7 G
        (35.2, 42, (54, 57, 62)), (36.0, 40, (55, 59, 62)), (36.8, 43, (55, 59, 62)),              # D/F# Em7 | signs: G
        (38.4, 42, (54, 57, 62)), (40.0, 40, (55, 59, 62)), (40.8, 45, (57, 61, 64)),              # D/F# Em7 A
        (41.6, 47, (54, 59, 62)), (43.2, 45, (54, 57, 61)), (44.0, 43, (55, 59, 62)),              # legs: Bm F#m/A G
        (44.8, 43, (54, 59, 62)), (46.4, 42, (54, 57, 62)),                                        # rest (6/4): Gmaj7 D/F#
        (49.6, 40, (55, 59, 62)), (51.2, 45, (55, 57, 62)), (52.0, 45, (57, 61, 64)),              # Em7 A7sus4 A
        (52.8, 50, (54, 57, 62)), (54.4, 49, (57, 61, 64)), (56.0, 47, (54, 57, 62)),              # 2025: D A/C# Bm7
        (57.6, 43, (55, 59, 62)), (58.4, 45, (55, 57, 62)), (59.2, 42, (54, 57, 62)),              # G A7sus4 | better days: D/F#
        (60.0, 40, (55, 59, 62)), (60.8, 43, (55, 59, 62)), (61.6, 45, (55, 57, 62)),              # Em7 G A7sus4
        (62.4, 43, (55, 59, 62)), (64.0, 42, (54, 57, 62)),                                        # sharing: G D/F#
        (65.6, 40, (55, 59, 62)), (68.8, 45, (55, 57, 62)), (69.6, 45, (57, 61, 64)),              # blue hour (6/4): Em7 A7sus4 A
        (70.4, 43, (54, 59, 62)), (72.0, 42, (54, 57, 62)), (72.8, 40, (55, 59, 62)),              # one place: Gmaj7 D/F# Em7
        (73.6, 50, (54, 57, 62)), (75.2, 49, (57, 61, 64)), (76.0, 47, (54, 57, 62)),              # Today: D A/C# Bm7
        (76.8, 43, (55, 59, 62)), (78.4, 45, (55, 57, 62)), (79.2, 45, (55, 57, 61)),              # return: G A7sus4 A7
        (80.0, 38, (50, 54, 57, 62)), (81.6, 43, (50, 55, 59, 62)), (82.4, 38, (50, 54, 57, 62)),  # RESOLUTION D, G, D
        (83.2, 42, (54, 57, 62)), (84.0, 43, (55, 59, 62)), (84.8, 38, (54, 57, 62)),              # coda D/F# G D
        (85.6, 38, (55, 59, 62)), (86.4, 38, (50, 57, 62, 64)), (89.6, 0, ())]                     # G/D, Dadd9

def at(t): return [h for h in HARM if h[0] <= t + 1e-6][-1]
def segs(t0, t1, col=2):
    s = [(t0, at(t0))] + [(h[0], h) for h in HARM if t0 + 1e-6 < h[0] < t1 - 1e-6]
    return [(t, tuple(h[2]) if col == 2 else (h[1],)) for t, h in s]

class Part:
    """One instrument group: one MIDI file, rendered to one stem. chans = {ch: (program, volume, pan)}."""
    def __init__(self, name, chans):
        self.name, self.notes, self.ctl = name, [], []
        for ch, (prog, vol, pan) in chans.items():
            self.ctl.append((0, -1, mido.Message('program_change', channel=ch, program=prog)))
            for c, v in ((7, vol), (10, pan), (11, 127), (64, 0)): self.cc(ch, 0, c, v)
    def cc(self, ch, t, c, v):
        self.ctl.append((t, 1, mido.Message('control_change', channel=ch, control=c, value=int(np.clip(round(v), 0, 127)))))
    def note(self, ch, t, n, d, v):
        if min(abs(t - s) for s in SYNC) > 1e-6:          # humanise: +-8 ms, +-6 velocity
            t, v = t + rng.uniform(-0.008, 0.008), v + rng.integers(-6, 7)
        self.notes.append([ch, int(n), max(0.0, t), max(0.0, t) + d, int(np.clip(round(v), 1, 127))])
    def chord(self, ch, t, ns, d, v, roll=0.0):
        for k, n in enumerate(ns): self.note(ch, t + k * roll, n, d - k * roll, v)
    def expr(self, chs, pts, depth=0.0):
        """CC11 along breakpoints, plus a gentle hairpin swell inside every chord so sustained notes breathe."""
        ts = np.arange(pts[0][0], pts[-1][0] + 1e-6, 0.04)
        v = np.interp(ts, [p[0] for p in pts], [p[1] for p in pts])
        if depth:
            ht = np.array([h[0] for h in HARM]); i = np.searchsorted(ht, ts + 1e-6) - 1
            ph = (ts - ht[i]) / (ht[np.minimum(i + 1, len(ht) - 1)] - ht[i] + 1e-6)
            v *= 1 - depth + depth * np.sin(np.pi * np.clip(ph, 0, 1))
        last = None
        for t, x in list(zip(ts, np.round(v))) + [(pts[-1][0], pts[-1][1])]:
            if x != last:
                for ch in chs: self.cc(ch, t, 11, x)
                last = x
    def save(self, path, end):
        notes = sorted(self.notes, key=lambda x: (x[0], x[1], x[2]))
        for a, b in zip(notes, notes[1:]):                   # same key re-struck: end the old note first
            if a[:2] == b[:2] and a[3] > b[2] - 0.004: a[3] = max(a[2] + 0.01, b[2] - 0.004)
        ev = list(self.ctl) + [(end, 1, mido.Message('control_change', channel=0, control=64, value=0))]
        for ch, n, t0, t1, v in notes:
            ev += [(t0, 2, mido.Message('note_on', channel=ch, note=n, velocity=v)),
                   (t1, 0, mido.Message('note_off', channel=ch, note=n, velocity=0))]
        mid = mido.MidiFile(ticks_per_beat=TPB); tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(75), time=0))
        last = 0
        for tk, _, m in sorted(((int(round(t / BEAT * TPB)), o, m) for t, o, m in ev), key=lambda e: e[:2]):
            tr.append(m.copy(time=tk - last)); last = tk
        mid.save(path)

def lines(p, chs, sg, t_end, v, ovl=0.12):
    """Legato voice leading: common tones are held, other notes overlap the next chord slightly, no gaps."""
    held = {}
    for i, (t, ns) in enumerate(sg):
        for n in ns: held.setdefault(n, t)
        nt, nxt = (sg[i + 1] if i + 1 < len(sg) else (t_end, ()))
        for n in [n for n in held if n not in nxt]:
            for ch in chs: p.note(ch, held[n], n, nt + (ovl if nxt else 0) - held[n], v)
            del held[n]

def gliss(p, t0, t1, n0, n1, v0, v1, ch=0):
    ns = [n for n in range(min(n0, n1), max(n0, n1) + 1) if n % 12 in DMAJ][::1 if n1 > n0 else -1]
    for k, n in enumerate(ns):
        x = k / (len(ns) - 1); p.note(ch, t0 + x * (t1 - t0), n, 1.2, v0 + x * (v1 - v0))

def arps(p, t0, t1, step, v0, v1, ch=0):
    """Rolling harp arpeggio over the chord in two octaves (never D5: that pitch is kept for the resolution)."""
    t, k = t0, 0
    while t < t1 - 1e-6:
        pool = sorted({n + o for n in at(t)[2] for o in (0, 12)} - {74}); L = len(pool); j = k % (2 * L - 2)
        p.note(ch, t, pool[j if j < L else 2 * L - 2 - j], step * 4, v0 + (v1 - v0) * (t - t0) / (t1 - t0))
        t, k = t + step, k + 1

def compose():
    pn = Part('piano', {0: (0, 112, 64)})
    st = Part('strings', {0: (48, 112, 28), 1: (49, 79, 100), 2: (48, 108, 82), 3: (48, 104, 46)})  # Ens1 L, Ens2 R -6 dB, low, violins
    pad = Part('pad', {0: (89, 100, 64), 1: (89, 100, 64)})
    hp = Part('harp', {0: (46, 108, 51), 1: (46, 108, 77)})                    # 20% left; the right-hand brush stroke 20% right
    bl = Part('bells', {0: (8, 100, 72), 1: (9, 100, 56)})                     # celesta, glockenspiel
    gt = Part('guitar', {0: (24, 104, 74)})                                    # 15% right
    pz = Part('pizz', {0: (45, 104, 50), 1: (45, 104, 78)})                    # alternating lightly L / R
    tp = Part('timpani', {0: (47, 110, 64), 1: (47, 110, 64)})
    cy = Part('cymbal', {9: (0, 100, 64)})                                     # GM kit, Ride 1 rolled
    P = lambda t, ns, v, d=1.6, roll=0.0: pn.chord(0, t, ns, d, v, roll)

    # ---- piano: legato pedal changes (also under stepwise melody notes), released completely for the two silences ----
    pn.cc(0, 0, 64, 127)
    for t in (1.6, 3.2, 6.4, 8.0, 8.8, 9.6, 11.2, 12.0, 12.8, 14.4, 16.0, 16.8, 17.6, 19.2, 20.0, 20.8, 21.4, 24.0, 25.6,
              27.2, 28.0, 28.8, 29.6, 30.0, 30.4, 32.0, 33.6, 34.0, 34.4, 34.8, 35.2, 36.0, 36.8, 38.4, 39.2, 39.6, 40.0,
              40.4, 40.8, 41.2, 41.6, 43.2, 44.0, 44.8, 46.4, 48.0, 49.6, 50.0, 50.4, 50.8, 51.2, 52.0, 52.8, 54.0, 54.4,
              56.0, 57.6, 58.4, 59.2, 60.0, 60.8, 61.6, 62.4, 63.6, 64.0, 65.6, 66.8, 67.2, 68.8, 69.6, 70.4, 71.6, 72.0,
              72.8, 73.2, 73.6, 74.8, 75.2, 76.0, 76.8, 77.6, 78.4, 79.2, 80.0, 81.6, 82.4, 83.2, 84.0, 84.4, 84.8, 85.6, 86.4):
        pn.cc(0, t - 0.03, 64, 0); pn.cc(0, t + 0.06, 64, 127)
    for t, v in ((4.4, 0), (4.8, 127), (21.9, 0), (22.0, 127), (22.08, 0), (22.4, 127), (90.0, 0)): pn.cc(0, t, 64, v)
    P(0.0, [38, 45, 54], 50, 3.2, roll=0.06)                                     # S01 rolled D2-A2-F#3
    P(0.0, [69], 60, 1.3); P(1.2, [78], 62, 0.4); P(1.6, [76], 58, 1.6)          # motif A4-F#5-E5, held, unresolved
    P(3.2, [47, 54], 30, 1.2, roll=0.04); P(3.2, [59, 66], 36, 1.2)              # S02 Bm(add9), minor answer
    P(3.6, [74], 42, 0.8); P(4.0, [73], 38, 0.4)                                 # ... all released at 4.4
    P(4.8, [35, 42, 47], 56, 1.6)                                                # 'IVDD': low B octave + F#2
    P(6.4, [43, 50], 40); P(7.2, [59, 66], 34, 0.8)                              # S03 Gmaj7
    P(8.0, [45, 52], 42); P(8.0, [57, 62, 64], 38, 0.8); P(8.8, [57, 61, 64], 40, 0.8)
    P(9.6, [38, 45], 40); P(10.4, [69], 48, 0.6); P(11.0, [78], 50, 0.2); P(11.2, [76], 46)   # S04 much-loved: motif soft in D
    P(11.2, [43, 50], 38, 0.8); P(12.0, [40, 47], 36, 0.8)
    P(12.8, [47, 54], 42, roll=0.05); P(12.8, [59, 62, 66], 40)                  # S05 Bm, minor fragment
    P(13.6, [78], 50, 0.4); P(14.0, [74], 48, 0.4); P(14.4, [73], 46)
    P(14.4, [55, 59, 62], 38, 2.4); P(16.0, [40, 47], 40, 0.8)                   # G/A, held into Em7 (common tones)
    P(16.8, [42, 49], 42, 0.8); P(16.8, [59, 61, 66], 40, 0.8)                   # F#sus4
    P(17.6, [43, 50], 40); P(17.6, [59, 62, 64], 36); P(18.4, [83], 35, 0.8)     # S06 Em7/G; B5 on 'disc extrusion'
    P(19.2, [38, 50], 40, 0.8); P(19.2, [59, 62, 66], 36, 0.8); P(19.2, [78], 35, 0.8)   # Bm/D; F#5 on 'crate rest'
    P(20.0, [40, 47], 38, 0.8); P(20.0, [55, 59, 62], 36, 0.8)                   # Em7
    P(20.8, [42, 49], 40, 1.1); P(20.8, [59, 61, 66], 38, 0.6); P(21.4, [58, 61, 66], 38, 0.5)   # F#sus4 -> F#, off at 21.9
    P(22.0, [42], 34, 0.08)                                                      # lamp out: F#2, damped for the silence
    for t, ns, v in ((22.4, [35, 47], 46), (24.0, [31, 43], 46), (25.6, [30, 42], 48), (27.2, [28, 40], 50), (28.0, [33, 45], 52)):
        P(t, ns, v, 0.8 if t > 27 else 1.6)                                      # S07 search: left-hand half notes
    P(28.8, [38, 45], 52); P(28.8, [66, 69], 40, 0.8)                            # S08 the white lands on D
    for k, n in enumerate((74, 76, 78)): P(29.2 + 0.4 * k, [n], 44 + 2 * k, 0.4)  # rising study figure D5-E5-F#5-A5
    P(30.4, [81], 48, 1.2); P(30.4, [37, 49], 46)                                # A/C#
    P(32.0, [35, 42], 46); P(33.6, [43, 50], 44)                                 # S09 Bm7, G
    for k, n in enumerate((74, 73, 71, 69)): P(33.6 + 0.4 * k, [n], 48 - 2 * k, 0.4)   # descending D5-C#5-B4-A4
    P(35.2, [42, 50], 42, 0.8); P(36.0, [40, 47], 42, 0.8)                       # D/F#, Em7
    P(36.8, [55, 67], 50)                                                        # S10 soft octave G3/G4 on the cut
    P(38.4, [42, 50], 40); P(40.0, [40, 47], 40, 0.8); P(40.8, [45, 52], 40, 0.8)   # D/F# Em7 A
    for t, n, d in ((38.8, 78, 0.4), (39.2, 79, 0.4), (39.6, 81, 0.8), (40.4, 79, 0.4), (40.8, 76, 0.4), (41.2, 73, 0.4)):
        P(t, [n], 44, d)                                                         # a light melody over the pulse
    P(41.6, [35, 47], 60); P(41.6, [62, 66], 40)                                 # S11 octave on the cut
    P(43.2, [45, 52], 40, 0.8); P(43.2, [61, 66, 69], 38, 0.8); P(44.0, [43, 50], 38, 0.8); P(44.0, [59, 62, 67], 36, 0.8)
    P(44.8, [43, 50], 36); P(45.2, [59, 66], 32, 1.2)                            # S12 strict rest: Gmaj7
    P(46.4, [42, 50], 36, 3.2); P(46.4, [57, 62], 32); P(48.0, [69], 34, 0.4); P(48.4, [66], 32, 1.2)   # D/F# held (6/4)
    P(49.6, [40, 47], 42)                                                        # Em7: the pulse returns
    for k, n in enumerate((69, 71, 74, 76)): P(49.6 + 0.4 * k, [n], 44 + 2 * k, 1.2 if k == 3 else 0.4)   # rising A4-B4-D5-E5
    P(51.2, [45, 52], 42, 0.8); P(51.2, [62, 67], 36, 0.8); P(52.0, [45, 52], 40, 0.8); P(52.0, [61, 64], 38, 0.8)
    P(52.8, [38, 45], 54); P(52.8, [81], 66, 0.8); P(53.6, [90], 64, 0.4); P(54.0, [88], 60, 2.0)   # S13 2025: motif an octave up
    for t, ns in ((54.4, [37, 49]), (56.0, [35, 42]), (57.6, [43, 50]), (58.4, [45, 52]), (59.2, [42, 50]), (60.0, [40, 47]),
                  (60.8, [43, 50]), (61.6, [45, 52])):
        P(t, ns, 48, 1.6 if t in (54.4, 56.0) else 0.8)                          # left hand through 2025 and better days
    P(62.8, [83], 46, 0.8); P(63.6, [81], 44, 0.4); P(64.0, [78], 48)            # S15 sharing: sparse answers above
    P(66.4, [79], 46, 0.4); P(66.8, [78], 44, 0.4); P(67.2, [76], 48)            # S16 blue hour
    P(71.2, [83], 44, 0.4); P(71.6, [81], 44, 0.4); P(72.0, [78], 48, 0.8)       # S17 one place: answering above
    P(72.8, [79], 44, 0.4); P(73.2, [76], 46, 0.4)
    P(73.6, [38, 50], 66); P(73.6, [69, 81], 64, 0.8); P(74.4, [78, 90], 64, 0.4); P(74.8, [76, 88], 60, 1.2)   # S18 Today
    P(75.2, [37, 49], 54, 0.8); P(76.0, [35, 47], 58, 0.8); P(76.0, [66, 69, 71], 48, 0.8)
    P(76.8, [31, 43], 64); P(76.8, [59, 62, 67], 50, 0.8)                        # S19 return
    P(77.6, [69, 81], 76, 0.8)                                                   # pickups on the wash, doubled by violins
    P(78.4, [78, 90], 82, 0.8); P(78.4, [33, 45], 66, 0.8); P(78.4, [62, 67], 56, 0.8)
    P(79.2, [76, 88], 88, 0.8); P(79.2, [45, 52, 55], 66, 0.8); P(79.2, [61, 67], 58, 0.8)
    P(80.0, [74, 81, 86], 100); P(80.0, [38, 45, 50], 92)                        # RESOLUTION: D5
    P(81.6, [43, 50], 64, 0.8); P(81.6, [71, 74, 79], 60, 0.8)
    P(82.4, [38, 45], 58, 0.8); P(82.4, [69, 74, 78], 54, 0.8)
    P(83.2, [42, 50], 48, 0.8); P(83.2, [69], 58, 0.8)                           # S21 coda: the motif resolved
    P(84.0, [43, 50], 46, 0.8); P(84.0, [59, 62], 36, 0.8); P(84.0, [78], 60, 0.4); P(84.4, [76], 54, 0.4)
    P(84.8, [38, 45], 48, 0.8); P(84.8, [66, 69], 38, 0.8); P(84.8, [74], 60, 4.8)
    P(85.6, [38, 50], 42, 0.8); P(85.6, [59, 62, 67], 36, 0.8)                   # G/D
    P(86.4, [38, 45], 46, 3.2, roll=0.07); P(86.4, [62, 64, 66, 69], 40, 3.2, roll=0.06)   # Dadd9 rings out

    # ---- strings: bed (Ens 1 + Ens 2), low line, violins; long CC11 swells, released before each silence ----
    low = lambda a, b: [(t, ns + (ns[0] + 12,) if ns[0] < 40 else ns) for t, ns in segs(a, b, 1)]
    lines(st, (2,), [(3.2, (47, 54))], 4.4, 40)
    lines(st, (2,), [(4.95, (47,)), (6.4, (43,)), (8.0, (45,)), (9.6, (50,)), (11.2, (43,)), (12.0, (40,)), (12.8, (47,)),
                     (14.4, (45,)), (15.2, (43,)), (16.0, (40,)), (16.8, (42,))], 17.6, 62)
    lines(st, (2,), low(25.6, 44.8), 44.8, 70)
    lines(st, (2,), low(49.6, 83.2), 83.2, 70)
    lines(st, (0, 1), segs(6.4, 17.6), 17.6, 66)
    lines(st, (0, 1), segs(25.6, 44.8), 44.8, 70)
    lines(st, (0, 1), segs(49.6, 83.2), 83.2, 70)
    lines(st, (3,), [(17.6, (78,))], 21.9, 60)                                   # pp violin F#5 through the lamp night
    lines(st, (3,), [(22.4, (78,))], 27.2, 56)                                   # cold violin F#5 over the search
    lines(st, (3,), [(44.8, (81,))], 49.7, 56)                                   # pp violin A5 over the strict rest
    lines(st, (3,), [(73.6, (66,)), (74.4, (69,)), (75.2, (73,)), (76.0, (71,)), (77.6, (69,)), (78.4, (78,)),
                     (79.2, (76,)), (80.0, (74,)), (81.6, (71,)), (82.4, (69,))], 83.2, 72)   # counter-line, then the motif
    st.expr((2,), [(3.2, 30), (4.25, 60), (4.4, 0)])
    st.expr((2,), [(4.95, 0), (5.1, 18), (6.4, 72), (8.2, 62), (9.4, 92), (9.9, 58), (12.8, 52), (16.0, 48), (17.2, 40),
                   (17.6, 0)], 0.1)
    st.expr((2,), [(25.6, 0), (26.2, 50), (28.8, 84), (31.4, 80), (32.0, 90), (33.6, 78), (35.2, 74), (36.4, 90), (36.8, 70),
                   (41.6, 62), (44.2, 56), (44.8, 0)], 0.1)
    st.expr((2,), [(49.6, 0), (50.4, 66), (52.8, 84), (59.2, 88), (62.4, 86), (63.2, 68), (73.6, 66), (79.8, 124), (80.0, 127),
                   (81.6, 116), (82.4, 100), (83.2, 0)], 0.1)
    st.expr((0, 1), [(6.4, 0), (7.0, 40), (8.2, 42), (9.4, 85), (9.9, 46), (12.0, 42), (12.8, 40), (17.2, 36), (17.6, 0)], 0.1)
    st.expr((0, 1), [(25.6, 0), (26.4, 46), (28.8, 80), (31.4, 78), (32.0, 90), (32.6, 76), (36.0, 72), (36.8, 62), (41.6, 56),
                     (44.2, 50), (44.8, 0)], 0.1)
    st.expr((0, 1), [(49.6, 0), (50.4, 62), (52.8, 80), (56.0, 80), (59.2, 90), (61.8, 86), (62.4, 96), (62.8, 60), (64.8, 58),
                     (65.6, 76), (66.2, 58), (69.8, 58), (70.4, 78), (71.0, 58), (73.6, 56), (77.6, 90), (79.8, 124), (80.0, 127),
                     (81.6, 116), (82.4, 100), (83.2, 0)], 0.1)
    st.expr((3,), [(17.6, 0), (18.6, 42), (21.4, 40), (21.8, 10), (21.9, 0)])
    st.expr((3,), [(22.4, 0), (23.4, 36), (25.6, 40), (26.4, 30), (27.2, 0)])
    st.expr((3,), [(44.8, 0), (45.8, 40), (48.8, 40), (49.7, 0)])
    st.expr((3,), [(73.6, 0), (74.2, 58), (76.8, 76), (77.6, 92), (79.8, 122), (80.0, 127), (81.6, 112), (82.4, 96), (83.2, 0)], 0.1)

    # ---- warm pad under everything, out for the two silences ----
    lines(pad, (0,), segs(0.0, 4.4), 4.4, 70)
    lines(pad, (0,), segs(5.2, 21.9), 21.9, 70)
    lines(pad, (0,), segs(22.4, DUR), DUR, 70)
    pad.expr((0,), [(0.0, 46), (3.2, 46), (4.25, 44), (4.4, 0)])
    pad.expr((0,), [(5.2, 0), (6.4, 56), (9.6, 60), (12.0, 52), (16.0, 54), (21.4, 54), (21.75, 50), (21.9, 0)], 0.1)
    pad.expr((0,), [(22.4, 0), (23.4, 54), (28.8, 70), (36.8, 66), (44.2, 62), (44.8, 82), (46.0, 72), (49.6, 66), (52.8, 72),
                    (62.4, 70), (73.6, 72), (80.0, 100), (82.4, 92), (83.2, 84), (86.4, 88), (DUR, 74)], 0.1)

    # ---- harp ----
    hp.chord(0, 6.40, [62, 66, 69], 1.5, 58, 0.018); hp.chord(1, 6.65, [71, 74, 76], 1.5, 60, 0.018)   # brush strokes L R L
    hp.chord(0, 6.90, [78, 81, 83], 1.5, 56, 0.018); hp.note(0, 7.75, 86, 2.0, 42)                     # 'harmonic' D6
    gliss(hp, 8.8, 9.5, 66, 38, 56, 44)                                          # low falling gliss: the dive
    arps(hp, 9.6, 12.8, 0.4, 34, 40)                                             # much-loved: soft rolling eighths
    gliss(hp, 28.2, 28.8, 50, 81, 34, 52)                                        # up-gliss into the fly-through
    arps(hp, 28.8, 32.0, 0.4, 40, 46)                                            # the white morning: rolling eighths
    hp.chord(0, 32.00, [62, 66, 69], 1.5, 54, 0.018); hp.chord(1, 32.25, [71, 74, 76], 1.5, 56, 0.018)   # spine strokes
    hp.chord(0, 32.50, [78, 81, 83], 1.5, 52, 0.018)
    gliss(hp, 41.1, 41.6, 59, 83, 34, 50)                                        # whip into the legs
    for t, n in ((44.8, 81), (45.6, 86), (46.4, 90)): hp.note(0, t, n, 2.4, 42)  # 'harmonic' on each sun pass
    gliss(hp, 52.2, 52.8, 50, 81, 34, 52)                                        # into the sun-patch match
    arps(hp, 52.8, 56.0, 0.4, 42, 48)                                            # 2025: rolling eighths
    for t, n in ((56.4, 71), (57.2, 74), (58.0, 78), (58.8, 81)): hp.note(1, t, n, 2.0, 48)   # one note per category
    gliss(hp, 61.8, 62.4, 55, 79, 34, 50)                                        # into the sun bloom
    gliss(hp, 64.8, 65.6, 52, 88, 32, 48)                                        # crane into the sky
    gliss(hp, 73.0, 73.6, 50, 81, 36, 54)                                        # push onto the parcel
    hp.chord(0, 76.40, [62, 66, 69], 1.5, 56, 0.015); hp.chord(1, 76.53, [71, 74, 76], 1.5, 58, 0.015)  # lead-match strokes
    hp.chord(0, 76.66, [78, 81, 83], 1.5, 54, 0.015)
    gliss(hp, 76.8, 77.6, 55, 83, 38, 56)                                        # crane up the lead
    hp.chord(0, 78.8, [62, 64, 67, 69, 76], 1.2, 58, 0.035)                      # figure on stroke 2
    gliss(hp, 80.0, 80.8, 93, 62, 66, 48)                                        # descending gliss at the resolution
    hp.chord(0, 86.4, [50, 57, 64, 66, 69, 74, 76], 2.4, 50, 0.05); hp.note(0, 87.2, 86, 2.4, 40)   # Dadd9 roll, harmonic D6

    # ---- tuned chimes: exactly three ----
    bl.note(0, 0.8, 90, 2.0, 54); bl.note(1, 60.0, 90, 2.0, 50)
    bl.chord(0, 80.8, [86, 93], 2.4, 52); bl.chord(1, 80.8, [86, 93], 2.4, 42)

    # ---- pizzicato: search ostinato, the calm learning pulse, off-beats, low accents on cuts ----
    for k in range(16):
        t = 22.4 + 0.4 * k
        pz.note(k % 2, t, (59, 54, 62, 54)[k % 4] if t < 27.9 else (61, 52)[k % 2], 0.3, 38 + 22 * min(1, (t - 22.4) / 4.4))
    def pulse(t0, t1, v):                                       # quarters on D3/A3 (C#3 or E3 when the chord has no D)
        for k in range(int(round((t1 - t0) / 0.8))):
            t = t0 + 0.8 * k; pcs = {n % 12 for n in at(t)[2]}
            pz.note(k % 2, t, (50 if 2 in pcs else 49 if 1 in pcs else 52, 57)[k % 2], 0.3, v - 6 if 36.7 < t < 44.7 else v)
    pulse(28.8, 44.8, 44); pulse(49.6, 52.8, 42)
    for k in range(12):
        t = 53.2 + 0.8 * k; up = at(t)[2]; pz.note(k % 2, t, up[k % len(up)], 0.3, 40)
    for k in range(4):
        t = 74.0 + 0.8 * k; up = at(t)[2]; pz.note(k % 2, t, up[k % len(up)], 0.3, 36)
    pz.note(0, 41.6, 35, 0.5, 72); pz.note(1, 73.6, 38, 0.5, 72)

    # ---- nylon guitar, fingerpicked from 62.4 ----
    GT = [(62.4, 43, (50, 55, 59)), (64.0, 42, (50, 57, 62)), (65.6, 40, (50, 55, 59)), (68.8, 45, (52, 55, 62)),
          (69.6, 45, (52, 57, 61)), (70.4, 43, (50, 54, 59)), (72.0, 42, (50, 57, 62)), (72.8, 40, (50, 55, 59)),
          (73.6, 50, (57, 62, 66)), (75.2, 49, (52, 57, 64)), (76.0, 47, (54, 59, 62)), (76.8, 43, (50, 55, 59)),
          (78.4, 45, (52, 55, 62)), (79.2, 45, (52, 55, 61)), (80.0, 0, ())]
    for (t0, b, u), (t1, _, _) in zip(GT, GT[1:]):
        for k in range(int(round((t1 - t0) / 0.4))):
            t = t0 + 0.4 * k; c = 18 * max(0, t - 73.6) / 6.4                 # intimate until 'Today', then builds
            gt.note(0, t, (b, u[0], u[2], u[1])[k % 4], min(1.4, t1 - t + 0.1), (44 if k % 4 == 0 else 34) + c)
    gt.chord(0, 80.0, [50, 57, 62, 66], 1.6, 56, 0.025); gt.chord(0, 81.6, [43, 50, 55, 59], 0.8, 44, 0.03)
    gt.chord(0, 82.4, [50, 57, 62, 66], 1.2, 38, 0.03)

    # ---- timpani: one soft stroke on the parcel cut, A2 roll building into the resolution, one soft D2 ----
    tp.note(0, 73.6, 38, 1.0, 54)
    for k in range(int((79.95 - 78.4) * 15) + 1):
        t = 78.4 + k / 15; tp.note(k % 2, t, 45, 0.3, 28 + 48 * ((t - 78.4) / 1.6) ** 1.5)
    tp.note(0, 80.0, 38, 1.5, 66)

    # ---- cymbal swells (twice only): soft Ride 1 roll in 32nd-note triplets, 10 -> 70, ending on the downbeat ----
    for t0, t1 in ((28.0, 28.8), (78.4, 80.0)):
        n = int(round((t1 - t0) * 15))
        for k in range(n + 1): cy.note(9, t0 + (t1 - t0) * k / n, 51, 2.0 if k == n else 0.2, 10 + 60 * (k / n) ** 1.5)

    # ---- reversed piano chords: D into 28.8, Em into 36.8, A into 70.4 (rendered forward, reversed later) ----
    rev = [Part(n, {0: (0, 112, 64)}) for n in ('revD', 'revE', 'revA')]
    for p, ns in zip(rev, ([50, 57, 62, 66, 69], [52, 59, 64, 67, 71], [57, 64, 69])):
        p.chord(0, 0.5, ns, 3.0, 84); p.cc(0, 0, 64, 127); p.cc(0, 3.6, 64, 0)
    return [pn, st, pad, hp, bl, gt, pz, tp, cy] + rev

# ---------- rendering and DSP ----------
def render(p, gain=0.5):
    mid, wav = (os.path.join(TMP, p.name + e) for e in ('.mid', '.wav'))
    p.save(mid, 6.0 if p.name.startswith('rev') else DUR + 5.2)
    subprocess.run(['fluidsynth', '-ni', '-q', '-R', '0', '-C', '0', '-O', 'float', '-o', 'synth.polyphony=512',
                    '-g', str(gain), '-r', str(SR), '-F', wav, SF2, mid], check=True, capture_output=True)
    x, sr = sf.read(wav, always_2d=True); assert sr == SR
    return x

def fit(x): return np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output='sos')
def filt(x, s): return sosfilt(s, x, axis=0)
def biquad(x, kind, f, g, q=0.707):                          # RBJ peaking / high shelf
    A, w = 10 ** (g / 40), 2 * np.pi * f / SR; c, al = np.cos(w), np.sin(w) / (2 * q)
    if kind == 'peak':
        b, a = [1 + al * A, -2 * c, 1 - al * A], [1 + al / A, -2 * c, 1 - al / A]
    else:
        r = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + r), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - r)]
        a = [(A + 1) - (A - 1) * c + r, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - r]
    return lfilter(b, a, x, axis=0)

def hall_ir(rt=2.4, pre=0.02):
    """Synthetic hall: decorrelated stereo noise, highs decaying faster than lows, early reflections, pre-delay."""
    r = np.random.default_rng(24); n = int(SR * rt * 1.2); t = np.arange(n)[:, None] / SR
    noise, ir = r.standard_normal((n, 2)), np.zeros((n, 2))
    for lo, hi, k in ((None, 600, 1.15), (600, 2500, 1.0), (2500, 7000, 0.7), (7000, None, 0.4)):
        b = noise if lo is None else filt(noise, sos('high', lo, 4))
        ir += (b if hi is None else filt(b, sos('low', hi, 4))) * np.exp(-6.91 * t / (rt * k))
    ir *= 1 - np.exp(-t / 0.025)
    ir /= np.sqrt(np.mean(np.sum(ir ** 2, 0)))
    for ch in (0, 1):
        for d in r.uniform(0.003, 0.08, 10): ir[int(d * SR), ch] += r.choice((-1, 1)) * 0.22 * np.exp(-d / 0.04)
    ir = np.vstack([np.zeros((int(pre * SR), 2)), filt(ir, sos('low', 9000))])
    return ir / np.sqrt(np.mean(np.sum(ir ** 2, 0)))
IR = hall_ir()

def hall(x, w):
    wl = oaconvolve(0.7 * x[:, 0] + 0.3 * x[:, 1], IR[:, 0])[:len(x)]
    wr = oaconvolve(0.3 * x[:, 0] + 0.7 * x[:, 1], IR[:, 1])[:len(x)]
    return (1 - w) * x + w * np.stack([wl, wr], 1)

def reversed_chord(x, target, length):
    """Reverse a (reverberated) piano chord so its attack peak lands exactly on `target`, swelling in over `length` s."""
    x = hall(x, 0.45); pk = int(np.argmax(uniform_filter1d(np.square(x).sum(1), 480)))   # 10 ms energy peak
    a, b = pk - int(0.02 * SR), pk + int(length * SR)
    rev = x[a:b][::-1] * (np.minimum(1, np.linspace(0, 1.6, b - a)) ** 2)[:, None]
    out = np.zeros((N, 2)); s = int(round(target * SR)) - (b - 1 - pk)
    out[s:s + len(rev)] = rev
    return out

# stem: (gain dB, hall wet, eq)
CHAIN = {'piano': (0, 0.16, 'piano'), 'reverse': (-9, 0.16, 'piano'), 'strings': (-1, 0.28, 'strings'),
         'pad': (-7, 0.22, None), 'harp': (-5, 0.24, None), 'bells': (-5, 0.30, None), 'guitar': (-3, 0.18, None),
         'pizz': (-3, 0.18, None), 'timpani': (-3, 0.20, None), 'cymbal': (8, 0.30, 'cymbal')}

def process(name, x):
    g, w, eq = CHAIN[name]
    if name != 'timpani': x = filt(x, sos('high', 35, 4))
    if eq == 'strings': x = biquad(biquad(x, 'shelf', 7000, -2.5), 'peak', 2800, -2.0, 1.0)
    if eq == 'piano': x = biquad(x, 'peak', 120, 1.5, 0.8)
    if eq == 'cymbal': x = filt(x, sos('low', 4500, 2))
    return hall(x, w) * 10 ** (g / 20)

def glue(x, thr=-18.0, ratio=2.0, knee=6.0, att=0.03, rel=0.4, blk=240):
    """Gentle 2:1 bus compressor: 5 ms RMS detector, 30 ms attack, slow release, soft knee."""
    nb = len(x) // blk; lev = 10 * np.log10(np.mean(x[:nb * blk].reshape(nb, -1) ** 2, 1) + 1e-12)
    o = lev - thr; o = np.where(o > knee / 2, o, np.where(o > -knee / 2, (o + knee / 2) ** 2 / (2 * knee), 0))
    gr, g, ca, cr = np.zeros(nb), 0.0, np.exp(-blk / (att * SR)), np.exp(-blk / (rel * SR))
    for i, tg in enumerate(o * (1 - 1 / ratio)):
        c = ca if tg > g else cr; g = c * g + (1 - c) * tg; gr[i] = g
    return x * 10 ** (-np.interp(np.arange(len(x)), np.arange(nb) * blk + blk / 2, gr) / 20)[:, None], gr

def true_peak(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())

def limit(x, ceil=-1.6, la=0.002, rel=0.06, blk=48):
    """Look-ahead limiter on 4x-oversampled peaks: min-filter + boxcar of the gain (never above the needed gain), smooth release."""
    tp = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)[:4 * len(x)].reshape(len(x), 4).max(1)
    w = 2 * int(la * SR) + 1
    g = minimum_filter1d(np.minimum(1, 10 ** (ceil / 20) / np.maximum(tp, 1e-9)), w)
    nb = -(-len(g) // blk); gb = np.pad(g, (0, nb * blk - len(g)), constant_values=1).reshape(nb, blk).min(1)
    r = np.exp(-blk / (rel * SR))
    for i in range(1, nb): gb[i] = min(gb[i], 1 - (1 - gb[i - 1]) * r)
    return x * uniform_filter1d(np.repeat(gb, blk)[:len(g)], w)[:, None]

def db(x): return 10 * np.log10(np.mean(np.square(x)) + 1e-20)

def main():
    os.makedirs(TMP, exist_ok=True); os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
    raw = {p.name: render(p) for p in compose()}
    tails = {k: db(v[-SR:]) - 20 * np.log10(np.abs(v).max() + 1e-12) for k, v in raw.items()}   # stuck-note check
    raw['reverse'] = sum(reversed_chord(raw.pop(k), t, n) for k, t, n in (('revD', 28.8, 1.3), ('revE', 36.8, 0.8), ('revA', 70.4, 1.0)))
    mix = sum(process(k, fit(v)) for k, v in raw.items())
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-20 - meter.integrated_loudness(mix)) / 20)
    mix, gr = glue(mix)
    i = int((DUR - 0.4) * SR); mix[i:] *= (np.cos(np.linspace(0, np.pi / 2, N - i)) ** 2)[:, None]   # master fade 89.2-89.6
    for _ in range(8):                                           # -14 LUFS, then true-peak limit; repeat until both hold
        mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
        mix = limit(mix)
        if abs(meter.integrated_loudness(mix) + 14) < 0.05 and true_peak(mix) <= -1.55: break
    pcm = np.clip(np.round(mix * 32767 + rng.random(mix.shape) - rng.random(mix.shape)), -32768, 32767).astype(np.int16)
    out = os.path.join(HERE, 'audio', 'score.wav'); sf.write(out, pcm, SR, subtype='PCM_16')

    y, sr = sf.read(out, always_2d=True)                         # verify the file actually written
    L, tpk, avg = meter.integrated_loudness(y), true_peak(y), db(y)
    print('%s: %d samples (%.3f s) %d Hz %d ch' % (out, len(y), len(y) / sr, sr, y.shape[1]))
    print('integrated %.2f LUFS   true peak (4x) %.2f dBTP   film RMS %.1f dBFS   glue GR max %.1f dB' % (L, tpk, avg, gr.max()))
    print('stem tails (last 1 s of each render, dB re its peak):', ' '.join('%s %.0f' % kv for kv in tails.items()))
    w = [db(y[int(k * 0.4 * SR):int((k + 1) * 0.4 * SR)]) for k in range(int(round(DUR / 0.4)))]
    print('RMS dBFS per 0.4 s window:')
    for r0 in range(0, len(w), 8): print('  %5.1f  ' % (r0 * 0.4) + ' '.join('%6.1f' % v for v in w[r0:r0 + 8]))
    for a, b in ((4.4, 4.8), (22.1, 22.4), (44.8, 49.6), (62.4, 73.6), (73.6, 80.0), (80.0, 81.6), (83.2, 89.6)):
        print('  %4.1f-%4.1f  %6.1f dBFS  (%+.1f dB re film)' % (a, b, db(y[int(a * SR):int(b * SR)]), db(y[int(a * SR):int(b * SR)]) - avg))

if __name__ == '__main__':
    main()
