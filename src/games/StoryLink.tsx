import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { WORLD_SLUG, type Machine } from '../data/machines'
import { useI18n } from '../i18n/context'

export function StoryLink({ machine }: { machine: Machine }) {
  const { t } = useI18n()
  return (
    <Link to={`/explore/${WORLD_SLUG[machine.world]}/${machine.id}`} className="btn">
      {t.play.readStory}
      <Icon name="forward" flip />
    </Link>
  )
}
