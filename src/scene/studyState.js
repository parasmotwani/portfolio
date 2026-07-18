// Shared refs between the Room I DOM (writes) and the 3D study (reads).
// p: 0..1 progress of the pinned study chapter. active: section on screen.
export const studyState = {
  p: 0,
  active: false,
}

if (typeof window !== 'undefined') window.__studyState = studyState
