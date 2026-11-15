import { lazy, Suspense, useCallback, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { machineById, placeById, storyView, WORLD_SLUG, worldFromSlug, type WorldId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { SHEET_DEFAULT, SHEET_DETENTS, SHEET_MAX, SHEET_QUERY } from '../lib/sheet'
import { VIEW_BAR_HEIGHT, type ViewMode } from '../lib/viewMode'
import type { ReportRoom } from '../lib/useStageRoom'
import { useReducedMotion } from '../lib/useReducedMotion'
import { webglAvailable } from '../lib/webgl'
import type { StageControl, StageInsets, StageView } from './Stage'

const Stage = lazy(() => import('./Stage'))

function subscribeResize(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

function subscribeHeader(onChange: () => void) {
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return subscribeResize(onChange)
  const observer = new ResizeObserver(onChange)
  observer.observe(header)
  return () => observer.disconnect()
}

/** Mirrors the CSS: header height, side panel on wide screens, bottom sheet on phones. */
function useInsets(sheet: number, isPanelHidden: boolean): StageInsets {
  const width = useSyncExternalStore(subscribeResize, () => window.innerWidth)
  const height = useSyncExternalStore(subscribeResize, () => window.innerHeight)
  const isSheet = useSyncExternalStore(subscribeResize, () => window.matchMedia(SHEET_QUERY).matches)
  const header = useSyncExternalStore(subscribeHeader, () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64)
  return useMemo(
    () =>
      isSheet
        ? { top: header + VIEW_BAR_HEIGHT.sheet, bottom: isPanelHidden ? 0 : height * sheet, start: 0, end: 0 }
        : { top: header + VIEW_BAR_HEIGHT.wide, bottom: 0, start: 0, end: isPanelHidden ? 0 : Math.min(500, width * 0.5) },
    [width, height, sheet, isSheet, header, isPanelHidden],
  )
}

export interface StageOutlet {
  /** False when the device cannot draw the 3D view. */
  stageOk: boolean
  /** Resting height of the phone sheet, as a fraction of the viewport. */
  sheet: number
  setSheet: (detent: number) => void
  /** Height of the timeline docked under the 3D view on wide screens (0 when it is elsewhere). */
  reportDock: (height: number) => void
  /** The side panel (or the phone sheet) slid out of the way: the 3D view takes the whole width. */
  isPanelHidden: boolean
  togglePanel: () => void
  /** What the large area shows for the open story. */
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  /** Home and the destination chooser say how much of the screen their own content covers. */
  reportRoom: ReportRoom
}

/** Keeps one 3D scene alive behind the home, destination and machine pages. */
export function StageLayout() {
  const { t, dir } = useI18n()
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const [search] = useSearchParams()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const control = useRef<StageControl | null>(null)
  const [sheet, setSheet] = useState<number>(SHEET_DEFAULT)
  const [isPanelHidden, setPanelHidden] = useState(false)
  const togglePanel = useCallback(() => setPanelHidden((hidden) => !hidden), [])
  const worldInsets = useInsets(sheet, isPanelHidden)
  const [dock, setDock] = useState(0)
  const [room, setRoom] = useState({ top: 64, bottom: 0 })
  const reportRoom = useCallback<ReportRoom>(
    (top, bottom) => setRoom((prev) => (Math.abs(prev.top - top) < 1 && Math.abs(prev.bottom - bottom) < 1 ? prev : { top, bottom })),
    [],
  )

  const [, first, worldSlug, machineSlug] = location.pathname.split('/')
  const world = first === 'explore' ? worldFromSlug(worldSlug) : undefined
  const view: StageView = world ?? (first === 'explore' ? 'choose' : 'home')
  const machine = world ? machineById(machineSlug) : undefined
  const machineId = machine && machine.world === world ? machine.id : undefined
  // The globe shows where the selected timeline event happened, or the chosen site.
  const placeId = machine && machineId ? storyView(machine, search.get('at'), search.get('step')).focus : undefined

  const stageOk = webglAvailable() && !failed
  // A story opens on its globe; the view chosen for one machine does not carry over to the next.
  const [modeOf, setModeOf] = useState<{ machine?: string; mode: ViewMode }>({ mode: 'globe' })
  const mode: ViewMode = machineId && modeOf.machine === machineId ? modeOf.mode : 'globe'
  const setMode = useCallback(
    (next: ViewMode) => {
      setModeOf({ machine: machineId, mode: next })
      // On a phone the sheet steps down so the chosen view gets the room.
      if (next !== 'globe' && window.matchMedia(SHEET_QUERY).matches) setSheet(SHEET_DETENTS[0])
    },
    [machineId],
  )
  const insets = useMemo<StageInsets>(
    () => (world ? { ...worldInsets, bottom: worldInsets.bottom + dock } : { top: room.top, bottom: room.bottom, start: 0, end: 0 }),
    [world, worldInsets, room, dock],
  )

  const onPickWorld = useCallback((w: WorldId) => navigate(`/explore/${WORLD_SLUG[w]}`), [navigate])
  const onPickPlace = useCallback(
    (id: string) => {
      const target = placeById(id)
      if (!target) return
      const keep = machineId && target.machines.includes(machineId) ? machineId : target.machines[0]
      navigate(`/explore/${WORLD_SLUG[target.world]}/${keep}?at=${id}`)
    },
    [navigate, machineId],
  )
  const onReady = useCallback(() => setReady(true), [])

  const worldNames = { moon: t.worlds.moon.name, mars: t.worlds.mars.name, deep: t.worlds.deep.name }

  return (
    <div className={`stage-layout view-${world ? 'world' : view}`} data-sheet={sheet >= SHEET_MAX ? 'full' : undefined} data-panel={world && isPanelHidden ? 'hidden' : undefined} style={{ '--sheet-h': `${sheet * 100}dvh`, '--dock-h': `${dock}px` } as CSSProperties}>
      <div className={ready || !stageOk ? 'stage is-ready' : 'stage'}>
        {stageOk ? (
          <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Stage
                view={view}
                insets={insets}
                machineId={machineId}
                placeId={placeId}
                reducedMotion={reducedMotion}
                dir={dir}
                worldNames={worldNames}
                control={control}
                onPickWorld={onPickWorld}
                onPickPlace={onPickPlace}
                onReady={onReady}
                paused={mode !== 'globe'}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div className="stage-fallback" />
        )}
        {stageOk && !ready && (
          <p className="stage-status" role="status">
            {t.explore.loadingStage}
          </p>
        )}
      </div>
      {stageOk && world && mode === 'globe' && (
        <div className="stage-controls" role="group" aria-label={t.explore.controls}>
          <button type="button" className="icon-btn" onClick={() => control.current?.rotate(-0.5)}>
            <Icon name="rotateLeft" />
            <span className="sr-only">{t.explore.rotateLeft}</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => control.current?.rotate(0.5)}>
            <Icon name="rotateRight" />
            <span className="sr-only">{t.explore.rotateRight}</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => control.current?.zoom(0.8)}>
            <Icon name="plus" />
            <span className="sr-only">{t.explore.zoomIn}</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => control.current?.zoom(1.25)}>
            <Icon name="minus" />
            <span className="sr-only">{t.explore.zoomOut}</span>
          </button>
        </div>
      )}
      <div className="stage-content">
        <Outlet context={{ stageOk, sheet, setSheet, reportRoom, reportDock: setDock, isPanelHidden, togglePanel, mode, setMode } satisfies StageOutlet} />
      </div>
    </div>
  )
}
