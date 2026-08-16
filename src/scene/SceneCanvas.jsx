import { useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import EmberField from './EmberField'
import HeroRoom from './HeroRoom'
import StudyRoom from './StudyRoom'
import { SkillsRoom, GameRoom, ProjectsRoom, ExperienceRoom, ContactRoom } from './Rooms'
import CameraRig from './CameraRig'
import { journey, ROOMS } from './journey'
import { useDevice } from '../hooks/useDevice'
import { useLight } from '../context/LightContext'

// Which rooms are built at all. `visible` is flipped per frame by the rig,
// but a hidden room still costs its geometry and its GLB clones, so rooms
// far from the visitor are unmounted outright. The state only changes when
// the integer room index does — never per frame.
function useMountedRooms() {
  const [near, setNear] = useState(0)
  useFrame(() => {
    const i = Math.max(0, Math.min(ROOMS.length - 1, Math.round(journey.t)))
    if (i !== near) setNear(i)
  })
  return near
}

function Manor({ lit, lantern }) {
  const near = useMountedRooms()
  const on = (i) => Math.abs(i - near) <= 1

  return (
    <Suspense fallback={null}>
      {on(0) && <HeroRoom lit={lit} lantern={lantern} />}
      {on(1) && <StudyRoom lit={lit} />}
      {on(2) && <SkillsRoom lit={lit} />}
      {on(3) && <GameRoom lit={lit} />}
      {on(4) && <ProjectsRoom lit={lit} />}
      {on(5) && <ExperienceRoom lit={lit} />}
      {on(6) && <ContactRoom lit={lit} />}
    </Suspense>
  )
}

// Only ever mounted in immersive mode — App owns that gate, so there are
// no capability checks left in here.
export default function SceneCanvas() {
  const { dust } = useDevice()
  const { lit, lantern } = useLight()

  useEffect(() => {
    const onMove = (e) => {
      journey.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      journey.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="scene-canvas">
      <Canvas
        shadows
        camera={{ position: [0, -0.55, 6.6], fov: 58 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene, camera, raycaster }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.12
          // A hook for the verify harness. Asking "what is that dark band"
          // from the DOM side is unanswerable — every layer is transparent
          // because the thing is in the scene. This lets a test fire a ray
          // at a screen pixel and name the mesh it hits.
          if (typeof window !== 'undefined') {
            window.__camPos = () => camera.position.toArray().map((n) => +n.toFixed(2))
            window.__probe = (px, py) => {
              const r = gl.domElement.getBoundingClientRect()
              const ndc = new THREE.Vector2(
                ((px - r.left) / r.width) * 2 - 1,
                -((py - r.top) / r.height) * 2 + 1
              )
              raycaster.setFromCamera(ndc, camera)
              return raycaster.intersectObjects(scene.children, true).slice(0, 4).map((h) => ({
                name: h.object.name || h.object.type,
                dist: +h.distance.toFixed(2),
                mat: h.object.material?.type,
                colour: h.object.material?.color?.getHexString?.(),
                transparent: h.object.material?.transparent,
                opacity: h.object.material?.opacity,
                world: h.object.getWorldPosition(new THREE.Vector3()).toArray().map((n) => +n.toFixed(2)),
              }))
            }
          }
        }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#0d0b08']} />
        {/* Distance fades into the room's own dark instead of showing as
            flat black shapes. Looking through a doorway you can see three
            rooms down the line, and the geometry back there catches no
            light — which rendered as a hard-edged black band across the
            middle of the picture. Raycasting into it hit nothing for 11
            units and then a ceiling plane. Fog is the honest fix: the far
            room is still there, it just recedes. */}
        <fog attach="fog" args={['#0d0b08', 11, 34]} />
        <CameraRig />
        <Manor lit={lit} lantern={lantern} />
        <EmberField count={dust} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
          <Noise premultiply opacity={0.55} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
