import { useCallback, useMemo, useState } from 'react'
import type { OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, DisplayState } from '@internal-types/features/bankTransactions/bankTransaction'
import { Alignment } from '@internal-types/utility/table'
import { isMoneyIn } from '@utils/features/bankTransactions/shared'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankTransactionsContext } from '@providers/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@providers/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsPaginationContext } from '@providers/bankTransactions/BankTransactionsPagination/BankTransactionsPaginationContext'
import { useBankTransactionsStringOverrides } from '@providers/bankTransactions/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useBulkSelectionActions, useSelectedIds } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import type { ClickableRowProps } from '@blocks/Table/DataTable/DataTable'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import type { DataTableExpandedRowProps } from '@blocks/Table/DataTable/utils/rows/expandedRows'
import type { DataTableSelectionProps } from '@blocks/Table/DataTable/utils/rows/selection'
import { PaginatedTable } from '@blocks/Table/PaginatedDataTable/PaginatedDataTable'
import { SimpleDataTable } from '@blocks/Table/SimpleDataTable/SimpleDataTable'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@features/bankTransactions/BankTransactionsDataStates/BankTransactionsDataStates'
import { BankTransactionAccountCell } from '@features/bankTransactions/BankTransactionsTable/BankTransactionAccountCell'
import { BankTransactionCategoryCell } from '@features/bankTransactions/BankTransactionsTable/BankTransactionCategoryCell'
import { BankTransactionDescriptionCell } from '@features/bankTransactions/BankTransactionsTable/BankTransactionDescriptionCell'
import { ExpandedBankTransactionRow } from '@features/bankTransactions/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { type BankTransactionsTableStringOverrides } from '@features/bankTransactions/types'

import './bankTransactionsTable.scss'

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
  <MoneySpan amount={bankTransaction.amount} displayPlusSign={isMoneyIn(bankTransaction)} />
)

type GetColumnConfigParams = {
  display: DisplayState
  isCategorizationEnabled: boolean
  isExpandedRowValid: (id: string) => boolean
  stringOverrides?: BankTransactionsTableStringOverrides
  t: TFunction
}

const getColumnConfig = ({
  display,
  isCategorizationEnabled,
  isExpandedRowValid,
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
    shouldHideAfterCategorize,
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
    stringOverrides,
    t,
  }), [
    display,
    isCategorizationEnabled,
    isExpandedRowValid,
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
      row.original.recentlyCategorized && shouldHideAfterCategorize && 'Layer__BankTransactionRow--Removing',
      row.original.recentlyCategorized && shouldHideAfterCategorize && 'Layer__bank-transaction-row--removing',
    )
  ), [shouldHideAfterCategorize])

  const tableProps = {
    ariaLabel: t('bankTransactions:label.bank_transactions', 'Bank transactions'),
    className: 'Layer__bank-transactions__table',
    data: bankTransactions,
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
