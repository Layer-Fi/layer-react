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

import './ledgerLineItemsTable.scss'

const COMPONENT_NAME = 'LedgerLineItemsTable'

export interface LedgerLineItemsTableStringOverrides {
  dateColumnHeader?: string
  journalIdColumnHeader?: string
  sourceColumnHeader?: string
  accountColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  runningBalanceColumnHeader?: string
}

enum LedgerLineItemColumns {
  Date = 'Date',
  JournalId = 'JournalId',
  Source = 'Source',
  Account = 'Account',
  Debit = 'Debit',
  Credit = 'Credit',
  RunningBalance = 'RunningBalance',
}

type LedgerLineItemRow = Row<LedgerAccountLineItem>

const getColumnConfig = (
  nodeType: LedgerAccountNodeType | undefined,
  stringOverrides: LedgerLineItemsTableStringOverrides | undefined,
  formatDate: ReturnType<typeof useIntlFormatter>['formatDate'],
  t: TFunction,
): NestedColumnConfig<LedgerAccountLineItem> => [
  {
    id: LedgerLineItemColumns.Date,
    header: stringOverrides?.dateColumnHeader ?? t('common:label.date', 'Date'),
    cell: (row: LedgerLineItemRow) => <Span>{formatDate(row.original.date)}</Span>,
  },
  {
    id: LedgerLineItemColumns.JournalId,
    header: stringOverrides?.journalIdColumnHeader ?? t('generalLedger:label.journal_id', 'Journal ID #'),
    cell: (row: LedgerLineItemRow) => <Span>{lineEntryNumber(row.original)}</Span>,
    isRowHeader: true,
  },
  {
    id: LedgerLineItemColumns.Source,
    header: stringOverrides?.sourceColumnHeader ?? t('common:label.source', 'Source'),
    cell: (row: LedgerLineItemRow) => (
      <Span ellipsis withTooltip>
        {(row.original.source ? decodeLedgerEntrySource(row.original.source)?.displayDescription : undefined) ?? ''}
      </Span>
    ),
  },
  ...(nodeType !== LedgerAccountNodeType.Leaf
    ? [{
      id: LedgerLineItemColumns.Account,
      header: stringOverrides?.accountColumnHeader ?? t('common:label.account', 'Account'),
      cell: (row: LedgerLineItemRow) => <Span ellipsis withTooltip>{row.original.account.name}</Span>,
    }]
    : []),
  {
    id: LedgerLineItemColumns.Debit,
    header: stringOverrides?.debitColumnHeader ?? t('common:label.debit', 'Debit'),
    alignment: Alignment.Right,
    cell: (row: LedgerLineItemRow) =>
      (row.original.direction === LedgerEntryDirection.Debit
        ? <MoneySpan amount={row.original.amount} />
        : null),
  },
  {
    id: LedgerLineItemColumns.Credit,
    header: stringOverrides?.creditColumnHeader ?? t('common:label.credit', 'Credit'),
    alignment: Alignment.Right,
    cell: (row: LedgerLineItemRow) =>
      (row.original.direction === LedgerEntryDirection.Credit
        ? <MoneySpan amount={row.original.amount} />
        : null),
  },
  {
    id: LedgerLineItemColumns.RunningBalance,
    header: stringOverrides?.runningBalanceColumnHeader ?? t('generalLedger:label.running_balance', 'Running balance'),
    alignment: Alignment.Right,
    cell: (row: LedgerLineItemRow) => <MoneySpan amount={row.original.runningBalance} />,
  },
]

export interface LedgerLineItemsTableProps {
  pageSize?: number
  stringOverrides?: LedgerLineItemsTableStringOverrides
}

export const LedgerLineItemsTable = ({
  pageSize = 15,
  stringOverrides,
}: LedgerLineItemsTableProps) => {
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
    onRowClick: (row: LedgerLineItemRow) => {
      if (selectedEntryId === row.original.entryId) {
        closeSelectedEntry()
      }
      else {
        setSelectedEntryId(row.original.entryId)
      }
    },
  }), [selectedEntryId, setSelectedEntryId, closeSelectedEntry])

  const isRowSelected = useCallback(
    (row: LedgerLineItemRow) => row.original.entryId === selectedEntryId,
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
