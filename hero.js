/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Home hero: typed headline, then a full-band slideshow, then repeat.
   Cycle: headline types out (75 ms per letter) → holds 0.5 s →
   slide 1 → slide 2 → slide 3 (2 s each) → headline retypes → …
   The arrows move through the same cycle and never stop it.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
(() => {
  const hero = document.getElementById('hero');
  const h1 = document.getElementById('hero-title');
  const slides = [...document.querySelectorAll('.hero-slide')];
  if (!hero || !h1 || !slides.length) return;

  const TYPE_MS = 75, HOLD_MS = 500, SLIDE_MS = 2000;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wrap every letter in a span. All letters keep their space from the
     start (hidden ones are transparent), so the layout never shifts and
     screen readers always get the full headline. */
  const chars = [];
  const wrap = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) {
        const text = n.textContent.replace(/\s+/g, ' ');
        const frag = document.createDocumentFragment();
        [...text].forEach(c => {
          if (c === ' ' && (!chars.length || frag.lastChild?.textContent === ' ')) return;
          const s = document.createElement('span');
          s.className = 'ch'; s.textContent = c;
          frag.appendChild(s); chars.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE) wrap(n);
    });
  };
  wrap(h1);
  while (chars.length && chars[chars.length - 1].textContent === ' ') chars.pop().remove();
  hero.classList.add('hero-ready');

  let index = -1;          // -1 = headline, 0..n-1 = slide
  let timer = null;

  const setCaret = n => {
    chars.forEach(c => c.classList.remove('caret', 'caret-start'));
    if (n === 0) chars[0].classList.add('caret-start');
    else chars[n - 1].classList.add('caret');
  };

  const typeHeadline = () => {
    if (reduce) { chars.forEach(c => c.classList.add('on')); setCaret(chars.length); timer = setTimeout(() => show(0), 1500); return; }
    chars.forEach(c => c.classList.remove('on'));
    let n = 0; setCaret(0);
    const step = () => {
      chars[n].classList.add('on'); n += 1; setCaret(n);
      timer = n < chars.length ? setTimeout(step, TYPE_MS) : setTimeout(() => show(0), HOLD_MS);
    };
    timer = setTimeout(step, 250);
  };

  function show(i) {
    clearTimeout(timer);
    index = i;
    if (i === -1) {
      hero.classList.remove('show-slides');
      typeHeadline();
      return;
    }
    hero.classList.add('show-slides');
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    timer = setTimeout(() => show(i + 1 < slides.length ? i + 1 : -1), SLIDE_MS);
  }

  hero.querySelector('.hero-next')?.addEventListener('click', () =>
    show(index + 1 < slides.length ? index + 1 : -1));
  hero.querySelector('.hero-prev')?.addEventListener('click', () =>
    show(index === -1 ? slides.length - 1 : index - 1));

  show(-1);
})();
