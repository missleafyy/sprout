// Cracky — songs (the wild battle + victory jingles come from game/music.js).
(function () {
const S = Sprout;
const rep = (str, n) => Array(n).fill(str).join(' ');

// The Lot: a lazy desert shuffle in A minor
S.songs.lot = {
  bpm: 96,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.85, notes: `
      A4.4 C5.2 E5.2 D5.4 C5.4   A4.6 G4.2 A4.8
      C5.4 E5.2 G5.2 F5.4 E5.4   D5.12 r.4
      A4.4 C5.2 E5.2 D5.4 C5.4   A4.6 G4.2 E4.8
      F4.4 A4.2 C5.2 B4.4 G#4.4  A4.12 r.4` },
    { wave: 'pulse12', vol: 0.028, gate: 0.5, notes: `
      ${rep('E5.2 A5.2', 4)} ${rep('E5.2 A5.2', 4)} ${rep('E5.2 G5.2', 4)} ${rep('D5.2 G5.2', 4)}
      ${rep('E5.2 A5.2', 4)} ${rep('E5.2 B5.2', 4)} ${rep('F5.2 A5.2', 4)} ${rep('E5.2 A5.2', 4)}` },
    { wave: 'triangle', vol: 0.18, gate: 0.75, notes: `
      A2.4 E3.4 A2.4 E3.4   A2.4 E3.4 A2.4 E3.4   C3.4 G3.4 C3.4 G3.4   G2.4 D3.4 G2.4 D3.4
      A2.4 E3.4 A2.4 E3.4   E2.4 B2.4 E2.4 B2.4   F2.4 C3.4 E2.4 B2.4   A2.4 E3.4 A2.8` },
    { wave: 'noise', filter: 'highpass', vol: 0.022, gate: 0.25, notes: rep('C8.3 C8.1 r.2 C8.2', 32) },
  ],
};

// trainer battles: faster, E minor, a little dramatic
S.songs.trainer = {
  bpm: 172,
  tracks: [
    { wave: 'pulse25', vol: 0.065, gate: 0.85, notes: `
      E5.2 E5.2 G5.2 E5.2 B5.4 A5.4   G5.2 F#5.2 E5.2 D5.2 E5.8
      C5.2 C5.2 E5.2 C5.2 G5.4 F#5.4  E5.2 D5.2 C5.2 D5.2 B4.8
      E5.2 E5.2 G5.2 E5.2 B5.4 C6.4   B5.2 A5.2 G5.2 A5.2 B5.8
      C6.4 B5.4 A5.4 G5.4   F#5.4 G5.4 A5.4 B5.4` },
    { wave: 'pulse12', vol: 0.03, gate: 0.5, notes: `
      ${rep('B4.2 E5.2', 8)} ${rep('C5.2 E5.2', 4)} ${rep('B4.2 D#5.2', 4)}
      ${rep('B4.2 E5.2', 8)} ${rep('C5.2 E5.2', 4)} ${rep('D#5.2 F#5.2', 4)}` },
    { wave: 'triangle', vol: 0.2, gate: 0.7, notes: `
      ${rep('E2.2 E3.2', 8)} ${rep('C2.2 C3.2', 4)} ${rep('B1.2 B2.2', 4)}
      ${rep('E2.2 E3.2', 8)} ${rep('A2.2 A3.2', 4)} ${rep('B1.2 B2.2', 4)}` },
    { wave: 'noise', filter: 'lowpass', vol: 0.12, gate: 0.25, notes: rep('C3.4 r.4 C3.2 C3.2 r.4', 8) },
    { wave: 'noise', filter: 'highpass', vol: 0.03, gate: 0.25, notes: rep('r.2 C8.2', 64) },
  ],
};

// title: slow, a little mysterious ("STILL IN TRANSIT")
S.songs.crackyTitle = {
  bpm: 84,
  tracks: [
    { wave: 'pulse25', vol: 0.06, gate: 0.9, notes: `
      E5.6 D5.2 B4.8   C5.6 D5.2 E5.8   G5.4 F#5.4 E5.4 D5.4   B4.12 r.4
      E5.6 D5.2 B4.8   C5.6 D5.2 E5.8   A5.4 G5.4 F#5.4 D#5.4  E5.12 r.4` },
    { wave: 'triangle', vol: 0.16, notes: `
      E2.8 B2.8   A2.8 C3.8   G2.8 D3.8   B1.8 F#2.8
      E2.8 B2.8   A2.8 C3.8   B1.8 D#2.8  E2.16` },
    { wave: 'pulse12', vol: 0.025, gate: 0.4, notes: rep('E6.2 B5.2 G5.2 B5.2', 16) },
  ],
};
})();
