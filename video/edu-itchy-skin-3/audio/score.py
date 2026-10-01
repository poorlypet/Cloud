"""Score and UI sounds for the itchy skin guide III (84 BPM, 61 s).

A calm, warm bed: soft piano and pad for the hook, a gentle kick, shaker and sub from the
first lesson, an 8th-note pluck under the products, a brighter pad for the offer, and one held
chord when the button is pressed. UI sounds come from cues.js so each lands on its frame.
Normalised to -14 LUFS with 4x-oversampled peaks held under -4 dBFS (so the AAC file stays under -1 dBTP).

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR, BPM = 48000, 61.0, 84
BEAT = 60 / BPM
BAR = 4 * BEAT
N = int(SR * DUR)
END = 58.9  # button press: the music resolves here
rng = np.random.default_rng(7)


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


class Bus:
    def __init__(self): self.l, self.r = np.zeros(N + SR * 6), np.zeros(N + SR * 6)
    def add(self, t0, sig, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i < 0: sig, i = sig[-i:], 0
        self.l[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))
    def out(self): return np.stack([self.l[:N], self.r[:N]], 1)


def piano(m, dur=2.0, vel=1.0):
    t = tt(dur); f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.2 + 1.6 * k)) for k, a in [(1, 1), (2, .45), (3, .22), (4, .1)])
    s += 0.08 * hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0005, 0.006)
    return lp(s * np.minimum(1, t / 0.004) * vel, 2600 + 1400 * vel)

def pad(m, dur, bright=1500):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) / k for k, d, p in [(1, 0, 0), (1, .003, 1.3), (2, -.002, 2.1), (3, .0015, .5)])
    a = np.clip(np.minimum(t / 0.8, (dur - t) / 0.9), 0, 1)
    return lp(s * a, bright)

def pluck(m, dur=0.5):
    t = tt(dur); f = hz(m)
    return lp((np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .05)) * env(len(t), 0.002, 0.16), 3000)

def sub(m, dur):
    t = tt(dur); f = hz(m)
    a = np.clip(np.minimum(t / 0.02, (dur - t) / 0.08), 0, 1)
    return lp((np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)) * a, 400)

def kick():
    t = tt(0.35); f = 45 + 55 * np.exp(-t / 0.03)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.11), 600)

def shaker():
    n = int(SR * 0.08); return bp(rng.standard_normal(n), 5000, 11000) * env(n, 0.012, 0.018)

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.15)) * env(len(t), 0.002, dur / 3.5)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    return out * {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]


# ---------- music ----------
music = Bus()
# Fmaj9, Am7, Dm9, Bbmaj9: one chord per bar
CH = [[53, 57, 60, 64, 67], [57, 60, 64, 67, 71], [50, 53, 57, 60, 64], [46, 50, 53, 57, 60]]
ROOT = [29, 33, 26, 34]
bars = int(END / BAR) + 1
for b in range(bars):
    t0 = b * BAR
    if t0 >= END: break
    c = CH[b % 4]; dur = min(BAR, END - t0)
    lift = 52.15 <= t0 < END
    for i, m in enumerate(c[1:]): music.add(t0, pad(m + 12, dur + 0.9, 2200 if lift else 1500), 0.03, pan=(i - 1.5) * 0.35)
    # piano: a slow broken chord, two notes per beat
    pat = [0, 2, 4, 3, 1, 2, 4, 2]
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= END: break
        if t0 < 4.9 and k % 2: continue  # sparser in the hook
        music.add(tk, piano(c[pat[k]] + 12, 1.6, 0.8 if k % 2 else 1.0), 0.09, pan=0.25 if k % 2 else -0.15)
    if t0 >= 4.9:
        music.add(t0, sub(ROOT[b % 4] + 12, dur), 0.22)
        for k in range(4):
            tk = t0 + k * BEAT
            if tk >= END: break
            if k in (0, 2): music.add(tk, kick(), 0.42)
            for h in (0, 1): music.add(tk + h * BEAT / 2, shaker(), 0.05 if h else 0.03, pan=0.3)
    if 28.5 <= t0 < 47.1 or 52.15 <= t0:  # 8th pluck under the products and the offer
        for k in range(8):
            tk = t0 + k * BEAT / 2
            if tk >= END: break
            music.add(tk, pluck(c[[0, 4, 2, 4, 1, 4, 3, 4][k]] + 24, 0.45), 0.035, pan=0.45 if k % 2 else -0.45)
# resolve: one held Fmaj9 chord from the button press to the end
for i, m in enumerate([41, 53, 60, 64, 67, 69, 72]): music.add(END, pad(m, DUR - END + 1, 2400), 0.05, pan=(i - 3) * 0.15)
for i, m in enumerate([65, 69, 72, 76]): music.add(END + i * 0.06, piano(m, 2.4, 0.9), 0.08, pan=(i - 1.5) * 0.25)
music.add(END, sub(29, DUR - END), 0.25)

# ---------- UI sounds ----------
POP = [72, 74, 76, 77, 79, 81, 84, 86]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'pop':
        t = tt(0.14); f = hz(POP[num % len(POP)]) * (1 + 0.5 * np.exp(-t / 0.014))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.04), 0.3, pan=((num % 5) - 2) * 0.15)
    elif k == 'swish':
        bus.add(t0 - 0.1, sweep(0.26, 900, 5000), 0.2)
    elif k == 'whoosh':
        bus.add(t0 - 0.15, sweep(0.5, 250, 3200), 0.32)
    elif k == 'scratch':
        n = int(SR * 0.22); x = bp(rng.standard_normal(n), 1500, 6000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 40)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
        bus.add(t0, x, 0.42, pan=0.2)
    elif k == 'draw':
        n = int(SR * 0.4); x = bp(rng.standard_normal(n), 2500, 7000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 26)) * np.sin(np.pi * np.linspace(0, 1, n))
        bus.add(t0, x, 0.3, pan=-0.2)
    elif k == 'card':
        t = tt(0.12); bus.add(t0, np.sin(2 * np.pi * 180 * t) * env(len(t), 0.002, 0.03) + 0.4 * sweep(0.12, 900, 2500), 0.4)
    elif k == 'check':
        bus.add(t0, bell([76, 79, 81, 84][num % 4], 0.7, 0.6), 0.2, pan=0.15)
    elif k == 'ding':
        bus.add(t0, bell(88, 1.0, 0.8), 0.17); bus.add(t0 + 0.07, bell(93, 1.2, 0.6), 0.14)
    elif k == 'star':
        bus.add(t0, bell([84, 86, 88, 91, 93][num % 5], 0.7, 1.0), 0.13, pan=(num - 2) * 0.2)
    elif k == 'reveal':
        bus.add(t0 - 0.05, sweep(0.9, 180, 2400), 0.3)
        t = tt(1.2); bus.add(t0 + 0.15, np.sin(2 * np.pi * np.cumsum(55 + 25 * np.exp(-t / 0.08)) / SR) * env(len(t), 0.01, 0.35), 0.35)
    elif k == 'lift':
        t = tt(0.6); f = hz(64) * (1 + 0.5 * t / 0.6)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.6) ** 2 * 0.5 + sweep(0.6, 400, 2600) * 0.6, 0.22)
    elif k == 'shimmer':
        for i, m in enumerate([88, 91, 95, 100]): bus.add(t0 + i * 0.07, bell(m, 0.9, 0.3), 0.07, pan=(i - 1.5) * 0.4)
    elif k == 'fill':
        d = 1.6; t = tt(d); f = 400 * 2 ** (1.2 * t / d)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) * np.exp(-((t - d) / 0.5) ** 2) * 0.4 + sweep(d, 600, 5000, 'up') * 0.5, 0.2)
    elif k == 'count':
        t = tt(0.04); bus.add(t0, np.sin(2 * np.pi * hz(84 + num) * t) * env(len(t), 0.0005, 0.01), 0.22, pan=0.1)
    elif k == 'stamp':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.06) + 0.4 * bp(rng.standard_normal(len(t)), 800, 4000) * env(len(t), 0.0005, 0.015), 0.45)
    elif k == 'key':
        t = tt(0.03); bus.add(t0, lp(hp(rng.standard_normal(len(t)), 2500), 8000) * env(len(t), 0.0008, 0.005) + 0.4 * np.sin(2 * np.pi * 1500 * t) * env(len(t), 0.0008, 0.006), 0.4, pan=0.1)
    elif k == 'tick':
        t = tt(0.03); bus.add(t0, np.sin(2 * np.pi * 2600 * t) * env(len(t), 0.0005, 0.006), 0.25, pan=-0.1)
    elif k == 'chime':
        for i, m in enumerate([81, 85, 88]): bus.add(t0 + i * 0.045, bell(m, 1.4, 0.7), 0.15, pan=(i - 1) * 0.3)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.004) * 0.8 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.012), 0.6)
    elif k == 'confirm':
        for i, m in enumerate([81, 84, 88]): bus.add(t0 + i * 0.05, bell(m, 1.4, 0.6), 0.16, pan=(i - 1) * 0.3)

src = open(os.path.join(HERE, '..', 'cues.js')).read()
cues = json.loads(re.search(r'window\.CUES\s*=\s*(\[.*\]);', src, re.S).group(1))
def kind_of(c): return re.sub(r'\d', '', c)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
mus = music.out() * 0.8
buses = {}
for t0, kind in cues: sfx(kind, t0, buses.setdefault(kind_of(kind), Bus()))
# balance each cue type so its quietest hit sits about +5 dB over the music under it
WIN = {'swish': (-0.08, 0.06), 'whoosh': (-0.1, 0.08), 'fill': (0.9, 1.5), 'reveal': (0.0, 0.3), 'lift': (0.15, 0.45)}
def margins(k, x):
    out = []
    for t0, kind in cues:
        if kind_of(kind) != k: continue
        a, b = WIN.get(k, (0.0, 0.08)); i, j = int(max(0, t0 + a) * SR), int((t0 + b) * SR)
        out.append(20 * np.log10(rms(x[i:j]) / rms(mus[i:j])))
    return out
fx = np.zeros_like(mus); report = {}
for k, bus in buses.items():
    x = bus.out(); m = min(margins(k, x))
    if m < 5: x = x * 10 ** ((5 - m) / 20)
    report[k] = min(margins(k, x)); fx += x

# ---------- mix, loudness, peaks ----------
mix = mus + fx
mix = np.stack([lp(mix[:, ch], 15000, 4) for ch in range(2)], 1)  # tame inter-sample peaks from the short clicks
fade = np.ones(N); nf = int(SR * 1.2); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain
ceiling = 10 ** (-4.0 / 20)  # room for AAC overshoot: the encoded file stays under -1 dBTP
for _ in range(6):
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')

print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(cues)))
print('cue margin over music (min dB): ' + ', '.join('%s %+.1f' % (k, v) for k, v in sorted(report.items())))
