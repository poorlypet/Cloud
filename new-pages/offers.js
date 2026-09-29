/* Poorly Pet offers: one source of truth for the offer badges shown on product cards.
   These are the offers in the site's "Offers" menu ("This month's offers"):
     Two supplements, 10% off
     Three supplements, 15% off
     Free wheelchair fitting
     Care kits, up to 15% off
   PPOffers.forProduct(p) returns the offers that apply to a product from products.js, most useful first.
   PPOffers.badge(p) returns the one short label for the card's top-left .tab badge (or null).
   PPOffers.lines(p) returns short lines to show under the price on the .pk card.
   On Shopify these would come from the automatic discounts / a metafield; the rules below mirror the menu. */
(function () {
  function isSupplement(p) {
    var t = (p.productType || '').toLowerCase();
    return t === 'supplement' || t.indexOf('supplements') === 0 || t === 'digestive support' || t === 'calming aid';
  }
  function isWheelchair(p) { return (p.productType || '') === 'Wheelchair' || /wheelchair/i.test(p.title || ''); }
  function isKit(p) { return (p.productType || '') === 'Condition Bundle' || /\b(bundle|care kit)\b/i.test(p.title || ''); }

  var ALL = [
    { id: 'two-supps', name: 'Two supplements, 10% off', short: '2 for 10% off', test: isSupplement,
      line: function () { return 'Buy 2 supplements, save 10%. Buy 3, save 15%'; } },
    { id: 'three-supps', name: 'Three supplements, 15% off', short: '3 for 15% off', test: isSupplement, line: null },
    { id: 'wheelchair-fitting', name: 'Free wheelchair fitting', short: 'Free fitting', test: isWheelchair,
      line: function () { return 'Free wheelchair fitting'; } },
    { id: 'care-kits', name: 'Care kits, up to 15% off', short: 'Kit saving', test: isKit,
      line: function (p) {
        if (p.compareAt && p.compareAt > p.price) return 'Care kit: save ' + Math.round((1 - p.price / p.compareAt) * 100) + '% on the set';
        return 'Care kits, up to 15% off';
      } }
  ];

  window.PPOffers = {
    all: ALL.map(function (o) { return { id: o.id, name: o.name, short: o.short }; }),
    forProduct: function (p) { return ALL.filter(function (o) { return o.test(p); }); },
    badge: function (p) { var o = ALL.filter(function (x) { return x.test(p); })[0]; return o ? o.short : null; },
    lines: function (p) {
      return ALL.filter(function (o) { return o.test(p) && o.line; }).map(function (o) { return o.line(p); });
    },
    test: { isSupplement: isSupplement, isWheelchair: isWheelchair, isKit: isKit }
  };
})();
