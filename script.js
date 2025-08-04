/*────────────────────────────
   Activate Education – v3
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
  bar.style.width = `${(scrollY / (document.body.scrollHeight - innerHeight)) * 100}%`;
});

/* ========== Burger / Nav ========== */
$('#burger')?.addEventListener('click', () => {
  $('#burger').classList.toggle('active');
  $('#mainNav').classList.toggle('open');
});

/* ========== Theme toggle (dark by default) ========== */
const html     = document.documentElement;
const themeBtn = $('#themeToggle');

/* show correct emoji */
const renderIcon = () =>
  (themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙');

/* initial state: dark unless user stored 'light' */
html.classList.toggle('dark', localStorage.theme !== 'light');
renderIcon();
themeBtn.title = 'Toggle light / dark';

themeBtn.addEventListener('click', () => {
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  renderIcon();
});

/* ========== GSAP setup ========== */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* Hero text-scramble */
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

/* Reveal-on-scroll */
gsap.utils.toArray('.reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('visible'),
  });
});

/* Parallax headline */
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
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
});



