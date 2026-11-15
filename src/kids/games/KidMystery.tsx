import { useEffect, useState } from 'react'
import { MACHINES, type Machine, type MachineId } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { shuffle } from '../../lib/shuffle'
import { useKid } from '../kidContext'
import { WinPanel } from '../WinPanel'
import { GameHead, Pips } from './shared'
import { useRound } from '../useRound'

const CLUES = 3

function deal(): { target: Machine; options: Machine[] } {
  const [target, ...rest] = shuffle(MACHINES)
  return { target, options: shuffle([target, ...rest.slice(0, 2)]) }
}

/** "Who am I?": clues one at a time, three photos to choose from. Fewer clues, more stars. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt } = useI18n()
  const { say, win, sfx } = useKid()
  const [{ target, options }] = useState(deal)
  const [shown, setShown] = useState(1)
  const [wrong, setWrong] = useState<MachineId[]>([])
  const [stars, setStars] = useState(0)
  const clues = t.machines[target.id].clues

  useEffect(() => {
    say(t.kids.mystery.intro)
  }, [say, t])

  const nextClue = () => {
    const next = Math.min(CLUES, shown + 1)
    setShown(next)
    sfx.play('tap')
    say(next === CLUES ? t.kids.mystery.lastClue : t.kids.mystery.anotherClue)
  }

  const choose = (m: Machine) => {
    if (stars) return
    if (m.id === target.id) {
      const won = CLUES + 1 - shown
      setStars(won)
      sfx.play('good')
      win('mystery', won, target.id)
      say(t.kids.mystery.right, true)
      return
    }
    sfx.play('bad')
    setWrong((w) => [...w, m.id])
    if (shown < CLUES) setShown(shown + 1)
    say(t.kids.mystery.wrong)
  }

  return (
    <>
      <GameHead title={t.kids.games.mystery.name} />
      <div className="kid-board">
        <Pips total={CLUES} on={shown} label={fmt(t.kids.mystery.cluesUsed, { n: shown, total: CLUES })} />
        <ol className="kid-clues">
          {clues.slice(0, stars ? CLUES : shown).map((clue, i) => (
            <li key={i} className="kid-clue">
              <b>{fmt(t.kids.mystery.clue, { n: i + 1 })}</b> {clue}
            </li>
          ))}
        </ol>
        <ul className="kid-picks">
          {options.map((m) => {
            const isWrong = wrong.includes(m.id)
            const isRight = stars > 0 && m.id === target.id
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className={isRight ? 'kid-pick is-right' : isWrong ? 'kid-pick is-wrong' : 'kid-pick'}
                  disabled={isWrong || stars > 0}
                  onClick={() => choose(m)}
                >
                  <img src={m.image.src} width={m.image.width} height={m.image.height} alt="" />
                  <span>{t.machines[m.id].name}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {!stars && shown < CLUES && (
          <button type="button" className="btn" onClick={nextClue}>
            {t.kids.mystery.more}
          </button>
        )}
        {stars > 0 && (
          <WinPanel title={fmt(t.kids.mystery.found, { name: t.machines[target.id].name })} stars={stars} machine={target} onAgain={onAgain} />
        )}
      </div>
    </>
  )
}

export function KidMystery() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
