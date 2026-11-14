import { createContext, useContext } from 'react'
import type { TimelineDate } from '../data/machines'
import type { Dict } from './en'

export type Lang = 'en' | 'fr' | 'es' | 'ar'

export const LANGS: { code: Lang; label: string; dir: 'ltr' | 'rtl'; locale: string }[] = [
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
  { code: 'fr', label: 'Français', dir: 'ltr', locale: 'fr-FR' },
  { code: 'es', label: 'Español', dir: 'ltr', locale: 'es-ES' },
  { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar-MA' },
]

export interface I18n {
  t: Dict
  lang: Lang
  dir: 'ltr' | 'rtl'
  /** True while another language's texts are being downloaded. */
  switching: boolean
  setLang: (lang: Lang) => void
  fmt: (template: string, vars: Record<string, string | number>) => string
  date: (d: TimelineDate) => string
  num: (n: number) => string
}

export const I18nContext = createContext<I18n | null>(null)

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}
