import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { machineById, type MachineId } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { onFrame } from '../../lib/frameTicker'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { usePrefs } from '../../state/prefs'
import { useKid } from '../kidContext'
import { createGame, MAX_SHIELDS, starsFor, step, STAR_SCORES, WORLD, ZONES, type GameEvent, type GameState, type Input } from '../rocket/engine'
import { preloadPhotos, render } from '../rocket/draw'
import { loadBoard, saveRun, type Board } from '../rocket/scores'
import { useRound } from '../useRound'
import { StarIcon } from '../StarIcon'
import { GameHead } from './shared'
import { RocketEnd } from './RocketEnd'

type Phase = 'ready' | 'countdown' | 'flying' | 'paused' | 'over'

/** Longest step the game takes in one frame: a slow frame does not let a rock jump over the rocket. */
const MAX_DT = 1 / 30
const COUNTDOWN_MS = 2400
const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
  q: [-1, 0],
  z: [0, -1],
}

export interface RunResult {
  /** When the run ended: it marks this run in the list of best missions. */
  at: string
  score: number
  distance: number
  machines: MachineId[]
  stars: number
  isRecord: boolean
  board: Board
}

/** "Asteroid Run": fly through the sky of the Moon, the asteroid belt and Jupiter, dodge the rocks. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt, num } = useI18n()
  const { say, win, sfx } = useKid()
  const { markFound } = usePrefs()
  const reducedMotion = useReducedMotion()
  const canvas = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const scoreEl = useRef<HTMLSpanElement>(null)
  const game = useRef<GameState>(createGame())
  const input = useRef<Input>({ target: null, keys: { x: 0, y: 0 } })
  const held = useRef(new Set<string>())
  const grab = useRef<{ px: number; py: number; rx: number; ry: number } | null>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [shields, setShields] = useState(MAX_SHIELDS)
  const [zone, setZone] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  const [best] = useState(() => loadBoard().best)
  const phaseRef = useRef(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    preloadPhotos()
    say(t.kids.rocket.intro)
  }, [say, t])

  /** Canvas pixels follow the screen size and its pixel density; the world is scaled to fit. */
  const fit = useCallback(() => {
    const c = canvas.current
    const box = wrap.current
    if (!c || !box) return
    const width = Math.min(box.clientWidth, (window.innerHeight * 0.68 * WORLD.width) / WORLD.height)
    const ratio = window.devicePixelRatio || 1
    c.style.width = `${width}px`
    c.style.height = `${(width * WORLD.height) / WORLD.width}px`
    c.width = Math.round(width * ratio)
    c.height = Math.round((width * WORLD.height * ratio) / WORLD.width)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform((c.width / WORLD.width), 0, 0, c.height / WORLD.height, 0, 0)
    render(ctx, game.current, reducedMotion)
  }, [reducedMotion])

  useEffect(() => {
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [fit])

  const finish = useCallback(() => {
    const g = game.current
    const score = Math.round(g.score)
    const stars = starsFor(score)
    const at = new Date().toISOString()
    const { board, isRecord } = saveRun({ score, distance: Math.round(g.distance), machines: g.machines.length, at })
    setResult({ at, score, distance: Math.round(g.distance), machines: [...g.machines], stars, isRecord, board })
    setPhase('over')
    if (stars > 0) {
      win('rocket', stars, g.machines.at(-1))
      say(isRecord ? t.kids.rocket.sayRecord : t.kids.rocket.sayWell, true)
    } else {
      sfx.play('bad')
      say(fmt(t.kids.rocket.sayAlmost, { n: num(STAR_SCORES[0]) }))
    }
  }, [win, say, sfx, t, fmt, num])

  const react = useCallback(
    (events: GameEvent[]) => {
      for (const e of events) {
        if (e.type === 'star') sfx.play('tap')
        else if (e.type === 'shield') {
          setShields(game.current.shields)
          sfx.play('good')
          say(t.kids.rocket.sayShield)
        } else if (e.type === 'hit') {
          setShields(e.shields)
          if (e.shields > 0) {
            sfx.play('bad')
            say(e.shields === 1 ? t.kids.rocket.sayLast : fmt(t.kids.rocket.sayHit, { n: e.shields }))
          }
        } else if (e.type === 'machine') {
          markFound(e.machine)
          sfx.play('good')
          say(fmt(t.kids.rocket.sayMachine, { name: t.machines[e.machine].name }), true)
        } else if (e.type === 'zone') {
          const index = ZONES.findIndex((z) => z.id === e.zone)
          setZone(index)
          say(fmt(t.kids.rocket.sayZone, { zone: t.kids.rocket.zones[e.zone] }), true)
        } else if (e.type === 'over') finish()
      }
    },
    [sfx, say, t, fmt, markFound, finish],
  )

  // The game loop runs only while flying.
  useEffect(() => {
    if (phase !== 'flying') return
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!ctx) return
    let last = 0
    const stop = onFrame((now) => {
      const dt = last ? Math.min(MAX_DT, (now - last) / 1000) : 1 / 60
      last = now
      const events = step(game.current, input.current, dt)
      render(ctx, game.current, reducedMotion)
      if (scoreEl.current) scoreEl.current.textContent = num(Math.round(game.current.score))
      if (events.length) react(events)
      if (game.current.isOver) {
        // Let the explosion play a moment on screen.
        let fade = 0.8
        const settle = onFrame(() => {
          fade -= 1 / 60
          step(game.current, input.current, 1 / 60)
          render(ctx, game.current, reducedMotion)
          if (fade <= 0) settle()
        })
        stop()
      }
    })
    return stop
  }, [phase, reducedMotion, react, num])

  const start = () => {
    sfx.play('tap')
    if (reducedMotion) {
      setPhase('flying')
      return
    }
    setPhase('countdown')
    window.setTimeout(() => {
      if (phaseRef.current === 'countdown') setPhase('flying')
    }, COUNTDOWN_MS)
  }
  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'flying' ? 'paused' : p === 'paused' ? 'flying' : p))
  }, [])

  // Keys steer; P or Escape pauses. Leaving the tab or the window pauses too.
  useEffect(() => {
    const keys = () => {
      let x = 0
      let y = 0
      for (const k of held.current) {
        const v = KEYS[k]
        if (v) {
          x += v[0]
          y += v[1]
        }
      }
      input.current.keys = { x: Math.sign(x), y: Math.sign(y) }
    }
    const down = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'flying' && phaseRef.current !== 'paused') return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === 'p' || key === 'Escape') {
        e.preventDefault()
        togglePause()
        return
      }
      if (!KEYS[key]) return
      e.preventDefault()
      input.current.target = null
      held.current.add(key)
      keys()
    }
    const up = (e: KeyboardEvent) => {
      held.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key)
      keys()
    }
    const away = () => {
      held.current.clear()
      keys()
      if (phaseRef.current === 'flying') setPhase('paused')
    }
    const hidden = () => document.hidden && away()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', away)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', away)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [togglePause])

  /** From screen pixels to world units. */
  const toWorld = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * WORLD.width, y: ((e.clientY - r.top) / r.height) * WORLD.height }
  }
  // The rocket moves with the finger, 1:1, from where it was: the finger never hides it.
  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== 'flying') return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toWorld(e)
    const k = game.current.rocket
    grab.current = { px: p.x, py: p.y, rx: k.x, ry: k.y }
    input.current.target = { x: k.x, y: k.y }
  }
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const g = grab.current
    if (!g) return
    const p = toWorld(e)
    input.current.target = { x: g.rx + p.x - g.px, y: g.ry + p.y - g.py }
  }
  const onUp = () => {
    grab.current = null
    input.current.target = null
  }

  const zoneId = ZONES[zone].id
  const isPlaying = phase === 'flying' || phase === 'paused' || phase === 'countdown'

  return (
    <>
      <GameHead title={t.kids.games.rocket.name} />
      <div className="kid-board rk-board">
        <div className="rk-hud" aria-hidden={!isPlaying}>
          <p className="rk-score">
            {t.kids.rocket.score} <b><span ref={scoreEl}>0</span></b>
          </p>
          <p className="rk-zone" data-zone={zoneId}>
            {t.kids.rocket.zones[zoneId]}
          </p>
          <p className="rk-shields" role="img" aria-label={fmt(t.kids.rocket.shieldsLeft, { n: shields })}>
            {Array.from({ length: MAX_SHIELDS }, (_, i) => (
              <i key={i} className={i < shields ? 'is-on' : undefined} />
            ))}
          </p>
          {isPlaying && (
            <button type="button" className="rk-pause" onClick={togglePause} aria-pressed={phase === 'paused'}>
              {phase === 'paused' ? t.kids.rocket.resume : t.kids.rocket.pause}
            </button>
          )}
        </div>

        <div ref={wrap} className="rk-stage">
          <canvas
            ref={canvas}
            className="rk-canvas"
            role="img"
            aria-label={t.kids.rocket.canvasLabel}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          {phase === 'ready' && (
            <div className="rk-overlay">
              <p className="rk-best">
                <StarIcon /> {fmt(t.kids.rocket.bestSoFar, { n: num(best) })}
              </p>
              <p>{t.kids.rocket.howTo}</p>
              <button type="button" className="btn primary rk-go" onClick={start}>
                {t.kids.rocket.start}
              </button>
            </div>
          )}
          {phase === 'countdown' && (
            <div className="rk-overlay rk-count" aria-live="assertive">
              <span>3</span>
              <span>2</span>
              <span>1</span>
            </div>
          )}
          {phase === 'paused' && (
            <div className="rk-overlay">
              <p className="rk-paused">{t.kids.rocket.paused}</p>
              <button type="button" className="btn primary rk-go" onClick={togglePause}>
                {t.kids.rocket.resume}
              </button>
            </div>
          )}
        </div>
        <p className="rk-help">{t.kids.rocket.keysHelp}</p>
        {phase === 'over' && result && <RocketEnd result={result} best={best} onAgain={onAgain} machineOf={machineById} />}
      </div>
    </>
  )
}

export function KidRocket() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
