import { useEffect, useLayoutEffect, useRef } from 'react'
import { placeById, timelinePlace, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { Icon } from './Icon'

interface Props {
  machine: Machine
  /** Selected event, or null when the place on screen has no event of its own. */
  step: number | null
  onSelect: (step: number) => void
  /** Wide screens: the dock sits under the 3D view and reports its height so the globe is framed above it. */
  onHeight?: (height: number) => void
}

/**
 * The mission's timeline, shown right under the 3D view. Each event knows where
 * it happened: choosing one turns the globe to that place, and choosing a place
 * on the globe selects its first event here.
 */
export function TimelineDock({ machine, step, onSelect, onHeight }: Props) {
  const { t, fmt, date } = useI18n()
  const dock = useRef<HTMLElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const texts = t.machines[machine.id].timeline
  const total = machine.timeline.length
  const place = step === null ? undefined : placeById(timelinePlace(machine.id, step))

  useLayoutEffect(() => {
    const el = dock.current
    if (!el || !onHeight) return
    const report = () => onHeight(el.offsetHeight)
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => {
      observer.disconnect()
      onHeight(0)
    }
  }, [onHeight])

  // Keep the selected event in view when the row of events scrolls sideways.
  useEffect(() => {
    const row = track.current
    const current = row?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!row || !current) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = current.offsetLeft - (row.clientWidth - current.offsetWidth) / 2
    row.scrollTo({ left: target, behavior: calm ? 'auto' : 'smooth' })
  }, [step, machine.id])

  return (
    <section ref={dock} className={onHeight ? `tl-dock is-docked world-${machine.world}` : `tl-dock world-${machine.world}`} aria-label={t.panel.timeline}>
      <div className="tl-dock-head">
        <h2>{t.panel.timeline}</h2>
        <p className="tl-count">{step === null ? fmt(t.panel.tlCount, { total }) : fmt(t.panel.step, { n: step + 1, total })}</p>
        <div className="tl-dock-nav">
          <button type="button" className="icon-btn" disabled={step === null || step === 0} onClick={() => onSelect((step ?? 1) - 1)}>
            <Icon name="back" flip />
            <span className="sr-only">{t.common.previous}</span>
          </button>
          <button type="button" className="icon-btn" disabled={step === total - 1} onClick={() => onSelect(step === null ? 0 : step + 1)}>
            <Icon name="forward" flip />
            <span className="sr-only">{t.common.next}</span>
          </button>
        </div>
      </div>
      <ol ref={track} className="tl-index">
        {machine.timeline.map((stop, i) => (
          <li key={stop.date + i}>
            <button
              type="button"
              className={timelinePlace(machine.id, i) ? 'tl-stop has-place' : 'tl-stop'}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => onSelect(i)}
            >
              <span className="tl-num">{i + 1}</span>
              <span className="tl-year">{stop.date.slice(0, 4)}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="tl-now" aria-live="polite" key={step ?? 'none'}>
        {step === null ? (
          <p className="tl-text muted">{t.panel.timelineHint}</p>
        ) : (
          <>
            <p className="tl-when">
              <span className="tl-date">{date(machine.timeline[step])}</span>
              <span className="tl-place">
                <bdi>{place ? place.name : t.panel.tlElsewhere}</bdi>
              </span>
            </p>
            <p className="tl-text">{texts[step]}</p>
          </>
        )}
      </div>
    </section>
  )
}
