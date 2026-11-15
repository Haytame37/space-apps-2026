/* AYYUR — 30-second demo for the NASA Space Apps submission.
   Silent film: the story is told by short captions. Every fact comes from NASA
   (NSSDCA, NASA Science, NASA Eyes); see ../presentation/docs/sources.md. */
Deck.start(function (B) {
  'use strict';
  var tl = B.tl, el = Deck.el, img = Deck.img, a;

  function at(e, x, y, align) {
    gsap.set(e, { left: x, top: y, xPercent: align === 'left' ? 0 : -50, yPercent: -50 });
    return e;
  }
  function hide() { for (var i = 0; i < arguments.length; i++) gsap.set(arguments[i], { autoAlpha: 0 }); }
  function src(text) { var s = el('div', 'src', Deck.stage, text); hide(s); return s; }
  function cap(text, y, cls) { var c = at(el('div', 'cap ' + (cls || ''), Deck.stage, text), 960, y); gsap.set(c, { autoAlpha: 0, y: 24 }); return c; }
  var show = { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' };
  var gone = { autoAlpha: 0, duration: 0.35 };

  /* ---------- worlds ---------- */
  var MOON_SITES = [
    { lat: 0.67416, lon: 23.47314 }, { lat: 1.4551, lon: 23.1943 }, { lat: -3.0128, lon: -23.4219 },
    { lat: -3.64589, lon: -17.47194 }, { lat: 26.13239, lon: 3.6333 }, { lat: -8.973, lon: 15.5002 },
    { lat: 20.1911, lon: 30.7723 }, { lat: -2.4745, lon: -43.3398 }, { lat: 0.4742, lon: -1.4275 },
    { lat: -40.9812, lon: -11.5127 }
  ];
  var MARS_SITES = [
    { lat: 22.27, lon: -47.95 }, { lat: 19.33, lon: -33.55 }, { lat: -1.946, lon: -5.527 }, { lat: 18.44, lon: 77.45 },
    { lat: 4.5, lon: 135.9 }, { lat: 47.6673, lon: 134.2809 }, { lat: -14.572, lon: 175.478 }, { lat: 68.15, lon: -125.9 }
  ];
  var worlds = el('div', 'scene layer');
  var moon = Deck.globe({ parent: worlds, sheet: 'assets/img/moon-frames.webp', cols: 12, frames: 72, frameSize: 540,
    size: 660, labelPad: 40, swing: 24, period: 46, startLon: -4, sites: MOON_SITES, color: '#dfe8ff', dot: 7 });
  var mars = Deck.globe({ parent: worlds, sheet: 'assets/img/mars-frames.webp', cols: 12, frames: 72, frameSize: 540,
    size: 600, labelPad: 40, period: 70, startLon: -20, sites: MARS_SITES, color: '#ffb07a', dot: 7 });
  at(moon.el, 960, 580); at(mars.el, 1450, 590);
  gsap.set(moon.el, { autoAlpha: 0, scale: 0.72 });
  gsap.set(mars.el, { autoAlpha: 0, scale: 0.6, x: 260 });

  /* ===================== 1 — Title and crew ===================== */
  B.scene('Title');
  var s1 = el('div', 'scene');
  var orbitSvg = Deck.svg('orbit-svg', s1, 1920, 1080,
    '<ellipse cx="960" cy="560" rx="660" ry="235" fill="none" stroke="#5ee7ff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="4 10"/>');
  gsap.set(orbitSvg, { left: 0, top: 0, autoAlpha: 0, scale: 0.4, transformOrigin: '960px 560px' });
  var logo = el('div', 'logo', s1, Deck.LOGO);
  gsap.set(logo, { left: 960, top: 540, width: 300, xPercent: -50, yPercent: -50, zIndex: 3 });
  var cres = logo.querySelectorAll('path')[0], letters = logo.querySelectorAll('path')[1];
  gsap.set(cres, { transformOrigin: '50% 50%', rotation: -150, scale: 0.2, autoAlpha: 0 });
  gsap.set(letters, { autoAlpha: 0, y: 30 });
  var k1 = at(el('div', 'kicker', s1, 'NASA Space Apps Challenge 2026'), 960, 92);
  var t1 = at(el('div', 'crew-title', s1, 'Abandoned but not Forgotten'), 960, 162);
  var school = at(el('div', 'crew-school', s1, 'Team AYYUR · ENSA Béni Mellal, Morocco'), 960, 1000);
  hide(k1, t1, school);
  var src1 = src('AYYUR logo made with the help of AI');
  var CREW = [
    ['haytame-el-atraoui', 'Haytame El Atraoui'], ['imad-el-ades', 'Imad El Ades'], ['othmane-karim', 'Othmane Karim'],
    ['salah-atmane', 'Salah Atmane'], ['youssef-ait-karroum', 'Youssef Ait Karroum']
  ];
  var crewEls = CREW.map(function (m) {
    var e = el('div', 'crew', s1, '');
    img('assets/img/team/' + m[0] + '.webp', '', e, m[1]);
    el('b', '', e, m[1]);
    gsap.set(e, { left: 0, top: 0, xPercent: -50, yPercent: -40, autoAlpha: 0 });
    return e;
  });
  var crew = { r: 0, out: 0 };
  Deck.addDrawer(function (now) {
    if (crew.r <= 0.001 || crew.out >= 0.999) {
      for (var j = 0; j < crewEls.length; j++) if (crewEls[j].style.visibility !== 'hidden') gsap.set(crewEls[j], { autoAlpha: 0 });
      return;
    }
    var t = now / 1000, grow = 0.25 + 0.75 * crew.r, fly = 1 + crew.out * 1.4;
    for (var i = 0; i < crewEls.length; i++) {
      var th = (i / crewEls.length) * 6.2832 + t * 6.2832 / 40 + 0.6;
      var depth = (Math.sin(th) + 1) / 2;
      gsap.set(crewEls[i], {
        left: 960 + Math.cos(th) * 660 * grow * fly, top: 560 + Math.sin(th) * 235 * grow * fly,
        scale: 0.68 + 0.32 * depth,
        autoAlpha: Math.min(1, crew.r * 1.4) * (1 - crew.out) * (0.5 + 0.5 * depth),
        zIndex: depth > 0.5 ? 5 : 1
      });
    }
  });

  B.beat('Title');
  a = B.t();
  tl.to(cres, { autoAlpha: 1, rotation: 0, scale: 1, duration: 1.4, ease: 'expo.out' }, a)
    .to(letters, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, a + 0.6)
    .to(k1, { autoAlpha: 1, duration: 0.5 }, a + 0.3)
    .to(t1, { autoAlpha: 1, duration: 0.6 }, a + 0.5)
    .to(orbitSvg, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power3.out' }, a + 0.6)
    .to(crew, { r: 1, duration: 1.8, ease: 'power3.out' }, a + 0.7)
    .to([school, src1], { autoAlpha: 1, duration: 0.5 }, a + 1.6);

  /* ===================== 2 — The Moon ===================== */
  var c2 = cap('Since 1966, NASA has left machines on the Moon…', 96);
  var src2 = src('Landing sites: NASA NSSDCA catalogue · Moon and Mars: NASA 3D models');

  B.beat('Moon');
  a = B.t();
  tl.to(crew, { out: 1, duration: 1.2, ease: 'power2.in' }, a)
    .to([k1, t1, school, src1, letters], { autoAlpha: 0, duration: 0.4 }, a)
    .to(orbitSvg, { autoAlpha: 0, scale: 1.6, duration: 1.2, ease: 'power2.in' }, a)
    .to(cres, { scale: 2.6, autoAlpha: 0, duration: 1.4, ease: 'power2.inOut' }, a + 0.2)
    .to(moon.el, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, a + 0.5)
    .to(c2, show, a + 0.8)
    .to(src2, { autoAlpha: 1, duration: 0.4 }, a + 1)
    .to(moon.state, { reveal: MOON_SITES.length, duration: 1.2, ease: 'none' }, a + 1.4);

  /* ===================== 3 — Mars ===================== */
  var c3 = cap('…on Mars and beyond. <span class="mars">They never came home.</span>', 96);

  B.beat('Mars');
  a = B.t();
  tl.to(c2, gone, a)
    .to(moon.el, { left: 520, top: 600, scale: 0.78, duration: 1.2, ease: 'power3.inOut' }, a)
    .to(mars.el, { autoAlpha: 1, scale: 1, x: 0, duration: 1.2, ease: 'power3.out' }, a + 0.2)
    .to(c3, show, a + 0.4)
    .to(mars.state, { reveal: MARS_SITES.length, duration: 1, ease: 'none' }, a + 1);

  /* ===================== 4 — AYYUR ===================== */
  var c4 = cap('AYYUR turns them into stories', 470, 'big');
  var c4b = cap('kids can explore.', 580, 'big accent');

  B.beat('AYYUR');
  a = B.t();
  tl.to([c3, src2], gone, a)
    .to([moon.el, mars.el], { autoAlpha: 0.18, duration: 0.6 }, a)
    .to(c4, show, a + 0.2)
    .to(c4b, show, a + 0.5);

  /* ===================== 5–7 — The platform ===================== */
  var dev = el('div', 'device', Deck.stage);
  at(dev, 960, 590);
  el('div', 'bar', dev, '<i style="left:18px"></i><i style="left:38px"></i><i style="left:58px"></i><em>ayyuur.vercel.app</em>');
  var shots = {};
  ['apollo-step', 'model', 'live'].forEach(function (n) { shots[n] = img('assets/img/site/' + n + '.webp', '', dev, 'AYYUR screen: ' + n); hide(shots[n]); });
  gsap.set(shots['apollo-step'], { autoAlpha: 1 });
  gsap.set(dev, { autoAlpha: 0, y: 220, rotationX: 24, scale: 0.88, transformPerspective: 1800, transformOrigin: '50% 100%' });
  var c5 = cap('Real NASA globes · a timeline that turns the globe', 76, 'small');
  var c6 = cap('NASA 3D models you can turn', 76, 'small');
  var c7 = cap('NASA Eyes on the Solar System, right inside the site', 76, 'small');
  var src5 = src('Screens of ayyuur.vercel.app · globes and 3D models: NASA · NASA Eyes: NASA/JPL-Caltech');

  B.beat('Globe and timeline');
  a = B.t();
  tl.to([c4, c4b], gone, a)
    .to([moon.el, mars.el], { autoAlpha: 0, duration: 0.4 }, a)
    .to(dev, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 1, ease: 'power3.out' }, a + 0.1)
    .to(c5, show, a + 0.5)
    .to(src5, { autoAlpha: 1, duration: 0.4 }, a + 0.6);

  B.beat('3D model');
  a = B.t();
  tl.to(c5, gone, a)
    .to(shots.model, { autoAlpha: 1, duration: 0.45 }, a)
    .to(c6, show, a + 0.2);

  B.beat('NASA Eyes');
  a = B.t();
  tl.to(c6, gone, a)
    .to(shots.live, { autoAlpha: 1, duration: 0.45 }, a)
    .to(c7, show, a + 0.2);

  /* ===================== 8 — Games ===================== */
  var GAMES = ['kmystery', 'kmemory', 'kpuzzle', 'krebuild', 'kquiz'];
  var games = GAMES.map(function (g, i) {
    var e = img('assets/img/site/' + g + '.webp', 'shot', Deck.stage, 'AYYUR game');
    var off = i - 2;
    gsap.set(e, { width: 500, left: 960 + off * 330 - 250, top: 330 + off * off * 22, rotation: off * 3, scale: 0.94, transformOrigin: '50% 100%', autoAlpha: 0, y: 240, zIndex: 5 - Math.abs(off) });
    return e;
  });
  var c8 = cap('6 games for young explorers · 4 languages', 110);
  var c8b = at(el('div', 'langs', Deck.stage, 'English · Français · Español · <span lang="ar">العربية</span>'), 960, 930);
  hide(c8b);

  B.beat('Games');
  a = B.t();
  tl.to([dev, c7, src5], { autoAlpha: 0, y: -30, duration: 0.45 }, a);
  games.forEach(function (g, i) { tl.to(g, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, a + 0.25 + i * 0.08); });
  tl.to(c8, show, a + 0.3)
    .to(c8b, { autoAlpha: 1, duration: 0.5 }, a + 0.9);

  /* ===================== 9 — Cards and books ===================== */
  var MC = [['apollo-lm', 3], ['lrv', 1], ['surveyor', 1], ['pathfinder', 2], ['mer', 2], ['viking', 2], ['ingenuity', 3], ['near', 2], ['pioneer', 3]];
  var cards = MC.map(function (c, i) {
    var e = el('div', 'mcard small r' + c[1], Deck.stage);
    img('assets/img/nasa/' + c[0] + '.webp', '', e);
    var off = i - 4;
    gsap.set(e, { left: 720 - 115, top: 600 - 165, autoAlpha: 0, y: 400, transformOrigin: '50% 50%' });
    e._fan = { x: off * 98, y: off * off * 6 - 20, rotation: off * 4 };
    return e;
  });
  var book = el('div', 'page', Deck.stage);
  img('assets/img/book/apollo-01.webp', '', book, 'Apollo 11 colouring book cover');
  el('div', 'ai-badge on', book, 'AI-generated drawing');
  gsap.set(book, { width: 360, left: 1580 - 180, top: 600 - 255, rotation: 6, autoAlpha: 0, x: 200 });
  var c9 = cap('Collectible cards & colouring books — learning stays free', 110, 'small');
  var src9 = src('Card photos: NASA · book drawings: AI-generated (Google Gemini), facts checked on NASA pages');

  B.beat('Cards and books');
  a = B.t();
  tl.to(games.concat([c8, c8b]), { autoAlpha: 0, y: -40, duration: 0.4 }, a);
  cards.forEach(function (c, i) { tl.to(c, { autoAlpha: 1, x: c._fan.x, y: c._fan.y, rotation: c._fan.rotation, duration: 1, ease: 'expo.out' }, a + 0.2 + i * 0.05); });
  tl.to(book, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out' }, a + 0.5)
    .to(c9, show, a + 0.3)
    .to(src9, { autoAlpha: 1, duration: 0.4 }, a + 0.6);

  /* ===================== 10 — Link ===================== */
  var logo10 = el('div', 'logo', Deck.stage, Deck.LOGO);
  gsap.set(logo10, { left: 960, top: 300, width: 230, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 });
  var url = at(el('div', 'url', Deck.stage, 'ayyuur.vercel.app'), 960, 560);
  var line10 = at(el('div', 'tag-line', Deck.stage, 'Some machines stopped working. <span class="accent">Their stories never did.</span>'), 960, 680);
  var team10 = at(el('div', 'kicker', Deck.stage, 'Team AYYUR · NASA Space Apps Challenge 2026'), 960, 780);
  gsap.set(line10, { fontSize: 40 });
  gsap.set(url, { scale: 0.9 });
  hide(url, line10, team10);
  var src10 = src('All facts, photos and 3D models come from NASA · every source is listed on the site');

  B.beat('Link');
  a = B.t();
  tl.to(cards.concat([book, c9, src9]), { autoAlpha: 0, duration: 0.4 }, a)
    .set(moon.el, { left: 175, top: 560, scale: 0.46 }, a)
    .set(mars.el, { left: 1745, top: 560, scale: 0.5 }, a)
    .to([moon.el, mars.el], { autoAlpha: 1, duration: 1, ease: 'power2.out' }, a + 0.2)
    .to(logo10, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, a + 0.2)
    .to(url, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, a + 0.4)
    .to(line10, { autoAlpha: 1, duration: 0.5 }, a + 0.8)
    .to([team10, src10], { autoAlpha: 1, duration: 0.5 }, a + 1);
});
