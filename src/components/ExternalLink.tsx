import type { ReactNode } from 'react'
import { useI18n } from '../i18n/context'
import { Icon } from './Icon'

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { t } = useI18n()
  return (
    <a className={className ?? 'link'} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="external" />
      <span className="sr-only"> ({t.common.newTab})</span>
    </a>
  )
}
