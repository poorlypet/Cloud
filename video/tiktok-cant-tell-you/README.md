# Poorly Pet: TikTok ad B, "They can't tell you"

`out/poorly-pet-cant-tell-you.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 30 s, H.264 video with AAC audio at -14 LUFS.

It is a slow, story-led piece of kinetic typography on colour-block screens (deep green, paper, deep green, mint, paper, deep green) at 80 BPM, with a beat of 0.75 s. Words rise one at a time out of their own masks and settle on heavy springs. Screens change by slow full-screen pushes and one cover wipe on a critically damped `glide` spring. There are no screenshots and no animals or people. Every element is original HTML and inline SVG in the site's palette and type (Fraunces and Inter).

## Beats (80 BPM; b = beat)

| Time | Beat | What happens |
|---|---|---|
| 0–3.75 s | b0–b5 | Deep green. "Your dog / can't tell you" is typed slowly with a mint caret. "*what hurts.*" rises word by word in mint italic, and a hand-drawn underline draws under "hurts." |
| 3.75–9 s | b5–b12 | Paper pushes up. "But you / *notice things.*" rises. Three observations write themselves in on b7, b8 and b9 as italic Fraunces lines with hand-drawn icons (a walk route with a flag, a moon with scratch marks, a clock), and each gets a rust underline on the off-beat. |
| 9–14.25 s | b12–b19 | Deep green pushes in from the right. "Poorly Pet turns / what you see into / *a next step.*" A symptom card ("Limping or favouring a leg") rises, then splits into three pills: "Likely causes", "Support that helps" and "When to see a vet". Each pill lights up in its own colour on the eighth notes. |
| 14.25–19.5 s | b19–b26 | Mint wipes up. "Describe it." then "*Or show us.*", and the soft kick and sub enter at 15 s. Left: the AI care assistant card, where a chat bubble types "stiff after walks…" and a thinking bubble appears. Right: the AI symptom scanner, where the viewfinder corners draw, a scan line sweeps, and "40+ conditions" appears. |
| 19.5–26.25 s | b26–b35 | Paper pushes in from the left. "Vet-informed." with a check, "225+ products matched." (counting up), five stars drawing in one by one, "4.6/5 from 101 verified reviews", then Lisa W.'s review typed slowly. |
| 26.25–30 s | b35–b40 | Deep green pushes down. The mark pops gently on the bar at 27 s (the music resolves to Fmaj9 here), then the "Poorly Pet" wordmark, "Find the right support / *for your dog.*", poorly-pet.com and "Free UK delivery over £39". |

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Opening the file in a browser gives a looping preview.
- `lib/motion.js` holds the closed-form springs, copied from the brand ad. It adds one preset, `glide` (w 6, critically damped, settling in about 1 s), for the full-screen pushes. All motion uses these springs; there are no easing curves, CSS transitions, timers or randomness.
- `cues.js` holds every timing (`TM`) on the 80 BPM grid, plus the sound cue list (`CUES`) built from those timings, typing keystrokes included. The film and the score both read it.
- `audio/score.py` builds `audio/score.wav`. The music is felt piano, felt-key eighth arpeggios and a warm pad with a small room, over Dm9, B♭maj9, F/A and Csus, then Gm9 and C7sus, resolving to Fmaj9. From 15 s a gentle pulse plays: a soft kick on beats 1 and 3 and a sub. The UI sounds are soft and cue-driven, and the music dips about 3 dB under each push. The output is normalised to -14 LUFS with true peaks under -1 dBFS. `--check` prints each cue type's peak over the music RMS; every type is at least +4.4 dB.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py          # needs node on PATH to read cues.js
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content notes

- **Real, from the site:** "Limping or favouring a leg" with "Often arthritis, a cruciate injury or a sore paw."; "Slow to get up"; "AI care assistant" / "Poorly Pet AI"; "AI symptom scanner"; "Upload a clear photo"; "40+ conditions"; "Vet-informed"; "225+ products matched"; "4.6/5 from 101 verified reviews"; "Find the right support for your dog"; "Free UK delivery over £39"; poorly-pet.com. The three next steps (likely causes, support that helps, when to see a vet) paraphrase the assistant's own description: "We'll suggest likely causes, helpful support, and when to see a vet."
- **Real review, verbatim:** Lisa W., 5 stars: "Really helping our elderly lab with his arthritic shoulder. Great quality".
- **Illustrative:** the story lines ("Your dog can't tell you what hurts.", "But you notice things.", "Poorly Pet turns what you see into a next step.", "Describe it. Or show us."), the observations "A limp after walks." and "Scratching at night.", the typed chat message "stiff after walks…", and the labels "WHAT YOU SEE" and "Describe what you see". The chat and scanner vignettes are stylised illustrations, not the real UI. Nothing on screen gives a diagnosis.
