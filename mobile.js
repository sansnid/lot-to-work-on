/* mobile.js - adds the little menu (hamburger) button inside the search pill on phones.
   It shows/hides the Projects / About Me / Contact links. Add to EVERY page (end of body):
     <script src="mobile.js"></script>
   Nothing changes on laptops: the button is hidden there by mobile.css. */
(function () {
  var header = document.querySelector('.header');
  var search = header && header.querySelector('.search');
  if (!search || search.querySelector('.menu-btn')) return;

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'menu-btn';
  btn.setAttribute('aria-label', 'Show or hide menu'); btn.setAttribute('aria-expanded', 'true');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/></svg>';
  search.insertBefore(btn, search.firstChild);

  btn.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();            // don't focus the search box
    var closed = header.classList.toggle('nav-closed');
    btn.setAttribute('aria-expanded', String(!closed));
    document.querySelectorAll('.has-menu.open, .has-sub.open').forEach(function (n) { n.classList.remove('open'); });
  });
})();
