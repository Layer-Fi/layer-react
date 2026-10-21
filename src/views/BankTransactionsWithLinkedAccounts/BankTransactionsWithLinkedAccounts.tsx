import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransactionsStringOverrides } from '@internal-types/features/bankTransactions/bankTransactionsStringOverrides'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { type MobileComponentType } from '@utils/features/bankTransactions/constants'
import { type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { BankAccountsFilterStoreProvider, useSelectedBankAccountIds } from '@providers/features/bankTransactions/BankAccountsFilterStore/BankAccountsFilterStoreProvider'
import { type BankTransactionsMode } from '@providers/features/bankTransactions/LegacyMode/LegacyModeProvider'
import { AccountConfirmationStoreProvider } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { View } from '@blocks/Layout/View/View'
import { BankTransactions } from '@features/bankTransactions/BankTransactions/BankTransactions'
import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

interface BankTransactionsWithLinkedAccountsStringOverrides {
  title?: string
  linkedAccounts?: LinkedAccountsProps['stringOverrides']
  bankTransactions?: BankTransactionsStringOverrides
}

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string // deprecated
  showTitle?: boolean
  elevatedLinkedAccounts?: boolean

  showBreakConnection?: boolean
  showConnectionRepairAlert?: boolean
  showCustomerVendor?: boolean
  /**
   * @deprecated This prop is no longer honored; transaction descriptions are always enabled.
   */
  showDescriptions?: boolean
  showLedgerBalance?: boolean
  /**
   * @deprecated This prop is no longer honored; receipt uploads are always enabled.
   */
  showReceiptUploads?: boolean
  showTags?: boolean
  showTooltips?: boolean
  showUnlinkItem?: boolean
  showUploadOptions?: boolean
  /**
   * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
   */
  mode?: BankTransactionsMode
  mobileComponent?: MobileComponentType
  stringOverrides?: BankTransactionsWithLinkedAccountsStringOverrides
  slotProps?: LinkedAccountsProps['slotProps']
  renderInAppLink?: (details: LinkingMetadata) => ReactNode
  showCategorizationRules?: boolean
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}

export const BankTransactionsWithLinkedAccounts = (props: BankTransactionsWithLinkedAccountsProps) => (
  <BankAccountsFilterStoreProvider>
    <BankTransactionsWithLinkedAccountsContent {...props} />
  </BankAccountsFilterStoreProvider>
)

const BankTransactionsWithLinkedAccountsContent = ({
  title, // deprecated
  showTitle = true,
  elevatedLinkedAccounts = false,
  mode,

  showBreakConnection = false,
  showConnectionRepairAlert,
  showCustomerVendor = false,
  showLedgerBalance = true,
  showTags = false,
  showTooltips = false,
  showUnlinkItem = false,
  showUploadOptions = false,

  mobileComponent,
  stringOverrides,
  slotProps,
  renderInAppLink,
  showCategorizationRules,
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
}: BankTransactionsWithLinkedAccountsProps) => {
  const { t } = useTranslation()

  const selectedBankAccountIds = useSelectedBankAccountIds()
  const filters = useMemo(
    () => (selectedBankAccountIds.length ? { bankAccountIds: selectedBankAccountIds } : undefined),
    [selectedBankAccountIds],
  )

  return (
    <View
      title={stringOverrides?.title || title || t('views:BankTransactionsWithLinkedAccounts.label.bank_transactions', 'Bank transactions')}
      showHeader={showTitle}
    >
      <AccountConfirmationStoreProvider>
        <LinkedAccountsProvider
          plaidHostedLinkConfig={plaidHostedLinkConfig}
          customerManagedPlaidConfig={customerManagedPlaidConfig}
        >
          <LinkedAccounts
            withProvider={false}
            elevated={elevatedLinkedAccounts}
            showLedgerBalance={showLedgerBalance}
            showUnlinkItem={showUnlinkItem}
            showBreakConnection={showBreakConnection}
            stringOverrides={stringOverrides?.linkedAccounts}
            slotProps={slotProps}
          />
          <BankTransactions
            asWidget
            filters={filters}
            showConnectionRepairAlert={showConnectionRepairAlert}
            showCustomerVendor={showCustomerVendor}
            showTags={showTags}
            showTooltips={showTooltips}
            showUploadOptions={showUploadOptions}
            mobileComponent={mobileComponent}
            mode={mode}
            stringOverrides={stringOverrides?.bankTransactions}
            renderInAppLink={renderInAppLink}
            showCategorizationRules={showCategorizationRules}
          />
        </LinkedAccountsProvider>
      </AccountConfirmationStoreProvider>
    </View>
  )
}
