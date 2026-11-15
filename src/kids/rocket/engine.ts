// "Asteroid Run": the game's world and rules, without any drawing.
// The world is a fixed 360 × 540 box; the canvas scales it to the screen. Positions are in
// world pixels, times in seconds. The state is mutated in place each frame: a game loop
// at 60 fps should not allocate a new world sixty times a second.

import { MACHINES, type MachineId } from '../../data/machines'

export const WORLD = { width: 360, height: 540 } as const

/** The journey follows Pioneer 10: the Moon, the asteroid belt, Jupiter, then deep space. */
export const ZONES = [
  { id: 'moon', from: 0 },
  { id: 'belt', from: 800 },
  { id: 'jupiter', from: 2000 },
  { id: 'deep', from: 3500 },
] as const
export type ZoneId = (typeof ZONES)[number]['id']

export const MAX_SHIELDS = 3
/** Score for 1, 2 and 3 stars. */
export const STAR_SCORES = [300, 1200, 2500] as const

const POINTS = { star: 10, machine: 50 } as const
/** Speed of the sky, in world pixels per second: it grows with the distance travelled. */
const SPEED_START = 150
const SPEED_MAX = 430
const SPEED_RAMP = 0.07
/** One kilometre of the score for every this many world pixels flown. */
const PX_PER_KM = 10
const ROCKET_RADIUS = 12
const ROCKET_RESPONSE = 0.14
/** After a hit, the rocket blinks and cannot be hit again for this long. */
const SAFE_AFTER_HIT = 1.6
const KEY_SPEED = 300

export type EntityKind = 'rock' | 'star' | 'shield' | 'machine'

export interface Entity {
  kind: EntityKind
  x: number
  y: number
  r: number
  /** Sideways drift and extra fall speed, in px/s. */
  vx: number
  vy: number
  rot: number
  spin: number
  /** Rocks: the radius at each corner, as a share of r. */
  shape: number[]
  machine?: MachineId
  isGone: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

/** Things that happened this frame, for sounds, Tiziri and the screen reader. */
export type GameEvent =
  | { type: 'hit'; shields: number }
  | { type: 'star' }
  | { type: 'shield' }
  | { type: 'machine'; machine: MachineId }
  | { type: 'zone'; zone: ZoneId }
  | { type: 'over' }

export interface Input {
  /** Where the finger or the mouse wants the rocket, or null when nothing is held. */
  target: { x: number; y: number } | null
  /** Arrow keys or WASD held: -1, 0 or 1 on each axis. */
  keys: { x: number; y: number }
}

export interface GameState {
  time: number
  distance: number
  score: number
  shields: number
  zone: number
  speed: number
  rocket: { x: number; y: number; vx: number; vy: number; tilt: number; safe: number }
  entities: Entity[]
  particles: Particle[]
  stars: number
  machines: MachineId[]
  isOver: boolean
  /** Screen shake, decays to 0. */
  shake: number
  timers: { rock: number; star: number; shield: number; machine: number }
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

export function createGame(): GameState {
  return {
    time: 0,
    distance: 0,
    score: 0,
    shields: MAX_SHIELDS,
    zone: 0,
    speed: SPEED_START,
    rocket: { x: WORLD.width / 2, y: WORLD.height * 0.78, vx: 0, vy: 0, tilt: 0, safe: 1 },
    entities: [],
    particles: [],
    stars: 0,
    machines: [],
    isOver: false,
    shake: 0,
    timers: { rock: 0.8, star: 1.4, shield: 14, machine: 9 },
  }
}

/** Stars won for a score: 0 to 3. */
export const starsFor = (score: number) => STAR_SCORES.filter((s) => score >= s).length

/** How hard the sky is, from 0 (start) to 1 (fastest). */
const difficulty = (g: GameState) => (g.speed - SPEED_START) / (SPEED_MAX - SPEED_START)

function rockShape(): number[] {
  const corners = 7 + Math.floor(Math.random() * 4)
  return Array.from({ length: corners }, () => rnd(0.72, 1.05))
}

function spawn(g: GameState, kind: EntityKind) {
  const r = kind === 'rock' ? rnd(14, 26 + difficulty(g) * 12) : kind === 'machine' ? 22 : 12
  const entity: Entity = {
    kind,
    x: rnd(r, WORLD.width - r),
    y: -r - 4,
    r,
    vx: kind === 'rock' ? rnd(-30, 30) * (0.4 + difficulty(g)) : 0,
    vy: kind === 'rock' ? rnd(0, 60) : 0,
    rot: rnd(0, Math.PI * 2),
    spin: rnd(-1.6, 1.6),
    shape: kind === 'rock' ? rockShape() : [],
    isGone: false,
  }
  if (kind === 'machine') {
    const left = MACHINES.filter((m) => !g.machines.includes(m.id))
    if (!left.length) return
    entity.machine = left[Math.floor(Math.random() * left.length)].id
  }
  g.entities.push(entity)
}

function burst(g: GameState, x: number, y: number, color: string, count: number, power: number) {
  for (let i = 0; i < count; i++) {
    const a = rnd(0, Math.PI * 2)
    const v = rnd(power * 0.3, power)
    g.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.4, 0.9), color })
  }
}

/** The rocket follows the finger with a critically damped spring, or flies with the keys. */
function steer(g: GameState, input: Input, dt: number) {
  const k = g.rocket
  if (input.target) {
    const omega = (2 * Math.PI) / ROCKET_RESPONSE
    k.vx += (-omega * omega * (k.x - input.target.x) - 2 * omega * k.vx) * dt
    k.vy += (-omega * omega * (k.y - input.target.y) - 2 * omega * k.vy) * dt
  } else {
    const ease = Math.min(1, dt * 12)
    k.vx += (input.keys.x * KEY_SPEED - k.vx) * ease
    k.vy += (input.keys.y * KEY_SPEED - k.vy) * ease
  }
  k.x = Math.min(WORLD.width - ROCKET_RADIUS, Math.max(ROCKET_RADIUS, k.x + k.vx * dt))
  k.y = Math.min(WORLD.height - 30, Math.max(WORLD.height * 0.3, k.y + k.vy * dt))
  k.tilt += (Math.max(-0.5, Math.min(0.5, k.vx / 600)) - k.tilt) * Math.min(1, dt * 10)
  k.safe = Math.max(0, k.safe - dt)
}

function collide(g: GameState, e: Entity, events: GameEvent[]) {
  const k = g.rocket
  const reach = e.r * (e.kind === 'rock' ? 0.82 : 1.1) + ROCKET_RADIUS
  if ((e.x - k.x) ** 2 + (e.y - k.y) ** 2 > reach * reach) return
  if (e.kind === 'rock') {
    if (k.safe > 0) return
    e.isGone = true
    g.shields -= 1
    k.safe = SAFE_AFTER_HIT
    g.shake = 1
    burst(g, e.x, e.y, '#c9a27a', 18, 220)
    events.push({ type: 'hit', shields: g.shields })
    if (g.shields <= 0) {
      g.isOver = true
      burst(g, k.x, k.y, '#ff8a3d', 40, 320)
      events.push({ type: 'over' })
    }
    return
  }
  e.isGone = true
  if (e.kind === 'star') {
    g.stars += 1
    g.score += POINTS.star
    burst(g, e.x, e.y, '#ffd23f', 10, 140)
    events.push({ type: 'star' })
  } else if (e.kind === 'shield') {
    g.shields = Math.min(MAX_SHIELDS, g.shields + 1)
    burst(g, e.x, e.y, '#5ee7ff', 12, 160)
    events.push({ type: 'shield' })
  } else if (e.machine) {
    g.machines.push(e.machine)
    g.score += POINTS.machine
    burst(g, e.x, e.y, '#ffd77a', 24, 200)
    events.push({ type: 'machine', machine: e.machine })
  }
}

/** Advances the game by `dt` seconds and returns what happened. */
export function step(g: GameState, input: Input, dt: number): GameEvent[] {
  const events: GameEvent[] = []
  if (g.isOver) {
    stepParticles(g, dt)
    return events
  }
  g.time += dt
  g.speed = Math.min(SPEED_MAX, SPEED_START + g.distance * SPEED_RAMP)
  const flown = g.speed * dt
  g.distance += flown / PX_PER_KM
  g.score += flown / PX_PER_KM
  g.shake = Math.max(0, g.shake - dt * 3)

  const zone = ZONES.reduce((found, z, i) => (g.distance >= z.from ? i : found), 0)
  if (zone !== g.zone) {
    g.zone = zone
    events.push({ type: 'zone', zone: ZONES[zone].id })
  }

  steer(g, input, dt)

  const d = difficulty(g)
  const t = g.timers
  t.rock -= dt
  t.star -= dt
  t.shield -= dt
  t.machine -= dt
  if (t.rock <= 0) {
    spawn(g, 'rock')
    t.rock = rnd(0.95, 1.25) - d * 0.65
  }
  if (t.star <= 0) {
    spawn(g, 'star')
    t.star = rnd(0.9, 1.6)
  }
  if (t.shield <= 0) {
    if (g.shields < MAX_SHIELDS) spawn(g, 'shield')
    t.shield = rnd(12, 18)
  }
  if (t.machine <= 0) {
    spawn(g, 'machine')
    t.machine = rnd(16, 24)
  }

  for (const e of g.entities) {
    e.x += e.vx * dt
    e.y += (g.speed + e.vy) * dt
    e.rot += e.spin * dt
    if (e.x < e.r || e.x > WORLD.width - e.r) e.vx = -e.vx
    if (e.y - e.r > WORLD.height) e.isGone = true
    if (!e.isGone) collide(g, e, events)
    if (g.isOver) break
  }
  g.entities = g.entities.filter((e) => !e.isGone)
  stepParticles(g, dt)
  return events
}

function stepParticles(g: GameState, dt: number) {
  for (const p of g.particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vx *= 1 - dt * 2
    p.vy *= 1 - dt * 2
    p.life -= dt
  }
  g.particles = g.particles.filter((p) => p.life > 0)
}

/** The rocket's flame and the edge of its hit circle, for drawing. */
export const ROCKET = { radius: ROCKET_RADIUS, safeAfterHit: SAFE_AFTER_HIT } as const
