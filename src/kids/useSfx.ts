import { useSyncExternalStore } from 'react'

export type SfxName = 'tap' | 'good' | 'bad' | 'win'

/** [frequency in Hz, start in seconds, duration in seconds] */
type Note = [number, number, number]

const SOUNDS: Record<SfxName, { notes: Note[]; wave: OscillatorType }> = {
  tap: { notes: [[520, 0, 0.08]], wave: 'triangle' },
  good: { notes: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.2]], wave: 'triangle' },
  bad: { notes: [[220, 0, 0.18], [185, 0.14, 0.22]], wave: 'sine' },
  win: { notes: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.35]], wave: 'triangle' },
}

const STORAGE_KEY = 'space-memory:kid-sound'
const listeners = new Set<() => void>()
let isOn = readSetting()
let audio: AudioContext | null = null

function readSetting(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Little synth notes made on the spot. The audio only starts after a tap, as browsers require. */
function play(name: SfxName) {
  if (!isOn) return
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
    const { notes, wave } = SOUNDS[name]
    for (const [frequency, start, duration] of notes) {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = wave
      osc.frequency.value = frequency
      osc.connect(gain)
      gain.connect(audio.destination)
      const at = audio.currentTime + start
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      osc.start(at)
      osc.stop(at + duration + 0.02)
    }
  } catch {
    // No audio on this device: the games work silently.
  }
}

function toggle() {
  isOn = !isOn
  try {
    localStorage.setItem(STORAGE_KEY, isOn ? 'on' : 'off')
  } catch {
    // The choice still applies for this visit.
  }
  listeners.forEach((fn) => fn())
  play('tap')
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export interface Sfx {
  play: (name: SfxName) => void
  isOn: boolean
  toggle: () => void
}

/** Sound effects of the kids' corner, with one on/off switch shared by every game. */
export function useSfx(): Sfx {
  const on = useSyncExternalStore(subscribe, () => isOn)
  return { play, isOn: on, toggle }
}
