import { useTranslation } from 'react-i18next'

import Loader from '@icons/Loader'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { BadgeSize } from '@components/Badge/Badge'

export const SyncingBadge = () => {
  const { t } = useTranslation()

  return (
    <Badge
      icon={<Loader className='Layer__anim--rotating' size={12} />}
      size={BadgeSize.SMALL}
      variant={BadgeVariant.INFO}
    >
      {t('common:state.syncing', 'Syncing...')}
    </Badge>
  )
}
