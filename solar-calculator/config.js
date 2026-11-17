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
  googleApiKey: "",
  idealPostcodesKey: "",
  leadEndpoint: "",

  /* --- Panel types (TEST PRICES) -------------------------------- */
  panelWatts: 440,
  panelTypes: [
    { id: "std",   name: "440W panels",           pricePerPanel: 180 },
    { id: "black", name: "440W all-black panels", pricePerPanel: 215 }
  ],
  baseInstallPrice: 2400,   // inverter, labour, certification
  minPanels: 4,
  maxPanels: 30,
  defaultUsageKwh: 2700,    // typical UK home, customer can change it

  /* --- Scaffolding (TEST PRICE) --------------------------------- */
  scaffoldingPrice: 850,

  /* --- Packages: the "type of solar" (TEST PRICES) -------------- */
  packages: [
    { id: "solar", name: "Solar panels",           batteryKwh: 0,  batteryPrice: 0,    note: "Lowest upfront cost" },
    { id: "b5",    name: "Solar + 5 kWh battery",  batteryKwh: 5,  batteryPrice: 2900, note: "Most popular", recommended: true },
    { id: "b10",   name: "Solar + 10 kWh battery", batteryKwh: 10, batteryPrice: 4600, note: "Biggest savings" }
  ],

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
