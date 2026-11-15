// Shop catalogue: what is for sale and at what price. Names and descriptions live in the
// locale files (`shop`), so they follow the language. Prices follow the pricing strategy in
// docs/BUSINESS.md (benchmarked on similar products); no payment is connected yet.

import { BOOK_OFFERS, COLOURING_BOOKS, type BookOfferId, type ColouringBookId } from './books'
import { MACHINES, type MachineId } from './machines'

export type Rarity = 1 | 2 | 3

/** Common, rare or legendary. Legendary cards have a gold border and shimmer at rest. */
export const RARITY: Record<MachineId, Rarity> = {
  'apollo-lm': 3,
  lrv: 1,
  alsep: 1,
  surveyor: 1,
  pathfinder: 2,
  mer: 2,
  viking: 2,
  'phoenix-insight': 2,
  ingenuity: 3,
  dawn: 1,
  near: 2,
  pioneer: 3,
  kepler: 2,
}

/** Price of one card, in euros, by rarity. */
export const CARD_PRICE: Record<Rarity, number> = { 1: 0.9, 2: 1.9, 3: 3.9 }

/** Five cards for less than five commons bought one by one, with at least one rare. */
export const BOOSTER = { id: 'booster', price: 3.9, size: 5 } as const

/** The three books; their cover is drawn in CSS (`cover` picks the design). */
export const BOOKS = [
  { id: 'atlas', cover: 1, price: 14.9 },
  { id: 'notebook', cover: 2, price: 6.9 },
  { id: 'mars', cover: 3, price: 9.9 },
] as const

export type BookId = (typeof BOOKS)[number]['id']

/** Product ids used by the cart: `card:<machine>`, `booster`, `book:<book>`, `<colouring book>:<offer>` (e.g. `pioneer-10:pdf`). */
export type ProductId = `card:${MachineId}` | 'booster' | `book:${BookId}` | `${ColouringBookId}:${BookOfferId}`

/** The colouring book and the version a product id stands for, if it is one. */
export function bookOfferOf(id: string) {
  const [bookId, offerId] = id.split(':')
  const book = COLOURING_BOOKS.find((b) => b.id === bookId)
  const offer = BOOK_OFFERS.find((o) => o.id === offerId)
  return book && offer ? { book, offer } : undefined
}

export function priceOf(id: ProductId): number {
  if (id === 'booster') return BOOSTER.price
  if (id.startsWith('card:')) return CARD_PRICE[RARITY[id.slice(5) as MachineId]]
  const bought = bookOfferOf(id)
  if (bought) return bought.offer.price
  return BOOKS.find((b) => `book:${b.id}` === id)!.price
}

export function isProductId(id: string): id is ProductId {
  if (id === 'booster') return true
  if (id.startsWith('card:')) return MACHINES.some((m) => `card:${m.id}` === id)
  if (bookOfferOf(id)) return true
  return BOOKS.some((b) => `book:${b.id}` === id)
}
