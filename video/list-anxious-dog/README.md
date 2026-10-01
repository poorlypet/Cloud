# Poorly Pet: "5 things that calm an anxious dog"

`out/poorly-pet-5-anxious-dog.mp4` is the finished ad. It is 1080x1920 (9:16) at 30 fps and runs 29.03 s, with H.264 video and AAC audio at -14.0 LUFS integrated and a true peak of -1.6 dBTP.

**Style.** Bold kinetic captions. Full-bleed colour blocks flip on every item (deep green, mint, rust, paper). Giant Anton type carries an italic Fraunces accent word. Words pop in one at a time, karaoke captions light up word by word, and giant numbers slam down with a short frame kick. Bold shape wipes, diagonal split screens and staircase bars move between pages. Each product arrives as a white sticker card with an original SVG illustration that has a thick white die-cut outline. A row of 5 pills at the top fills as the list goes.

## Beats (124 BPM, beat = 0.484 s; bars start on beat 2, so every item lands on a downbeat)

| Time | Beats | What happens |
|---|---|---|
| 0–2.9 s | 0–6 | **Hook** (deep green). The title "5 THINGS THAT CALM AN *anxious* DOG" fills the safe area at 200–250 px from frame 0, with the "Save this for later" sticker and the three trigger chips. An impact plays on frame 0. "Fireworks." "Travel." "Being left alone." light up karaoke-style on the beat. The tracker shows 5 empty pills. |
| 2.9–6.8 s | 6–14 | **1 Calming SuperChews £19.95** (mint, diagonal wipe). The number slams, the name pops word by word, the card slaps on, the price drops, the caption "Help calm within 30 minutes" plays as karaoke, and a TOP RATED badge stamps on. |
| 6.8–10.6 s | 14–22 | **2 Lavender Calming Spray £10.99** (rust, diagonal split). "Calm and alert – never drowsy". CUSTOMER FAVOURITE badge. |
| 10.6–14.5 s | 22–30 | **3 A lick mat: Lickimat Slomo £12.99** (paper, staircase bars). "Licking is naturally soothing". FREEZER SAFE badge. |
| 14.5–18.4 s | 30–38 | **4 Pet Remedy Plug Diffuser £24.09** (deep green, push). "Lasts up to 8 weeks". COVERS UP TO 60m² badge. |
| 18.4–22.3 s | 38–46 | **5 Zesty Paws Calming Chews £24.00** (mint, reverse diagonal). "No sedative effect". BESTSELLER badge. A snare roll and riser build into the bundle. |
| 22.3–26.1 s | 46–54 | **Get the Anxiety Bundle** (rust, staircase bars). The card shows Calming Drops, Self-Heating Pad and Lavender Spray. £42.27 slams on, "was £46.97" is struck through, SAVE 10% stamps on, then ★★★★★ "…noticeably more settled…" (Kay). |
| 26.1–29.0 s | 54–60 | **Offer** (deep green, diagonal split; rhymes with frame 0, with all 5 pills now full). "10% OFF *your first order*", the coupon "USE CODE POORLY10" in Inter 800, Free UK delivery over £39, and "Shop now → poorly-pet.com", which is pressed at 27.10 s (click + chord). The Poorly Pet logo follows, and the end frame holds for 1.7 s. |

## Files

- `index.html` is the film. `renderFrame(t)` is a pure function of time. All motion uses the closed-form springs in `lib/motion.js`, with no CSS transitions, timers or randomness.
- `cues.js` holds the timeline, the on-screen content and the 92 sound cues. Both the film and the score read it.
- `audio/score.py` builds the music and sound effects into `audio/score.wav`, normalised to -14 LUFS. It prints each cue type's level over the music; every type is +7 dB or more.
- `render.mjs` renders `--stills a,b`, `--beats` (one frame per beat), or the full film muxed with the score.
- `fonts/` holds Anton, Inter (variable, 100–900) and Fraunces (normal and italic), all bundled locally.

Rebuild:
```
python3 audio/score.py
CHROMIUM_PATH=/path/to/chromium node render.mjs
```

## Content sources (all from DATA-PACK-2.md, "Anxiety / calm", unless noted)

| On screen | Source |
|---|---|
| Calming SuperChews, £19.95, "Help calm within 30 minutes", TOP RATED | "Calming SuperChews for Anxious Dogs - Natural Soft Chews: £19.95 (TOP RATED). Natural soft chews that help calm anxious dogs within 30 minutes." (shortened) |
| Lavender Calming Spray, £10.99, "Calm and alert – never drowsy", CUSTOMER FAVOURITE | "Calming Spray for Dogs - Lavender Stress & Anxiety Relief (250ml): £10.99 (CUSTOMER FAVOURITE)… 'Calm and alert - never drowsy.'" (name shortened; the hyphen is set as an en dash) |
| A lick mat / Lickimat Slomo, £12.99, "Licking is naturally soothing", FREEZER SAFE | "Lickimat Slomo Slow Feeder Lick Mat: £12.99. The natural, soothing act of licking can help ease anxiety…" and "Freezer, microwave and dishwasher safe." (both shortened) |
| Pet Remedy Plug Diffuser, £24.09, "Lasts up to 8 weeks", COVERS UP TO 60m² | "Pet Remedy Natural Calming Plug Diffuser With Oil 40ml: £24.09… Each unit lasts up to 8 weeks and covers up to 60m²." |
| Zesty Paws Calming Chews, £24.00, "No sedative effect", BESTSELLER | "Zesty Paws Calming Chews - Turkey: £24.00 (BESTSELLER)… without any sedative effect." |
| Anxiety Bundle £42.27, was £46.97, SAVE 10%; Calming Drops, Self-Heating Pad, Lavender Spray | "Anxiety Bundle: £42.27 (was £46.97, SAVE 10%)… It contains: Calming Drops, Self-Heating Pad, Lavender Calming Spray" |
| ★★★★★ "…noticeably more settled…", Kay, Anxiety Bundle | Kay, 5 stars, Anxiety Bundle: "…After around a week she seemed noticeably more settled…" (shortened with "…") |
| Fireworks. Travel. Being left alone. | "Common triggers named on product pages: fireworks, travel, separation" ("Being left alone" stands for separation) |
| 10% off your first order, POORLY10; Free UK delivery over £39 | DATA-PACK.md, "Store-wide offer and trust" |

Illustrative text (not claims): the title "5 things that calm an anxious dog", "Save this for later", "Get the Anxiety Bundle", "Use code", "Shop now → poorly-pet.com". The product drawings are original, simplified illustrations, not pack copies. No animals or people are drawn, and there is no mention of vets, AI or the scanner.

Prices correct at time of making (1 Oct 2026); check before running the ad.
