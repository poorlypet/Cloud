"""Score and UI sounds for the Poorly Pet film, built on the 120 BPM beat grid.

Understated: a soft pad, an electric-piano pluck, sub bass and light percussion. UI sounds
are read from cues.js, so every click, select and chime lands exactly on its frame.
The mix is normalised to -14 LUFS integrated, with peaks held under -1 dBFS.

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
rng = np.random.default_rng(7)  # fixed seed: the score is identical on every run


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def t_(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)


class Bus:
    def __init__(self): self.l, self.r = np.zeros(N + SR * 3), np.zeros(N + SR * 3)
    def add(self, t0, sig, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i < 0: sig, i = sig[-i:], 0
        n = len(sig)
        self.l[i:i + n] += sig * g * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + n] += sig * g * np.sqrt(0.5 * (1 + pan))
    def out(self): return np.stack([self.l[:N], self.r[:N]], 1)


# ---------- instruments ----------
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def pad_note(m, dur):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + det) * t + ph) / k for k, det, ph in [(1, 0, 0), (1, 0.003, 1.1), (2, -0.002, 2.0), (3, 0.001, .4)])
    a = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6)
    return lp(s * np.clip(a, 0, 1), 1800)

def ep(m, dur=1.2):
    t = t_(dur)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.15) + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.08)
    return s * env(len(t), 0.004, 0.45) * (1 + 0.08 * np.sin(2 * np.pi * 5 * t))

def sub(m, dur=0.9):
    t = t_(dur)
    return np.sin(2 * np.pi * hz(m) * t) * env(len(t), 0.01, 0.35)

def kick():
    t = t_(0.35)
    f = 45 + 75 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.12)

def hat(d=0.04):
    return hp(rng.standard_normal(int(SR * d)), 7000) * env(int(SR * d), 0.0005, d / 4)

def rim():
    t = t_(0.12)
    return (bp(rng.standard_normal(len(t)), 1500, 4000) * 0.6 + np.sin(2 * np.pi * 820 * t) * 0.5) * env(len(t), 0.0005, 0.03)

def bell(m, dur=1.2, bright=1.0):
    t = t_(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.2)) * env(len(t), 0.002, dur / 3.5)

def noise_sweep(d, f0, f1, rev=False):
    n = int(SR * d); x = rng.standard_normal(n)
    out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        k = i / n; f = f0 * (f1 / f0) ** k
        out[i:i + seg] = bp(x[i:i + seg], f * 0.7, min(f * 1.4, SR / 2 - 100), 1)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    if rev: shape = np.linspace(0, 1, n) ** 3
    return out * shape


# ---------- music ----------
# one chord per bar (2 s): Dmaj9, Bm9, Gmaj9, Asus
CHORDS = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 47, 50, 54, 57], [45, 50, 52, 55, 59]]
music = Bus()
bars = int(DUR / (4 * BEAT))
for b in range(bars):
    t0 = b * 4 * BEAT
    ch = CHORDS[b % 4] if b < 14 else CHORDS[0]
    last = b == 14
    for i, m in enumerate(ch[1:]):
        music.add(t0, pad_note(m + 12, 4 * BEAT + (1.5 if last else 0.3)), 0.05, pan=(i - 1.5) * 0.3)
    # EP arpeggio on 8ths, sparse at the start and in the AI section
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    for s in range(8):
        tt = t0 + s * BEAT / 2
        if tt >= 28.0: break
        sparse = tt < 4 or 14 <= tt < 20
        if sparse and s % 2: continue
        m = ch[pattern[s]] + 24
        music.add(tt, ep(m), 0.09 if not sparse else 0.075, pan=0.35 if s % 2 else -0.35)
    # sub bass
    if 4 <= t0 < 28 and not (14 <= t0 < 16):
        music.add(t0, sub(ch[0] - 12, 1.2), 0.32)
        music.add(t0 + 2 * BEAT, sub(ch[0] - 12, 0.8), 0.24)
    if last:
        music.add(t0, sub(ch[0] - 12, 2.0), 0.3)
# drums
for i in range(int(DUR / BEAT)):
    tt = i * BEAT
    groove = 4 <= tt < 14 or 20 <= tt < 28
    if groove and i % 2 == 0: music.add(tt, kick(), 0.55)
    if (9 <= tt < 14 or 24 <= tt < 28) and i % 2 == 1: music.add(tt, rim(), 0.12, pan=0.1)
    for h in (0, 0.5):
        th = tt + h * BEAT
        if 4 <= th < 28:
            quiet = 14 <= th < 20
            if quiet and h == 0: continue
            music.add(th, hat(0.05 if h else 0.03), (0.05 if quiet else 0.08) * (1.3 if h else 0.8), pan=0.25)

# ---------- UI sounds ----------
def sfx(kind, t0, bus, idx=0):
    if kind == 'click':
        t = t_(0.05); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.004) * 0.8 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.012), 0.5)
    elif kind == 'tick':
        t = t_(0.04); bus.add(t0, np.sin(2 * np.pi * 3100 * t) * env(len(t), 0.0005, 0.008), 0.42, pan=0.2)
    elif kind == 'key':
        t = t_(0.02); bus.add(t0, hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0002, 0.003), 0.5, pan=0.1)
    elif kind == 'card':
        t = t_(0.12); bus.add(t0, np.sin(2 * np.pi * 190 * t) * env(len(t), 0.002, 0.03) + 0.4 * noise_sweep(0.12, 900, 2500), 0.4)
    elif kind == 'swish':
        bus.add(t0 - 0.15, noise_sweep(0.3, 500, 4000), 0.3)
    elif kind == 'whoosh':
        bus.add(t0 - 0.25, noise_sweep(0.5, 250, 2500), 0.34)
    elif kind == 'select':
        bus.add(t0, bell(76, 0.5, 0.5), 0.2); bus.add(t0 + 0.06, bell(81, 0.6, 0.5), 0.2)
    elif kind == 'send':
        t = t_(0.16); f = 600 + 900 * (t / t[-1]); bus.add(t0 - 0.03, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]), 0.12); bus.add(t0 - 0.05, noise_sweep(0.2, 1500, 6000), 0.06)
    elif kind == 'typing':
        for k in range(3): sfx('tick', t0 + k * 0.125, bus)
    elif kind == 'chime':
        for k, m in enumerate([81, 85, 88]): bus.add(t0 + k * 0.045, bell(m, 1.6, 0.7), 0.11, pan=(k - 1) * 0.3)
    elif kind == 'confirm':
        bus.add(t0, bell(85, 0.7, 0.4), 0.16); bus.add(t0 + 0.08, bell(90, 0.9, 0.4), 0.16)
    elif kind == 'step':
        bus.add(t0, bell([74, 78, 81][idx % 3], 0.8, 0.8), 0.15)
    elif kind == 'shimmer':
        for k in range(5): bus.add(t0 + k * 0.05, bell(86 + [0, 2, 4, 7, 9][k], 0.8, 1.0), 0.07, pan=(k - 2) * 0.2)
    elif kind == 'collapse':
        bus.add(t0 - 0.35, noise_sweep(0.4, 3000, 400, rev=True), 0.35)
    elif kind == 'logo':
        for k, m in enumerate([62, 69, 74, 78]): bus.add(t0 + k * 0.02, bell(m, 2.2, 0.5), 0.09)

src = open(os.path.join(HERE, '..', 'cues.js')).read()
cues = json.loads(re.search(r'window\.CUES\s*=\s*(\[.*\]);', src, re.S).group(1))
ui = Bus()
steps = 0
for t0, kind in cues:
    sfx(kind, t0, ui, steps)
    if kind == 'step': steps += 1

# ---------- mix, loudness, peaks ----------
music_mix, ui_mix = music.out() * 0.75, ui.out()
mix = music_mix + ui_mix
fade = np.ones(N); nf = int(SR * 0.4); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
# gentle limiter: if 4x-oversampled peaks pass -1 dBFS, soft-clip and re-normalise
ceiling = 10 ** (-1 / 20)
for _ in range(4):
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.98
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
np.save(os.path.join(HERE, '..', 'stills', 'ui.npy'), ui_mix[:, 0]) if os.environ.get('DEBUG_SFX') else None
np.save(os.path.join(HERE, '..', 'stills', 'music.npy'), music_mix[:, 0]) if os.environ.get('DEBUG_SFX') else None
print('integrated LUFS: %.2f  sample peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(cues)))
