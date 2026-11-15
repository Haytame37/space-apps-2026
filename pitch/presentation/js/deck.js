/* Space Memory — the show.
   Every fact on screen comes from the challenge's official NASA resources;
   see docs/sources.md. Speaker notes are the second argument of B.beat(). */
Deck.start(function (B) {
  'use strict';
  var tl = B.tl, stage = Deck.stage, el = Deck.el, img = Deck.img;

  /* place an element by its centre (or by its left edge with align 'left') */
  function at(e, x, y, align) {
    gsap.set(e, { left: x, top: y, xPercent: align === 'left' ? 0 : align === 'right' ? -100 : -50, yPercent: -50 });
    return e;
  }
  function hide() { for (var i = 0; i < arguments.length; i++) gsap.set(arguments[i], { autoAlpha: 0 }); }
  function src(scene, text) { var s = el('div', 'src', scene, text); hide(s); return s; }
  var outEase = 'power2.in', inEase = 'power3.out';

  /* ===================== persistent worlds (used in pages 1 and 9) ===================== */
  var worlds = el('div', 'scene layer');
  var MOON_SITES = [
    { lat: 0.67416, lon: 23.47314, label: 'Apollo 11', side: 'r', dy: -16 },
    { lat: 1.4551, lon: 23.1943, label: 'Surveyor 5', side: 'r', dy: 16 },
    { lat: -3.0128, lon: -23.4219, label: 'Apollo 12 · Surveyor 3', side: 'l', dy: -40 },
    { lat: -3.64589, lon: -17.47194, label: 'Apollo 14', side: 'l', dy: 34 },
    { lat: 26.13239, lon: 3.6333, label: 'Apollo 15', side: 'r' },
    { lat: -8.973, lon: 15.5002, label: 'Apollo 16', side: 'r', dy: 10 },
    { lat: 20.1911, lon: 30.7723, label: 'Apollo 17', side: 'r' },
    { lat: -2.4745, lon: -43.3398, label: 'Surveyor 1', side: 'l', dy: 2 },
    { lat: 0.4742, lon: -1.4275, label: 'Surveyor 6', side: 'r', dy: -6 },
    { lat: -40.9812, lon: -11.5127, label: 'Surveyor 7', side: 'l' }
  ];
  var MARS_SITES = [
    { lat: 22.27, lon: -47.95, label: 'Viking 1', side: 'l', dy: -14 },
    { lat: 19.33, lon: -33.55, label: 'Pathfinder · Sojourner', side: 'r', dy: 14 },
    { lat: -1.946, lon: -5.527, label: 'Opportunity' },
    { lat: 18.44, lon: 77.45, label: 'Ingenuity' },
    { lat: 4.5, lon: 135.9, label: 'InSight' },
    { lat: 47.6673, lon: 134.2809, label: 'Viking 2' },
    { lat: -14.572, lon: 175.478, label: 'Spirit' },
    { lat: 68.15, lon: -125.9, label: 'Phoenix' }
  ];
  var moon = Deck.globe({ parent: worlds, sheet: 'assets/img/moon-frames.webp', cols: 12, frames: 72, frameSize: 540,
    size: 660, labelPad: 230, swing: 24, period: 46, startLon: -4, sites: MOON_SITES, color: '#dfe8ff', dot: 7 });
  var mars = Deck.globe({ parent: worlds, sheet: 'assets/img/mars-frames.webp', cols: 12, frames: 72, frameSize: 540,
    size: 600, labelPad: 230, period: Deck.lite ? 90 : 70, startLon: -40, sites: MARS_SITES, color: '#ffb07a', dot: 7 });
  at(moon.el, 960, 545); at(mars.el, 1460, 560);
  gsap.set(moon.el, { autoAlpha: 0, scale: 0.72 });
  gsap.set(mars.el, { autoAlpha: 0, scale: 0.6, x: 260 });

  // deep space cluster (positions are symbolic)
  var deep = el('div', 'layer', worlds);
  gsap.set(deep, { left: 0, top: 0, width: 1920, height: 1080, autoAlpha: 0 });
  var ceres = Deck.spinner({ parent: deep, sheet: 'assets/img/ceres-frames.webp', cols: 12, frames: 48, frameSize: 300, size: 150, period: 50 });
  var eros = Deck.spinner({ parent: deep, sheet: 'assets/img/eros-frames.webp', cols: 12, frames: 48, frameSize: 300, size: 150, period: 26 });
  at(ceres.el, 800, 205); at(eros.el, 1120, 225);
  var deepSvg = Deck.svg('deep-svg', deep, 1920, 1080,
    '<ellipse cx="800" cy="205" rx="118" ry="34" fill="none" stroke="#c4b0ff" stroke-opacity=".55" stroke-width="2"/>' +
    '<circle class="dawn" cx="918" cy="205" r="7" fill="#c4b0ff"/>' +
    '<circle cx="1135" cy="190" r="7" fill="#c4b0ff"/>' +
    '<path class="trail p10" d="M 960 140 C 900 110 760 70 560 40" fill="none" stroke="#c4b0ff" stroke-width="2.5" stroke-dasharray="10 9"/>' +
    '<path class="trail p11" d="M 960 140 C 1040 100 1220 70 1380 36" fill="none" stroke="#c4b0ff" stroke-width="2.5" stroke-dasharray="10 9"/>' +
    '<circle cx="560" cy="40" r="7" fill="#c4b0ff"/><circle cx="1380" cy="36" r="7" fill="#c4b0ff"/>' +
    '<path d="M 870 330 A 260 60 0 0 0 1060 330" fill="none" stroke="#c4b0ff" stroke-opacity=".4" stroke-width="2"/>' +
    '<circle cx="960" cy="342" r="7" fill="#c4b0ff"/>');
  gsap.set(deepSvg, { left: 0, top: 0 });
  var tags = [['Dawn · Ceres', 800, 290], ['NEAR Shoemaker · Eros', 1120, 300], ['Pioneer 10', 520, 74], ['Pioneer 11', 1420, 70], ['Kepler', 960, 380]];
  tags.forEach(function (t) { at(el('div', 'deep-tag', deep, t[0]), t[1], t[2]); });

  /* ===================== PAGE 1 — Still out there ===================== */
  B.scene('Still out there');
  var s1 = el('div', 'scene');
  var k1 = at(el('div', 'kicker', s1, 'The Moon · since 1966'), 960, 92);
  var h1 = at(el('div', 'headline', s1, 'They never came home.'), 960, 950);
  var kMars = at(el('div', 'kicker mars-k', s1, 'Mars'), 1460, 92);
  var kDeep = at(el('div', 'kicker', s1, 'Deep space'), 960, 92);
  var num13 = at(el('div', 'big', s1, '0'), 960, 470);
  var sub13 = at(el('div', 'sub', s1, 'machines. Thirteen stories.'), 960, 700);
  var src1a = src(s1, 'Moon model: NASA Visualization Technology Applications and Development (VTAD)');
  var src1b = src(s1, 'Landing positions: NASA NSSDCA catalogue (coordinates from Lunar Reconnaissance Orbiter images)');
  var src1c = src(s1, 'Positions: NASA NSSDCA catalogue and NASA Science mission pages');
  var src1d = src(s1, 'NASA Science: Dawn, NEAR Shoemaker, Pioneer 10 & 11, Kepler · positions drawn symbolically, not to scale');
  gsap.set(kMars, { color: '#ffb07a' });
  gsap.set(kDeep, { color: '#c4b0ff' });
  var dk1 = Deck.decode(k1);
  var h1parts = Deck.split(h1);
  hide(k1, h1, kMars, kDeep, num13, sub13);
  gsap.set(h1parts.words, { autoAlpha: 0, y: 40 });
  var c13 = Deck.counter(num13, function (v) { return String(Math.round(v)); });

  B.beat('The Moon',
    'Since 1966, NASA has been leaving machines on other worlds. ' +
    'This is the real Moon, drawn from NASA\'s own 3D model. Let it turn for a second before you speak.');
  var a = B.t();
  tl.to(moon.el, { autoAlpha: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, a)
    .to(k1, { autoAlpha: 1, duration: 0.3 }, a + 0.6)
    .to(dk1, { p: 1, duration: 1.4, ease: 'none' }, a + 0.6)
    .to(src1a, { autoAlpha: 1, duration: 0.6 }, a + 1.2);

  B.beat('Ten landing sites',
    'Every dot is a real landing site, from NASA\'s NSSDCA catalogue: the six Apollo descent stages, ' +
    'the science stations, three lunar rovers and the Surveyor probes. Not one of them came back. ' +
    'Pause on the headline.');
  a = B.t();
  tl.to(moon.state, { reveal: MOON_SITES.length, duration: 2.4, ease: 'none' }, a)
    .to(moon.state, { labels: 1, duration: 0.8 }, a + 1.6)
    .to(h1, { autoAlpha: 1, duration: 0.01 }, a + 1.2)
    .to(h1parts.words, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: inEase }, a + 1.2)
    .to(src1a, { autoAlpha: 0, duration: 0.3 }, a)
    .to(src1b, { autoAlpha: 1, duration: 0.5 }, a + 0.4);

  B.beat('Mars',
    'On Mars: Viking 1 and 2, Pathfinder with the first rover Sojourner, Spirit, Opportunity, Phoenix, ' +
    'InSight and the Ingenuity helicopter. Every one of them stopped. Every one of them has a story.');
  a = B.t();
  tl.to([h1, k1, src1b], { autoAlpha: 0, duration: 0.5, ease: outEase }, a)
    .to(moon.state, { labels: 0, duration: 0.5 }, a)
    .to(moon.el, { left: 520, top: 600, scale: 0.78, duration: 1.8, ease: 'power3.inOut' }, a)
    .to(mars.el, { autoAlpha: 1, scale: 1, x: 0, duration: 1.8, ease: 'power3.out' }, a + 0.3)
    .to(kMars, { autoAlpha: 1, duration: 0.6 }, a + 1.4)
    .to(mars.state, { reveal: MARS_SITES.length, duration: 2, ease: 'none' }, a + 1.6)
    .to(mars.state, { labels: 1, duration: 0.8 }, a + 2.4)
    .to(src1c, { autoAlpha: 1, duration: 0.5 }, a + 2);

  B.beat('Deep space',
    'And further out: Dawn still circles the dwarf planet Ceres, NEAR Shoemaker rests on the asteroid Eros, ' +
    'Pioneer 10 and 11 are leaving the solar system, and Kepler drifts around the Sun. ' +
    'Say clearly that these positions are drawn symbolically.');
  a = B.t();
  tl.to([kMars, src1c], { autoAlpha: 0, duration: 0.4 }, a)
    .to(mars.state, { labels: 0, duration: 0.5 }, a)
    .to(moon.el, { top: 680, scale: 0.7, duration: 1.4, ease: 'power3.inOut' }, a)
    .to(mars.el, { top: 690, scale: 0.86, duration: 1.4, ease: 'power3.inOut' }, a)
    .to(deep, { autoAlpha: 1, duration: 1 }, a + 0.6)
    .to(deepSvg.querySelectorAll('.trail'), { strokeDashoffset: -120, duration: 1.6, ease: 'none' }, a + 0.6)
    .to(kDeep, { autoAlpha: 1, duration: 0.6 }, a + 1.2)
    .to(src1d, { autoAlpha: 1, duration: 0.5 }, a + 1.2);

  B.beat('Thirteen',
    'Thirteen machines, or groups of machines. Each one went silent. ' +
    'None of them is forgotten — as long as someone tells the story. That is our project.');
  a = B.t();
  tl.to([kDeep, src1d], { autoAlpha: 0, duration: 0.4 }, a)
    .to([moon.el, mars.el, deep], { autoAlpha: 0.22, duration: 1.2 }, a)
    .to(num13, { autoAlpha: 1, duration: 0.3 }, a + 0.3)
    .to(c13, { v: 13, duration: 1.6, ease: 'power2.out' }, a + 0.3)
    .to(sub13, { autoAlpha: 1, y: 0, duration: 0.8, ease: inEase }, a + 1.4);
  gsap.set(sub13, { y: 24 });

  /* ===================== PAGE 2 — Scattered ===================== */
  B.scene('Scattered');
  var s2 = el('div', 'scene');
  var CARDS = [
    ['apollo-lm', 'NSSDCA 1969-059C'], ['lrv', 'NSSDCA 1971-063C'], ['apollo12', 'NSSDCA 1969-099C'],
    ['surveyor', 'science.nasa.gov/mission/surveyor-3'], ['pathfinder', 'science.nasa.gov/mission/mars-pathfinder'],
    ['mer', 'NSSDCA 2003-032A'], ['viking', 'science.nasa.gov/mission/viking-1'], ['insight', 'NSSDCA 2018-042A'],
    ['ingenuity', 'science.nasa.gov/…/ingenuity-mars-helicopter'], ['dawn', 'NSSDCA 2007-043A'],
    ['near', 'science.nasa.gov/mission/near-shoemaker'], ['pioneer', 'NSSDCA 1972-012A'], ['kepler', 'science.nasa.gov/mission/kepler']
  ];
  var SPOTS = [[230, 190], [560, 120], [900, 170], [1240, 110], [1600, 180], [170, 470], [480, 420], [1450, 450], [1770, 430], [330, 720], [700, 640], [1220, 660], [1620, 730]];
  var cards = CARDS.map(function (c, i) {
    var card = el('div', 'card', s2);
    img('assets/img/nasa/' + c[0] + '.webp', '', card);
    el('span', '', card, c[1]);
    var rot = ((i * 37) % 17) - 8;
    gsap.set(card, { left: 960 - 150, top: 540 - 120, x: 0, y: 0, rotation: 0, scale: 0.2, autoAlpha: 0 });
    card._to = { x: SPOTS[i][0] - 960, y: SPOTS[i][1] - 540, rotation: rot };
    return card;
  });
  var h2 = at(el('div', 'headline', s2, 'Their stories are scattered.'), 960, 960);
  var k2 = at(el('div', 'kicker', s2, 'The challenge'), 960, 300);
  var h2b = at(el('div', 'headline mid', s2, 'Make them speak to<br>school-age space fans.'), 960, 450);
  var src2a = src(s2, 'NASA NSSDCA catalogue · science.nasa.gov mission pages — official challenge resources');
  var src2b = src(s2, 'Challenge statement: NASA Space Apps 2026, “Abandoned but not Forgotten”');
  hide(h2, k2, h2b);
  gsap.set(h2b, { textAlign: 'center' });
  var h2parts = Deck.split(h2);
  gsap.set(h2parts.words, { autoAlpha: 0, y: 30 });

  B.beat('Scattered',
    'The facts all exist. But they are spread across dozens of NASA catalogue entries and mission pages, ' +
    'written for archives and specialists. These are the real pages we used.');
  a = B.t();
  tl.to([num13, sub13], { autoAlpha: 0, duration: 0.5, ease: outEase }, a)
    .to([moon.el, mars.el, deep], { autoAlpha: 0, duration: 0.8 }, a);
  cards.forEach(function (card, i) {
    tl.to(card, { autoAlpha: 1, scale: 1, x: card._to.x, y: card._to.y, rotation: card._to.rotation, duration: 1.3, ease: 'expo.out' }, a + 0.3 + i * 0.06);
  });
  tl.to(h2, { autoAlpha: 1, duration: 0.01 }, a + 1)
    .to(h2parts.words, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: inEase }, a + 1)
    .to(src2a, { autoAlpha: 1, duration: 0.5 }, a + 1.4);

  B.beat('The challenge',
    'NASA\'s challenge asks for one thing: tell these stories to school-age space enthusiasts. ' +
    'Not a catalogue. A story they want to follow.');
  a = B.t();
  tl.to([h2, src2a], { autoAlpha: 0, duration: 0.4 }, a);
  cards.forEach(function (card, i) {
    tl.to(card, { autoAlpha: 0.12, scale: 0.86, x: card._to.x * 1.12, y: card._to.y * 1.12, duration: 1.2, ease: 'power2.out' }, a + i * 0.02);
  });
  tl.to(k2, { autoAlpha: 1, duration: 0.5 }, a + 0.5)
    .to(h2b, { autoAlpha: 1, y: 0, duration: 0.8, ease: inEase }, a + 0.6)
    .to(src2b, { autoAlpha: 1, duration: 0.5 }, a + 1);
  gsap.set(h2b, { y: 30 });

  /* ===================== PAGE 3 — AYYUR ===================== */
  B.scene('AYYUR');
  var s3 = el('div', 'scene');
  var logo = el('div', 'logo', s3, Deck.LOGO);
  gsap.set(logo, { left: 960, top: 470, width: 520, xPercent: -50, yPercent: -50 });
  var cres = logo.querySelectorAll('path')[0], letters = logo.querySelectorAll('path')[1];
  gsap.set(cres, { transformOrigin: '50% 50%', rotation: -150, scale: 0.25, autoAlpha: 0 });
  gsap.set(letters, { autoAlpha: 0, y: 40 });
  var k3 = at(el('div', 'kicker', s3, 'NASA Space Apps 2026 · Béni Mellal, Morocco'), 960, 820);
  var tag1 = at(el('div', 'tag-line', s3, 'Some machines stopped working.'), 960, 760);
  var tag2 = at(el('div', 'tag-line accent', s3, 'Their stories never did.'), 960, 850);
  var src3 = src(s3, 'AYYUR logo: team design, drawn with the help of an AI assistant');
  hide(k3);
  var ty1 = Deck.typer(tag1), ty2 = Deck.typer(tag2);

  B.beat('AYYUR',
    'So we built AYYUR — the name of our team and of our platform. One place where all these machines live again, ' +
    'made by a team from Béni Mellal for NASA Space Apps 2026. ' +
    '(If the team agrees: ayyur is the Amazigh word for the Moon.)');
  a = B.t();
  tl.to([k2, h2b, src2b], { autoAlpha: 0, duration: 0.4 }, a);
  cards.forEach(function (card, i) {
    tl.to(card, { x: 0, y: -70, scale: 0.05, rotation: 0, autoAlpha: 0, duration: 0.9, ease: 'power3.in' }, a + 0.1 + i * 0.03);
  });
  tl.to(cres, { autoAlpha: 1, rotation: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, a + 0.9)
    .to(letters, { autoAlpha: 1, y: 0, duration: 0.9, ease: inEase }, a + 1.6)
    .to(k3, { autoAlpha: 1, duration: 0.6 }, a + 2.1)
    .to(src3, { autoAlpha: 1, duration: 0.5 }, a + 2.1);

  B.beat('Tagline',
    'Our line: some machines stopped working — their stories never did. Let the second line land.');
  a = B.t();
  tl.to(k3, { autoAlpha: 0, duration: 0.3 }, a)
    .to(logo, { top: 330, scale: 0.7, duration: 0.9, ease: 'power3.inOut' }, a)
    .to(ty1, { n: ty1.total, duration: 1.3, ease: 'none' }, a + 0.6)
    .to(ty2, { n: ty2.total, duration: 1.1, ease: 'none' }, a + 2.2);

  /* shared: a screen of the platform inside a browser frame */
  function device(parent, names, label) {
    var d = el('div', 'device', parent);
    at(d, 960, 572);
    el('div', 'bar', d, '<i style="left:18px"></i><i style="left:38px"></i><i style="left:58px"></i><em>AYYUR</em>');
    var imgs = {};
    names.forEach(function (n) { imgs[n] = img('assets/img/site/' + n + '.webp', '', d, label + ': ' + n); hide(imgs[n]); });
    gsap.set(imgs[names[0]], { autoAlpha: 1 });
    gsap.set(d, { autoAlpha: 0, y: 260, rotationX: 28, scale: 0.86, transformPerspective: 1800, transformOrigin: '50% 100%' });
    return { el: d, imgs: imgs };
  }
  function callout(dev, text, x, y) {
    var c = el('div', 'callout', dev, '<div class="pin"></div><div class="txt">' + text + '</div>');
    gsap.set(c, { left: x - 11, top: y, yPercent: -50, autoAlpha: 0, scale: 0.85, transformOrigin: '0% 50%' });
    return c;
  }
  var pop = { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' };
  var unpop = { autoAlpha: 0, scale: 0.85, duration: 0.3 };

  /* ===================== PAGE 4 — The platform ===================== */
  B.scene('The platform');
  var s4 = el('div', 'scene');
  var k4 = at(el('div', 'kicker', s4, 'The platform'), 960, 66);
  var d4 = device(s4, ['explore', 'apollo', 'apollo-step', 'model', 'live'], 'AYYUR screen');
  var dev = d4.el, shots = d4.imgs;
  var cGlobe = callout(dev, 'Real NASA globe, real positions', 780, 230);
  var cTime = callout(dev, 'Indexed timeline', 60, 735);
  var cTurn = callout(dev, 'Pick an event: the globe turns to it', 760, 320);
  var cModel = callout(dev, 'NASA 3D model — turn it, zoom it', 120, 168);
  var cLive = callout(dev, 'NASA Eyes, inside the site', 196, 168);
  var src4 = src(s4, 'Screens: the AYYUR platform · globes, models and the Eyes view: NASA');
  hide(k4);

  B.beat('Explore',
    'This is the live platform. Moon, Mars and deep space, with every machine on them. Pick a destination and the camera flies to it.');
  a = B.t();
  tl.to([logo, tag1, tag2, src3], { autoAlpha: 0, y: -60, duration: 0.6, ease: outEase }, a)
    .to(dev, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 1.5, ease: 'power3.out' }, a + 0.2)
    .to(k4, { autoAlpha: 1, duration: 0.5 }, a + 0.9)
    .to(src4, { autoAlpha: 1, duration: 0.5 }, a + 1.2);

  B.beat('Globe and timeline',
    'Pick a machine, here the Apollo descent stages: the real NASA globe, the story on the right, and an indexed timeline underneath.');
  a = B.t();
  tl.to(shots.apollo, { autoAlpha: 1, duration: 0.7 }, a)
    .to(cGlobe, pop, a + 0.6)
    .to(cTime, pop, a + 1.1);

  B.beat('Timeline turns the globe',
    'Click the last event — Apollo 17, December 1972 — and the globe turns to Taurus-Littrow, where it happened. History and geography move together.');
  a = B.t();
  tl.to([cGlobe, cTime], unpop, a)
    .to(shots['apollo-step'], { autoAlpha: 1, duration: 0.8 }, a + 0.2)
    .to(cTurn, pop, a + 0.9);

  B.beat('3D model',
    'Where NASA publishes a 3D model, it opens in the large view. This is NASA\'s model of Spirit and Opportunity.');
  a = B.t();
  tl.to(cTurn, unpop, a)
    .to(shots.model, { autoAlpha: 1, duration: 0.8 }, a + 0.2)
    .to(cModel, pop, a + 0.9);

  B.beat('NASA Eyes',
    'We did not rebuild what NASA already made: NASA\'s own simulator, Eyes on the Solar System, opens inside our site — here on InSight. The visitor never leaves AYYUR.');
  a = B.t();
  tl.to(cModel, unpop, a)
    .to(shots.live, { autoAlpha: 1, duration: 0.8 }, a + 0.2)
    .to(cLive, pop, a + 0.9);

  /* ===================== PAGE 5 — One story ===================== */
  B.scene('One story: Ingenuity');
  var s5 = el('div', 'scene');
  var photo5 = img('assets/img/nasa/ingenuity.webp', 'shot', s5, 'The Ingenuity helicopter on Mars');
  gsap.set(photo5, { width: 980, left: 1290, top: 540, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 1.12, x: 80 });
  var k5 = at(el('div', 'kicker', s5, 'Ingenuity · Mars'), 150, 250, 'left');
  var n5 = at(el('div', 'big', s5, '5'), 140, 480, 'left');
  var l5a = at(el('div', 'sub', s5, 'test flights planned.'), 150, 700, 'left');
  var l5b = at(el('div', 'sub', s5, '<span class="mars">flights flown.</span>'), 150, 700, 'left');
  var src5 = src(s5, 'Source: NASA Science — Ingenuity Mars Helicopter (science.nasa.gov) · photo NASA/JPL-Caltech');
  hide(k5, n5, l5a, l5b, photo5);
  var c5 = Deck.counter(n5, function (v) { return String(Math.round(v)); });
  gsap.set(c5, { v: 5 });

  B.beat('Ingenuity: planned',
    'Every machine has a story like this one. Ingenuity, a 1.8-kilogram helicopter, was built for at most five test flights.');
  a = B.t();
  tl.to([dev, k4, src4], { autoAlpha: 0, y: -40, duration: 0.6, ease: outEase }, a)
    .to(cLive, { autoAlpha: 0, duration: 0.3 }, a)
    .to(photo5, { autoAlpha: 1, scale: 1, x: 0, duration: 1.6, ease: 'power2.out' }, a + 0.3)
    .to(k5, { autoAlpha: 1, duration: 0.5 }, a + 0.6)
    .to(n5, { autoAlpha: 1, duration: 0.5 }, a + 0.8)
    .to(l5a, { autoAlpha: 1, duration: 0.5 }, a + 1)
    .to(src5, { autoAlpha: 1, duration: 0.5 }, a + 1.2);

  B.beat('Ingenuity: flown',
    'It flew seventy-two times, in nearly three years — the first powered, controlled flight on another planet. That is the kind of story kids remember.');
  a = B.t();
  tl.to(c5, { v: 72, duration: 2, ease: 'power3.out' }, a)
    .to(n5, { color: '#ffb07a', duration: 0.6 }, a + 1.2)
    .to(l5a, { autoAlpha: 0, duration: 0.3 }, a + 0.9)
    .to(l5b, { autoAlpha: 1, duration: 0.5 }, a + 1.2);

  /* ===================== PAGE 6 — The explorers' corner ===================== */
  B.scene('The explorers\' corner');
  var s6 = el('div', 'scene');
  var k6 = at(el('div', 'kicker', s6, 'The explorers\' corner'), 960, 66);
  var d6 = device(s6, ['kidhome'], 'AYYUR kids\' corner');
  var cTiziri = callout(d6.el, 'Tiziri, the rocket guide', 230, 180);
  var cStars = callout(d6.el, 'Stars, stickers, sounds', 1170, 160);
  gsap.set(cStars, { left: 'auto', right: 70 });
  var h6 = at(el('div', 'headline mid', s6, 'Games built from the real missions.'), 960, 130);
  var GAMES = [['kmystery', 'Who am I?'], ['kmemory', 'Pairs'], ['kpuzzle', 'The puzzle'], ['krebuild', 'In order'], ['kquiz', 'True or false?']];
  var games = GAMES.map(function (g, i) {
    var wrap = el('div', 'layer', s6);
    var im = img('assets/img/site/' + g[0] + '.webp', 'shot', wrap, 'Kids\' game: ' + g[1]);
    gsap.set(im, { width: 500, left: 0, top: 0 });
    var lab = el('div', 'game-label', wrap, g[1]);
    gsap.set(lab, { left: 250, top: 318, xPercent: -50 });
    var off = i - 2;
    gsap.set(wrap, { width: 500, height: 360, left: 960 + off * 315 - 250, top: 380 + off * off * 22, rotation: off * 3, scale: 0.94, transformOrigin: '50% 100%', autoAlpha: 0, y: 260, zIndex: 5 - Math.abs(off) });
    return wrap;
  });
  hide(k6, h6);

  B.beat('Tiziri',
    'The whole site is now made for young explorers. Tiziri, our rocket mascot, greets them and guides them. ' +
    'Each game gives stars, each mission a sticker for their album, with sounds and confetti.');
  a = B.t();
  tl.to([photo5, k5, n5, l5b, src5], { autoAlpha: 0, duration: 0.6, ease: outEase }, a)
    .to(d6.el, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 1.5, ease: 'power3.out' }, a + 0.2)
    .to(k6, { autoAlpha: 1, duration: 0.5 }, a + 0.9)
    .to(cTiziri, pop, a + 1.3)
    .to(cStars, pop, a + 1.7);

  B.beat('Five games',
    'Games built from the NASA facts: Who am I?, Pairs, the photo puzzle, In order, True or false — and Asteroid Run, a rocket flight past the real machines. ' +
    'A child learns the missions without reading a single page.');
  a = B.t();
  tl.to([cTiziri, cStars, k6], unpop, a)
    .to(d6.el, { autoAlpha: 0, scale: 0.7, y: 120, duration: 0.8, ease: outEase }, a);
  games.forEach(function (g, i) { tl.to(g, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out' }, a + 0.5 + i * 0.12); });
  tl.to(h6, { autoAlpha: 1, duration: 0.6 }, a + 1.1);

  /* ===================== PAGE 7 — Four languages ===================== */
  B.scene('Four languages');
  var s7 = el('div', 'scene');
  var k7 = at(el('div', 'kicker', s7, 'Four languages'), 960, 170);
  var LANG = [['EN', 'Their stories never did.', ''], ['FR', 'Leurs histoires, jamais.', ''], ['ES', 'Sus historias, nunca.', ''], ['AR', 'لكن قصصها لم تتوقف أبدًا.', 'ar']];
  var langs = LANG.map(function (l, i) {
    var e = el('div', 'lang ' + l[2], s7, l[2] ? l[1] + '<small>' + l[0] + '</small>' : '<small>' + l[0] + '</small>' + l[1]);
    at(e, 960, 330 + i * 140);
    gsap.set(e, { autoAlpha: 0, x: l[2] ? 80 : -80 });
    return e;
  });
  var arShot = img('assets/img/site/ar.webp', 'shot', s7, 'AYYUR in Arabic, right to left');
  gsap.set(arShot, { width: 1060, left: 1290, top: 560, xPercent: -50, yPercent: -50, autoAlpha: 0, x: 120 });
  var src7 = src(s7, 'Texts translated from the same NASA facts in English, French, Spanish and Arabic');
  hide(k7);

  B.beat('Four languages',
    'AYYUR speaks English, French, Spanish and Arabic. We are a Moroccan team: we wanted kids in our country to read these stories in their language.');
  a = B.t();
  tl.to([h6].concat(games), { autoAlpha: 0, y: -40, duration: 0.6, ease: outEase }, a)
    .to(k7, { autoAlpha: 1, duration: 0.5 }, a + 0.4)
    .to(src7, { autoAlpha: 1, duration: 0.5 }, a + 1);
  langs.forEach(function (l, i) { tl.to(l, { autoAlpha: 1, x: 0, duration: 0.8, ease: inEase }, a + 0.5 + i * 0.35); });

  B.beat('Right to left',
    'Arabic is not just translated: the whole interface flips from right to left — menus, panels, the timeline.');
  a = B.t();
  langs.forEach(function (l, i) { tl.to(l, { left: 470, scale: 0.62, top: 330 + i * 110, duration: 1, ease: 'power3.inOut' }, a + i * 0.05); });
  tl.to(k7, { left: 470, duration: 1, ease: 'power3.inOut' }, a)
    .to(arShot, { autoAlpha: 1, x: 0, duration: 1.2, ease: 'power3.out' }, a + 0.4);

  /* ===================== PAGE 8 — From the screen to real hands ===================== */
  B.scene('From the screen to real hands');
  var s8 = el('div', 'scene');
  var k8a = at(el('div', 'kicker', s8, 'AYYUR Memory cards · Series 1'), 960, 110);
  var h8a = at(el('div', 'headline mid', s8, 'Every machine becomes a card.'), 960, 200);
  var legend = at(el('div', 'legend', s8, '<span style="color:#a8b3cf">Common</span><span style="color:#5ee7ff">Rare</span><span style="color:#ffcf5a">Legendary</span>'), 960, 1000);
  var MC = [
    ['apollo-lm', 'Apollo descent stages', 3], ['lrv', 'Lunar rovers', 1], ['apollo12', 'ALSEP stations', 1], ['surveyor', 'Surveyor landers', 1],
    ['pathfinder', 'Pathfinder & Sojourner', 2], ['mer', 'Spirit & Opportunity', 2], ['viking', 'Viking 1 & 2', 2], ['insight', 'Phoenix & InSight', 2],
    ['ingenuity', 'Ingenuity', 3], ['dawn', 'Dawn', 1], ['near', 'NEAR Shoemaker', 2], ['pioneer', 'Pioneer 10 & 11', 3], ['kepler', 'Kepler', 2]
  ];
  var RNAME = ['', 'Common', 'Rare', 'Legendary'];
  var mcards = MC.map(function (c, i) {
    var e = el('div', 'mcard r' + c[2], s8);
    img('assets/img/nasa/' + c[0] + '.webp', '', e);
    el('b', '', e, c[1]);
    el('i', '', e, RNAME[c[2]]);
    el('em', '', e, (i + 1) + ' / 13');
    var off = i - 6;
    gsap.set(e, { left: 960 - 115, top: 560 - 165, autoAlpha: 0, y: 500, rotation: 0, transformOrigin: '50% 50%' });
    e._fan = { x: off * 110, y: off * off * 6 - 40, rotation: off * 3.5 };
    return e;
  });
  var src8a = src(s8, 'Card photos: NASA, from the official challenge resources · card facts: the same NASA sources as the museum');

  var k8b = at(el('div', 'kicker', s8, 'Pioneer 10 · the colouring book'), 1240, 230, 'left');
  var h8b = at(el('div', 'headline mid', s8, 'A real book.<br>Ages 6 to 9.'), 1240, 380, 'left');
  var f8b = at(el('div', 'facts-line', s8, '23 pages · 20 to colour · A4'), 1240, 540, 'left');
  var g8b = at(el('div', 'facts-line', s8, 'Every caption checked on NASA Science'), 1240, 600, 'left');
  var PAGES = ['page-01', 'page-03', 'page-08', 'page-14'];
  var pages = PAGES.map(function (p, i) {
    var e = el('div', 'page', s8);
    img('assets/img/book/' + p + '.webp', '', e, 'Pioneer 10 colouring book, ' + p);
    el('div', 'ai-badge', e, 'AI-generated illustration');
    gsap.set(e, { left: 560 - 210 + i * 70, top: 540 - 297 + i * 18, autoAlpha: 0, rotation: -8 + i * 5, rotationY: 25, transformPerspective: 1600, x: -300, zIndex: 10 - i });
    return e;
  });
  var src8b = src(s8, 'Book by team AYYUR · facts: NASA Science, “Pioneer 10” · drawings generated with AI (Google Gemini), as stated in the book');

  var k8c = at(el('div', 'kicker', s8, 'From the screen to real hands'), 960, 150);
  var COLS = [
    ['Online museum', 'Free', 'Explore, play and learn in four languages.'],
    ['Memory cards', '€0.90–€3.90', 'per card, by rarity.<br>Booster of 5 cards: €3.90.'],
    ['Colouring book', '€2.90–€49', 'PDF €2.90 · printed €6.90.<br>Class pack of 10: €49.']
  ];
  var cols = COLS.map(function (c, i) {
    var e = at(el('div', 'col', s8, '<h3>' + c[0] + '</h3><strong>' + c[1] + '</strong><p>' + c[2] + '</p>'), 960 + (i - 1) * 560, 560);
    gsap.set(e, { autoAlpha: 0, y: 80 });
    return e;
  });
  var n8c = at(el('div', 'note-line', s8, 'Team proposals, benchmarked on similar products · payment not connected yet'), 960, 890);
  hide(k8a, h8a, legend, k8b, h8b, f8b, g8b, k8c, n8c);

  B.beat('Memory cards',
    'Now, how AYYUR can live beyond the hackathon. Every machine becomes a collectible card: NASA photo and figures on the front, ' +
    'its story and key dates on the back. Thirteen cards: common, rare and legendary — like the cards kids already collect.');
  a = B.t();
  tl.to(langs.concat([k7, arShot, src7]), { autoAlpha: 0, duration: 0.6, ease: outEase }, a)
    .to(k8a, { autoAlpha: 1, duration: 0.5 }, a + 0.4)
    .to(h8a, { autoAlpha: 1, duration: 0.6 }, a + 0.6);
  mcards.forEach(function (c, i) {
    tl.to(c, { autoAlpha: 1, y: c._fan.y, x: c._fan.x, rotation: c._fan.rotation, duration: 1.3, ease: 'expo.out' }, a + 0.6 + i * 0.07);
  });
  tl.to(legend, { autoAlpha: 1, duration: 0.6 }, a + 1.8)
    .to(src8a, { autoAlpha: 1, duration: 0.5 }, a + 1.8);

  B.beat('Colouring book',
    'And a real book: Pioneer 10, a colouring book for ages 6 to 9. Twenty-three pages, twenty drawings to colour, ' +
    'every caption checked against NASA Science. Be open about it: the drawings were generated with AI, and the book says so. ' +
    'On the site you can leaf through it and colour three pages.');
  a = B.t();
  tl.to([k8a, h8a, legend, src8a], { autoAlpha: 0, duration: 0.4 }, a);
  mcards.forEach(function (c, i) { tl.to(c, { autoAlpha: 0, y: 600, rotation: c._fan.rotation * 2, duration: 0.8, ease: outEase }, a + i * 0.03); });
  pages.forEach(function (p, i) { tl.to(p, { autoAlpha: 1, x: 0, rotationY: 0, duration: 1.3, ease: 'power3.out' }, a + 0.5 + i * 0.15); });
  tl.to(k8b, { autoAlpha: 1, duration: 0.5 }, a + 0.9)
    .to(h8b, { autoAlpha: 1, duration: 0.6 }, a + 1.1)
    .to(f8b, { autoAlpha: 1, duration: 0.5 }, a + 1.5)
    .to(g8b, { autoAlpha: 1, duration: 0.5 }, a + 1.7)
    .to(src8b, { autoAlpha: 1, duration: 0.5 }, a + 1.7);

  B.beat('Business model',
    'Our model: the online museum stays free. It earns through real objects — Memory cards and boosters, and books: ' +
    'the Pioneer 10 book as a PDF, a printed copy, or a class pack of ten for schools and workshops. ' +
    'These prices are proposals, and there is no payment yet. Before any sale we must check NASA\'s rules on the commercial use of its images and name.');
  a = B.t();
  tl.to(pages.concat([k8b, h8b, f8b, g8b, src8b]), { autoAlpha: 0, y: -40, duration: 0.6, ease: outEase }, a)
    .to(k8c, { autoAlpha: 1, duration: 0.5 }, a + 0.4);
  cols.forEach(function (c, i) { tl.to(c, { autoAlpha: 1, y: 0, duration: 0.9, ease: inEase }, a + 0.5 + i * 0.25); });
  tl.to(n8c, { autoAlpha: 1, duration: 0.6 }, a + 1.6);

  /* ===================== PAGE 9 — Our rule ===================== */
  B.scene('Our rule');
  var s9 = el('div', 'scene');
  var k9 = at(el('div', 'kicker', s9, 'Our rule'), 960, 220);
  var ROWS = [[37, 'NASA sources, cited on every story'], [13, 'machines, every fact checked'], ['AI', 'use declared, AI drawings labelled']];
  var rows = ROWS.map(function (r, i) {
    var e = el('div', 'statement', s9, '<b>' + (typeof r[0] === 'number' ? '0' : r[0]) + '</b> ' + r[1]);
    at(e, 300, 400 + i * 150, 'left');
    gsap.set(e, { autoAlpha: 0, y: 40 });
    var c = typeof r[0] === 'number' ? Deck.counter(e.querySelector('b'), function (v) { return String(Math.round(v)); }) : null;
    return { e: e, c: c, v: r[0] };
  });
  var src9 = src(s9, 'Count of NASA links on the platform\'s Sources page · AI use is declared on the platform and in the book');
  hide(k9);

  B.beat('Our rule',
    'One strict rule: every fact, photo and 3D model of the museum comes from the challenge\'s official NASA resources — ' +
    'thirty-seven NASA sources, linked from each story. We used AI for code, drafting, our logo and the book\'s drawings, ' +
    'and we say so everywhere.');
  a = B.t();
  tl.to(cols.concat([k8c, n8c]), { autoAlpha: 0, duration: 0.6, ease: outEase }, a)
    .to(k9, { autoAlpha: 1, duration: 0.5 }, a + 0.4)
    .to(src9, { autoAlpha: 1, duration: 0.5 }, a + 1.2);
  rows.forEach(function (r, i) {
    tl.to(r.e, { autoAlpha: 1, y: 0, duration: 0.7, ease: inEase }, a + 0.5 + i * 0.35);
    if (r.c) tl.to(r.c, { v: r.v, duration: 1.2, ease: 'power2.out' }, a + 0.6 + i * 0.35);
  });

  /* ===================== PAGE 10 — Remember them ===================== */
  B.scene('Remember them');
  var s10 = el('div', 'scene');
  var logo10 = el('div', 'logo', s10, Deck.LOGO);
  gsap.set(logo10, { left: 960, top: 380, width: 340, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 });
  var line10 = at(el('div', 'tag-line', s10, 'Some machines stopped working. <span class="accent">Their stories never did.</span>'), 960, 680);
  var team10 = at(el('div', 'kicker', s10, 'Team AYYUR · NASA Space Apps Challenge 2026'), 960, 780);
  gsap.set(line10, { fontSize: 40 });
  hide(line10, team10);

  B.beat('Close',
    'Some machines stopped working. Their stories never did. AYYUR — thank you. Then stop talking and let the two worlds turn.');
  a = B.t();
  tl.to(rows.map(function (r) { return r.e; }).concat([k9, src9]), { autoAlpha: 0, duration: 0.6, ease: outEase }, a)
    .set(moon.el, { left: 210, top: 560, scale: 0.5 }, a)
    .set(mars.el, { left: 1710, top: 560, scale: 0.55 }, a)
    .set(deep, { autoAlpha: 0 }, a)
    .to(moon.state, { labels: 0, duration: 0.1 }, a)
    .to(mars.state, { labels: 0, duration: 0.1 }, a)
    .to([moon.el, mars.el], { autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, a + 0.4)
    .to(logo10, { autoAlpha: 1, scale: 1, duration: 1.4, ease: inEase }, a + 0.8)
    .to(line10, { autoAlpha: 1, duration: 0.8 }, a + 1.6)
    .to(team10, { autoAlpha: 1, duration: 0.8 }, a + 2.2);

  B.slot('end');
});
