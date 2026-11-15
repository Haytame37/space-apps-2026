import { useState } from 'react'
import { MACHINES, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { shuffle } from '../lib/shuffle'
import { useReveal } from '../lib/useReveal'
import { GameFrame } from './GameFrame'
import { StoryLink } from './StoryLink'

const ROUNDS = 5

interface Round {
  target: Machine
  options: Machine[]
}

function deal(): Round[] {
  return shuffle(MACHINES)
    .slice(0, ROUNDS)
    .map((target) => ({
      target,
      options: shuffle([target, ...shuffle(MACHINES.filter((m) => m.id !== target.id)).slice(0, 3)]),
    }))
}

export function Mystery() {
  const { t, fmt } = useI18n()
  const [rounds, setRounds] = useState(deal)
  const [index, setIndex] = useState(0)
  const [clues, setClues] = useState(1)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const done = index >= ROUNDS
  const round = rounds[Math.min(index, ROUNDS - 1)]
  const text = t.machines[round.target.id]
  const gain = 4 - clues
  const correct = picked === round.target.id
  const total = ROUNDS * 3
  const feedback = useReveal<HTMLDivElement>(picked !== null)

  const restart = () => {
    setRounds(deal())
    setIndex(0)
    setClues(1)
    setPicked(null)
    setScore(0)
  }

  if (done) {
    return (
      <GameFrame title={t.play.games.mystery.name} intro={t.mystery.intro}>
        <div className="result-card" role="status">
          <p className="result-big">{fmt(t.mystery.finished, { n: score, total })}</p>
          <button type="button" className="btn primary" onClick={restart}>
            {t.play.again}
          </button>
        </div>
      </GameFrame>
    )
  }

  return (
    <GameFrame title={t.play.games.mystery.name} intro={t.mystery.intro}>
      <p className="game-meta">
        <span>{fmt(t.play.round, { n: index + 1, total: ROUNDS })}</span>
        <span>
          {t.play.score}: {score}
        </span>
      </p>
      <ol className="clues">
        {text.clues.slice(0, picked ? 3 : clues).map((clue, i) => (
          <li key={clue}>
            <span className="clue-tag">{fmt(t.mystery.clue, { n: i + 1 })}</span>
            <span className="clue-text">“{clue}”</span>
          </li>
        ))}
      </ol>
      {!picked && clues < 3 && (
        <button type="button" className="btn small" onClick={() => setClues(clues + 1)}>
          {t.mystery.nextClue}
        </button>
      )}
      <fieldset className="choices" disabled={picked !== null}>
        <legend>{t.mystery.who}</legend>
        {round.options.map((option) => {
          const state = !picked ? '' : option.id === round.target.id ? 'is-right' : option.id === picked ? 'is-wrong' : ''
          return (
            <button
              key={option.id}
              type="button"
              className={`choice ${state}`}
              onClick={() => {
                setPicked(option.id)
                if (option.id === round.target.id) setScore(score + gain)
              }}
            >
              {t.machines[option.id].name}
            </button>
          )
        })}
      </fieldset>
      <div aria-live="polite">
        {picked && (
          <div ref={feedback} className={`feedback ${correct ? 'good' : 'bad'}`}>
            <p className="feedback-title">
              {fmt(correct ? t.mystery.correct : t.mystery.wrong, { name: text.name })}
              {correct && <span className="points"> {fmt(t.mystery.points, { n: gain })}</span>}
            </p>
            <img
              className="feedback-photo"
              src={round.target.image.src}
              width={round.target.image.width}
              height={round.target.image.height}
              alt={text.alt}
            />
            <p className="small muted">{fmt(t.panel.photo, { credit: round.target.image.credit })}</p>
            <div className="actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setIndex(index + 1)
                  setClues(1)
                  setPicked(null)
                }}
              >
                {index + 1 < ROUNDS ? t.mystery.next : t.quiz.finish}
              </button>
              <StoryLink machine={round.target} />
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  )
}
