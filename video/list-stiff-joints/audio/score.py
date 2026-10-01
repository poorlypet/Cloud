"""Score and UI sounds for "5 things that help stiff joints" (112 BPM, about 31.3 s).

A tight, modern groove in A minor (Am7 - Fmaj7 - C - G), where the typewriter is part of
the kit: key clicks run on 32nds while text types, the carriage-return bell rings on each
price, and the receipt printer buzzes on the 16th grid. Beats 0-2 are a pickup (keys and
hats only), the full beat drops on beat 2 (1.07 s), a snare roll and riser build into the
offer on beat 46, and the button press on beat 54 lands with a chord.

Every cue comes from ../cues.js, which this script runs with node, so sound and picture
share one timeline. Normalised to -14 LUFS with 4x-oversampled peaks held under -1 dBFS.

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo)
"""
import json, os, re, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ev = json.loads(subprocess.check_output(['node', '-e', "global.window=global;require('./cues.js');console.log(JSON.stringify({ev:window.EV,cues:window.CUES}))"], cwd=ROOT))
EV, CUES = ev['ev'], ev['cues']
SR, BPM = 48000, 112
B = 60 / BPM
DUR = EV['DUR']
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
def noise(d): return rng.standard_normal(int(SR * d))


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
def kick():
    t = tt(0.42); f = 46 + 110 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.16)
    return np.tanh(1.6 * body) + 0.2 * hp(noise(0.42), 2500) * env(len(t), 0.0003, 0.004)

def snare():
    t = tt(0.3)
    tone = np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.05)
    nz = bp(noise(0.3), 1200, 8000) * env(len(t), 0.0008, 0.09)
    return 0.6 * tone + nz

def clap():
    n = int(SR * 0.25); x = bp(rng.standard_normal(n), 900, 4000)
    e = np.zeros(n)
    for d in (0, .009, .018): i = int(d * SR); e[i:] += env(n - i, 0.0004, 0.016 if d < .018 else 0.08)
    return x * e

def hat(open_=False):
    d = 0.2 if open_ else 0.035
    return hp(noise(d), 8000) * env(int(SR * d), 0.0004, d / (3 if open_ else 4))

def bass(m, dur):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
    e = np.minimum(1, t / 0.004) * np.clip((dur - t) / 0.02, 0, 1) * (0.55 + 0.45 * np.exp(-t / 0.08))
    return lp(s * e, 1100)

def stab(m, dur=0.16):
    t = tt(dur); f = hz(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.3 for k in (1, 2, 3, 4))
    return lp(s * env(len(t), 0.002, 0.06), 3200)

def pluck(m, dur=0.35):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05) + 0.15 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.02)) * env(len(t), 0.001, 0.11)

def pad(m, dur, bright=1600):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) / k for k, d, p in [(1, 0, 0), (1, .005, 1.1), (2, -.004, 2.3)])
    a = np.clip(np.minimum(t / 0.08, (dur - t) / 0.3), 0, 1)
    return lp(s * a, bright)

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.45 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.12) + 0.2 * bright * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05)) * env(len(t), 0.001, dur / 3.2)

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
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 67]]  # Am7 Fmaj7 C/G G
ROOTS = [33, 29, 36, 31]
MEL = [76, 72, 74, 76, 79, 76, 74, 72]  # a one-bar hook on 8ths, shifted per chord below
def bar_of(beat): return int((beat - 2) // 4) if beat >= 2 else -1
def chord_of(beat): return max(0, bar_of(beat)) % 4

end_beat = DUR / B
step = 0
b16 = 0.0
while b16 < end_beat:
    t = b16 * B
    beat_i, sub = int(b16), int(round((b16 % 1) * 4)) % 4
    bar_pos = (b16 - 2) % 4 if b16 >= 2 else b16 + 2
    c = chord_of(b16)
    pickup = b16 < 2
    roll = 44 <= b16 < 45.5
    gap = 45.5 <= b16 < 46
    tail = b16 >= 54
    full = not pickup and not gap
    # hats run all the way through, including the pickup
    if not gap:
        if sub in (1, 3): music.add(t, hat(), 0.10 if sub == 3 else 0.07, pan=-0.25)
        if sub == 2: music.add(t, hat(open_=True), 0.10, pan=0.25)
        if sub == 0 and pickup: music.add(t, hat(), 0.08, pan=-0.25)
    if full:
        on_beat = sub == 0
        if on_beat and (bar_pos in (0, 2) or (tail and bar_pos == 0)): music.add(t, kick(), 0.85)
        if not tail and abs(bar_pos - 2.75) < 1e-6 and bar_of(b16) % 2 == 1: music.add(t, kick(), 0.55)  # a syncopated push every other bar
        if on_beat and bar_pos in (1, 3) and not tail: music.add(t, snare(), 0.32, pan=0.05); music.add(t, clap(), 0.22, pan=-0.05)
        # bass: 8ths, root and octave, ducked after each kick
        if sub in (0, 2) and not tail:
            m = ROOTS[c] + (12 if sub == 2 and int(bar_pos) % 2 == 1 else 0)
            music.add(t, bass(m, B / 2 * 0.9), 0.30 if sub == 2 else 0.22)
        # off-beat chord stabs
        if sub == 2 and not tail:
            for i, m in enumerate(CH[c]): music.add(t, stab(m), 0.045, pan=(i - 1.5) * 0.3)
        # the hook melody on 8ths in the items and the offer
        if 6 <= b16 < 44 or 46 <= b16 < 54:
            if sub in (0, 2):
                k = int(bar_pos * 2) % 8
                m = MEL[k] - (0 if c in (0, 2) else 2 if c == 3 else 4)
                if (b16 >= 22 and b16 < 30) or k % 2 == 0: music.add(t, pluck(m), 0.07, pan=0.35 if k % 2 else -0.35)
    if roll and sub in (0, 1, 2, 3):
        music.add(t, snare(), 0.10 + 0.22 * (b16 - 44) / 1.5, pan=0.1)
    b16 = round(b16 + 0.25, 4)

# pads under the bars, quieter in the pickup
for bar in range(-1, int((54 - 2) / 4) + 1):
    s0 = max(0.0, (2 + 4 * bar) * B); s1 = min((2 + 4 * (bar + 1)) * B, 54 * B, 45.5 * B if bar == 10 else 99)
    if s1 <= s0: continue
    for i, m in enumerate(CH[max(0, bar) % 4]): music.add(s0, pad(m, s1 - s0 + 0.25), 0.022 if bar >= 0 else 0.012, pan=(i - 1.5) * 0.3)
# frame 0: a hit so the hook starts with energy
music.add(0, kick(), 0.8)
for i, m in enumerate(CH[0]): music.add(0, stab(m, 0.3), 0.06, pan=(i - 1.5) * 0.3)
# the end: a held chord from the button press
for i, m in enumerate([45, 57, 60, 64, 67, 71, 76]): music.add(54 * B, pad(m, DUR - 54 * B + 0.5, 2600), 0.045, pan=(i - 3) * 0.15)
music.add(54 * B, bass(33, 1.4), 0.45)

# ---------- UI sounds ----------
POP = [72, 74, 76, 79, 81, 83, 84, 86, 88]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k in ('key', 'keyA'):  # a typewriter key: hard click, a short metal ring and a low thump
        t = tt(0.06); a = 1.0 if k == 'keyA' else 0.75
        click = hp(rng.standard_normal(len(t)), 2200) * env(len(t), 0.0006, 0.0035)
        ring = np.sin(2 * np.pi * 3150 * t) * env(len(t), 0.0004, 0.012) * 0.25
        thump = np.sin(2 * np.pi * 170 * t) * env(len(t), 0.0006, 0.012) * 0.7
        bus.add(t0, (click + ring + thump) * a, 0.42, pan=0.2 if k == 'key' else -0.1)
    elif k == 'ding':  # the carriage-return bell, in key (E6 over A minor)
        t = tt(1.4); f = hz(88)
        s = np.sin(2 * np.pi * f * t) * env(len(t), 0.0005, 0.45) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * env(len(t), 0.0005, 0.08) + 0.25 * np.sin(2 * np.pi * f * 5.2 * t) * env(len(t), 0.0005, 0.03)
        bus.add(t0, s, 0.30, pan=0.25)
    elif k == 'ratchet':  # carriage return: accelerating clicks into the downbeat, plus a zip
        for i in range(9):
            ti = t0 - 0.26 * (1 - (i / 9) ** 0.7)
            c = hp(noise(0.02), 1800) * env(int(SR * 0.02), 0.0008, 0.004)
            bus.add(ti, c, 0.35 + 0.03 * i, pan=-0.3 + 0.07 * i)
        bus.add(t0 - 0.28, sweep(0.3, 500, 4500), 0.3)
    elif k == 'slam':
        t = tt(0.45); f = 50 + 70 * np.exp(-t / 0.03)
        bus.add(t0, np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.12)) + 0.5 * lp(noise(0.45), 3000) * env(len(t), 0.0005, 0.02), 0.55)
    elif k == 'whoosh':
        bus.add(t0 - 0.24, sweep(0.4, 300, 4500), 0.42)
    elif k == 'swish':  # a highlighter swipe
        bus.add(t0 - 0.02, sweep(0.18, 1800, 7000, 'hump'), 0.45, pan=0.2)
    elif k == 'tick':
        t = tt(0.05); bus.add(t0, hp(noise(0.05), 2000) * env(len(t), 0.0002, 0.003) + np.sin(2 * np.pi * 2600 * t) * env(len(t), 0.0005, 0.01), 0.5, pan=-0.2)
    elif k == 'check':  # tracker box ticks: a clack and two chime notes
        t = tt(0.06); bus.add(t0, hp(noise(0.06), 1500) * env(len(t), 0.0002, 0.005) + np.sin(2 * np.pi * 1200 * t) * env(len(t), 0.0005, 0.01), 0.55)
        bus.add(t0, bell(84, 0.6, 0.5), 0.16); bus.add(t0 + B / 4, bell(91, 0.7, 0.5), 0.16)
    elif k == 'stamp':
        t = tt(0.3); bus.add(t0, np.sin(2 * np.pi * np.cumsum(85 + 90 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.06) + 0.5 * bp(noise(0.3), 700, 4500) * env(len(t), 0.0005, 0.018), 0.6)
    elif k == 'thud':
        t = tt(0.25); f = 70 + 50 * np.exp(-t / 0.03)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.07), 0.4)
    elif k == 'pop':
        t = tt(0.12); f = hz(POP[num % len(POP)]) * (1 + 0.6 * np.exp(-t / 0.012))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.04) + 0.3 * hp(noise(0.12), 3000) * env(len(t), 0.0002, 0.003), 0.7, pan=((num % 5) - 2) * 0.18)
    elif k in ('print', 'printlong'):  # receipt printer: a buzzing motor gated on 32nds
        d = 0.42 if k == 'print' else 1.5
        t = tt(d); motor = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.5 + bp(rng.standard_normal(len(t)), 1500, 6000) * 0.8
        gate = (np.floor(t / (B / 8)) % 2 == 0).astype(float) * 0.6 + 0.4
        e = np.clip(np.minimum(t / 0.01, (d - t) / 0.04), 0, 1)
        bus.add(t0, bp(motor, 200, 7000) * gate * e, 0.30, pan=0.1)
    elif k == 'strike':  # a marker line through the was-price
        n = int(SR * 0.2); x = bp(rng.standard_normal(n), 2500, 7500) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 40)) * np.sin(np.pi * np.linspace(0, 1, n))
        bus.add(t0 - 0.03, x, 0.5, pan=-0.2)
    elif k == 'impact':
        t = tt(1.4); f = 38 + 80 * np.exp(-t / 0.06)
        bus.add(t0, np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.45)) + 0.6 * lp(noise(1.4), 3000) * env(len(t), 0.0005, 0.1), 0.7)
        bus.add(t0, sweep(1.0, 6000, 300, 'down'), 0.18)
    elif k == 'riser':
        d = EV['pay'] - t0; n = int(SR * d); tq = np.arange(n) / SR
        tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (3 * tq / d)) / SR) * (tq / d) ** 2
        bus.add(t0, sweep(d, 300, 9000, 'up') * 0.8 + 0.3 * tone, 0.32)
    elif k == 'click':
        t = tt(0.05); bus.add(t0, hp(noise(0.05), 2000) * env(len(t), 0.0003, 0.004) * 0.8 + np.sin(2 * np.pi * 1900 * t) * env(len(t), 0.001, 0.012), 0.75)
    elif k == 'chord':  # the button lands: a bright A minor add9 in bells
        for i, m in enumerate([69, 72, 76, 79, 83]): bus.add(t0 + i * 0.018, bell(m, 2.2, 0.6), 0.12, pan=(i - 2) * 0.25)

ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)

# ---------- mix, loudness, peaks ----------
M, U = music.out() * 0.8, ui.out()
U = lp(U.T, 11000, 4).T  # band-limit the clicks: very sharp broadband bursts make AAC overshoot
mix = M + U
fade = np.ones(N); nf = int(SR * 0.35); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = lp(mix.T, 16000, 4).T  # AAC drops this band anyway; removing it first avoids encoder overshoot
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
from scipy.ndimage import minimum_filter1d, uniform_filter1d
ceiling = 10 ** (-2.5 / 20)  # true-peak ceiling, with room for AAC overshoot so the file stays under -1 dBTP
for _ in range(4):  # look-ahead true-peak limiter on 4x-oversampled peaks, then re-normalise
    tp = np.abs(resample_poly(mix, 4, 1, axis=0)).max(1)[:4 * len(mix)].reshape(-1, 4).max(1)
    if tp.max() <= ceiling: break
    g = np.minimum(1.0, ceiling / np.maximum(tp, 1e-9))
    g = minimum_filter1d(g, int(0.004 * SR))          # hold the reduction across each peak
    g = uniform_filter1d(g, int(0.004 * SR))          # smooth it so it does not click
    g = np.minimum(g, minimum_filter1d(np.minimum(1.0, ceiling / np.maximum(tp, 1e-9)), 3))
    mix = mix * g[:, None]
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
tp = np.abs(resample_poly(mix, 4, 1, axis=0)).max()
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
print('integrated LUFS: %.2f  sample peak dBFS: %.2f  true peak (4x) dBTP: %.2f  cues: %d' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max()), 20 * np.log10(tp), len(CUES)))

# each cue type: its own peak against the music RMS around it (both before the limiter)
mono_m, mono_u = M.mean(1), U.mean(1)
res = {}
for t0, kind in CUES:
    k = re.sub(r'\d', '', kind)
    i = int(t0 * SR)
    w = (-int(0.3 * SR), int(0.12 * SR)) if k in ('whoosh', 'ratchet', 'riser') else (0, int(0.08 * SR))
    pk = np.abs(mono_u[max(0, i + w[0]):i + w[1]]).max()
    rms = np.sqrt(np.mean(mono_m[max(0, i - int(0.25 * SR)):i + int(0.25 * SR)] ** 2)) + 1e-9
    res.setdefault(k, []).append(20 * np.log10(pk / rms + 1e-12))
print('sfx peak over music RMS (min dB per cue type):')
print('  ' + '  '.join('%s %+.1f' % (k, min(v)) for k, v in sorted(res.items())))
