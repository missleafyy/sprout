// Sprout engine — art: named palette, text-grid sprites, recolours, autotiling terrain.
//
// Sprites are drawn as text grids, one character per pixel, '.' = transparent:
//   S.sprite('cat', { w: 16, h: 16, origin: [8, 16],
//     legend: { o: 'ink', f: 'fur2', F: 'fur1' },       // palette names or '#hex'
//     frames: {
//       idle0: [ '................', ... ],
//       idle1: { from: 'idle0', edits: [[3, 4, 'o']], parts: [{ x: 2, y: 1, rows: ['oo'] }], shift: [0, 1] },
//       right: { from: 'idle0', flip: true },
//     } });
(function () {
'use strict';
const S = window.Sprout;

S.pal = {};
S.palette = obj => Object.assign(S.pal, obj);
S.color = c => {
  if (c == null) return '#ff00ff';
  if (c[0] === '#' || c.startsWith('rgb')) return c;
  if (S.pal[c]) return S.pal[c];
  S.warnOnce('unknown colour ' + c);
  return '#ff00ff';
};
function rgba(c) {
  if (c == null) return [0, 0, 0, 0];
  let h = S.color(c).slice(1);
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
}

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
S.canvas = canvas;

// grid (array of strings) + legend -> canvas
function paint(grid, legend, w, h, name) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const cache = {};
  for (let y = 0; y < h; y++) {
    const row = grid[y] || '';
    for (let x = 0; x < w; x++) {
      const ch = row[x] || '.';
      if (ch === '.' || ch === ' ') continue;
      let col = cache[ch];
      if (!col) {
        if (!(ch in legend)) S.warnOnce(`sprite ${name}: '${ch}' not in legend`);
        col = cache[ch] = legend[ch] === null ? [0, 0, 0, 0] : rgba(legend[ch] || '#ff00ff');
      }
      img.data.set(col, (y * w + x) * 4);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

S.sprites = {};
class Sprite {
  constructor(name, def) {
    this.name = name;
    this.def = def;
    this.w = def.w; this.h = def.h;
    this.origin = def.origin || [0, 0];
    this.legend = def.legend || {};
    const fr = Array.isArray(def.frames) ? Object.fromEntries(def.frames.map((f, i) => [i, f])) : def.frames;
    this.names = Object.keys(fr);
    this.src = fr;
    this.grids = {};
    this.cache = {};
  }
  has(f) { return (typeof f === 'number' ? this.names[f] : f) in this.src; }
  // resolve a frame to a grid (array of row strings), applying from/edits/parts/shift/flip
  grid(f) {
    const key = typeof f === 'number' ? this.names[f] : f;
    if (this.grids[key]) return this.grids[key];
    const src = this.src[key];
    if (!src) { S.warnOnce(`sprite ${this.name}: no frame ${f}`); return null; }
    let g;
    if (Array.isArray(src)) {
      g = src.map(r => r.padEnd(this.w, '.'));
      if (src.length !== this.h) S.warnOnce(`sprite ${this.name}.${key}: ${src.length} rows, expected ${this.h}`);
      src.forEach((r, y) => { if (r.length !== this.w) S.warnOnce(`sprite ${this.name}.${key} row ${y}: width ${r.length}, expected ${this.w}`); });
    } else {
      g = src.from != null ? this.grid(src.from).slice() : Array(this.h).fill('.'.repeat(this.w));
      g = g.map(r => r.split(''));
      if (src.flip) g = g.map(r => r.reverse());
      if (src.shift) {
        const [dx, dy] = src.shift, n = Array.from({ length: this.h }, () => Array(this.w).fill('.'));
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
          const sx = x - dx, sy = y - dy;
          if (sx >= 0 && sy >= 0 && sx < this.w && sy < this.h) n[y][x] = g[sy][sx];
        }
        g = n;
      }
      for (const p of src.parts || []) p.rows.forEach((r, y) => [...r].forEach((c, x) => {
        if (c !== '.' && g[p.y + y] && p.x + x < this.w) g[p.y + y][p.x + x] = c === '_' ? '.' : c;
      }));
      for (const [x, y, c] of src.edits || []) if (g[y]) g[y][x] = c;
      g = g.map(r => r.join(''));
    }
    return (this.grids[key] = g);
  }
  get(f, flip = false) {
    const key = (typeof f === 'number' ? this.names[f] : f) + (flip ? '|f' : '');
    if (this.cache[key]) return this.cache[key];
    const g = this.grid(f);
    if (!g) return null;
    let c = paint(g, this.legend, this.w, this.h, this.name);
    if (flip) {
      const fc = canvas(this.w, this.h), x = fc.getContext('2d');
      x.translate(this.w, 0); x.scale(-1, 1); x.drawImage(c, 0, 0);
      c = fc;
    }
    return (this.cache[key] = c);
  }
}
S.Sprite = Sprite;
S.sprite = (name, def) => (S.sprites[name] = new Sprite(name, def));

// same grids, different colours:  S.recolor('npc_blue', 'player', { h: 'blue2', H: 'blue1' })
S.recolor = (name, base, legend, extra = {}) => {
  const b = S.sprites[base];
  return S.sprite(name, Object.assign({}, b.def, extra, { legend: Object.assign({}, b.def.legend, legend) }));
};

// sprite made in code: S.spriteFn('glow', 16, 16, (g /*Gfx-like ctx*/) => {...})
S.spriteFn = (name, w, h, fn, origin = [0, 0]) => {
  const c = canvas(w, h);
  fn(c.getContext('2d'));
  const s = S.sprite(name, { w, h, origin, frames: { 0: [] } });
  s.cache['0'] = c;
  return s;
};

// ---------------------------------------------------------------- terrain autotiles
// A terrain is a tileable 16x16 fill plus coloured edge bands, generated for every
// neighbour combination so paths, ponds and rugs get rounded, hand-looking borders.
//   S.terrain('path', { legend, fill: [rows] | [[rows], [rows]] (animated), ms: 400,
//     bands: { top: ['d1', 'd2'], bottom: ['d4'], left: ['d2'], right: ['d2'] },
//     radius: 4, wobble: 0.35, solid: false, variants: false (true = several fills picked per cell) })
S.terrains = {};
S.terrain = (name, def) => {
  const fills = Array.isArray(def.fill[0]) ? def.fill : [def.fill];
  S.terrains[name] = Object.assign({ name, radius: 4, wobble: 0.3, ms: 500, solid: false }, def, {
    fillImgs: fills.map(f => {
      const c = paint(f, def.legend, 16, 16, 'terrain ' + name);
      return c.getContext('2d').getImageData(0, 0, 16, 16).data;
    }),
    bandCols: Object.fromEntries(Object.entries(def.bands).map(([k, v]) => [k, v.map(rgba)])),
    cache: {},
  });
};
// mask bits: N E S W NE SE SW NW
const N = 1, E = 2, Sb = 4, W = 8, NE = 16, SE = 32, SW = 64, NW = 128;
S.terrainMask = { N, E, S: Sb, W, NE, SE, SW, NW };

S.terrainTile = (name, mask, frame, wx, wy) => {
  const t = S.terrains[name];
  frame = frame % t.fillImgs.length;
  // wobble depends on world position, but only for tiles that have an edge
  const edgy = (mask & 15) !== 15 || (mask & 240) !== 240;
  const key = mask + '|' + frame + (edgy && t.wobble ? '|' + wx + ',' + wy : '');
  if (t.cache[key]) return t.cache[key];
  const c = canvas(16, 16), ctx = c.getContext('2d'), img = ctx.createImageData(16, 16);
  const fill = t.fillImgs[frame], R = t.radius;
  const has = b => (mask & b) !== 0;
  // wobble: an edge pulls back by 1px on some 4px runs, keyed on world coordinates
  const bump = (along, side) => t.wobble && S.hash(Math.floor(along / 4), side * 9973, 7 + name.length) < t.wobble ? 1 : 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const px = x + 0.5, py = y + 0.5;
    let d = 99, side = null;
    const edge = (dist, s) => { if (dist < d) { d = dist; side = s; } };
    if (!has(N)) edge(py - bump(wx * 16 + x, wy * 4 + 1), 'top');
    if (!has(Sb)) edge(16 - py - bump(wx * 16 + x, wy * 4 + 2), 'bottom');
    if (!has(W)) edge(px - bump(wy * 16 + y, wx * 4 + 3), 'left');
    if (!has(E)) edge(16 - px - bump(wy * 16 + y, wx * 4 + 4), 'right');
    // rounded outer corners
    const corner = (cx, cy, s) => {
      const dd = R - Math.hypot(cx - px, cy - py);
      if (dd < d) { d = dd; side = s; }
    };
    if (!has(N) && !has(W) && px < R && py < R) corner(R, R, py < px ? 'top' : 'left');
    if (!has(N) && !has(E) && px > 16 - R && py < R) corner(16 - R, R, py < 16 - px ? 'top' : 'right');
    if (!has(Sb) && !has(W) && px < R && py > 16 - R) corner(R, 16 - R, 16 - py < px ? 'bottom' : 'left');
    if (!has(Sb) && !has(E) && px > 16 - R && py > 16 - R) corner(16 - R, 16 - R, 16 - py < 16 - px ? 'bottom' : 'right');
    // inner corners (neighbours present on both sides, missing diagonally)
    const inner = (cx, cy, s1, s2, dx, dy) => {
      const dd = Math.hypot(px - cx, py - cy) - 0.2;
      if (dd < d) { d = dd; side = dy < dx ? s1 : s2; }
    };
    if (has(N) && has(W) && !has(NW)) inner(0, 0, 'top', 'left', px, py);
    if (has(N) && has(E) && !has(NE)) inner(16, 0, 'top', 'right', 16 - px, py);
    if (has(Sb) && has(W) && !has(SW)) inner(0, 16, 'bottom', 'left', px, 16 - py);
    if (has(Sb) && has(E) && !has(SE)) inner(16, 16, 'bottom', 'right', 16 - px, 16 - py);
    if (d < 0) continue;
    const i = (y * 16 + x) * 4;
    const band = Math.floor(d);
    const cols = side && t.bandCols[side];
    if (cols && band < cols.length && cols[band]) img.data.set(cols[band], i);
    else img.data.set(fill.subarray(i, i + 4), i);
  }
  ctx.putImageData(img, 0, 0);
  return (t.cache[key] = c);
};
})();
