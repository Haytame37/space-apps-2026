// The Pioneer 10 colouring book: what it is, what is for sale, and the journey it tells.
// Interface texts live in the locale files (`book`); the book's own title, subtitle and
// page captions stay in English, as printed.

import type { TimelineDate } from './machines'

const day = (date: string): TimelineDate => ({ date, precision: 'day' })

export const PIONEER_BOOK = {
  id: 'pioneer-10',
  title: 'Pioneer 10',
  subtitle: 'A Story-Telling Adventure',
  pages: 23,
  /** Pages with a drawing to colour (the title page and the 19 caption pages). */
  colouringPages: 20,
  ages: { from: 6, to: 9 },
  /** Language of the book's text. */
  language: 'en',
  format: 'A4',
  /** Folder of the images made by scripts/book-pages.mjs. */
  folder: '/books/pioneer-10',
  /** Width and height of the page images, in pixels. */
  pageSize: { width: 700, height: 990 },
  source: 'https://science.nasa.gov/mission/pioneer-10/',
} as const

export type BookOfferId = 'pdf' | 'print' | 'class'

export interface BookOffer {
  id: BookOfferId
  /** Euros. Proposals from the reference design: to be confirmed by the team. */
  price: number
  isPriceToConfirm: boolean
  /** Printed copies included (class pack). */
  copies?: number
  /** The offer shown first and highlighted. */
  isFeatured?: boolean
}

export const PIONEER_OFFERS: BookOffer[] = [
  { id: 'pdf', price: 3, isPriceToConfirm: true },
  { id: 'print', price: 9, isPriceToConfirm: true, isFeatured: true },
  { id: 'class', price: 39, isPriceToConfirm: true, copies: 10 },
]

/** The five stops of the journey, from the book's captions (texts in the locale files, same order). */
export const PIONEER_JOURNEY: TimelineDate[] = [
  day('1972-03-02'),
  day('1972-07-15'),
  day('1973-12-04'),
  day('1983-06-13'),
  day('2003-01-23'),
]

/** Drawings of the colouring workshop, cropped from these book pages (as printed in the book). */
export const PIONEER_COLOURING = [
  { src: '/books/pioneer-10/color-1.png', bookPage: 2 },
  { src: '/books/pioneer-10/color-2.png', bookPage: 3 },
  { src: '/books/pioneer-10/color-3.png', bookPage: 15 },
] as const

/** Path of page `n` (1-based) of the book. */
export const pageSrc = (n: number) => `${PIONEER_BOOK.folder}/page-${String(n).padStart(2, '0')}.webp`

/**
 * What each page shows, as printed (English), for screen readers. Captions are copied from the
 * book without correction: the team decides on the typos (see "all-nuclearelectrical", page 7).
 */
export const PIONEER_PAGE_TEXT: string[] = [
  'Cover: Pioneer 10, A Story-Telling Adventure. 20 pages of adventure!',
  'Title page: Pioneer 10: The Little Spacecraft. Colored by: (a line to write your name).',
  'Meet Pioneer 10! NASA’s first mission to the outer planets. It weighed 569 pounds (258 kg).',
  'Liftoff! Pioneer 10 launched on March 2, 1972, from Florida.',
  'It reached 32,110 miles per hour, faster than any human-made object before!',
  'In March 1972, controllers steered it twice to keep it on course.',
  'It was the first spacecraft to use all-nuclearelectrical power.',
  'On July 15, 1972, it entered the asteroid belt. It was the first spacecraft to fly through it!',
  'It travelled about 271 million miles through the asteroid belt and was hit by fewer asteroids than expected.',
  'This plaque is a hello for anyone who might find Pioneer 10 one day.',
  'Together with Pioneer 9, it recorded one of the most violent solar storms in recent record.',
  'In November 1973, Pioneer 10 began taking pictures of Jupiter.',
  'On Nov. 26, 1973, it entered Jupiter’s huge magnetic bubble.',
  'On Dec. 4, 1973, it zoomed past Jupiter, 81,000 miles away, at 78,000 miles per hour!',
  'It took about 500 pictures of Jupiter’s clouds, including the Great Red Spot.',
  'It photographed Callisto, Ganymede, and Europa. Ganymede got its very first close-up!',
  'It passed behind Jupiter for a radio experiment, and its instruments gathered more information about Jupiter’s atmosphere.',
  'It crossed Saturn’s orbit in 1976, and on June 13, 1983, became the first human-made object to go beyond Neptune’s orbit.',
  'NASA ended routine contact in 1997. Until 1998, Pioneer 10 was the farthest human-made object, until Voyager 1 passed it. It worked for more than 30 years, though it was planned for 21 months!',
  'Its last signal came on Jan. 23, 2003, from 7.6 billion miles away. It took 11 hours 20 minutes to reach Earth.',
  'Pioneer 10 is heading toward the star Aldebaran and will pass it in about 2 million years!',
  'About this book: sources, AI disclosure, fonts and licence.',
  'Back cover: Pioneer 10: The Story Continues!',
]
