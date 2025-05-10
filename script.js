/*────────────────────────────────────────
   Activate Education – v4
────────────────────────────────────────*/

/* Helpers */
const $ = s => document.querySelector(s),
      $$ = s => document.querySelectorAll(s);

/* Preloader hide on load */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* Lazy‑load images/videos */
document.addEventListener('DOMContentLoaded', () => {
  const lazy = $$('img[data-src],video[data-src]');
  lazy.forEach(el => {
    el.src = el.dataset.src;
    el.removeAttribute('data-src');
  });
});

/* Scrollspy nav highlight */
const navLinks = $$('nav a');
const sections = $$('main section');
window.addEventListener('scroll', () => {
  let idx = sections.length;
  while (--idx && window.scrollY + 100 < sections[idx].offsetTop) {}
  navLinks.forEach(a => a.classList.remove('active'));
  navLinks[idx].classList.add('active');
});

/* Hero typewriter effect */
const heroTxt = document.querySelector('.hero h1');
if (heroTxt) {
  const text = heroTxt.textContent;
  heroTxt.textContent = '';
  let i=0;
  const t=setInterval(()=>{
    heroTxt.textContent+=text[i++];
    if(i>=text.length) clearInterval(t);
  },100);
}

/* Testimonials marquee setup */
const tm = document.querySelector('.testimonials .marquee');
if (tm) {
  // duplicate content for seamless loop
  tm.innerHTML += tm.innerHTML;
}

/* Section reveal */
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('section:not(.hero)').forEach(sec => {
  gsap.from(sec, {
    opacity:0, y:50, duration:1,
    scrollTrigger:{trigger:sec, start:'top 80%'}
  });
});
