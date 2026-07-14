import { useCallback, useMemo, useState } from 'react'
import type { OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { Alignment } from '@schemas/reports/unifiedReport'
import { isCredit } from '@utils/bankTransactions/shared'
import { useBankTransactionsWithExit } from '@hooks/features/bankTransactions/useBankTransactionsWithExit'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBulkSelectionActions, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useBankTransactionsPaginationContext } from '@contexts/BankTransactionsPaginationContext/BankTransactionsPaginationContext'
import { useBankTransactionsStringOverrides } from '@contexts/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionAccountCell } from '@components/BankTransactionsTable/BankTransactionAccountCell'
import { BankTransactionCategoryCell } from '@components/BankTransactionsTable/BankTransactionCategoryCell'
import { BankTransactionDescriptionCell } from '@components/BankTransactionsTable/BankTransactionDescriptionCell'
import type { ClickableRowProps } from '@components/DataTable/DataTable'
import type { ColumnConfig } from '@components/DataTable/utils/column'
import type { DataTableExpandedRowProps } from '@components/DataTable/utils/rows/expandedRows'
import type { DataTableSelectionProps } from '@components/DataTable/utils/rows/selection'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'
import { SimpleDataTable } from '@components/SimpleDataTable/SimpleDataTable'

import './bankTransactionsTable.scss'

export interface BankTransactionsTableStringOverrides {
  dateColumnHeaderText?: string
  transactionColumnHeaderText?: string
  accountColumnHeaderText?: string
  amountColumnHeaderText?: string
  categorizeColumnHeaderText?: string
  categoryColumnHeaderText?: string
}

const COMPONENT_NAME = 'BankTransactionsTable'

enum BankTransactionColumns {
  Date = 'Date',
  Transaction = 'Transaction',
  Account = 'Account',
  Amount = 'Amount',
  Category = 'Category',
}

type BankTransactionRowType = Row<BankTransaction>

const BankTransactionDateCell = ({ bankTransaction }: { bankTransaction: BankTransaction }) => {
  const { formatDate } = useIntlFormatter()

  return <Span>{formatDate(bankTransaction.date)}</Span>
}

const BankTransactionAmountCell = ({ bankTransaction }: { bankTransaction: BankTransaction }) => (
  <MoneySpan amount={bankTransaction.amount} displayPlusSign={isCredit(bankTransaction)} />
)

type GetColumnConfigParams = {
  display: DisplayState
  isCategorizationEnabled: boolean
  isExpandedRowValid: (id: string) => boolean
  exitingIds: Set<string>
  onExitComplete: (id: string) => void
  stringOverrides?: BankTransactionsTableStringOverrides
  t: TFunction
}

const getColumnConfig = ({
  display,
  isCategorizationEnabled,
  isExpandedRowValid,
  exitingIds,
  onExitComplete,
  stringOverrides,
  t,
}: GetColumnConfigParams): ColumnConfig<BankTransaction> => [
  {
    id: BankTransactionColumns.Date,
    header: stringOverrides?.dateColumnHeaderText || t('common:label.date', 'Date'),
    cell: (row: BankTransactionRowType) => <BankTransactionDateCell bankTransaction={row.original} />,
    isRowHeader: true,
  },
  {
    id: BankTransactionColumns.Transaction,
    header: stringOverrides?.transactionColumnHeaderText
      || t('common:label.transaction', 'Transaction'),
    cell: (row: BankTransactionRowType) => <BankTransactionDescriptionCell bankTransaction={row.original} />,
  },
  {
    id: BankTransactionColumns.Account,
    header: stringOverrides?.accountColumnHeaderText
      || t('common:label.account', 'Account'),
    cell: (row: BankTransactionRowType) => <BankTransactionAccountCell bankTransaction={row.original} />,
  },
  {
    id: BankTransactionColumns.Amount,
    header: stringOverrides?.amountColumnHeaderText
      || t('common:label.amount', 'Amount'),
    alignment: Alignment.Right,
    pinning: 'right',
    cell: (row: BankTransactionRowType) => <BankTransactionAmountCell bankTransaction={row.original} />,
  },
  {
    id: BankTransactionColumns.Category,
    header: isCategorizationEnabled && display !== DisplayState.categorized
      ? (stringOverrides?.categorizeColumnHeaderText
        || t('common:action.categorize', 'Categorize'))
      : (stringOverrides?.categoryColumnHeaderText
        || t('common:label.category', 'Category')),
    pinning: 'right',
    preventRowClick: true,
    cell: (row: BankTransactionRowType) => (
      <BankTransactionCategoryCell
        row={row}
        isExpandedRowValid={isExpandedRowValid(row.original.id)}
        isExiting={exitingIds.has(row.original.id)}
        onExitComplete={onExitComplete}
      />
    ),
  },
]

const getRowSelectionState = (selectedIds: Set<string>): RowSelectionState => {
  const rowSelection: RowSelectionState = {}

  selectedIds.forEach((id) => {
    rowSelection[id] = true
  })

  return rowSelection
}

export const BankTransactionsTable = () => {
  const { t } = useTranslation()
  const { transactionsTable: stringOverrides } = useBankTransactionsStringOverrides()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const {
    display,
    isLoading,
    isError,
    data: bankTransactions,
  } = useBankTransactionsContext()
  const { isMonthlyViewMode } = useBankTransactionsFiltersContext()
  const paginationProps = useBankTransactionsPaginationContext()
  const { selectedIds } = useSelectedIds()
  const { selectMultiple, deselectMultiple } = useBulkSelectionActions()
  const [expandedRowValidity, setExpandedRowValidity] = useState<Record<string, boolean>>({})
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const { displayItems, exitingIds, onExitComplete } = useBankTransactionsWithExit(bankTransactions)

  const rowSelection = useMemo(() => getRowSelectionState(selectedIds), [selectedIds])

  const onRowSelectionChange = useCallback<OnChangeFn<RowSelectionState>>((updaterOrValue) => {
    const nextSelection =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection)
        : updaterOrValue

    const addedIds = Object.keys(nextSelection).filter(id => nextSelection[id] && !rowSelection[id])
    const removedIds = Object.keys(rowSelection).filter(id => rowSelection[id] && !nextSelection[id])

    if (addedIds.length > 0) {
      selectMultiple(addedIds)
    }
    if (removedIds.length > 0) {
      deselectMultiple(removedIds)
    }
  }, [deselectMultiple, rowSelection, selectMultiple])

  const selectionProps = useMemo<DataTableSelectionProps<BankTransaction> | undefined>(() => {
    if (!isCategorizationEnabled) return undefined

    return {
      rowSelection,
      onRowSelectionChange,
      selectAllAriaLabel: t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page'),
      getRowSelectionAriaLabel: () => t('bankTransactions:label.select_transaction', 'Select transaction'),
    }
  }, [isCategorizationEnabled, onRowSelectionChange, rowSelection, t])

  const onExpandedRowValidityChange = useCallback((id: string, isValid: boolean) => {
    setExpandedRowValidity((current) => {
      if (current[id] === isValid) return current
      return {
        ...current,
        [id]: isValid,
      }
    })
  }, [])

  const isExpandedRowValid = useCallback(
    (id: string) => expandedRowValidity[id] ?? true,
    [expandedRowValidity],
  )

  const columnConfig = useMemo(() => getColumnConfig({
    display,
    isCategorizationEnabled,
    isExpandedRowValid,
    exitingIds,
    onExitComplete,
    stringOverrides,
    t,
  }), [
    display,
    isCategorizationEnabled,
    isExpandedRowValid,
    exitingIds,
    onExitComplete,
    stringOverrides,
    t,
  ])

  const expandedRowProps = useMemo<DataTableExpandedRowProps<BankTransaction>>(() => ({
    getRowCanExpand: () => true,
    render: row => (
      <ExpandedBankTransactionRow
        bankTransaction={row.original}
        onValidityChange={isValid => onExpandedRowValidityChange(row.original.id, isValid)}
      />
    ),
  }), [
    onExpandedRowValidityChange,
  ])

  const withClickableRow = useMemo<ClickableRowProps<BankTransaction>>(() => ({
    isRowClickable: () => true,
    onRowClick: row => row.toggleExpanded(),
  }), [])

  const getRowClassName = useCallback((row: BankTransactionRowType) => (
    classNames(
      'Layer__BankTransactionRow',
      'Layer__bank-transaction-row',
      row.getIsExpanded() && 'Layer__BankTransactionRow--Expanded',
      row.getIsExpanded() && 'Layer__bank-transaction-row--expanded',
      exitingIds.has(row.original.id) && 'Layer__BankTransactionRow--Removing',
      exitingIds.has(row.original.id) && 'Layer__bank-transaction-row--removing',
    )
  ), [exitingIds])

  const tableProps = {
    ariaLabel: t('bankTransactions:label.bank_transactions', 'Bank transactions'),
    className: 'Layer__bank-transactions__table',
    data: displayItems,
    isLoading,
    isError,
    columnConfig,
    componentName: COMPONENT_NAME,
    slots: {
      EmptyState: BankTransactionsEmptyState,
      ErrorState: BankTransactionsErrorState,
    },
    withClickableRow,
    getRowClassName,
    selectionProps,
    expandedRowProps,
  }

  return (
    <div className='Layer__bank-transactions__table-wrapper Layer__BankTransactions__TableWrapper'>
      {isMonthlyViewMode
        ? <SimpleDataTable {...tableProps} />
        : <PaginatedTable {...tableProps} paginationProps={paginationProps} />}
    </div>
  )
}
