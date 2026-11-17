/* ============================================================
   Solar calculator settings. The only file you need to edit.
   ALL PRICES BELOW ARE TEST VALUES. Replace them with your own.
   ============================================================ */

window.SOLAR_CONFIG = {
  companyName: "Your Solar Company",
  phone: "0800 000 0000",

  /* Photos (paste an image URL, or leave empty for a grey placeholder) */
  heroPhoto: "",        // right-hand side of the first screen
  bookCallPhoto: "",    // top of the "book a call" card

  /* --- API keys -------------------------------------------------
     googleApiKey: Google Cloud key with Solar API, Maps JavaScript API
       and Geocoding API enabled, restricted to your website.
       Empty = demo mode with a sample roof.
     idealPostcodesKey: ideal-postcodes.co.uk key, lists the houses
       at a postcode. Empty = customer types their house number.
     leadEndpoint: where bookings are sent (e.g. a Formspree URL).
       Empty = shows the confirmation but sends nothing. */
  googleApiKey: "AIzaSyBznmrYo0ZRl8j_V14O1ho50HKvSniJfSE",
  idealPostcodesKey: "ak_PISdKps5nmqC1stNUiZ0jK6gtAmio",
  leadEndpoint: "",

  /* AI mapping: Claude outlines the home and its property on the roof photo.
     Works when the site runs on Netlify with ANTHROPIC_API_KEY set; otherwise
     the page falls back to Google's own roof outline. Set to "" to turn off. */
  aiEndpoint: "",          // "/.netlify/functions/map-house" to switch on (tested: not accurate enough yet)
  aiCropMeters: 40,       // area of photo sent to the AI, around the pin
  aiCropPixels: 900,      // size of that picture
  aiTimeoutMs: 45000,

  /* --- Panel types (TEST PRICES) -------------------------------- */
  panelWatts: 440,
  panelTypes: [
    { id: "std",   name: "440W panels",           short: "Standard",  pricePerPanel: 180 },
    { id: "black", name: "440W all-black panels", short: "All black", pricePerPanel: 215 }
  ],
  baseInstallPrice: 2400,   // inverter, labour, certification
  minPanels: 4,
  /* Google measures a whole terrace or pair of semis as one roof, so for
     these house types only panels inside one house's width are used.
     Widths in metres (0 = use the whole roof). */
  houseWidths: { detached: 0, semi: 7, end: 5.5, terrace: 5 },
  houseDepthMeters: 24,
  roofPhotoRadiusMeters: 25,  // size of Google's roof photo shown after the pin step
  gardenMeters: 6,
  detachedReachMeters: 9,     // detached homes: only trace roof within this distance of the pin            // how far the dashed property box reaches past the house, front and back
  flatRoofPitch: 10,          // roofs flatter than this (degrees) get panels lined up with the walls
  maxPanels: 30,
  defaultUsageKwh: 2700,    // typical UK home, customer can change it

  /* --- Scaffolding (TEST PRICE) --------------------------------- */
  scaffoldingPrice: 850,

  /* --- Packages: the "type of solar" (TEST PRICES) -------------- */
  packages: [
    { id: "solar", name: "Solar panels", blurb: "Panels and inverter. The lowest price to get started.",
      batteryKwh: 0, batteryPrice: 0,
      features: ["Runs your home on sunshine through the day", "Get paid for the power you don't use", "Add a battery any time later"] },
    { id: "b5", name: "Solar + 5 kWh battery", blurb: "Stores the day's sun so you can use it in the evening.",
      batteryKwh: 5, batteryPrice: 2900, recommended: true, tag: "Most popular",
      features: ["Everything in Solar panels", "Use your own power after dark", "Top up on cheap overnight electricity"] },
    { id: "b10", name: "Solar + 10 kWh battery", blurb: "The most independence from the grid and the biggest saving.",
      batteryKwh: 10, batteryPrice: 4600, tag: "Biggest saving",
      features: ["Everything in Solar panels", "Covers most evenings and mornings", "Best for bigger homes and electric cars"] }
  ],

  /* --- Electricity use presets on the roof step ----------------- */
  usagePresets: [
    { label: "Flat or small home", kwh: 1800 },
    { label: "Typical home", kwh: 2700 },
    { label: "Large home or EV", kwh: 4100 }
  ],
  systemLifeYears: 25,

  /* --- Finance (TEST VALUES) ------------------------------------ */
  financeApr: 9.9,
  financeMonths: 120,

  /* --- Savings assumptions -------------------------------------- */
  electricityPrice: 0.25,
  exportPrice: 0.15,
  selfUseNoBattery: 0.35,
  selfUsePerBatteryKwh: 0.05,
  selfUseMax: 0.85,
  dcToAc: 0.85,

  /* --- Booking calendar ----------------------------------------- */
  callTimes: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
  callDays: [1, 2, 3, 4, 5, 6],   // 0 = Sunday ... 6 = Saturday
  installText: "Full installation by certified installers, including all paperwork"
};
