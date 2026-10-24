/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Home "Our Services": the four program logos hop into their cards.
   Each landing splashes paint in the logo's splash colours; the paint
   then flows back into the logo before it settles in its box.

   Paint is drawn as metaballs in a WebGL2 shader, so drops that touch
   merge like liquid and get a glossy highlight. Without WebGL2 the
   drops are drawn as plain circles. Visitors with reduced motion, or
   whose browser blocks scripts, see the logos in place.

   Timeline per logo (seconds after it starts):
     0.00  pops in at the top right of its card
     0.10  hop 1 → lands beside its box (0.50), splash
     0.58  hop 2 → lands in its box (0.96), bigger splash
     1.46  paint flows back into the logo
     ~2.2  done; the real logo is shown and the copy removed
   Logos start 0.23 s apart when several come into view together.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
(() => {
  const logos = [...document.querySelectorAll('#services .card > img')];
  if (!logos.length || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* splash colours sampled from the logo files: orange, amber, sky blue, pink */
  const PALETTE = [[240, 112, 32], [242, 166, 35], [31, 149, 212], [233, 75, 138]];
  const PICK = [0.3, 0.17, 0.28, 0.25];
  const MAX_BALLS = 128;
  const LOGO_G = 2600;          // px/s² for the hopping logo
  const HOP1 = 0.40, HOP2 = 0.38, GAP = 0.08, START = 0.10, RECALL_AFTER = 0.5;

  const rand = (a, b) => a + Math.random() * (b - a);
  const colour = () => {
    let x = Math.random();
    for (let i = 0; i < PICK.length; i++) if ((x -= PICK[i]) <= 0) return i;
    return 0;
  };

  logos.forEach(l => l.classList.add('paint-pending'));

  const layer = document.createElement('div');
  layer.className = 'paint-layer';
  layer.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'paint-canvas';
  layer.append(canvas);
  document.body.append(layer);
  const draw = glRenderer(canvas) || canvasRenderer(canvas);

  const active = [];
  let raf = 0, last = 0, nextStart = 0;

  /* ---------- one logo ---------- */
  function launch(img, startAt) {
    const clone = new Image();
    clone.src = img.currentSrc || img.src;
    clone.alt = '';
    clone.className = 'paint-logo';
    layer.append(clone);

    const r = img.getBoundingClientRect();
    const card = img.closest('.card').getBoundingClientRect();
    // free space to the right of the logo, inside the card
    const room = Math.max(50, card.right - r.right - 18);
    const x0 = Math.min(room, 170), x1 = Math.min(room * 0.55, 100);
    const h1 = { t0: START, T: HOP1, x0, y0: 0, x1, y1: 0 };
    const h2 = { t0: START + HOP1 + GAP, T: HOP2, x0: x1, y0: 0, x1: 0, y1: 0 };
    active.push({
      img, clone, start: startAt, hops: [h1, h2],
      lands: [h1.t0 + h1.T, h2.t0 + h2.T], splashed: [false, false],
      recall: h2.t0 + h2.T + RECALL_AFTER, drops: [], pulse: 0,
    });
  }

  function hopAt(h, t) {
    const tt = Math.min(Math.max(t - h.t0, 0), h.T);
    const vy0 = (h.y1 - h.y0 - 0.5 * LOGO_G * h.T * h.T) / h.T;
    return {
      x: h.x0 + (h.x1 - h.x0) * (tt / h.T),
      y: h.y0 + vy0 * tt + 0.5 * LOGO_G * tt * tt,
      vy: vy0 + LOGO_G * tt,
      air: t >= h.t0 && t - h.t0 < h.T,
    };
  }

  /* A splat seen head-on: a pool under the logo plus drops thrown out in
     every direction that slow to a stop (less spread downward, where the
     card text is). Far drops are small, near drops are large. */
  const DRAG = 7;
  function splash(a, x, y, n, power) {
    const drop = (ang, dist, r) => {
      const v = dist * DRAG;
      a.drops.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r, c: colour(),
                     mode: 'splat', home: 0, w: rand(12, 16) });
    };
    for (let k = 0; k < 3; k++) drop(rand(0, 6.283), rand(0, 14) * power, rand(13, 18) * power);
    for (let k = 0; k < n; k++) {
      const ang = rand(0, 6.283);
      const down = Math.sin(ang) > 0 ? 0.35 : 1;
      const dist = rand(34, 125) * power * down;
      drop(ang, dist, dist < 70 ? rand(5, 10) : rand(2.5, 6));
    }
  }

  function step(a, now, dt, balls) {
    const t = (now - a.start) / 1000;
    if (t < 0) return;
    const rect = a.img.getBoundingClientRect();
    const w = rect.width, h = rect.height, ground = h / 2;
    const cx = rect.left + w / 2, cy = rect.top + h / 2;
    const [h1, h2] = a.hops;

    /* logo position */
    const s = t < h2.t0 ? hopAt(h1, t) : hopAt(h2, t);
    for (let i = 0; i < 2; i++) {
      if (!a.splashed[i] && t >= a.lands[i]) {
        a.splashed[i] = true;
        splash(a, i ? h2.x1 : h1.x1, ground * 0.35, i ? 14 : 9, i ? 1 : 0.7);
      }
    }

    /* squash after each landing, stretch while falling fast, pulse while absorbing paint */
    const lastLand = t >= a.lands[1] ? a.lands[1] : t >= a.lands[0] ? a.lands[0] : null;
    const tau = lastLand == null ? 0 : t - lastLand;
    const sq = lastLand == null ? 0 : 0.22 * Math.exp(-9 * tau) * Math.cos(24 * tau);
    const st = s.air ? Math.min(Math.abs(s.vy) / 1700, 1) * 0.13 : 0;
    a.pulse *= Math.exp(-9 * dt);
    const appear = Math.min(1, t / 0.18);
    const pop = 0.6 + 0.4 * (1 + 2.2 * Math.pow(appear - 1, 3) + 1.2 * Math.pow(appear - 1, 2));
    const sx = (1 + sq - st * 0.6) * (1 + a.pulse) * pop;
    const sy = (1 - sq + st) * (1 + a.pulse) * pop;
    const rot = t < a.lands[0]
      ? 18 * Math.max(0, 1 - (t - START) / HOP1)
      : -5 * Math.exp(-8 * tau) * Math.sin(20 * tau);
    a.clone.style.width = w + 'px';
    a.clone.style.height = h + 'px';
    a.clone.style.opacity = Math.min(1, t / 0.12);
    a.clone.style.transform =
      `translate3d(${rect.left + s.x}px,${rect.top + s.y}px,0) rotate(${rot}deg) scale(${sx},${sy})`;

    /* paint */
    for (let i = a.drops.length - 1; i >= 0; i--) {
      const d = a.drops[i];
      if (d.mode !== 'home' && t >= a.recall && !d.home) d.home = a.recall + rand(0, 0.2);
      if (d.mode !== 'home' && d.home && t >= d.home) {
        // start flowing back, with a little swirl
        const dx = -d.x, dy = -d.y, len = Math.hypot(dx, dy) || 1, sw = rand(-150, 150);
        d.vx += (-dy / len) * sw; d.vy += (dx / len) * sw;
        d.mode = 'home';
      }
      if (d.mode === 'splat') {
        const k = Math.exp(-DRAG * dt);
        d.vx *= k; d.vy *= k; d.x += d.vx * dt; d.y += d.vy * dt;
      } else {
        const z = 0.65;
        d.vx += (d.w * d.w * -d.x - 2 * z * d.w * d.vx) * dt;
        d.vy += (d.w * d.w * -d.y - 2 * z * d.w * d.vy) * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (Math.hypot(d.x, d.y) < 30) d.r *= Math.exp(-11 * dt);
        if (d.r < 0.8) { a.drops.splice(i, 1); a.pulse = Math.min(0.14, a.pulse + 0.035); continue; }
      }
      balls.push([cx + d.x, cy + d.y, d.r, d.c]);
      const speed = Math.hypot(d.vx, d.vy);
      if (speed > 260) balls.push([cx + d.x - d.vx * 0.022, cy + d.y - d.vy * 0.022, d.r * 0.72, d.c, 1]);
    }

    if ((t > a.recall && !a.drops.length && a.pulse < 0.004 && tau > 0.6) || t > a.recall + 2.5) {
      a.img.classList.remove('paint-pending');
      a.clone.remove();
      a.done = true;
    }
  }

  function frame() {
    const now = performance.now();   // same clock as the start times
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    const balls = [];
    for (const a of active) step(a, now, dt, balls);
    for (let i = active.length - 1; i >= 0; i--) if (active[i].done) active.splice(i, 1);
    // over budget: drop motion tails first, then the smallest drops
    if (balls.length > MAX_BALLS) {
      balls.sort((p, q) => (p[4] || 0) - (q[4] || 0) || q[2] - p[2]);
      balls.length = MAX_BALLS;
    }
    draw(balls);
    raf = active.length ? requestAnimationFrame(frame) : 0;
    if (!raf) { last = 0; draw([]); }
  }

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const now = performance.now();
    nextStart = Math.max(now + 150, nextStart + 230);
    launch(e.target, nextStart);
    if (!raf) raf = requestAnimationFrame(frame);
  }), { threshold: 0.6 });
  logos.forEach(l => io.observe(l));

  /* ---------- renderers ---------- */
  function fit(cv, dpr) {
    const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }

  function glRenderer(cv) {
    let gl;
    try { gl = cv.getContext('webgl2', { premultipliedAlpha: true, antialias: false }); } catch { return null; }
    if (!gl) return null;
    const vsrc = `#version 300 es
      in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
    const fsrc = `#version 300 es
      precision highp float;
      uniform vec4 uB[${MAX_BALLS}];   // x, y, radius (device px), colour index
      uniform int uN;
      uniform vec3 uPal[4];
      uniform float uK;
      out vec4 o;
      void main() {
        vec2 p = gl_FragCoord.xy;
        float f = 0.0; vec2 g = vec2(0.0); vec3 c = vec3(0.0); float ws = 0.0;
        for (int i = 0; i < ${MAX_BALLS}; i++) {
          if (i >= uN) break;
          vec4 b = uB[i];
          vec2 d = p - b.xy;
          float d2 = dot(d, d) + 1.0;
          float v = b.z * b.z / d2;          // metaball field
          f += v;
          g -= 2.0 * v / d2 * d;             // its gradient, for shading
          float w = v * v;
          c += w * uPal[int(b.w + 0.5)];
          ws += w;
        }
        float a = clamp((f - 1.0) / max(fwidth(f), 1e-4) + 0.5, 0.0, 1.0);
        if (a <= 0.0) discard;
        vec3 col = c / max(ws, 1e-5);
        vec3 n = normalize(vec3(-g * uK, 1.0));
        vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
        float diff = 0.8 + 0.3 * dot(n, L);
        float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 40.0) * 0.55;
        col = col * diff + spec;
        o = vec4(col * a, a);
      }`;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, vsrc), fs = sh(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uB = gl.getUniformLocation(prog, 'uB'), uN = gl.getUniformLocation(prog, 'uN'), uK = gl.getUniformLocation(prog, 'uK');
    gl.uniform3fv(gl.getUniformLocation(prog, 'uPal'), PALETTE.flat().map(v => v / 255));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    const data = new Float32Array(MAX_BALLS * 4);
    window.__paintRenderer = 'webgl2';

    return balls => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      fit(cv, dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!balls.length) return;
      // only shade the area around the paint
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      balls.forEach((b, i) => {
        const m = b[2] * 3 + 6;
        x0 = Math.min(x0, b[0] - m); x1 = Math.max(x1, b[0] + m);
        y0 = Math.min(y0, b[1] - m); y1 = Math.max(y1, b[1] + m);
        data[i * 4] = b[0] * dpr;
        data[i * 4 + 1] = cv.height - b[1] * dpr;
        data[i * 4 + 2] = b[2] * dpr;
        data[i * 4 + 3] = b[3];
      });
      const sx = Math.max(0, Math.floor(x0 * dpr)), sy = Math.max(0, Math.floor(cv.height - y1 * dpr));
      const sw = Math.min(cv.width, Math.ceil(x1 * dpr)) - sx, sh2 = Math.min(cv.height, Math.ceil(cv.height - y0 * dpr)) - sy;
      if (sw <= 0 || sh2 <= 0) return;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(sx, sy, sw, sh2);
      gl.uniform4fv(uB, data);
      gl.uniform1i(uN, balls.length);
      gl.uniform1f(uK, 5 * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  }

  function canvasRenderer(cv) {
    const ctx = cv.getContext('2d');
    window.__paintRenderer = '2d';
    if (!ctx) return () => {};
    return balls => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      fit(cv, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const [x, y, r, c] of balls) {
        ctx.fillStyle = `rgb(${PALETTE[c].join(',')})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    };
  }
})();
