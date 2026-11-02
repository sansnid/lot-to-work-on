/* search.js - type in "Find more" and browse matching pages. Add to EVERY page:
     <link rel="stylesheet" href="search.css">   and   <script src="search.js"></script> (end of body)
   To make something searchable, add a line to INDEX below:
     t = title, u = link, c = category label, d = short description, k = extra search words */
(function () {
  var INDEX = [
    { t: 'Home', u: 'index.html', c: 'Page', d: 'Welcome to संस्कृति, the portfolio of Sanskriti Patel.', k: 'home start portfolio sanskriti kriti' },
    { t: 'About me', u: 'about.html', c: 'Page', d: 'Design student with experience in film and video communication, exploring spatial design.', k: 'about who bio me student design nid ahmedabad india hochschule luzern lucerne switzerland exchange books music languages' },
    { t: 'Contact', u: 'contact.html', c: 'Page', d: 'Email and Instagram.', k: 'contact email mail instagram kritibysans reach hello sanskriti.patel@stud.hslu.ch' },
    { t: 'Projects', u: 'projects.html', c: 'Page', d: 'All films, photos, dance and minis.', k: 'projects work portfolio all' },
    { t: 'Films', u: 'projects.html#films', c: 'Projects', d: 'Short films and film projects.', k: 'film films video movie cinema' },
    { t: 'Photos', u: 'projects.html#photos', c: 'Projects', d: 'Photographs: city life, Pambaram, under water.', k: 'photo photos photography pictures images' },
    { t: 'Dance', u: 'projects.html#dance', c: 'Projects', d: 'Dance projects.', k: 'dance dancing movement' },
    { t: 'Minis', u: 'projects.html#minis', c: 'Projects', d: 'Small experiments and miniatures.', k: 'minis mini small experiments' },
    { t: 'Life of bhabhi', u: 'life-of-bhabhi.html', c: 'Film', d: 'A character sketch of Yasmin Bhabhi, met in the lanes of Amdavad.', k: 'film character sketch yasmin bhabhi amdavad ahmedabad gujarat nid retro bollywood song' },
    { t: 'Ghar-ghar in Rapti Sagar', u: 'ghar-ghar.html', c: 'Film', d: 'Film project.', k: 'film ghar rapti sagar train' },
    { t: 'Aap khaoge?', u: 'aap-khaoge.html', c: 'Film', d: 'Film project.', k: 'film aap khaoge food eat' },
    { t: 'Ad-PSA', u: 'ad-psa.html', c: 'Film', d: 'Advertising and public service announcement.', k: 'ad psa advertisement public service announcement film' },
    { t: 'Radiodrama', u: 'radiodrama.html', c: 'Film', d: 'An audio drama.', k: 'radio drama radiodrama audio sound story' },
    { t: 'Character sketch', u: 'character-sketch.html', c: 'Film', d: 'Short portrait films of people.', k: 'character sketch portrait people film' },
    { t: 'City life', u: 'city-life.html', c: 'Photo', d: 'A white duck on red stone steps.', k: 'photo city life duck steps street' },
    { t: 'Pambaram', u: 'pambaram.html', c: 'Photo', d: 'A wooden box with a carved cross joint.', k: 'photo pambaram wood wooden box joint craft' },
    { t: 'Under water', u: 'under-water.html', c: 'Photo', d: 'A red glass elephant on a rod.', k: 'photo under water glass elephant red beads' }
  ];

  var inputs = document.querySelectorAll('.search input');
  if (!inputs.length) return;

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function mark(text, toks) {
    var out = esc(text);
    toks.forEach(function (t) { out = out.replace(new RegExp('(' + rx(esc(t)) + ')', 'ig'), '<mark>$1</mark>'); });
    return out;
  }
  function find(q) {
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    return INDEX.map(function (e) {
      var t = e.t.toLowerCase(), c = e.c.toLowerCase(), k = (e.k || '').toLowerCase(), d = e.d.toLowerCase(), score = 0;
      for (var i = 0; i < toks.length; i++) {
        var w = toks[i];
        if (t.indexOf(w) > -1) score += 6; else if (k.indexOf(w) > -1) score += 3;
        else if (c.indexOf(w) > -1) score += 2; else if (d.indexOf(w) > -1) score += 1; else return null;   // every word must match
      }
      if (t.indexOf(q.toLowerCase()) === 0) score += 5;
      return { e: e, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 8).map(function (r) { return r.e; });
  }

  inputs.forEach(function (input) {
    var box = input.closest('.search'), panel = document.createElement('div'), items = [], active = -1;
    panel.className = 'search-results'; panel.setAttribute('role', 'listbox'); panel.hidden = true;
    box.appendChild(panel);

    function show(list, q) {
      items = list; active = -1;
      var toks = q ? q.split(/\s+/).filter(Boolean) : [], html = '';
      if (!q) html += '<div class="sr-head">Browse</div>';
      if (!list.length) html = '<div class="sr-empty">No results for “' + esc(q) + '”. Try “film”, “photo” or “about”.</div>';
      list.forEach(function (e, i) {
        html += '<a class="sr-item" role="option" href="' + e.u + '" data-i="' + i + '"><span class="sr-title">' + mark(e.t, toks) +
                '</span><span class="sr-cat">' + esc(e.c) + '</span><span class="sr-desc">' + mark(e.d, toks) + '</span></a>';
      });
      panel.innerHTML = html; panel.hidden = false;
    }
    function hide() { panel.hidden = true; active = -1; }
    function update() {
      var q = input.value.trim();
      show(q ? find(q) : INDEX.filter(function (e) { return e.c === 'Page' || e.c === 'Projects'; }).slice(0, 7), q);
    }
    function setActive(n) {
      var els = panel.querySelectorAll('.sr-item'); if (!els.length) return;
      active = (n + els.length) % els.length;
      els.forEach(function (el, i) { el.classList.toggle('active', i === active); });
      els[active].scrollIntoView({ block: 'nearest' });
    }
    function go() { if (!items.length) return; location.href = items[active > -1 ? active : 0].u; }

    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (panel.hidden) update(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(); }
      else if (e.key === 'Escape') { hide(); input.blur(); }
    });
    var btn = box.querySelector('button:not(.menu-btn)');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); if (input.value.trim()) go(); else input.focus(); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) hide(); });
    // keep the page from jumping when a result is clicked inside the label
    panel.addEventListener('mousedown', function (e) { e.preventDefault(); });
    panel.addEventListener('click', function (e) { var a = e.target.closest('.sr-item'); if (a) location.href = a.getAttribute('href'); });
  });
})();
