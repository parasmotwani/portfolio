import { useLight } from '../context/LightContext'
import Reach from './Reach'

// The light switch is gone — this house predates switches. An iron hook
// waits on the entrance hall's right wall: hang your lantern on it and the
// candles take the flame one by one.
//
// The reach rides the hook's actual position in the scene, so it only
// exists while you are in the hall and looking at it. It used to be a
// fixed band down the right edge of the viewport, live on every room and
// every scroll position, which made the light feel like a page-wide toggle
// rather than an act you perform on an object.
// Hanging the lantern is ONE WAY. It used to toggle, and taking it back
// dropped the whole house to black — not just the hall. Deep in the manor
// that means every room, the boards, and the nav all vanish behind a
// full-page shade with only a small pool under the cursor, and the only
// way out is to scroll all the way back to a hook you cannot see. Lighting
// the house is something you do once.
export default function LanternHook() {
  const { lit, setLit } = useLight()

  if (lit) return null

  return (
    <Reach
      name="hook"
      onClick={() => setLit(true)}
      label="Hang the lantern on the iron hook"
      title="Hang the lantern"
    />
  )
}
