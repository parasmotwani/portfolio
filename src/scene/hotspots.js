// Where the interactive things in the manor are on screen, in pixels.
//
// Deliberately free of any three.js import. The DOM side (components/Reach)
// reads this, and if it pulled in the R3F component that writes it, three
// would land in the main entry chunk and every static visit would download
// ~1 MB of 3D to position a button. The writer lives in Hotspot.jsx, which
// only the scene imports.
//
// Mutable module state read from a rAF loop, like journey — nothing here
// may cause a React render per frame.
export const hotspots = Object.create(null)
