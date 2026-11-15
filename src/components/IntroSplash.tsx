import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { AyyurLogo } from './AyyurLogo'

/** Length of the fade that reveals the site once the intro is over. */
const LEAVE_MS = 700

interface Props {
  /** Called once the black screen has faded away. */
  onFinished: () => void
}

/**
 * Each time the site is loaded, the AYYUR intro plays large on a black screen,
 * then fades away to reveal the page. It can be skipped with the button or Escape.
 */
export function IntroSplash({ onFinished }: Props) {
  const { t } = useI18n()
  const [isLeaving, setLeaving] = useState(false)
  const skip = useRef<HTMLButtonElement>(null)
  const finished = useRef(onFinished)
  useEffect(() => {
    finished.current = onFinished
  }, [onFinished])

  const leave = useCallback(() => setLeaving(true), [])

  useEffect(() => {
    skip.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  useEffect(() => {
    if (!isLeaving) return
    const timer = window.setTimeout(() => finished.current(), LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [isLeaving])

  return (
    <div className={isLeaving ? 'intro-splash is-leaving' : 'intro-splash'}>
      <AyyurLogo variant="intro" size="clamp(170px, 36vmin, 290px)" withName onDone={leave} className="intro-splash-logo" />
      <button ref={skip} type="button" className="intro-skip" onClick={leave}>
        {t.common.skipIntro}
      </button>
    </div>
  )
}
