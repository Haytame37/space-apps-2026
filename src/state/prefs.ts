import { createContext, useContext } from 'react'
import type { MachineId, WorldId } from '../data/machines'

export type Profile = 'kid' | 'teen' | 'adult'

export interface PrefsState {
  profile: Profile | null
  found: MachineId[]
  badges: WorldId[]
}

export interface Prefs extends PrefsState {
  setProfile: (profile: Profile) => void
  markFound: (id: MachineId) => void
  awardBadge: (world: WorldId) => void
}

export const PrefsContext = createContext<Prefs | null>(null)

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider')
  return ctx
}
