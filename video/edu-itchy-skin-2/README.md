# Itchy skin guide II: a more premium version, no bundle

`out/poorly-pet-itchy-skin-guide-2.mp4` is the finished ad: 1080x1920 (9:16), 30 fps, 59 s, H.264 with AAC audio at -14 LUFS (true peak -2.5 dBTP).

It uses the same calm, one-idea-per-screen structure as `../edu-itchy-skin`. The bundle is gone, and the film is built to look more premium:
- **Product screens:** real packshots on a soft studio backdrop, with a gentle float, a floor shadow and a light band that sweeps across the product. Callout labels with drawn leader lines point at each one. A giant outlined step number sits behind in parallax.
- **Transitions:** sideways slides between the three products, and circle reveals that grow out of the previous screen's focal point.
- **Live diagrams:** the four triggers orbit "Itchy skin", and a dot keeps travelling round the itch cycle.
- **Proof:** the 4.6/5 rating counts up as the stars fill.
- **Ending:** all three products lined up together on the offer screen.

## Screens

| Time | Screen |
|---|---|
| 0–5.5 s | HOOK (deep green). "Scratching *all night?*" is on screen at frame 0. Rust scratch marks keep scratching. "Here's what's going on, and 3 things that help." |
| 5.5–12 s | WHAT'S GOING ON. "It's an over-reaction to something *ordinary.*" Pollen, Grass, Dust mites and A food orbit an "Itchy skin" circle. |
| 12–18 s | WHY IT GETS WORSE (circle reveal). "Then it goes *round and round.*" Skin gets inflamed → your dog scratches → it gets worse, with "on repeat" in the centre and a dot circling. "Break it from the inside and the outside." |
| 18–24.5 s | SIGNS. "Sound *familiar?*" Four numbered cards slide in and tick. "Here are 3 things that help." |
| 24.5–30.75 s | 1 OF 3 · FROM THE INSIDE. "Calm the skin from the *inside.*" Scottish Salmon Oil, £9.99, BEST SELLER. Callouts: Rich in Omega-3, Reduces dryness, Boosts shine. |
| 30.75–37 s | 2 OF 3 · ON THE OUTSIDE. "Soothe the *sore patches.*" Itch Relief Skin Balm, £9.99, £8.49 on subscribe. Callouts: Soothes redness, Chamomile, Hydrates dry skin. |
| 37–43.25 s | 3 OF 3 · HOT SPOTS. "Spray it, *leave it.*" Hot Spot & Itch Spray, £12.99. Callouts: No steroids, No rinse, Fast relief from itching. |
| 43.25–49.5 s | PUTTING IT TOGETHER (circle reveal). "Most dogs settle in *two to three weeks.*" Salmon oil: every day. Skin balm: on sore, red patches. Hot spot spray: spray on and leave. A Week 1–3 track fills. |
| 49.5–53.75 s | WHAT OWNERS SAY. The rating counts up to 4.6/5 and the stars fill, with "from 101 verified reviews" and Amie F.'s review. |
| 53.75–59 s | OFFER (circle reveal). The three products are lined up together, with "10% off your *first order.*" The POORLY10 coupon follows, with "Free UK delivery over £39 · 30-day guarantee". The "Shop itchy skin →" button is pressed at 57.0 s, and the end card holds for 2 s. |

## Files

- `index.html` is the film. `renderFrame(t)` draws any moment from the time alone. Products are set in the `PRODUCTS` table (copy, price, badge, callout positions). Packshots are drawn to canvases so the light sweep only touches the product.
- `cues.js` holds every sound cue in seconds.
- `audio/score.py` builds `audio/score.wav`, a calm 84 BPM bed. Each cue type (whoosh, circle reveal, product lift, shimmer, price ding, ticks, counter, button click) is auto-balanced to sit at least +5 dB over the music.
- `render.mjs` renders stills (`--stills 1,4.5`), half-second beats (`--beats`), or the full film.
- `assets/` holds the cut-out packshots for salmon oil, the balm (a small dog photo in the corner of the original box image was removed) and the spray.

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
| Over-reaction to something ordinary; pollen, grass, dust mites, a food; inflamed → scratches → worse | Itchy skin condition page |
| The four signs | Itchy skin condition page |
| From the inside / on the outside; "Most dogs settle in two to three weeks." | Condition page, "What helps" |
| Scottish Salmon Oil £9.99, BEST SELLER, 100% natural, no additives, rich in Omega-3, "Reduces dryness and boosts natural shine" | Product page (shortened) |
| Itch Relief Skin Balm £9.99, £8.49 on subscribe, 60ml, natural & organic, chamomile, "Soothes redness, hydrates dry skin", "soothes sore, red patches" | Balm product page and the bundle's balm line (shortened) |
| Hot Spot & Itch Spray £12.99, 250ml, "Fast relief from hot spots, itching…", no steroids, no rinse, "Spray on and leave", gentle on sensitive skin | Product page (shortened) |
| 4.6/5 from 101 verified reviews | Judge.me site total |
| "…my dogs skin is so much better, less flaky which means less itching" (Amie F., 4 stars) | Judge.me review, verbatim excerpt |
| 10% off your first order with code POORLY10; free UK delivery over £39; 30-day guarantee | Site-wide offers |

These lines are my own framing rather than site copy:
- "Scratching all night?"
- "Here's what's going on, and 3 things that help."
- "Then it goes round and round."
- "on repeat"
- "Break it from the inside and the outside."
- "Sound familiar?"
- "Calm the skin from the inside."
- "Soothe the sore patches."
- "Spray it, leave it."
- "Putting it together"
- "What owners say"
- "Shop itchy skin →"

Prices correct at time of making (1 Oct 2026); check before running the ad.
