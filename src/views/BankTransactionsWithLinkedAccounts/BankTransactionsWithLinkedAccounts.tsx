import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string
}

export const BankTransactionsWithLinkedAccounts = ({
  title = 'Bank transactions',
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View title={title}>
      <LinkedAccounts />
      <BankTransactions asWidget />
    </View>
  )
}
