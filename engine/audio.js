// Sprout engine — audio: a tiny chip synth. Sound effects + a looping music sequencer.
//   S.sfx('blip')
//   S.music({ bpm: 120, tracks: [{ wave: 'pulse25', vol: 0.12, notes: 'C5.2 E5 G5.4 r.2 ...' }] })  or S.music('town') from S.songs
//   loop: false plays once (then: 'otherSong' continues with another song)
// Note tokens: <name><octave>[.len] where len is in 16th notes (default: previous length).
// Names: C C# D D# E F F# G G# A A# B, 'r' = rest. Wave: square pulse25 pulse12 triangle sine saw noise.
(function () {
'use strict';
const S = window.Sprout;

let ac = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
const waves = {};
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (n, oct) => 440 * Math.pow(2, (NOTE[n] + (oct + 1) * 12 - 69) / 12);

function pulse(duty) {
  const n = 64, re = new Float32Array(n), im = new Float32Array(n);
  for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ac.createPeriodicWave(re, im);
}
function osc(type, f, t) {
  const o = ac.createOscillator();
  if (waves[type]) o.setPeriodicWave(waves[type]); else o.type = type === 'saw' ? 'sawtooth' : type;
  o.frequency.setValueAtTime(f, t);
  return o;
}

const audio = S.audio = {
  muted: S.params.has('mute'),
  unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = audio.muted ? 0 : 0.8; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = 0.7; musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    waves.pulse25 = pulse(0.25); waves.pulse12 = pulse(0.125); waves.square = pulse(0.5);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (pending) { const p = pending; pending = null; audio.music(p); }
  },
  setMute(m) { audio.muted = m; if (master) master.gain.value = m ? 0 : 0.8; },

  // one note: { wave, f, f2 (slide to), dur, vol, at (delay s), attack, release, bus }
  tone(o) {
    if (!ac) return;
    const t = ac.currentTime + (o.at || 0), dur = o.dur || 0.1, vol = o.vol ?? 0.15;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + (o.attack ?? 0.005));
    g.gain.setValueAtTime(vol, t + Math.max(0.006, dur - (o.release ?? 0.04)));
    g.gain.linearRampToValueAtTime(0, t + dur);
    g.connect(o.bus || sfxBus);
    let src;
    if (o.wave === 'noise') {
      src = ac.createBufferSource(); src.buffer = noiseBuf;
      const f = ac.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.frequency.value = o.f || 3000;
      src.connect(f); f.connect(g);
    } else {
      src = osc(o.wave || 'pulse25', o.f || 440, t);
      if (o.f2) src.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
      src.connect(g);
    }
    src.start(t); src.stop(t + dur + 0.02);
  },

  sounds: {},
  define(name, fn) { audio.sounds[name] = fn; },
  play(name) { if (ac && audio.sounds[name]) audio.sounds[name](audio.tone); },

  // ---- music sequencer
  song: null,
  music(song) {
    if (typeof song === 'string') song = S.songs[song];
    if (!ac) { pending = song; return; }
    if (audio.song && audio.song.src === song) return;
    audio.stopMusic();
    if (!song) return;
    const sixteenth = 60 / song.bpm / 4;
    const tracks = song.tracks.map(tr => {
      const evs = []; let len = 2, pos = 0;
      for (const tok of tr.notes.trim().split(/\s+/)) {
        const m = tok.match(/^([A-Gr]#?)(\d?)(?:\.(\d+))?$/);
        if (!m) { console.warn('[sprout] bad note ' + tok); continue; }
        if (m[3]) len = +m[3];
        if (m[1] !== 'r') evs.push({ pos, len, f: freq(m[1], +m[2]) });
        pos += len;
      }
      return { tr, evs, total: pos, i: 0, loopStart: 0 };
    });
    audio.song = { src: song, tracks, sixteenth, t0: ac.currentTime + 0.1 };
  },
  stopMusic() { audio.song = null; },
  update() {
    const s = audio.song;
    if (!s || !ac) return;
    const ahead = ac.currentTime + 0.25;
    for (const t of s.tracks) {
      if (!t.evs.length) continue;
      for (let guard = 0; guard < 64; guard++) {
        const ev = t.evs[t.i];
        const when = s.t0 + (t.loopStart + ev.pos) * s.sixteenth;
        if (when > ahead) break;
        if (when >= ac.currentTime - 0.05) {
          const tr = t.tr;
          audio.tone({ wave: tr.wave, f: ev.f, dur: ev.len * s.sixteenth * (tr.gate || 0.9), vol: tr.vol ?? 0.08,
            at: when - ac.currentTime, attack: tr.attack ?? 0.01, release: tr.release ?? 0.05, bus: musicBus,
            filter: tr.filter });
        }
        if (++t.i >= t.evs.length) {
          t.i = 0; t.loopStart += t.total;
          if (s.src.loop === false) { t.evs = []; if (s.tracks.every(x => !x.evs.length)) { audio.song = null; if (s.src.then) audio.music(s.src.then); } break; }
        }
      }
    }
  },
};
let pending = null;
S.songs = {};
S.sfx = name => audio.play(name);
S.music = song => audio.music(song);

// ---- default sound effects (games can redefine any of these)
const D = audio.define;
D('blip', t => t({ wave: 'pulse25', f: 1320, dur: 0.03, vol: 0.05 }));
D('select', t => { t({ wave: 'pulse25', f: 988, dur: 0.05, vol: 0.09 }); t({ wave: 'pulse25', f: 1319, dur: 0.07, vol: 0.09, at: 0.05 }); });
D('cursor', t => t({ wave: 'pulse12', f: 1568, dur: 0.035, vol: 0.06 }));
D('cancel', t => { t({ wave: 'pulse25', f: 784, dur: 0.05, vol: 0.08 }); t({ wave: 'pulse25', f: 523, dur: 0.07, vol: 0.08, at: 0.05 }); });
D('bump', t => t({ wave: 'triangle', f: 140, f2: 90, dur: 0.09, vol: 0.25 }));
D('door', t => { t({ wave: 'noise', f: 900, dur: 0.12, vol: 0.12 }); t({ wave: 'triangle', f: 330, f2: 220, dur: 0.15, vol: 0.15, at: 0.02 }); });
D('step', t => t({ wave: 'noise', f: 2500, dur: 0.03, vol: 0.03 }));
D('grass', t => t({ wave: 'noise', f: 5000, filter: 'highpass', dur: 0.08, vol: 0.05 }));
D('hit', t => { t({ wave: 'noise', f: 1200, filter: 'lowpass', dur: 0.18, vol: 0.35 }); t({ wave: 'square', f: 220, f2: 70, dur: 0.15, vol: 0.12 }); });
D('faint', t => t({ wave: 'pulse25', f: 880, f2: 110, dur: 0.6, vol: 0.12 }));
D('heal', t => [523, 659, 784, 1047].forEach((f, i) => t({ wave: 'pulse25', f, dur: 0.08, vol: 0.08, at: i * 0.07 })));
D('levelup', t => [523, 659, 784, 659, 784, 1047].forEach((f, i) => t({ wave: 'pulse25', f, dur: 0.1, vol: 0.09, at: i * 0.09 })));
D('encounter', t => { for (let i = 0; i < 6; i++) t({ wave: 'square', f: i % 2 ? 1046 : 1318, dur: 0.06, vol: 0.06, at: i * 0.06 }); });
D('exclaim', t => { t({ wave: 'pulse25', f: 1568, dur: 0.06, vol: 0.08 }); t({ wave: 'pulse25', f: 2093, dur: 0.1, vol: 0.08, at: 0.06 }); });
D('save', t => [784, 988, 1175, 1568].forEach((f, i) => t({ wave: 'triangle', f, dur: 0.12, vol: 0.2, at: i * 0.08 })));
D('pop', t => t({ wave: 'sine', f: 600, f2: 1400, dur: 0.08, vol: 0.18 }));
D('coin', t => { t({ wave: 'pulse25', f: 1319, dur: 0.06, vol: 0.08 }); t({ wave: 'pulse25', f: 1976, dur: 0.2, vol: 0.08, at: 0.06 }); });
D('stamp', t => { t({ wave: 'noise', f: 600, filter: 'lowpass', dur: 0.12, vol: 0.4 }); t({ wave: 'triangle', f: 160, f2: 60, dur: 0.15, vol: 0.3 }); });
})();
