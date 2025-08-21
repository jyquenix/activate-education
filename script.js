/*────────────────────────────
   Activate Education – v3.2 (site-wide + Curriculum FX)
────────────────────────────*/

/* ========== Helpers ========== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========== Progress bar ========== */
const bar = document.createElement('div');
bar.style.cssText =
  'position:fixed;top:0;left:0;height:3px;background:var(--accent);width:0;z-index:2000;transition:width .1s';
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

/* show correct emoji */
const renderIcon = () =>
  (themeBtn && (themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙'));

/* initial state: dark unless user stored 'light' */
html.classList.toggle('dark', localStorage.theme !== 'light');
renderIcon?.();
if (themeBtn) themeBtn.title = 'Toggle light / dark';

themeBtn?.addEventListener('click', () => {
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  renderIcon();
});

/* ========== GSAP setup ========== */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* Hero text-scramble (home only) */
if ($('.gradient-text')) {
  const words = ['Potential', 'Success', 'Dreams', 'Future'];
  const tl = gsap.timeline({ repeat: -1 });
  words.forEach(w => {
    tl.to('.gradient-text', {
      duration: 1,
      text: { value: w, scrambleText: { chars: '█▓▒░' } },
    }).to({}, { duration: 1.5 });
  });
}

/* Reveal-on-scroll (resilient + reveal items already in view) */
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

/* Parallax headline — only if .hero exists on this page */
if (document.querySelector('.hero') && document.querySelector('.headline')) {
  gsap.to('.headline', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* 3-D card tilt */
$$('.card.pop').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
});

/* Impact counters */
$$('[data-count]').forEach(el => {
  const val = +el.dataset.count,
    suf = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      let n = 0,
        inc = Math.max(1, Math.round(val / 60));
      const int = setInterval(() => {
        n += inc;
        if (n >= val) {
          el.textContent = val + suf;
          clearInterval(int);
        } else {
          el.textContent = n + suf;
        }
      }, 25);
    },
  });
});

/* Swiper testimonials */
if ($('#testimonialSwiper')) {
  new Swiper('#testimonialSwiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
  });
}

/* Back-to-top */
const toTop = $('#toTop');
addEventListener('scroll', () => toTop?.classList.toggle('show', scrollY > 600));
toTop?.addEventListener('click', () =>
  scrollTo({ top: 0, behavior: 'smooth' })
);

/* Confetti on contact submit */
$('#cForm')?.addEventListener('submit', e => {
  if (!e.target.checkValidity()) {
    e.preventDefault();
    return;
  }
  confetti?.({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
});

/* =======================================================
   Curriculum page effects (scoped, safe on other pages)
   Expects elements from approach.html special version
=========================================================*/
(function () {
  const isCurriculum = document.querySelector('.curriculum-hero');
  if (!isCurriculum) return;

  /* Entrance animations */
  gsap.from('.headline-lg', { y: 18, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 });
  gsap.from('.hero-sub',    { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 });

  /* Section underline + card rise on enter */
  gsap.utils.toArray('.fx-card').forEach(card => {
    const u = card.querySelector('.u');
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(card, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
        if (u) gsap.to(u, { scaleX: 1, duration: 0.6, ease: 'power3.out' });
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
      onToggle: self => {
        if (self.isActive) {
          tocLinks.forEach(x => x.classList.remove('active'));
          a.classList.add('active');
        }
      }
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
  if (pinBox) {
    ScrollTrigger.create({
      trigger: pinBox,
      start: 'top 120px',
      end: '+=600',
      pin: true,
      pinSpacing: true
    });
    gsap.utils.toArray('#timeline .step').forEach(step => {
      gsap.from(step, {
        opacity: 0,
        x: -20,
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 80%' }
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
  gsap.to('.orb.one',   { xPercent:  8, yPercent: -6, scrollTrigger: { scrub: 1 } });
  gsap.to('.orb.two',   { xPercent: -6, yPercent:  8, scrollTrigger: { scrub: 1 } });
  gsap.to('.orb.three', { xPercent:  4, yPercent:  4, scrollTrigger: { scrub: 1 } });
})();
