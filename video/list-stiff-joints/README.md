# Poorly Pet: "5 things that help stiff joints" (TYPED)

`out/poorly-pet-5-stiff-joints.mp4` is a 1080x1920 (9:16), 30 fps, 31.3 s H.264 film with AAC audio at -14.0 LUFS integrated and -1.5 dBTP true peak. It is a short-form listicle for TikTok, Reels and Facebook.

**Style: TYPED.** This is editorial kinetic type. Lines type onto a ruled paper page in JetBrains Mono (800) with a chunky block caret, under huge Fraunces headlines. The list builds like a checklist in a notes doc: a five-box tracker at the top ticks "x" as each item lands, mint selection highlights sweep across key words, and "Less" is selected and replaced with "ZERO". Each product prints out of a slot as a receipt line with dotted leaders and a right-aligned price. The offer inverts to deep green, and the bundle receipt prints with the was-price struck through and a SAVE 10% stamp. There are no animals, no people and no screenshots. Every drawing is original inline SVG.

## Beats (112 BPM; beat = 0.536 s; bars start on beat 2)

| Beats | Time | What happens |
|---|---|---|
| 0–6 | 0–3.2 s | **Hook.** The title "5 THINGS THAT HELP STIFF JOINTS" is already on screen at frame 0 (207–250 px), with the five-box tracker above it. "Stiff after rest?" is mid-type at frame 0. Each line's box ticks on the beat, a mint selection sweeps STIFF / JOINTS on the drop (beat 2), "WATCH TILL #5" stamps in, the tracker boxes ripple, and a carriage-return ding leads into a line-feed push. |
| 6–14 | 3.2–7.5 s | **1 MSM Powder.** The numeral slams in, the tub drops, the name types, "Helps keep ageing joints supple" types (with "supple" highlighted), and the receipt "MSM POWDER ......... £14.99" prints with a ding on the price. "★ 4.9 from 9 reviews" follows, then the tracker ticks. |
| 14–22 | 7.5–11.8 s | **2 Collagen Powder.** It comes in with a carriage-return push from the right. "Joints, tendons & a glossy coat" types, then £27.99 and "TOP SELLER · 250g". |
| 22–30 | 11.8–16.1 s | **3 Thermal Coat.** A full-height mint selection wipes across to reveal it. Heat waves draw on, "Soothing infrared warmth" types, then £74.99 and "Waterproof · drug-free". |
| 30–38 | 16.1–20.4 s | **4 Folding Dog Ramp.** A new sheet drops in from the top and the ramp unfolds on its hinge. "Less strain on their joints" types, then "Less" is selected and replaced by a slammed "ZERO". Then £79.99 and "75kg capacity · folds flat". |
| 38–46 | 20.4–24.6 s | **5 Rear Support Harness.** It pushes in from the right. "stand", "walk" and "stay active" are highlighted one by one, the harness lifts, then £39.99 and "Quick on and off". A riser starts. |
| 46–54 | 24.6–28.9 s | **Offer (deep green).** The receipt printer buzzes: "OR GET THE Arthritis Bundle" slams in, and "IN THE BUNDLE:" pops in its three parts. "WAS £54.97" types and is struck through, "£49.47" slams in with a ding, and SAVE 10% stamps. The parts then slide away, Karen j's review types, POORLY10 (Inter 800) stamps in, "Free UK delivery over £39" types, and the button pops in. |
| 54–58.5 | 28.9–31.3 s | The button "Shop now → poorly-pet.com" is pressed on the downbeat with a click and a chord. The end frame holds for 2.4 s with every box in the tracker ticked, a visual rhyme with the empty tracker at frame 0. |

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time. All motion uses the closed-form springs in `lib/motion.js`: there are no CSS transitions, timers or randomness. Typing keeps the untyped rest of each line as transparent text, so nothing reflows.
- `cues.js` is the single timeline. It defines every event time in beats (`window.EV`) and the 259 sound cues (`window.CUES`). The film reads it in the browser, and `audio/score.py` runs it with node.
- `audio/score.py` builds the score (Am7–Fmaj7–C–G groove; typewriter keys on 32nds while text types; a carriage-return bell on prices; a receipt-printer buzz gated on 32nds; a riser and snare roll into the offer; a button click and chord). It writes `audio/score.wav` at -14 LUFS with a look-ahead true-peak limiter, and prints how far each cue type sits over the music. Every cue type is at least +5.2 dB.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per beat (`--beats`), or the full film muxed with the score.
- `fonts/` holds Fraunces, Inter and JetBrains Mono (Google Fonts, latin subset, bundled locally).

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content sources (DATA-PACK.md, Arthritis and stiff joints section, plus the store-wide offer)

| On screen | Source |
|---|---|
| 5 THINGS THAT HELP STIFF JOINTS | Title set by the brief |
| Stiff after rest? / Slowing on walks? | Arthritis signs: "Stiff after rest, Slowing on walks" |
| WATCH TILL #5 | Open-loop line (no claim) |
| MSM Powder · £14.99 · ★ 4.9 from 9 reviews · "Helps keep ageing joints supple" · 300g | MSM Powder for Dogs & Cats - Joint & Coat Support 300g: £14.99, rated 4.9 from 9 reviews, "Helps keep ageing joints supple and comfortable." (shortened) |
| Collagen Powder · £27.99 · "Joints, tendons & a glossy coat" · TOP SELLER · 250g | Collagen Powder … 250g: £27.99 (TOP SELLER), "Supports healthy joints, tendons, and a glossy coat" (condensed) |
| Thermal Coat · £74.99 · "Soothing infrared warmth" · Waterproof · drug-free | Waterproof Thermal Coat for Dogs with Arthritis & Active Dogs: £74.99, "…deliver soothing infrared warmth to stiff joints…", "drug-free" |
| Folding Dog Ramp · £79.99 · "ZERO strain on their joints" · 75kg capacity · folds flat | Lightweight Folding Dog Ramp: £79.99, "Zero strain on their joints". "75kg capacity" and "folds flat" come from the same ramp's listing in the IVDD section (Lightweight Folding Dog Ramp - 75kg Capacity, 151cm, £79.99) |
| Rear Support Harness · £39.99 · "Support to stand, walk & stay active" · Quick on and off | Rear Support Harness for Dogs with Hip & Mobility Issues: £39.99, "…the support they need to stand, walk, and stay active." "Quick on and off" |
| Arthritis Bundle · WAS £54.97 · NOW £49.47 · SAVE 10% | Arthritis Bundle: £49.47 (was £54.97, SAVE 10%) |
| In the bundle: Joint Care Chews, Self-Heating Pet Pad, Daily Joint Salmon Oil | Arthritis Bundle contents |
| "My dog Oscar has been having these for 3 months now and can see a real difference…" — Karen j ★★★★★ | Karen j, 5 stars, Arthritis Bundle (verbatim, shortened with "…") |
| POORLY10 · 10% OFF YOUR FIRST ORDER · Free UK delivery over £39 · Shop now → poorly-pet.com | Store-wide offer and trust |

Wording that is not verbatim:
- "Less strain on" is on screen briefly (about 0.8 s) before "Less" is selected and replaced by "ZERO". This is the typo-correct moment. The final line matches the data pack.
- Product names are shortened for display: "Thermal Coat", "Folding Dog Ramp", "Rear Support Harness", and on the receipts "MSM POWDER", "COLLAGEN POWDER", "THERMAL COAT", "FOLDING RAMP" and "REAR HARNESS". The supporting lines are shortened or condensed from the product copy, as listed above.
- "OR GET THE", "IN THE BUNDLE:", "WAS", "NOW", the "/5" counters and the tracker labels 01–05 are interface wording, not claims.

There are no vets, no AI or scanner mentions, no diagnosis or cure claims and no fake urgency.

Prices correct at time of making (1 Oct 2026); check before running the ad.
