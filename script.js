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

/* line icons instead of emoji: sun shown in dark mode, moon in light mode */
const ICON_SUN  = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const renderIcon = () =>
  (themeBtn && (themeBtn.innerHTML = html.classList.contains('dark') ? ICON_SUN : ICON_MOON));

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
