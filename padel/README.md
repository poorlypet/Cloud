# PADEL

Design work for PADEL, a multi-brand padel retailer. Open `index.html` for the design board.

## Signed off
- `home.html`: homepage (Classic, framed hero, black review strip on mobile)
- `product.html`: product page

## Earlier options
- `collection-m2a.html` to `collection-m2c.html`: collection page, M2 with each of the three photos
- `collection-m1.html` to `collection-m5.html`: earlier photo hero round
- `collection-k1.html` to `collection-k5.html`: earlier hero round
- `collection-c1.html` to `collection-c5.html`: earlier collection round
- `product-s1.html` to `product-s5.html`: product pages, mosaic gallery, flowing buy box, five How it plays styles
- `product-n1.html` to `product-n5.html`: earlier product round
- `product-r1.html` to `product-r5.html`: earlier product round
- `product-p1.html` to `product-p5.html`: earlier product round

## Final pages
- `collection.html`, `brand.html`, `search.html`: built by `plp.js`. Change the collection photo with `ph` in `PLPCFG`, add a mobile crop with `phm`
- `brands.html`, `reviews.html`, `about.html`, `klarna.html`, `delivery.html`, `returns.html`, `track.html`, `faqs.html`, `help.html`, `guide.html`, `cart.html`: built by `pages.js` and `pages.css`
- Delivery prices and times, the 14 day returns window, refund time and opening hours are set once in `POL` at the top of `pages.js`

## New pages
- Collections, all built by `plp.js`: `rackets-beginner.html`, `rackets-intermediate.html`, `rackets-advanced.html`, `rackets-round.html`, `rackets-teardrop.html`, `rackets-diamond.html`, `rackets-under-100.html`, `shoes.html`, `clothing.html`, `bags.html`, `balls.html`, `accessories.html`, `new-in.html`, `brand-nox.html`, `brand-head.html`
- Pick one of three, built by `pages2.js` and `pages2.css`: guide article (`g-how-to-choose-a-padel-racket.html`, `article-2.html`, `article-3.html`), `contact-1` to `-3`, legal (`privacy-1` to `-3`, `terms-1` to `-3`, `cookies-1` to `-3`), `notfound-1` to `-3`, `noresults-1` to `-3`, `signin-1` to `-3`, `account-1` to `-3`, `beginners-1` to `-3`, `sale-1` to `-3` (1 and 2 use `plp.js`)
- All 12 guides: `g-*.html`, text in `guides.js`
- Legal text is in `legal.js`. Company name, number, address, email and VAT number are set once in `LEGAL` at the top of `pages2.js`
- Stand out pages, built by `lab.js` and `lab.css`: `map-1` to `-3`, `court-1` to `-3`, `next-1` to `-3`
- Menu and footer links are set in `LINK` in `classic.js`

## Shared files
- `classic.js`, `classic.css` (with `retail4.css`, `retail5.css`, `retail6.css`): header, mega menus, search, bag, footer, product data
- `plp.js`, `plp.css`: collection pages
- `pdp.js`, `pdp.css`: product pages
- Placeholder store figures (Trustpilot score, review count, free delivery threshold) are set in `STORE` at the top of `classic.js`

Older rounds of homepage options are kept as `home-*.html` files but are no longer linked from the board.
