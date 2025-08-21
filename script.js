/*────────────────────────────
   Activate Education – v3.3 (refined / professional)
   - Subtler motion, same features
   - Guards for pages without certain elements
   - Respects reduced-motion
────────────────────────────*/

/* ========== Helpers ========== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== Progress bar ========== */
const bar = document.createElement('div');
bar.style.cssText =
  'position:fixed;top:0;left:0;height:3px;background:var(--accent);width:0;z-index:2000;transition:width .12s ease-out';
document.body.append(bar);
addEventListener('scroll', () => {
  const h = document.body.scrollHeight - innerHeight;
  bar.style.width = `${(h > 0 ? (scrollY / h) : 0) * 100}%`;
});

/* ========== Burger / Nav ========== */
$('#burger')?.addEventListener('click', () => {
  $('#burger').classList.toggle('active');
  $('#mainNav')?.classList.toggle('open');
});

/* ========== Theme toggle (dark by default) ========== */
const html     = document.documentElement;
const themeBtn = $('#themeToggle');

const renderIcon = () => {
  if (!themeBtn) return;
  themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
};

/* initial state: dark unless user stored 'light' */
html.classList.toggle('dark', localStorage.theme !== 'light');
renderIcon();
if (themeBtn) themeBtn.title = 'Toggle light / dark';

themeBtn?.addEventListener('click', () => {
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  renderIcon();
});

/* ========== GSAP setup ========== */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* Hero word-rotate (gentle crossfade, no scramble) */
if ($('.gradient-text') && !prefersReduced) {
  const words = ['Potential', 'Success', 'Dreams', 'Future'];
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.out' } });
  words.forEach((w) => {
    tl.to('.gradient-text', { duration: 0.6, text: w, opacity: 1 })
      .to({}, { duration: 1.8 }) // dwell
      .to('.gradient-text', { duration: 0.25, opacity: 0.9 }); // very subtle dip
  });
}

/* Reveal-on-scroll (resilient + reveal items already in view) */
if (!prefersReduced) {
  gsap.utils.toArray('.reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('visible'),
      onEnterBack: () => el.classList.add('visible'),
      once: true,
    });
    // If element starts in view, reveal immediately
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.85) el.classList.add('visible');
  });
} else {
  // Respect reduced motion
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

/* Parallax headline — subtle, only when hero exists */
if (!prefersReduced && document.querySelector('.hero') && document.querySelector('.headline')) {
  gsap.to('.headline', {
    yPercent: 10,                  // reduced from 20
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* 3-D card tilt — gentler, desktop only */
if (matchMedia('(pointer:fine)').matches) {
  $$('.card.pop').forEach(card => {
    let frame;
    const onMove = e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.transform =
          `rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-3px)`; // reduced angles
      });
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });
}

/* Impact counters (unchanged behaviour, slightly smoother rate) */
$$('[data-count]').forEach(el => {
  const val = +el.dataset.count,
        suf = el.dataset.suffix || '';
  if (prefersReduced) { el.textContent = val + suf; return; }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      let n = 0, inc = Math.max(1, Math.round(val / 70));
      const int = setInterval(() => {
        n += inc;
        if (n >= val) {
          el.textContent = val + suf;
          clearInterval(int);
        } else {
          el.textContent = n + suf;
        }
      }, 28);
    },
  });
});

/* Swiper testimonials (same behaviour, eased speed) */
if ($('#testimonialSwiper')) {
  new Swiper('#testimonialSwiper', {
    loop: true,
    autoplay: { delay: 5200, disableOnInteraction: false },
    speed: 550,
    pagination: { el: '.swiper-pagination', clickable: true },
  });
}

/* Back-to-top */
const toTop = $('#toTop');
addEventListener('scroll', () => toTop?.classList.toggle('show', scrollY > 600));
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* Confetti on contact submit — modest */
$('#cForm')?.addEventListener('submit', e => {
  if (!e.target.checkValidity()) {
    e.preventDefault();
    return;
  }
  confetti?.({ particleCount: 60, spread: 50, origin: { y: 0.7 } }); // toned down
});

/* =======================================================
   Curriculum page effects (scoped, refined)
=========================================================*/
(function () {
  const isCurriculum = document.querySelector('.curriculum-hero');
  if (!isCurriculum) return;

  /* Entrance animations */
  if (!prefersReduced) {
    gsap.from('.headline-lg', { y: 14, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.05 });
    gsap.from('.hero-sub',    { y: 12, opacity: 0, duration: 0.55, ease: 'power2.out', delay: 0.12 });
  }

  /* Section underline + card rise on enter */
  gsap.utils.toArray('.fx-card').forEach(card => {
    const u = card.querySelector('.u');
    if (prefersReduced) { u && (u.style.transform = 'scaleX(1)'); return; }
    ScrollTrigger.create({
      trigger: card,
      start: 'top 82%',
      onEnter: () => {
        gsap.fromTo(card, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        if (u) gsap.to(u, { scaleX: 1, duration: 0.55, ease: 'power3.out' });
      }
    });
  });

  /* Sticky TOC active link */
  const tocLinks = Array.from(document.querySelectorAll('#toc a'));
  tocLinks.forEach(a => {
    const id = a.getAttribute('href');
    const sec = document.querySelector(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onToggle: self => { if (self.isActive) { tocLinks.forEach(x => x.classList.remove('active')); a.classList.add('active'); } }
    });
  });

  /* Smooth scroll for TOC with header offset */
  const header = document.querySelector('.glass-nav');
  const headerH = () => (header ? header.getBoundingClientRect().height : 0);
  document.getElementById('toc')?.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    const top = scrollY + sec.getBoundingClientRect().top - (headerH() + 12);
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* Pinned decode/encode timeline */
  const pinBox = document.querySelector('#decode.pinned');
  if (pinBox && !prefersReduced) {
    ScrollTrigger.create({ trigger: pinBox, start: 'top 120px', end: '+=520', pin: true, pinSpacing: true });
    gsap.utils.toArray('#timeline .step').forEach(step => {
      gsap.from(step, {
        opacity: 0, x: -16, duration: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 82%' }
      });
    });
  }

  /* Left progress rail */
  const rail = $('#railBar');
  if (rail) {
    const docH = () => document.body.scrollHeight - innerHeight;
    const setRail = () => (rail.style.height = `${Math.min(100, (scrollY / Math.max(1, docH())) * 100)}%`);
    addEventListener('scroll', setRail, { passive: true });
    addEventListener('resize', setRail);
    setRail();
  }

  /* Subtle parallax for hero orbs */
  if (!prefersReduced) {
    gsap.to('.orb.one',   { xPercent:  6, yPercent: -4, scrollTrigger: { scrub: 1 } });
    gsap.to('.orb.two',   { xPercent: -5, yPercent:  6, scrollTrigger: { scrub: 1 } });
    gsap.to('.orb.three', { xPercent:  3, yPercent:  3, scrollTrigger: { scrub: 1 } });
  }
})();
