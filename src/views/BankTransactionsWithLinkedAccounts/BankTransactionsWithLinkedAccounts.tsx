import React from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { LinkedAccounts } from '../../components/LinkedAccounts'
import { View } from '../../components/View'
import {MobileComponentType} from "../../components/BankTransactions/constants";

export interface BankTransactionsWithLinkedAccountsProps {
  title?: string
  elevatedLinkedAccounts?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  mobileComponent?: MobileComponentType
}

export const BankTransactionsWithLinkedAccounts = ({
  title = 'Bank transactions',
  elevatedLinkedAccounts = true,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  showDescriptions,
  showReceiptUploads,
  mobileComponent,
}: BankTransactionsWithLinkedAccountsProps) => {
  return (
    <View title={title}>
      <LinkedAccounts
        elevated={elevatedLinkedAccounts}
        showLedgerBalance={showLedgerBalance}
        showUnlinkItem={showUnlinkItem}
        showBreakConnection={showBreakConnection}
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
