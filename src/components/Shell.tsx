import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { LANGS, useI18n, type Lang } from '../i18n/context'
import { useReducedMotion } from '../lib/useReducedMotion'
import { usePrefs } from '../state/prefs'
import { AyyurLogo } from './AyyurLogo'
import { ErrorBoundary } from './ErrorBoundary'
import { IntroSplash } from './IntroSplash'
import { KidSky } from '../kids/KidSky'

export function Shell() {
  const { t, lang, setLang, switching } = useI18n()
  const { profile } = usePrefs()
  // The intro plays on each load of the site (first visit or refresh), unless motion is reduced.
  const reducedMotion = useReducedMotion()
  const [isSplashDone, setSplashDone] = useState(false)
  const isSplash = !isSplashDone && !reducedMotion
  const location = useLocation()
  const main = useRef<HTMLElement>(null)
  const nav = useRef<HTMLElement>(null)
  const section = location.pathname.split('/')[1] ?? ''
  // Home and Explore share one 3D scene: they must not be remounted when moving between them.
  const boundaryKey = section === '' || section === 'explore' ? 'stage' : section
  const firstSection = useRef(section)
  useEffect(() => {
    if (firstSection.current === section) {
      firstSection.current = '\u0000'
      return
    }
    firstSection.current = '\u0000'
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [section])

  // On narrow phones the navigation scrolls sideways: keep the current section in view.
  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [section, lang])

  // The kids' theme applies to the whole page while the young explorer profile is chosen.
  useEffect(() => {
    const root = document.documentElement
    if (profile === 'kid') root.dataset.profile = 'kid'
    else delete root.dataset.profile
  }, [profile])

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/explore', label: t.nav.explore, end: false },
    { to: '/play', label: t.nav.play, end: false },
    { to: '/quiz', label: t.nav.quiz, end: false },
    { to: '/shop', label: t.nav.shop, end: false },
    { to: '/sources', label: t.nav.sources, end: false },
    { to: '/about', label: t.nav.about, end: false },
  ]

  return (
    <div className="shell">
      {profile === 'kid' && <KidSky />}
      <a className="skip-link" href="#main">
        {t.common.skip}
      </a>
      <header className="site-header" inert={isSplash}>
        <Link to="/" className="brand">
          <AyyurLogo variant="orbit" size={32} decorative />
          <span className="brand-name">AYYUR</span>
        </Link>
        <nav ref={nav} className="site-nav" aria-label={t.nav.main}>
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
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1} inert={isSplash}>
        <ErrorBoundary
          key={boundaryKey}
          fallback={
            <section className="page" role="alert">
              <h1>{t.common.crashTitle}</h1>
              <p className="lead">{t.common.crashBody}</p>
              <button type="button" className="btn primary" onClick={() => window.location.reload()}>
                {t.common.reload}
              </button>
            </section>
          }
        >
          <Outlet />
        </ErrorBoundary>
      </main>
      {isSplash && <IntroSplash onFinished={() => setSplashDone(true)} />}
    </div>
  )
}
