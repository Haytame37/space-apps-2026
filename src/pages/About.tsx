import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ExternalLink } from '../components/ExternalLink'
import { STARS, TEAM, type Member, type MemberId } from '../data/team'
import { useI18n } from '../i18n/context'
import { CRESCENT_PATH } from '../lib/ayyurMotion'

const VALUE_ICONS = [
  // a check in a shield: checked facts
  'M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3zM8.5 12l2.5 2.5 4.5-5',
  // a small rocket: young explorers
  'M12 3c3 2 4.5 5 4.5 8.5L14 15h-4l-2.5-3.5C7.5 8 9 5 12 3zM10 15l-2 4 3-1.5M14 15l2 4-3-1.5M12 9.5v.01',
  // a globe: everyone
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
]

/** Our five members as the stars of a constellation; each star leads to a member's badge. */
function Constellation({ active, onActive }: { active: MemberId | null; onActive: (id: MemberId | null) => void }) {
  const { t } = useI18n()
  const points = TEAM.map((m) => STARS[m.id])
  return (
    <figure className="ab-sky">
      <svg viewBox="0 0 600 220" aria-hidden="true" focusable="false" className="ab-lines">
        <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} />
      </svg>
      <ul className="ab-stars">
        {TEAM.map((m) => {
          const p = STARS[m.id]
          return (
            <li key={m.id} style={{ left: `${(p.x / 600) * 100}%`, top: `${(p.y / 220) * 100}%`, '--hue': m.hue } as CSSProperties}>
              <a
                href={`#member-${m.id}`}
                className={active === m.id ? 'ab-star is-on' : 'ab-star'}
                onPointerEnter={() => onActive(m.id)}
                onPointerLeave={() => onActive(null)}
                onFocus={() => onActive(m.id)}
                onBlur={() => onActive(null)}
              >
                <span className="ab-star-dot" aria-hidden="true" />
                <span className="ab-star-name">{m.name.split(' ')[0]}</span>
              </a>
            </li>
          )
        })}
      </ul>
      <figcaption>{t.about.constellation}</figcaption>
    </figure>
  )
}

function Badge({ member, isLit, onActive }: { member: Member; isLit: boolean; onActive: (id: MemberId | null) => void }) {
  const { t, fmt } = useI18n()
  const text = t.about.members[member.id]
  return (
    <article
      id={`member-${member.id}`}
      className={isLit ? 'ab-badge is-lit' : 'ab-badge'}
      style={{ '--hue': member.hue } as CSSProperties}
      aria-labelledby={`member-${member.id}-name`}
      onPointerEnter={() => onActive(member.id)}
      onPointerLeave={() => onActive(null)}
    >
      <div className="ab-portrait">
        {member.photo ? (
          <img
            src={member.photo.src}
            srcSet={member.photo.srcSet}
            width={member.photo.width}
            height={member.photo.height}
            alt={fmt(t.about.photoAlt, { name: member.name })}
            loading="lazy"
          />
        ) : (
          <span className="ab-monogram" aria-hidden="true">
            {member.initials}
          </span>
        )}
        <span className="ab-orbit" aria-hidden="true" />
      </div>
      <div className="ab-body">
        <p className="ab-track">
          {t.about.tracks[member.track]} · <bdi>{t.about.school}</bdi>
        </p>
        <h3 id={`member-${member.id}-name`}>
          <bdi>{member.name}</bdi>
        </h3>
        <p className="ab-role">{text.role}</p>
        <p className="ab-bio">{text.bio}</p>
        <h4 className="ab-label">{t.about.skills}</h4>
        <ul className="ab-skills">
          {member.skills.map((s) => (
            <li key={s}>
              <bdi>{s}</bdi>
            </li>
          ))}
        </ul>
        <h4 className="ab-label">{t.about.highlights}</h4>
        <ul className="ab-highlights">
          {text.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <ul className="ab-links" aria-label={fmt(t.about.linksOf, { name: member.name })}>
          <li>
            <ExternalLink href={member.portfolio} className="ab-link">
              {t.about.portfolio}
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={member.github} className="ab-link">
              GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={member.linkedin} className="ab-link">
              LinkedIn
            </ExternalLink>
          </li>
        </ul>
      </div>
    </article>
  )
}

export function About() {
  const { t } = useI18n()
  const [active, setActive] = useState<MemberId | null>(null)
  return (
    <section className="page about-page" aria-labelledby="h-about">
      <header className="ab-hero">
        <svg className="ab-crescent" viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
          <path fill="currentColor" d={CRESCENT_PATH} />
        </svg>
        <p className="ab-eyebrow">{t.about.eyebrow}</p>
        <h1 id="h-about">{t.about.heading}</h1>
        <p className="lead">{t.about.lead}</p>
      </header>

      <Constellation active={active} onActive={setActive} />

      <h2 className="ab-h2">{t.about.teamTitle}</h2>
      <div className="ab-crew">
        {TEAM.map((m) => (
          <Badge key={m.id} member={m} isLit={active === m.id} onActive={setActive} />
        ))}
      </div>

      <h2 className="ab-h2">{t.about.valuesTitle}</h2>
      <ul className="ab-values">
        {t.about.values.map((v, i) => (
          <li key={v.title}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d={VALUE_ICONS[i]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>{v.title}</h3>
            <p>{v.body}</p>
          </li>
        ))}
      </ul>
      <p className="ab-sources">
        <Link to="/sources" className="link">
          {t.about.sourcesLink}
        </Link>
      </p>
    </section>
  )
}
