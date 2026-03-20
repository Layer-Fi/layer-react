import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
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
  const { t } = useTranslation()
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
                  aria-label={t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page')}
                />
              </span>
            </th>
          )}
          <th className='Layer__table-header Layer__bank-transactions__date-col'>
            {stringOverrides?.transactionsTable?.dateColumnHeaderText || t('common:label.date', 'Date')}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__tx-col'>
            {stringOverrides?.transactionsTable?.transactionColumnHeaderText
              || t('common:label.transaction', 'Transaction')}
          </th>
          <th className='Layer__table-header Layer__bank-transactions__account-col'>
            {stringOverrides?.transactionsTable?.accountColumnHeaderText
              || t('common:label.account', 'Account')}
          </th>
          <th
            className='Layer__table-header Layer__table-cell--amount Layer__table-cell__amount-col'
            {...showReceiptDataProperties}
          >
            {stringOverrides?.transactionsTable?.amountColumnHeaderText
              || t('common:label.amount', 'Amount')}
          </th>
          <th
            className='Layer__table-header Layer__bank-transactions__documents-col'
            {...showReceiptDataProperties}
          />
          {isCategorizationEnabled && display !== DisplayState.categorized
            ? (
              <th className='Layer__table-header Layer__table-header--primary Layer__table-cell__category-col'>
                {stringOverrides?.transactionsTable?.categorizeColumnHeaderText
                  || t('common:action.categorize', 'Categorize')}
              </th>
            )
            : (
              <th className='Layer__table-header Layer__table-cell__category-col'>
                {stringOverrides?.transactionsTable?.categoryColumnHeaderText
                  || t('common:label.category', 'Category')}
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
                  titleVariant='historical'
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
