import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string
  elevatedLinkedAccounts?: boolean
  showLedgerBalance?: boolean
}

export const BankTransactionsWithLinkedAccounts = ({
  title = 'Bank transactions',
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View title={title}>
      <LinkedAccounts
        elevated={elevatedLinkedAccounts}
        showLedgerBalance={showLedgerBalance}
      />
      <BankTransactions asWidget />
    </View>
  )
}
