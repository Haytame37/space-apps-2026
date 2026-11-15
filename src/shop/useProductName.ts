import { useCallback } from 'react'
import type { MachineId } from '../data/machines'
import { BOOKS, pioneerOfferOf, RARITY, type ProductId } from '../data/shop'
import { useI18n } from '../i18n/context'

/** Name and kind of any product of the cart, in the current language. */
export function useProductName() {
  const { t, fmt } = useI18n()
  return useCallback(
    (id: ProductId) => {
      if (id === 'booster') return { name: t.shop.boosterName, kind: t.shop.boosterKind }
      if (id.startsWith('card:')) {
        const machine = id.slice(5) as MachineId
        return { name: t.machines[machine].name, kind: fmt(t.shop.cardKind, { rarity: t.shop.rarity[RARITY[machine] - 1] }) }
      }
      const offer = pioneerOfferOf(id)
      if (offer) return { name: t.book.offers[offer.id].name, kind: t.book.cartKind }
      const book = BOOKS.find((b) => `book:${b.id}` === id)!
      return { name: t.shop.books[book.id].title, kind: t.shop.bookKind }
    },
    [t, fmt],
  )
}
