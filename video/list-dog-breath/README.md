# "5 things for fresher dog breath": bold chalkboard listicle

`out/poorly-pet-5-dog-breath.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 30.26 s (908 frames), H.264 with AAC audio at -14 LUFS. `out/poorly-pet-5-dog-breath-social.mp4` is a lighter copy (x264 crf 24, maxrate 4M) for upload limits.

**Title choice.** "5 THINGS THAT FIX DOG BREATH" would overclaim (the products "fight", "freshen" and "tackle" bad breath; none claims to fix it), so the title is **"5 THINGS FOR FRESHER DOG BREATH"**.

**Look.** One full-frame deep-green chalkboard. Its mottling, chalk dust and faint old eraser swipes come from SVG `feTurbulence` with fixed seeds, baked once at load. Headings, numerals and prices are Cabin Sketch Bold (a chunky chalk display face), the supporting lines are Patrick Hand (a clear chalk hand), and POORLY10 is Inter 800 (a print face, so "10" never reads as "IO"). A chalk filter (grain erosion and a rough edge, fixed seeds) sits on all text and strokes. The chalk colours are white, mint #9FE8C9 and dusty orange #E8996B.

- **Numerals** are giant (468 px) dusty-orange chalk digits that slam onto the board on each downbeat (the board takes a small knock), with a chalky mint double underline drawn under them.
- **Product doodles** are drawn on stroke by stroke, then filled with a chalk-scribble hatch. They are objects only: a triple-head brush and paste tube, a treat pouch with bites and a mint leaf, a powder tub and scoop, a bottle with a measuring cap and a water bowl, and a gel tube. There are no animals or people.
- **Transitions:** a felt board eraser makes four fast sweeps that smear the old item into chalk haze, and the next numeral slams in as the haze clears.
- **Progress tracker:** five chalk circles numbered 1-5 sit at the top for the whole film. Each one is hatched orange and ticked in mint (with a pop) as its item lands, and all five bounce when the offer arrives.
- **Type is big:** the title runs at 150-240 px, item names at 176 px, prices at 150-180 px, supporting lines at 72 px, and the smallest text on screen is 46 px.

## Beats (116 BPM, 1 beat = 0.517 s; the bar starts on beat 2, so items land on beats 6, 14, 22, 30, 38 and the offer on 46)

| Beats | Time | On screen |
|---|---|---|
| 0–6 | 0–3.1 s | **Hook.** At frame 0 the title "5 THINGS FOR FRESHER DOG BREATH" is already on the board and settling, while the tracker circles and the orange underline under FRESHER are being drawn. The hook line "Bad breath is usually the first sign of dental disease" is written, a chalk tooth is drawn with glints, the 5 knocks on the drop (beat 2), and a "Save this for later" tag is drawn and pops. |
| 5.2–14 | 2.7–7.2 s | Eraser, then **#1 BRUSH (the right way).** "Cleans 3 sides in one stroke." Card: Triple-Head Toothbrush Kit **£14.99**, with a BEST SELLER stamp. |
| 13.2–22 | 6.8–11.4 s | Eraser, then **#2 DENTAL BITES.** "Seaweed, charcoal & spearmint." Card: Plaque Crackerz Dental Bites **£5.99**, with a 100% NATURAL stamp. |
| 21.2–30 | 11.0–15.5 s | Eraser, then **#3 SEAWEED POWDER.** "No brushing needed." Card: Organic Seaweed Powder **£10.99**, with an ORGANIC stamp. |
| 29.2–38 | 15.1–19.7 s | Eraser, then **#4 WATER ADDITIVE.** "One capful a day." Card: Dental Water Additive **£9.99**, with a TOP RATED stamp. |
| 37.2–46 | 19.2–23.8 s | Eraser, then **#5 DENTAL GEL.** "No toothbrush required." Card: Dental Gel for Dogs 100ml **£9.99**, with a JUST APPLY stamp. A riser and a snare roll build under it into the offer. |
| 45.2–58.5 | 23.4–30.26 s | Eraser, then **payoff.** Mini doodles of the brush kit, the Crackerz and the seaweed powder are joined by "+" signs above "The Dental Bundle". **£28.77** slams in, "was £31.97" is struck through, and SAVE 10% is stamped. Joe's review is written with five stars. A dashed coupon reads "10% off your first order" with **POORLY10** (Inter 800). "Free UK delivery over £39" gets a tick. A chalk button reading "Shop now → poorly-pet.com" is pressed at 28.45 s and resolves on a G major chord, and the end card holds for 1.8 s. |

Within each item, something new lands about every half second to one second: the numeral slam and tracker tick, the name (written), the underline, the doodle, the supporting line and hatch, the card, the price slam (with a ding), the stamp and the glints.

## Sound

`audio/score.py` (numpy, 48 kHz) builds the music and every effect from `cues.js`.
- **Music:** upbeat, playful and modern, at 116 BPM in G major. There is a chalk-tap pickup under the title, and the groove drops on beat 2. Under I-V-vi-IV it has a four-on-the-floor kick, finger snaps on 2 and 4, **a chalk tap on every beat**, a bouncy octave bass, offbeat piano stabs and a marimba hook with an echo. The hats go to 16ths from item 3. One bar on D builds into the offer (a riser and a snare roll), the offer runs G-C-D, and the button press resolves to a ringing G major chord with bells.
- **Effects (cue-driven):** a slam on every numeral (each on a downbeat), chalk-writing scratches, line-drawing strokes, hatch scribbles, tracker ticks, one eraser swish per sweep, a register ding on every price, stamp thuds (on the badges, SAVE 10% and POORLY10), the strike-through and the button click.
- **Mix:** the MP4 measures -14.0 LUFS integrated with a true peak of -2.7 dBTP (ffmpeg `ebur128`). The WAV is made at -13.8 LUFS with a -2 dBTP ceiling because the AAC encode reads about 0.2 LU quieter and overshoots on transients. The music is about -16.4 LUFS on its own and the effects about -17.0 LUFS. The worst-case peak of each cue type over the music RMS around it is: press +5.9, ding +6.5, stamp +7.7, tap +9.5, fill +15.5, draw +16.6, slam +17.3, erase +19.3, chalk +20.4, tick +21.0 and strike +21.1 dB.

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time, and every move uses the springs in `lib/motion.js`. There are no CSS transitions, timers or randomness. Opening the file in a browser plays a looping preview.
- `cues.js` is the single timeline (boards, events and their sounds), read by both the film and the score.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with `audio/score.wav`.
- `fonts/` holds Cabin Sketch 700, Patrick Hand and Inter (woff2, bundled locally).

To rebuild, run `python3 audio/score.py`, then `CHROMIUM_PATH=/path/to/chromium node render.mjs` (this needs playwright-core and ffmpeg-static).

## Content sources (DATA-PACK-2.md, "Bad breath / dental", and DATA-PACK.md, store-wide)

| On screen | Source | Verbatim? |
|---|---|---|
| "5 THINGS FOR FRESHER DOG BREATH" | Title written for the ad. "Fresher breath" is from the Dental Bundle copy ("…healthy teeth and fresher breath") | Own copy; no fix or cure claim |
| "Bad breath is usually the first sign of dental disease" | "Bad breath isn't just unpleasant - it's usually the first sign of dental disease…" | Condensed from the site line |
| "Save this for later" | Open loop written for the ad (no claim) | Own copy |
| BRUSH / "the right way" | Item heading written for the ad | Own copy |
| "Cleans 3 sides in one stroke" | "Cleans three tooth surfaces in one stroke." | **Reworded** ("three tooth surfaces" became "3 sides"), as briefed |
| Triple-Head Toothbrush Kit **£14.99**, BEST SELLER | Dog Toothbrush & Toothpaste Dental Kit - Triple-Head Brush: £14.99 (BEST SELLER) | Name shortened |
| DENTAL BITES / "Seaweed, charcoal & spearmint" | "…using the power of seaweed, activated charcoal, and spearmint" | Condensed ("activated" dropped) |
| Plaque Crackerz Dental Bites **£5.99**, 100% NATURAL | Plaque Crackerz Dental Bites for Dogs 250g: £5.99; "…with 100% natural ingredients" | Name shortened; stamp condensed from the site line |
| SEAWEED POWDER / "No brushing needed" | "…from the inside out - no brushing needed." | Yes (fragment) |
| Organic Seaweed Powder **£10.99**, ORGANIC | Organic Seaweed Powder – Dental & Thyroid Support: £10.99; "Pure organic seaweed" | Name shortened; stamp from the name |
| WATER ADDITIVE / "One capful a day" | "…with just one capful a day." | Yes (fragment) |
| Dental Water Additive **£9.99**, TOP RATED | Dental Water Additive for Dogs - Fights Bad Breath & Plaque: £9.99 (TOP RATED) | Name shortened |
| DENTAL GEL / "No toothbrush required" | "No toothbrush required - just apply." | Yes (fragment) |
| Dental Gel for Dogs 100ml **£9.99**, JUST APPLY | Dental Gel for Dogs 100ml - Plaque & Gum Care: £9.99; "…just apply." | Name shortened; stamp is a site fragment. The "Vet Formulated" line is not used |
| The Dental Bundle **£28.77**, was £31.97, SAVE 10% | Dental Bundle: £28.77 (was £31.97, SAVE 10%) | Yes |
| Bundle contents: brush kit + Crackerz + seaweed powder (drawn as doodles) | Toothbrush & Toothpaste Kit, Plaque Crackerz Dental Bites, Organic Seaweed Powder | Shown as drawings, not text |
| "Good stuff and my dogs breath is deffo improving" — Joe, 5 stars | Joe, 5 stars, Dental Bundle | Yes (verbatim, including "dogs" and "deffo") |
| "10% off your first order" / POORLY10 | "10% off your first order. Code: POORLY10" | Yes |
| "Free UK delivery over £39" | Store-wide offer | Yes |
| "Shop now → poorly-pet.com" | CTA as briefed | – |

There is no mention of vets, the AI assistant or the scanner, and there is no countdown or fake urgency.

Prices correct at time of making (1 Oct 2026); check before running the ad.
