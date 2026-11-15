import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { BOOK_OFFERS, pageSrc, type ColouringBook } from '../data/books'
import { useI18n } from '../i18n/context'

/** Big tile in the shop that leads to a colouring book's page. Without prices for young explorers. */
export function BookTile({ book, price }: { book: ColouringBook; price: ((euros: number) => string) | null }) {
  const { t, fmt } = useI18n()
  const cheapest = Math.min(...BOOK_OFFERS.map((o) => o.price))
  return (
    <Link to={`/shop/${book.id}`} className="book-tile" data-book={book.id}>
      <img src={pageSrc(book, 1)} width={book.pageSize.width} height={book.pageSize.height} alt="" loading="lazy" />
      <span className="book-tile-text">
        <span className="shop-eyebrow">{t.book.tile.eyebrow}</span>
        <span className="book-tile-title">
          <span lang={book.language}>{book.title}</span> · {t.book.tile.title}
        </span>
        <span className="book-tile-desc">
          {fmt(t.book.tile.desc, { n: book.colouringPages, from: book.ages.from, to: book.ages.to })}
        </span>
        {price && <span className="book-tile-price">{fmt(t.book.tile.from, { price: price(cheapest) })}</span>}
        <span className="book-tile-cta">
          {t.book.tile.cta}
          <Icon name="forward" flip />
        </span>
      </span>
    </Link>
  )
}
