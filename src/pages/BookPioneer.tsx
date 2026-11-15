// The Pioneer 10 colouring book: fonts and styles load with this page only.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/londrina-solid/latin-400.css'
import '@fontsource/londrina-solid/latin-900.css'
import '../styles/book.css'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Book3D } from '../book/Book3D'
import { ColoringCanvas } from '../book/ColoringCanvas'
import { FlipBook } from '../book/FlipBook'
import { JourneyStrip } from '../book/JourneyStrip'
import { Offers } from '../book/Offers'
import { Icon } from '../components/Icon'
import { PIONEER_BOOK, PIONEER_JOURNEY, PIONEER_OFFERS, type BookOfferId } from '../data/books'
import { useI18n } from '../i18n/context'
import { CartPanel } from '../shop/CartPanel'
import { useCart } from '../shop/useCart'
import { useEuros } from '../shop/useEuros'
import { useProductName } from '../shop/useProductName'
import { usePrefs } from '../state/prefs'

const TOAST_MS = 2200

/** Same sky on every visit: a small seeded generator instead of Math.random. */
const STARS = (() => {
  let seed = 23
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 60 }, () => ({ left: rnd() * 100, top: rnd() * 100, size: 1 + rnd() * 3, delay: -rnd() * 3, opacity: 0.3 + rnd() * 0.7 }))
})()

function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <div className="bk-head">
        <p className="bk-eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
      {children}
    </section>
  )
}

/** Presents and sells the Pioneer 10 colouring book. Young explorers see the book without prices or cart. */
export default function BookPioneer() {
  const { t, fmt } = useI18n()
  const { profile } = usePrefs()
  const isKid = profile === 'kid'
  const cart = useCart()
  const euros = useEuros()
  const nameOf = useProductName()
  const [isCartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(0)
  const cartButton = useRef<HTMLButtonElement>(null)
  const featured = PIONEER_OFFERS.find((o) => o.isFeatured) ?? PIONEER_OFFERS[0]
  const book = PIONEER_BOOK

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const say = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), TOAST_MS)
  }
  const add = (offer: BookOfferId) => {
    const id = `${book.id}:${offer}` as const
    cart.add(id)
    say(fmt(t.shop.added, { name: nameOf(id).name }))
  }
  const closeCart = useCallback(() => {
    setCartOpen(false)
    cartButton.current?.focus()
  }, [])

  const flip = (
    <Section id="bk-flip" eyebrow={isKid ? t.book.flipEyebrowKid : t.book.flipEyebrow} title={t.book.flipTitle} lead={fmt(t.book.flipLead, { n: book.pages })}>
      <FlipBook />
      <p className="bk-langnote">{t.book.languageNote}</p>
    </Section>
  )
  const colouring = (
    <Section id="bk-colour" eyebrow={t.book.colourEyebrow} title={t.book.colourTitle} lead={t.book.colourLead}>
      <ColoringCanvas />
    </Section>
  )

  return (
    <div className="book-page">
      <div className="bk-sky" aria-hidden="true">
        {STARS.map((s, i) => (
          <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, opacity: s.opacity }} />
        ))}
      </div>

      <div className="bk-bar">
        <Link to="/shop" className="bk-back">
          <Icon name="back" flip />
          {t.book.back}
        </Link>
        {!isKid && (
          <button
            ref={cartButton}
            type="button"
            className="bk-cart"
            aria-expanded={isCartOpen}
            aria-controls="shop-cart"
            onClick={() => setCartOpen((open) => !open)}
          >
            {t.shop.cart} · <b>{fmt(t.shop.items, { n: cart.count })}</b> · <b>{euros(cart.total)}</b>
          </button>
        )}
      </div>

      <div className="bk-main">
        <section className="bk-hero">
          <div>
            <p className="bk-eyebrow">{fmt(t.book.eyebrow, { from: book.ages.from, to: book.ages.to })}</p>
            <h1 lang={book.language}>
              {book.title} <span>{book.subtitle}</span>
            </h1>
            <p className="bk-lead">{fmt(t.book.lead, { year: PIONEER_JOURNEY[0].date.slice(0, 4), n: book.colouringPages })}</p>
            <ul className="bk-tags">
              {t.book.tags.map((tag) => (
                <li key={tag}>{fmt(tag, { n: book.colouringPages, format: book.format })}</li>
              ))}
            </ul>
            <div className="bk-row">
              {!isKid && (
                <button type="button" className="bk-btn" onClick={() => add(featured.id)}>
                  {fmt(t.book.addBook, { price: euros(featured.price) })}
                </button>
              )}
              {isKid && (
                <a className="bk-btn" href="#bk-colour">
                  {t.book.goColour}
                </a>
              )}
              <a className="bk-btn bk-btn-alt" href="#bk-flip">
                {t.book.browse}
              </a>
            </div>
          </div>
          <Book3D />
        </section>

        {isKid ? (
          <>
            {colouring}
            {flip}
          </>
        ) : (
          <>
            {flip}
            {colouring}
          </>
        )}

        <Section id="bk-trip" eyebrow={t.book.tripEyebrow} title={t.book.tripTitle}>
          <JourneyStrip />
        </Section>

        {!isKid && (
          <Section id="bk-buy" eyebrow={t.book.buyEyebrow} title={t.book.buyTitle}>
            <Offers price={euros} onAdd={add} />
          </Section>
        )}

        <div className="bk-note">
          {!isKid && <p>{t.book.example}</p>}
          <ul>
            {t.book.credits.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>
            {t.common.source}:{' '}
            <a className="link" href={book.source} target="_blank" rel="noopener noreferrer">
              NASA Science — Pioneer 10
              <span className="sr-only"> ({t.common.newTab})</span>
            </a>
          </p>
        </div>
      </div>

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
