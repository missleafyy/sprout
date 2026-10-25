// Sprout engine — core: the two DS screens, drawing, main loop, scenes, script tasks.
// Everything lives on the global `Sprout` (alias S inside engine files).
(function () {
'use strict';
const S = window.Sprout = window.Sprout || {};

S.W = 256;            // DS screen size, per screen
S.H = 192;
S.TILE = 16;
S.frame = 0;          // global frame counter, 60 per second
S.params = new URLSearchParams(location.search);
S.state = { flags: {} };   // game save data lives here

// ---------------------------------------------------------------- drawing
S.Gfx = class Gfx {
  constructor(canvas) {
    canvas.width = S.W; canvas.height = S.H;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ox = 0; this.oy = 0;
  }
  camera(x = 0, y = 0) { this.ox = Math.round(x); this.oy = Math.round(y); }
  clear(c) { this.ctx.fillStyle = S.color(c); this.ctx.fillRect(0, 0, S.W, S.H); }
  rect(x, y, w, h, c) {
    if (w <= 0 || h <= 0) return;
    this.ctx.fillStyle = S.color(c);
    this.ctx.fillRect(Math.round(x) - this.ox, Math.round(y) - this.oy, Math.round(w), Math.round(h));
  }
  px(x, y, c) { this.rect(x, y, 1, 1, c); }
  // 1px rectangle outline
  frame(x, y, w, h, c) {
    this.rect(x, y, w, 1, c); this.rect(x, y + h - 1, w, 1, c);
    this.rect(x, y + 1, 1, h - 2, c); this.rect(x + w - 1, y + 1, 1, h - 2, c);
  }
  img(im, x, y) { this.ctx.drawImage(im, Math.round(x) - this.ox, Math.round(y) - this.oy); }
  // draw a sprite frame so that its origin lands on (x, y)
  spr(name, frame = 0, x = 0, y = 0, flip = false) {
    const s = S.sprites[name];
    if (!s) { S.warnOnce('no sprite ' + name); return; }
    const im = s.get(frame, flip);
    if (!im) return;
    const ox = flip ? s.w - s.origin[0] : s.origin[0];
    this.img(im, Math.round(x) - ox, Math.round(y) - s.origin[1]);
  }
  // filled pixel ellipse centred on (cx, cy)
  ellipse(cx, cy, rx, ry, c) {
    for (let dy = -ry; dy <= ry; dy++) {
      const t = dy / (ry + 0.5);
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t)));
      this.rect(cx - hw, cy + dy, hw * 2, 1, c);
    }
  }
  alpha(a, fn) { const p = this.ctx.globalAlpha; this.ctx.globalAlpha = a; fn(); this.ctx.globalAlpha = p; }
  text(str, x, y, opt) { return S.font.draw(this, str, x, y, opt); }
};

const warned = new Set();
S.warnOnce = msg => { if (!warned.has(msg)) { warned.add(msg); console.warn('[sprout] ' + msg); } };

// ---------------------------------------------------------------- scenes
// A scene is any object with optional enter(prev), exit(), update(), draw(top, bottom).
S.scene = null;
S.go = function (scene, transition) {
  const swap = () => {
    if (S.scene && S.scene.exit) S.scene.exit();
    const prev = S.scene;
    S.scene = scene;
    if (scene.enter) scene.enter(prev);
  };
  if (transition) S.ui.transition(transition, swap); else swap();
};

// ---------------------------------------------------------------- tasks (coroutines)
// S.run(function* () { yield* S.say('Hi!'); yield 30; ... })
//   yield N        wait N frames
//   yield fn       wait until fn() is true
//   yield task     wait for another task
//   yield          wait one frame
// Tasks with block:true (default) freeze player control while running.
S.tasks = [];
S.run = function (gen, opts = {}) {
  const t = {
    it: typeof gen === 'function' ? gen() : gen,
    wait: 0, until: null, done: false,
    block: opts.block !== false,
    name: opts.name || '',
  };
  S.tasks.push(t);
  return t;
};
S.busy = () => S.ui.blocking() || S.tasks.some(t => t.block && !t.done);

function stepTask(t) {
  if (t.wait > 0 && --t.wait > 0) return;
  if (t.until) { if (!t.until()) return; t.until = null; }
  for (let guard = 0; guard < 10000; guard++) {
    let r;
    try { r = t.it.next(); }
    catch (e) { console.error(e); t.done = true; return; }
    if (r.done) { t.done = true; return; }
    const v = r.value;
    if (typeof v === 'number') { if (v > 0) { t.wait = v; return; } continue; }
    if (typeof v === 'function') { if (v()) continue; t.until = v; return; }
    if (v && typeof v === 'object' && 'done' in v) { if (v.done) continue; t.until = () => v.done; return; }
    return;
  }
}

// ---------------------------------------------------------------- layout
// Integer-scales the two screens to fit the window.
S.layout = function () {
  const shell = document.getElementById('ds');
  const padX = 14, padY = 14, hinge = 18;      // in DS pixels (must match index.html)
  const sw = Math.floor((innerWidth - 16) / (S.W + padX * 2));
  const sh = Math.floor((innerHeight - 16) / (S.H * 2 + hinge + padY * 2));
  const s = Math.max(1, Math.min(sw, sh));
  document.documentElement.style.setProperty('--s', s);
  if (shell) shell.style.visibility = 'visible';
};

// ---------------------------------------------------------------- main loop
function step() {
  S.input.update();
  S.ui.update();
  for (const t of S.tasks.slice()) if (!t.done) stepTask(t);
  S.tasks = S.tasks.filter(t => !t.done);
  if (S.scene && S.scene.update) S.scene.update();
  S.audio.update();
  S.frame++;
}
function render() {
  S.top.camera(); S.bot.camera();
  if (S.scene && S.scene.draw) S.scene.draw(S.top, S.bot);
  S.top.camera(); S.bot.camera();
  S.ui.draw(S.top, S.bot);
}

S.boot = function (start) {
  S.top = new S.Gfx(document.getElementById('top'));
  S.bot = new S.Gfx(document.getElementById('bottom'));
  S.input.init(S.bot.canvas);
  S.layout();
  addEventListener('resize', S.layout);
  start();
  // test hooks: ?keys=R16,A,w30  scripted input   ?skip=N  fast-forward N frames
  if (S.params.get('keys')) S.input.script(S.params.get('keys'));
  const skip = +S.params.get('skip') || 0;
  for (let i = 0; i < skip; i++) { step(); render(); }   // render too: touch buttons are immediate-mode
  let last = performance.now(), acc = 0;
  const dt = 1000 / 60;
  function tick(now) {
    acc += Math.min(250, now - last); last = now;
    let n = 0;
    while (acc >= dt && n++ < 8) { step(); acc -= dt; }
    render();
    requestAnimationFrame(tick);
  }
  render();
  requestAnimationFrame(tick);
};

// small helpers used everywhere
S.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
S.pick = arr => arr[Math.floor(Math.random() * arr.length)];
S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// deterministic hash, used for tile variants and edge wobble
S.hash = (x, y, seed = 0) => {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
S.save = () => { try { localStorage.setItem('sprout-save', JSON.stringify(S.state)); return true; } catch (e) { return false; } };
S.load = () => { try { const d = localStorage.getItem('sprout-save'); if (d) { S.state = JSON.parse(d); return true; } } catch (e) {} return false; };
})();
