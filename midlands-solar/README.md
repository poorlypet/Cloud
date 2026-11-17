# Midlands Solar Installations website

Static site: black, white and the logo's orange. Built from `build.py` (shared header, footer and call-to-action live there once).

    python3 build.py

| Page | File |
|---|---|
| Home | `index.html` |
| Ads landing page (not in the menu, noindex) | `get-quote.html` |
| AI solar quote | `quote/index.html` (settings in `quote/config.js`) |
| Recent work and reviews | `work.html` |
| Products we fit | `products.html` |
| Government funding | `funding.html` |
| Finance options | `finance.html` |
| Commercial / Agricultural solar | `commercial.html`, `agricultural.html` |
| About / Contact | `about.html`, `contact.html` |

Design system: `assets/css/site.css`. Behaviour (scroll reveals, parallax, sticky steps, gallery): `assets/js/site.js`.
The AI party-wall step for the quote runs as a Netlify function (`netlify/functions/map-house.mjs`, needs `ANTHROPIC_API_KEY`).
Enquiry forms are not connected yet: set `FORM_ENDPOINT` in `build.py`.
