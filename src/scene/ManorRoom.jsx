import { Piece } from './toonify'
import { WALL, WALL_BACK, FLOOR as FLOOR_TINT, CEIL, MOON, MOON_FILL, NIGHT_GLASS } from './palette'

// ============================================================
// A room of the manor, assembled from the kit on the same 5.1u module the
// entrance hall uses. Every room shares this shell so they read as one
// building; what differs is the dressing hung inside it and the copy inked
// on its walls.
//
// The back wall always carries a doorway — that opening is what the camera
// walks through on its way to the next room, so it is structural, not
// decoration. `doorCol` picks which panel it lands in; rooms whose copy
// owns the centre of the back wall want it off to one side.
// ============================================================

const S = 1.275          // kit walls are 4u; scaled to a 5.1u module
const M = 5.1            // module
export const FLOOR = -2.4

export function cols(n, center = 0) {
  return Array.from({ length: n }, (_, i) => center + (i - (n - 1) / 2) * M)
}

export default function ManorRoom({
  xs,
  zs,
  doorCol,
  wallKinds,
  lit = false,
  dark = false,
  windowSide = 'left',
  windowRow = 0,
  tint = WALL,
  backTint = WALL_BACK,
  floorTint = FLOOR_TINT,
  ceilTint = CEIL,
  floor = 'floor_wood_large_dark',
  ceiling = true,
}) {
  const backZ = zs[0] - M / 2
  const leftX = xs[0] - M / 2
  const rightX = xs[xs.length - 1] + M / 2
  const winX = windowSide === 'left' ? leftX : rightX
  const winZ = zs[windowRow]
  const inward = windowSide === 'left' ? 1 : -1

  return (
    <group>
      {/* Every room gets the entrance hall's lighting model, not just its
          materials: weak cold moonlight through one arched window to shape
          the space, and nothing else that isn't a flame. Rooms lit only by
          their own candles came out near-black.
          A `dark` room opts out entirely — it is lit by whatever is standing
          in it and nothing else. */}
      <hemisphereLight args={['#8fa0b8', '#2c2820', dark ? 0.035 : (lit ? 0.3 : 0.15)]} />
      {!dark && (
        <>
          <directionalLight
            position={[winX, 1.6, winZ]}
            target-position={[winX + inward * 8, -2.4, winZ + 2]}
            color={MOON}
            intensity={lit ? 1.05 : 0.72}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[winX + inward * 0.6, 0.5, winZ]} color={MOON_FILL} intensity={lit ? 0.5 : 0.36} distance={11} decay={1.7} />
        </>
      )}
      {/* back wall — one panel of it is the way out */}
      {xs.map((x, i) => {
        const isDoor = i === doorCol
        const kind = isDoor ? 'wall_doorway' : (wallKinds?.[i] ?? 'wall')
        return (
          <Piece
            key={`b${i}`}
            file={kind}
            position={[x, FLOOR, backZ]}
            scale={S}
            tint={backTint}
            stripDoor={isDoor}
          />
        )
      })}

      {/* side walls — one panel is the arched window the moonlight comes
          through, so the light in the room has a visible source */}
      {zs.map((z, i) => (
        <Piece
          key={`l${i}`}
          file={!dark && windowSide === 'left' && i === windowRow ? 'wall_archedwindow_open' : (i === 0 ? 'wall_cracked' : 'wall')}
          position={[leftX, FLOOR, z]} rotation={[0, Math.PI / 2, 0]} scale={S} tint={tint}
        />
      ))}
      {zs.map((z, i) => (
        <Piece
          key={`r${i}`}
          file={!dark && windowSide === 'right' && i === windowRow ? 'wall_archedwindow_open' : (i === 1 ? 'wall_shelves' : 'wall')}
          position={[rightX, FLOOR, z]} rotation={[0, -Math.PI / 2, 0]} scale={S} tint={tint}
        />
      ))}

      {/* the night beyond the window */}
      {!dark && (
        <mesh position={[winX - inward * 0.12, 0.35, winZ]} rotation={[0, inward * Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 3.6]} />
          <meshBasicMaterial color={NIGHT_GLASS} toneMapped={false} />
        </mesh>
      )}

      {/* floor */}
      {xs.map((x) => zs.map((z) => (
        <Piece key={`f${x}:${z}`} file={floor} position={[x, FLOOR, z]} scale={S} tint={floorTint} />
      )))}

      {/* plank ceiling — the same boards hung upside down, plus beams */}
      {ceiling && xs.map((x) => zs.map((z) => (
        <Piece key={`c${x}:${z}`} file={floor} position={[x, 2.72, z]} rotation={[Math.PI, 0, 0]} scale={S} tint={ceilTint} anchor="none" />
      )))}
      {ceiling && zs.map((z) => (
        <mesh key={`beam${z}`} position={[0, 2.55, z - 0.75]} castShadow>
          <boxGeometry args={[(rightX - leftX), 0.24, 0.34]} />
          <meshStandardMaterial color="#241a10" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
