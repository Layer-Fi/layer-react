import React from 'react'
import MoreVertical from '../../icons/MoreVertical'
import { HoverMenu, HoverMenuProps } from '../HoverMenu'
import classNames from 'classnames'

interface LinkedAccountOptionsProps extends HoverMenuProps {
  showLedgerBalance: boolean
}

export const LinkedAccountOptions = ({
  children,
  config,
  accountId,
  connectionId,
  source,
  showLedgerBalance,
}: LinkedAccountOptionsProps) => {
  const linkedAccountOptionsClassName = classNames(
    'Layer__linked-accounts__options',
    !showLedgerBalance && '--hide-ledger-balance',
  )
  return (
    <div className={linkedAccountOptionsClassName}>
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
