import { lazy, Suspense, useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { machineById, placeById, WORLD_SLUG, worldFromSlug, type WorldId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { useReducedMotion } from '../lib/useReducedMotion'
import { webglAvailable } from '../lib/webgl'
import type { StageControl, StageInsets, StageView } from './Stage'

const Stage = lazy(() => import('./Stage'))

function subscribeResize(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

/** Mirrors the CSS: header height, side panel on wide screens, bottom sheet on phones. */
function useInsets(): StageInsets {
  const width = useSyncExternalStore(subscribeResize, () => window.innerWidth)
  const height = useSyncExternalStore(subscribeResize, () => window.innerHeight)
  return useMemo(
    () =>
      width >= 900
        ? { top: 64, bottom: 0, start: 0, end: Math.min(500, width * 0.5) }
        : { top: 96, bottom: height * 0.56, start: 0, end: 0 },
    [width, height],
  )
}

export interface StageOutlet {
  /** False when the device cannot draw the 3D view. */
  stageOk: boolean
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
  const insets = useInsets()

  const [, first, worldSlug, machineSlug] = location.pathname.split('/')
  const world = first === 'explore' ? worldFromSlug(worldSlug) : undefined
  const view: StageView = world ?? (first === 'explore' ? 'choose' : 'home')
  const machine = world ? machineById(machineSlug) : undefined
  const machineId = machine && machine.world === world ? machine.id : undefined
  const place = machineId ? placeById(search.get('at')) : undefined
  const placeId = place && place.machines.includes(machineId!) ? place.id : undefined

  const stageOk = webglAvailable() && !failed

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
    <div className={`stage-layout view-${world ? 'world' : view}`}>
      <div className="stage">
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
      {stageOk && world && (
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
        <Outlet context={{ stageOk } satisfies StageOutlet} />
      </div>
    </div>
  )
}
