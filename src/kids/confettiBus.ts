const listeners = new Set<() => void>()

/** Asks the confetti canvas of the kids' corner for a burst. */
export function burstConfetti() {
  listeners.forEach((fn) => fn())
}

export function onConfetti(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
