# Poorly Pet: landscape product tour (30 s)

`out/poorly-pet-landscape.mp4` is the finished film: 1920x1080 (16:9), 30 fps, H.264 video with AAC audio at -14 LUFS (true peak about -3.7 dBTP).

It's an editorial two-column tour. The left column (about 40%) holds an eyebrow chapter label, a large Fraunces heading with an italic rust accent, a short Inter line and a 01–04 chapter index. The right column holds one stylised browser window drawn in HTML and SVG. Inside it, a simplified Poorly Pet site animates. There are no screenshots, no photos, and no animals or people. Deep green is used only for the chat panel and the closing lockup.

## Beats (96 BPM, 1 beat = 0.625 s)

| Beats | Time | Left column | Browser |
|---|---|---|---|
| 0–6 | 0–3.75 s | "Pet health. *Made easier.*" is typed, then "The UK's pet health & recovery specialist." | The frame draws itself. The header builds (mark, wordmark, search bar), then the hero and four feature tiles appear. |
| 6–16 | 3.75–10 s | 01 Shop by condition: "Know the *diagnosis?*" | The page scrolls to the condition grid and six cards pop in. A tap on Arthritis morphs the card into the collection banner, then the sign chips and four abstract product tiles appear. |
| 16–24 | 10–15 s | 02 Shop by symptom: "Not sure *what's wrong?*" | The page scrolls to the 8 body-area tiles. A tap on Legs & paws pushes to its sub-page, and three symptom rows slide in. The chat launcher pops in. |
| 24–33 | 15–20.6 s | 03 AI care assistant: "Just *describe it.*" | A tap on the launcher makes it bloom into the deep-green chat. A question is typed and sent, the dots bounce, then a reply and three suggestion tiles appear. |
| 33–41 | 20.6–25.6 s | 04 AI symptom scanner: "See what they *can't tell you.*" | The chat slides down to reveal Vision. The viewfinder draws, the shutter fires and a scan runs. The count reaches 40+, then Capture → Analyse → Act light up, followed by "Decision support, not a diagnosis." |
| 41–48 | 25.6–30 s | The text exits upwards | The browser slides away while the header mark and wordmark detach and settle into a centred lockup on a rising deep-green sheet. The lockup shows the tagline, poorly-pet.com, 5 stars and "4.6/5 from 101 verified reviews · Free UK delivery over £39". |

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time. Opening the file in a browser gives a looping preview.
- `lib/motion.js` holds the closed-form springs (`default` and `heavy` for layout and type, `snappy` for presses) and `track()`. It uses no easing curves, CSS transitions, timers or randomness.
- `cues.js` holds the timeline (`TL`) and the 122 sound cues, in beats. The film and the score both read it.
- `audio/score.py` writes `audio/score.wav`. The score has warm electric-piano keys and a pad from the first frame. A soft four-on-the-floor kick, a round bass and 16th shakers enter at chapter 01. A soft snap joins from chapter 02, and an 8th arpeggio plays under the scanner. Only the chord remains for the close. Chords change with the chapters. The UI sounds are cue-driven, and the mix is normalised to -14 LUFS.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content notes

- **Real (from www.poorly-pet.com):**
  - Taglines: "Pet health. Made easier.", "The UK's pet health & recovery specialist.", "Find the right support for your dog", "Vet-informed care for symptoms, ailments & recovery" and "Helping you find the right support for your pet."
  - Section copy: "Know the diagnosis? Go straight there." and "Not sure? Start with what you're seeing."
  - Content: the condition names, the 8 body areas, and the Legs & paws symptom lines (verbatim).
  - AI assistant: "Poorly Pet AI", "Vet-informed guidance", "Instant, free, no sign-up", "225+ products matched", and a disclaimer paraphrased from the site's "does not replace veterinary advice".
  - Vision: "See what your dog can't tell you", Capture → Analyse → Act, and 40+ conditions / under 10 seconds.
  - Trust: 4.6/5 from 101 verified reviews and Free UK delivery over £39.
- **Illustrative:**
  - The layout of every in-browser screen is simplified and stylised, not a copy of the site. The address bar shows only poorly-pet.com.
  - The three "signs to look for" chips reuse real symptom names. Product tiles are abstract icons with placeholder bars; they show no real products, names or prices.
  - The chat question and reply are an illustration of how the assistant works, not a real transcript. The reply stays non-diagnostic and points to the vet. The suggestion labels (Joint support, Ramps, Lift harness) are generic categories.
  - Vision step subtitles ("Upload a clear photo", "Weighs 40+ conditions", "See what to do next") are paraphrased from the Vision page copy. The viewfinder "photo" is abstract soft shapes.
  - "25 conditions. Vet-informed products." and "8 body areas. 40+ signs." combine site figures with the site's "vet-informed" wording.
