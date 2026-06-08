import { useContext } from 'react'
import classNames from 'classnames'
import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { LinkedAccountsConfirmationModal } from '@components/LinkedAccounts/ConfirmationModal/LinkedAccountsConfirmationModal'
import { LinkAccountDemoTooltip } from '@components/LinkedAccounts/LinkAccountDemoTooltip'
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
  const { business } = useLayerContext()
  const isDemoBusiness = business?.isDemo ?? false

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
    showLedgerBalance && '--show-ledger-balance',
    showUnlinkItem && '--show-unlink-item',
    showBreakConnection && '--show-break-connection',
    isDemoBusiness && '--disabled',
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
        <LinkAccountDemoTooltip active={isDemoBusiness} asChild>
          <div
            role='button'
            tabIndex={0}
            aria-disabled={isDemoBusiness}
            onClick={() => {
              if (isDemoBusiness) return
              void addConnection('PLAID')
            }}
            className={linkedAccountsNewAccountClassName}
          >
            <HStack align='center' gap='2xs'>
              <CirclePlus size={14} />
              <Span variant='placeholder'>
                {t('linkedAccounts:action.add_account', 'Add Account')}
              </Span>
            </HStack>
          </div>
        </LinkAccountDemoTooltip>
      </div>
      <LinkedAccountsConfirmationModal />
    </>
  )
}
