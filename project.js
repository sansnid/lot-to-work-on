/* project.js - the header slides away while you scroll down (so the images are undisturbed)
   and comes back as soon as you scroll up, touch the top edge of the screen, or use the menu/search. */
(function () {
  var header = document.querySelector('.header');
  if (!header) return;
  var lastY = window.scrollY, ticking = false;
  var STEP = 6;              // ignore tiny scrolls
  var TOP_ZONE = 80;         // always show the header this close to the top of the page (px)

  function show() { header.classList.remove('is-hidden'); }
  function hide() { header.classList.add('is-hidden'); }
  function inUse() {         // never hide while the search is focused or a dropdown is open
    return header.matches(':focus-within') || !!header.querySelector('.has-menu.open');
  }

  function update() {
    ticking = false;
    var y = Math.max(0, window.scrollY), dy = y - lastY;
    if (y < TOP_ZONE) { show(); lastY = y; return; }
    if (Math.abs(dy) < STEP) return;
    if (dy > 0 && !inUse()) hide(); else if (dy < 0) show();
    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  header.addEventListener('focusin', show);                     // keyboard users
  document.addEventListener('mousemove', function (e) { if (e.clientY < 18) show(); });   // mouse at the top edge
})();
