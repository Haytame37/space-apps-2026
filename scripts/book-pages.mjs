// Turns the Pioneer 10 colouring book PDF into the images the site shows.
//
//   node scripts/book-pages.mjs [path/to/book.pdf]
//
// Writes, in public/books/pioneer-10/:
//   page-01.webp … page-23.webp   every page, about 700 px wide, for the flip-through
//   color-1.png … color-3.png     three drawings in greys, cropped without the blue caption band,
//                                 for the colouring workshop
//
// Pages are rendered with pdftoppm (Poppler) when it is installed, otherwise with pdfjs-dist
// (`npm i -D pdfjs-dist`). Images are encoded with sharp, a development dependency.

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const PDF = resolve(process.argv[2] ?? 'Coloring Book Pioneer 10.pdf')
const OUT = resolve('public/books/pioneer-10')
const PAGE_WIDTH = 700
/** PDF pages (1-based) used for colouring, in the order of the workshop. */
const COLOR_PAGES = [3, 4, 16]
const COLOR_WIDTH = 700
/** Resolution for the colouring sources: sharp enough to crop and shrink cleanly. */
const COLOR_DPI = 150

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
    // Every page, for the flip-through.
    const pagesDir = join(work, 'pages')
    mkdirSync(pagesDir)
    const dpi = Math.round((PAGE_WIDTH / 595) * 72 * 1.5) // a little larger, then downscaled for crisp lines
    const pages = await renderPages(pagesDir, { dpi })
    for (const [i, file] of pages.entries()) {
      const name = `page-${String(i + 1).padStart(2, '0')}.webp`
      await sharp(file).resize({ width: PAGE_WIDTH }).webp({ quality: 78 }).toFile(join(OUT, name))
    }
    console.log(`${pages.length} pages written`)

    // Three drawings for the colouring workshop.
    for (const [k, n] of COLOR_PAGES.entries()) {
      const dir = join(work, `color-${n}`)
      mkdirSync(dir)
      const [file] = await renderPages(dir, { dpi: COLOR_DPI, first: n, last: n })
      const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const bottom = drawingBottom(data, info.width, info.height)
      const box = inkBox(data, info.width, bottom - 4)
      await sharp(file)
        .extract(box)
        .resize({ width: COLOR_WIDTH })
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
