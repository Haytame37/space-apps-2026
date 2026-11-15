// The AYYUR logo animation, ported from the team's reference file.
// Everything is a pure function of the time t, in seconds since the intro began:
// the same t always gives the same picture, so the intro can be paused, resumed
// or shown directly at its final frame.

export const AYYUR_NAME = 'AYYUR'

/** End of the intro, in seconds; the ship keeps orbiting afterwards. */
export const INTRO_END = 6.6

/** The crescent: a disc of radius 100 at (0,0) minus a disc of radius 85 at (14,-15). */
export const CRESCENT_PATH = 'M7.28-99.73A100 100 0 1 0 99-14.1A85 85 0 1 1 7.28-99.73Z'

/** Top tip of the crescent, where the glint and the burst happen. */
export const TIP = { x: 7.28, y: -99.73 }

/** The shadow disc slides from off the moon to the position that carves the crescent. */
export const SHADOW_FROM = { x: 150, y: -160 }
export const SHADOW_TO = { x: 14, y: -15 }

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const seg = (t: number, start: number, dur: number) => clamp((t - start) / dur)
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3)
export const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
export const outBack = (x: number) => {
  const c = 1.9
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)
}
export const bell = (x: number) => Math.sin(Math.PI * clamp(x))
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p

// Ship path: fly-in on a curve (0.3 s to 1.3 s), one clockwise lap that draws the ring (1.3 s to 2.7 s),
// then it keeps circling for good while its orbit tilts into an ellipse around the crescent.
const TILT = -0.42
const CT = Math.cos(TILT)
const ST = Math.sin(TILT)

export function shipAngle(t: number): number {
  if (t < 2.7) return inOutCubic(seg(t, 1.3, 1.4)) * Math.PI * 2 - Math.PI / 2
  const u = t - 2.7
  const w = 0.85
  const ramp = 0.8
  return -Math.PI / 2 + (u < ramp ? (w * u * u) / (2 * ramp) : w * (u - ramp / 2))
}

export const tiltMix = (t: number) => inOutCubic(seg(t, 2.9, 1.8))

export function probePos(t: number): [number, number] {
  if (t < 1.3) {
    const p = outCubic(seg(t, 0.3, 1.0))
    const q = 1 - p
    return [q * q * -330 + 2 * q * p * -190, q * q * 190 + 2 * q * p * -100 + p * p * -100]
  }
  const a = shipAngle(t)
  const m = tiltMix(t)
  const ex = 132 * Math.cos(a)
  const ey = 36 * Math.sin(a)
  return [lerp(100 * Math.cos(a), ex * CT - ey * ST, m), lerp(100 * Math.sin(a), ex * ST + ey * CT, m)]
}

/** Above 0 the ship is in front of the crescent, below 0 behind it. */
export const shipDepth = (t: number) => Math.sin(shipAngle(t)) * tiltMix(t)

// ----- Burst of sparks from the tip, when the glint fires -----

export const BURST_AT = 4.05

export interface Spark {
  vx: number
  vy: number
  life: number
  r: number
  warm: boolean
}

/** Per-second drag matching the reference's 0.975 per frame at 60 frames per second. */
const DRAG = -Math.log(0.975) * 60
/** Light downward pull, in logo units per second squared. */
const GRAVITY = 23

/** The same sparks every time: a seeded generator, so the burst is part of the timeline too. */
export function makeSparks(count: number): Spark[] {
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: count }, () => {
    const a = rnd() * Math.PI * 2
    const v = 30 + rnd() * 200
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.7 + rnd() * 1.1, r: 0.6 + rnd() * 1.8, warm: rnd() < 0.22 }
  })
}

/** Where a spark is `age` seconds after the burst, and how bright it still is (0 once it has faded). */
export function sparkAt(s: Spark, age: number): { x: number; y: number; k: number } {
  if (age < 0 || age >= s.life) return { x: TIP.x, y: TIP.y, k: 0 }
  const decay = (1 - Math.exp(-DRAG * age)) / DRAG
  return {
    x: TIP.x + s.vx * decay,
    y: TIP.y + s.vy * decay + (GRAVITY / DRAG) * (age - decay),
    k: 1 - age / s.life,
  }
}
