/**
 * One requestAnimationFrame loop shared by every animated logo on the page
 * (the header, the profile dialog, the loaders), instead of one loop each.
 */
type Tick = (now: number) => void

const subscribers = new Set<Tick>()
let frame = 0

function loop(now: number) {
  for (const tick of subscribers) tick(now)
  frame = subscribers.size > 0 ? requestAnimationFrame(loop) : 0
}

export function onFrame(tick: Tick): () => void {
  subscribers.add(tick)
  if (!frame) frame = requestAnimationFrame(loop)
  return () => {
    subscribers.delete(tick)
    if (subscribers.size === 0 && frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}
