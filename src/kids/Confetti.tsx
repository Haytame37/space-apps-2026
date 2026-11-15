import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'
import { onConfetti } from './confettiBus'

const COLOURS = ['#ffd23f', '#ff7a6b', '#3ddbb4', '#5ee7ff', '#b79cff', '#ffffff']
const COUNT = 110
const LIFE = 130

interface Bit {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  c: string
  a: number
  life: number
}

/** A shower of confetti over the page when a game is won. Nothing falls when motion is reduced. */
export function Confetti() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    let bits: Bit[] = []
    let frame = 0
    const step = () => {
      const cv = canvas.current
      const ctx = cv?.getContext('2d')
      if (!cv || !ctx) return
      ctx.clearRect(0, 0, cv.width, cv.height)
      bits = bits.filter((b) => b.life < LIFE && b.y < cv.height + 20)
      for (const b of bits) {
        b.vy += 0.32
        b.x += b.vx
        b.y += b.vy
        b.vx *= 0.985
        b.a += 0.2
        b.life++
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.a)
        ctx.fillStyle = b.c
        ctx.globalAlpha = Math.max(0, 1 - b.life / LIFE)
        ctx.fillRect(-b.r, -b.r / 2, b.r * 2, b.r)
        ctx.restore()
      }
      frame = bits.length ? requestAnimationFrame(step) : 0
    }
    const off = onConfetti(() => {
      const cv = canvas.current
      if (!cv) return
      cv.width = innerWidth
      cv.height = innerHeight
      for (let i = 0; i < COUNT; i++) {
        bits.push({
          x: innerWidth / 2 + (Math.random() - 0.5) * 200,
          y: innerHeight * 0.35,
          vx: (Math.random() - 0.5) * 14,
          vy: -6 - Math.random() * 10,
          r: 4 + Math.random() * 6,
          c: COLOURS[i % COLOURS.length],
          a: Math.random() * 6,
          life: 0,
        })
      }
      if (!frame) frame = requestAnimationFrame(step)
    })
    return () => {
      off()
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return <canvas ref={canvas} className="kid-confetti" aria-hidden="true" />
}
