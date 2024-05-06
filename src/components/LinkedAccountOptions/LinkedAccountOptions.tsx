import React from 'react'
import MoreVertical from '../../icons/MoreVertical'
import { HoverMenu, HoverMenuProps } from '../HoverMenu'

interface LinkedAccountOptionsProps extends HoverMenuProps {}

export const LinkedAccountOptions = ({
  children,
  config,
  accountId,
  connectionId,
  source,
}: LinkedAccountOptionsProps) => {
  return (
    <div className='Layer__linked-accounts__options'>
      <div className='Layer__linked-accounts__options-overlay'>
        <div className='Layer__linked-accounts__options-overlay-button'>
          <HoverMenu
            config={config}
            accountId={accountId}
            connectionId={connectionId}
            source={source}
          >
            <MoreVertical size={16} />
          </HoverMenu>
        </div>
      </div>
      {children}
    </div>
  )
}
