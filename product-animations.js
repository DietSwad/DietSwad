/* product-animations.js — Diet Swad product page animation engine
   Loaded with defer on all product pages. Honors prefers-reduced-motion. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. IntersectionObserver reveal (.reveal → .is-visible) ─────── */
  function initReveals() {
    if (reduced) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ── 2. Stagger children inside [data-stagger="Nms"] ───────────── */
  function initStagger() {
    document.querySelectorAll('[data-stagger]').forEach(function (parent) {
      var delay = parseInt(parent.dataset.stagger, 10) || 60;
      parent.querySelectorAll('.reveal').forEach(function (el, i) {
        if (!reduced) {
          el.style.transitionDelay = (i * delay) + 'ms, ' + (i * delay) + 'ms';
        }
      });
    });
  }

  /* ── 3. Count-up numbers ([data-countup="7.5"]) ─────────────────── */
  function countUp(el, target, duration) {
    if (reduced) { el.textContent = (target % 1 !== 0) ? target.toFixed(1) : target; return; }
    var startTime = null;
    var isFloat = (target % 1 !== 0);
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = target * ease;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    }
    requestAnimationFrame(step);
  }

  function initCountUps() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.dataset.countup);
        if (!isNaN(target)) countUp(el, target, 1400);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-countup]').forEach(function (el) {
      if (!reduced) el.textContent = '0';
      io.observe(el);
    });
  }

  /* ── 4. Hero: radial bg parallax ────────────────────────────────── */
  function initHeroParallax() {
    if (reduced) return;
    var bg = document.querySelector('.pb-hero-bg');
    if (!bg) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        bg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── 5. Hero headline gold sweep ─────────────────────────────────── */
  function initHeroHeadline() {
    var el = document.querySelector('.pb-hero-headline');
    if (!el) return;
    if (reduced) { el.classList.add('is-visible'); return; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-visible');
      });
    });
  }

  /* ── 6. Sticky CTA bar show / hide ──────────────────────────────── */
  function initStickyCta() {
    var bar = document.querySelector('.pb-sticky-cta');
    if (!bar) return;
    var threshold = 260;
    var drawerOpen = false;
    var drawer = document.getElementById('mobileDrawer');

    if (drawer) {
      new MutationObserver(function () {
        drawerOpen = drawer.classList.contains('is-open');
        if (drawerOpen) bar.classList.add('is-hidden');
        else if (window.scrollY > threshold) bar.classList.remove('is-hidden');
      }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }

    function update() {
      if (drawerOpen) return;
      var past = window.scrollY > threshold;
      bar.classList.toggle('is-visible', past);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── 7. Problem columns slide in from sides ──────────────────────── */
  function initProblemSlide() {
    if (reduced) return;
    var section = document.querySelector('.pb-problem-solution');
    if (!section) return;
    var cols = section.querySelectorAll('.pb-ps__col');
    cols.forEach(function (col, i) {
      col.style.opacity = '0';
      col.style.transform = i % 2 === 0 ? 'translateX(-22px)' : 'translateX(22px)';
    });
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      cols.forEach(function (col, i) {
        setTimeout(function () {
          col.style.transition = 'opacity .7s ease, transform .9s cubic-bezier(.2,.8,.2,1)';
          col.style.opacity = '1';
          col.style.transform = 'none';
        }, i * 130);
      });
      io.unobserve(section);
    }, { threshold: 0.15 });
    io.observe(section);
  }

  /* ── 8. Vs-table rows + glyphs tick in ───────────────────────────── */
  function initVsRows() {
    if (reduced) return;
    var section = document.querySelector('.pb-vs');
    if (!section) return;
    var rows = section.querySelectorAll('.pb-vs__row');
    var glyphs = section.querySelectorAll('.pb-vs__glyph');

    glyphs.forEach(function (g) {
      g.style.display = 'inline-block';
      g.style.transform = 'scale(0)';
    });
    rows.forEach(function (r) {
      r.style.opacity = '0';
      r.style.transform = 'translateX(-8px)';
    });

    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      rows.forEach(function (row, i) {
        setTimeout(function () {
          row.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(.2,.8,.2,1)';
          row.style.opacity = '1';
          row.style.transform = 'none';
        }, 60 + i * 50);
      });
      glyphs.forEach(function (g, i) {
        setTimeout(function () {
          g.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
          g.style.transform = 'scale(1)';
        }, 80 + i * 50);
      });
      io.unobserve(section);
    }, { threshold: 0.2 });
    io.observe(section);
  }

  /* ── 9. Gallery centre-card detection ───────────────────────────── */
  function initGallery() {
    var scroll = document.querySelector('.pb-gallery__scroll');
    if (!scroll) return;
    var cards = Array.prototype.slice.call(scroll.querySelectorAll('.pb-gallery-card'));
    function update() {
      var cx = scroll.scrollLeft + scroll.offsetWidth / 2;
      var closest = null, minDist = Infinity;
      cards.forEach(function (c) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - cx);
        if (d < minDist) { minDist = d; closest = c; }
      });
      cards.forEach(function (c) {
        c.classList.toggle('is-centre', c === closest);
      });
    }
    scroll.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── 10. Guarantee seal tilt-in ─────────────────────────────────── */
  function initGuaranteeSeal() {
    if (reduced) return;
    var seal = document.querySelector('.pb-guarantee__seal');
    if (!seal) return;
    seal.style.transform = 'rotate(12deg) scale(0.75)';
    seal.style.opacity = '0';
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seal.style.transform = 'rotate(0deg) scale(1)';
      seal.style.opacity = '1';
      io.unobserve(seal);
    }, { threshold: 0.4 });
    io.observe(seal);
  }

  /* ── 11. CTA button pulse loop ──────────────────────────────────── */
  function initCtaPulse() {
    if (reduced) return;
    var btn = document.querySelector('.pb-hero .pcard-btn');
    if (!btn) return;
    var shadow = '0 6px 18px rgba(212,162,74,0.32)';
    var pulse  = '0 6px 26px rgba(212,162,74,0.58), 0 0 0 5px rgba(212,162,74,0.12)';
    var state = false;
    setInterval(function () {
      state = !state;
      btn.style.boxShadow = state ? pulse : shadow;
      btn.style.transition = 'box-shadow .8s ease';
    }, 1600);
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initStagger();
    initCountUps();
    initHeroParallax();
    initHeroHeadline();
    initStickyCta();
    initProblemSlide();
    initVsRows();
    initGallery();
    initGuaranteeSeal();
    initCtaPulse();
  });

})();
