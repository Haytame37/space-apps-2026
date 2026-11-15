import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface Props {
  /** What Tiziri says, read out to screen readers too. */
  text: string
  /** Tiziri jumps for joy. */
  happy?: boolean
  /** Changes with each new line, so a second success makes her jump again. */
  cue?: number
}

/** Tiziri, the little rocket who guides the young explorers, with her speech bubble. */
export function Mascot({ text, happy = false, cue = 0 }: Props) {
  const rocket = useRef<SVGSVGElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = rocket.current
    if (!happy || reducedMotion || !el) return
    el.classList.remove('is-happy')
    void el.getBoundingClientRect() // restart the jump
    el.classList.add('is-happy')
  }, [happy, cue, reducedMotion])

  return (
    <div className="kid-guide">
      <svg
        ref={rocket}
        className="kid-rocket"
        viewBox="0 0 100 130"
        aria-hidden="true"
        focusable="false"
        onAnimationEnd={(e) => e.currentTarget.classList.remove('is-happy')}
      >
        <path className="kid-flame" d="M38 96Q50 132 62 96Z" fill="#ff7a6b" />
        <path className="kid-flame" d="M43 96Q50 118 57 96Z" fill="#ffd23f" />
        <path d="M26 70L8 98L30 90Z" fill="#5ee7ff" />
        <path d="M74 70L92 98L70 90Z" fill="#5ee7ff" />
        <path d="M50 4C26 26 24 66 30 96H70C76 66 74 26 50 4Z" fill="#fff" />
        <path d="M50 4C40 13 34 25 31 38H69C66 25 60 13 50 4Z" fill="#ff7a6b" />
        <circle cx="50" cy="58" r="17" fill="#1b1147" />
        <circle cx="50" cy="58" r="14" fill="#8fd9ff" />
        <ellipse className="kid-eye" cx="44" cy="56" rx="2.6" ry="3.6" fill="#1b1147" />
        <ellipse className="kid-eye" cx="56" cy="56" rx="2.6" ry="3.6" fill="#1b1147" />
        <path d="M43 63Q50 69 57 63" fill="none" stroke="#1b1147" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <p className="kid-bubble" aria-live="polite">
        <span key={cue}>{text}</span>
      </p>
    </div>
  )
}
