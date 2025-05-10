/*────────────────────────────────────────
  v5: Script — Particles, Cursor, GSAP, etc.
────────────────────────────────────────*/

/* Helpers */
const $ = s => document.querySelector(s),
      $$ = s => document.querySelectorAll(s);

/* Preloader */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* Custom Cursor */
const cursor = document.createElement('div'),
      follower = document.createElement('div');
cursor.className = 'cursor'; follower.className = 'cursor-follower';
document.body.append(cursor, follower);
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  follower.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

/* Particle Network Background */
const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
canvas.style.position = 'fixed'; canvas.style.top = 0; canvas.style.left = 0;
canvas.style.zIndex = '0'; canvas.style.pointerEvents = 'none';
document.body.append(canvas);

let w, h, particles = [];
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(){
    this.x = Math.random()*w;
    this.y = Math.random()*h;
    this.vx = (Math.random()-.5)*1.2;
    this.vy = (Math.random()-.5)*1.2;
    this.size = 2 + Math.random()*2;
  }
  move(){
    this.x += this.vx; this.y += this.vy;
    if(this.x<0||this.x>w) this.vx*=-1;
    if(this.y<0||this.y>h) this.vy*=-1;
  }
  draw() {
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,2*Math.PI); ctx.fill();
  }
}
for(let i=0;i<150;i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0,0,w,h);
  particles.forEach((p,i) => {
    p.move(); p.draw();
    // connect
    for(let j=i+1;j<particles.length;j++){
      const q = particles[j];
      const dx = p.x-q.x, dy=p.y-q.y, d=dx*dx+dy*dy;
      if(d<10000){
        ctx.strokeStyle = 'rgba(255,45,152,'+(1-d/10000)+')';
        ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      }
    }
  });
  requestAnimationFrame(animate);
}
animate();

/* GSAP Animations */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* Hero text scramble & fade-in */
const heading = $('.hero h1');
gsap.timeline()
  .from(heading, {opacity:0, y:50, duration:1})
  .to('.gradient-text', {
    text: { value: 'limitless', scrambleText:{chars:'█▓▒░'} },
    duration: 1.5, repeat: -1, yoyo: true, repeatDelay: 1
  });

/* Section reveal */
gsap.utils.toArray('section').forEach(sec => {
  gsap.from(sec, {
    scrollTrigger: { trigger:sec, start:'top 80%' },
    opacity:0, y:60, duration:1
  });
});

/* 3D tilt cards */
$$('.card').forEach(card=>{
  card.addEventListener('mousemove', e => {
    const r=card.getBoundingClientRect(),
          x=(e.clientX-r.left)/r.width-.5,
          y=(e.clientY-r.top)/r.height-.5;
    gsap.to(card, {rotateX: -y*8, rotateY: x*8, duration:.3});
  });
  card.addEventListener('mouseleave', ()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.5}));
});

/* Counters */
$$('[data-count]').forEach(el=>{
  const end=+el.dataset.count, suf=el.dataset.suffix||'';
  ScrollTrigger.create({
    trigger:el, start:'top 85%', once:true,
    onEnter: ()=>{
      let n=0,inc=Math.ceil(end/60);
      const t=setInterval(()=>{
        n+=inc; if(n>=end){el.textContent=end+suf; clearInterval(t);}
        else el.textContent = n+suf;
      }, 25);
    }
  });
});

/* Testimonials marquee duplication */
const marq = document.querySelector('.marquee');
if(marq) marq.innerHTML += marq.innerHTML;

/* Swiper fallback if needed */
if(window.Swiper && $('#testimonialSwiper')){
  new Swiper('#testimonialSwiper',{loop:true,autoplay:{delay:5000},pagination:{el:'.swiper-pagination',clickable:true}});
}

/* Back-to-top */
const toTop = $('#toTop');
window.addEventListener('scroll', ()=> toTop.classList.toggle('show',scrollY>600));
toTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

/* Confetti on form submit */
$('#cForm')?.addEventListener('submit', e=>{
  if(!e.target.checkValidity()){ e.preventDefault(); return; }
  confetti({particleCount: 150, spread: 90, origin:{y:0.7}});
});
