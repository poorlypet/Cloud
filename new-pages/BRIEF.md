# Brief for new Poorly Pet pages

Poorly Pet (poorly-pet.com) is a UK online retailer of dog health, recovery and mobility products
(73 brands, ~630 products). Every new page must look like it belongs next to the signed-off pages.

## Where things are
- `signed-off/*.html` : saved signed-off pages (homepage, shop by condition/symptom/product, product page,
  advice listing, article, all brands). Read them for markup patterns, copy tone and real data.
- `css/home.css` (copy at `new-pages/css/home.css`) : the full design system. Reuse its classes
  (`.wrap`, `.sec-h`, `.btn`, `.btn.sec`, `.stars`, `.pk` product card, `em` serif highlight, etc.).
- `new-pages/_shell.html` : the page shell (utility bar, header, nav, footer). Placeholders:
  `{{TITLE}}`, `{{CSS}}`, `{{MAIN}}`, `{{JS}}`. Copy it for every page and replace the placeholders.
  `shell.js` already handles the mega menus.

## Design tokens (from home.css, do not invent new brand colours)
- `--teal:#0F4C48` `--deep:#0A3A37` `--lime:#DFE43A` `--lime2:#D2D82C` `--coral:#F0614A`
- `--ink:#0E2A28` `--mute:#5B6B69` `--mist:#F2F4F3` `--line:#E3E8E6` `--line2:#C6D0CE`
- pale greens used in sections: `#E4EED6`, `--pale:#F3F6F1`, `--pale2:#EAF0E6`; star gold `--gold:#F2B418`
- `--sans`: Figtree. `--serif`: Domine. Headings are Domine; the highlighted word in a heading is
  `<em>` (Domine bold, teal on light, lime on teal). Example: `<h2>Rated <em>Excellent</em> by pet parents</h2>`
- Radii `--r:8px` `--rp:16px` `--rl:24px`. Gutter 24px (16px mobile). Max width 1440px.
- Buttons: `.btn` = lime background, teal text. `.btn.sec` = teal background, white text. Min height 48px.
- Section header pattern: `<div class="sec-h"><div><h2>..</h2><p>..</p></div><div class="sec-r"><a class="all" href="#">Link ›</a></div></div>`
- Page intro pattern (see shop-by-condition.html `c3-intro`): big Domine H1 with an `<em>` word, one plain
  sentence, help cards to the side ("Is it urgent? Sudden weakness, collapse or severe pain is a vet visit, not a basket.").
- Photos are placeholders (`data-photo` spans with a flat tint); keep that approach, no stock images.

## Tone of voice
Plain, short, British English, warm but not cute. Real people. "Real people, not a chatbot."
Always cautious on health: nothing replaces a vet; say clearly when something is a vet job today.

## Versions
Each page gets three genuinely different versions A, B, C (different layout concept, not recolours).
Put a version switcher at the top of `<main>`, reusing the existing preview bar markup:
`<div class="wrap pvbar"><span class="cardsw pvp" aria-label="Versions"><span>Dog health quiz</span><a href="dog-health-quiz-a.html" class="on">A</a><a href="dog-health-quiz-b.html">B</a><a href="dog-health-quiz-c.html">C</a></span></div>`

## Files
For page slug `X`: `new-pages/X-a.html`, `X-b.html`, `X-c.html`, plus one `new-pages/X.css` and one
`new-pages/X.js` shared by the three (prefix every class with a short page prefix to avoid clashes with home.css).
All links to other site pages can be `#`, except links between the new pages themselves.
No external requests except Google Fonts (already in the shell). Everything must work opened as local files.
Must work at 390px phone width and 1440px desktop; no horizontal scroll.

## Round 2 feedback from the owner (these override anything above)
- Commercial first. Pages exist to help owners find the right products and buy. Do NOT push people
  away from ordering. No "Is it urgent?" boxes, no "vet today" banners, no traffic-light urgency,
  no emergency panels, anywhere. At most one short, calm line near the footer area of the page
  content such as "Our guides don't replace your vet." (the site footer already has the legal line).
- No drawn/SVG dogs or body-part selectors. No clip-art.
- Simpler, cleaner, better UI/UX: fewer elements per screen, generous spacing, one clear primary
  action per step, big tappable targets, obvious next step. Less text. Nothing cluttered.
- Real products with real photos and prices, from `new-pages/products.js` and `new-pages/img/`
  (built by the catalogue step; read the header comment in products.js for the shape). Product cards
  should look like the signed-off `.pk` card in home.css (image well, brand, name, price, lime
  "Add to basket" button).
- Motion is welcome where it helps (smooth transitions between steps, gentle reveal on scroll),
  always respecting prefers-reduced-motion, and content must be visible without JS animation running.
