import { useEffect, useRef, useState } from 'react'
import { MACHINES, type Machine, type MachineId } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { CRESCENT_PATH } from '../../lib/ayyurMotion'
import { shuffle } from '../../lib/shuffle'
import { useKid } from '../kidContext'
import { WinPanel } from '../WinPanel'
import { GameHead } from './shared'
import { useRound } from '../useRound'

const PAIRS = 6
const MATCH_MS = 450
const MISS_MS = 950

const deal = (): Machine[] => {
  const set = shuffle(MACHINES).slice(0, PAIRS)
  return shuffle([...set, ...set])
}

const starsFor = (tries: number) => (tries <= 9 ? 3 : tries <= 13 ? 2 : 1)

/** "Pairs": twelve cards, two of each photo. Each pair found, Tiziri tells what the machine is. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt } = useI18n()
  const { say, win, sfx } = useKid()
  const [deck] = useState(deal)
  const [open, setOpen] = useState<number[]>([])
  const [done, setDone] = useState<MachineId[]>([])
  const [tries, setTries] = useState(0)
  const [stars, setStars] = useState(0)
  const timer = useRef(0)

  useEffect(() => {
    say(t.kids.memory.intro)
  }, [say, t])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || done.includes(deck[i].id)) return
    sfx.play('tap')
    const next = [...open, i]
    setOpen(next)
    if (next.length < 2) return
    const count = tries + 1
    setTries(count)
    const [a, b] = next.map((k) => deck[k])
    if (a.id !== b.id) {
      timer.current = window.setTimeout(() => setOpen([]), MISS_MS)
      return
    }
    timer.current = window.setTimeout(() => {
      setDone((d) => [...d, a.id])
      setOpen([])
      sfx.play('good')
      if (done.length + 1 === PAIRS) {
        const won = starsFor(count)
        setStars(won)
        win('memory', won, a.id)
        say(t.kids.memory.allDone, true)
      } else {
        say(`${fmt(t.kids.memory.pair, { name: t.machines[a.id].name })} ${t.machines[a.id].kid}`, true)
      }
    }, MATCH_MS)
  }

  return (
    <>
      <GameHead title={t.kids.games.memory.name} />
      <div className="kid-board">
        <ul className="kid-memory">
          {deck.map((m, i) => {
            const isDone = done.includes(m.id)
            const isOpen = isDone || open.includes(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  className={['kid-mcard', isOpen && 'is-open', isDone && 'is-done'].filter(Boolean).join(' ')}
                  aria-label={isOpen ? t.machines[m.id].name : fmt(t.kids.memory.card, { n: i + 1 })}
                  aria-disabled={isDone || undefined}
                  onClick={() => flip(i)}
                >
                  <span className="kid-mcard-inner">
                    <span className="kid-mcard-back">
                      <svg viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
                        <path fill="currentColor" d={CRESCENT_PATH} />
                      </svg>
                    </span>
                    <span className="kid-mcard-front" style={{ backgroundImage: `url(${m.image.src})` }} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="kid-status" aria-live="polite">
          {fmt(t.kids.memory.tries, { n: tries })}
        </p>
        {stars > 0 && <WinPanel title={t.kids.memory.won} stars={stars} machine={deck.find((m) => m.id === done[done.length - 1])} onAgain={onAgain} />}
      </div>
    </>
  )
}

export function KidMemory() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
