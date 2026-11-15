import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { useI18n } from '../../i18n/context'

/** Back to the kids' home, and the game's title. */
export function GameHead({ title }: { title: string }) {
  const { t } = useI18n()
  return (
    <>
      <p className="kid-back">
        <Link to="/play" className="btn">
          <Icon name="back" flip />
          {t.kids.home}
        </Link>
      </p>
      <h1 className="kid-title">{title}</h1>
    </>
  )
}

/** Progress dots: how many clues or questions are used. */
export function Pips({ total, on, label }: { total: number; on: number; label: string }) {
  return (
    <p className="kid-pips" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < on ? 'is-on' : undefined} />
      ))}
    </p>
  )
}
