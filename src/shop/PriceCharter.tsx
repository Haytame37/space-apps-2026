import { BOOK_OFFERS } from '../data/books'
import { BOOSTER, CARD_PRICE } from '../data/shop'
import { useI18n } from '../i18n/context'

const ICONS = [
  // an open book: learning stays free
  'M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5V5.5zM12 6v13.5',
  // a balance: fair prices
  'M12 4v16M6 20h12M5 8h14M7 8l-3 6h6L7 8zM17 8l-3 6h6l-3-6z',
  // a school: for classes
  'M3 10l9-5 9 5-9 5-9-5zM7 12.5V17c3 2 7 2 10 0v-4.5',
]

/** The shop's pricing promise: learning is free, prices are fair, schools pay less. */
export function PriceCharter({ price }: { price: (euros: number) => string }) {
  const { t, fmt } = useI18n()
  const pdf = BOOK_OFFERS.find((o) => o.id === 'pdf')!
  const print = BOOK_OFFERS.find((o) => o.id === 'print')!
  const pack = BOOK_OFFERS.find((o) => o.id === 'class')!
  const values = {
    pdf: price(pdf.price),
    print: price(print.price),
    card: price(CARD_PRICE[1]),
    booster: price(BOOSTER.price),
    perBook: price(Math.round((pack.price / (pack.copies ?? 1)) * 100) / 100),
    copies: pack.copies ?? 1,
  }
  return (
    <section className="shop-charter" aria-labelledby="h-charter">
      <div className="shop-head">
        <div>
          <p className="shop-eyebrow">{t.shop.charter.eyebrow}</p>
          <h2 id="h-charter">{t.shop.charter.title}</h2>
          <p className="muted">{t.shop.charter.lead}</p>
        </div>
      </div>
      <ul className="shop-charter-list">
        {t.shop.charter.items.map((item, i) => (
          <li key={item.title}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d={ICONS[i]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>{item.title}</h3>
            <p>{fmt(item.body, values)}</p>
          </li>
        ))}
      </ul>
      <p className="shop-adult">{t.shop.withAdult}</p>
    </section>
  )
}
