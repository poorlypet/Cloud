# Poorly Pet: "3 ways" TikTok ad

`out/poorly-pet-3-ways.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 30 s, H.264 video with AAC audio at -14 LUFS.

It is a calm, list-style explainer. The whole film is one long paper page that scrolls slowly from step to step, like a checklist. Everything is left-aligned on one 96 px margin with generous whitespace. The colour stays paper and ink with rust numerals and italic accents. The AI step is the one deep-green moment, and mint is the single accent for anything selected, ticked or highlighted. Every screen is original HTML and SVG. There are no screenshots, animals or people.

## Beats (90 BPM, 1 beat = 0.667 s)

| Time | Beats | What happens |
|---|---|---|
| 0–3.3 s | 0–5 | "Something's *not right* with your dog?" types itself in big Fraunces. "Here's where to start." follows in rust handwriting, and a hand-drawn arrow draws itself pointing down. |
| 3.3–10 s | 5–15 | The page scrolls to **1. Start with *what you're seeing.*** The 8 body-area chips slide in, followed by "8 body areas. 40+ signs." A tap on Legs & paws turns it mint and the other chips fold away. Three real symptoms, each with its one-line explanation, list out slowly and push the caption down. |
| 10–18 s | 15–27 | Scroll to **2. Ask *Poorly Pet AI.*** A deep-green chat panel shows the badges Instant, Free and No sign-up. "My dog seems stiff after walks" types slowly into the input and is sent. The dots show, then the non-diagnostic reply appears word by word. A guidance note follows. |
| 18–23.7 s | 27–35.5 | Scroll to **3. Scan *a photo.*** The viewfinder corners draw, the shutter is tapped, and a slow scan runs. Capture → Analyse → Act lights up step by step, then "<10s average scan" and "Decision support, not a diagnosis." appear. |
| 23.7–30 s | 35.5–45 | Scroll to the recap, "Where to *start.*" The three numbered lines are ticked on the beat. Then come the Poorly Pet mark and wordmark, "Helping you find the *right support* for your pet." with a mint highlighter stroke, poorly-pet.com, and "10% off your first order · POORLY10". |

Each key message stays on screen for at least 2 s after it lands. Most motion uses the `heavy` and `default` springs, and `snappy` is kept for taps and ticks. Each scroll is three staggered heavy springs, so the page glides for about 0.9 s instead of snapping.

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time. Opening the file in a browser plays a looping preview.
- `lib/motion.js` holds the closed-form springs (`snappy`, `default`, `heavy`) and `track()`, copied from the reference build.
- `cues.js` is the single source of timing. It holds the named moments in beats (`AT`), the typing runs, and the 70 sound cues (`CUES`, in seconds). The film reads it, and `audio/score.py` loads it through `node`.
- `audio/score.py` builds the lo-fi score and the UI sounds into `audio/score.wav`, normalised to -14 LUFS with 4x-oversampled peaks under -2 dBFS. It also prints each cue type's peak over the music RMS. The music has soft FM electric-piano keys with tape wobble, a kick on 1 and 3, a brush snare, swung brushed hats, a warm bass and faint vinyl dust. The chords run Bbmaj9, then Fmaj9, Em7, Dm9 and Cmaj9, then Bbmaj9 again for the recap, resolving to Fmaj9 under the logo.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score. `STILLS_DIR` sets where the stills go.
- `fonts/` holds Fraunces (regular and italic), Inter and Caveat (used only for the handwritten "Here's where to start.").

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content notes

- **Real site copy:** the 8 body areas, "8 body areas. 40+ signs.", and the three Legs & paws symptoms with their explanations (verbatim). Also the "Poorly Pet AI" name, the Instant / Free / No sign-up badges (from "Instant, free, no sign-up"), Capture → Analyse → Act, "<10s average scan", "Decision support, not a diagnosis.", the tagline "Helping you find the right support for your pet.", poorly-pet.com and POORLY10.
- **Illustrative:** the chat exchange is an illustration, not a real transcript. The reply is non-diagnostic and points to the vet. "General guidance only. Not a substitute for your vet." paraphrases the site's disclaimer, and "Ask a follow-up…" is placeholder UI text. The hook question, "Here's where to start.", the step headings and "Where to start." are ad copy written for this film. The scanner's picture is abstract colour, and its three rings are decorative, not real findings.
