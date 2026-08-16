// The game's own 2D canvas, shared with the scene so the arcade cabinet
// can show what is actually running on it.
//
// WorldGame draws an idle demo into this canvas whenever nobody is
// playing; the cabinet samples it as a texture. Without this the machine
// was a lit rectangle with nothing on it, which is a poor advertisement
// for the thing it is asking you to press.
//
// Plain module state, no three import — the DOM side sets it, the scene
// reads it, and neither pulls the other into its bundle.
export const screen = { canvas: null }
