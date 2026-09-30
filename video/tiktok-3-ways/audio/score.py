"""Score and UI sounds for the Poorly Pet "3 ways" ad (90 BPM lo-fi, 30 s).

Warm and unhurried: soft electric-piano keys with a slow tape wobble, a gentle kick on 1 and 3,
brushed hats and a brush snare, a round bass, and a little vinyl dust. The hook is keys only;
the groove enters with the first list scroll (beat 5), lifts to Bbmaj9 for the recap and
resolves to Fmaj9 under the logo. UI sounds (soft keys, marimba notes, taps, a shutter, a
scan tone, bells for the ticks) come from cues.js, which the film also reads, so each one
lands on its frame. Normalised to -14 LUFS, with true peaks held under -2 dBFS (so the AAC stays under -1 dBTP).

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
                                  and prints the loudness and each cue type's margin over the music
"""
import json, os, re, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
CUES_JS = os.path.join(HERE, '..', 'cues.js')
data = json.loads(subprocess.run(['node', '-e', f"require({json.dumps(os.path.abspath(CUES_JS))}); console.log(JSON.stringify({{BPM: globalThis.BPM, CUES: globalThis.CUES}}))"],
                                 capture_output=True, text=True, check=True).stdout)
BPM, CUES = data['BPM'], data['CUES']
SR, DUR = 48000, 30.0
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


def reverb(x, secs=1.8, wet=0.22, seed=3):
    r = np.random.default_rng(seed); n = int(SR * secs)
    ir = r.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR / (secs / 5))[:, None]
    ir = np.stack([lp(ir[:, 0], 5000), lp(ir[:, 1], 5000)], 1); ir /= np.sqrt((ir ** 2).sum(0))
    w = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x + wet * w


# ---------- instruments ----------
def keys(m, dur, vel=1.0, t_abs=0.0):
    """Electric-piano tine: FM with a decaying index, slow tremolo and tape wobble."""
    t = tt(dur); f = hz(m) * (1 + 0.0025 * np.sin(2 * np.pi * 0.45 * (t + t_abs)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    idx = 1.3 * vel * np.exp(-t / 0.25)
    s = np.sin(ph + idx * np.sin(ph)) + 0.12 * np.sin(2 * ph) * np.exp(-t / 0.4)
    a = env(len(t), 0.006, 1.6) * (1 + 0.12 * np.sin(2 * np.pi * 4.2 * t))
    rel = np.clip((dur - t) / 0.25, 0, 1)
    return lp(s * a * rel, 2600) * vel

def marimba(m, dur=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.02)) * env(len(t), 0.002, 0.16)

def bell(m, dur=1.2, bright=0.6):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.15)) * env(len(t), 0.003, dur / 3.5)

def bass(m, dur):
    t = tt(dur); f = hz(m)
    s = np.tanh(1.4 * (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)))
    a = np.minimum(1, t / 0.012) * np.exp(-t / 1.1) * np.clip((dur - t) / 0.08, 0, 1)
    return lp(s * a, 380)

def kick():
    t = tt(0.45); f = 46 + 70 * np.exp(-t / 0.03)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.16), 900)

def brush(d=0.16, lo=3000, hi=9000, a=0.012):
    n = int(SR * d); return bp(rng.standard_normal(n), lo, hi) * env(n, a, d / 3)

def snare():
    n = int(SR * 0.3); return bp(rng.standard_normal(n), 1200, 6000) * env(n, 0.006, 0.09)

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
CHORDS = {'Fmaj9': ([53, 57, 60, 64, 67], 41), 'Em7': ([52, 55, 59, 62, 67], 40), 'Dm9': ([53, 57, 60, 64, 69], 38),
          'Cmaj9': ([52, 55, 59, 62, 67], 36), 'Bbmaj9': ([50, 53, 57, 60, 65], 34)}
# (start beat, chord). Bars start on beats 1, 5, 9 ...; the hook sits on Bbmaj9 and the list opens on Fmaj9.
PLAN = [(0, 'Bbmaj9')] + [(5 + 4 * i, ['Fmaj9', 'Em7', 'Dm9', 'Cmaj9'][i % 4]) for i in range(8)] + [(37, 'Bbmaj9'), (40, 'Fmaj9')]
GROOVE = (5, 40)          # drums and bass play between these beats
END = 40                  # the final chord, under the logo

for j, (b0, name) in enumerate(PLAN):
    b1 = PLAN[j + 1][0] if j + 1 < len(PLAN) else DUR / BEAT
    notes, root = CHORDS[name]
    if b0 == END:
        for i, m in enumerate(notes + [72]): music.add(b0 * BEAT + i * 0.02, keys(m, DUR - b0 * BEAT, 0.9, b0 * BEAT), 0.085, pan=(i - 2.5) * 0.15)
        music.add(b0 * BEAT, bass(root, DUR - b0 * BEAT), 0.34)
        continue
    # comp: a rolled chord on the downbeat, a lighter re-strike on the "and" of 2 in each bar
    for bb in np.arange(b0, b1, 4.0):
        for i, m in enumerate(notes): music.add(bb * BEAT + i * 0.018, keys(m, min(4, b1 - bb) * BEAT + 0.2, 0.9, bb * BEAT), 0.075, pan=(i - 2) * 0.18)
        if bb + 1.5 < b1:
            for i, m in enumerate(notes[2:]): music.add((bb + 1.5) * BEAT + i * 0.012, keys(m, 1.2 * BEAT, 0.55, (bb + 1.5) * BEAT), 0.06, pan=(i - 1) * 0.25)
    if GROOVE[0] <= b0 < GROOVE[1]:
        for bb in np.arange(b0, b1, 4.0):  # bass: root, root on 3, a fifth pickup on the "and" of 4
            music.add(bb * BEAT, bass(root, 1.8 * BEAT), 0.40)
            if bb + 2 < b1: music.add((bb + 2) * BEAT, bass(root, 1.2 * BEAT), 0.32)
            if bb + 3.5 < b1: music.add((bb + 3.5) * BEAT, bass(root + 7, 0.45 * BEAT), 0.22)

# a small top-line motif (F major pentatonic), every other bar, kept under the UI sounds
MOTIF = [(0.5, 77), (1.0, 76), (2.5, 72), (3.0, 74)]
for i in range(8):
    if i % 2: continue
    b0 = 5 + 4 * i
    for off, m in MOTIF:
        music.add((b0 + off) * BEAT, keys(m, 0.9 * BEAT, 0.6, (b0 + off) * BEAT), 0.035, pan=0.3)

# drums: kick on 1 and 3, brush snare on 2 and 4, brushed swung eighths
SWING = 0.58
b = GROOVE[0]
while b < GROOVE[1] - 1e-6:
    t = b * BEAT; pos = (b - 1) % 4
    if pos in (0, 2): music.add(t, kick(), 0.55)
    if pos in (1, 3): music.add(t, snare(), 0.07, pan=0.05)
    music.add(t, brush(0.2, 2500, 8000, 0.02), 0.035, pan=-0.2)
    music.add(t + SWING * BEAT, brush(0.12, 4000, 10000, 0.006), 0.05, pan=0.25)
    b += 1

# vinyl dust: a quiet warm hiss and sparse fixed crackles
hiss = lp(hp(rng.standard_normal(N), 800), 4500) * 0.004
music.l[:N] += hiss; music.r[:N] += hiss
for tc in np.sort(rng.uniform(0, DUR, 90)):
    n = int(SR * 0.004); music.add(tc, hp(rng.standard_normal(n), 2000) * env(n, 0.0002, 0.0008), 0.05 * rng.uniform(0.3, 1), pan=rng.uniform(-0.6, 0.6))

# ---------- UI sounds ----------
PENT = [65, 67, 69, 72, 74, 77, 79, 81]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'key':
        t = tt(0.03); bus.add(t0, hp(rng.standard_normal(len(t)), 1800) * env(len(t), 0.0003, 0.005) + 0.5 * np.sin(2 * np.pi * 1100 * t) * env(len(t), 0.0008, 0.007), 0.30, pan=0.12)
    elif k == 'note':
        bus.add(t0, marimba(81, 0.5), 0.22, pan=-0.15); bus.add(t0 + 0.06, marimba(84, 0.5), 0.14, pan=0.15)
    elif k == 'draw':
        n = int(SR * 0.7); x = bp(rng.standard_normal(n), 2200, 6500) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 18)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
        bus.add(t0, x, 0.26, pan=-0.2)
    elif k == 'scroll':
        bus.add(t0 - 0.25, sweep(0.9, 350, 2200), 0.42); bus.add(t0, marimba(72, 0.5), 0.30, pan=-0.1)
    elif k == 'chip':
        bus.add(t0, marimba(PENT[num % 8] + 5, 0.4), 0.22, pan=(num % 4 - 1.5) * 0.2)
    elif k == 'tap':
        t = tt(0.06); bus.add(t0, hp(rng.standard_normal(len(t)), 1500) * env(len(t), 0.0003, 0.004) * 0.7 + np.sin(2 * np.pi * 1300 * t) * env(len(t), 0.001, 0.014), 0.45)
        bus.add(t0 + 0.02, marimba(77, 0.4), 0.14)
    elif k == 'fold':
        bus.add(t0 - 0.12, sweep(0.35, 2500, 500), 0.36); bus.add(t0, marimba(69, 0.4), 0.16)
    elif k == 'row':
        bus.add(t0, marimba([69, 72, 76][num % 3], 0.6), 0.26)
        t = tt(0.1); bus.add(t0, np.sin(2 * np.pi * 180 * t) * env(len(t), 0.002, 0.025), 0.2)
    elif k == 'badge':
        t = tt(0.12); f = hz([79, 81, 84, 84][num % 4]) * (1 + 0.4 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.04), 0.42, pan=(num - 1) * 0.2)
    elif k == 'send':
        t = tt(0.18); f = 500 + 800 * (t / t[-1]); bus.add(t0 - 0.03, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]), 0.22); bus.add(t0 - 0.06, sweep(0.25, 1200, 5000), 0.14)
        sfx('tap', t0, bus)
    elif k == 'dots':
        for i in range(3):
            t = tt(0.04); bus.add(t0 + i * BEAT / 4, np.sin(2 * np.pi * 2200 * t) * env(len(t), 0.0005, 0.008), 0.42, pan=(i - 1) * 0.2)
    elif k == 'reply':
        bus.add(t0, bell(84, 1.4, 0.5), 0.16, pan=-0.2); bus.add(t0 + 0.07, bell(88, 1.4, 0.5), 0.13, pan=0.2)
    elif k == 'shutter':
        t = tt(0.12); x = lp(hp(rng.standard_normal(len(t)), 1500), 7000)
        e = env(len(t), 0.0003, 0.008); e[int(0.05 * SR):] += env(len(t) - int(0.05 * SR), 0.0003, 0.01)
        bus.add(t0, x * e, 0.5)
    elif k == 'scan':
        d = 1.6; t = tt(d); f = 520 + 520 * (t / d)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.5 * np.exp(-t / 2.5), 0.16)
        bus.add(t0, sweep(d, 800, 4000), 0.22); bus.add(t0, bell(79, 0.8, 0.5), 0.16)
    elif k == 'step':
        bus.add(t0, bell([72, 76, 79][num % 3], 1.0, 0.7), 0.24)
    elif k == 'stat':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t / 0.03)) / SR) * env(len(t), 0.001, 0.08), 0.35)
        bus.add(t0, bell(84, 0.8, 0.4), 0.12)
    elif k == 'tick':
        bus.add(t0, marimba([76, 79, 84][num % 3], 0.6), 0.38); bus.add(t0, bell([88, 91, 96][num % 3], 0.6, 0.3), 0.08)
        t = tt(0.03); bus.add(t0, hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0002, 0.003), 0.18)
    elif k == 'logo':
        t = tt(1.2); f = 42 + 50 * np.exp(-t / 0.05)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.3), 0.45)
        for i, m in enumerate([77, 81, 84, 88]): bus.add(t0 + i * 0.03, bell(m, 2.4, 0.5), 0.09, pan=(i - 1.5) * 0.25)

ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)

# ---------- mix, loudness, peaks ----------
mus = reverb(music.out(), 2.2, 0.20, 3) * 0.8
uio = reverb(ui.out(), 1.4, 0.12, 5)
mix = mus + uio
fade = np.ones(N); nf = int(SR * 0.6); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]; mus = mus * fade[:, None]; uio = uio * fade[:, None]
meter = pyln.Meter(SR)
g = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= g
ceiling = 10 ** (-2 / 20)  # 1 dB of headroom below -1 dBTP for the AAC encode
for _ in range(6):  # soft-clip only if 4x-oversampled peaks pass -2 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  sample peak dBFS: %.2f  4x true peak dBFS: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max()), len(CUES)))

# audibility: each cue's UI peak (first 150 ms) over the music RMS around it (+-250 ms), same gain
margins = {}
for t0, kind in CUES:
    i = int(t0 * SR); a, bb = max(0, i - SR // 4), min(N, i + SR // 4)
    pk = np.abs(uio[i:i + int(0.15 * SR)]).max() * g
    rms = np.sqrt(np.mean(mus[a:bb] ** 2)) * g + 1e-9
    margins.setdefault(re.sub(r'\d', '', kind), []).append(20 * np.log10(pk / rms))
print('sfx peak over music RMS (min / median dB):')
for k, v in sorted(margins.items(), key=lambda kv: min(kv[1])):
    print('  %-8s %6.1f / %6.1f  (n=%d)' % (k, min(v), float(np.median(v)), len(v)))
