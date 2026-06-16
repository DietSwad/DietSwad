(function () {
  'use strict';

  // ─── SINGLE SOURCE OF TRUTH ─────────────────────────────
  // To change any product's price site-wide: edit a value below
  // and redeploy. Also update the corresponding row in the
  // backend products table via the internal app so charges match.
  var PRICES = {
    'power-bites':            499,
    'royal-bites':            499,
    'peanut-sesame-delights': 499,
    'millet-butter-cookies':  499,
    'millet-coconut-cookies': 499,
    'millet-choco-cookies':   499,
    'roasted-cashews':        499
  };

  // COD fees — SINGLE SOURCE OF TRUTH for the website (display only).
  // To change a fee site-wide: edit a value below and redeploy. ALSO update the
  // matching row in the backend products table via the internal PWA (Fees screen)
  // so what we CHARGE matches what we SHOW. (The backend re-enforces totals, so
  // the table is authoritative for charges; this file only drives the checkout UI.)
  var FEES = {
    full_cod:               50,  // ₹ added for full Cash-on-Delivery
    partial_cod:            20,  // ₹ added for Partial COD
    partial_cod_online_pct: 30   // % of total paid online for Partial COD
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
    // COD fee placeholders: <span class="ds-fee" data-ds-fee="full_cod"></span>
    document.querySelectorAll('.ds-fee').forEach(function (el) {
      var key = el.dataset && el.dataset.dsFee;
      if (key != null && FEES[key] != null) el.textContent = FEES[key];
    });
    // Partial-COD split % placeholders:
    //   <span class="ds-pct" data-ds-pct="online"></span>  -> online %
    //   <span class="ds-pct" data-ds-pct="cod"></span>     -> on-delivery % (100 - online)
    var onlinePct = FEES.partial_cod_online_pct;
    if (onlinePct != null) {
      document.querySelectorAll('.ds-pct').forEach(function (el) {
        var which = el.dataset && el.dataset.dsPct;
        if (which === 'online')   el.textContent = onlinePct;
        else if (which === 'cod') el.textContent = 100 - onlinePct;
      });
    }
  }

  window.DietSwadPrices = {
    PRICES:   PRICES,
    FEES:     FEES,
    getPrice: getPrice,
    apply:    apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
