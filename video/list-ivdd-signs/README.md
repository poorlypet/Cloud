# 5 Signs Your Dog Has IVDD: listicle ad

`out/poorly-pet-5-signs-ivdd.mp4` is the finished ad. It is 1080x1920 (9:16) at 30 fps, runs 31.0 s, and has H.264 video with AAC audio. The audio measures -14.1 LUFS integrated with a true peak of -1.7 dBTP.

The style is a bold handwritten marker look on a bright off-white page. Big words are set in Permanent Marker, lines in Kalam 700, and prices, the coupon and the URL in Inter 800. Hand-drawn circles, underlines, arrows, ticks and doodles draw on with spring-driven SVG strokes and a light 8 fps line boil. A mint highlighter swipes behind key words, and the progress tracker is five hand-drawn boxes that get ticked off. There are no animals, no people and no screenshots.

## Beats (120 BPM, so 1 beat = 0.5 s)

| Time | What happens |
|---|---|
| 0–2 s | **Hook.** "5 SIGNS YOUR DOG HAS IVDD" is on screen from frame 0 at 175–230 px, and the circle round IVDD is already being drawn. The highlighter swipes SIGNS, then "Watch till #5" is written, and the five tracker boxes pop in and fly up to the top. |
| 2–19.5 s | **Five signs, 3.5 s each.** A giant scrawled numeral slams on the downbeat and gets circled, and the name slams in word by word (130–160 px). Then the doodle draws on, the highlighter swipes the key word, the plain line is written, the tracker box is ticked and the doodle's rust accent pops. Pages push right, up, right, up, then slam for #5. |
| 19.5–22 s | **What helps at home.** Strict rest, a back brace, ramps (no jumping) and a harness with a handle each tick in turn. A snare roll and riser build into the drop. |
| 22–25 s | **Get all of it.** The IVDD Bundle card slams in at £62.08, the was-price £68.98 is struck through, and a SAVE 10% stamp hits. The Folding Ramp (£79.99) and Balto® Body Lift (£120.00) cards then slam in, and the bundle price is circled. |
| 25–31 s | **Offer.** Danny's 4-star review is written out, the POORLY10 coupon is stamped, "Free UK delivery over £39" is ticked, and the "Shop the IVDD Bundle →" button pops in above poorly-pet.com. The button is pressed at 28.5 s with a click and a chord, then circled to echo the circled IVDD at frame 0. The end frame holds for 2.4 s. |

## Files

- `index.html`: the film. `renderFrame(t)` is a pure function of time and uses springs only (from `lib/motion.js`). Opening it in a browser gives a looping preview.
- `cues.js`: the timeline (`TL`) and 130 sound cues. Both the film and the score read it.
- `audio/score.py`: the music (C–G–Am–F four-on-the-floor with a pluck riff, a build at 21–22 s and a resolve at 28.5 s) and every cue sound, including marker scribbles, highlighter swipes, slams, ticks, stamps, price dings and the click + chord. It also prints each cue type's peak over the music. The worst case is +6.0 dB, for the highlighter swipe.
- `render.mjs`: `--beats`, `--stills a,b` or a full render muxed with `audio/score.wav`.
- `fonts/`: Permanent Marker, Kalam 700 (both Google Fonts, latin subset) and Inter.

Rebuild with `python3 audio/score.py`, then `CHROMIUM_PATH=/path/to/chromium node render.mjs`. This needs playwright-core and ffmpeg-static.

## Content sources (DATA-PACK.md, live site 1 Oct 2026)

| On screen | Source |
|---|---|
| A hunched back / A yelp when picked up / Won't jump or do the stairs / Back legs that wobble or cross / Back legs that suddenly stop working | IVDD "Signs": "A hunched back. A yelp when picked up. Reluctant to jump or do the stairs. Back legs that wobble, cross, or suddenly stop working." (#3 is reworded to "Won't jump", which matches the collection chip "Won't jump".) |
| What helps at home: Strict rest, A back brace, Ramps (no jumping), A harness with a handle | IVDD "At home": "Strict rest first… A back brace…, ramps so there is no jumping…, and a harness with a handle…" (shortened) |
| IVDD Bundle £62.08, was £68.98, SAVE 10% | IVDD Bundle listing |
| Thermal Back Brace + Calming Drops | Bundle contents: "Thermal Back Brace plus Natural Calming Drops" (shortened) |
| Folding Ramp £79.99 | "Lightweight Folding Dog Ramp - 75kg Capacity, 151cm: £79.99" (name shortened) |
| Balto® Body Lift £120.00 | "Balto® Body Lift – Body Harness with Handles: £120.00" (name shortened) |
| "Was really pleased to see an IVDD bundle as the products add up when you buy them separate", Danny, 4/5 | Danny, 4 stars, IVDD Bundle (verbatim) |
| 10% off your first order, POORLY10 | Store-wide offer |
| Free UK delivery over £39 | Store-wide offer |
| poorly-pet.com, the Poorly Pet mark | Brand |

**Not verbatim from the data pack:** each sign's one-line description is plain wording written for this ad. The lines describe what you would notice and give no medical advice:
1. "Their back arches up like a bridge."
2. "A sudden cry the moment you lift them."
3. "They hang back at the sofa, car or steps."
4. "Unsteady steps, or paws that cross over."
5. "Back legs drag, or won't hold them up."

The ad also uses these phrases of its own: "Watch till #5", "Get all of it", "What helps at home", "Shop the IVDD Bundle →", "Danny, on the IVDD Bundle", and "YELP!" in the speech-burst doodle. The product drawings are original, simplified illustrations: a brace, a dropper bottle, a ramp and a harness with handles.

There are no vets, no AI or scanner, no diagnosis or cure claims and no fake urgency.

Prices correct at time of making (1 Oct 2026); check before running the ad.
