/* contact-popup.js - clicking "Contact" in the header opens a small card with email + Instagram,
   instead of going to contact.html. Click again, click outside, or press Esc to close. */
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  var style = document.createElement('style');
  style.textContent =
    '.contact-pop{position:absolute;z-index:60;width:min(300px,78vw);padding:18px 22px 20px;border-radius:16px;' +
    'background:#fcf8f7;color:#1c1a18;box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:left;' +
    'opacity:0;visibility:hidden;transform:translateY(-8px) scale(.96);transform-origin:top right;' +
    'transition:opacity .22s,transform .22s,visibility .22s;font-family:"Roboto",sans-serif}' +
    '.contact-pop.open{opacity:1;visibility:visible;transform:none}' +
    '.contact-pop h3{margin:0 0 3px;font:500 12px/1 "Roboto",sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.55}' +
    '.contact-pop a{display:block;margin:0 0 16px;font:400 16px/1.4 "Roboto",sans-serif;color:#1c1a18;text-decoration:none;word-break:break-all}' +
    '.contact-pop a:last-child{margin-bottom:0}' +
    '.contact-pop a:hover,.contact-pop a:focus-visible{color:#2a9a9c;text-decoration:underline}';
  document.head.appendChild(style);

  var pop = document.createElement('div');
  pop.className = 'contact-pop';
  pop.id = 'contact-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Contact');
  pop.innerHTML =
    '<h3>Email</h3><a href="mailto:sanskriti.patel@stud.hslu.ch">sanskriti.patel@stud.hslu.ch</a>' +
    '<h3>Instagram</h3><a href="https://instagram.com/kritibysans" target="_blank" rel="noopener">kritibysans</a>';
  header.appendChild(pop);

  var current = null;

  function place(link) {                       // sit just under the Contact link, right edges lined up
    var l = link.getBoundingClientRect(), h = header.getBoundingClientRect();
    pop.style.top = (l.bottom - h.top + 8) + 'px';
    pop.style.right = Math.max(0, h.right - l.right) + 'px';
    pop.style.left = 'auto';
  }
  function open(link) {
    place(link); pop.classList.add('open'); current = link;
    link.setAttribute('aria-expanded', 'true'); link.setAttribute('aria-controls', 'contact-pop');
  }
  function close() {
    pop.classList.remove('open');
    if (current) current.setAttribute('aria-expanded', 'false');
    current = null;
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href$="contact.html"]');
    if (link) {
      e.preventDefault();
      if (current === link) close(); else open(link);
    } else if (!pop.contains(e.target)) {
      close();
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (current) place(current); });
    /* ---- double-click email / instagram = copy, with a small "Copied" pill ---- */
  var toastStyle = document.createElement('style');
  toastStyle.textContent =
    '.copied-toast{position:fixed;left:50%;top:50%;z-index:100;transform:translate(-50%,-50%);' +
    'padding:10px 20px;border-radius:999px;background:rgba(28,26,24,.88);color:#fcf8f7;' +
    'font:400 13px/1 "Roboto",sans-serif;letter-spacing:.06em;pointer-events:none;' +
    'opacity:0;transition:opacity .25s}' +
    '.copied-toast.show{opacity:1}' +
    '.contact-pop a,.contact a{touch-action:manipulation}';   /* no double-tap zoom on phones */
  document.head.appendChild(toastStyle);

  var toast = document.createElement('div');
  toast.className = 'copied-toast'; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;

  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3000);   /* 3 seconds */
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {                       /* fallback for plain http */
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      ta.remove();
    });
  }

  /* one click still opens the link (after a short wait); a second click copies instead */
  var linkTimer;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.contact-pop a, .contact a');
    if (!a) return;
    e.preventDefault();
    clearTimeout(linkTimer);
    if (e.detail >= 2) {
      copyText(a.textContent.trim()).then(function () { showToast('Copied'); },
                                          function () { showToast('Could not copy'); });
      return;
    }
    linkTimer = setTimeout(function () {
      if (a.target === '_blank') window.open(a.href, '_blank', 'noopener');
      else window.location.href = a.href;
    }, 260);
  });
})();