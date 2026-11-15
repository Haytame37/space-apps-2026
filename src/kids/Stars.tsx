import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/context'
import { KID_GAMES, usePrefs } from '../state/prefs'
import { StarIcon } from './StarIcon'

/** Stars won in the kids' corner: the best score of each game, added up. It bounces when it grows. */
export function Stars() {
  const { t, fmt } = useI18n()
  const { stars } = usePrefs()
  const total = KID_GAMES.reduce((sum, game) => sum + (stars[game] ?? 0), 0)
  const chip = useRef<HTMLParagraphElement>(null)
  const last = useRef(total)

  useEffect(() => {
    const el = chip.current
    if (total > last.current && el) {
      el.classList.remove('is-bumping')
      void el.getBoundingClientRect() // restart the bounce
      el.classList.add('is-bumping')
    }
    last.current = total
  }, [total])

  return (
    <p ref={chip} className="kid-chip kid-stars" aria-live="polite" onAnimationEnd={(e) => e.currentTarget.classList.remove('is-bumping')}>
      <StarIcon />
      <span aria-hidden="true">{total}</span>
      <span className="sr-only">{fmt(t.kids.starsTotal, { n: total })}</span>
    </p>
  )
}
