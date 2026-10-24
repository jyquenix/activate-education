/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Small scroll-in animations (Stories, Curriculum).
   - Stories: the 5.0 rating counts up from 0.0 and the stars turn gold
     one at a time as the count passes each whole number.
   - Any [data-anim] element gets .in-view when it scrolls into view;
     style.css runs the animation (highlighter heading, ticket roll).
   Without JS, or with reduced motion, everything shows in its final
   state: the hidden starting states apply only under .anim-ready.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('anim-ready');

  /* rating count-up */
  const score = document.querySelector('.rating-score');
  let stars = [];
  if (score) {
    const g = document.querySelector('.rating-detail .g-stars');
    if (g) {
      g.innerHTML = [...g.textContent.trim()].map(s => `<span class="star">${s}</span>`).join('');
      stars = [...g.children];
    }
    score.dataset.final = score.textContent.trim();
    score.textContent = '0.0';
  }

  function countUp() {
    const end = parseFloat(score.dataset.final) || 5, dur = 1400, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const v = end * (1 - Math.pow(1 - p, 3));
      score.textContent = p < 1 ? v.toFixed(1) : score.dataset.final;
      stars.forEach((s, i) => { if (v >= i + 1 - 1e-6) s.classList.add('on'); });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (e.target === score) countUp();
    else e.target.classList.add('in-view');
  }), { threshold: 0.5 });

  if (score) io.observe(score);
  document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));
})();
