import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import WarningCircle from '../../icons/WarningCircle'
import { Badge, BadgeVariant } from '../Badge'
import { HoverMenu } from '../HoverMenu'

export const LinkedAccountsInactive = () => {
  const { repairConnection } = useLinkedAccounts()

  const hoverActions = [
    {
      name: 'Renew link',
      action: () => repairConnection,
    },
  ]
  return (
    <HoverMenu config={hoverActions}>
      <Badge
        hoverable
        variant={BadgeVariant.ERROR}
        icon={<WarningCircle size={14} />}
      >
        Fix account
      </Badge>
    </HoverMenu>
  )
}
