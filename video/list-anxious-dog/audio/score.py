"""Score and sound effects for "5 things that calm an anxious dog" (124 BPM, about 29 s).

Music: a bouncy, modern house-pop loop in A major (A - E - F#m - D, one bar each). Bars start on
beat 2, so the hook is a 2-beat pickup plus a filtered bar, and the full groove drops on item 1.
Four-on-the-floor kick, claps on 2 and 4, off-beat open hats, a bouncing off-beat bass, syncopated
marimba chord stabs and a short pluck hook, all side-chained to the kick. A snare roll and riser
build into the bundle, the groove filters down under the offer, and the button press lands a big
bright chord that rings to the end.

Sound effects come from cues.js (run through node), so each one lands on its frame: a slam on
every giant number, a whoosh into every colour flip, pops for words, ticks for karaoke words,
a slap for each sticker card, a ding for each price, stamps, a strike swish, stars, the riser,
and the button click + chord.

    python3 audio/score.py        writes audio/score.wav (48 kHz, 16-bit, stereo) and prints checks
"""
import json, os, re, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.loads(subprocess.check_output(['node', '-e', "require('" + os.path.join(HERE, '..', 'cues.js') + "'); console.log(JSON.stringify({tl: globalThis.TL, cues: globalThis.CUES}))"]))
TL, CUES = tl['tl'], tl['cues']
SR, BPM = 48000, TL['BPM']
B = 60 / BPM
DUR = TL['DUR']
N = int(round(SR * DUR))
rng = np.random.default_rng(124)  # fixed seed: identical on every run
SCB = TL['SC']
bt = lambda b: b * B


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
    t = tt(0.42); f = 46 + 120 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.16)
    return np.tanh(1.6 * body) + 0.2 * hp(noise(0.42), 3500) * env(len(t), 0.0004, 0.004)

def clap():
    n = int(SR * 0.3); x = bp(noise(0.3), 900, 4200)
    e = np.zeros(n)
    for d in (0, .009, .018, .027): i = int(d * SR); e[i:] += env(n - i, 0.0004, 0.012 if d < .027 else 0.09)
    return x * e

def snare():
    t = tt(0.2)
    return 0.6 * bp(noise(0.2), 1500, 7000) * env(len(t), 0.0005, 0.05) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.03)

def hat(open_=False):
    d = 0.2 if open_ else 0.045
    return hp(noise(d), 8000) * env(int(SR * d), 0.0005, d / (3 if open_ else 4))

def bass(m, dur=0.2):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return lp(s * env(len(t), 0.003, 0.11), 1200)

def marimba(m, dur=0.45):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) * env(len(t), 0.001, 0.16) + 0.45 * np.sin(2 * np.pi * 4 * f * t) * env(len(t), 0.0005, 0.025))

def pluck(m, dur=0.35):
    t = tt(dur); f = hz(m)
    saw = sum(np.sin(2 * np.pi * k * f * t) / k for k in range(1, 7))
    cut = 600 + 5000 * np.exp(-t / 0.05)
    out = np.zeros_like(saw); seg = 240
    for i in range(0, len(t), seg): out[i:i + seg] = saw[i:i + seg]
    return lp(out, 3200) * env(len(t), 0.001, 0.12)

def pad(m, dur, bright=2200):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) / k for k, d, p in [(1, 0, 0), (1, .005, 1.3), (2, -.003, 2.1), (3, .002, .5)])
    a = np.clip(np.minimum(t / 0.08, (dur - t) / 0.3), 0, 1)
    return lp(s * a, bright)

def bell(m, dur=1.0, bright=1.0):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.12)) * env(len(t), 0.002, dur / 3.5)

def sweep(d, f0, f1, shape='hump'):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); seg = 480
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(40, f * 0.7), min(f * 1.4, SR / 2 - 200), 1)
    k = np.linspace(0, 1, n)
    e = {'hump': np.sin(np.pi * k) ** 2, 'up': k ** 2.2, 'down': (1 - k) ** 2}[shape]
    return out * e


# ---------- music ----------
drums, music = Bus(), Bus()
CH = [[57, 61, 64, 68], [52, 56, 59, 64], [54, 57, 61, 64], [50, 54, 57, 61]]  # Amaj7 E F#m D
ROOT = [33, 28, 30, 26]
HOOK = [(0, 76), (0.5, 73), (1.0, 76), (1.5, 78), (2.5, 76), (3.0, 73), (4.0, 71), (4.5, 73), (5.0, 76), (6.0, 73), (6.5, 71), (7.0, 69)]  # 2-bar pluck hook (beats)

def bar_of(b): return int((b - 2) // 4)  # bar index; bar 0 starts at beat 2
def chord_of(b): return bar_of(b) % 4 if b >= 2 else 3

def section(b):
    if b < 2: return 'pick'
    if b < 6: return 'intro'
    if 44 <= b < 46: return 'build'
    if 54 <= b < 56: return 'filter'
    if b >= 56: return 'end'
    return 'full'

steps = int(SCB['end'] * 4)
for s in range(steps):
    b = s / 4; t = bt(b); sec = section(b)
    sub = s % 4; beat_in_bar = int((b - 2) % 4) if b >= 2 else int(b + 2)
    c = chord_of(b)
    if sec == 'end': continue
    if sec in ('full', 'build') and sub == 0: drums.add(t, kick(), 0.85)
    if sec == 'filter' and sub == 0: drums.add(t, lp(kick(), 400), 0.6)
    if sec in ('full', 'build', 'intro') and sub == 0 and beat_in_bar in (1, 3): drums.add(t, clap(), 0.32 if sec != 'intro' else 0.2, pan=0.05)
    if sec == 'pick' and sub == 0: drums.add(t, clap(), 0.18)
    if sec == 'full' and sub == 2: drums.add(t, hat(True), 0.10, pan=0.25)
    if sec in ('full', 'build') and sub in (1, 3): drums.add(t, hat(), 0.06 if sub == 3 else 0.04, pan=-0.2)
    if sec == 'intro' and sub == 2: drums.add(t, hat(), 0.06, pan=0.2)
    # bouncy off-beat bass with an octave jump
    if sec in ('full', 'build') and sub in (2, 3):
        music.add(t, bass(ROOT[c] + (12 if sub == 3 and beat_in_bar % 2 else 0), 0.17), 0.5 if sub == 2 else 0.32)
    if sec == 'intro' and sub == 2: music.add(t, lp(bass(ROOT[c], 0.17), 500), 0.3)
    # syncopated marimba stabs (beat positions in the bar: 0, 0.75, 1.5, 2.5, 3.25)
    pos = (b - 2) % 4 if b >= 2 else b
    if sec in ('full', 'intro', 'build', 'pick') and any(abs(pos - p) < 1e-6 for p in (0, 0.75, 1.5, 2.5, 3.25)):
        g = 0.07 if sec == 'full' else 0.05
        for i, m in enumerate(CH[c][1:]): music.add(t, marimba(m + 12), g, pan=(i - 1) * 0.4)
    if sec == 'filter' and sub == 0:
        for i, m in enumerate(CH[c][1:]): music.add(t, lp(marimba(m + 12), 1200), 0.06, pan=(i - 1) * 0.4)
# pluck hook every other 2 bars in the full sections (answers the item landings)
for bar in range(0, 13):
    b0 = 2 + bar * 4
    if bar % 2 == 0 or b0 < 6 or b0 >= 54: continue
    for (o, m) in HOOK:
        bb = b0 - 4 + o + 4  # hook starts on this bar's downbeat
        if section(bb) in ('full',): music.add(bt(bb), pluck(m, 0.3), 0.07, pan=0.15 if o % 1 else -0.15)
# pads (chord per bar, under the groove)
for bar in range(-1, 14):
    b0 = 2 + bar * 4
    for bb in (b0,):
        if bb < 0 or bb >= 56: continue
        c = chord_of(bb); d = bt(min(4, 56 - bb)) + 0.2
        for i, m in enumerate(CH[c]): music.add(bt(bb), pad(m, d, 1500 if bb < 6 else 2400), 0.022, pan=(i - 1.5) * 0.3)
# snare roll into the bundle
for k in range(16):
    b = 44 + k / 8
    drums.add(bt(b), snare(), 0.12 + 0.25 * k / 15, pan=0.1)
# final chord on the button press: rings to the end
for i, m in enumerate([45, 57, 61, 64, 68, 69, 73, 76]):
    music.add(bt(56), pad(m, DUR - bt(56) + 0.2, 3000), 0.05, pan=(i - 3.5) * 0.12)
music.add(bt(56), bass(33, 1.8) * np.exp(-tt(1.8) / 0.8), 0.6)

# side-chain: duck the music bus under every kick
duck = np.ones(N)
for s in range(steps):
    b = s / 4
    if s % 4 == 0 and section(b) in ('full', 'build'):
        i = int(bt(b) * SR); n = min(int(0.3 * SR), N - i)
        if n > 0: duck[i:i + n] *= 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.09)
mus = music.out() * duck[:, None] + drums.out()
# hook pickup and intro sit behind a low-pass, opening into the drop
k_open = np.clip((np.arange(N) / SR - 0) / bt(6), 0, 1)
low = np.stack([lp(mus[:, 0], 900), lp(mus[:, 1], 900)], 1)
blend = np.where(np.arange(N) / SR < bt(6), (0.35 + 0.65 * k_open ** 3), 1.0)[:, None]
mus = low * (1 - blend) + mus * blend

# ---------- sound effects ----------
POP = [72, 74, 76, 79, 81, 83, 84, 86, 88, 91, 93, 95]
def sfx(kind, t0, bus):
    num = int(re.sub(r'\D', '', kind) or 0); k = re.sub(r'\d', '', kind)
    if k == 'slam':
        t = tt(0.9); f = 38 + 110 * np.exp(-t / 0.045)
        boom = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.26))
        crack = lp(noise(0.9), 5000) * env(len(t), 0.0004, 0.03)
        bus.add(t0, boom * 0.9 + 0.7 * crack, 0.75)
        bus.add(t0, hp(noise(0.5), 4000) * env(int(SR * 0.5), 0.001, 0.12), 0.12)
    elif k == 'whoosh':
        bus.add(t0 - 0.36, sweep(0.42, 300, 6000, 'up'), 0.5)
    elif k == 'pop':
        t = tt(0.1); f = hz(POP[num % len(POP)]) * (1 + 0.7 * np.exp(-t / 0.01))
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.03), 0.62, pan=((num % 5) - 2) * 0.12)
    elif k == 'tick':
        t = tt(0.08); f = hz(84 + [0, 2, 4, 7, 9, 12][num % 6])
        blip = np.sin(2 * np.pi * f * t) * env(len(t), 0.0005, 0.018) + 0.5 * hp(noise(0.08), 3000) * env(len(t), 0.0003, 0.003)
        bus.add(t0, blip, 0.42, pan=0.12)
    elif k == 'slap':
        t = tt(0.25)
        x = 0.9 * bp(noise(0.25), 600, 6000) * env(len(t), 0.0003, 0.018) + np.sin(2 * np.pi * np.cumsum(140 + 120 * np.exp(-t / 0.01)) / SR) * env(len(t), 0.001, 0.05)
        bus.add(t0, x, 0.6)
    elif k == 'ding':
        bus.add(t0, bell(93, 0.8, 0.8), 0.5, pan=0.15); bus.add(t0 + 0.06, bell(100, 0.9, 0.6), 0.36, pan=0.2)
    elif k == 'stamp':
        t = tt(0.32)
        bus.add(t0, np.sin(2 * np.pi * np.cumsum(80 + 90 * np.exp(-t / 0.02)) / SR) * env(len(t), 0.001, 0.07) + 0.5 * bp(noise(0.32), 700, 5000) * env(len(t), 0.0005, 0.02), 0.62)
    elif k == 'swish':
        bus.add(t0 - 0.12, sweep(0.26, 900, 7000), 0.42)
    elif k == 'star':
        bus.add(t0, bell([88, 90, 92, 95, 97][num % 5], 0.6, 1.0), 0.34, pan=(num - 2) * 0.15)
    elif k == 'riser':
        d = bt(2); n = int(SR * d); tq = np.arange(n) / SR
        tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * tq / d)) / SR) * (tq / d) ** 2
        bus.add(t0, sweep(d, 300, 9000, 'up') * 0.9 + 0.3 * tone, 0.42)
    elif k == 'click':
        t = tt(0.06)
        bus.add(t0, hp(noise(0.06), 2000) * env(len(t), 0.0003, 0.004) + np.sin(2 * np.pi * 2100 * t) * env(len(t), 0.001, 0.014), 0.8)
    elif k == 'chord':
        for i, m in enumerate([81, 85, 88, 93]): bus.add(t0 + i * 0.03, bell(m, 1.8, 0.7), 0.16, pan=(i - 1.5) * 0.3)
    elif k == 'logo':
        t = tt(0.6); bus.add(t0, np.sin(2 * np.pi * np.cumsum(60 + 50 * np.exp(-t / 0.04)) / SR) * env(len(t), 0.001, 0.15), 0.5)
        bus.add(t0, bell(88, 1.2, 0.5), 0.1)

ui = Bus()
for t0, kind in CUES: sfx(kind, t0, ui)
uio = ui.out()

# ---------- mix, loudness, peaks ----------
mix = mus * 0.75 + uio
fade = np.ones(N); nf = int(SR * 0.35); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
meter = pyln.Meter(SR)
g = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix *= g
ceiling = 10 ** (-1.6 / 20)
for _ in range(8):  # soft-clip only if 4x-oversampled peaks pass -1.6 dBFS, then re-normalise
    if np.abs(resample_poly(mix, 4, 1, axis=0)).max() <= ceiling: break
    mix = np.tanh(mix / ceiling) * ceiling * 0.97
    mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
mix = np.clip(mix, -ceiling, ceiling)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_16')
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
print('integrated LUFS: %.2f  true peak (4x) dBFS: %.2f  cues: %d  dur: %.3f s' % (meter.integrated_loudness(mix), tp, len(CUES), DUR))

# ---------- audibility: each cue's peak over the music RMS around it ----------
m_only = (mus * 0.75 * g).mean(1); u_only = (uio * g).mean(1)
rows = {}
for t0, kind in CUES:
    k = re.sub(r'\d', '', kind)
    a = int(max(0, t0 - (0.3 if k == 'whoosh' else 0.0)) * SR); bwin = int((t0 + (bt(2) if k == 'riser' else 0.12)) * SR)
    pk = np.abs(u_only[a:bwin]).max() + 1e-9
    ma, mb = (int(t0 * SR), int((t0 + bt(2)) * SR)) if k == 'riser' else (int(max(0, t0 - 0.25) * SR), int(min(DUR, t0 + 0.25) * SR))
    rms = np.sqrt(np.mean(m_only[ma:mb] ** 2)) + 1e-9
    rows.setdefault(k, []).append(20 * np.log10(pk / rms))
print('music-only LUFS in the mix: %.1f' % meter.integrated_loudness(mus * 0.75 * g))
for k, v in sorted(rows.items()): print('  %-7s n=%2d  min %+5.1f dB  mean %+5.1f dB' % (k, len(v), min(v), np.mean(v)))
