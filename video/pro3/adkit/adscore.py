"""Shared score for the Poorly Pet painted ad films: warm, upbeat and grown-up, sampled instruments only (FluidR3_GM via
FluidSynth), no sound effects. 96 BPM, 16 bars of 2.5 s = 40 s. Each film passes its key and picture hits:

    python3 ../adkit/adscore.py <film dir>        reads <film>/score.json {"key": "D", "minor_start": false, "hits": [..], "lift": 25.0, "end": 33.5, "seed": 1}
                                                  writes <film>/audio/score.wav (48 kHz 16-bit, -14 LUFS, true peak <= -1.6 dBTP before AAC)

Form: bars 1-2 intro (piano and strings), 3-10 groove (plucked guitar, bass, brushes and shaker), 11-13 lift (strings up,
harp), 14 breath before the offer, 15-16 end card (resolution, held chord, fade). Glockenspiel notes land on the hits.
"""
import os, sys, json, subprocess, tempfile
import numpy as np, mido, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter, oaconvolve, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

FILM = os.path.abspath(sys.argv[1]); CFG = json.load(open(os.path.join(FILM, 'score.json')))
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR, BPM = 48000, 96
BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = CFG.get('dur', 16 * BAR); N = int(round(SR * DUR)); TPB = 480
TMP = os.path.join(tempfile.gettempdir(), 'adscore-' + os.path.basename(FILM)); os.makedirs(TMP, exist_ok=True)
rng = np.random.default_rng(CFG.get('seed', 1))
KEYS = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
K = KEYS[CFG.get('key', 'D')]
HITS = CFG.get('hits', [])
END = CFG.get('end', 14 * BAR)            # end card lands: the resolution chord
# 16 bars of (scale degree, quality); the opening can start on vi for a more pensive hook
PROG = [(1, 'M'), (5, 'M'), (6, 'm'), (4, 'M'), (1, 'M'), (5, 'M'), (4, 'M'), (4, 'M'),
        (6, 'm'), (4, 'M'), (1, 'M'), (5, 'M'), (4, 'M'), (5, 'sus'), (1, 'M'), (1, 'M')]
if CFG.get('minor_start'): PROG[:2] = [(6, 'm'), (4, 'M')]
DEG = {1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9}
def chord(bar):
    d, q = PROG[min(bar, 15)]; root = (K + DEG[d]) % 12
    iv = {'M': (0, 4, 7), 'm': (0, 3, 7), 'sus': (0, 5, 7)}[q]
    bass = 36 + (root - 36) % 12                                   # E2..D#3 region
    up = sorted(55 + (root + i - 55) % 12 for i in iv)           # close voicing from G3
    return bass, up

class Part:
    def __init__(self, name, chans):
        self.name, self.ev = name, []
        for ch, (prog, vol, pan) in chans.items():
            self.ev.append((0, -1, mido.Message('program_change', channel=ch, program=prog)))
            for c, v in ((7, vol), (10, pan), (11, 127)): self.ev.append((0, 1, mido.Message('control_change', channel=ch, control=c, value=v)))
    def note(self, ch, t, n, d, v, exact=False):
        if not exact and min([abs(t - h) for h in HITS] + [9]) > 1e-6: t, v = t + rng.uniform(-0.007, 0.007), v + rng.integers(-5, 6)
        t = max(0.0, t); v = int(np.clip(round(v), 1, 127))
        self.ev += [(t, 2, mido.Message('note_on', channel=ch, note=int(n), velocity=v)), (t + d, 0, mido.Message('note_off', channel=ch, note=int(n), velocity=0))]
    def cc11(self, ch, pts):
        ts = np.arange(pts[0][0], pts[-1][0] + 1e-6, 0.05); vs = np.interp(ts, *zip(*pts)); last = None
        for t, v in zip(ts, np.round(vs)):
            if v != last: self.ev.append((t, 1, mido.Message('control_change', channel=ch, control=11, value=int(v)))); last = v
    def save(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB); tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0)); last = 0
        for tk, _, m in sorted(((int(round(t / BEAT * TPB)), o, m) for t, o, m in self.ev), key=lambda e: e[:2]):
            tr.append(m.copy(time=tk - last)); last = tk
        mid.save(path)

def compose():
    endbar = int(round(END / BAR))
    pn = Part('piano', {0: (0, 108, 60)})
    st = Part('strings', {1: (48, 96, 70), 2: (49, 80, 40)})
    gt = Part('guitar', {3: (24, 90, 84)})
    bs = Part('bass', {4: (32, 100, 64)})
    dr = Part('drums', {9: (40, 90, 64)})
    gl = Part('bells', {5: (9, 84, 76), 6: (46, 90, 56)})
    for b in range(16):
        t0 = b * BAR; bass, up = chord(b); groove = 2 <= b < endbar
        # strings: whole-bar chords, an octave of air above in the lift
        if b < endbar + 2:
            for n in up: st.note(1, t0, n, BAR + .08, 70)
            if 10 <= b < endbar: st.note(2, t0, up[-1] + 12, BAR + .08, 62)
        # piano: whole chords in the intro, then a syncopated pulse (eighths 0, 3, 4, 6), resting in the breath bar
        if b < 2: pn.note(0, t0, bass + 12, BAR, 64); [pn.note(0, t0 + .02 * k, n + 12, BAR, 58) for k, n in enumerate(up)]
        elif groove and b != endbar - 1:
            for e in (0, 3, 4, 6): [pn.note(0, t0 + e * BEAT / 2, n + 12, BEAT * .9, 52 + (10 if e == 0 else 0)) for n in up]
            pn.note(0, t0, bass + 12, BAR * .9, 58)
        # guitar: rolling eighth arpeggio
        if groove and b != endbar - 1:
            pool = up + [up[0] + 12, up[1] + 12]
            for e in range(8): gt.note(3, t0 + e * BEAT / 2, pool[[0, 2, 1, 3, 2, 4, 3, 1][e]], BEAT * .8, 54 + (8 if e % 2 == 0 else 0))
        # bass: root on 1 and the 'and' of 2, fifth on 4
        if groove and b != endbar - 1:
            for tt, n, v in ((0, bass, 84), (1.5 * BEAT, bass, 66), (3 * BEAT, bass + 7, 70)): bs.note(4, t0 + tt, n, BEAT * .9, v)
        # brushes: kick 1 and 3, rim 2 and 4, shaker eighths (busier in the lift)
        if groove and b != endbar - 1:
            for k in (0, 2): dr.note(9, t0 + k * BEAT, 36, .2, 70)
            for k in (1, 3): dr.note(9, t0 + k * BEAT, 37, .15, 44)
            for e in range(8): dr.note(9, t0 + e * BEAT / 2, 82 if b < 10 else 69, .1, 40 + (10 if e % 2 else 0))
    # breath bar: one held chord; end card: resolution chord on END, held to the fade
    bass, up = chord(endbar)
    pn.note(0, END, bass, 4.5, 80, True); [pn.note(0, END + .015 * k, n + 12, 4.5, 72, True) for k, n in enumerate(up)]
    pn.note(0, END, up[-1] + 24, 4.5, 60, True)
    # harp gliss into the lift and into the end card
    for t1 in (10 * BAR, END):
        sc = sorted({n + o for n in chord(10 if t1 < END else endbar)[1] for o in (0, 12, 24)})
        for k, n in enumerate(sc): gl.note(6, t1 - .6 + .6 * k / len(sc), n + 12, 1.5, 50 + 3 * k, True)
    # glockenspiel on the picture hits (chord tone, top of the voicing)
    for h in HITS: gl.note(5, h, chord(int(h // BAR))[1][-1] + 24, .9, 74, True)
    st.cc11(1, [(0, 70), (2 * BAR, 90), (10 * BAR, 110), (END - .2, 120), (END + 1, 100), (DUR, 70)])
    return [pn, st, gt, bs, dr, gl]

def render(p, gain=0.5):
    mid, wav = (os.path.join(TMP, p.name + e) for e in ('.mid', '.wav')); p.save(mid)
    subprocess.run(['fluidsynth', '-ni', '-q', '-R', '0', '-C', '0', '-O', 'float', '-g', str(gain), '-r', str(SR), '-F', wav, SF2, mid], check=True, capture_output=True)
    x, sr = sf.read(wav, always_2d=True); return np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output='sos')
def filt(x, s): return sosfilt(s, x, axis=0)
def peak(x, f, g, q=0.8):
    A, w = 10 ** (g / 40), 2 * np.pi * f / SR; c, al = np.cos(w), np.sin(w) / (2 * q)
    return lfilter([1 + al * A, -2 * c, 1 - al * A], [1 + al / A, -2 * c, 1 - al / A], x, axis=0)
def hall_ir(rt=1.8):
    r = np.random.default_rng(24); n = int(SR * rt * 1.2); t = np.arange(n)[:, None] / SR; ir = np.zeros((n, 2)); noise = r.standard_normal((n, 2))
    for lo, hi, k in ((None, 600, 1.15), (600, 2500, 1.0), (2500, 7000, .7), (7000, None, .4)):
        b = noise if lo is None else filt(noise, sos('high', lo, 4)); ir += (b if hi is None else filt(b, sos('low', hi, 4))) * np.exp(-6.91 * t / (rt * k))
    ir *= 1 - np.exp(-t / .02); ir = np.vstack([np.zeros((int(.015 * SR), 2)), ir]); return ir / np.sqrt(np.mean(np.sum(ir ** 2, 0)))
IR = hall_ir()
def hall(x, w):
    wl = oaconvolve(.7 * x[:, 0] + .3 * x[:, 1], IR[:, 0])[:len(x)]; wr = oaconvolve(.3 * x[:, 0] + .7 * x[:, 1], IR[:, 1])[:len(x)]
    return (1 - w) * x + w * np.stack([wl, wr], 1)
CHAIN = {'piano': (0, .16), 'strings': (-3, .26), 'guitar': (-4, .14), 'bass': (-2, .06), 'drums': (-6, .10), 'bells': (-6, .26)}
def process(name, x):
    g, w = CHAIN[name]; x = filt(x, sos('high', 30 if name == 'bass' else 45, 4))
    if name == 'piano': x = peak(x, 140, 1.0)
    if name == 'strings': x = peak(x, 2800, -2.0, 1.0)
    return hall(x, w) * 10 ** (g / 20)
def true_peak(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())
def limit(x, ceil=-1.6, la=.002, rel=.06, blk=48):
    tp = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)[:4 * len(x)].reshape(len(x), 4).max(1); w = 2 * int(la * SR) + 1
    g = minimum_filter1d(np.minimum(1, 10 ** (ceil / 20) / np.maximum(tp, 1e-9)), w)
    nb = -(-len(g) // blk); gb = np.pad(g, (0, nb * blk - len(g)), constant_values=1).reshape(nb, blk).min(1); r = np.exp(-blk / (rel * SR))
    for i in range(1, nb): gb[i] = min(gb[i], 1 - (1 - gb[i - 1]) * r)
    return x * uniform_filter1d(np.repeat(gb, blk)[:len(g)], w)[:, None]

def main():
    mix = sum(process(p.name, render(p)) for p in compose())
    i = int((DUR - .6) * SR); mix[i:] *= (np.cos(np.linspace(0, np.pi / 2, N - i)) ** 2)[:, None]
    m = pyln.Meter(SR)
    for _ in range(8):
        mix *= 10 ** ((-14 - m.integrated_loudness(mix)) / 20); mix = limit(mix)
        if abs(m.integrated_loudness(mix) + 14) < .05 and true_peak(mix) <= -1.55: break
    os.makedirs(os.path.join(FILM, 'audio'), exist_ok=True); out = os.path.join(FILM, 'audio', 'score.wav')
    sf.write(out, np.clip(np.round(mix * 32767), -32768, 32767).astype(np.int16), SR, subtype='PCM_16')
    y, _ = sf.read(out, always_2d=True); print('%s %.2f s  %.2f LUFS  %.2f dBTP' % (out, len(y) / SR, m.integrated_loudness(y), true_peak(y)))

if __name__ == '__main__':
    main()
