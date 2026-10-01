"""Score and sketchbook sounds for "IVDD field notes" (60 s, 92 BPM).

Music: a gentle but driving acoustic bed in D major. A fingerpicked guitar-like pluck (additive
string model), shaker, soft felt kick, plucked bass and a warm pad. It builds by section:
  hook     plucks on the beat and a pad
  signs    eighth-note picking and a shaker
  educate  felt kick on 1 and 3, plucked bass
  products kick on every beat, 16th shaker, a strum on each bar
  proof    an octave-up melody line and a fuller pad
  offer    finger snaps on 2 and 4, a rising strum, then it resolves to D on the CTA press
Sounds: pen writing, sketch strokes, scribbles, marker squeaks, ticks, page turns, paper landing,
register dings on prices, stamp thuds, a scissor cut on the coupon and the button press are
placed from cues.js (evaluated with node), so each lands on the frame it belongs to.
Normalised to -14 LUFS integrated, true peak kept under -1 dBTP (4x oversampled check).

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
rng = np.random.default_rng(11)  # fixed seed: identical on every run
PB = {k: v['beat'] for k, v in TL['PAGES'].items()}  # page start, in beats


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
        if i >= N: return
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

def snap():
    t = tt(0.12); x = bp(rng.standard_normal(len(t)), 1200, 5000) * env(len(t), 0.0005, 0.018)
    return x + 0.3 * np.sin(2 * np.pi * 1800 * t) * env(len(t), 0.0005, 0.01)

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
D9 = (38, [54, 57, 62, 64, 69]); Bm7 = (35, [54, 57, 62, 66, 69]); G7 = (43, [55, 59, 62, 66, 71]); A69 = (45, [57, 61, 64, 69, 71]); Asus = (45, [57, 62, 64, 69, 71])
BARS = [D9, Bm7, G7, A69] * 4 + [D9, G7, A69, Bm7, Asus, G7, D9]   # 23 bars of 4 beats
SIGNS, EDU, PROD, PROOF, OFFER = PB['signs'], PB['what'], PB['bundle'], PB['proof'], PB['offer']
RES = 88  # the CTA press: the resolve to D
END_B = int(round(DUR / B))
def chord(beat): return BARS[min(len(BARS) - 1, int(beat) // 4)]
def section(beat):
    if beat < SIGNS: return 0
    if beat < EDU: return 1
    if beat < PROD: return 2
    if beat < PROOF: return 3
    if beat < OFFER: return 4
    return 5

for bar in range(0, RES, 4):  # pad under each bar
    bass, v = chord(bar); sec = section(bar)
    music.add(bar * B, pad([bass + 12] + v[:4], 4 * B + 0.8, 1200 + 250 * sec), 0.08 + 0.012 * sec)
music.add(RES * B, pad([38, 50, 57, 62, 66, 69, 76], DUR - RES * B + 1.5, 2200), 0.17)

PAT = [0, 2, 1, 3, 2, 4, 3, 1]  # fingerpicking order over the voicing
for s in range(RES * 2):  # 8th notes
    beat, half = divmod(s, 2); t = s * B / 2
    bass, v = chord(beat); sec = section(beat)
    if sec == 0 and half: continue  # the hook picks only on the beat
    m = v[PAT[s % 8]] + (12 if (s % 8) == 5 and sec >= 2 else 0)
    g = (0.10 if half == 0 else 0.07) * (1 + 0.07 * sec)
    music.add(t, pluck(m, 1.3, 0.75 + 0.05 * sec), g, pan=0.35 if s % 2 else -0.25)
    if half == 0 and sec >= 2 and (beat % 2 == 0 or sec >= 3):  # plucked bass
        music.add(t, lp(pluck(bass if beat % 4 == 0 else bass + (7 if beat % 4 == 2 else 12), 1.4, 0.4, 0.3), 700), 0.26 + 0.02 * sec)
# proof and offer: a simple melody an octave up, one note per beat
MEL = [74, 76, 78, 76, 74, 73, 71, 73, 74, 78, 81, 78, 76, 74, 73, 71, 69, 71, 73, 76]
for i, beat in enumerate(range(int(PROOF + 0.5), RES)):
    music.add(beat * B, pluck(MEL[i % len(MEL)], 1.2, 1.0, 0.12), 0.085, pan=0.1)
for s in range(RES * 4):  # shaker
    beat = s // 4; t = s * B / 4; sec = section(beat)
    if sec == 0: continue
    if sec < 3 and s % 2: continue  # 8ths before the products, 16ths after
    acc = [0.45, 0.25, 1.0, 0.3][s % 4]
    music.add(t, shaker(acc), 0.045 + 0.006 * sec, pan=0.3)
for beat in range(int(EDU), RES):  # felt kick
    sec = section(beat)
    if beat % 2 == 0 or sec >= 3:
        music.add(beat * B, felt_kick(), 0.20 + 0.02 * sec)
for beat in range(int(OFFER), RES):  # snaps on 2 and 4 in the offer
    if beat % 2 == 1: music.add(beat * B, snap(), 0.16, pan=-0.15)
for bar in range(int(PROD) // 4 * 4 + 4, RES, 4):  # a strum on each bar from the products on
    bass, v = chord(bar)
    for i, m in enumerate([bass + 12] + v): music.add(bar * B + i * 0.018, pluck(m, 1.6, 0.8), 0.045, pan=(i - 3) * 0.1)
# the rising strum into the resolve
for i, m in enumerate([57, 62, 64, 69, 71, 76]): music.add((RES - 1) * B + i * 0.09, pluck(m, 1.0, 1.0), 0.07, pan=(i - 2.5) * 0.12)
# the resolve: a slow strum of D major 9 across the end card
for i, m in enumerate([38, 45, 50, 54, 57, 62, 64, 69]):
    music.add(RES * B + i * 0.035, pluck(m, 3.4, 0.9), 0.12, pan=(i - 3.5) * 0.11)
music.add(RES * B, lp(pluck(26, 3.2, 0.4, 0.3), 500), 0.38)
for k in range(1, 5):  # a few soft plucks ring on over the hold
    music.add((RES + k) * B, pluck([69, 74, 78, 81][k - 1], 1.6, 0.7), 0.05, pan=0.2)


# ---------- sketchbook sounds ----------
def strokes(dur, rate, band, grain=0.5, seed=0):
    """Pen on paper: bursts of filtered noise, one per stroke, with paper-tooth grain."""
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
        bus.add(t0, strokes(d, 9, (2200, 7500), 0.6, idx), 0.55, pan=0.12)
    elif kind == 'sketch':
        bus.add(t0, strokes(d, 4, (1400, 6000), 0.5, 100 + idx), 0.55, pan=-0.12)
    elif kind == 'scribble':
        bus.add(t0, strokes(d, 16, (1800, 7000), 0.6, 200 + idx), 0.58, pan=0.2)
    elif kind in ('marker', 'swipe'):
        n = int(SR * (d + 0.05)); k = np.linspace(0, 1, n)
        x = bp(rng.standard_normal(n), 700, 3200) * np.sin(np.pi * k) ** 0.6
        sq = np.sin(2 * np.pi * np.cumsum(1900 + 160 * np.sin(2 * np.pi * 9 * k * d)) / SR) * np.sin(np.pi * k) ** 2
        bus.add(t0, x + 0.07 * sq, 0.50, pan=-0.1)
    elif kind == 'knock':
        t = tt(0.3); f = hz(81)
        s = np.sin(2 * np.pi * f * t) * env(len(t), 0.001, 0.07) + 0.4 * np.sin(2 * np.pi * 3.9 * f * t) * env(len(t), 0.0005, 0.012)
        bus.add(t0, s + 0.3 * bp(rng.standard_normal(len(t)), 800, 3000) * env(len(t), 0.0003, 0.004), 0.30)
    elif kind == 'check':  # a quick pen tick: two strokes and a soft wooden tock
        bus.add(t0, strokes(0.12, 18, (2500, 8000), 0.5, 300 + idx), 0.7)
        t = tt(0.15); bus.add(t0 + d * 0.6, np.sin(2 * np.pi * hz(88) * t) * env(len(t), 0.001, 0.03), 0.18, pan=0.2)
    elif kind == 'bend':
        t = tt(0.5); f = 190 + 120 * (1 - np.exp(-t / 0.12))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.03, 0.16) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.03, 0.08), 0.32)
    elif kind == 'turn':
        bus.add(t0 - 0.05, noise_sweep(0.42, 1200, 5200), 0.50, pan=-0.3)
        bus.add(t0 + 0.24, lp(rng.standard_normal(int(SR * 0.12)), 400) * env(int(SR * 0.12), 0.005, 0.03), 0.3)
    elif kind == 'slap':  # a sheet of paper landing on the page
        tl = t0 + 0.2; n = int(SR * 0.2)
        bus.add(t0, noise_sweep(0.22, 2000, 6000, 'up'), 0.25)
        bus.add(tl, lp(rng.standard_normal(n), 1800) * env(n, 0.001, 0.025), 0.6)
        t = tt(0.2); bus.add(tl, np.sin(2 * np.pi * np.cumsum(120 + 60 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.05), 0.3)
    elif kind == 'ding':  # a soft register ding as the price lands
        tl = t0 + d * 0.9
        for i, m in enumerate([93, 100]): bus.add(tl + i * 0.07, bell(m, 1.2, 0.9), 0.17, pan=0.15)
        t = tt(0.05); bus.add(tl - 0.06, hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0003, 0.006), 0.4)
    elif kind == 'stamp':
        t = tt(0.32)
        bus.add(t0 + 0.06, np.sin(2 * np.pi * np.cumsum(85 + 80 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.07) + 0.5 * bp(rng.standard_normal(len(t)), 600, 4000) * env(len(t), 0.0005, 0.018), 0.75)
    elif kind == 'tear':  # scissors snipping along the coupon edge
        n_snips = 4
        for i in range(n_snips):
            ts = t0 + i * d / n_snips
            t = tt(0.07); bus.add(ts, hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0003, 0.012) + 0.4 * np.sin(2 * np.pi * 3400 * t) * env(len(t), 0.0005, 0.008), 0.5, pan=-0.3 + 0.2 * i)
            bus.add(ts + 0.02, strokes(0.08, 30, (3000, 9000), 0.7, 400 + i + idx * 10), 0.5)
    elif kind == 'star':
        for i in range(5): bus.add(t0 + i * d / 5, bell([86, 88, 90, 93, 95][i], 0.7, 1.0), 0.70, pan=(i - 2) * 0.2)
    elif kind == 'press':
        t = tt(0.06); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.005) * 0.8 + np.sin(2 * np.pi * 1600 * t) * env(len(t), 0.001, 0.014), 0.6)
        t = tt(0.25); bus.add(t0, np.sin(2 * np.pi * np.cumsum(90 + 50 * np.exp(-t / 0.03)) / SR) * env(len(t), 0.001, 0.06), 0.4)
    elif kind == 'resolve':
        for i, m in enumerate([81, 86, 90, 93]): bus.add(t0 + 0.05 + i * 0.04, bell(m, 2.4, 0.4), 0.10, pan=(i - 1.5) * 0.25)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, peaks ----------
M, U = music.out() * 2.6, ui.out() * 0.6
mix = M + U
fade = np.ones(N); nf = int(SR * 0.4); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]; M = M * fade[:, None]; U = U * fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain; M *= gain; U *= gain
ceiling = 10 ** (-2.0 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass the ceiling, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
print('integrated LUFS: %.2f  sample peak dBFS: %.2f  4x true peak: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), tp, len(CUES)))

# audibility: each cue's peak against the music's RMS over the same window
db = lambda x: 20 * np.log10(max(x, 1e-9))
worst = {}
for t0, kind, d in CUES:
    a, b = int(max(0, t0 - 0.05) * SR), int(min(DUR, t0 + max(d, 0.3)) * SR)
    if b <= a: continue
    over = db(np.abs(U[a:b]).max()) - db(np.sqrt((M[a:b] ** 2).mean()))
    worst[kind] = min(worst.get(kind, 99), over)
print('sfx peak over music RMS (worst per type, dB):', ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
print('music alone: %.1f LUFS, sounds alone: %.1f LUFS' % (meter.integrated_loudness(M), meter.integrated_loudness(U)))
