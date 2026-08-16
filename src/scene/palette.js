// ============================================================
// One palette for the whole house.
//
// Rooms had drifted into their own tints — #c0b4a0 here, #bcb0a0 there,
// plaster greens in the study — which is why walking between them read as
// walking between different builds. Every room pulls its surfaces from
// here, and nothing sets a wall colour inline.
// ============================================================

export const WALL = '#c4b8a4'
export const WALL_BACK = '#cfc4b2'   // catches the light, so slightly warmer
export const FLOOR = '#b5a690'
export const CEIL = '#6e6152'
export const WOOD = '#a8906c'
export const WOOD_DARK = '#9c845f'
export const STONE = '#c9beac'
export const CRATE = '#b09878'
export const WAX = '#b8ac92'
export const IRON = '#b8a488'

// the only two light colours in the manor: cold moon, warm flame
export const MOON = '#cfdae8'
export const MOON_FILL = '#c8d4e2'
export const NIGHT_GLASS = '#8ea6c6'
export const FLAME_WARM = '#ffab5e'

// ink on the boards and sheets the rooms carry their copy on
export const INK = '#33240f'
export const INK_BODY = '#43301a'
export const INK_SOFT = '#5a4126'
export const INK_RULE = '#7a4a20'
export const INK_RED = '#7a2f22'

// Candle light is uniform across the house on purpose. These ranged from
// 1.0 to 2.4 with no logic to it, so identical candles read as "some are
// dull, some are dead" rather than as one kind of object. A candle flame
// lights at CANDLE_LIGHT over CANDLE_DIST; a mounted torch, being bigger,
// gets TORCH_*. Nothing else in a room emits.
export const CANDLE_LIGHT = 1.5
export const CANDLE_DIST = 10
export const TORCH_LIGHT = 1.9
export const TORCH_DIST = 13
