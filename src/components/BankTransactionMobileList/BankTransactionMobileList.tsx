import React from 'react'
import { BankTransaction } from '../../types'
import { BankTransactionMobileListItem } from './BankTransactionMobileListItem'

export interface BankTransactionMobileListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (id: string) => void
  containerWidth?: number
  initialLoad?: boolean
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  containerWidth,
  initialLoad,
}: BankTransactionMobileListProps) => {
  return (
    <ul className='Layer__bank-transactions__mobile-list'>
      {bankTransactions?.map(
        (bankTransaction: BankTransaction, index: number) => (
          <BankTransactionMobileListItem
            index={index}
            key={bankTransaction.id}
            bankTransaction={bankTransaction}
            editable={editable}
            removeTransaction={removeTransaction}
            containerWidth={containerWidth}
            initialLoad={initialLoad}
          />
        ),
      )}
    </ul>
  )
}
