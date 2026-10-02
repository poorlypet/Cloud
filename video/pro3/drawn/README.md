# Drawn: photo-to-drawing IVDD film

A 9:16 film (1080x1920, 30 fps, 53 s) in the "real photo, then drawn" style. It opens on a real dachshund photo, a pen traces the dog over the photo, and the colour floods in. The drawn dog then explains IVDD.

| Time | Scene |
|---|---|
| 0–3 | The real photo, pinned as a polaroid. Headline: "Every sausage dog owner should know *this.*" Caption: "Real dog. Real beach." |
| 3–7 | "Let's *draw* it out." Traced pen lines draw over the photo, the photo fades to pencil grey, and the cartoon colour floods in. |
| 7–14 | The drawn dog hops out of the polaroid. "Dachshunds are built *long and low.*" The dog turns side-on, an arrow labelled "a long, long back" draws on, then "That long back puts pressure on the *spine.*" |
| 14–21 | The spine draws on inside the dog. A magnifier zooms in on the spinal cord and discs, and one disc bulges up into the cord. Headline: "A disc in the spine bulges or bursts and presses on the *cord.*" (IVDD tag). Then "Dachshunds, Bassets, Corgis and Beagles are most at risk, but any dog can get it." |
| 21–34 | "5 signs to watch for". Each sign gets a hand-drawn number, a doodle and a reaction from the dog: hunched back (pain marks), yelp when picked up (speech bubble), reluctant to jump or do the stairs (stairs), back legs that wobble or cross (wobble lines), back legs that suddenly stop working ("!"). |
| 34–46 | "What can *help.*" "Strict rest first, weeks of it." Then four products, each in a hand-drawn ring:<br>• Thermal Back Brace £54.99<br>• Lightweight Folding Dog Ramp £79.99<br>• Natural Calming Drops £13.99<br>• Flagline Harness with Handle £69.99 |
| 46–53 | "Find the right support for your dog's *IVDD.*" The drawn dog returns with doodled hearts. POORLY10 (10% off your first order), a "Shop poorly-pet.com" button pressed at 50.4 s, and "Free UK delivery over £39". |

## Assets (`assets/`)
- **Photos.** `photo.png` is the original photo. `photo-hd.jpg` is a 2x upscale of it (Higgsfield, ByteDance upscaler).
- **Illustrations (Higgsfield, Nano Banana Pro).** `cartoon-beach.png` redraws the photo in the same pose. `side.png` is the same character side-on.
- **`cartoon-wide.jpg`.** `cartoon-beach.png` widened by edge padding so it lines up with the photo's frame for the cross-over.
- **Cut-outs and pen lines.** `dog-front.png` and `dog-side.png` are cut-outs. `lines.js` and `lines-wide.json` hold the pen lines traced from the drawing's outline (centre lines). All are made by `tools/cutout.py` (OpenCV + scikit-image).

## Build
```
node render.mjs drawn --cues && python3 score.py drawn calm && node render.mjs drawn
```
Output: `out/poorly-pet-drawn.mp4` (-14 LUFS).

The copy and prices come from the IVDD film data. There are no vets, AI or bundles.
