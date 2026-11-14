import { useState } from 'react'
import { MACHINES, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { scramble } from '../lib/shuffle'
import { GameFrame } from './GameFrame'
import { StoryLink } from './StoryLink'

const SIDE = 3
const CELLS = SIDE * SIDE
const pieces = Array.from({ length: CELLS }, (_, i) => i)
const pick = (not?: string) => {
  const pool = MACHINES.filter((m) => m.id !== not)
  return pool[Math.floor(Math.random() * pool.length)]
}

function Board({ machine }: { machine: Machine }) {
  const { t, fmt } = useI18n()
  const [cells, setCells] = useState(() => scramble(pieces))
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const solved = cells.every((piece, i) => piece === i)
  const text = t.machines[machine.id]

  const tap = (i: number) => {
    if (solved) return
    if (selected === null) return setSelected(i)
    if (selected !== i) {
      const next = [...cells]
      ;[next[selected], next[i]] = [next[i], next[selected]]
      setCells(next)
      setMoves(moves + 1)
    }
    setSelected(null)
  }

  return (
    <>
      <div
        className={solved ? 'puzzle solved' : 'puzzle'}
        role="group"
        aria-label={t.puzzle.board}
        style={{ aspectRatio: `${machine.image.width} / ${machine.image.height}` }}
      >
        {cells.map((piece, i) => (
          <button
            key={i}
            type="button"
            className="puzzle-tile"
            aria-pressed={selected === i}
            disabled={solved}
            onClick={() => tap(i)}
            style={{
              backgroundImage: `url(${machine.image.src})`,
              backgroundPosition: `${((piece % SIDE) / (SIDE - 1)) * 100}% ${(Math.floor(piece / SIDE) / (SIDE - 1)) * 100}%`,
            }}
          >
            <span className="sr-only">
              {fmt(t.puzzle.piece, { n: piece + 1, row: Math.floor(i / SIDE) + 1, col: (i % SIDE) + 1 })}
            </span>
          </button>
        ))}
      </div>
      <p className="game-status" role="status">
        {solved ? fmt(t.puzzle.solved, { n: moves }) : fmt(t.puzzle.moves, { n: moves })}
      </p>
      {solved && (
        <div className="result-card">
          <p className="result-big">{text.name}</p>
          <p>{text.alt}</p>
          <p className="small muted">{fmt(t.panel.photo, { credit: machine.image.credit })}</p>
          <div className="actions">
            <StoryLink machine={machine} />
          </div>
        </div>
      )}
    </>
  )
}

export function Puzzle() {
  const { t } = useI18n()
  const [machine, setMachine] = useState(() => pick())
  const [game, setGame] = useState(0)
  return (
    <GameFrame title={t.play.games.puzzle.name} intro={t.puzzle.intro}>
      <Board key={`${machine.id}-${game}`} machine={machine} />
      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setMachine(pick(machine.id))
            setGame(game + 1)
          }}
        >
          {t.puzzle.other}
        </button>
      </div>
    </GameFrame>
  )
}
