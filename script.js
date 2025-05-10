/*───────────────────────────
  Activate Edu • script.js
───────────────────────────*/

// ===== 1.  Hamburger + Nav =====
const burger  = document.getElementById('burger');
const nav     = document.getElementById('mainNav');

burger.onclick = () => {
  burger.classList.toggle('active');
  nav.classList.toggle('open');
};

// ===== 2.  Theme Toggle =====
const html = document.documentElement;
const tBtn = document.getElementById('themeToggle');
const setMode = m => {
  html.classList.toggle('dark', m === 'dark');
  localStorage.theme = m;
};
setMode(localStorage.theme || 'light');
tBtn.onclick = () => setMode(html.classList.contains('dark') ? 'light' : 'dark');

// ===== 3.  GSAP & ScrollTrigger =====
gsap.registerPlugin(ScrollTrigger);

// reveal on scroll
gsap.utils.toArray('.reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('visible')
  });
});

// parallax hero headline
gsap.to('.headline', {
  yPercent: 20,
  ease: 'none',
  scrollTrigger:{
    trigger:'.hero',
    start:'top top',
    end:'bottom top',
    scrub:true
  }
});

// ===== 4.  Hero typewriter =====
const words=['Potential','Success','Future','Dreams'];
const tw    = document.querySelector('.gradient-text');
let w=0,len=0,dir=1;
setInterval(()=>{
  tw.textContent=words[w].slice(0,len);
  len+=dir;
  if(len===words[w].length||len===0){dir*=-1;if(len===0)w=(w+1)%words.length}
},130);

// ===== 5.  Odometer Counters =====
document.querySelectorAll('[data-count]').forEach(el=>{
  const val=+el.dataset.count;
  ScrollTrigger.create({
    trigger:el,
    start:'top 80%',
    once:true,
    onEnter:()=>{
      const inc = Math.max(1,Math.round(val/60));
      let n=0;
      const int=setInterval(()=>{
        n+=inc;
        if(n>=val){el.textContent=val;clearInterval(int);}
        else      {el.textContent=n;}
      },18);
    }
  });
});

// ===== 6.  Swiper Testimonials =====
/*global Swiper*/
const swiper=new Swiper('#testimonialSwiper',{
  loop:true,
  autoplay:{delay:5000,disableOnInteraction:false},
  pagination:{el:'.swiper-pagination',clickable:true},
  slidesPerView:1,
  spaceBetween:20
});

// ===== 7.  Back-to-top =====
const toTop = document.getElementById('toTop');
window.addEventListener('scroll',()=>toTop.classList.toggle('show',window.scrollY>600));
toTop.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

// ===== 8.  Contact form =====
document.getElementById('cForm').addEventListener('submit',e=>{
  if(!e.target.checkValidity()){
    e.preventDefault();
  }
});
