import { useSyncExternalStore } from 'react'
import { isProductId, priceOf, type ProductId } from '../data/shop'

export type CartItems = Partial<Record<ProductId, number>>

const STORAGE_KEY = 'space-memory:cart:v1'
const MAX_QTY = 99
const listeners = new Set<() => void>()
let items: CartItems = read()

/** Only known products with sensible quantities survive a reload: stored data is not trusted. */
function read(): CartItems {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>
    const out: CartItems = {}
    for (const [id, qty] of Object.entries(raw)) {
      if (isProductId(id) && typeof qty === 'number' && Number.isInteger(qty) && qty > 0) out[id] = Math.min(qty, MAX_QTY)
    }
    return out
  } catch {
    return {}
  }
}

function commit(next: CartItems) {
  items = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // The cart then lasts for this visit only.
  }
  listeners.forEach((fn) => fn())
}

function add(id: ProductId) {
  commit({ ...items, [id]: Math.min((items[id] ?? 0) + 1, MAX_QTY) })
}

function setQty(id: ProductId, qty: number) {
  if (qty <= 0) return remove(id)
  commit({ ...items, [id]: Math.min(qty, MAX_QTY) })
}

function remove(id: ProductId) {
  const { [id]: _gone, ...rest } = items
  commit(rest)
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** The shop cart, kept in this browser so it is still there on the next visit. */
export function useCart() {
  const current = useSyncExternalStore(subscribe, () => items)
  const lines = (Object.entries(current) as [ProductId, number][]).map(([id, qty]) => ({ id, qty, price: priceOf(id) }))
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    // Rounded to the cent: 0.9 × 3 is 2.7, not 2.7000000000000006.
    total: Math.round(lines.reduce((sum, l) => sum + l.qty * l.price, 0) * 100) / 100,
    add,
    setQty,
    remove,
  }
}
