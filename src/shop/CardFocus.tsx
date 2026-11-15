import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { onFrame } from '../lib/frameTicker'
import { useReducedMotion } from '../lib/useReducedMotion'
import { usePrefs } from '../state/prefs'
import { MemoryCard } from './MemoryCard'

interface Props {
  /** The cards that can be browsed with Previous and Next, in order. */
  cards: Machine[]
  /** The card opened, and the element it flies out from (and back to on closing). */
  open: { machine: Machine; from: HTMLElement } | null
  onIndex: (machine: Machine) => void
  onClose: () => void
}

const OPEN_RESPONSE = 0.42
const OPEN_DAMPING = 0.9
/** Longest frame taken into account, and the largest integration step, in seconds. */
const MAX_FRAME = 0.1
const SUBSTEP = 1 / 120

/** A card shown large in the middle of the screen: it flies out of the grid and back into it. */
export function CardFocus({ cards, open, onIndex, onClose }: Props) {
  const { t, fmt, dir } = useI18n()
  const { found } = usePrefs()
  const reducedMotion = useReducedMotion()
  const dialog = useRef<HTMLDialogElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const anim = useRef({ p: 0, v: 0, target: 0, stop: null as null | (() => void), done: null as null | (() => void) })
  const [slide, setSlide] = useState<'prev' | 'next' | null>(null)
  const machine = open?.machine
  const index = machine ? cards.indexOf(machine) : -1
  const [before, after = ''] = t.shop.cardOf.split('{n}')

  /** Places the card between its spot in the grid (p = 0) and the middle of the screen (p = 1). */
  const paint = useCallback(() => {
    const el = stage.current
    const from = open?.from
    const p = anim.current.p
    if (!el || !from) return
    const a = from.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const s = a.width / Math.max(1, b.width)
    const dx = a.left + a.width / 2 - (b.left + b.width / 2)
    const dy = a.top + a.height / 2 - (b.top + b.height / 2)
    el.style.transform = `translate(${(dx * (1 - p)).toFixed(1)}px, ${(dy * (1 - p)).toFixed(1)}px) scale(${(s + (1 - s) * p).toFixed(4)})`
    dialog.current?.style.setProperty('--focus', Math.min(1, Math.max(0, p)).toFixed(3))
  }, [open])

  const animateTo = useCallback(
    (target: number, done?: () => void) => {
      const a = anim.current
      a.target = target
      a.done = done ?? null
      if (reducedMotion) {
        a.p = target
        a.v = 0
        paint()
        a.done?.()
        return
      }
      if (a.stop) return
      let last = 0
      a.stop = onFrame((now) => {
        // Real elapsed time in small steps, so the flight keeps its timing even when frames drop.
        const elapsed = last ? Math.min(MAX_FRAME, (now - last) / 1000) : 1 / 60
        last = now
        const omega = (2 * Math.PI) / OPEN_RESPONSE
        const n = Math.ceil(elapsed / SUBSTEP)
        for (let i = 0; i < n; i++) {
          const dt = elapsed / n
          a.v += (-omega * omega * (a.p - a.target) - 2 * OPEN_DAMPING * omega * a.v) * dt
          a.p += a.v * dt
        }
        if (Math.abs(a.p - a.target) < 0.004 && Math.abs(a.v) < 0.05) {
          a.p = a.target
          a.v = 0
          paint()
          a.stop?.()
          a.stop = null
          const finish = a.done
          a.done = null
          finish?.()
          return
        }
        paint()
      })
    },
    [paint, reducedMotion],
  )

  // Opening: the dialog appears, the card starts on its spot in the grid and flies to the middle.
  useLayoutEffect(() => {
    const d = dialog.current
    if (!open || !d) return
    if (!d.open) {
      d.showModal()
      anim.current.p = 0
      paint()
      animateTo(1)
    }
  }, [open, paint, animateTo])

  useEffect(() => () => anim.current.stop?.(), [])

  const close = useCallback(() => {
    // The card flies back to where it came from, then the dialog goes.
    animateTo(0, () => {
      dialog.current?.close()
      onClose()
    })
  }, [animateTo, onClose])

  const go = (step: 1 | -1) => {
    const next = cards[(index + step + cards.length) % cards.length]
    setSlide(step === 1 ? 'next' : 'prev')
    onIndex(next)
  }

  return (
    <dialog
      ref={dialog}
      className="cf"
      aria-label={machine ? fmt(t.shop.focusTitle, { name: t.machines[machine.id].name }) : undefined}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      onKeyDown={(e) => {
        const isRtl = dir === 'rtl'
        if (e.key === 'ArrowRight') go(isRtl ? -1 : 1)
        else if (e.key === 'ArrowLeft') go(isRtl ? 1 : -1)
      }}
    >
      {machine && (
        <>
          <button type="button" className="cf-close" onClick={close} aria-label={t.common.close}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <div ref={stage} className="cf-stage">
            <div key={machine.id} className={slide ? `cf-card is-${slide}` : 'cf-card'}>
              <MemoryCard machine={machine} price={null} size="large" isCollected={found.includes(machine.id)} />
            </div>
          </div>
          <p className="cf-hint">{t.shop.dragHint}</p>
          <div className="cf-nav">
            <button type="button" className="cf-arrow" onClick={() => go(-1)} aria-label={t.shop.prevCard}>
              <svg className="icon-flip" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="cf-count">
              {before}
              <bdi dir="ltr">{`${String(index + 1).padStart(2, '0')} / ${cards.length}`}</bdi>
              {after}
            </span>
            <button type="button" className="cf-arrow" onClick={() => go(1)} aria-label={t.shop.nextCard}>
              <svg className="icon-flip" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}

