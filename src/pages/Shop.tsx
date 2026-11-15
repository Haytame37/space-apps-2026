import { useCallback, useEffect, useRef, useState } from 'react'
import { MACHINES, WORLDS, type Machine, type WorldId } from '../data/machines'
import type { ProductId } from '../data/shop'
import { useI18n } from '../i18n/context'
import { BookTile } from '../book/BookTile'
import { PriceCharter } from '../shop/PriceCharter'
import { COLOURING_BOOKS } from '../data/books'
import { Booster } from '../shop/Booster'
import { Books } from '../shop/Books'
import { CardFocus } from '../shop/CardFocus'
import { CartPanel } from '../shop/CartPanel'
import { MemoryCard } from '../shop/MemoryCard'
import { useCart } from '../shop/useCart'
import { useEuros } from '../shop/useEuros'
import { useProductName } from '../shop/useProductName'
import { usePrefs } from '../state/prefs'

const TOAST_MS = 2200
type Filter = 'all' | WorldId

/** The shop: Memory cards, a booster, books and a cart. Young explorers see a collection, without prices. */
export function Shop() {
  const { t, fmt } = useI18n()
  const { profile, found } = usePrefs()
  const cart = useCart()
  const [filter, setFilter] = useState<Filter>('all')
  const [isCartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(0)
  const cartButton = useRef<HTMLButtonElement>(null)
  const isKid = profile === 'kid'
  // The card shown large, the cards it can be browsed with, and the element it flew out of.
  const [focus, setFocus] = useState<{ machine: Machine; from: HTMLElement; list: Machine[] } | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const euros = useEuros()
  const nameOf = useProductName()

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
  const price = euros
  const collected = MACHINES.filter((m) => found.includes(m.id)).length

  const openCard = (machine: Machine, from: HTMLElement, list: Machine[]) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setFocus({ machine, from, list })
  }
  /** Browsing in the large view: the card will fly back to its own place in the grid or the hand. */
  const browse = (machine: Machine) =>
    setFocus((f) => {
      if (!f) return f
      const own = f.from.closest('.bst-hand')
        ? document.querySelector<HTMLElement>(`.bst-hand [data-card="${machine.id}"]`)
        : document.querySelector<HTMLElement>(`.shop-grid [data-card="${machine.id}"] .mc`)
      return { ...f, machine, from: own ?? f.from }
    })
  const closeFocus = useCallback(() => {
    setFocus(null)
    opener.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="shop">
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

      <div className="book-tiles">
        {COLOURING_BOOKS.map((b) => (
          <BookTile key={b.id} book={b} price={euros} />
        ))}
      </div>

      <section aria-labelledby="h-cards">
        <div className="shop-head">
          <div>
            <h2 id="h-cards">{t.shop.cardsTitle}</h2>
            <p className="muted">{fmt(t.shop.cardsLead, { n: MACHINES.length })}</p>
            <p className="shop-collection">
              <span className="shop-collection-bar" aria-hidden="true">
                <span style={{ width: `${(collected / MACHINES.length) * 100}%` }} />
              </span>
              {fmt(t.shop.collection, { n: collected, total: MACHINES.length })}
            </p>
          </div>
          <div className="shop-filters" role="group" aria-label={t.shop.filterBy}>
            {filters.map((f) => (
              <button key={f.id} type="button" className="shop-pill" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* A new filter deals the cards again. */}
        <ul key={filter} className="shop-grid">
          {shown.map((m, i) => (
            <li key={m.id} data-card={m.id} style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}>
              <MemoryCard
                machine={m}
                price={price}
                onAdd={() => add(`card:${m.id}`)}
                onOpen={(from) => openCard(m, from, shown)}
                isCollected={found.includes(m.id)}
                isAway={focus?.machine.id === m.id && focus.from.closest('.shop-grid') !== null}
              />
            </li>
          ))}
        </ul>
      </section>

      <Booster price={price} onAdd={() => add('booster')} onOpen={openCard} />

      <CardFocus
        cards={focus?.list ?? MACHINES}
        open={focus}
        onIndex={browse}
        onClose={closeFocus}
      />

      <Books price={euros} onAdd={(id) => add(`book:${id}`)} />

      <PriceCharter price={euros} />

      <p className="shop-disclaimer">{t.shop.disclaimer}</p>

      <CartPanel
          isOpen={isCartOpen}
          onClose={closeCart}
          nameOf={nameOf}
          price={euros}
          onCheckout={() => say(cart.count ? t.shop.notReady : t.shop.emptyToast)}
        />
      <p className={toast ? 'shop-toast is-shown' : 'shop-toast'} role="status">
        {toast}
      </p>
    </div>
  )
}
