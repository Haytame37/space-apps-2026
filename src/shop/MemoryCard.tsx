import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { MACHINES, placesOfMachine, SOURCES, type Fact, type Machine } from '../data/machines'
import { CARD_PRICE, RARITY } from '../data/shop'
import { useI18n } from '../i18n/context'
import { useReducedMotion } from '../lib/useReducedMotion'

interface Props {
  machine: Machine
  /** Formats a price in euros, or null when prices are hidden (young explorers). */
  price: ((euros: number) => string) | null
  onAdd?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The first sentences of a story: a short version without writing anything new. */
const firstSentences = (text: string, count: number) => (text.match(/[^.!?。]+[.!?。]+(\s|$)/g) ?? [text]).slice(0, count).join('').trim()

/** A collectible card: photo and figures on the front; story, dates and silence on the back. */
export function MemoryCard({ machine, price, onAdd }: Props) {
  const { t, fmt, date, num } = useI18n()
  const reducedMotion = useReducedMotion()
  const [isFlipped, setFlipped] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const text = t.machines[machine.id]
  const rarity = RARITY[machine.id]
  const number = `${pad(MACHINES.indexOf(machine) + 1)} / ${MACHINES.length}`
  const place = placesOfMachine(machine.id)[0]
  const steps = [0, Math.floor((machine.timeline.length - 1) / 2), machine.timeline.length - 1]
  const rarityName = t.shop.rarity[rarity - 1]

  const factLabel = (f: Fact) => `${t.panel.factKeys[f.key]}${f.of ? ` · ${f.of}` : ''}`
  const factValue = (f: Fact) => (f.date ? date(f.date) : `${num(f.num ?? 0)}${f.plus ? '+' : ''}${f.unit ? ` ${f.unit}` : ''}`)
  const where = () => {
    const coords =
      place.lat !== undefined && place.lon !== undefined
        ? ` · ${num(Math.abs(place.lat))}° ${place.lat >= 0 ? t.panel.north : t.panel.south}, ${num(Math.abs(place.lon))}° ${place.lon >= 0 ? t.panel.east : t.panel.west}`
        : ''
    return `${place.region || place.name}${coords}`
  }

  // The card leans towards the pointer and a reflection follows it. Not on touch, not when motion is reduced.
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current
    if (!el || reducedMotion || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.classList.add('is-tilting')
    el.style.setProperty('--ry', `${((x - 0.5) * 16 * (isFlipped ? -1 : 1)).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const untilt = () => {
    const el = card.current
    if (!el) return
    el.classList.remove('is-tilting')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  const flip = () => setFlipped((f) => !f)
  const turn = (
    <button type="button" className="mc-turn" aria-pressed={isFlipped} onClick={flip}>
      {t.shop.turn}
      <span className="sr-only"> : {text.name}</span>
    </button>
  )
  const add = price && onAdd && (
    <button type="button" className="mc-buy" onClick={onAdd}>
      {fmt(t.shop.addPrice, { price: price(CARD_PRICE[rarity]) })}
      <span className="sr-only"> : {text.name}</span>
    </button>
  )

  return (
    <div
      ref={card}
      className={isFlipped ? 'mc is-flipped' : 'mc'}
      data-world={machine.world}
      data-r={rarity}
      style={{ '--rx': '0deg', '--ry': '0deg', '--mx': '50%', '--my': '50%' } as CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      <div className="mc-inner" onClick={(e) => !(e.target as HTMLElement).closest('button') && flip()}>
        <article className="mc-face mc-front" inert={isFlipped} aria-label={text.name}>
          <p className="mc-top">
            <span className="mc-world">{t.worlds[machine.world].name}</span>
            <span className="mc-num">{number}</span>
          </p>
          <figure className="mc-photo">
            <img src={machine.image.src} width={machine.image.width} height={machine.image.height} alt={text.alt} loading="lazy" />
            <span className={`mc-rarity r-${rarity}`}>{rarityName}</span>
            <figcaption>{fmt(t.panel.photo, { credit: machine.image.credit })}</figcaption>
          </figure>
          <div className="mc-body">
            <h3>{text.name}</h3>
            <p>{text.tagline}</p>
          </div>
          <ul className="mc-stats">
            {machine.facts.slice(0, 3).map((f) => (
              <li key={`${f.key}-${f.of ?? ''}`}>
                <small>{factLabel(f)}</small>
                <b>{factValue(f)}</b>
              </li>
            ))}
          </ul>
          <div className="mc-foot">
            {turn}
            {add}
          </div>
          <span className="mc-holo" aria-hidden="true" />
        </article>
        <article className="mc-face mc-back" inert={!isFlipped} aria-label={text.name}>
          <div>
            <h3>{text.name}</h3>
            <p className="mc-where">{where()}</p>
          </div>
          <p className="mc-label">{t.shop.story}</p>
          <p className="mc-story">{firstSentences(text.story, 2)}</p>
          <p className="mc-label">{t.shop.dates}</p>
          <ol className="mc-tl">
            {steps.map((i) => (
              <li key={i}>
                <time>{date(machine.timeline[i])}</time>
                {text.timeline[i]}
              </li>
            ))}
          </ol>
          <p className="mc-label">{t.panel.whyQuiet}</p>
          <p className="mc-quiet">{text.quiet}</p>
          <div className="mc-back-foot">
            <span>
              {/* The number keeps its own reading order inside a right-to-left sentence. */}
              {fmt(t.shop.cardOf, { n: `⁦${number}⁩` })} · {t.common.source}: <bdi>{SOURCES[machine.sources[0]].label.split(' — ')[0]}</bdi>
            </span>
            {turn}
            {add}
          </div>
        </article>
      </div>
    </div>
  )
}
