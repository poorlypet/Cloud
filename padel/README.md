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
- `brands.html`, `reviews.html`, `about.html`, `klarna.html`, `delivery.html`, `returns.html`, `track.html`, `faqs.html`, `help.html`, `guide.html`: built by `pages.js` and `pages.css`
- Delivery prices and times, the 14 day returns window, refund time and opening hours are set once in `POL` at the top of `pages.js`

## Still choosing
- `cart-1.html` to `cart-3.html`: bag

## Shared files
- `classic.js`, `classic.css` (with `retail4.css`, `retail5.css`, `retail6.css`): header, mega menus, search, bag, footer, product data
- `plp.js`, `plp.css`: collection pages
- `pdp.js`, `pdp.css`: product pages
- Placeholder store figures (Trustpilot score, review count, free delivery threshold) are set in `STORE` at the top of `classic.js`

Older rounds of homepage options are kept as `home-*.html` files but are no longer linked from the board.
