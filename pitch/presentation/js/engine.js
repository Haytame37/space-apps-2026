/* Space Memory — presentation engine.
   One paused GSAP timeline. A "beat" is a stop that waits for a click.
   Read README.md for the plain-language guide. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var MODE = params.has('presenter') ? 'presenter' : params.has('mirror') ? 'mirror' : 'show';
  var LITE = params.has('lite') || MODE === 'mirror';

  var Deck = {
    mode: MODE,
    lite: LITE,
    extras: [],
    slots: {},
    scenes: [],   // { title, firstBeat }
    beats: [],    // { name, notes, scene, start, stop }
    index: 0,
    master: null,
    images: [],   // Image objects to wait for before the show starts
    listeners: []
  };
  window.Deck = Deck;

  /* ---------- watchers: timeline tweens a plain object, we redraw when it changes ---------- */
  var watchers = [];
  Deck.watch = function (obj, draw) {
    var w = { obj: obj, draw: draw, last: null };
    watchers.push(w);
    return obj;
  };
  function snapshotOf(obj) {
    var out = '';
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) out += k + ':' + obj[k] + '|';
    return out;
  }
  function runWatchers(force) {
    for (var i = 0; i < watchers.length; i++) {
      var w = watchers[i], s = snapshotOf(w.obj);
      if (force || s !== w.last) { w.last = s; w.draw(w.obj); }
    }
  }
  Deck.refresh = function () { runWatchers(true); };

  /* ---------- small DOM helpers ---------- */
  Deck.el = function (tag, cls, parent, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    (parent || Deck.stage).appendChild(e);
    return e;
  };
  /* SVG needs its own namespace; build it from markup. */
  Deck.svg = function (cls, parent, w, h, inner) {
    var holder = document.createElement('div');
    holder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + inner + '</svg>';
    var svg = holder.firstChild;
    (parent || Deck.stage).appendChild(svg);
    return svg;
  };
  Deck.img = function (src, cls, parent, alt) {
    var i = Deck.el('img', cls, parent);
    i.alt = alt || '';
    i.decoding = 'async';
    i.src = src;
    Deck.images.push(i);
    return i;
  };
  Deck.image = function (src) {
    var i = new Image();
    i.src = src;
    Deck.images.push(i);
    return i;
  };

  /* Wrap words and characters in spans so they can be staggered. */
  Deck.split = function (el) {
    var text = el.textContent, words = [], chars = [];
    el.textContent = '';
    text.split(/(\s+)/).forEach(function (part) {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      if (!part) return;
      var w = document.createElement('span');
      w.className = 'w';
      for (var i = 0; i < part.length; i++) {
        var c = document.createElement('span');
        c.className = 'c';
        c.textContent = part[i];
        w.appendChild(c);
        chars.push(c);
      }
      el.appendChild(w);
      words.push(w);
    });
    return { words: words, chars: chars };
  };

  /* Typewriter: every letter is already laid out, only its visibility changes. */
  Deck.typer = function (el) {
    var parts = Deck.split(el), state = { n: 0 };
    Deck.watch(state, function (s) {
      var n = Math.round(s.n);
      for (var i = 0; i < parts.chars.length; i++) parts.chars[i].style.visibility = i < n ? 'visible' : 'hidden';
      el.setAttribute('data-caret', n > 0 && n < parts.chars.length ? 'on' : 'off');
    });
    state.total = parts.chars.length;
    return state;
  };

  /* Decode: random glyphs resolve into the text. Same progress always shows the same glyphs. */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/\\=';
  Deck.decode = function (el) {
    var finalText = el.textContent, state = { p: 0 };
    Deck.watch(state, function (s) {
      var len = finalText.length, done = Math.floor(s.p * len), tick = Math.floor(s.p * 60), out = '';
      for (var i = 0; i < len; i++) {
        var ch = finalText[i];
        if (ch === ' ' || i < done) out += ch;
        else if (s.p <= 0) out += ' ';
        else out += GLYPHS[(i * 7 + tick * 13) % GLYPHS.length];
      }
      el.textContent = out;
    });
    return state;
  };

  /* Animated number. format(value) returns the text to show. */
  Deck.counter = function (el, format) {
    var state = { v: 0 };
    Deck.watch(state, function (s) { el.textContent = format(s.v); });
    return state;
  };

  /* ---------- stage scaling ---------- */
  function fit() {
    var stage = Deck.stage;
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------- waiting for fonts and images (never block for long) ---------- */
  function timeout(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function fontsReady() {
    if (!document.fonts) return Promise.resolve();
    var loads = ['600 40px "Space Grotesk"', '400 20px "Inter"', '600 20px "Inter"', '600 40px "Noto Kufi Arabic"'].map(function (f) {
      return document.fonts.load(f).catch(function () {});
    });
    return Promise.race([Promise.all(loads), timeout(5000)]);
  }
  function imagesReady(onProgress) {
    var total = Deck.images.length, done = 0;
    if (!total) return Promise.resolve();
    var all = Deck.images.map(function (img) {
      return new Promise(function (res) {
        function ok() { done++; onProgress(done / total); res(); }
        if (img.complete && img.naturalWidth) ok();
        else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); }
      });
    });
    return Promise.race([Promise.all(all), timeout(8000)]);
  }

  /* ---------- building the show ---------- */
  Deck.start = function (build) {
    document.documentElement.classList.add('mode-' + MODE);
    if (LITE) document.documentElement.classList.add('lite');
    Deck.stage = document.getElementById('stage');
    fit();
    var loader = document.getElementById('loader');
    var bar = loader && loader.querySelector('i');

    if (MODE === 'presenter') {
      Deck.stage.style.display = 'none';
    }

    fontsReady().then(function () {
      var master = gsap.timeline({ paused: true });
      Deck.master = master;
      var B = {
        scene: function (title) {
          Deck.scenes.push({ title: title, firstBeat: Deck.beats.length });
        },
        beat: function (name, notes) {
          master.addLabel('b' + Deck.beats.length);
          Deck.beats.push({ name: name, notes: notes || '', scene: Math.max(0, Deck.scenes.length - 1), start: master.duration() });
        },
        t: function () { return master.duration(); },
        tl: master,
        slot: function (name) {
          var fns = Deck.slots[name];
          if (!fns) return;
          (Array.isArray(fns) ? fns : [fns]).forEach(function (fn) { fn(B); });
        }
      };
      Deck.B = B;
      // Beat 0: the quiet start screen, nothing but the drifting background.
      Deck.scenes.push({ title: 'Start', firstBeat: 0 });
      Deck.beats.push({ name: 'Start', notes: 'Quiet start screen. Wait until the room is ready, then click.', scene: 0, start: 0 });

      build(B);
      Deck.extras.forEach(function (fn) { fn(B); });

      // Optional notes file (js/notes-*.js) replaces the notes written in deck.js, beat by beat.
      if (Deck.notes) Deck.beats.forEach(function (bt) { if (Deck.notes[bt.name]) bt.notes = Deck.notes[bt.name]; });

      // A beat stops where the next beat's animations begin.
      for (var i = 0; i < Deck.beats.length; i++) {
        Deck.beats[i].stop = i + 1 < Deck.beats.length ? Deck.beats[i + 1].start : master.duration();
      }
      Deck.beats[0].stop = 0;

      return imagesReady(function (p) { if (bar) bar.style.transform = 'scaleX(' + p + ')'; });
    }).then(function () {
      if (loader) loader.classList.add('done');
      var first = readHash();
      jump(first, true);
      runWatchers(true);
      gsap.ticker.add(function () { runWatchers(false); });
      document.documentElement.classList.add('ready');
      emit();
    });
  };

  /* ---------- moving through the show ---------- */
  var tween = null;
  function setIndex(i) {
    Deck.index = i;
    if (MODE === 'show') history.replaceState(null, '', '#' + i);
    emit();
  }
  function emit() { Deck.listeners.forEach(function (fn) { fn(Deck.index); }); }
  Deck.onChange = function (fn) { Deck.listeners.push(fn); };

  function finishTween() {
    if (tween) { var target = tween.vars.time; tween.kill(); tween = null; Deck.master.time(target); }
  }

  function playTo(i, speed) {
    var target = Deck.beats[i].stop, master = Deck.master;
    var dist = Math.abs(target - master.time());
    tween = gsap.to(master, {
      time: target,
      duration: dist / speed,
      ease: 'none',
      onComplete: function () { tween = null; }
    });
    setIndex(i);
  }

  var flash;
  function jump(i, silent) {
    i = Math.max(0, Math.min(Deck.beats.length - 1, i));
    finishTween();
    if (silent || !flash) { Deck.master.time(Deck.beats[i].stop); setIndex(i); runWatchers(true); return; }
    gsap.killTweensOf(flash);
    gsap.set(flash, { opacity: 1 });
    Deck.master.time(Deck.beats[i].stop);
    runWatchers(true);
    setIndex(i);
    gsap.to(flash, { opacity: 0, duration: 0.35, delay: 0.08, ease: 'power1.out' });
  }

  Deck.next = function () {
    if (!Deck.master) return;
    var busy = Boolean(tween);
    finishTween();
    if (Deck.index >= Deck.beats.length - 1) return;
    if (busy && Deck.master.time() !== Deck.beats[Deck.index].stop) Deck.master.time(Deck.beats[Deck.index].stop);
    playTo(Deck.index + 1, 1);
  };
  Deck.prev = function () {
    if (!Deck.master) return;
    finishTween();
    if (Deck.index <= 0) return;
    playTo(Deck.index - 1, 1.8);
  };
  Deck.go = function (i) {
    if (!Deck.master) return;
    if (i === Deck.index + 1) return Deck.next();
    if (i === Deck.index - 1) return Deck.prev();
    if (i !== Deck.index) jump(i, false);
  };
  Deck.goScene = function (s) {
    var sc = Deck.scenes[s];
    if (sc) Deck.go(Math.min(Deck.beats.length - 1, sc.firstBeat));
  };
  Deck.sceneOf = function (i) { return Deck.beats[i] ? Deck.beats[i].scene : 0; };

  function readHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    return isNaN(n) ? 0 : n;
  }
  window.addEventListener('hashchange', function () {
    var n = readHash();
    if (Deck.master && n !== Deck.index) Deck.go(n);
  });

  document.addEventListener('DOMContentLoaded', function () {
    flash = document.getElementById('flash');
  });
})();
