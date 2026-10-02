"""Marble brand film score: composed in MIDI, rendered with real sampled instruments (FluidR3 GM via FluidSynth),
then reverb, organic sound design and loudness to -14 LUFS (true peak under -1 dBTP after AAC).

    python3 score.py            reads audio/cues.json (written by render.mjs --cues), writes audio/score.wav
"""
import json, os, subprocess, re
import numpy as np, mido, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
meta = json.load(open(os.path.join(HERE, 'audio', 'cues.json')))
DUR, CUES = float(meta['dur']), meta['cues']
SECT = meta.get('sections') or []          # [[t, name], ...] from the film
BPM = 72; BEAT = 60 / BPM; TPB = 480
def tick(t): return int(round(t / BEAT * TPB))
rng = np.random.default_rng(3)

# ---------- harmony: D major, warm and hopeful ----------
N = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def chord(name, base=48):
    m = re.match(r'([A-G]#?)(m?)(add9|maj7|sus2|sus4|7)?(?:/([A-G]#?))?', name)
    r = N[m.group(1)]; minor = m.group(2) == 'm'; ext = m.group(3); bass = m.group(4)
    iv = [0, 3 if minor else 4, 7]
    if ext == 'add9': iv.append(14)
    if ext == 'maj7': iv.append(11)
    if ext == 'sus2': iv[1] = 2
    if ext == 'sus4': iv[1] = 5
    if ext == '7': iv.append(10)
    root = base + r
    b = base - 12 + (N[bass] if bass else r)
    while b > base - 1: b -= 12
    return b, [root + i for i in iv]

class Song:
    def __init__(self): self.ev = {}   # ch -> list of (tick, msg)
    def prog(self, ch, p): self.ev.setdefault(ch, []).append((0, mido.Message('program_change', channel=ch, program=p)))
    def cc(self, ch, t, c, v): self.ev.setdefault(ch, []).append((tick(t), mido.Message('control_change', channel=ch, control=c, value=int(v))))
    def note(self, ch, t, n, d, v):
        if t >= DUR: return
        d = min(d, DUR + 3 - t)
        self.ev.setdefault(ch, []).append((tick(t), mido.Message('note_on', channel=ch, note=int(n), velocity=int(max(1, min(127, v))))))
        self.ev.setdefault(ch, []).append((tick(t + d), mido.Message('note_off', channel=ch, note=int(n), velocity=0)))
    def save(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0))
        allev = sorted([e for ch in self.ev for e in self.ev[ch]], key=lambda e: (e[0], 0 if e[1].type != 'note_on' else 1))
        last = 0
        for t, m in allev: tr.append(m.copy(time=t - last)); last = t
        mid.save(path)

def build(plan):
    s = Song()
    PIANO, STR, HARP, CEL, PAD, PIZZ, CELLO, BELL = 0, 1, 2, 3, 4, 5, 6, 7
    s.prog(PIANO, 0); s.prog(STR, 49); s.prog(HARP, 46); s.prog(CEL, 8); s.prog(PAD, 89); s.prog(PIZZ, 45); s.prog(CELLO, 42); s.prog(BELL, 14)
    for ch, vol, pan in [(PIANO, 100, 58), (STR, 78, 70), (HARP, 70, 40), (CEL, 54, 80), (PAD, 52, 64), (PIZZ, 64, 50), (CELLO, 70, 56), (BELL, 50, 72)]:
        s.cc(ch, 0, 7, vol); s.cc(ch, 0, 10, pan); s.cc(ch, 0, 91, 70)
    for sec in plan:
        t0, t1, chords, lvl, kind = sec['t0'], sec['t1'], sec['chords'], sec['lvl'], sec['kind']
        bar = (t1 - t0) / len(chords)
        for i, c in enumerate(chords):
            t = t0 + i * bar
            b, ns = chord(c, 60)
            # piano: broken-chord figure, gentler at the start
            fig = [ns[0], ns[1], ns[2], ns[1] + 12, ns[2], ns[1]] if kind != 'still' else [ns[0], ns[2], ns[1] + 12]
            step = bar / len(fig)
            for k, n in enumerate(fig):
                s.note(PIANO, t + k * step + rng.uniform(0, 0.015), n, step * 1.6, 44 + 30 * lvl + rng.integers(-5, 6))
            s.note(PIANO, t, b, bar * 0.95, 40 + 26 * lvl)
            if sec.get('melody'):
                mel = sec['melody'][i % len(sec['melody'])]
                for k, n in enumerate(mel):
                    if n: s.note(PIANO, t + k * bar / len(mel) + 0.01, n, bar / len(mel) * 1.3, 58 + 34 * lvl)
            if lvl >= 0.35:   # string bed
                for n in ns[:3]: s.note(STR, t, n - 12, bar * 1.02, 30 + 60 * lvl)
                s.note(CELLO, t, b, bar * 1.02, 36 + 50 * lvl)
            if lvl >= 0.2: s.note(PAD, t, ns[0] - 12, bar, 26 + 30 * lvl)
            if kind == 'pulse':
                for k in range(4): s.note(PIZZ, t + k * bar / 4, (ns[0] if k % 2 == 0 else ns[2]) - 12, bar / 5, 52 + 30 * lvl)
            if kind == 'lift' and i == 0:   # harp glissando into the section
                for k, n in enumerate(range(ns[0] - 12, ns[0] + 24, 2)):
                    s.note(HARP, t - 0.9 + k * 0.05, n + (1 if n % 12 in (1, 6) else 0), 1.5, 50 + k)
            if kind in ('lift', 'resolve'):
                for k, n in enumerate([ns[2] + 12, ns[1] + 24, ns[0] + 24]):
                    s.note(CEL, t + bar * (0.25 + 0.25 * k), n, bar / 2, 40 + 20 * lvl)
    return s

# ---------- organic sound design ----------
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, r):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / r); return e
def whoosh(d=0.9, f0=300, f1=2400):
    n = int(SR * d); x = rng.standard_normal(n); k = np.linspace(0, 1, n)
    out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** k[i]; out[i:i + seg] = bp(x[i:i + seg], max(60, f * 0.6), min(16000, f * 1.6))
    return out * np.sin(np.pi * k) ** 2 * 0.5
def paper(d=0.35):
    n = int(SR * d); x = bp(rng.standard_normal(n), 1800, 9000) * (0.55 + 0.45 * np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 23)))
    return x * env(n, 0.03, d / 3) * 0.35
def chime(notes=(86, 90, 93), d=2.6):
    n = int(SR * d); t = np.arange(n) / SR; out = np.zeros(n)
    for i, m in enumerate(notes):
        f = 440 * 2 ** ((m - 69) / 12); o = int(i * 0.07 * SR)
        tone = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.4)) * np.exp(-t / 1.1)
        out[o:] += tone[:n - o] * 0.18
    return out
def soft_tick():
    n = int(SR * 0.05); return hp(rng.standard_normal(n), 3000) * env(n, 0.0005, 0.006) * 0.25
def thump():
    n = int(SR * 0.4); t = np.arange(n) / SR; f = 55 + 40 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.12) * 0.5
def tap():
    n = int(SR * 0.12); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * env(n, 0.0008, 0.02) * 0.25 + lp(rng.standard_normal(n), 3000) * env(n, 0.0005, 0.008) * 0.2)
def birds(d=3.0):   # soft woodland ambience for the real-photo moments
    n = int(SR * d); out = lp(hp(rng.standard_normal(n), 300), 2500) * 0.02
    for k in range(6):
        o = int(rng.uniform(0.1, d - 0.4) * SR); m = int(SR * 0.18); t = np.arange(m) / SR
        f = rng.uniform(2800, 4200) * (1 + 0.25 * np.sin(2 * np.pi * rng.uniform(12, 20) * t))
        out[o:o + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]) ** 2 * 0.05
    return out * np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.6 * SR))
SFX = {'whoosh': lambda: whoosh(), 'swish': lambda: whoosh(0.5, 900, 5000) * 0.7, 'paper': paper, 'chime': chime,
       'tick': soft_tick, 'thump': thump, 'tap': tap, 'birds': lambda: birds(), 'birdslong': lambda: birds(5.5),
       'rise': lambda: whoosh(1.6, 150, 3000) * 0.9}
GAIN = {'whoosh': 0.5, 'swish': 0.35, 'paper': 0.6, 'chime': 0.8, 'tick': 0.5, 'thump': 0.6, 'tap': 0.6, 'birds': 1.0, 'birdslong': 1.0, 'rise': 0.45}

def reverb(x, rt=2.2, mix=0.22):
    n = int(SR * rt); t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (rt / 6.9))[:, None]
    ir[:, 0] = lp(ir[:, 0], 7000); ir[:, 1] = lp(ir[:, 1], 6500); ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix * 3

def main(plan):
    os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
    midp, wavp = '/tmp/marble.mid', '/tmp/marble-music.wav'
    build(plan).save(midp)
    subprocess.run(['fluidsynth', '-ni', '-F', wavp, '-r', str(SR), '-g', '0.6', SF2, midp], check=True, capture_output=True)
    mus, sr = sf.read(wavp); assert sr == SR
    N_ = int(SR * DUR); mus = np.pad(mus, ((0, max(0, N_ - len(mus))), (0, 0)))[:N_]
    mus = reverb(mus, 2.4, 0.18)
    fade = np.ones(N_); f = int(SR * 2.2); fade[-f:] = np.linspace(1, 0, f) ** 1.5; mus *= fade[:, None]
    fx = np.zeros((N_, 2))
    for t0, kind in CUES:
        k = re.sub(r'\d', '', kind)
        if k not in SFX: continue
        x = SFX[k]() * GAIN[k]; o = int(t0 * SR); m = min(len(x), N_ - o)
        if m <= 0: continue
        pan = 0.5 + 0.15 * np.sin(t0 * 3.1)
        fx[o:o + m, 0] += x[:m] * (1 - pan) * 1.4; fx[o:o + m, 1] += x[:m] * pan * 1.4
    fx = reverb(fx, 1.4, 0.2)
    mix = mus + fx
    mix = lp(mix.T, 16000).T if False else np.stack([lp(mix[:, c], 16000) for c in range(2)], 1)
    meter = pyln.Meter(SR); lufs = meter.integrated_loudness(mix)
    mix = pyln.normalize.loudness(mix, lufs, -14.0)
    up = resample_poly(mix, 4, 1, axis=0); pk = np.abs(up).max(); ceil = 10 ** (-4 / 20)
    if pk > ceil:   # gentle limiter: soft-knee gain riding on the loud parts only
        g = np.minimum(1, ceil / np.maximum(np.abs(mix).max(1), 1e-9)); g = np.convolve(g, np.ones(480) / 480, 'same'); mix *= np.minimum(1, g)[:, None]
        mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
        mix = np.clip(mix, -ceil, ceil)
    sf.write(os.path.join(HERE, 'audio', 'score.wav'), mix.astype(np.float32), SR, subtype='PCM_16')
    print('integrated LUFS: %.2f  peak dBFS: %.2f' % (meter.integrated_loudness(mix), 20 * np.log10(np.abs(mix).max())))

if __name__ == '__main__':
    plan = json.load(open(os.path.join(HERE, 'audio', 'plan.json')))
    main(plan)
