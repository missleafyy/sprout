// Sprout engine — input: keyboard / gamepad mapped to DS buttons, mouse/touch on the bottom screen.
//   S.input.held('a')  S.input.pressed('a')  S.input.repeat('down')  S.input.consume('a')
//   S.input.touch -> { held, pressed, released, x, y, sx, sy }  (bottom-screen pixels)
(function () {
'use strict';
const S = window.Sprout;

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyZ: 'a', KeyJ: 'a', Space: 'a',
  KeyX: 'b', KeyK: 'b', Backspace: 'b',
  KeyC: 'x', KeyV: 'y', KeyQ: 'l', KeyE: 'r',
  Enter: 'start', ShiftLeft: 'select', ShiftRight: 'select',
};
const PAD = { 0: 'a', 1: 'b', 2: 'y', 3: 'x', 4: 'l', 5: 'r', 8: 'select', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'l', 'r', 'start', 'select'];
const DIRS = ['up', 'down', 'left', 'right'];

const keyHeld = new Set(), tapped = new Set();
const now = {}, prev = {}, frames = {}, eaten = new Set();
let dirOrder = [];          // most recently pressed direction last
let scriptQ = [], scriptHeld = new Set(), scriptTouch = null, wasScripted = false;
let ptr = { down: false, x: 0, y: 0 }, ptrTap = false;

const input = S.input = {
  touch: { held: false, pressed: false, released: false, x: 0, y: 0, sx: 0, sy: 0, tap: null },

  init(bottomCanvas) {
    addEventListener('keydown', e => {
      S.audio.unlock();
      const b = KEYS[e.code];
      if (!b) return;
      e.preventDefault();
      if (!keyHeld.has(b)) tapped.add(b);
      keyHeld.add(b);
    });
    addEventListener('keyup', e => { const b = KEYS[e.code]; if (b) keyHeld.delete(b); });
    addEventListener('blur', () => keyHeld.clear());
    const pos = e => {
      const r = bottomCanvas.getBoundingClientRect();
      ptr.x = Math.floor((e.clientX - r.left) / r.width * S.W);
      ptr.y = Math.floor((e.clientY - r.top) / r.height * S.H);
    };
    bottomCanvas.addEventListener('pointerdown', e => {
      S.audio.unlock(); pos(e); ptr.down = true; ptrTap = true;
      bottomCanvas.setPointerCapture(e.pointerId);
    });
    bottomCanvas.addEventListener('pointermove', pos);
    bottomCanvas.addEventListener('pointerup', e => { pos(e); ptr.down = false; });
    bottomCanvas.addEventListener('pointercancel', () => { ptr.down = false; });
    bottomCanvas.addEventListener('contextmenu', e => e.preventDefault());
  },

  update() {
    // scripted input (tests / demos)
    if (scriptQ.length) {
      const s = scriptQ[0];
      scriptHeld = new Set(s.buttons);
      scriptTouch = s.touch || null;
      if (--s.frames <= 0) scriptQ.shift();
    } else { scriptHeld.clear(); scriptTouch = null; }

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const padHeld = new Set();
    for (const p of pads) {
      if (!p) continue;
      p.buttons.forEach((b, i) => { if (b.pressed && PAD[i]) padHeld.add(PAD[i]); });
      if (p.axes[0] < -0.5) padHeld.add('left'); if (p.axes[0] > 0.5) padHeld.add('right');
      if (p.axes[1] < -0.5) padHeld.add('up'); if (p.axes[1] > 0.5) padHeld.add('down');
    }
    if (padHeld.size) S.audio.unlock();

    eaten.clear();
    for (const b of BUTTONS) {
      prev[b] = now[b];
      now[b] = keyHeld.has(b) || padHeld.has(b) || scriptHeld.has(b);
      const p = (now[b] && !prev[b]) || tapped.has(b);
      frames[b] = now[b] || p ? (p ? 1 : (frames[b] || 0) + 1) : 0;
      if (p && DIRS.includes(b)) dirOrder = dirOrder.filter(d => d !== b).concat(b);
    }
    tapped.clear();
    dirOrder = dirOrder.filter(d => now[d]);

    const t = input.touch;
    const down = scriptTouch ? true : (ptr.down || ptrTap);
    // a scripted touch releases where it was held (the real pointer may be anywhere)
    const x = scriptTouch ? scriptTouch[0] : wasScripted ? t.x : ptr.x, y = scriptTouch ? scriptTouch[1] : wasScripted ? t.y : ptr.y;
    wasScripted = !!scriptTouch;
    t.pressed = down && !t.held;
    t.released = !down && t.held;
    t.held = down;
    if (down || t.released) { t.x = x; t.y = y; }
    if (t.pressed) { t.sx = x; t.sy = y; t.tap = null; }
    if (t.released) t.tap = { x, y, sx: t.sx, sy: t.sy, age: 0 };
    else if (t.tap && ++t.tap.age > 20) t.tap = null;
    if (ptrTap && !ptr.down) ptrTap = false;   // a very quick click still counts for one frame
    else if (ptr.down) ptrTap = false;
  },

  held: b => !!now[b],
  pressed: b => frames[b] === 1 && !eaten.has(b),
  // true on press, then repeating while held (menus)
  repeat: b => !eaten.has(b) && (frames[b] === 1 || (frames[b] > 18 && frames[b] % 5 === 0)),
  consume(...bs) { for (const b of bs) eaten.add(b); },
  // the direction currently held (most recently pressed wins)
  dir: () => dirOrder.length ? dirOrder[dirOrder.length - 1] : null,
  anyPressed: () => BUTTONS.some(b => input.pressed(b)) || input.touch.pressed,
  // touch inside rect (bottom screen coords)
  touchIn(x, y, w, h, t = input.touch) { return t.x >= x && t.x < x + w && t.y >= y && t.y < y + h; },

  // "R16,w10,A,T128.96" — hold right 16 frames, wait 10, tap A, tap the touch screen at 128,96
  script(str) {
    for (const tok of str.split(',')) {
      const m = tok.trim().match(/^([A-Za-z]+)(\d*)(?:\.(\d+))?$/);
      if (tok[0] === 'T') { const [x, y] = tok.slice(1).split(/[.;]/).map(Number); scriptQ.push({ buttons: [], touch: [x, y], frames: 3 }, { buttons: [], frames: 2 }); continue; }
      if (!m) continue;
      const names = { U: 'up', D: 'down', L: 'left', R: 'right', A: 'a', B: 'b', X: 'x', Y: 'y', S: 'start', E: 'select' };
      const n = +m[2] || 0;
      if (m[1] === 'w') { scriptQ.push({ buttons: [], frames: n || 1 }); continue; }
      const btns = [...m[1]].map(c => names[c]).filter(Boolean);
      scriptQ.push({ buttons: btns, frames: n || 2 }, { buttons: [], frames: 2 });
    }
  },
};
})();
