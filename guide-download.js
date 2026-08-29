/* ════════════════════════════════════════════════════════════════
   Diet Swad — guide download: tracking + celebration
   ────────────────────────────────────────────────────────────────
   1. Fires a GTM dataLayer event so the Instagram funnel can be
      measured end to end: comment keyword -> DM -> page -> download.
   2. Bursts confetti and flips the button to a confirmed state.

   HONEST LIMITATION: a browser gives no completion event for a plain
   <a download>, so both of these fire on CLICK, at the moment the
   download starts. There is no way to know the file finished saving
   without proxying it through JS, which would break the no-JS path.

   The link works with or without this script.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var links = document.querySelectorAll('[data-guide-download]');
  if (!links.length) return;

  window.dataLayer = window.dataLayer || [];

  var COLORS = ['#B0903D', '#F5D17A', '#D4AF37', '#4A0000', '#3C1053', '#3B1E08'];
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function celebrate(originEl) {
    if (reduceMotion) return;

    var rect = originEl.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;

    var layer = document.createElement('div');
    layer.className = 'ds-confetti';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    for (var i = 0; i < 44; i++) {
      var piece = document.createElement('i');
      // Fan upward and outward, then let gravity carry each piece down.
      var angle = (Math.PI * 1.15) + (Math.random() * Math.PI * 0.7);
      var distance = 90 + Math.random() * 190;

      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      piece.style.background = COLORS[i % COLORS.length];
      piece.style.setProperty('--dx', (Math.cos(angle) * distance).toFixed(0) + 'px');
      piece.style.setProperty('--dy', (Math.sin(angle) * distance + 260).toFixed(0) + 'px');
      piece.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      piece.style.animationDelay = (Math.random() * 0.14).toFixed(2) + 's';

      layer.appendChild(piece);
    }

    window.setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 2400);
  }

  var TICK =
    '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" ' +
    'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 6 9 17l-5-5"/></svg>';

  links.forEach(function (link) {
    var original = link.innerHTML;
    var busy = false;

    link.addEventListener('click', function () {
      var href = link.getAttribute('href') || '';

      window.dataLayer.push({
        event: 'guide_download',
        guide_keyword: link.getAttribute('data-guide-download') || '',
        guide_file: href.split('/').pop(),
        page_path: window.location.pathname
      });

      if (busy) return;
      busy = true;

      celebrate(link);

      link.classList.add('is-done');
      link.innerHTML = TICK + '<span>Guide downloaded</span>';

      window.setTimeout(function () {
        link.classList.remove('is-done');
        link.innerHTML = original;
        busy = false;
      }, 4000);
    });
  });
})();
