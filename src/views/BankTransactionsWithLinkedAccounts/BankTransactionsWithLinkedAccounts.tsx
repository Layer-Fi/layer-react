import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'
import {MobileComponentType} from "../../components/BankTransactions/constants";

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string
  elevatedLinkedAccounts?: boolean
  showLedgerBalance?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  mobileComponent?: MobileComponentType
}

export const BankTransactionsWithLinkedAccounts = ({
  title = 'Bank transactions',
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
  showDescriptions,
  showReceiptUploads,
  mobileComponent,
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
        mobileComponent={mobileComponent}
      />
    </View>
  )
}
