import React from 'react'
import Loader from '../../icons/Loader'
import { Badge, BadgeVariant } from '../Badge'
import { BadgeSize } from '../Badge/Badge'

export const SyncingBadge = () => {
  return (
    <Badge
      icon={<Loader className='Layer__anim--rotating' size={12} />}
      size={BadgeSize.SMALL}
      variant={BadgeVariant.INFO}
    >
      Syncing...
    </Badge>
  )
}
