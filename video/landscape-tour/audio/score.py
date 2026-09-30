"""Score and UI sounds for the Poorly Pet landscape tour (96 BPM, 30 s).

Calm and modern: warm electric-piano keys and a soft pad from the first frame; a soft
four-on-the-floor kick, a round bass and light 16th shakers enter with chapter 01; a soft
snap on 2 and 4 from chapter 02; an 8th-note keys arpeggio for the scanner; everything but
the keys drops out for the closing chord. Chords change with the chapters. UI sounds come
from cues.js (in beats), so each one lands on its frame. Normalised to -14 LUFS, with true
peaks held under -2 dBFS (headroom for AAC).

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR = 48000, 30.0
src = open(os.path.join(HERE, '..', 'cues.js')).read()
BPM = float(re.search(r'window\.BPM\s*=\s*([\d.]+)', src).group(1))
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)  # fixed seed: identical on every run


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
def keys(m, dur, vel=1.0):
    """Warm electric piano: sine body, a short bell tine, gentle tremolo."""
    n = int(SR * (dur + 1.2)); t = np.arange(n) / SR; f = hz(m)
    body = np.sin(2 * np.pi * f * t) + 0.10 * np.sin(2 * np.pi * 2 * f * t) + 0.04 * np.sin(2 * np.pi * 3 * f * t)
    tine = 0.28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.22) + 0.10 * vel * np.sin(2 * np.pi * 4.07 * f * t) * np.exp(-t / 0.06)
    e = np.minimum(1, t / 0.004) * np.exp(-t / (1.3 + 0.4 * (m < 60)))
    rel = np.clip((dur + 0.35 - t) / 0.35, 0, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.6 * t)
    return lp((body + tine) * e * rel * trem, 3200) * vel

def pad(m, dur):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) / k for k, d, p in [(1, 0, 0), (1, .0035, 1.3), (2, -.003, 2.1), (3, .002, .5)])
    a = np.clip(np.minimum(t / 0.6, (dur - t) / 0.8), 0, 1)
    return lp(s * a, 1400)

def bass(m, dur):
    t = tt(dur); f = hz(m)
    s = np.tanh(1.4 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)))
    e = np.minimum(1, t / 0.008) * np.exp(-t / 0.5) * np.clip((dur - t) / 0.04, 0, 1)
    return lp(s * e, 420)

def kick():
    t = tt(0.45); f = 46 + 70 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.16)
    return lp(body + 0.05 * hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0.0005, 0.003), 2500)

def shaker(v):
    d = 0.07; x = bp(rng.standard_normal(int(SR * d)), 5000, 11000)
    return x * env(len(x), 0.006, 0.018) * v

def snap():
    n = int(SR * 0.18); x = bp(rng.standard_normal(n), 1400, 5000)
    return x * env(n, 0.001, 0.035)

def pluck(m, dur=0.35):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .05)) * env(len(t), 0.002, 0.11)

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


# ---------- harmony, following the chapters (start beat, bass root, voicing) ----------
SEG = [(0, 41, [53, 57, 60, 64, 67]),   # Fmaj9  intro
       (6, 38, [53, 57, 60, 64]),       # Dm9    01
       (11, 34, [50, 57, 60, 65]),      # Bbmaj9
       (16, 41, [52, 57, 60, 67]),      # Fmaj9  02
       (20, 36, [52, 57, 62, 67]),      # C6/9
       (24, 38, [53, 57, 60, 64]),      # Dm9    03
       (29, 34, [50, 57, 60, 65]),      # Bbmaj9
       (33, 31, [53, 58, 62, 69]),      # Gm9    04
       (37, 36, [53, 58, 62, 67]),      # C9sus4
       (41, 29, [53, 57, 60, 64, 67, 72])]  # Fmaj9  close
def seg_at(beat):
    s = SEG[0]
    for x in SEG:
        if beat >= x[0] - 1e-9: s = x
    return s

music = Bus()
TOTAL_BEATS = int(round(DUR / BEAT))
DRUMS_IN, DRUMS_OUT = 6, 41
for i, (sb, root, v) in enumerate(SEG):
    eb = SEG[i + 1][0] if i + 1 < len(SEG) else TOTAL_BEATS
    t0, dur = sb * BEAT, (eb - sb) * BEAT
    last = sb == 41
    # keys: full chord on the change (a slight strum), lighter restrikes inside the section
    for j, m in enumerate(v): music.add(t0 + j * 0.012, keys(m, min(dur, 3.0) if not last else 4.2, 0.9 if not last else 1.0), 0.075, pan=(j - len(v) / 2) * 0.18)
    if not last:
        for rb in np.arange(sb + 1.5, eb - 0.4, 2.0):
            for j, m in enumerate(v[1:]): music.add(rb * BEAT + j * 0.01, keys(m, 0.9, 0.55), 0.06, pan=(j - 1) * 0.25)
    # pad underneath
    for j, m in enumerate(v): music.add(t0, pad(m, dur + 0.6 if not last else dur), 0.018, pan=(j - len(v) / 2) * 0.25)
music.add(41 * BEAT, bass(29 + 12, 3.6), 0.45)
music.add(41 * BEAT, bell(84, 3.0, 0.4), 0.05); music.add(41 * BEAT + 0.03, bell(88, 3.0, 0.4), 0.04)

for s in range(TOTAL_BEATS * 4):
    beat = s / 4; t = beat * BEAT; sub = s % 4
    _, root, v = seg_at(beat)
    if 4 <= beat < DRUMS_OUT:  # light 16th shakers, a little swing on the off 16ths
        sw = 0.018 if sub % 2 else 0
        vol = [0.30, 0.16, 0.62, 0.20][sub] * (0.6 if beat < DRUMS_IN else 1.0)
        music.add(t + sw, shaker(vol), 0.16, pan=0.3)
    if DRUMS_IN <= beat < DRUMS_OUT:
        if sub == 0:
            music.add(t, kick(), 0.55)
            if beat >= 16 and (int(beat) - DRUMS_IN) % 2 == 1: music.add(t, snap(), 0.09, pan=-0.1)
            music.add(t, bass(root + 12 if root < 34 else root, BEAT * 0.62), 0.30)
        if sub == 2 and (int(beat) - DRUMS_IN) % 2 == 1:
            music.add(t, bass(root + 12 if root < 34 else root + 7, BEAT * 0.3), 0.16)
    if 33 <= beat < 41 and sub in (0, 2):  # 8th arpeggio under the scanner
        m = v[[0, 1, 2, 3, 2, 1, 3, 2][int(s / 2) % 8]] + 12
        music.add(t, pluck(m), 0.035, pan=0.35 if sub else -0.35)

# ---------- UI sounds ----------
POP = [72, 74, 77, 79, 81, 84, 86, 89, 91, 93, 96, 98]  # F major pentatonic
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'key':
        t = tt(0.03); bus.add(t0, bp(rng.standard_normal(len(t)), 2500, 8000) * env(len(t), 0.001, 0.005) + 0.5 * np.sin(2 * np.pi * 1700 * t) * env(len(t), 0.001, 0.006), 0.3, pan=-0.15)
    elif k == 'pop':
        t = tt(0.14); f = hz(POP[num % len(POP)]) * (1 + 0.5 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.04), 0.36, pan=((num % 5) - 2) * 0.15)
    elif k == 'draw':
        n = int(SR * 0.36); x = bp(rng.standard_normal(n), 2500, 7000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 22)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
        bus.add(t0, x, 0.55, pan=0.2)
    elif k == 'whoosh':  # a calm page push
        bus.add(t0 - 0.2, sweep(0.6, 220, 2600), 0.5)
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(75 + 40 * np.exp(-t / 0.05)) / SR) * env(len(t), 0.005, 0.09), 0.32)
    elif k == 'swish':
        bus.add(t0 - 0.12, sweep(0.3, 700, 5200), 0.22)
    elif k == 'push':
        bus.add(t0 - 0.1, sweep(0.4, 500, 4000), 0.26, pan=-0.3)
    elif k == 'morph':
        bus.add(t0 - 0.05, sweep(0.35, 400, 3000), 0.34); bus.add(t0, bell(77, 0.6, 0.3), 0.16)
    elif k == 'bloom':
        bus.add(t0 - 0.05, sweep(0.5, 300, 3500), 0.4); bus.add(t0 + 0.05, bell(81, 0.9, 0.4), 0.15); bus.add(t0 + 0.09, bell(88, 0.9, 0.4), 0.12)
    elif k == 'tick':
        t = tt(0.04); bus.add(t0, np.sin(2 * np.pi * 3000 * t) * env(len(t), 0.0005, 0.008), 0.34, pan=0.2)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, bp(rng.standard_normal(len(t)), 2000, 8000) * env(len(t), 0.001, 0.004) * 0.8 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.012), 0.5)
    elif k == 'card':
        t = tt(0.14); bus.add(t0, np.sin(2 * np.pi * 200 * t) * env(len(t), 0.002, 0.035) + 0.4 * sweep(0.14, 900, 2600), 0.52)
    elif k == 'stamp':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(110 + 70 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.05) + 0.35 * bp(rng.standard_normal(len(t)), 800, 4000) * env(len(t), 0.0005, 0.012), 0.4)
    elif k == 'send':
        t = tt(0.16); f = 600 + 900 * (t / t[-1]); bus.add(t0 - 0.03, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]), 0.24); bus.add(t0 - 0.05, sweep(0.2, 1500, 6000), 0.16)
    elif k == 'typing':
        for i in range(4): sfx('tick', t0 + i * BEAT / 4, bus)
    elif k == 'chime':
        for i, m in enumerate([81, 84, 89]): bus.add(t0 + i * 0.05, bell(m, 1.4, 0.7), 0.26, pan=(i - 1) * 0.3)
    elif k == 'shutter':
        t = tt(0.12); x = bp(rng.standard_normal(len(t)), 1500, 9000)
        e = env(len(t), 0.001, 0.008); e[int(0.05 * SR):] += env(len(t) - int(0.05 * SR), 0.001, 0.01)
        bus.add(t0, x * e, 0.5)
    elif k == 'scan':
        t = tt(0.8); f = 500 + 1100 * t / 0.8
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.05, 0.5) * 0.3 + sweep(0.8, 1000, 6000), 0.45)
    elif k == 'count':
        t = tt(0.05); bus.add(t0, np.sin(2 * np.pi * hz(84 + num * 2) * t) * env(len(t), 0.0005, 0.012), 0.26)
    elif k == 'step':
        bus.add(t0, bell([77, 81, 84][num % 3], 0.8, 0.8), 0.32)
    elif k == 'star':
        bus.add(t0, bell([84, 86, 89, 91, 93][num % 5], 0.7, 1.0), 0.12, pan=(num - 2) * 0.2)
    elif k == 'logo':
        t = tt(1.4); f = 40 + 55 * np.exp(-t / 0.05)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.35), 0.45)
        for i, m in enumerate([77, 81, 84, 89]): bus.add(t0 + i * 0.025, bell(m, 2.2, 0.5), 0.09)
    else:
        raise ValueError(kind)


def expand(cues):
    outl = []
    for c in cues:
        if len(c) == 2: outl.append((c[0] * BEAT, c[1]))
        else:
            b0, kind, n, step = c
            for i in range(n): outl.append(((b0 + i * step) * BEAT, kind.replace('#', str(i))))
    return sorted(outl)

CUES = expand(json.loads(re.search(r'window\.CUES\s*=\s*(\[.*?\]);', src, re.S).group(1)))
ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)

# ---------- mix, loudness, peaks ----------
MUSIC_GAIN = 0.85
uiout = np.stack([lp(ui.out()[:, 0], 12000, 4), lp(ui.out()[:, 1], 12000, 4)], 1)
mix = music.out() * MUSIC_GAIN + uiout
fade = np.ones(N); nf = int(SR * 0.6); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= gain
ceiling = 10 ** (-2 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass -1 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    g2 = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20); mix *= g2; gain *= g2
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
# stems for the audibility check (same gain as the mix; not used by the film)
if os.environ.get('STEMS'):
    d = os.environ['STEMS']; os.makedirs(d, exist_ok=True)
    sf.write(os.path.join(d, 'music.wav'), music.out() * MUSIC_GAIN * gain * fade[:, None], SR, subtype='FLOAT')
    sf.write(os.path.join(d, 'ui.wav'), uiout * gain * fade[:, None], SR, subtype='FLOAT')
    json.dump(CUES, open(os.path.join(d, 'cues.json'), 'w'))
print('integrated LUFS: %.2f  peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), len(CUES)))
