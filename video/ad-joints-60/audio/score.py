"""Score and paper sounds for the Poorly Pet "stiff joints" scrapbook ad (84 BPM, 60 s).

Music: warm, cosy and optimistic. A felt piano (soft hammers, muted highs) plays the chords,
a Rhodes-style electric piano comps from the education section, an upright bass (woody
pluck with a small pitch settle) walks underneath, and brushes stir on every beat with soft
taps on 2 and 4. It starts as felt piano alone for the hook, adds bass and brushes for the
signs, Rhodes for the routine, a little piano melody for the products, then lifts (brighter
voicings, melody up an octave, a soft kick) into the offer and resolves to Fmaj9 on the
button press, ringing out under the end card.
Sounds (pen scratch, doodle scratch, tick, card press, tape tear, tape peel, stamp thunk,
price ding, page slide, marker squeak, stars, logo pop, button click) are placed from
cues.js, which the film also reads, so each lands on its frame.
Normalised to -14 LUFS with 4x-oversampled peaks held under -2 dBFS (so the AAC stays under -1 dBTP).

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
                                  and prints loudness and each cue type's margin over the music
"""
import json, os, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
js = "globalThis.window=globalThis;require(%r);console.log(JSON.stringify({TL:window.TL,CUES:window.CUES}))" % os.path.join(HERE, '..', 'cues.js')
data = json.loads(subprocess.check_output(['node', '-e', js]))
TL, CUES = data['TL'], data['CUES']
SR, BPM = 48000, TL['BPM']
B = 60 / BPM
DUR = TL['DUR']
N = int(SR * DUR)
rng = np.random.default_rng(11)  # fixed seed: identical on every run
PB = {k: round(v['t0'] / B) for k, v in TL['PAGES'].items()}  # page start beats


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


class Bus:
    def __init__(self): self.l, self.r = np.zeros(N + SR * 5), np.zeros(N + SR * 5)
    def add(self, t0, sig, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i < 0: sig, i = sig[-i:], 0
        self.l[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))
    def out(self): return np.stack([self.l[:N], self.r[:N]], 1)


def reverb(x, secs=2.2, wet=0.25, seed=3):
    r = np.random.default_rng(seed); n = int(SR * secs)
    ir = r.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR / (secs / 5))[:, None]
    ir = np.stack([lp(ir[:, 0], 4200), lp(ir[:, 1], 4200)], 1); ir /= np.sqrt((ir ** 2).sum(0))
    w = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x + wet * w


# ---------- instruments ----------
def felt(m, dur=2.4, vel=1.0):
    """Felt piano: slightly stretched partials, soft hammer, muted top end, a little felt thump."""
    t = tt(dur); f = hz(m); s = np.zeros(len(t))
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 8000: break
        s += (0.9 / k ** 1.3) * np.sin(2 * np.pi * fk * t + k) * np.exp(-t * (0.9 + 0.55 * k) * (0.6 + 0.4 * m / 60))
    s *= np.minimum(1, t / 0.006)
    thump = lp(rng.standard_normal(len(t)), 300) * env(len(t), 0.002, 0.03) * 0.5
    rel = np.clip((dur - t) / 0.3, 0, 1)
    return lp(s + thump, 1500 + 900 * vel) * rel * vel

def rhodes(m, dur, vel=1.0):
    t = tt(dur); f = hz(m) * (1 + 0.002 * np.sin(2 * np.pi * 0.4 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    idx = 1.1 * vel * np.exp(-t / 0.3)
    s = np.sin(ph + idx * np.sin(ph)) + 0.1 * np.sin(2 * ph) * np.exp(-t / 0.4)
    a = env(len(t), 0.005, 1.4) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
    return lp(s * a * np.clip((dur - t) / 0.2, 0, 1), 2400) * vel

def upright(m, dur=0.9, vel=1.0):
    """Upright bass: a woody pluck whose pitch settles, body resonance and a finger click."""
    t = tt(dur); f = hz(m) * (1 + 0.02 * np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.45 * np.sin(2 * ph) * np.exp(-t / 0.25) + 0.2 * np.sin(3 * ph) * np.exp(-t / 0.12)
    s = np.tanh(1.3 * s) * env(len(t), 0.004, 0.55) * np.clip((dur - t) / 0.08, 0, 1)
    click = bp(rng.standard_normal(len(t)), 600, 2500) * env(len(t), 0.0005, 0.008) * 0.25
    return lp(s + click, 900) * vel

def swish(dur, g=1.0):
    """Brush stirring the snare: band-passed noise that swells across the beat."""
    n = int(SR * dur); k = np.linspace(0, 1, n)
    x = bp(rng.standard_normal(n), 2200, 9000)
    return x * (np.sin(np.pi * k) ** 1.5) * g

def btap(g=1.0):
    n = int(SR * 0.16); x = bp(rng.standard_normal(n), 1500, 7000)
    return (x * env(n, 0.002, 0.045) + 0.3 * lp(rng.standard_normal(n), 400) * env(n, 0.001, 0.02)) * g

def kick():
    t = tt(0.35); f = 48 + 40 * np.exp(-t / 0.035)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.12), 300)

def bell(m, dur=1.4, bright=0.5):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.15) + 0.1 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05)) * env(len(t), 0.002, dur / 3.2)

def noise_sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(60, f * 0.6), min(f * 1.6, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    return out * {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2, 'down': (1 - k) ** 2}[shape]


# ---------- harmony (F major) ----------
CH = {  # bass note, voicing
    'F': (41, [57, 60, 64, 67]), 'Am': (45, [55, 60, 64, 67]), 'Bb': (46, [57, 60, 62, 65]), 'Csus': (36, [58, 62, 65, 67]),
    'Dm': (38, [57, 60, 64, 65]), 'Gm': (43, [58, 62, 65, 69]),
}
BARS = ['F', 'Am', 'Bb', 'Csus', 'Dm', 'Bb', 'F', 'Csus', 'F', 'Am', 'Bb', 'Csus', 'Dm', 'Bb', 'Gm', 'Csus', 'F', 'Am']
RESOLVE = PB['offer'] + 8          # the button press: Fmaj9
LIFT = PB['offer']                  # the offer lift
def chord_at(beat):
    if beat >= RESOLVE: return 'F'
    if beat >= LIFT + 4: return 'Csus'
    if beat >= LIFT - 1: return 'Bb'
    return BARS[min(len(BARS) - 1, beat // 4)]

music = Bus()
total = int(round(DUR / B))
RELATE, EDU, PROD, PROOF = PB['relate'], PB['good'], PB['bundle'], PB['proof']
prev = None
for beat in range(total):
    t = beat * B
    name = chord_at(beat); bass, v = CH[name]
    change = name != prev; prev = name
    lift = beat >= LIFT
    # felt piano chord on each change (and re-struck on beat 1 of a held bar), rolled slightly
    if beat < RESOLVE and (change or beat % 4 == 0):
        hold = 4 * B + 0.6
        vs = [x + 12 for x in v] if lift else v
        for i, m in enumerate(vs):
            music.add(t + i * 0.022, felt(m, hold + 0.6, 0.75 if beat < RELATE else 0.85), 0.14 if lift else 0.12 if beat < RELATE else 0.11, pan=(i - 1.5) * 0.18)
        music.add(t, felt(bass + 12, hold, 0.7), 0.10)
    # felt piano offbeat answers in the hook (gentle movement under the first lines)
    if beat < RELATE and beat % 2 == 1:
        music.add(t + B / 2, felt(v[-1] + 12, 1.2, 0.5), 0.09, pan=0.3)
    # upright bass: root on 1, fifth/approach on 3, walking quarters from the products on
    if beat >= 4 and beat < RESOLVE:
        if beat >= PROD:
            nxt = CH[chord_at(beat + 1)][0]
            walk = [bass, bass + 4 if name in ('F', 'Bb') else bass + 3, bass + 7, nxt - 1 if nxt > bass else nxt + 2][beat % 4]
            music.add(t, upright(walk - 12 if walk > 40 else walk, 0.75), 0.5)
        elif beat % 2 == 0:
            music.add(t, upright((bass if beat % 4 == 0 else bass + 7) - (12 if bass > 40 else 0), 1.3), 0.5)
    # brushes
    if RELATE <= beat < RESOLVE:
        g = 0.5 if beat < EDU else 0.75 if beat < PROD else 0.9
        if lift: g = 1.05
        music.add(t, swish(B, g), 0.032, pan=-0.2)
        if beat % 2 == 1: music.add(t, btap(g), 0.06, pan=0.15)
        if beat >= PROD and beat % 2 == 1: music.add(t + B * 2 / 3, btap(0.5 * g), 0.05, pan=0.2)  # swung ghost
    # Rhodes comping on the "and" of 2 and 4 from the education section
    if EDU <= beat < RESOLVE and beat % 2 == 1:
        for i, m in enumerate(v[1:]):
            music.add(t + B / 2 + i * 0.012, rhodes(m + (12 if lift else 0), B * 1.1, 0.6), 0.05, pan=0.25)
    # soft kick in the lift
    if lift and beat < RESOLVE and beat % 2 == 0:
        music.add(t, kick(), 0.45)

# a small felt-piano melody over the products and proof (top notes of the chords), up an octave in the offer
MEL = [0, 2, 3, 2, 3, 1, 2, -1]
for beat in range(PROD, RESOLVE):
    if beat % 4 in (0, 1, 3) or beat >= LIFT:
        name = chord_at(beat); v = CH[name][1]
        scale = [60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77]
        top = v[MEL[beat % 8] if MEL[beat % 8] >= 0 else 3] + 12
        top = min(scale, key=lambda s: abs(s - top)) + (12 if beat >= LIFT else 0)
        music.add(beat * B + (B / 2 if beat % 4 == 3 else 0), felt(top, 1.6, 0.8), 0.12 if beat >= LIFT else 0.085, pan=0.1)

# the resolve: a slow roll of Fmaj9 across the end card, bass and a high 6/9 shimmer
tR = RESOLVE * B
for i, m in enumerate([41, 53, 57, 60, 64, 67, 69, 72, 76]):
    music.add(tR + i * 0.04, felt(m, DUR - tR + 1.5, 0.9), 0.12, pan=(i - 4) * 0.1)
music.add(tR, upright(29, 2.6), 0.6)
for i, m in enumerate([81, 84, 88]):
    music.add(tR + 0.25 + i * 0.12, bell(m, 2.4, 0.3), 0.04, pan=(i - 1) * 0.3)


# ---------- paper and pen sounds ----------
def strokes(dur, rate, band, grain=0.5, seed=0):
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

def crackle(d, dens, seed):
    r = np.random.default_rng(seed); n = int(SR * d); x = np.zeros(n)
    for _ in range(int(dens * d)):
        i = r.integers(0, n - 200); x[i:i + 60] += r.uniform(0.3, 1.0) * r.standard_normal(60) * np.exp(-np.arange(60) / 12)
    return bp(x, 1200, 9000)

def sfx(kind, t0, d, bus, idx):
    if kind == 'pen':      # brush pen on paper
        bus.add(t0, strokes(d, 8, (1800, 6500), 0.55, 100 + idx), 0.40, pan=0.12)
    elif kind == 'scratch':  # doodle lines: longer, slower strokes
        bus.add(t0, strokes(d, 4.5, (1300, 5500), 0.5, 200 + idx), 0.44, pan=-0.12)
    elif kind == 'tick':
        bus.add(t0, strokes(min(d, 0.22), 14, (2000, 7500), 0.6, 300 + idx), 0.6, pan=0.2)
    elif kind == 'press':  # a card pressed flat: soft thump and paper slap
        t = tt(0.25); s = np.sin(2 * np.pi * 95 * t) * env(len(t), 0.002, 0.05)
        slap = lp(rng.standard_normal(len(t)), 2200) * env(len(t), 0.001, 0.025)
        bus.add(t0, s * 0.8 + slap * 0.9, 0.55, pan=-0.05)
    elif kind == 'tear':   # washi tape torn off the roll and smoothed down
        n = int(SR * 0.26); k = np.linspace(0, 1, n)
        x = crackle(0.26, 260, 400 + idx) * (0.3 + 0.7 * k) * (k < 0.82) + 0.25 * bp(rng.standard_normal(n), 2500, 8000) * np.sin(np.pi * k)
        bus.add(t0, x, 0.55, pan=0.25)
        bus.add(t0 + 0.24, lp(rng.standard_normal(int(SR * 0.12)), 3000) * env(int(SR * 0.12), 0.01, 0.03), 0.18, pan=0.25)
    elif kind == 'peel':   # tape peeled off each card, then the cards slide away
        for i in range(4):
            n = int(SR * 0.16); k = np.linspace(0, 1, n)
            bus.add(t0 + i * 0.16, crackle(0.16, 300, 500 + idx * 7 + i) * (1 - k) ** 0.5, 0.9, pan=(-1) ** i * 0.3)
            bus.add(t0 + i * 0.16 + 0.12, noise_sweep(0.4, 900, 3200), 0.32, pan=(-1) ** i * 0.4)
    elif kind == 'stamp':  # rubber stamp thunk: low body, wood knock, paper slap
        t0 += 0.07
        t = tt(0.35); s = np.sin(2 * np.pi * (70 + 50 * np.exp(-t / 0.02)) * t) * env(len(t), 0.001, 0.09)
        knock = np.sin(2 * np.pi * 210 * t) * env(len(t), 0.0005, 0.025)
        slap = lp(rng.standard_normal(len(t)), 1800) * env(len(t), 0.0005, 0.02)
        bus.add(t0, s + 0.5 * knock + 0.8 * slap, 0.75)
    elif kind == 'ding':   # price tag: a warm little bell
        for i, m in enumerate([84, 88]): bus.add(t0 + 0.05 + i * 0.07, bell(m, 1.2, 0.5), 0.12, pan=0.2)
        bus.add(t0, noise_sweep(0.3, 1500, 4000), 0.12, pan=-0.2)
    elif kind == 'slide':  # the page turned and slid across
        bus.add(t0, noise_sweep(0.55, 700, 3600), 0.45, pan=-0.3)
        bus.add(t0 + 0.42, lp(rng.standard_normal(int(SR * 0.1)), 500) * env(int(SR * 0.1), 0.004, 0.03), 0.35)
    elif kind == 'marker':
        n = int(SR * (d + 0.05)); k = np.linspace(0, 1, n)
        x = bp(rng.standard_normal(n), 700, 3200) * np.sin(np.pi * k) ** 0.6
        sq = np.sin(2 * np.pi * np.cumsum(1800 + 100 * np.sin(2 * np.pi * 8 * k * d)) / SR) * np.sin(np.pi * k) ** 2
        bus.add(t0, x + 0.06 * sq, 0.40, pan=-0.1)
        bus.add(t0 + 0.42, x[:int(n * 0.7)] + 0.06 * sq[:int(n * 0.7)], 0.32, pan=0.1)
    elif kind == 'stars':  # five stars, each drawn and filled with a rising note
        for i, m in enumerate([77, 81, 84, 88, 89]):
            tt0 = t0 + d * (i + 0.85) / 5
            bus.add(tt0 - 0.1, strokes(0.12, 18, (2200, 7500), 0.6, 600 + i), 0.45)
            bus.add(tt0, bell(m, 0.8, 0.4), 0.09, pan=(i - 2) * 0.2)
    elif kind == 'pop':
        t = tt(0.2); f = 300 + 500 * (1 - np.exp(-t / 0.03))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.05), 0.35)
    elif kind == 'click':  # the hand-drawn button pressed
        t = tt(0.06); bus.add(t0, hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0003, 0.004) + np.sin(2 * np.pi * 1500 * t) * env(len(t), 0.001, 0.012), 0.85)
        t = tt(0.25); bus.add(t0, np.sin(2 * np.pi * 110 * t) * env(len(t), 0.002, 0.05), 0.45)
    else:
        raise ValueError(kind)

ui = Bus()
counts = {}
for t0, kind, d in CUES:
    counts[kind] = counts.get(kind, -1) + 1
    sfx(kind, t0, d, ui, counts[kind])

# ---------- mix, loudness, peaks ----------
M = reverb(music.out(), 2.4, 0.28) * 1.0
U = reverb(ui.out(), 0.6, 0.08) * 0.5
mix = M + U
fade = np.ones(N); nf = int(SR * 0.6); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]; M = M * fade[:, None]; U = U * fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain; M *= gain; U *= gain
ceiling = 10 ** (-2 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass the ceiling, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
print('integrated LUFS: %.2f  true peak (4x) dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), tp, len(CUES)))

db = lambda x: 20 * np.log10(max(x, 1e-9))
worst = {}
for t0, kind, d in CUES:
    a, b = int(max(0, t0 - 0.05) * SR), int(min(DUR, t0 + max(d, 0.3)) * SR)
    if b <= a: continue
    over = db(np.abs(U[a:b]).max()) - db(np.sqrt((M[a:b] ** 2).mean()))
    worst[kind] = min(worst.get(kind, 99), over)
print('sfx peak over music RMS (worst per type, dB):', ', '.join('%s %+.1f' % kv for kv in sorted(worst.items(), key=lambda kv: kv[1])))
if os.environ.get('STEMS'):
    print('music stem LUFS %.1f, sfx stem LUFS %.1f' % (meter.integrated_loudness(M), meter.integrated_loudness(U)))
    for sec, (a, b) in {'hook': (0, 5), 'relate': (5, 12.8), 'edu': (12.8, 24.3), 'prod': (24.3, 43.6), 'proof': (43.6, 50.7), 'offer': (50.7, 56.4), 'end': (56.4, 59.3)}.items():
        x = M[int(a * SR):int(b * SR)]; print('  music %s RMS %.1f dBFS' % (sec, db(np.sqrt((x ** 2).mean()))))
