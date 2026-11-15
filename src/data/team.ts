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
  /** `focus` is the CSS object-position that keeps the face in the wide frame. */
  photo?: { src: string; srcSet: string; width: number; height: number; focus: string }
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
      focus: '50% 18%',
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
    photo: {
      src: '/team/imad-el-ades.webp',
      focus: '50% 62%',
      srcSet: '/team/imad-el-ades.webp 1x, /team/imad-el-ades@2x.webp 2x',
      width: 480,
      height: 600,
    },
    portfolio: 'https://imadelades.vercel.app/',
    github: 'https://github.com/imad-elades',
    linkedin: 'https://www.linkedin.com/in/imad-elades/',
    skills: ['React', 'Spring Boot', 'FastAPI', 'Docker', 'Azure DevOps', 'PySpark'],
  },
  {
    id: 'haytame',
    name: 'Haytame El Atraoui',
    initials: 'HE',
    track: 'tdi',
    hue: '#3ddbb4',
    photo: {
      src: '/team/haytame-el-atraoui.webp',
      focus: '50% 4%',
      srcSet: '/team/haytame-el-atraoui.webp 1x, /team/haytame-el-atraoui@2x.webp 1.17x',
      width: 480,
      height: 600,
    },
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
    photo: {
      src: '/team/salah-atmane.webp',
      focus: '50% 30%',
      srcSet: '/team/salah-atmane.webp 1x',
      width: 480,
      height: 600,
    },
    portfolio: 'https://salahat-creat.github.io/portfolio/',
    github: 'https://github.com/SalahAT-CREAT',
    linkedin: 'https://www.linkedin.com/in/salah-atmane/',
    skills: ['QGIS · HEC-RAS', 'OR-Tools', 'Next.js', 'FastAPI', 'IoT', 'Docker'],
  },
  {
    id: 'othmane',
    name: 'Othmane Karim',
    initials: 'OK',
    track: 'cyberAi',
    hue: '#c4b0ff',
    photo: {
      src: '/team/othmane-karim.webp',
      focus: '50% 2%',
      srcSet: '/team/othmane-karim.webp 1x, /team/othmane-karim@2x.webp 1.33x',
      width: 480,
      height: 600,
    },
    portfolio: 'https://galdro-0.github.io/',
    github: 'https://github.com/Galdro-0',
    linkedin: 'https://www.linkedin.com/in/othmane-karim/',
    skills: ['Wazuh · SIEM', 'Threat hunting', 'DFIR', 'Burp Suite', 'PyTorch', 'OpenCV'],
  },
]

/** Where each member's star sits in the constellation (viewBox 0 0 600 220). */
export const STARS: Record<MemberId, { x: number; y: number }> = {
  youssef: { x: 70, y: 150 },
  imad: { x: 190, y: 70 },
  haytame: { x: 300, y: 130 },
  salah: { x: 420, y: 55 },
  othmane: { x: 530, y: 140 },
}
