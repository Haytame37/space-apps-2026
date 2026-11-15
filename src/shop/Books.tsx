import { BOOKS } from '../data/shop'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'

interface Props {
  price: (euros: number) => string
  onAdd: (book: (typeof BOOKS)[number]['id']) => void
}

/** Three books, each with a cover drawn in CSS. */
export function Books({ price, onAdd }: Props) {
  const { t } = useI18n()
  return (
    <section aria-labelledby="h-books">
      <div className="shop-head">
        <div>
          <h2 id="h-books">{t.shop.booksTitle}</h2>
          <p className="muted">{t.shop.booksLead}</p>
        </div>
      </div>
      <ul className="shop-shelf">
        {BOOKS.map((book) => {
          const text = t.shop.books[book.id]
          return (
            <li key={book.id} className="shop-book">
              <div className={`shop-cover cv-${book.cover}`} aria-hidden="true">
                <svg viewBox="-104 -104 208 208" focusable="false">
                  <path fill="currentColor" d={CRESCENT_PATH} />
                </svg>
                <div>
                  <b>{text.title}</b>
                  <small>{text.band}</small>
                </div>
              </div>
              <div>
                <h3>{text.title}</h3>
                <p>{text.desc}</p>
                <ul className="shop-tags">
                  {text.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="shop-row">
                  <span className="shop-price">{price(book.price)}</span>
                  <button type="button" className="shop-buy" onClick={() => onAdd(book.id)}>
                    {t.shop.add}
                    <span className="sr-only"> : {text.title}</span>
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
