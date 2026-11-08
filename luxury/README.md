# Axel & Hound: header, mega menu and video hero

Open `index.html` (served locally, for example `python3 -m http.server` in this folder).

- `basket/`: five basket designs on version K (the chosen header). Each opens its basket on load.
- `round-4/`: chosen direction is K. K to O, black and white, New In mega with four photo tiles, store intro in the hero.
- `round-3/`: F to J, built on A and C. Search, account, saved and basket all open working panels; add `#search`, `#basket`, `#account` or `#saved` to a URL to open one directly.
- `round-2/`: A to E, each with a different display and body pairing.
  A, C and E have the menu transparent over the film, turning white on hover, when a menu opens and on scroll.
- `version-1.html` to `version-5.html`: round 1 (DM Mono body).
- `css/r2.css` and `js/r2.js` drive round 2. The menu content (categories, links, images,
  prices) is the `MENU` list at the top of `js/r2.js`.

## Swapping the hero film
Replace these files, keeping the names:
- `media/dachshund-1080.mp4`: 1920×1080, H.264, no audio, under about 6 MB
- `media/dachshund-mobile.mp4`: 4:5 crop for phones (864×1080 or 1080×1350)
- `media/dachshund-poster.jpg`: first frame, shown while the film loads

Mega-menu photos are placeholders (stills from the film plus stock). Swap them for product
photography in the `IMG` list in `js/r2.js`.
