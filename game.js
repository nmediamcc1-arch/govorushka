'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d) { try { const v = localStorage.getItem('gov_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gov_' + k, JSON.stringify(v)); } catch {} },
};
const praise = () => 'praise_' + (1 + rnd(6));
const land = () => innerWidth > innerHeight;

let C, P;

/* ================= элементы и реакции ================= */
function actor(id, cls = 'actor') {
  const el = document.createElement('div');
  el.className = cls;
  el.style.setProperty('--bd', (-Math.random() * 5).toFixed(2) + 's');
  el.innerHTML = `<div class="lift">${ART.art(id)}</div>`;
  return el;
}
function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }
function anim(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
const charOf = el => el && el.querySelector('svg.char');
// мимика: happy (глаза-дуги), cheer (руки вверх), nope (мотает головой), wow (ждёт еду)
function express(el, classes, ms = 1400) {
  const c = charOf(el); if (!c) return;
  const list = classes.split(' ');
  list.forEach(k => c.classList.add(k));
  if (ms) setTimeout(() => list.forEach(k => c.classList.remove(k)), ms);
}
function celebrate(el, n = 22) { const { x, y } = center(el); FX.burst(x, y, n); }

/* ---------- глаза следят за пальцем ---------- */
let lookPt = null, lookRaf = null, lookIdle = null;
function updateLook() {
  lookRaf = null;
  $$('.screen .look, #mascot .look, #scene .look').forEach(g => {
    const svg = g.ownerSVGElement; if (!svg) return;
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    let tx = 0, ty = 0;
    if (lookPt) {
      const dx = lookPt.x - (r.left + r.width / 2), dy = lookPt.y - (r.top + r.height / 3), d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 200) * 5;
      tx = dx / d * k; ty = dy / d * k;
    }
    g.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
  });
}
addEventListener('pointermove', e => {
  lookPt = { x: e.clientX, y: e.clientY };
  if (!lookRaf) lookRaf = requestAnimationFrame(updateLook);
  clearTimeout(lookIdle);
  lookIdle = setTimeout(() => { lookPt = null; updateLook(); }, 2500);
}, { passive: true });
addEventListener('pointerdown', e => { lookPt = { x: e.clientX, y: e.clientY }; updateLook(); }, { passive: true });

/* ---------- рука-подсказка ---------- */
const hand = { anim: null };
function showHand(from, to) {
  hideHand();
  const h = $('#hand');
  h.style.display = 'block';
  const a = center(from), b = to ? center(to) : null;
  const k = to
    ? [{ left: a.x + 'px', top: a.y + 'px', opacity: 0, transform: 'scale(1)' }, { left: a.x + 'px', top: a.y + 'px', opacity: 1, transform: 'scale(.85)', offset: .15 },
       { left: b.x + 'px', top: b.y + 'px', opacity: 1, transform: 'scale(.85)', offset: .7 }, { left: b.x + 'px', top: b.y + 'px', opacity: 0, transform: 'scale(1)' }]
    : [{ left: a.x + 'px', top: a.y + 'px', transform: 'scale(1)', opacity: 0 }, { left: a.x + 'px', top: a.y + 'px', transform: 'scale(.8)', opacity: 1, offset: .4 },
       { left: a.x + 'px', top: a.y + 'px', transform: 'scale(1)', opacity: 1, offset: .6 }, { left: a.x + 'px', top: a.y + 'px', transform: 'scale(1)', opacity: 0 }];
  hand.anim = h.animate(k, { duration: to ? 2200 : 1200, iterations: Infinity, easing: 'ease-in-out' });
}
function hideHand() { if (hand.anim) hand.anim.cancel(); hand.anim = null; $('#hand').style.display = 'none'; }
addEventListener('pointerdown', hideHand, { passive: true });

/* ================= перетаскивание + «тап по предмету, тап по цели» =================
   Малышам трудно тащить, поэтому работает и то, и другое. */
function setPos(el, x, y) { el._tx = x; el._ty = y; el.style.translate = `${x}px ${y}px`; }
function hits(pt, target, pad = .3) {
  const r = target.getBoundingClientRect(), px = r.width * pad, py = r.height * pad;
  return pt.x > r.left - px && pt.x < r.right + px && pt.y > r.top - py && pt.y < r.bottom + py;
}
function snapTo(el, target) { const a = center(el), b = center(target); setPos(el, el._tx + b.x - a.x, el._ty + b.y - a.y); }

function draggable(el, { onTap, onStart, onDrop, onMove, free } = {}) {
  el.classList.add('drag');
  el._tx = 0; el._ty = 0;
  let pid = null, sx = 0, sy = 0, bx = 0, by = 0, moved = false, n = 0;
  el.addEventListener('pointerdown', e => {
    if (pid !== null || el.dataset.locked) return;
    pid = e.pointerId; sx = e.clientX; sy = e.clientY; bx = el._tx; by = el._ty; moved = false;
    try { el.setPointerCapture(pid); } catch {}
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 12) { moved = true; el.classList.add('dragging'); onStart && onStart(); }
    if (moved) {
      setPos(el, bx + dx, by + dy);
      if (++n % 3 === 0) FX.sparkle(e.clientX, e.clientY);
      onMove && onMove({ x: e.clientX, y: e.clientY });
    }
  });
  const end = e => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (!moved) { onTap && onTap(); return; }
    el.classList.remove('dragging');
    const ok = onDrop ? onDrop({ x: e.clientX, y: e.clientY }) : false;
    if (!ok && !free) setPos(el, 0, 0);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

function mover({ items, targets, onSelect, tryDrop, pad = .25, anticipate }) {
  let sel = null;
  const clearWow = () => targets.forEach(t => { t.el.classList.remove('target-on'); const c = charOf(t.el); if (c) c.classList.remove('wow'); });
  const deselect = () => { if (sel) sel.el.classList.remove('selected'); sel = null; clearWow(); };
  const near = pt => targets.forEach(t => {
    const on = hits(pt, t.el, pad);
    t.el.classList.toggle('target-on', on);
    // зверёк открывает рот, когда к нему подносят еду
    if (anticipate) { const c = charOf(t.el), { x, y, r } = center(t.el); if (c) c.classList.toggle('wow', Math.hypot(pt.x - x, pt.y - y) < r.width * .9); }
  });
  items.forEach(it => draggable(it.el, {
    onTap: () => {
      if (sel === it) { deselect(); return; }
      deselect(); sel = it; it.el.classList.add('selected');
      if (anticipate) targets.forEach(t => { const c = charOf(t.el); if (c) c.classList.add('wow'); });
      SOUND.play('pick'); onSelect(it);
    },
    onStart: () => { deselect(); SOUND.play('pick'); onSelect(it); },
    onMove: near,
    onDrop: pt => {
      clearWow();
      const t = targets.find(t => hits(pt, t.el, pad));
      return t ? tryDrop(it, t) : (SOUND.play('boing'), false);
    },
  }));
  targets.forEach(t => t.el.addEventListener('click', async () => {
    if (!sel) { t.onTap && t.onTap(); return; }
    const it = sel; deselect();
    it.el.dataset.locked = 1;
    it.el.classList.add('flying'); snapTo(it.el, t.el);
    SOUND.play('whoosh');
    await wait(360);
    it.el.classList.remove('flying');
    delete it.el.dataset.locked;
    if (!tryDrop(it, t)) setPos(it.el, 0, 0);
  }));
  return { deselect };
}

/* ================= навигация ================= */
let mode = null, level = 1, run = 0, idleT = null;
const alive = r => r === run;
function clearIdle() { clearTimeout(idleT); idleT = null; }
function idle(fn, ms = 8000) { clearIdle(); const r = run; idleT = setTimeout(() => alive(r) && fn(), ms); }
let curScene = '';
function setScene(kind) {
  if (kind === curScene) return;
  curScene = kind;
  $('#scene').innerHTML = ART.scene(kind);
  FX.pollen(kind !== 'sorter');
}
function setScreen(s) { document.body.dataset.screen = s; }

async function transition(fn) {
  const iris = $('#iris');
  iris.getAnimations().forEach(a => a.cancel());
  iris.classList.add('on');
  SOUND.play('whoosh');
  // ждём анимацию, но не дольше таймера — если браузер её притормозит, игра не застрянет на жёлтом экране
  const a1 = iris.animate([{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
  await Promise.race([a1.finished, wait(450)]);
  fn();
  await wait(60);
  const a2 = iris.animate([{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
  await Promise.race([a2.finished, wait(520)]);
  iris.getAnimations().forEach(a => a.cancel());
  iris.classList.remove('on');
}

// звезда за правильный ответ прилетает в счётчик сверху
const progress = {
  n: 0, goal: 0,
  reset(goal) {
    this.n = 0; this.goal = goal;
    const el = $('#progress'); el.innerHTML = ''; el.classList.toggle('on', goal > 0);
    for (let i = 0; i < goal; i++) el.insertAdjacentHTML('beforeend', `<span>${ART.UI.star(false)}</span>`);
  },
  inc(from) {
    this.n++;
    const slot = $('#progress').children[this.n - 1];
    const arrive = () => { if (slot) { slot.innerHTML = ART.UI.star(true); anim(slot, 'on'); const c = center(slot); for (let i = 0; i < 5; i++) FX.sparkle(c.x, c.y); SOUND.play('tap'); } };
    if (from && slot) {
      const a = center(from), b = center(slot);
      const s = document.createElement('div'); s.className = 'flystar'; s.innerHTML = ART.UI.star(true);
      document.body.appendChild(s);
      const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - innerHeight * .15;
      s.animate([{ left: a.x + 'px', top: a.y + 'px', transform: 'scale(.4) rotate(0)' }, { left: mx + 'px', top: my + 'px', transform: 'scale(1.4) rotate(180deg)', offset: .45 },
        { left: b.x + 'px', top: b.y + 'px', transform: 'scale(.7) rotate(360deg)' }], { duration: 800, easing: 'ease-in-out' }).onfinish = () => { s.remove(); arrive(); };
    } else arrive();
    return this.n >= this.goal;
  },
};

const GAMES = {
  farm:     { scene: 'farm',     hero: 'cow',    sky: '#c4ecff', ground: '#8fd96b' },
  find:     { scene: 'meadow',   hero: 'owl',    sky: '#d6f0ff', ground: '#a8e486' },
  feed:     { scene: 'picnic',   hero: 'rabbit', sky: '#ffeccc', ground: '#ff9b9b' },
  sorter:   { scene: 'sorter',   hero: null,     sky: '#fff1dc', ground: '#e2a96e' },
  balloons: { scene: 'balloons', hero: 'bear',   sky: '#e6dcff', ground: '#9fdc7c' },
};

function tileArt(m) {
  const c = C.colors;
  if (m === 'farm') return `<div style="left:8%;width:84%;bottom:-10%;height:116%">${ART.char('cow')}</div>`;
  if (m === 'find') return `<div style="left:-6%;width:74%;bottom:-10%;height:112%">${ART.char('owl')}</div><div style="right:-4%;bottom:4%;width:56%;height:56%;transform:rotate(-12deg)">${ART.UI.magnifier}</div>`;
  if (m === 'feed') return `<div style="left:-6%;width:76%;bottom:-10%;height:114%">${ART.char('rabbit')}</div><div style="right:-6%;bottom:-2%;width:52%;height:52%;transform:rotate(28deg)">${ART.food('carrot')}</div>`;
  if (m === 'sorter') return `<div style="width:48%;height:48%;left:2%;bottom:4%">${ART.shape('circle', c[0])}</div><div style="width:44%;height:44%;right:2%;bottom:4%">${ART.shape('square', c[1])}</div><div style="width:46%;height:46%;left:27%;top:6%">${ART.shape('star', c[2])}</div>`;
  return `<div style="left:6%;width:30%;top:0;height:54%">${ART.balloon(c[0])}</div><div style="left:36%;width:30%;top:-6%;height:54%">${ART.balloon(c[2])}</div><div style="left:64%;width:30%;top:2%;height:54%">${ART.balloon(c[1])}</div>
    <div style="left:18%;width:64%;bottom:-10%;height:74%">${ART.char('bear')}</div>`;
}

function buildMenu() {
  $('#menu .tiles').innerHTML = Object.entries(GAMES).map(([m, g], i) =>
    `<button class="tile" data-mode="${m}" style="--tc:${g.sky};--tg:${g.ground};--rot:${i % 2 ? 2 : -2}deg;--bd:${-i * .6}s"><div class="art">${tileArt(m)}</div></button>`).join('');
  $$('#menu .tile').forEach(t => t.addEventListener('click', () => {
    SOUND.play('tap'); anim(t, 'go');
    $$('svg.char', t).forEach(c => { c.classList.add('happy', 'cheer'); });
    const m = t.dataset.mode;
    SOUND.say('menu_' + m);
    setTimeout(() => { $$('svg.char', t).forEach(c => c.classList.remove('happy', 'cheer')); openLevels(m); }, 450);
  }));
}

function goMenu() {
  run++; mode = null; clearIdle(); hideHand(); SOUND.stop();
  transition(() => { setScene('meadow'); setScreen('menu'); });
}

function openLevels(m) {
  run++; mode = m; clearIdle(); hideHand();
  transition(() => {
    setScene(GAMES[m].scene);
    const g = GAMES[m];
    $('#levels .hero').innerHTML = g.hero && m !== 'balloons' ? ART.char(g.hero) : `<div class="art">${tileArt(m)}</div>`;
    const done = store.get('done_' + m, {});
    const star = `<div class="st">${ART.UI.star(true)}</div>`;
    $('#levels .lv').innerHTML = [1, 2].map(l => `<button class="lvbtn" data-l="${l}" style="--c:${l === 1 ? '#7ee08a' : '#ffb347'};--cd:${l === 1 ? '#3fae52' : '#e08a1e'}">
      ${star.repeat(l)}${done[l] ? `<div class="crown">${ART.UI.crown}</div>` : ''}</button>`).join('');
    $$('#levels .lvbtn').forEach(b => b.addEventListener('click', () => { SOUND.play('tap'); anim(b, 'squash'); startLevel(m, +b.dataset.l); }));
    setScreen('levels');
    setTimeout(() => express($('#levels .hero'), 'happy cheer', 1200), 500);
  });
}

function startLevel(m, l) {
  run++; mode = m; level = l; clearIdle(); hideHand();
  const r = run;
  transition(() => {
    setScene(GAMES[m].scene);
    setScreen('game');
    $('#stage').innerHTML = '';
    $('#stage').className = '';
    MODES[m].start(r, l);
  });
}

$('#homeBtn').addEventListener('click', () => {
  SOUND.play('tap');
  if (document.body.dataset.screen === 'game' && mode) openLevels(mode); else goMenu();
});
$('#mascot').addEventListener('click', () => {
  anim($('#mascot .bob'), 'squash');
  const s = document.body.dataset.screen;
  if (s === 'game' && mode && MODES[mode].repeat) MODES[mode].repeat();
  else if (s === 'levels' && mode) SOUND.say('menu_' + mode);
  else SOUND.say('hello');
});
$('#musicBtn').addEventListener('click', () => {
  SOUND.setMusic(!SOUND.musicOn);
  $('#musicBtn').innerHTML = ART.UI.note(SOUND.musicOn);
});

async function finish(r) {
  clearIdle(); hideHand();
  const done = store.get('done_' + mode, {}); done[level] = true; store.set('done_' + mode, done);
  await wait(500);
  if (!alive(r)) return;
  const f = $('#finish');
  const ids = shuffle(C.items.filter(i => i.group === 'animal')).slice(0, land() ? 5 : 3).map(i => i.id);
  f.innerHTML = `<div class="crown">${ART.UI.crown}</div><div class="dancers"></div>`;
  ids.forEach(id => { const a = actor(id); $('.dancers', f).appendChild(a); express(a, 'happy cheer', 0); });
  setScreen('finish');
  SOUND.play('fanfare');
  FX.rain(150);
  setTimeout(() => alive(r) && celebrate($('.crown', f), 30), 800);
  await SOUND.say('finish');
  await wait(1200);
  if (alive(r)) openLevels(mode);
}

/* ================= «живая» сцена: всё можно потрогать ================= */
$('#scene').addEventListener('pointerdown', e => {
  const p = e.target.closest('[data-tap]');
  if (!p) return;
  const kind = p.dataset.tap, { x, y, r } = center(p);
  anim(p, 'tapped');
  if (kind === 'sun') { SOUND.play('giggle'); const s = $('svg', p); s.classList.add('happy'); setTimeout(() => s.classList.remove('happy'), 1200); for (let i = 0; i < 8; i++) FX.sparkle(x, y); }
  else if (kind === 'flower') { SOUND.play('note'); for (let i = 0; i < 6; i++) FX.sparkle(x, r.top); }
  else if (kind === 'tree') { SOUND.play('rustle'); FX.crumbs(x, r.top + r.height * .3, '#4fb84a', 8); dropApple(x + (Math.random() - .5) * r.width * .4, r.top + r.height * .35, r.bottom); }
  else if (kind === 'cloud' || kind === 'windmill') { SOUND.play('whoosh'); FX.dust(x, y, 6); }
  else if (kind === 'bfly') { SOUND.play('sparkle'); for (let i = 0; i < 8; i++) FX.sparkle(e.clientX, e.clientY); }
  else { SOUND.play('boing'); }
});
function dropApple(x, y, ground) {
  const a = document.createElement('div');
  a.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5vmin;height:5vmin;margin:-2.5vmin;z-index:20;pointer-events:none`;
  a.innerHTML = ART.food('apple');
  document.body.appendChild(a);
  const dy = ground - y - 10;
  a.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${dy}px)`, offset: .55, easing: 'ease-out' }, { transform: `translateY(${dy - 30}px)`, offset: .75, easing: 'ease-in' },
    { transform: `translateY(${dy}px)`, opacity: 1, offset: .9 }, { transform: `translateY(${dy}px)`, opacity: 0 }], { duration: 1400, easing: 'ease-in' }).onfinish = () => a.remove();
  setTimeout(() => SOUND.play('land'), 700);
}

// время от времени кто-то из персонажей машет лапами — сцена не замирает
setInterval(() => {
  const s = document.body.dataset.screen;
  if (s !== 'game' && s !== 'menu' && s !== 'levels') return;
  const list = $$('.screen svg.char.full').filter(c => c.getBoundingClientRect().width && !c.closest('.talk'));
  const c = pick(list);
  if (!c) return;
  c.classList.add('cheer');
  setTimeout(() => c.classList.remove('cheer'), 900);
}, 3200);

/* ================= игры ================= */
const MODES = {};
const animals = () => C.items.filter(i => i.group === 'animal');
const soundAnimals = () => C.items.filter(i => i.says);

/* «Выбери правильного» — общая механика нескольких игр: персонажи стоят на светлых пятачках */
function choiceBoard(opts, onPick) {
  const n = opts.length, L = land();
  const cols = L ? n : (n <= 2 ? 1 : 2), rows = Math.ceil(n / cols);
  const w = L ? Math.min(94 / n, 40) : 84 / cols, h = L ? 56 : 62 / rows;
  const box = document.createElement('div');
  box.className = 'choice';
  box.style.setProperty('--cols', cols);
  box.style.setProperty('--cell', `min(${w}vw - 3vmin, ${h / 1.25}vh - 2vmin)`);
  opts.forEach((o, k) => {
    const b = document.createElement('button');
    b.className = 'opt pop' + (ART.isAnimal(o.id) ? '' : ' food-opt');
    b.style.setProperty('--pd', k * 90 + 'ms');
    b.style.setProperty('--bd', (-Math.random() * 4).toFixed(2) + 's');
    b.innerHTML = `<div class="lift">${ART.art(o.id)}</div>`;
    b.addEventListener('click', () => onPick(o, b));
    box.appendChild(b);
  });
  $('#stage').replaceChildren(box);
  return box;
}
// правильный выбор: прыжок, радость, салют, звезда в счётчик
function rightPick(el, board) {
  SOUND.play('win'); anim(el, 'win'); celebrate(el);
  express(el, 'happy cheer', 1600);
  [...board.children].forEach(c => c !== el && c.classList.add('dim'));
  return progress.inc(el);
}
function wrongPick(el) { SOUND.play('nope'); anim(el, 'no'); express(el, 'nope', 500); }

/* --- 1. Ферма --- */
MODES.farm = {
  start(r, l) {
    this.r = r; this.l = l;
    if (l === 1) return this.free();
    this.queue = shuffle(soundAnimals());
    progress.reset(8); this.next();
  },
  // уровень 1: свободная игра — тап = звук, зверят можно таскать по полю
  free() {
    progress.reset(0);
    const stage = $('#stage'); stage.className = 'farm';
    const L = land(), list = shuffle(soundAnimals()).slice(0, L ? 8 : 9);
    const cols = L ? 4 : 3, rows = Math.ceil(list.length / cols);
    list.forEach((it, k) => {
      const el = actor(it.id, 'actor pop');
      el.style.setProperty('--pd', k * 70 + 'ms');
      const c = k % cols, rr = Math.floor(k / cols);
      // дальние ряды чуть меньше и выше — получается глубина
      const depth = .74 + .26 * (rr / Math.max(1, rows - 1));
      el.style.setProperty('--s', `calc(${L ? 19 : 25}vmin * ${depth.toFixed(2)})`);
      el.style.zIndex = 1 + rr;
      el.style.left = `calc(${(c + .5) / cols * 100 + (Math.random() - .5) * 6}% - var(--s) / 2)`;
      // ноги стоят на траве: задний ряд у линии холма, передний — внизу
      const back = L ? 36 : 33;
      el.style.bottom = `calc(${back - rr / Math.max(1, rows - 1) * (back - 3)}% + ${(Math.random() - .5) * 3}%)`;
      draggable(el, {
        free: true,
        onTap: () => { SOUND.play('boing'); anim(el, 'jump'); express(el, 'happy', 1500); SOUND.seq(['name_' + it.id, 'sound_' + it.id], { talk: { ['sound_' + it.id]: el } }); },
        onStart: () => { SOUND.play('pick'); express(el, 'held wow', 0); },
        onDrop: () => {
          const c = charOf(el); c.classList.remove('held', 'wow');
          const { x, r } = center(el); FX.dust(x, r.bottom - r.height * .05); SOUND.play('land'); anim(el, 'squash');
          return true;
        },
      });
      stage.appendChild(el);
    });
    SOUND.say('menu_farm');
    const first = stage.firstChild, r = this.r;
    setTimeout(() => alive(r) && first && showHand(first), 2500);
  },
  // уровень 2: «Кто так говорит?» — слышим звук, ищем зверька
  next() {
    if (!alive(this.r)) return;
    const n = progress.n < 3 ? 2 : 3;
    const t = this.target = this.queue[progress.n % this.queue.length];
    this.opts = shuffle([t, ...shuffle(soundAnimals().filter(a => a !== t)).slice(0, n - 1)]);
    this.busy = false; this.misses = 0;
    this.board = choiceBoard(this.opts, (o, b) => this.pick(o, b));
    this.repeat();
  },
  async repeat() {
    if (this.l === 1) { SOUND.say('menu_farm'); return; }
    if (this.busy) return;
    if (await SOUND.say('who_' + this.target.id) && alive(this.r)) idle(() => { this.hint(); this.repeat(); });
  },
  hint() { const c = this.board.children[this.opts.indexOf(this.target)]; if (c) { c.classList.add('hint'); showHand(c); } },
  async pick(o, el) {
    if (this.busy) return;
    clearIdle(); const r = this.r, t = this.target;
    if (o === t) {
      this.busy = true;
      const done = rightPick(el, this.board);
      await SOUND.seq([praise(), 'sound_' + t.id], { talk: { ['sound_' + t.id]: el } });
      if (!alive(r)) return;
      await wait(250);
      done ? finish(r) : this.next();
    } else {
      wrongPick(el);
      // неправильный зверёк сам говорит, как он звучит, — это тоже учит
      if (await SOUND.seq(['sound_' + o.id, 'who_' + t.id], { talk: { ['sound_' + o.id]: el } }) && alive(r)) {
        if (++this.misses >= 2) this.hint();
        idle(() => { this.hint(); this.repeat(); });
      }
    }
  },
};

/* --- 2. Где кто? --- */
MODES.find = {
  start(r, l) { this.r = r; this.l = l; progress.reset(8); this.next(); },
  next() {
    if (!alive(this.r)) return;
    const k = progress.n;
    const n = this.l === 1 ? (k < 3 ? 2 : 3) : (k < 3 ? 3 : 4);
    const pool = this.l === 1 ? animals() : C.items;
    // не ставим рядом два разных предмета с одинаковым словом
    const opts = [];
    for (const it of shuffle(pool)) if (!opts.some(o => o.name === it.name) && opts.length < n) opts.push(it);
    this.target = pick(opts); this.opts = opts;
    this.busy = false; this.misses = 0;
    this.board = choiceBoard(opts, (o, b) => this.pick(o, b));
    this.repeat();
  },
  async repeat() {
    if (this.busy) return;
    if (await SOUND.say('where_' + this.target.id) && alive(this.r)) idle(() => { this.hint(); this.repeat(); });
  },
  hint() { const c = this.board.children[this.opts.indexOf(this.target)]; if (c) { c.classList.add('hint'); showHand(c); } },
  async pick(o, el) {
    if (this.busy) return;
    clearIdle(); const r = this.r, t = this.target;
    if (o === t) {
      this.busy = true;
      const done = rightPick(el, this.board);
      const say2 = P['sound_' + t.id] ? 'sound_' + t.id : 'name_' + t.id;
      await SOUND.seq([praise(), say2], { talk: { [say2]: el } });
      if (!alive(r)) return;
      await wait(250);
      done ? finish(r) : this.next();
    } else {
      wrongPick(el);
      if (await SOUND.seq(['this_' + o.id, 'where_' + t.id]) && alive(r)) {
        if (++this.misses >= 2) this.hint();
        idle(() => { this.hint(); this.repeat(); });
      }
    }
  },
};

/* --- 3. Накорми зверят --- */
MODES.feed = {
  start(r, l) {
    this.r = r; this.l = l; this.taught = false;
    this.queue = shuffle(C.feed);
    progress.reset(l === 1 ? 7 : 6);
    SOUND.say('feed_intro').then(() => alive(r) && this.next());
  },
  next() {
    const r = this.r;
    if (!alive(r)) return;
    const f = this.cur = this.queue[progress.n % this.queue.length];
    this.busy = false;
    const L = land();
    let pair = [f];
    if (this.l === 2) pair = shuffle([f, pick(C.feed.filter(x => x !== f))]);
    const extra = shuffle(C.feed.filter(x => !pair.includes(x)).map(x => x.food).concat(['apple', 'strawberry', 'cookie']));
    const nFoods = this.l === 1 ? (progress.n < 3 ? 2 : 3) : 3;
    const foods = shuffle([...pair.map(p => p.food), ...extra].slice(0, nFoods));
    const stage = $('#stage');
    stage.innerHTML = '<div class="foods"></div>';
    const fs = this.l === 1 ? (L ? 40 : 62) : (L ? 34 : 42);
    stage.style.setProperty('--fs', fs + 'vmin');
    const targets = pair.map((p, i) => {
      const el = actor(p.animal, 'feeder pop');
      el.style.left = pair.length === 1 ? `calc(50% - ${fs / 2}vmin)` : `calc(${i === 0 ? 27 : 73}% - ${fs / 2}vmin)`;
      el.style.top = 'auto'; el.style.bottom = '34%'; // стоят на краю пледа
      stage.appendChild(el);
      return { el, data: p, onTap: () => { anim(el, 'squash'); this.repeat(); } };
    });
    const tray = $('.foods', stage);
    const items = foods.map((id, k) => {
      const el = document.createElement('div');
      el.className = 'food';
      el.innerHTML = `<div class="lift"><div class="pop" style="--pd:${250 + k * 110}ms;width:100%;height:100%">${ART.food(id)}</div></div>`;
      const slot = document.createElement('div'); slot.className = 'slot'; // тарелка остаётся на пледе
      slot.appendChild(el); tray.appendChild(slot);
      return { el, data: id };
    });
    this.targets = targets; this.items = items;
    mover({
      items, targets, pad: .05, anticipate: true,
      onSelect: it => SOUND.say('name_' + it.data),
      tryDrop: (it, t) => this.drop(it, t),
    });
    this.repeat(true);
  },
  async repeat(first) {
    if (this.busy) return;
    const f = this.cur, t = this.targets.find(t => t.data === f);
    if (await SOUND.say('feed_ask_' + f.animal, { el: t && t.el }) && alive(this.r)) {
      if (first && !this.taught) this.teach();
      idle(() => { this.teach(); this.repeat(); });
    }
  },
  teach() {
    const it = this.items.find(i => i.data === this.cur.food), t = this.targets.find(t => t.data === this.cur);
    if (it && t) showHand(it.el, t.el);
  },
  drop(it, t) {
    const r = this.r, f = this.cur;
    clearIdle(); this.taught = true;
    if (t.data !== f || it.data !== f.food) {
      SOUND.play('nope'); express(t.el, 'nope', 500);
      SOUND.seq([t.data !== f ? 'oops_animal' : 'this_' + it.data, 'feed_ask_' + f.animal]).then(ok => ok && alive(r) && idle(() => { this.teach(); this.repeat(); }));
      return false;
    }
    this.busy = true;
    it.el.dataset.locked = 1;
    express(t.el, 'wow', 500);
    snapTo(it.el, t.el);
    const c = center(t.el), mouthY = c.r.top + c.r.height * .45;
    setTimeout(() => { it.el.classList.add('eaten'); SOUND.play('chomp'); FX.crumbs(c.x, mouthY, '#e3a764', 12); }, 250);
    setTimeout(() => { anim(t.el, 'jump'); express(t.el, 'happy cheer', 2200); FX.hearts(c.x, c.r.top + c.r.height * .2, 8); }, 650);
    const done = progress.inc(t.el);
    (async () => {
      await wait(900);
      SOUND.play('win');
      if (!await SOUND.seq(['feed_ok_' + f.animal, praise()], { talk: { ['feed_ok_' + f.animal]: t.el } }) || !alive(r)) return;
      await wait(300);
      done ? finish(r) : this.next();
    })();
    return true;
  },
};

/* --- 4. Фигурки (сортер) --- */
MODES.sorter = {
  start(r, l) { this.r = r; this.l = l; this.taught = false; progress.reset(4); SOUND.say('sorter_intro'); this.next(); },
  next() {
    const r = this.r;
    if (!alive(r)) return;
    let pieces;
    if (this.l === 1) {
      const n = progress.n < 2 ? 2 : 3;
      const shapes = shuffle(C.shapes).slice(0, n), colors = shuffle(C.colors);
      pieces = shapes.map((s, i) => ({ s, c: colors[i] }));
    } else {
      // уровень 2: одинаковые фигуры разных цветов — надо смотреть и на форму, и на цвет
      const shapes = shuffle(C.shapes).slice(0, 2), colors = shuffle(C.colors).slice(0, 2);
      pieces = shapes.flatMap(s => colors.map(c => ({ s, c })));
    }
    const n = pieces.length, L = land();
    const perRow = L ? n : n === 4 ? 2 : n;
    const hs = `min(${L ? 21 : 30}vmin, ${80 / perRow}vw - 7vmin)`;
    const stage = $('#stage');
    stage.style.setProperty('--hs', hs);
    stage.style.setProperty('--ww', `calc(${perRow} * ${hs} + ${perRow - 1} * 4vmin + 8vmin)`);
    stage.innerHTML = '<div class="wood pop"></div><div class="pieces"></div>';
    const key = p => this.l === 1 ? p.s.id : p.c.id + '_' + p.s.id;
    const targets = shuffle(pieces).map(p => {
      const el = document.createElement('div'); el.className = 'hole';
      el.innerHTML = ART.hole(p.s.id, this.l === 2 ? p.c : null);
      $('.wood', stage).appendChild(el);
      return { el, data: key(p), filled: false };
    });
    const items = shuffle(pieces).map((p, k) => {
      const el = document.createElement('div'); el.className = 'piece';
      el.innerHTML = `<div class="lift"><div class="pop" style="--pd:${300 + k * 110}ms;width:100%;height:100%">${ART.shape(p.s.id, p.c)}</div></div>`;
      $('.pieces', stage).appendChild(el);
      return { el, data: key(p), word: 'combo_' + p.c.id + '_' + p.s.id };
    });
    this.left = n; this.items = items; this.targets = targets;
    mover({
      items, targets, pad: .2,
      onSelect: it => { SOUND.say(it.word, { el: it.el }); },
      tryDrop: (it, t) => this.drop(it, t),
    });
    if (!this.taught) setTimeout(() => alive(r) && !this.taught && this.teach(), 2600);
  },
  teach() {
    const it = this.items.find(i => !i.el.classList.contains('placed'));
    const t = it && this.targets.find(t => t.data === it.data && !t.filled);
    if (it && t) showHand(it.el, t.el);
  },
  repeat() { SOUND.say('sorter_intro'); setTimeout(() => this.teach(), 1500); },
  drop(it, t) {
    const r = this.r;
    this.taught = true; clearIdle();
    if (t.filled || t.data !== it.data) {
      SOUND.play('nope'); anim(it.el.firstChild, 'no'); SOUND.say('oops');
      return false;
    }
    t.filled = true;
    it.el.dataset.locked = 1; it.el.classList.add('placed');
    snapTo(it.el, t.el);
    express(it.el, 'happy', 0);
    SOUND.play('snap');
    const c = center(t.el); FX.burst(c.x, c.y, 12); FX.dust(c.x, c.r.bottom, 6);
    if (--this.left === 0) {
      const done = progress.inc($('.wood'));
      setTimeout(() => SOUND.play('win'), 300);
      SOUND.seq([it.word, 'sorter_done']).then(async ok => {
        if (!ok || !alive(r)) return;
        await wait(300);
        done ? finish(r) : this.next();
      });
    } else {
      SOUND.seq([it.word, praise()]);
      idle(() => this.teach(), 9000);
    }
    return true;
  },
};

/* --- 5. Шарики --- */
MODES.balloons = {
  start(r, l) {
    this.r = r; this.l = l;
    progress.reset(l === 1 ? 8 : 10);
    if (l === 1) this.next(); else this.rise();
  },
  // уровень 1: шарики висят — тапни нужный цвет
  next() {
    if (!alive(this.r)) return;
    this.busy = false; this.misses = 0;
    const n = progress.n < 3 ? 2 : 3;
    const cols = this.cols = shuffle(C.colors).slice(0, n);
    const t = this.target = pick(cols);
    const box = document.createElement('div'); box.className = 'balloons';
    box.style.setProperty('--bw', `min(${80 / n}vw, 28vmin, 32vh)`);
    cols.forEach((c, k) => {
      const b = document.createElement('button');
      b.className = 'balloon';
      b.style.setProperty('--bd', (-k * .7) + 's');
      b.innerHTML = `<div class="pop" style="--pd:${k * 100}ms;width:100%;height:100%"><div class="bob">${ART.balloon(c)}</div></div>`;
      b.addEventListener('click', () => this.pick(c, b));
      box.appendChild(b);
    });
    $('#stage').replaceChildren(box);
    this.box = box;
    this.repeat();
  },
  async repeat() {
    if (this.l === 2) { if (this.target) SOUND.say('pop_' + this.target.id); return; }
    if (this.busy) return;
    if (await SOUND.say('whereball_' + this.target.id) && alive(this.r)) idle(() => { this.hint(); this.repeat(); });
  },
  hint() { const b = this.box.children[this.cols.indexOf(this.target)]; if (b) { b.firstChild.classList.add('hint'); showHand(b); } },
  async pick(c, el) {
    if (this.busy) return;
    clearIdle(); const r = this.r, t = this.target;
    if (c === t) {
      this.busy = true;
      SOUND.play('sparkle'); celebrate(el, 16); express(el, 'happy', 0);
      el.classList.add('away');
      const done = progress.inc(el);
      await SOUND.seq([praise(), 'ball_' + t.id]);
      if (!alive(r)) return;
      done ? finish(r) : this.next();
    } else {
      SOUND.play('nope'); anim(el.firstChild, 'no'); express(el, 'wow', 700);
      if (await SOUND.seq(['thisball_' + c.id, 'whereball_' + t.id]) && alive(r)) {
        if (++this.misses >= 2) this.hint();
        idle(() => { this.hint(); this.repeat(); });
      }
    }
  },
  // уровень 2: шарики летят вверх — лопни шарик нужного цвета
  rise() {
    const r = this.r, stage = $('#stage');
    this.cols = shuffle(C.colors).slice(0, 3);
    this.target = pick(this.cols);
    this.lock = false;
    SOUND.say('pop_intro').then(ok => ok && alive(r) && SOUND.say('pop_' + this.target.id));
    const spawn = () => {
      if (!alive(r)) return;
      const live = $$('.riser', stage).filter(b => !b.dataset.gone);
      const targetsLive = live.filter(b => b._c === this.target).length;
      const c = targetsLive < 1 || Math.random() < .4 ? this.target : pick(this.cols);
      const b = document.createElement('button');
      b.className = 'riser'; b._c = c;
      const bw = Math.min(innerWidth * .2, innerHeight * .17);
      b.style.setProperty('--bw', bw + 'px');
      // 4 дорожки, подряд в одну и ту же не пускаем — шарики не слипаются
      let lane; do lane = rnd(4); while (lane === this.lastLane);
      this.lastLane = lane;
      b.style.left = `calc(${(lane + .5) * 25 + (Math.random() - .5) * 8}% - ${bw / 2}px)`;
      b.style.setProperty('--bd', (-Math.random() * 3) + 's');
      b.innerHTML = `<div class="sway">${ART.balloon(c)}</div>`;
      const h = stage.getBoundingClientRect().height;
      const dur = 7000 + Math.random() * 2500;
      b._anim = b.animate([{ transform: `translateY(${bw * 1.8}px)` }, { transform: `translateY(${-h - bw * 0.2}px)` }], { duration: dur, easing: 'linear' });
      b._anim.onfinish = () => b.remove();
      b.addEventListener('pointerdown', () => this.tapRiser(b));
      stage.appendChild(b);
      setTimeout(spawn, 1100 + Math.random() * 600);
    };
    spawn();
  },
  async tapRiser(b) {
    if (b.dataset.gone) return;
    const r = this.r, c = b._c;
    clearIdle();
    if (c === this.target && !this.lock) {
      b.dataset.gone = 1;
      SOUND.play('pop');
      const p = center(b); FX.shreds(p.x, p.r.top + p.r.height * .32, c.hex);
      b._anim.pause();
      b.animate([{ scale: 1, opacity: 1 }, { scale: 1.5, opacity: 0 }], { duration: 160, fill: 'forwards' }).onfinish = () => b.remove();
      const done = progress.inc(b);
      this.lock = true;
      await SOUND.seq(['ball_' + c.id]);
      if (!alive(r)) return;
      if (done) return finish(r);
      // иногда меняем цвет-задание
      if (progress.n % 3 === 0) { this.target = pick(this.cols.filter(x => x !== this.target)); }
      this.lock = false;
      SOUND.say('pop_' + this.target.id);
    } else if (c !== this.target) {
      SOUND.play('boing'); anim(b.firstChild, 'no'); express(b, 'wow', 700);
      SOUND.seq(['thisball_' + c.id, 'pop_' + this.target.id]);
    }
  },
};

/* ================= старт ================= */
function makeGrain() {
  // мелкое «зерно» поверх всей картинки — как у нарисованной иллюстрации
  const c = document.createElement('canvas'); c.width = c.height = 140;
  const g = c.getContext('2d'), d = g.createImageData(140, 140);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() * 16; }
  g.putImageData(d, 0, 0);
  document.documentElement.style.setProperty('--grain', `url(${c.toDataURL()})`);
}
const svgUrl = s => `url("data:image/svg+xml;utf8,${encodeURIComponent(s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}")`;

async function boot() {
  [C, P] = await Promise.all([fetch('content.json').then(r => r.json()), fetch('phrases.json').then(r => r.json())]);
  makeGrain();
  document.documentElement.style.setProperty('--plate', svgUrl(ART.P.plate));
  setScene('meadow');
  const L = ['#ff5a4e', '#ff9a2e', '#ffc93c', '#4cc35a', '#2fb6ff', '#7c6cf0', '#ff7aa8', '#ff5a4e', '#4cc35a'];
  $('#start .logo').innerHTML = [...'Говорушка'].map((ch, i) => `<span style="--c:${L[i]};--d:${-i * .15}s">${ch}</span>`).join('');
  $('#start .hero').innerHTML = `<div class="bob">${ART.char('parrot')}</div>`;
  $('#mascot').innerHTML = `<div class="bob">${ART.char('parrot')}</div>`;
  $('#homeBtn').innerHTML = ART.UI.home;
  $('#startBtn').innerHTML = ART.UI.play;
  $('#musicBtn').innerHTML = ART.UI.note(SOUND.musicOn);
  $('#hand').innerHTML = ART.UI.hand;
  buildMenu();
}
$('#startBtn').addEventListener('click', () => {
  SOUND.init();
  SOUND.startMusic();
  SOUND.play('tap');
  transition(() => setScreen('menu')).then(() => SOUND.say('hello'));
  SOUND.preload(Object.keys(P));
});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
boot();
