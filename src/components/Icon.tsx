const PATHS = {
  back: 'M15 5l-7 7 7 7',
  forward: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  down: 'M5 9l7 7 7-7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  rotateLeft: 'M4 12a8 8 0 1 0 2.6-5.9M4 5v4h4',
  rotateRight: 'M20 12a8 8 0 1 1-2.6-5.9M20 5v4h-4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  external: 'M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5',
  play: 'M8 5.5v13l10.5-6.5z',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z',
}

export type IconName = keyof typeof PATHS

/** Decorative line icon. `flip` mirrors direction arrows in right-to-left languages. */
export function Icon({ name, flip = false }: { name: IconName; flip?: boolean }) {
  return (
    <svg className={flip ? 'icon icon-flip' : 'icon'} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
