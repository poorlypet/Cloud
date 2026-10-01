# IVDD: 60 s conversion ad ("Sketchbook field notes")

`out/poorly-pet-ivdd-60.mp4`: 1080x1920 (9:16), 30 fps, 60.0 s, H.264 with AAC audio at -14 LUFS.

The film looks like a study page in a sketchbook. It has warm cream paper with a faint dot grid, paper fibres and a coral margin rule. The handwriting is black fine-liner Caveat, with Kalam as the neater print hand for small text. Coral (#E0735A) and mint (#9FE8C9) marker washes sit slightly off-register under the ink. Every stroke is an SVG path drawn on with a dashoffset driven by a spring. A deterministic line boil changes to a fixed noise seed every 4 frames. Each page lifts, catches the light and slides away to show the next one. A sticky note and two index cards land on the page, held with washi tape. The price tags hang on strings with paperclips. No animals or people are drawn, and there are no screenshots.

## Beats (92 BPM, 1 beat = 0.652 s)

| Beats | Time | Section | Page |
|---|---|---|---|
| 0–6 | 0.0–3.9 s | HOOK | "If your dog has a long back, read this." is already being written at frame 0, with "long back" in mint and "read this." underlined twice in coral. "IVDD" is written big and circled hard in coral, then "(Intervertebral Disc Disease)" and a long row of vertebrae with a "long back" measuring line. |
| 6–19 | 3.9–12.4 s | RELATE | "Sound familiar?" and "4 signs your dog's back is hurting", with the 4 circled. Four checkbox rows, each with a doodled icon and a coral tick: hunched spine, yelp burst with a lift arrow, stairs crossed out, and wobbling lines. |
| 19–30 | 12.4–19.6 s | EDUCATE | "What is IVDD?": a labelled spine diagram (spinal cord, vertebra, disc). One disc bulges up and pushes the cord. Then the site's definition, with "pressing on the cord." highlighted. A mint sticky note lands with the breeds most at risk. |
| 30–35.5 | 19.6–23.2 s | EDUCATE | "What actually helps at home": (1) "Strict rest first, weeks of it." A calendar is crossed off day by day. |
| 35.5–43.5 | 23.2–28.4 s | EDUCATE | (2–5): back brace, ramps, grip on hard floors, and a harness with a handle. Each has its own doodle. |
| 43.5–52.5 | 28.4–34.2 s | PRODUCTS | "The IVDD Bundle": the brace and the dropper bottle are drawn and labelled, with three ticked badges. The £62.08 price tag dings, "was £68.98" is struck through, and a "SAVE 10%" stamp thuds down. |
| 52.5–58.5 | 34.2–38.2 s | PRODUCTS | Lightweight Folding Dog Ramp: the ramp runs up into a car boot with a coral note, "so there is no jumping". It is £79.99, with two ticked features. |
| 58.5–64.5 | 38.2–42.1 s | PRODUCTS | Balto® Body Lift harness: the harness lifts on its handles with the note "for the toilet trips". It is £120.00, with two ticked features. |
| 64.5–69.5 | 42.1–45.3 s | PRODUCTS | "When the back legs stop working": a wheelchair frame, "FreedomRoll wheelchair", "from £179.99" and 4.8 stars "from 19 reviews". |
| 69.5–83 | 45.3–54.1 s | PROOF | "4.6/5" with 4.6 stars drawn in, then "from 101 verified reviews". Jamie T's review card lands, followed by Danny's bundle review card. |
| 83–92 | 54.1–60.0 s | OFFER + CTA | "10% off your first order" with "10%" circled. Scissors cut along the coupon, and "POORLY10" is stamped. Two ticks follow: "Free UK delivery over £39" and "30-day guarantee". Then the "Shop the IVDD Bundle →" button appears, with poorly-pet.com and the Poorly Pet mark. The button is pressed at 57.4 s, on the music's resolve, and the end card holds for 2.6 s. |

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Opening the file in a browser plays a looping preview.
- `cues.js` is the single timeline. It holds the page start times and every event, with its sound. The film reads `window.TL`, and `audio/score.py` evaluates the same file with node.
- `lib/motion.js` holds the closed-form springs, copied from the brand ad. All motion is springs. There are no easing curves, CSS transitions, timers or randomness. The paper texture uses a fixed LCG and is drawn once.
- `audio/score.py` builds `audio/score.wav`. The music is a fingerpicked guitar-like pluck, a shaker, a soft felt kick, a plucked bass and a pad in D major. It builds section by section: picking and shaker for the signs, then kick and bass for the education, a kick on every beat with a strum per bar for the products, a melody for the proof, and snaps with a rising strum for the offer. It resolves to D on the CTA press. Cue-driven sounds: pen writing, sketch strokes, scribbles, marker squeaks, ticks, page turns, paper landing, register dings on prices, stamp thuds, scissor snips on the coupon, star chimes and the button press.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.
- `fonts/`: Caveat 700, Kalam 400/700 and Inter, bundled locally.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content sources

Every on-screen claim, price and review comes from the Poorly Pet data pack (live site, 1 Oct 2026).

| On screen | Source in data pack | Verbatim? |
|---|---|---|
| "If your dog has a long back, read this." | Hook line; IVDD info: "especially common in long-backed breeds" | Hook copy (not a claim) |
| "IVDD" / "(Intervertebral Disc Disease)" | IVDD site info | Yes |
| "Sound familiar?" / "4 signs your dog's back is hurting" | Framing; the site lists these signs | Framing copy |
| "A hunched back" / "A yelp when picked up" | IVDD signs | Yes |
| "Won't jump or do the stairs" | Chip "Won't jump" + sign "Reluctant to jump or do the stairs" | Combined from both |
| "Wobbly back legs" | Collection chip | Yes |
| "What is IVDD?" and the diagram labels (spinal cord, vertebra, disc, bulging disc) | Illustrates the site's definition | Labels only |
| "A disc in the spine bulging or bursting and pressing on the cord." | IVDD site info | Yes |
| "Most at risk: Dachshunds, Bassets, Corgis and Beagles …but any dog can get it." | IVDD site info ("…are most at risk, but any dog can get it") | Reordered as a note |
| "What actually helps at home" | Heading for the At home copy | Heading |
| "Strict rest first, weeks of it." / "A back brace to stop twisting" / "Ramps so there is no jumping" / "Grip on hard floors" / "A harness with a handle for the toilet trips" | IVDD "At home" | Yes ("there is", "the toilet trips" kept) |
| "The IVDD Bundle", "Thermal Back Brace", "Natural Calming Drops" | IVDD Bundle | Yes |
| "Supports Spine Recovery" / "Thermal Muscle Relief" / "Calms and Settles" | IVDD Bundle badges | Yes |
| £62.08, "was £68.98", "SAVE 10%" | IVDD Bundle | Yes |
| "Lightweight Folding Dog Ramp", £79.99 | Ramp (name shortened) | Yes |
| "so there is no jumping" (ramp note) | IVDD At home ("ramps so there is no jumping") | Fragment |
| "Zero strain on their joints" | Ramp ("…with zero strain on their joints") | Fragment |
| "Folds flat, under 5kg" | Ramp features ("folds flat", "under 5kg") | Feature terms |
| "Balto® Body Lift harness", £120.00 | Balto® Body Lift (name shortened) | Yes |
| "for the toilet trips" (harness note) | IVDD At home | Fragment |
| "Supports the whole spine" / "Removable handles" | Balto features ("supports the whole spine", "removable handles") | Yes |
| "When the back legs stop working" | IVDD signs ("Back legs that … suddenly stop working") | Adapted |
| "FreedomRoll wheelchair", "from £179.99", 4.8 stars, "from 19 reviews" | FreedomRoll Adjustable Dog Wheelchair: £179.99, 4.8 from 19 reviews; it is the lowest-priced wheelchair listed | Yes ("from" added) |
| "4.6/5", "from 101 verified reviews" | Store-wide reviews | Yes |
| "My dachshund was diagnosed with IVDD… Seeing him wagging his tail on walks again has been amazing." Jamie T, 5 stars, wheelchair | Jamie T review | Shortened with "…" |
| "Was really pleased to see an IVDD bundle as the products add up when you buy them separate" Danny, 4 stars, IVDD Bundle | Danny review | Yes, in full |
| "10% off your first order", "POORLY10" | Store offer | Yes |
| "Free UK delivery over £39", "30-day guarantee" | Store trust | Yes |
| "Shop the IVDD Bundle →", "poorly-pet.com", the Poorly Pet mark | CTA | CTA copy |

The film does not mention vets, the AI assistant or the scanner. It makes no diagnosis, cure or treatment claims and uses no false urgency. The doodles are illustrations, not product photos. The calendar's four crossed-off weeks illustrate "weeks of it" and do not state a rest period.

Prices correct at time of making (1 Oct 2026); check before running the ad.
