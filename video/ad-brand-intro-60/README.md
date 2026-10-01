# Poorly Pet brand intro: "Chalkboard" (60 s conversion ad)

`out/poorly-pet-brand-intro-60.mp4` is the finished film: 1080x1920 (9:16), 30 fps, 60.0 s, H.264 with AAC audio at -14 LUFS.

The whole ad is written on one long deep-green chalkboard (#0B2A23 to #12382F). The board's mottling, chalk dust and old eraser residue come from SVG `feTurbulence` with fixed seeds, baked once per board slot at load. Faint, blurred ghosts of old classroom writing ("7 x 8 = 56", "homework p. 42") sit in the margins, and each erased board leaves a very faint ghost of itself behind. Headings are Cabin Sketch Bold, body text is Patrick Hand and the wordmark is Inter 800. A chalk SVG filter (grain erosion plus a rough displaced edge, fixed seeds) is applied to all text and strokes. The chalk colours are white, mint #9FE8C9 and dusty orange #E0956A.

Transitions alternate between two moves. In a pan, the camera slides along the board to the next slot, and the "Legs & paws" arrow leads it there. In an erase, a felt board eraser makes five sweeps that smear the old writing into chalk haze, the haze clears, and the next board is written in its place. The Poorly Pet mark is outlined in chalk, coloured in with two cross-hatched chalk scribbles, and then gets its white plus. No animals or people are drawn: the products are object doodles (tubs, a pouch, a sling harness, a pump bottle, a dropper, a balm tin, a heat pad and a parcel). There are no screenshots or website images, and there is no mention of vets, the AI assistant or the symptom scanner.

## Beats (96 BPM, 1 beat = 0.625 s)

| Beats | Time | Board | Arrives by |
|---|---|---|---|
| 0–6.5 | 0–4.1 s | **Hook.** "Don't know what's wrong with your dog?" is already being written at frame 0, with "wrong" in orange. "You're not alone." is double-underlined, and three chalk question marks appear. | – |
| 6.5–14.25 | 4.1–8.9 s | **Relate.** "Sound familiar?" Three search bars ("Is it serious?", "What do I buy?", "Which one actually works?") and six smaller queries are scrawled fast, then all crossed out. "There's an easier way." | pan |
| 15.5–24 | 9.7–15 s | **Route 1.** "Not sure? Start with what you're seeing." The 8 body areas are drawn as a mind map around "8 body areas", with a tap on each one. "Legs & paws" is circled and an arrow leaves the board. | erase |
| 24–33.25 | 15–20.8 s | "Legs & paws" leads to **"Limping or favouring a leg"** and then "We'll match it to real products from our store." Three products follow, each with a doodle, a benefit and a price (each price gets a ding). | pan |
| 34.5–42.5 | 21.6–26.6 s | **Route 2.** "Know the condition? Go straight there." A two-column condition list (with a tap on each bullet) and "+ 17 more" lead to a circled **25** "conditions, 8 care areas". | erase |
| 42.5–53 | 26.6–33.1 s | **Bundles.** "29 bundles across 8 categories, all discounted." Two bundle cards show the doodled contents, the price (with a ding), the was-price struck through and a SAVE 10% stamp. "Less guesswork, one clear price." | pan |
| 54.25–60 | 33.9–37.5 s | **Why Poorly Pet.** "The UK's pet health & recovery specialist", then "Trusted brands:" with a ticked chalk list (Balto, Ortocanis, Ruffwear, Zesty Paws, AniForte). | erase |
| 60–66.75 | 37.5–41.7 s | "Subscribe & save up to 15%", with a cycle arrow and "Skip, pause or cancel any time." "Fast delivery" has a parcel doodle and "Many items arrive in 1–3 business days." | pan |
| 68–77.5 | 42.5–48.4 s | **Proof.** "4.6/5" with five chalk stars, filled to 4.6, and "from 101 verified reviews". Two real reviews follow (John C. and Gee). | erase |
| 77.5–84 | 48.4–52.5 s | **Offer.** "10% off your first order" (with a ding), the code POORLY10 on a chalk coupon that is stamped, then ticks for "Free UK delivery over £39" and "30-day guarantee". | pan |
| 85.25–96 | 53.3–60 s | **End card.** The mark is drawn in chalk and filled in, then "Poorly Pet" and "Find the right support for your dog". A chalk "Shop now → poorly-pet.com" button is pressed at 57.5 s. POORLY10, free delivery and the guarantee stay on screen. Everything is written by 57.2 s and held to the end (2.5 s after the press). | erase |

## Sound

`audio/score.py` (numpy, 48 kHz) builds the music and every effect from `cues.js`.
- **Music:** confident and uplifting in D major. Soft piano and plucks play over Bm-G-D-A for the questions. A felt kick, clap, hats and plucked bass come in under I-V-vi-IV, and a piano top line joins for the bundles and proof. The offer builds over G-A with a riser and a snare fill. The drums drop out for one bar as the logo is drawn (a wide D major resolve with a bell shimmer), then the groove returns and lands on a final D chord as the button is pressed.
- **Effects (cue-driven):** chalk writing scratches with the odd squeak, fast scrawls, line-drawing strokes, cross-out strikes, chalk taps on every bullet and star, a felt swish for each eraser pass, a soft slide on each pan, a register "ding" on each price, bundle and the 10% offer, stamp thuds, the logo scribble and the button press.
- **Mix:** -14.0 LUFS integrated with the true peak under -1 dBTP. The music leads (about -15.5 LUFS on its own, against -18 LUFS for the effects). Every cue type peaks at least +8.8 dB over the music RMS around it (the script prints the worst case for each type).

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time. Every move uses the springs in `lib/motion.js`: critically damped springs for writing and drawing, `track()` for the camera, presses, stamps and the eraser. There are no CSS transitions, timers or randomness. Opening the file in a browser plays a looping preview.
- `cues.js` is the single timeline (board slots, arrivals and events with their sounds), read by both the film and the score.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with `audio/score.wav`.
- `fonts/` holds Cabin Sketch 700, Patrick Hand and Inter (woff2, Latin subset, bundled locally).

Rebuild: `python3 audio/score.py`, then `CHROMIUM_PATH=/path/to/chromium node render.mjs` (needs playwright-core and ffmpeg-static).

## Content sources

Every fact, price and review comes from the data pack (live site, pulled 1 Oct 2026). "Verbatim" means the exact site wording; anything else is marked.

| On screen | Source in the data pack | Verbatim? |
|---|---|---|
| "Don't know what's wrong with your dog?" / "You're not alone." | Hook copy written for the ad (no claim) | Own copy |
| "Sound familiar?", the search queries, "There's an easier way." | Illustrative owner searches written for the ad | Own copy, illustrative |
| "Not sure? Start with what you're seeing." | Site copy you can quote | Yes |
| "8 body areas" and the 8 area names | Shop by symptom: 8 body areas | Yes |
| "Limping or favouring a leg" | Example symptom ("Limping or favouring a leg") | Yes |
| "We'll match it to real products from our store." | "…we'll match it to real products from our store." | Yes (fragment) |
| MSM Powder **£14.99**, "Supports supple joints" | MSM Powder for Dogs & Cats - Joint & Coat Support 300g: £14.99; "Supports supple joints, glossy coats…" | Name shortened; benefit is a fragment |
| Zesty Paws Hip & Joint Chews **£24.00**, "Helps ease stiff joints" | Zesty Paws Hip & Joint Chews - Turkey: £24.00; "helps support mobility and ease stiff joints" | Name shortened; benefit condensed |
| Rear Support Harness **£39.99**, "Support to stand & walk" | Rear Support Harness for Dogs with Hip & Mobility Issues: £39.99; "the support they need to stand, walk, and stay active" | Name shortened; benefit condensed |
| "Know the condition? Go straight there." | Site copy: "Know the diagnosis? Go straight there." | Adapted ("diagnosis" became "condition", as briefed) |
| Arthritis, IVDD, Hip Dysplasia, Itchy Skin, Anxiety & Stress, Dental Disease, Cruciate Ligament, Digestive Issues | Shop by condition: example conditions | Yes |
| "+ 17 more" | 25 conditions minus the 8 shown | Derived |
| "25 conditions", "8 care areas" | Shop by condition: 25 conditions, 8 care areas | Yes |
| "29 bundles across 8 categories, all discounted." | "29 real bundles across 8 categories, all discounted" | "real" dropped |
| Arthritis Bundle **£49.47**, ~~£54.97~~, SAVE 10% | Arthritis Bundle: £49.47 (was £54.97, SAVE 10%) | Yes |
| "Joint chews, self-heating pad & salmon oil" | Bundle contents: Joint Care Chews, Self-Heating Pet Pad, Daily Joint Salmon Oil | Summarised contents |
| Itchy Skin Bundle **£48.57**, ~~£53.97~~, SAVE 10% | Itchy Skin Bundle: £48.57 (was £53.97, SAVE 10%) | Yes |
| "Itch chews, allergy drops & a soothing balm" | Bundle contents: Itch Relief Supplement Chews, Dog Itch & Allergy Relief Drops, Dog Skin Itch Relief Balm | Summarised contents |
| "Less guesswork, one clear price." | Condition bundles copy | Yes |
| "The UK's pet health & recovery specialist" | Site copy you can quote | Yes |
| "Trusted brands:" Balto, Ortocanis, Ruffwear, Zesty Paws, AniForte | Brands sold | Brand names yes; "Trusted brands" is own label |
| "Subscribe & save up to 15%", "Skip, pause or cancel any time." | Subscribe & save: up to 15% off…; "Skip, pause or cancel any time." | Yes / condensed |
| "Fast delivery", "Many items arrive in 1–3 business days." | Delivery: many items arrive in 1 to 3 business days | Condensed |
| "4.6/5", "from 101 verified reviews" | "4.6/5 from 101 verified reviews" | Yes |
| "…finding the right support was overwhelming, but Poorly Pet made it so much easier." John C. | John combs, 5 stars, brand-level review | Verbatim excerpt (shortened with "…") |
| "I love that places like this exist!" Gee | Gee, 5 stars, brand-level review | Verbatim excerpt |
| "10% off your first order", POORLY10 | Store-wide offer | Yes |
| "Free UK delivery over £39", "30-day guarantee" | Store-wide offer and trust | Yes |
| "Find the right support for your dog" | Site copy you can quote | Yes |
| "Shop now → poorly-pet.com" | Call to action | Own copy |

Notes:
- The three "matched" products show the kind of products the symptom route leads to. The data pack does not list the site's exact matches for "Limping or favouring a leg", so these three are illustrative examples chosen from the joint and mobility range.
- The faint classroom writing on the board (sums, days of the week) is decorative background, not a claim.

Prices correct at time of making (1 Oct 2026); check before running the ad.
