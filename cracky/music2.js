// Cracky — area themes, leader/final battles, evolution and the ending (the Lot, trainer and title songs are in music.js).
(function () {
const S = Sprout;
const rep = (str, n) => Array(n).fill(str).join(' ');

// chords: [bass root, bass fifth, three arpeggio notes]
const CH = {
  A: ['A', 'E', ['A4', 'C#5', 'E5']], Am: ['A', 'E', ['A4', 'C5', 'E5']], Bb: ['A#', 'F', ['A#4', 'D5', 'F5']],
  Bm: ['B', 'F#', ['B4', 'D5', 'F#5']], C: ['C', 'G', ['C5', 'E5', 'G5']], Cmaj7: ['C', 'G', ['E5', 'G5', 'B5']],
  Cm: ['C', 'G', ['C5', 'D#5', 'G5']], Db: ['C#', 'G#', ['C#5', 'F5', 'G#5']], D: ['D', 'A', ['D5', 'F#5', 'A5']],
  Dm: ['D', 'A', ['D5', 'F5', 'A5']], Dm7: ['D', 'A', ['F5', 'A5', 'C6']], E: ['E', 'B', ['E5', 'G#5', 'B5']],
  Em: ['E', 'B', ['E5', 'G5', 'B5']], F: ['F', 'C', ['F4', 'A4', 'C5']], Fm: ['F', 'C', ['F4', 'G#4', 'C5']],
  Fdim: ['F#', 'C', ['F#4', 'A4', 'C5']], Fsm: ['F#', 'C#', ['F#4', 'A4', 'C#5']], G: ['G', 'D', ['G4', 'B4', 'D5']],
  G7: ['G', 'D', ['G4', 'B4', 'F5']], Gm: ['G', 'D', ['G4', 'A#4', 'D5']], Ab: ['G#', 'D#', ['G#4', 'C5', 'D#5']],
};
const prog = (chords, fn) => chords.trim().split(/\s+/).map(c => fn(...CH[c])).join(' ');

// Mall of the Future: bright 80s muzak in C, with a couple of chords that don't belong
const MALL = 'C Am F G  C Am Ab G  F G C Am  Bb C G C';
S.songs.mall = {
  bpm: 110,
  tracks: [
    { wave: 'pulse25', vol: 0.06, gate: 0.85, notes: `
      E5.4 G5.2 C6.2 B5.4 G5.4   A5.6 G5.2 E5.8   F5.4 A5.2 C6.2 B5.4 A5.4   G5.12 r.4
      E5.4 G5.2 C6.2 B5.4 G5.4   A5.6 C6.2 D6.8   G#5.4 D#5.2 C5.2 D#5.4 G#5.4   G5.12 r.4
      F5.2 F5.2 A5.4 G5.2 F5.2 E5.4   D5.4 E5.2 F5.2 G5.8   E5.2 E5.2 G5.4 F5.2 E5.2 D5.4   C5.4 D5.2 E5.2 A5.8
      A#5.4 A5.2 G5.2 F5.4 D5.4   E5.6 G5.2 C6.8   D6.4 B5.4 G5.4 D5.4   C5.12 r.4` },
    { wave: 'pulse12', vol: 0.026, gate: 0.5, notes: prog(MALL, (r, f, [a, b, c]) => rep(`${a}.2 ${b}.2 ${c}.2 ${b}.2`, 2)) },
    { wave: 'triangle', vol: 0.18, gate: 0.7, notes: prog(MALL, (r, f) => `${r}2.4 ${f}2.4 ${r}3.4 ${f}2.4`) },
    { wave: 'noise', filter: 'highpass', vol: 0.02, gate: 0.25, notes: rep('C8.2 C8.2 C8.4', 32) },
  ],
};

// Route 45 / E.T. Highway: windows down, D major
const ROUTE = 'D D Em D  D A Em D  G A Fsm Bm  G D A D';
S.songs.route = {
  bpm: 132,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.85, notes: `
      D5.2 F#5.2 A5.4 F#5.2 A5.2 B5.4   A5.6 F#5.2 D5.8   E5.2 G5.2 B5.4 A5.2 G5.2 E5.4   F#5.12 r.4
      D5.2 F#5.2 A5.4 F#5.2 A5.2 D6.4   C#6.6 B5.2 A5.8   G5.2 A5.2 B5.4 A5.2 G5.2 F#5.2 E5.2   D5.12 r.4
      B4.4 D5.4 G5.4 F#5.4   E5.6 D5.2 E5.8   A4.4 C#5.4 F#5.4 E5.4   D5.6 C#5.2 D5.8
      G5.4 B5.4 D6.4 B5.4   A5.6 F#5.2 D5.8   E5.2 F#5.2 G5.2 A5.2 B5.4 C#6.4   D6.12 r.4` },
    { wave: 'pulse12', vol: 0.028, gate: 0.45, notes: prog(ROUTE, (r, f, [a, b, c]) => rep(`r.2 ${b}.2`, 4)) },
    { wave: 'triangle', vol: 0.19, gate: 0.6, notes: prog(ROUTE, (r, f) => rep(`${r}2.2 ${r}3.2`, 3) + ` ${f}2.2 ${f}3.2`) },
    { wave: 'noise', filter: 'lowpass', vol: 0.09, gate: 0.25, notes: rep('C3.4 C8.2 C8.2 C3.2 C3.2 C8.4', 16) },
    { wave: 'noise', filter: 'highpass', vol: 0.018, gate: 0.2, notes: rep('C8.2', 128) },
  ],
};

// Garf's: a lazy diner shuffle in G
const GARF = 'G C G D  C G Am G  G C C G  G C D G';
S.songs.garf = {
  bpm: 100,
  tracks: [
    { wave: 'pulse25', vol: 0.062, gate: 0.8, notes: `
      G4.3 B4.1 D5.4 E5.3 D5.1 B4.4   C5.3 B4.1 A4.4 G4.8   G4.3 B4.1 D5.4 G5.3 F#5.1 E5.4   D5.12 r.4
      E5.3 F#5.1 G5.4 E5.3 D5.1 C5.4   B4.3 C5.1 D5.4 B4.8   A4.3 B4.1 C5.4 E5.3 D5.1 A4.4   G4.12 r.4
      B4.3 D5.1 G5.4 G5.3 A5.1 B5.4   A5.3 G5.1 E5.4 D5.8   C5.3 E5.1 G5.4 E5.3 C5.1 A4.4   B4.12 r.4
      G4.3 B4.1 D5.4 E5.3 D5.1 B4.4   C5.3 E5.1 A5.4 G5.8   D5.3 E5.1 F#5.4 A5.3 F#5.1 D5.4   G5.12 r.4` },
    { wave: 'pulse12', vol: 0.028, gate: 0.4, notes: prog(GARF, (r, f, [a, b, c]) => `r.4 ${b}.4 r.4 ${c}.4`) },
    { wave: 'triangle', vol: 0.19, gate: 0.6, notes: prog(GARF, (r, f) => `${r}2.4 ${f}2.4 ${r}2.4 ${f}2.3 ${f}2.1`) },
    { wave: 'noise', filter: 'highpass', vol: 0.022, gate: 0.25, notes: rep('C8.3 C8.1', 64) },
  ],
};

// Rhyolite Springs: a ghost-town waltz in A minor (3/4, 12 sixteenths a bar)
const GHOST = 'Am Am Am E  Am Dm E E  Am E Am Am  Dm Dm E Am';
S.songs.ghost = {
  bpm: 84,
  tracks: [
    { wave: 'pulse25', vol: 0.055, gate: 0.9, release: 0.2, notes: `
      A4.8 C5.4   E5.8 D#5.4   E5.12   r.12
      A4.8 C5.4   F5.8 E5.4   D#5.12   r.12
      C5.8 B4.4   A4.8 G#4.4   A4.4 B4.4 C5.4   E5.12
      F5.8 E5.4   D5.8 C5.4   B4.8 G#4.4   A4.12` },
    { wave: 'pulse12', vol: 0.024, gate: 0.6, notes: prog(GHOST, (r, f, [a, b, c]) => `r.4 ${b}.4 ${c}.4`) },
    { wave: 'triangle', vol: 0.17, gate: 0.5, notes: prog(GHOST, r => `${r}2.4 r.8`) },
    { wave: 'pulse12', vol: 0.014, gate: 0.3, notes: rep('r.12 r.12 r.6 E6.1 r.5 r.12', 4) },
  ],
};

// Residences at Tomorrow: elevator jazz with one wrong floor
const RES = 'Cmaj7 Cmaj7 Cmaj7 Fdim  Dm7 G7 Dm7 Fdim  Cmaj7 Cmaj7 Cmaj7 Fdim  Dm7 G7 Fdim G7';
const RES_A = `E5.2 G5.2 B5.4 r.2 B5.2 A5.4   G5.2 E5.2 C5.4 r.8   E5.2 G5.2 B5.4 r.2 B5.2 A5.4   G5.2 F#5.2 C5.4 r.8
      D5.2 F5.2 A5.4 r.2 A5.2 G5.4   F5.2 D5.2 B4.4 r.8`;
S.songs.residences = {
  bpm: 104,
  tracks: [
    { wave: 'pulse25', vol: 0.055, gate: 0.75, notes: `
      ${RES_A}   D5.2 F5.2 A5.4 r.2 C6.2 B5.4   A#5.12 r.4
      ${RES_A}   F#5.2 A5.2 C6.4 r.2 C6.2 A5.4   F#5.12 r.4` },
    { wave: 'pulse12', vol: 0.026, gate: 0.4, notes: prog(RES, (r, f, [a, b, c]) => `r.2 ${a}.2 r.4 ${c}.2 r.6`) },
    { wave: 'triangle', vol: 0.18, gate: 0.8, notes: prog(RES, (r, f, [a, b, c]) => `${r}2.4 ${f}2.4 ${r}3.4 ${f}2.4`) },
    { wave: 'noise', filter: 'highpass', vol: 0.02, gate: 0.2, notes: rep('C8.3 C8.1', 64) },
  ],
};

// Below Nevada: a low pulse in E, half-steps everywhere
const BELOW_ROOTS = ['E2', 'E2', 'E2', 'D#2', 'E2', 'E2', 'G2', 'G2', 'C3', 'C3', 'C3', 'A#2', 'G2', 'F2', 'E2', 'E2'];
S.songs.below = {
  bpm: 120,
  tracks: [
    { wave: 'pulse25', vol: 0.06, gate: 0.95, release: 0.15, notes: `
      E4.8 F4.8   E4.12 r.4   G4.8 F4.4 E4.4   D#4.12 r.4
      E4.8 F4.8   G4.8 A#4.8   B4.12 A#4.4   B4.12 r.4
      E5.4 r.4 D5.4 r.4   C5.8 B4.8   C5.4 r.4 B4.4 r.4   A#4.8 A4.8
      G4.8 F4.8   E4.8 F4.8   G4.4 F4.4 E4.4 D#4.4   E4.12 r.4` },
    { wave: 'triangle', vol: 0.2, gate: 0.55, notes: BELOW_ROOTS.map(n => rep(`${n}.2`, 8)).join(' ') },
    { wave: 'pulse12', vol: 0.02, gate: 0.3, notes: rep('B5.1 r.15 r.8 A#5.1 r.7', 8) },
    { wave: 'noise', filter: 'lowpass', vol: 0.14, gate: 0.3, notes: rep('C3.2 r.2 C3.2 r.10', 16) },
  ],
};

// gym leaders: D minor, faster and meaner than the trainer theme
const LEADER = 'Dm Dm Bb A  Dm Gm Gm A  Bb Gm C A  Dm C Bb A';
S.songs.leader = {
  bpm: 180,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.85, notes: `
      D5.2 D5.2 F5.2 D5.2 A5.4 G5.4   F5.2 E5.2 D5.2 E5.2 F5.4 A5.4   A#5.2 A#5.2 A5.2 G5.2 A5.4 F5.4   E5.2 C#5.2 E5.2 G5.2 A5.8
      D5.2 D5.2 F5.2 D5.2 A5.4 D6.4   C6.2 A#5.2 A5.2 G5.2 A5.4 F5.4   G5.2 A5.2 A#5.2 C6.2 D6.4 E6.4   F6.4 E6.4 D6.4 C#6.4
      D6.4 r.2 D6.2 C6.2 A#5.2 A5.4   A#5.4 r.2 A#5.2 A5.2 G5.2 F5.4   G5.4 r.2 G5.2 F5.2 E5.2 D5.4   E5.2 F5.2 G5.2 A5.2 A#5.4 C#6.4
      D6.2 A5.2 F5.2 A5.2 D6.2 A5.2 F5.2 A5.2   C6.2 G5.2 E5.2 G5.2 C6.2 G5.2 E5.2 G5.2
      A#5.2 F5.2 D5.2 F5.2 A5.2 E5.2 C#5.2 E5.2   D5.8 A4.4 C#5.4` },
    { wave: 'pulse12', vol: 0.03, gate: 0.5, notes: prog(LEADER, (r, f, [a, b, c]) => rep(`${a}.2 ${c}.2`, 4)) },
    { wave: 'triangle', vol: 0.2, gate: 0.7, notes: prog(LEADER, r => rep(`${r}2.2 ${r}3.2`, 4)) },
    { wave: 'noise', filter: 'lowpass', vol: 0.12, gate: 0.25, notes: rep('C3.4 r.4 C3.2 C3.2 r.4', 16) },
    { wave: 'noise', filter: 'highpass', vol: 0.02, gate: 0.2, notes: rep('C8.2', 128) },
  ],
};

// Head of Containment / HU-MAN, final: C minor, tritones, no mercy
const FINAL = 'Cm Cm Cm G  Ab Bb Ab G  Cm Db Cm G  Ab F G G';
S.songs.final = {
  bpm: 188,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.85, notes: `
      C5.2 C5.2 D#5.2 C5.2 G5.2 C5.2 F#5.4   G5.2 F5.2 D#5.2 D5.2 D#5.4 C5.4   C5.2 C5.2 D#5.2 C5.2 G5.2 C5.2 A#5.4   B5.4 G5.4 D5.4 B4.4
      C6.4 B5.2 G5.2 G#5.4 G5.4   F5.2 D#5.2 D5.2 D#5.2 F5.4 G5.4   G#5.4 G5.2 F5.2 D#5.4 D5.4   B4.2 D5.2 F5.2 G#5.2 B5.8
      C6.2 G5.2 D#5.2 G5.2 C6.2 G5.2 D#5.2 G5.2   C#6.2 G#5.2 F5.2 G#5.2 C#6.2 G#5.2 F5.2 G#5.2
      C6.2 G5.2 D#5.2 G5.2 C6.2 G5.2 D#5.2 G5.2   B5.2 G5.2 D5.2 G5.2 B5.2 G5.2 D5.2 F5.2
      D#6.4 D6.4 C6.4 A#5.4   G#5.4 G5.4 F5.4 D#5.4   D5.4 D#5.4 F5.4 G5.4   G5.4 B5.4 D6.4 F6.4` },
    { wave: 'pulse12', vol: 0.03, gate: 0.5, notes: prog(FINAL, (r, f, [a, b, c]) => rep(`${a}.1 ${b}.1 ${c}.1 ${b}.1`, 4)) },
    { wave: 'triangle', vol: 0.21, gate: 0.7, notes: prog(FINAL, r => rep(`${r}2.1 ${r}2.1 ${r}3.2`, 4)) },
    { wave: 'noise', filter: 'lowpass', vol: 0.13, gate: 0.25, notes: rep('C3.4 r.2 C3.2 r.4 C3.4', 16) },
    { wave: 'noise', filter: 'highpass', vol: 0.022, gate: 0.2, notes: rep('C8.2', 128) },
  ],
};

// evolution: a rising arpeggio, minor then major
S.songs.evolve = {
  bpm: 120,
  tracks: [
    { wave: 'pulse12', vol: 0.035, gate: 0.6, notes: ['A4 C5 E5 A5', 'F4 A4 C5 F5', 'D4 F4 A4 D5', 'E4 G#4 B4 E5',
      'F4 A4 C5 F5', 'G4 B4 D5 G5', 'A4 C#5 E5 A5', 'E5 G#5 B5 E6'].map(c => rep(c.split(' ').map(n => n + '.1').join(' '), 4)).join(' ') },
    { wave: 'pulse25', vol: 0.055, gate: 0.95, release: 0.2, notes: 'E5.16 C5.16 D5.8 F5.8 E5.16   A5.16 B5.16 C#6.16 B5.8 G#5.8' },
    { wave: 'triangle', vol: 0.18, gate: 0.9, notes: 'A2.16 F2.16 D2.16 E2.16 F2.16 G2.16 A2.16 E2.16' },
  ],
};

// the ending: the Lot's melody, in a major key, slower. Still in transit.
const ENDING = 'A A Fsm D  A E D A  Fsm D A E  Fsm D Bm E  A A Fsm D  A E D A  Fsm D A E  D Dm E A';
const END_A = `A4.4 C#5.2 E5.2 D5.4 C#5.4   A4.6 G#4.2 A4.8   C#5.4 E5.2 A5.2 F#5.4 E5.4   D5.12 r.4
      A4.4 C#5.2 E5.2 D5.4 C#5.4   A4.6 B4.2 C#5.8`;
S.songs.ending = {
  bpm: 84,
  tracks: [
    { wave: 'pulse25', vol: 0.055, gate: 0.9, release: 0.15, notes: `
      ${END_A}   D5.4 F#5.2 A5.2 G#5.4 E5.4   A5.12 r.4
      F#5.6 E5.2 C#5.8   D5.6 C#5.2 B4.8   C#5.4 E5.4 A5.4 G#5.4   B4.12 r.4
      F#5.6 E5.2 C#5.8   D5.6 E5.2 F#5.8   D5.4 C#5.4 B4.4 C#5.4   E5.12 r.4
      ${END_A}   D5.4 F#5.2 A5.2 G#5.4 B5.4   A5.12 r.4
      A4.8 C#5.8   D5.8 F#5.8   E5.8 A5.8   G#5.16
      F#5.8 E5.8   D5.8 C#5.8   B4.8 C#5.8   A4.16` },
    { wave: 'pulse12', vol: 0.024, gate: 0.55, notes: prog(ENDING, (r, f, [a, b, c]) => rep(`${a}.2 ${b}.2 ${c}.2 ${b}.2`, 2)) },
    { wave: 'triangle', vol: 0.17, gate: 0.85, notes: prog(ENDING, (r, f) => `${r}2.8 ${f}2.8`) },
  ],
};
})();
