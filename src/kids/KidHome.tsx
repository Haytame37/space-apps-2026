import { useEffect } from 'react'
import { Link } from 'react-router'
import { MACHINES, machineById, type MachineId } from '../data/machines'
import { useI18n } from '../i18n/context'
import { KID_GAMES, usePrefs, type KidGame } from '../state/prefs'
import { useKid } from './kidContext'
import { StarIcon } from './StarIcon'
import { StickerAlbum } from './StickerAlbum'

const TILES: Record<KidGame, { to: string; photo: MachineId }> = {
  rocket: { to: '/play/rocket', photo: 'pioneer' },
  mystery: { to: '/play/mystery', photo: 'pathfinder' },
  memory: { to: '/play/memory', photo: 'mer' },
  puzzle: { to: '/play/puzzle', photo: 'apollo-lm' },
  rebuild: { to: '/play/rebuild', photo: 'viking' },
  quiz: { to: '/quiz', photo: 'ingenuity' },
}

/** "Choose your mission": one big tile per game, then the sticker album. */
export function KidHome() {
  const { t, fmt } = useI18n()
  const { stars, found } = usePrefs()
  const { say } = useKid()
  const total = KID_GAMES.reduce((sum, game) => sum + (stars[game] ?? 0), 0)

  useEffect(() => {
    say(found.length === MACHINES.length ? t.kids.greetAll : total > 0 ? t.kids.greetBack : t.kids.greet)
    // Greets once per visit to this page, and again if the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [say, t])

  return (
    <>
      <h1 className="kid-title">{t.kids.choose}</h1>
      <ul className="kid-tiles">
        {KID_GAMES.map((game) => {
          const best = stars[game] ?? 0
          const photo = machineById(TILES[game].photo)!
          return (
            <li key={game}>
              <Link to={TILES[game].to} className={`kid-tile kid-tile-${game}`}>
                <span className="kid-tile-won" aria-hidden="true">
                  {[1, 2, 3].map((i) => (i <= best ? <StarIcon key={i} /> : null))}
                </span>
                <span className="kid-snap" style={{ backgroundImage: `url(${photo.image.src})` }} aria-hidden="true" />
                <span className="kid-tile-name">{t.kids.games[game].name}</span>
                <span className="kid-tile-desc">{t.kids.games[game].desc}</span>
                {best > 0 && <span className="sr-only">{fmt(t.kids.starsWon, { n: best })}</span>}
                <span className="kid-go" aria-hidden="true">
                  {t.kids.play}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <StickerAlbum />
    </>
  )
}
