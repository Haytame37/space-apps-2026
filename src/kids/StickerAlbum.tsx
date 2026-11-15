import { useEffect, useState } from 'react'
import { MACHINES, type MachineId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { usePrefs } from '../state/prefs'

/** Stickers already shown in the album during this visit, so only the new ones land with a flourish. */
let shownBefore: Set<MachineId> | null = null

/** One round sticker per machine: its photo once won, a grey "?" until then. */
export function StickerAlbum() {
  const { t, fmt } = useI18n()
  const { found } = usePrefs()
  const [fresh] = useState(() => (shownBefore ? found.filter((id) => !shownBefore!.has(id)) : []))

  useEffect(() => {
    shownBefore = new Set(found)
  }, [found])

  return (
    <section className="kid-album" aria-labelledby="kid-album-title">
      <h2 id="kid-album-title">{fmt(t.kids.albumTitle, { n: found.length, total: MACHINES.length })}</h2>
      <p>{t.kids.albumLead}</p>
      <ul className="kid-stickers">
        {MACHINES.map((m) => {
          const isWon = found.includes(m.id)
          const className = ['kid-sticker', isWon && 'is-won', fresh.includes(m.id) && 'is-new'].filter(Boolean).join(' ')
          return (
            <li key={m.id} className={className}>
              {isWon ? (
                <i style={{ backgroundImage: `url(${m.image.src})` }} aria-hidden="true" />
              ) : (
                <i aria-hidden="true">?</i>
              )}
              <span>{isWon ? t.machines[m.id].name : t.kids.unknown}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
