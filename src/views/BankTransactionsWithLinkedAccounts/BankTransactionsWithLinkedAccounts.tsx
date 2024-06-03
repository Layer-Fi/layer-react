import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string
  elevatedLinkedAccounts?: boolean
  showLedgerBalance?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
}

export const BankTransactionsWithLinkedAccounts = ({
  title = 'Bank transactions',
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
  showDescriptions,
  showReceiptUploads,
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View title={title}>
      <LinkedAccounts
        elevated={elevatedLinkedAccounts}
        showLedgerBalance={showLedgerBalance}
      />
      <BankTransactions
        asWidget
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
      />
    </View>
  )
}
