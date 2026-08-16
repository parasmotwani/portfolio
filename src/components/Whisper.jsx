import { useLight } from '../context/LightContext'

export default function Whisper() {
  const { lit } = useLight()
  return (
    <div className="corner-whisper" aria-hidden="true">
      they left in a hurry.<br />
      the machines kept running.
      {!lit && (
        <span className="whisper-hint">
          …there's an iron hook on the right-hand pillar. hang your lantern.
        </span>
      )}
    </div>
  )
}
