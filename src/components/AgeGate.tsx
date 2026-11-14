import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/context'
import type { Profile } from '../state/prefs'

const PROFILES: Profile[] = ['kid', 'teen', 'adult']

interface Props {
  open: boolean
  current: Profile | null
  onChoose: (profile: Profile) => void
  onClose: () => void
}

export function AgeGate({ open, current, onChoose, onClose }: Props) {
  const { t } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="age-gate"
      aria-labelledby="age-title"
      onCancel={(e) => {
        // A first-time visitor has to pick a profile; later it is only a setting.
        if (current === null) e.preventDefault()
      }}
      onClose={onClose}
    >
      <h2 id="age-title">{t.age.title}</h2>
      <p className="muted">{t.age.intro}</p>
      <ul className="age-options">
        {PROFILES.map((profile) => (
          <li key={profile}>
            <button
              type="button"
              className="age-option"
              aria-pressed={current === profile}
              onClick={() => onChoose(profile)}
            >
              <span className="age-label">{t.age[profile].label}</span>
              <span className="age-range">{t.age[profile].range}</span>
              <span className="age-hint">{t.age[profile].hint}</span>
            </button>
          </li>
        ))}
      </ul>
      {current !== null && (
        <button type="button" className="btn ghost" onClick={onClose}>
          {t.common.close}
        </button>
      )}
    </dialog>
  )
}
