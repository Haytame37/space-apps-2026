import { PIONEER_BOOK, PIONEER_OFFERS, type BookOfferId } from '../data/books'
import { useI18n } from '../i18n/context'

interface Props {
  price: (euros: number) => string
  onAdd: (offer: BookOfferId) => void
}

/** The three ways to get the book; the printed book, in the middle, is highlighted. */
export function Offers({ price, onAdd }: Props) {
  const { t, fmt } = useI18n()
  return (
    <ul className="bk-offers">
      {PIONEER_OFFERS.map((offer) => {
        const text = t.book.offers[offer.id]
        return (
          <li key={offer.id} className={offer.isFeatured ? 'bk-offer is-best' : 'bk-offer'}>
            {offer.isFeatured && <span className="bk-flag">{t.book.best}</span>}
            <h3>{text.name}</h3>
            <p className="bk-amount">{price(offer.price)}</p>
            <ul>
              {text.points.map((point) => (
                <li key={point}>{fmt(point, { pages: PIONEER_BOOK.pages, format: PIONEER_BOOK.format, copies: offer.copies ?? 1 })}</li>
              ))}
            </ul>
            <button type="button" className={offer.isFeatured ? 'bk-btn' : 'bk-btn bk-btn-alt'} onClick={() => onAdd(offer.id)}>
              {t.book.add}
              <span className="sr-only"> : {text.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
