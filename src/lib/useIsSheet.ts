import { useSyncExternalStore } from 'react'
import { SHEET_QUERY } from './sheet'

const WIDE_QUERY = '(min-width: 900px)'

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

/** True when the story panel is a bottom sheet (phones and tablets held upright). */
export function useIsSheet(): boolean {
  return useMediaQuery(SHEET_QUERY)
}

/** True when there is room for the timeline to sit under the globe, next to the story panel. */
export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY)
}
