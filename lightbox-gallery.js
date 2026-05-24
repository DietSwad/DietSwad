/* lightbox-gallery.js — shared fullscreen image viewer used by landing page (hampers) and all product pages */
window.LightboxGallery = (function () {
  'use strict';

  var lb  = null;
  var imgs = [];
  var cur  = 0;
  var tx   = 0;

  function build() {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'ds-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button class="ds-lb-close" aria-label="Close gallery">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<button class="ds-lb-nav ds-lb-nav--prev" aria-label="Previous image">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<button class="ds-lb-nav ds-lb-nav--next" aria-label="Next image">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
      '<div class="ds-lb-stage"><img class="ds-lb-img" src="" alt=""></div>' +
      '<div class="ds-lb-counter"></div>';

    document.body.appendChild(lb);

    lb.querySelector('.ds-lb-close').addEventListener('click', close);
    lb.querySelector('.ds-lb-nav--prev').addEventListener('click', function () { go(-1); });
    lb.querySelector('.ds-lb-nav--next').addEventListener('click', function () { go(1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('ds-lb-stage')) close();
    });

    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function keyHandler(e) {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   go(-1);
    if (e.key === 'ArrowRight')  go(1);
  }

  function go(dir) {
    cur = (cur + dir + imgs.length) % imgs.length;
    show();
    preload();
  }

  function show() {
    var img     = lb.querySelector('.ds-lb-img');
    var counter = lb.querySelector('.ds-lb-counter');
    var prev    = lb.querySelector('.ds-lb-nav--prev');
    var next    = lb.querySelector('.ds-lb-nav--next');
    img.src     = imgs[cur].src;
    img.alt     = imgs[cur].alt || '';
    counter.textContent = (cur + 1) + ' / ' + imgs.length;
    var hide = imgs.length <= 1;
    if (prev) prev.style.display = hide ? 'none' : '';
    if (next) next.style.display = hide ? 'none' : '';
  }

  function preload() {
    [-1, 1].forEach(function (d) {
      var idx = (cur + d + imgs.length) % imgs.length;
      var p = new Image();
      p.src = imgs[idx].src;
    });
  }

  function open(opts) {
    build();
    imgs = opts.images || [];
    cur  = Math.max(0, Math.min(opts.startIndex || 0, imgs.length - 1));
    show();
    preload();
    lb.classList.add('is-open');
    document.body.classList.add('ds-lb-active');
    document.addEventListener('keydown', keyHandler);
    setTimeout(function () {
      var closeBtn = lb.querySelector('.ds-lb-close');
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  function close() {
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('ds-lb-active');
    document.removeEventListener('keydown', keyHandler);
  }

  return { open: open, close: close };
})();
