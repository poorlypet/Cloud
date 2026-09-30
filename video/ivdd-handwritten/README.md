# IVDD: 5 signs to know + what helps (handwritten)

`out/poorly-pet-ivdd-handwritten.mp4` is the finished film: 1080x1920 (9:16), 30 fps, 33.3 s, H.264 with AAC audio at -14 LUFS.

It looks like a sketchbook: paper with a dot grid, Caveat handwriting written left to right, doodles drawn on stroke by stroke, and marker washes that sit slightly off-register. A "line boil" changes the noise seed every 4 frames, and the pattern is fixed, so every render comes out the same. No dogs, animals or people are drawn: each sign is shown with doodles of objects and symbols only. There are no screenshots or website images.

## Beats (90 BPM, 1 beat = 0.667 s)

| Beats | Time | Page |
|---|---|---|
| 0–7 | 0–4.7 s | "IVDD" is written with a mint marker highlight, then "5 signs to know". A doodle shows a row of vertebrae where one disc bulges up into the spinal cord. The small print is written underneath. |
| 7–12 | 4.7–8.0 s | An ink wipe, then **1 A hunched back**. A straight spine line bends into an arch, and a coral arrow points to it with the label "arched". |
| 12–17 | 8.0–11.3 s | The page lifts away. **2 Yelps when picked up**: a "YELP!" burst pops and shakes, and a "lift" arrow rises. |
| 17–22 | 11.3–14.7 s | **3 Won't jump or do stairs**: stairs, a jump arc crossed out in coral, and a "?". |
| 22–27 | 14.7–18.0 s | **4 Wobbly back legs**: two tracks wobble and cross, with wobble marks on each side. |
| 27–33 | 18.0–22.0 s | **5 Sudden weakness**: a coral box reads "Can't stand, or can't wee? Vet today, not tomorrow." An alert sign is drawn below it. This page is held a beat longer than the others. |
| 33–37 | 22.0–24.7 s | An ink wipe from the bottom up. **What can help**: "Strict rest first, weeks of it." A calendar is drawn and crossed off day by day. |
| 37–46 | 24.7–30.7 s | **The IVDD kit**: three product doodles (a brace wrap, a folding ramp up to a sofa, and a harness with a handle that lifts). Each one has its name, a chime and a one-line benefit. |
| 46–50 | 30.7–33.3 s | A sketched Poorly Pet mark (orange rounded square, white plus), "Poorly Pet", a hand-drawn "Shop IVDD support →" button that gets pressed, poorly-pet.com and "Always check with your vet." |

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Opening the file in a browser plays a looping preview.
- `cues.js` is the single timeline. It holds the page start times and every event (write, draw, marker, move, press) with its sound. The film reads `window.TL`, and the score evaluates the same file with node to read `window.CUES`.
- `lib/motion.js` holds the closed-form springs, copied from the brand ad. All motion is driven by springs: writing and drawing progress use critically damped springs, while pops, shakes, presses, page lifts and ink wipes use `track()` and the presets. There are no easing curves, CSS transitions, timers or randomness.
- `audio/score.py` builds `audio/score.wav`. The music has fingerpicked plucks, a light shaker, a warm pad, a plucked bass and a soft felt kick. It drops the shaker for sign 5 and resolves to Gmaj9 on the end card. The sounds (pencil writing, sketch strokes, scribbles, marker swipes, a paper swish for each page turn, a brush swoosh for each ink wipe, chimes, a knock for each number, and the resolve) are made from cues. The file prints the loudness and the worst "sfx peak over music RMS" for each cue type; every type is at +5 dB or more.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content notes

- The sign names, short lines, breed list and "Vet today, not tomorrow" wording follow the site's IVDD copy. Nothing else is claimed.
- Product names were checked on www.poorly-pet.com/collections/ivdd and the site search on 30 Sep 2026. The full titles are "Thermal Back Brace for Dogs - Lumbar & Spine Support", "Lightweight Folding Dog Ramp - 75kg Capacity, 151cm" and "Balto® Body Lift – Body Harness with Handles". The film uses short forms: "Thermal Back Brace", "Lightweight Folding Dog Ramp" and "Balto® Body Lift harness".
- There is no bundle note and there are no prices. The site's current "IVDD Bundle" is the Thermal Back Brace with Natural Calming Drops, not these three products.
- The doodles are illustrations: the spine and disc, the calendar and the product sketches are simplified drawings, not diagrams or product photos. The calendar's four rows illustrate "weeks of it" and do not state a rest period.
