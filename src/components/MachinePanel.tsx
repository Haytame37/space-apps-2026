import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ASTEROID_STORY_URL,
  eyesEmbedUrl,
  eyesPageUrl,
  placesOfMachine,
  SOURCES,
  WORLD_SLUG,
  type Fact,
  type Machine,
  type Place,
} from '../data/machines'
import { useI18n } from '../i18n/context'
import { usePrefs } from '../state/prefs'
import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'
import { NasaEmbed } from './NasaEmbed'
import { Tabs, type TabItem } from './Tabs'
import { Timeline } from './Timeline'

const ModelViewer = lazy(() => import('./ModelViewer'))

function useCoords() {
  const { t, num } = useI18n()
  return (place: Place) => {
    if (place.lat === undefined || place.lon === undefined) return null
    const lat = `${num(Math.abs(place.lat))}° ${place.lat >= 0 ? t.panel.north : t.panel.south}`
    const lon = `${num(Math.abs(place.lon))}° ${place.lon >= 0 ? t.panel.east : t.panel.west}`
    return [lat, lon]
  }
}

function FactValue({ fact }: { fact: Fact }) {
  const { date, num } = useI18n()
  if (fact.date) return <>{date(fact.date)}</>
  if (fact.num === undefined) return null
  return (
    <>
      {num(fact.num)}
      {fact.plus ? '+' : ''}
      {fact.unit ? ` ${fact.unit}` : ''}
    </>
  )
}

interface Props {
  machine: Machine
  place?: Place
}

export function MachinePanel({ machine, place }: Props) {
  const { t, fmt } = useI18n()
  const { profile, markFound } = usePrefs()
  const [tab, setTab] = useState('story')
  const heading = useRef<HTMLHeadingElement>(null)
  const coords = useCoords()
  const text = t.machines[machine.id]
  const places = placesOfMachine(machine.id)
  const slug = WORLD_SLUG[machine.world]
  const kid = profile === 'kid'
  const neighbours = place ? place.machines.filter((id) => id !== machine.id) : []
  const eyesPlace = place?.eyes ? place : places.find((p) => p.eyes)

  useEffect(() => {
    markFound(machine.id)
    heading.current?.focus({ preventScroll: true })
  }, [machine.id, markFound])

  const story = (
    <div className="story">
      <figure className="photo">
        <img src={machine.image.src} width={machine.image.width} height={machine.image.height} alt={text.alt} loading="lazy" />
        <figcaption>{fmt(t.panel.photo, { credit: machine.image.credit })}</figcaption>
      </figure>
      <p className={kid ? 'story-text kid' : 'story-text'}>{kid ? text.kid : text.story}</p>
      <section className="callout">
        <h3>{t.panel.whyQuiet}</h3>
        <p>{text.quiet}</p>
      </section>
      {profile === 'adult' && (
        <section>
          <h3>{t.panel.facts}</h3>
          <table className="facts">
            <tbody>
              {machine.facts.map((fact) => (
                <tr key={`${fact.key}-${fact.of ?? ''}`}>
                  <th scope="row">
                    {t.panel.factKeys[fact.key]}
                    {fact.of && <span className="fact-of"> · {fact.of}</span>}
                  </th>
                  <td>
                    <FactValue fact={fact} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <p>
        <Link to={`/play/rebuild?m=${machine.id}`} className="btn">
          <Icon name="play" />
          {t.panel.playThis}
        </Link>
      </p>
      <details className="sources" open={profile === 'adult'}>
        <summary>{t.common.sources}</summary>
        <ul>
          {machine.sources.map((id) => (
            <li key={id}>
              <ExternalLink href={SOURCES[id].url}>{SOURCES[id].label}</ExternalLink>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )

  const items: TabItem[] = [
    { id: 'story', label: t.panel.story, content: story },
    { id: 'timeline', label: t.panel.timeline, content: <Timeline key={machine.id} machine={machine} /> },
  ]
  if (machine.model) {
    items.push({
      id: 'model',
      label: t.panel.model,
      content: (
        <Suspense fallback={<p role="status">{t.panel.modelLoading}</p>}>
          <ModelViewer src={machine.model.src} label={`${t.panel.model}: ${text.name}`} credit={machine.model.credit} />
        </Suspense>
      ),
    })
  }
  if (eyesPlace?.eyes) {
    items.push({
      id: 'live',
      label: t.panel.live,
      content: (
        <div className="live">
          <NasaEmbed
            key={eyesPlace.id}
            title={fmt(t.panel.liveFrame, { name: eyesPlace.name })}
            lead={fmt(t.panel.liveLead, { name: eyesPlace.name })}
            loadLabel={t.panel.liveLoad}
            embedUrl={eyesEmbedUrl(eyesPlace.eyes)}
            pageUrl={eyesPageUrl(eyesPlace.eyes)}
          />
          {(machine.id === 'near' || machine.id === 'dawn') && (
            <NasaEmbed
              title={t.panel.storyFrame}
              lead={t.panel.storyLead}
              loadLabel={t.panel.storyLoad}
              embedUrl={ASTEROID_STORY_URL}
              pageUrl={ASTEROID_STORY_URL}
            />
          )}
        </div>
      ),
    })
  }

  return (
    <article className={`machine world-${machine.world}`}>
      <Link to={`/explore/${slug}`} className="back-link">
        <Icon name="back" flip />
        {t.worlds[machine.world].name}
      </Link>
      <h1 ref={heading} tabIndex={-1}>
        {text.name}
      </h1>
      <p className="tagline">{text.tagline}</p>

      <section className="where" aria-labelledby="where-title">
        <h2 id="where-title">{t.panel.where}</h2>
        <ul className="chips">
          {places.map((p) => (
            <li key={p.id}>
              <Link
                to={`/explore/${slug}/${machine.id}?at=${p.id}`}
                className="chip"
                aria-current={place?.id === p.id ? 'location' : undefined}
                replace
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        {place && (
          <p className="where-detail">
            {place.region && <bdi>{place.region}</bdi>}
            {coords(place)?.map((part) => (
              <span key={part}>
                {' · '}
                <bdi>{part}</bdi>
              </span>
            ))}
            {coords(place) && profile !== 'kid' && (
              <span className="muted small"> — <bdi>{fmt(t.panel.coordsFrom, { source: SOURCES[place.coordSource].label.split(' — ')[0] })}</bdi></span>
            )}
          </p>
        )}
        {neighbours.length > 0 && (
          <p className="also">
            {t.panel.alsoHere}:{' '}
            {neighbours.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link className="link" to={`/explore/${slug}/${id}?at=${place!.id}`}>
                  {t.machines[id].name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </section>

      <Tabs key={machine.id} label={t.panel.tabs} items={items} active={items.some((i) => i.id === tab) ? tab : 'story'} onChange={setTab} />
    </article>
  )
}
