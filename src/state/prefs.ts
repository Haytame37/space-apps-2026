import { createContext, useContext } from 'react'
import type { MachineId, WorldId } from '../data/machines'

export type Profile = 'kid' | 'teen' | 'adult'

/** The games of the kids' corner; each keeps its best score, from 1 to 3 stars. */
export const KID_GAMES = ['mystery', 'memory', 'puzzle', 'rebuild', 'quiz'] as const
export type KidGame = (typeof KID_GAMES)[number]

export interface PrefsState {
  profile: Profile | null
  found: MachineId[]
  badges: WorldId[]
  /** Best score per kids game. */
  stars: Partial<Record<KidGame, number>>
}

export interface Prefs extends PrefsState {
  setProfile: (profile: Profile) => void
  markFound: (id: MachineId) => void
  awardBadge: (world: WorldId) => void
  /** Keeps the best score of a kids game. */
  recordStars: (game: KidGame, stars: number) => void
}

export const PrefsContext = createContext<Prefs | null>(null)

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider')
  return ctx
}
