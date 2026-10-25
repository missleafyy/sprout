// Sprout Town — songs. Note tokens: <note><octave>[.len in 16ths]; 'r' = rest. 16 sixteenths per bar.
(function () {
const S = Sprout;
const rep = (str, n) => Array(n).fill(str).join(' ');

S.songs.town = {
  bpm: 108,
  tracks: [
    { wave: 'pulse25', vol: 0.07, gate: 0.85, notes: `
      E5.4 G5.2 C6.2 B5.4 G5.4   A5.4 F5.2 A5.2 G5.8
      E5.4 G5.2 C6.2 D6.4 C6.2 B5.2   A5.6 B5.2 C6.8
      F5.4 A5.2 C6.2 B5.4 A5.4   G5.4 E5.2 G5.2 C6.8
      D6.4 C6.2 B5.2 A5.4 B5.4   C6.12 r.4` },
    { wave: 'pulse12', vol: 0.035, gate: 0.6, notes: `
      ${rep('C5.2 E5.2 G5.2 E5.2', 2)} ${rep('C5.2 F5.2 A5.2 F5.2', 2)}
      ${rep('C5.2 E5.2 G5.2 E5.2', 2)} ${rep('B4.2 D5.2 G5.2 D5.2', 2)}
      ${rep('C5.2 F5.2 A5.2 F5.2', 2)} ${rep('C5.2 E5.2 G5.2 E5.2', 2)}
      ${rep('B4.2 D5.2 G5.2 D5.2', 2)} ${rep('C5.2 E5.2 G5.2 E5.2', 2)}` },
    { wave: 'triangle', vol: 0.16, gate: 0.8, notes: `
      C3.4 G3.4 E3.4 G3.4   F3.4 C4.4 A3.4 C4.4
      C3.4 G3.4 E3.4 G3.4   G2.4 D3.4 B2.4 D3.4
      F3.4 C4.4 A3.4 C4.4   C3.4 G3.4 E3.4 G3.4
      G2.4 D3.4 B2.4 D3.4   C3.4 G3.4 C3.8` },
    { wave: 'noise', filter: 'highpass', vol: 0.025, gate: 0.3, notes: rep('r.2 C8.2', 64) },
  ],
};

S.songs.battle = {
  bpm: 168,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.9, notes: `
      A4.2 C5.2 E5.4 D5.2 C5.2 B4.4   C5.2 D5.2 F5.4 E5.2 D5.2 C5.4
      B4.2 D5.2 G5.4 F5.2 E5.2 D5.4   E5.4 G#5.4 B5.4 E6.4
      A5.4 G5.2 E5.2 C5.4 E5.4   F5.4 E5.2 C5.2 A4.8
      G5.4 F5.2 D5.2 B4.4 D5.4   E5.2 F5.2 G#5.2 A5.2 B5.4 E5.4` },
    { wave: 'pulse12', vol: 0.03, gate: 0.5, notes: `
      ${rep('E5.2 A5.2', 4)} ${rep('F5.2 A5.2', 4)} ${rep('D5.2 G5.2', 4)} ${rep('E5.2 G#5.2', 4)}
      ${rep('E5.2 A5.2', 4)} ${rep('F5.2 A5.2', 4)} ${rep('D5.2 G5.2', 4)} ${rep('E5.2 G#5.2', 4)}` },
    { wave: 'triangle', vol: 0.2, gate: 0.7, notes: `
      ${rep('A2.2 A3.2', 4)} ${rep('F2.2 F3.2', 4)} ${rep('G2.2 G3.2', 4)} ${rep('E2.2 E3.2', 4)}
      ${rep('A2.2 A3.2', 4)} ${rep('F2.2 F3.2', 4)} ${rep('G2.2 G3.2', 4)} ${rep('E2.2 E3.2', 4)}` },
    { wave: 'noise', filter: 'lowpass', vol: 0.12, gate: 0.25, notes: rep('C3.4 r.4 C3.2 C3.2 r.4', 8) },
    { wave: 'noise', filter: 'highpass', vol: 0.03, gate: 0.25, notes: rep('r.2 C8.2', 64) },
  ],
};

S.songs.victory = {
  bpm: 150, loop: false,
  tracks: [
    { wave: 'pulse25', vol: 0.08, notes: 'G5.2 G5.2 G5.2 G5.6 D#5.4 F5.4 G5.3 F5.1 G5.12 r.4' },
    { wave: 'pulse12', vol: 0.04, notes: 'D5.2 D5.2 D5.2 D5.6 C5.4 D5.4 D5.4 D5.12 r.4' },
    { wave: 'triangle', vol: 0.18, notes: 'G3.2 G3.2 G3.2 G3.6 D#3.4 F3.4 G3.4 G2.12 r.4' },
  ],
};

S.songs.title = {
  bpm: 96,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.9, notes: `
      G5.6 E5.2 C5.8   A5.6 G5.2 E5.8   F5.4 E5.4 D5.4 C5.4   D5.12 r.4
      G5.6 E5.2 C5.8   A5.6 G5.2 E5.8   F5.4 A5.4 G5.4 B4.4   C5.12 r.4` },
    { wave: 'triangle', vol: 0.16, notes: `
      C3.8 G3.8   F3.8 C4.8   D3.8 A3.8   G2.8 D3.8
      C3.8 G3.8   F3.8 C4.8   G2.8 B2.8   C3.8 G2.8` },
    { wave: 'pulse12', vol: 0.03, gate: 0.5, notes: rep('C6.2 G5.2 E5.2 G5.2', 16) },
  ],
};
})();
