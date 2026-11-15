import { useEffect, useId, useRef, type CSSProperties } from 'react'
import {
  AYYUR_NAME,
  bell,
  BURST_AT,
  clamp,
  CRESCENT_PATH,
  inOutCubic,
  INTRO_END,
  lerp,
  makeSparks,
  outBack,
  outCubic,
  probePos,
  seg,
  shipDepth,
  SHADOW_FROM,
  SHADOW_TO,
  sparkAt,
  TIP,
} from '../lib/ayyurMotion'
import { onFrame } from '../lib/frameTicker'
import { useReducedMotion } from '../lib/useReducedMotion'

export type AyyurVariant = 'static' | 'orbit' | 'intro'

interface Props {
  /** `static`: the crescent alone. `orbit`: a ship circles it. `intro`: the full arrival scene, then `orbit`. */
  variant?: AyyurVariant
  /** Width of the crescent: pixels, or any CSS length. */
  size?: number | string
  /** Shows the name AYYUR under the crescent. */
  withName?: boolean
  /** Called when the intro ends (straight away when motion is reduced). */
  onDone?: () => void
  /** Hidden from screen readers, when the name AYYUR is already written next to it. */
  decorative?: boolean
  className?: string
}

/** Below this width the trail and the halo would only blur the mark. */
const SMALL = 48
const SPARKS = makeSparks(36)
/** Longest clock step, in seconds. */
const MAX_STEP = 1

/** Only one intro plays at a time; any other one shows the orbit straight away. */
let isIntroPlaying = false

function Ship({ layer }: { layer: 'front' | 'back' }) {
  return (
    <g data-a={`probe-${layer}`} opacity="0">
      <g data-a={`ship-${layer}`}>
        <path data-a={`flame-${layer}`} className="ayyur-flame" d="M-9-2.6L-20 0L-9 2.6Z" />
        <path className="ayyur-fin" d="M-8-4L-14-9.5L-3-4.6Z" />
        <path className="ayyur-fin" d="M-8 4L-14 9.5L-3 4.6Z" />
        <path className="ayyur-hull" d="M14 0C9-5.4 0-6-9-4.2L-9 4.2C0 6 9 5.4 14 0Z" />
        <circle className="ayyur-fin" cx="4" r="2.2" />
      </g>
    </g>
  )
}

function Trail({ layer, count }: { layer: 'front' | 'back'; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} data-a={`ghost-${layer}`} className="ayyur-ghost" r={(2.6 * (1 - i / 16)).toFixed(2)} opacity="0" />
      ))}
    </>
  )
}

/** The team's animated logo: a crescent moon, a small ship in orbit, and the name AYYUR. */
export function AyyurLogo({ variant = 'orbit', size = 48, withName = false, onDone, decorative = false, className }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLSpanElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  const isSmall = typeof size === 'number' && size < SMALL
  const isIntro = variant === 'intro'
  const ghosts = isSmall ? 0 : isIntro ? 14 : 8
  const style = { '--ayyur-size': typeof size === 'number' ? `${size}px` : size } as CSSProperties
  const id = (name: string) => `ayyur-${name}-${uid}`
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'AYYUR' }

  useEffect(() => {
    const host = root.current
    const svg = host?.querySelector<SVGSVGElement>('.ayyur-mark')
    if (variant === 'static' || !host || !svg) return

    const one = <T extends Element>(key: string) => svg.querySelector<T>(`[data-a="${key}"]`)
    const many = <T extends Element>(key: string) => Array.from(svg.querySelectorAll<T>(`[data-a="${key}"]`))
    const layers = (['front', 'back'] as const).map((layer) => ({
      probe: one<SVGGElement>(`probe-${layer}`),
      ship: one<SVGGElement>(`ship-${layer}`),
      flame: one<SVGPathElement>(`flame-${layer}`),
      ghosts: many<SVGCircleElement>(`ghost-${layer}`),
    }))
    const el = {
      halo: one<SVGCircleElement>('halo'),
      ring: one<SVGCircleElement>('ring'),
      shock: one<SVGCircleElement>('shock'),
      moon: one<SVGGElement>('moon'),
      shadow: one<SVGCircleElement>('shadow'),
      flare: one<SVGGElement>('flare'),
      flareIn: one<SVGGElement>('flare-in'),
      sparks: many<SVGCircleElement>('spark'),
    }
    const name = host.querySelector<HTMLElement>('.ayyur-name')
    const letters = name ? Array.from(name.querySelectorAll<HTMLElement>('span')) : []

    // Distance the crescent sits lower, to be centred alone before the name appears; and its width.
    let liftY = 0
    let width = 0
    let alive = true
    const measure = () => {
      if (!alive) return
      width = svg.getBoundingClientRect().width
      liftY = name ? (name.offsetHeight + parseFloat(getComputedStyle(host).rowGap || '0')) / 2 : 0
    }
    measure()
    document.fonts?.ready.then(measure, () => {})

    let heading = 0
    let isLettersSettled = false
    let isSparksHidden = false

    const render = (t: number) => {
      const idle = Math.max(0, t - INTRO_END)

      // Ship and exhaust trail: it points where it flies and passes behind the crescent on the far side.
      const pOp = seg(t, 0.3, 0.25)
      const P = probePos(t)
      const N = probePos(t + 0.012)
      const isMoving = Math.hypot(N[0] - P[0], N[1] - P[1]) > 0.004
      if (isMoving) heading = (Math.atan2(N[1] - P[1], N[0] - P[0]) * 180) / Math.PI
      const depth = shipDepth(t)
      const isBehind = depth < -0.05
      const boost = isSmall ? 1.5 : 1
      layers.forEach(({ probe, ship, flame }, i) => {
        const isShown = (i === 1) === isBehind
        probe?.setAttribute('opacity', isShown ? (pOp * (isBehind ? 0.8 : 1)).toFixed(3) : '0')
        if (!isShown) return
        probe?.setAttribute('transform', `translate(${P[0].toFixed(2)} ${P[1].toFixed(2)})`)
        ship?.setAttribute('transform', `rotate(${heading.toFixed(2)}) scale(${((1 + 0.22 * depth) * boost).toFixed(3)})`)
        flame?.setAttribute('transform', `scale(${(isMoving ? 0.75 + 0.5 * Math.abs(Math.sin(t * 38)) : 0.25).toFixed(3)} 1)`)
      })
      const [front, back] = layers
      front.ghosts.forEach((g, i) => {
        const at = Math.max(0.3, t - 0.05 - (i + 1) * 0.024)
        const q = probePos(at)
        const isGhostBehind = shipDepth(at) < -0.05
        const op = (pOp * 0.6 * (1 - i / front.ghosts.length)).toFixed(3)
        for (const [circle, isVisible] of [[g, !isGhostBehind], [back.ghosts[i], isGhostBehind]] as const) {
          if (!circle) continue
          circle.setAttribute('opacity', isVisible ? op : '0')
          if (isVisible) {
            circle.setAttribute('cx', q[0].toFixed(2))
            circle.setAttribute('cy', q[1].toFixed(2))
          }
        }
      })

      // Orbit ring drawn by the ship, then it dissolves into the lit disc.
      el.ring?.setAttribute('stroke-dashoffset', (1 - inOutCubic(seg(t, 1.3, 1.4))).toFixed(4))
      el.ring?.setAttribute('opacity', (seg(t, 1.3, 0.1) * (1 - seg(t, 2.8, 0.7))).toFixed(3))

      // The full moon lights up, then the shadow slides in and carves the crescent.
      el.moon?.setAttribute('opacity', outCubic(seg(t, 2.55, 0.45)).toFixed(3))
      const sh = inOutCubic(seg(t, 3.0, 1.15))
      el.shadow?.setAttribute('cx', lerp(SHADOW_FROM.x, SHADOW_TO.x, sh).toFixed(2))
      el.shadow?.setAttribute('cy', lerp(SHADOW_FROM.y, SHADOW_TO.y, sh).toFixed(2))

      // Halo: a flash when the disc lights, then a slow breath.
      const flash = bell(seg(t, 2.5, 0.9))
      const breath = 0.5 + 0.14 * Math.sin(t * 1.3)
      el.halo?.setAttribute('opacity', clamp(seg(t, 2.5, 0.5) * breath + flash * 0.5).toFixed(3))
      el.halo?.setAttribute('r', (170 + 40 * flash).toFixed(1))

      // Glint on the tip, shock ring and burst of sparks.
      const fl = seg(t, BURST_AT, 0.9)
      const flS = fl <= 0 ? 0 : fl < 0.35 ? outBack(fl / 0.35) : lerp(1, 0, outCubic((fl - 0.35) / 0.65))
      el.flare?.setAttribute('opacity', fl > 0 && fl < 1 ? '1' : '0')
      el.flareIn?.setAttribute('transform', `scale(${flS.toFixed(3)})`)
      const sk = seg(t, BURST_AT, 1.1)
      el.shock?.setAttribute('r', lerp(100, 210, outCubic(sk)).toFixed(1))
      el.shock?.setAttribute('opacity', (sk > 0 && sk < 1 ? (1 - sk) * 0.8 : 0).toFixed(3))
      const age = t - BURST_AT
      const isBursting = age >= 0 && age < 2
      if (isBursting || !isSparksHidden) {
        el.sparks.forEach((c, i) => {
          const { x, y, k } = sparkAt(SPARKS[i], age)
          c.setAttribute('opacity', k.toFixed(3))
          if (k <= 0) return
          c.setAttribute('cx', x.toFixed(2))
          c.setAttribute('cy', y.toFixed(2))
          c.setAttribute('r', (SPARKS[i].r * (0.5 + k)).toFixed(2))
          c.setAttribute('class', SPARKS[i].warm ? 'ayyur-spark is-warm' : k > 0.6 ? 'ayyur-spark is-hot' : 'ayyur-spark')
        })
        isSparksHidden = !isBursting
      }

      // The crescent starts large and centred, then rises to make room for the name; then it floats.
      const st = inOutCubic(seg(t, 4.2, 1.0))
      const pulse = 1 + 0.05 * bell(seg(t, 2.55, 0.6))
      const float = t > INTRO_END ? Math.sin(idle * 0.9) * 4 * (width / 290) : 0
      svg.style.transform = `translate3d(0, ${(lerp(liftY, 0, st) + float).toFixed(2)}px, 0) scale(${(lerp(1.16, 1, st) * pulse).toFixed(4)})`

      // Name: the letters rise out of blur one by one, then a wave of light runs across.
      if (!name || isLettersSettled) return
      name.style.setProperty('--ls', `${lerp(0.5, 0.22, outCubic(seg(t, 4.5, 1.5))).toFixed(3)}em`)
      letters.forEach((s, i) => {
        const p = outCubic(seg(t, 4.5 + i * 0.11, 0.75))
        const g = bell(seg(t, 5.45 + i * 0.09, 0.6))
        s.style.opacity = p.toFixed(3)
        s.style.transform = `translate3d(0, ${((1 - p) * 0.6).toFixed(3)}em, 0) scale(${(1 + g * 0.06).toFixed(3)})`
        s.style.filter = p < 1 ? `blur(${((1 - p) * 0.16).toFixed(3)}em)` : 'none'
        s.style.textShadow = g > 0.01 ? `0 0 ${(g * 0.4).toFixed(3)}em var(--accent)` : 'none'
      })
      if (t > INTRO_END) isLettersSettled = true
    }

    const isPlaying = variant === 'intro' && !reducedMotion && !isIntroPlaying
    if (isPlaying) isIntroPlaying = true
    let t = isPlaying ? 0 : INTRO_END
    let isDone = !isPlaying

    render(t)
    if (reducedMotion) {
      // The final picture, without movement.
      if (variant === 'intro') done.current?.()
      return () => {
        alive = false
      }
    }
    if (isDone && variant === 'intro') done.current?.()

    // The clock only runs while the logo is on screen: a closed dialog or a hidden tab costs nothing.
    let last = 0
    let stop: (() => void) | null = null
    const tick = (now: number) => {
      // Real time: a slow frame while the page loads must not slow the intro down.
      // Only a long gap (a background tab) is cut short.
      const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) : 0
      last = now
      t += dt
      render(t)
      if (!isDone && t >= INTRO_END) {
        isDone = true
        isIntroPlaying = false
        done.current?.()
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !stop) {
        last = 0
        stop = onFrame(tick)
      } else if (!entry.isIntersecting && stop) {
        stop()
        stop = null
      }
    })
    observer.observe(host)

    return () => {
      alive = false
      observer.disconnect()
      stop?.()
      if (isPlaying && !isDone) isIntroPlaying = false
    }
  }, [variant, reducedMotion, isSmall])

  const rootClass = ['ayyur-logo', className].filter(Boolean).join(' ')

  if (variant === 'static') {
    return (
      <span ref={root} className={rootClass} style={style} {...a11y} dir="ltr">
        <svg className="ayyur-mark" viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
          <path fill="currentColor" d={CRESCENT_PATH} />
        </svg>
        {withName && <Name />}
      </span>
    )
  }

  return (
    <span ref={root} className={rootClass} style={style} {...a11y} dir="ltr">
      <svg className="ayyur-mark" viewBox="-110 -110 220 220" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={id('fill')} gradientUnits="userSpaceOnUse" x1="-90" y1="-70" x2="70" y2="100">
            <stop className="ayyur-s1" offset="0" />
            <stop className="ayyur-s2" offset="0.5" />
            <stop className="ayyur-s3" offset="1" />
          </linearGradient>
          {!isSmall && (
            <radialGradient id={id('halo')}>
              <stop className="ayyur-h" offset="0" stopOpacity="0.42" />
              <stop className="ayyur-h" offset="0.55" stopOpacity="0.12" />
              <stop className="ayyur-h" offset="1" stopOpacity="0" />
            </radialGradient>
          )}
          {isIntro && (
            <>
              <radialGradient id={id('glint')}>
                <stop offset="0" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id={id('phase')} maskUnits="userSpaceOnUse" x="-110" y="-110" width="220" height="220">
                <circle r="100" fill="#fff" />
                <circle data-a="shadow" r="85" cx={SHADOW_FROM.x} cy={SHADOW_FROM.y} fill="#000" />
              </mask>
            </>
          )}
        </defs>
        {!isSmall && <circle data-a="halo" r="170" fill={`url(#${id('halo')})`} opacity="0" />}
        {isIntro && (
          <>
            <circle data-a="shock" className="ayyur-line" r="100" strokeWidth="1.5" opacity="0" />
            <circle
              data-a="ring"
              className="ayyur-line"
              r="100"
              strokeWidth="2.2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              transform="rotate(-90)"
              opacity="0"
            />
          </>
        )}
        <g>
          <Trail layer="back" count={ghosts} />
          <Ship layer="back" />
        </g>
        {isIntro ? (
          <g data-a="moon" opacity="0">
            <circle r="100" fill={`url(#${id('fill')})`} mask={`url(#${id('phase')})`} />
          </g>
        ) : (
          <path d={CRESCENT_PATH} fill={`url(#${id('fill')})`} />
        )}
        <g>
          <Trail layer="front" count={ghosts} />
          <Ship layer="front" />
        </g>
        {isIntro && (
          <>
            <g data-a="flare" transform={`translate(${TIP.x} ${TIP.y})`} opacity="0">
              <g data-a="flare-in">
                <ellipse className="ayyur-ray" rx="58" ry="1.5" />
                <ellipse className="ayyur-ray" rx="1.5" ry="58" />
                <ellipse className="ayyur-ray" rx="22" ry="1.1" transform="rotate(45)" />
                <ellipse className="ayyur-ray" rx="22" ry="1.1" transform="rotate(-45)" />
                <circle r="13" fill={`url(#${id('glint')})`} />
              </g>
            </g>
            <g>
              {SPARKS.map((_, i) => (
                <circle key={i} data-a="spark" className="ayyur-spark" r="1" opacity="0" />
              ))}
            </g>
          </>
        )}
      </svg>
      {withName && <Name isHidden={isIntro && !reducedMotion} />}
    </span>
  )
}

/** The name, one span per letter so the intro can raise them one by one. Hidden until the intro shows it. */
function Name({ isHidden = false }: { isHidden?: boolean }) {
  return (
    <span className="ayyur-name" aria-hidden="true">
      {[...AYYUR_NAME].map((ch, i) => (
        <span key={i} style={isHidden ? { opacity: 0 } : undefined}>
          {ch}
        </span>
      ))}
    </span>
  )
}

