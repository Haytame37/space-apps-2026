import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { TimelineDate } from '../data/machines'
import { fmt, I18nContext, LANGS, type I18n, type Lang } from './context'
import { en, type Dict } from './en'

const STORAGE_KEY = 'space-memory:lang'

const loaders: Record<Exclude<Lang, 'en'>, () => Promise<Dict>> = {
  fr: () => import('./fr').then((m) => m.fr),
  es: () => import('./es').then((m) => m.es),
  ar: () => import('./ar').then((m) => m.ar),
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  const browser = navigator.language.slice(0, 2).toLowerCase()
  return LANGS.find((l) => l.code === browser)?.code ?? 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [wanted, setWanted] = useState<Lang>(initialLang)
  const [loaded, setLoaded] = useState<{ lang: Lang; dict: Dict }>({ lang: 'en', dict: en })
  const request = useRef(0)

  useEffect(() => {
    if (wanted === loaded.lang) return
    const id = ++request.current
    const load = wanted === 'en' ? Promise.resolve(en) : loaders[wanted]()
    load
      .then((dict) => {
        if (id === request.current) setLoaded({ lang: wanted, dict })
      })
      .catch(() => {
        // Keep the language already on screen if the download fails.
        if (id === request.current) setWanted(loaded.lang)
      })
  }, [wanted, loaded.lang])

  const meta = LANGS.find((l) => l.code === loaded.lang)!

  useEffect(() => {
    document.documentElement.lang = loaded.lang
    document.documentElement.dir = meta.dir
    document.title = loaded.dict.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', loaded.dict.meta.description)
  }, [loaded, meta.dir])

  const setLang = useCallback((lang: Lang) => {
    setWanted(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // The choice still applies for this visit.
    }
  }, [])

  const value = useMemo<I18n>(() => {
    const locale = meta.locale
    const formats = {
      day: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' }),
      month: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', month: 'long', year: 'numeric', numberingSystem: 'latn' }),
      year: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', year: 'numeric', numberingSystem: 'latn' }),
    }
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, numberingSystem: 'latn' })
    return {
      t: loaded.dict,
      lang: loaded.lang,
      dir: meta.dir,
      switching: wanted !== loaded.lang,
      setLang,
      fmt,
      date: (d: TimelineDate) => formats[d.precision].format(new Date(`${d.date}T00:00:00Z`)),
      num: (n: number) => number.format(n),
    }
  }, [loaded, meta, wanted, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
