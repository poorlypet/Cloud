# Itchy skin guide III: more content, the about-Poorly-Pet end page, and a centred grid

`out/poorly-pet-itchy-skin-guide-3.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 61 s, H.264 with AAC audio at -14 LUFS (true peak -2.2 dBTP).

## What changed from II
- **Alignment.** The content column is now x 120–960, with equal 120 px margins and the centre axis at 540. In II the column was 88–940, so every "centred" element sat 26 px left of the frame centre. `align.mjs` (in the scratchpad kit) measured every settled screen against the 120 / 960 / 540 grid.
- **More content:**
  - a new teaching screen with the site's own 3-part routine (inside, outside, and a flea routine underneath it all) and a week track for "Most dogs settle in two to three weeks";
  - Itch Relief Chews (£29.99, best seller, £25.49 on subscribe) next to the salmon oil on the "inside" screen;
  - a second real review.
- **New last page** on the homepage-hero cream (#FAF9F6). It explains who Poorly Pet is:
  - "The UK's pet health & recovery specialist";
  - "Find the right support for your dog's…", with "itchy skin" typed out as on the homepage;
  - 25 conditions across 8 care areas, and the brands stocked;
  - the 4.6/5 rating, free UK delivery over £39 and the 30-day guarantee;
  - then the POORLY10 ticket and the "Shop itchy skin →" button, which is pressed at 58.9 s;
  - beneath it, the four products standing on one floor, and the homepage's deep-green band of scrolling conditions.
- The product screens use a warm cream studio light instead of cool grey.

## Screens

| Time | Screen |
|---|---|
| 0–5 s | Hook (deep green): "Scratching *all night?*" |
| 5–11 s | What's going on: an over-reaction to something ordinary (orbiting triggers) |
| 11–17 s | Why it gets worse: the itch cycle on repeat (circle reveal) |
| 17–23 s | Signs: four numbered cards |
| 23–29 s | What helps: a simple 3-part routine, and "Most dogs settle in two to three weeks" |
| 29–35.5 s | 1 of 3, from the inside: Scottish Salmon Oil £9.99 + Itch Relief Chews £29.99 |
| 35.5–41.5 s | 2 of 3, on the outside: Itch Relief Skin Balm £9.99 (£8.49 on subscribe) |
| 41.5–47.5 s | 3 of 3, hot spots: Hot Spot & Itch Spray £12.99 |
| 47.5–52.5 s | What owners say: the rating counts up to 4.6/5, with reviews from Amie F. and Sheena W. |
| 52.5–61 s | About Poorly Pet + offer (cream). The button is pressed at 58.9 s and the end frame holds for 2 s. |

## Files
- `index.html` is the film, with `renderFrame(t)` as a pure function of time. The end page has its own local clock (`endLayout`/`endFrame`, ids prefixed `e-`). It was built from the winning design-panel prototype, "end-A-hero".
- `cues.js` holds the sound cues.
- `audio/score.py` builds the calm 84 BPM score. It includes typing keys for the typed word, a stamp for the ticket, a chime, and a button click with a chord. Each cue type sits at least +5 dB over the music.
- `render.mjs` renders stills, beats or the full film.
- `assets/` holds the cut-out packshots: salmon, chews, balm (with the small inset dog photo removed from the box image) and spray.

## Content sources (data pack, live site pulled 1 Oct 2026)
These are as in II, plus:
- **Routine:** "Omega 3 every day to calm the skin from inside. A gentle wash and a balm on the outside. A flea routine underneath it all. Most dogs settle in two to three weeks." This is the itchy skin condition page, verbatim.
- **Itch Relief Chews:** £29.99, BEST SELLER, £25.49 on subscribe & save, "A simple daily chew", made in the UK. Product page.
- **Sheena W., 4★, Itch & Allergy drops:** "it seems like it's soothing on the skin for her…" Judge.me, a shortened verbatim excerpt.
- **About Poorly Pet:**
  - the UK's pet health & recovery specialist;
  - 25 conditions across 8 care areas;
  - brands stocked, including Balto, Ruffwear and Zesty Paws;
  - 4.6/5 from 101 verified reviews;
  - free UK delivery over £39;
  - 30-day guarantee.
  These come from the site's shop-by-condition page, brand list and footer.

Prices correct at time of making (1 Oct 2026); check before running the ad.
