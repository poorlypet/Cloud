"""Score and UI sounds for "5 things that help itchy skin" (118 BPM, D major, about 31 s).

Sleek pop-electronic: four-on-the-floor kick, offbeat open hats, claps on 2 and 4, a sidechained
chord pad (Bm G D A), a pumping offbeat bass, a pluck arp and a bright lead hook. A short intro
under the frame-0 title, the drop on beat 2, a build with a snare roll and riser into the bundle
(beat 46), and a ringing chord under the end card after the Shop now tap (beat 57).
UI sounds (slams, pops, price ticks, typing, taps, the cart ding, the stamp and the button chord)
come from cues.js, read through node so the film and the score share one timeline.
Normalised to -14 LUFS with 4x-oversampled peaks held under -2.2 dBFS (AAC adds up to about 1 dB).

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.loads(subprocess.check_output(['node', '-e',
    "global.window={};require(process.argv[1]);console.log(JSON.stringify({TL:window.TL,CUES:window.CUES}))",
    os.path.join(HERE, '..', 'cues.js')]))
TL, cues = tl['TL'], tl['CUES']
SR, BPM = 48000, TL['BPM']
B = 60 / BPM
DUR = round(TL['DUR'] * 30) / 30
N = int(SR * DUR)
P1, P2, END = TL['P1'], TL['P2'], TL['END']
rng = np.random.default_rng(118)  # fixed seed: identical on every run


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
def saw(f, t, n=8):
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, n + 1))

def pad(m, dur, bright=2200):
    t = tt(dur)
    s = sum(saw(hz(m) * (1 + d), t, 6) for d in (-0.005, 0, 0.006)) / 3
    a = np.clip(np.minimum(t / 0.05, (dur - t) / 0.12), 0, 1)
    return lp(s * a, bright)

def pluck(m, dur=0.22, bright=3500):
    t = tt(dur); f = hz(m)
    return lp(saw(f, t, 10) * env(len(t), 0.001, 0.08), bright)

def lead(m, dur):
    t = tt(dur); f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.18 * np.sin(3 * ph) + 0.08 * np.sin(5 * ph)
    a = np.minimum(1, t / 0.01) * np.clip((dur - t) / 0.05, 0, 1) * (0.75 + 0.25 * np.exp(-t / 0.15))
    return lp(s * a, 5000)

def bass(m, dur=0.2):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * lp(saw(f, t, 6), 700)
    return s * env(len(t), 0.004, 0.11)

def kick():
    t = tt(0.36); f = 45 + 110 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.12) + 0.12 * hp(rng.standard_normal(len(t)), 3500) * env(len(t), 0.0005, 0.004)

def clap():
    n = int(SR * 0.25); x = bp(rng.standard_normal(n), 1000, 4000)
    e = np.zeros(n)
    for d in (0, .010, .021): i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.02 if d < .02 else 0.08)
    return x * e

def snare():
    t = tt(0.16)
    return 0.6 * bp(rng.standard_normal(len(t)), 1500, 6000) * env(len(t), 0.0005, 0.05) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.03)

def hat(open_=False):
    d = 0.16 if open_ else 0.035
    return hp(rng.standard_normal(int(SR * d)), 8000) * env(int(SR * d), 0.0005, d / (3 if open_ else 4))

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.12) + 0.2 * bright * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05)) * env(len(t), 0.001, dur / 3.5)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    e = {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]
    return out * e


# ---------- music ----------
CH = [[59, 62, 66, 69], [55, 59, 62, 66], [62, 66, 69, 73], [57, 61, 64, 69]]   # Bm7 Gmaj7 Dmaj7 A
ROOT = [35, 31, 38, 33]
def chord_at(beat): return 3 if beat < 2 else int((beat - 2) // 4) % 4

def section(beat):
    if beat < 2: return 'intro'
    if 42 <= beat < 46: return 'build'
    if beat >= 57: return 'outro'
    return 'full'

drums, harm, top = Bus(), Bus(), Bus()   # harm is sidechained to the kick
for s in range(int(END * 4)):
    beat = s / 4; t = beat * B; sub = s % 4; sec = section(beat)
    c = chord_at(beat); bi = int(beat)
    if sec == 'full' or (sec == 'build' and beat < 44):
        if sub == 0: drums.add(t, kick(), 0.75)
        if sub == 0 and (bi - 2) % 2 == 1: drums.add(t, clap(), 0.26, pan=0.05)
        if sub == 2: drums.add(t, hat(True), 0.08, pan=0.25)
        if sub in (1, 3): drums.add(t, hat(), 0.045, pan=-0.2)
        if sub in (2, 3) or (sub == 1 and bi % 2):
            harm.add(t, bass(ROOT[c] + (12 if sub == 3 else 0), 0.2), 0.36)
    if sec == 'build':
        rate = 2 if beat < 44 else 4
        if (s % (4 // rate)) == 0 and beat >= 43: drums.add(t, snare(), 0.10 + 0.14 * (beat - 43) / 3, pan=0.1)
    if sec == 'intro' and sub in (0, 2):
        drums.add(t, hat(), 0.05, pan=0.2)
    # pluck arp on 8ths, two octaves up
    if sec in ('full', 'intro', 'build') and sub in (0, 2):
        m = CH[c][[0, 2, 1, 3, 2, 1, 3, 2][(s // 2) % 8]] + 12
        top.add(t, pluck(m, 0.22, 2600 if sec == 'intro' else 4200), 0.08, pan=0.35 if (s // 2) % 2 else -0.35)

# chord pads, one per bar, sidechained below
for bar in range(-1, int((END - 2) / 4) + 1):
    b0 = 2 + bar * 4
    st, en = max(0, b0), min(b0 + 4, 57)
    if en <= st: continue
    dur = (en - st) * B + 0.05
    bright = 1400 if st < 2 else (1800 + 3000 * (st - 42) / 4 if 42 <= st < 46 else 2600)
    for i, m in enumerate(CH[chord_at(st)]): harm.add(st * B, pad(m, dur, bright), 0.045, pan=(i - 1.5) * 0.35)

# lead hook (bars from beat 18 to 42, and through the bundle)
PH = [[(0, 78, .5), (.5, 81, .5), (1, 83, .75), (2, 81, .5), (2.5, 78, .5), (3, 76, .5), (3.5, 74, .5)],
      [(0, 76, .75), (1, 74, .5), (1.5, 71, .5), (2, 74, 1.5)],
      [(0, 78, .5), (.5, 81, .5), (1, 85, .75), (2, 83, .5), (2.5, 81, .5), (3, 78, 1)],
      [(0, 76, .75), (1, 73, .5), (1.5, 76, .5), (2, 76, 1.5)]]
for b0 in list(range(18, 42, 4)) + list(range(46, 54, 4)):
    for off, m, d in PH[chord_at(b0)]:
        top.add((b0 + off) * B, lead(m, d * B * 0.95), 0.05, pan=0.1)

# outro: ringing chord under the end card from the Shop now tap
for i, m in enumerate([50, 57, 62, 66, 69, 74, 78]): harm.add(57 * B, pad(m, (END - 57) * B, 2200), 0.05, pan=(i - 3) * 0.15)
harm.add(57 * B, bass(26, 2.0), 0.6)
for k in range(8): drums.add((57 + k * 0.5) * B, hat(), 0.03 * (1 - k / 8), pan=0.2)

# sidechain: duck the harmony on every kick
duck = np.ones(N)
for bi in range(2, 57):
    if 44 <= bi < 46: continue
    i0 = int(bi * B * SR); n = min(int(B * SR), N - i0)
    if n > 0: duck[i0:i0 + n] = 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.11)
music = drums.out() + harm.out() * duck[:, None] + top.out()

# ---------- UI sounds ----------
POP = [72, 74, 76, 79, 81, 83, 84, 86, 88, 91, 93, 95]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'key':
        t = tt(0.03); bus.add(t0, lp(hp(rng.standard_normal(len(t)), 2500), 9000) * env(len(t), 0.001, 0.005) + 0.4 * np.sin(2 * np.pi * 1600 * t) * env(len(t), 0.001, 0.006), 0.31, pan=0.15)
    elif k == 'pop':
        t = tt(0.12); f = hz(POP[num % len(POP)]) * (1 + 0.6 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.035), 0.42, pan=((num % 5) - 2) * 0.15)
    elif k == 'seg':
        bus.add(t0, bell(81 + [0, 2, 4, 7, 9][num % 5], 0.35, 0.6), 0.16, pan=-0.3)
    elif k == 'riser':
        d = P1 * B - t0; n = int(SR * d); tq = np.arange(n) / SR
        tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * tq / d)) / SR) * (tq / d) ** 2
        bus.add(t0, sweep(d, 300, 9000, 'up') * 0.8 + 0.22 * tone, 0.36)
    elif k == 'slam':
        t = tt(0.4); f = 52 + 70 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.1) + 0.55 * lp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.025), 0.8)
    elif k == 'thud':
        t = tt(0.22); f = 80 + 60 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.06) + 0.3 * bp(rng.standard_normal(len(t)), 600, 3000) * env(len(t), 0.0005, 0.015), 0.5)
    elif k == 'impact':
        t = tt(1.3); f = 38 + 80 * np.exp(-t / 0.05)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.4)
        bus.add(t0, boom + 0.6 * lp(rng.standard_normal(len(t)), 3500) * env(len(t), 0.0005, 0.1), 0.8)
        bus.add(t0, sweep(1.1, 7000, 300, 'down'), 0.2)
    elif k == 'whoosh':
        bus.add(t0 - 0.2, sweep(0.42, 250, 4000), 0.5)
    elif k == 'swish':
        bus.add(t0 - 0.12, sweep(0.26, 700, 6000), 0.38)
    elif k == 'draw':
        n = int(SR * 0.32); x = bp(rng.standard_normal(n), 2500, 8000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 30)) * np.sin(np.pi * np.linspace(0, 1, n))
        bus.add(t0, x, 0.42, pan=-0.2)
    elif k == 'tick':
        t = tt(0.04); bus.add(t0, np.sin(2 * np.pi * 3000 * t) * env(len(t), 0.0005, 0.009), 0.45, pan=0.2)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, lp(hp(rng.standard_normal(len(t)), 2000), 9000) * env(len(t), 0.001, 0.005) * 0.9 + np.sin(2 * np.pi * 2000 * t) * env(len(t), 0.001, 0.012), 0.45)
    elif k == 'stamp':
        t = tt(0.32); bus.add(t0, np.sin(2 * np.pi * np.cumsum(90 + 90 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.07) + 0.45 * bp(rng.standard_normal(len(t)), 800, 4500) * env(len(t), 0.0005, 0.018), 0.7)
    elif k == 'count':
        t = tt(0.05); bus.add(t0, np.sin(2 * np.pi * hz(86 + num * 2) * t) * env(len(t), 0.0005, 0.012), 0.36, pan=0.25)
    elif k == 'ding':  # cart: two bright bell notes, a little higher each item
        r = [0, 2, 4, 5, 7][num % 5]
        bus.add(t0, bell(88 + r, 1.0, 0.8), 0.24, pan=0.35); bus.add(t0 + 0.07, bell(95 + r, 1.2, 0.6), 0.2, pan=0.35)
    elif k == 'star':
        bus.add(t0, bell([86, 88, 90, 93][num % 4], 0.6, 1.0), 0.17, pan=(num - 1.5) * 0.2)
    elif k == 'chord':  # Shop now: bright D major chord
        for i, m in enumerate([74, 78, 81, 86, 90]): bus.add(t0 + i * 0.012, bell(m, 1.8, 0.6), 0.12, pan=(i - 2) * 0.25)
        t = tt(0.5)
        for m in (62, 66, 69): bus.add(t0, lp(saw(hz(m), t, 8), 3000) * env(len(t), 0.002, 0.18), 0.09)

ui = Bus()
for t0, kind in cues: sfx(kind, t0, ui)
uio = ui.out()

# ---------- cue audibility: each cue type's peak over the music RMS around it ----------
mus_g = 0.62
def db(x): return 20 * np.log10(max(x, 1e-9))
report = {}
for kind in sorted({re.sub(r'\d', '', k) for _, k in cues}):
    margins = []
    for t0, k in cues:
        if re.sub(r'\d', '', k) != kind or kind == 'riser': continue
        sa = int((t0 - (0.2 if kind == 'whoosh' else 0.12 if kind == 'swish' else 0)) * SR)
        a, b_ = max(0, sa), min(N, sa + int(0.25 * SR))
        lo, hi = max(0, int((t0 - 0.25) * SR)), min(N, int((t0 + 0.25) * SR))
        pk = np.abs(uio[a:b_]).max(); rms = np.sqrt(np.mean((music[lo:hi] * mus_g) ** 2))
        margins.append(db(pk) - db(rms))
    if margins: report[kind] = min(margins)

# ---------- mix, loudness, peaks ----------
mix = music * mus_g + uio
fade = np.ones(N); nf = int(SR * 0.35); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = lp(mix.T, 15000).T  # keeps AAC from overshooting on the click transients
ceiling = 10 ** (-2.2 / 20)
def limit(x):  # look-ahead peak limiter on 4x-oversampled peaks: gain = smoothed running minimum
    pk = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)[:len(x) * 4].reshape(-1, 4).max(1)
    g = np.minimum(1, ceiling / (pk + 1e-9))
    L = int(0.006 * SR)
    g = uniform_filter1d(minimum_filter1d(g, 2 * L + 1), L)
    return x * g[:, None]
for _ in range(6):
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = limit(mix)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d  dur: %.3f' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(cues), DUR))
print('min cue margin over music RMS (dB): ' + ', '.join('%s %+.1f' % kv for kv in report.items()))
