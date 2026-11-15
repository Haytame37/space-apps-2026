/* Presenting tools: keys, clicker, mouse, help, presenter view, overview,
   page numbers and jump, black/white screen, key tester, progress line, snapshot. */
(function () {
  'use strict';
  var MODE = Deck.mode;

  function $(id) { return document.getElementById(id); }
  function make(tag, id, cls, html, parent) {
    var e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    (parent || document.body).appendChild(e);
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- mirror: a preview inside the presenter view; it only obeys messages ---------- */
  if (MODE === 'mirror') {
    window.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.type === 'goto' && Deck.master) {
        if (m.instant) { Deck.master.time(Deck.beats[Math.min(m.index, Deck.beats.length - 1)].stop); Deck.index = m.index; Deck.refresh(); }
        else Deck.go(m.index);
      }
    });
    return;
  }

  /* ---------- presenter view (opened with P from the show) ---------- */
  if (MODE === 'presenter') {
    document.addEventListener('DOMContentLoaded', buildPresenter);
    return;
  }

  /* ================= SHOW MODE ================= */
  var presenterWin = null;
  var blankMode = null;
  var digits = '';
  var keyLog = [];

  document.addEventListener('DOMContentLoaded', function () {
    make('div', 'progress');
    make('div', 'pageno');
    make('div', 'toast', 'toast');
    make('div', 'help', 'panel', helpHtml());
    make('div', 'overview', 'panel');
    make('div', 'jumpbox', 'panel', '<h2>Go to page</h2><input inputmode="numeric" aria-label="Page number"><p>Type a page number, then Enter. Esc to cancel.</p>');
    make('div', 'keys', 'panel', '<h2>Key tester</h2><p>Press your clicker buttons. Each key appears here with what it does. Press K to close.</p><ol></ol>');
    $('jumpbox').querySelector('input').addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') { goPage(parseInt(this.value, 10)); closePanels(); }
      if (e.key === 'Escape') closePanels();
    });
  });

  Deck.onChange(function (i) {
    var n = Deck.beats.length;
    var prog = $('progress');
    if (prog) prog.style.transform = 'scaleX(' + (n > 1 ? i / (n - 1) : 0) + ')';
    var p = $('pageno');
    if (p) p.textContent = Deck.sceneOf(i) === 0 ? '' : Deck.sceneOf(i) + ' / ' + (Deck.scenes.length - 1);
    if ($('overview') && $('overview').classList.contains('open')) renderOverview();
    send({ type: 'state', index: i });
  });

  function send(m) {
    if (presenterWin && !presenterWin.closed) presenterWin.postMessage(m, '*');
  }

  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (!presenterWin || e.source !== presenterWin) return;
    if (m.type === 'hello') send({ type: 'state', index: Deck.index });
    if (m.type === 'cmd') {
      if (m.cmd === 'next') Deck.next();
      if (m.cmd === 'prev') Deck.prev();
      if (m.cmd === 'go') Deck.go(m.index);
      if (m.cmd === 'black') toggleBlank('black');
      if (m.cmd === 'white') toggleBlank('white');
    }
  });

  function openPresenter() {
    var base = location.href.split('#')[0].split('?')[0];
    presenterWin = window.open(base + '?presenter', 'space-memory-presenter', 'width=1400,height=900');
    if (!presenterWin) toast('The browser blocked the presenter window. Allow pop-ups for this file, then press P again.', 4000);
    else toast('Presenter view opened. Drag it to your laptop screen.', 2500);
  }

  /* ---------- panels ---------- */
  function openPanel(id) {
    closePanels();
    $(id).classList.add('open');
    if (id === 'overview') renderOverview();
    if (id === 'jumpbox') { var inp = $('jumpbox').querySelector('input'); inp.value = ''; setTimeout(function () { inp.focus(); }, 0); }
  }
  function closePanels() {
    ['help', 'overview', 'jumpbox'].forEach(function (id) { var p = $(id); if (p) p.classList.remove('open'); });
  }
  function anyPanel() {
    return ['help', 'overview', 'jumpbox'].some(function (id) { return $(id) && $(id).classList.contains('open'); });
  }

  function renderOverview() {
    var html = '<h2>All pages and clicks</h2><p>Click a step to go there. Esc to close.</p><div class="grid">';
    Deck.scenes.forEach(function (sc, s) {
      var cur = Deck.sceneOf(Deck.index) === s;
      html += '<div class="sc' + (cur ? ' cur' : '') + '"><h3><small>' + (s === 0 ? '–' : s) + '</small>' + esc(sc.title) + '</h3>';
      Deck.beats.forEach(function (b, i) {
        if (b.scene !== s) return;
        html += '<button data-i="' + i + '" class="' + (i === Deck.index ? 'cur' : '') + '">' + i + ' · ' + esc(b.name) + '</button>';
      });
      html += '</div>';
    });
    html += '</div>';
    var ov = $('overview');
    ov.innerHTML = html;
    ov.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); Deck.go(+this.getAttribute('data-i')); closePanels(); });
    });
  }

  function goPage(n) {
    if (isNaN(n)) return;
    if (n <= 0) return Deck.go(0);
    Deck.goScene(Math.min(n, Deck.scenes.length - 1));
  }

  /* ---------- blank screens ---------- */
  function toggleBlank(kind) {
    var b = $('blank');
    blankMode = blankMode === kind ? null : kind;
    b.className = blankMode || '';
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg, ms, keep) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    t.classList.toggle('keep', Boolean(keep));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, ms || 1800);
  }

  /* ---------- fullscreen ---------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  /* ---------- snapshot ---------- */
  function toggleSnapshot() {
    var on = document.documentElement.classList.toggle('snapshot');
    closePanels();
    if (on) toast('Snapshot mode: tools hidden. Press Win + Shift + S to capture. S to leave.', 3200, false);
    else toast('Snapshot mode off.', 1200);
  }

  /* ---------- keyboard and clicker ---------- */
  var ACTIONS = {
    next: ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'n', 'N'],
    prev: ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'Delete'],
    first: ['Home'],
    last: ['End'],
    black: ['b', 'B', '.'],
    white: ['w', 'W', ','],
    help: ['h', 'H', '?', 'F1'],
    overview: ['o', 'O', 'Tab'],
    presenter: ['p', 'P'],
    jump: ['g', 'G'],
    keys: ['k', 'K'],
    snapshot: ['s', 'S'],
    full: ['f', 'F', 'F5']
  };
  var LABEL = { next: 'Next', prev: 'Back', first: 'First click', last: 'Last click', black: 'Black screen', white: 'White screen', help: 'Help', overview: 'Overview', presenter: 'Presenter view', jump: 'Go to page', keys: 'Key tester', snapshot: 'Snapshot mode', full: 'Full screen', enter: 'Next / go to typed page', digit: 'Page number', esc: 'Close / leave' };

  function actionOf(e) {
    if (e.key === 'Enter') return 'enter';
    if (e.key === 'Escape') return 'esc';
    if (/^[0-9]$/.test(e.key)) return 'digit';
    for (var a in ACTIONS) if (ACTIONS[a].indexOf(e.key) >= 0) return a;
    return null;
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var a = actionOf(e);
    logKey(e, a);
    if (a === 'full' || a === 'overview' || a === 'help' || a === 'next' || a === 'prev' || a === 'enter') e.preventDefault();

    // Any key brings the picture back from a black or white screen.
    if (blankMode && a !== 'keys') { toggleBlank(blankMode); return; }

    if (Deck.autoMode && (a === 'next' || a === 'prev' || a === 'enter')) {
      e.preventDefault();
      if (e.key === 'ArrowRight') Deck.autoSeek(5);
      else if (a === 'prev') Deck.autoSeek(-5);
      else Deck.autoToggle();
      return;
    }
    if (a === 'esc') { closePanels(); digits = ''; if (document.documentElement.classList.contains('snapshot')) toggleSnapshot(); return; }
    if (anyPanel() && a !== 'help' && a !== 'overview') { if (a === 'next' || a === 'prev') closePanels(); else return; }

    switch (a) {
      case 'digit': digits += e.key; toast('Go to page ' + digits + ' — press Enter', 1600); return;
      case 'enter':
        if (digits) { goPage(parseInt(digits, 10)); digits = ''; }
        else Deck.next();
        return;
      case 'next': digits = ''; Deck.next(); return;
      case 'prev': digits = ''; Deck.prev(); return;
      case 'first': Deck.go(0); return;
      case 'last': Deck.go(Deck.beats.length - 1); return;
      case 'black': toggleBlank('black'); return;
      case 'white': toggleBlank('white'); return;
      case 'help': $('help').classList.contains('open') ? closePanels() : openPanel('help'); return;
      case 'overview': $('overview').classList.contains('open') ? closePanels() : openPanel('overview'); return;
      case 'presenter': openPresenter(); return;
      case 'jump': openPanel('jumpbox'); return;
      case 'keys': $('keys').classList.toggle('open'); return;
      case 'snapshot': toggleSnapshot(); return;
      case 'full': toggleFullscreen(); return;
    }
  });

  function logKey(e, a) {
    var panel = $('keys');
    if (!panel || !panel.classList.contains('open')) return;
    keyLog.unshift({ key: e.key === ' ' ? 'Space' : e.key, code: e.code, act: a ? LABEL[a] : 'nothing' });
    keyLog = keyLog.slice(0, 10);
    panel.querySelector('ol').innerHTML = keyLog.map(function (k) {
      return '<li><span>' + esc(k.key) + ' <small>(' + esc(k.code) + ')</small></span><b>' + esc(k.act) + '</b></li>';
    }).join('');
  }

  /* ---------- mouse ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.panel')) return;
    if (anyPanel()) { closePanels(); return; }
    if (blankMode) { toggleBlank(blankMode); return; }
    if (Deck.autoMode) { Deck.autoToggle(); return; }
    Deck.next();
  });
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (anyPanel()) { closePanels(); return; }
    if (Deck.autoMode) { Deck.autoSeek(-5); return; }
    Deck.prev();
  });

  // Hide the mouse pointer when it rests.
  var idleTimer;
  document.addEventListener('mousemove', function () {
    document.documentElement.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { document.documentElement.classList.add('idle'); }, 1800);
  });

  function helpHtml() {
    var rows = [
      ['<kbd>→</kbd> <kbd>↓</kbd> <kbd>Page Down</kbd> <kbd>Space</kbd> <kbd>Enter</kbd>, left click', 'Next. A click during an animation finishes it, then goes on.'],
      ['<kbd>←</kbd> <kbd>↑</kbd> <kbd>Page Up</kbd> <kbd>Backspace</kbd>, right click', 'Back (plays the animation in reverse, faster).'],
      ['<kbd>Home</kbd> / <kbd>End</kbd>', 'First / last click.'],
      ['Type a number, then <kbd>Enter</kbd> — or <kbd>G</kbd>', 'Go to that page (the small number bottom right).'],
      ['<kbd>O</kbd> or <kbd>Tab</kbd>', 'Overview of every page and click. Click one to go there.'],
      ['<kbd>P</kbd>', 'Presenter view in a second window: notes, timer, clock, current and next picture.'],
      ['<kbd>B</kbd> or <kbd>.</kbd> / <kbd>W</kbd> or <kbd>,</kbd>', 'Black / white screen. Any key brings the picture back.'],
      ['<kbd>F</kbd> or <kbd>F5</kbd>', 'Full screen on / off.'],
      ['<kbd>K</kbd>', 'Key tester: see which key each clicker button sends.'],
      ['<kbd>S</kbd>', 'Snapshot mode: hides page number and progress line so you can capture the picture (Win + Shift + S).'],
      ['<kbd>H</kbd> or <kbd>?</kbd>', 'This help. <kbd>Esc</kbd> closes any panel.']
    ];
    return '<h2>How to drive the show</h2><table>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</table><p>Weak laptop? Open <b>index.html?lite</b> for fewer stars. Refreshing the page keeps you on the same click.</p>';
  }

  /* ================= PRESENTER VIEW ================= */
  function buildPresenter() {
    var base = location.href.split('#')[0].split('?')[0];
    var root = make('div', 'presenter', '',
      '<header><div class="timer">00:00</div><div class="clock"></div>' +
      '<div class="btns"><button data-c="timer">Start / pause timer (T)</button><button data-c="reset">Reset (R)</button></div>' +
      '<div class="where"></div></header>' +
      '<div class="left"><div class="frame"><em>Now</em><iframe id="pv-now"></iframe></div></div>' +
      '<div class="right"><div class="frame"><em>Next click</em><iframe id="pv-next"></iframe></div>' +
      '<div class="nextname"></div>' +
      '<div class="btns"><button data-c="prev">◀ Back</button><button data-c="next">Next ▶</button><button data-c="black">Black</button></div>' +
      '<p class="hint">Your clicker works in this window too. Target length: 5:00.</p><p class="warn"></p></div>' +
      '<div class="notes"><b>Say</b><div class="txt"></div></div>');

    var now = $('pv-now'), next = $('pv-next');
    var index = 0, started = false, running = false, elapsed = 0, last = 0;
    var timerEl = root.querySelector('.timer'), clockEl = root.querySelector('.clock');

    function cmd(c, extra) {
      if (!window.opener) { root.querySelector('.warn').textContent = 'Not connected to the show. Close this window and press P in the show.'; return; }
      var m = { type: 'cmd', cmd: c };
      for (var k in extra) m[k] = extra[k];
      window.opener.postMessage(m, '*');
    }

    function show(i) {
      if (!Deck.beats.length) return;
      index = i;
      var b = Deck.beats[i], nb = Deck.beats[i + 1];
      root.querySelector('.where').textContent = 'Page ' + b.scene + ' / ' + (Deck.scenes.length - 1) + ' · click ' + i + ' / ' + (Deck.beats.length - 1) + ' · ' + b.name;
      root.querySelector('.notes .txt').textContent = b.notes || '—';
      root.querySelector('.nextname').innerHTML = nb ? 'Next: <strong>' + esc(nb.name) + '</strong> — ' + esc((nb.notes || '').slice(0, 140)) + ((nb.notes || '').length > 140 ? '…' : '') : '<strong>End of the show.</strong>';
      if (now.contentWindow) now.contentWindow.postMessage({ type: 'goto', index: i }, '*');
      if (next.contentWindow) next.contentWindow.postMessage({ type: 'goto', index: Math.min(i + 1, Deck.beats.length - 1), instant: true }, '*');
      if (i > 0 && !started) { started = true; running = true; last = performance.now(); }
    }

    now.src = base + '?mirror#0';
    next.src = base + '?mirror#1';
    now.addEventListener('load', function () { setTimeout(function () { show(index); }, 1500); });
    next.addEventListener('load', function () { setTimeout(function () { show(index); }, 1500); });

    window.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.type === 'state') {
        root.querySelector('.warn').textContent = '';
        if (Deck.beats.length) show(m.index); else index = m.index;
      }
    });
    Deck.onChange(function () { show(index); });
    if (window.opener) window.opener.postMessage({ type: 'hello' }, '*');
    else root.querySelector('.warn').textContent = 'Not connected to the show. Close this window and press P in the show.';

    function fmt(ms) { var s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function tick(t) {
      if (running) { elapsed += t - last; }
      last = t;
      timerEl.textContent = fmt(elapsed);
      timerEl.classList.toggle('over', elapsed > 5 * 60 * 1000);
      clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(function (t) { last = t; tick(t); });

    root.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!c) return;
      if (c === 'timer') { running = !running; started = true; }
      else if (c === 'reset') { elapsed = 0; }
      else cmd(c);
    });
    document.addEventListener('keydown', function (e) {
      var k = e.key;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n'].indexOf(k) >= 0) { e.preventDefault(); cmd('next'); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(k) >= 0) { e.preventDefault(); cmd('prev'); }
      else if (k === 'b' || k === '.') cmd('black');
      else if (k === 'w' || k === ',') cmd('white');
      else if (k === 't' || k === 'T') { running = !running; started = true; }
      else if (k === 'r' || k === 'R') elapsed = 0;
    });
  }
})();
