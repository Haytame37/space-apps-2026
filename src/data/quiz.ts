import type { MachineId, WorldId } from './machines'

/** Answers for the questions in each locale's `quizItems`, in the same order. */
export const QUIZ: { world: WorldId; answer: 0 | 1 | 2; machine: MachineId }[] = [
  { world: 'moon', answer: 1, machine: 'apollo-lm' },
  { world: 'moon', answer: 0, machine: 'surveyor' },
  { world: 'moon', answer: 1, machine: 'alsep' },
  { world: 'moon', answer: 1, machine: 'lrv' },
  { world: 'mars', answer: 0, machine: 'pathfinder' },
  { world: 'mars', answer: 0, machine: 'mer' },
  { world: 'mars', answer: 2, machine: 'ingenuity' },
  { world: 'mars', answer: 1, machine: 'viking' },
  { world: 'deep', answer: 0, machine: 'near' },
  { world: 'deep', answer: 1, machine: 'kepler' },
  { world: 'deep', answer: 0, machine: 'dawn' },
  { world: 'deep', answer: 0, machine: 'pioneer' },
]

/**
 * "True or false?" for young explorers. Each statement and its explanation are in each
 * locale's `kids.quiz`, in the same order, and restate what the machine's story already says.
 */
export const KID_QUIZ: { machine: MachineId; isTrue: boolean }[] = [
  { machine: 'lrv', isTrue: true },
  { machine: 'pathfinder', isTrue: true },
  { machine: 'ingenuity', isTrue: false },
  { machine: 'surveyor', isTrue: true },
  { machine: 'viking', isTrue: false },
  { machine: 'mer', isTrue: true },
  { machine: 'apollo-lm', isTrue: false },
  { machine: 'alsep', isTrue: true },
  { machine: 'phoenix-insight', isTrue: true },
  { machine: 'dawn', isTrue: true },
  { machine: 'near', isTrue: false },
  { machine: 'pioneer', isTrue: true },
  { machine: 'kepler', isTrue: true },
]
