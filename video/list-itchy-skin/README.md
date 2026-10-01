# Poorly Pet: 5 things that help itchy skin

`out/poorly-pet-5-itchy-skin.mp4` is a 31.0 s listicle ad for TikTok, Reels and Facebook. It is 1080x1920 (9:16) at 30 fps, with H.264 video and AAC audio at -14.0 LUFS integrated and -1.6 dBTP true peak.

The style is a premium product-UI launch film: white product cards with soft depth, 28-40 px radii, big Fraunces headlines with italic accents, Inter UI text and the brand palette (deep green, mint, rust, paper). Every screen is original HTML and inline SVG. There are no screenshots, and no animals or people. All motion uses the closed-form springs in `lib/motion.js`, and `renderFrame(t)` is a pure function of time.

## Beats (118 BPM, beat = 0.508 s; items land on bar downbeats)

| Beats | Time | What happens |
|---|---|---|
| 0-6 | 0-3.05 s | **Hook.** At frame 0, "**5** things that help *itchy skin*" is on screen at about 200 px, with the 5 in an orange badge. Title words are still settling and product tiles are sliding in. "Save this for later" is tapped (bookmark fills), an underline draws under *itchy skin*, and the 5-step tracker shimmers 1 to 5. The cursor taps tile 1 and the screen pushes left. |
| 6-14 | 3.05-7.12 s | **1 Salmon oil *every day*** on paper. A number badge slams in, then opens into the product card while the numeral rides up to the header. Scottish Salmon Oil appears with a BEST SELLER tag. The price pill counts up to £9.99, and the chip types "Rich in Omega-3". The + button is tapped and turns into a check, the item flies to the cart, the cart badge goes to 1 with a ding, and "Added to cart" pops. |
| 14-22 | 7.12-11.19 s | **2 Itch Relief *Balm*** on mint (push up). The card shows 60ML, £9.99 and "Soothes redness, hydrates dry skin". The cart goes to 2. |
| 22-30 | 11.19-15.25 s | **3 A gentle *oatmeal wash*** on deep green (wipe up). The card shows Oatmeal Dog Shampoo, 500ML, £9.99 and "Colloidal oatmeal & aloe vera". The cart goes to 3. |
| 30-38 | 15.25-19.32 s | **4 Hot Spot & *Itch Spray*** on paper (push left). The card shows Hot Spot & Itch Relief Spray, 250ML, £12.99 and "No steroids, no rinse". The cart goes to 4. |
| 38-46 | 19.32-23.39 s | **5 Itch Relief *Chews*** on mint (wipe from the right). The card shows BEST SELLER, £29.99 and "Itch relief from the inside out". The cart goes to 5. A riser and snare roll build into the payoff. |
| 46-53 | 23.39-26.95 s | **Bundle.** The cart button opens into an orange page: "Get the Itchy Skin *Bundle*". Chews, balm and drops pop in, the price counts to £48.57, £53.97 is struck through, and "SAVE 10%" slams in. Then "Chews + Balm + Drops" and "Less guesswork, one clear price." |
| 53-61 | 26.95-31.03 s | **End card** on deep green (push up), echoing frame 0: "Shop *itchy skin*", Amie F.'s 4-star review, the POORLY10 coupon (Inter 800), "Free UK delivery over £39", and "Shop now → poorly-pet.com". The button is tapped on beat 57 with a click and a chord. The product tiles and the full tracker (cart 5) echo the hook. The end frame holds still from about 29.4 s (about 1.6 s). |

The 5-step tracker (a white pill with numbered segments and a cart button) is on screen for the whole film. The current step is orange and completed steps are deep green. The cart badge counts 1 to 5, one per item added.

## Files

- `index.html` is the film. Open it in a browser for a looping preview; `?render=1` is the render mode.
- `cues.js` holds the timeline and the 173 sound cues. The film and the score both read it.
- `lib/motion.js` holds the springs (copied from `brand-ad`).
- `audio/score.py` builds `audio/score.wav`: 118 BPM pop-electronic in D major (Bm G D A), with a four-on-the-floor kick, sidechained pads, an offbeat bass, a pluck arp, a lead hook, and a riser and snare roll into the bundle. UI sounds are driven by the cues: slam, swish, pops, price ticks, typing, tap clicks, the cart ding, the stamp, stars, and the button chord. It normalises to -14 LUFS with a look-ahead limiter at -2.2 dBFS (4x oversampled). It also prints each cue type's minimum margin over the music RMS; the lowest is whoosh at +5.4 dB.
- `render.mjs` renders the full MP4 (`node render.mjs`), one still per beat (`--beats`), or chosen stills (`--stills 1,4.5`). Use `STILLS_DIR` to send stills outside the repo.

Rebuild: `python3 audio/score.py && CHROMIUM_PATH=/path/to/chromium node render.mjs` (needs playwright-core and ffmpeg-static in `node_modules`).

## Content sources (all from DATA-PACK.md, Itchy skin section)

| On screen | Source |
|---|---|
| Scottish Salmon Oil, £9.99, BEST SELLER, "For dogs & cats", "Rich in Omega-3" | 100% Natural Scottish Salmon Oil for Dogs & Cats: £9.99 (BEST SELLER), "rich in Omega-3 (EPA and DHA)" |
| Item name "Salmon oil every day" | Site copy: "Omega 3 every day to calm the skin from inside." |
| Itch Relief Balm, £9.99, 60ML, "Natural & organic", "Soothes redness, hydrates dry skin" | Dog Skin Itch Relief Balm - Natural & Organic, 60ml: £9.99, "Soothes redness, hydrates dry skin" |
| Oatmeal Dog Shampoo, £9.99, 500ML, "For sensitive skin", "Colloidal oatmeal & aloe vera" | Oatmeal Dog Shampoo for Sensitive Skin - 500ml: £9.99, "Colloidal oatmeal, aloe vera and pro-vitamin B5" |
| Item name "A gentle oatmeal wash" | Site copy: "A gentle wash and a balm on the outside." |
| Hot Spot & Itch Relief Spray, £12.99, 250ML, "Spray on and leave", "No steroids, no rinse" | Hot Spot & Itch Relief Spray for Dogs 250ml: £12.99, "No steroids, no rinse ('Spray on and leave - that's it')" |
| Itch Relief Chews, £29.99, BEST SELLER, "Skin & allergy support", "Itch relief from the inside out" | Itch Relief Chews for Dogs - Skin & Allergy Support: £29.99 (BEST SELLER), "Tackles itching… from the inside out" |
| Itchy Skin Bundle £48.57, £53.97 struck through, SAVE 10%, "Chews + Balm + Drops" | Itchy Skin Bundle: £48.57 (was £53.97, SAVE 10%); contents: Itch Relief Supplement Chews, Dog Skin Itch Relief Balm, Dog Itch & Allergy Relief Drops |
| "Less guesswork, one clear price." | Store-wide bundle copy |
| Amie F., 4 stars, Oatmeal Shampoo: "…my dogs skin is so much better, less flaky…" | Amie F., 4 stars, Oatmeal Shampoo (verbatim, shortened with "…") |
| 10% off your first order, POORLY10 | Store-wide offer |
| Free UK delivery over £39 | Store-wide offer |

Not verbatim from the data pack:
- Title: "5 things that help itchy skin".
- Open loop: "Save this for later".
- Shortened item names: "Hot Spot & Itch Spray"; "A gentle oatmeal wash" (site copy plus the product's oatmeal).
- Chips: "Itch relief from the inside out" condenses the chews' line; "Rich in Omega-3" and "Colloidal oatmeal & aloe vera" are shortened.
- UI labels: "Added to cart", "Chews + Balm + Drops", "Get the Itchy Skin Bundle", "Shop itchy skin" and "Shop now → poorly-pet.com".
- The cart flow is an illustration of shopping, not a real basket.

The video makes no diagnosis or cure claims, does not mention vets, AI or the scanner, and uses no fake urgency.

**Prices correct at time of making (1 Oct 2026); check before running the ad.**
