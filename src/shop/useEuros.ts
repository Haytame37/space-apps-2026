import { useMemo } from 'react'
import { LANGS, useI18n } from '../i18n/context'

/** Formats whole euros in the current language. */
export function useEuros() {
  const { lang } = useI18n()
  return useMemo(() => {
    const locale = LANGS.find((l) => l.code === lang)?.locale ?? 'en-GB'
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, numberingSystem: 'latn' })
    return (n: number) => format.format(n)
  }, [lang])
}
