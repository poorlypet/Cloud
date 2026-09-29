# IVDD: 5 signs to know (video)

A 17-second vertical (1080x1920, 30fps) hand-drawn explainer: five signs of IVDD, what helps (strict rest, back brace, ramp, lift harness), and a Poorly Pet end card.

- `ivdd-signs.mp4`: the rendered video
- `index.html`: the animation. Open it in a browser to watch a live, looping preview. Every frame is drawn from `renderFrame(t)`, so the output is deterministic.
- `render.mjs`: renders `index.html` to MP4 frame by frame
- `fonts/`: Caveat, Domine and Figtree, bundled so renders don't depend on the network

## Re-render

```
npm i playwright-core ffmpeg-static
CHROMIUM_PATH=/path/to/chromium node render.mjs            # writes ivdd-signs.mp4
CHROMIUM_PATH=/path/to/chromium node render.mjs --stills 3,9  # PNG stills at 3s and 9s
```

Copy lives in the HTML (titles, sub-lines, card labels). Timings are in the `scene(...)` calls.
