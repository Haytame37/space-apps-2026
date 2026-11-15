import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { MachineId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { usePrefs, type KidGame } from '../state/prefs'
import { Confetti } from './Confetti'
import { burstConfetti } from './confettiBus'
import { KidContext, type Kid } from './kidContext'
import { Mascot } from './Mascot'
import { Stars } from './Stars'
import { useSfx } from './useSfx'

/** Frame of every page of the kids' corner: stars and sound on top, Tiziri and her bubble, then the page. */
export function KidLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const { recordStars, markFound } = usePrefs()
  const sfx = useSfx()
  const [line, setLine] = useState({ text: '', isHappy: false, cue: 0 })

  const say = useCallback((text: string, happy = false) => setLine((l) => ({ text, isHappy: happy, cue: l.cue + 1 })), [])
  const play = sfx.play
  const win = useCallback(
    (game: KidGame, stars: number, machine?: MachineId) => {
      recordStars(game, stars)
      if (machine) markFound(machine)
      play('win')
      burstConfetti()
    },
    [recordStars, markFound, play],
  )
  const value = useMemo<Kid>(() => ({ say, win, sfx }), [say, win, sfx])

  return (
    <KidContext.Provider value={value}>
      <section className="kid-page">
        <Confetti />
        <div className="kid-top">
          <p className="kid-corner">{t.kids.corner}</p>
          <div className="kid-chips">
            <Stars />
            <button type="button" className="kid-chip" aria-pressed={sfx.isOn} onClick={sfx.toggle}>
              {sfx.isOn ? t.kids.soundOn : t.kids.soundOff}
            </button>
          </div>
        </div>
        <Mascot text={line.text} happy={line.isHappy} cue={line.cue} />
        {children}
      </section>
    </KidContext.Provider>
  )
}
