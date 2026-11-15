import { AyyurLogo } from './AyyurLogo'

interface Props {
  /** What is being prepared, read out to screen readers too. */
  label: string
  size?: number
  className?: string
}

/** Loading screen: the orbiting AYYUR crescent, with a status line underneath. */
export function AyyurLoader({ label, size = 56, className }: Props) {
  return (
    <div className={className ? `ayyur-loader ${className}` : 'ayyur-loader'}>
      <AyyurLogo variant="orbit" size={size} />
      <p role="status">{label}</p>
    </div>
  )
}
