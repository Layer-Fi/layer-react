import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import { BankTransactionRow } from '../BankTransactionRow'
import { BankTransactionsLoader } from '../BankTransactionsLoader'
import { SyncingComponent } from '../SyncingComponent'

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
  isSyncing?: boolean
  page?: number
  lastPage?: boolean
  onRefresh?: () => void
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
  isSyncing = false,
  page,
  lastPage,
  onRefresh,
}: BankTransactionsTableProps) => {
  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          <th className='Layer__table-header Layer__bank-transactions__date-col'>
            Date
          </th>
          <th className='Layer__table-header Layer__bank-transactions__tx-col'>
            Transaction
          </th>
          <th className='Layer__table-header Layer__bank-transactions__account-col'>
            Account
          </th>
          <th className='Layer__table-header Layer__table-cell--amount Layer__table-cell__amount-col'>
            Amount
          </th>
          {categorizeView && editable ? (
            <th className='Layer__table-header Layer__table-header--primary Layer__table-cell__category-col'>
              Categorize
            </th>
          ) : (
            <th className='Layer__table-header Layer__table-cell__category-col'>
              Category
            </th>
          )}
        </tr>
      </thead>
      {(isLoading || isSyncing) && page && page === 1 ? ( <BankTransactionsLoader />
      ) : null}
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
              />
            ),
          )}
        {(isLoading || isSyncing) && lastPage ? (
          <tr>
            <td colSpan={3}>
              <SyncingComponent onRefresh={() => onRefresh && onRefresh()} />
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}
