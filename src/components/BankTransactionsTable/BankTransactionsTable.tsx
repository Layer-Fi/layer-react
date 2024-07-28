import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import { BankTransactionRow } from '../BankTransactionRow'
import { BankTransactionsStringOverrides } from '../BankTransactions/BankTransactions'

export interface BankTransactionsTableStringOverrides {
  dateColumnHeaderText?: string
  transactionColumnHeaderText?: string
  accountColumnHeaderText?: string
  amountColumnHeaderText?: string
  categorizeColumnHeaderText?: string
  categoryColumnHeaderText?: string
}

interface BankTransactionsTableProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  categorizeView?: boolean
  isLoading?: boolean
  initialLoad?: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  hardRefreshPnlOnCategorize?: boolean
  stringOverrides?: BankTransactionsStringOverrides
}

export const BankTransactionsTable = ({
  categorizeView,
  editable,
  isLoading,
  bankTransactions,
  initialLoad,
  containerWidth,
  removeTransaction,
  showDescriptions = false,
  showReceiptUploads = false,
  hardRefreshPnlOnCategorize = false,
  stringOverrides,
}: BankTransactionsTableProps) => {
  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          <th className='Layer__table-header Layer__bank-transactions__date-col'>
            {stringOverrides?.transactionsTable?.dateColumnHeaderText || 'Date'}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__tx-col'>
            {stringOverrides?.transactionsTable?.transactionColumnHeaderText ||
              'Transaction'}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__account-col'>
            {stringOverrides?.transactionsTable?.accountColumnHeaderText ||
              'Account'}
          </th>
          <th className='Layer__table-header Layer__table-cell--amount Layer__table-cell__amount-col'>
            {stringOverrides?.transactionsTable?.amountColumnHeaderText ||
              'Amount'}
          </th>
          {categorizeView && editable ? (
            <th className='Layer__table-header Layer__table-header--primary Layer__table-cell__category-col'>
              {stringOverrides?.transactionsTable?.categorizeColumnHeaderText ||
                'Categorize'}
            </th>
          ) : (
            <th className='Layer__table-header Layer__table-cell__category-col'>
              {stringOverrides?.transactionsTable?.categoryColumnHeaderText ||
                'Category'}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {!isLoading &&
          bankTransactions?.map(
            (bankTransaction: BankTransaction, index: number) => (
              <BankTransactionRow
                initialLoad={initialLoad}
                index={index}
                editable={editable}
                key={bankTransaction.id}
                dateFormat={DATE_FORMAT}
                bankTransaction={bankTransaction}
                removeTransaction={removeTransaction}
                containerWidth={containerWidth}
                showDescriptions={showDescriptions}
                showReceiptUploads={showReceiptUploads}
                hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize}
                stringOverrides={stringOverrides?.bankTransactionCTAs}
              />
            ),
          )}
      </tbody>
    </table>
  )
}
