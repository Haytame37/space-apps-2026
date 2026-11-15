import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MACHINES, WORLDS, type MachineId, type WorldId } from '../data/machines'
import { KID_GAMES, PrefsContext, type KidGame, type Prefs, type PrefsState, type Profile } from './prefs'

const STORAGE_KEY = 'space-memory:prefs:v1'
/** The site is made for young explorers: every visitor gets their version. */
const PROFILE = 'kid'
const EMPTY: PrefsState = { profile: PROFILE, found: [], badges: [], stars: {} }

function readStars(raw: unknown): PrefsState['stars'] {
  if (!raw || typeof raw !== 'object') return {}
  const out: PrefsState['stars'] = {}
  for (const game of KID_GAMES) {
    const n = (raw as Record<string, unknown>)[game]
    if (typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 3) out[game] = n
  }
  return out
}

function read(): PrefsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const data = JSON.parse(raw) as Partial<PrefsState>
    return {
      profile: PROFILE,
      found: Array.isArray(data.found) ? data.found.filter((id) => MACHINES.some((m) => m.id === id)) : [],
      badges: Array.isArray(data.badges) ? data.badges.filter((w) => WORLDS.includes(w)) : [],
      stars: readStars(data.stars),
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

  const recordStars = useCallback(
    (game: KidGame, stars: number) =>
      setState((s) => ((s.stars[game] ?? 0) >= stars ? s : { ...s, stars: { ...s.stars, [game]: Math.min(3, Math.max(1, stars)) } })),
    [],
  )

  const value = useMemo<Prefs>(
    () => ({ ...state, setProfile, markFound, awardBadge, recordStars }),
    [state, setProfile, markFound, awardBadge, recordStars],
  )
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
