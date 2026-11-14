import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { useI18n } from '../i18n/context'

export function GameFrame({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <section className="page game">
      <Link to="/play" className="back-link">
        <Icon name="back" flip />
        {t.play.back}
      </Link>
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
      {children}
    </section>
  )
}
