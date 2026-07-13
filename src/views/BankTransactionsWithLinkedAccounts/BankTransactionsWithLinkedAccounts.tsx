import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { BankAccountsFilterStoreProvider, useSelectedBankAccountIds } from '@providers/BankAccountsFilterStore/BankAccountsFilterStoreProvider'
import { type BankTransactionsMode } from '@providers/LegacyModeProvider/LegacyModeProvider'
import { type LinkingMetadata } from '@contexts/InAppLinkContext'
import {
  BankTransactions,
  type BankTransactionsStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { LinkedAccounts } from '@components/LinkedAccounts/LinkedAccounts'
import { View } from '@components/View/View'

interface BankTransactionsWithLinkedAccountsStringOverrides {
  title?: string
  linkedAccounts?: BankTransactionsWithLinkedAccountsStringOverrides
  bankTransactions?: BankTransactionsStringOverrides
}

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string // deprecated
  showTitle?: boolean
  elevatedLinkedAccounts?: boolean

  showBreakConnection?: boolean
  showCustomerVendor?: boolean
  showDescriptions?: boolean
  showLedgerBalance?: boolean
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
  renderInAppLink?: (details: LinkingMetadata) => ReactNode
  showCategorizationRules?: boolean
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
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
  showCustomerVendor = false,
  showDescriptions = true,
  showLedgerBalance = true,
  showReceiptUploads = true,
  showTags = false,
  showTooltips = false,
  showUnlinkItem = false,
  showUploadOptions = false,

  mobileComponent,
  stringOverrides,
  renderInAppLink,
  showCategorizationRules,
  plaidHostedLinkConfig,
}: BankTransactionsWithLinkedAccountsProps) => {
  const { t } = useTranslation()

  const selectedBankAccountIds = useSelectedBankAccountIds()
  const filters = useMemo(
    () => (selectedBankAccountIds.length ? { bankAccountIds: selectedBankAccountIds } : undefined),
    [selectedBankAccountIds],
  )

  return (
    <View
      title={stringOverrides?.title || title || t('bankTransactions:label.bank_transactions', 'Bank transactions')}
      showHeader={showTitle}
    >
      <LinkedAccounts
        elevated={elevatedLinkedAccounts}
        showLedgerBalance={showLedgerBalance}
        showUnlinkItem={showUnlinkItem}
        showBreakConnection={showBreakConnection}
        stringOverrides={stringOverrides?.linkedAccounts}
        plaidHostedLinkConfig={plaidHostedLinkConfig}
      />
      <BankTransactions
        asWidget
        filters={filters}
        showCustomerVendor={showCustomerVendor}
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTags={showTags}
        showTooltips={showTooltips}
        showUploadOptions={showUploadOptions}
        mobileComponent={mobileComponent}
        mode={mode}
        stringOverrides={stringOverrides?.bankTransactions}
        renderInAppLink={renderInAppLink}
        showCategorizationRules={showCategorizationRules}
      />
    </View>
  )
}
