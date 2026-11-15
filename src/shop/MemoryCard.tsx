import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { MACHINES, placesOfMachine, SOURCES, type Fact, type Machine } from '../data/machines'
import { CARD_PRICE, RARITY } from '../data/shop'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'
import { useReducedMotion } from '../lib/useReducedMotion'
import { CardMotion } from './cardMotion'
import { FactIcon } from './FactIcon'

interface Props {
  machine: Machine
  /** Formats a price in euros, or null when prices are hidden (young explorers). */
  price: ((euros: number) => string) | null
  onAdd?: () => void
  /** Opens the card large; receives the card element, where the opening starts from. */
  onOpen?: (from: HTMLElement) => void
  /** The machine was found in the games: the card is in the explorer's collection. */
  isCollected?: boolean
  /** `large` in the enlarged view: bigger, and it can be turned by dragging. */
  size?: 'grid' | 'large'
  /** Hidden while it is shown large, so it looks lifted out of the grid. */
  isAway?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The first sentences of a story: a short version without writing anything new. */
const firstSentences = (text: string, count: number) => (text.match(/[^.!?。]+[.!?。]+(\s|$)/g) ?? [text]).slice(0, count).join('').trim()

/** Same sparkles on every legendary card: positions from a small seeded generator. */
const SPARKLES = (() => {
  let seed = 5
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 7 }, () => ({ left: 8 + rnd() * 84, top: 6 + rnd() * 88, size: 8 + rnd() * 10, delay: -rnd() * 2.4 }))
})()

/** A collectible card: photo and figures on the front, the mission's file on the back. */
export function MemoryCard({ machine, price, onAdd, onOpen, isCollected = false, size = 'grid', isAway = false }: Props) {
  const { t, fmt, date, num, dir } = useI18n()
  const reducedMotion = useReducedMotion()
  const [isBack, setBack] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const motion = useRef<CardMotion | null>(null)
  const calm = useRef(reducedMotion)
  useEffect(() => {
    calm.current = reducedMotion
  }, [reducedMotion])
  const isLarge = size === 'large'

  const text = t.machines[machine.id]
  const rarity = RARITY[machine.id]
  const number = `${pad(MACHINES.indexOf(machine) + 1)} / ${MACHINES.length}`
  const place = placesOfMachine(machine.id)[0]
  const steps = [0, Math.floor((machine.timeline.length - 1) / 2), machine.timeline.length - 1]
  const rarityName = t.shop.rarity[rarity - 1]

  useEffect(() => {
    const el = card.current
    if (!el) return
    const m = new CardMotion(el, { isCalm: () => calm.current, onSide: setBack })
    motion.current = m
    return () => m.dispose()
  }, [])

  useEffect(() => {
    motion.current?.turn(isBack)
  }, [isBack])

  const factValue = (f: Fact) => (f.date ? date(f.date) : `${num(f.num ?? 0)}${f.plus ? '+' : ''}${f.unit ? ` ${f.unit}` : ''}`)
  const where = () => {
    const coords =
      place.lat !== undefined && place.lon !== undefined
        ? ` · ${num(Math.abs(place.lat))}° ${place.lat >= 0 ? t.panel.north : t.panel.south}, ${num(Math.abs(place.lon))}° ${place.lon >= 0 ? t.panel.east : t.panel.west}`
        : ''
    return `${place.region || place.name}${coords}`
  }

  const point = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    motion.current?.follow((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  }

  // Large card: it turns 1:1 under the finger or the mouse, and a flick turns it over.
  const dragged = useRef(false)
  const startX = useRef(0)
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!isLarge || (e.target as HTMLElement).closest('button, a')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragged.current = false
    startX.current = e.clientX
    motion.current?.grab(e.clientX, e.timeStamp)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (isLarge && e.currentTarget.hasPointerCapture(e.pointerId)) {
      if (Math.abs(e.clientX - startX.current) > 6) dragged.current = true
      motion.current?.move(e.clientX, e.timeStamp, dir === 'rtl')
      return
    }
    point(e)
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!isLarge || !e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (dragged.current) motion.current?.release(e.timeStamp)
    else {
      motion.current?.release(e.timeStamp)
      setBack((b) => !b)
    }
  }

  const flipButton = (
    <button type="button" className="mc-btn" aria-pressed={isBack} onClick={() => setBack((b) => !b)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.shop.turn.replace(/\s*↻$/, '')}
      <span className="sr-only"> : {text.name}</span>
    </button>
  )

  return (
    <div className={['mc-slot', `mc-${size}`, isAway && 'is-away'].filter(Boolean).join(' ')}>
      <div
        ref={card}
        className={isBack ? 'mc is-back' : 'mc'}
        data-world={machine.world}
        data-r={rarity}
        style={{ '--rx': '0deg', '--ry': '0deg', '--flip': '0deg', '--lift': 1, '--mx': '50%', '--my': '50%', '--glare': 0 } as CSSProperties}
        onPointerMove={move}
        onPointerLeave={() => motion.current?.rest()}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="mc-shadow" aria-hidden="true" />
        <div className="mc-inner" onClick={isLarge ? undefined : () => setBack((b) => !b)}>
          <article className="mc-face mc-front" inert={isBack} aria-label={fmt(t.shop.cardFront, { name: text.name })}>
            <div className="mc-body">
              <header className="mc-head">
                <h3>{text.name}</h3>
                <span className="mc-num">{number}</span>
              </header>
              <figure className="mc-photo">
                <img src={machine.image.src} width={machine.image.width} height={machine.image.height} alt={text.alt} loading="lazy" draggable={false} />
                <span className={`mc-rarity r-${rarity}`}>
                  <span aria-hidden="true">{'★'.repeat(rarity)}</span>
                  {rarityName}
                </span>
                {isCollected && <span className="mc-collected">✓ {t.shop.collected}</span>}
                <figcaption>{fmt(t.panel.photo, { credit: machine.image.credit })}</figcaption>
              </figure>
              <p className="mc-flavor">{text.tagline}</p>
              <ul className="mc-stats">
                {machine.facts.slice(0, 3).map((f) => (
                  <li key={`${f.key}-${f.of ?? ''}`}>
                    <FactIcon kind={f.key} />
                    <b>{factValue(f)}</b>
                    <small>
                      {t.panel.factKeys[f.key]}
                      {f.of ? ` · ${f.of}` : ''}
                    </small>
                  </li>
                ))}
              </ul>
              <footer className="mc-foot">
                <svg viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d={CRESCENT_PATH} />
                </svg>
                <span>{t.shop.seriesLine}</span>
                <span className="mc-world">{t.worlds[machine.world].name}</span>
              </footer>
            </div>
            <span className="mc-foil" aria-hidden="true" />
            <span className="mc-glare" aria-hidden="true" />
            {rarity === 3 &&
              SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="mc-sparkle"
                  aria-hidden="true"
                  style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
                />
              ))}
          </article>
          <article className="mc-face mc-back" inert={!isBack} aria-label={fmt(t.shop.cardBack, { name: text.name })}>
            <div className="mc-body mc-file">
              <header className="mc-file-head">
                <span className="mc-num">{number}</span>
                <h3>{text.name}</h3>
                <p className="mc-where">{where()}</p>
              </header>
              <div className="mc-scroll">
                <p className="mc-label">{t.shop.story}</p>
                <p className="mc-story">{firstSentences(text.story, 2)}</p>
                <p className="mc-label">{t.shop.dates}</p>
                <ol className="mc-tl">
                  {steps.map((i) => (
                    <li key={i}>
                      <time dateTime={machine.timeline[i].date}>{date(machine.timeline[i])}</time>
                      {text.timeline[i]}
                    </li>
                  ))}
                </ol>
                <p className="mc-label">{t.panel.whyQuiet}</p>
                <p className="mc-quiet">{text.quiet}</p>
                <p className="mc-source">
                  {t.common.source}: <bdi>{SOURCES[machine.sources[0]].label.split(' — ')[0]}</bdi>
                </p>
              </div>
              <svg className="mc-watermark" viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
                <path fill="currentColor" d={CRESCENT_PATH} />
              </svg>
            </div>
            <span className="mc-glare" aria-hidden="true" />
          </article>
        </div>
      </div>
      {!isLarge && (
        <div className="mc-actions">
          {flipButton}
          {onOpen && (
            <button type="button" className="mc-btn" onClick={() => card.current && onOpen(card.current)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.shop.enlarge}
              <span className="sr-only"> : {text.name}</span>
            </button>
          )}
          {price && onAdd && (
            <button type="button" className="mc-buy" onClick={onAdd}>
              {fmt(t.shop.addPrice, { price: price(CARD_PRICE[rarity]) })}
              <span className="sr-only"> : {text.name}</span>
            </button>
          )}
        </div>
      )}
      {isLarge && <div className="mc-actions">{flipButton}</div>}
    </div>
  )
}
