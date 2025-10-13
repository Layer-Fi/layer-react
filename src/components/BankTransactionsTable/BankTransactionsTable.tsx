import { useMemo, useCallback } from 'react'
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
import { useSelectedIds, useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'

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
  _showBulkSelection?: boolean

  stringOverrides?: BankTransactionsStringOverrides
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
  containerWidth,
  removeTransaction,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
  _showBulkSelection = false,

  stringOverrides,
  isSyncing = false,
  page,
  lastPage,
  onRefresh,
}: BankTransactionsTableProps) => {
  const { selectedIds } = useSelectedIds()
  const { selectMultiple, deselectMultiple } = useBulkSelectionActions()

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

  const currentPageIds = useMemo(
    () => bankTransactions?.map(tx => tx.id) ?? [],
    [bankTransactions],
  )

  const selectedCount = useMemo(
    () => currentPageIds.filter(id => selectedIds.has(id)).length,
    [currentPageIds, selectedIds],
  )

  const isAllSelected = selectedCount > 0 && selectedCount === currentPageIds.length
  const isPartiallySelected = selectedCount > 0 && selectedCount < currentPageIds.length

  const handleHeaderCheckboxChange = useCallback((checked: boolean) => {
    if (checked) {
      selectMultiple(currentPageIds)
    }
    else {
      deselectMultiple(currentPageIds)
    }
  }, [currentPageIds, selectMultiple, deselectMultiple])

  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          {_showBulkSelection && (
            <th className='Layer__table-header Layer__bank-transactions__checkbox-col'>
              <span className='Layer__table-cell-content'>
                <Checkbox
                  isSelected={isAllSelected}
                  isIndeterminate={isPartiallySelected}
                  onChange={handleHeaderCheckboxChange}
                  aria-label='Select all transactions on this page'
                />
              </span>
            </th>
          )}
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
                _showBulkSelection={_showBulkSelection}
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
              <td colSpan={3}>
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
