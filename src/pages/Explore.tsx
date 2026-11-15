import { useRef } from 'react'
import { Link, useOutletContext } from 'react-router'
import { machinesOf, WORLD_SLUG, WORLDS } from '../data/machines'
import { useI18n } from '../i18n/context'
import { useStageRoom } from '../lib/useStageRoom'
import type { StageOutlet } from '../stage/StageLayout'

export function Explore() {
  const { t, fmt } = useI18n()
  const { reportRoom } = useOutletContext<StageOutlet>()
  const head = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLUListElement>(null)
  useStageRoom(reportRoom, cards, head)
  return (
    <section className="chooser">
      <div ref={head} className="chooser-head">
        <h1>{t.explore.title}</h1>
        <p className="muted">{t.explore.lead}</p>
      </div>
      <ul ref={cards} className="world-cards">
        {WORLDS.map((world) => (
          <li key={world}>
            <Link to={`/explore/${WORLD_SLUG[world]}`} className={`world-card world-${world}`}>
              <span className="world-card-name">{t.worlds[world].title}</span>
              <span className="world-card-tagline">{t.worlds[world].tagline}</span>
              <span className="world-card-count">{fmt(t.worlds[world].count, { n: machinesOf(world).length })}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="fine-print">{t.common.notToScale}</p>
    </section>
  )
}
