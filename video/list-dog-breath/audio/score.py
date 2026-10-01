"""Score and chalkboard sounds for "5 things for fresher dog breath" (116 BPM, about 30 s).

Music: upbeat, playful and modern in G major. Beats 0-1 are a pickup under the title (chalk taps
and a short lift); the groove drops on beat 2. A bouncy plucked bass, a marimba hook, offbeat
piano stabs, a light four-on-the-floor kick, finger snaps on 2 and 4, and a CHALK TAP ON EVERY
BEAT run under the list (I-V-vi-IV). Hats go to 16ths for items 3-5. The last bar before the offer
is a build on D (riser and a snare roll), the offer bars run G-C-D, and the button press resolves
to a ringing G major chord.
Sounds (all from cues.js, evaluated with node, so each lands on its frame): a slam on each numeral
(every one on a downbeat), chalk-writing scratches, line-drawing strokes, hatch scribbles, tracker
ticks, eraser swishes (one per sweep), a register ding on each price, stamp thuds on the badges and
the code, a strike-through on the was-price, and the button click.
Normalised to -14 LUFS with true peaks under -1 dBTP.

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
rng = np.random.default_rng(23)  # fixed seed: identical on every run
PRESS = TL['EV']['pay']['press']['t']


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
def marimba(m, dur=0.6):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.35 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.05) + 0.12 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / 0.015)
    return s * np.minimum(1, t / 0.0015)

def piano(m, dur=1.2, vel=1.0):
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0003 * k * k)
        if fk > 12000: break
        dec = (0.6 + 1.2 / (1 + f / 400)) / (1 + 0.45 * (k - 1))
        s += (1 / k ** 1.1) * np.sin(2 * np.pi * fk * t + k) * np.exp(-t / dec)
    return lp(s * np.minimum(1, t / 0.003), 3000 + 3000 * vel)

def pbass(m, dur):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.08) + 0.15 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.04)
    return lp(s * env(len(t), 0.003, dur * 0.55) * np.clip((dur - t) / 0.03, 0, 1), 1100)

def kick():
    t = tt(0.3); f = 50 + 85 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.0015, 0.1) + 0.12 * bp(rng.standard_normal(len(t)), 1500, 5000) * env(len(t), 0.0003, 0.003)

def snap():
    n = int(SR * 0.12); x = bp(rng.standard_normal(n), 1800, 6000)
    return x * env(n, 0.0004, 0.022) * 0.8

def hat(open_=False):
    n = int(SR * (0.16 if open_ else 0.045)); x = hp(rng.standard_normal(n), 7500)
    return x * env(n, 0.0004, 0.06 if open_ else 0.012)

def snare():
    t = tt(0.16)
    return 0.7 * bp(rng.standard_normal(len(t)), 1500, 7000) * env(len(t), 0.001, 0.045) + 0.4 * np.sin(2 * np.pi * 200 * t) * env(len(t), 0.001, 0.03)

def bell(m, dur=1.4, bright=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.2) + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.07)) * env(len(t), 0.002, dur / 3.2)

def noise_sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(60, f * 0.6), min(f * 1.6, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    return out * {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]

def chalk_tap(idx=0, g=1.0):
    """A stick of chalk knocked on the board: a dry click and a short woody body."""
    t = tt(0.1)
    click = bp(rng.standard_normal(len(t)), 2500, 9000) * env(len(t), 0.0002, 0.003)
    body = np.sin(2 * np.pi * (180 + 10 * (idx % 3)) * t) * env(len(t), 0.001, 0.03) + 0.5 * np.sin(2 * np.pi * 960 * t) * env(len(t), 0.0005, 0.01)
    return (1.4 * click + 0.6 * body) * g


# ---------- music ----------
music = Bus()
G = (43, [59, 62, 67, 71]); D = (38, [57, 62, 66, 69]); Em = (40, [59, 64, 67, 71]); Cc = (36, [60, 64, 67, 72])
BAR0 = 2                                   # the first downbeat (beat 2)
CH = [G, D, Em, Cc, G, D, Em, Cc, G, D, D, G, Cc, D, G]   # bar 10 = build on D, bars 11-13 = offer G-C-D, bar 14 = the resolve
NB = len(CH)
BUILD, OFFER = 10, 11
# the marimba hook: two bars of 8ths [step, midi]; the answer phrase sits on vi-IV
HOOK_A = [(0, 74), (1, 76), (2, 79), (4, 76), (5, 74), (7, 71), (8, 74), (10, 71), (11, 69), (12, 67), (14, 69), (15, 71)]
HOOK_B = [(0, 76), (1, 79), (2, 81), (4, 79), (5, 76), (7, 74), (8, 76), (10, 72), (11, 71), (12, 72), (14, 74), (15, 76)]
HOOK_O = [(0, 79), (1, 81), (2, 83), (4, 81), (5, 79), (7, 76), (8, 79), (10, 76), (11, 74), (12, 72), (14, 74), (15, 78)]

# pickup under the title (beats 0-2): chalk taps on 8ths, rising, and a short lift into the drop
for k in range(4):
    music.add(k * B / 2, chalk_tap(k, 0.7 + 0.1 * k), 0.5, pan=-0.2 + 0.13 * k)
music.add(0.2, noise_sweep(BAR0 * B - 0.2, 400, 6000, 'up'), 0.10)
for i, m in enumerate(G[1]):
    music.add(0.0 + i * 0.01, piano(m, 1.1, 0.6), 0.045, pan=(i - 1.5) * 0.2)

for bar in range(NB):
    b0 = BAR0 + bar * 4; t0 = b0 * B
    if t0 >= DUR: break
    root, v = CH[bar]
    if bar == NB - 1: continue  # the resolve bar is played by the press chord below
    build, offer = bar == BUILD, bar >= OFFER
    for beat in range(4):
        tb = t0 + beat * B
        if tb >= PRESS - 0.02: break
        # four on the floor (thinned in the build), snaps on 2 and 4, a chalk tap on every beat
        if not build or beat == 0: music.add(tb, kick(), 0.5)
        if beat in (1, 3) and not build: music.add(tb, snap(), 0.22, pan=0.12)
        music.add(tb, chalk_tap(beat, 0.9), 0.32, pan=-0.25)
        # hats: 8ths, then 16ths from item 3 on and in the offer
        sub = 4 if (b0 >= 22 or offer) else 2
        for h in range(sub):
            if h == 0: continue
            music.add(tb + h * B / sub, hat(open_=(sub == 2 and h == 1 and beat == 3)), 0.05 if h % 2 else 0.035, pan=0.35)
        # bouncy octave bass: root on the beat, octave on the "and"
        if not build:
            music.add(tb, pbass(root, 0.42 * B), 0.42)
            music.add(tb + B / 2, pbass(root + 12, 0.36 * B), 0.30)
        else:
            for q in range(2): music.add(tb + q * B / 2, pbass(root, 0.4 * B), 0.36)
        # offbeat piano stabs
        if not build:
            for i, m in enumerate(v[1:]):
                music.add(tb + B / 2 + i * 0.006, piano(m, 0.32, 0.7), 0.032, pan=(i - 1) * 0.25)
    # marimba hook over two bars at a time
    if not build:
        hook = HOOK_O if offer else (HOOK_A if bar % 4 < 2 else HOOK_B)
        half = bar % 2
        for step, m in hook:
            if step // 8 != half: continue
            ts = t0 + (step % 8) * B / 2
            if ts >= PRESS - 0.02: continue
            music.add(ts, marimba(m, 0.5), 0.13, pan=0.2)
            music.add(ts + B * 0.75, marimba(m + 12, 0.3), 0.025, pan=-0.3)  # a soft echo

# the build into the offer: riser and a snare roll on D
tb = (BAR0 + BUILD * 4) * B
music.add(tb, noise_sweep(4 * B, 300, 9000, 'up'), 0.34)
for k in range(16):
    music.add(tb + k * B / 4, snare(), 0.08 + 0.32 * k / 15, pan=-0.1)
for i, m in enumerate(D[1]):
    music.add(tb + i * 0.01, piano(m, 4 * B, 0.8), 0.05, pan=(i - 1.5) * 0.2)
# the press resolves to a ringing G major chord
for i, m in enumerate([43, 50, 55, 59, 62, 67, 71, 74, 79]):
    music.add(PRESS + i * 0.02, piano(m, 4.0, 1.0), 0.06, pan=(i - 4) * 0.1)
for i, m in enumerate([83, 86, 91]):
    music.add(PRESS + 0.06 + i * 0.07, bell(m, 2.0, 0.6), 0.05, pan=(i - 1) * 0.3)
music.add(PRESS, pbass(31, 2.4), 0.5)
music.add(PRESS, kick(), 0.5)
music.add(PRESS + 2 * B, marimba(79, 0.8), 0.08)
music.add(PRESS + 2.5 * B, marimba(83, 0.8), 0.06)


# ---------- chalkboard sounds ----------
def strokes(dur, rate, band, grain=0.6, seed=0, squeak=0.0):
    """Chalk on a board: bursts of gritty filtered noise, one per stroke, with the odd squeak."""
    r = np.random.default_rng(seed)
    n = int(SR * (dur + 0.08)); x = bp(r.standard_normal(n), *band)
    grit = np.abs(hp(r.standard_normal(n), 2000)) ** 3
    x = x * (1 - grain + grain * grit / (grit.mean() + 1e-9))
    e = np.zeros(n); t = 0.0; sq = np.zeros(n)
    while t < dur:
        L = r.uniform(0.6, 1.4) / rate; i0, i1 = int(t * SR), min(n, int((t + L) * SR))
        k = np.linspace(0, 1, i1 - i0)
        e[i0:i1] += np.sin(np.pi * k) ** 0.5 * r.uniform(0.6, 1.0)
        if squeak and r.uniform() < squeak:
            f0 = r.uniform(2300, 3400); tk = np.arange(i1 - i0) / SR
            sq[i0:i1] += np.sin(2 * np.pi * f0 * tk + 3 * np.sin(2 * np.pi * 31 * tk)) * np.sin(np.pi * k) ** 2 * 0.25
        t += L * r.uniform(0.9, 1.2)
    return x * e + sq

def sfx(kind, t0, d, bus, idx):
    if kind == 'chalk':
        bus.add(t0, strokes(d, 12, (1800, 8000), 0.7, 100 + idx, 0.12), 0.34, pan=0.1)
    elif kind == 'draw':
        bus.add(t0, strokes(d, 6, (1200, 6500), 0.6, 500 + idx, 0.2), 0.34, pan=-0.1)
    elif kind == 'fill':
        bus.add(t0, strokes(d, 22, (1500, 7000), 0.6, 700 + idx, 0.05), 0.32)
    elif kind == 'strike':
        bus.add(t0, strokes(max(d, 0.12), 6, (1600, 7500), 0.7, 900 + idx, 0.3), 0.44, pan=0.15)
    elif kind in ('tap', 'tick'):
        bus.add(t0, chalk_tap(idx), 1.0, pan=0.2 if idx % 2 else -0.2)
        if kind == 'tick':
            t = tt(0.08); bus.add(t0 + 0.04, np.sin(2 * np.pi * hz(88 + 2 * (idx % 5)) * t) * env(len(t), 0.001, 0.025), 0.22, pan=0.3)
    elif kind == 'erase':
        n = int(SR * 0.2); k = np.linspace(0, 1, n)
        x = bp(rng.standard_normal(n), 350, 3200) * np.sin(np.pi * k) ** 0.8
        x += 0.5 * strokes(0.17, 30, (2500, 7000), 0.8, 1100 + idx)[:n] * np.sin(np.pi * k)
        bus.add(t0, x, 0.55, pan=-0.4 if idx % 2 == 0 else 0.4)
    elif kind == 'slam':
        # the numeral hits the board: a low thump, a chalky crack and a puff of dust
        t = tt(0.45); f = 48 + 80 * np.exp(-t / 0.03)
        thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.12)
        crack = bp(rng.standard_normal(len(t)), 1200, 7000) * env(len(t), 0.0004, 0.018)
        dust = lp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.004, 0.09)
        bus.add(t0, thump + 0.7 * crack + 0.25 * dust, 0.85)
        bus.add(t0 - 0.12, noise_sweep(0.14, 900, 5000, 'up'), 0.25)
    elif kind == 'ding':
        for i, (m, g) in enumerate([(93, 0.5), (98, 0.3)]):
            bus.add(t0 + i * 0.06, bell(m, 1.2, 0.7), g, pan=0.1)
        bus.add(t0, chalk_tap(idx, 0.8), 0.7)
    elif kind == 'stamp':
        t = tt(0.3); th = np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.06)
        bus.add(t0, th + 0.6 * bp(rng.standard_normal(len(t)), 500, 4000) * env(len(t), 0.0005, 0.015), 1.1)
    elif kind == 'press':
        t = tt(0.15)
        bus.add(t0, lp(hp(rng.standard_normal(len(t)), 1500), 7000) * env(len(t), 0.0008, 0.005) + np.sin(2 * np.pi * 1300 * t) * env(len(t), 0.001, 0.02) + 0.6 * np.sin(2 * np.pi * 220 * t) * env(len(t), 0.001, 0.04), 0.8)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, true peak ----------
M, U = music.out() * 2.0, ui.out() * 0.85
fade = np.ones(N); nf = int(SR * 0.4); fade[-nf:] = np.linspace(1, 0, nf) ** 2
M = M * fade[:, None]; U = U * fade[:, None]
mix = M + U
meter = pyln.Meter(SR)
TARGET = -13.8  # the AAC encode reads about 0.2 LU quieter, so this lands at -14.0 LUFS in the MP4
gain = 10 ** ((TARGET - meter.integrated_loudness(mix)) / 20)
mix *= gain; M *= gain; U *= gain
ceiling = 10 ** (-2.0 / 20)  # extra headroom so the AAC encode stays under -1 dBTP
for _ in range(10):  # soft-clip only if 4x-oversampled peaks pass the ceiling, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), TARGET)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
print('integrated LUFS: %.2f  true peak (4x) dBTP: %.2f  cues: %d' % (meter.integrated_loudness(mix), tp, len(CUES)))

# audibility: each cue's peak against the music's RMS over the same window
db = lambda x: 20 * np.log10(max(x, 1e-9))
worst = {}
for t0, kind, d in CUES:
    a, b = int(max(0, t0 - 0.02) * SR), int(min(DUR, t0 + max(d, 0.2)) * SR)
    if b <= a: continue
    over = db(np.abs(U[a:b]).max()) - db(np.sqrt((M[a:b] ** 2).mean()))
    worst[kind] = min(worst.get(kind, 99), over)
print('sfx peak over music RMS (worst per type, dB):', ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
print('music alone LUFS: %.1f   sounds alone LUFS: %.1f' % (meter.integrated_loudness(M), meter.integrated_loudness(U)))
