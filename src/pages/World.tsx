import { Link, Navigate, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import { Icon } from '../components/Icon'
import { MachinePanel } from '../components/MachinePanel'
import { SheetPanel } from '../components/SheetPanel'
import { StageView, ViewBar } from '../components/StageViews'
import { TimelineDock } from '../components/TimelineDock'
import { machineById, machinesOf, storyStepPath, storyView, WORLD_SLUG, worldFromSlug } from '../data/machines'
import { useI18n } from '../i18n/context'
import { useIsWide } from '../lib/useIsSheet'
import { viewModesOf } from '../lib/viewMode'
import type { StageOutlet } from '../stage/StageLayout'
import { usePrefs } from '../state/prefs'

export function World() {
  const { t } = useI18n()
  const { found } = usePrefs()
  const { stageOk, sheet, setSheet, reportDock, isPanelHidden, togglePanel, mode, setMode } = useOutletContext<StageOutlet>()
  const isWide = useIsWide()
  const navigate = useNavigate()
  const params = useParams()
  const [search] = useSearchParams()
  const world = worldFromSlug(params.world)
  if (!world) return <Navigate to="/explore" replace />

  const slug = WORLD_SLUG[world]
  const machine = machineById(params.machine)
  if (params.machine && (!machine || machine.world !== world)) return <Navigate to={`/explore/${slug}`} replace />

  // Opening a story always shows one of its places on the globe: the first one unless the link names another.
  const view = machine ? storyView(machine, search.get('at'), search.get('step')) : undefined
  const place = view?.place
  const isAskedValid = view?.isPlaceGiven ?? false

  // The timeline sits right under the 3D view: docked below the globe on wide screens,
  // at the top of the panel on phones (the sheet upright, the side panel when held sideways).
  const timeline = machine && view && (
    <TimelineDock
      key={machine.id}
      machine={machine}
      step={view.step}
      onSelect={(step) => navigate(storyStepPath(machine, view.place, step), { replace: true })}
      onHeight={isWide ? reportDock : undefined}
    />
  )

  const modes = viewModesOf(machine, stageOk)
  const shown = modes.includes(mode) ? mode : 'globe'

  return (
    <>
      <ViewBar world={world} modes={modes} mode={shown} onMode={setMode} isPanelHidden={isPanelHidden} onTogglePanel={togglePanel} />
      {machine && shown !== 'globe' && <StageView machine={machine} place={place} mode={shown} />}
      {isWide && shown === 'globe' && timeline}
      <SheetPanel
      label={t.worlds[world].title}
      handleLabel={t.explore.sheetHandle}
      detent={sheet}
      onDetentChange={setSheet}
      resetKey={machine?.id ?? world}
      header={isWide ? undefined : timeline}
      isHidden={isPanelHidden}
    >
      {!stageOk && (
        <div className="notice" role="note">
          <strong>{t.explore.noWebglTitle}</strong>
          <p>{t.explore.noWebglBody}</p>
        </div>
      )}
      {/* The address is completed in the background; the story is on screen meanwhile. */}
      {machine && view && !isAskedValid && view.step !== null && <Navigate to={storyStepPath(machine, view.place, view.step)} replace />}
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
    </SheetPanel>
    </>
  )
}
