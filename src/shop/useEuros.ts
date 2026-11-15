import { useMemo } from 'react'
import { LANGS, useI18n } from '../i18n/context'

/** Formats euros in the current language: whole amounts without cents (49 €), others with (2,90 €). */
export function useEuros() {
  const { lang } = useI18n()
  return useMemo(() => {
    const locale = LANGS.find((l) => l.code === lang)?.locale ?? 'en-GB'
    const options = { style: 'currency', currency: 'EUR', numberingSystem: 'latn' } as const
    const whole = new Intl.NumberFormat(locale, { ...options, maximumFractionDigits: 0 })
    const cents = new Intl.NumberFormat(locale, { ...options, minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return (n: number) => (Number.isInteger(n) ? whole : cents).format(n)
  }, [lang])
}
