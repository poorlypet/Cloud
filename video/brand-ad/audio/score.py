"""Score and UI sounds for the Poorly Pet ad (120 BPM, 30 s).

Hook: a quiet late-night pad, a clock tick and typing, with the tab pops rising into a riser.
Drop at 3.5 s, where the logo takes over the screen: a light four-on-the-floor groove with
bass, stabs and hats. It breaks down for the AI chat, returns with a 16th arp for the
scanner, then stops for the logo chord. UI sounds come from cues.js, so each one lands on
its frame. Normalised to -14 LUFS, with peaks held under -1 dBFS.

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR, BPM = 48000, 30.0, 120
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(11)  # fixed seed: identical on every run


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
def pad(m, dur, bright=1800):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) / k for k, d, p in [(1, 0, 0), (1, .004, 1.3), (2, -.003, 2.1), (3, .002, .5)])
    a = np.clip(np.minimum(t / 0.35, (dur - t) / 0.5), 0, 1)
    return lp(s * a, bright)

def stab(m, dur=0.35):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .08) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / .05)
    return s * env(len(t), 0.003, 0.14)

def pluck(m, dur=0.3):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / .03)) * env(len(t), 0.001, 0.07)

def bass(m, dur=0.24):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return lp(s * env(len(t), 0.004, 0.12), 900)

def kick(g=1.0):
    t = tt(0.4); f = 42 + 90 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.13) + 0.15 * hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.004)

def clap():
    n = int(SR * 0.25); x = bp(rng.standard_normal(n), 900, 3500)
    e = np.zeros(n)
    for d in (0, .011, .022): i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.02 if d < .02 else 0.07)
    return x * e

def hat(open_=False):
    d = 0.18 if open_ else 0.04
    return hp(rng.standard_normal(int(SR * d)), 7500) * env(int(SR * d), 0.0005, d / (3 if open_ else 4))

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.15)) * env(len(t), 0.002, dur / 3.5)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    e = {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]
    return out * e


# ---------- music ----------
music = Bus()
CH = [[62, 66, 69, 73, 76], [59, 62, 66, 69, 73], [55, 59, 62, 66, 69], [57, 61, 64, 67, 71]]  # Dmaj9 Bm9 Gmaj9 A
ROOT = [38, 35, 31, 33]
def chord_at(t): return int(t // 2) % 4

# hook, 0 to 3.5 s: a dark pad, a clock tick on the beat and a soft pulse
music.add(0, pad(47, 3.6, 900), 0.10); music.add(0, pad(54, 3.6, 900), 0.07); music.add(0, pad(62, 3.6, 1200), 0.05)
for i in range(7):
    t = tt(0.03); music.add(i * BEAT, np.sin(2 * np.pi * 2400 * t) * env(len(t), 0.0005, 0.006), 0.10, pan=0.3)
    music.add(i * BEAT + BEAT / 2, np.sin(2 * np.pi * 2000 * t) * env(len(t), 0.0005, 0.006), 0.06, pan=-0.3)

def section(t):
    if t < 3.5: return 'hook'
    if 14.0 <= t < 16.0: return 'break'
    if 16.0 <= t < 19.3: return 'light'
    if 27.35 <= t: return 'end'
    return 'full'

steps = int(DUR / (BEAT / 4))
for s in range(steps):
    t = s * BEAT / 4
    sec = section(t)
    if sec in ('hook', 'end'): continue
    beat, sub = divmod(s, 4)
    c = chord_at(t)
    if sub == 0:
        if sec in ('full',) or (sec == 'light' and beat % 2 == 0): music.add(t, kick(), 0.62)
        if sec == 'full' and beat % 2 == 1 and t >= 6.0: music.add(t, clap(), 0.20, pan=0.05)
    if sub == 2 and sec in ('full', 'light'): music.add(t, hat(open_=True), 0.07, pan=0.25)
    if sub in (1, 3) and sec == 'full': music.add(t, hat(), 0.05, pan=-0.2)
    if sec in ('full', 'light') and sub in (0, 2, 3):
        m = ROOT[c] + (12 if sub == 3 else 0)
        music.add(t, bass(m, 0.22), 0.30 if sub != 3 else 0.2)
    if sec == 'full' and (beat % 2 == 1 and sub == 2 or beat % 4 == 0 and sub == 3):
        for i, m in enumerate(CH[c][1:4]): music.add(t, stab(m), 0.055, pan=(i - 1) * 0.35)
    if 19.3 <= t < 27.35:  # 16th arp for the scanner and the proof section
        m = CH[c][[0, 2, 4, 2, 1, 3, 4, 3][s % 8]] + 12
        music.add(t, pluck(m), 0.05, pan=0.4 if s % 2 else -0.4)
    if sec == 'break' and sub == 0:
        music.add(t, pluck(CH[c][[0, 2, 4, 3][beat % 4]] + 12, 0.5), 0.07, pan=0.3 if beat % 2 else -0.3)
for b in range(2, 14):  # pads under everything after the drop
    t0 = b * 2.0
    if t0 < 3.5 and t0 + 2 <= 3.5: continue
    start = max(t0, 3.5); dur = min(t0 + 2.0, 27.35) - start + 0.3
    if dur <= 0.3: continue
    for i, m in enumerate(CH[b % 4][1:]): music.add(start, pad(m, dur), 0.035, pan=(i - 1.5) * 0.3)
# end chord, under the logo
for i, m in enumerate([50, 57, 62, 66, 69, 73, 76]): music.add(27.625, pad(m, 2.6, 2400), 0.06, pan=(i - 3) * 0.15)
music.add(27.625, bass(26, 1.6), 0.5)

# ---------- UI sounds ----------
POP = [72, 74, 76, 79, 81, 83, 84, 86, 88, 91, 93, 95]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'key':
        t = tt(0.025); bus.add(t0, hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0002, 0.004) + 0.4 * np.sin(2 * np.pi * 1500 * t) * env(len(t), 0.0005, 0.005), 0.5, pan=0.15)
    elif k == 'enter':
        t = tt(0.06); bus.add(t0, hp(rng.standard_normal(len(t)), 1200) * env(len(t), 0.0003, 0.012) + np.sin(2 * np.pi * 700 * t) * env(len(t), 0.001, 0.02), 0.6)
    elif k == 'pop':
        t = tt(0.12); f = hz(POP[num % len(POP)]) * (1 + 0.6 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.035), 0.26, pan=((num % 5) - 2) * 0.18)
    elif k == 'riser':
        d = 3.5 - t0; n = int(SR * d); tq = np.arange(n) / SR
        tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (3 * tq / d)) / SR) * (tq / d) ** 2
        bus.add(t0, sweep(d, 300, 9000, 'up') * 0.8 + 0.25 * tone, 0.30)
    elif k == 'slam':
        t = tt(0.35); f = 55 + 60 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.09) + 0.5 * lp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0005, 0.02), 0.55)
    elif k == 'thud':
        t = tt(0.25); f = 70 + 50 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.07), 0.45)
    elif k == 'impact':
        t = tt(1.4); f = 38 + 70 * np.exp(-t / 0.06)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.45)
        bus.add(t0, boom + 0.6 * lp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.12), 0.7)
        bus.add(t0, sweep(1.2, 6000, 300, 'down'), 0.18)
    elif k == 'whoosh':
        bus.add(t0 - 0.22, sweep(0.45, 250, 3500), 0.34)
    elif k == 'swish':
        bus.add(t0 - 0.14, sweep(0.28, 600, 5000), 0.26)
    elif k == 'draw':
        n = int(SR * 0.35); x = bp(rng.standard_normal(n), 2500, 7000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 28)) * np.sin(np.pi * np.linspace(0, 1, n))
        bus.add(t0, x, 0.32, pan=-0.2)
    elif k == 'tick':
        t = tt(0.04); bus.add(t0, np.sin(2 * np.pi * 3000 * t) * env(len(t), 0.0005, 0.008), 0.38, pan=0.2)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.004) * 0.8 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.012), 0.6)
    elif k == 'flip':
        t = tt(0.07); bus.add(t0, bp(rng.standard_normal(len(t)), 1500, 6000) * env(len(t), 0.001, 0.012) + 0.5 * np.sin(2 * np.pi * 420 * t) * env(len(t), 0.001, 0.02), 0.34, pan=0.25)
    elif k == 'card':
        t = tt(0.12); bus.add(t0, np.sin(2 * np.pi * 190 * t) * env(len(t), 0.002, 0.03) + 0.4 * sweep(0.12, 900, 2500), 0.4)
    elif k == 'stamp':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.06) + 0.4 * bp(rng.standard_normal(len(t)), 800, 4000) * env(len(t), 0.0005, 0.015), 0.45)
    elif k == 'burst':
        bus.add(t0 - 0.05, sweep(0.5, 400, 7000, 'down'), 0.3); bus.add(t0, bell(79, 0.6, 0.5), 0.1)
    elif k == 'send':
        t = tt(0.16); f = 600 + 900 * (t / t[-1]); bus.add(t0 - 0.03, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]), 0.26); bus.add(t0 - 0.05, sweep(0.2, 1500, 6000), 0.18)
    elif k == 'typing':
        for i in range(4): sfx('tick', t0 + i * 0.125, bus)
    elif k == 'chime':
        for i, m in enumerate([81, 85, 88]): bus.add(t0 + i * 0.045, bell(m, 1.4, 0.7), 0.19, pan=(i - 1) * 0.3)
    elif k == 'confirm':
        bus.add(t0, bell(85, 0.6, 0.4), 0.18); bus.add(t0 + 0.08, bell(90, 0.8, 0.4), 0.18)
    elif k == 'shutter':
        t = tt(0.12); x = hp(rng.standard_normal(len(t)), 1500)
        e = env(len(t), 0.0003, 0.008); e[int(0.05 * SR):] += env(len(t) - int(0.05 * SR), 0.0003, 0.01)
        bus.add(t0, x * e, 0.6)
    elif k == 'scan':
        t = tt(0.8); f = 500 + 1200 * t / 0.8
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.05, 0.5) * 0.3 + sweep(0.8, 1000, 6000), 0.55)
    elif k == 'count':
        t = tt(0.05); bus.add(t0, np.sin(2 * np.pi * hz(84 + num * 2) * t) * env(len(t), 0.0005, 0.012), 0.28)
    elif k == 'step':
        bus.add(t0, bell([74, 78, 81][num % 3], 0.8, 0.8), 0.3)
    elif k == 'star':
        bus.add(t0, bell([86, 88, 90, 93, 95][num % 5], 0.7, 1.0), 0.12, pan=(num - 2) * 0.2)
    elif k == 'collapse':
        bus.add(t0 - 0.3, sweep(0.35, 5000, 400, 'up'), 0.3)
    elif k == 'logo':
        t = tt(1.4); f = 40 + 60 * np.exp(-t / 0.05)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.4), 0.55)
        for i, m in enumerate([74, 78, 81, 86]): bus.add(t0 + i * 0.02, bell(m, 2.2, 0.5), 0.1)

src = open(os.path.join(HERE, '..', 'cues.js')).read()
cues = json.loads(re.search(r'window\.CUES\s*=\s*(\[.*\]);', src, re.S).group(1))
ui = Bus()
for t0, kind in cues: sfx(kind, t0, ui)

# ---------- mix, loudness, peaks ----------
mix = music.out() * 0.8 + ui.out()
fade = np.ones(N); nf = int(SR * 0.5); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
ceiling = 10 ** (-1 / 20)
for _ in range(6):  # soft-clip only if 4x-oversampled peaks pass -1 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(cues)))
