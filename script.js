/*──────────────────────────────
  v3 baseline script
──────────────────────────────*/

/* helpers */
const $  = s => document.querySelector(s),
      $$ = s => document.querySelectorAll(s);

/* theme toggle (dark default) */
const html     = document.documentElement;
const themeBtn = $('#themeToggle');
const updateIcon = () => themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
if(localStorage.theme==='light'){html.classList.remove('dark');html.classList.add('light');}
updateIcon();
themeBtn.addEventListener('click',()=>{
  html.classList.toggle('dark');html.classList.toggle('light');
  localStorage.theme = html.classList.contains('light')?'light':'dark';
  updateIcon();
});

/* back-to-top button */
const toTop = $('#toTop');
addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>600));
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* GSAP plugins */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* hero text scramble */
const words = ['Potential','Success','Dreams','Future'];
gsap.timeline({repeat:-1})
  .to('.gradient-text',{duration:1,text:{value:words[0],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[1],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[2],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[3],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5});

/* reveal on scroll */
gsap.utils.toArray('.reveal').forEach(el=>{
  ScrollTrigger.create({trigger:el,start:'top 80%',onEnter:()=>el.classList.add('visible')});
});

/* 3-D tilt cards */
$$('.card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect(),
          x=(e.clientX-r.left)/r.width-.5,
          y=(e.clientY-r.top)/r.height-.5;
    gsap.to(card,{rotateX:-y*8,rotateY:x*8,duration:.3});
  });
  card.addEventListener('mouseleave',()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.5}));
});

/* counters */
$$('[data-count]').forEach(el=>{
  const end=+el.dataset.count, suf=el.dataset.suffix||'';
  ScrollTrigger.create({
    trigger:el,start:'top 80%',once:true,
    onEnter:()=>{
      let n=0,inc=Math.ceil(end/60);
      const t=setInterval(()=>{
        n+=inc; if(n>=end){el.textContent=end+suf;clearInterval(t);}
        else el.textContent=n+suf;
      },25);
    }
  });
});

/* swiper testimonials */
if(window.Swiper && $('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{
    loop:true,autoplay:{delay:5000,disableOnInteraction:false},
    pagination:{el:'.swiper-pagination',clickable:true}
  });
}

/* call-to-action smooth scroll */
$('.btn.primary')?.addEventListener('click',()=>{
  document.querySelector('#services')?.scrollIntoView({behavior:'smooth'});
});

/* confetti on contact submit */
$('#cForm')?.addEventListener('submit',e=>{
  if(!e.target.checkValidity()){e.preventDefault();return;}
  confetti({particleCount:120,spread:80,origin:{y:.7}});
});
