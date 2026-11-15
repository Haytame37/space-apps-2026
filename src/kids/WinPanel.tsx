import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { StarIcon } from './StarIcon'

interface Props {
  title: string
  /** 1 to 3 */
  stars: number
  /** Its "kid" text is shown under "Did you know?". */
  machine?: Machine
  onAgain: () => void
}

/** End of a game: the stars won, something to remember about the machine, and what to do next. */
export function WinPanel({ title, stars, machine, onAgain }: Props) {
  const { t, fmt } = useI18n()
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = heading.current
    if (!el) return
    el.focus({ preventScroll: true })
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' })
  }, [])

  return (
    <div className="kid-win">
      <h2 ref={heading} tabIndex={-1}>
        {title}
      </h2>
      <p className="kid-win-stars">
        {[1, 2, 3].map((i) => (
          <StarIcon key={i} isOff={i > stars} />
        ))}
        <span className="sr-only">{fmt(t.kids.starsWon, { n: stars })}</span>
      </p>
      {machine && (
        <p className="kid-fact">
          <b>{t.kids.didYouKnow}</b> {t.machines[machine.id].kid}
        </p>
      )}
      <div className="kid-row">
        <button type="button" className="btn primary" onClick={onAgain}>
          {t.kids.again}
        </button>
        <Link to="/play" className="btn">
          {t.kids.home}
        </Link>
      </div>
    </div>
  )
}
