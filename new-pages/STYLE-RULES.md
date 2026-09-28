# Poorly Pet style rules (from the signed-off homepage). These override everything else.

The owner's verdict on the last round: too busy, bad spacing, white gaps before the footer, wrong
product cards, looks AI-made. The fix is to build every page the way the homepage is built.
Open `new-pages/_home-ref.html` (the signed-off homepage wired to css/home.css) and copy its patterns.

## The homepage pattern
- Page background is WHITE. Colour lives inside rounded panels (radius 24px, `var(--rl)`) that sit
  within `.wrap`: deep teal panels (`var(--teal)`, white text, lime `<em>` and lime `.btn`) and pale
  green panels (`#E4EED6` or `--pale:#F3F6F1`, teal text, teal `.btn.sec`). No full-bleed coloured bands
  except the page intro/hero, and no gradients, blobs, tilted cards, drop-shadow-heavy cards.
- Every section = `<section class="xx-sec"><div class="wrap"><div class="sec-h"><div><h2>Title <em>word</em></h2><p>One short line.</p></div><div class="sec-r"><a class="all" href="#">See all ›</a></div></div> ...content... </div></section>`
  Section padding exactly like the homepage: `padding:44px 0 8px` (32px top under 900px).
  Headings: `.sec-h h2` Domine 32px teal (26px mobile). One short supporting line in mute.
- Density: this is a retailer with ~450 products. Compact, scannable, useful. Short copy (one or two
  sentences per block). Prefer lists, small tables, rails of products. No paragraphs of explanation.
- 4 to 6 sections per page, maximum. If content doesn't earn a section, cut it.
- Buttons: `.btn` (lime/teal text) on teal panels; `.btn.sec` (teal/white) on white or pale.
- Accordions for FAQ-type content, like the homepage "Ask us about itchy skin" panel (`.ed3 .qa`).

## Product cards: ONE card, always
Use the homepage product card and rail markup EXACTLY, styled only by css/home.css:
```
<div class="railwrap"><div class="rail prail" tabindex="0">
  <article class="pk"><span class="tab">Category</span>
    <a class="well" href="#"><img src="IMG" alt="" loading="lazy"></a>
    <div class="body"><span class="brand">Brand</span><a class="name" href="#">Name</a>
      <span class="rev none" aria-hidden="true"></span><span class="helps">For arthritis</span>
      <div class="price"><span class="now">£9.99</span></div>
      <button class="btn" type="button" data-add="handle">Add to basket</button></div></article>
  ...</div>
  <div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back"><span>←</span></button>
  <div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>
```
(see `_home-ref.html` and `final/dog-health-quiz.html` for a working copy incl. the scroller JS and
rating markup). Never restyle `.pk`, never invent another product card, never put products in custom tiles.
Images: `p.img` with an onerror fallback to the plain well.

## Page end
The last section runs into the footer: `css/site.css` removes the footer margin. Give the LAST section
`padding-bottom:48px` on white. No empty space, no spacer divs, no pale band followed by white.

## Never
Eyebrow labels, dot labels, emoji, gradient blobs, oversized hero typography on utility pages,
tilted/rotated cards, giant empty photo placeholders, three-feature-tile filler, "How it works" with
huge numbered circles, walls of text, urgency boxes, the registered address.
