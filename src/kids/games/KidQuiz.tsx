import { useEffect, useState } from 'react'
import { machineById } from '../../data/machines'
import { KID_QUIZ } from '../../data/quiz'
import { useI18n } from '../../i18n/context'
import { shuffle } from '../../lib/shuffle'
import { useKid } from '../kidContext'
import { WinPanel } from '../WinPanel'
import { GameHead, Pips } from './shared'
import { useRound } from '../useRound'

const QUESTIONS = 5
const starsFor = (right: number) => (right >= 5 ? 3 : right >= 3 ? 2 : 1)

/** "True or false?": five statements with their photo, two big buttons, a short explanation each time. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt } = useI18n()
  const { say, win, sfx } = useKid()
  const [questions] = useState(() => shuffle(KID_QUIZ.map((q, index) => ({ ...q, index }))).slice(0, QUESTIONS))
  const [n, setN] = useState(0)
  const [right, setRight] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [stars, setStars] = useState(0)
  const q = questions[n]
  const text = t.kids.quiz[q.index]
  const machine = machineById(q.machine)!
  const isLast = n === QUESTIONS - 1

  useEffect(() => {
    say(fmt(t.kids.tf.question, { n: n + 1, total: QUESTIONS }))
  }, [say, t, fmt, n])

  const choose = (value: boolean) => {
    if (answer !== null) return
    const isRight = value === q.isTrue
    const score = right + (isRight ? 1 : 0)
    setAnswer(value)
    setRight(score)
    if (isRight) {
      sfx.play('good')
      say(t.kids.tf.cheer, true)
    } else {
      sfx.play('bad')
      say(t.kids.tf.miss)
    }
    if (isLast) {
      const won = starsFor(score)
      setStars(won)
      win('quiz', won, score >= 3 ? q.machine : undefined)
    }
  }

  const next = () => {
    sfx.play('tap')
    setAnswer(null)
    setN(n + 1)
  }

  const verdict = answer === null ? null : answer === q.isTrue
  return (
    <>
      <GameHead title={t.kids.games.quiz.name} />
      <div className="kid-board">
        <Pips total={QUESTIONS} on={n + (answer === null ? 0 : 1)} label={fmt(t.kids.tf.question, { n: n + 1, total: QUESTIONS })} />
        <div className="kid-tf">
          <img src={machine.image.src} width={machine.image.width} height={machine.image.height} alt={t.machines[machine.id].alt} />
          <p className="kid-tf-q">{text.q}</p>
          <div className="kid-tf-answers">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                className={value ? 'btn kid-true' : 'btn kid-false'}
                disabled={answer !== null}
                data-dim={answer !== null && value !== q.isTrue ? '' : undefined}
                onClick={() => choose(value)}
              >
                {value ? t.kids.tf.true : t.kids.tf.false}
              </button>
            ))}
          </div>
          {verdict !== null && (
            <p className="kid-why">
              <b>{verdict ? t.kids.tf.right : t.kids.tf.wrong}</b> {text.why}
            </p>
          )}
          {verdict !== null && !isLast && (
            <button type="button" className="btn primary" onClick={next}>
              {t.kids.tf.next}
            </button>
          )}
        </div>
        {stars > 0 && (
          <WinPanel
            title={fmt(t.kids.tf.result, { n: right, total: QUESTIONS })}
            stars={stars}
            machine={right >= 3 ? machine : undefined}
            onAgain={onAgain}
          />
        )}
      </div>
    </>
  )
}

export function KidQuiz() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
