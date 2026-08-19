/* utm-capture.js — no-GTM fallback for campaign attribution.
 *
 * READ THIS BEFORE CHANGING IT — the primary writer is GTM, not this file.
 *
 * Campaign tags (?utm_source=…) arrive on whichever page the visitor lands on, but the
 * order form reads them from ITS OWN url, so an internal click to the order page would
 * lose them. That gap is already covered in production by a **GTM tag** which writes
 * utm_source / utm_medium into sessionStorage on every pageview. Verified in a real
 * browser on 2026-08-19:
 *   - lands with ?utm_source=instagram  -> GTM stores "instagram"
 *   - internal click to an untagged page -> GTM leaves "instagram" alone
 *   - clean visit, nothing stored yet    -> GTM stores "direct" / "none"
 * So order.js's sessionStorage fallback is NOT dead code — GTM feeds it. (This also
 * explains the `direct` / `none` values seen on some orders; they are GTM's doing.)
 *
 * This file exists for the case GTM cannot cover: **GTM is blocked.** Ad blockers and
 * privacy browsers stop googletagmanager.com from loading, and a meaningful share of
 * traffic runs one. When that happens GTM writes nothing and, without this file, the
 * order would be recorded as unattributed. This script has no third-party dependency,
 * so it still captures the tag.
 *
 * When GTM IS present it wins — it runs after this and overwrites with last-touch. That
 * is fine and intentional: GTM is the source of truth, this is the safety net. Do not
 * "fix" the ordering to make this file win without deciding first-touch vs last-touch as
 * a business question.
 *
 * The getItem guard below is first-touch for the GTM-blocked path only.
 * sessionStorage (not localStorage) is deliberate — attribution should last the visit,
 * not follow someone around for weeks.
 *
 * Load on EVERY page, in <head>, WITHOUT defer, so it runs before order.js.
 * Touches no DOM and cannot meaningfully block rendering.
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
