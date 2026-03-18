import { useContext } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import PlusIcon from '@icons/PlusIcon'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { LinkedAccountsConfirmationModal } from '@components/LinkedAccounts/ConfirmationModal/LinkedAccountsConfirmationModal'
import { LinkedAccountItemThumb } from '@components/LinkedAccounts/LinkedAccountItemThumb'

interface LinkedAccountsDataProps {
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
}

export const LinkedAccountsContent = ({
  asWidget,
  showLedgerBalance,
  showUnlinkItem,
  showBreakConnection,
}: LinkedAccountsDataProps) => {
  const { t } = useTranslation()
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
        {data?.map(account => (
          <LinkedAccountItemThumb
            key={account.id}
            account={account}
            showLedgerBalance={showLedgerBalance}
            showUnlinkItem={showUnlinkItem}
            showBreakConnection={showBreakConnection}
            asWidget={asWidget}
          />
        ))}
        <div
          role='button'
          tabIndex={0}
          onClick={() => { void addConnection('PLAID') }}
          className={linkedAccountsNewAccountClassName}
        >
          <HStack align='center' gap='2xs'>
            <PlusIcon size={14} />
            <Span variant='placeholder'>
              {t('linkedAccounts:action.add_account', 'Add Account')}
            </Span>
          </HStack>
        </div>
      </div>
      <LinkedAccountsConfirmationModal />
    </>
  )
}
