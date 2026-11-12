/* nav.js - tap-to-open for the dropdown on touch screens (desktop uses hover) */
(function () {
  var touch = window.matchMedia('(hover: none)');
  var items = document.querySelectorAll('.has-menu, .has-sub');

  function closeAll(except) {
    items.forEach(function (li) { if (li !== except && !li.contains(except)) li.classList.remove('open'); });
  }

  items.forEach(function (li) {
    var link = li.querySelector(':scope > a');
    if (!link) return;
    link.addEventListener('click', function (e) {
      if (!touch.matches || li.classList.contains('open')) return;   // 2nd tap = follow the link
      e.preventDefault();
      closeAll(li);
      li.classList.add('open');
    });
  });

  document.addEventListener('click', function (e) { if (!e.target.closest('.has-menu')) closeAll(null); });
  window.addEventListener('hashchange', function () { closeAll(null); });
})();
