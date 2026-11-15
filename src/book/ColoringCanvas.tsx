import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { ColouringBook } from '../data/books'
import { useI18n } from '../i18n/context'

/** Twelve felt-tip colours, in the order of the colour names in the locale files. */
const COLOURS = ['#ff3b30', '#ff6a1a', '#ffd23f', '#7ed957', '#1fae6b', '#5ee7ff', '#1557d6', '#7b4dff', '#ff7ac8', '#a0522d', '#9aa3b5', '#ffffff']
const WHITE = 0xffffff
/** Below this brightness a pixel is a drawn line: paint never crosses it. */
const LINE = 120
const UNDO_STEPS = 12
/** Keyboard target: small and large steps, in pixels of the drawing. */
const STEP = 8
const BIG_STEP = 40

interface Sheet {
  src: string
  width: number
  height: number
  /** Brightness of each pixel of the original drawing, 0 to 255. */
  lum: Uint8Array
  /** Colour painted on each pixel, 0xRRGGBB. */
  paint: Uint32Array
  history: Uint32Array[]
}

/** Colouring kept while the visitor stays on the site, one entry per drawing. */
const sheets = new Map<string, Sheet>()

const toRgb = (hex: string) => parseInt(hex.slice(1), 16)

function load(src: string): Promise<Sheet> {
  const known = sheets.get(src)
  if (known) return Promise.resolve(known)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img
      const scratch = document.createElement('canvas')
      scratch.width = width
      scratch.height = height
      const ctx = scratch.getContext('2d', { willReadFrequently: true })
      if (!ctx) return reject(new Error('No 2D canvas'))
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, width, height).data
      const lum = new Uint8Array(width * height)
      for (let i = 0; i < lum.length; i++) lum[i] = data[i * 4]
      const sheet: Sheet = { src, width, height, lum, paint: new Uint32Array(width * height).fill(WHITE), history: [] }
      sheets.set(src, sheet)
      resolve(sheet)
    }
    img.onerror = () => reject(new Error(`Cannot load ${src}`))
    img.src = src
  })
}

/** Each pixel keeps the brightness of the drawing, multiplied by its paint: black lines stay sharp. */
function draw(canvas: HTMLCanvasElement, sheet: Sheet) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (canvas.width !== sheet.width) canvas.width = sheet.width
  if (canvas.height !== sheet.height) canvas.height = sheet.height
  const image = ctx.createImageData(sheet.width, sheet.height)
  const d = image.data
  for (let i = 0, j = 0; i < sheet.lum.length; i++, j += 4) {
    const k = sheet.lum[i] / 255
    const p = sheet.paint[i]
    d[j] = ((p >> 16) & 255) * k
    d[j + 1] = ((p >> 8) & 255) * k
    d[j + 2] = (p & 255) * k
    d[j + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
}

/** Paints the area around (x, y) up to the drawn lines. Returns false when there was nothing to paint. */
function fill(sheet: Sheet, x: number, y: number, colour: number): boolean {
  const { width, height, lum, paint } = sheet
  const start = y * width + x
  if (x < 0 || y < 0 || x >= width || y >= height || lum[start] < LINE) return false
  const from = paint[start]
  if (from === colour) return false
  sheet.history = [...sheet.history.slice(-(UNDO_STEPS - 1)), paint.slice()]
  const stack = [start]
  while (stack.length) {
    const i = stack.pop()!
    if (paint[i] !== from || lum[i] < LINE) continue
    paint[i] = colour
    const px = i % width
    if (px > 0) stack.push(i - 1)
    if (px < width - 1) stack.push(i + 1)
    if (i >= width) stack.push(i - width)
    if (i < width * (height - 1)) stack.push(i + width)
  }
  return true
}

/** Colour three real pages of the book: pick a colour, then touch an area of the drawing. */
export function ColoringCanvas({ drawings }: { drawings: ColouringBook['colouring'] }) {
  const { t, fmt } = useI18n()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [index, setIndex] = useState(0)
  const [colour, setColour] = useState(COLOURS[5])
  /** The drawing that is loaded and on screen; the pixels themselves live in the `sheets` cache. */
  const [ready, setReady] = useState<{ src: string; width: number; height: number } | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null)
  const [status, setStatus] = useState('')
  const src = drawings[index].src
  const shown = ready?.src === src ? ready : null

  useEffect(() => {
    let isCurrent = true
    load(src).then(
      (s) => {
        if (!isCurrent) return
        setReady({ src, width: s.width, height: s.height })
        setCanUndo(s.history.length > 0)
        setTarget({ x: Math.round(s.width / 2), y: Math.round(s.height / 2) })
      },
      () => isCurrent && setStatus(t.book.loadError),
    )
    return () => {
      isCurrent = false
    }
  }, [src, t])

  useEffect(() => {
    const sheet = shown && sheets.get(shown.src)
    if (sheet && canvas.current) draw(canvas.current, sheet)
  }, [shown])

  /** The drawing on screen, read from the cache at the moment it is needed. */
  const current = useCallback(() => (shown ? sheets.get(shown.src) : undefined), [shown])

  const paintAt = useCallback(
    (x: number, y: number) => {
      const sheet = current()
      if (!sheet || !canvas.current) return
      if (fill(sheet, x, y, toRgb(colour))) {
        draw(canvas.current, sheet)
        setCanUndo(true)
        setStatus(t.book.filled)
      } else {
        setStatus(sheet.lum[y * sheet.width + x] < LINE ? t.book.onLine : '')
      }
    },
    [current, colour, t],
  )

  const onClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const el = canvas.current
    if (!el || !shown) return
    const r = el.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * shown.width)
    const y = Math.floor(((e.clientY - r.top) / r.height) * shown.height)
    setTarget({ x, y })
    paintAt(x, y)
  }

  // Keyboard: the arrows move a target over the drawing (Shift for big steps), Enter or Space paints.
  const onKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (!shown || !target) return
    const step = e.shiftKey ? BIG_STEP : STEP
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[e.key]) {
      e.preventDefault()
      const [dx, dy] = moves[e.key]
      setTarget({ x: Math.min(shown.width - 1, Math.max(0, target.x + dx)), y: Math.min(shown.height - 1, Math.max(0, target.y + dy)) })
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      paintAt(target.x, target.y)
    }
  }

  const undo = () => {
    const sheet = current()
    if (!sheet || !canvas.current) return
    const previous = sheet.history[sheet.history.length - 1]
    if (!previous) return
    sheet.history = sheet.history.slice(0, -1)
    sheet.paint = previous
    draw(canvas.current, sheet)
    setCanUndo(sheet.history.length > 0)
  }

  const clear = () => {
    const sheet = current()
    if (!sheet || !canvas.current || sheet.paint.every((p) => p === WHITE)) return
    sheet.history = [...sheet.history.slice(-(UNDO_STEPS - 1)), sheet.paint.slice()]
    sheet.paint = new Uint32Array(sheet.width * sheet.height).fill(WHITE)
    draw(canvas.current, sheet)
    setCanUndo(true)
  }

  return (
    <div className="bk-atelier">
      <div className="bk-sheet">
        <div className="bk-canvas-wrap">
          <canvas
            ref={canvas}
            width={shown?.width ?? 700}
            height={shown?.height ?? 790}
            tabIndex={0}
            role="img"
            aria-label={fmt(t.book.canvasLabel, { n: drawings[index].bookPage })}
            aria-describedby="bk-canvas-help"
            onClick={onClick}
            onKeyDown={onKey}
          />
          {shown && target && (
            <span
              className="bk-target"
              style={{ left: `${(target.x / shown.width) * 100}%`, top: `${(target.y / shown.height) * 100}%`, color: colour }}
              aria-hidden="true"
            />
          )}
        </div>
        <p id="bk-canvas-help" className="sr-only">
          {t.book.keyboardHelp}
        </p>
        <p className="sr-only" role="status">
          {status}
        </p>
      </div>
      <div className="bk-tools">
        <h3>{t.book.colours}</h3>
        <div className="bk-palette" role="group" aria-label={t.book.colours}>
          {COLOURS.map((c, i) => (
            <button
              key={c}
              type="button"
              style={{ background: c }}
              aria-pressed={c === colour}
              aria-label={t.book.colourNames[i]}
              title={t.book.colourNames[i]}
              onClick={() => setColour(c)}
            />
          ))}
        </div>
        <div className="bk-row">
          <button type="button" className="bk-btn bk-btn-alt bk-btn-small" disabled={!canUndo} onClick={undo}>
            {t.book.undo}
          </button>
          <button type="button" className="bk-btn bk-btn-alt bk-btn-small" onClick={clear}>
            {t.book.clear}
          </button>
        </div>
        <h3>{t.book.sheets}</h3>
        <div className="bk-thumbs" role="group" aria-label={t.book.sheets}>
          {drawings.map((s, i) => (
            <button
              key={s.src}
              type="button"
              style={{ backgroundImage: `url(${s.src})` }}
              aria-pressed={i === index}
              aria-label={fmt(t.book.sheet, { n: s.bookPage })}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <p className="bk-tip">{t.book.tip}</p>
      </div>
    </div>
  )
}
