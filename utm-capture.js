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

    var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];

    for (var i = 0; i < KEYS.length; i++) {
      var key = KEYS[i];
      var value = params.get(key);
      if (!value) continue;
      // First-touch: never overwrite a value already captured this visit.
      if (sessionStorage.getItem(key)) continue;
      sessionStorage.setItem(key, value.slice(0, 300));
    }

    // Meta click id → a properly formatted `fbc` value, remembered for the visit.
    //
    // Normally the Meta Pixel turns ?fbclid=… into the `_fbc` cookie, and order.js reads that
    // cookie. But the Pixel loads through GTM, so when GTM is blocked no cookie is ever written.
    // order.js's last-resort fallback passes the RAW fbclid as `fbc`, which Meta does not accept —
    // it expects `fb.<subdomainIndex>.<creationTime>.<fbclid>`. Building it here, at the moment we
    // actually see the click, is the only place the real timestamp is known.
    //
    // Only written if the Pixel has not already set its own cookie, so the Pixel always wins.
    if (!/(?:^|;)\s*_fbc=/.test(document.cookie) && !sessionStorage.getItem('ds_fbc')) {
      var fbclid = params.get('fbclid');
      if (fbclid) {
        sessionStorage.setItem('ds_fbc', 'fb.1.' + Date.now() + '.' + fbclid.slice(0, 300));
      }
    }

    // Referrer fallback — mirrors the GTM tag (§1b of Details/ANALYTICS_GTM_REFERENCE.md) so both
    // writers agree. Without this, a GTM-blocked visitor who arrives with NO utm params stores
    // nothing at all and the backend has to record the order as "unattributed". Real case: order
    // #244 (Swapnil Sarkar, 2026-08-17) — a paid Website order that landed with source "manual"
    // because sessionStorage was empty. Only runs when nothing is stored yet, so a real campaign
    // tag is never downgraded to "direct".
    if (sessionStorage.getItem('utm_source')) return;

    // NOTE: the GTM version of this classifier derives the name with host.split('.')[0], which
    // records Facebook's link-shim hosts as source "l" (l.facebook.com) and "lm"
    // (lm.facebook.com) — meaningless values that fragment Facebook traffic across three names.
    // Explicit host→platform mapping avoids that. The GTM tag should be updated to match;
    // until it is, GTM wins when present, so this only takes effect when GTM is blocked.
    var SEARCH = /^(google|bing|yahoo|duckduckgo|ecosia)(\.|$)/;
    var SOCIAL = [
      [/(^|\.)facebook\.com$|^fb\.(me|com)$/, 'facebook'],
      [/(^|\.)instagram\.com$/,               'instagram'],
      [/(^|\.)(twitter|x)\.com$|^t\.co$/,     'twitter'],
      [/(^|\.)linkedin\.com$|^lnkd\.in$/,     'linkedin'],
      [/(^|\.)youtube\.com$|^youtu\.be$/,     'youtube'],
      [/(^|\.)pinterest\.[a-z.]+$/,           'pinterest'],
      [/(^|\.)threads\.(net|com)$/,           'threads'],
      [/(^|\.)whatsapp\.com$/,                'whatsapp']
    ];

    var src = 'direct', med = 'none';
    var ref = document.referrer;
    if (ref) {
      var host = '';
      try { host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) {}
      var self = window.location.hostname.replace(/^www\./, '').toLowerCase();
      if (host && host !== self) {
        var matched = null;
        for (var j = 0; j < SOCIAL.length; j++) {
          if (SOCIAL[j][0].test(host)) { matched = SOCIAL[j][1]; break; }
        }
        if (matched)                { src = matched;             med = 'social';   }
        else if (SEARCH.test(host)) { src = host.split('.')[0];  med = 'organic';  }
        else                        { src = host;                med = 'referral'; }
      }
    }
    sessionStorage.setItem('utm_source', src);
    sessionStorage.setItem('utm_medium', med);
  } catch (_) {
    // Private-mode / storage-disabled browsers throw on sessionStorage access.
    // Attribution is best-effort — never let it break the page.
  }
})();
