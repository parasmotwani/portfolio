// Shared refs between the hero DOM (writes) and the 3D room (reads).
// p: 0..1 progress of the pinned hero — 0..~0.45 look around,
// ~0.45..1 first-person walk to and through the door.
export const heroState = {
  p: 0,
  mouse: { x: 0, y: 0 }, // NDC -1..1
  active: true,          // false once the walk-out completes
}
