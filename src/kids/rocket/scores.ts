// The best missions of "Asteroid Run", kept on this device. If storage is blocked (private
// window), the game still works: the scores just last for the visit.

const STORAGE_KEY = 'space-memory:rocket-scores'
const KEPT = 5

export interface Run {
  score: number
  distance: number
  machines: number
  /** ISO date of the end of the run. */
  at: string
}

export interface Board {
  best: number
  runs: Run[]
}

const EMPTY: Board = { best: 0, runs: [] }
let memory: Board = EMPTY

const isRun = (r: unknown): r is Run =>
  typeof r === 'object' &&
  r !== null &&
  typeof (r as Run).score === 'number' &&
  typeof (r as Run).distance === 'number' &&
  typeof (r as Run).machines === 'number' &&
  typeof (r as Run).at === 'string'

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return memory
    const data: unknown = JSON.parse(raw)
    const runs = Array.isArray((data as Board)?.runs) ? (data as Board).runs.filter(isRun).slice(0, KEPT) : []
    return { best: Math.max(0, ...runs.map((r) => r.score)), runs }
  } catch {
    return memory
  }
}

/** Adds a run, keeps the five best, and tells whether it beats the previous record. */
export function saveRun(run: Run): { board: Board; isRecord: boolean } {
  const before = loadBoard()
  const runs = [...before.runs, run].sort((a, b) => b.score - a.score).slice(0, KEPT)
  const board = { best: Math.max(before.best, run.score), runs }
  memory = board
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  } catch {
    // Storage blocked: the board lives in memory for this visit.
  }
  return { board, isRecord: run.score > before.best }
}
