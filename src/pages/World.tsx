import { Link, Navigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import { Icon } from '../components/Icon'
import { MachinePanel } from '../components/MachinePanel'
import { machineById, machinesOf, placeById, placesOfMachine, WORLD_SLUG, worldFromSlug } from '../data/machines'
import { useI18n } from '../i18n/context'
import type { StageOutlet } from '../stage/StageLayout'
import { usePrefs } from '../state/prefs'

export function World() {
  const { t } = useI18n()
  const { found } = usePrefs()
  const { stageOk } = useOutletContext<StageOutlet>()
  const params = useParams()
  const [search] = useSearchParams()
  const world = worldFromSlug(params.world)
  if (!world) return <Navigate to="/explore" replace />

  const slug = WORLD_SLUG[world]
  const machine = machineById(params.machine)
  if (params.machine && (!machine || machine.world !== world)) return <Navigate to={`/explore/${slug}`} replace />

  const asked = placeById(search.get('at'))
  const place = machine && asked?.machines.includes(machine.id) ? asked : undefined
  // Opening a story always shows one of its places on the globe.
  if (machine && !place) {
    return <Navigate to={`/explore/${slug}/${machine.id}?at=${placesOfMachine(machine.id)[0].id}`} replace />
  }

  return (
    <aside className="world-panel" aria-label={t.worlds[world].title}>
      {!stageOk && (
        <div className="notice" role="note">
          <strong>{t.explore.noWebglTitle}</strong>
          <p>{t.explore.noWebglBody}</p>
        </div>
      )}
      {machine ? (
        <MachinePanel key={machine.id} machine={machine} place={place} />
      ) : (
        <div className={`world-index world-${world}`}>
          <Link to="/explore" className="back-link">
            <Icon name="back" flip />
            {t.explore.allWorlds}
          </Link>
          <h1>{t.worlds[world].title}</h1>
          <p className="tagline">{t.worlds[world].tagline}</p>
          <p className="muted">{world === 'deep' ? t.explore.pickDeep : t.explore.pick}</p>
          {world === 'deep' && <p className="muted small">{t.explore.deepNote}</p>}
          <h2>{t.explore.machines}</h2>
          <ul className="machine-list">
            {machinesOf(world).map((m) => (
              <li key={m.id}>
                <Link to={`/explore/${slug}/${m.id}`} className="machine-card">
                  <img src={m.image.src} width={72} height={72} alt="" loading="lazy" />
                  <span className="machine-card-text">
                    <span className="machine-card-name">{t.machines[m.id].name}</span>
                    <span className="machine-card-tagline">{t.machines[m.id].tagline}</span>
                  </span>
                  {found.includes(m.id) && (
                    <span className="found-badge">
                      <Icon name="check" />
                      <span className="sr-only">{t.panel.found}</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p className="fine-print">{t.common.notToScale}</p>
        </div>
      )}
    </aside>
  )
}
