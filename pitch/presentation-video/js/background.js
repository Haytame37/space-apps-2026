/* Drifting starfield behind everything. Ambient only: nothing here depends on the clicks.
   Cheap by design: the faint nebula is plain CSS, the stars are drawn once on two
   transparent tiles that slide sideways with a CSS transform (no redraw per frame). */
(function () {
  'use strict';
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var lite = window.Deck && Deck.lite;
  var parent = canvas.parentNode;

  function seed(n) { var x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); }

  // Two layers of stars at different depths; each tile is twice the window width so it can scroll.
  function layer(count, minR, maxR, alpha, offset) {
    var w = Math.max(window.screen.width, window.innerWidth), h = Math.max(window.screen.height, window.innerHeight);
    var c = document.createElement('canvas');
    c.width = w * 2; c.height = h;
    c.className = 'starlayer';
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#eef2ff';
    for (var i = 0; i < count; i++) {
      var x = seed(i * 3 + offset) * w, y = seed(i * 3 + offset + 1) * h, d = seed(i * 3 + offset + 2);
      var r = minR + d * (maxR - minR);
      ctx.globalAlpha = alpha * (0.45 + 0.55 * d);
      for (var k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(x + k * w, y, r, 0, 6.2832); ctx.fill(); }
    }
    parent.insertBefore(c, canvas);
    return c;
  }

  var far = layer(lite ? 90 : 420, 0.35, 0.9, 0.75, 11);
  var near = layer(lite ? 40 : 160, 0.8, 1.6, 0.95, 977);
  canvas.style.display = 'none';

  if (lite) return;
  // Whole-pixel steps: the drift is so slow that a few moves per second look continuous,
  // and the screen is only recomposed on those moves instead of every frame.
  var px = Math.round(far.width / 2);
  far.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-' + px + 'px)' }], { duration: 900000, iterations: Infinity, easing: 'steps(' + px + ')' });
  near.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-' + px + 'px)' }], { duration: 420000, iterations: Infinity, easing: 'steps(' + px + ')' });
})();
