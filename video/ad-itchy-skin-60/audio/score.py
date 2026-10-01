"""Score and whiteboard sounds for "Itchy skin" (104 BPM pop-lite, 60 s).

Music: bright, modern pop-lite on a D - A - Bm - G loop. Plucks, claps, a round synth bass,
a soft kick and hats. The hook opens on plucks and claps, the groove drops on the first sticky
notes, thins out a little for the education boards, adds a high counter-pluck under the
products, breaks down for the reviews, builds with a riser and a clap roll into the offer and
resolves on a D major chord when the button is pressed.
Sounds: marker squeaks on every written word and drawn stroke, a soft thwap for every sticky
note, highlighter swishes, a felt rub for each eraser wipe, a roll and clunk for each board
slide, register dings on prices, pops for the stars, a paper tear for the coupon stub and a
click for the button. All placed from cues.js (evaluated with node).
Normalised to -14 LUFS with 4x-oversampled peaks under -1 dBFS.

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
        if i >= len(self.l): return
        sig = sig[:len(self.l) - i]
        self.l[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))
    def out(self): return np.stack([self.l[:N], self.r[:N]], 1)


# ---------- instruments ----------
def pluck(m, dur=0.45, bright=1.0):
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 9):
        if f * k > 10000: break
        s += np.sin(2 * np.pi * f * k * t) / k ** 1.3 * np.exp(-t * (5 + 4 * k) / bright)
    return s * np.minimum(1, t / 0.002)

def pad(ms, dur, bright=1800):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for d, ph in [(0, 0), (.004, 1.1), (-.0035, 2.3)]:
            s += np.sin(2 * np.pi * hz(m) * (1 + d) * t + ph) + 0.3 * np.sin(4 * np.pi * hz(m) * (1 + d) * t + ph)
    a = np.clip(np.minimum(t / 0.25, (dur - t) / 0.4), 0, 1)
    return lp(s * a / len(ms), bright)

def bass(m, dur=0.3):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return lp(s * env(len(t), 0.004, dur * 0.55), 1100)

def kick():
    t = tt(0.35); f = 46 + 80 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.11)

def clap():
    n = int(SR * 0.22); x = bp(rng.standard_normal(n), 1000, 4000)
    e = np.zeros(n)
    for d in (0, .010, .021): i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.018 if d < .02 else 0.08)
    return x * e

def hat(open_=False):
    d = 0.16 if open_ else 0.035
    return hp(rng.standard_normal(int(SR * d)), 8000) * env(int(SR * d), 0.0005, d / (3 if open_ else 4))

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.12)
            + 0.15 * bright * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05)) * env(len(t), 0.001, dur / 3.5)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    return out * {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.5, 'down': (1 - k) ** 2}[shape]


# ---------- music ----------
music = Bus()
CH = [(38, [62, 66, 69, 74]), (33, [61, 64, 69, 73]), (35, [59, 62, 66, 71]), (31, [59, 62, 67, 71])]  # D A Bm G
RES = 100  # the button press: resolve
def chord(beat): return CH[0] if beat >= RES else CH[(beat // 4) % 4]

def section(beat):
    if beat < 8: return 'hook'
    if beat < 28: return 'full'
    if beat < 48: return 'edu'
    if beat < 72: return 'prod'
    if beat < 86: return 'break'
    if beat < 88: return 'build'
    if beat < RES: return 'offer'
    return 'end'

RIFF = [0, 2, 3, 1, 2, 3, 0, 2]  # chord-tone order for the 8th-note pluck riff
CNTR = [None, 3, None, 2, None, 3, 1, None]
for s in range(RES * 4):  # 16th steps
    beat, sub = divmod(s, 4); t = s * B / 4
    sec = section(beat); bass_m, v = chord(beat)
    if sec == 'end': break
    drums = sec in ('full', 'edu', 'prod', 'offer')
    if sub == 0:
        if drums and (beat % 2 == 0 or sec in ('prod', 'offer')): music.add(t, kick(), 0.55)
        if sec == 'hook' and beat >= 4 and beat % 2 == 0: music.add(t, kick(), 0.35)
        if beat % 2 == 1 and (drums or sec == 'hook'): music.add(t, clap(), 0.26 if sec != 'hook' else 0.22, pan=0.05)
        if sec == 'break' and beat % 4 == 3: music.add(t, clap(), 0.16)
    if sec == 'build': music.add(t, clap(), 0.07 + 0.16 * ((beat - 86) * 4 + sub) / 8, pan=0.05)
    if drums and sub in (1, 3) and sec != 'edu': music.add(t, hat(), 0.06, pan=-0.25)
    if drums and sub == 2: music.add(t, hat(open_=sec == 'offer'), 0.07 if sec == 'offer' else 0.05, pan=0.25)
    # bass: root on the beat, octave pop on the off-8th
    if sec in ('full', 'edu', 'prod', 'offer') or (sec == 'hook' and beat >= 4):
        if sub == 0: music.add(t, bass(bass_m, 0.3), 0.42)
        if sub == 2 and beat % 2 == 1: music.add(t, bass(bass_m + 12, 0.18), 0.22)
        if sub == 3 and beat % 4 == 3: music.add(t, bass(bass_m + 7, 0.14), 0.2)
    # plucks: 8th-note riff everywhere, a high counter-line under the products and the offer
    if sub % 2 == 0:
        e8 = (beat * 2 + sub // 2) % 8
        m = v[RIFF[e8]] + 12
        g = 0.10 if sec != 'break' else 0.085
        music.add(t, pluck(m, 0.4, 1.0), g, pan=0.3 if e8 % 2 else -0.3)
        if sec in ('prod', 'offer') and CNTR[e8] is not None:
            music.add(t, pluck(v[CNTR[e8]] + 24, 0.3, 0.8), 0.045, pan=0.5)
# pads under every bar (quieter in the busy parts, fuller in the breakdown)
for bar in range(0, RES, 4):
    bass_m, v = chord(bar); sec = section(bar)
    g = {'hook': 0.05, 'break': 0.10, 'build': 0.08}.get(sec, 0.045)
    music.add(bar * B, pad(v, 4 * B + 0.4, 2200 if sec == 'break' else 1600), g)
music.add(86 * B, sweep(2 * B + 0.05, 300, 7000, 'up'), 0.22)  # riser into the offer
music.add(88 * B, sweep(0.6, 6000, 800, 'down'), 0.10)
# the resolve: a bright D major strum, low D and a held pad over the end card
for i, m in enumerate([50, 57, 62, 66, 69, 74, 78]):
    music.add(RES * B + i * 0.025, pluck(m, 2.6, 2.2), 0.11, pan=(i - 3) * 0.12)
music.add(RES * B, bass(26, 2.4), 0.55)
music.add(RES * B, pad([62, 66, 69, 74, 78], DUR - RES * B + 0.5, 2600), 0.12)
music.add(RES * B, kick(), 0.5)


# ---------- whiteboard sounds ----------
def squeaks(dur, rate, seed, tonal=0.6):
    """Felt marker on a whiteboard: a burst per stroke, with a squeal that bends in pitch."""
    r = np.random.default_rng(seed)
    n = int(SR * (dur + 0.1)); out = np.zeros(n); t = 0.0
    while t < dur:
        L = r.uniform(0.6, 1.3) / rate; i0 = int(t * SR); m = min(n - i0, int(L * SR))
        if m > 50:
            k = np.linspace(0, 1, m); tl = np.arange(m) / SR
            f = r.uniform(1300, 2300) * (1 + 0.18 * np.sin(np.pi * k * r.uniform(0.6, 1.4))) * (1 + 0.012 * np.sin(2 * np.pi * 38 * tl))
            sq = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
            fr = bp(r.standard_normal(m), 900, 5000)
            e = np.sin(np.pi * k) ** 0.8 * r.uniform(0.6, 1.0)
            out[i0:i0 + m] += (tonal * sq * 0.45 + (1 - tonal * 0.5) * fr * 0.9) * e
        t += L * r.uniform(1.0, 1.35)
    return out

def sfx(kind, t0, d, bus, idx):
    if kind == 'marker':
        bus.add(t0, squeaks(d, 7, 100 + idx, 0.55), 0.40, pan=0.12)
    elif kind == 'stroke':
        bus.add(t0, squeaks(d, 4, 300 + idx, 0.45), 0.42, pan=-0.12)
    elif kind == 'squeak':
        bus.add(t0, squeaks(max(d, 0.15), 3.5, 500 + idx, 0.8), 0.40, pan=0.05)
    elif kind == 'tick':
        bus.add(t0, squeaks(0.08, 14, 700 + idx, 0.9), 0.34)
        bus.add(t0 + 0.08, squeaks(0.13, 9, 800 + idx, 0.9), 0.38, pan=0.1)
    elif kind == 'thwap':
        t = tt(0.18); f = 150 * np.exp(-t / 0.05) + 60
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.0008, 0.035)
        slap_ = bp(rng.standard_normal(len(t)), 350, 3200) * env(len(t), 0.0004, 0.018)
        bus.add(t0 - 0.004, body * 0.9 + slap_ * 0.9, 0.62, pan=(-0.2, 0.2)[idx % 2])
    elif kind == 'hl':
        bus.add(t0, sweep(max(d, 0.22), 900, 3800), 0.30, pan=-0.15)
    elif kind == 'wipe':
        # felt rubbing the board, loudest where the eraser moves fastest (same spring as the film)
        n = int(SR * d); t = np.arange(n) / SR; w = 7 / 1.12
        speed = w * w * t * np.exp(-w * t); speed /= speed.max()
        rub = bp(rng.standard_normal(n), 350, 2600) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 9 * t)))
        bus.add(t0, rub * speed ** 0.8, 0.40, pan=-0.1)
    elif kind == 'slide':
        bus.add(t0, sweep(0.45, 250, 2400), 0.36, pan=0.25)
        t = tt(0.2); bus.add(t0 + 0.32, lp(rng.standard_normal(len(t)), 500) * env(len(t), 0.002, 0.04) + np.sin(2 * np.pi * 95 * t) * env(len(t), 0.002, 0.05), 0.45)
    elif kind == 'ding':
        for i, m in enumerate([88, 95]): bus.add(t0 + i * 0.06, bell(m, 1.0, 0.9), 0.16, pan=(i - 0.5) * 0.4)
    elif kind == 'pop':
        m = [81, 83, 85, 86, 88, 90][idx % 6]
        t = tt(0.12); f = hz(m) * (0.6 + 0.4 * np.minimum(1, t / 0.03))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.04), 0.30)
        bus.add(t0, bell(m, 0.6, 0.6), 0.10)
    elif kind == 'tear':
        n = int(SR * 0.42); r = np.random.default_rng(900)
        grains = np.zeros(n)
        for _ in range(70):
            i = int(r.uniform(0, n - 400)); grains[i:i + 300] += r.uniform(0.3, 1) * np.exp(-np.arange(300) / 60)
        k = np.linspace(0, 1, n)
        x = bp(r.standard_normal(n), 1200, 8000) * grains * np.sin(np.pi * k) ** 0.5
        bus.add(t0 - 0.2, x, 0.45, pan=0.2)
    elif kind == 'press':
        t = tt(0.12)
        bus.add(t0 - 0.05, hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0003, 0.004) + np.sin(2 * np.pi * 180 * t) * env(len(t), 0.001, 0.03), 0.55)
    elif kind == 'resolve':
        for i, m in enumerate([86, 90, 93, 98]): bus.add(t0 + i * 0.04, bell(m, 2.2, 0.5), 0.10, pan=(i - 1.5) * 0.25)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, peaks ----------
M, U = music.out() * 1.0, ui.out() * 1.0
mix = M + U
fade = np.ones(N); nf = int(SR * 0.5); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]; M = M * fade[:, None]; U = U * fade[:, None]
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
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(CUES)))

db = lambda x: 20 * np.log10(max(x, 1e-9))
worst = {}
for t0, kind, d in CUES:
    a, b = int(max(0, t0 - 0.05) * SR), int(min(DUR, t0 + max(d, 0.25)) * SR)
    if b <= a: continue
    over = db(np.abs(U[a:b]).max()) - db(np.sqrt((M[a:b] ** 2).mean()))
    worst[kind] = min(worst.get(kind, 99), over)
print('sfx peak over music RMS (worst per type, dB):', ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
print('music-only LUFS: %.1f  sfx-only LUFS: %.1f' % (meter.integrated_loudness(M), meter.integrated_loudness(U)))
