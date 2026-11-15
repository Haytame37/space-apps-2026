// Draws "Asteroid Run" on a canvas, in world units (360 × 540).

import { MACHINES, type MachineId } from '../../data/machines'
import { ROCKET, WORLD, ZONES, type Entity, type GameState } from './engine'

/** Sky colours of each zone, top to bottom. */
const SKIES: Record<(typeof ZONES)[number]['id'], [string, string]> = {
  moon: ['#0b1440', '#04060d'],
  belt: ['#2a1a12', '#07050a'],
  jupiter: ['#2b1630', '#08040d'],
  deep: ['#1a0f40', '#020108'],
}

/** Three layers of background stars; far ones move slowly, near ones fast. */
const LAYERS = [0.15, 0.35, 0.7].map((depth, layer) => {
  let seed = 11 + layer * 97
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return { depth, stars: Array.from({ length: 40 - layer * 10 }, () => ({ x: rnd() * WORLD.width, y: rnd() * WORLD.height, s: 0.6 + layer * 0.5 + rnd() * 0.6 })) }
})

const photos = new Map<MachineId, HTMLImageElement>()
/** NASA photos of the machines, loaded once, for the golden badges. */
export function preloadPhotos() {
  for (const m of MACHINES) {
    if (photos.has(m.id)) continue
    const img = new Image()
    img.src = m.image.src
    photos.set(m.id, img)
  }
}

function sky(ctx: CanvasRenderingContext2D, g: GameState, calm: boolean) {
  const [top, bottom] = SKIES[ZONES[g.zone].id]
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD.height)
  grad.addColorStop(0, top)
  grad.addColorStop(1, bottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WORLD.width, WORLD.height)

  const flown = g.distance * 10
  for (const layer of LAYERS) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 + layer.depth * 0.6})`
    for (const s of layer.stars) {
      const y = (s.y + flown * layer.depth) % WORLD.height
      // Fast near stars stretch into streaks, unless motion is reduced.
      const streak = calm ? s.s : Math.max(s.s, (g.speed / 430) * layer.depth * 9)
      ctx.fillRect(s.x, y, s.s, streak)
    }
  }
  scenery(ctx, g)
}

/** A landmark per zone: the Moon falling behind, dust, Jupiter, a far nebula. */
function scenery(ctx: CanvasRenderingContext2D, g: GameState) {
  const id = ZONES[g.zone].id
  const into = g.distance - ZONES[g.zone].from
  ctx.save()
  if (id === 'moon') {
    const y = WORLD.height * 0.85 + into * 0.6
    ctx.fillStyle = '#cfd6e6'
    ctx.beginPath()
    ctx.arc(WORLD.width * 0.15, y, 120, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(120,130,160,0.5)'
    for (const [dx, dy, r] of [[-30, -60, 16], [25, -20, 22], [-50, 10, 12], [40, -80, 9]]) {
      ctx.beginPath()
      ctx.arc(WORLD.width * 0.15 + dx, y + dy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (id === 'jupiter') {
    const y = -120 + into * 0.25
    const cx = WORLD.width * 0.82
    ctx.beginPath()
    ctx.arc(cx, y, 110, 0, Math.PI * 2)
    ctx.clip()
    const bands = ['#e8c79a', '#c98a5a', '#f1dcb8', '#b8734a', '#e9cfa6', '#c48b62']
    bands.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.fillRect(cx - 110, y - 110 + i * 37, 220, 37)
    })
    ctx.fillStyle = '#b5523b'
    ctx.beginPath()
    ctx.ellipse(cx - 30, y + 30, 22, 12, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (id === 'belt') {
    ctx.fillStyle = 'rgba(201,162,122,0.07)'
    ctx.fillRect(0, 0, WORLD.width, WORLD.height)
  } else {
    const grad = ctx.createRadialGradient(WORLD.width * 0.7, WORLD.height * 0.3, 10, WORLD.width * 0.7, WORLD.height * 0.3, 220)
    grad.addColorStop(0, 'rgba(176,107,255,0.28)')
    grad.addColorStop(1, 'rgba(176,107,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, WORLD.width, WORLD.height)
  }
  ctx.restore()
}

function rock(ctx: CanvasRenderingContext2D, e: Entity) {
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(e.rot)
  ctx.beginPath()
  e.shape.forEach((k, i) => {
    const a = (i / e.shape.length) * Math.PI * 2
    const x = Math.cos(a) * e.r * k
    const y = Math.sin(a) * e.r * k
    if (i) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  })
  ctx.closePath()
  const grad = ctx.createRadialGradient(-e.r * 0.4, -e.r * 0.4, 2, 0, 0, e.r)
  grad.addColorStop(0, '#a88d72')
  grad.addColorStop(1, '#4a3a2e')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = '#2c2119'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = 'rgba(40,28,20,0.55)'
  ctx.beginPath()
  ctx.arc(e.r * 0.25, e.r * 0.1, e.r * 0.22, 0, Math.PI * 2)
  ctx.arc(-e.r * 0.3, e.r * 0.35, e.r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function star(ctx: CanvasRenderingContext2D, e: Entity, time: number) {
  const pulse = 1 + Math.sin(time * 6 + e.x) * 0.12
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(e.rot * 0.3)
  ctx.scale(pulse, pulse)
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? e.r * 0.45 : e.r
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fillStyle = '#ffd23f'
  ctx.shadowColor = '#ffd23f'
  ctx.shadowBlur = 12
  ctx.fill()
  ctx.restore()
}

function shield(ctx: CanvasRenderingContext2D, e: Entity, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.beginPath()
  ctx.arc(0, 0, e.r + Math.sin(time * 5) * 1.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(94,231,255,0.25)'
  ctx.strokeStyle = '#5ee7ff'
  ctx.lineWidth = 2.5
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(-2, -7, 4, 14)
  ctx.fillRect(-7, -2, 14, 4)
  ctx.restore()
}

/** A golden badge with the machine's real NASA photo. */
function machine(ctx: CanvasRenderingContext2D, e: Entity, time: number) {
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.beginPath()
  ctx.arc(0, 0, e.r + 6 + Math.sin(time * 4) * 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,215,122,0.25)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, e.r, 0, Math.PI * 2)
  ctx.save()
  ctx.clip()
  const img = e.machine && photos.get(e.machine)
  if (img?.complete && img.naturalWidth) {
    const s = (e.r * 2) / Math.min(img.naturalWidth, img.naturalHeight)
    ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s)
  } else {
    ctx.fillStyle = '#3b2f12'
    ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2)
  }
  ctx.restore()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#ffd77a'
  ctx.stroke()
  ctx.restore()
}

/** Our rocket: white body, the AYYUR crescent in the porthole, coral fins and a flickering flame. */
function rocket(ctx: CanvasRenderingContext2D, g: GameState) {
  const k = g.rocket
  if (g.isOver) return
  // Blinks while it cannot be hit.
  if (k.safe > 0 && Math.floor(k.safe * 10) % 2 === 0 && g.time > 1) return
  const r = ROCKET.radius
  ctx.save()
  ctx.translate(k.x, k.y)
  ctx.rotate(k.tilt)
  // Drawn a little larger than its hit circle: easier to see, still forgiving.
  ctx.scale(1.35, 1.35)
  const flame = 14 + Math.sin(g.time * 40) * 4 + g.speed / 60
  const fire = ctx.createLinearGradient(0, r, 0, r + flame)
  fire.addColorStop(0, '#fff3b0')
  fire.addColorStop(0.4, '#ff9a3d')
  fire.addColorStop(1, 'rgba(255,80,40,0)')
  ctx.fillStyle = fire
  ctx.beginPath()
  ctx.moveTo(-6, r)
  ctx.quadraticCurveTo(0, r + flame * 1.2, 6, r)
  ctx.fill()
  ctx.fillStyle = '#ff6b5e'
  ctx.beginPath()
  ctx.moveTo(-r, r + 2)
  ctx.lineTo(-r * 0.55, r * 0.1)
  ctx.lineTo(-r * 0.55, r)
  ctx.closePath()
  ctx.moveTo(r, r + 2)
  ctx.lineTo(r * 0.55, r * 0.1)
  ctx.lineTo(r * 0.55, r)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f4f6ff'
  ctx.beginPath()
  ctx.moveTo(0, -r * 2)
  ctx.bezierCurveTo(r * 0.9, -r * 1.3, r * 0.75, r * 0.6, r * 0.55, r)
  ctx.lineTo(-r * 0.55, r)
  ctx.bezierCurveTo(-r * 0.75, r * 0.6, -r * 0.9, -r * 1.3, 0, -r * 2)
  ctx.fill()
  ctx.fillStyle = '#5ee7ff'
  ctx.beginPath()
  ctx.arc(0, -r * 0.5, r * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0b1440'
  ctx.beginPath()
  ctx.arc(0, -r * 0.5, r * 0.26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5ee7ff'
  ctx.beginPath()
  ctx.arc(r * 0.1, -r * 0.55, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function render(ctx: CanvasRenderingContext2D, g: GameState, calm: boolean) {
  ctx.save()
  if (g.shake > 0 && !calm) ctx.translate((Math.random() - 0.5) * 10 * g.shake, (Math.random() - 0.5) * 10 * g.shake)
  sky(ctx, g, calm)
  for (const e of g.entities) {
    if (e.kind === 'rock') rock(ctx, e)
    else if (e.kind === 'star') star(ctx, e, g.time)
    else if (e.kind === 'shield') shield(ctx, e, g.time)
    else machine(ctx, e, g.time)
  }
  rocket(ctx, g)
  for (const p of g.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5))
    ctx.fillStyle = p.color
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)
  }
  ctx.restore()
}
