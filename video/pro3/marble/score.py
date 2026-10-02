"""Marble brand film score, 'Marble's Theme' (treatment.json final.music): 75 BPM, 4/4, 52.8 s, D major / B minor.

Composed in MIDI, one file per instrument group, each rendered as its own stem with real samples
(FluidR3_GM via FluidSynth, its reverb and chorus off). Then per-stem EQ and a synthetic convolution
hall, 2:1 bus glue, -14 LUFS and a look-ahead true-peak limiter at -1.6 dBTP (headroom for AAC, so the MP4 stays under -1 dBTP). There are no synthesised
sound effects or ambience: every sound is a sampled instrument (the reversed piano is a reversed stem).

    python3 score.py            writes audio/score.wav (48 kHz, 16-bit PCM, stereo, 2,534,400 samples)
"""
import os, subprocess, tempfile
import numpy as np, mido, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter, oaconvolve, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR, DUR = 48000, 52.8
N = int(round(SR * DUR))                     # 2,534,400 samples
TPB, BEAT = 480, 0.8                         # 75 BPM: one beat = 0.8 s, one bar = 3.2 s
SYNC = (0.0, 0.8, 4.8, 14.4, 15.2, 24.0, 28.4, 42.4, 43.2, 44.0, 44.8, 46.0)   # picture hits: never humanised
DMAJ = {2, 4, 6, 7, 9, 11, 1}
TMP = os.path.join(tempfile.gettempdir(), 'marble-score')
rng = np.random.default_rng(75)

# ---------- harmony: time, bass, close upper voicing (>= C3) shared by the pad and the string bed ----------
HARM = [(0.0, 38, (50, 57)), (3.2, 47, (54, 59, 61)), (4.4, 0, ()), (4.8, 35, (54, 59)),          # D, Bm(add9), breath
        (6.4, 43, (54, 59, 62)), (8.0, 45, (57, 62, 64)), (8.8, 45, (57, 61, 64)),                 # Gmaj7 Asus4 A
        (9.6, 47, (54, 59, 62)), (11.2, 45, (55, 59, 62)), (12.8, 40, (52, 55, 59, 62)),          # Bm G/A Em7
        (14.4, 43, (55, 59, 62, 64)), (16.0, 42, (54, 59, 61)), (16.8, 42, (54, 58, 61)), (17.1, 0, ()),
        (17.6, 35, (54, 59, 62)), (19.2, 43, (55, 59, 62)), (20.8, 42, (54, 57, 62)),              # Bm G D/F#
        (22.4, 40, (55, 59, 64)), (23.2, 45, (57, 61, 64)), (24.0, 50, (54, 57, 62)),              # Em A | D
        (25.6, 49, (57, 61, 64)), (27.2, 47, (54, 57, 62)), (28.0, 43, (55, 59, 62)),              # A/C# Bm7 G
        (28.8, 42, (54, 57, 62)), (29.6, 40, (55, 59, 62)), (30.0, 45, (55, 57, 62)),              # D/F# Em7 A7sus4
        (30.4, 43, (55, 59, 62)), (32.0, 42, (54, 57, 62)), (33.6, 40, (55, 59, 62)),              # G D/F# Em7
        (35.2, 45, (55, 57, 62)), (36.0, 45, (57, 61, 64)), (36.8, 50, (54, 57, 62)),              # A7sus4 A | D
        (38.4, 47, (54, 59, 62)), (40.0, 43, (55, 59, 62)), (40.8, 45, (55, 57, 62)),              # Bm G A7sus4
        (41.6, 45, (55, 59, 62)), (43.2, 45, (55, 57, 62)), (44.0, 45, (55, 57, 61)),              # G/A A7sus4 A7
        (44.8, 38, (50, 54, 57, 62)), (46.4, 43, (50, 55, 59, 62)), (47.2, 38, (50, 54, 57, 62)),  # D G D
        (48.0, 42, (54, 57, 62)), (48.8, 43, (55, 59, 62)), (49.6, 38, (54, 57, 62)),              # coda D/F# G D
        (50.4, 38, (50, 57, 62, 64)), (52.8, 0, ())]                                               # Dadd9

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

    # ---- piano: legato pedal changes, released completely for the two silences ----
    pn.cc(0, 0, 64, 127)
    for t in (1.6, 3.2, 6.4, 8.0, 8.8, 9.6, 11.2, 12.8, 14.4, 16.0, 16.8, 19.2, 20.8, 22.4, 23.2, 24.0, 25.2, 25.6, 27.2,
              28.0, 28.8, 29.6, 30.0, 30.4, 32.0, 33.6, 35.2, 36.0, 36.8, 38.4, 40.0, 40.8, 41.6, 42.4, 43.2, 44.0, 44.8,
              46.4, 47.2, 48.0, 48.8, 49.2, 49.6, 50.4):
        pn.cc(0, t - 0.03, 64, 0); pn.cc(0, t + 0.06, 64, 127)
    for t, v in ((4.4, 0), (4.8, 127), (17.1, 0), (17.2, 127), (17.28, 0), (17.6, 127), (53.0, 0)): pn.cc(0, t, 64, v)
    P(0.0, [38, 45, 54], 50, 3.2, roll=0.06)                                     # S01 rolled D2-A2-F#3
    P(0.0, [69], 60, 1.3); P(1.2, [78], 62, 0.4); P(1.6, [76], 58, 1.6)          # motif A4-F#5-E5, held, unresolved
    P(3.2, [47, 54], 36, 1.2, roll=0.04); P(3.2, [59, 66], 42, 1.2)              # S02 Bm(add9), minor answer
    P(3.6, [74], 48, 0.8); P(4.0, [73], 44, 0.4)                                 # ... all released at 4.4
    P(4.8, [35, 42, 47], 56, 1.6)                                                # 'IVDD': low B octave + F#2
    P(6.4, [43, 50], 40); P(7.2, [59, 66], 34, 0.8)                              # S03 Gmaj7
    P(8.0, [45, 52], 42); P(8.0, [57, 62, 64], 38, 0.8); P(8.8, [57, 61, 64], 40, 0.8)
    P(9.6, [47, 54], 42, roll=0.05); P(9.6, [59, 62, 66], 40)                    # S04 Bm, minor fragment
    P(10.4, [78], 50, 0.4); P(10.8, [74], 48, 0.4); P(11.2, [73], 46)
    P(11.2, [55], 38, 3.2); P(11.2, [59, 62], 38, 4.8)                           # G, held into Em7 (common tones)
    P(12.8, [40, 47], 44)                                                        # S05 Em7
    P(14.4, [43, 50], 40); P(14.4, [64], 34); P(14.4, [83], 35)                  # Em7/G; B5 on the first term
    P(15.2, [78], 35, 0.8)                                                       # F#5 on the second term
    P(16.0, [42, 49], 42, 1.1); P(16.0, [59, 61, 66], 40, 0.8); P(16.8, [58, 61, 66], 40, 0.3)   # F#sus4 -> F#
    P(17.2, [42], 34, 0.08)                                                      # lamp out: F#2, damped for the silence
    for t, ns, v in ((17.6, [35, 47], 46), (19.2, [31, 43], 46), (20.8, [30, 42], 48), (22.4, [28, 40], 50), (23.2, [33, 45], 52)):
        P(t, ns, v, 0.8 if t > 23 else 1.6)                                      # S06-S07 left-hand half notes
    P(24.0, [38, 45], 54); P(24.0, [81], 66, 0.8); P(24.8, [90], 64, 0.4); P(25.2, [88], 60, 2.0)   # motif an octave up
    for t, ns in ((25.6, [37, 49]), (27.2, [35, 42]), (28.0, [43, 50]), (28.8, [42, 50]), (29.6, [40, 47]), (30.0, [45, 52])):
        P(t, ns, 48, 0.8 if t > 27.5 else 1.6)
    P(30.8, [83], 46, 0.8); P(31.6, [81], 44, 0.4); P(32.0, [78], 48)             # S10-S11 sparse answers above
    P(34.0, [79], 46, 0.4); P(34.4, [78], 44, 0.4); P(34.8, [76], 48, 1.2)
    P(36.8, [38, 50], 72); P(36.8, [69, 81], 70, 1.2); P(38.0, [78, 90], 70, 0.4)   # S12 dog accents + motif in octaves
    P(38.4, [35, 47], 74); P(38.4, [76, 88], 68)
    P(40.0, [31, 43], 76, 0.8); P(40.0, [59, 62, 67], 56, 0.8)
    P(40.8, [33, 45], 60); P(40.8, [57, 62, 67], 56, 0.8); P(41.6, [62, 67, 71], 58, 0.8)
    P(42.4, [69, 81], 80, 0.8); P(42.4, [45, 52], 60, 0.8)                       # S13 pickups on the paint wash
    P(43.2, [78, 90], 86, 0.8); P(43.2, [33, 45], 70, 0.8); P(43.2, [62, 67], 58, 0.8)
    P(44.0, [76, 88], 90, 0.8); P(44.0, [45, 52, 55], 70, 0.8); P(44.0, [61, 67], 60, 0.8)
    P(44.8, [74, 81, 86], 100); P(44.8, [38, 45, 50], 92)                        # RESOLUTION: D5
    P(46.4, [43, 50], 64, 0.8); P(46.4, [71, 74, 79], 60, 0.8)
    P(47.2, [38, 45], 58, 0.8); P(47.2, [69, 74, 78], 54, 0.8)
    P(48.0, [42, 50], 48, 0.8); P(48.0, [69], 58, 0.8)                           # S14 coda: the motif resolved
    P(48.8, [43, 50], 46, 0.8); P(48.8, [59, 62], 36, 0.8); P(48.8, [78], 60, 0.4); P(49.2, [76], 54, 0.4)
    P(49.6, [38, 45], 48, 0.8); P(49.6, [66, 69], 38, 0.8); P(49.6, [74], 60, 3.2)
    P(50.4, [38, 45], 46, 2.4, roll=0.07); P(50.4, [62, 64, 66, 69], 40, 2.4, roll=0.06)   # Dadd9 rings out

    # ---- strings: bed (Ens 1 + Ens 2), low line, violins; long CC11 swells, released before each silence ----
    lines(st, (2,), [(3.2, (47, 54))], 4.4, 46)
    lines(st, (2,), [(4.95, (47,)), (6.4, (43,)), (8.0, (45,)), (9.6, (47,)), (11.2, (45,)), (12.0, (43,))], 12.8, 66)
    lines(st, (2,), [(t, ns + (ns[0] + 12,) if ns[0] < 40 else ns) for t, ns in segs(20.8, 48.4, 1)], 48.4, 70)
    lines(st, (0, 1), segs(6.4, 12.8), 12.8, 66)
    lines(st, (0, 1), segs(20.8, 48.4), 48.4, 70)
    lines(st, (3,), [(12.8, (78,))], 17.1, 60)
    lines(st, (3,), [(29.9, (81,))], 30.7, 64)
    lines(st, (3,), [(36.8, (66,)), (38.0, (69,)), (38.4, (71,)), (39.6, (73,)), (40.0, (76,)), (41.6, (71,)),
                     (42.4, (69,)), (43.2, (78,)), (44.0, (76,)), (44.8, (74,)), (46.4, (71,)), (47.2, (69,))], 48.2, 72)
    st.expr((2,), [(3.2, 30), (4.25, 60), (4.4, 0)])
    st.expr((2,), [(4.95, 0), (5.1, 18), (6.4, 72), (8.2, 62), (9.4, 92), (9.9, 64), (12.0, 56), (12.4, 50), (12.8, 0)], 0.1)
    st.expr((2,), [(20.8, 0), (21.4, 50), (24.0, 84), (30.0, 90), (30.4, 86), (36.8, 72), (44.6, 124), (44.8, 127),
                   (46.4, 116), (47.2, 100), (48.4, 0)], 0.1)
    st.expr((0, 1), [(6.4, 0), (7.0, 40), (8.2, 42), (9.4, 85), (9.9, 50), (11.2, 44), (12.3, 40), (12.8, 0)], 0.1)
    st.expr((0, 1), [(20.8, 0), (21.6, 46), (24.0, 80), (27.2, 80), (30.0, 90), (30.4, 76), (33.0, 74), (33.6, 92),
                     (34.4, 76), (36.0, 72), (36.8, 60), (40.0, 80), (42.4, 98), (44.6, 124), (44.8, 127), (46.4, 116),
                     (47.2, 100), (48.4, 0)], 0.1)
    st.expr((3,), [(12.8, 0), (13.8, 42), (16.6, 40), (17.0, 10), (17.1, 0)])
    st.expr((3,), [(29.9, 0), (30.3, 70), (30.7, 0)])
    st.expr((3,), [(36.8, 0), (37.4, 58), (40.0, 74), (42.4, 92), (44.6, 122), (44.8, 127), (46.4, 112), (47.2, 96), (48.2, 0)], 0.1)

    # ---- warm pad under everything, out for the two silences; shimmer 29.9-30.4 ----
    lines(pad, (0,), segs(0.0, 4.4), 4.4, 70)
    lines(pad, (0,), segs(5.2, 17.1), 17.1, 70)
    lines(pad, (0,), segs(17.6, 52.8), 52.8, 70)
    lines(pad, (1,), [(29.9, (69, 76))], 30.8, 70)
    pad.expr((0,), [(0.0, 46), (3.2, 52), (4.25, 52), (4.4, 0)])
    pad.expr((0,), [(5.2, 0), (6.4, 56), (9.6, 58), (11.2, 50), (14.4, 54), (16.8, 54), (16.95, 50), (17.1, 0)], 0.1)
    pad.expr((0,), [(17.6, 0), (18.6, 54), (24.0, 70), (30.4, 72), (36.8, 70), (44.8, 100), (47.2, 92), (48.0, 84),
                    (50.4, 88), (52.8, 74)], 0.1)
    pad.expr((1,), [(29.9, 0), (30.3, 80), (30.8, 0)])

    # ---- harp ----
    hp.chord(0, 6.40, [62, 66, 69], 1.5, 58, 0.018); hp.chord(1, 6.65, [71, 74, 76], 1.5, 60, 0.018)   # brush strokes L R L
    hp.chord(0, 6.90, [78, 81, 83], 1.5, 56, 0.018); hp.note(0, 7.5, 86, 2.0, 42)                      # 'harmonic' D6
    gliss(hp, 8.8, 9.5, 66, 38, 56, 44)                                          # low falling gliss: the dive
    gliss(hp, 23.4, 24.0, 50, 81, 34, 54)                                        # up-gliss into 24.0
    arps(hp, 24.0, 27.2, 0.4, 42, 48); arps(hp, 27.2, 30.4, 0.2, 44, 54)          # rolling eighths, thickening
    gliss(hp, 36.0, 36.75, 57, 81, 38, 60)                                       # up-gliss into S12
    arps(hp, 36.8, 43.2, 0.2, 44, 62)                                            # sixteenths through the build
    hp.chord(0, 43.6, [62, 64, 67, 69, 76], 1.2, 58, 0.035)                      # figure on stroke 2
    gliss(hp, 44.8, 45.6, 93, 62, 66, 48)                                        # descending gliss at the resolution
    hp.chord(0, 50.4, [50, 57, 64, 66, 69, 74, 76], 2.4, 50, 0.05)               # final Dadd9 roll

    # ---- tuned chimes: exactly three ----
    bl.note(0, 0.8, 90, 2.0, 54); bl.note(1, 28.4, 90, 2.0, 50)
    bl.chord(0, 46.0, [86, 93], 2.4, 52); bl.chord(1, 46.0, [86, 93], 2.4, 42)

    # ---- pizzicato: the search ostinato, light off-beats, low accents on the dog cuts ----
    for k in range(16):
        t = 17.6 + 0.4 * k
        pz.note(k % 2, t, (59, 54, 62, 54)[k % 4] if t < 23.1 else (61, 52)[k % 2], 0.3, 38 + 22 * min(1, (t - 17.6) / 4.4))
    for k in range(8):
        t = 24.4 + 0.8 * k; up = at(t)[2]; pz.note(k % 2, t, up[k % len(up)], 0.3, 40)
    for k, (t, n) in enumerate(((36.8, 38), (38.4, 35), (40.0, 43))): pz.note(k % 2, t, n, 0.5, 72)

    # ---- nylon guitar, fingerpicked from 30.4 ----
    GT = [(30.4, 43, (50, 55, 59)), (32.0, 42, (50, 57, 62)), (33.6, 40, (50, 55, 59)), (35.2, 45, (52, 55, 62)),
          (36.0, 45, (52, 57, 61)), (36.8, 50, (57, 62, 66)), (38.4, 47, (54, 59, 62)), (40.0, 43, (50, 55, 59)),
          (40.8, 45, (52, 55, 62)), (41.6, 45, (50, 55, 59)), (43.2, 45, (52, 55, 62)), (44.0, 45, (52, 55, 61)), (44.8, 0, ())]
    for (t0, b, u), (t1, _, _) in zip(GT, GT[1:]):
        for k in range(int(round((t1 - t0) / 0.4))):
            t = t0 + 0.4 * k; c = 12 * (t - 30.4) / 14.4
            gt.note(0, t, (b, u[0], u[2], u[1])[k % 4], min(1.4, t1 - t + 0.1), (52 if k % 4 == 0 else 42) + c)
    gt.chord(0, 44.8, [50, 57, 62, 66], 1.6, 58, 0.025); gt.chord(0, 46.4, [43, 50, 55, 59], 0.8, 46, 0.03)
    gt.chord(0, 47.2, [50, 57, 62, 66], 1.2, 40, 0.03)

    # ---- timpani: soft strokes on the dogs, A2 roll from 40.8, one soft D2 at the resolution ----
    for t, n in ((36.8, 38), (38.4, 47), (40.0, 43)): tp.note(0, t, n, 1.0, 54)
    for k in range(int((44.75 - 40.8) * 15) + 1):
        t = 40.8 + k / 15
        tp.note(k % 2, t, 45, 0.3, 26 + 10 * min(1, (t - 40.8) / 2.4) + 40 * max(0, (t - 43.2) / 1.6) ** 1.5)
    tp.note(0, 44.8, 38, 1.5, 66)

    # ---- cymbal swells (twice only): soft Ride 1 roll in 32nd-note triplets, 10 -> 70, ending on the downbeat ----
    for t0, t1 in ((23.2, 24.0), (43.2, 44.8)):
        n = int(round((t1 - t0) * 15))
        for k in range(n + 1): cy.note(9, t0 + (t1 - t0) * k / n, 51, 2.0 if k == n else 0.2, 10 + 60 * (k / n) ** 1.5)

    # ---- reversed piano chords: D major into 24.0, A into 33.6 (rendered forward, reversed later) ----
    rd = Part('revD', {0: (0, 112, 64)}); rd.chord(0, 0.5, [50, 57, 62, 66, 69], 3.0, 84)
    ra = Part('revA', {0: (0, 112, 64)}); ra.chord(0, 0.5, [57, 64, 69], 3.0, 84)
    for p in (rd, ra): p.cc(0, 0, 64, 127); p.cc(0, 3.6, 64, 0)
    return [pn, st, pad, hp, bl, gt, pz, tp, cy, rd, ra]

# ---------- rendering and DSP ----------
def render(p, gain=0.5):
    mid, wav = (os.path.join(TMP, p.name + e) for e in ('.mid', '.wav'))
    p.save(mid, 6.0 if p.name.startswith('rev') else 58.0)
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
    raw['reverse'] = reversed_chord(raw.pop('revD'), 24.0, 1.3) + reversed_chord(raw.pop('revA'), 33.6, 1.0)
    mix = sum(process(k, fit(v)) for k, v in raw.items())
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-20 - meter.integrated_loudness(mix)) / 20)
    mix, gr = glue(mix)
    i = int(52.5 * SR); mix[i:] *= (np.cos(np.linspace(0, np.pi / 2, N - i)) ** 2)[:, None]   # master fade 52.5-52.8
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
    w = [db(y[int(k * 0.4 * SR):int((k + 1) * 0.4 * SR)]) for k in range(132)]
    print('RMS dBFS per 0.4 s window:')
    for r0 in range(0, 132, 8): print('  %5.1f  ' % (r0 * 0.4) + ' '.join('%6.1f' % v for v in w[r0:r0 + 8]))
    for a, b in ((4.4, 4.8), (17.3, 17.6), (36.8, 44.8), (44.8, 46.4), (48.0, 52.8)):
        print('  %4.1f-%4.1f  %6.1f dBFS  (%+.1f dB re film)' % (a, b, db(y[int(a * SR):int(b * SR)]), db(y[int(a * SR):int(b * SR)]) - avg))

if __name__ == '__main__':
    main()
