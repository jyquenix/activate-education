/*──────────────────────────────────────────
  Activate Education • script.js
──────────────────────────────────────────*/

// ── 1. Dark-mode toggle ───────────────────
const html  = document.documentElement;
const theme = document.getElementById('themeToggle');

const applyTheme = mode => {
  if (mode === 'dark') html.classList.add('dark');
  else                 html.classList.remove('dark');
  theme.classList.toggle('on', mode === 'dark');
  localStorage.setItem('activateTheme', mode);
};

applyTheme(localStorage.getItem('activateTheme') || 'light');

theme.addEventListener('click', () =>
  applyTheme(html.classList.contains('dark') ? 'light' : 'dark')
);

// ── 2. Mobile hamburger ───────────────────
const burger = document.getElementById('hamburger');
const nav    = document.getElementById('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  nav.classList.toggle('open');
});

// ── 3. Typewriter headline ────────────────
const words = ['Potential','Success','Future','Dreams'];
let idx = 0, len = 0, dir = 1;
const tw = document.getElementById('tw');

setInterval(() => {
  tw.textContent = words[idx].slice(0, len);
  len += dir;
  if (len === words[idx].length || len === 0) { dir *= -1; if (len === 0) idx = (idx+1) % words.length; }
}, 130);

// ── 4. GSAP hero reveal ───────────────────
gsap.from('.hero-inner > *', {
  y: 25, opacity: 0, stagger: 0.15, duration: 1, ease: 'power2.out'
});

// ── 5. Scroll-reveal service cards ────────
const cards = document.querySelectorAll('.card');
const revealObs = new IntersectionObserver((entries, o) => {
  entries.forEach(e => {
    if (e.isIntersecting){
      e.target.classList.add('visible');
      o.unobserve(e.target);
    }
  });
},{ threshold: 0.2 });
cards.forEach(c => revealObs.observe(c));

// ── 6. Vanilla-Tilt on cards ──────────────
VanillaTilt.init(document.querySelectorAll('.tilt'), {
  max: 10, speed: 400, glare: true, 'max-glare': .25
});

// ── 7. Impact counters ────────────────────
document.querySelectorAll('.counter span').forEach(el => {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el,
    onEnter: () => {
      let n = 0;
      const steps = 30, inc = Math.ceil(target / steps), delay = 2000 / steps;
      const tick = setInterval(() => {
        n += inc;
        if (n >= target) { el.textContent = target + suffix; clearInterval(tick); }
        else             { el.textContent = n + suffix; }
      }, delay);
    },
    once: true
  });
});

// ── 8. Swiper testimonials ────────────────
new Swiper('#swiper', {
  loop: true,
  autoplay: { delay: 4000, disableOnInteraction: false },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
});

// ── 9. Back-to-top button ─────────────────
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () =>
  topBtn.style.display = window.scrollY > 500 ? 'grid' : 'none'
);
topBtn.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

// ──10. Floating-label contact form ────────
document.getElementById('contact-form').addEventListener('submit', e => {
  let ok = true;
  e.target.querySelectorAll('input,textarea').forEach(inp => {
    if (!inp.checkValidity()) {
      inp.classList.add('input-invalid');
      ok = false;
    } else {
      inp.classList.remove('input-invalid');
    }
  });
  if (!ok) e.preventDefault();
});
