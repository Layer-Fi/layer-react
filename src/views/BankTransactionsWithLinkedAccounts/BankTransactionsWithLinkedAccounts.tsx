import { BankTransactions } from '../../components/BankTransactions'
import {
  BankTransactionsMode,
  BankTransactionsStringOverrides,
} from '../../components/BankTransactions/BankTransactions'
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
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  showTooltips?: boolean
  mode?: BankTransactionsMode
  mobileComponent?: MobileComponentType
  stringOverrides?: BankTransactionsWithLinkedAccountsStringOverrides
}

export const BankTransactionsWithLinkedAccounts = ({
  title, // deprecated
  showTitle = true,
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  mode = 'self-serve',
  showDescriptions = true,
  showReceiptUploads = true,
  showTooltips = false,
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
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTooltips={showTooltips}
        mobileComponent={mobileComponent}
        mode={mode}
        stringOverrides={stringOverrides?.bankTransactions}
      />
    </View>
  )
}
