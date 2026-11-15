import { useLayoutEffect, useRef, useSyncExternalStore, type PointerEvent, type ReactNode } from 'react'
import { SHEET_DETENTS, SHEET_MAX } from '../lib/sheet'
import { useIsSheet } from '../lib/useIsSheet'
import { useReducedMotion } from '../lib/useReducedMotion'

const TAP_SLOP = 6
const SPRING_RESPONSE = 0.36
const FLICK_SPEED = 400
const VELOCITY_WINDOW_MS = 100
const CLICK_AFTER_DRAG_MS = 350
const FIRST_STEP = 1 / 60
const MAX_STEP = 0.032

function subscribeResize(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

/** Progressive resistance past an edge: the further you pull, the less it follows. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/** Where a release at `velocity` px/s comes to rest, with scroll-like deceleration. */
function project(velocity: number, deceleration = 0.994) {
  return ((velocity / 1000) * deceleration) / (1 - deceleration)
}

interface Props {
  label: string
  handleLabel: string
  /** Current resting height, one of SHEET_DETENTS. */
  detent: number
  onDetentChange: (detent: number) => void
  /** Changing this scrolls the content back to the top (a new story was opened). */
  resetKey: string
  /** Stays in place above the scrolling content (the timeline, on phones). */
  header?: ReactNode
  /** Slid out of the way (and out of the tab order) at the visitor's request. */
  isHidden?: boolean
  children: ReactNode
}

/**
 * Side panel on wide screens; on phones, a bottom sheet that follows the finger,
 * keeps its momentum on release and settles on the nearest resting height.
 */
export function SheetPanel({ label, handleLabel, detent, onDetentChange, resetKey, header, isHidden = false, children }: Props) {
  const narrow = useIsSheet()
  const viewport = useSyncExternalStore(subscribeResize, () => window.innerHeight)
  const reducedMotion = useReducedMotion()
  const panel = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const motion = useRef({
    y: 0,
    velocity: 0,
    target: 0,
    frame: 0,
    dragging: false,
    grab: 0,
    start: 0,
    moved: 0,
    dragEndedAt: -Infinity,
    entered: false,
    samples: [] as { time: number; y: number }[],
  })

  const offsetFor = (value: number) => (SHEET_MAX - value) * viewport
  const place = (y: number) => {
    if (panel.current) panel.current.style.transform = `translate3d(0, ${y}px, 0)`
  }

  const stop = () => {
    cancelAnimationFrame(motion.current.frame)
    motion.current.frame = 0
  }

  const settle = (damping: number) => {
    const m = motion.current
    stop()
    if (reducedMotion) {
      m.y = m.target
      m.velocity = 0
      place(m.y)
      return
    }
    const omega = (2 * Math.PI) / SPRING_RESPONSE
    // Frame timestamps can lag far behind the clock on a busy device: time the spring from
    // the frames themselves and never step backwards, or it would run away instead of settling.
    let last = -1
    const tick = (now: number) => {
      const dt = last < 0 ? FIRST_STEP : Math.min(MAX_STEP, Math.max(0, (now - last) / 1000))
      last = now
      const distance = m.y - m.target
      m.velocity += (-omega * omega * distance - 2 * damping * omega * m.velocity) * dt
      m.y += m.velocity * dt
      if (Math.abs(m.y - m.target) < 0.4 && Math.abs(m.velocity) < 4) {
        m.y = m.target
        m.velocity = 0
        m.frame = 0
        place(m.y)
        return
      }
      place(m.y)
      m.frame = requestAnimationFrame(tick)
    }
    m.frame = requestAnimationFrame(tick)
  }

  const goTo = (next: number, velocity: number) => {
    const m = motion.current
    m.target = offsetFor(next)
    m.velocity = velocity
    onDetentChange(next)
    // A flick keeps a little bounce; a plain move settles without overshoot.
    settle(Math.abs(velocity) > FLICK_SPEED ? 0.8 : 1)
  }

  const riseRef = useRef(() => {})
  useLayoutEffect(() => {
    riseRef.current = () => settle(1)
  })

  // Keep the resting position in step with the detent, the viewport and the layout mode.
  useLayoutEffect(() => {
    const el = panel.current
    const m = motion.current
    if (!el) return
    if (!narrow) {
      cancelAnimationFrame(m.frame)
      m.frame = 0
      m.dragging = false
      el.style.transform = ''
      el.style.removeProperty('--sheet-pad')
      return
    }
    m.target = (SHEET_MAX - detent) * viewport
    el.style.setProperty('--sheet-pad', `${m.target}px`)
    if (!m.entered) {
      // First appearance: the sheet rises from below the screen to its resting height.
      m.entered = true
      m.y = reducedMotion ? m.target : SHEET_MAX * viewport
      el.style.transform = `translate3d(0, ${m.y}px, 0)`
      if (!reducedMotion) riseRef.current()
      return
    }
    if (!m.dragging && !m.frame) {
      m.y = m.target
      el.style.transform = `translate3d(0, ${m.y}px, 0)`
    }
  }, [narrow, detent, viewport, reducedMotion])

  useLayoutEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [resetKey])

  useLayoutEffect(() => {
    const m = motion.current
    return () => {
      // Leave a clean slate: effects can run twice on mount, and the sheet must rise again.
      cancelAnimationFrame(m.frame)
      m.frame = 0
      m.entered = false
    }
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!narrow) return
    const m = motion.current
    e.currentTarget.setPointerCapture(e.pointerId)
    // Grabbing a moving sheet takes over from wherever it is on screen.
    stop()
    m.dragging = true
    m.grab = e.clientY - m.y
    m.start = e.clientY
    m.moved = 0
    m.samples = [{ time: e.timeStamp, y: m.y }]
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const m = motion.current
    if (!m.dragging) return
    const lowest = offsetFor(SHEET_DETENTS[0])
    const raw = e.clientY - m.grab
    m.y = raw < 0 ? -rubberband(-raw, viewport) : raw > lowest ? lowest + rubberband(raw - lowest, viewport) : raw
    m.moved = Math.max(m.moved, Math.abs(e.clientY - m.start))
    m.samples = [...m.samples.filter((s) => e.timeStamp - s.time <= VELOCITY_WINDOW_MS), { time: e.timeStamp, y: m.y }]
    place(m.y)
  }

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const m = motion.current
    if (!m.dragging) return
    m.dragging = false
    if (m.moved <= TAP_SLOP) {
      // A tap: the click handler picks the next height. Finish any interrupted move.
      if (m.y !== m.target) settle(1)
      return
    }
    m.dragEndedAt = performance.now()
    const first = m.samples[0]
    const elapsed = (e.timeStamp - first.time) / 1000
    const velocity = elapsed > 0 ? (m.y - first.y) / elapsed : 0
    const landing = m.y + project(velocity)
    const next = SHEET_DETENTS.reduce((best, value) =>
      Math.abs(offsetFor(value) - landing) < Math.abs(offsetFor(best) - landing) ? value : best,
    )
    goTo(next, velocity)
  }

  const onClick = () => {
    const m = motion.current
    if (!narrow) return
    // The click that ends a drag is not a tap.
    if (performance.now() - m.dragEndedAt < CLICK_AFTER_DRAG_MS) return
    const index = SHEET_DETENTS.findIndex((value) => value === detent)
    goTo(SHEET_DETENTS[(index + 1) % SHEET_DETENTS.length], 0)
  }

  return (
    <aside ref={panel} id="story-panel" className="world-panel" aria-label={label} data-hidden={isHidden || undefined} inert={isHidden}>
      <button
        type="button"
        className="sheet-handle"
        aria-label={handleLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <span className="sheet-grip" aria-hidden="true" />
      </button>
      {header}
      <div ref={scroller} className="world-panel-scroll">
        {children}
      </div>
    </aside>
  )
}
