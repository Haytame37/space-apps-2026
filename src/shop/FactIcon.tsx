import type { FactKey } from '../data/machines'

/** One line icon per kind of figure on a card, drawn on a 24 × 24 grid. */
const PATHS: Record<FactKey, string> = {
  launched: 'M12 2c3 3 4 7 3 11l2 3-2 1-1-2h-4l-1 2-2-1 2-3C8 9 9 5 12 2zM12 8.5a1.5 1.5 0 1 0 0 .01M10 19l-1 3M14 19l1 3',
  landed: 'M7 13h10l2 5M17 13l-2-6H9l-2 6-2 5M12 7V3M10 4h4M3 21h18',
  arrived: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5v1',
  lastContact: 'M12 13v8M9 21h6M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0M12 12a1 1 0 1 0 0 .01',
  missionEnd: 'M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z',
  mass: 'M8 8h8l3 12H5L8 8zM12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  distance: 'M4 19c4 0 3-6 8-6s4-6 8-6M4 19a1 1 0 1 0 0 .01M20 7a1 1 0 1 0 0 .01',
  flights: 'M3 6h18M12 6v4M8 10h8l1 4H7l1-4zM9 14l-2 5M15 14l2 5',
  pictures: 'M4 8h4l2-3h4l2 3h4v11H4V8zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  planets: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM3 15c2 2 16-2 18-6',
  power: 'M13 2 5 14h6l-1 8 8-12h-6l1-8z',
}

export function FactIcon({ kind }: { kind: FactKey }) {
  return (
    <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[kind]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
