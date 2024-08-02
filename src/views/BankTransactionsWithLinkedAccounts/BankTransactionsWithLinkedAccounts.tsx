import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { BankTransactionsStringOverrides } from '../../components/BankTransactions/BankTransactions'
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
  elevatedLinkedAccounts?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  categorizedOnly?: boolean
  hardRefreshPnlOnCategorize?: boolean
  mobileComponent?: MobileComponentType
  stringOverrides?: BankTransactionsWithLinkedAccountsStringOverrides
}

export const BankTransactionsWithLinkedAccounts = ({
  title, // deprecated
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  categorizedOnly = false,
  hardRefreshPnlOnCategorize = false,
  showDescriptions,
  showReceiptUploads,
  mobileComponent,
  stringOverrides,
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View title={stringOverrides?.title || title || 'Bank transactions'}>
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
        mobileComponent={mobileComponent}
        categorizedOnly={categorizedOnly}
        hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize}
        stringOverrides={stringOverrides?.bankTransactions}
      />
    </View>
  )
}
