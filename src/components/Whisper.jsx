import { useLight } from '../context/LightContext'

export default function Whisper() {
  const { lit, lantern } = useLight()
  return (
    <div className="corner-whisper" aria-hidden="true">
      they left in a hurry.<br />
      the machines kept running.
      {!lit && !lantern && (
        <span className="whisper-hint">
          …strike your lantern. click anywhere.
        </span>
      )}
      {!lit && lantern && (
        <span className="whisper-hint">
          …there's an iron hook on the right wall. hang the lantern.
        </span>
      )}
    </div>
  )
}
