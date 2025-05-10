/*────────────────────────────────────────
  v5-patched: flagship script
────────────────────────────────────────*/

/* ============ Helpers ============ */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ============ Pre-loader ============ */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* ============ Custom cursor ============ */
const cursor   = Object.assign(document.createElement('div'), { className: 'cursor' });
const follower = Object.assign(document.createElement('div'), { className: 'cursor-follower' });
document.body.append(cursor, follower);
follower.style.width = follower.style.height = '28px';   // default smaller

document.addEventListener('mousemove', e => {
  cursor.style.transform   = `translate(${e.clientX}px,${e.clientY}px)`;
  follower.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

/* hide follower over inputs / buttons for a11y */
document.addEventListener('mouseover', e => {
  const tag = e.target.tagName.toLowerCase();
  follower.style.opacity = ['input','textarea','button','select'].includes(tag) ? 0 : 1;
});

/* ============ Particle-network background ============ */
const prefersReduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas = document.createElement('canvas');
if (!prefersReduced) {
  const ctx = canvas.getContext('2d');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:0;pointer-events:none';
  document.body.append(canvas);

  let w, h, parts = [];
  const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
  addEventListener('resize', resize); resize();

  class Particle {
    constructor(){
      this.x = Math.random()*w;
      this.y = Math.random()*h;
      this.vx = (Math.random()-.5)*.8;
      this.vy = (Math.random()-.5)*.8;
      this.size = 2 + Math.random()*2;
    }
    move(){
      this.x += this.vx; this.y += this.vy;
      if(this.x<0||this.x>w) this.vx*=-1;
      if(this.y<0||this.y>h) this.vy*=-1;
    }
    draw(){
      ctx.fillStyle='rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,2*Math.PI); ctx.fill();
    }
  }
  for(let i=0;i<90;i++) parts.push(new Particle());

  const loop = () =>{
    ctx.clearRect(0,0,w,h);
    parts.forEach((p,i)=>{
      p.move(); p.draw();
      for(let j=i+1;j<parts.length;j++){
        const q=parts[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;
        if(d<15000){
          ctx.strokeStyle=`rgba(255,45,152,${1-d/15000})`;
          ctx.lineWidth=.5;
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
        }
      }
    });
    requestAnimationFrame(loop);
  };
  loop();
}

/* ============ Theme toggle ============ */
const html      = document.documentElement;
const themeBtn  = $('#themeToggle');
const iconSwap  = () => themeBtn.textContent = html.classList.contains('dark') ? '☀️' : '🌙';

html.classList.toggle('dark', localStorage.theme !== 'light');  // default dark
iconSwap();
themeBtn.title = 'Toggle light / dark';
themeBtn.addEventListener('click', ()=>{
  const dark = !html.classList.contains('dark');
  html.classList.toggle('dark', dark);
  localStorage.theme = dark ? 'dark' : 'light';
  iconSwap();
});

/* ============ GSAP + plugins ============ */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* Hero scramble headline */
if($('.gradient-text')){
  const words = ['Potential','Success','Dreams','Future'];
  const tl = gsap.timeline({ repeat:-1 });
  words.forEach(w=>{
    tl.to('.gradient-text',{duration:1,text:{value:w,scrambleText:{chars:'█▓▒░'}}})
      .to({}, {duration:1.5});
  });
}

/* Section reveal */
gsap.utils.toArray('section').forEach(sec=>{
  gsap.from(sec,{
    scrollTrigger:{trigger:sec,start:'top 80%'},
    opacity:0,y:60,duration:1
  });
});

/* Parallax hero headline */
gsap.to('.headline',{
  yPercent:20,ease:'none',
  scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
});

/* 3-D tilt cards */
$$('.card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    gsap.to(card,{rotateX:-y*8,rotateY:x*8,duration:.3});
  });
  card.addEventListener('mouseleave',()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.5}));
});

/* Counters */
$$('[data-count]').forEach(el=>{
  const end=+el.dataset.count, suf=el.dataset.suffix||'';
  ScrollTrigger.create({
    trigger:el,start:'top 85%',once:true,
    onEnter:()=>{
      let n=0,inc=Math.ceil(end/60);
      const t=setInterval(()=>{
        n+=inc;
        if(n>=end){el.textContent=end+suf;clearInterval(t);}
        else el.textContent=n+suf;
      },25);
    }
  });
});

/* Testimonials marquee duplication */
const marq = document.querySelector('.marquee');
if(marq && !prefersReduced) marq.innerHTML += marq.innerHTML;

/* Swiper fallback */
if(window.Swiper && $('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{loop:true,autoplay:{delay:5000},pagination:{el:'.swiper-pagination',clickable:true}});
}

/* Scroll-spy nav highlight */
const navLinks = $$('nav a');
const sections = $$('main section');
addEventListener('scroll', ()=>{
  let idx = sections.length;
  while(--idx && scrollY + innerHeight*0.4 < sections[idx].offsetTop){}
  navLinks.forEach(a=>a.classList.remove('active'));
  navLinks[idx].classList.add('active');
});

/* Hero CTA scroll-to-services */
$('.btn.hero-cta')?.addEventListener('click', ()=>{
  document.querySelector('#services')?.scrollIntoView({behavior:'smooth'});
});

/* Back-to-top */
const toTop = $('#toTop');
addEventListener('scroll', ()=> toTop?.classList.toggle('show', scrollY>600));
toTop?.addEventListener('click', ()=> scrollTo({top:0,behavior:'smooth'}));

/* Confetti on form submit */
$('#cForm')?.addEventListener('submit', e=>{
  if(!e.target.checkValidity()){e.preventDefault();return;}
  confetti({particleCount:150,spread:90,origin:{y:0.7}});
});
