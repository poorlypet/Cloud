# Itchy skin: 60 s whiteboard conversion ad

`out/poorly-pet-itchy-skin-60.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 60.0 s, H.264 with AAC audio at -14 LUFS.

Style: "whiteboard and sticky notes". A bright white dry-erase board with faint ghosting of old marker, a sheen and thin aluminium rails at the top and bottom (plus a marker tray). Headings are written in Permanent Marker and body text in Kalam, in deep green #0B2A23, rust #A8542F and a teal marker #17695A. Square sticky notes in mint #9FE8C9, pale yellow and soft coral are slapped on with a little rotation and a peel shadow. There are highlighter swipes, arrows, ticks, underlines and boxes drawn with marker strokes. Boards change either with a felt eraser wipe (the eraser follows a back-and-forth path, and a mask clears the marker behind it, leaving a faint ghost that settles away) or with a new board sliding in. No animals or people are drawn; products are simple object doodles with handwritten labels. There are no screenshots.

## Beats (104 BPM, 1 beat = 0.577 s)

| Beats | Time | Board |
|---|---|---|
| 0–7 | 0–4.0 s | HOOK. "Does your dog scratch ALL night?" is already being written at frame 0. "ALL" is in rust and underlined three times. A moon, sparkles, scratch marks and "scratch, scratch, scratch…". |
| 7–19 | 4.0–11.0 s | Eraser wipe. RELATE: "Sound familiar?" with a mint highlight. Four sticky notes land, and each box is ticked: scratching that wakes them at night, one paw licked rusty brown, pink skin on the belly and armpits, flakes on the bed. |
| 19–28 | 11.0–16.2 s | Board slide. EDUCATE: "What's actually going on? An over-reaction to something ordinary:", then notes for pollen, grass, dust mites and a food. |
| 28–36 | 16.2–20.8 s | Eraser wipe. "The itch cycle": a hand-drawn loop of inflamed skin → scratch! → worse skin, with an "on repeat" ring that keeps turning, and a "Let's break the cycle" note. |
| 36–48 | 20.8–27.7 s | Board slide. "What helps": an INSIDE note (Omega-3 every day to calm the skin), an OUTSIDE note (a gentle wash and a balm), "+ a flea routine underneath it all", and "Most dogs settle in two to three weeks." highlighted. |
| 48–61 | 27.7–35.2 s | Eraser wipe. "Itchy Skin Bundle £48.57", "was £53.97" struck through, and a SAVE 10% note. Chews, balm and drops are drawn, each with its INSIDE or OUTSIDE tag and its site line. |
| 61–73 | 35.2–42.1 s | Board slide. "Inside · Outside · Wash": Scottish Salmon Oil £9.99, Hot Spot & Itch Relief Spray £12.99 and Oatmeal Shampoo £9.99, each with a flag note, a doodle, a price ding and one benefit line. |
| 73–88 | 42.1–50.8 s | Eraser wipe. PROOF: "4.6/5", five stars popped in (the fifth is 60 % filled), "from 101 verified reviews", and Amie F.'s review handwritten on a note. |
| 88–104 | 50.8–60 s | Board slide. OFFER + CTA: a POORLY10 coupon ("10% off your first order") whose stub tears off; notes for free UK delivery over £39, the 30-day guarantee and subscribe & save up to 15%; a hand-drawn "Shop itchy skin →" button, then the Poorly Pet mark and poorly-pet.com. The button is pressed at 57.7 s and the end card holds for 2.3 s. |

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Opening the file in a browser plays a looping preview.
- `cues.js` is the single timeline: board start times, transitions, and every write, draw, slap, highlight, pop, tear and press with its sound. The film reads `window.TL`, and the score evaluates the same file with node.
- `lib/motion.js` holds the closed-form springs from the brand ad. All motion uses springs. There are no easing curves, CSS transitions, timers or randomness.
- `audio/score.py` builds `audio/score.wav`. It is 104 BPM pop-lite (plucks, claps, bass, a soft kick and hats, D–A–Bm–G), with a breakdown under the reviews, a riser and clap roll into the offer, and a D major resolve on the button press. The cue sounds are marker squeaks, sticky-note thwaps, highlighter swishes, an eraser felt rub, a board slide and clunk, price dings, star pops, a paper tear and a button click. The script prints the loudness and the worst "sfx peak over music RMS" for each cue type; every type is at +5 dB or more.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.
- `fonts/` holds Permanent Marker and Kalam 400/700 (Google Fonts, latin subset) and Inter (copied from the brand ad; used only for the POORLY10 code so that the 1 and 0 cannot be misread), all bundled locally.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content sources (all from the data pack, live site pulled 1 Oct 2026)

| On screen | Source in the data pack |
|---|---|
| "Does your dog scratch ALL night?" | Hook line from the ad brief (not a claim). Relates to "Scratching that wakes them at night". |
| "Scratching that wakes them at night", "One paw licked rusty brown", "Pink skin on the belly and armpits", "Flakes on the bed" | Itchy skin, Signs (verbatim) |
| "What's actually going on? An over-reaction to something ordinary: pollen, grass, dust mites, a food" | Itchy skin, "What actually is it? An over-reaction to something ordinary. Pollen, grass, dust mites or a food." |
| Itch cycle: inflamed skin → scratch! → worse skin | "The skin gets inflamed, the dog scratches, the scratching makes it worse." (shortened into a loop) |
| "Let's break the cycle" | Echoes the balm copy "helps break the cycle of scratching" |
| INSIDE: "Omega-3 every day to calm the skin" | "Omega 3 every day to calm the skin from inside." (shortened) |
| OUTSIDE: "A gentle wash and a balm"; "+ a flea routine underneath it all"; "Most dogs settle in two to three weeks." | Itchy skin, What helps (verbatim apart from the "+") |
| Itchy Skin Bundle £48.57, was £53.97, SAVE 10% | Itchy Skin Bundle |
| Itch Relief Chews: "Calms itching from the inside with natural ingredients and omegas." | Bundle part "Itch Relief Supplement Chews" (name shortened; line verbatim) |
| Itch Relief Balm: "Chamomile and lavender balm soothes sore, red patches on contact." | Bundle part "Dog Skin Itch Relief Balm" (name shortened; line verbatim) |
| Itch & Allergy Drops: "Natural drops help settle the underlying allergic response." | Bundle part "Dog Itch & Allergy Relief Drops" (name shortened; line verbatim) |
| INSIDE / OUTSIDE tags on the bundle parts | Bundle badge "Inside and Outside Relief"; chews and drops work "from within", the balm on sore patches |
| Scottish Salmon Oil £9.99, "Rich in Omega-3 (EPA and DHA)" | "100% Natural Scottish Salmon Oil for Dogs & Cats: £9.99 … rich in Omega-3 (EPA and DHA)" |
| Hot Spot & Itch Relief Spray £12.99, "No steroids, no rinse" | "Hot Spot & Itch Relief Spray for Dogs 250ml: £12.99 … No steroids, no rinse" |
| Oatmeal Shampoo £9.99, "Colloidal oatmeal and aloe vera" | "Oatmeal Dog Shampoo for Sensitive Skin - 500ml: £9.99 … Colloidal oatmeal, aloe vera and pro-vitamin B5" (shortened) |
| "4.6/5 from 101 verified reviews" | Store-wide reviews (Judge.me) |
| "this has done what it says my dogs skin is so much better, less flaky which means less itching", Amie F., Oatmeal Shampoo, 4 stars | Itchy skin, real reviews (verbatim) |
| "10% off your first order", POORLY10 | Store-wide offer |
| "Free UK delivery over £39", "30-day guarantee", "Subscribe & save up to 15%" | Store-wide offer and trust |
| "Shop itchy skin → poorly-pet.com" | CTA (the site's Itchy Skin condition page) |

There are no mentions of vets, the AI assistant or the scanner. There are no countdowns and no invented urgency. The doodles (tub, tin, dropper, pump bottle, spray bottle, shampoo bottle) are illustrations, not product photos.

Prices correct at time of making (1 Oct 2026); check before running the ad.
