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

let C, P, ITEM = {};

/* ================= элементы ================= */
function actor(id, cls = 'actor') {
  const el = document.createElement('div');
  el.className = cls;
  el.style.setProperty('--bd', (-Math.random() * 5).toFixed(2) + 's');
  el.innerHTML = `<div class="lift"><div class="bob">${ART.art(id)}</div></div>`;
  return el;
}
function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }
function anim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function confetti(el, n = 18) {
  const { x, y } = center(el);
  const colors = ['#ff5a5a', '#ffd23a', '#4cc35a', '#2f8cf0', '#ff8ad8', '#ff9f2e', '#9b7bff'];
  const ring = document.createElement('div'); ring.className = 'fx ring'; ring.style.left = x + 'px'; ring.style.top = y + 'px';
  document.body.appendChild(ring); setTimeout(() => ring.remove(), 700);
  for (let i = 0; i < n; i++) {
    const star = i % 3 === 0;
    const f = document.createElement('div');
    f.className = 'fx' + (star ? '' : ' dot');
    if (star) f.innerHTML = ART.UI.star(true); else f.style.background = pick(colors);
    f.style.left = x + 'px'; f.style.top = y + 'px';
    const a = Math.random() * Math.PI * 2, d = Math.min(innerWidth, innerHeight) * (.18 + Math.random() * .25);
    f.style.setProperty('--dx', Math.cos(a) * d + 'px');
    f.style.setProperty('--dy', Math.sin(a) * d + 'px');
    f.style.setProperty('--r', (rnd(720) - 360) + 'deg');
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }
}

/* ---------- глаза следят за пальцем ---------- */
let lookPt = null, lookRaf = null, lookIdle = null;
function updateLook() {
  lookRaf = null;
  $$('.screen .look, #mascot .look').forEach(g => {
    const svg = g.ownerSVGElement; if (!svg) return;
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    let tx = 0, ty = 0;
    if (lookPt) {
      const dx = lookPt.x - (r.left + r.width / 2), dy = lookPt.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
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
const hand = { el: null, anim: null };
function showHand(from, to) {
  hideHand();
  const h = hand.el = $('#hand');
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
  let pid = null, sx = 0, sy = 0, bx = 0, by = 0, moved = false;
  el.addEventListener('pointerdown', e => {
    if (pid !== null || el.dataset.locked) return;
    pid = e.pointerId; sx = e.clientX; sy = e.clientY; bx = el._tx; by = el._ty; moved = false;
    try { el.setPointerCapture(pid); } catch {}
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 12) { moved = true; el.classList.add('dragging'); onStart && onStart(); }
    if (moved) { setPos(el, bx + dx, by + dy); onMove && onMove({ x: e.clientX, y: e.clientY }); }
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

function mover({ items, targets, onSelect, tryDrop, pad = .25 }) {
  let sel = null;
  const deselect = () => { if (sel) sel.el.classList.remove('selected'); sel = null; targets.forEach(t => t.el.classList.remove('target-on')); };
  const glow = pt => targets.forEach(t => t.el.classList.toggle('target-on', hits(pt, t.el, pad)));
  items.forEach(it => draggable(it.el, {
    onTap: () => {
      if (sel === it) { deselect(); return; }
      deselect(); sel = it; it.el.classList.add('selected');
      SOUND.play('pick'); onSelect(it);
    },
    onStart: () => { deselect(); SOUND.play('pick'); onSelect(it); },
    onMove: glow,
    onDrop: pt => {
      targets.forEach(t => t.el.classList.remove('target-on'));
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
function setScene(kind) { if (kind !== curScene) { curScene = kind; $('#scene').innerHTML = ART.scene(kind); } }
function setScreen(s) { document.body.dataset.screen = s; }

async function transition(fn) {
  const iris = $('#iris');
  iris.classList.add('on');
  SOUND.play('whoosh');
  await iris.animate([{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' }).finished;
  fn();
  await wait(60);
  await iris.animate([{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 380, easing: 'ease-out', fill: 'forwards' }).finished;
  iris.classList.remove('on');
}

const progress = {
  n: 0, goal: 0,
  reset(goal) {
    this.n = 0; this.goal = goal;
    const el = $('#progress'); el.innerHTML = ''; el.classList.toggle('on', goal > 0);
    for (let i = 0; i < goal; i++) el.insertAdjacentHTML('beforeend', `<span>${ART.UI.star(false)}</span>`);
  },
  inc() {
    this.n++;
    const s = $('#progress').children[this.n - 1];
    if (s) { s.innerHTML = ART.UI.star(true); s.classList.add('on'); }
    return this.n >= this.goal;
  },
};

const GAMES = {
  farm:     { scene: 'farm',     hero: 'cow',    color: ['#ffd0dc', '#ff9fb5'] },
  find:     { scene: 'meadow',   hero: 'owl',    color: ['#cfe9ff', '#8fc8ff'] },
  feed:     { scene: 'picnic',   hero: 'rabbit', color: ['#ffe6b8', '#ffc56a'] },
  sorter:   { scene: 'sorter',   hero: null,     color: ['#d9f5c8', '#9ddc80'] },
  balloons: { scene: 'balloons', hero: null,     color: ['#ead9ff', '#c4a5ff'] },
};

function tileArt(m) {
  if (m === 'farm') return `<div style="inset:0">${ART.art('cow')}</div>`;
  if (m === 'find') return `<div style="inset:4% 22% 22% 4%">${ART.art('owl')}</div><div style="width:58%;height:58%;right:0;bottom:0">${ART.UI.magnifier}</div>`;
  if (m === 'feed') return `<div style="inset:0 10% 10% 0">${ART.art('rabbit')}</div><div style="width:50%;height:50%;right:-6%;bottom:-4%;transform:rotate(30deg)">${ART.food('carrot')}</div>`;
  if (m === 'sorter') return `<div style="width:56%;height:56%;left:0;top:30%">${ART.shape('circle', C.colors[0])}</div><div style="width:50%;height:50%;right:0;top:36%">${ART.shape('square', C.colors[1])}</div><div style="width:50%;height:50%;left:25%;top:-4%">${ART.shape('star', C.colors[2])}</div>`;
  return `<div style="width:46%;height:78%;left:0;top:14%">${ART.balloon(C.colors[0])}</div><div style="width:46%;height:78%;right:0;top:4%">${ART.balloon(C.colors[3])}</div><div style="width:40%;height:68%;left:30%;top:28%">${ART.balloon(C.colors[2])}</div>`;
}

function buildMenu() {
  $('#menu .tiles').innerHTML = Object.entries(GAMES).map(([m, g], i) =>
    `<button class="tile" data-mode="${m}" style="--tc:${g.color[0]};--td:${g.color[1]};--bd:${-i * .6}s"><div class="art">${tileArt(m)}</div></button>`).join('');
  $$('#menu .tile').forEach(t => t.addEventListener('click', () => {
    SOUND.play('tap'); anim(t, 'squash');
    const m = t.dataset.mode;
    SOUND.say('menu_' + m);
    setTimeout(() => openLevels(m), 350);
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
    $('#levels .hero').innerHTML = g.hero ? `<div class="bob">${ART.art(g.hero)}</div>` : `<div class="bob"><div class="art">${tileArt(m)}</div></div>`;
    const done = store.get('done_' + m, {});
    const star = `<div class="st">${ART.UI.star(true)}</div>`;
    $('#levels .lv').innerHTML = [1, 2].map(l => `<button class="lvbtn" data-l="${l}" style="--c:${l === 1 ? '#7ee08a' : '#ffb347'}">
      ${star.repeat(l)}${done[l] ? `<div class="crown">${ART.UI.crown}</div>` : ''}</button>`).join('');
    $$('#levels .lvbtn').forEach(b => b.addEventListener('click', () => { SOUND.play('tap'); anim(b, 'squash'); startLevel(m, +b.dataset.l); }));
    setScreen('levels');
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
  const f = $('#finish');
  const ids = shuffle(C.items.filter(i => i.group === 'animal')).slice(0, land() ? 4 : 3).map(i => i.id);
  f.innerHTML = `<div class="crown">${ART.UI.crown}</div><div class="dancers"></div>`;
  ids.forEach(id => $('.dancers', f).appendChild(actor(id)));
  setScreen('finish');
  SOUND.play('fanfare');
  confetti($('.crown', f), 30);
  setTimeout(() => alive(r) && confetti($('.crown', f), 24), 700);
  await SOUND.say('finish');
  await wait(900);
  if (alive(r)) openLevels(mode);
}

/* ================= игры ================= */
const MODES = {};
const animals = () => C.items.filter(i => i.group === 'animal');
const soundAnimals = () => C.items.filter(i => i.says);

/* «Выбери правильную картинку» — общая механика для нескольких игр */
function choiceBoard(opts, onPick, art) {
  const n = opts.length, L = land();
  const cols = L ? n : (n <= 2 ? 1 : 2), rows = Math.ceil(n / cols);
  const w = L ? Math.min(94 / n, 44) : 88 / cols, h = L ? 64 : 70 / rows;
  const box = document.createElement('div');
  box.className = 'choice';
  box.style.setProperty('--cols', cols);
  box.style.setProperty('--cell', `min(${w}vw - 3vmin, ${h}vh - 3vmin)`);
  opts.forEach((o, k) => {
    const b = document.createElement('button');
    b.className = 'card pop'; b.style.setProperty('--pd', k * 90 + 'ms');
    b.style.setProperty('--bd', (-Math.random() * 3) + 's');
    b.innerHTML = `<div class="bob">${art(o)}</div>`;
    b.addEventListener('click', () => onPick(o, b));
    box.appendChild(b);
  });
  $('#stage').replaceChildren(box);
  return box;
}

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
      el.style.left = `calc(${(c + .5) / cols * 100 + (Math.random() - .5) * 6}% - var(--s) / 2)`;
      el.style.top = `calc(${(rr + .5) / rows * (L ? 80 : 84) + (Math.random() - .5) * 4}% - var(--s) / 2)`;
      draggable(el, {
        free: true,
        onTap: () => { SOUND.play('boing'); anim(el.firstChild, 'squash'); SOUND.seq(['name_' + it.id, 'sound_' + it.id], { talk: { ['sound_' + it.id]: el } }); },
        onStart: () => SOUND.play('pick'),
        onDrop: () => true,
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
    this.board = choiceBoard(this.opts, (o, b) => this.pick(o, b), o => ART.art(o.id));
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
      SOUND.play('win'); anim(el, 'win'); confetti(el);
      [...this.board.children].forEach(c => c !== el && c.classList.add('dim'));
      const done = progress.inc();
      await SOUND.seq([praise(), 'sound_' + t.id], { talk: { ['sound_' + t.id]: el } });
      if (!alive(r)) return;
      await wait(250);
      done ? finish(r) : this.next();
    } else {
      SOUND.play('nope'); anim(el, 'no');
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
    this.board = choiceBoard(opts, (o, b) => this.pick(o, b), o => ART.art(o.id));
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
      SOUND.play('win'); anim(el, 'win'); confetti(el);
      [...this.board.children].forEach(c => c !== el && c.classList.add('dim'));
      const done = progress.inc();
      const say2 = P['sound_' + t.id] ? 'sound_' + t.id : 'name_' + t.id;
      await SOUND.seq([praise(), say2], { talk: { [say2]: el } });
      if (!alive(r)) return;
      await wait(250);
      done ? finish(r) : this.next();
    } else {
      SOUND.play('nope'); anim(el, 'no');
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
    const fs = this.l === 1 ? (L ? 46 : 70) : (L ? 38 : 44);
    stage.style.setProperty('--fs', fs + 'vmin');
    const targets = pair.map((p, i) => {
      const el = actor(p.animal, 'feeder pop');
      el.style.left = pair.length === 1 ? `calc(50% - ${fs / 2}vmin)` : `calc(${i === 0 ? 27 : 73}% - ${fs / 2}vmin)`;
      if (!L && this.l === 1) el.style.top = '8%';
      stage.appendChild(el);
      return { el, data: p, onTap: () => { anim(el.firstChild, 'squash'); this.repeat(); } };
    });
    const tray = $('.foods', stage);
    const items = foods.map((id, k) => {
      const el = document.createElement('div');
      el.className = 'food';
      el.innerHTML = `<div class="lift"><div class="pop" style="--pd:${250 + k * 110}ms;width:100%;height:100%">${ART.food(id)}</div></div>`;
      tray.appendChild(el);
      return { el, data: id };
    });
    this.targets = targets; this.items = items;
    this.mv = mover({
      items, targets, pad: .05,
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
    if (t.data !== f) {
      SOUND.play('nope'); anim(t.el.firstChild, 'no');
      SOUND.seq(['oops_animal', 'feed_ask_' + f.animal]).then(ok => ok && alive(r) && idle(() => { this.teach(); this.repeat(); }));
      return false;
    }
    if (it.data !== f.food) {
      SOUND.play('nope'); anim(t.el.firstChild, 'no');
      SOUND.seq(['this_' + it.data, 'feed_ask_' + f.animal]).then(ok => ok && alive(r) && idle(() => { this.teach(); this.repeat(); }));
      return false;
    }
    this.busy = true;
    it.el.dataset.locked = 1;
    snapTo(it.el, t.el);
    setTimeout(() => { it.el.classList.add('eaten'); SOUND.play('chomp'); }, 200);
    setTimeout(() => { t.el.classList.add('chomp'); confetti(t.el, 16); }, 450);
    const done = progress.inc();
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
      onSelect: it => SOUND.say(it.word),
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
    SOUND.play('snap'); confetti(t.el, 10);
    if (--this.left === 0) {
      const done = progress.inc();
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
      SOUND.play('sparkle'); confetti(el, 14);
      el.classList.add('away');
      const done = progress.inc();
      await SOUND.seq([praise(), 'ball_' + t.id]);
      if (!alive(r)) return;
      done ? finish(r) : this.next();
    } else {
      SOUND.play('nope'); anim(el.firstChild, 'no');
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
      SOUND.play('pop'); confetti(b, 16);
      b._anim.pause();
      b.animate([{ scale: 1, opacity: 1 }, { scale: 1.5, opacity: 0 }], { duration: 180, fill: 'forwards' }).onfinish = () => b.remove();
      const done = progress.inc();
      this.lock = true;
      await SOUND.seq(['ball_' + c.id]);
      if (!alive(r)) return;
      if (done) return finish(r);
      // иногда меняем цвет-задание
      if (progress.n % 3 === 0) { this.target = pick(this.cols.filter(x => x !== this.target)); }
      this.lock = false;
      SOUND.say('pop_' + this.target.id);
    } else if (c !== this.target) {
      SOUND.play('boing'); anim(b.firstChild, 'no');
      SOUND.seq(['thisball_' + c.id, 'pop_' + this.target.id]);
    }
  },
};

/* ================= старт ================= */
async function boot() {
  [C, P] = await Promise.all([fetch('content.json').then(r => r.json()), fetch('phrases.json').then(r => r.json())]);
  C.items.forEach(i => ITEM[i.id] = i);
  setScene('meadow');
  $('#start .hero').innerHTML = `<div class="bob">${ART.animal('parrot')}</div>`;
  $('#mascot').innerHTML = `<div class="bob">${ART.animal('parrot')}</div>`;
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
