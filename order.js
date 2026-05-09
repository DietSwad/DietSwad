(function () {
  'use strict';

  function readCart() {
    try { return JSON.parse(localStorage.getItem('dietswad_cart')) || {}; }
    catch (_) { return {}; }
  }
  function writeCart(cart) {
    localStorage.setItem('dietswad_cart', JSON.stringify(cart));
  }

  var PRODUCTS = [
    { name: 'Power Bites',            slug: 'power-bites',            price: 499 },
    { name: 'Royal Bites',            slug: 'royal-bites',            price: 499 },
    { name: 'Peanut-Sesame Delights', slug: 'peanut-sesame-delights', price: 499 },
    { name: 'Millet Butter Cookies',  slug: 'millet-butter-cookies',  price: 499 },
    { name: 'Millet Coconut Cookies', slug: 'millet-coconut-cookies', price: 499 },
    { name: 'Millet Choco Cookies',   slug: 'millet-choco-cookies',   price: 499 },
    { name: 'Roasted Cashews',        slug: 'roasted-cashews',        price: 499 },
  ];

  function fmt(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  window.changeQty = function (btn, delta) {
    var span = btn.parentElement.querySelector('.ord-qty-val');
    var val = Math.max(0, parseInt(span.textContent, 10) + delta);
    span.textContent = val;
    var row = btn.closest('.ord-prod-row');
    if (row) {
      var slug = row.getAttribute('data-ord-slug');
      var cart = readCart();
      if (val > 0) {
        cart[slug] = val;
        // Promote this row out of "extra" so "Show fewer" won't hide it again
        row.classList.remove('ord-prod-row--extra');
      } else {
        delete cart[slug];
      }
      writeCart(cart);
    }
    updateSummary();
  };

  function updateSummary() {
    var spans = document.querySelectorAll('.ord-qty-val');
    var grand = 0;

    spans.forEach(function (s, i) {
      var qty = parseInt(s.textContent, 10);
      var sub = qty * PRODUCTS[i].price;
      grand += sub;

      var qlEl = document.getElementById('ord-ql-' + i);
      var spEl = document.getElementById('ord-sp-' + i);
      var sumRow = qlEl ? qlEl.closest('.ord-sum-row') : null;
      if (qty > 0) {
        if (sumRow) sumRow.style.display = '';
        if (qlEl) qlEl.textContent = 'Qty: ' + qty;
        if (spEl) { spEl.textContent = fmt(sub); spEl.className = 'ord-sum-price'; }
      } else {
        if (sumRow) sumRow.style.display = 'none';
      }
    });

    var grandEl  = document.getElementById('ord-grand-total');
    var footerEl = document.getElementById('ord-footer-total');
    if (grandEl) {
      grandEl.innerHTML = fmt(grand) + '<small>INR</small>';
      grandEl.classList.remove('is-popping');
      void grandEl.offsetWidth; // reflow to restart animation
      grandEl.classList.add('is-popping');
    }
    if (footerEl) footerEl.textContent = fmt(grand);
  }

  function showError(msg) {
    var err = document.getElementById('ord-error');
    if (!err) return;
    err.textContent = msg;
    err.hidden = false;
    err.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError() {
    var err = document.getElementById('ord-error');
    if (err) { err.hidden = true; err.textContent = ''; }
  }

  /* ── Smart product selection ───────────────────────────────────────
     If ?product=<slug> is in the URL: show only that product,
     hide others, reveal "Add more products" button.
     No param → show all 7 products as normal.
  ── */
  function initProductSelection() {
    var params = new URLSearchParams(window.location.search);
    var slug   = params.get('product');

    // Merge ?product=slug into persistent cart
    var cart = readCart();
    if (slug) {
      var valid = PRODUCTS.some(function (p) { return p.slug === slug; });
      if (valid) {
        cart[slug] = (cart[slug] || 0) + 1;
        writeCart(cart);
      }
      // Strip param so refresh doesn't re-add
      history.replaceState({}, '', location.pathname);
    }

    // Populate all qty spans from cart
    var rows = document.querySelectorAll('.ord-prod-row');
    rows.forEach(function (row) {
      var rowSlug = row.getAttribute('data-ord-slug');
      var qtyVal  = row.querySelector('.ord-qty-val');
      if (qtyVal) qtyVal.textContent = cart[rowSlug] || 0;
    });

    // If the cart has any items, hide zero-qty rows and reveal "Add more" button
    var hasItems = Object.keys(cart).some(function (k) { return cart[k] > 0; });
    if (hasItems) {
      var hasExtras = false;
      rows.forEach(function (row) {
        var rowSlug = row.getAttribute('data-ord-slug');
        if (!(cart[rowSlug] > 0)) {
          row.classList.add('ord-prod-row--extra');
          row.style.display = 'none';
          hasExtras = true;
        }
      });
      if (hasExtras) {
        var moreBtn = document.getElementById('ord-more-btn');
        if (moreBtn) moreBtn.hidden = false;
      }
    }
  }

  /* ── Toggle extra products expand/collapse ─────────────────────── */
  window.toggleMoreProducts = function (btn) {
    var extras   = document.querySelectorAll('.ord-prod-row--extra');
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    var label    = btn.querySelector('.ord-more-label');
    var icon     = btn.querySelector('.ord-more-icon');

    if (expanded) {
      extras.forEach(function (r) {
        r.style.display = 'none';
        r.classList.remove('is-revealing');
      });
      btn.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = 'Add more products';
      if (icon)  icon.textContent  = '+';
    } else {
      extras.forEach(function (r, i) {
        r.style.display = 'flex';
        r.classList.remove('is-revealing');
        void r.offsetWidth; // reflow to restart animation
        r.classList.add('is-revealing');
        // stagger each row slightly
        r.style.animationDelay = (i * 0.055) + 's';
      });
      btn.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = 'Show fewer products';
      if (icon)  icon.textContent  = '+'; // CSS rotates it 45° via [aria-expanded="true"]
    }
  };

  window.handleSubmit = function (e) {
    e.preventDefault();
    clearError();

    // Honeypot — silent fake-success if bot filled the hidden field
    var hp = document.querySelector('input.ord-hp');
    if (hp && hp.value) {
      window.location.href = 'thank-you.html';
      return;
    }

    // At least one product must have qty > 0
    var spans = document.querySelectorAll('.ord-qty-val');
    var items = [];
    var total = 0;
    spans.forEach(function (s, i) {
      var qty = parseInt(s.textContent, 10);
      if (qty > 0) {
        items.push({ name: PRODUCTS[i].name, qty: qty, price: PRODUCTS[i].price });
        total += qty * PRODUCTS[i].price;
      }
    });

    if (items.length === 0) {
      showError('Please add at least one product before placing your order.');
      document.querySelector('.ord-products').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Browser native field validation (shows tooltips even under novalidate)
    var form = document.getElementById('orderForm');
    if (!form.reportValidity()) return;

    // Collect form data
    var data     = new FormData(form);
    var customer = {
      name:    data.get('name'),
      phone:   data.get('phone'),
      email:   data.get('email'),
      address: data.get('address'),
      city:    data.get('city'),
      pincode: data.get('pincode'),
      notes:   data.get('notes') || '',
    };

    // Persist for thank-you page — Phase 1b replaces with POST /api/create-order
    try {
      sessionStorage.setItem('dietswad_pending_order', JSON.stringify({
        items: items, customer: customer, total: total, ts: Date.now(),
      }));
    } catch (_) {}

    // Clear persistent cart on successful order
    localStorage.removeItem('dietswad_cart');

    window.location.href = 'thank-you.html';
  };

  // requestSubmit polyfill for older iOS
  if (!HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function () {
      var btn = document.createElement('button');
      btn.type = 'submit';
      btn.style.display = 'none';
      this.appendChild(btn);
      btn.click();
      this.removeChild(btn);
    };
  }

  // UTM / analytics placeholder capture — Phase 1b reads these server-side
  function captureAnalytics() {
    var params = new URLSearchParams(window.location.search);

    function getCookie(name) {
      var m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
      return m ? decodeURIComponent(m[1]) : '';
    }

    var map = {
      'utm-source':   params.get('utm_source')   || '',
      'utm-medium':   params.get('utm_medium')   || '',
      'utm-campaign': params.get('utm_campaign') || '',
      'fbp':          getCookie('_fbp') || '',
      'fbc':          getCookie('_fbc') || params.get('fbclid') || '',
      'ga-client-id': '',
    };

    Object.keys(map).forEach(function (key) {
      var el = document.getElementById('ord-hid-' + key);
      if (el) el.value = map[key];
    });
  }

  // Init sequence
  initProductSelection();
  captureAnalytics();
  updateSummary();

  // Nav scroll-state (switch logo at 60px)
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var logoImg     = nav.querySelector('.nav-logo');
    var logoDefault = 'Assets/Logo_and_icons/normal horizontal logo background removed.png';
    var logoGolden  = 'Assets/Logo_and_icons/horizontal golden logo transparent.png';
    function updateNav() {
      var scrolled = window.scrollY > 60;
      nav.classList.toggle('is-scrolled', scrolled);
      if (logoImg) logoImg.src = scrolled ? logoGolden : logoDefault;
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // Mobile nav drawer
  var hamburger = document.getElementById('navHamburger');
  var drawer    = document.getElementById('mobileDrawer');
  var backdrop  = document.getElementById('drawerBackdrop');
  var closeBtn  = document.getElementById('drawerClose');
  if (hamburger && drawer) {
    var links = drawer.querySelectorAll('.drawer-link');

    function openDrawer() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    links.forEach(function (l) { l.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }
})();
