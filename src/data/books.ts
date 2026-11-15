// The colouring books: what each one is, what is for sale, and the journey it tells.
// Interface texts live in the locale files (`book`, and `book.books[<id>]` for each book's own
// lead, stops and cart name); each book's title, subtitle and page captions stay in English,
// as printed. Images are made from the PDFs by scripts/book-pages.mjs.

import type { TimelineDate } from './machines'

const day = (date: string): TimelineDate => ({ date, precision: 'day' })

export type ColouringBookId = 'pioneer-10' | 'apollo-11'

export interface ColouringBook {
  id: ColouringBookId
  title: string
  subtitle: string
  pages: number
  /** Pages with a drawing to colour. */
  colouringPages: number
  ages: { from: number; to: number }
  /** Language of the book's text. */
  language: string
  format: string
  /** Folder of the images made by scripts/book-pages.mjs. */
  folder: string
  /** Width and height of the page images, in pixels. */
  pageSize: { width: number; height: number }
  /** The NASA page every fact of the book was checked against. */
  source: { url: string; label: string }
  /** The five stops of the journey, from the book's captions (texts in the locale files, same order). */
  journey: TimelineDate[]
  /** Drawings of the colouring workshop, cropped from these book pages (as printed in the book). */
  colouring: { src: string; bookPage: number }[]
  /** What each page shows, as printed (English), for screen readers. */
  pageText: string[]
}

const PIONEER_BOOK: ColouringBook = {
  id: 'pioneer-10',
  title: 'Pioneer 10',
  subtitle: 'A Story-Telling Adventure',
  pages: 23,
  colouringPages: 20,
  ages: { from: 6, to: 9 },
  language: 'en',
  format: 'A4',
  folder: '/books/pioneer-10',
  pageSize: { width: 700, height: 990 },
  source: { url: 'https://science.nasa.gov/mission/pioneer-10/', label: 'NASA Science — Pioneer 10' },
  journey: [day('1972-03-02'), day('1972-07-15'), day('1973-12-04'), day('1983-06-13'), day('2003-01-23')],
  colouring: [
    { src: '/books/pioneer-10/color-1.png', bookPage: 2 },
    { src: '/books/pioneer-10/color-2.png', bookPage: 3 },
    { src: '/books/pioneer-10/color-3.png', bookPage: 15 },
  ],
  // Captions are copied from the book without correction: the team decides on the typos
  // (see "all-nuclearelectrical", page 7).
  pageText: [
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
  ],
}

const APOLLO_BOOK: ColouringBook = {
  id: 'apollo-11',
  title: 'Apollo 11 Eagle',
  subtitle: 'The Moon Lander That Was Left Behind',
  pages: 23,
  colouringPages: 20,
  ages: { from: 6, to: 9 },
  language: 'en',
  format: 'A4',
  folder: '/books/apollo-11',
  pageSize: { width: 700, height: 990 },
  source: {
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
    label: 'NSSDCA — Apollo 11 Lunar Module / EASEP',
  },
  journey: [day('1969-07-16'), day('1969-07-20'), day('1969-07-20'), day('1969-07-21'), day('1969-08-27')],
  colouring: [
    { src: '/books/apollo-11/color-1.png', bookPage: 2 },
    { src: '/books/apollo-11/color-2.png', bookPage: 4 },
    { src: '/books/apollo-11/color-3.png', bookPage: 9 },
  ],
  pageText: [
    'Cover: Apollo 11 Module / EASEP, A Storytelling Adventure! 20 fun pages to color!',
    'Title page: Eagle: The Moon Lander That Was Left Behind.',
    'Meet Eagle! Apollo 11’s lunar module was the first crewed vehicle to land on the Moon. It weighed 15,103 kg (about 33,300 pounds).',
    'Apollo 11 blasted off on a Saturn 5 rocket from Cape Canaveral on July 16, 1969.',
    'Eagle had two stages: the bottom part with four landing legs, and the top part where the two astronauts stayed.',
    'The crew cabin was tiny (6.65 cubic meters), with two triangular windows and no seats!',
    'On July 20, 1969, Eagle undocked from the Command Module, flown by Michael Collins.',
    'Eagle’s descent engine fired for 756 seconds, about 12 and a half minutes, to bring it down to the Moon.',
    'Touchdown in the Sea of Tranquility! “Houston, Tranquility Base here. The Eagle has landed.”',
    'At 10:56 p.m. (U.S. Eastern time), Neil Armstrong stepped onto the Moon: “That’s one small step for man, one giant leap for mankind.”',
    'Buzz Aldrin followed 19 minutes later and called the Moon “Magnificent desolation.”',
    'They unveiled a plaque that says “We came in peace for all mankind,” put up an American flag, and talked to President Nixon by radio.',
    'They collected 21.55 kg (about 47.5 pounds) of Moon rock and soil, took photos, and walked about 250 meters in total.',
    'They set up EASEP, a 48 kg science package with a seismometer and a dust detector. A laser reflector sat about 5 meters away.',
    'EASEP’s two solar panels gave it power, so it could only work in the lunar day. It was turned on from Earth while the astronauts were still there!',
    'After 1 hour 41 minutes outside, Buzz Aldrin went back in. Armstrong followed about 12 minutes later. Then they rested for 7 hours.',
    'After 21 hours 36 minutes on the Moon, Eagle’s top half lifted off. The bottom half stayed behind as its launch platform.',
    'The top half docked with Michael Collins’s Command Module. Then Eagle was let go in orbit around the Moon.',
    'Its fate is not known. It is assumed to have crashed onto the Moon within 1 to 4 months.',
    'EASEP kept working even when it got 30 °C hotter than planned! On Aug. 27, 1969, it stopped answering commands and its mission ended.',
    'Eagle’s bottom half and EASEP were left in the Sea of Tranquility. Scientists found the exact spot using pictures from the Lunar Reconnaissance Orbiter.',
    'About this book: sources, AI disclosure, fonts and licence.',
    'Back cover: The Apollo 11 Story Continues!',
  ],
}

/** Every colouring book, in the order of the shop. */
export const COLOURING_BOOKS: ColouringBook[] = [APOLLO_BOOK, PIONEER_BOOK]

export const colouringBookOf = (id: string | undefined): ColouringBook | undefined => COLOURING_BOOKS.find((b) => b.id === id)

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

/** The same three versions for every colouring book. */
export const BOOK_OFFERS: BookOffer[] = [
  { id: 'pdf', price: 3, isPriceToConfirm: true },
  { id: 'print', price: 9, isPriceToConfirm: true, isFeatured: true },
  { id: 'class', price: 39, isPriceToConfirm: true, copies: 10 },
]

/** Path of page `n` (1-based) of a book. */
export const pageSrc = (book: ColouringBook, n: number) => `${book.folder}/page-${String(n).padStart(2, '0')}.webp`
