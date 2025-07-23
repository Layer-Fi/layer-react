import { useContext } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import PlusIcon from '../../icons/PlusIcon'
import { Text, TextSize } from '../Typography'
import { LinkedAccountItemThumb } from './LinkedAccountItemThumb'
import classNames from 'classnames'
import { LinkedAccountsConfirmationModal } from '../LinkedAccounts/ConfirmationModal/LinkedAccountsConfirmationModal'
import { PlaidLinkErrorModal } from './PlaidLinkErrorModal/PlaidLinkErrorModal'

interface LinkedAccountsDataProps {
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  showAddAccount?: boolean
}

export const LinkedAccountsContent = ({
  asWidget,
  showLedgerBalance,
  showUnlinkItem,
  showBreakConnection,
  showAddAccount,
}: LinkedAccountsDataProps) => {
  const { data, addConnection } = useContext(LinkedAccountsContext)

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
    showLedgerBalance && '--show-ledger-balance',
    showUnlinkItem && '--show-unlink-item',
    showBreakConnection && '--show-break-connection',
  )

  return (
    <>
      <div className='Layer__linked-accounts__list'>
        {data?.map((account, index) => (
          <LinkedAccountItemThumb
            key={index}
            account={account}
            showLedgerBalance={showLedgerBalance}
            showUnlinkItem={showUnlinkItem}
            showBreakConnection={showBreakConnection}
            asWidget={asWidget}
          />
        ))}
        {showAddAccount && (
          <div
            role='button'
            tabIndex={0}
            aria-label='new-account'
            onClick={() => addConnection('PLAID')}
            className={linkedAccountsNewAccountClassName}
          >
            <div className='Layer__linked-accounts__new-account-label'>
              <PlusIcon size={15} />
              <Text as='span' size={'sm' as TextSize}>
                Add Account
              </Text>
            </div>
          </div>
        )}
      </div>
      <LinkedAccountsConfirmationModal />
      <PlaidLinkErrorModal />
    </>
  )
}
