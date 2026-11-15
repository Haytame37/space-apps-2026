import { useEffect, useRef, useState } from 'react'
import { MACHINES, type Machine } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { scramble, shuffle } from '../../lib/shuffle'
import { useKid } from '../kidContext'
import { WinPanel } from '../WinPanel'
import { GameHead } from './shared'
import { useRound } from '../useRound'

/** Three moments of the mission: its first event, one in the middle, its last. */
const stepsOf = (m: Machine) => [0, Math.floor((m.timeline.length - 1) / 2), m.timeline.length - 1]

/** Each moment shows its own part of the mission's NASA photo. */
const CROPS = ['15% 20%', '50% 50%', '85% 80%']

const starsFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1)

/** "In order": three moments of a mission to touch in order: first, then, finally. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt, date } = useI18n()
  const { say, win, sfx } = useKid()
  const [machine] = useState(() => shuffle(MACHINES.filter((m) => m.timeline.length >= 3))[0])
  const [cards] = useState(() => scramble([0, 1, 2]))
  const [placed, setPlaced] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [stars, setStars] = useState(0)
  const [shaking, setShaking] = useState<number | null>(null)
  const timer = useRef(0)
  const steps = stepsOf(machine)
  const texts = t.machines[machine.id].timeline

  useEffect(() => {
    say(fmt(t.kids.rebuild.intro, { name: t.machines[machine.id].name }))
  }, [say, t, fmt, machine.id])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const touch = (step: number) => {
    if (stars) return
    if (step !== placed.length) {
      sfx.play('bad')
      setMistakes((n) => n + 1)
      setShaking(step)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setShaking(null), 500)
      say(t.kids.rebuild.wrong)
      return
    }
    const next = [...placed, step]
    setPlaced(next)
    if (next.length < steps.length) {
      sfx.play('good')
      say(t.kids.rebuild.good)
      return
    }
    const won = starsFor(mistakes)
    setStars(won)
    win('rebuild', won, machine.id)
    say(t.kids.rebuild.done, true)
  }

  const picture = (step: number) => (
    <span className="kid-step-photo" style={{ backgroundImage: `url(${machine.image.src})`, backgroundPosition: CROPS[step] }} aria-hidden="true" />
  )

  return (
    <>
      <GameHead title={t.kids.games.rebuild.name} />
      <div className="kid-board">
        <ol className="kid-slots">
          {steps.map((_, slot) => {
            const step = placed[slot]
            return (
              <li key={slot} className={step === undefined ? 'kid-slot' : 'kid-slot is-filled'}>
                <b>{t.kids.rebuild.slots[slot]}</b>
                {step !== undefined && (
                  <>
                    {picture(step)}
                    <span className="kid-step-date">{date(machine.timeline[steps[step]])}</span>
                    <span>{texts[steps[step]]}</span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
        {!stars && (
          <ul className="kid-steps">
            {cards
              .filter((step) => !placed.includes(step))
              .map((step) => (
                <li key={step}>
                  <button type="button" className={shaking === step ? 'kid-step is-wrong' : 'kid-step'} onClick={() => touch(step)}>
                    {picture(step)}
                    <span>{texts[steps[step]]}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
        {stars > 0 && <WinPanel title={t.kids.rebuild.won} stars={stars} machine={machine} onAgain={onAgain} />}
      </div>
    </>
  )
}

export function KidRebuild() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
