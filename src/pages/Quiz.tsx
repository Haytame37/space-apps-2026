import { useState } from 'react'
import { ExternalLink } from '../components/ExternalLink'
import { Icon } from '../components/Icon'
import { machineById, SOURCES, WORLDS, type WorldId } from '../data/machines'
import { QUIZ } from '../data/quiz'
import { useI18n } from '../i18n/context'
import { usePrefs } from '../state/prefs'

const PASS = 3

function Round({ world, onExit }: { world: WorldId; onExit: () => void }) {
  const { t, fmt } = useI18n()
  const { awardBadge } = usePrefs()
  const questions = QUIZ.map((item, i) => ({ ...item, text: t.quizItems[i] })).filter((q) => q.world === world)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [right, setRight] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const total = questions.length

  if (index >= total) {
    const won = right >= PASS
    return (
      <div className="result-card" role="status">
        <p className="result-big">{fmt(t.quiz.result, { n: right, total })}</p>
        <p>{won ? fmt(t.quiz.won, { badge: t.quiz.badges[world] }) : t.quiz.lost}</p>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setIndex(0)
              setPicked(null)
              setRight(0)
              setAttempt(attempt + 1)
            }}
          >
            {t.quiz.retry}
          </button>
          <button type="button" className="btn" onClick={onExit}>
            {t.quiz.choose}
          </button>
        </div>
      </div>
    )
  }

  const q = questions[index]
  const source = SOURCES[machineById(q.machine)!.sources[0]]
  const last = index === total - 1

  return (
    <div className="quiz-round">
      <p className="game-meta">
        <span>{fmt(t.quiz.question, { n: index + 1, total })}</span>
        <span>{t.worlds[world].name}</span>
      </p>
      <fieldset className="choices" disabled={picked !== null} key={`${attempt}-${index}`}>
        <legend>{q.text.q}</legend>
        {q.text.options.map((option, i) => {
          const state = picked === null ? '' : i === q.answer ? 'is-right' : i === picked ? 'is-wrong' : ''
          return (
            <button
              key={option}
              type="button"
              className={`choice ${state}`}
              onClick={() => {
                setPicked(i)
                if (i === q.answer) setRight(right + 1)
              }}
            >
              {option}
            </button>
          )
        })}
      </fieldset>
      <div aria-live="polite">
        {picked !== null && (
          <div className={`feedback ${picked === q.answer ? 'good' : 'bad'}`}>
            <p className="feedback-title">{picked === q.answer ? t.quiz.right : t.quiz.wrong}</p>
            <p>{q.text.explain}</p>
            <p className="small">
              {t.common.source}: <ExternalLink href={source.url}>{source.label}</ExternalLink>
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                if (last && right >= PASS) awardBadge(world)
                setIndex(index + 1)
                setPicked(null)
              }}
            >
              {last ? t.quiz.finish : t.quiz.next}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function Quiz() {
  const { t } = useI18n()
  const { badges } = usePrefs()
  const [world, setWorld] = useState<WorldId | null>(null)

  return (
    <section className="page">
      <h1>{t.quiz.title}</h1>
      <p className="lead">{t.quiz.lead}</p>
      {world ? (
        <Round key={world} world={world} onExit={() => setWorld(null)} />
      ) : (
        <ul className="quiz-worlds">
          {WORLDS.map((w) => {
            const won = badges.includes(w)
            return (
              <li key={w}>
                <button type="button" className={`quiz-world world-${w}`} onClick={() => setWorld(w)}>
                  <span className="quiz-world-name">{t.worlds[w].name}</span>
                  <span className={won ? 'badge won' : 'badge'}>
                    <Icon name="star" />
                    {t.quiz.badges[w]}
                    <span className="sr-only"> — {won ? t.quiz.badgeWon : t.quiz.badgeLocked}</span>
                  </span>
                  <span className="quiz-world-cta">{t.quiz.start}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
