import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { LANGS, useI18n, type Lang } from '../i18n/context'
import { usePrefs, type Profile } from '../state/prefs'
import { AgeGate } from './AgeGate'

export function Shell() {
  const { t, lang, setLang, switching } = useI18n()
  const { profile, setProfile } = usePrefs()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const main = useRef<HTMLElement>(null)
  const section = location.pathname.split('/')[1] ?? ''
  const firstSection = useRef(section)
  const booted = useRef(false)

  // A returning young explorer lands directly on the games.
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (profile === 'kid' && location.pathname === '/') navigate('/play', { replace: true })
  }, [profile, location.pathname, navigate])

  useEffect(() => {
    if (firstSection.current === section) {
      firstSection.current = '\u0000'
      return
    }
    firstSection.current = '\u0000'
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [section])

  const choose = (next: Profile) => {
    const first = profile === null
    setProfile(next)
    setSettingsOpen(false)
    if (first && next === 'kid') navigate('/play')
  }

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/explore', label: t.nav.explore, end: false },
    { to: '/play', label: t.nav.play, end: false },
    { to: '/quiz', label: t.nav.quiz, end: false },
    { to: '/sources', label: t.nav.sources, end: false },
  ]

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {t.common.skip}
      </a>
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Space Memory</span>
        </Link>
        <nav className="site-nav" aria-label={t.nav.main}>
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-tools">
          <label className="lang-select">
            <span className="sr-only">{t.nav.language}</span>
            <select value={lang} aria-busy={switching} onChange={(e) => setLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="profile-btn" onClick={() => setSettingsOpen(true)}>
            <span className="sr-only">{t.nav.profile}: </span>
            {profile ? t.age[profile].label : t.nav.profile}
          </button>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <AgeGate
        open={profile === null || settingsOpen}
        current={profile}
        onChoose={choose}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
