/* ════════════════════════════════════════════════════════════════
   Diet Swad — guide download tracking
   ────────────────────────────────────────────────────────────────
   Fires a GTM dataLayer event when someone downloads a lead-magnet
   PDF, so the Instagram comment-to-DM funnel can be measured end to
   end: comment keyword -> DM -> landing page -> download.

   The link itself is a plain <a href="../guides/x.pdf" download>, so
   the download works with or without JS. This only adds the event.

   Pair with the shortener + UTMs on the DM link, and utm-capture.js
   already stores the source on the session.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var links = document.querySelectorAll('[data-guide-download]');
  if (!links.length) return;

  window.dataLayer = window.dataLayer || [];

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      var href = link.getAttribute('href') || '';
      window.dataLayer.push({
        event: 'guide_download',
        guide_keyword: link.getAttribute('data-guide-download') || '',
        guide_file: href.split('/').pop(),
        page_path: window.location.pathname
      });
    });
  });
})();
