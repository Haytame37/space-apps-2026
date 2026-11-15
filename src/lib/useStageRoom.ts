import { useLayoutEffect, type RefObject } from 'react'

/** Reports the band of the screen left free for the 3D scene, as pixels covered at the top and at the bottom. */
export type ReportRoom = (top: number, bottom: number) => void

const SETTLE_MS = 900

/**
 * Measures the room the page's own content leaves to the 3D scene and keeps it
 * up to date when the window, the language or the text size changes.
 * Without `above`, the room starts under the site header.
 */
export function useStageRoom(report: ReportRoom, below: RefObject<HTMLElement | null>, above?: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const lower = below.current
    const header = document.querySelector<HTMLElement>('.site-header')
    const upper = above?.current ?? header
    if (!lower || !upper) return
    const measure = () => {
      // The stage is fixed to the viewport: measure as if the page were scrolled to the top.
      // The header is sticky, so it is already where it would be at the top of the page.
      const top = upper === header ? upper.getBoundingClientRect().bottom : upper.getBoundingClientRect().bottom + window.scrollY
      const bottom = window.innerHeight - (lower.getBoundingClientRect().top + window.scrollY)
      report(Math.max(0, top), Math.max(0, bottom))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(lower)
    observer.observe(upper)
    window.addEventListener('resize', measure)
    // Entrance animations move the content slightly: measure again once they are over.
    const settled = window.setTimeout(measure, SETTLE_MS)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(settled)
    }
  }, [report, below, above])
}
