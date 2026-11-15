import type { ReactNode } from 'react'
import { usePrefs } from '../state/prefs'
import { KidLayout } from './KidLayout'

/** The young explorer gets the kids' version of a page; teens and adults keep the usual one. */
export function ForKids({ kid, other }: { kid: ReactNode; other: ReactNode }) {
  const { profile } = usePrefs()
  return profile === 'kid' ? <KidLayout>{kid}</KidLayout> : <>{other}</>
}
