# Itchy skin film: new branding and old branding

One storyboard rendered in two brand themes:

| File | Brand |
|---|---|
| `out/poorly-pet-itchy-skin-new-brand.mp4` | New website (branch `claude/amazing-wright-9e1jru`): teal #0F4C48, lime #DFE43A, Domine + Figtree, "poorlypet" wordmark |
| `out/poorly-pet-itchy-skin-old-brand.mp4` | Current live site: deep green #0B2A23, mint #9FE8C9, rust, cream #FAF9F6, Fraunces + Inter, rust plus mark |

Both files are 1080x1920 (9:16), 30 fps and 58 s, with AAC audio at -14 LUFS.

## How this differs from the earlier versions
- **Animation engine.** GSAP 3 timelines (custom expo easing, SplitText line masks, DrawSVG) are seeked frame by frame, so every frame is still a pure function of time.
- **Real motion blur.** Frames are captured at 60 fps and each pair is blended into one 30 fps frame (ffmpeg `tmix`), giving a 360° shutter.
- **Products staged properly.** Each packshot stands on a lit plinth or studio floor with contact shadows, at true relative size (500ml bottle > 250ml spray > tub > balm). Products drop in and settle with squash-and-settle physics, and a light band sweeps across the product pixels only.
- **Transitions:**
  - S1 → S2: the claw marks tear open into the next scene.
  - S2 → S3: the allergen card grows and a dark circle opens from the word.
  - S3 → S4: a zoom through the centre of the itch loop.
  - S4 → S5: the 3D sign cards fly out.
  - S5 → S6a: the "Inside" card grows to full screen, and the salmon bottle carries through to its place on the plinth.
  - Between products: whip pans with a directional SVG blur.
  - S6c → S7: a mist wash.
  - S7 → S8: the end page rises as a sheet.
- **Spray.** At the press, a mist of droplets with motion streaks leaves the nozzle.
- **Alignment and type.** Headlines auto-fit the 120–960 column. Camera pushes are capped so the column holds. Fraunces is set to readable optical sizes in the old theme.
- **Review panel.** Three independent reviewers (an art director for each brand, plus a copy and compliance check) audited the frames. Their blocking issues were fixed before the final render.

## Scenes (s)

| Time | Scene |
|---|---|
| 0–4.9 | Hook: "Scratching *all night?*" Claw marks rip the headline, and the four products land on a plinth. |
| 4.9–11.3 | "An over-reaction to something *ordinary.*" Pollen, Grass, Dust mites and A food roll through the card. |
| 11.3–17.4 | "Then it turns into a *loop.*" A rotating ring reads: skin gets inflamed · your dog scratches · the scratching makes it worse, with "on repeat" in the centre. |
| 17.4–23.3 | "Sound *familiar?*" Four sign cards deal in in 3D and tick. |
| 23.3–29.2 | "What actually *helps.*" Inside: Omega 3 every day. Outside: a gentle wash and a balm. A flea routine underneath it all. Most dogs settle in 2–3 weeks. |
| 29.2–34.6 | "Calm the skin from the *inside.*" Scottish Salmon Oil £9.99 (best seller) and Itch Relief Chews £29.99 (made in the UK). |
| 34.6–40.4 | "Soothe the *sore bits.*" Itch Relief Skin Balm £9.99, £8.49 on subscribe. Callouts: natural & organic, chamomile, soothes redness. |
| 40.4–46.4 | "Hot spots? *Spray. Leave.*" Hot Spot & Itch Relief Spray 250ml £12.99. No steroids · no rinse · gentle on sensitive skin. |
| 46.4–51.2 | The rating counts up to 4.6/5. New brand: "from 99 reviews on Judge.me". Old brand: "from 101 verified reviews". Two verified reviews follow. |
| 51.2–58 | "Find the right support for your dog's *itchy skin.*" with "The UK's pet health & recovery specialist" and all four products on the plinth. POORLY10 (10% off your first order) and the "Shop itchy skin →" button, which is pressed at 56.0 s. Trust lines: new brand "Free UK delivery over £39 / Ordered before 2pm, packed the same working day"; old brand "Free UK delivery over £39 · 30-day guarantee / Subscribe & save up to 15%". |

## Build

```
npm i playwright-core ffmpeg-static gsap   # copy gsap.min.js, SplitText, CustomEase and DrawSVGPlugin into lib/
pip install numpy scipy soundfile pyloudnorm
node render.mjs --theme new --cues && python3 audio/score.py new && node render.mjs --theme new
node render.mjs --theme old --cues && python3 audio/score.py old && node render.mjs --theme old
```

`node render.mjs --theme new --stills 3,8.5` renders PNG stills to `stills/<theme>/`.

## Content sources
- **Itchy skin copy.** Cause, signs and "what helps" are verbatim from the itchy skin page on both sites (the new site's "Ask us about itchy skin" panel uses the same words).
- **Prices and badges.** From the data pack and the new site's product data: Scottish Salmon Oil £9.99 (best seller), Itch Relief Chews £29.99 (made in the UK), Itch Relief Skin Balm £9.99 / £8.49 on subscribe & save, Hot Spot & Itch Relief Spray 250ml £12.99.
- **Reviews.** Verbatim and shortened with "…": Amie F. (4★) "…my dogs skin is so much better, less flaky which means less itching", and John C. (5★) "…finding the right support was overwhelming, but Poorly Pet made it so much easier."
- **Rating.**
  - New site footer: "4.6 out of 5 from 99 reviews on Judge.me".
  - Old site: "4.6/5 from 101 verified reviews".
- **Delivery.**
  - New site: "Ordered before 2pm, picked and packed the same working day".
  - Both sites: free UK delivery over £39 and POORLY10.
- **What isn't mentioned.** No vets, AI, scanner or bundles. No drawn animals.

Prices correct at time of making (1 Oct 2026); check before running the ad.
