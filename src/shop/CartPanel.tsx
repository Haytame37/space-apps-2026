import { useEffect, useRef } from 'react'
import type { ProductId } from '../data/shop'
import { useI18n } from '../i18n/context'
import { useCart } from './useCart'

interface Props {
  isOpen: boolean
  onClose: () => void
  nameOf: (id: ProductId) => { name: string; kind: string }
  price: (euros: number) => string
  onCheckout: () => void
}

/** The cart, sliding in from the edge: quantities, total, removal. Ordering is not available yet. */
export function CartPanel({ isOpen, onClose, nameOf, price, onCheckout }: Props) {
  const { t, fmt } = useI18n()
  const { lines, total, setQty, remove } = useCart()
  const close = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <aside id="shop-cart" className={isOpen ? 'shop-cart is-open' : 'shop-cart'} aria-labelledby="h-cart" inert={!isOpen}>
      <header>
        <h2 id="h-cart">{t.shop.cartTitle}</h2>
        <button ref={close} type="button" className="shop-pill" onClick={onClose}>
          {t.common.close}
        </button>
      </header>
      {lines.length === 0 ? (
        <p className="shop-empty">{t.shop.empty}</p>
      ) : (
        <ul className="shop-lines">
          {lines.map(({ id, qty, price: each }) => {
            const { name, kind } = nameOf(id)
            return (
              <li key={id}>
                <div>
                  {name}
                  <small>
                    {kind} · {fmt(t.shop.each, { qty, price: price(each) })}
                  </small>
                </div>
                <div className="shop-qty" role="group" aria-label={fmt(t.shop.qtyOf, { name })}>
                  <button type="button" aria-label={fmt(t.shop.less, { name })} onClick={() => setQty(id, qty - 1)}>
                    −
                  </button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" aria-label={fmt(t.shop.more, { name })} onClick={() => setQty(id, qty + 1)}>
                    +
                  </button>
                </div>
                <b>{price(qty * each)}</b>
                <button type="button" className="shop-del" aria-label={fmt(t.shop.remove, { name })} onClick={() => remove(id)}>
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <p className="shop-total">
        <span>{t.shop.total}</span>
        <span>{price(total)}</span>
      </p>
      <button type="button" className="shop-buy shop-checkout" onClick={onCheckout}>
        {t.shop.checkout}
      </button>
      <p className="shop-note shop-adult">{t.shop.withAdult}</p>
      <p className="shop-note">{t.shop.cartNote}</p>
    </aside>
  )
}
