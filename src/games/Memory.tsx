import { useEffect, useState } from 'react'
import { MACHINES, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { shuffle } from '../lib/shuffle'
import { GameFrame } from './GameFrame'

const PAIRS = 6

interface Card {
  key: string
  machine: Machine
  kind: 'photo' | 'name'
}

const deal = (): Card[] =>
  shuffle(
    shuffle(MACHINES)
      .slice(0, PAIRS)
      .flatMap((machine): Card[] => [
        { key: `${machine.id}-photo`, machine, kind: 'photo' },
        { key: `${machine.id}-name`, machine, kind: 'name' },
      ]),
  )

export function Memory() {
  const { t, fmt } = useI18n()
  const [cards, setCards] = useState(deal)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [tries, setTries] = useState(0)
  const solved = matched.length === PAIRS

  // A wrong pair stays visible for a moment, then turns back over.
  useEffect(() => {
    if (open.length !== 2) return
    const timer = window.setTimeout(() => setOpen([]), 1300)
    return () => window.clearTimeout(timer)
  }, [open])

  const flip = (i: number) => {
    const card = cards[i]
    if (matched.includes(card.machine.id) || open.includes(i)) return
    if (open.length !== 1) return setOpen([i])
    const first = cards[open[0]]
    setTries(tries + 1)
    if (first.machine.id === card.machine.id) {
      setMatched([...matched, card.machine.id])
      setOpen([])
    } else {
      setOpen([open[0], i])
    }
  }

  return (
    <GameFrame title={t.play.games.memory.name} intro={t.memory.intro}>
      <ul className="memory" aria-label={t.memory.board}>
        {cards.map((card, i) => {
          const isMatched = matched.includes(card.machine.id)
          const shown = isMatched || open.includes(i)
          const text = t.machines[card.machine.id]
          return (
            <li key={card.key}>
              <button
                type="button"
                className={`memory-card ${shown ? 'shown' : ''} ${isMatched ? 'matched' : ''}`}
                aria-disabled={isMatched}
                onClick={() => flip(i)}
              >
                {!shown && <span className="sr-only">{fmt(t.memory.hidden, { n: i + 1 })}</span>}
                {shown && card.kind === 'photo' && (
                  <img src={card.machine.image.src} width={card.machine.image.width} height={card.machine.image.height} alt={text.alt} />
                )}
                {shown && card.kind === 'name' && <span className="memory-name">{text.name}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="game-status" role="status">
        {solved ? fmt(t.memory.solved, { n: tries }) : fmt(t.memory.tries, { n: tries })}
      </p>
      {solved && (
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setCards(deal())
              setOpen([])
              setMatched([])
              setTries(0)
            }}
          >
            {t.play.again}
          </button>
        </div>
      )}
    </GameFrame>
  )
}
