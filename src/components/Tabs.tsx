import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

interface Props {
  label: string
  items: TabItem[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ label, items, active, onChange }: Props) {
  const base = useId()
  const list = useRef<HTMLDivElement>(null)
  const current = items.find((item) => item.id === active) ?? items[0]

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === current.id)
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
    const step = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? (index + step + items.length) % items.length : -1
    if (next < 0) return
    e.preventDefault()
    onChange(items[next].id)
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className="tabs">
      <div ref={list} className="tablist" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${base}-tab-${item.id}`}
            aria-selected={item.id === current.id}
            aria-controls={`${base}-panel-${item.id}`}
            tabIndex={item.id === current.id ? 0 : -1}
            className="tab"
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="tabpanel"
        role="tabpanel"
        id={`${base}-panel-${current.id}`}
        aria-labelledby={`${base}-tab-${current.id}`}
        tabIndex={0}
      >
        {current.content}
      </div>
    </div>
  )
}
