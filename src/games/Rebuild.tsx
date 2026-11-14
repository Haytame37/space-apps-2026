import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Icon } from '../components/Icon'
import { machineById, MACHINES, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'
import { scramble } from '../lib/shuffle'
import { GameFrame } from './GameFrame'
import { StoryLink } from './StoryLink'

const randomMachine = () => MACHINES[Math.floor(Math.random() * MACHINES.length)]
const fresh = (machine: Machine) => scramble(machine.timeline.map((_, i) => i))

function Board({ machine }: { machine: Machine }) {
  const { t, fmt, date } = useI18n()
  const [order, setOrder] = useState(() => fresh(machine))
  const [checked, setChecked] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const texts = t.machines[machine.id].timeline
  const total = order.length
  const solved = checked === total

  const move = (from: number, to: number) => {
    const next = [...order]
    ;[next[from], next[to]] = [next[to], next[from]]
    setOrder(next)
    setChecked(null)
    setStatus(fmt(t.rebuild.moved, { n: to + 1, total }))
  }

  if (solved) {
    return (
      <div className="result-card">
        <p className="result-big" role="status">
          {t.rebuild.solved}
        </p>
        <ol className="solved-timeline">
          {machine.timeline.map((stop, i) => (
            <li key={stop.date + i}>
              <span className="tl-date">{date(stop)}</span>
              <span>{texts[i]}</span>
            </li>
          ))}
        </ol>
        <div className="actions">
          <StoryLink machine={machine} />
        </div>
      </div>
    )
  }

  return (
    <>
      <ol className="sortable">
        {order.map((event, position) => (
          <li key={event} className={checked !== null && event === position ? 'in-place' : ''}>
            <span className="sortable-num">{position + 1}</span>
            <span className="sortable-text">{texts[event]}</span>
            <span className="sortable-tools">
              <button type="button" className="icon-btn" disabled={position === 0} onClick={() => move(position, position - 1)}>
                <Icon name="up" />
                <span className="sr-only">{fmt(t.rebuild.upOf, { text: texts[event] })}</span>
              </button>
              <button type="button" className="icon-btn" disabled={position === total - 1} onClick={() => move(position, position + 1)}>
                <Icon name="down" />
                <span className="sr-only">{fmt(t.rebuild.downOf, { text: texts[event] })}</span>
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            const right = order.filter((event, position) => event === position).length
            setChecked(right)
            setStatus(right === total ? t.rebuild.solved : fmt(t.rebuild.partial, { n: right, total }))
          }}
        >
          {t.rebuild.check}
        </button>
      </div>
      <p className="game-status" role="status">
        {status}
      </p>
    </>
  )
}

export function Rebuild() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const [fallback] = useState(randomMachine)
  const [game, setGame] = useState(0)
  const machine = machineById(search.get('m') ?? undefined) ?? fallback

  return (
    <GameFrame title={t.play.games.rebuild.name} intro={t.rebuild.intro}>
      <div className="game-bar">
        <label className="field">
          <span>{t.rebuild.choose}</span>
          <select
            value={machine.id}
            onChange={(e) => {
              setSearch({ m: e.target.value }, { replace: true })
              setGame(game + 1)
            }}
          >
            {MACHINES.map((m) => (
              <option key={m.id} value={m.id}>
                {t.machines[m.id].name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn small"
          onClick={() => {
            const others = MACHINES.filter((m) => m.id !== machine.id)
            setSearch({ m: others[Math.floor(Math.random() * others.length)].id }, { replace: true })
            setGame(game + 1)
          }}
        >
          {t.rebuild.other}
        </button>
      </div>
      <Board key={`${machine.id}-${game}`} machine={machine} />
    </GameFrame>
  )
}
