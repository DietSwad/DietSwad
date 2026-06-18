/* Diet Swad — visible FAQ accordion, rendered from the page's own FAQPage JSON-LD.
   AEO rationale: answer engines extract best from VISIBLE structured Q&A *plus*
   schema. The FAQ already lives in JSON-LD; this surfaces the identical text as a
   visible <details> accordion so there is zero risk of the two drifting apart and
   no duplicated/edited claims (stays inside label copy by construction).

   Usage: place <section id="faq"></section> where the FAQ should appear, then
   include this file with `defer`. If the page has no FAQPage JSON-LD, it no-ops. */
(function () {
  function getFaqItems() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var data;
      try { data = JSON.parse(scripts[i].textContent); } catch (e) { continue; }
      var nodes = Array.isArray(data) ? data : (data['@graph'] || [data]);
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node && node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
          return node.mainEntity.map(function (q) {
            var ans = q.acceptedAnswer && q.acceptedAnswer.text ? q.acceptedAnswer.text : '';
            return { q: q.name || '', a: ans };
          }).filter(function (it) { return it.q && it.a; });
        }
      }
    }
    return [];
  }

  function injectStyles() {
    if (document.getElementById('faq-accordion-styles')) return;
    var css =
      '.faq-section{max-width:760px;margin:0 auto;padding:3.5rem 1.25rem 1rem}' +
      '.faq-section h2{font-size:1.6rem;margin:0 0 1.4rem;text-align:center;letter-spacing:.01em}' +
      '.faq-section details{border:1px solid rgba(0,0,0,.12);border-radius:12px;margin:.55rem 0;' +
      'background:rgba(255,255,255,.55);overflow:hidden;transition:border-color .2s ease}' +
      '.faq-section details[open]{border-color:rgba(0,0,0,.28)}' +
      '.faq-section summary{cursor:pointer;list-style:none;padding:1rem 2.6rem 1rem 1.1rem;' +
      'font-weight:600;font-size:1.02rem;line-height:1.45;position:relative;outline-offset:3px}' +
      '.faq-section summary::-webkit-details-marker{display:none}' +
      '.faq-section summary::after{content:"+";position:absolute;right:1.1rem;top:50%;' +
      'transform:translateY(-50%);font-size:1.4rem;font-weight:400;transition:transform .2s ease}' +
      '.faq-section details[open] summary::after{transform:translateY(-50%) rotate(45deg)}' +
      '.faq-section .faq-answer{padding:0 1.1rem 1.1rem;line-height:1.65;opacity:.88}';
    var style = document.createElement('style');
    style.id = 'faq-accordion-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function render() {
    var mount = document.getElementById('faq');
    if (!mount) return;
    var items = getFaqItems();
    if (!items.length) return;

    injectStyles();
    mount.classList.add('faq-section');
    mount.setAttribute('aria-label', 'Frequently asked questions');

    var html = '<h2>Frequently Asked Questions</h2>';
    items.forEach(function (it) {
      var q = it.q.replace(/</g, '&lt;');
      var a = it.a.replace(/</g, '&lt;');
      html += '<details><summary>' + q + '</summary>' +
              '<div class="faq-answer">' + a + '</div></details>';
    });
    mount.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
