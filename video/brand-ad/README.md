# Poorly Pet: 30-second animated ad

`out/poorly-pet-ad.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, H.264 video with AAC audio at -14 LUFS.

The ad is fully animated. It uses no screenshots: every screen is original HTML and SVG, in the site's theme (deep green, rust, mint and paper, with Fraunces and Inter). Wording and categories come from www.poorly-pet.com. There are no animals or people.

## Beats

| Time | What happens |
|---|---|
| 0–3.5 s | "It's 2am." A search bar types "why is my dog limping", confusing result tabs explode across the screen, and "Where do you *even start?*" slams in. The Poorly Pet mark pops and swallows the screen. |
| 3.5–6 s | Poorly Pet, "Pet health. *Made easier.*" with a drawn underline, then the four features as chips. |
| 6–10 s | **01 Shop by condition.** "Know the *condition?*" is typed, a burst of real condition names pops in, and a tap on Arthritis morphs the pill into a card with its signs and matched support. |
| 10–14 s | **02 Shop by symptom.** "Not sure *what's wrong?*", the 8 body areas flip in, and Legs & paws opens its symptoms. "Find support" bursts open into the next screen. |
| 14–19 s | **03 AI care assistant.** A question is typed and sent, the dots bounce, the reply writes itself out, and support options and "View support products" pop in. |
| 19–23 s | **04 AI symptom scanner.** "See what they *can't tell you.*" A viewfinder draws itself, the shutter fires and a scan sweeps. Then "Screening 40+ conditions", "<10s average scan", Capture → Analyse → Act, and "Decision support, not a diagnosis." |
| 23–27 s | "225+" products counts up, product icons tick past, five stars pop, 4.6/5 from 101 verified reviews, and a real review types itself out. |
| 27–30 s | Everything collapses into the logo: "Pet health. *Made easier.*", poorly-pet.com and "10% off your first order · POORLY10". |

## Files

- `index.html` is the ad. `renderFrame(t)` draws any moment from the time alone, and opening the file in a browser gives a looping preview.
- `lib/motion.js` holds the closed-form springs (`snappy`, `default`, `heavy`) and `track()`. Nothing uses easing curves, CSS transitions, timers or randomness.
- `cues.js` lists the 155 sound cues on the 120 BPM grid. The film and the score both read it.
- `audio/score.py` builds the score and UI sounds into `audio/score.wav`, normalised to -14 LUFS.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full ad muxed with the score.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content notes

- The condition names, body areas and symptom lines come from the site, as do "25 conditions · 8 care areas", "8 body areas · 40+ signs", "225+ products", "40+ conditions", "<10s average scan", "4.6 from 101 verified reviews" and POORLY10.
- The review is quoted verbatim from Lisa W.'s Judge.me review.
- The chat is an illustration of how the assistant works, not a transcript of a real chat. It gives general guidance and points to the vet, as the site does.
- The tab titles in the hook ("10 causes of limping", "Forum: 243 replies" and so on) are made-up, generic search results. They stand for the confusion, not for any real site.
