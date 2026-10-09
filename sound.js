'use strict';
/* Звук: фоновая музыка (синтез в браузере, без файлов), эффекты и озвучка.
   Музыка автоматически приглушается, пока говорит голос (ducking). */

const SOUND = (() => {
  let ctx = null, master, musicBus, sfxBus, voiceBus, analyser, noiseBuf;
  const MUSIC_VOL = .16, DUCK_VOL = .045;
  let musicOn = true;
  try { musicOn = localStorage.getItem('gov_music') !== '0'; } catch {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? MUSIC_VOL : 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .55; sfxBus.connect(master);
    // голос идёт напрямую, без компрессора — чтобы не менялся тембр
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1;
    analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    voiceBus.connect(analyser); voiceBus.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
  }

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- инструменты ---------- */
  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function osc(type, f, t, dur, out, peak, a = .005) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, a, peak, dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + a + dur + .05);
    return o;
  }
  // маримба: основной тон + короткий «деревянный» обертон
  function marimba(m, t, v = .5, out = musicBus) {
    const f = mtof(m);
    osc('sine', f, t, .7, out, v);
    osc('sine', f * 4, t, .07, out, v * .35);
    osc('triangle', f * 2, t, .18, out, v * .12);
  }
  function bell(m, t, v = .25, out = musicBus) {
    const f = mtof(m);
    osc('sine', f, t, 1.1, out, v);
    osc('sine', f * 2.76, t, .4, out, v * .25);
  }
  // укулеле-щипок: пила через фильтр с быстрым затуханием
  function pluck(m, t, v = .12) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m);
    f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(500, t + .25);
    env(g, t, .004, v, .32);
    o.connect(f).connect(g).connect(musicBus); o.start(t); o.stop(t + .4);
  }
  function bass(m, t, v = .38) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    f.type = 'lowpass'; f.frequency.value = 600;
    env(g, t, .01, v, .32);
    o.connect(f).connect(g).connect(musicBus); o.start(t); o.stop(t + .4);
  }
  function noise(t, dur, v, freq, type = 'highpass', out = musicBus) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    env(g, t, .002, v, dur);
    s.connect(f).connect(g).connect(out); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
    return f;
  }

  /* ---------- фоновая музыка: весёлый луп в фа мажоре ---------- */
  const BPM = 104, E = 60 / BPM / 2; // восьмая
  const _ = null;
  const MEL = [
    [69, 72, 77, 72, 69, 72, 74, 72], [67, 72, 76, 72, 67, _, 64, 67],
    [69, 74, 77, 74, 69, 74, 76, 77], [74, _, 72, 70, 69, _, 67, _],
    [77, _, 76, _, 74, 72, 69, 72], [76, _, 74, _, 72, 67, 64, 67],
    [74, 72, 70, 74, 72, 69, 67, 69], [67, 69, 70, 71, 72, _, _, _],
  ];
  const CH = [[53, [65, 69, 72]], [48, [64, 67, 72]], [50, [62, 65, 69]], [46, [62, 65, 70]],
              [53, [65, 69, 72]], [48, [64, 67, 72]], [46, [62, 65, 70]], [48, [64, 67, 72]]];
  let musicTimer = null, nextT = 0, step = 0;
  function schedule() {
    while (nextT < ctx.currentTime + .25) {
      const bar = Math.floor(step / 8) % 8, i = step % 8, loop = Math.floor(step / 64);
      const [root, chord] = CH[bar];
      const t = nextT + (i % 2 ? E * .08 : 0); // лёгкий свинг
      if (i === 0) bass(root, t);
      if (i === 4) bass(root + 7, t, .3);
      if (i === 6 && bar % 2) bass(root + 12, t, .22);
      if (i === 2 || i === 6) chord.forEach((m, k) => pluck(m, t + k * .012));
      if (i % 2 === 1) noise(t, .04, .05, 7000);
      const m = MEL[bar][i];
      if (m) {
        if (loop % 2 === 0) marimba(m, t, .42);
        else if (i % 2 === 0) bell(m + 12, t, .14); // второй проход — тише, колокольчики
      }
      nextT += E; step++;
    }
  }
  function startMusic() {
    if (!ctx || musicTimer) return;
    nextT = ctx.currentTime + .1; step = 0;
    musicTimer = setInterval(schedule, 60);
    schedule();
  }
  function setMusic(on) {
    musicOn = on;
    try { localStorage.setItem('gov_music', on ? '1' : '0'); } catch {}
    if (ctx) musicBus.gain.setTargetAtTime(on ? (talking ? DUCK_VOL : MUSIC_VOL) : 0, ctx.currentTime, .15);
  }

  /* ---------- звуковые эффекты ---------- */
  const fx = {
    tap() { const t = ctx.currentTime; osc('sine', 880, t, .08, sfxBus, .25); osc('sine', 1320, t + .03, .08, sfxBus, .15); },
    pick() { const t = ctx.currentTime, o = osc('sine', 500, t, .16, sfxBus, .35); o.frequency.exponentialRampToValueAtTime(1100, t + .12); },
    pop() { const t = ctx.currentTime, o = osc('sine', 900, t, .12, sfxBus, .45); o.frequency.exponentialRampToValueAtTime(180, t + .1); noise(t, .05, .25, 1500, 'bandpass', sfxBus); },
    boing() { const t = ctx.currentTime, o = osc('triangle', 220, t, .35, sfxBus, .35); o.frequency.exponentialRampToValueAtTime(660, t + .12); o.frequency.exponentialRampToValueAtTime(330, t + .3); },
    nope() { const t = ctx.currentTime, o = osc('triangle', 300, t, .3, sfxBus, .3); o.frequency.exponentialRampToValueAtTime(150, t + .28); },
    whoosh() { const t = ctx.currentTime, f = noise(t, .45, .35, 400, 'bandpass', sfxBus); f.frequency.exponentialRampToValueAtTime(3000, t + .35); },
    chomp() { const t = ctx.currentTime; [0, .16, .32].forEach(d => { noise(t + d, .07, .4, 900, 'lowpass', sfxBus); osc('sine', 160, t + d, .06, sfxBus, .3); }); },
    sparkle() { const t = ctx.currentTime; [84, 88, 91, 96].forEach((m, i) => bell(m, t + i * .06, .12, sfxBus)); },
    win() { const t = ctx.currentTime; [72, 76, 79, 84].forEach((m, i) => marimba(m, t + i * .09, .45, sfxBus)); },
    snap() { const t = ctx.currentTime; osc('square', 1200, t, .03, sfxBus, .15); marimba(79, t + .02, .4, sfxBus); marimba(84, t + .1, .35, sfxBus); },
    // цветы — колокольчики пентатоники, каждый раз новая нота
    note() { const t = ctx.currentTime, m = [72, 74, 76, 79, 81, 84, 86][Math.floor(Math.random() * 7)]; marimba(m, t, .5, sfxBus); bell(m + 12, t, .12, sfxBus); },
    rustle() { const t = ctx.currentTime; [0, .08, .17].forEach(d => noise(t + d, .14, .22, 2500, 'bandpass', sfxBus)); },
    giggle() { const t = ctx.currentTime; [0, .11, .22, .33].forEach((d, i) => { const o = osc('triangle', 700 + i * 60, t + d, .09, sfxBus, .22); o.frequency.exponentialRampToValueAtTime(1000 + i * 80, t + d + .05); }); },
    land() { const t = ctx.currentTime; noise(t, .12, .3, 300, 'lowpass', sfxBus); osc('sine', 90, t, .12, sfxBus, .35); },
    fanfare() {
      const t = ctx.currentTime;
      [[72, 0], [76, .15], [79, .3], [84, .45], [79, .75], [84, .9]].forEach(([m, d]) => { marimba(m, t + d, .5, sfxBus); bell(m + 12, t + d, .1, sfxBus); });
      [0, .45, .9].forEach(d => noise(t + d, .2, .2, 5000, 'highpass', sfxBus));
    },
  };
  function play(name) { if (ctx && fx[name]) try { fx[name](); } catch {} }

  /* ---------- озвучка ---------- */
  const buf = {};
  let src = null, gen = 0, talking = 0, lipRaf = null, lipEl = null;
  function load(id) {
    if (buf[id]) return buf[id];
    const p = fetch('audio/' + id + '.m4a')
      .then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(a => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no)));
    buf[id] = p; p.catch(() => delete buf[id]);
    return p;
  }
  function duck(on) {
    talking = Math.max(0, talking + (on ? 1 : -1));
    if (musicOn) musicBus.gain.setTargetAtTime(talking ? DUCK_VOL : MUSIC_VOL, ctx.currentTime, talking ? .05 : .4);
    document.body.classList.toggle('talking', talking > 0);
    if (talking && !lipRaf) lip();
  }
  // губы попугая двигаются по громкости голоса
  const lipData = new Uint8Array(256);
  function lip() {
    analyser.getByteTimeDomainData(lipData);
    let sum = 0;
    for (let i = 0; i < lipData.length; i++) { const v = (lipData[i] - 128) / 128; sum += v * v; }
    const amp = Math.min(1, Math.sqrt(sum / lipData.length) * 6);
    document.documentElement.style.setProperty('--jaw', talking ? amp.toFixed(2) : 0);
    lipRaf = talking ? requestAnimationFrame(lip) : null;
    if (!talking) document.documentElement.style.setProperty('--jaw', 0);
  }
  function stop() {
    gen++;
    if (src) { try { src.stop(); } catch {} src = null; }
  }
  function playBuffer(b, talkEl) {
    return new Promise(res => {
      const s = ctx.createBufferSource();
      s.buffer = b; s.connect(voiceBus);
      duck(true);
      if (talkEl) talkEl.classList.add('talk');
      let done = false;
      const end = () => { if (done) return; done = true; if (src === s) src = null; duck(false); if (talkEl) talkEl.classList.remove('talk'); res(); };
      s.onended = end;
      // страховка: если звук не пошёл (браузер не дал), игра всё равно не зависнет
      setTimeout(end, b.duration * 1000 + 600);
      if (ctx.state !== 'running') ctx.resume();
      src = s; s.start(0);
    });
  }
  async function say(id, opts = {}) {
    if (!opts.keep) stop();
    const g = gen;
    try {
      const b = await load(id);
      if (g !== gen) return false;
      await playBuffer(b, opts.el);
    } catch { if (g !== gen) return false; }
    return g === gen;
  }
  // цепочка фраз; элемент el «говорит» (открывает рот) на фразах из списка talkIds
  async function seq(ids, opts = {}) {
    stop();
    const g = gen;
    for (const id of ids) {
      if (g !== gen) return false;
      await say(id, { keep: true, el: opts.talk && opts.talk[id] });
      if (opts.gap) await new Promise(r => setTimeout(r, opts.gap));
    }
    return g === gen;
  }
  function preload(ids) {
    let i = 0;
    const next = () => i < ids.length ? load(ids[i++]).catch(() => {}).then(next) : null;
    for (let k = 0; k < 4; k++) next();
  }

  return { init, startMusic, setMusic, get musicOn() { return musicOn; }, play, say, seq, stop, preload };
})();
