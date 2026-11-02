/* projects.js - header stays fixed, only the title changes as you scroll */
(function () {
  var header = document.querySelector('.header');
  var title = document.querySelector('.page-title');
  var en = title.querySelector('.pt-en');
  var hi = title.querySelector('.pt-hi');
  var sections = document.querySelectorAll('.gallery[data-title]');
  var current = '';

  header.classList.add('titled');

  function setTitle(s, instant) {
    if (s.id === current) return;
    current = s.id;
    function apply() { en.textContent = s.dataset.title; hi.textContent = s.dataset.hi || ''; }
    if (instant) { apply(); return; }
    title.classList.add('swap');                       // fade out, swap text, fade in
    setTimeout(function () { apply(); title.classList.remove('swap'); }, 220);
  }

  var first = true;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { setTitle(e.target, first); first = false; }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });               // a thin band near the top of the screen

  sections.forEach(function (s) { io.observe(s); });
})();


/* hover sound: plays while a card is hovered (the GIF frame). Off until the visitor
   clicks the speaker button, because browsers block sound before a click. */
(function () {
  var cards = document.querySelectorAll('.card[data-sound]');
  var btn = document.querySelector('.sound-toggle');
  if (!cards.length || !btn) return;
  var enabled = false;

  cards.forEach(function (card) {
    var audio = new Audio(card.dataset.sound);
    audio.preload = 'metadata';
    audio.loop = true;            // remove this line to play the sound once per hover
    audio.volume = 0.7;
    card._audio = audio;

    function start() {
      if (!enabled) return;
      audio.currentTime = 0;
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});   // ignore missing files / blocked playback
    }
    function stop() { audio.pause(); audio.currentTime = 0; }

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', start);         // keyboard users
    card.addEventListener('blur', stop);
  });

  btn.addEventListener('click', function () {
    enabled = !enabled;
    btn.classList.toggle('on', enabled);
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? 'Turn hover sound off' : 'Turn hover sound on');
    if (!enabled) cards.forEach(function (c) { c._audio.pause(); });
  });
})();
