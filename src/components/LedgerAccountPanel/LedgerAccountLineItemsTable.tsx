import { useCallback, useContext, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { LedgerAccountNodeType } from '@internal-types/chartOfAccounts'
import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerAccountLineItem } from '@schemas/generalLedger/ledgerEntry'
import { decodeLedgerEntrySource } from '@schemas/generalLedger/ledgerEntrySource'
import { Alignment } from '@schemas/reports/unifiedReport'
import { lineEntryNumber } from '@utils/journal'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './ledgerAccountLineItemsTable.scss'

const COMPONENT_NAME = 'LedgerAccountLineItemsTable'

export interface LedgerAccountLineItemsTableStringOverrides {
  dateColumnHeader?: string
  journalIdColumnHeader?: string
  sourceColumnHeader?: string
  accountColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  runningBalanceColumnHeader?: string
}

enum LedgerAccountLineItemColumns {
  Date = 'Date',
  JournalId = 'JournalId',
  Source = 'Source',
  Account = 'Account',
  Debit = 'Debit',
  Credit = 'Credit',
  RunningBalance = 'RunningBalance',
}

type LedgerAccountLineItemRow = Row<LedgerAccountLineItem>

const getColumnConfig = (
  nodeType: LedgerAccountNodeType | undefined,
  stringOverrides: LedgerAccountLineItemsTableStringOverrides | undefined,
  formatDate: ReturnType<typeof useIntlFormatter>['formatDate'],
  t: TFunction,
): NestedColumnConfig<LedgerAccountLineItem> => [
  {
    id: LedgerAccountLineItemColumns.Date,
    header: stringOverrides?.dateColumnHeader ?? t('common:label.date', 'Date'),
    cell: (row: LedgerAccountLineItemRow) => <Span>{formatDate(row.original.date)}</Span>,
  },
  {
    id: LedgerAccountLineItemColumns.JournalId,
    header: stringOverrides?.journalIdColumnHeader ?? t('generalLedger:label.journal_id', 'Journal ID #'),
    cell: (row: LedgerAccountLineItemRow) => <Span>{lineEntryNumber(row.original)}</Span>,
    isRowHeader: true,
  },
  {
    id: LedgerAccountLineItemColumns.Source,
    header: stringOverrides?.sourceColumnHeader ?? t('common:label.source', 'Source'),
    cell: (row: LedgerAccountLineItemRow) => (
      <Span ellipsis withTooltip>
        {(row.original.source ? decodeLedgerEntrySource(row.original.source)?.displayDescription : undefined) ?? ''}
      </Span>
    ),
  },
  ...(nodeType !== LedgerAccountNodeType.Leaf
    ? [{
      id: LedgerAccountLineItemColumns.Account,
      header: stringOverrides?.accountColumnHeader ?? t('common:label.account', 'Account'),
      cell: (row: LedgerAccountLineItemRow) => <Span ellipsis withTooltip>{row.original.account.name}</Span>,
    }]
    : []),
  {
    id: LedgerAccountLineItemColumns.Debit,
    header: stringOverrides?.debitColumnHeader ?? t('common:label.debit', 'Debit'),
    alignment: Alignment.Right,
    cell: (row: LedgerAccountLineItemRow) =>
      (row.original.direction === LedgerEntryDirection.Debit
        ? <MoneySpan amount={row.original.amount} />
        : null),
  },
  {
    id: LedgerAccountLineItemColumns.Credit,
    header: stringOverrides?.creditColumnHeader ?? t('common:label.credit', 'Credit'),
    alignment: Alignment.Right,
    cell: (row: LedgerAccountLineItemRow) =>
      (row.original.direction === LedgerEntryDirection.Credit
        ? <MoneySpan amount={row.original.amount} />
        : null),
  },
  {
    id: LedgerAccountLineItemColumns.RunningBalance,
    header: stringOverrides?.runningBalanceColumnHeader ?? t('generalLedger:label.running_balance', 'Running balance'),
    alignment: Alignment.Right,
    cell: (row: LedgerAccountLineItemRow) => <MoneySpan amount={row.original.runningBalance} />,
  },
]

export interface LedgerAccountLineItemsTableProps {
  pageSize?: number
  stringOverrides?: LedgerAccountLineItemsTableStringOverrides
}

export const LedgerAccountLineItemsTable = ({
  pageSize = 15,
  stringOverrides,
}: LedgerAccountLineItemsTableProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const {
    data,
    isError,
    isLoading,
    isValidating,
    selectedAccount,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    refetch,
    hasMore,
    fetchMore,
  } = useContext(LedgerAccountsContext)

  const nodeType = selectedAccount?.nodeType

  const columnConfig = useMemo(
    () => getColumnConfig(nodeType, stringOverrides, formatDate, t),
    [nodeType, stringOverrides, formatDate, t],
  )

  const paginationProps: TablePaginationProps = useMemo(
    () => ({ pageSize, hasMore, fetchMore }),
    [pageSize, hasMore, fetchMore],
  )

  const withClickableRow = useMemo(() => ({
    isRowClickable: () => true,
    onRowClick: (row: LedgerAccountLineItemRow) => {
      if (selectedEntryId === row.original.entryId) {
        closeSelectedEntry()
      }
      else {
        setSelectedEntryId(row.original.entryId)
      }
    },
  }), [selectedEntryId, setSelectedEntryId, closeSelectedEntry])

  const isRowSelected = useCallback(
    (row: LedgerAccountLineItemRow) => row.original.entryId === selectedEntryId,
    [selectedEntryId],
  )

  const EmptyState = useCallback(() => (
    <DataState
      status={DataStateStatus.info}
      title={t('generalLedger:empty.ledger_activity', 'No ledger activity')}
      description={t('generalLedger:empty.entry_journal_message', 'There are no ledger entries in this account.')}
      spacing
    />
  ), [t])

  const ErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('generalLedger:error.couldnt_load_ledger_entries', 'We couldn’t load ledger entries')}
      description={t('generalLedger:error.load_ledger_entries', 'An error occurred while loading this account’s ledger entries. Please check your connection and try again.')}
      onRefresh={() => { void refetch() }}
      isLoading={isValidating || isLoading}
      spacing
    />
  ), [refetch, isValidating, isLoading, t])

  return (
    <PaginatedTable
      ariaLabel={t('generalLedger:label.ledger_entries', 'Ledger entries')}
      data={data}
      isLoading={Boolean(isLoading)}
      isError={Boolean(isError)}
      columnConfig={columnConfig}
      paginationProps={paginationProps}
      componentName={COMPONENT_NAME}
      withClickableRow={withClickableRow}
      isRowSelected={isRowSelected}
      slots={{ EmptyState, ErrorState }}
    />
  )
}
