// Turns a colouring book PDF into the images the site shows.
//
//   node scripts/book-pages.mjs <book-id> [path/to/book.pdf]
//
//   book-id   pioneer-10 | apollo-11 (see BOOKS below)
//
// Writes, in public/books/<book-id>/:
//   page-01.webp … page-NN.webp   every page, about 700 px wide, for the flip-through
//   color-1.png … color-3.png     three drawings in greys, cropped without the blue caption band,
//                                 for the colouring workshop
//
// The drawings were generated with AI (Google Gemini). As the NASA Space Apps rules ask, every page
// that holds a drawing gets a visible "AI-generated" mark, burnt into the image.
//
// Pages are rendered with pdftoppm (Poppler) when it is installed, otherwise with pdfjs-dist
// (`npm i -D pdfjs-dist`). Images are encoded with sharp, a development dependency.

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

/** Each book: its PDF, the pages (1-based) cropped for colouring, and the pages with no drawing. */
const BOOKS = {
  'pioneer-10': { pdf: 'assets/books/pioneer-10.pdf', colorPages: [3, 4, 16], textPages: [22] },
  'apollo-11': { pdf: 'assets/books/apollo-11.pdf', colorPages: [3, 5, 10], textPages: [22] },
}

const BOOK_ID = process.argv[2] ?? 'pioneer-10'
const BOOK = BOOKS[BOOK_ID]
if (!BOOK) {
  console.error(`Unknown book "${BOOK_ID}". Known: ${Object.keys(BOOKS).join(', ')}`)
  process.exit(1)
}
const PDF = resolve(process.argv[3] ?? BOOK.pdf)
const OUT = resolve(`public/books/${BOOK_ID}`)
const PAGE_WIDTH = 700
const COLOR_WIDTH = 700
/** Resolution for the colouring sources: sharp enough to crop and shrink cleanly. */
const COLOR_DPI = 150
const MARK_TEXT = 'AI-generated drawing · Google Gemini'

function hasPdftoppm() {
  try {
    execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/** Renders every page to PNG files in `dir`, named p-01.png, p-02.png… Returns their paths in order. */
async function renderPages(dir, { dpi, first, last }) {
  if (hasPdftoppm()) {
    const args = ['-png', '-r', String(dpi)]
    if (first) args.push('-f', String(first), '-l', String(last ?? first))
    execFileSync('pdftoppm', [...args, PDF, join(dir, 'p')])
    return readdirSync(dir)
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => join(dir, f))
  }
  let pdfjs
  try {
    pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  } catch {
    throw new Error('Neither pdftoppm (Poppler) nor pdfjs-dist is available. Install one: `npm i -D pdfjs-dist`.')
  }
  const { readFileSync } = await import('node:fs')
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(PDF)) }).promise
  const files = []
  for (let n = first ?? 1; n <= (last ?? first ?? doc.numPages); n++) {
    const page = await doc.getPage(n)
    const viewport = page.getViewport({ scale: dpi / 72 })
    const canvas = doc.canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height))
    await page.render({ canvasContext: canvas.context, viewport }).promise
    const file = join(dir, `p-${String(n).padStart(2, '0')}.png`)
    await sharp(canvas.canvas.toBuffer('image/png')).toFile(file)
    files.push(file)
  }
  return files
}

/** A small label "AI-generated drawing", as an SVG of the given width, for the top corner of an image. */
function markSvg(imageWidth) {
  const size = Math.max(10, Math.round(imageWidth * 0.017))
  const w = Math.round(size * 0.56 * MARK_TEXT.length + size * 1.6)
  const h = Math.round(size * 2)
  return {
    width: w,
    height: h,
    svg: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
        `<rect width="${w}" height="${h}" rx="${h / 2}" fill="#0b1022" fill-opacity="0.82"/>` +
        `<text x="${w / 2}" y="${h * 0.68}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" fill="#ffffff">${MARK_TEXT}</text>` +
        '</svg>',
    ),
  }
}

/** Burns the mark into the top-right corner of an image buffer of the given width. */
function withMark(image, width) {
  const mark = markSvg(width)
  const inset = Math.round(width * 0.02)
  return image.composite([{ input: mark.svg, top: inset, left: width - mark.width - inset }])
}

/** Height of the drawing: everything above the first row that is mostly the caption's blue. */
function drawingBottom(data, width, height) {
  for (let y = Math.floor(height * 0.5); y < height; y++) {
    let blue = 0
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      if (data[i + 2] > 150 && data[i] < 90 && data[i + 1] < 140) blue++
    }
    if (blue > width * 0.4) return y
  }
  return height
}

/** Smallest box around the dark lines of the drawing, within the top `bottom` rows. */
function inkBox(data, width, bottom) {
  let top = bottom
  let left = width
  let right = 0
  let low = 0
  for (let y = 0; y < bottom; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      if (data[i] + data[i + 1] + data[i + 2] < 3 * 160) {
        if (y < top) top = y
        if (y > low) low = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }
  return { left, top, width: right - left + 1, height: low - top + 1 }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const work = mkdtempSync(join(tmpdir(), 'ayyur-book-'))
  try {
    // Every page, for the flip-through; pages with a drawing carry the AI mark.
    const pagesDir = join(work, 'pages')
    mkdirSync(pagesDir)
    const dpi = Math.round((PAGE_WIDTH / 595) * 72 * 1.5) // a little larger, then downscaled for crisp lines
    const pages = await renderPages(pagesDir, { dpi })
    for (const [i, file] of pages.entries()) {
      const name = `page-${String(i + 1).padStart(2, '0')}.webp`
      const resized = await sharp(file).resize({ width: PAGE_WIDTH }).toBuffer()
      const page = BOOK.textPages.includes(i + 1) ? sharp(resized) : withMark(sharp(resized), PAGE_WIDTH)
      await page.webp({ quality: 78 }).toFile(join(OUT, name))
    }
    console.log(`${pages.length} pages written to ${OUT}`)

    // Three drawings for the colouring workshop.
    for (const [k, n] of BOOK.colorPages.entries()) {
      const dir = join(work, `color-${n}`)
      mkdirSync(dir)
      const [file] = await renderPages(dir, { dpi: COLOR_DPI, first: n, last: n })
      const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const bottom = drawingBottom(data, info.width, info.height)
      const box = inkBox(data, info.width, bottom - 4)
      const cropped = await sharp(file).extract(box).resize({ width: COLOR_WIDTH }).toBuffer()
      await withMark(sharp(cropped), COLOR_WIDTH)
        .toColourspace('b-w')
        .png({ compressionLevel: 9 })
        .toFile(join(OUT, `color-${k + 1}.png`))
      console.log(`color-${k + 1}.png from page ${n}: ${box.width}×${box.height} px cropped`)
    }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
