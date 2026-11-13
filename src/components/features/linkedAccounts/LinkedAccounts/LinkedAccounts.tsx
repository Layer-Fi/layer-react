import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { getBankAccountLabelWithMask } from '@utils/features/bankAccounts/bankAccount'
import { getBankAccountRefreshConnections, getRefreshConnectionKey } from '@utils/features/bankAccounts/refresh'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import {
  AccountConfirmationStoreProvider,
  useHasAccountConfirmationStoreProvider,
} from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { OpeningBalanceModalProvider } from '@providers/features/linkedAccounts/OpeningBalanceModal/OpeningBalanceModalProvider'
import { useReconnectConnection } from '@hooks/features/linkedAccounts/useReconnectConnection'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Container } from '@blocks/Layout/Container/Container'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { LinkedAccountsContent } from '@features/linkedAccounts/LinkedAccounts/LinkedAccountsContent'
import { OpeningBalanceModal } from '@features/linkedAccounts/OpeningBalanceModal/OpeningBalanceModal'
import { PlaidHostedLinkErrorBanner } from '@features/linkedAccounts/PlaidHostedLinkErrorBanner/PlaidHostedLinkErrorBanner'

import './linkedAccounts.scss'

const COMPONENT_NAME = 'linked-accounts'

export interface LinkedAccountsProps {
  asWidget?: boolean
  elevated?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  withProvider?: boolean
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
  onPlaidConnectionSuccess?: () => Awaitable<void>
  showRepairAsRefresh?: boolean
  stringOverrides?: {
    title?: string
  }
}

export const LinkedAccounts = ({
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
  onPlaidConnectionSuccess,
  withProvider = true,
  ...props
}: LinkedAccountsProps) => {
  const hasAccountConfirmationStoreProvider = useHasAccountConfirmationStoreProvider()

  const linkedAccounts = (
    <OpeningBalanceModalProvider>
      <LinkedAccountsComponent {...props} />
    </OpeningBalanceModalProvider>
  )

  const content = withProvider
    ? (
      <LinkedAccountsProvider
        plaidHostedLinkConfig={plaidHostedLinkConfig}
        customerManagedPlaidConfig={customerManagedPlaidConfig}
        onPlaidConnectionSuccess={onPlaidConnectionSuccess}
      >
        {linkedAccounts}
      </LinkedAccountsProvider>
    )
    : linkedAccounts

  if (hasAccountConfirmationStoreProvider) {
    return content
  }

  return (
    <AccountConfirmationStoreProvider>
      {content}
    </AccountConfirmationStoreProvider>
  )
}

export const LinkedAccountsComponent = ({
  asWidget,
  elevated = false,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  showRepairAsRefresh = false,
  stringOverrides,
}: LinkedAccountsProps) => {
  const { t } = useTranslation()
  const { formatList } = useIntlFormatter()
  const { data, isLoading, isError, isValidating, refetch } = useBankAccountsContext()
  const reconnectConnection = useReconnectConnection()
  const brokenConnections = isLoading || isError || showRepairAsRefresh
    ? []
    : getBankAccountRefreshConnections(data).filter(connection => connection.needsRepair && !connection.isUserPresentRequired)

  return (
    <Container name={COMPONENT_NAME} elevated={elevated}>
      <DeprecatedHeader className='Layer__linked-accounts__header'>
        <Heading level={3} size='sm'>
          {stringOverrides?.title || t('linkedAccounts:LinkedAccounts.label.linked_accounts', 'Linked Accounts')}
        </Heading>
      </DeprecatedHeader>

      <VStack pi='lg' gap='xs' pbe={brokenConnections.length > 0 ? 'md' : undefined}>
        <PlaidHostedLinkErrorBanner />
        {brokenConnections.map(connection => (
          <Banner
            key={getRefreshConnectionKey(connection)}
            variant='error'
            size='sm'
            title={t('linkedAccounts:LinkedAccounts.label.account_disconnected', '{{accountLabel}} is disconnected', {
              accountLabel: connection.accounts.length > 1 && connection.institutionName
                ? connection.institutionName
                : formatList(connection.accounts.map(account => getBankAccountLabelWithMask(t, account))),
            })}
            description={t('linkedAccounts:LinkedAccounts.label.reconnect_description', 'Reconnect to resume importing transactions.')}
            slots={{
              Button: (
                <BannerButton onPress={() => reconnectConnection(connection)}>
                  {t('linkedAccounts:LinkedAccounts.action.reconnect', 'Reconnect')}
                </BannerButton>
              ),
            }}
          />
        ))}
      </VStack>

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
            showRepairAsRefresh={showRepairAsRefresh}
          />
        )
        : null}
      <OpeningBalanceModal />
    </Container>
  )
}
