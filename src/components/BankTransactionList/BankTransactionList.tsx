import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import { BankTransactionListItem } from './BankTransactionListItem'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  showDescriptions?: boolean
  showReceiptUploads?: boolean
}

export const BankTransactionList = ({
  bankTransactions,
  editable,
  removeTransaction,
  containerWidth,
  showDescriptions = false,
  showReceiptUploads = false,
}: BankTransactionListProps) => {
  return (
    <ul className='Layer__bank-transactions__list'>
      {bankTransactions?.map(
        (bankTransaction: BankTransaction, index: number) => (
          <BankTransactionListItem
            index={index}
            key={bankTransaction.id}
            dateFormat={DATE_FORMAT}
            bankTransaction={bankTransaction}
            editable={editable}
            removeTransaction={removeTransaction}
            containerWidth={containerWidth}
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
          />
        ),
      )}
    </ul>
  )
}
