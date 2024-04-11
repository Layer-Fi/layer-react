import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import WarningCircle from '../../icons/WarningCircle'
import { HoverMenu } from '../HoverMenu'
import { Text, TextSize } from '../Typography'

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
      <div className='Layer__linked-accounts__inactive'>
        <div className='Layer__linked-accounts__inactive-icon'>
          <WarningCircle size={14} />
        </div>
        <Text size={'sm' as TextSize}>Fix account</Text>
      </div>
    </HoverMenu>
  )
}
