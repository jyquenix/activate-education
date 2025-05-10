/*────────────────────────────────────────
   Activate Education – merged v4+v3
────────────────────────────────────────*/

/* Helpers */
const $  = s => document.querySelector(s),
      $$ = s => document.querySelectorAll(s);

/* Preloader */
window.addEventListener('load', () => document.body.classList.add('loaded'));

/* Lazy-load media */
document.addEventListener('DOMContentLoaded', () => {
  $$('[data-src]').forEach(el => {
    el.src = el.dataset.src;
    el.removeAttribute('data-src');
  });
});

/* Progress bar */
const bar = document.createElement('div');
bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:var(--accent);width:0;z-index:2000;transition:width .1s';
document.body.append(bar);
addEventListener('scroll', () => bar.style.width = `${scrollY/(document.body.scrollHeight - innerHeight)*100}%`);

/* Burger nav */
$('#burger')?.addEventListener('click', () => {
  $('#burger').classList.toggle('active');
  $('#mainNav').classList.toggle('open');
});

/* Theme toggle */
const html     = document.documentElement;
const themeBtn = $('#themeToggle');
const renderIcon = () => themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
html.classList.toggle('dark', localStorage.theme !== 'light');
renderIcon();
themeBtn.title = 'Toggle light / dark';
themeBtn.addEventListener('click', () => {
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  renderIcon();
});

/* Scrollspy */
const navLinks = $$('nav a');
const secs = $$('main section');
addEventListener('scroll', () => {
  let idx = secs.length;
  while(--idx && window.scrollY + 100 < secs[idx].offsetTop){}
  navLinks.forEach(a=>a.classList.remove('active'));
  navLinks[idx].classList.add('active');
});

/* GSAP & TextPlugin */
gsap.registerPlugin(ScrollTrigger, TextPlugin);
/* Hero text-scramble */
if($('.gradient-text')){
  const words=['Potential','Success','Dreams','Future'];
  const tl=gsap.timeline({repeat:-1});
  words.forEach(w=>tl.to('.gradient-text',{duration:1,text:{value:w,scrambleText:{chars:'█▓▒░'}}}).to({}, {duration:1.5}));
}
/* Reveal */
gsap.utils.toArray('.reveal').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 85%',onEnter:()=>el.classList.add('visible')}));
/* Parallax */
gsap.to('.headline',{yPercent:20,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

/* 3D tilt on cards */
$$('.card.pop').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateX(${-y*6}deg) rotateY(${x*6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* Counters */
$$('[data-count]').forEach(el=>{
  const val=+el.dataset.count, suf=el.dataset.suffix||'';
  ScrollTrigger.create({trigger:el,start:'top 80%',once:true,onEnter:()=>{
    let n=0,inc=Math.max(1,Math.round(val/60));
    const t=setInterval(()=>{n+=inc;if(n>=val){el.textContent=val+suf;clearInterval(t);}else el.textContent=n+suf;},25);
  }});
});

/* Swiper testimonials */
if($('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{loop:true,autoplay:{delay:5000},pagination:{el:'.swiper-pagination',clickable:true}});
}

/* Marquee init */
const marq = document.querySelector('.testimonials .marquee');
if(marq) marq.innerHTML += marq.innerHTML;

/* Back-to-top */
const toTop = $('#toTop');
addEventListener('scroll',()=>toTop?.classList.toggle('show',scrollY>600));
toTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* Confetti on form submit */
$('#cForm')?.addEventListener('submit',e=>{
  if(!e.target.checkValidity()){e.preventDefault();return;}
  confetti({particleCount:120,spread:70,origin:{y:0.7}});
});
