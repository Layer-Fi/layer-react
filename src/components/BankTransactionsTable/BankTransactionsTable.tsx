import { useCallback, useMemo, useState } from 'react'
import type { OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { Alignment } from '@schemas/reports/unifiedReport'
import { isCategorized, isCredit } from '@utils/bankTransactions/shared'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBulkSelectionActions, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import {
  type BankTransactionsStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsTableEmptyState } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionAccountCell } from '@components/BankTransactionsTable/BankTransactionAccountCell'
import { BankTransactionActionsCell } from '@components/BankTransactionsTable/BankTransactionActionsCell'
import { BankTransactionDescriptionCell } from '@components/BankTransactionsTable/BankTransactionDescriptionCell'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { DataStateContainer } from '@components/DataStateContainer/DataStateContainer'
import type { ClickableRowProps } from '@components/DataTable/DataTable'
import type { ColumnConfig } from '@components/DataTable/utils/column'
import type { DataTableExpandedRowProps } from '@components/DataTable/utils/rows/expandedRows'
import type { DataTableSelectionProps } from '@components/DataTable/utils/rows/selection'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
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

interface BankTransactionsTableProps {
  bankTransactions?: BankTransaction[]
  isLoading?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean

  stringOverrides?: BankTransactionsStringOverrides
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps
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

const BankTransactionsTableErrorState = () => {
  const { t } = useTranslation()

  return (
    <DataStateContainer>
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('bankTransactions:error.couldnt_load_transactions', 'We couldn’t load your transactions')}
        spacing
      />
    </DataStateContainer>
  )
}

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
  showReceiptUploads: boolean
  stringOverrides?: BankTransactionsStringOverrides
  t: TFunction
}

const getColumnConfig = ({
  display,
  isCategorizationEnabled,
  isExpandedRowValid,
  showReceiptUploads,
  stringOverrides,
  t,
}: GetColumnConfigParams): ColumnConfig<BankTransaction> => [
  {
    id: BankTransactionColumns.Date,
    header: stringOverrides?.transactionsTable?.dateColumnHeaderText || t('common:label.date', 'Date'),
    cell: (row: BankTransactionRowType) => <BankTransactionDateCell bankTransaction={row.original} />,
    isRowHeader: true,
  },
  {
    id: BankTransactionColumns.Transaction,
    header: stringOverrides?.transactionsTable?.transactionColumnHeaderText
      || t('common:label.transaction', 'Transaction'),
    cell: (row: BankTransactionRowType) => (
      <BankTransactionDescriptionCell
        bankTransaction={row.original}
        showReceiptUploads={showReceiptUploads}
      />
    ),
  },
  {
    id: BankTransactionColumns.Account,
    header: stringOverrides?.transactionsTable?.accountColumnHeaderText
      || t('common:label.account', 'Account'),
    cell: (row: BankTransactionRowType) => <BankTransactionAccountCell bankTransaction={row.original} />,
  },
  {
    id: BankTransactionColumns.Amount,
    header: stringOverrides?.transactionsTable?.amountColumnHeaderText
      || t('common:label.amount', 'Amount'),
    alignment: Alignment.Right,
    pinning: 'right',
    cell: (row: BankTransactionRowType) => (
      <BankTransactionAmountCell bankTransaction={row.original} />
    ),
  },
  {
    id: BankTransactionColumns.Category,
    header: isCategorizationEnabled && display !== DisplayState.categorized
      ? (stringOverrides?.transactionsTable?.categorizeColumnHeaderText
        || t('common:action.categorize', 'Categorize'))
      : (stringOverrides?.transactionsTable?.categoryColumnHeaderText
        || t('common:label.category', 'Category')),
    pinning: 'right',
    preventRowClick: true,
    cell: (row: BankTransactionRowType) => (
      <BankTransactionActionsCell
        row={row}
        isExpandedRowValid={isExpandedRowValid(row.original.id)}
        stringOverrides={stringOverrides?.bankTransactionCTAs}
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

export const BankTransactionsTable = ({
  isLoading = false,
  bankTransactions,

  showDescriptions,
  showReceiptUploads,
  showTooltips,

  stringOverrides,
  isMonthlyViewMode,
  paginationProps,
}: BankTransactionsTableProps) => {
  const { t } = useTranslation()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const { display, shouldHideAfterCategorize } = useBankTransactionsContext()
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
    showReceiptUploads,
    stringOverrides,
    t,
  }), [
    display,
    isCategorizationEnabled,
    isExpandedRowValid,
    showReceiptUploads,
    stringOverrides,
    t,
  ])

  const expandedRowProps = useMemo<DataTableExpandedRowProps<BankTransaction>>(() => ({
    getRowCanExpand: () => true,
    render: row => (
      <ExpandedBankTransactionRow
        bankTransaction={row.original}
        categorized={isCategorized(row.original)}
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTooltips={showTooltips}
        onValidityChange={isValid => onExpandedRowValidityChange(row.original.id, isValid)}
      />
    ),
  }), [
    onExpandedRowValidityChange,
    showDescriptions,
    showReceiptUploads,
    showTooltips,
  ])

  const withClickableRow = useMemo<ClickableRowProps<BankTransaction>>(() => ({
    isRowClickable: () => true,
    onRowClick: row => row.toggleExpanded(),
  }), [])

  const getRowClassName = useCallback((row: BankTransactionRowType) => (
    classNames(
      'Layer__BankTransactionRow',
      row.getIsExpanded() && 'Layer__BankTransactionRow--expanded',
      row.original.recentlyCategorized && shouldHideAfterCategorize && 'Layer__BankTransactionRow--removing',
    )
  ), [shouldHideAfterCategorize])

  const tableProps = {
    ariaLabel: t('bankTransactions:label.bank_transactions', 'Bank transactions'),
    data: bankTransactions,
    isLoading,
    isError: false,
    columnConfig,
    componentName: COMPONENT_NAME,
    slots: {
      EmptyState: BankTransactionsTableEmptyState,
      ErrorState: BankTransactionsTableErrorState,
    },
    withClickableRow,
    getRowClassName,
    selectionProps,
    expandedRowProps,
  }

  return isMonthlyViewMode
    ? <SimpleDataTable {...tableProps} />
    : <PaginatedTable {...tableProps} paginationProps={paginationProps} />
}
