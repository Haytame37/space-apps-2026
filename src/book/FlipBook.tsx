import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { pageSrc, type ColouringBook } from '../data/books'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * One leaf per two pages. The last leaf carries a blank inside of the back cover on its front
 * and the back cover on its back, so the closed book ends on its back cover, as a real book does.
 * `frontOf` and `backOf` give the page on each side of leaf `i` (1-based, 0 for the blank inside cover).
 */
function leavesOf(pages: number) {
  const leaves = Math.ceil((pages + 1) / 2)
  return {
    leaves,
    frontOf: (i: number) => (i === leaves - 1 ? 0 : 2 * i + 1),
    backOf: (i: number) => (i === leaves - 1 ? pages : 2 * i + 2),
  }
}
/** Halfway through the turn the leaf passes the others: then it takes its place in the stack. */
const RESTACK_MS = 520
/** Leaves ahead of the furthest one reached whose pages are already fetched, so turning never shows a blank page. */
const AHEAD = 2

/** Leaf through the book's pages, two at a time, with a page turning in 3D. */
export function FlipBook({ book }: { book: ColouringBook }) {
  const { t, fmt } = useI18n()
  const PAGES = book.pages
  const { leaves: LEAVES, frontOf, backOf } = leavesOf(PAGES)
  const reducedMotion = useReducedMotion()
  const [turned, setTurned] = useState(0)
  const [moving, setMoving] = useState<number | null>(null)
  // Pages are fetched as the reader gets near them, not all at once when the page opens.
  const [furthest, setFurthest] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const go = (next: number) => {
    if (next < 0 || next > LEAVES || next === turned) return
    const leaf = next > turned ? turned : turned - 1
    setMoving(leaf)
    setTurned(next)
    setFurthest((f) => Math.max(f, next))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMoving(null), reducedMotion ? 0 : RESTACK_MS)
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    // The book keeps its western reading order in every language: right is always forwards.
    if (e.key === 'ArrowRight') go(turned + 1)
    else if (e.key === 'ArrowLeft') go(turned - 1)
    else return
    e.preventDefault()
  }

  const left = turned > 0 ? backOf(turned - 1) : null
  const right = turned < LEAVES ? frontOf(turned) : null
  const where =
    turned === 0
      ? t.book.cover
      : turned === LEAVES
        ? t.book.backCover
        : left && right
          ? fmt(t.book.pagesOf, { a: left, b: right, total: PAGES })
          : fmt(t.book.pageOf, { a: left || right || 0, total: PAGES })

  const face = (page: number, isBack: boolean, isVisible: boolean, isNear: boolean) => {
    const className = isBack ? 'bk-face bk-face-back' : 'bk-face'
    if (!page) {
      return (
        <span className={`${className} bk-face-blank`} aria-hidden="true">
          <svg viewBox="-104 -104 208 208" focusable="false">
            <path fill="currentColor" d={CRESCENT_PATH} />
          </svg>
        </span>
      )
    }
    if (!isNear) return <span className={className} aria-hidden="true" />
    return (
      <span className={className} aria-hidden={!isVisible}>
        <img
          src={pageSrc(book, page)}
          width={book.pageSize.width}
          height={book.pageSize.height}
          alt={book.pageText[page - 1]}
          lang={book.language}
          loading={page <= 2 ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
        />
      </span>
    )
  }

  return (
    <div className="bk-flipwrap" onKeyDown={onKey}>
      <div
        className={['bk-flip', turned === 0 && 'is-start', turned === LEAVES && 'is-end'].filter(Boolean).join(' ')}
        role="group"
        aria-label={t.book.flipLabel}
        aria-roledescription={t.book.flipRole}
        tabIndex={0}
      >
        {Array.from({ length: LEAVES }, (_, i) => {
          const isTurned = i < turned
          const zIndex = moving === i ? 100 : isTurned ? i + 1 : LEAVES - i
          const isNear = i <= furthest + AHEAD
          return (
            <div
              key={i}
              className={isTurned ? 'bk-leaf is-turned' : 'bk-leaf'}
              style={{ zIndex }}
              onClick={() => go(isTurned ? turned - 1 : turned + 1)}
            >
              {face(frontOf(i), false, !isTurned && i === turned, isNear)}
              {face(backOf(i), true, isTurned && i === turned - 1, isNear)}
            </div>
          )
        })}
      </div>
      <div className="bk-flipnav">
        <button type="button" className="bk-btn bk-btn-alt bk-btn-small" disabled={turned === 0} onClick={() => go(turned - 1)}>
          {t.book.prev}
        </button>
        <output aria-live="polite">{where}</output>
        <button type="button" className="bk-btn bk-btn-small" disabled={turned === LEAVES} onClick={() => go(turned + 1)}>
          {t.book.next}
        </button>
      </div>
    </div>
  )
}
