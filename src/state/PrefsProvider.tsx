import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MACHINES, WORLDS, type MachineId, type WorldId } from '../data/machines'
import { PrefsContext, type Prefs, type PrefsState, type Profile } from './prefs'

const STORAGE_KEY = 'space-memory:prefs:v1'
const EMPTY: PrefsState = { profile: null, found: [], badges: [] }

function read(): PrefsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const data = JSON.parse(raw) as Partial<PrefsState>
    return {
      profile: data.profile === 'kid' || data.profile === 'teen' || data.profile === 'adult' ? data.profile : null,
      found: Array.isArray(data.found) ? data.found.filter((id) => MACHINES.some((m) => m.id === id)) : [],
      badges: Array.isArray(data.badges) ? data.badges.filter((w) => WORLDS.includes(w)) : [],
    }
  } catch {
    return EMPTY
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrefsState>(read)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Progress then lasts for this visit only.
    }
  }, [state])

  const setProfile = useCallback((profile: Profile) => setState((s) => ({ ...s, profile })), [])
  const markFound = useCallback(
    (id: MachineId) => setState((s) => (s.found.includes(id) ? s : { ...s, found: [...s.found, id] })),
    [],
  )
  const awardBadge = useCallback(
    (world: WorldId) => setState((s) => (s.badges.includes(world) ? s : { ...s, badges: [...s.badges, world] })),
    [],
  )

  const value = useMemo<Prefs>(
    () => ({ ...state, setProfile, markFound, awardBadge }),
    [state, setProfile, markFound, awardBadge],
  )
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
