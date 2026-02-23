import { useCallback, useMemo } from 'react'

import { type BankTransaction, DisplayState } from '@internal-types/bank_transactions'
import { DATE_FORMAT } from '@config/general'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useBankTransactionsTableCheckboxState } from '@hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/useBankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { BankTransactionRow } from '@components/BankTransactionRow/BankTransactionRow'
import {
  type BankTransactionsStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsTableEmptyState } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionsLoader } from '@components/BankTransactionsLoader/BankTransactionsLoader'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'

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
  isLoading?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean

  stringOverrides?: BankTransactionsStringOverrides
  isSyncing?: boolean
  page?: number
  lastPage?: boolean
}

export const BankTransactionsTable = ({
  isLoading,
  bankTransactions,

  showDescriptions,
  showReceiptUploads,
  showTooltips,

  stringOverrides,
  isSyncing = false,
  page,
  lastPage,
}: BankTransactionsTableProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const { mutate, display } = useBankTransactionsContext()
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const isEmpty = (bankTransactions?.length ?? 0) === 0

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

  const onRefresh = useCallback(() => {
    void mutate()
  }, [mutate])

  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          {isCategorizationEnabled && (
            <th className='Layer__table-header Layer__bank-transactions__checkbox-col' style={{ padding: 0 }}>
              <span className='Layer__table-cell-content'>
                <Checkbox
                  isSelected={isAllSelected}
                  isIndeterminate={isPartiallySelected}
                  onChange={onHeaderCheckboxChange}
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
          {isCategorizationEnabled && display !== DisplayState.categorized
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
      {isLoading && <BankTransactionsLoader />}
      <tbody>
        {!isLoading && isEmpty && (
          <tr>
            <td colSpan={isCategorizationEnabled ? 7 : 6}>
              <BankTransactionsTableEmptyState />
            </td>
          </tr>
        )}
        {!isLoading
          && bankTransactions?.map(
            (bankTransaction: BankTransaction, index: number) => (
              <BankTransactionRow
                key={bankTransaction.id}
                index={index}
                dateFormat={DATE_FORMAT}
                bankTransaction={bankTransaction}
                showDescriptions={showDescriptions}
                showReceiptUploads={showReceiptUploads}
                showReceiptUploadColumn={showReceiptColumn}
                showTooltips={showTooltips}
                stringOverrides={stringOverrides?.bankTransactionCTAs}
              />
            ),
          )}
        {isSyncing && (lastPage || (isEmpty && page === 1))
          ? (
            <tr>
              <td colSpan={3}>
                <SyncingComponent
                  title='Syncing historical account data'
                  timeSync={5}
                  onRefresh={onRefresh}
                />
              </td>
            </tr>
          )
          : null}
      </tbody>
    </table>
  )
}
