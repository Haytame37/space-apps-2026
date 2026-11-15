// Motion of a collectible card: tilt towards the pointer, glare, parallax and the flip, all
// driven by springs so they start from where the card is, keep their speed and can be grabbed
// mid-flight. Values are written to CSS custom properties on the card element.

import { onFrame } from '../lib/frameTicker'

interface Spring {
  x: number
  v: number
  target: number
  /** Seconds to (nearly) reach the target. */
  response: number
  /** 1 = no overshoot; below 1 = a little bounce. */
  damping: number
}

const spring = (x: number, response: number, damping = 1): Spring => ({ x, v: 0, target: x, response, damping })

/** Longest frame taken into account, and the largest integration step, in seconds. */
const MAX_FRAME = 0.1
const SUBSTEP = 1 / 120

function step(s: Spring, dt: number) {
  const omega = (2 * Math.PI) / s.response
  s.v += (-omega * omega * (s.x - s.target) - 2 * s.damping * omega * s.v) * dt
  s.x += s.v * dt
}

const isSettled = (s: Spring, eps: number) => Math.abs(s.x - s.target) < eps && Math.abs(s.v) < eps * 4

/** Where a release at `velocity` (degrees per second) would come to rest, like scroll deceleration. */
const project = (velocity: number, deceleration = 0.996) => ((velocity / 1000) * deceleration) / (1 - deceleration)

/** Maximum lean while following the pointer, in degrees. */
const TILT_X = 12
const TILT_Y = 16
/** How far the card rises from the table at the middle of a flip. */
const LIFT = 0.07
/** Degrees of rotation per pixel dragged. */
const DRAG_GAIN = 0.55
const VELOCITY_WINDOW_MS = 90

export interface CardMotionOptions {
  /** Motion is reduced: no tilt, flips happen at once. */
  isCalm: () => boolean
  /** The card was turned by a drag; `isBack` is the side now facing the viewer. */
  onSide?: (isBack: boolean) => void
}

export class CardMotion {
  private el: HTMLElement
  private opts: CardMotionOptions
  private rx = spring(0, 0.35)
  private ry = spring(0, 0.35)
  private flip = spring(0, 0.62, 0.78)
  private mx = spring(50, 0.25)
  private my = spring(50, 0.25)
  private glare = spring(0, 0.3)
  private flipFrom = 0
  private stop: (() => void) | null = null
  private last = 0
  private drag: { x: number; base: number; samples: { t: number; a: number }[] } | null = null

  constructor(el: HTMLElement, opts: CardMotionOptions) {
    this.el = el
    this.opts = opts
    this.write()
  }

  /** Leans the card towards a pointer at (fx, fy), fractions of the card from its top-left corner. */
  follow(fx: number, fy: number) {
    if (this.opts.isCalm() || this.drag) return
    const side = this.isBack() ? -1 : 1
    this.ry.target = (fx - 0.5) * TILT_Y * 2 * side
    this.rx.target = (0.5 - fy) * TILT_X * 2
    this.mx.target = fx * 100
    this.my.target = fy * 100
    this.glare.target = 1
    this.run()
  }

  /** The pointer left: the card settles back flat. */
  rest() {
    if (this.drag) return
    this.rx.target = 0
    this.ry.target = 0
    this.glare.target = 0
    this.run()
  }

  /** Shows the back (true) or the front. */
  turn(isBack: boolean) {
    const target = isBack ? 180 : 0
    // Keep turning the same way round: the nearest angle showing that side.
    const k = Math.round((this.flip.x - target) / 360)
    const goal = target + k * 360
    if (goal === this.flip.target) return
    this.flipFrom = this.flip.x
    this.flip.target = goal
    if (this.opts.isCalm()) {
      this.flip.x = goal
      this.flip.v = 0
      this.write()
      return
    }
    this.run()
  }

  isBack() {
    return Math.abs(Math.round(this.flip.target / 180)) % 2 === 1
  }

  /** Direct manipulation: the card turns 1:1 with a horizontal drag. */
  grab(clientX: number, time: number) {
    if (this.opts.isCalm()) return
    this.drag = { x: clientX, base: this.flip.x, samples: [{ t: time, a: this.flip.x }] }
    this.flip.v = 0
    this.flipFrom = this.flip.x
    this.glare.target = 1
  }

  move(clientX: number, time: number, isRtl: boolean) {
    const d = this.drag
    if (!d) return
    const dx = (clientX - d.x) * (isRtl ? -1 : 1)
    const a = d.base + dx * DRAG_GAIN
    this.flip.x = a
    this.flip.target = a
    d.samples = [...d.samples.filter((s) => time - s.t <= VELOCITY_WINDOW_MS), { t: time, a }]
    this.mx.target = 50 + Math.sin((a * Math.PI) / 180) * 40
    this.run()
  }

  /** Release: the card keeps its speed and lands on the side its momentum carries it to. */
  release(time: number) {
    const d = this.drag
    if (!d) return
    this.drag = null
    const first = d.samples[0]
    const elapsed = (time - first.t) / 1000
    const velocity = elapsed > 0.005 ? (this.flip.x - first.a) / elapsed : 0
    const landing = this.flip.x + project(velocity)
    const goal = Math.round(landing / 180) * 180
    this.flipFrom = this.flip.x
    this.flip.target = goal
    this.flip.v = velocity
    this.glare.target = 0
    this.opts.onSide?.(this.isBack())
    this.run()
  }

  dispose() {
    this.stop?.()
    this.stop = null
  }

  private run() {
    if (this.stop) return
    this.last = 0
    this.stop = onFrame((now) => {
      // Real elapsed time, cut into small steps: the motion keeps its timing even when frames drop.
      const elapsed = this.last ? Math.min(MAX_FRAME, (now - this.last) / 1000) : 1 / 60
      this.last = now
      const all = [this.rx, this.ry, this.flip, this.mx, this.my, this.glare]
      const n = Math.ceil(elapsed / SUBSTEP)
      for (let i = 0; i < n; i++) for (const s of all) step(s, elapsed / n)
      this.write()
      if (!this.drag && all.every((s) => isSettled(s, 0.05))) {
        for (const s of all) {
          s.x = s.target
          s.v = 0
        }
        this.write()
        this.dispose()
      }
    })
  }

  private write() {
    const st = this.el.style
    const travel = Math.abs(this.flip.target - this.flipFrom)
    const progress = travel > 1 ? Math.min(1, Math.abs(this.flip.x - this.flipFrom) / travel) : 0
    const lift = 1 + LIFT * Math.sin(Math.PI * progress)
    st.setProperty('--rx', `${this.rx.x.toFixed(2)}deg`)
    st.setProperty('--ry', `${this.ry.x.toFixed(2)}deg`)
    st.setProperty('--flip', `${this.flip.x.toFixed(2)}deg`)
    st.setProperty('--lift', lift.toFixed(4))
    st.setProperty('--mx', `${this.mx.x.toFixed(1)}%`)
    st.setProperty('--my', `${this.my.x.toFixed(1)}%`)
    st.setProperty('--glare', Math.max(0, this.glare.x).toFixed(3))
    // The shadow falls away from the tilt and spreads as the card rises.
    st.setProperty('--sx', `${(-this.ry.x * 0.9).toFixed(1)}px`)
    st.setProperty('--sy', `${(18 + this.rx.x * 0.8 + (lift - 1) * 260).toFixed(1)}px`)
  }
}
