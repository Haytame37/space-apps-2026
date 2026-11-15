import { useCallback, useState } from 'react'

/** A game played again starts from scratch: each round is a fresh copy of the game, keyed by its number. */
export function useRound(): [number, () => void] {
  const [round, setRound] = useState(0)
  const again = useCallback(() => setRound((r) => r + 1), [])
  return [round, again]
}
