import { useEffect, useRef, type RefObject } from 'react'

/** Scrolls the element into view when `shown` becomes true, so feedback is never below the fold. */
export function useReveal<T extends HTMLElement>(shown: boolean): RefObject<T | null> {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!shown) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' })
  }, [shown])
  return ref
}
