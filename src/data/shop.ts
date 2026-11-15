// Shop catalogue: what is for sale and at what price. Names and descriptions live in the
// locale files (`shop`), so they follow the language. These are the team's proposals: prices
// and books are not final, and no payment is connected.

import { PIONEER_BOOK, PIONEER_OFFERS, type BookOfferId } from './books'
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
export const CARD_PRICE: Record<Rarity, number> = { 1: 2, 2: 4, 3: 9 }

export const BOOSTER = { id: 'booster', price: 12, size: 5 } as const

/** The three books; their cover is drawn in CSS (`cover` picks the design). */
export const BOOKS = [
  { id: 'atlas', cover: 1, price: 29 },
  { id: 'notebook', cover: 2, price: 12 },
  { id: 'mars', cover: 3, price: 18 },
] as const

export type BookId = (typeof BOOKS)[number]['id']

/** Product ids used by the cart: `card:<machine>`, `booster`, `book:<book>`, `pioneer-10:<offer>`. */
export type ProductId = `card:${MachineId}` | 'booster' | `book:${BookId}` | `${typeof PIONEER_BOOK.id}:${BookOfferId}`

const PIONEER_PREFIX = `${PIONEER_BOOK.id}:`

/** The Pioneer 10 offer a product id stands for, if it is one. */
export const pioneerOfferOf = (id: string) =>
  id.startsWith(PIONEER_PREFIX) ? PIONEER_OFFERS.find((o) => `${PIONEER_PREFIX}${o.id}` === id) : undefined

export function priceOf(id: ProductId): number {
  if (id === 'booster') return BOOSTER.price
  if (id.startsWith('card:')) return CARD_PRICE[RARITY[id.slice(5) as MachineId]]
  const offer = pioneerOfferOf(id)
  if (offer) return offer.price
  return BOOKS.find((b) => `book:${b.id}` === id)!.price
}

export function isProductId(id: string): id is ProductId {
  if (id === 'booster') return true
  if (id.startsWith('card:')) return MACHINES.some((m) => `card:${m.id}` === id)
  if (pioneerOfferOf(id)) return true
  return BOOKS.some((b) => `book:${b.id}` === id)
}
