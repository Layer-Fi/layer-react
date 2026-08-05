import { useTranslation } from 'react-i18next'

import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { AccountConfirmationStoreProvider } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { OpeningBalanceModalProvider } from '@providers/features/linkedAccounts/OpeningBalanceModal/OpeningBalanceModalProvider'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Container } from '@blocks/Layout/Container/Container'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { LinkedAccountsContent } from '@features/linkedAccounts/LinkedAccounts/LinkedAccountsContent'
import { OpeningBalanceModal } from '@features/linkedAccounts/OpeningBalanceModal/OpeningBalanceModal'
import { PlaidHostedLinkErrorBanner } from '@features/linkedAccounts/PlaidHostedLinkErrorBanner/PlaidHostedLinkErrorBanner'

import './linkedAccounts.scss'

const COMPONENT_CLASS_NAME = 'Layer__linked-accounts'

export interface LinkedAccountsProps {
  asWidget?: boolean
  elevated?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  stringOverrides?: {
    title?: string
  }
}

export const LinkedAccounts = ({ plaidHostedLinkConfig, ...props }: LinkedAccountsProps) => {
  return (
    <AccountConfirmationStoreProvider>
      <LinkedAccountsProvider plaidHostedLinkConfig={plaidHostedLinkConfig}>
        <OpeningBalanceModalProvider>
          <LinkedAccountsComponent {...props} />
        </OpeningBalanceModalProvider>
      </LinkedAccountsProvider>
    </AccountConfirmationStoreProvider>
  )
}

export const LinkedAccountsComponent = ({
  asWidget,
  elevated = false,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  stringOverrides,
}: LinkedAccountsProps) => {
  const { t } = useTranslation()
  const { isLoading, isError, isValidating, refetch } = useBankAccountsContext()

  return (
    <Container className={COMPONENT_CLASS_NAME} elevated={elevated}>
      <DeprecatedHeader className='Layer__linked-accounts__header'>
        <Heading level={3} size='sm'>
          {stringOverrides?.title || t('linkedAccounts:LinkedAccounts.label.linked_accounts', 'Linked Accounts')}
        </Heading>
      </DeprecatedHeader>

      <HStack pi='lg'>
        <PlaidHostedLinkErrorBanner />
      </HStack>

      {isLoading && (
        <div className='Layer__linked-accounts__loader-container'>
          <Loader />
        </div>
      )}
      {isError && !isLoading
        ? (
          <DataState
            status={DataStateStatus.failed}
            title={t('common:error.something_went_wrong', 'Something went wrong')}
            description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
            onRefresh={() => void refetch()}
            isLoading={isValidating}
          />
        )
        : null}
      {!isError && !isLoading
        ? (
          <LinkedAccountsContent
            asWidget={asWidget}
            showLedgerBalance={showLedgerBalance}
            showUnlinkItem={showUnlinkItem}
            showBreakConnection={showBreakConnection}
          />
        )
        : null}
      <OpeningBalanceModal />
    </Container>
  )
}
