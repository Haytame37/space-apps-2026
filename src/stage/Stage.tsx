import { Html, Line, Stars, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { MODEL_FILES, PLACES, type MachineId, type Place, type WorldId } from '../data/machines'
import { dirFromLatLon } from '../lib/geo'
import { modelBounds } from '../lib/modelBounds'

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
  /** True while another view covers the whole scene: nothing is drawn. */
  paused?: boolean
}

const FOV = 40
const TAN = Math.tan((FOV / 2) * (Math.PI / 180))
const ACCENT: Record<WorldId, string> = { moon: '#dfe8ff', mars: '#ffb07a', deep: '#c4b0ff' }
const RADIUS = { moon: 1, mars: 1.3 }
/** Radius of the sphere the camera frames when it visits a destination. */
const FIT: Record<WorldId, number> = { moon: 1.1, mars: 1.42, deep: 3.2 }

interface SceneLayout {
  moon: THREE.Vector3
  mars: THREE.Vector3
  deep: THREE.Vector3
  deepScale: number
  /** Centre and half-extents of the box the overview has to keep on screen. */
  centre: THREE.Vector2
  halfWidth: number
  halfHeight: number
  /** Air kept around the box (1 = the box touches the screen edges). */
  margin: number
  /** The page's text sits over the scene instead of below it: frame the whole screen. */
  isBehindText?: boolean
}

const LANDSCAPE: SceneLayout = {
  moon: new THREE.Vector3(-2.55, 0.25, 0),
  mars: new THREE.Vector3(2.6, 0.3, -0.5),
  deep: new THREE.Vector3(0.1, 1.9, -11),
  deepScale: 1,
  centre: new THREE.Vector2(0.15, 0.35),
  halfWidth: 4.05,
  halfHeight: 1.55,
  margin: 1.12,
}

/**
 * Home on a wide screen: the Moon on the left and Mars on the right, very large,
 * frame the title; deep space floats at the top in the middle.
 */
const HOME_WIDE: SceneLayout = {
  moon: new THREE.Vector3(-3.05, -0.1, 0),
  mars: new THREE.Vector3(3.3, -0.05, -0.3),
  deep: new THREE.Vector3(0.1, 3.35, -9),
  deepScale: 0.82,
  centre: new THREE.Vector2(0.12, 0.42),
  halfWidth: 4.3,
  halfHeight: 1.2,
  margin: 1,
  isBehindText: true,
}

const PORTRAIT: SceneLayout = {
  moon: new THREE.Vector3(-1.25, 2.2, 0),
  mars: new THREE.Vector3(1, 1.75, -0.6),
  deep: new THREE.Vector3(2.3, 4.2, -9),
  deepScale: 0.5,
  centre: new THREE.Vector2(0.03, 1.85),
  halfWidth: 2.3,
  halfHeight: 1.6,
  margin: 1.12,
}

/** Smallest share of the screen height the overview may use, and the air kept around it. */
const OVERLAP_HOME = 0.27
const OVERLAP_CHOOSE = 0.3
/** Share of the free room a visited destination fills. */
const FILL = 0.96
/** Extra closeness when a site is selected; the whole globe still fits. */
const SITE_ZOOM = 0.93

const layoutFor = (aspect: number, view?: StageView) => (aspect < 0.95 ? PORTRAIT : view === 'home' ? HOME_WIDE : LANDSCAPE)

interface Shared {
  anchors: Map<string, THREE.Object3D>
  /** Set once the visitor turns the globe: it then stops spinning by itself. */
  touched: boolean
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
/** Share of the remaining distance to cover this frame: frame-rate independent, always from the current value. */
const easing = (dt: number, speed: number) => 1 - Math.exp(-Math.min(dt, 0.1) * speed)

/**
 * Grows a body into the scene or shrinks it away, so only the visited destination stays on stage,
 * and glides it to its place when the composition changes (home, destinations, a world).
 */
function useBody(present: boolean, size: number, position: THREE.Vector3, reducedMotion: boolean) {
  const ref = useRef<THREE.Group>(null)
  const started = useRef(false)
  useFrame((_, dt) => {
    const node = ref.current
    if (!node) return
    const goal = present ? size : 0
    // The first frame starts in place and at the right size: only later changes are animated.
    const instant = reducedMotion || !started.current
    started.current = true
    const next = instant ? goal : node.scale.x + (goal - node.scale.x) * easing(dt, 4.5)
    node.scale.setScalar(Math.abs(next - goal) < size * 0.002 ? goal : next)
    node.visible = node.scale.x > size * 0.002
    if (instant) node.position.copy(position)
    else node.position.lerp(position, easing(dt, 2.6))
  })
  return ref
}

/** Soft atmosphere around a planet: a camera-facing glow, brightest at the rim. */
function useGlowTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const g = canvas.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    grad.addColorStop(0.68, 'rgba(255,255,255,0.32)')
    grad.addColorStop(0.82, 'rgba(255,255,255,0.08)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

const GLOW: Record<'moon' | 'mars', string> = { moon: '#7fa6ff', mars: '#ff6a2c' }
const GLOW_SCALE = 3.1
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
  /** On a globe: the name hides when the marker turns to the far side. */
  occludable?: boolean
  reducedMotion: boolean
  sharedRef: RefObject<Shared>
  onPick: (placeId: string) => void
}

const Z_AXIS = new THREE.Vector3(0, 0, 1)

function Marker({ place, position, normal, size, color, state, interactive, named = false, occludable = false, reducedMotion, sharedRef, onPick }: MarkerProps) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const dot = useRef<THREE.Mesh>(null)
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

  useFrame(({ clock, camera }, dt) => {
    const node = group.current
    if (!node) return
    // Nothing to orient or fade while the body this marker sits on is shrunk away.
    if (node.getWorldScale(scratchC).x < 1e-4) return
    if (dot.current) {
      // The dot grows and shrinks instead of jumping when it is selected.
      const goal = state === 'active' ? 1.5 : state === 'related' ? 1.15 : 0.85
      const current = dot.current.scale.x
      dot.current.scale.setScalar(reducedMotion ? goal : current + (goal - current) * easing(dt, 9))
    }
    if (!normal && node.parent) {
      node.quaternion.copy(node.parent.getWorldQuaternion(scratchQ).invert()).multiply(camera.quaternion)
    }
    if (ring.current) {
      const pulse = state !== 'idle' && !reducedMotion ? (clock.elapsedTime * 0.6 + phase) % 1 : 0.35
      ring.current.scale.setScalar(1 + pulse * 1.6)
      const material = ring.current.material as THREE.MeshBasicMaterial
      material.opacity = state === 'idle' ? 0.35 : (1 - pulse) * 0.9
    }
    if (label.current && normal && occludable) {
      const world = node.getWorldPosition(scratchA)
      const facing = node.getWorldDirection(scratchB).dot(scratchC.copy(camera.position).sub(world).normalize())
      label.current.style.opacity = facing > 0.15 ? '1' : '0'
    }
  })

  const core = state === 'active' ? '#ffffff' : color
  const showLabel = interactive && (named || state === 'active' || hovered)

  return (
    <group ref={group} position={position} quaternion={quaternion}>
      <mesh ref={dot} scale={0.85}>
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
    const { size, center } = modelBounds(scene)
    const scale = (2 * radius) / Math.max(size.x, size.y, size.z)
    return { scene, scale, offset: center.clone().multiplyScalar(-scale) }
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
  /** False while another destination is being visited. */
  present: boolean
}

function Globe({ world, label, position, tilt, speed, present, view, machineId, placeId, reducedMotion, sharedRef, onPickWorld, onPickPlace }: GlobeProps) {
  const radius = RADIUS[world]
  const model = useFittedModel(MODEL_FILES[world], radius)
  const spin = useRef<THREE.Group>(null)
  const body = useBody(present, 1, position, reducedMotion)
  const glow = useGlowTexture()
  useEffect(() => () => glow.dispose(), [glow])
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
    <group ref={body} rotation={[0, 0, tilt]}>
      <sprite scale={[radius * GLOW_SCALE, radius * GLOW_SCALE, 1]} renderOrder={-1}>
        <spriteMaterial map={glow} color={GLOW[world]} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
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
            occludable
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
  /** Narrow screens: names appear on the selected or hovered machine only. */
  compact: boolean
  present: boolean
}

function DeepSpace({ label, position, scale, compact, present, view, machineId, placeId, reducedMotion, sharedRef, onPickWorld, onPickPlace }: DeepProps) {
  const here = view === 'deep'
  const body = useBody(present, scale, position, reducedMotion)
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

  const common = { interactive: here, named: !compact, reducedMotion, sharedRef, onPick: onPickPlace, color: ACCENT.deep }
  const state = (id: string) => (here ? markerState(place(id), machineId, placeId) : 'idle')
  const origin = useMemo(() => new THREE.Vector3(), [])
  const orbit = useMemo(() => circle(DAWN_ORBIT), [])
  const keplerArc = useMemo(() => circle(1.5, -2.2, -0.9, 40), [])
  const p10 = useMemo(() => [new THREE.Vector3(-1.5, -0.7, 0.6), new THREE.Vector3(0, 0, 0)], [])
  const p11 = useMemo(() => [new THREE.Vector3(1.2, -1.1, 0.5), new THREE.Vector3(0, 0, 0)], [])

  return (
    <group ref={body}>
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
    const L = layoutFor(aspect, view)
    const ease = reducedMotion || !r.started ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 2.6)
    const goalOff = scratchOff.set(0, 0)

    if (view === 'home' || view === 'choose') {
      // Fit the whole scene into the band of the screen that the page's text and cards leave free.
      // The home text sits on a scrim, so the scene may slip a little under it rather than shrink too far.
      const bottom = L.isBehindText ? 0 : insets.bottom
      const room = Math.max(0, size.height - insets.top - bottom) / size.height
      const share = clamp(room, view === 'home' ? OVERLAP_HOME : OVERLAP_CHOOSE, 1)
      const d = Math.max(L.halfWidth / (TAN * aspect), L.halfHeight / (TAN * share)) * L.margin
      const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.15) * 0.25
      goalOff.set(0, 1 - (2 * insets.top) / size.height - share)
      goalPos.set(L.centre.x + sway, L.centre.y + 0.6, d)
      goalTgt.set(L.centre.x, L.centre.y, -0.5)
      r.mode = 'free'
      r.pos.lerp(goalPos, ease)
      r.tgt.lerp(goalTgt, ease)
    } else {
      // Frame the destination inside the part of the screen the panel leaves free.
      const left = dir === 'rtl' ? insets.end : insets.start
      const right = dir === 'rtl' ? insets.start : insets.end
      const freeW = Math.max(120, size.width - left - right)
      const freeH = Math.max(120, size.height - insets.top - insets.bottom)
      // The visited destination fills nearly all the free room: it is the star of the page.
      const fitFrac = (Math.min(freeW, freeH) * FILL) / size.height
      goalOff.set((2 * (left + freeW / 2)) / size.width - 1, 1 - (2 * (insets.top + freeH / 2)) / size.height)

      const anchor = r.focus ? sharedRef.current.anchors.get(r.focus) : undefined
      const bodyCenter = L[view]
      const deepFocus = view === 'deep' && anchor
      // A selected deep-space machine is framed with its neighbours, not alone in the dark.
      const center = deepFocus ? anchor.getWorldPosition(scratchA).lerp(bodyCenter, 0.4) : bodyCenter
      const fit = (deepFocus ? FIT.deep * 0.72 * L.deepScale : FIT[view] * (view === 'deep' ? L.deepScale : 1) * (anchor ? SITE_ZOOM : 1)) * r.zoom
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
        const v = anchor.getWorldPosition(scratchB).sub(bodyCenter)
        // Wait for the globe to have a size again before aiming at one of its markers.
        if (v.lengthSq() > 1e-6) {
          v.normalize()
          r.azGoal = Math.atan2(v.x, v.z)
          r.polGoal = clamp(Math.asin(clamp(v.y, -1, 1)), -1.25, 1.25)
          focused.current = r.focus
        }
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
  const L = layoutFor(size.width / size.height, props.view)
  const { worldNames, ...common } = props
  const portrait = L === PORTRAIT
  const overview = props.view === 'home' || props.view === 'choose'
  return (
    <>
      <Globe world="moon" label={worldNames.moon} position={L.moon} tilt={0.1} speed={0.05} present={overview || props.view === 'moon'} {...common} />
      <Globe world="mars" label={worldNames.mars} position={L.mars} tilt={-0.42} speed={0.07} present={overview || props.view === 'mars'} {...common} />
      <DeepSpace label={worldNames.deep} position={L.deep} scale={L.deepScale} compact={portrait} present={overview || props.view === 'deep'} {...common} />
    </>
  )
}

export default function Stage({ control, dir, insets, onReady, paused = false, ...props }: StageProps) {
  const sharedRef = useRef<Shared>({ anchors: new Map(), touched: false })
  const inWorld = props.view !== 'home' && props.view !== 'choose'

  return (
    <Canvas
      className="stage-canvas"
      frameloop={paused ? 'never' : 'always'}
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
