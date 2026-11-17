# Solar quote calculator

Customer enters a postcode, picks their house, sees panels drawn on their real roof
(Google satellite + Solar API) and gets a price with/without battery and scaffolding.

Files: `index.html`, `solar.css`, `solar.js`, `config.js` (keys and prices: the only file to edit).

## Keys (in config.js)

| Setting | Where from | What it does |
|---|---|---|
| `googleApiKey` | console.cloud.google.com, enable Solar API, Maps JavaScript API, Geocoding API | Satellite map, roof measurement, panel positions |
| `idealPostcodesKey` | ideal-postcodes.co.uk | List of houses for a postcode (dropdown) |
| `leadEndpoint` | e.g. formspree.io | Where "Book my survey" sends the lead |

Restrict the Google key to your website (HTTP referrers, e.g. `https://yoursite.co.uk/*`)
and to the three APIs above. It is visible in the page source, so the restriction is what protects it.

With `googleApiKey` empty the page runs in demo mode with a sample roof.
