// Mutable singleton shared between DOM components and the WebGL scene.
// Written by React event handlers, read per-frame in useFrame — never via state.
export const sceneState = {
  highlightCluster: -1, // skills row hover → cluster index, -1 = none
  mouse: { x: 0, y: 0 }, // normalized -1..1, fed by SceneCanvas pointer listener
}
