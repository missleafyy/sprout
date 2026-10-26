// Sprout engine — world: tile maps, props, actors, grid movement, camera, y-sorted drawing.
//
//   S.tile('grass', { sprite: 'tiles', frames: ['grass0', 'grass1'] (random variants), anim: [...] (animated), solid })
//   S.prop('tree', { sprite: 'tree', fw: 2, fh: 2, solid: ['xx', 'xx'], talk: 'A sturdy tree.' })
//   S.map('town', { name, base: 'grass', legend: { '.': 'grass', '#': { terrain: 'path' }, 'T': { prop: 'tree' } },
//                   rows: [...], actors: [...], warps: [...], events: [...], enter: function* () {} })
//   S.world.load('town', x, y, 'down')
(function () {
'use strict';
const S = window.Sprout;
const T = 16;
const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
S.DIRV = DIRV; S.OPP = OPP;

S.tiles = {}; S.props = {}; S.maps = {};
S.tile = (name, def) => (S.tiles[name] = Object.assign({ name, solid: false }, def));
S.prop = (name, def) => (S.props[name] = Object.assign({ name, fw: 1, fh: 1, frame: 0 }, def));
S.map = (name, def) => (S.maps[name] = Object.assign({ name, base: 'grass', bg: '#000000' }, def));

// ---------------------------------------------------------------- actors
class Actor {
  constructor(o) {
    Object.assign(this, {
      id: '', sprite: 'player', dir: 'down', solid: true, visible: true, speed: 1,
      shadow: true, float: 0, anim: 'walk', talk: null, wander: 0, flip: false,
    }, o);
    this.homeX = this.x; this.homeY = this.y;
    this.px = this.x * T; this.py = this.y * T;
    this.fromX = this.x; this.fromY = this.y;
    this.moving = false; this.step = 0; this.stepCount = 0; this.t = S.rand(0, 200);
    this.wanderT = S.rand(60, 200);
  }
  get key() { return this.py + T + (this.keyBias || 0); }
  // begin a one-tile step; returns false if blocked
  go(dir, speed = this.speed, force = false) {
    this.dir = dir;
    const [dx, dy] = DIRV[dir];
    if (!force && S.world.blocked(this.x + dx, this.y + dy, this)) return false;
    this.fromX = this.x; this.fromY = this.y;
    this.x += dx; this.y += dy;
    this.moving = true; this.speed = speed; this.moveT = 0; this.stepCount++;
    return true;
  }
  face(dir) { if (this.anim === 'walk') this.dir = dir; }
  faceToward(a) {
    const dx = a.x - this.x, dy = a.y - this.y;
    this.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }
  update() {
    this.t++;
    if (!this.moving) return;
    const tx = this.x * T, ty = this.y * T;
    this.px += Math.sign(tx - this.px) * Math.min(this.speed, Math.abs(tx - this.px));
    this.py += Math.sign(ty - this.py) * Math.min(this.speed, Math.abs(ty - this.py));
    this.moveT++;
    if (this.px === tx && this.py === ty) { this.moving = false; this.fromX = this.x; this.fromY = this.y; if (this.onArrive) this.onArrive(this); }
  }
  // sprite frame name for the current pose
  frameName() {
    const s = S.sprites[this.sprite];
    if (this.anim === 'idle') {          // cycles idle0, idle1, ... at idleMs
      const n = s.names.filter(n => n.startsWith('idle')).length || 1;
      return 'idle' + (Math.floor(this.t / (this.idleRate || 30)) % n);
    }
    const d = this.dir === 'right' && !s.has('right0') ? 'left' : this.dir;
    let f = 0;
    if (this.moving || this.bumping) {
      const prog = this.moving ? (Math.abs(this.px - this.x * T) + Math.abs(this.py - this.y * T)) / T : (this.bumpT % 32) / 32;
      if (prog > 0.5 || this.bumping) f = this.stepCount % 2 ? 1 : 2;
      if (this.bumping && (this.bumpT % 32) >= 16) f = 0;
    }
    const name = d + f;
    return s.has(name) ? name : (s.has(d + '0') ? d + '0' : s.names[0]);
  }
  draw(g) {
    if (!this.visible) return;
    const s = S.sprites[this.sprite];
    const cx = this.px + T / 2, by = this.py + T;
    const bob = this.float ? Math.round(Math.sin(this.t / 20) * this.float) : 0;
    if (this.shadow) S.world.drawShadow(g, cx, by - 2, this.shadowW || 5);
    const f = this.frameName();
    const flip = this.flip || (this.dir === 'right' && !s.has('right0') && this.anim === 'walk');
    g.spr(this.sprite, f, cx, by - (this.lift || 0) + bob - this.jumpY(), flip);
  }
  jumpY() { return this.hop ? Math.round(Math.sin(this.hop.t / this.hop.d * Math.PI) * this.hop.h) : 0; }
}
S.Actor = Actor;

// ---------------------------------------------------------------- the world
const world = S.world = {
  map: null, cols: 0, rows: 0, cells: [], propList: [], actors: [], fx: [],
  player: null, follower: null, camX: 0, camY: 0,
  encounter: null,               // game hook: (world, cell) => void, called when a grass step rolls
  stepHooks: [],                 // fns called after the player finishes each step

  load(name, px, py, dir = 'down') {
    const def = S.maps[name];
    if (!def) throw new Error('no map ' + name);
    const map = world.map = def;
    world.mapId = name;
    world.rows = def.rows.length;
    world.cols = Math.max(...def.rows.map(r => r.length));
    world.cells = []; world.propList = []; world.fx = [];
    const covered = new Set();
    for (let y = 0; y < world.rows; y++) for (let x = 0; x < world.cols; x++) {
      const ch = def.rows[y][x] || ' ';
      let e = (def.legend || {})[ch];
      if (e == null) { if (ch !== ' ') S.warnOnce(`map ${name}: no legend for '${ch}'`); e = def.base; }
      if (typeof e === 'string') e = { tile: e };
      const cell = { x, y, ch, tile: S.tiles[e.tile || (e.terrain || e.prop ? (e.under || def.base) : def.base)], terrain: e.terrain || null, prop: null, data: e };
      if (e.tile && !S.tiles[e.tile]) S.warnOnce(`map ${name}: unknown tile ${e.tile}`);
      world.cells.push(cell);
      if (e.prop && !covered.has(x + ',' + y)) {
        const pd = S.props[e.prop];
        if (!pd) { S.warnOnce('unknown prop ' + e.prop); continue; }
        const inst = { def: pd, x, y, id: e.id };
        world.propList.push(inst);
        for (let j = 0; j < pd.fh; j++) for (let i = 0; i < pd.fw; i++) covered.add((x + i) + ',' + (y + j));
      }
    }
    for (const p of world.propList) for (let j = 0; j < p.def.fh; j++) for (let i = 0; i < p.def.fw; i++) {
      const c = world.cell(p.x + i, p.y + j);
      if (!c) continue;
      const m = p.def.solid ? (p.def.solid[j] || '')[i] : 'x';
      c.prop = p; c.propSolid = m === 'x'; c.door = m === 'D';
    }
    // actors
    world.actors = (def.actors || []).filter(a => !a.if || a.if()).map(a => new Actor(a));
    const pl = world.player;
    if (pl) {
      pl.x = px; pl.y = py; pl.px = px * T; pl.py = py * T; pl.fromX = px; pl.fromY = py;
      pl.dir = dir; pl.moving = false;
      world.actors.push(pl);
    }
    if (world.follower && pl) {
      const f = world.follower;
      f.x = pl.x; f.y = pl.y; f.px = pl.px; f.py = pl.py; f.fromX = f.x; f.fromY = f.y; f.moving = false; f.dir = dir;
      f.hidden = true;               // pops out on the first step
      world.actors.push(f);
    }
    world.snapCamera();
    if (map.music) S.music(map.music);
    if (map.enter) S.run(map.enter);
  },

  cell(x, y) { return x < 0 || y < 0 || x >= world.cols || y >= world.rows ? null : world.cells[y * world.cols + x]; },
  warpAt(x, y) { return (world.map.warps || []).find(w => w.x === x && w.y === y && (!w.if || w.if())); },
  actorAt(x, y, except) {
    return world.actors.find(a => a !== except && a.visible && !a.hidden && ((a.x === x && a.y === y) || (a.moving && a.fromX === x && a.fromY === y)));
  },
  blocked(x, y, who) {
    if (world.warpAt(x, y) && who === world.player) return false;
    const c = world.cell(x, y);
    if (!c) return true;
    if (c.tile && c.tile.solid) return true;
    if (c.terrain && S.terrains[c.terrain].solid) return true;
    if (c.propSolid) return true;
    if (who && who.ghost) return false;
    const a = world.actorAt(x, y, who);
    if (a && a.solid && !(who === world.player && a === world.follower)) return true;
    if (who && who !== world.player && who !== world.follower && who.homeX != null && who.wander) {
      if (Math.abs(x - who.homeX) > who.wander || Math.abs(y - who.homeY) > who.wander) return true;
    }
    return false;
  },
  get: id => world.actors.find(a => a.id === id),
  // spawn a temporary effect: { sprite, frames: [names], rate, x, y (world px), key, life, onDraw }
  effect(o) { const e = Object.assign({ t: 0, rate: 6, life: 30 }, o); world.fx.push(e); return e; },

  // ---------------------------------------------------------------- update
  update() {
    const busy = S.busy();
    const p = world.player;
    if (p && !busy && !p.moving) world.control(p);
    for (const a of world.actors) {
      if (a.hop) { if (++a.hop.t >= a.hop.d) a.hop = null; }
      a.update();
      if (a !== p && a !== world.follower && a.wander && !busy && !a.moving && --a.wanderT <= 0) {
        a.wanderT = S.rand(70, 220);
        const d = S.pick(['up', 'down', 'left', 'right']);
        if (Math.random() < 0.55) a.go(d); else a.face(d);
      }
    }
    if (p && p.bumping && !(S.input.dir() === p.dir && !busy)) p.bumping = false;
    if (p && p.bumping) { p.bumpT++; if (p.bumpT % 32 === 1) S.sfx('bump'); }
    for (const e of world.fx) e.t++;
    world.fx = world.fx.filter(e => e.t < e.life);
    world.updateCamera();
  },

  control(p) {
    const I = S.input;
    const d = I.dir();
    if (I.pressed('a')) { I.consume('a'); world.interact(); return; }
    if (!d) { p.turnWait = 0; p.walking = false; p.bumping = false; return; }
    if (d !== p.dir && !p.walking && !p.bumping) {      // tap to turn in place
      p.dir = d; p.turnWait = 7; return;
    }
    if (p.turnWait > 0) { p.turnWait--; return; }
    const run = I.held('b') && world.map.run !== false;
    const [dx, dy] = DIRV[d];
    const warp = world.warpAt(p.x + dx, p.y + dy);
    if (warp && (!warp.dir || warp.dir === d)) { world.startStep(p, d, run); world.doWarp(warp); return; }
    if (world.blocked(p.x + dx, p.y + dy, p)) {
      p.dir = d;
      if (!p.bumping) { p.bumping = true; p.bumpT = 0; }
      p.walking = false;
      return;
    }
    p.bumping = false;
    world.startStep(p, d, run);
  },
  startStep(p, d, run) {
    const fx = p.x, fy = p.y;
    if (!p.go(d, run ? 2 : 1, true)) return;
    p.walking = true;
    p.running = run;
    const f = world.follower;
    if (f) {
      if (f.hidden) { f.hidden = false; f.x = fx; f.y = fy; f.px = fx * T; f.py = fy * T; f.dir = d; }
      else if (f.x !== fx || f.y !== fy) {
        const ddx = fx - f.x, ddy = fy - f.y;
        if (Math.abs(ddx) + Math.abs(ddy) === 1) f.go(ddx > 0 ? 'right' : ddx < 0 ? 'left' : ddy > 0 ? 'down' : 'up', p.speed, true);
        else { f.x = fx; f.y = fy; f.px = fx * T; f.py = fy * T; }
      }
      f.speed = p.speed;
    }
    const c = world.cell(p.x, p.y);
    if (c && c.tile && c.tile.grass) world.rustle(p.x, p.y);
    p.onArrive = () => world.arrived(p);
  },
  arrived(p) {
    p.onArrive = null;
    const c = world.cell(p.x, p.y);
    for (const h of world.stepHooks) h(p, c);
    const ev = (world.map.events || []).find(e => e.step && e.x === p.x && e.y === p.y && (!e.if || e.if()));
    if (ev) { S.run(ev.step); return; }
    if (c && c.tile && c.tile.grass && world.encounter) world.encounter(world, c);
  },
  rustle(x, y) {
    S.sfx('grass');
    world.effect({ kind: 'rustle', cx: x, cy: y, life: 16 });
  },
  doWarp(w) {
    S.sfx('door');
    S.ui.transition('fade', () => {
      world.load(w.to, w.tx, w.ty, w.face || w.dir || world.player.dir);
      if (w.then) S.run(w.then);
    });
  },
  interact() {
    const p = world.player;
    const [dx, dy] = DIRV[p.dir];
    let tx = p.x + dx, ty = p.y + dy;
    let c = world.cell(tx, ty);
    // talk across counters
    if (c && c.data && c.data.counter) { tx += dx; ty += dy; c = world.cell(tx, ty); }
    const a = world.actorAt(tx, ty, p);
    if (a && a.talk) {
      S.run(function* () {
        const prev = a.dir;
        if (a.turnToTalk !== false) a.faceToward(p);
        if (typeof a.talk === 'function') yield* a.talk(a);
        else yield* S.say(...[].concat(a.talk), a.name ? { name: a.name } : {});
        if (a.turnBack) a.dir = prev;
      });
      return;
    }
    const ev = (world.map.events || []).find(e => e.talk && e.x === tx && e.y === ty && (!e.dir || e.dir === p.dir) && (!e.if || e.if()));
    if (ev) { S.run(typeof ev.talk === 'function' ? ev.talk : function* () { yield* S.say(...[].concat(ev.talk)); }); return; }
    if (c && c.prop && c.prop.def.talk) { const t = c.prop.def.talk; S.run(typeof t === 'function' ? t : function* () { yield* S.say(...[].concat(t)); }); }
  },

  // ---------------------------------------------------------------- camera
  camTarget() {
    const p = world.player;
    const mw = world.cols * T, mh = world.rows * T;
    let cx = p ? p.px + T / 2 - S.W / 2 : 0, cy = p ? p.py + T / 2 - S.H / 2 : 0;
    cx = mw <= S.W ? (mw - S.W) / 2 : S.clamp(cx, 0, mw - S.W);
    cy = mh <= S.H ? (mh - S.H) / 2 : S.clamp(cy, 0, mh - S.H);
    return [Math.round(cx), Math.round(cy)];
  },
  snapCamera() { [world.camX, world.camY] = world.camTarget(); },
  updateCamera() { if (!world.camLock) [world.camX, world.camY] = world.camTarget(); },

  // ---------------------------------------------------------------- drawing
  shadowCache: {},
  drawShadow(g, cx, y, rw) {
    // a soft pixel ellipse; darkens whatever is beneath (DS style)
    g.alpha(0.28, () => { g.rect(cx - rw + 1, y - 1, rw * 2 - 2, 3, '#10202a'); g.rect(cx - rw, y, rw * 2, 1, '#10202a'); });
  },
  tileFrame(tile, x, y) {
    if (tile.anim) return tile.anim[Math.floor((S.frame + (tile.animOffset ? (x * 7 + y * 3) * tile.animOffset : 0)) / (tile.rate || 30)) % tile.anim.length];
    if (tile.frames) {
      const h = S.hash(x, y, 3);
      const w = tile.weights;
      if (w) { let acc = 0, total = w.reduce((a, b) => a + b, 0); for (let i = 0; i < w.length; i++) { acc += w[i] / total; if (h < acc) return tile.frames[i]; } }
      return tile.frames[Math.floor(h * tile.frames.length)];
    }
    return tile.frame || 0;
  },
  draw(g) {
    const map = world.map;
    if (!map) return;
    g.clear(map.bg);
    g.camera(world.camX, world.camY);
    const x0 = Math.max(0, Math.floor(world.camX / T)), y0 = Math.max(0, Math.floor(world.camY / T));
    const x1 = Math.min(world.cols - 1, Math.floor((world.camX + S.W) / T)), y1 = Math.min(world.rows - 1, Math.floor((world.camY + S.H) / T) + 1);
    const list = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const c = world.cells[y * world.cols + x];
      if (c.tile && c.tile.sprite) {
        const f = world.rustling(x, y) && c.tile.rustle ? c.tile.rustle : world.tileFrame(c.tile, x, y);
        g.spr(c.tile.sprite, f, x * T, y * T);
        if (c.tile.over) list.push({ key: y * T + T + 0.5, draw: () => g.spr(c.tile.sprite, world.rustling(x, y) && c.tile.overRustle ? c.tile.overRustle : c.tile.over, x * T, y * T) });
      }
      if (c.terrain) {
        const t = S.terrains[c.terrain];
        let mask = 0;
        const same = (dx, dy) => { const n = world.cell(x + dx, y + dy); return !n || n.terrain === c.terrain || (t.joins && t.joins.includes(n.terrain)); };
        const M = S.terrainMask;
        if (same(0, -1)) mask |= M.N; if (same(1, 0)) mask |= M.E; if (same(0, 1)) mask |= M.S; if (same(-1, 0)) mask |= M.W;
        if (same(1, -1)) mask |= M.NE; if (same(1, 1)) mask |= M.SE; if (same(-1, 1)) mask |= M.SW; if (same(-1, -1)) mask |= M.NW;
        // variants: true picks a fill per cell (no animation); otherwise fills animate every t.ms
        const frame = t.variants ? Math.floor(S.hash(x, y, 31) * t.fillImgs.length) : Math.floor(S.frame / (t.ms / 16.67));
        g.img(S.terrainTile(c.terrain, mask, frame, x, y), x * T, y * T);
        if (t.decor) t.decor(g, x, y, mask, c);
      }
    }
    for (const p of world.propList) {
      const d = p.def, s = S.sprites[d.sprite];
      if (!s) continue;
      const bx = p.x * T, by = (p.y + d.fh) * T;
      if (bx + s.w < world.camX - 64 || bx > world.camX + S.W + 64 || by - s.h > world.camY + S.H + 32 || by < world.camY - 16) continue;
      const frame = d.anim ? d.anim[Math.floor(S.frame / (d.rate || 20)) % d.anim.length] : d.frame;
      if (d.flat) { g.spr(d.sprite, frame, bx + (d.ox || 0), by + (d.oy || 0)); continue; }
      list.push({ key: by + (d.keyBias || 0), draw: () => g.spr(d.sprite, frame, bx + (d.ox || 0), by + (d.oy || 0)) });
    }
    for (const a of world.actors) if (a.visible && !a.hidden) list.push({ key: a.key, draw: () => a.draw(g) });
    for (const e of world.fx) {
      if (e.kind === 'rustle') continue;
      list.push({ key: e.key ?? 99999, draw: () => {
        if (e.draw) return e.draw(g, e);
        g.spr(e.sprite, e.frames[Math.min(e.frames.length - 1, Math.floor(e.t / e.rate))], e.x, e.y);
      } });
    }
    list.sort((a, b) => a.key - b.key);
    for (const it of list) it.draw();
    if (map.drawOver) map.drawOver(g);
    g.camera(0, 0);
  },
  rustling(x, y) { return world.fx.some(e => e.kind === 'rustle' && e.cx === x && e.cy === y && e.t < 12); },
};
})();
