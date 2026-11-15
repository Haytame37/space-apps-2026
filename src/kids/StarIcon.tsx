/** A filled star, for scores. Decorative: the score is always written out too. */
export function StarIcon({ isOff = false }: { isOff?: boolean }) {
  return (
    <svg className={isOff ? 'kid-star is-off' : 'kid-star'} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 1.8l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.4 1.4-6.8L2.2 8.9l6.9-.8z" />
    </svg>
  )
}
