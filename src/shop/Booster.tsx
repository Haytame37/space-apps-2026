import { useEffect, useRef, useState } from 'react'
import { MACHINES, type Machine } from '../data/machines'
import { BOOSTER, RARITY } from '../data/shop'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'
import { useReducedMotion } from '../lib/useReducedMotion'
import { shuffle } from '../lib/shuffle'

const REVEAL_MS = 450

/** Five cards at random, at least one of them rare or legendary, commons first. */
function draw(): Machine[] {
  const pool = shuffle(MACHINES)
  const hand = pool.slice(0, BOOSTER.size)
  if (!hand.some((m) => RARITY[m.id] > 1)) hand[hand.length - 1] = pool.find((m) => RARITY[m.id] > 1)!
  return [...hand].sort((a, b) => RARITY[a.id] - RARITY[b.id])
}

interface Props {
  price: ((euros: number) => string) | null
  onAdd?: () => void
}

/** The booster pack: a trial opening reveals five cards one after the other. */
export function Booster({ price, onAdd }: Props) {
  const { t, fmt } = useI18n()
  const reducedMotion = useReducedMotion()
  const [hand, setHand] = useState<Machine[]>([])
  const [opening, setOpening] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const open = () => {
    setHand([])
    setOpening((n) => n + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHand(draw()), reducedMotion ? 0 : REVEAL_MS)
  }

  return (
    <section className="shop-booster" aria-labelledby="h-booster">
      <div key={opening} className={opening ? 'shop-pack is-shaking' : 'shop-pack'} aria-hidden="true">
        <svg viewBox="-104 -104 208 208" focusable="false">
          <path fill="currentColor" d={CRESCENT_PATH} />
        </svg>
        <span>{t.shop.series}</span>
      </div>
      <div>
        <p className="shop-eyebrow">{t.shop.boosterEyebrow}</p>
        <h2 id="h-booster">{t.shop.boosterTitle}</h2>
        <p className="muted">{t.shop.boosterLead}</p>
        <div className="shop-row">
          <button type="button" className="shop-pill" onClick={open}>
            {t.shop.openTrial}
          </button>
          {price && onAdd && (
            <button type="button" className="shop-buy" onClick={onAdd}>
              {fmt(t.shop.addBooster, { price: price(BOOSTER.price) })}
            </button>
          )}
        </div>
        <ul className="shop-draw" aria-live="polite">
          {hand.map((m, i) => (
            <li key={m.id} className={`shop-mini r-${RARITY[m.id]}`} style={{ animationDelay: `${i * 0.16}s` }}>
              <img src={m.image.src} width={m.image.width} height={m.image.height} alt="" />
              <p>
                <small className={`r-${RARITY[m.id]}`}>{t.shop.rarity[RARITY[m.id] - 1]}</small>
                {t.machines[m.id].name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
