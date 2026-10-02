# Drawn condition films

Five 9:16 films (1080x1920, 30 fps, 53 s, -14 LUFS) in the "real photo, then drawn" style, one per condition:

| Film | Dog | Hook | Output |
|---|---|---|---|
| `d-arthritis` | Labrador | Slowing down isn't just *old age.* | `out/poorly-pet-d-arthritis.mp4` |
| `d-itchy` | Pointer puppy | Scratching *all night?* | `out/poorly-pet-d-itchy.mp4` |
| `d-anxiety` | Cockapoo | What happens when you *leave?* | `out/poorly-pet-d-anxiety.mp4` |
| `d-dental` | Staffy | That breath *isn't normal.* | `out/poorly-pet-d-dental.mp4` |
| `d-digestive` | Golden Retriever | Tummy trouble, *again?* | `out/poorly-pet-d-digestive.mp4` |

`drawn/` is the original IVDD film (dachshund).

## Shared structure
1. **0–7 s.** The real photo in a polaroid, then "Let's *draw* it out." The pen traces the dog's outline over the photo, the photo fades to pencil grey, and the cartoon colour floods in.
2. **7–14 s.** The drawn dog hops in, the condition is introduced, and condition doodles play: glowing joints, allergen arrows, a worried thought bubble, smell lines, a tummy rumble.
3. **14–21 s.** An explainer:
   - Arthritis: a magnifier on the hip, with the cushioning wearing thin.
   - Itchy skin: the itch, scratch, sore skin loop.
   - Anxiety: a heartbeat line spiking with fireworks, travel, separation and routine changes, then settling.
   - Dental: a magnifier on a tooth as tartar builds, then a brush cleans it.
   - Digestive: a drawn gut, then good bacteria taking over.
4. **21–34 s.** Five signs. Each gets a hand-drawn number, a doodle and a reaction from the dog.
5. **34–46 s.** "What can *help.*" A handwritten tip, then four products in hand-drawn rings with prices.
6. **46–53 s.** The happy pose, POORLY10, the "Shop poorly-pet.com" button (pressed at 50.4 s) and "Free UK delivery over £39".

## How it's built
- `shared/drawn.js` is the film engine: timeline, doodle library, dog reactions and explainers. `shared/drawn.css` holds the styles. `shared/mkdrawn.py` holds all five configs (copy, doodles, layout) and writes each `d-*/index.html`.
- `drawn5/prep.py` takes each photo and its drawings and produces:
  - the photo aligned to the drawing (OpenCV ECC);
  - the pen lines, traced from the drawing with a black-hat filter, skeletonised and turned into paths;
  - cut-outs of the poses on white.

  Its outputs are copied into `d-*/assets/`.
- **Drawings.** Made with Canva's image generator from the photos you supplied. Each dog has three images: a redraw of the photo, a pose for the explainer and a happy pose for the end.
  - The full-size files were exported through a scratch Canva design called "Poorly Pet asset canvas", which can be deleted.
  - The raw exports are in `drawn5/raw/`.
- **Copy and prices.** Taken from the condition film configs (`arthritis/`, `itchy/`, `anxiety/`, `dental/`, `digestive/`).
- **What isn't mentioned.** No vets, AI or bundles.

**Build:** `node render.mjs d-<film> --cues && python3 score.py d-<film> calm && node render.mjs d-<film>`

**Check before running.** The photos must be cleared for advertising. The Labrador photo carries a Pets4Homes watermark and should be replaced with a photo you own. Prices are as of 2 Oct 2026.
