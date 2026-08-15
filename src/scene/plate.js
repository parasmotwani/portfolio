// The static track's scenery: the baked still of the same room the
// immersive track walks through (see scripts/bake-plates.mjs).
//
// Returned as a layered background rather than an <img>, so the scrim
// travels with the image and no stacking order has to be negotiated with
// the copy sitting on top of it.
export function plateStyle(room) {
  if (room == null) return undefined
  return {
    backgroundImage:
      `linear-gradient(rgba(13,11,8,0.86), rgba(13,11,8,0.94)), url(/plates/room-${room}.jpg)`,
  }
}
