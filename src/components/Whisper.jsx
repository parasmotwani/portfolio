import { useEffect, useState } from 'react'
import { useLight } from '../context/LightContext'
import { journey, ROOMS } from '../scene/journey'

// ============================================================
// The guide, and the only one.
//
// Instructions used to be scattered: a mono line under the hero telling
// you to scroll, a caption under the notebook, a HUD on the machine, a
// hint in the corner. Four voices in three type styles, none of them the
// house's. Now there is one — this whisper, top-left, in the flavour
// italic, saying at most one thing at a time and only when there is
// something to say. Anything the room itself can express (the machine's
// glow, the ajar drawer) is left to the room.
// ============================================================

const HINTS = {
  hero: 'the hall is dark. there is an iron hook on the right-hand pillar — hang your lantern.',
  about: 'the hutch drawer sits ajar.',
  world: 'it still has power. press the screen.',
}

export default function Whisper() {
  const { lit } = useLight()
  const [room, setRoom] = useState(0)

  // journey.t changes every frame; only the integer part matters here, so
  // this sets state a handful of times over the whole visit
  useEffect(() => {
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const i = Math.max(0, Math.min(ROOMS.length - 1, Math.round(journey.t)))
      setRoom((prev) => (prev === i ? prev : i))
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const id = ROOMS[room]?.id
  // the hall's hint is about finding the light, so it retires once lit
  const hint = id === 'hero' && lit ? null : HINTS[id]

  return (
    <div className="corner-whisper" aria-hidden="true">
      they left in a hurry.<br />
      the machines kept running.
      {hint && <span className="whisper-hint">…{hint}</span>}
    </div>
  )
}
