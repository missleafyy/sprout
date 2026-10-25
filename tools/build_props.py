"""Regenerates game/art_props.js from tools/gen_props.py (overwrites hand edits to those grids!)."""
import re, subprocess, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
txt = subprocess.run(['python3', 'tools/gen_props.py'], capture_output=True, text=True).stdout
blocks = dict(re.findall(r"    (\w+): \[\n(.*?)\n    \],", txt, re.S))
rows = lambda n: blocks[n].replace('      ', '    ')
L = {
 'tree': "{ o: 'lf0', 1: 'lf1', 2: 'lf2', 3: 'lf3', 4: 'lf4', 5: 'lf5', k: 'bk0', a: 'bk1', b: 'bk2', B: 'bk3', s: 'gr2' }",
 'bush': "{ o: 'lf0', 1: 'lf1', 2: 'lf2', 3: 'lf3', 4: 'lf4', 5: 'lf5', s: 'gr2' }",
 'house': "{ o: 'ink', w: 'wl3', W: 'wl4', v: 'wl2', u: 'wl1', n: 'st2', N: 'st1', m: 'st1', f: 'wd1', F: 'wd2', q: 'gl1', Q: 'gl2', Z: 'gl3', S: 'st3', d: 'wd2', D: 'wd1', e: 'wd3', y: 'fy2', r: 'rf2', R: 'rf3', h: 'rf4', k: 'rf1', K: 'rf0' }",
 'sign': "{ o: 'ink', e: 'wd4', d: 'wd4', h: 'wd3', D: 'wd1', f: 'wd1', s: 'gr2' }",
 'fence': "{ o: 'st1', w: 'wh2', W: 'wh1', s: 'gr2' }",
 'mailbox': "{ o: 'ink', R: 'rf3', r: 'rf2', k: 'rf1', y: 'fy2', d: 'st2', D: 'st1', s: 'gr2' }",
 'rock': "{ o: 'st0', 1: 'st1', 2: 'st2', 3: 'st3', 4: 'st4', s: 'gr2' }",
}
size = {'tree': (32, 40), 'bush': (16, 16), 'house': (80, 80), 'sign': (16, 16), 'fence': (16, 16), 'mailbox': (16, 24), 'rock': (16, 16)}
out = ["// Sprout Town — outdoor props. Drafted with tools/gen_props.py (tools/build_props.py), then hand-tuned here.",
       "(function () {", "const S = Sprout;", ""]
for n, (w, h) in size.items():
    out.append(f"S.sprite('{n}', {{ w: {w}, h: {h}, origin: [0, {h}],\n  legend: {L[n]},\n  frames: {{ 0: [\n{rows(n)}\n  ] }} }});\n")
out.append(open('tools/props_tail.js').read())
open('game/art_props.js', 'w').write('\n'.join(out))
print('wrote game/art_props.js')
