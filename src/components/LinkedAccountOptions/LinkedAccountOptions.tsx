import classNames from 'classnames'
import { EllipsisVertical } from 'lucide-react'

import { HoverMenu, type HoverMenuProps } from '@components/HoverMenu/HoverMenu'

interface LinkedAccountOptionsProps extends HoverMenuProps {
  showLedgerBalance?: boolean
}

export const LinkedAccountOptions = ({
  children,
  config,
  showLedgerBalance,
}: LinkedAccountOptionsProps) => {
  const linkedAccountOptionsClassName = classNames(
    'Layer__linked-accounts__options',
    showLedgerBalance == false && '--hide-ledger-balance',
  )
  return (
    <div className={linkedAccountOptionsClassName}>
      <div className='Layer__linked-accounts__options-overlay'>
        {config.length
          ? (
            <div className='Layer__linked-accounts__options-overlay-button'>
              <HoverMenu config={config}>
                <EllipsisVertical size={16} />
              </HoverMenu>
            </div>
          )
          : null}
      </div>
      {children}
    </div>
  )
}
