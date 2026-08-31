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
      slug: 'bringing-back-old-food-habits.html',
      title: 'Old Food Habits, Modern Week'
    },
    {
      slug: 'how-to-spot-sugar-coated-dates.html',
      title: 'Spotting Sugar-Coated Dates'
    },
    {
      slug: 'date-sweets-vs-sugar-mithai.html',
      title: 'Date Sweets vs Sugar Mithai'
    },
    {
      slug: 'healthy-snack-schedule-india.html',
      title: 'When to Snack, and How Much'
    },
    {
      slug: 'why-healthy-eating-is-hard-in-india.html',
      title: 'Why Eating Well Is Hard in India'
    },
    {
      slug: 'what-is-really-inside-your-daily-biscuit.html',
      title: 'What Is Inside Your Daily Biscuit'
    },
    {
      slug: '10-everyday-indian-foods-label-check.html',
      title: '10 Kitchen Foods, Label by Label'
    },
    {
      slug: 'how-to-read-a-food-label-in-60-seconds.html',
      title: 'Read Any Label in 60 Seconds'
    },
    {
      slug: 'dadi-nani-ka-khana-food-wisdom.html',
      title: 'Five Things Dadi Got Right'
    },
    {
      slug: 'how-diet-swad-started.html',
      title: 'How Diet Swad Started'
    },
    {
      slug: 'india-vs-europe-food-standards.html',
      title: 'Why Recipes Differ by Country'
    },
    {
      slug: '7-day-snack-swap-challenge.html',
      title: 'The 7-Day Snack Swap'
    },
    {
      slug: 'preservatives-in-indian-food-explained.html',
      title: 'What Preservatives Do'
    },
    {
      slug: 'ginger-cinnamon-fennel-what-research-says.html',
      title: 'Ginger, Cinnamon and Fennel'
    },
    {
      slug: 'magnesium-rich-foods-india.html',
      title: 'Magnesium: What It Does'
    },
    {
      slug: 'iron-rich-foods-for-periods.html',
      title: 'Iron-Rich Indian Foods'
    },
    {
      slug: 'why-period-cramps-happen.html',
      title: 'Why Period Cramps Happen'
    },
    {
      slug: 'india-packaged-food-health-numbers.html',
      title: "How India's Snacking Changed"
    },
    {
      slug: 'do-dates-spike-blood-sugar.html',
      title: 'Dates and Blood Sugar'
    },
    {
      slug: 'nolen-gur-khejur-gur-bengal.html',
      title: 'Nolen Gur, Explained'
    },
    {
      slug: 'methuselah-2000-year-old-date-seed.html',
      title: 'A Seed That Grew After 2,000 Years'
    },
    {
      slug: 'why-packaged-food-is-so-cheap.html',
      title: 'Why Packaged Food Is So Cheap'
    },
    {
      slug: 'what-does-ultra-processed-food-mean.html',
      title: 'What "Ultra-Processed" Means'
    },
    {
      slug: 'are-peanuts-healthy.html',
      title: 'Are Peanuts Healthy?'
    },
    {
      slug: 'natural-pre-workout-food-india.html',
      title: 'What to Eat Before a Workout'
    },
    {
      slug: 'late-night-snacking-what-to-eat.html',
      title: 'Late-Night Cravings'
    },
    {
      slug: 'healthy-snacks-for-kids-tiffin.html',
      title: "Healthy Snacks for Kids' Tiffin"
    },
    {
      slug: 'what-is-really-inside-packaged-snacks.html',
      title: "What's Really Inside Packaged Snacks"
    },
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
    // Every article is listed on every page, including the one being
    // read: the menu is the blog's table of contents, so a title going
    // missing depending on where you stand is more confusing than the
    // redundant self-link it avoids. The current one is marked instead.
    var link = document.createElement('a');
    link.className = 'drawer-sub-link';
    link.href = prefix + article.slug;
    link.textContent = article.title;

    if (inBlogDir && here === article.slug) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }

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
