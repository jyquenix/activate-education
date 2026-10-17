/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Gallery lightbox
   Runs only on pages that have the gallery markup.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
(() => {
  // gallery.html does not load GSAP, so the scroll-reveal in script.js never
  // runs here and .reveal elements stay at opacity 0. Show them directly.
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  const box = document.getElementById('lightbox');
  const tiles = [...document.querySelectorAll('.gallery-grid .tile')];
  if (!box || !tiles.length) return;

  const lbImg     = document.getElementById('lbImg');
  const lbCount   = document.getElementById('lbCount');
  const btnClose  = document.getElementById('lbClose');
  const btnPrev   = document.getElementById('lbPrev');
  const btnNext   = document.getElementById('lbNext');

  const photos = tiles.map(t => {
    const img = t.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
  });

  let index = 0;
  let lastFocus = null;

  const show = i => {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    lbImg.src = p.src;
    lbImg.alt = p.alt;
    lbCount.textContent = `${index + 1} of ${photos.length}`;
  };

  const open = i => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  };

  const close = () => {
    box.classList.remove('is-open');
    box.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  };

  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));

  // Click the backdrop (not the photo or a button) to close
  box.addEventListener('click', e => { if (e.target === box) close(); });

  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape')     { close(); }
    else if (e.key === 'ArrowLeft')  { show(index - 1); }
    else if (e.key === 'ArrowRight') { show(index + 1); }
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog while it is open
      const f = [btnClose, btnPrev, btnNext];
      const pos = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(pos + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // Swipe between photos on touch devices
  let touchX = null;
  box.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
})();
