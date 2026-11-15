import { createContext, useContext } from 'react'
import type { MachineId } from '../data/machines'
import type { KidGame } from '../state/prefs'
import type { Sfx } from './useSfx'

export interface Kid {
  /** Makes Tiziri say something; `happy` makes her jump. */
  say: (text: string, happy?: boolean) => void
  /** A game is won: keeps the best score, sticks the machine's sticker, plays the fanfare and the confetti. */
  win: (game: KidGame, stars: number, machine?: MachineId) => void
  sfx: Sfx
}

export const KidContext = createContext<Kid | null>(null)

export function useKid(): Kid {
  const ctx = useContext(KidContext)
  if (!ctx) throw new Error('useKid must be used inside KidLayout')
  return ctx
}
