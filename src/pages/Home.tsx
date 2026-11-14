import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { MACHINES } from '../data/machines'
import { useI18n } from '../i18n/context'
import { usePrefs } from '../state/prefs'

export function Home() {
  const { t, fmt } = useI18n()
  const { found } = usePrefs()
  return (
    <section className="home">
      <p className="kicker">{t.home.kicker}</p>
      <h1 className="home-title">{t.home.title}</h1>
      <p className="home-tagline">
        <span>{t.home.line1}</span> <span className="accent">{t.home.line2}</span>
      </p>
      <p className="home-lead">{t.home.lead}</p>
      <div className="actions">
        <Link to="/explore" className="btn primary large">
          {t.home.explore}
          <Icon name="forward" flip />
        </Link>
        <Link to="/play" className="btn large">
          {t.home.play}
        </Link>
      </div>
      {found.length > 0 && <p className="progress-note">{fmt(t.home.progress, { n: found.length, total: MACHINES.length })}</p>}
      <p className="fine-print">
        {t.common.notToScale} · Space Memory {t.common.brandBy}
      </p>
    </section>
  )
}
