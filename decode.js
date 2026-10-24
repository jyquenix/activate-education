/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Curriculum page: "Fast reading improvement using decoding/encoding"
   Animated demo of the four steps listed beside it.

   1  Sound → symbol   letters drop onto tiles; sound buttons appear
                       (dot = one-letter sound, bar = multi-letter
                       sound); each sound pulses and shows its label
   2  Blend ↔ segment  a finger traces the blending swoop while the
                       letters slide into one word; the word splits
                       back into sounds and blends again
   3  Apply in text    a sentence appears with a blank; the word flies in
   4  Fluency          a highlighter reads the sentence, then again faster

   Cycles through three words. Plays only while on screen; pause button
   in the corner. Reduced-motion visitors (or if GSAP fails to load) get
   a still diagram instead.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
(() => {
  const stage = document.querySelector('.dc-stage');
  if (!stage) return;
  const area = stage.querySelector('.dc-area');
  const toggle = stage.querySelector('.dc-toggle');
  const steps = [...document.querySelectorAll('#timeline .step')];

  /* g: graphemes [spelling, isVowel]; ph: sound labels; s: sentence,
     the word in [brackets] is the blank, punctuation attaches */
  const WORDS = [
    { g: [['sh', 0], ['i', 1], ['p', 0]],           ph: ['/sh/', '/ĭ/', '/p/'],        s: ['The', ['ship'], 'sails', 'at', 'night', '.'] },
    { g: [['t', 0], ['r', 0], ['ai', 1], ['n', 0]], ph: ['/t/', '/r/', '/ā/', '/n/'],  s: ['We', 'ride', 'the', ['train'], 'home', '.'] },
    { g: [['l', 0], ['igh', 1], ['t', 0]],          ph: ['/l/', '/ī/', '/t/'],         s: ['Turn', 'on', 'the', ['light'], '.'] },
  ];

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const SVG = 'http://www.w3.org/2000/svg';

  /* ---------- DOM for one word ---------- */
  function build(w) {
    area.innerHTML = '';
    const zone = el('div', 'dc-zone');
    const row = el('div', 'dc-row');
    const r = { tiles: [], letters: [], bodies: [], btns: [], rings: [], phs: [], wholeLetters: [], toks: [] };

    w.g.forEach(([spelling, vowel], i) => {
      const g = el('div', 'dc-g');
      const tile = el('div', 'dc-tile' + (vowel ? ' is-vowel' : ''));
      const body = el('span', 'dc-body');
      tile.append(body);
      [...spelling].forEach(ch => { const l = el('span', 'dc-l', ch); tile.append(l); r.letters.push(l); });
      const btn = el('span', 'dc-btn ' + (spelling.length > 1 ? 'is-bar' : 'is-dot'));
      const ring = el('span', 'dc-ring');
      btn.append(ring);
      const ph = el('span', 'dc-ph', w.ph[i]);
      g.append(tile, btn, ph);
      row.append(g);
      r.tiles.push(tile); r.bodies.push(body); r.btns.push(btn); r.rings.push(ring); r.phs.push(ph);
    });

    const whole = el('div', 'dc-whole');
    w.g.forEach(([spelling, vowel]) => [...spelling].forEach(ch => {
      const l = el('span', 'dc-wl' + (vowel ? ' is-vowel' : ''), ch);
      whole.append(l); r.wholeLetters.push(l);
    }));

    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'dc-swoop');
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('class', 'dc-swoop-line');
    const head = document.createElementNS(SVG, 'path');
    head.setAttribute('class', 'dc-swoop-head');
    svg.append(path, head);
    const finger = el('span', 'dc-finger');
    zone.append(row, whole, svg, finger);

    const sentence = el('div', 'dc-sentence');
    const pill = el('span', 'dc-pill');
    sentence.append(pill);
    w.s.forEach((t, i) => {
      const blank = Array.isArray(t);
      const text = blank ? t[0] : t;
      const punct = /^[.,!?]$/.test(text);
      if (i > 0 && !punct) sentence.append(document.createTextNode(' '));
      const span = el('span', 'dc-tok' + (blank ? ' dc-slot' : '') + (punct ? ' is-punct' : ''), text);
      sentence.append(span);
      r.toks.push(span);
      if (blank) r.slot = span;
    });
    const lines = el('div', 'dc-lines');
    lines.append(sentence);

    area.append(zone, lines);
    Object.assign(r, { zone, row, whole, svg, path, head, finger, sentence, pill });
    return r;
  }

  /* ---------- measure resting positions ---------- */
  function measure(r) {
    gsap.set(r.whole, { xPercent: -50 });
    const zr = r.zone.getBoundingClientRect();

    // where each tile letter must travel to sit inside the whole word
    r.delta = r.letters.map((l, i) => {
      const a = l.getBoundingClientRect(), b = r.wholeLetters[i].getBoundingClientRect();
      return { x: b.left - a.left, y: b.top - a.top };
    });

    // blending swoop: an arc under the sound buttons, ending in an arrowhead
    const rowR = r.row.getBoundingClientRect();
    const btnBottom = Math.max(...r.btns.map(b => b.getBoundingClientRect().bottom));
    const w = rowR.width + 24, h = 34;
    const left = rowR.left - zr.left - 12, top = btnBottom - zr.top + 4;
    Object.assign(r.svg.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' });
    r.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    r.path.setAttribute('d', `M 10 6 Q ${w / 2} ${h + 14} ${w - 12} 6`);
    r.len = r.path.getTotalLength();
    const p1 = r.path.getPointAtLength(r.len), p0 = r.path.getPointAtLength(r.len - 6);
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x), k = 9;
    const a1 = ang + Math.PI * 0.8, a2 = ang - Math.PI * 0.8;
    r.head.setAttribute('d', `M ${p1.x + k * Math.cos(a1)} ${p1.y + k * Math.sin(a1)} L ${p1.x} ${p1.y} L ${p1.x + k * Math.cos(a2)} ${p1.y + k * Math.sin(a2)}`);
    r.swoopAt = { left, top };

    // flight from the assembled word into the blank in the sentence
    const wr = r.whole.getBoundingClientRect(), sr = r.slot.getBoundingClientRect();
    r.fly = {
      x: (sr.left + sr.width / 2) - (wr.left + wr.width / 2),
      y: (sr.top + sr.height / 2) - (wr.top + wr.height / 2),
      s: sr.width / wr.width,
    };

    // reading highlighter stops (words only, not punctuation)
    const sentR = r.sentence.getBoundingClientRect();
    r.reads = r.toks.filter(t => !t.classList.contains('is-punct')).map(t => {
      const b = t.getBoundingClientRect();
      return { el: t, x: b.left - sentR.left - 5, y: b.top - sentR.top + b.height * 0.12, w: b.width + 10, h: b.height * 0.82 };
    });
  }

  function ride(r, p) {
    r.path.style.strokeDashoffset = r.len * (1 - p);
    const pt = r.path.getPointAtLength(r.len * p);
    gsap.set(r.finger, { x: r.swoopAt.left + pt.x, y: r.swoopAt.top + pt.y });
  }

  function setStep(k) {
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === k);
      s.classList.toggle('is-done', i < k);
    });
  }

  /* ---------- the choreography ---------- */
  function makeTimeline(r, onDone) {
    const accent = getComputedStyle(stage).getPropertyValue('--accent').trim() || '#b8500a';
    const tl = gsap.timeline({ paused: true, onComplete: onDone });

    gsap.set(r.letters, { y: -170, rotation: () => gsap.utils.random(-35, 35), opacity: 0 });
    gsap.set(r.bodies, { scale: 0.5, opacity: 0 });
    gsap.set(r.btns, { scale: 0 });
    gsap.set(r.phs, { opacity: 0, y: 6 });
    gsap.set(r.whole, { opacity: 0, x: 0, y: 0, scale: 1 });
    gsap.set(r.path, { strokeDasharray: r.len, strokeDashoffset: r.len, opacity: 0 });
    gsap.set([r.head, r.finger], { opacity: 0 });
    gsap.set(r.toks, { opacity: 0, y: 12 });
    gsap.set(r.pill, { opacity: 0 });

    // 1  Sound → symbol
    tl.call(setStep, [0], 0)
      .to(r.letters, { y: 0, rotation: 0, opacity: 1, duration: 0.95, ease: 'bounce.out', stagger: 0.07 }, 0.15)
      .to(r.bodies, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.2)', stagger: 0.1 }, 0.75)
      .to(r.btns, { scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.1 }, 1.15);
    let t = 1.75;
    r.tiles.forEach((tile, i) => {
      tl.to(tile, { y: -10, duration: 0.17, ease: 'power2.out', yoyo: true, repeat: 1 }, t)
        .to(r.btns[i], { scale: 1.7, backgroundColor: accent, duration: 0.17, yoyo: true, repeat: 1 }, t)
        .fromTo(r.rings[i], { scale: 0.4, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 0.7, ease: 'power2.out' }, t)
        .to(r.phs[i], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, t + 0.05);
      t += 0.5;
    });

    // 2  Blend ↔ segment
    t += 0.4;
    const swoop = { p: 0 };
    tl.call(setStep, [1], t)
      .to(r.phs, { opacity: 0, y: -4, duration: 0.25 }, t)
      .to(r.finger, { opacity: 1, duration: 0.15 }, t)
      .set(r.path, { opacity: 1 }, t + 0.02)
      .to(swoop, { p: 1, duration: 0.95, ease: 'power1.inOut', onUpdate: () => ride(r, swoop.p) }, t)
      .to(r.head, { opacity: 1, duration: 0.15 }, t + 0.9)
      .to(r.finger, { opacity: 0, duration: 0.2 }, t + 0.95)
      .to(r.letters, { x: i => r.delta[i].x, y: i => r.delta[i].y, duration: 0.6, ease: 'power3.inOut' }, t + 0.45)
      .to(r.bodies, { opacity: 0, scaleX: 0.8, duration: 0.4 }, t + 0.45)
      .to(r.btns, { scale: 0, duration: 0.3 }, t + 0.45)
      .set(r.whole, { opacity: 1 }, t + 1.06)
      .set(r.letters, { opacity: 0 }, t + 1.06)
      .to(r.whole, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, t + 1.06);

    t += 1.75;   // segment: the word splits back into its sounds
    tl.to([r.path, r.head], { opacity: 0, duration: 0.25 }, t)
      .set(r.whole, { opacity: 0 }, t)
      .set(r.letters, { opacity: 1 }, t)
      .to(r.letters, { x: 0, y: 0, duration: 0.5, ease: 'power3.inOut' }, t)
      .to(r.bodies, { opacity: 1, scaleX: 1, duration: 0.35 }, t + 0.15)
      .to(r.btns, { scale: 1, duration: 0.3, ease: 'back.out(3)', stagger: 0.06 }, t + 0.25);

    t += 1.0;    // and blends again, faster
    tl.to(r.letters, { x: i => r.delta[i].x, y: i => r.delta[i].y, duration: 0.4, ease: 'power3.inOut' }, t)
      .to(r.bodies, { opacity: 0, duration: 0.3 }, t)
      .to(r.btns, { scale: 0, duration: 0.25 }, t)
      .set(r.whole, { opacity: 1 }, t + 0.42)
      .set(r.letters, { opacity: 0 }, t + 0.42);

    // 3  Apply in text
    t += 0.8;
    tl.call(setStep, [2], t)
      .to(r.toks.filter(x => x !== r.slot), { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, t)
      .to(r.slot, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t + 0.1)
      .to(r.whole, { x: r.fly.x, y: r.fly.y, scale: r.fly.s, duration: 0.8, ease: 'power3.inOut' }, t + 0.6)
      .to(r.whole, { rotation: -5, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 0.6)
      .set(r.whole, { opacity: 0 }, t + 1.4)
      .call(() => r.slot.classList.add('is-filled'), null, t + 1.4)
      .fromTo(r.slot, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t + 1.4);

    // 4  Fluency: read once, then again faster with a bounce on each word
    t += 2.0;
    const first = r.reads[0];
    tl.call(setStep, [3], t)
      .call(() => r.pill.classList.remove('is-fast'), null, t)
      .set(r.pill, { x: first.x, y: first.y, width: first.w, height: first.h }, t)
      .to(r.pill, { opacity: 1, duration: 0.15 }, t);
    let u = t + 0.25;
    r.reads.forEach((rd, i) => {
      if (i) tl.to(r.pill, { x: rd.x, y: rd.y, width: rd.w, duration: 0.26, ease: 'power2.inOut' }, u);
      u += 0.38;
    });
    tl.to(r.pill, { opacity: 0, duration: 0.12 }, u)
      .set(r.pill, { x: first.x, y: first.y, width: first.w }, u + 0.14)
      .call(() => r.pill.classList.add('is-fast'), null, u + 0.14)
      .to(r.pill, { opacity: 1, duration: 0.1 }, u + 0.2);
    u += 0.3;
    r.reads.forEach((rd, i) => {
      if (i) tl.to(r.pill, { x: rd.x, y: rd.y, width: rd.w, duration: 0.12, ease: 'power1.inOut' }, u);
      tl.to(rd.el, { y: -8, duration: 0.11, yoyo: true, repeat: 1, ease: 'power2.out' }, u);
      u += 0.16;
    });

    // outro
    u += 0.9;
    tl.to(r.pill, { opacity: 0, duration: 0.25 }, u - 0.3)
      .to(r.toks, { opacity: 0, y: -10, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, u)
      .to({}, { duration: 0.35 }, u + 0.4);
    return tl;
  }

  /* ---------- static diagram (reduced motion, or GSAP unavailable) ---------- */
  function showStatic() {
    stage.classList.add('is-static');
    const r = build(WORDS[0]);
    r.slot.classList.add('is-filled');
    toggle.hidden = true;
    if (!window.gsap) return;
    measure(r);
    // labels stay visible here, so draw the swoop below them
    const drop = r.phs[0].getBoundingClientRect().height + 8;
    r.svg.style.top = (parseFloat(r.svg.style.top) + drop) + 'px';
  }

  /* ---------- run loop ---------- */
  let index = 0, tl = null, inView = false, started = false, userPaused = false;

  function sync() {
    if (!tl) return;
    (inView && !userPaused && !document.hidden) ? tl.play() : tl.pause();
  }
  function run(i) {
    index = i;
    tl?.kill();
    const r = build(WORDS[i]);
    measure(r);
    tl = makeTimeline(r, () => run((i + 1) % WORDS.length));
    sync();
  }
  function renderToggle() {
    toggle.innerHTML = userPaused ? ICON_PLAY : ICON_PAUSE;
    toggle.setAttribute('aria-label', userPaused ? 'Play animation' : 'Pause animation');
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap) {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(showStatic);
    return;
  }

  renderToggle();
  toggle.addEventListener('click', () => { userPaused = !userPaused; renderToggle(); sync(); });
  document.addEventListener('visibilitychange', sync);

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView && !started) {
      started = true;
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => run(0));
    } else sync();
  }, { threshold: 0.35 }).observe(stage);

  // positions depend on size: restart the current word after a resize
  let resizeTimer, lastWidth = stage.clientWidth;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!started || stage.clientWidth === lastWidth) return;
      lastWidth = stage.clientWidth;
      setStep(-1);
      run(index);
    }, 250);
  });
})();
