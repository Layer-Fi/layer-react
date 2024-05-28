import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import { BankTransactionNative1ListItem } from './BankTransactionNative1ListItem'

export interface BankTransactionNative1Props {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (id: string) => void
  containerWidth?: number
}

export const BankTransactionNative1 = ({
  bankTransactions,
  removeTransaction,
  editable,
  containerWidth,
}: BankTransactionNative1Props) => {
  return (
    <ul className='Layer__bank-transactions__native-1'>
      {bankTransactions?.map(
        (bankTransaction: BankTransaction, index: number) => (
          <BankTransactionNative1ListItem
            index={index}
            key={bankTransaction.id}
            dateFormat={DATE_FORMAT}
            bankTransaction={bankTransaction}
            editable={editable}
            removeTransaction={removeTransaction}
            containerWidth={containerWidth}
          />
        ),
      )}
    </ul>
  )
}
