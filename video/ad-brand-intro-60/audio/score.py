"""Score and chalkboard sounds for the Poorly Pet brand intro (96 BPM, 60 s).

Music: confident, modern and uplifting in D major. A soft piano and plucked arpeggios open over
Bm-G-D-A (the "don't know" questions), then a light beat (felt kick, clap, hats) and a plucked
bass come in under I-V-vi-IV for the how-it-works boards. A short piano top line joins for the
bundles and proof, the offer builds over G-A with a riser and a snare fill, the drums drop out for
one bar as the logo is drawn (a big D major resolve), and the groove returns lightly to land on a
final D chord as the button is pressed.
Sounds: chalk writing scratches, chalk taps on every bullet, line drawing, cross-out strikes,
eraser swishes (one per sweep), a soft slide for each pan along the board, a register "ding" on
prices and bundles, stamp thuds and the button press. All are placed from cues.js (evaluated with
node), so each one lands on the frame. Normalised to -14 LUFS with true peaks under -1 dBTP.

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
def piano(m, dur=2.2, vel=1.0):
    """Additive piano: slightly stretched partials, upper ones dying faster, a soft hammer."""
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 10):
        fk = f * k * np.sqrt(1 + 0.0003 * k * k)
        if fk > 12000: break
        a = (1 / k ** 1.1) * (0.6 + 0.4 * vel)
        dec = (0.9 + 1.6 / (1 + f / 400)) / (1 + 0.45 * (k - 1))
        s += a * np.sin(2 * np.pi * fk * t + k) * np.exp(-t / dec)
    s += 0.06 * vel * bp(rng.standard_normal(len(t)), 800, 4000) * env(len(t), 0.0005, 0.008)
    return lp(s * np.minimum(1, t / 0.003), 3500 + 2500 * vel)

def pluck(m, dur=1.0, bright=1.0, pos=0.2):
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 12):
        if f * k > 10000: break
        a = abs(np.sin(np.pi * k * pos)) / k ** (1.2 - 0.25 * bright)
        s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (2.2 + 1.3 * k) / (0.6 + 0.4 * bright))
    return s * np.minimum(1, t / 0.002)

def pad(ms, dur, bright=1500):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for d, ph in [(0, 0), (.004, 1.1), (-.0035, 2.3)]:
            s += np.sin(2 * np.pi * hz(m) * (1 + d) * t + ph) + 0.3 * np.sin(4 * np.pi * hz(m) * (1 + d) * t + ph)
    a = np.clip(np.minimum(t / 0.5, (dur - t) / 0.7), 0, 1)
    return lp(s * a / len(ms), bright)

def bass(m, dur):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return lp(s * env(len(t), 0.006, dur * 0.7) * np.clip((dur - t) / 0.05, 0, 1), 900)

def kick():
    t = tt(0.32); f = 48 + 70 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.11) + 0.15 * bp(rng.standard_normal(len(t)), 1500, 5000) * env(len(t), 0.0003, 0.003)

def clap():
    n = int(SR * 0.22); x = bp(rng.standard_normal(n), 900, 5000); e = np.zeros(n)
    for o in (0, 0.009, 0.019):
        i = int(o * SR); e[i:] += np.exp(-np.arange(n - i) / (SR * (0.012 if o < 0.019 else 0.06)))
    return x * e * 0.6

def hat(open_=False):
    n = int(SR * (0.22 if open_ else 0.05)); x = hp(rng.standard_normal(n), 7000)
    return x * env(n, 0.0005, 0.08 if open_ else 0.014)

def snare():
    t = tt(0.18)
    return 0.7 * bp(rng.standard_normal(len(t)), 1500, 7000) * env(len(t), 0.001, 0.05) + 0.4 * np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.03)

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


# ---------- music ----------
music = Bus()
D = (38, [57, 62, 66, 69]); A = (33, [57, 61, 64, 69]); Bm = (35, [59, 62, 66, 71]); G = (31, [59, 62, 67, 71])
BARS = [Bm, G, D, A, D, A, Bm, G, D, A, Bm, G, D, A, Bm, G, D, A, Bm, G, A, D, G, D]
RES = 84   # beat: the drums drop out, the logo is drawn on the resolve
FIN = 92   # beat: the final chord, as the button is pressed
def sect(beat):
    if beat < 16: return 'intro'
    if beat < 48: return 'a'
    if beat < 76: return 'b'
    if beat < RES: return 'build'
    if beat < 88: return 'res'
    return 'out'

for bar, (root, v) in enumerate(BARS):
    b0 = bar * 4; t0 = b0 * B; s = sect(b0)
    # piano: chord on beat 1, a lighter re-strike on the "and" of 2
    vel = {'intro': 0.55, 'a': 0.65, 'b': 0.75, 'build': 0.8, 'res': 1.0, 'out': 0.8}[s]
    for i, m in enumerate(v):
        music.add(t0 + i * 0.012, piano(m, 2.6, vel), 0.07, pan=(i - 1.5) * 0.18)
    if s not in ('res',) and bar < 23:
        for i, m in enumerate(v[1:]):
            music.add(t0 + 1.5 * B + i * 0.01, piano(m, 1.4, vel * 0.7), 0.045, pan=(i - 1) * 0.2)
    music.add(t0, piano(root + 12, 3.0, vel), 0.06)
    # pad under everything from the first groove, brighter later
    if s != 'intro' or bar >= 2:
        music.add(t0, pad([root + 24] + v[:3], 4 * B + 0.7, {'intro': 900, 'a': 1200, 'b': 1600, 'build': 2000, 'res': 2600, 'out': 1800}[s]), {'intro': 0.03, 'a': 0.04, 'b': 0.05, 'build': 0.06, 'res': 0.09, 'out': 0.06}[s])
    # plucked arpeggio: 8ths in the intro and groove A, 16ths from groove B
    sub = 2 if s in ('intro', 'a') else 4
    PAT = [0, 1, 2, 3, 2, 1, 3, 2]
    if s != 'res' and bar < 23:
        for k in range(4 * sub):
            m = v[PAT[k % 8]] + 12
            g = (0.05 if k % sub == 0 else 0.032) * (0.8 if s == 'intro' else 1.0)
            music.add(t0 + k * B / sub, pluck(m, 0.6, 0.9), g, pan=0.4 if k % 2 else -0.3)
    # bass: root on 1, fifth/octave pickups
    if s in ('a', 'b', 'build', 'out'):
        for bb, m, d in [(0, root, 1.4), (1.5, root, 0.4), (2, root + 7, 0.9), (3, root + 12, 0.45), (3.5, root, 0.45)]:
            if s == 'out' and bar == 23 and bb > 0: continue
            music.add(t0 + bb * B, bass(m, d * B), 0.32)
    # beat
    for beat in range(4):
        tb = t0 + beat * B; gb = b0 + beat
        if s in ('a', 'b', 'build', 'out') and not (bar == 23 and beat > 0):
            if beat in (0, 2) or (s != 'a' and beat == 1 and bar % 2): music.add(tb if beat != 1 else tb + B / 2, kick(), 0.42)
            if (beat in (1, 3) and gb >= 24) or (s == 'build' and gb < 80): music.add(tb, clap(), 0.16 if s != 'build' else 0.2, pan=0.1)
            for h in range(2):
                music.add(tb + h * B / 2, hat(open_=(h == 1 and beat == 3)), 0.05 if h else 0.035, pan=0.35)
        elif s == 'intro' and gb >= 8 and beat in (1, 3):
            music.add(tb, hat(), 0.03, pan=0.35)

# a short piano top line for the bundles and proof (groove B)
for bar in range(12, 19):
    root, v = BARS[bar]
    top = sorted(set([m + 12 for m in v]))
    phrase = [(0, top[-1]), (1.5, top[-2]), (2.5, top[-1] if bar % 2 else top[-3]), (3, top[-2])]
    for bb, m in phrase:
        music.add((bar * 4 + bb) * B, piano(m, 1.2, 0.8), 0.05, pan=0.15)

# the build into the offer: riser and a snare fill into the resolve
music.add(76 * B, noise_sweep(8 * B, 300, 9000, 'up'), 0.14)
for k in range(16):
    music.add((80 + k * 0.25) * B, snare(), 0.08 + 0.2 * k / 15, pan=-0.1)
# the resolve on the logo: drums out, a wide D major chord, a bell shimmer
for i, m in enumerate([38, 50, 57, 62, 66, 69, 74, 78]):
    music.add(RES * B + i * 0.03, piano(m, 4.5, 1.0), 0.06, pan=(i - 3.5) * 0.1)
music.add(RES * B, noise_sweep(0.9, 6000, 900, 'down'), 0.05)
for i, m in enumerate([86, 90, 93]):
    music.add(RES * B + 0.15 + i * 0.09, bell(m, 2.0, 0.5), 0.05, pan=(i - 1) * 0.3)
# the final chord on the press, ringing out
for i, m in enumerate([38, 45, 50, 57, 62, 66, 69, 74]):
    music.add(FIN * B + i * 0.025, piano(m, 5.0, 0.95), 0.07, pan=(i - 3.5) * 0.1)
music.add(FIN * B, pad([50, 57, 62, 66, 69], DUR - FIN * B + 1, 2200), 0.08)
music.add(FIN * B, bass(26, 3.5), 0.4)
music.add(FIN * B, kick(), 0.4)


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

def tap(idx, g=1.0):
    t = tt(0.12)
    click = bp(rng.standard_normal(len(t)), 2500, 9000) * env(len(t), 0.0002, 0.003)
    body = np.sin(2 * np.pi * (170 + 8 * (idx % 3)) * t) * env(len(t), 0.001, 0.035) + 0.5 * np.sin(2 * np.pi * 920 * t) * env(len(t), 0.0005, 0.012)
    return (1.4 * click + 0.6 * body) * g

def sfx(kind, t0, d, bus, idx):
    if kind == 'chalk':
        bus.add(t0, strokes(d, 11, (1800, 8000), 0.7, 100 + idx, 0.12), 0.26, pan=0.1)
    elif kind == 'scrawl':
        bus.add(t0, strokes(d, 16, (2000, 8500), 0.7, 300 + idx, 0.1), 0.22, pan=-0.15)
    elif kind == 'draw':
        bus.add(t0, strokes(d, 5, (1200, 6500), 0.6, 500 + idx, 0.2), 0.28, pan=-0.1)
    elif kind == 'fill':
        bus.add(t0, strokes(d, 20, (1500, 7000), 0.6, 700 + idx, 0.05), 0.28)
    elif kind == 'strike':
        x = strokes(max(d, 0.12), 6, (1600, 7500), 0.7, 900 + idx, 0.3)
        bus.add(t0, x, 0.38, pan=0.15)
    elif kind == 'tap':
        bus.add(t0, tap(idx), 0.95, pan=0.2 if idx % 2 else -0.2)
    elif kind == 'erase':
        n = int(SR * 0.24); k = np.linspace(0, 1, n)
        x = bp(rng.standard_normal(n), 350, 3200) * np.sin(np.pi * k) ** 0.8
        x += 0.5 * strokes(0.2, 30, (2500, 7000), 0.8, 1100 + idx)[:n] * np.sin(np.pi * k)
        bus.add(t0, x, 0.42, pan=-0.35 if idx % 2 == 0 else 0.35)
    elif kind == 'slide':
        bus.add(t0 - 0.05, noise_sweep(0.6, 500, 2600), 0.32, pan=0.3)
    elif kind == 'ding':
        for i, (m, g) in enumerate([(93, 0.2), (98, 0.12)]):
            bus.add(t0 + i * 0.06, bell(m, 1.3, 0.7), g, pan=0.1)
        bus.add(t0, tap(idx, 0.5), 0.3)
    elif kind == 'stamp':
        t = tt(0.3); th = np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.06)
        bus.add(t0, th + 0.6 * bp(rng.standard_normal(len(t)), 500, 4000) * env(len(t), 0.0005, 0.015), 0.6)
    elif kind == 'press':
        t = tt(0.15)
        bus.add(t0, hp(rng.standard_normal(len(t)), 1500) * env(len(t), 0.0003, 0.005) + np.sin(2 * np.pi * 1300 * t) * env(len(t), 0.001, 0.02) + 0.6 * np.sin(2 * np.pi * 220 * t) * env(len(t), 0.001, 0.04), 1.1)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, true peak ----------
M, U = music.out() * 2.4, ui.out() * 1.0
fade = np.ones(N); nf = int(SR * 0.5); fade[-nf:] = np.linspace(1, 0, nf) ** 2
M = M * fade[:, None]; U = U * fade[:, None]
mix = M + U
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain; M *= gain; U *= gain
ceiling = 10 ** (-1.2 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass the ceiling, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
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
