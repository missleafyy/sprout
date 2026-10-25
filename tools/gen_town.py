"""Layout helper for the Sprout Town map. Prints JS rows for game/maps.js."""
W, H = 30, 28
m = [['.'] * W for _ in range(H)]
def R(x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            m[yy][xx] = c
def P(x, y, c): m[y][x] = c
# tree border (2x2 blocks on even coordinates)
R(0, 0, W, 2, 'T'); R(0, 26, W, 2, 'T'); R(0, 0, 2, H, 'T'); R(28, 0, 2, H, 'T')
# north meadow with tall grass
R(3, 3, 9, 5, '"'); R(17, 3, 9, 5, '"')
R(2, 2, 2, 2, 'T'); R(26, 2, 2, 2, 'T')
# hedge
R(2, 9, 26, 1, 'B'); R(13, 9, 2, 1, '#')
# paths
R(13, 3, 2, 19, '#'); R(3, 15, 24, 2, '#')
# houses + mailboxes
R(4, 12, 5, 3, 'H'); R(19, 12, 5, 3, 'G')
P(9, 14, 'M'); P(18, 14, 'M')
# signs
P(15, 4, 'S'); P(12, 17, 'S')
# garden
R(3, 18, 8, 1, 'F'); R(3, 19, 8, 2, '*'); R(4, 19, 2, 1, '+'); R(8, 20, 2, 1, '+')
# pond
for y in range(18, 25):
    for x in range(17, 28):
        if ((x + 0.5 - 22.5) / 5.0) ** 2 + ((y + 0.5 - 21.5) / 3.2) ** 2 <= 1: m[y][x] = '~'
P(17, 18, 'R'); P(26, 24, 'R')
# south-west tall grass + trees
R(3, 22, 7, 3, '"'); R(10, 22, 2, 2, 'T'); R(10, 24, 2, 2, 'T')
P(16, 11, 'B'); P(11, 11, 'B')
for y, r in enumerate(m):
    print(f"    '{''.join(r)}',")
