/* utm-capture.js — remember where a visitor came from, for the whole visit.
 *
 * Why this exists
 * ---------------
 * Campaign tags (?utm_source=…) arrive on whichever page the visitor lands on — usually
 * the homepage or a product page. But the order form is the only page that reads them,
 * and it reads them from ITS OWN url. Click through from the homepage and the tag is gone,
 * so a real Instagram/ChatGPT/GMB referral gets filed as a staff-entered order.
 *
 * order.js already has the second half of the fix (it falls back to sessionStorage when the
 * order-page url carries no tag) — but nothing ever WROTE those keys, so the fallback was
 * dead code. This file writes them.
 *
 * First-touch wins: a value is only stored if that key is not already set for this visit.
 * An internal click can therefore never overwrite the true origin. sessionStorage (not
 * localStorage) is deliberate — attribution should last the visit, not follow someone
 * around for weeks.
 *
 * Load this on EVERY page, in <head>, WITHOUT defer, so it runs before order.js.
 * It touches no DOM and cannot block rendering meaningfully.
 */
(function () {
  'use strict';

  try {
    if (!window.sessionStorage) return;

    var params = new URLSearchParams(window.location.search);

    // fbclid is stored too: order.js reads the _fbc cookie first and falls back to the
    // fbclid param, which has the same cross-page problem.
    var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];

    for (var i = 0; i < KEYS.length; i++) {
      var key = KEYS[i];
      var value = params.get(key);
      if (!value) continue;
      // First-touch: never overwrite a value already captured this visit.
      if (sessionStorage.getItem(key)) continue;
      sessionStorage.setItem(key, value.slice(0, 300));
    }
  } catch (_) {
    // Private-mode / storage-disabled browsers throw on sessionStorage access.
    // Attribution is best-effort — never let it break the page.
  }
})();
