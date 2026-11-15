import { placesOfMachine, type Machine, type Place } from '../data/machines'

/** What the large area of a story shows: the globe with its timeline, the machine's 3D model, or NASA's live view. */
export type ViewMode = 'globe' | 'model' | 'live'

/**
 * Height kept free at the top of the large area for the view selector. On wide screens its
 * buttons sit in the corners, so the globe may rise between them; on phones they span the width.
 */
export const VIEW_BAR_HEIGHT = { wide: 30, sheet: 60 }

/** The place whose NASA Eyes view is shown: the chosen site when Eyes has it, else the machine's first one that has. */
export function eyesPlaceOf(machine: Machine, place?: Place): Place | undefined {
  return place?.eyes ? place : placesOfMachine(machine.id).find((p) => p.eyes)
}

/** Views a story can show in the large area, in the order of the selector. */
export function viewModesOf(machine: Machine | undefined, canDraw3d: boolean): ViewMode[] {
  if (!machine) return ['globe']
  const modes: ViewMode[] = ['globe']
  if (machine.model && canDraw3d) modes.push('model')
  if (eyesPlaceOf(machine)) modes.push('live')
  return modes
}
