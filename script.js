// script.js
document.addEventListener('DOMContentLoaded', () => {
  // TYPEWRITER
  const words = ['Potential','Success','Future','Dreams'];
  let w = 0, l = 0, fwd = true;
  const tw = document.getElementById('typewriter');
  (function loop(){
    const word = words[w];
    tw.textContent = word.substring(0, l);
    if (fwd) {
      if (l < word.length) l++;
      else fwd = false;
    } else {
      if (l > 0) l--;
      else { fwd = true; w = (w+1) % words.length; }
    }
    setTimeout(loop, fwd ? 150 : 80);
  })();

  // SCROLL-REVEAL CARDS
  const cards = document.querySelectorAll('.card');
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => obs.observe(c));

  // COUNTERS (30 steps, ~2s)
  document.querySelectorAll('.counter span').forEach(el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    let count = 0;
    const steps = 30;
    const increment = Math.ceil(target / steps);
    const delay = 2000 / steps;
    const iv = setInterval(() => {
      count += increment;
      if (count >= target) {
        el.textContent = target + suffix;
        clearInterval(iv);
      } else {
        el.textContent = count + suffix;
      }
    }, delay);
  });

  // TESTIMONIAL CAROUSEL
  const slides = Array.from(document.querySelectorAll('.testimonial'));
  let idx = 0;
  function showSlide(i) {
    slides.forEach((s,j) => s.classList.toggle('show', j === i));
  }
  document.getElementById('prev').onclick = () => {
    idx = (idx - 1 + slides.length) % slides.length;
    showSlide(idx);
  };
  document.getElementById('next').onclick = () => {
    idx = (idx + 1) % slides.length;
    showSlide(idx);
  };
  showSlide(0);
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    showSlide(idx);
  }, 4000);

  // NAV TOGGLE
  document.querySelector('.nav-toggle').onclick = () => {
    const n = document.querySelector('.site-nav');
    n.style.display = n.style.display === 'flex' ? 'none' : 'flex';
    n.style.flexDirection = 'column';
  };

  // THEME TOGGLE
  document.querySelector('.theme-toggle').onclick = () => {
    document.body.classList.toggle('dark-theme');
    localStorage.dark = document.body.classList.contains('dark-theme');
  };
  if (localStorage.dark === 'true') document.body.classList.add('dark-theme');

  // BACK-TO-TOP
  const topBtn = document.querySelector('.back-to-top');
  window.onscroll = () => {
    topBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  };
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // CONTACT VALIDATION
  document.getElementById('contact-form').onsubmit = e => {
    let valid = true;
    e.target.querySelectorAll('input,textarea').forEach(inp => {
      if (!inp.checkValidity()) {
        inp.classList.add('input-invalid');
        valid = false;
      } else {
        inp.classList.remove('input-invalid');
      }
    });
    if (!valid) e.preventDefault();
  };
});
