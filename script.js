/*────────────────────────────
   Activate Education – v2
   (chatbot removed)
────────────────────────────*/

/* Helpers */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* Progress bar */
const bar = Object.assign(document.createElement('div'),{
  style:'position:fixed;top:0;left:0;height:3px;background:var(--accent);width:0;z-index:2000;transition:width .1s'
});
document.body.append(bar);
addEventListener('scroll',()=>bar.style.width = `${scrollY/(document.body.scrollHeight-innerHeight)*100}%`);

/* Nav */
$('#burger')?.addEventListener('click',()=>{
  $('#burger').classList.toggle('active');
  $('#mainNav').classList.toggle('open');
});

/* Theme toggle */
const d=document.documentElement,tg=$('#themeToggle');
const setMode=m=>{d.classList.toggle('dark',m==='dark');localStorage.theme=m};
setMode(localStorage.theme||'light');
tg?.addEventListener('click',()=>setMode(d.classList.contains('dark')?'light':'dark'));

/* GSAP */
gsap.registerPlugin(ScrollTrigger,TextPlugin);

/* Hero text-scramble */
if($('.gradient-text')){
  const words=['Potential','Success','Dreams','Future'];
  const tl=gsap.timeline({repeat:-1});
  words.forEach(w=>{
    tl.to('.gradient-text',{duration:1,text:{value:w,scrambleText:{chars:'█▓▒░'}}})
      .to({}, {duration:1.5});
  });
}

/* Reveal on scroll */
gsap.utils.toArray('.reveal').forEach(el=>{
  ScrollTrigger.create({trigger:el,start:'top 85%',onEnter:()=>el.classList.add('visible')});
});

/* Parallax headline */
gsap.to('.headline',{yPercent:20,ease:'none',
  scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
});

/* 3-D card tilt */
$$('.card.pop').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect(),
          x=(e.clientX-r.left)/r.width-.5,
          y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateX(${-y*6}deg) rotateY(${x*6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* Counters */
$$('[data-count]').forEach(el=>{
  const val=+el.dataset.count,suf=el.dataset.suffix||'';
  ScrollTrigger.create({
    trigger:el,start:'top 80%',once:true,
    onEnter:()=>{
      let n=0,inc=Math.max(1,Math.round(val/60));
      const int=setInterval(()=>{
        n+=inc;
        if(n>=val){el.textContent=val+suf;clearInterval(int);}
        else el.textContent=n+suf;
      },25);
    }
  });
});

/* Swiper testimonials */
if($('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{
    loop:true,
    autoplay:{delay:5000,disableOnInteraction:false},
    pagination:{el:'.swiper-pagination',clickable:true}
  });
}

/* Back-to-top */
const tp=$('#toTop');
addEventListener('scroll',()=>tp?.classList.toggle('show',scrollY>600));
tp?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* Confetti on form submit */
$('#cForm')?.addEventListener('submit',e=>{
  if(!e.target.checkValidity()){e.preventDefault();return;}
  confetti({particleCount:120,spread:70,origin:{y:.7}});
});
