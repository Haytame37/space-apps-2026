import type { ColouringBook } from '../data/books'
import { useI18n } from '../i18n/context'
import { ProbePath } from './ProbePath'

/** The five stops of the journey on a dotted line, with the little probe travelling along it. */
export function JourneyStrip({ book }: { book: ColouringBook }) {
  const { t, date } = useI18n()
  return (
    <div className="bk-trip">
      <svg className="bk-trip-probe" viewBox="-20 -14 40 28" aria-hidden="true" focusable="false">
        <ProbePath />
      </svg>
      <ol>
        {book.journey.map((stop, i) => (
          <li key={i} className="bk-stop">
            <time dateTime={stop.date}>{date(stop)}</time>
            <p>{t.book.books[book.id].stops[i]}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
