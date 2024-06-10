import React from 'react'
import { BankTransaction } from '../../types'
import { BankTransactionMobileListItem } from './BankTransactionMobileListItem'
import {
  useTransactionToOpen,
  TransactionToOpenContext,
} from './TransactionToOpenContext'

export interface BankTransactionMobileListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (id: string) => void
  initialLoad?: boolean
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  initialLoad,
}: BankTransactionMobileListProps) => {
  const transactionToOpenContextData = useTransactionToOpen()

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <ul className='Layer__bank-transactions__mobile-list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionMobileListItem
              index={index}
              key={bankTransaction.id}
              bankTransaction={bankTransaction}
              editable={editable}
              removeTransaction={removeTransaction}
              initialLoad={initialLoad}
            />
          ),
        )}
      </ul>
    </TransactionToOpenContext.Provider>
  )
}
