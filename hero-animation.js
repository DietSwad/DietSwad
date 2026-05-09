/**
 * Diet Swad — Hero Scroll Animation
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-driven canvas animation. 64 WebP frames extracted from an 8-second
 * video of ingredients assembling into heart-shaped products.
 *
 * The canvas plays forward as the user scrolls down, and backward as they
 * scroll up — giving full control of the narrative to the visitor.
 *
 * Approach: Canvas 2D (no Three.js). Gold glow via CSS filter on completion.
 * Performance: Progressive frame loading, rAF-throttled draw, passive scroll.
 *
 * Frames: hero-frames/frame_001.webp → frame_026.webp
 *         26 frames deduped from original 64 (threshold 1.5 perceptual diff)
 *         540×960px WebP, ~112KB avg, ~2.9MB total
 *         Loaded: frame 1 on paint, frames 2-6 immediately, 7-26 on idle
 *
 * To revert: delete hero-frames/, rename hero-frames.bak-2026-05-04-pre-dedup/ → hero-frames/
 *            then restore TOTAL_FRAMES→64, CRITICAL_END→10 in CONFIG below.
 *
 * Text choreography (scroll progress 0→1) — timed against the new video:
 *   0%–20%  — .hero-intro  "What if Snacks were just... Food?" (fully visible)
 *   20%–34% — .hero-intro fades out + slides up
 *   20%–50% — Ingredients in motion (text off-screen, only floats peek through)
 *   46%    — .hero-label  "HANDCRAFTED · KOLKATA" fades in
 *   50%    — .hero-end-line1 "Real ingredients." (product settles on slate)
 *   60%    — .hero-end-line2 "Real food."
 *   70%    — .hero-end-line3 "Really simple."
 *   80%    — .hero-cta-wrap  two buttons fade in
 *   55%    — Gold glow activates on canvas (post heart formation)
 *
 * Scroll hint: hidden as soon as user scrolls even slightly (progress > 4%)
 *
 * Reduced motion: Shows final frame (complete hearts) statically.
 *                 Intro hidden, end state fully visible. Sticky scroll removed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────

  const CONFIG = {
    TOTAL_FRAMES:  26,
    FRAME_PATH:    'hero-frames/frame_%NUM%.webp', // Relative to index.html
    SCROLL_HEIGHT: '150vh', // Total height of hero section (scroll distance)
    IDLE_BATCH:    5,        // Frames to load per idle callback chunk
    CRITICAL_END:  6,        // Frames 0–5 are critical (loaded before bind)
  };

  // Text reveal cues — scroll progress values (0 to 1).
  // New-video timing: ingredients assemble 0–37%, products settle 37–100%.
  const CUES = {
    introFade: 0.20,   // Intro begins fading OUT at 20%
    label:     0.46,   // "HANDCRAFTED · KOLKATA" — just before products settle
    endLine1:  0.50,   // "Real ingredients." — product on slate
    endLine2:  0.60,   // "Real food."
    endLine3:  0.70,   // "Really simple."
    cta:       0.80,   // Two buttons
    glow:      0.55,   // Canvas warmth filter — after heart formation
  };

  const FADE_WINDOW       = 0.08; // End elements fade in over 8% scroll (tighter — more breathing room between lines)
  const INTRO_FADE_WINDOW = 0.14; // Intro fades out over 14% scroll

  // Stable viewport height — locked to the innerHeight at script evaluation.
  // Never updated after that. Mobile URL-bar collapse fires resize events that
  // grow innerHeight; accepting those updates changes the cover-fill scale and
  // produces a visible zoom jump on every scroll-past-first interaction.
  let stableVh  = window.innerHeight;
  let resizeRaf = null;

  // ─── STATE ─────────────────────────────────────────────────────────────────

  const state = {
    frames:        new Array(CONFIG.TOTAL_FRAMES).fill(null),
    loadedCount:   0,
    currentFrame:  0,
    ticking:       false,
    fullyLoaded:   false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  // ─── DOM REFS ──────────────────────────────────────────────────────────────

  const el = {
    section:  null, // Populated in init()
    canvas:   null,
    loadBar:  null,
    intro:    null, // .hero-intro   — initial question text block
    label:    null, // .hero-label   — "HANDCRAFTED · KOLKATA" (in end state)
    endLine1: null, // .hero-end-line1
    endLine2: null, // .hero-end-line2
    endLine3: null, // .hero-end-line3
    cta:      null, // .hero-cta-wrap
    scroll:   null, // .hero-scroll-hint
  };

  let ctx = null;

  // ─── UTILS ─────────────────────────────────────────────────────────────────

  function frameUrl(index) {
    // index is 0-based; filenames are 1-based 3-digit zero-padded
    const num = String(index + 1).padStart(3, '0');
    return CONFIG.FRAME_PATH.replace('%NUM%', num);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // Cubic ease-out — fast start, smooth landing
  function easeOut3(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ─── CANVAS ────────────────────────────────────────────────────────────────

  function resize() {
    if (!el.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;

    el.canvas.width  = vw * dpr;
    el.canvas.height = stableVh * dpr;
    el.canvas.style.width  = vw + 'px';
    el.canvas.style.height = stableVh + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(state.currentFrame);
  }

  // rAF-debounced resize — coalesces rapid chrome-toggle bursts into one call
  function scheduleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      resize();
    });
  }

  /**
   * Draw a frame onto the canvas using cover-fill behaviour.
   * Centres the image and scales to fill the canvas, cropping any overflow.
   * Matches CSS `object-fit: cover` semantics.
   */
  function drawFrame(index) {
    const img = state.frames[index];
    if (!img || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw  = el.canvas.width  / dpr;
    const ch  = el.canvas.height / dpr;
    const iw  = img.naturalWidth;
    const ih  = img.naturalHeight;

    // Cover scale + vertical offset: shift the image down so products
    // (date bites) are visible below the text overlay, while still
    // filling the full canvas top-to-bottom (no dark gaps).
    // Scale is computed against (ch + 2×offset) so the image overshoots
    // both edges even after the downward nudge.
    const VERT_OFFSET = ch * 0.07;
    const scale = Math.max(cw / iw, (ch + 2 * VERT_OFFSET) / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const x     = (cw - drawW) / 2;
    const y     = (ch - drawH) / 2 + VERT_OFFSET;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, drawW, drawH);
  }

  // ─── SCROLL CALCULATION ────────────────────────────────────────────────────

  function getScrollProgress() {
    const rect    = el.section.getBoundingClientRect();
    const scrolled = -rect.top; // Distance scrolled into section
    const total    = el.section.offsetHeight - stableVh;
    return clamp(scrolled / total, 0, 1);
  }

  function progressToFrame(progress) {
    return Math.round(progress * (CONFIG.TOTAL_FRAMES - 1));
  }

  // ─── TEXT CHOREOGRAPHY ─────────────────────────────────────────────────────

  function updateText(progress) {

    // ── Intro text: fades OUT as the user scrolls ──────────────────────────
    if (el.intro) {
      if (progress <= CUES.introFade) {
        // Fully visible — don't thrash style unnecessarily
        if (el.intro.style.opacity !== '1') {
          el.intro.style.opacity   = '1';
          el.intro.style.transform = 'translateY(0px)';
        }
      } else {
        const t     = clamp((progress - CUES.introFade) / INTRO_FADE_WINDOW, 0, 1);
        const eased = easeOut3(t);
        el.intro.style.opacity   = (1 - eased).toFixed(3);
        // Gentle upward slide as it disappears
        el.intro.style.transform = `translateY(-${(eased * 18).toFixed(1)}px)`;
      }
    }

    // ── End state: fades IN as hearts form ─────────────────────────────────
    const endEntries = [
      { el: el.label,    cue: CUES.label    },
      { el: el.endLine1, cue: CUES.endLine1 },
      { el: el.endLine2, cue: CUES.endLine2 },
      { el: el.endLine3, cue: CUES.endLine3 },
      { el: el.cta,      cue: CUES.cta      },
    ];

    endEntries.forEach(({ el: elem, cue }) => {
      if (!elem) return;

      if (progress < cue) {
        // Not yet revealed — keep hidden but don't thrash style
        if (elem.style.opacity !== '0') {
          elem.style.opacity   = '0';
          elem.style.transform = 'translateY(24px)';
        }
        return;
      }

      const t       = clamp((progress - cue) / FADE_WINDOW, 0, 1);
      const eased   = easeOut3(t);
      const opacity = eased.toFixed(3);
      const yShift  = ((1 - eased) * 24).toFixed(1);

      elem.style.opacity   = opacity;
      elem.style.transform = `translateY(${yShift}px)`;
    });

    // ── Scroll hint: vanish the moment user starts scrolling ───────────────
    if (el.scroll) {
      el.scroll.style.opacity = progress > 0.04 ? '0' : '';
    }
  }

  // ─── GOLD GLOW ON COMPLETION ───────────────────────────────────────────────

  /**
   * As the heart fully forms, apply a subtle CSS filter warmth to the canvas.
   * Enhances the natural amber spotlight already present in the video.
   * CSS filter is GPU-accelerated — zero canvas redraw cost.
   */
  function updateGlow(progress) {
    if (!el.canvas) return;

    if (progress >= CUES.glow) {
      const t = clamp((progress - CUES.glow) / 0.10, 0, 1);
      const brightness = (1 + t * 0.08).toFixed(3);
      const saturate   = (1 + t * 0.12).toFixed(3);
      el.canvas.style.filter = `brightness(${brightness}) saturate(${saturate})`;
    } else {
      if (el.canvas.style.filter) el.canvas.style.filter = '';
    }
  }

  // ─── MAIN SCROLL HANDLER ───────────────────────────────────────────────────

  function onScroll() {
    if (state.reducedMotion) { state.ticking = false; return; }

    const progress   = getScrollProgress();
    const frameIndex = progressToFrame(progress);

    // Draw frame only if it changed
    if (frameIndex !== state.currentFrame) {
      state.currentFrame = frameIndex;

      if (state.frames[frameIndex]) {
        drawFrame(frameIndex);
      } else {
        // Target frame not loaded yet — find nearest loaded fallback
        findAndDrawNearestFrame(frameIndex);
      }
    }

    updateText(progress);
    updateGlow(progress);
    state.ticking = false;
  }

  /**
   * When the target frame isn't loaded, find the closest available frame
   * by searching outward from the target index in both directions.
   */
  function findAndDrawNearestFrame(target) {
    for (let offset = 1; offset < CONFIG.TOTAL_FRAMES; offset++) {
      const prev = target - offset;
      const next = target + offset;
      if (prev >= 0 && state.frames[prev]) { drawFrame(prev); return; }
      if (next < CONFIG.TOTAL_FRAMES && state.frames[next]) { drawFrame(next); return; }
    }
  }

  function scheduleScroll() {
    if (!state.ticking) {
      state.ticking = true;
      requestAnimationFrame(onScroll);
    }
  }

  // ─── LOADING PROGRESS BAR ──────────────────────────────────────────────────

  function updateLoadBar() {
    if (!el.loadBar) return;
    const pct = (state.loadedCount / CONFIG.TOTAL_FRAMES) * 100;
    el.loadBar.style.width = pct + '%';

    if (state.loadedCount >= CONFIG.TOTAL_FRAMES) {
      state.fullyLoaded = true;
      // Fade bar out after a short delay
      el.loadBar.style.opacity = '0';
    }
  }

  // ─── FRAME LOADING ─────────────────────────────────────────────────────────

  function loadFrameAt(index) {
    return new Promise((resolve) => {
      if (state.frames[index]) { resolve(); return; }

      const img      = new Image();
      img.decoding   = 'async'; // Non-blocking image decode hint
      img.onload     = () => {
        state.frames[index] = img;
        state.loadedCount++;
        updateLoadBar();
        resolve();
      };
      img.onerror = () => {
        // On load error, count it and move on — don't stall animation
        state.loadedCount++;
        updateLoadBar();
        resolve();
      };
      img.src = frameUrl(index);
    });
  }

  /**
   * Phase 1: Load frame 0 first (shown immediately on page paint).
   * Phase 2: Load frames 1–9 (covers first scroll gesture).
   */
  async function preloadCritical() {
    // Frame 0 — blocks until visible
    await loadFrameAt(0);
    drawFrame(0);

    // Frames 1–9 — load in parallel, don't await all
    const batch = [];
    for (let i = 1; i < CONFIG.CRITICAL_END; i++) {
      batch.push(loadFrameAt(i));
    }
    await Promise.all(batch);
  }

  /**
   * Phase 3: Load frames 10–63 in idle-time batches.
   * Uses requestIdleCallback to avoid blocking user interactions.
   */
  function preloadRemaining() {
    let index = CONFIG.CRITICAL_END;

    function loadBatch(deadline) {
      // Keep loading as long as we have idle time or a timeout fires
      while (
        index < CONFIG.TOTAL_FRAMES &&
        (deadline.timeRemaining() > 4 || deadline.didTimeout)
      ) {
        loadFrameAt(index);
        index++;
      }

      if (index < CONFIG.TOTAL_FRAMES) {
        requestIdleCallback(loadBatch, { timeout: 3000 });
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadBatch, { timeout: 3000 });
    } else {
      // Fallback for browsers without requestIdleCallback (older Safari)
      let i = CONFIG.CRITICAL_END;
      function fallback() {
        const end = Math.min(i + CONFIG.IDLE_BATCH, CONFIG.TOTAL_FRAMES);
        while (i < end) { loadFrameAt(i); i++; }
        if (i < CONFIG.TOTAL_FRAMES) setTimeout(fallback, 150);
      }
      setTimeout(fallback, 600);
    }
  }

  // ─── REDUCED MOTION INIT ───────────────────────────────────────────────────

  /**
   * For users who prefer reduced motion:
   * - Show the final frame (two complete hearts) as a static image
   * - Hide the intro question; show the end state fully visible
   * - Remove the sticky scroll height so the page behaves normally
   */
  function initReducedMotion() {
    // Collapse the hero to normal viewport height
    if (el.section) el.section.style.height = '100vh';

    // Show final frame (the complete hearts)
    loadFrameAt(CONFIG.TOTAL_FRAMES - 1).then(() => {
      drawFrame(CONFIG.TOTAL_FRAMES - 1);
      if (el.canvas) el.canvas.style.filter = 'brightness(1.06) saturate(1.1)';
    });

    // Hide intro, show end state instantly
    if (el.intro) {
      el.intro.style.opacity   = '0';
      el.intro.style.transform = 'translateY(-18px)';
    }
    [el.label, el.endLine1, el.endLine2, el.endLine3, el.cta].forEach((elem) => {
      if (elem) {
        elem.style.opacity   = '1';
        elem.style.transform = 'none';
      }
    });

    // Hide scroll hint
    if (el.scroll) el.scroll.style.display = 'none';
  }

  // ─── INIT ──────────────────────────────────────────────────────────────────

  async function init() {
    // Resolve DOM refs
    el.section  = document.getElementById('hero');
    el.canvas   = document.getElementById('hero-canvas');
    el.loadBar  = document.getElementById('hero-load-bar');
    el.intro    = document.querySelector('.hero-intro');
    el.label    = document.querySelector('.hero-label');
    el.endLine1 = document.querySelector('.hero-end-line1');
    el.endLine2 = document.querySelector('.hero-end-line2');
    el.endLine3 = document.querySelector('.hero-end-line3');
    el.cta      = document.querySelector('.hero-cta-wrap');
    el.scroll   = document.querySelector('.hero-scroll-hint');

    if (!el.section || !el.canvas) {
      console.warn('[hero-animation] Required elements not found. Aborting.');
      return;
    }

    ctx = el.canvas.getContext('2d');

    // Intro: visible immediately from page load
    if (el.intro) {
      el.intro.style.opacity   = '1';
      el.intro.style.transform = 'translateY(0)';
    }

    // End state elements: hidden until scroll reaches their cue
    [el.label, el.endLine1, el.endLine2, el.endLine3, el.cta].forEach((elem) => {
      if (elem) {
        elem.style.opacity   = '0';
        elem.style.transform = 'translateY(24px)';
      }
    });

    // Handle reduced motion
    if (state.reducedMotion) {
      initReducedMotion();
      return;
    }

    // Setup canvas dimensions
    resize();
    window.addEventListener('resize', scheduleResize, { passive: true });

    // Load critical frames then bind scroll
    await preloadCritical();
    window.addEventListener('scroll', scheduleScroll, { passive: true });

    // Load remaining frames in background
    preloadRemaining();
  }

  // ─── ENTRY POINT ───────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
