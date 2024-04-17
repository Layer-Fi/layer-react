import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import WarningCircle from '../../icons/WarningCircle'
import { Badge, BadgeVariants } from '../Badge'
import { HoverMenu } from '../HoverMenu'

export const LinkedAccountsInactive = () => {
  const { renewLinkAccount } = useLinkedAccounts()

  const hoverActions = [
    {
      name: 'Renew link',
      action: renewLinkAccount,
    },
  ]
  return (
    <HoverMenu config={hoverActions}>
      <Badge
        hoverable
        variants={BadgeVariants.ERROR}
        icon={<WarningCircle size={14} />}
      >
        Fix account
      </Badge>
    </HoverMenu>
  )
}
