import { lazy, Suspense, useState } from 'react'
import { ASTEROID_STORY_URL, eyesEmbedUrl, eyesPageUrl, type Machine, type Place, type WorldId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { eyesPlaceOf, type ViewMode } from '../lib/viewMode'
import { AyyurLoader } from './AyyurLoader'
import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'

const ModelViewer = lazy(() => import('./ModelViewer'))

interface BarProps {
  world: WorldId
  modes: ViewMode[]
  mode: ViewMode
  onMode: (mode: ViewMode) => void
  isPanelHidden: boolean
  onTogglePanel: () => void
}

/** Above the large view: which view is shown, and the switch that hides or shows the side panel. */
export function ViewBar({ world, modes, mode, onMode, isPanelHidden, onTogglePanel }: BarProps) {
  const { t } = useI18n()
  const label: Record<ViewMode, string> = { globe: t.worlds[world].name, model: t.panel.model, live: t.explore.viewLive }
  return (
    <div className={`view-bar world-${world}`}>
      {modes.length > 1 && (
        <div className="view-switch" role="group" aria-label={t.explore.views}>
          {modes.map((m) => (
            <button key={m} type="button" aria-pressed={m === mode} onClick={() => onMode(m)}>
              {label[m]}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="panel-toggle"
        aria-controls="story-panel"
        aria-expanded={!isPanelHidden}
        aria-label={isPanelHidden ? t.explore.showPanel : t.explore.hidePanel}
        title={isPanelHidden ? t.explore.showPanel : t.explore.hidePanel}
        onClick={onTogglePanel}
      >
        <Icon name={isPanelHidden ? 'panelOpen' : 'panelClose'} flip />
      </button>
    </div>
  )
}

interface StageViewProps {
  machine: Machine
  place?: Place
  mode: Exclude<ViewMode, 'globe'>
}

/** The 3D model or NASA's own live view, filling the large area. */
export function StageView({ machine, place, mode }: StageViewProps) {
  const { t } = useI18n()
  const name = t.machines[machine.id].name
  return (
    <section className={`view-stage world-${machine.world}`} aria-label={mode === 'model' ? `${t.panel.model}: ${name}` : t.panel.live}>
      {mode === 'model' && machine.model && (
        <Suspense
          fallback={
            <div className="view-status">
              <AyyurLoader label={t.panel.modelLoading} />
            </div>
          }
        >
          <ModelViewer src={machine.model.src} label={`${t.panel.model}: ${name}`} credit={machine.model.credit} />
        </Suspense>
      )}
      {mode === 'live' && <LiveView key={machine.id} machine={machine} place={place} />}
    </section>
  )
}

interface Source {
  title: string
  embed: string
  page: string
}

function LiveView({ machine, place }: { machine: Machine; place?: Place }) {
  const { t, fmt } = useI18n()
  const eyes = eyesPlaceOf(machine, place)
  const sources: Source[] = []
  if (eyes?.eyes) {
    sources.push({ title: fmt(t.panel.liveFrame, { name: eyes.name }), embed: eyesEmbedUrl(eyes.eyes), page: eyesPageUrl(eyes.eyes) })
  }
  if (machine.id === 'near' || machine.id === 'dawn') {
    sources.push({ title: t.panel.storyFrame, embed: ASTEROID_STORY_URL, page: ASTEROID_STORY_URL })
  }
  const [chosen, setChosen] = useState(0)
  const [loaded, setLoaded] = useState<string | null>(null)
  const source = sources[Math.min(chosen, sources.length - 1)]
  if (!source) return null

  return (
    <div className="live-view">
      {sources.length > 1 && (
        <div className="live-sources" role="group" aria-label={t.panel.live}>
          {sources.map((s, i) => (
            <button key={s.embed} type="button" className="chip" aria-pressed={s === source} onClick={() => setChosen(i)}>
              {s.title}
            </button>
          ))}
        </div>
      )}
      <div className="live-frame">
        {/* The view was asked for by choosing it in the selector: it loads straight away. */}
        <iframe key={source.embed} src={source.embed} title={source.title} allow="fullscreen" referrerPolicy="no-referrer" onLoad={() => setLoaded(source.embed)} />
        {loaded !== source.embed && (
          <div className="view-status">
            <AyyurLoader label={t.common.loading} />
          </div>
        )}
      </div>
      <p className="small live-foot">
        <ExternalLink href={source.page}>{t.panel.liveOpen}</ExternalLink>
      </p>
    </div>
  )
}
