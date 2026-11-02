/* intro.js - fish jumps into the water, a green dot appears, the homepage is revealed.
   Add to the <head> of index.html (before everything else):
     <link rel="stylesheet" href="intro.css">
     <script src="intro.js"></script>
   Needs the sprites in images/intro/ (fish-1..4, splash-1..3, dot).
   Optional music: put your file at sounds/intro.mp3 (or change MUSIC below). */
(function () {
  var ALWAYS = true;                    // true = play on every visit, false = once per browser session
  var root = document.documentElement;

  // ---- decide whether to play ----
  var forced = /[?&]intro\b/.test(location.search);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = !ALWAYS && sessionStorage.getItem('introSeen') === '1'; } catch (e) {}
  if (!forced && (reduce || seen)) return;
  try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}

  root.classList.add('intro-pending', 'intro-on');
  setTimeout(function () { root.classList.remove('intro-pending'); }, 4000);   // safety: never stay black

  // ---- sprites: [file, x, y, width, height] in 1280 x 720 animation units ----
  var S = {
    f1: ['fish-1', 1016, 257, 108, 62], f2: ['fish-2', 699, 305, 106, 64],
    f3: ['fish-3', 474, 283, 114, 77],  f4: ['fish-4', 292, 234, 106, 80],
    p1: ['splash-1', 134, 281, 156, 108], p2: ['splash-2', 116, 267, 192, 121],
    p3: ['splash-3', 116, 265, 135, 123], dot: ['dot', 172, 267, 40, 44]
  };
  var X0 = 1370, X1 = 240;                              // fish swims from right (off screen) to the splash spot
  var BASE_Y0 = 288, BASE_Y1 = 338;                     // it sinks gently towards the water line
  var WAVE_AMP = 34, WAVE_LEN = 320;                    // S-curve swimming path (units): height and length of each wave
  var WIGGLE = 3.4, WIGGLE_HZ = 2.4;                    // body wiggle (tail swish): size and speed
  var U = 100 / 1280;                                   // animation units -> cqw

  // timeline (seconds)
  var T0 = 0.4, TRAVEL = 3.1;                           // fish swims in along the wavy path
  var T_P1 = [3.2, 3.55], T_P2 = [3.75, 4.1], T_P3 = [4.3, 4.6], T_DOT = [4.6, 4.95];
  var T_REVEAL = [4.7, 5.7];                            // black fades away = homepage revealed
  var T_DOTOUT = [5.5, 6.1], T_END = 6.2;

  // music
  var MUSIC = 'sounds/intro.mp3';                       // your music file (mp3, ogg or wav)
  var VOLUME = 0.7, MUSIC_FADE = [5.4, 6.2];            // volume, and when it fades out (seconds)

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ramp(t, a, b) { return clamp((t - a) / (b - a)); }
  function smooth(v) { return v * v * (3 - 2 * v); }
  function cr(p0, p1, p2, p3, t) {                      // Catmull-Rom spline
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function fishPos(t) {                                 // wavy swimming path, pure function of time
    var tau = clamp((t - T0) / TRAVEL), e = 1 - Math.pow(1 - tau, 1.35);
    var x = X0 + (X1 - X0) * e;
    var amp = WAVE_AMP * smooth(ramp(tau, 0, 0.12)) * (1 - smooth(ramp(tau, 0.82, 1)));
    var y = BASE_Y0 + (BASE_Y1 - BASE_Y0) * smooth(tau) + amp * Math.sin(2 * Math.PI * (x - X1) / WAVE_LEN);
    return [x, y];
  }

  var els = {}, pose = {}, bg, cv, ctx, SC = 1.5, ready = false, finished = false;
  var audio = null, needGesture = false, hintEl = null, muteBtn = null;

  function build() {
    var wrap = document.createElement('div'); wrap.className = 'intro';
    bg = document.createElement('div'); bg.className = 'intro-bg';
    var stage = document.createElement('div'); stage.className = 'intro-stage';
    cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080;
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
    ctx = cv.getContext('2d'); SC = cv.width / 1280;
    stage.appendChild(cv);
    ['f1', 'f2', 'f3', 'f4'].forEach(function (k) {     // fish poses are loaded, then drawn on the canvas
      var im = new Image(); im.alt = ''; im.src = 'images/intro/' + S[k][0] + '.png'; pose[k] = im;
    });
    function img(key, parent) {
      var d = S[key], im = new Image();
      im.alt = ''; im.src = 'images/intro/' + d[0] + '.png';
      im.style.width = d[3] * U + 'cqw'; im.style.left = d[1] * U + 'cqw'; im.style.top = d[2] * U + 'cqw';
      parent.appendChild(im); els[key] = im; return im;
    }
    ['p1', 'p2', 'p3', 'dot'].forEach(function (k) { img(k, stage); });
    wrap.appendChild(bg); wrap.appendChild(stage); document.body.appendChild(wrap);
    root.classList.remove('intro-pending');             // the real overlay is in place now
    audio = new Audio(MUSIC); audio.preload = 'auto'; audio.volume = VOLUME;
    audio.addEventListener('error', function () { if (muteBtn) muteBtn.remove(); audio = null; });   // no music file: no button
    hintEl = document.createElement('div'); hintEl.className = 'intro-hint hide'; hintEl.textContent = 'Click anywhere for sound';
    muteBtn = document.createElement('button'); muteBtn.type = 'button'; muteBtn.className = 'intro-mute';
    muteBtn.setAttribute('aria-label', 'Mute music');
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7l-1.4-1.4a3 3 0 0 0 0-4.2l1.4-1.4z"/><path class="off-line" d="M15 9.4l5.6 5.6-1.4 1.4L13.6 10.8z"/></svg>';
    muteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (gesture() || !audio) return;
      audio.muted = !audio.muted; muteBtn.classList.toggle('off', audio.muted);
      muteBtn.setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music');
    });
    wrap.appendChild(hintEl); wrap.appendChild(muteBtn);
    wrap.addEventListener('click', onTap);
    document.addEventListener('keydown', onTap);
    return wrap;
  }

  // ---- draw one moment of the timeline ----
  function render(t) {
    // ---- fish + bubbles on the canvas ----
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    var tailOut = 1 - ramp(t, T_P1[0], T_P1[1]);
    var vis = t >= T0 ? 1 : 0;
    if (vis && tailOut > 0.01) {
      // bubbles rise from behind the tail
      ctx.lineWidth = 1.3; ctx.strokeStyle = '#6FCFD0';
      for (var i = 0; i < 30; i++) {
        var ts = T0 + 0.25 + i * 0.1, age = t - ts;
        if (age < 0 || age > 1.2 || ts > T0 + TRAVEL) continue;
        var bp = fishPos(ts), r = 2.2 + (i % 3) * 1.1 + age * 1.5;
        ctx.globalAlpha = Math.min(1, age * 6) * (1 - age / 1.2) * 0.8 * tailOut;
        ctx.beginPath();
        ctx.arc(bp[0] + 46 + Math.sin(age * 5 + i) * 3, bp[1] - 2 - age * 30, r, 0, 6.2832); ctx.stroke();
      }
      // the fish: follows the wave, tilts with it, body ripples head -> tail
      var p = fishPos(t), q = fishPos(t + 0.03), phase = 2 * Math.PI * WIGGLE_HZ * t;
      var s5 = 5 * clamp((t - T0) / TRAVEL);
      var w2 = smooth(ramp(s5, 1.35, 1.65)), w3 = smooth(ramp(s5, 2.35, 2.65)), w4 = smooth(ramp(s5, 3.35, 3.65));
      var wts = { f1: 1 - w2, f2: w2 * (1 - w3), f3: w3 * (1 - w4), f4: w4 };
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(Math.atan2(-(q[1] - p[1]), -(q[0] - p[0])) * 0.55 + 0.05 * Math.sin(phase));
      Object.keys(wts).forEach(function (k) {
        if (wts[k] < 0.01 || !pose[k].complete) return;
        var d = S[k], w = d[3], h = d[4], kk = 2 * Math.PI / (w * 0.95);
        ctx.globalAlpha = wts[k] * tailOut;
        for (var sx = 0; sx < w; sx++) {
          var env = 0.15 + 0.85 * Math.pow(sx / w, 1.2);
          var dy = WIGGLE * env * Math.sin(phase - kk * sx);
          ctx.drawImage(pose[k], sx, 0, 1, h, -w / 2 + sx, -h / 2 + dy, 1.15, h);
        }
      });
      ctx.restore();
    }
    // splash frames
    var a1 = ramp(t, T_P1[0], T_P1[1]) * (1 - ramp(t, T_P2[0], T_P2[1]));
    var a2 = ramp(t, T_P2[0], T_P2[1]) * (1 - ramp(t, T_P3[0], T_P3[1]));
    var a3 = ramp(t, T_P3[0], T_P3[1]) * (1 - ramp(t, T_DOT[0], T_DOT[1]));
    els.p1.style.opacity = a1; els.p2.style.opacity = a2; els.p3.style.opacity = a3;
    // green dot pops in, then hands over to the real one on the homepage
    var d = smooth(ramp(t, T_DOT[0], T_DOT[1]));
    els.dot.style.opacity = d * (1 - smooth(ramp(t, T_DOTOUT[0], T_DOTOUT[1])));
    els.dot.style.transform = 'scale(' + (0.6 + 0.4 * d) + ')';
    // black fades away: homepage revealed as the dot appears
    bg.style.opacity = 1 - smooth(ramp(t, T_REVEAL[0], T_REVEAL[1]));
  }

  function finish(wrap) {
    if (finished) return; finished = true;
    if (audio) audio.pause();
    wrap.remove(); root.classList.remove('intro-on', 'intro-pending');
    document.removeEventListener('keydown', onTap);
  }

  var wrapEl, startTime = 0, offset = 0;
  function skip() { if (!finished) offset = Math.max(offset, (performance.now() - startTime) / 1000 < 4.2 ? 4.2 - (performance.now() - startTime) / 1000 : 0); }

  // ---- music: browsers block sound until the visitor clicks, so we try, and ask for a click if blocked ----
  function elapsed() { return (performance.now() - startTime) / 1000 + offset; }
  function startAudio() {
    if (!audio) return;
    var e = elapsed();
    try { if (e > 0.3 && isFinite(audio.duration) && e < audio.duration) audio.currentTime = e; } catch (x) {}   // stay in sync if started late
    var p = audio.play();
    if (p && p.catch) p.catch(function () { needGesture = true; if (hintEl) hintEl.classList.remove('hide'); });
  }
  function gesture() {                                   // first click after a blocked autoplay turns the music on
    if (!needGesture) return false;
    needGesture = false; if (hintEl) hintEl.classList.add('hide'); startAudio(); return true;
  }
  function onTap() { if (!gesture()) skip(); }           // otherwise a click skips the intro

  function play() {
    startTime = performance.now();
    startAudio();
    (function frame(now) {
      var t = (performance.now() - startTime) / 1000 + offset;
      if (t >= T_END) { render(T_END); finish(wrapEl); return; }
      render(t);
      if (audio) audio.volume = Math.max(0, Math.min(1, VOLUME * (1 - smooth(ramp(t, MUSIC_FADE[0], MUSIC_FADE[1])))));
      requestAnimationFrame(frame);
    })();
  }

  function init() {
    wrapEl = build(); render(0);
    var imgs = Object.keys(els).map(function (k) { return els[k]; }).concat(Object.keys(pose).map(function (k) { return pose[k]; })), left = imgs.length, started = false;
    function go() { if (!started) { started = true; ready = true; play(); } }
    imgs.forEach(function (im) {
      if (im.complete) { if (--left === 0) go(); }
      else { im.addEventListener('load', function () { if (--left === 0) go(); });
             im.addEventListener('error', function () { if (--left === 0) go(); }); }
    });
    setTimeout(go, 2500);                               // don't wait forever for slow images
    window.Intro = { render: render };
  }

  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
