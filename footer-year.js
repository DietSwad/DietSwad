/* Auto-render the current year in the footer copyright.
   Replaces any hard-coded year so "© 2025" never goes stale.
   Usage: add <span id="copyright-year">2025</span> in the footer,
   then include this file before </body>. */
(function () {
  var el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
})();
