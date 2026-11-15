import { BOOK_OFFERS, type BookOfferId, type ColouringBook } from '../data/books'
import { useI18n } from '../i18n/context'

interface Props {
  book: ColouringBook
  price: (euros: number) => string
  onAdd: (offer: BookOfferId) => void
}

/** The three ways to get the book; the printed book, in the middle, is highlighted. */
export function Offers({ book, price, onAdd }: Props) {
  const { t, fmt } = useI18n()
  return (
    <ul className="bk-offers">
      {BOOK_OFFERS.map((offer) => {
        const text = t.book.offers[offer.id]
        return (
          <li key={offer.id} className={offer.isFeatured ? 'bk-offer is-best' : 'bk-offer'}>
            {offer.isFeatured && <span className="bk-flag">{t.book.best}</span>}
            <h3>{text.name}</h3>
            <p className="bk-amount">{price(offer.price)}</p>
            <ul>
              {text.points.map((point) => (
                <li key={point}>{fmt(point, { pages: book.pages, format: book.format, copies: offer.copies ?? 1 })}</li>
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
