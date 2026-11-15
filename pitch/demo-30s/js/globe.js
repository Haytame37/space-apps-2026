/* Rotating NASA globe drawn on a 2D canvas from pre-rendered frames,
   with markers placed at real latitude / longitude.
   The spin is ambient. What the clicks control lives in `state`:
     reveal  how many markers are lit (0..n, fractions fade in)
     labels  0..1 opacity of the marker names
     focus   index of a marker to turn toward (-1 = none)
     lock    0..1 how strongly the globe turns toward `focus`
   Frame i of a sheet shows longitude -180 + i * 360 / frames at its centre. */
(function () {
  'use strict';

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function wrap(a) { a = (a + 180) % 360; if (a < 0) a += 360; return a - 180; }

  Deck.globe = function (o) {
    var wrapEl = Deck.el('div', 'globe ' + (o.cls || ''), o.parent);
    var canvas = Deck.el('canvas', '', wrapEl);
    var size = o.size;
    var pad = o.labelPad || 0;
    canvas.width = size + pad * 2; canvas.height = size + pad * 2;
    canvas.style.width = (size + pad * 2) + 'px'; canvas.style.height = (size + pad * 2) + 'px';
    wrapEl.style.width = (size + pad * 2) + 'px'; wrapEl.style.height = (size + pad * 2) + 'px';
    var ctx = canvas.getContext('2d');
    var sheet = Deck.image(o.sheet);
    var lastDraw = 0;
    var state = { reveal: 0, labels: 0, focus: -1, lock: 0 };
    var t0 = 0;
    var sites = o.sites || [];
    var R = size / 2 / 1.02; // frames were rendered with a 1.02 orthographic margin

    function draw(now) {
      if (!document.documentElement.classList.contains('ready')) return;
      // Skip work when invisible.
      if (wrapEl.style.visibility === 'hidden' || wrapEl.style.opacity === '0') return;
      // 30 frames per second is plenty for a slow spin.
      if (!Deck.recording && now - lastDraw < 30) return;
      lastDraw = now;
      var t = (now - t0) / 1000;
      // `swing` keeps one face toward us with a slow sway; otherwise the body turns all the way.
      var lon0 = o.swing
        ? (o.startLon || 0) + o.swing * Math.sin((t * 6.2832) / (o.period || 40))
        : (o.startLon || 0) + (t * 360) / (o.period || 60);
      if (state.focus >= 0 && sites[state.focus]) {
        var target = sites[state.focus].lon;
        lon0 = lon0 + wrap(target - lon0) * state.lock;
      }
      lon0 = wrap(lon0);
      var pos = ((lon0 + 180) / 360) * o.frames;
      var i0 = Math.floor(pos) % o.frames, i1 = (i0 + 1) % o.frames, f = pos - Math.floor(pos);
      var fs = o.frameSize;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (sheet.complete && sheet.naturalWidth) {
        ctx.globalAlpha = 1;
        ctx.drawImage(sheet, (i0 % o.cols) * fs, Math.floor(i0 / o.cols) * fs, fs, fs, pad, pad, size, size);
        if (f > 0.04 && !Deck.lite) {
          ctx.globalAlpha = f;
          ctx.drawImage(sheet, (i1 % o.cols) * fs, Math.floor(i1 / o.cols) * fs, fs, fs, pad, pad, size, size);
        }
        ctx.globalAlpha = 1;
      }
      if (!sites.length || state.reveal <= 0) return;
      var cx = pad + size / 2, cy = pad + size / 2;
      for (var k = 0; k < sites.length; k++) {
        var r = Math.max(0, Math.min(1, state.reveal - k));
        if (r <= 0) continue;
        var s = sites[k];
        var lat = s.lat * Math.PI / 180, dl = (s.lon - lon0) * Math.PI / 180;
        var cl = Math.cos(lat);
        var z = cl * Math.cos(dl);
        var vis = smooth(-0.05, 0.2, z) * r;
        if (vis <= 0.01) continue;
        var x = cx + R * cl * Math.sin(dl), y = cy - R * Math.sin(lat);
        var focused = k === state.focus && state.lock > 0.5;
        var pulse = (t * 0.6 + k * 0.17) % 1;
        var base = o.dot || 7;
        // pulse ring
        ctx.globalAlpha = vis * (1 - pulse) * 0.85;
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, base + pulse * base * 3.2, 0, 6.2832); ctx.stroke();
        // glow
        var g = ctx.createRadialGradient(x, y, 0, x, y, base * 3);
        g.addColorStop(0, o.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = vis * 0.55;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, base * 3, 0, 6.2832); ctx.fill();
        // core
        ctx.globalAlpha = vis;
        ctx.fillStyle = focused ? '#ffffff' : o.color;
        ctx.beginPath(); ctx.arc(x, y, focused ? base * 1.35 : base * 0.8 * (0.6 + 0.4 * r), 0, 6.2832); ctx.fill();
        // label
        var la = state.labels * vis * (s.label ? 1 : 0);
        if (la > 0.02) {
          ctx.globalAlpha = la;
          ctx.font = '600 ' + (o.labelSize || 19) + 'px "Inter", sans-serif';
          ctx.textBaseline = 'middle';
          var right = s.side ? s.side === 'r' : x < cx + R * 0.35;
          var ly = y + (s.dy || 0);
          ctx.textAlign = right ? 'left' : 'right';
          var lx = right ? x + base * 2.2 : x - base * 2.2;
          ctx.fillStyle = 'rgba(4,6,13,0.72)';
          var tw = ctx.measureText(s.label).width;
          ctx.fillRect(right ? lx - 6 : lx - tw - 6, ly - 14, tw + 12, 28);
          ctx.fillStyle = '#eef2ff';
          ctx.fillText(s.label, lx, ly + 1);
        }
      }
      ctx.globalAlpha = 1;
    }
    Deck.addDrawer(draw);
    return { el: wrapEl, state: state, canvas: canvas };
  };

  /* A small body that only spins (asteroids, dwarf planets). */
  Deck.spinner = function (o) {
    return Deck.globe({ parent: o.parent, cls: o.cls, sheet: o.sheet, cols: o.cols, frames: o.frames, frameSize: o.frameSize, size: o.size, period: o.period, sites: [] });
  };
})();
