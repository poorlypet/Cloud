# PADEL

Design work for PADEL, a multi-brand padel retailer. Open `home.html` to browse the whole store: every menu, footer, card and button link goes to its page. Open `index.html` for the design board.

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

## More final pages
- Collections, built by `plp.js`. Every menu option has its own page (`rackets-*`, `shoes-*`, `clothing-*`, `bags-*`, `accessories-*`, `gift-ideas.html`) and every brand has one (`brand-*.html`, Bullpadel is `brand.html`). The main ones: `rackets-beginner.html`, `rackets-intermediate.html`, `rackets-advanced.html`, `rackets-round.html`, `rackets-teardrop.html`, `rackets-diamond.html`, `rackets-under-100.html`, `shoes.html`, `clothing.html`, `bags.html`, `balls.html`, `accessories.html`, `new-in.html`, `sale.html`, `brand-nox.html`, `brand-head.html`
- Built by `pages2.js` and `pages2.css`: `contact.html`, `privacy.html`, `terms.html`, `cookies.html`, `notfound.html`, `noresults.html`, `signin.html`, `account.html`, `account-new.html` (no racket bought yet), `beginners.html`
- `court.html` and `map.html`: the court and the racket map, built by `lab.js` and `lab.css`
- All 12 guides: `g-*.html`, text in `guides.js`
- Legal text is in `legal.js`. Company name, number, address, email and VAT number are set once in `LEGAL` at the top of `pages2.js`
- Menu links are set in `MLINK`, brand links in `BL` and footer links in `LINK`, all in `classic.js`. Other links are matched to their page by their text, in the site wiring block at the end of `classic.js`

## Shot list and products
- `lists/shot-list.csv`: every photo, video and logo the site needs, with where it is used and the size to supply
- `lists/product-list.csv`: every product the site shows, by category

## Shared files
- `classic.js`, `classic.css` (with `retail4.css`, `retail5.css`, `retail6.css`): header, mega menus, search, bag, footer, product data
- `plp.js`, `plp.css`: collection pages
- `pdp.js`, `pdp.css`: product pages
- Placeholder store figures (Trustpilot score, review count, free delivery threshold) are set in `STORE` at the top of `classic.js`

Older rounds of homepage options are kept as `home-*.html` files but are no longer linked from the board.
