/** Team AYYUR. Facts come from each member's own public portfolio. */

export type MemberId = 'youssef' | 'imad' | 'othmane' | 'haytame' | 'salah'
export type Track = 'cyberAi' | 'tdi'

export interface Member {
  id: MemberId
  name: string
  initials: string
  track: Track
  /** Accent of the member's star and badge. */
  hue: string
  photo?: { src: string; srcSet: string; width: number; height: number }
  portfolio: string
  github: string
  linkedin: string
  /** Tools and fields, written as on the portfolio (technical names are not translated). */
  skills: string[]
}

export const TEAM: Member[] = [
  {
    id: 'youssef',
    name: 'Youssef Ait Karroum',
    initials: 'YA',
    track: 'cyberAi',
    hue: '#5ee7ff',
    photo: {
      src: '/team/youssef-ait-karroum.webp',
      srcSet: '/team/youssef-ait-karroum.webp 1x, /team/youssef-ait-karroum@2x.webp 2x',
      width: 480,
      height: 600,
    },
    portfolio: 'https://youssefkarroum.github.io/portfolio/',
    github: 'https://github.com/YOUSSEFKARROUM',
    linkedin: 'https://ma.linkedin.com/in/youssef-ait-karroum-579304268',
    skills: ['Active Directory pentest', 'RAG & LLMs', 'YOLOv8 · OpenCV', 'PyTorch', 'React Native', 'FastAPI'],
  },
  {
    id: 'imad',
    name: 'Imad El Ades',
    initials: 'IE',
    track: 'tdi',
    hue: '#ffb07a',
    portfolio: 'https://imadelades.vercel.app/',
    github: 'https://github.com/imad-elades',
    linkedin: 'https://www.linkedin.com/in/imad-elades/',
    skills: ['React', 'Spring Boot', 'FastAPI', 'Docker', 'Azure DevOps', 'PySpark'],
  },
  {
    id: 'othmane',
    name: 'Othmane Karim',
    initials: 'OK',
    track: 'cyberAi',
    hue: '#c4b0ff',
    portfolio: 'https://galdro-0.github.io/',
    github: 'https://github.com/Galdro-0',
    linkedin: 'https://www.linkedin.com/in/othmane-karim/',
    skills: ['Wazuh · SIEM', 'Threat hunting', 'DFIR', 'Burp Suite', 'PyTorch', 'OpenCV'],
  },
  {
    id: 'haytame',
    name: 'Haytame El Atraoui',
    initials: 'HE',
    track: 'tdi',
    hue: '#3ddbb4',
    portfolio: 'https://haytame37.github.io/',
    github: 'https://github.com/Haytame37',
    linkedin: 'https://www.linkedin.com/in/haytame-el-atraoui',
    skills: ['Python', 'Java · Spring Boot', 'FastAPI', 'SAP ERP', 'Azure', 'Spark'],
  },
  {
    id: 'salah',
    name: 'Salah Atmane',
    initials: 'SA',
    track: 'tdi',
    hue: '#ffd77a',
    portfolio: 'https://salahat-creat.github.io/portfolio/',
    github: 'https://github.com/SalahAT-CREAT',
    linkedin: 'https://www.linkedin.com/in/salah-atmane/',
    skills: ['QGIS · HEC-RAS', 'OR-Tools', 'Next.js', 'FastAPI', 'IoT', 'Docker'],
  },
]

/** Where each member's star sits in the constellation (viewBox 0 0 600 220). */
export const STARS: Record<MemberId, { x: number; y: number }> = {
  youssef: { x: 70, y: 150 },
  imad: { x: 190, y: 70 },
  othmane: { x: 300, y: 130 },
  haytame: { x: 420, y: 55 },
  salah: { x: 530, y: 140 },
}
