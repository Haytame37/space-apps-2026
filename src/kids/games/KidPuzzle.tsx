import { useEffect, useRef, useState } from 'react'
import { MACHINES, type Machine } from '../../data/machines'
import { useI18n } from '../../i18n/context'
import { scramble, shuffle } from '../../lib/shuffle'
import { useKid } from '../kidContext'
import { WinPanel } from '../WinPanel'
import { GameHead } from './shared'
import { useRound } from '../useRound'

const SIDE = 3
const PEEK_MS = 1400
const PIECES = Array.from({ length: SIDE * SIDE }, (_, i) => i)

/** Photos that cut well into nine pieces: not too wide, not too tall. */
const PUZZLE_PHOTOS = MACHINES.filter((m) => {
  const ratio = m.image.width / m.image.height
  return ratio >= 0.9 && ratio <= 1.7
})

const starsFor = (moves: number) => (moves <= 9 ? 3 : moves <= 14 ? 2 : 1)

/** The puzzle: touch two pieces to swap them. "Show the model" shows the whole photo for a moment. */
function Game({ onAgain }: { onAgain: () => void }) {
  const { t, fmt } = useI18n()
  const { say, win, sfx } = useKid()
  const [machine] = useState<Machine>(() => shuffle(PUZZLE_PHOTOS)[0])
  const [order, setOrder] = useState(() => scramble(PIECES))
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [isPeeking, setPeeking] = useState(false)
  const [stars, setStars] = useState(0)
  const timer = useRef(0)

  useEffect(() => {
    say(t.kids.puzzle.intro)
  }, [say, t])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const tap = (i: number) => {
    if (stars) return
    sfx.play('tap')
    if (selected === null) return setSelected(i)
    setSelected(null)
    if (selected === i) return
    const next = [...order]
    ;[next[selected], next[i]] = [next[i], next[selected]]
    const count = moves + 1
    setOrder(next)
    setMoves(count)
    if (next.every((piece, k) => piece === k)) {
      const won = starsFor(count)
      setStars(won)
      win('puzzle', won, machine.id)
      say(t.kids.puzzle.done, true)
    }
  }

  const peek = () => {
    sfx.play('tap')
    setPeeking(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPeeking(false), PEEK_MS)
  }

  const photo = `url(${machine.image.src})`
  return (
    <>
      <GameHead title={t.kids.games.puzzle.name} />
      <div className="kid-board">
        <div
          className={['kid-puzzle', stars && 'is-solved', isPeeking && 'is-peeking'].filter(Boolean).join(' ')}
          style={{ aspectRatio: `${machine.image.width} / ${machine.image.height}` }}
          role="group"
          aria-label={t.kids.puzzle.board}
        >
          {order.map((piece, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={selected === i}
              aria-label={fmt(t.kids.puzzle.piece, { n: i + 1 })}
              disabled={stars > 0}
              onClick={() => tap(i)}
              style={{ backgroundImage: photo, backgroundPosition: `${(piece % SIDE) * 50}% ${Math.floor(piece / SIDE) * 50}%` }}
            />
          ))}
          <span className="kid-puzzle-model" style={{ backgroundImage: photo }} aria-hidden="true" />
        </div>
        <p className="kid-status" aria-live="polite">
          {fmt(t.kids.puzzle.moves, { n: moves })}
        </p>
        {!stars && (
          <button type="button" className="btn" onClick={peek}>
            {t.kids.puzzle.peek}
          </button>
        )}
        {stars > 0 && (
          <WinPanel title={fmt(t.kids.puzzle.won, { name: t.machines[machine.id].name })} stars={stars} machine={machine} onAgain={onAgain} />
        )}
      </div>
    </>
  )
}

export function KidPuzzle() {
  const [round, again] = useRound()
  return <Game key={round} onAgain={again} />
}
