"""Score and sound cues for "5 signs your dog has IVDD" (120 BPM, 31 s).

A punchy four-on-the-floor pop loop in C (C - G - Am - F, one chord per bar) with a plucked
marker-bright lead riff. It starts at full energy on frame 0, holds through the five signs,
drops to a snare roll and riser into the products (21 -> 22 s), comes back for the offer and
resolves on a big chord when the button is pressed (28.5 s).

Every UI sound comes from cues.js (read through node), so each one lands on its frame:
marker scribbles (length in the cue name), highlighter swipes, slams, ticks, stamps, dings,
the button click + chord. Mixed to -14 LUFS integrated with 4x-oversampled peaks held under
-1.5 dBFS, so the AAC true peak stays at or under -1 dBTP.

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
TL, CUES = json.loads(subprocess.check_output(['node', '-e', "require('./cues.js'); console.log(JSON.stringify([globalThis.TL, globalThis.CUES]))"], cwd=os.path.join(HERE, '..')))
SR, BPM = 48000, TL['bpm']
DUR = TL['end']
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(23)  # fixed seed: identical on every run


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
def saw(f, t, n=12): return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, n + 1))

def pad(m, dur, bright=2200):
    t = tt(dur)
    s = sum(saw(hz(m) * (1 + d), t, 6) for d in (-0.004, 0.0, 0.005)) / 3
    a = np.clip(np.minimum(t / 0.05, (dur - t) / 0.2), 0, 1)
    return lp(s * a, bright)

def stab(m, dur=0.22):
    t = tt(dur); s = saw(hz(m), t, 10) * env(len(t), 0.002, 0.09)
    return lp(s, 3800)

def pluck(m, dur=0.32):  # bright marimba-ish lead
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .05) + 0.25 * np.sin(2 * np.pi * 4.01 * f * t) * np.exp(-t / .02)
    return s * env(len(t), 0.001, 0.11)

def bass(m, dur=0.22):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * saw(f, t, 5)
    return lp(s * env(len(t), 0.003, 0.11), 1100)

def kick():
    t = tt(0.42); f = 45 + 110 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.15) + 0.2 * hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.004)

def clap():
    n = int(SR * 0.25); x = bp(rng.standard_normal(n), 900, 4000)
    e = np.zeros(n)
    for d in (0, .01, .021): i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.018 if d < .02 else 0.08)
    return x * e

def snare():
    t = tt(0.18); return 0.6 * bp(rng.standard_normal(len(t)), 1500, 7000) * env(len(t), 0.0005, 0.05) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.04)

def hat(open_=False):
    d = 0.16 if open_ else 0.035
    return hp(rng.standard_normal(int(SR * d)), 8000) * env(int(SR * d), 0.0005, d / (3 if open_ else 4))

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
CH = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]   # C  G  Am  F
ROOT = [36, 31, 33, 29]
RIFF = [[76, 79, 84, 79, 76, None, 79, 81], [79, 83, 86, 83, 79, None, 83, 81],
        [81, 84, 88, 84, 81, None, 84, 83], [77, 81, 84, 81, 79, None, 77, 76]]
BUILD0, DROP, PRESS = TL['helps'] + 1.5, TL['prod'], TL['press']

def section(t):
    if t < TL['items'][0]: return 'hook'
    if BUILD0 <= t < DROP: return 'build'
    if t >= PRESS: return 'end'
    return 'full'

def duck(t):  # sidechain pump from the kick, for pads and bass
    ph = (t % BEAT) / BEAT
    return 0.35 + 0.65 * min(1, ph / 0.45)

steps = int(DUR / (BEAT / 4))
for s in range(steps):
    t = s * BEAT / 4
    sec = section(t)
    beat, sub = divmod(s, 4)
    bar = int(t // 2.0); c = bar % 4
    if sec == 'end':
        continue
    if sec == 'build':  # snare roll that doubles up, no kick
        k = (t - BUILD0) / (DROP - BUILD0)
        if sub % (2 if k < 0.5 else 1) == 0: music.add(t, snare(), 0.10 + 0.22 * k, pan=0.1)
        continue
    if sub == 0: music.add(t, kick(), 0.80)
    if sub == 0 and beat % 2 == 1: music.add(t, clap(), 0.30, pan=0.05)
    if sub == 2: music.add(t, hat(open_=True), 0.09, pan=0.25)
    if sub in (1, 3) and sec == 'full': music.add(t, hat(), 0.06, pan=-0.2)
    if sub in (2, 3) or (sub == 0 and beat % 2 == 1):
        m = ROOT[c] + (12 if sub == 3 else 0)
        music.add(t, bass(m, 0.2), 0.36 * duck(t))
    if sub in (0, 2):  # lead riff on 8ths
        n = RIFF[c][(beat % 4) * 2 + sub // 2]
        if n is not None and sec == 'full': music.add(t, pluck(n), 0.085, pan=0.3 if sub else -0.3)
    if sub == 2 and beat % 2 == 0:  # offbeat chord stabs
        for i, m in enumerate(CH[c][1:]): music.add(t, stab(m), 0.035, pan=(i - 1) * 0.4)
# pads, pumped by the kick
for bar in range(int(DUR // 2) + 1):
    t0 = bar * 2.0
    if t0 >= PRESS or (BUILD0 <= t0 < DROP): continue
    d = min(2.0, PRESS - t0, (BUILD0 - t0) if t0 < BUILD0 else 99)
    if d <= 0.05: continue
    tt_ = t0 + np.arange(int(SR * d)) / SR
    pump = np.array([duck(x) for x in tt_[::480]]).repeat(480)[:len(tt_)]
    for i, m in enumerate(CH[bar % 4]): music.add(t0, pad(m, d) * pump, 0.022, pan=(i - 1.5) * 0.3)
# build: filtered chord swelling into the drop
for i, m in enumerate(CH[3]):
    sw = pad(m, DROP - BUILD0, 1200) * np.linspace(0.2, 1, int(SR * (DROP - BUILD0)))
    music.add(BUILD0, sw, 0.03, pan=(i - 1.5) * 0.3)
# the resolve when the button is pressed: a held C chord, bass and soft hats to the end
for i, m in enumerate([48, 55, 60, 64, 67, 72, 76]): music.add(PRESS, pad(m, DUR - PRESS + 0.3, 2600), 0.032, pan=(i - 3) * 0.15)
music.add(PRESS, bass(24, 1.8), 0.7)
for b in range(int((DUR - PRESS) / BEAT)): music.add(PRESS + (b + 0.5) * BEAT, hat(True), 0.05, pan=0.2)

# ---------- UI sounds ----------
POP = [72, 74, 76, 79, 81, 83, 84, 86, 88, 91, 93, 95]
def scribble(d):
    """A fat marker on paper: band-passed grit with the rhythm of the stroke and a faint squeak."""
    n = int(SR * d); t = np.arange(n) / SR
    grit = bp(rng.standard_normal(n), 1600, 7500)
    stroke = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * (7 + 5 * t / max(d, 0.1)) * t)) ** 0.6
    sq = np.sin(2 * np.pi * np.cumsum(2300 + 400 * np.sin(2 * np.pi * 11 * t)) / SR) * 0.10
    shape = np.minimum(1, t / 0.012) * np.minimum(1, (d - t) / 0.06).clip(0)
    return (grit * stroke + sq) * shape

def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'scrib':
        bus.add(t0, scribble(max(0.12, num / 10)), 0.36, pan=-0.15)
    elif k == 'swipe':  # highlighter: a soft felt-tip swish
        bus.add(t0 - 0.02, sweep(0.26, 700, 4500), 0.65, pan=0.15)
    elif k == 'pop':
        t = tt(0.12); f = hz(POP[num % len(POP)]) * (1 + 0.6 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.035), 0.62, pan=((num % 5) - 2) * 0.18)
    elif k == 'riser':
        d = TL['prod'] - t0; n = int(SR * d); tq = np.arange(n) / SR
        tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (3 * tq / d)) / SR) * (tq / d) ** 2
        bus.add(t0, sweep(d, 300, 9000, 'up') * 0.9 + 0.3 * tone, 0.3)
    elif k == 'riserS':
        bus.add(t0, sweep(0.25, 800, 8000, 'up'), 0.55)
    elif k == 'slam':
        t = tt(0.35); f = 55 + 70 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.09) + 0.6 * lp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.025), 0.6)
    elif k == 'impact':
        t = tt(1.2); f = 38 + 80 * np.exp(-t / 0.06)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.4)
        bus.add(t0, boom + 0.7 * lp(rng.standard_normal(len(t)), 4000) * env(len(t), 0.0005, 0.1), 0.65)
    elif k == 'whoosh':
        bus.add(t0 - 0.2, sweep(0.4, 250, 4000), 0.95)
    elif k == 'swish':
        bus.add(t0 - 0.12, sweep(0.26, 600, 5000), 0.7)
    elif k == 'tick':
        t = tt(0.05); bus.add(t0, np.sin(2 * np.pi * 2900 * t) * env(len(t), 0.0005, 0.012) + 0.4 * np.sin(2 * np.pi * 4350 * t) * env(len(t), 0.0005, 0.006), 0.6, pan=0.2)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.005) * 0.9 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.014), 0.8)
    elif k == 'stamp':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(90 + 90 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.07) + 0.5 * bp(rng.standard_normal(len(t)), 700, 4000) * env(len(t), 0.0005, 0.02), 0.65)
    elif k == 'ding':  # price "register" ding
        bus.add(t0, bell(91, 0.9, 0.8), 0.45); bus.add(t0 + 0.06, bell(96, 0.9, 0.6), 0.32)
    elif k == 'star':
        bus.add(t0, bell([84, 88, 91, 93, 96][num % 5], 0.6, 1.0), 0.5, pan=(num - 2) * 0.2)
    elif k == 'chord':  # the satisfying chord on the press
        for i, m in enumerate([72, 76, 79, 84, 88]): bus.add(t0 + i * 0.018, bell(m, 1.8, 0.6), 0.12, pan=(i - 2) * 0.2)
        t = tt(1.0); bus.add(t0, np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t / 0.05)) / SR) * env(len(t), 0.001, 0.3), 0.6)

ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)

# ---------- mix, loudness, peaks ----------
MG = float(os.environ.get('MG', 1.0))
mix = music.out() * MG + ui.out()
fade = np.ones(N); nf = int(SR * 0.35); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
ceiling = 10 ** (-1.5 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass -1.5 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.98
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(CUES)))

# ---------- audibility check: each cue's peak over the music RMS around it ----------
m_mono = music.out().mean(1) * MG
worst = {}
for t0, kind in CUES:
    k = re.sub(r'\d', '', kind)
    solo = Bus(); sfx(kind, t0, solo); u = solo.out().mean(1)  # this cue on its own
    a, b = int(max(0, t0 - 0.25) * SR), int(min(DUR, t0 + 0.25) * SR)
    rms = np.sqrt(np.mean(m_mono[a:b] ** 2)) + 1e-9
    pk = np.abs(u).max() + 1e-9
    worst[k] = min(worst.get(k, 99), 20 * np.log10(pk / rms))
print('cue peak over music RMS (dB, worst per type): ' + ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
