(function () {
  'use strict';

  // ─── SINGLE SOURCE OF TRUTH ─────────────────────────────
  // To change any product's price site-wide: edit a value below
  // and redeploy. Also update the corresponding row in the
  // backend products table via the internal app so charges match.
  var PRICES = {
    'power-bites':            199,
    'royal-bites':            99,
    'peanut-sesame-delights': 2,
    'millet-butter-cookies':  499,
    'millet-coconut-cookies': 399,
    'millet-choco-cookies':   3,
    'roasted-cashews':        4
  };
  // ────────────────────────────────────────────────────────

  function getPrice(slug) {
    return PRICES[slug];
  }

  function resolveSlug(el) {
    if (el.dataset && el.dataset.dsSlug) return el.dataset.dsSlug;
    var card = el.closest && el.closest('.pb-related-card');
    if (card) {
      var href = card.getAttribute('href') || '';
      var m = href.match(/([\w-]+)\.html$/);
      if (m) return m[1];
    }
    var row = el.closest && el.closest('.ord-prod-row');
    if (row && row.dataset.ordSlug) return row.dataset.ordSlug;
    return null;
  }

  function apply() {
    document.querySelectorAll('.ds-price-digits').forEach(function (el) {
      var slug  = resolveSlug(el);
      var price = slug != null ? PRICES[slug] : null;
      if (price != null) el.textContent = price;
    });
    document.querySelectorAll('.ds-price-full').forEach(function (el) {
      var slug  = resolveSlug(el);
      var price = slug != null ? PRICES[slug] : null;
      if (price != null) el.textContent = '₹' + price;
    });
  }

  window.DietSwadPrices = {
    PRICES:   PRICES,
    getPrice: getPrice,
    apply:    apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
