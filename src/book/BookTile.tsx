import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { pageSrc, PIONEER_BOOK, PIONEER_OFFERS } from '../data/books'
import { useI18n } from '../i18n/context'

/** Big tile in the shop that leads to the colouring book's page. Without prices for young explorers. */
export function BookTile({ price }: { price: ((euros: number) => string) | null }) {
  const { t, fmt } = useI18n()
  const cheapest = Math.min(...PIONEER_OFFERS.map((o) => o.price))
  return (
    <Link to={`/shop/${PIONEER_BOOK.id}`} className="book-tile">
      <img src={pageSrc(1)} width={PIONEER_BOOK.pageSize.width} height={PIONEER_BOOK.pageSize.height} alt="" loading="lazy" />
      <span className="book-tile-text">
        <span className="shop-eyebrow">{t.book.tile.eyebrow}</span>
        <span className="book-tile-title">
          <span lang={PIONEER_BOOK.language}>{PIONEER_BOOK.title}</span> · {t.book.tile.title}
        </span>
        <span className="book-tile-desc">
          {fmt(t.book.tile.desc, { n: PIONEER_BOOK.colouringPages, from: PIONEER_BOOK.ages.from, to: PIONEER_BOOK.ages.to })}
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
