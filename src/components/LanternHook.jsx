import { useLight } from '../context/LightContext'

// The light switch is gone — this house predates switches. An iron hook
// waits on the right wall: hang your lantern on it and the room's candles
// take the flame one by one. Click again to take the lantern back.
// The hook itself is 3D (HeroRoom); this is the invisible reach for it,
// hidden in the dark like everything else until the beam finds it.
export default function LanternHook() {
  const { lit, setLit, lantern } = useLight()

  return (
    <button
      className={`lantern-hook-reach${lit ? ' hung' : ''}`}
      onClick={() => { if (lantern) setLit(!lit) }}
      aria-label={lit ? 'Take the lantern back from the hook' : 'Hang the lantern on the iron hook'}
      title={lit ? 'Take the lantern back' : lantern ? 'Hang the lantern' : 'Strike a light first'}
    />
  )
}
