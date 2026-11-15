import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { MACHINES, type Machine } from '../data/machines'
import { BOOSTER, RARITY } from '../data/shop'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'
import { useReducedMotion } from '../lib/useReducedMotion'
import { shuffle } from '../lib/shuffle'

/** Five cards at random, at least one of them rare or legendary; the rarest are revealed last. */
function draw(): Machine[] {
  const pool = shuffle(MACHINES)
  const hand = pool.slice(0, BOOSTER.size)
  if (!hand.some((m) => RARITY[m.id] > 1)) hand[hand.length - 1] = pool.find((m) => RARITY[m.id] > 1)!
  return [...hand].sort((a, b) => RARITY[a.id] - RARITY[b.id])
}

/** The ceremony, in milliseconds: the pack shakes, tears, the cards fly out, then turn one by one. */
const SHAKE_MS = 650
const TEAR_MS = 380
const DEAL_STAGGER_MS = 110
const DEAL_MS = 650
const REVEAL_STAGGER_MS = 420

type Stage = 'idle' | 'shaking' | 'torn' | 'dealt'

interface Props {
  price: ((euros: number) => string) | null
  onAdd?: () => void
  /** Opens a revealed card large; receives the element it flies out from. */
  onOpen: (machine: Machine, from: HTMLElement, hand: Machine[]) => void
}

/** The booster: a trial opening, like a real pack. */
export function Booster({ price, onAdd, onOpen }: Props) {
  const { t, fmt } = useI18n()
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState<Stage>('idle')
  const [hand, setHand] = useState<Machine[]>([])
  const [revealed, setRevealed] = useState(0)
  const timers = useRef<number[]>([])
  const pack = useRef<HTMLDivElement>(null)
  const slots = useRef<(HTMLLIElement | null)[]>([])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  useEffect(() => clear, [])

  const open = () => {
    clear()
    const next = draw()
    setHand([])
    setRevealed(0)
    if (reducedMotion) {
      setHand(next)
      setRevealed(next.length)
      setStage('dealt')
      return
    }
    setStage('shaking')
    later(() => setStage('torn'), SHAKE_MS)
    later(() => {
      setHand(next)
      setStage('dealt')
    }, SHAKE_MS + TEAR_MS)
    const dealt = SHAKE_MS + TEAR_MS + DEAL_MS + DEAL_STAGGER_MS * next.length
    next.forEach((_, i) => later(() => setRevealed(i + 1), dealt + i * REVEAL_STAGGER_MS))
  }

  // Each card flies out of the pack: before the first paint, write how far its place is from the pack.
  useLayoutEffect(() => {
    if (stage !== 'dealt' || !pack.current) return
    const p = pack.current.getBoundingClientRect()
    for (const slot of slots.current.slice(0, hand.length)) {
      if (!slot) continue
      const r = slot.getBoundingClientRect()
      slot.style.setProperty('--fx', `${(p.left + p.width / 2 - (r.left + r.width / 2)).toFixed(0)}px`)
      slot.style.setProperty('--fy', `${(p.top + p.height / 2 - (r.top + r.height / 2)).toFixed(0)}px`)
    }
  }, [stage, hand])

  const isBusy = stage === 'shaking' || stage === 'torn' || (stage === 'dealt' && revealed < hand.length)

  return (
    <section className="bst" aria-labelledby="h-booster">
      <div className="bst-intro">
        <div ref={pack} className={`bst-pack is-${stage}`} aria-hidden="true">
          <span className="bst-pack-top" />
          <svg viewBox="-104 -104 208 208" focusable="false">
            <path fill="currentColor" d={CRESCENT_PATH} />
          </svg>
          <span className="bst-pack-name">{t.shop.series}</span>
          <span className="bst-burst" />
        </div>
        <div>
          <p className="shop-eyebrow">{t.shop.boosterEyebrow}</p>
          <h2 id="h-booster">{t.shop.boosterTitle}</h2>
          <p className="muted">{t.shop.boosterLead}</p>
          <div className="shop-row">
            <button type="button" className="shop-pill bst-open" onClick={open} disabled={isBusy}>
              {stage === 'idle' ? t.shop.openTrial : t.shop.openAgain}
            </button>
            {price && onAdd && (
              <button type="button" className="shop-buy" onClick={onAdd}>
                {fmt(t.shop.addBooster, { price: price(BOOSTER.price) })}
              </button>
            )}
          </div>
        </div>
      </div>
      <ul className="bst-hand" aria-live="polite">
        {hand.map((m, i) => {
          const isShown = i < revealed
          const rarity = RARITY[m.id]
          const style = { '--i': i, animationDelay: `${i * DEAL_STAGGER_MS}ms` } as CSSProperties
          return (
            <li key={`${m.id}-${i}`} ref={(el) => void (slots.current[i] = el)} className="bst-slot" style={style}>
              <button
                type="button"
                className={isShown ? 'bst-card is-shown' : 'bst-card'}
                data-card={m.id}
                data-world={m.world}
                data-r={rarity}
                disabled={!isShown}
                onClick={(e) => onOpen(m, e.currentTarget, hand)}
              >
                <span className="bst-card-inner">
                  <span className="bst-reverse" aria-hidden="true">
                    <svg viewBox="-104 -104 208 208" focusable="false">
                      <path fill="currentColor" d={CRESCENT_PATH} />
                    </svg>
                    <span>{t.shop.series}</span>
                  </span>
                  <span className="bst-front">
                    <img src={m.image.src} width={m.image.width} height={m.image.height} alt="" draggable={false} />
                    <span className={`bst-rarity r-${rarity}`}>
                      <span aria-hidden="true">{'★'.repeat(rarity)} </span>
                      {t.shop.rarity[rarity - 1]}
                    </span>
                    <span className="bst-name">{isShown ? t.machines[m.id].name : ''}</span>
                    <span className="mc-foil" aria-hidden="true" />
                  </span>
                </span>
                {isShown && rarity > 1 && <span className="bst-flash" aria-hidden="true" />}
                {!isShown && <span className="sr-only">{t.shop.hiddenCard}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
