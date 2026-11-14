export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Shuffle that never returns the input order (for lists of two or more). */
export function scramble<T>(items: readonly T[]): T[] {
  if (items.length < 2) return [...items]
  for (let tries = 0; tries < 20; tries++) {
    const out = shuffle(items)
    if (out.some((item, i) => item !== items[i])) return out
  }
  return [...items.slice(1), items[0]]
}
