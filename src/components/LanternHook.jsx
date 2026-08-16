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
export default function LanternHook() {
  const { lit, setLit } = useLight()

  return (
    <Reach
      name="hook"
      onClick={() => setLit(!lit)}
      label={lit ? 'Take the lantern back from the hook' : 'Hang the lantern on the iron hook'}
      title={lit ? 'Take the lantern back' : 'Hang the lantern'}
    />
  )
}
