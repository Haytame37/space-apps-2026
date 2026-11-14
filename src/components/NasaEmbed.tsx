import { useState } from 'react'
import { useI18n } from '../i18n/context'
import { ExternalLink } from './ExternalLink'

interface Props {
  title: string
  lead: string
  loadLabel: string
  embedUrl: string
  pageUrl: string
}

/** A NASA interactive, shown inside Space Memory only once the visitor asks for it. */
export function NasaEmbed({ title, lead, loadLabel, embedUrl, pageUrl }: Props) {
  const { t } = useI18n()
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="embed">
      <p>{lead}</p>
      {loaded ? (
        <iframe className="embed-frame" src={embedUrl} title={title} loading="lazy" allow="fullscreen" referrerPolicy="no-referrer" />
      ) : (
        <button type="button" className="btn primary" onClick={() => setLoaded(true)}>
          {loadLabel}
        </button>
      )}
      <p className="small">
        <ExternalLink href={pageUrl}>{t.panel.liveOpen}</ExternalLink>
      </p>
    </div>
  )
}
