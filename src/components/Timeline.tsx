import { useState } from 'react'
import type { Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { Icon } from './Icon'

/** Indexed timeline: one numbered stop per major event of the mission. */
export function Timeline({ machine }: { machine: Machine }) {
  const { t, fmt, date } = useI18n()
  const [index, setIndex] = useState(0)
  const texts = t.machines[machine.id].timeline
  const total = machine.timeline.length
  const current = Math.min(index, total - 1)

  return (
    <div className="timeline">
      <p className="muted small">{t.panel.timelineHint}</p>
      <ol className="tl-index">
        {machine.timeline.map((stop, i) => (
          <li key={stop.date + i}>
            <button
              type="button"
              className="tl-stop"
              aria-current={i === current ? 'step' : undefined}
              onClick={() => setIndex(i)}
            >
              <span className="tl-num">{i + 1}</span>
              <span className="tl-year">{stop.date.slice(0, 4)}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="tl-card" aria-live="polite">
        <p className="tl-step">{fmt(t.panel.step, { n: current + 1, total })}</p>
        <p className="tl-date">{date(machine.timeline[current])}</p>
        <p className="tl-text">{texts[current]}</p>
      </div>
      <div className="tl-nav">
        <button type="button" className="btn small" disabled={current === 0} onClick={() => setIndex(current - 1)}>
          <Icon name="back" flip />
          {t.common.previous}
        </button>
        <button type="button" className="btn small" disabled={current === total - 1} onClick={() => setIndex(current + 1)}>
          {t.common.next}
          <Icon name="forward" flip />
        </button>
      </div>
    </div>
  )
}
