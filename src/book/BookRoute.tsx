import { lazy, Suspense } from 'react'
import { useParams } from 'react-router'
import { AyyurLoader } from '../components/AyyurLoader'
import { colouringBookOf } from '../data/books'
import { useI18n } from '../i18n/context'
import { NotFound } from '../pages/NotFound'

/** The book's page and its fonts load only when a book is visited. */
const BookPage = lazy(() => import('../pages/BookPage'))

/** `/shop/<book id>`: the page of that colouring book, or "not found" for an unknown id. */
export function BookRoute() {
  const { t } = useI18n()
  const book = colouringBookOf(useParams().bookId)
  if (!book) return <NotFound />
  return (
    <Suspense
      fallback={
        <div className="book-loading">
          <AyyurLoader label={t.common.loading} />
        </div>
      }
    >
      {/* A new book starts fresh: first page, first drawing. */}
      <BookPage key={book.id} book={book} />
    </Suspense>
  )
}
