import { useLight } from '../context/LightContext'

// Once the power is on, the old wiring isn't reliable — the whole house
// dims for a blink now and then (two layered animations so the rhythm
// never feels looped).
export default function HouseFlicker() {
  const { lit } = useLight()
  if (!lit) return null
  return <div className="house-flicker" aria-hidden="true" />
}
