import { useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { BankTransactionRow } from '../BankTransactionRow/BankTransactionRow'
import {
  BankTransactionsStringOverrides,
} from '../BankTransactions/BankTransactions'
import { BankTransactionsLoader } from '../BankTransactionsLoader'
import { SyncingComponent } from '../SyncingComponent'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { 
  useBankTransactionsBulkSelectionContext,
} from '../../contexts/BankTransactionsContext'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'

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
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean

  stringOverrides?: BankTransactionsStringOverrides
  isSyncing?: boolean
  page?: number
  lastPage?: boolean
  onRefresh?: () => void
}

// Main component wrapper - bulk selection provider is now at BankTransactions level
export const BankTransactionsTable = (props: BankTransactionsTableProps) => {
  return <BankTransactionsTableContent {...props} />
}

// Internal component that uses the bulk selection context
const BankTransactionsTableContent = ({
  categorizeView,
  editable,
  isLoading,
  bankTransactions,
  containerWidth,
  removeTransaction,

  showDescriptions,
  showReceiptUploads,
  showTooltips,

  stringOverrides,
  isSyncing = false,
  page,
  lastPage,
  onRefresh,
}: BankTransactionsTableProps) => {
  const {
    selectedTransactions,
    bulkSelectionActive,
    selectAll,
    deselectAll,
    clearSelection,
    openBulkSelection,
  } = useBankTransactionsBulkSelectionContext()

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const isBookkeepingActive = bookkeepingStatus === BookkeepingStatus.ACTIVE

  const showReceiptColumn =
    (showReceiptUploads
      && bankTransactions?.some(
        transaction => transaction.document_ids?.length > 0,
      ))
      ?? false

  const showReceiptDataProperties = useMemo(
    () => toDataProperties({ 'show-receipt-upload-column': showReceiptColumn }),
    [showReceiptColumn],
  )

  // Header checkbox logic
  const availableTransactions = bankTransactions || []
  const allSelected = availableTransactions.length > 0 && availableTransactions.every(t => 
    selectedTransactions.some(selected => selected.id === t.id)
  )
  const someSelected = selectedTransactions.some(selected => 
    availableTransactions.some(t => t.id === selected.id)
  )
  const indeterminate = someSelected && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      // Only deselect items on this page, not all selected items
      deselectAll(availableTransactions)
    } else {
      selectAll(availableTransactions)
      if (!bulkSelectionActive) {
        openBulkSelection()
      }
    }
  }

  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          <th className='Layer__table-header Layer__bank-transactions__checkbox-col'>
            <span className='Layer__table-cell-content'>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isBookkeepingActive && (
                  <Checkbox 
                    isSelected={allSelected}
                    isIndeterminate={indeterminate}
                    onChange={handleSelectAll}
                  />
                )}
                {!isBookkeepingActive && selectedTransactions.length > 0 && (
                  <span style={{
                    color: '#374151',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {selectedTransactions.length}
                  </span>
                )}
              </div>
            </span>
          </th>
          <th className='Layer__table-header Layer__bank-transactions__date-col'>
            {stringOverrides?.transactionsTable?.dateColumnHeaderText || 'Date'}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__tx-col'>
            {stringOverrides?.transactionsTable?.transactionColumnHeaderText
              || 'Transaction'}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__account-col'>
            {stringOverrides?.transactionsTable?.accountColumnHeaderText
              || 'Account'}
          </th>
          <th
            className='Layer__table-header Layer__table-cell--amount Layer__table-cell__amount-col'
            {...showReceiptDataProperties}
          >
            {stringOverrides?.transactionsTable?.amountColumnHeaderText
              || 'Amount'}
          </th>
          <th
            className='Layer__table-header Layer__bank-transactions__documents-col'
            {...showReceiptDataProperties}
          />
          {categorizeView && editable
            ? (
              <th className='Layer__table-header Layer__table-header--primary Layer__table-cell__category-col'>
                {stringOverrides?.transactionsTable?.categorizeColumnHeaderText
                  || 'Categorize'}
              </th>
            )
            : (
              <th className='Layer__table-header Layer__table-cell__category-col'>
                {stringOverrides?.transactionsTable?.categoryColumnHeaderText
                  || 'Category'}
              </th>
            )}
        </tr>
      </thead>
      {isLoading && page && page === 1
        ? (
          <BankTransactionsLoader isLoading={true} showTooltips={showTooltips} />
        )
        : null}
      <tbody>
        {!isLoading
          && bankTransactions?.map(
            (bankTransaction: BankTransaction, index: number) => (
              <BankTransactionRow
                key={bankTransaction.id}
                index={index}
                editable={editable}
                dateFormat={DATE_FORMAT}
                bankTransaction={bankTransaction}
                removeTransaction={removeTransaction}
                containerWidth={containerWidth}
                showDescriptions={showDescriptions}
                showReceiptUploads={showReceiptUploads}
                showReceiptUploadColumn={showReceiptColumn}
                showTooltips={showTooltips}
                stringOverrides={stringOverrides?.bankTransactionCTAs}
              />
            ),
          )}
        {isSyncing
          && (lastPage
            || ((!bankTransactions || bankTransactions.length === 0)
              && page === 1))
          ? (
            <tr>
              <td colSpan={4}>
                <SyncingComponent
                  title='Syncing historical account data'
                  onRefresh={() => onRefresh && onRefresh()}
                />
              </td>
            </tr>
          )
          : null}
      </tbody>
    </table>
  )
}
