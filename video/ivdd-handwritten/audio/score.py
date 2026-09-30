"""Score and sketchbook sounds for "IVDD: 5 signs to know" (90 BPM, about 33 s).

Music: a gentle, acoustic-feeling bed. Fingerpicked plucks (additive string model), a light
shaker, a warm pad and a soft plucked bass on a G major progression. It thins out for sign 5
(Am7, no shaker) and resolves to Gmaj9 on the end card.
Sounds: pencil writing, sketch strokes, scribbles and marker swipes are made from filtered
noise and placed from cues.js (evaluated with node), so each one lands on the frame where the
line is drawn. Page turns get a paper swish, the ink wipes a brush swoosh, each product a
chime. Normalised to -14 LUFS with peaks under -1 dBFS.

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
js = "globalThis.window=globalThis;require(%r);console.log(JSON.stringify({TL:window.TL,CUES:window.CUES}))" % os.path.join(HERE, '..', 'cues.js')
data = json.loads(subprocess.check_output(['node', '-e', js]))
TL, CUES = data['TL'], data['CUES']
SR, BPM = 48000, TL['BPM']
B = 60 / BPM
DUR = TL['DUR']
N = int(SR * DUR)
rng = np.random.default_rng(7)  # fixed seed: identical on every run
PG = {k: v['t0'] for k, v in TL['PAGES'].items()}


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


class Bus:
    def __init__(self): self.l, self.r = np.zeros(N + SR * 4), np.zeros(N + SR * 4)
    def add(self, t0, sig, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i < 0: sig, i = sig[-i:], 0
        self.l[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))
    def out(self): return np.stack([self.l[:N], self.r[:N]], 1)


# ---------- instruments ----------
def pluck(m, dur=1.2, bright=1.0, pos=0.18):
    """A plucked string: harmonics shaped by the pluck position, upper ones dying faster."""
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 12):
        if f * k > 9000: break
        a = abs(np.sin(np.pi * k * pos)) / k ** (1.25 - 0.25 * bright)
        s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.6 + 1.1 * k) / (0.6 + 0.4 * bright))
    s += 0.25 * bp(rng.standard_normal(len(t)), 1500, 6000) * env(len(t), 0.0005, 0.004)
    return s * np.minimum(1, t / 0.002)

def pad(ms, dur, bright=1400):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for d, ph in [(0, 0), (.0035, 1.1), (-.003, 2.3)]:
            s += np.sin(2 * np.pi * hz(m) * (1 + d) * t + ph) + 0.25 * np.sin(4 * np.pi * hz(m) * (1 + d) * t + ph)
    a = np.clip(np.minimum(t / 0.6, (dur - t) / 0.8), 0, 1)
    return lp(s * a / len(ms), bright)

def shaker(g=1.0):
    n = int(SR * 0.09); x = bp(rng.standard_normal(n), 3500, 11000)
    e = np.minimum(1, np.arange(n) / (SR * 0.012)) * np.exp(-np.arange(n) / (SR * 0.028))
    return x * e * g

def felt_kick():
    t = tt(0.3); f = 50 + 45 * np.exp(-t / 0.04)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.1), 400)

def bell(m, dur=1.4, bright=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.18) + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.06)) * env(len(t), 0.002, dur / 3.2)

def noise_sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(60, f * 0.6), min(f * 1.6, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    return out * {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2, 'down': (1 - k) ** 2}[shape]


# ---------- music ----------
music = Bus()
# chord per 4-beat bar (MIDI): bass note, then the voicing the plucks pick through
G9 = (43, [55, 59, 62, 66, 69]); Em9 = (40, [52, 55, 59, 62, 66]); C9 = (36, [52, 55, 59, 62, 64]); Dsus = (38, [54, 57, 62, 64, 69])
Am7 = (45, [57, 60, 64, 67, 72])
BARS = [G9, Em9, C9, Dsus, G9, Em9, C9, Am7, Dsus, G9, Em9, C9]
END_BEAT = round(PG['end'] / B)  # the end card: resolve to G
S5, HELP, KIT = round(PG['s5'] / B), round(PG['help'] / B), round(PG['kit'] / B)
def chord(beat): return G9 if beat >= END_BEAT else BARS[min(len(BARS) - 1, beat // 4)]

total_beats = int(round(DUR / B))
for bar in range(0, END_BEAT, 4):  # pad under each bar
    bass, v = chord(bar)
    d = min(4, END_BEAT - bar) * B + 0.8
    music.add(bar * B, pad([bass + 12] + v[:4], d, 1100 if S5 <= bar < HELP else 1500), 0.10)
music.add(END_BEAT * B, pad([43, 55, 59, 62, 66, 69, 74], DUR - END_BEAT * B + 1.5, 2000), 0.16)

PAT = [0, 2, 1, 3, 2, 4, 3, 1]  # fingerpicking order over the voicing
for s in range(END_BEAT * 2):  # 8th notes
    beat, half = divmod(s, 2); t = s * B / 2
    bass, v = chord(beat)
    intro = beat < 7
    serious = S5 <= beat < HELP
    if intro and half: continue  # the intro picks only on the beat
    m = v[PAT[s % 8]] + (12 if (s % 8) in (5,) and not serious else 0)
    g = 0.11 if half == 0 else 0.075
    if serious: g *= 0.8
    music.add(t, pluck(m, 1.4, 0.8), g, pan=0.35 if s % 2 else -0.25)
    if half == 0 and beat % 2 == 0:  # plucked bass on beats 1 and 3
        music.add(t, lp(pluck(bass if beat % 4 == 0 else bass + 7, 1.6, 0.4, 0.3), 700), 0.30)
for s in range(END_BEAT * 4):  # shaker, 16ths, accent on the off-8ths
    beat = s // 4; t = s * B / 4
    if beat < 7 or S5 <= beat < HELP: continue
    acc = [0.45, 0.25, 1.0, 0.3][s % 4]
    music.add(t, shaker(acc), 0.05, pan=0.3)
for beat in range(7, END_BEAT):  # a soft felt kick on beats 1 and 3, away from sign 5
    if beat % 2 == 0 and not (S5 <= beat < HELP):
        music.add(beat * B, felt_kick(), 0.20)
# the resolve: a slow strum of G major 9 across the end card
for i, m in enumerate([43, 50, 55, 59, 62, 66, 69]):
    music.add(END_BEAT * B + i * 0.035, pluck(m, 3.0, 0.9), 0.13, pan=(i - 3) * 0.12)
music.add(END_BEAT * B, lp(pluck(31, 3.0, 0.4, 0.3), 500), 0.35)


# ---------- sketchbook sounds ----------
def strokes(dur, rate, band, grain=0.5, seed=0):
    """Pencil on paper: bursts of filtered noise, one per stroke, with paper-tooth grain."""
    r = np.random.default_rng(seed)
    n = int(SR * (dur + 0.08)); x = bp(r.standard_normal(n), *band)
    grit = np.abs(hp(r.standard_normal(n), 1500)) ** 2
    x = x * (1 - grain + grain * grit / (grit.mean() + 1e-9))
    e = np.zeros(n); t = 0.0
    while t < dur:
        L = r.uniform(0.6, 1.4) / rate; i0, i1 = int(t * SR), min(n, int((t + L) * SR))
        k = np.linspace(0, 1, i1 - i0)
        e[i0:i1] += np.sin(np.pi * k) ** 0.7 * r.uniform(0.6, 1.0)
        t += L * r.uniform(0.9, 1.25)
    return x * e

def sfx(kind, t0, d, bus, idx):
    if kind == 'pencil':
        bus.add(t0, strokes(d, 9, (2200, 7500), 0.6, idx), 0.42, pan=0.12)
    elif kind == 'sketch':
        bus.add(t0, strokes(d, 4, (1400, 6000), 0.5, idx), 0.44, pan=-0.12)
    elif kind == 'scribble':
        x = strokes(d, 16, (1800, 7000), 0.6, idx)
        bus.add(t0, x, 0.48, pan=0.2)
    elif kind in ('marker', 'swipe'):
        n = int(SR * (d + 0.05)); k = np.linspace(0, 1, n)
        x = bp(rng.standard_normal(n), 700, 3200) * np.sin(np.pi * k) ** 0.6
        sq = np.sin(2 * np.pi * np.cumsum(1900 + 120 * np.sin(2 * np.pi * 9 * k * d)) / SR) * np.sin(np.pi * k) ** 2
        bus.add(t0, x + 0.05 * sq, 0.40, pan=-0.1)
    elif kind == 'knock':
        t = tt(0.3); f = hz(79)
        s = np.sin(2 * np.pi * f * t) * env(len(t), 0.001, 0.07) + 0.4 * np.sin(2 * np.pi * 3.9 * f * t) * env(len(t), 0.0005, 0.012)
        bus.add(t0, s + 0.3 * bp(rng.standard_normal(len(t)), 800, 3000) * env(len(t), 0.0003, 0.004), 0.30)
    elif kind == 'bend':
        t = tt(0.5); f = 190 + 120 * (1 - np.exp(-t / 0.12))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.03, 0.16) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.03, 0.08), 0.30)
    elif kind == 'wobble':
        t = tt(0.6); f = 330 * (1 + 0.06 * np.sin(2 * np.pi * 7 * t))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.02, 0.22), 0.24)
    elif kind == 'yelp':
        t = tt(0.22); f = 500 + 900 * (t / t[-1]) ** 0.6
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.06), 0.28)
        bus.add(t0, bp(rng.standard_normal(len(t)), 1000, 5000) * env(len(t), 0.0005, 0.01), 0.3)
    elif kind == 'turn':
        bus.add(t0 - 0.05, noise_sweep(0.38, 1200, 5000), 0.40, pan=-0.3)
        bus.add(t0 + 0.2, lp(rng.standard_normal(int(SR * 0.12)), 400) * env(int(SR * 0.12), 0.005, 0.03), 0.3)
    elif kind == 'wipe':
        bus.add(t0, noise_sweep(0.6, 300, 2600), 0.46, pan=-0.2)
        bus.add(t0 + 0.5, noise_sweep(0.55, 2400, 500), 0.30, pan=0.2)
    elif kind == 'chime':
        base = [79, 83, 86][idx % 3]
        for i, m in enumerate([base, base + 4, base + 7]): bus.add(t0 + i * 0.05, bell(m, 1.4, 0.6), 0.16, pan=(i - 1) * 0.3)
    elif kind == 'resolve':
        for i, m in enumerate([74, 79, 83, 86]): bus.add(t0 + i * 0.03, bell(m, 2.4, 0.4), 0.10, pan=(i - 1.5) * 0.25)
        t = tt(1.6); bus.add(t0, np.sin(2 * np.pi * hz(43) * t) * env(len(t), 0.02, 0.6), 0.25)
    elif kind == 'tick':
        t = tt(0.05); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.004) * 0.8 + np.sin(2 * np.pi * 1700 * t) * env(len(t), 0.001, 0.012), 0.5)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, peaks ----------
M, U = music.out() * 1.9, ui.out() * 0.8
mix = M + U
fade = np.ones(N); nf = int(SR * 0.45); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]; M = M * fade[:, None]; U = U * fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain; M *= gain; U *= gain
ceiling = 10 ** (-1 / 20)
for _ in range(6):  # soft-clip only if 4x-oversampled peaks pass -1 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(CUES)))

# audibility: each cue's peak against the music's RMS over the same window
db = lambda x: 20 * np.log10(max(x, 1e-9))
worst = {}
for t0, kind, d in CUES:
    a, b = int(max(0, t0 - 0.05) * SR), int(min(DUR, t0 + max(d, 0.25)) * SR)
    if b <= a: continue
    over = db(np.abs(U[a:b]).max()) - db(np.sqrt((M[a:b] ** 2).mean()))
    worst[kind] = min(worst.get(kind, 99), over)
print('sfx peak over music RMS (worst per type, dB):', ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
