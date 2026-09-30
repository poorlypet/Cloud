"""Score and UI sounds for "They can't tell you" (80 BPM, 30 s, F major).

Soft felt piano and felt keys over a warm pad. The hook is sparse (rolled chords and a slow
melody). From 6 s the felt keys add a quiet eighth-note arpeggio. At 15 s (bar 6, when the
mint screen says "Or show us") a gentle pulse enters: a soft kick on beats 1 and 3 and a
sub under the bass. Everything resolves to Fmaj9 on the logo at 27 s. No drops.

UI sounds come from cues.js (read through node), so each one lands on its frame.
Normalised to -14 LUFS with true peaks held under -1 dBFS.

    python3 audio/score.py           writes audio/score.wav (48 kHz, 16-bit, stereo)
    python3 audio/score.py --check   also prints, per cue type, the UI peak over the music RMS
"""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR, BPM = 48000, 30.0, 80
BEAT = 60 / BPM          # 0.75 s
BAR = 4 * BEAT           # 3.0 s
N = int(SR * DUR)
rng = np.random.default_rng(7)  # fixed seed: identical on every run

src = subprocess.check_output(['node', '-e', "require(process.argv[1]); console.log(JSON.stringify({cues: globalThis.CUES, tm: globalThis.TM}))",
                               os.path.join(HERE, '..', 'cues.js')])
DATA = json.loads(src)
CUES, TM = DATA['cues'], DATA['tm']
PULSE, RESOLVE = TM['pulse'], TM['mark']


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
    def out(self, n=N): return np.stack([self.l[:n], self.r[:n]], 1)


# ---------- instruments ----------
def piano(m, dur, vel=0.6):
    """Felt piano: slightly stretched partials, per-partial decay, a soft hammer, and a felt low-pass."""
    ring = dur + 0.6
    t = tt(ring); f = hz(m)
    base = np.clip(3.2 - (m - 48) * 0.04, 0.9, 4.0)
    s = np.zeros(len(t))
    for n in range(1, 9):
        fn = n * f * np.sqrt(1 + 0.00035 * n * n)
        if fn > 9000: break
        a = (1 / n ** 1.5) * (vel ** (0.4 * (n - 1)))
        tau = base / (1 + 0.45 * (n - 1))
        s += a * (np.sin(2 * np.pi * fn * t) + 0.5 * np.sin(2 * np.pi * fn * 1.0007 * t + n)) * (0.7 * np.exp(-t / (tau * 0.25)) + 0.3 * np.exp(-t / tau))
    s *= np.minimum(1, t / 0.006)
    rel = np.clip((ring - t) / 0.6, 0, 1) ** 2   # the damper
    ham = lp(rng.standard_normal(len(t)), 900) * env(len(t), 0.001, 0.012) * 0.25
    return lp(s * rel + ham, 1400 + 2600 * vel) * vel

def keys(m, dur=0.9, vel=0.5):
    """Felt keys: a soft sine-and-octave tine with a quick bloom."""
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.08)) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    return lp(s * env(len(t), 0.008, dur / 3), 2400) * vel

def pad(ms, dur, bright=1100):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for d, p in [(0, 0), (0.003, 1.1), (-0.0035, 2.3)]:
            s += np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) + 0.3 * np.sin(2 * np.pi * 2 * hz(m) * (1 + d) * t + p)
    a = np.clip(np.minimum(t / 0.9, (dur - t) / 0.9), 0, 1)
    return lp(s * a, bright) / (3 * len(ms))

def kick():
    t = tt(0.5); f = 44 + 46 * np.exp(-t / 0.045)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.18), 300)

def sub(m, dur):
    t = tt(dur)
    return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / 0.03) * np.exp(-t / 1.2) * np.clip((dur - t) / 0.1, 0, 1)

def bell(m, dur=1.2, bright=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.25 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.12)) * env(len(t), 0.003, dur / 3.5)

def mallet(m, dur=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.02)) * env(len(t), 0.002, 0.16)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    e = {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]
    return out * e

def scribble(d, rate=22):
    n = int(SR * d); tq = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 2200, 7000) * (0.55 + 0.45 * np.sin(2 * np.pi * rate * tq) ** 2)
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7


# ---------- music ----------
music = Bus()
# (bass, voicing) per bar; bar 8 splits in two
CH = [(38, [53, 57, 60, 64]),   # Dm9
      (34, [50, 53, 57, 60]),   # Bbmaj9
      (33, [53, 57, 60, 67]),   # F/A
      (36, [53, 55, 60, 62]),   # Csus
      (38, [53, 57, 60, 64]),   # Dm9
      (34, [50, 53, 57, 60]),   # Bbmaj9  (pulse enters)
      (33, [53, 57, 60, 67]),   # F/A
      (31, [53, 57, 58, 62]),   # Gm9
      (34, [50, 53, 57, 60]),   # Bbmaj7 -> C7sus halfway
      (29, [57, 60, 64, 67])]   # Fmaj9 (resolve)
C7SUS = (36, [53, 55, 58, 62])
MEL = [[(0, 69, 1.5), (2, 72, .75), (3, 69, .75)], [(0, 65, 1.5), (2, 69, .75), (3, 67, .75)], [(0, 72, 2), (2, 69, 1), (3, 67, 1)], [(0, 67, 3)],
       [(0, 69, 1.5), (2, 72, .75), (3, 74, .75)], [(0, 72, 1.5), (2, 69, .75), (3, 67, .75)], [(0, 72, 2), (2, 76, 1), (3, 74, 1)], [(0, 70, 1.5), (2, 69, .75), (3, 67, .75)],
       [(0, 65, 1.5), (2, 67, 1.5)], [(0, 69, 3)]]

def chord_at(t):
    b = int(t // BAR)
    if b == 8 and t % BAR >= 2 * BEAT: return C7SUS
    return CH[min(b, 9)]

for b in range(10):
    t0 = b * BAR
    halves = [(t0, CH[b], BAR)] if b != 8 else [(t0, CH[8], 2 * BEAT), (t0 + 2 * BEAT, C7SUS, 2 * BEAT)]
    for (ts, (bass, v), d) in halves:
        last = b == 9
        ring = 3.0 if last else d
        # bass note and a rolled chord on the downbeat
        music.add(ts, piano(bass + 12, ring, 0.55), 0.55)
        if last: music.add(ts, piano(bass, ring, 0.5), 0.45)
        for i, m in enumerate(v): music.add(ts + 0.035 * i + (0.02 if b < 2 else 0), piano(m, ring, 0.42), 0.32, pan=(i - 1.5) * 0.25)
        # pad under everything, a little brighter once the pulse is in
        music.add(ts, pad(v, d + 0.9, 900 if ts < PULSE else 1300), 0.26 if ts < PULSE else 0.30)
    # a soft re-voice on beat 3 in the sparse hook
    if b < 2:
        for i, m in enumerate(CH[b][1][1:]): music.add(t0 + 2 * BEAT + 0.04 * i, piano(m + 12, 1.4, 0.3), 0.14, pan=(i - 1) * 0.3)
    # melody
    for (bt, m, d) in MEL[b]:
        music.add(t0 + bt * BEAT, piano(m + 12 if b == 9 else m, d if b < 9 else 3.0, 0.5), 0.34, pan=0.1)
    # felt-key arpeggio in eighths from bar 3 (6 s), resting under the resolve
    if 2 <= b < 9:
        for e in range(8):
            ts = t0 + e * BEAT / 2
            bass, v = chord_at(ts)
            m = [v[0], v[1], v[2], v[3], v[2] + 12, v[3], v[1] + 12, v[2]][e] + 12
            music.add(ts, keys(m, 0.9, 0.5 if e % 2 == 0 else 0.35), 0.10, pan=0.35 if e % 2 else -0.35)
    # the gentle pulse: a soft kick on beats 1 and 3, a sub under the bass
    if t0 >= PULSE and b < 9:
        for bt in (0, 2):
            ts = t0 + bt * BEAT
            music.add(ts, kick(), 0.65)
            bass, _ = chord_at(ts)
            music.add(ts, sub(bass + 12 if bass < 33 else bass, 2 * BEAT), 0.20)
        for bt in (1, 3):  # a whisper on the off-beats
            music.add(t0 + bt * BEAT, kick(), 0.18)
# the resolve under the logo: low F and a final sub
music.add(RESOLVE, sub(29 + 12, 3.0), 0.25)

# a soft room: exponentially decaying stereo noise
ir_t = tt(2.4)
irL = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.55); irR = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.55)
irL, irR = lp(irL, 5000) / np.sqrt((irL ** 2).sum()), lp(irR, 5000) / np.sqrt((irR ** 2).sum())
dry = music.out(N + SR * 3)
wetL = fftconvolve(dry[:, 0], irL)[:N]; wetR = fftconvolve(dry[:, 1], irR)[:N]
MUS = dry[:N] + 0.35 * np.stack([wetL, wetR], 1)


# ---------- UI sounds (soft, to match the score) ----------
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k in ('key', 'soft'):
        t = tt(0.05); g = 0.55 if k == 'key' else 0.42
        thock = np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.012)
        click = bp(rng.standard_normal(len(t)), 1800, 6000) * env(len(t), 0.0003, 0.006)
        bus.add(t0, thock * 0.8 + click, g, pan=0.15 if k == 'key' else -0.1)
    elif k == 'word':
        bus.add(t0 - 0.12, sweep(0.42, 300, 1800), 0.55)
        bus.add(t0, mallet(62, 0.5), 0.26)
    elif k == 'push':
        bus.add(t0 - 0.05, sweep(0.95, 140, 2400), 0.85)
        t = tt(0.4); bus.add(t0 + 0.05, np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t / 0.05)) / SR) * env(len(t), 0.01, 0.12), 0.3)
    elif k == 'draw':
        bus.add(t0, scribble(0.5, 16), 0.30, pan=-0.2)
    elif k == 'write':
        bus.add(t0, scribble(0.9, 24), 0.26, pan=0.2)
        bus.add(t0, mallet([72, 74, 77][num % 3], 0.8), 0.20)
    elif k == 'card':
        t = tt(0.15); bus.add(t0, np.sin(2 * np.pi * 210 * t) * env(len(t), 0.002, 0.035) + 0.3 * sweep(0.15, 800, 2400), 0.42)
    elif k == 'split':
        bus.add(t0 - 0.1, sweep(0.4, 500, 3000), 0.28)
        t = tt(0.12); bus.add(t0, np.sin(2 * np.pi * 260 * t) * env(len(t), 0.002, 0.03), 0.35)
    elif k == 'pill':
        bus.add(t0, mallet([74, 77, 81][num % 3], 0.7), 0.30, pan=(num - 1) * 0.25)
    elif k == 'scan':
        t = tt(1.2); f = 520 + 700 * t / 1.2
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.08, 0.6) * 0.25 + sweep(1.2, 900, 6000), 0.6)
    elif k == 'chime':
        for i, m in enumerate([77, 81, 84]): bus.add(t0 + i * 0.06, bell(m, 1.4, 0.6), 0.16, pan=(i - 1) * 0.3)
    elif k == 'tick':
        t = tt(0.06); bus.add(t0, np.sin(2 * np.pi * 2300 * t) * env(len(t), 0.0005, 0.012) + 0.4 * np.sin(2 * np.pi * 1150 * t) * env(len(t), 0.001, 0.02), 0.46, pan=0.2)
        bus.add(t0, bell(84, 0.6, 0.3), 0.08)
    elif k == 'count':
        # soft ticks that slow down, following the glide spring of the count-up
        w = 6.0; ts = []
        for i in range(1, 12):
            # time at which the count passes i/12 of the way (critically damped step, solved numerically)
            x = np.linspace(0, 1.6, 1600); y = 1 - np.exp(-w * x) * (1 + w * x)
            ts.append(x[np.searchsorted(y, i / 12)])
        for i, dt in enumerate(ts):
            t = tt(0.04); bus.add(t0 + 0.1 + dt, np.sin(2 * np.pi * hz(86 + (i % 3)) * t) * env(len(t), 0.0005, 0.01), 0.30)
    elif k == 'star':
        bus.add(t0, bell([77, 79, 81, 84, 86][num % 5], 1.0, 0.8), 0.26, pan=(num - 2) * 0.2)
    elif k == 'logo':
        t = tt(1.2); bus.add(t0, np.sin(2 * np.pi * np.cumsum(46 + 40 * np.exp(-t / 0.06)) / SR) * env(len(t), 0.004, 0.35), 0.45)
        for i, m in enumerate([77, 81, 84, 88]): bus.add(t0 + i * 0.05, bell(m, 2.6, 0.5), 0.13, pan=(i - 1.5) * 0.25)

ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)
UI = ui.out()

# ---------- mix, loudness, peaks ----------
MUSG = 0.8
# the music leans back a little (about 3 dB) under each full-screen push, so the push is heard
duck = np.ones(N)
for t0, kind in CUES:
    if kind == 'push':
        i0 = int((t0 - 0.2) * SR); n = int(0.9 * SR)
        duck[i0:i0 + n] *= 1 - 0.3 * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
MUS = MUS * duck[:, None]
mix = MUS * MUSG + UI
fade = np.ones(N); nf = int(SR * 0.6); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain
ceiling = 10 ** (-1 / 20)
for _ in range(6):  # soft-clip only if 4x-oversampled peaks pass -1 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(CUES)))

if '--check' in sys.argv:
    # per cue type: the UI sound's peak (first 0.3 s) over the music's RMS around it, both at final gain
    m, u = (MUS * MUSG * gain).mean(1), (UI * gain).mean(1)
    res = {}
    for t0, kind in CUES:
        i = int(t0 * SR); w = int(0.25 * SR)
        mr = np.sqrt(np.mean(m[max(0, i - w):i + w] ** 2)) + 1e-9
        up = np.abs(u[i:i + int(0.3 * SR)]).max() + 1e-9
        # where the UI peak lands relative to the cue
        at = np.argmax(np.abs(u[max(0, i - int(0.2 * SR)):i + int(0.3 * SR)])) / SR - min(0.2, t0)
        res.setdefault(re.sub(r'\d', '', kind), []).append((20 * np.log10(up / mr), at))
    for k, v in sorted(res.items()):
        d = [x[0] for x in v]; a = [x[1] for x in v]
        print('%-6s n=%3d  peak over music RMS: min %+5.1f dB  mean %+5.1f dB   peak lands %+.3f s (median)' % (k, len(v), min(d), np.mean(d), np.median(a)))
