import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { pageSrc, PIONEER_BOOK } from '../data/books'
import { useI18n } from '../i18n/context'
import { onFrame } from '../lib/frameTicker'
import { useReducedMotion } from '../lib/useReducedMotion'
import { ProbePath } from './ProbePath'

/** Resting pose: turned a little, so the spine and the edge of the pages show. */
const REST_Y = 26
const REST_X = 5
/** How long the turn-over takes before the book floats again (matches the CSS transition). */
const TURN_MS = 950

/**
 * The book in CSS 3D: cover, back, spine, page edges. It floats and sways at rest, leans towards
 * the pointer, and turns over with a click or Enter. When motion is reduced it stays still.
 */
export function Book3D() {
  const { t } = useI18n()
  const reducedMotion = useReducedMotion()
  const scene = useRef<HTMLDivElement>(null)
  const book = useRef<HTMLDivElement>(null)
  const [isBackShown, setBackShown] = useState(false)
  const side = useRef(0)
  const isHeld = useRef(false)
  const turnTimer = useRef(0)

  const pose = (ry: number, rx: number, fy: number) => {
    const el = book.current
    if (!el) return
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    el.style.setProperty('--fy', `${fy.toFixed(2)}px`)
  }

  // Floating at rest; the clock only runs while the book is on screen.
  useEffect(() => {
    const host = scene.current
    if (!host) return
    if (reducedMotion) {
      book.current?.classList.remove('is-live')
      pose(side.current + REST_Y, REST_X, 0)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      if (isHeld.current) return
      const s = (now - start) / 1000
      book.current?.classList.add('is-live')
      pose(side.current + REST_Y + Math.sin(s * 0.7) * 14, REST_X + Math.sin(s * 0.9) * 3, Math.sin(s * 1.3) * 9)
    }
    let stop: (() => void) | null = null
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !stop) stop = onFrame(tick)
      else if (!entry.isIntersecting && stop) {
        stop()
        stop = null
      }
    })
    observer.observe(host)
    return () => {
      observer.disconnect()
      stop?.()
    }
  }, [reducedMotion])

  useEffect(() => () => window.clearTimeout(turnTimer.current), [])

  const follow = (e: PointerEvent<HTMLDivElement>) => {
    const host = scene.current
    if (!host || reducedMotion || e.pointerType === 'touch' || turnTimer.current) return
    const r = host.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    isHeld.current = true
    book.current?.classList.add('is-live')
    pose(side.current + x * 70, -y * 26, 0)
  }

  const turn = () => {
    side.current = side.current ? 0 : 180
    setBackShown(side.current === 180)
    book.current?.classList.remove('is-live')
    isHeld.current = true
    pose(side.current + REST_Y - 4, REST_X, 0)
    window.clearTimeout(turnTimer.current)
    turnTimer.current = window.setTimeout(() => {
      turnTimer.current = 0
      isHeld.current = false
    }, reducedMotion ? 0 : TURN_MS)
  }

  return (
    <div ref={scene} className="bk-scene" onPointerMove={follow} onPointerLeave={() => (isHeld.current = !!turnTimer.current)}>
      <div className="bk-glow" aria-hidden="true" />
      <svg className="bk-orb" viewBox="-20 -14 40 28" aria-hidden="true" focusable="false">
        <ProbePath />
      </svg>
      <div
        ref={book}
        className="bk-book"
        role="button"
        tabIndex={0}
        aria-pressed={isBackShown}
        aria-label={isBackShown ? t.book.showCover : t.book.showBack}
        onClick={turn}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            turn()
          }
        }}
      >
        <div className="bk-front" style={{ backgroundImage: `url(${pageSrc(1)})` }} />
        <div className="bk-back" style={{ backgroundImage: `url(${pageSrc(PIONEER_BOOK.pages)})` }} />
        <div className="bk-spine">
          <span>
            {PIONEER_BOOK.title.toUpperCase()} · AYYUR
          </span>
        </div>
        <div className="bk-edge" />
        <div className="bk-top" />
        <div className="bk-bottom" />
      </div>
      <div className="bk-shadow" aria-hidden="true" />
      <p className="bk-hint">{t.book.hint}</p>
    </div>
  )
}
