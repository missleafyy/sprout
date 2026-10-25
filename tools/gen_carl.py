"""Carl (player) 16x24: big alien head, baccwards cap, bow tie, blacc hoodie with gold trim. Prints JS frames."""
HEAD = {
 'down': [
  '................',
  '....oooooooo....',
  '..ooKccKKKKKoo..',
  '.oKccKKKKKKKKKo.',
  '.oKKKKKKKKKKKKo.',
  'oKKKKKoaaoKKKKKo',
  'oaLLaaaaaaaaaaAo',
  'oaaEEaaaaaaEEaAo',
  'oaEwEEaaaaEwEEAo',
  'oaEEGEaaaaEEGEAo',
  'oaEEGEaaaaEEGEAo',
  '.oaEEaaaaaaEEAo.',
  '..oAaaammaaaAo..',
  '...ooAAAAAAoo...',
 ],
 'up': [
  '................',
  '....oooooooo....',
  '..ooKccKKKKKoo..',
  '.oKccKKKKKKKKKo.',
  '.oKKKKKKKKKKKKo.',
  'oKKKKKKKKKKKKKKo',
  'oaKKKKKKKKKKKKAo',
  'oaLaoKKKKKKoaAAo',
  'oaaaaoKKKKoaaAAo',
  'oaaaaaooooaaaAAo',
  'oaaaaaaaaaaaaAAo',
  '.oaaaaaaaaaaAAo.',
  '..oAaaaaaaaAAo..',
  '...ooAAAAAAoo...',
 ],
 'left': [
  '................',
  '.....oooooooo...',
  '...ooKccKKKKKo..',
  '..oKccKKKKKKKKo.',
  '..oKKKKKKKKKKKKo',
  '.oKKKKKKKKKKKKKo',
  '.oaLLaaaaoKKKKKo',
  'oaLaaaaaaaoooooo',
  'oaEEaaaaaaaaaAo.',
  'oEwEEaaaaaaaaAo.',
  'oEEGEaaaaaaaaAo.',
  '.oEGEaaaaaaaAo..',
  '.oammaaaaaaAo...',
  '..ooAAAAAAoo....',
 ],
}
BODY = {
 'down': [
  '..ohYyyooyyYho..',
  '..ohhhhHHhhhHo..',
  '.ohohhhHHhhhoHo.',
  '.ogohhhHHhhhogo.',
  '..oggggggggggo..',
 ],
 'up': [
  '...ohhhhhhhhHo..',
  '..ohhhhhhhhhHo..'[:16],
  '.oHohhhhhhhhoHo.',
  '.ogohhhhhhhhogo.',
  '..oggggggggggo..',
 ],
 'left': [
  '....ohhyYhho....',
  '....ohhhhHHo....',
  '....ohahhHHo....',
  '....ohaohHHo....',
  '....oggggggo....',
 ],
}
LEGS = {
 'down': ['...opppoopppo...', '...opPo..oPpo...', '...okko..okko...', '...oooo..oooo...'],
 'up':   ['...opppoopppo...', '...opPo..oPpo...', '...okko..okko...', '...oooo..oooo...'],
 'left': ['....oppppPPo....', '....oppopPPo....', '....okkookko....', '....oooooooo....'],
}
for d in ('down', 'up', 'left'):
    g = HEAD[d] + BODY[d] + LEGS[d] + ['................']
    assert len(g) == 24, (d, len(g))
    for i, r in enumerate(g): assert len(r) == 16, (d, i, r, len(r))
    print(f"    {d}0: [\n" + "\n".join(f"      '{r}'," for r in g) + "\n    ],")
