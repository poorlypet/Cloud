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
