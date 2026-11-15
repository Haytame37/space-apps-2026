import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Machine, MachineId } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { STAR_SCORES } from '../rocket/engine'
import { StarIcon } from '../StarIcon'
import type { RunResult } from './KidRocket'

interface Props {
  result: RunResult
  /** The record before this run. */
  best: number
  onAgain: () => void
  machineOf: (id: MachineId) => Machine | undefined
}

/** End of a mission: score, record, stars, the machines met, and the five best missions on this device. */
export function RocketEnd({ result, best, onAgain, machineOf }: Props) {
  const { t, fmt, num, date } = useI18n()
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = heading.current
    if (!el) return
    el.focus({ preventScroll: true })
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' })
  }, [])

  const next = STAR_SCORES.find((s) => result.score < s)

  return (
    <div className="kid-win rk-end">
      <h2 ref={heading} tabIndex={-1}>
        {result.isRecord ? t.kids.rocket.record : t.kids.rocket.overTitle}
      </h2>
      <p className="rk-final">
        <span>{t.kids.rocket.yourScore}</span>
        <b>{num(result.score)}</b>
        <small>
          {fmt(t.kids.rocket.distance, { n: num(result.distance) })} · {fmt(t.kids.rocket.bestScore, { n: num(Math.max(best, result.score)) })}
        </small>
      </p>
      <p className="kid-win-stars">
        {[1, 2, 3].map((i) => (
          <StarIcon key={i} isOff={i > result.stars} />
        ))}
        <span className="sr-only">{fmt(t.kids.starsWon, { n: result.stars })}</span>
      </p>
      {next !== undefined && <p className="rk-next">{fmt(t.kids.rocket.nextStar, { n: num(next) })}</p>}

      {result.machines.length > 0 && (
        <>
          <h3>{t.kids.rocket.met}</h3>
          <ul className="rk-met">
            {result.machines.map((id) => {
              const m = machineOf(id)
              return (
                <li key={id}>
                  {m && <img src={m.image.src} width={64} height={64} alt="" loading="lazy" />}
                  <span>{t.machines[id].name}</span>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <h3>{t.kids.rocket.board}</h3>
      <ol className="rk-board-list">
        {result.board.runs.map((run, i) => (
          <li key={`${run.at}-${i}`} className={run.at === result.at ? 'is-new' : undefined}>
            <span className="rk-rank">{i + 1}</span>
            <b>{num(run.score)}</b>
            <span>{fmt(t.kids.rocket.distance, { n: num(run.distance) })}</span>
            <time dateTime={run.at}>{date({ date: run.at.slice(0, 10), precision: 'day' })}</time>
          </li>
        ))}
      </ol>

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
