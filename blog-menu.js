/* ════════════════════════════════════════════════════════════════
   Diet Swad — blog menu injector
   ────────────────────────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH for the article list in the hamburger menu.

   WHEN YOU PUBLISH A NEW ARTICLE: add one line to ARTICLES below and
   nothing else. Every page picks it up automatically — you do not
   touch the drawer markup on 16 pages.

   Newest article goes FIRST.

   The static "All Articles" link stays in the HTML of every page so
   crawlers always have a real, non-JS path into /blog/. The per-article
   links are progressive enhancement for humans using the menu; search
   engines reach the articles through the blog index and the sitemap.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ARTICLES = [
    {
      slug: 'arabian-dates-vs-local-dates.html',
      title: 'Arabian Dates vs Local Dates'
    },
    {
      slug: 'is-ghee-healthy-myths-vs-science.html',
      title: 'Is Ghee Actually Healthy?'
    },
    {
      slug: 'are-millet-cookies-healthy.html',
      title: 'Are Millet Cookies Actually Healthy?'
    },
    {
      slug: 'jaggery-vs-refined-sugar-vs-desi-khand.html',
      title: 'Jaggery vs Refined Sugar vs Desi Khand'
    }
  ];

  var panel = document.querySelector('[data-blog-menu]');
  if (!panel || !ARTICLES.length) return;

  // Pages live either at the site root or inside /blog/. Work out which,
  // so the same list produces correct relative links from both depths.
  var inBlogDir = /\/blog\//.test(window.location.pathname);
  var prefix = inBlogDir ? '' : 'blog/';

  var here = window.location.pathname.split('/').pop();

  ARTICLES.forEach(function (article) {
    // Don't link the article the reader is already on.
    if (inBlogDir && here === article.slug) return;

    var link = document.createElement('a');
    link.className = 'drawer-sub-link';
    link.href = prefix + article.slug;
    link.textContent = article.title;
    panel.appendChild(link);
  });

  // The drawer closes on link clicks via a listener bound at page load,
  // which ran before these links existed. Close on our own links too.
  var drawer = document.getElementById('mobileDrawer');
  var hamburger = document.getElementById('navHamburger');
  if (!drawer) return;

  panel.addEventListener('click', function (e) {
    if (!e.target.closest('.drawer-sub-link')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
})();
