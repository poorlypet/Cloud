/* ============================================================
   Solar calculator settings. This is the only file you need to
   edit to change keys, prices and savings assumptions.
   All prices in pounds, including VAT (solar is 0% VAT in the UK
   until March 2027, so vatRate is 0).
   ============================================================ */

window.SOLAR_CONFIG = {
  companyName: "Your Solar Company",
  phone: "0800 000 0000",

  /* --- API keys -------------------------------------------------
     googleApiKey: one Google Cloud key with these APIs enabled:
       Solar API, Maps JavaScript API, Geocoding API.
     Restrict it to your website's domain in Google Cloud.
     Leave it empty to run in demo mode (a sample house, no real data).

     idealPostcodesKey: from ideal-postcodes.co.uk. Gives the list of
     houses for a postcode, so the customer can pick theirs.
     Leave it empty and the customer types their house number instead.

     leadEndpoint: where the "book a survey" form is sent, for example
     a Formspree URL (https://formspree.io/f/xxxxxx). Leave it empty
     and the form shows a thank-you message but sends nothing. */
  googleApiKey: "",
  idealPostcodesKey: "",
  leadEndpoint: "",

  /* --- Panels --------------------------------------------------- */
  panelWatts: 440,          // the panel you install
  pricePerPanel: 180,       // panel + mounting + wiring, per panel
  baseInstallPrice: 2400,   // inverter, labour, certification, fixed per job
  minPanels: 4,
  maxPanels: 30,            // the slider also stops at what fits the roof
  defaultPanels: 10,

  /* --- Scaffolding ---------------------------------------------- */
  scaffoldingPrice: 850,

  /* --- Batteries (first one must be "No battery") --------------- */
  batteries: [
    { id: "none", name: "No battery",     kwh: 0,  price: 0 },
    { id: "b5",   name: "5 kWh battery",  kwh: 5,  price: 2900 },
    { id: "b10",  name: "10 kWh battery", kwh: 10, price: 4600 }
  ],

  /* --- Savings assumptions -------------------------------------- */
  electricityPrice: 0.25,   // £ per kWh the customer buys
  exportPrice: 0.15,        // £ per kWh paid for export (SEG)
  selfUseNoBattery: 0.35,   // share of generation used in the home
  selfUsePerBatteryKwh: 0.05, // each battery kWh adds this much
  selfUseMax: 0.85,
  dcToAc: 0.85,             // losses from panel to plug
  demoYieldPerKw: 950,      // kWh per kW per year, demo mode only
  vatRate: 0
};
