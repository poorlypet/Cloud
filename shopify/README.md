# Raqello Shopify theme

A Shopify theme built from the signed off Raqello design, plus the files to set up the new store. Nothing here has been pushed to any Shopify store.

## What is in this folder

- `raqello-theme.zip`: the theme, ready to upload.
- `theme/`: the same theme as files, for the Shopify CLI.
- `setup/`: everything the theme expects the store to have, taken from the design.
  - `metafields.json`: 31 product and collection metafield definitions (level, shape, sole, fit, specs, tiles, related links and more).
  - `collections.json`: all 95 collections from the menus, brands and hubs, with automated rules, template, description, guide text, questions, tiles, related links and breadcrumb parent.
  - `menus.json`: the main menu (three levels, every heading links to its own collection) and the five footer menus.
  - `pages.json`: about, delivery, returns, Klarna, contact, FAQs, help, beginners, and the privacy, terms and cookie policies.
  - `guides.json`: the blog "The padel guide" with all 12 guides.
  - `products-draft.csv`: the 426 products from the sourcing list as a Shopify product import, all set to draft, with no images. Prices are the ones from the design.

## Install the theme

1. In the new store go to Online Store, Themes, Add theme, Upload zip file, and choose `raqello-theme.zip`.
2. Do not publish it until the setup below is done.

Or with the Shopify CLI: `shopify theme push --path theme --unpublished`.

## The under construction page

Turn on Online Store, Preferences, Password protection. Visitors then see the Raqello landing page: the big wordmark, "Opening soon", an email sign up and the brands. Sign ups are saved as customers tagged `prelaunch`. The owner can get in with the store password from the link at the bottom. Edit the text, background video and brands in the theme editor on the Password page.

## Set up the store, in this order

1. **Metafields.** Create the definitions in `setup/metafields.json` under Settings, Custom data.
2. **Filters.** In the Search and Discovery app, turn on these filters: Brand (vendor), Level, Shape, Sole, Fit, Price, Availability. The collection pages and the level bar use them.
3. **Products.** Import `setup/products-draft.csv` under Products, Import. Everything comes in as a draft. Add sizes, photos and stock, then set each product to active.
4. **Collections.** Create each collection in `setup/collections.json` as an automated collection with its rules. Give racket collections the `rackets` template and brand collections the `brand` template. The brand collection handle must match the brand name, for example `nox`.
5. **Pages.** Create the pages in `setup/pages.json` with the template named in each. Fill in the company details in the legal pages where they are in square brackets.
6. **Guides.** Create a blog with the handle `guides` and add the articles from `setup/guides.json`.
7. **Menus.** Build `main-menu` and the footer menus from `setup/menus.json`.
8. **Theme settings.**
   - Add the Klarna badge, social links and favicon.
   - Set shipping to £4.95, free over £75, to match the theme copy.
   - Add your real Trustpilot rating to show the Trustpilot badges.
9. **Apps.** Add the Trustpilot app block to the home page reviews section and the product reviews section. Klarna comes through Shopify Payments.

Once the new store is connected, all of steps 1 to 7 can be done automatically from these files.

## What the theme covers

- Header with mega menus built from the Shopify menu. The column headings link to their own collections, and the Brands menu lists every brand A to Z.
- Mobile menu, predictive search, and a bag drawer that updates without reloading the page.
- Home page sections:
  - Hero video
  - Category tiles
  - Beginners
  - Statement
  - Brand logos
  - Promo tiles
  - Shop your level
  - Product rows
  - Klarna banner
  - Reviews
  - Guides
- Collection pages:
  - Hero and level bar
  - Tiles linking to each option
  - Filters and sort
  - Load more
  - Klarna and photo tiles in the grid
  - Guide text and questions
  - Related links
  - Brand page layout
- Product page:
  - Gallery
  - Variant picker
  - How it plays bars and key specs, from metafields
  - Klarna Pay in 3 line
  - Description tabs
  - Feature band
  - Reviews app area
  - Recommendations
- Bag page, search and no results, the 404 page, brands A to Z, guides and guide articles.
- Customer pages: sign in, create account, account home with "your racket" (and a fallback for customers who have not bought one), orders, addresses and password reset.
- Page templates for about, delivery, returns, Klarna, contact, FAQs, help and legal.

Checkout is Shopify's own.

## Left out on purpose

- The Trustpilot score and the sample reviews from the design. Showing them on a live store would be made up. Add the real ones in the theme settings and the Trustpilot app.
- The racket map and court pages. They need the product data wired in and can be added as page templates next.
