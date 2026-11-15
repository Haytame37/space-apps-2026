// Every fact, coordinate, date, picture and 3D model in this file comes from the
// challenge's official Resources tab (NSSDCA and the listed science.nasa.gov
// mission pages) or from a NASA page those resources embed or link to.

export type WorldId = 'moon' | 'mars' | 'deep'

export type MachineId =
  | 'apollo-lm'
  | 'lrv'
  | 'alsep'
  | 'surveyor'
  | 'pathfinder'
  | 'mer'
  | 'viking'
  | 'phoenix-insight'
  | 'ingenuity'
  | 'dawn'
  | 'near'
  | 'pioneer'
  | 'kepler'

export type SourceId = keyof typeof SOURCES

export const SOURCES = {
  challenge: {
    label: 'NASA Space Apps Challenge 2026 — challenge resources',
    url: 'https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources',
  },
  'nssdca-a11': {
    label: 'NSSDCA 1969-059C — Apollo 11 Lunar Module / EASEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
  },
  'nssdca-a12': {
    label: 'NSSDCA 1969-099C — Apollo 12 Lunar Module / ALSEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C',
  },
  'nssdca-a14': {
    label: 'NSSDCA 1971-008C — Apollo 14 Lunar Module / ALSEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-008C',
  },
  'nssdca-a15': {
    label: 'NSSDCA 1971-063C — Apollo 15 Lunar Module / ALSEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
  },
  'nssdca-a16': {
    label: 'NSSDCA 1972-031C — Apollo 16 Lunar Module / ALSEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-031C',
  },
  'nssdca-a17': {
    label: 'NSSDCA 1972-096C — Apollo 17 Lunar Module / ALSEP',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C',
  },
  'nssdca-s1': {
    label: 'NSSDCA 1966-045A — Surveyor 1',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A',
  },
  'nssdca-s3': {
    label: 'NSSDCA 1967-035A — Surveyor 3',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A',
  },
  'nssdca-s5': {
    label: 'NSSDCA 1967-084A — Surveyor 5',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-084A',
  },
  'nssdca-s6': {
    label: 'NSSDCA 1967-112A — Surveyor 6',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-112A',
  },
  'nssdca-s7': {
    label: 'NSSDCA 1968-001A — Surveyor 7',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1968-001A',
  },
  'sci-surveyor3': {
    label: 'NASA Science — Surveyor 3',
    url: 'https://science.nasa.gov/mission/surveyor-3/',
  },
  'sci-pathfinder': {
    label: 'NASA Science — Mars Pathfinder',
    url: 'https://science.nasa.gov/mission/mars-pathfinder/',
  },
  'nssdca-pathfinder': {
    label: 'NSSDCA 1996-068A — Mars Pathfinder',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A',
  },
  'sci-mer': {
    label: 'NASA Science — Mars Exploration Rovers: Spirit and Opportunity',
    url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
  },
  'nssdca-spirit': {
    label: 'NSSDCA 2003-027A — Spirit',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A',
  },
  'nssdca-opportunity': {
    label: 'NSSDCA 2003-032A — Opportunity',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
  },
  'sci-viking1': {
    label: 'NASA Science — Viking 1',
    url: 'https://science.nasa.gov/mission/viking-1/',
  },
  'nssdca-viking1': {
    label: 'NSSDCA 1975-075C — Viking 1 Lander',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C',
  },
  'nssdca-viking2': {
    label: 'NSSDCA 1975-083C — Viking 2 Lander',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-083C',
  },
  'sci-insight': {
    label: 'NASA Science — InSight Lander',
    url: 'https://science.nasa.gov/mission/insight/',
  },
  'nssdca-insight': {
    label: 'NSSDCA 2018-042A — InSight',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A',
  },
  'nssdca-phoenix': {
    label: 'NSSDCA 2007-034A — Phoenix Mars Lander',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A',
  },
  'sci-ingenuity': {
    label: 'NASA Science — Ingenuity Mars Helicopter',
    url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
  },
  'nssdca-m2020': {
    label: 'NSSDCA 2020-052A — Mars 2020',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2020-052A',
  },
  'sci-dawn': {
    label: 'NASA Science — Dawn',
    url: 'https://science.nasa.gov/mission/dawn/',
  },
  'nssdca-dawn': {
    label: 'NSSDCA 2007-043A — Dawn',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A',
  },
  'sci-near': {
    label: 'NASA Science — NEAR Shoemaker',
    url: 'https://science.nasa.gov/mission/near-shoemaker/',
  },
  'nssdca-near': {
    label: 'NSSDCA 1996-008A — NEAR Shoemaker',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-008A',
  },
  'sci-pioneer10': {
    label: 'NASA Science — Pioneer 10',
    url: 'https://science.nasa.gov/mission/pioneer-10/',
  },
  'nssdca-pioneer10': {
    label: 'NSSDCA 1972-012A — Pioneer 10',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-012A',
  },
  'nssdca-pioneer11': {
    label: 'NSSDCA 1973-019A — Pioneer 11',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1973-019A',
  },
  'sci-kepler': {
    label: 'NASA Science — Kepler / K2',
    url: 'https://science.nasa.gov/mission/kepler/',
  },
  'nssdca-kepler': {
    label: 'NSSDCA 2009-011A — Kepler',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-011A',
  },
  eyes: {
    label: 'NASA Eyes on the Solar System (NASA/JPL-Caltech)',
    url: 'https://eyes.nasa.gov/apps/solar-system/',
  },
  'eyes-asteroids': {
    label: 'NASA Eyes on Asteroids (NASA/JPL-Caltech)',
    url: 'https://eyes.nasa.gov/apps/asteroids/',
  },
  models: {
    label: 'NASA 3D models (NASA Visualization Technology Applications and Development)',
    url: 'https://science.nasa.gov/3d-resources/',
  },
} as const

export interface Place {
  id: string
  world: WorldId
  /** Proper name, kept in its international form in every language. */
  name: string
  region: string
  /** Degrees, north positive / east positive. Absent for deep-space places. */
  lat?: number
  lon?: number
  coordSource: SourceId
  machines: MachineId[]
  /** Entity id in NASA Eyes on the Solar System, when NASA publishes one. */
  eyes?: string
}

export const PLACES: Place[] = [
  { id: 'apollo-11', world: 'moon', name: 'Apollo 11', region: 'Mare Tranquillitatis', lat: 0.67416, lon: 23.47314, coordSource: 'nssdca-a11', machines: ['apollo-lm'] },
  { id: 'apollo-12', world: 'moon', name: 'Apollo 12 · Surveyor 3', region: 'Oceanus Procellarum', lat: -3.0128, lon: -23.4219, coordSource: 'nssdca-a12', machines: ['apollo-lm', 'alsep', 'surveyor'] },
  { id: 'apollo-14', world: 'moon', name: 'Apollo 14', region: 'Fra Mauro', lat: -3.64589, lon: -17.47194, coordSource: 'nssdca-a14', machines: ['apollo-lm', 'alsep'] },
  { id: 'apollo-15', world: 'moon', name: 'Apollo 15', region: 'Mare Imbrium · Hadley', lat: 26.13239, lon: 3.6333, coordSource: 'nssdca-a15', machines: ['apollo-lm', 'lrv', 'alsep'] },
  { id: 'apollo-16', world: 'moon', name: 'Apollo 16', region: 'Descartes', lat: -8.973, lon: 15.5002, coordSource: 'nssdca-a16', machines: ['apollo-lm', 'lrv', 'alsep'] },
  { id: 'apollo-17', world: 'moon', name: 'Apollo 17', region: 'Taurus-Littrow', lat: 20.1911, lon: 30.7723, coordSource: 'nssdca-a17', machines: ['apollo-lm', 'lrv', 'alsep'] },
  { id: 'surveyor-1', world: 'moon', name: 'Surveyor 1', region: 'Oceanus Procellarum', lat: -2.4745, lon: -43.3398, coordSource: 'nssdca-s1', machines: ['surveyor'] },
  { id: 'surveyor-5', world: 'moon', name: 'Surveyor 5', region: 'Mare Tranquillitatis', lat: 1.4551, lon: 23.1943, coordSource: 'nssdca-s5', machines: ['surveyor'] },
  { id: 'surveyor-6', world: 'moon', name: 'Surveyor 6', region: 'Sinus Medii', lat: 0.4742, lon: -1.4275, coordSource: 'nssdca-s6', machines: ['surveyor'] },
  { id: 'surveyor-7', world: 'moon', name: 'Surveyor 7', region: 'Tycho', lat: -40.9812, lon: -11.5127, coordSource: 'nssdca-s7', machines: ['surveyor'] },

  { id: 'viking-1', world: 'mars', name: 'Viking 1', region: 'Chryse Planitia', lat: 22.27, lon: -47.95, coordSource: 'nssdca-viking1', machines: ['viking'], eyes: 'sc_viking_1_lander' },
  { id: 'viking-2', world: 'mars', name: 'Viking 2', region: 'Utopia Planitia', lat: 47.6673, lon: 134.2809, coordSource: 'nssdca-viking2', machines: ['viking'], eyes: 'sc_viking_2_lander' },
  { id: 'pathfinder', world: 'mars', name: 'Mars Pathfinder · Sojourner', region: 'Ares Vallis', lat: 19.33, lon: -33.55, coordSource: 'nssdca-pathfinder', machines: ['pathfinder'], eyes: 'sc_mars_pathfinder' },
  { id: 'spirit', world: 'mars', name: 'Spirit', region: 'Gusev', lat: -14.572, lon: 175.478, coordSource: 'nssdca-spirit', machines: ['mer'], eyes: 'sc_mars_exploration_rover_2' },
  { id: 'opportunity', world: 'mars', name: 'Opportunity', region: 'Meridiani Planum', lat: -1.946, lon: -5.527, coordSource: 'nssdca-opportunity', machines: ['mer'], eyes: 'sc_mars_exploration_rover_1' },
  { id: 'phoenix', world: 'mars', name: 'Phoenix', region: '', lat: 68.15, lon: -125.9, coordSource: 'nssdca-phoenix', machines: ['phoenix-insight'], eyes: 'sc_phoenix' },
  { id: 'insight', world: 'mars', name: 'InSight', region: 'Elysium Planitia', lat: 4.5, lon: 135.9, coordSource: 'sci-insight', machines: ['phoenix-insight'], eyes: 'sc_insight' },
  { id: 'jezero', world: 'mars', name: 'Ingenuity', region: 'Jezero', lat: 18.44, lon: 77.45, coordSource: 'eyes', machines: ['ingenuity'] },

  { id: 'ceres', world: 'deep', name: 'Dawn', region: 'Ceres', coordSource: 'nssdca-dawn', machines: ['dawn'], eyes: 'sc_dawn' },
  { id: 'eros', world: 'deep', name: 'NEAR Shoemaker', region: '433 Eros', coordSource: 'sci-near', machines: ['near'], eyes: 'sc_near_shoemaker' },
  { id: 'pioneer-10', world: 'deep', name: 'Pioneer 10', region: '→ Aldebaran', coordSource: 'sci-pioneer10', machines: ['pioneer'], eyes: 'sc_pioneer_10' },
  { id: 'pioneer-11', world: 'deep', name: 'Pioneer 11', region: '', coordSource: 'nssdca-pioneer11', machines: ['pioneer'], eyes: 'sc_pioneer_11' },
  { id: 'kepler', world: 'deep', name: 'Kepler', region: '', coordSource: 'sci-kepler', machines: ['kepler'], eyes: 'sc_kepler_space_telescope' },
]

export type DatePrecision = 'day' | 'month' | 'year'

export interface TimelineDate {
  /** ISO date; only the parts covered by `precision` are meaningful. */
  date: string
  precision: DatePrecision
}

export type FactKey =
  | 'launched'
  | 'landed'
  | 'arrived'
  | 'lastContact'
  | 'missionEnd'
  | 'mass'
  | 'distance'
  | 'flights'
  | 'pictures'
  | 'planets'
  | 'power'

export interface Fact {
  key: FactKey
  /** Which unit of a pair the fact is about, e.g. "Spirit". */
  of?: string
  date?: TimelineDate
  num?: number
  unit?: 'kg' | 'km' | 'W'
  plus?: boolean
}

export interface Machine {
  id: MachineId
  world: WorldId
  image: { src: string; width: number; height: number; credit: string; source: SourceId }
  model?: { src: string; credit: string }
  sources: SourceId[]
  facts: Fact[]
  /** Dates only; the event texts live in the locale files, in the same order. */
  timeline: TimelineDate[]
}

const day = (date: string): TimelineDate => ({ date, precision: 'day' })
const month = (date: string): TimelineDate => ({ date, precision: 'month' })

export const MACHINES: Machine[] = [
  {
    id: 'apollo-lm',
    world: 'moon',
    image: { src: '/media/apollo-lm.webp', width: 1273, height: 1280, credit: 'NASA', source: 'nssdca-a11' },
    sources: ['nssdca-a11', 'nssdca-a12', 'nssdca-a14', 'nssdca-a15', 'nssdca-a16', 'nssdca-a17'],
    facts: [
      { key: 'landed', of: 'Apollo 11', date: day('1969-07-20') },
      { key: 'landed', of: 'Apollo 17', date: day('1972-12-11') },
      { key: 'mass', of: 'Apollo 11', num: 2034, unit: 'kg' },
    ],
    timeline: [
      day('1969-07-20'),
      day('1969-07-21'),
      day('1969-11-19'),
      day('1971-02-05'),
      day('1971-07-30'),
      day('1972-04-21'),
      day('1972-12-11'),
    ],
  },
  {
    id: 'lrv',
    world: 'moon',
    image: { src: '/media/lrv.webp', width: 512, height: 480, credit: 'NASA', source: 'nssdca-a15' },
    sources: ['nssdca-a15', 'nssdca-a16', 'nssdca-a17', 'challenge'],
    facts: [
      { key: 'distance', of: 'Apollo 15', num: 27.9, unit: 'km' },
      { key: 'distance', of: 'Apollo 16', num: 27, unit: 'km' },
      { key: 'distance', of: 'Apollo 17', num: 30, unit: 'km' },
    ],
    timeline: [day('1971-07-30'), day('1971-07-31'), day('1971-08-01'), day('1972-04-21'), day('1972-12-11')],
  },
  {
    id: 'alsep',
    world: 'moon',
    image: { src: '/media/apollo12.webp', width: 950, height: 955, credit: 'NASA', source: 'nssdca-a12' },
    sources: ['nssdca-a12', 'nssdca-a11', 'nssdca-a15', 'nssdca-a17'],
    facts: [
      { key: 'power', num: 70, unit: 'W' },
      { key: 'missionEnd', date: day('1977-09-30') },
    ],
    timeline: [
      day('1969-07-21'),
      day('1969-08-27'),
      day('1969-11-19'),
      day('1969-11-20'),
      day('1971-07-31'),
      day('1972-12-12'),
      day('1977-09-30'),
    ],
  },
  {
    id: 'surveyor',
    world: 'moon',
    image: { src: '/media/surveyor.webp', width: 1280, height: 1280, credit: 'NASA', source: 'sci-surveyor3' },
    sources: ['sci-surveyor3', 'nssdca-s1', 'nssdca-s3', 'nssdca-s5', 'nssdca-s6', 'nssdca-s7'],
    facts: [
      { key: 'landed', of: 'Surveyor 1', date: day('1966-06-02') },
      { key: 'lastContact', of: 'Surveyor 3', date: day('1967-05-04') },
      { key: 'mass', of: 'Surveyor 3', num: 997.9, unit: 'kg' },
      { key: 'pictures', of: 'Surveyor 3', num: 6326 },
    ],
    timeline: [
      day('1966-06-02'),
      day('1967-04-20'),
      day('1967-09-11'),
      day('1967-11-17'),
      day('1968-01-10'),
      month('1969-11-01'),
    ],
  },
  {
    id: 'pathfinder',
    world: 'mars',
    image: { src: '/media/pathfinder.webp', width: 1280, height: 612, credit: 'NASA/JPL-Caltech', source: 'sci-pathfinder' },
    sources: ['sci-pathfinder', 'nssdca-pathfinder'],
    facts: [
      { key: 'launched', date: day('1996-12-04') },
      { key: 'landed', date: day('1997-07-04') },
      { key: 'lastContact', date: day('1997-09-27') },
      { key: 'mass', of: 'Sojourner', num: 10.6, unit: 'kg' },
      { key: 'pictures', num: 17050, plus: true },
    ],
    timeline: [day('1996-12-04'), day('1997-07-04'), day('1997-07-05'), day('1997-09-27')],
  },
  {
    id: 'mer',
    world: 'mars',
    image: { src: '/media/mer.webp', width: 1280, height: 1001, credit: 'NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.', source: 'sci-mer' },
    model: { src: '/models/mer.glb', credit: 'NASA Visualization Technology Applications and Development (VTAD)' },
    sources: ['sci-mer', 'nssdca-spirit', 'nssdca-opportunity'],
    facts: [
      { key: 'landed', of: 'Spirit', date: day('2004-01-04') },
      { key: 'landed', of: 'Opportunity', date: day('2004-01-25') },
      { key: 'lastContact', of: 'Spirit', date: day('2010-03-22') },
      { key: 'lastContact', of: 'Opportunity', date: day('2018-06-10') },
      { key: 'distance', of: 'Spirit', num: 7.73, unit: 'km' },
      { key: 'distance', of: 'Opportunity', num: 45.16, unit: 'km' },
      { key: 'mass', num: 185, unit: 'kg' },
    ],
    timeline: [
      day('2004-01-04'),
      day('2004-01-25'),
      day('2009-04-23'),
      day('2010-03-22'),
      day('2018-06-10'),
      day('2026-10-11'),
    ],
  },
  {
    id: 'viking',
    world: 'mars',
    image: { src: '/media/viking.webp', width: 1280, height: 455, credit: 'NASA', source: 'sci-viking1' },
    sources: ['sci-viking1', 'nssdca-viking1', 'nssdca-viking2'],
    facts: [
      { key: 'launched', of: 'Viking 1', date: day('1975-08-20') },
      { key: 'landed', of: 'Viking 1', date: day('1976-07-20') },
      { key: 'landed', of: 'Viking 2', date: day('1976-09-03') },
      { key: 'lastContact', of: 'Viking 2', date: day('1980-04-11') },
      { key: 'lastContact', of: 'Viking 1', date: day('1982-11-11') },
      { key: 'power', num: 70, unit: 'W' },
    ],
    timeline: [
      day('1975-08-20'),
      day('1976-07-20'),
      day('1976-07-28'),
      day('1976-09-03'),
      day('1980-04-11'),
      day('1982-11-11'),
    ],
  },
  {
    id: 'phoenix-insight',
    world: 'mars',
    image: { src: '/media/insight.webp', width: 1280, height: 853, credit: 'NASA/JPL-Caltech/Lockheed Martin Space', source: 'sci-insight' },
    model: { src: '/models/insight.glb', credit: 'NASA Visualization Technology Applications and Development (VTAD)' },
    sources: ['sci-insight', 'nssdca-insight', 'nssdca-phoenix', 'challenge'],
    facts: [
      { key: 'landed', of: 'Phoenix', date: day('2008-05-25') },
      { key: 'lastContact', of: 'Phoenix', date: day('2008-11-02') },
      { key: 'landed', of: 'InSight', date: day('2018-11-26') },
      { key: 'lastContact', of: 'InSight', date: day('2022-12-15') },
      { key: 'mass', of: 'InSight', num: 360, unit: 'kg' },
    ],
    timeline: [
      day('2008-05-25'),
      day('2008-11-02'),
      day('2018-05-05'),
      day('2018-11-26'),
      day('2018-12-01'),
      day('2022-12-15'),
    ],
  },
  {
    id: 'ingenuity',
    world: 'mars',
    image: { src: '/media/ingenuity.webp', width: 1280, height: 953, credit: 'NASA/JPL-Caltech', source: 'sci-ingenuity' },
    sources: ['sci-ingenuity', 'nssdca-m2020'],
    facts: [
      { key: 'launched', date: day('2020-07-30') },
      { key: 'landed', date: day('2021-02-18') },
      { key: 'missionEnd', date: day('2024-01-25') },
      { key: 'flights', num: 72 },
      { key: 'distance', num: 17, unit: 'km' },
      { key: 'mass', num: 1.8, unit: 'kg' },
    ],
    timeline: [
      day('2020-07-30'),
      day('2021-02-18'),
      day('2021-04-19'),
      day('2023-04-13'),
      day('2024-01-18'),
      day('2024-01-25'),
    ],
  },
  {
    id: 'dawn',
    world: 'deep',
    image: { src: '/media/dawn.webp', width: 1280, height: 722, credit: 'NASA', source: 'sci-dawn' },
    sources: ['sci-dawn', 'nssdca-dawn', 'challenge'],
    facts: [
      { key: 'launched', date: day('2007-09-27') },
      { key: 'arrived', of: 'Vesta', date: day('2011-07-16') },
      { key: 'arrived', of: 'Ceres', date: day('2015-03-06') },
      { key: 'lastContact', date: day('2018-10-31') },
      { key: 'mass', num: 725, unit: 'kg' },
    ],
    timeline: [
      day('2007-09-27'),
      day('2009-02-18'),
      day('2011-07-16'),
      day('2012-09-05'),
      day('2015-03-06'),
      day('2018-10-31'),
    ],
  },
  {
    id: 'near',
    world: 'deep',
    image: { src: '/media/near.webp', width: 1200, height: 900, credit: 'NASA', source: 'sci-near' },
    sources: ['sci-near', 'nssdca-near'],
    facts: [
      { key: 'launched', date: day('1996-02-17') },
      { key: 'arrived', of: 'Eros', date: day('2000-02-14') },
      { key: 'landed', date: day('2001-02-12') },
      { key: 'lastContact', date: day('2001-02-28') },
      { key: 'mass', num: 805, unit: 'kg' },
      { key: 'pictures', num: 160000 },
    ],
    timeline: [
      day('1996-02-17'),
      day('1997-06-27'),
      day('1998-12-23'),
      day('2000-02-14'),
      day('2001-02-12'),
      day('2001-02-28'),
    ],
  },
  {
    id: 'pioneer',
    world: 'deep',
    image: { src: '/media/pioneer.webp', width: 1280, height: 809, credit: 'NASA', source: 'sci-pioneer10' },
    sources: ['sci-pioneer10', 'nssdca-pioneer10', 'nssdca-pioneer11'],
    facts: [
      { key: 'launched', of: 'Pioneer 10', date: month('1972-03-01') },
      { key: 'launched', of: 'Pioneer 11', date: month('1973-04-01') },
      { key: 'lastContact', of: 'Pioneer 11', date: day('1995-09-30') },
      { key: 'lastContact', of: 'Pioneer 10', date: day('2003-01-23') },
      { key: 'mass', of: 'Pioneer 10', num: 258, unit: 'kg' },
    ],
    timeline: [
      month('1972-03-01'),
      day('1972-07-15'),
      day('1973-12-04'),
      day('1979-09-01'),
      day('1983-06-13'),
      day('1995-09-30'),
      day('2003-01-23'),
    ],
  },
  {
    id: 'kepler',
    world: 'deep',
    image: { src: '/media/kepler.webp', width: 1280, height: 1024, credit: 'NASA', source: 'sci-kepler' },
    sources: ['sci-kepler', 'nssdca-kepler', 'challenge'],
    facts: [
      { key: 'launched', date: month('2009-03-01') },
      { key: 'missionEnd', date: day('2018-10-30') },
      { key: 'planets', num: 2600, plus: true },
      { key: 'mass', num: 1052, unit: 'kg' },
    ],
    timeline: [month('2009-03-01'), month('2010-01-01'), month('2011-02-01'), month('2013-05-01'), day('2018-10-30')],
  },
]

/**
 * Where each timeline event happened, in the same order as the machine's timeline.
 * `null` is an event away from every site on the map (a launch from Earth, a flyby
 * on the way, a decision taken on Earth): the view then shows the whole destination.
 */
const TIMELINE_PLACES: Record<MachineId, (string | null)[]> = {
  'apollo-lm': ['apollo-11', 'apollo-11', 'apollo-12', 'apollo-14', 'apollo-15', 'apollo-16', 'apollo-17'],
  lrv: ['apollo-15', 'apollo-15', 'apollo-15', 'apollo-16', 'apollo-17'],
  alsep: ['apollo-11', 'apollo-11', 'apollo-12', 'apollo-12', 'apollo-15', 'apollo-17', null],
  surveyor: ['surveyor-1', 'apollo-12', 'surveyor-5', 'surveyor-6', 'surveyor-7', 'apollo-12'],
  pathfinder: [null, 'pathfinder', 'pathfinder', 'pathfinder'],
  mer: ['spirit', 'opportunity', 'spirit', 'spirit', 'opportunity', null],
  viking: [null, 'viking-1', 'viking-1', 'viking-2', 'viking-2', 'viking-1'],
  'phoenix-insight': ['phoenix', 'phoenix', null, 'insight', 'insight', 'insight'],
  ingenuity: [null, 'jezero', 'jezero', 'jezero', 'jezero', 'jezero'],
  dawn: [null, null, null, null, 'ceres', 'ceres'],
  near: [null, null, 'eros', 'eros', 'eros', 'eros'],
  pioneer: [null, 'pioneer-10', 'pioneer-10', 'pioneer-11', 'pioneer-10', 'pioneer-11', 'pioneer-10'],
  kepler: [null, 'kepler', 'kepler', 'kepler', 'kepler'],
}

/** Id of the place where event `step` of a machine's timeline happened, if it is on the map. */
export const timelinePlace = (id: MachineId, step: number): string | undefined => TIMELINE_PLACES[id][step] ?? undefined

export const WORLDS: WorldId[] = ['moon', 'mars', 'deep']

export const WORLD_SLUG: Record<WorldId, string> = { moon: 'moon', mars: 'mars', deep: 'deep-space' }

export function worldFromSlug(slug: string | undefined): WorldId | undefined {
  return WORLDS.find((w) => WORLD_SLUG[w] === slug)
}

export const machineById = (id: string | undefined) => MACHINES.find((m) => m.id === id)
export const placeById = (id: string | null | undefined) => PLACES.find((p) => p.id === id)
export const machinesOf = (world: WorldId) => MACHINES.filter((m) => m.world === world)
export const placesOf = (world: WorldId) => PLACES.filter((p) => p.world === world)
export const placesOfMachine = (id: MachineId) => PLACES.filter((p) => p.machines.includes(id))

/** Parameters NASA uses on its own mission pages when it embeds Eyes. */
const EYES_EMBED =
  'interactPrompt=true&featured=false&detailPanel=false&search=false&shareButton=false&menu=false&collapseSettingsOptions=true&hideExternalLinks=true'

export const eyesEmbedUrl = (entity: string) => `https://eyes.nasa.gov/apps/solar-system/#/${entity}?${EYES_EMBED}`
export const eyesPageUrl = (entity: string) => `https://eyes.nasa.gov/apps/solar-system/#/${entity}`

export const ASTEROID_STORY_URL = 'https://eyes.nasa.gov/apps/asteroids/#/story/asteroids_missions?slide=slide_3'

export const MODEL_FILES = {
  moon: '/models/moon.glb',
  mars: '/models/mars.glb',
  ceres: '/models/ceres.glb',
  eros: '/models/eros.glb',
  vesta: '/models/vesta.glb',
} as const

export interface StoryView {
  /** The machine's site named in the address, or its first one. */
  place: Place
  /** False when the address has to be completed with a site. */
  isPlaceGiven: boolean
  /** Selected timeline event, if any. */
  step: number | null
  /** Place the 3D view turns to: where the selected event happened, else the site. Absent for an event off the map. */
  focus: string | undefined
}

/**
 * Reads a story's address (`?at=site&step=n`). Site and timeline stay in step:
 * a chosen event decides what the globe shows; a chosen site alone selects the
 * first event that happened there; a story opened with neither starts at its
 * first event.
 */
export function storyView(machine: Machine, at: string | null, stepParam: string | null): StoryView {
  const asked = placeById(at)
  const isPlaceGiven = Boolean(asked?.machines.includes(machine.id))
  const parsed = stepParam === null || stepParam.trim() === '' ? NaN : Number(stepParam)
  const isStepGiven = Number.isInteger(parsed) && parsed >= 0 && parsed < machine.timeline.length
  if (isStepGiven || !isPlaceGiven) {
    const step = isStepGiven ? parsed : 0
    const where = placeById(timelinePlace(machine.id, step))
    // Without a site in the address, the story stands at the event's own site when it has one.
    const place = isPlaceGiven ? asked! : where?.machines.includes(machine.id) ? where : placesOfMachine(machine.id)[0]
    return { place, isPlaceGiven, step, focus: where?.id }
  }
  const place = asked!
  const first = machine.timeline.findIndex((_, i) => timelinePlace(machine.id, i) === place.id)
  return { place, isPlaceGiven, step: first >= 0 ? first : null, focus: place.id }
}

/** Address of a story with event `step` selected; the site follows when the event happened at one of the machine's sites. */
export function storyStepPath(machine: Machine, current: Place, step: number): string {
  const where = placeById(timelinePlace(machine.id, step))
  const site = where?.machines.includes(machine.id) ? where : current
  return `/explore/${WORLD_SLUG[machine.world]}/${machine.id}?at=${site.id}&step=${step}`
}
