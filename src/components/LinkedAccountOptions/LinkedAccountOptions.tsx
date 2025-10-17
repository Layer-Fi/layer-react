import MoreVertical from '../../icons/MoreVertical'
import { HoverMenu, HoverMenuProps } from '../HoverMenu/HoverMenu'
import classNames from 'classnames'

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
                <MoreVertical size={16} />
              </HoverMenu>
            </div>
          )
          : null}
      </div>
      {children}
    </div>
  )
}
