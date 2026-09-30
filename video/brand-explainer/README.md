# Poorly Pet: 30-second brand film

`out/poorly-pet-brand-film.mp4` is the finished film: 1080x1920 (9:16), 30 fps, H.264 video with AAC audio at -14.0 LUFS integrated.

The film is the live www.poorly-pet.com turned into motion. Every piece of UI on screen is a raster capture of the real site, taken on 30 Sep 2026: the header, hero, condition cards, symptom tiles, collection pages, product cards, Care assistant, Poorly Pet Vision scanner, Judge.me reviews and logo. Nothing is redrawn. The shot-by-shot plan is in `STORYBOARD.md`.

## Files

| Path | What it is |
|---|---|
| `index.html` | The film. `renderFrame(t)` draws any moment from the time alone. Open it in a browser for a looping preview. |
| `lib/motion.js` | Closed-form springs (`snappy`, `default`, `heavy`) and `track()` for values with several targets. |
| `cues.js` | Sound cues on the 120 BPM grid. The film and the score both read it, so sound lands on the frame. |
| `audio/score.py` | The score and UI sounds (pad, electric piano, sub, light percussion; click, select, send, chime and so on). It normalises to -14 LUFS. |
| `render.mjs` | Renders stills, one frame per beat, or the full film. It muxes `audio/score.wav` into the MP4. |
| `tools/capture.mjs` | Re-captures the UI from the live site into `assets/`. |
| `assets/` | The captures, `manifest.json` (the source URL of each) and `ai-transcript.txt` (the real assistant conversation shown). |
| `fonts/` | Fraunces and Inter, the site's display and UI faces. |

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs --beats   # one frame per beat into stills/ for a contact sheet
CHROMIUM_PATH=/path/to/chromium node render.mjs           # full film into out/
```

## Motion rules

The film is a pure function of time. It uses no CSS transitions, `setTimeout`, carried state, `Math.random`, `will-change` or 3D transforms, and `requestAnimationFrame` only runs in preview, never while rendering. Every entrance, exit and retarget is a spring from `lib/motion.js`. Nothing uses an easing curve.

The Motion Reel kit was not installed when this was made, so `lib/motion.js` was written to the brief's rules. If the kit is added later, swap its `lib/motion.js` in: the presets use the same names.

## Choices worth knowing

- **Palette.** The colours follow the live site (deep green `#092B23`, rust `#A8542F`, mint `#9FE8C9`, paper `#FAF9F6`), not the palette in the brief. The site is the source of truth.
- **No animals or people.** Products whose photos or packaging show an animal were left out. The assistant's own recommended products all show dogs, so the AI scene stops at its "View support products 3" button.
- **The assistant's answer is real.** It comes from one live run of Poorly Pet AI. The live assistant words its answers differently each time.
- **Reviews are real.** They are captures of Lisa Wellington's "Elbow support" review and robert atkinson's "Exactly as I ordered very happy with product" review, with the Judge.me 4.6/5 summary from 101 verified reviews.
- **Scanner wording is the scanner page's own.** The steps are Capture → Analyse → Act, and the scene shows the "Not a diagnosis" card.
