/*────────────────────────────
   Activate Education – site script
────────────────────────────*/

/* ========== Helpers ========== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========== Burger / Nav ========== */
$('#burger')?.addEventListener('click', () => {
  $('#burger').classList.toggle('active');
  $('#mainNav')?.classList.toggle('open');
});

/* ========== Theme toggle (light by default) ========== */
const html     = document.documentElement;
const themeBtn = $('#themeToggle');

/* show correct emoji */
const renderIcon = () =>
  (themeBtn && (themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙'));

/* initial state: light unless the visitor chose dark with the toggle */
html.classList.toggle('dark', localStorage.theme === 'dark');
renderIcon?.();
if (themeBtn) themeBtn.title = 'Toggle light / dark';

themeBtn?.addEventListener('click', () => {
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  renderIcon();
});

/* ========== Swiper testimonials ========== */
if ($('#testimonialSwiper') && typeof Swiper !== 'undefined') {
  new Swiper('#testimonialSwiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
  });
}

/* ========== Back-to-top ========== */
const toTop = $('#toTop');
addEventListener('scroll', () => toTop?.classList.toggle('show', scrollY > 600), { passive: true });
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ========== Reveal-on-scroll ==========
   Uses GSAP ScrollTrigger when the page loads it. Pages without GSAP
   (or where the CDN fails) show everything at once instead of leaving
   .reveal content invisible. */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

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

  /* Curriculum page: highlight the table-of-contents link for the section in view */
  $$('#toc a').forEach((a, _, all) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onToggle: self => {
        if (!self.isActive) return;
        all.forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      },
    });
  });
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

/* ========== Curriculum page: table-of-contents smooth scroll ========== */
$('#toc')?.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const sec = document.querySelector(a.getAttribute('href'));
  if (!sec) return;
  e.preventDefault();
  const header = $('.glass-nav');
  const headerH = header ? header.getBoundingClientRect().height : 0;
  scrollTo({ top: scrollY + sec.getBoundingClientRect().top - (headerH + 12), behavior: 'smooth' });
});
