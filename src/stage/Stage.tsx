import { Html, Line, Stars, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { MODEL_FILES, PLACES, type MachineId, type Place, type WorldId } from '../data/machines'
import { dirFromLatLon } from '../lib/geo'

export type StageView = 'home' | 'choose' | WorldId

export interface StageControl {
  rotate: (delta: number) => void
  zoom: (factor: number) => void
}

/** Pixels of the viewport covered by the header and the story panel. */
export interface StageInsets {
  top: number
  bottom: number
  start: number
  end: number
}

export interface StageProps {
  view: StageView
  insets: StageInsets
  machineId?: MachineId
  placeId?: string
  reducedMotion: boolean
  dir: 'ltr' | 'rtl'
  worldNames: Record<WorldId, string>
  control: RefObject<StageControl | null>
  onPickWorld: (world: WorldId) => void
  onPickPlace: (placeId: string) => void
  onReady: () => void
}

const FOV = 40
const TAN = Math.tan((FOV / 2) * (Math.PI / 180))
const ACCENT: Record<WorldId, string> = { moon: '#dfe8ff', mars: '#ffb07a', deep: '#c4b0ff' }
const RADIUS = { moon: 1, mars: 1.3 }
/** Radius of the sphere the camera frames when it visits a destination. */
const FIT: Record<WorldId, number> = { moon: 1.3, mars: 1.7, deep: 3.2 }

interface SceneLayout {
  moon: THREE.Vector3
  mars: THREE.Vector3
  deep: THREE.Vector3
  deepScale: number
  /** Half-width of the scene that must stay visible on the home view. */
  span: number
  /** Height the camera looks at on the home page and on the destination chooser. */
  lookY: number
  lookChoose: number
}

const LANDSCAPE: SceneLayout = {
  moon: new THREE.Vector3(-2.55, 0.25, 0),
  mars: new THREE.Vector3(2.6, 0.3, -0.5),
  deep: new THREE.Vector3(0.1, 1.9, -11),
  deepScale: 1,
  span: 4.5,
  lookY: -0.95,
  lookChoose: -0.05,
}

const PORTRAIT: SceneLayout = {
  moon: new THREE.Vector3(-1.05, 2.55, 0),
  mars: new THREE.Vector3(0.95, 1.6, -0.6),
  deep: new THREE.Vector3(-1.9, -0.9, -9),
  deepScale: 0.5,
  span: 2.6,
  lookY: 0.2,
  lookChoose: 0.9,
}

const layoutFor = (aspect: number) => (aspect < 0.95 ? PORTRAIT : LANDSCAPE)

interface Shared {
  anchors: Map<string, THREE.Object3D>
  /** Set once the visitor turns the globe: it then stops spinning by itself. */
  touched: boolean
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const shortest = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function setCursor(pointer: boolean) {
  document.body.style.cursor = pointer ? 'pointer' : ''
}

interface MarkerProps {
  place: Place
  position: THREE.Vector3
  /** Outward direction, in the parent's space. Omit for markers that face the camera. */
  normal?: THREE.Vector3
  size: number
  color: string
  state: 'idle' | 'related' | 'active'
  interactive: boolean
  /** Show the name without waiting for a hover. */
  named?: boolean
  reducedMotion: boolean
  sharedRef: RefObject<Shared>
  onPick: (placeId: string) => void
}

const Z_AXIS = new THREE.Vector3(0, 0, 1)

function Marker({ place, position, normal, size, color, state, interactive, named = false, reducedMotion, sharedRef, onPick }: MarkerProps) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const label = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const phase = useMemo(() => (place.id.length * 0.37) % 1, [place.id])
  const quaternion = useMemo(
    () => (normal ? new THREE.Quaternion().setFromUnitVectors(Z_AXIS, normal) : undefined),
    [normal],
  )

  useEffect(() => {
    const node = group.current
    if (!node) return
    const anchors = sharedRef.current.anchors
    anchors.set(place.id, node)
    return () => {
      anchors.delete(place.id)
    }
  }, [place.id, sharedRef])

  useEffect(() => () => setCursor(false), [])

  useFrame(({ clock, camera }) => {
    const node = group.current
    if (!node) return
    if (!normal && node.parent) {
      node.quaternion.copy(node.parent.getWorldQuaternion(scratchQ).invert()).multiply(camera.quaternion)
    }
    if (ring.current) {
      const pulse = state !== 'idle' && !reducedMotion ? (clock.elapsedTime * 0.6 + phase) % 1 : 0.35
      ring.current.scale.setScalar(1 + pulse * 1.6)
      const material = ring.current.material as THREE.MeshBasicMaterial
      material.opacity = state === 'idle' ? 0.35 : (1 - pulse) * 0.9
    }
    if (label.current && normal) {
      const world = node.getWorldPosition(scratchA)
      const facing = node.getWorldDirection(scratchB).dot(scratchC.copy(camera.position).sub(world).normalize())
      label.current.style.opacity = facing > 0.15 ? '1' : '0'
    }
  })

  const core = state === 'active' ? '#ffffff' : color
  const scale = state === 'active' ? 1.5 : state === 'related' ? 1.15 : 0.85
  const showLabel = interactive && (named || state === 'active' || hovered)

  return (
    <group ref={group} position={position} quaternion={quaternion}>
      <mesh scale={scale}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={core} toneMapped={false} />
      </mesh>
      <mesh ref={ring} position={[0, 0, size * 0.2]}>
        <ringGeometry args={[size * 1.5, size * 1.9, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      {interactive && (
        <mesh
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 6) return
            e.stopPropagation()
            onPick(place.id)
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            setHovered(true)
            setCursor(true)
          }}
          onPointerOut={() => {
            setHovered(false)
            setCursor(false)
          }}
        >
          <sphereGeometry args={[size * 4, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {showLabel && (
        <Html position={[0, 0, size * 3]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={label} className="marker-label" aria-hidden="true">
            {place.name}
          </div>
        </Html>
      )}
    </group>
  )
}

const scratchA = new THREE.Vector3()
const scratchB = new THREE.Vector3()
const scratchC = new THREE.Vector3()
const scratchQ = new THREE.Quaternion()

/** Scales a NASA model so that its largest half-extent equals `radius`. */
function useFittedModel(url: string, radius: number) {
  const { scene } = useGLTF(url, false, true)
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = (2 * radius) / Math.max(size.x, size.y, size.z)
    return { scene, scale, offset: center.multiplyScalar(-scale) }
  }, [scene, radius])
}

interface CommonProps {
  view: StageView
  machineId?: MachineId
  placeId?: string
  reducedMotion: boolean
  sharedRef: RefObject<Shared>
  onPickWorld: (world: WorldId) => void
  onPickPlace: (placeId: string) => void
}

function markerState(place: Place, machineId?: MachineId, placeId?: string): MarkerProps['state'] {
  if (place.id === placeId) return 'active'
  return machineId && place.machines.includes(machineId) ? 'related' : 'idle'
}

interface GlobeProps extends CommonProps {
  world: 'moon' | 'mars'
  label: string
  position: THREE.Vector3
  tilt: number
  speed: number
}

function Globe({ world, label, position, tilt, speed, view, machineId, placeId, reducedMotion, sharedRef, onPickWorld, onPickPlace }: GlobeProps) {
  const radius = RADIUS[world]
  const model = useFittedModel(MODEL_FILES[world], radius)
  const spin = useRef<THREE.Group>(null)
  const places = useMemo(
    () =>
      PLACES.filter((p) => p.world === world).map((place) => {
        const normal = new THREE.Vector3(...dirFromLatLon(place.lat!, place.lon!))
        return { place, normal, position: normal.clone().multiplyScalar(radius * 1.012) }
      }),
    [world, radius],
  )
  const overview = view === 'home' || view === 'choose'
  const here = view === world

  useFrame((_, dt) => {
    if (!spin.current || reducedMotion) return
    const still = here && (placeId !== undefined || sharedRef.current.touched)
    if (!still) spin.current.rotation.y += dt * speed
  })

  return (
    <group position={position} rotation={[0, 0, tilt]}>
      {/* The prime meridian of NASA's globes faces -X; a quarter turn brings it toward the camera. */}
      <group ref={spin} rotation={[0, Math.PI / 2, 0]}>
        <primitive
          object={model.scene}
          scale={model.scale}
          position={model.offset}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (!overview || e.delta > 6) return
            e.stopPropagation()
            onPickWorld(world)
          }}
          onPointerOver={() => overview && setCursor(true)}
          onPointerOut={() => setCursor(false)}
        />
        {places.map(({ place, normal, position: at }) => (
          <Marker
            key={place.id}
            place={place}
            position={at}
            normal={normal}
            size={radius * 0.013}
            color={ACCENT[world]}
            state={here ? markerState(place, machineId, placeId) : 'idle'}
            interactive={here}
            reducedMotion={reducedMotion}
            sharedRef={sharedRef}
            onPick={onPickPlace}
          />
        ))}
      </group>
      {view === 'choose' && <WorldLabel text={label} y={-radius * 1.22} />}
    </group>
  )
}

function WorldLabel({ text, y }: { text: string; y: number }) {
  return (
    <Html center position={[0, y, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className="world-label" aria-hidden="true">
        {text}
      </div>
    </Html>
  )
}

function SmallBody({ url, radius, position, speed, frozen, reducedMotion, children }: {
  url: string
  radius: number
  position: [number, number, number]
  speed: number
  frozen: boolean
  reducedMotion: boolean
  children?: React.ReactNode
}) {
  const model = useFittedModel(url, radius)
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (spin.current && !frozen && !reducedMotion) spin.current.rotation.y += dt * speed
  })
  return (
    <group position={position}>
      <group ref={spin}>
        <primitive object={model.scene} scale={model.scale} position={model.offset} />
        {children}
      </group>
    </group>
  )
}

const CERES: [number, number, number] = [-1.25, -0.35, 0]
const EROS: [number, number, number] = [1.25, -0.75, 0.4]
const VESTA: [number, number, number] = [-2.55, 0.95, -0.9]
const DAWN_ORBIT = 1.02

const circle = (radius: number, from = 0, to = Math.PI * 2, steps = 96) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
  })

interface DeepProps extends CommonProps {
  label: string
  position: THREE.Vector3
  scale: number
}

function DeepSpace({ label, position, scale, view, machineId, placeId, reducedMotion, sharedRef, onPickWorld, onPickPlace }: DeepProps) {
  const here = view === 'deep'
  const overview = view === 'home' || view === 'choose'
  const dawn = useRef<THREE.Group>(null)
  const erosModel = useFittedModel(MODEL_FILES.eros, 0.62)
  const place = (id: string) => PLACES.find((p) => p.id === id)!

  // NEAR Shoemaker rests on the surface: find the top of the model above its centre.
  const nearSpot = useMemo(() => {
    const probe = new THREE.Group()
    const copy = erosModel.scene.clone(true)
    copy.scale.setScalar(erosModel.scale)
    copy.position.copy(erosModel.offset)
    probe.add(copy)
    probe.updateMatrixWorld(true)
    const hit = new THREE.Raycaster(new THREE.Vector3(0.06, 2, 0.02), new THREE.Vector3(0, -1, 0)).intersectObject(probe, true)[0]
    return hit ? hit.point.clone() : new THREE.Vector3(0, 0.2, 0)
  }, [erosModel])
  const nearNormal = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame(({ clock }) => {
    if (!dawn.current) return
    const a = reducedMotion ? 0.9 : clock.elapsedTime * 0.22
    dawn.current.position.set(Math.cos(a) * DAWN_ORBIT, 0, Math.sin(a) * DAWN_ORBIT)
  })

  const common = { interactive: here, named: true, reducedMotion, sharedRef, onPick: onPickPlace, color: ACCENT.deep }
  const state = (id: string) => (here ? markerState(place(id), machineId, placeId) : 'idle')
  const origin = useMemo(() => new THREE.Vector3(), [])
  const orbit = useMemo(() => circle(DAWN_ORBIT), [])
  const keplerArc = useMemo(() => circle(1.5, -2.2, -0.9, 40), [])
  const p10 = useMemo(() => [new THREE.Vector3(-1.5, -0.7, 0.6), new THREE.Vector3(0, 0, 0)], [])
  const p11 = useMemo(() => [new THREE.Vector3(1.2, -1.1, 0.5), new THREE.Vector3(0, 0, 0)], [])

  return (
    <group position={position} scale={scale}>
      {/* A wide, invisible target so the far-away cluster is easy to pick from the overview. */}
      {overview && (
        <mesh
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 6) return
            e.stopPropagation()
            onPickWorld('deep')
          }}
          onPointerOver={() => setCursor(true)}
          onPointerOut={() => setCursor(false)}
        >
          <sphereGeometry args={[3, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <SmallBody url={MODEL_FILES.ceres} radius={0.6} position={CERES} speed={0.12} frozen={false} reducedMotion={reducedMotion} />
      <group position={CERES} rotation={[0.5, 0, 0.25]}>
        <Line points={orbit} color={ACCENT.deep} lineWidth={1} transparent opacity={0.45} />
        <group ref={dawn}>
          <Marker place={place('ceres')} position={origin} size={0.03} state={state('ceres')} {...common} />
        </group>
      </group>

      <SmallBody url={MODEL_FILES.vesta} radius={0.34} position={VESTA} speed={0.2} frozen={false} reducedMotion={reducedMotion} />

      <SmallBody url={MODEL_FILES.eros} radius={0.62} position={EROS} speed={0.16} frozen={here && placeId === 'eros'} reducedMotion={reducedMotion}>
        <Marker place={place('eros')} position={nearSpot} normal={nearNormal} size={0.03} state={state('eros')} {...common} />
      </SmallBody>

      <group position={[2.55, 1.35, -0.9]}>
        <Line points={p10} color={ACCENT.deep} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.08} gapSize={0.06} />
        <Marker place={place('pioneer-10')} position={origin} size={0.03} state={state('pioneer-10')} {...common} />
      </group>
      <group position={[-0.55, 1.95, -1.4]}>
        <Line points={p11} color={ACCENT.deep} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.08} gapSize={0.06} />
        <Marker place={place('pioneer-11')} position={origin} size={0.03} state={state('pioneer-11')} {...common} />
      </group>

      <group position={[0.35, -1.75, 0.6]}>
        <group position={[0.9, 1.2, 0]} rotation={[1.25, 0, 0]}>
          <Line points={keplerArc} color={ACCENT.deep} lineWidth={1} transparent opacity={0.3} />
        </group>
        <Marker place={place('kepler')} position={origin} size={0.03} state={state('kepler')} {...common} />
      </group>

      {view === 'choose' && <WorldLabel text={label} y={-2.7} />}
    </group>
  )
}

interface RigProps {
  view: StageView
  insets: StageInsets
  placeId?: string
  reducedMotion: boolean
  dir: 'ltr' | 'rtl'
  sharedRef: RefObject<Shared>
  controlRef: RefObject<StageControl | null>
}

function Rig({ view, insets, placeId, reducedMotion, dir, sharedRef, controlRef }: RigProps) {
  const { camera, size, gl } = useThree()
  const fill = useRef<THREE.DirectionalLight>(null)
  const rig = useRef({
    started: false,
    pos: new THREE.Vector3(0, 0, 14),
    tgt: new THREE.Vector3(),
    off: new THREE.Vector2(),
    mode: 'free' as 'free' | 'fly' | 'orbit',
    view: null as StageView | null,
    az: 0,
    pol: 0,
    dist: 6,
    azGoal: 0,
    polGoal: 0,
    zoom: 1,
    focus: undefined as string | undefined,
  })
  const focused = useRef<string | undefined>(undefined)
  const viewRef = useRef(view)
  useLayoutEffect(() => {
    viewRef.current = view
  }, [view])

  useLayoutEffect(() => {
    rig.current.focus = placeId
    if (placeId) rig.current.zoom = 1
  }, [placeId])

  useImperativeHandle(
    controlRef,
    () => ({
      rotate: (delta) => {
        rig.current.azGoal += delta
        sharedRef.current.touched = true
      },
      zoom: (factor) => {
        rig.current.zoom = clamp(rig.current.zoom * factor, 0.5, 1.7)
      },
    }),
    [sharedRef],
  )

  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    const zoomBy = (factor: number) => {
      rig.current.zoom = clamp(rig.current.zoom * factor, 0.5, 1.7)
    }
    const inWorld = () => viewRef.current !== 'home' && viewRef.current !== 'choose'

    const down = (e: PointerEvent) => {
      if (!inWorld()) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const move = (e: PointerEvent) => {
      const last = pointers.get(e.pointerId)
      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 1) {
        if (Math.abs(dx) + Math.abs(dy) < 0.5) return
        rig.current.azGoal -= dx * 0.006
        rig.current.polGoal = clamp(rig.current.polGoal + dy * 0.006, -1.25, 1.25)
        sharedRef.current.touched = true
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const span = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinch > 0 && span > 0) zoomBy(pinch / span)
        pinch = span
      }
    }
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      pinch = 0
    }
    const wheel = (e: WheelEvent) => {
      if (!inWorld()) return
      e.preventDefault()
      zoomBy(Math.exp(clamp(e.deltaY, -120, 120) * 0.0016))
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl, sharedRef])

  useFrame(({ clock }, dt) => {
    const r = rig.current
    const aspect = size.width / size.height
    const L = layoutFor(aspect)
    const ease = reducedMotion || !r.started ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 2.6)
    const goalOff = scratchOff.set(0, 0)

    if (view === 'home' || view === 'choose') {
      const d = Math.max(7.2, L.span / (TAN * aspect))
      const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.15) * 0.25
      const closer = view === 'choose' ? 0.94 : 1
      const look = view === 'choose' ? L.lookChoose : L.lookY
      goalPos.set(sway, look + 0.75, d * closer)
      goalTgt.set(0, look, -0.5)
      r.mode = 'free'
      r.pos.lerp(goalPos, ease)
      r.tgt.lerp(goalTgt, ease)
    } else {
      // Frame the destination inside the part of the screen the panel leaves free.
      const left = dir === 'rtl' ? insets.end : insets.start
      const right = dir === 'rtl' ? insets.start : insets.end
      const freeW = Math.max(120, size.width - left - right)
      const freeH = Math.max(120, size.height - insets.top - insets.bottom)
      const fitFrac = (Math.min(freeW, freeH) * 0.86) / size.height
      goalOff.set((2 * (left + freeW / 2)) / size.width - 1, 1 - (2 * (insets.top + freeH / 2)) / size.height)

      const anchor = r.focus ? sharedRef.current.anchors.get(r.focus) : undefined
      const bodyCenter = L[view]
      const deepFocus = view === 'deep' && anchor
      const center = deepFocus ? anchor.getWorldPosition(scratchA) : bodyCenter
      const fit = (deepFocus ? FIT.deep * 0.5 * L.deepScale : FIT[view] * (view === 'deep' ? L.deepScale : 1) * (anchor ? 0.82 : 1)) * r.zoom
      const d = fit / (TAN * fitFrac)

      if (r.view !== view) {
        const v = scratchB.copy(r.pos).sub(bodyCenter).normalize()
        r.azGoal = Math.atan2(v.x, v.z)
        r.polGoal = clamp(Math.asin(clamp(v.y, -1, 1)), -0.35, 0.35)
        r.mode = 'fly'
        r.zoom = 1
        sharedRef.current.touched = false
      }
      if (anchor && view !== 'deep' && r.focus !== focused.current) {
        const v = anchor.getWorldPosition(scratchB).sub(bodyCenter).normalize()
        r.azGoal = Math.atan2(v.x, v.z)
        r.polGoal = clamp(Math.asin(clamp(v.y, -1, 1)), -1.25, 1.25)
        focused.current = r.focus
      }
      if (!r.focus) focused.current = undefined

      const cp = Math.cos(r.polGoal)
      goalPos.set(Math.sin(r.azGoal) * cp, Math.sin(r.polGoal), Math.cos(r.azGoal) * cp).multiplyScalar(d).add(center)

      if (r.mode !== 'orbit') {
        r.pos.lerp(goalPos, ease)
        r.tgt.lerp(center, ease)
        if (r.pos.distanceTo(goalPos) < d * 0.03) {
          r.mode = 'orbit'
          r.az = r.azGoal
          r.pol = r.polGoal
          r.dist = d
        }
      } else {
        r.az += shortest(r.azGoal - r.az) * ease
        r.azGoal = r.az + shortest(r.azGoal - r.az)
        r.pol += (r.polGoal - r.pol) * ease
        r.dist += (d - r.dist) * ease
        r.tgt.lerp(center, ease)
        const c = Math.cos(r.pol)
        r.pos.set(Math.sin(r.az) * c, Math.sin(r.pol), Math.cos(r.az) * c).multiplyScalar(r.dist).add(r.tgt)
      }
    }

    r.view = view
    r.started = true
    r.off.lerp(goalOff, ease)
    camera.position.copy(r.pos)
    camera.lookAt(r.tgt)
    ;(camera as THREE.PerspectiveCamera).setViewOffset(
      size.width,
      size.height,
      (-r.off.x * size.width) / 2,
      (r.off.y * size.height) / 2,
      size.width,
      size.height,
    )
    if (fill.current) {
      fill.current.position.copy(r.pos)
      fill.current.target.position.copy(r.tgt)
      fill.current.target.updateMatrixWorld()
    }
  })

  return <directionalLight ref={fill} intensity={0.55} />
}

const goalPos = new THREE.Vector3()
const goalTgt = new THREE.Vector3()
const scratchOff = new THREE.Vector2()

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

function Scene(props: Omit<StageProps, 'control' | 'dir' | 'onReady' | 'worldNames' | 'insets'> & { sharedRef: RefObject<Shared>; worldNames: Record<WorldId, string> }) {
  const { size } = useThree()
  const L = layoutFor(size.width / size.height)
  const { worldNames, ...common } = props
  return (
    <>
      <Globe world="moon" label={worldNames.moon} position={L.moon} tilt={0.1} speed={0.05} {...common} />
      <Globe world="mars" label={worldNames.mars} position={L.mars} tilt={-0.42} speed={0.07} {...common} />
      <DeepSpace label={worldNames.deep} position={L.deep} scale={L.deepScale} {...common} />
    </>
  )
}

export default function Stage({ control, dir, insets, onReady, ...props }: StageProps) {
  const sharedRef = useRef<Shared>({ anchors: new Map(), touched: false })
  const inWorld = props.view !== 'home' && props.view !== 'choose'

  return (
    <Canvas
      className="stage-canvas"
      style={{ touchAction: inWorld ? 'none' : 'auto' }}
      camera={{ fov: FOV, near: 0.1, far: 400, position: [0, 0, 14] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#04060d']} />
      <ambientLight intensity={0.16} />
      <directionalLight position={[-7, 4, 9]} intensity={2.7} />
      <Stars radius={90} depth={50} count={3500} factor={3.2} saturation={0} fade speed={props.reducedMotion ? 0 : 0.5} />
      <Rig view={props.view} insets={insets} placeId={props.placeId} reducedMotion={props.reducedMotion} dir={dir} sharedRef={sharedRef} controlRef={control} />
      <Suspense fallback={null}>
        <Scene {...props} sharedRef={sharedRef} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

Object.values(MODEL_FILES).forEach((url) => useGLTF.preload(url, false, true))
