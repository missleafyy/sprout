// red-roof home, teal-roof neighbour
S.recolor('house_teal', 'house', { r: 'rt2', R: 'rt3', h: 'rt4', k: 'rt1', K: 'rt0' });

S.prop('tree', { sprite: 'tree', fw: 2, fh: 2 });
S.prop('bush', { sprite: 'bush', talk: 'A round little shrub. It smells green.' });
S.prop('rock', { sprite: 'rock' });
S.prop('house', { sprite: 'house', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });
S.prop('house_teal', { sprite: 'house_teal', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });
S.prop('sign', { sprite: 'sign' });
S.prop('fence', { sprite: 'fence' });
S.prop('mailbox', { sprite: 'mailbox', talk: "It's a mailbox. Nothing inside but a dried leaf." });
})();
