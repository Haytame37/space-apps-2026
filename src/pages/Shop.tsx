import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MACHINES, WORLDS, type MachineId, type WorldId } from '../data/machines'
import { BOOKS, RARITY, type ProductId } from '../data/shop'
import { LANGS, useI18n } from '../i18n/context'
import { Booster } from '../shop/Booster'
import { Books } from '../shop/Books'
import { CartPanel } from '../shop/CartPanel'
import { MemoryCard } from '../shop/MemoryCard'
import { useCart } from '../shop/useCart'
import { usePrefs } from '../state/prefs'

const TOAST_MS = 2200
type Filter = 'all' | WorldId

/** The shop: Memory cards, a booster, books and a cart. Young explorers see a collection, without prices. */
export function Shop() {
  const { t, fmt, lang } = useI18n()
  const { profile } = usePrefs()
  const cart = useCart()
  const [filter, setFilter] = useState<Filter>('all')
  const [isCartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(0)
  const cartButton = useRef<HTMLButtonElement>(null)
  const isKid = profile === 'kid'

  const euros = useMemo(() => {
    const locale = LANGS.find((l) => l.code === lang)?.locale ?? 'en-GB'
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, numberingSystem: 'latn' })
    return (n: number) => format.format(n)
  }, [lang])

  const nameOf = useCallback(
    (id: ProductId) => {
      if (id === 'booster') return { name: t.shop.boosterName, kind: t.shop.boosterKind }
      if (id.startsWith('card:')) {
        const machine = id.slice(5) as MachineId
        return { name: t.machines[machine].name, kind: fmt(t.shop.cardKind, { rarity: t.shop.rarity[RARITY[machine] - 1] }) }
      }
      const book = BOOKS.find((b) => `book:${b.id}` === id)!
      return { name: t.shop.books[book.id].title, kind: t.shop.bookKind }
    },
    [t, fmt],
  )

  const say = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), TOAST_MS)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const add = (id: ProductId) => {
    cart.add(id)
    say(fmt(t.shop.added, { name: nameOf(id).name }))
  }
  const closeCart = useCallback(() => {
    setCartOpen(false)
    cartButton.current?.focus()
  }, [])

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t.shop.all },
    ...WORLDS.map((w) => ({ id: w, label: t.worlds[w].name })),
  ]
  const shown = MACHINES.filter((m) => filter === 'all' || m.world === filter)
  const price = isKid ? null : euros

  return (
    <div className="shop">
      {!isKid && (
        <div className="shop-bar">
          <button
            ref={cartButton}
            type="button"
            className="shop-pill shop-cart-btn"
            aria-expanded={isCartOpen}
            aria-controls="shop-cart"
            onClick={() => setCartOpen((open) => !open)}
          >
            {t.shop.cart} <b>{cart.count}</b>
            <span className="sr-only"> ({fmt(t.shop.items, { n: cart.count })})</span>
          </button>
        </div>
      )}

      <section className="shop-intro">
        <div>
          <p className="shop-eyebrow">{t.shop.eyebrow}</p>
          <h1>{t.shop.title}</h1>
          <p className="shop-lead">{isKid ? t.shop.kidLead : t.shop.lead}</p>
        </div>
        <ol className="shop-how">
          {(isKid ? t.shop.howKid : t.shop.how).map((step, i) => (
            <li key={step}>
              <span aria-hidden="true">{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="h-cards">
        <div className="shop-head">
          <div>
            <h2 id="h-cards">{t.shop.cardsTitle}</h2>
            <p className="muted">{fmt(t.shop.cardsLead, { n: MACHINES.length })}</p>
          </div>
          <div className="shop-filters" role="group" aria-label={t.shop.filterBy}>
            {filters.map((f) => (
              <button key={f.id} type="button" className="shop-pill" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="shop-grid">
          {shown.map((m) => (
            <li key={m.id}>
              <MemoryCard machine={m} price={price} onAdd={isKid ? undefined : () => add(`card:${m.id}`)} />
            </li>
          ))}
        </ul>
      </section>

      <Booster price={price} onAdd={isKid ? undefined : () => add('booster')} />

      {!isKid && <Books price={euros} onAdd={(id) => add(`book:${id}`)} />}

      <p className="shop-disclaimer">{t.shop.disclaimer}</p>

      {!isKid && (
        <CartPanel
          isOpen={isCartOpen}
          onClose={closeCart}
          nameOf={nameOf}
          price={euros}
          onCheckout={() => say(cart.count ? t.shop.notReady : t.shop.emptyToast)}
        />
      )}
      <p className={toast ? 'shop-toast is-shown' : 'shop-toast'} role="status">
        {toast}
      </p>
    </div>
  )
}
