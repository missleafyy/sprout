// Sprout engine — UI: framed boxes, typewriter dialog, choice menus, touch buttons, transitions.
//   yield* S.say('Hello!', 'Second page.', { name: 'Ivy', auto: 60 })   dialog on the top screen
//     options: name (name tag), keep (stay open after typing), auto (frames before auto-advance), speed
//   const i = yield* S.ask('Rest here?', ['Yes', 'No'])
//   if (S.ui.button(bot, 8, 8, 100, 40, 'FIGHT', 'red')) ...   immediate-mode touch button
//   S.ui.transition('fade' | 'white' | 'battle', () => { ...swap... })
(function () {
'use strict';
const S = window.Sprout;
const inp = () => S.input;

// rounded-corner insets per radius, row by row
const CUT = { 0: [], 1: [1], 2: [2, 1], 3: [3, 1, 1], 4: [4, 2, 1, 1], 5: [5, 3, 2, 1, 1], 6: [6, 4, 2, 2, 1, 1] };
function fillRound(g, x, y, w, h, r, c) {
  const cut = CUT[Math.min(r, 6)] || [];
  for (let j = 0; j < h; j++) {
    const k = Math.min(j, h - 1 - j);
    const ins = k < cut.length ? cut[k] : 0;
    g.rect(x + ins, y + j, w - ins * 2, 1, c);
  }
}

// box styles: bands from the outside in, then fill
const STYLES = {
  dialog: { r: 3, bands: ['#4b5675', '#b8cbe8', '#eef3fb'], fill: '#fbfbf7' },
  panel: { r: 3, bands: ['#3e4a62', '#7f93b8', '#dfe7f4'], fill: '#f4f6fa' },
  dark: { r: 3, bands: ['#1e1f2c', '#545a78'], fill: '#2d3044' },
  tag: { r: 2, bands: ['#4b5675', '#eef3fb'], fill: '#fbfbf7' },
  info: { r: 4, bands: ['#3d3a4a', '#f2eedc'], fill: '#fbf8ea' },
};
// button colour ramps: outline, dark, base, light, highlight
const BTN = {
  red: ['#5a1f2e', '#b8333c', '#e2504a', '#f58a6e', '#ffd0b8'],
  blue: ['#1f2a5a', '#2f5ec0', '#4a8ae8', '#7ab8f8', '#d0ecff'],
  green: ['#173a35', '#2a8a48', '#46b05a', '#7cd472', '#d4f8b8'],
  yellow: ['#5a3a1f', '#c08a20', '#ecb830', '#f8d860', '#fff4c0'],
  gray: ['#2e2e3e', '#6a6a82', '#9494aa', '#c0c0d0', '#f0f0f8'],
  pink: ['#5a1f4a', '#c04a8a', '#e872aa', '#f8a8cc', '#ffe0f0'],
  purple: ['#2e1f5a', '#6a48b8', '#8a6ad8', '#b49cf0', '#ece0ff'],
};

const ui = S.ui = {
  styles: STYLES, buttons: BTN, fillRound,

  box(g, x, y, w, h, style = 'dialog') {
    const st = typeof style === 'string' ? STYLES[style] : style;
    let r = st.r;
    st.bands.forEach((c, i) => { fillRound(g, x + i, y + i, w - i * 2, h - i * 2, Math.max(0, r - i), c); });
    const n = st.bands.length;
    fillRound(g, x + n, y + n, w - n * 2, h - n * 2, Math.max(0, r - n), st.fill);
  },

  // ---------------------------------------------------------------- dialog
  dialog: null,
  openDialog(pages, opts = {}) {
    const textW = 228;
    const pgs = pages.flatMap(p => String(p).split('{p}')).map(p => S.font.wrap(p.trim(), textW));
    ui.dialog = { pages: pgs, page: 0, top: 0, cur: 0, chars: 0, scroll: 0, state: 'type', opts, closed: false, t: 0 };
  },
  updateDialog() {
    const d = ui.dialog;
    if (!d || d.closed) return;
    d.t++;
    const lines = d.pages[d.page];
    const I = inp();
    const fast = I.held('a') || I.held('b');
    if (d.state === 'type') {
      if (I.pressed('a') || I.pressed('b') || I.touch.pressed) {   // finish both visible lines
        I.consume('a', 'b');
        d.cur = Math.min(d.top + 1, lines.length - 1);
        d.chars = S.font.length(lines[d.cur]);
      }
      const before = Math.floor(d.chars);
      d.chars += fast ? 2 : (d.opts.speed || 0.7);
      if (Math.floor(d.chars) !== before && Math.floor(d.chars) % 4 === 0) S.sfx('blip');
      if (d.chars >= S.font.length(lines[d.cur])) {
        d.chars = S.font.length(lines[d.cur]);
        if (d.cur < d.top + 1 && d.cur < lines.length - 1) { d.cur++; d.chars = 0; }
        else d.state = d.cur < lines.length - 1 ? 'more' : (d.opts.keep ? 'kept' : 'end');
      }
    } else if (d.state === 'more' || d.state === 'end') {
      d.wait = (d.wait || 0) + 1;
      if (I.pressed('a') || I.pressed('b') || I.touch.pressed || (d.opts.auto && d.wait > d.opts.auto)) {
        I.consume('a', 'b');
        d.wait = 0;
        if (d.state === 'more') { d.state = 'scroll'; d.scroll = 0; S.sfx('cursor'); }
        else if (d.page < d.pages.length - 1) { d.page++; d.top = 0; d.cur = 0; d.chars = 0; d.state = 'type'; S.sfx('cursor'); }
        else { d.closed = true; ui.dialog = null; S.sfx('cursor'); }
      }
    } else if (d.state === 'scroll') {
      d.scroll += 4;
      if (d.scroll >= 16) { d.scroll = 0; d.top++; d.cur = d.top + 1; d.chars = 0; d.state = 'type'; }
    }
  },
  closeDialog() { if (ui.dialog) { ui.dialog.closed = true; ui.dialog = null; } },
  drawDialog(g) {
    const d = ui.dialog;
    if (!d) return;
    const x = 2, y = 142, w = 252, h = 48;
    if (d.opts.name) {
      const nw = S.font.width(d.opts.name) + 14;
      ui.box(g, x + 6, y - 15, nw, 19, 'tag');
      g.text(d.opts.name, x + 13, y - 11, { color: d.opts.nameColor || 'blue' });
    }
    ui.box(g, x, y, w, h);
    const lines = d.pages[d.page];
    const ctx = g.ctx;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 4, w - 8, h - 8); ctx.clip();
    for (let i = d.top; i <= Math.min(d.cur, d.top + 2); i++) {
      const ly = y + 8 + (i - d.top) * 16 - d.scroll;
      g.text(lines[i], x + 11, ly, { count: i < d.cur ? undefined : Math.floor(d.chars) });
    }
    ctx.restore();
    if (d.state === 'more' || d.state === 'end') {
      const bob = Math.floor(d.t / 12) % 2;
      g.text('▼', x + w - 18, y + h - 16 + bob, { color: 'red' });
    }
  },

  // ---------------------------------------------------------------- choice menu
  menu: null,
  openMenu(options, opts = {}) {
    ui.menu = { options, i: opts.start || 0, opts, result: null, t: 0 };
    return ui.menu;
  },
  updateMenu() {
    const m = ui.menu;
    if (!m || m.result != null) return;
    m.t++;
    const I = inp();
    if (I.repeat('up')) { m.i = (m.i + m.options.length - 1) % m.options.length; S.sfx('cursor'); }
    if (I.repeat('down')) { m.i = (m.i + 1) % m.options.length; S.sfx('cursor'); }
    if (I.pressed('a')) { I.consume('a'); m.result = m.i; S.sfx('select'); }
    else if (I.pressed('b') && m.opts.cancel != null) { I.consume('b'); m.result = m.opts.cancel; m.i = m.opts.cancel; S.sfx('cancel'); }
  },
  drawMenu(top, bot) {
    const m = ui.menu;
    if (!m) return;
    const w = Math.max(...m.options.map(o => S.font.width(o))) + 30;
    const h = m.options.length * 16 + 12;
    const x = 254 - w, y = (ui.dialog ? 140 : 190) - h;
    ui.box(top, x, y, w, h);
    m.options.forEach((o, i) => {
      top.text(o, x + 20, y + 7 + i * 16);
      if (i === m.i) top.text('▶', x + 9, y + 7 + i * 16, { color: 'dark' });
    });
    // touch buttons on the bottom screen
    bot.alpha(0.55, () => bot.rect(0, 0, 256, 192, '#101018'));
    const bh = 36, gap = 8, total = m.options.length * (bh + gap) - gap;
    m.options.forEach((o, i) => {
      if (ui.button(bot, 40, 96 - total / 2 + i * (bh + gap), 176, bh, o, i === m.i ? 'blue' : 'gray', { selected: i === m.i }) && m.result == null) {
        m.i = i; m.result = i; S.sfx('select');
      }
    });
  },

  // ---------------------------------------------------------------- touch buttons (immediate mode)
  // Returns true on the frame a tap is released inside the button.
  button(g, x, y, w, h, label, color = 'blue', opts = {}) {
    const t = inp().touch;
    const inside = inp().touchIn(x, y, w, h) && inp().touchIn(x, y, w, h, { x: t.sx, y: t.sy });
    const down = t.held && inside && !opts.disabled;
    const ramp = BTN[opts.disabled ? 'gray' : color] || BTN.blue;
    const [ol, dk, base, lt, hi] = ramp;
    const r = opts.r ?? 5;
    const dy = down ? 2 : 0;
    // drop shadow / depth
    if (!down) fillRound(g, x, y + 2, w, h, r, ol);
    fillRound(g, x, y + dy, w, h, r, ol);
    fillRound(g, x + 1, y + 1 + dy, w - 2, h - 2, r - 1, down ? dk : base);
    // lighter upper half
    const ins = 2;
    fillRound(g, x + ins, y + ins + dy, w - ins * 2, Math.floor((h - ins * 2) / 2), r - 2, down ? base : lt);
    g.rect(x + r + 1, y + 2 + dy, w - (r + 1) * 2, 1, hi);       // gloss line
    g.rect(x + 3, y + h - 3 + dy, w - 6, 1, dk);                 // inner bottom shade
    if (opts.selected && Math.floor(S.frame / 20) % 2 === 0) {
      g.rect(x - 2, y - 2, w + 4, 1, '#fff8a0'); g.rect(x - 2, y + h + 3, w + 4, 1, '#fff8a0');
      g.rect(x - 2, y - 1, 1, h + 4, '#fff8a0'); g.rect(x + w + 1, y - 1, 1, h + 4, '#fff8a0');
    }
    if (opts.draw) opts.draw(g, x, y + dy, w, h);
    else if (label) g.text(label, x + w / 2, y + Math.floor(h / 2) - 4 + dy + (opts.labelDy || 0), { color: opts.textColor || 'white', align: 'center', shadow: ol });
    if (opts.disabled) return false;
    const tap = t.tap;
    if (tap && inp().touchIn(x, y, w, h, tap) && inp().touchIn(x, y, w, h, { x: tap.sx, y: tap.sy })) { t.tap = null; return true; }
    return false;
  },

  // ---------------------------------------------------------------- transitions
  trans: null,
  transition(type, mid, opts = {}) {
    const durs = { fade: [16, 16], white: [20, 20], battle: [80, 24], quick: [8, 10] };
    const [out, inn] = durs[type] || durs.fade;
    const tr = ui.trans = { type, t: 0, out: opts.out || out, in: opts.in || inn, hold: opts.hold ?? 6, mid, done: false, phase: 'out' };
    if (type === 'battle') S.sfx('encounter');
    return tr;
  },
  updateTrans() {
    const tr = ui.trans;
    if (!tr) return;
    tr.t++;
    if (tr.phase === 'out' && tr.t >= tr.out) {
      tr.phase = 'hold'; tr.t = 0;
      if (tr.mid) tr.mid();
    } else if (tr.phase === 'hold' && tr.t >= tr.hold) { tr.phase = 'in'; tr.t = 0; }
    else if (tr.phase === 'in' && tr.t >= tr.in) { tr.done = true; ui.trans = null; }
  },
  drawTrans(g) {
    const tr = ui.trans;
    if (!tr) return;
    const col = tr.type === 'white' ? '#ffffff' : '#08080c';
    const q = a => Math.round(a * 8) / 8;     // stepped, like hardware brightness fades
    if (tr.phase === 'hold') { g.rect(0, 0, 256, 192, col); return; }
    if (tr.phase === 'in') { g.alpha(q(1 - tr.t / tr.in), () => g.rect(0, 0, 256, 192, col)); return; }
    const p = tr.t / tr.out;
    if (tr.type === 'battle') {
      if (tr.t < 36) {   // two flashes
        const f = (tr.t % 18) / 18;
        g.alpha(q(Math.sin(f * Math.PI) * 0.85), () => g.rect(0, 0, 256, 192, '#ffffff'));
      } else {           // bars slide in from alternating sides
        const k = (tr.t - 36) / (tr.out - 36);
        for (let i = 0; i < 12; i++) {
          const w = Math.min(256, Math.max(0, k * 1.6 - i * 0.05) * 256);
          g.rect(i % 2 ? 256 - w : 0, i * 16, w, 16, col);
        }
      }
      return;
    }
    g.alpha(q(p), () => g.rect(0, 0, 256, 192, col));
  },

  // ---------------------------------------------------------------- frame hooks
  blocking: () => !!(ui.trans || ui.dialog || ui.menu),
  update() { ui.updateTrans(); if (!ui.trans) { if (ui.menu) ui.updateMenu(); else ui.updateDialog(); } },
  draw(top, bot) {
    ui.drawDialog(top);
    ui.drawMenu(top, bot);
    ui.drawTrans(top); ui.drawTrans(bot);
  },
};

// ---------------------------------------------------------------- script helpers
S.say = function* (...pages) {
  const opts = typeof pages[pages.length - 1] === 'object' ? pages.pop() : {};
  ui.openDialog(pages, opts);
  const d = ui.dialog;
  yield () => d.closed || d.state === 'kept';
};
S.ask = function* (question, options, opts = {}) {
  if (question) yield* S.say(question, Object.assign({ keep: true }, opts));
  const m = ui.openMenu(options, Object.assign({ cancel: options.length - 1 }, opts));
  yield () => m.result != null;
  ui.menu = null;
  ui.closeDialog();
  return m.result;
};
S.wipe = function* (type, mid, opts) { const tr = ui.transition(type, mid, opts); yield () => tr.done; };
})();
