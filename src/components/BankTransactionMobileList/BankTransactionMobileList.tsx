import React from 'react'
import { BankTransaction } from '../../types'
import { BankTransactionsMode } from '../BankTransactions/BankTransactions'
import { BankTransactionMobileListItem } from './BankTransactionMobileListItem'
import {
  useTransactionToOpen,
  TransactionToOpenContext,
} from './TransactionToOpenContext'

export interface BankTransactionMobileListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  initialLoad?: boolean
  hardRefreshPnlOnCategorize?: boolean
  mode: BankTransactionsMode
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  initialLoad,
  mode,
  hardRefreshPnlOnCategorize,
}: BankTransactionMobileListProps) => {
  const transactionToOpenContextData = useTransactionToOpen()

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <ul className='Layer__bank-transactions__mobile-list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionMobileListItem
              index={index}
              mode={mode}
              key={bankTransaction.id}
              bankTransaction={bankTransaction}
              editable={editable}
              removeTransaction={removeTransaction}
              initialLoad={initialLoad}
              hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize}
            />
          ),
        )}
      </ul>
    </TransactionToOpenContext.Provider>
  )
}
