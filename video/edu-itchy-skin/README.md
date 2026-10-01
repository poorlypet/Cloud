# Itchy skin: a calm, educational guide that sells

`out/poorly-pet-itchy-skin-guide.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 56 s, H.264 with AAC audio at -14 LUFS.

The approach: one idea per screen, each held about 6 s, on a strict grid. The content column is 852 px wide (x 88–940). Every screen uses the same type scale:
- a 30 px caps eyebrow;
- a 104–128 px Fraunces headline;
- 46 px Inter body text.

The first half teaches what's going on with itchy skin. The second half sells the products that help, using **real packshots** from poorly-pet.com, cut out and placed on a pale stage with a price card. There are no website screenshots and no drawn animals, and nothing mentions vets, AI or the scanner.

## Screens

| Time | Screen |
|---|---|
| 0–5 s | HOOK (deep green). "Why won't my dog stop *scratching?*" is fully on screen at frame 0, with three rust scratch marks drawing on and "Here's what's going on, and what actually helps." |
| 5–11 s | WHAT'S GOING ON. "It's usually an *over-reaction* to something ordinary." Four cards: Pollen, Grass, Dust mites, A food. |
| 11–17 s | WHY IT GETS WORSE. "Then it turns into a *cycle.*" Skin gets inflamed → your dog scratches → scratching makes it worse, joined by drawn arrows. "Break it from the inside and the outside." |
| 17–23 s | SIGNS. "Sound *familiar?*" Four rows tick in: scratching that wakes them at night, one paw licked rusty brown, pink skin on the belly and armpits, flakes on the bed. |
| 23–29.5 s | WHAT HELPS 1 OF 3. "Calm the skin from the *inside.*" Scottish Salmon Oil, £9.99, BEST SELLER. |
| 29.5–36 s | WHAT HELPS 2 OF 3. "Soothe the *sore spots.*" Itch Relief Skin Balm, £9.99, from £8.49 on subscribe. |
| 36–42 s | WHAT HELPS 3 OF 3. "Hot spots? *Spray and leave.*" Hot Spot & Itch Spray, £12.99. |
| 42–48 s | BUNDLE (deep green). "Inside *and* out, in one bundle." "Most dogs settle in two to three weeks." Itchy Skin Bundle £48.57, ~~£53.97~~, SAVE 10%. |
| 48–56 s | PROOF + OFFER. The page shows 4.6/5 stars "from 101 verified reviews" and Amie F.'s review. A coupon card reads "10% off your first order" with the code POORLY10, followed by "Free UK delivery over £39 · 30-day guarantee". The "Shop itchy skin →" button is pressed at 53.6 s. The end frame holds for 2.4 s. |

A thin progress bar at the top fills across the whole film.

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Opening the file in a browser plays a looping preview. The three product screens are built from one template, using the `data-*` attributes on each `section.tip`.
- `cues.js` holds every sound cue in seconds, matched to the `data-in` times in the film.
- `lib/motion.js` holds the closed-form springs. All motion uses springs.
- `audio/score.py` builds `audio/score.wav`. It is a calm 84 BPM bed (Fmaj9–Am7–Dm9–Bbmaj9):
  - soft piano and pad;
  - a gentle kick, shaker and sub from 5 s;
  - an 8th pluck under the products;
  - a brighter pad for the bundle;
  - a held chord when the button is pressed.

  Each cue type is auto-balanced to sit at least +5 dB over the music.
- `render.mjs` renders stills (`--stills 1,4.5`), one frame per half-second (`--beats`), or the full film muxed with the score.
- `assets/` holds the product packshots, cut out with transparent backgrounds:
  - `salmon.png`: Pets Purest Scottish Salmon Oil.
  - `balm.png`: DOGSLIFE Itch Relief Skin Balm. A small photo of a dog in the corner of the box was removed.
  - `spray.png`: Hot Spot & Itch Relief Spray.
  - `bundle.png`: the site's Itchy Skin Bundle image.
- `fonts/` holds Fraunces and Inter, bundled locally. POORLY10 is set in Inter 800.

## Rebuild

```
npm i playwright-core ffmpeg-static
pip install numpy scipy soundfile pyloudnorm
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content sources (data pack, live site pulled 1 Oct 2026)

| On screen | Source |
|---|---|
| Over-reaction to something ordinary; pollen, grass, dust mites, a food; the scratching makes it worse | Itchy skin condition page |
| The four signs | Itchy skin condition page |
| "Inside" / "outside", "Most dogs settle in two to three weeks." | Condition page, "What helps" |
| Scottish Salmon Oil £9.99, BEST SELLER, "100% natural", "Rich in Omega-3", "Reduces dryness and boosts shine" | Product page (name shortened) |
| Itch Relief Skin Balm £9.99, £8.49 on subscribe, 60ml, natural & organic, "Chamomile… balm soothes sore, red patches on contact" | Balm product page and the bundle's balm line (shortened) |
| Hot Spot & Itch Spray £12.99, 250ml, "Fast relief from hot spots, itching, and skin irritation", no steroids, no rinse, "Spray on and leave" | Product page (shortened) |
| Itchy Skin Bundle £48.57, was £53.97, SAVE 10%; chews, drops, balm | Bundle page |
| 4.6/5 from 101 verified reviews | Judge.me site total |
| "…my dogs skin is so much better, less flaky which means less itching" (Amie F., 4 stars, Oatmeal Shampoo) | Judge.me review, verbatim excerpt |
| 10% off your first order with code POORLY10; free UK delivery over £39; 30-day guarantee | Site-wide offers |

These lines are my own framing rather than site copy:
- "Why won't my dog stop scratching?"
- "Here's what's going on, and what actually helps."
- "Then it turns into a cycle."
- "Break it from the inside and the outside."
- "Sound familiar?"
- "Calm the skin from the inside." (close to the site's "calm the skin from inside")
- "Soothe the sore spots."
- "Hot spots? Spray and leave."
- "Inside and out, in one bundle."
- "Shop itchy skin →"

Prices correct at time of making (1 Oct 2026); check before running the ad.
