import { ExternalLink } from '../components/ExternalLink'
import { ASTEROID_STORY_URL, MACHINES, SOURCES, WORLDS } from '../data/machines'
import { useI18n } from '../i18n/context'

export function Sources() {
  const { t } = useI18n()
  return (
    <section className="page sources-page">
      <h1>{t.sources.title}</h1>
      <p className="lead">{t.sources.lead}</p>

      <h2>{t.sources.ruleTitle}</h2>
      <ul className="prose-list">
        {t.sources.rule.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p>
        <ExternalLink href={SOURCES.challenge.url}>{SOURCES.challenge.label}</ExternalLink>
      </p>

      <h2>{t.sources.storiesTitle}</h2>
      {WORLDS.map((world) => (
        <section key={world} className="source-world">
          <h3>{t.worlds[world].name}</h3>
          <ul className="source-list">
            {MACHINES.filter((m) => m.world === world).map((m) => (
              <li key={m.id} className="source-item">
                <img src={m.image.src} width={96} height={96} alt="" loading="lazy" />
                <div>
                  <h4>{t.machines[m.id].name}</h4>
                  <ul>
                    {m.sources.map((id) => (
                      <li key={id}>
                        <ExternalLink href={SOURCES[id].url}>{SOURCES[id].label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                  <p className="small muted">
                    {t.sources.photo}: {m.image.credit} — {SOURCES[m.image.source].label}
                    {m.model && (
                      <>
                        <br />
                        {t.sources.model}: {m.model.credit}
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2>{t.sources.modelsTitle}</h2>
      <p>{t.sources.modelsBody}</p>
      <p>
        <ExternalLink href={SOURCES.models.url}>{SOURCES.models.label}</ExternalLink>
      </p>

      <h2>{t.sources.liveTitle}</h2>
      <ul className="prose-list">
        <li>
          <ExternalLink href={SOURCES.eyes.url}>{SOURCES.eyes.label}</ExternalLink>
        </li>
        <li>
          <ExternalLink href={ASTEROID_STORY_URL}>{SOURCES['eyes-asteroids'].label}</ExternalLink>
        </li>
      </ul>

      <h2>{t.sources.accuracyTitle}</h2>
      <ul className="prose-list">
        {t.sources.accuracy.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>{t.sources.aiTitle}</h2>
      <ul className="prose-list">
        {t.sources.ai.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>{t.sources.teamTitle}</h2>
      <p>{t.sources.team}</p>
      <p className="small muted">{t.sources.nasaNote}</p>
      <p className="small muted">{t.common.brandBy}</p>
    </section>
  )
}
