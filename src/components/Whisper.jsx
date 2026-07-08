import { useLight } from '../context/LightContext'

export default function Whisper() {
  const { lit } = useLight()
  return (
    <div className="corner-whisper" aria-hidden="true">
      they left in a hurry.<br />
      the machines kept running.
      {!lit && (
        <span className="whisper-hint">
          …the light is on the right side. feel the wall.
        </span>
      )}
    </div>
  )
}
