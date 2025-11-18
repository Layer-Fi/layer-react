import { useMemo } from 'react'
import { DATE_FORMAT } from '@config/general'
import { BankTransaction } from '@internal-types/bank_transactions'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { BankTransactionRow } from '@components/BankTransactionRow/BankTransactionRow'
import {
  BankTransactionsStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsLoader } from '@components/BankTransactionsLoader/BankTransactionsLoader'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { useBankTransactionsTableCheckboxState } from '@hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/useBankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'

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

  stringOverrides,
  isSyncing = false,
  page,
  lastPage,
  onRefresh,
}: BankTransactionsTableProps) => {
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

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

  return (
    <table
      width='100%'
      className='Layer__table Layer__bank-transactions__table with-cell-separators'
    >
      <thead>
        <tr>
          {categorizationEnabled && (
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
      {isLoading && page && page === 1 && <BankTransactionsLoader />}
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
