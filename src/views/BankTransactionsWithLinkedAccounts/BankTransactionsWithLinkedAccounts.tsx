import {
  BankTransactions,
  type BankTransactionsStringOverrides,
} from '../../components/BankTransactions/BankTransactions'
import { BankTransactionsMode } from '../../providers/LegacyModeProvider/LegacyModeProvider'
import { MobileComponentType } from '../../components/BankTransactions/constants'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'

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
}

export const BankTransactionsWithLinkedAccounts = ({
  title, // deprecated
  showTitle = true,
  elevatedLinkedAccounts = true,
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
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View
      title={stringOverrides?.title || title || 'Bank transactions'}
      showHeader={showTitle}
    >
      <LinkedAccounts
        elevated={elevatedLinkedAccounts}
        showLedgerBalance={showLedgerBalance}
        showUnlinkItem={showUnlinkItem}
        showBreakConnection={showBreakConnection}
        stringOverrides={stringOverrides?.linkedAccounts}
      />
      <BankTransactions
        asWidget
        showCustomerVendor={showCustomerVendor}
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTags={showTags}
        showTooltips={showTooltips}
        showUploadOptions={showUploadOptions}
        mobileComponent={mobileComponent}
        mode={mode}
        stringOverrides={stringOverrides?.bankTransactions}
      />
    </View>
  )
}
