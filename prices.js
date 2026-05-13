(function () {
  'use strict';

  // ─── SINGLE SOURCE OF TRUTH ─────────────────────────────
  // To change site-wide price: edit this number, redeploy.
  // Also update the corresponding row in the backend
  // products table via the internal app.
  var UNIFORM_PRICE = 499;
  // ────────────────────────────────────────────────────────

  window.DietSwadPrices = {
    UNIFORM_PRICE: UNIFORM_PRICE,
    formatted: '₹' + UNIFORM_PRICE.toLocaleString('en-IN')
  };

  function apply() {
    document.querySelectorAll('.ds-price-digits').forEach(function (el) {
      el.textContent = UNIFORM_PRICE;
    });
    document.querySelectorAll('.ds-price-full').forEach(function (el) {
      el.textContent = '₹' + UNIFORM_PRICE;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
