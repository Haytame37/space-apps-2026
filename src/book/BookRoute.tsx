import { lazy, Suspense } from 'react'
import { AyyurLoader } from '../components/AyyurLoader'
import { useI18n } from '../i18n/context'

/** The book's page and its fonts load only when it is visited. */
const BookPioneer = lazy(() => import('../pages/BookPioneer'))

export function BookRoute() {
  const { t } = useI18n()
  return (
    <Suspense
      fallback={
        <div className="book-loading">
          <AyyurLoader label={t.common.loading} />
        </div>
      }
    >
      <BookPioneer />
    </Suspense>
  )
}
