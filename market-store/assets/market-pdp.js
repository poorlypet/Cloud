/* market-pdp.js: Germany and Ireland product pages. Runs before pdp-live.js. The UK build-time page data (pdpdata, pdpmeta) is
   English and written for UK delivery, so for the euro markets it is dropped for this product and pdp-live.js builds the page
   from the live product and its (translated) metafields instead. The delivery tab is replaced with the market's own wording. */
(function () {
  'use strict';
  var M = window.PP_MARKET, LP = window.LIVE_PRODUCT, LM = window.LIVE_META;
  if (!M || !LP || !LP.handle || !LM) return;
  var h = LP.handle, DE = M.code === 'DE';
  if (window.PPD) delete window.PPD[h];
  if (window.PPM) delete window.PPM[h];
  LM.delivery = DE
    ? '<div class="metafield-rich_text_field"><p>Kostenloser Versand ab 50 € Bestellwert, darunter 5,99 €. Die Lieferung dauert 2 bis 5 Werktage, Ihre Bestellung wird aus Großbritannien versandt. Sie können Ihre Bestellung innerhalb von 14 Tagen nach Erhalt widerrufen. Einzelheiten finden Sie auf der Seite Rückgabe &amp; Erstattung.</p></div>'
    : '<div class="metafield-rich_text_field"><p>Free delivery on orders over €50, otherwise €4.99. Delivery takes 2 to 5 working days and your order is shipped from the UK. You have 14 days from receiving your order to cancel it. Full details are on our Returns and refunds page.</p></div>';
  LM.days = [2, 5];
})();
