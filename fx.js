'use strict';
/* Частицы на canvas: конфетти с гравитацией, звёзды, сердечки, крошки, пыль, искры за пальцем, пыльца. */
const FX = (() => {
  const cv = document.createElement('canvas');
  cv.id = 'fxc';
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], raf = null, last = 0, pollen = false;
  const COLORS = ['#ff5a5a', '#ffd23a', '#4cc35a', '#2f8cf0', '#ff8ad8', '#ff9f2e', '#9b7bff'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  document.addEventListener('DOMContentLoaded', () => { document.body.appendChild(cv); resize(); });

  function add(p) {
    p.life = p.life || 1; p.age = 0; p.rot = p.rot || 0; p.vr = p.vr || 0; p.g = p.g == null ? 900 : p.g;
    p.drag = p.drag == null ? .985 : p.drag; p.size = p.size || 10; p.alpha = 1;
    parts.push(p);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function star(r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  }
  function heart(r) {
    g.beginPath();
    g.moveTo(0, r * .9);
    g.bezierCurveTo(-r * 1.4, -r * .1, -r * .7, -r * 1.2, 0, -r * .45);
    g.bezierCurveTo(r * .7, -r * 1.2, r * 1.4, -r * .1, 0, r * .9);
    g.fill();
  }

  function tick(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    g.clearRect(0, 0, W, H);
    if (pollen && parts.filter(p => p.k === 'pollen').length < 14 && Math.random() < .05) {
      add({ k: 'pollen', x: rand(0, W), y: H + 10, vx: rand(-10, 10), vy: rand(-30, -14), g: 0, drag: 1, size: rand(2, 4.5), life: rand(10, 18), color: 'rgba(255,255,255,.8)' });
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      if (p.age >= p.life) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag;
      if (p.k === 'confetti') p.vx += Math.sin(p.age * 6 + p.seed) * 30 * dt;
      if (p.k === 'pollen') p.vx += Math.sin(p.age * 1.4 + p.x * .01) * 6 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const k = p.age / p.life;
      p.alpha = p.k === 'pollen' ? Math.min(1, (1 - k) * 3, k * 6) * .7 : k < .7 ? 1 : 1 - (k - .7) / .3;
      g.save(); g.globalAlpha = p.alpha; g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.color;
      const s = p.size * (p.grow ? 1 + k * p.grow : 1);
      if (p.k === 'confetti') { g.scale(1, Math.abs(Math.cos(p.age * 8 + p.seed))); g.fillRect(-s / 2, -s / 4, s, s / 2); }
      else if (p.k === 'star') star(s);
      else if (p.k === 'heart') heart(s);
      else if (p.k === 'ring') { g.strokeStyle = p.color; g.lineWidth = 4 * (1 - k) + 1; g.beginPath(); g.arc(0, 0, s * (.3 + k * 2.2), 0, 7); g.stroke(); }
      else { g.beginPath(); g.arc(0, 0, s, 0, 7); g.fill(); }
      g.restore();
    }
    raf = parts.length || pollen ? requestAnimationFrame(tick) : null;
  }

  const api = {
    // праздничный взрыв из точки
    burst(x, y, n = 22, colors = COLORS) {
      add({ k: 'ring', x, y, g: 0, size: 26, life: .5, color: '#fff' });
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2), v = rand(260, 620);
        const k = i % 4 === 0 ? 'star' : i % 4 === 1 ? 'dot' : 'confetti';
        add({ k, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 220, vr: rand(-8, 8), size: k === 'star' ? rand(9, 15) : k === 'dot' ? rand(4, 7) : rand(12, 18),
          color: k === 'star' ? '#ffd23a' : pick(colors), life: rand(.9, 1.5), g: 1100, drag: .97, seed: rand(0, 9) });
      }
    },
    hearts(x, y, n = 7) {
      for (let i = 0; i < n; i++) add({ k: 'heart', x: x + rand(-40, 40), y: y + rand(-10, 20), vx: rand(-50, 50), vy: rand(-260, -160), g: -40, drag: .99, size: rand(10, 18), life: rand(1.1, 1.8), color: pick(['#ff5a7a', '#ff7a9a', '#ff9ab5']) });
    },
    crumbs(x, y, color = '#e3a764', n = 10) {
      for (let i = 0; i < n; i++) add({ k: 'dot', x, y, vx: rand(-220, 220), vy: rand(-320, -80), g: 1300, size: rand(2.5, 5), life: rand(.6, 1), color });
    },
    dust(x, y, n = 9) {
      for (let i = 0; i < n; i++) add({ k: 'dot', x: x + rand(-30, 30), y, vx: rand(-120, 120), vy: rand(-60, -10), g: -30, drag: .93, size: rand(5, 10), grow: 1.2, life: rand(.5, .8), color: 'rgba(255,255,255,.85)' });
    },
    sparkle(x, y) {
      add({ k: 'star', x: x + rand(-12, 12), y: y + rand(-12, 12), vx: rand(-40, 40), vy: rand(-80, -20), g: 200, size: rand(5, 9), vr: rand(-6, 6), life: rand(.4, .7), color: pick(['#fff', '#ffe27a', '#fff']) });
    },
    shreds(x, y, color) {
      for (let i = 0; i < 14; i++) {
        const a = rand(0, Math.PI * 2), v = rand(200, 480);
        add({ k: 'confetti', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vr: rand(-12, 12), size: rand(10, 16), color, life: rand(.6, 1), g: 1000, drag: .95, seed: rand(0, 9) });
      }
      add({ k: 'ring', x, y, g: 0, size: 30, life: .4, color });
    },
    rain(n = 120) {
      for (let i = 0; i < n; i++) add({ k: i % 5 ? 'confetti' : 'star', x: rand(0, W), y: rand(-H * .6, -10), vx: rand(-60, 60), vy: rand(80, 240), g: 260, drag: .995, vr: rand(-6, 6),
        size: rand(10, 18), color: pick(COLORS), life: rand(2.6, 3.8), seed: rand(0, 9) });
    },
    pollen(on) { pollen = on; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } },
  };
  return api;
})();
