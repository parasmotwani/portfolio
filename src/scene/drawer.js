// The study drawer's open amount, 0..1, shared between the DOM (which
// starts the pull) and the scene (which animates it). Plain module state
// like journey and hotspots — nothing here may cause a React render.
export const drawer = { target: 0, at: 0 }
