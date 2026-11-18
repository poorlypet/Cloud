# Midlands Solar website

A static site: ten pages plus the online quote tool.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `get-quote.html` | Ads landing page (not in the menu, hidden from search engines) |
| `about.html` | About us |
| `work.html` | Recent work and reviews |
| `funding.html` | Government funding |
| `finance.html` | Finance options |
| `products.html` | Products |
| `commercial.html`, `agricultural.html` | Business pages |
| `contact.html` | Contact |
| `quote/` | The online solar quote tool |

## Changing the site

The pages are generated. Edit `site.py`, then run:

```bash
python3 site.py
```

- Wording, page order and sections: `site.py`
- Look and feel: `assets/css/ms.css`
- Scroll motion, forms, postcode bars: `assets/js/ms.js`
- Phone numbers and email: top of `site.py`
- Contact forms: set `FORM_ENDPOINT` at the top of `site.py` (for example a Formspree link). Until then the forms tell visitors to call.

Every section is built to fit one screen. After changing content, check nothing has grown taller than the screen on desktop and phone.

## Quote tool

Settings and prices are in `quote/config.js`. The AI roof mapping runs as a Netlify function (`netlify/functions/map-house.mjs`) and needs `ANTHROPIC_API_KEY` set in Netlify. Never put that key in a file here.

## Earlier design explorations

`home2.html`, `design-1…5.html` and `mosaic-1…5.html` (built by `designs.py` and `mosaic.py`) are earlier options kept for reference. They are not linked from the site and can be deleted.

## Shopify theme

```bash
python3 shopify.py
```

builds `shopify-theme/` and `midlands-solar-theme.zip` from the same source (both are left out of git; rebuild them when the site changes). Upload the zip in Shopify admin under Online Store > Themes > Add theme > Upload zip file.

Each inner page needs a Shopify Page with a matching handle and template (for example handle `about`, template `page.about`). `shopify.py` prints the full list when it runs. The quote tool is the page with handle `solar-quote`.

Contact forms and quote bookings go through Shopify's contact form, so they arrive at the store's email address. The AI roof-mapping step needs the `map-house` function hosted (for example on Netlify) and its address entered in Theme settings > Solar quote tool.

## Call bookings

The quote tool offers one-hour calls, Monday to Friday, 9am to 5pm (set in `quote/config.js`: `callTimes`, `callDays`, `callWeeks`).

Taken slots are remembered by `netlify/functions/slots.mjs` (Netlify Blobs), so a slot disappears for everyone once booked and two people can't book the same time. This only runs once the site's `netlify/` folder is deployed to Netlify; until then every slot shows as free. On Shopify, enter the Netlify site address in Theme settings > Solar quote tool.

To free a slot (for example after a cancellation), set `BOOKINGS_ADMIN_KEY` in Netlify and run:

```bash
curl -X DELETE -H "x-admin-key: YOUR_KEY" "https://YOUR-SITE.netlify.app/.netlify/functions/slots?slot=2026-11-25%2010:00"
```

The booking details themselves go to the store's inbox through Shopify's contact form.
