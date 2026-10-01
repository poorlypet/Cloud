# Poorly Pet: three films in the new brand style (no logo)

| File | Film | Format |
|---|---|---|
| `out/poorly-pet-ivdd.mp4` | 5 signs of IVDD and what can help | 1080x1920 (9:16), 54 s |
| `out/poorly-pet-richmond.mp4` | Richmond’s story, from kay D’s 5-star review of the Knee Brace for Dogs | 1080x1920 (9:16), 38 s |
| `out/poorly-pet-brand.mp4` | Brand intro for an Instagram feed post | 1080x1350 (4:5), 21 s |

All three are 30 fps with AAC audio at -14 LUFS. The style follows the new website (branch `claude/amazing-wright-9e1jru`):
- white and pale backgrounds with teal panels;
- lime highlight words;
- Domine headings with Figtree body text.

## Build
```
node render.mjs <ivdd|richmond|brand> --cues && python3 score.py <film> <calm|story|hype> && node render.mjs <film>
```
Frames are captured at 60 fps and each pair is blended into one 30 fps frame (motion blur). `shared/kit.js` holds the GSAP timeline helpers, the ambient shapes and the marquee. Packshots are the store's 1500px images from the Shopify CDN, cropped tight.

## Sources
- **IVDD copy** (signs, what it is, at-risk breeds, "Strict rest first, weeks of it", the at-home list) is from the site's IVDD page.
- **IVDD products:**
  - Thermal Back Brace £54.99
  - Lightweight Folding Dog Ramp £79.99
  - Natural Calming Drops £13.99 (Pets Purest)
  - Flagline Harness with Handle £69.99 (Ruffwear)
- **Richmond's story** quotes the real Judge.me review by kay D (5★), "Just what my Richmond needed", left on the Knee Brace for Dogs (£34.99, Ortocanis). It quotes these parts, verbatim apart from capitalising "Richmond":
  - "My old boy richmond needed some extra support"
  - "He seems happier and more comfortable in the space of 3 months"
  - "from him getting off the sofa in pain to running up the garden"
- **The knee-brace image** is the store's own product photo, which shows a dog wearing the brace. It is not Richmond.
- **Brand intro facts** are from the new site:
  - 4.6 from 99 reviews on Judge.me;
  - free UK delivery over £39;
  - ordered before 2pm, packed the same working day;
  - 5 points for every £1 in the Poorly Pet Club;
  - POORLY10 for 10% off the first order.

Prices correct at time of making (1 Oct 2026); check before running the ads.
