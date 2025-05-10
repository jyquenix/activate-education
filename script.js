/*───────────────────────────────
  v6 Script (layout = v3, colors = logo)
────────────────────────────────*/

/* Helpers */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* Theme: default DARK */
const html = document.documentElement;
html.classList.add('dark');
if(localStorage.theme==='light') html.classList.replace('dark','light');
const themeBtn = $('#themeToggle');
const swapIcon = () => themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
swapIcon();
themeBtn.addEventListener('click',()=>{
  html.classList.toggle('dark');html.classList.toggle('light');
  localStorage.theme = html.classList.contains('light') ? 'light':'dark';
  swapIcon();
});

/* Back-to-top */
const toTop = $('#toTop');
addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>600));
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* GSAP animations */
gsap.registerPlugin(ScrollTrigger,TextPlugin);

/* Text scramble hero */
const words=['Potential','Success','Dreams','Future'];
gsap.timeline({repeat:-1})
  .to('.gradient-text',{duration:1,text:{value:words[0],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[1],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[2],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5})
  .to('.gradient-text',{duration:1,text:{value:words[3],scrambleText:{chars:'█▓▒░'}}})
  .to({}, {duration:1.5});

/* Reveal-on-scroll */
gsap.utils.toArray('.reveal').forEach(el=>{
  ScrollTrigger.create({trigger:el,start:'top 85%',onEnter:()=>el.classList.add('visible')});
});

/* 3-D card tilt */
$$('.card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect(),
          x=(e.clientX-r.left)/r.width-.5,
          y=(e.clientY-r.top)/r.height-.5;
    gsap.to(card,{rotateX:-y*8,rotateY:x*8,duration:.3});
  });
  card.addEventListener('mouseleave',()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.5}));
});

/* Counters */
$$('[data-count]').forEach(el=>{
  const end=+el.dataset.count,suf=el.dataset.suffix||'';
  ScrollTrigger.create({
    trigger:el,start:'top 80%',once:true,
    onEnter:()=>{
      let n=0,inc=Math.max(1,Math.round(end/60));
      const t=setInterval(()=>{
        n+=inc; if(n>=end){el.textContent=end+suf;clearInterval(t);}
        else el.textContent=n+suf;
      },25);
    }
  });
});

/* Swiper testimonials */
if(window.Swiper && $('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{
    loop:true,autoplay:{delay:5000,disableOnInteraction:false},
    pagination:{el:'.swiper-pagination',clickable:true}
  });
}

/* Confetti on contact submit */
$('#cForm')?.addEventListener('submit',e=>{
  if(!e.target.checkValidity()){e.preventDefault();return;}
  confetti({particleCount:120,spread:80,origin:{y:.7}});
});

/* CTA scroll */
$('.btn.primary')?.addEventListener('click',()=>{
  document.querySelector('#services')?.scrollIntoView({behavior:'smooth'});
});
