import { useCallback, useContext, useLayoutEffect, useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { Alignment } from '@schemas/reports/unifiedReport'
import { humanizeEnum } from '@utils/format'
import { entryNumber, sumLineItemAmountsByDirection } from '@utils/journal'
import { JOURNAL_PAGE_SIZE } from '@hooks/legacy/useJournal'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type ClickableRowProps } from '@components/DataTable/DataTable'
import { type ColumnConfig } from '@components/DataTable/utils/column'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext, ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { type JournalTableStringOverrides } from '@components/JournalTable/JournalTableWithPanel'
import { Pagination } from '@components/Pagination/Pagination'

import './journalTable.scss'

const COMPONENT_NAME = 'JournalTable'

const EMPTY_ENTRIES: ReadonlyArray<LedgerEntry> = []

type LedgerEntryLineItem = LedgerEntry['lineItems'][number]

/**
 * The journal renders two heterogeneous row shapes — a ledger entry and its line
 * items — but TanStack requires parent and child rows to share a type, so we model
 * them as a discriminated union keyed on `kind`.
 */
type EntryRow = { kind: 'entry', entry: LedgerEntry }
type LineItemRow = { kind: 'lineItem', lineItem: LedgerEntryLineItem, parentId: string }
type JournalRow = EntryRow | LineItemRow

const isEntryRow = (row: JournalRow): row is EntryRow => row.kind === 'entry'
const isLineItemRow = (row: JournalRow): row is LineItemRow => row.kind === 'lineItem'

const getSubRows = (row: JournalRow): JournalRow[] | undefined =>
  isEntryRow(row) && row.entry.lineItems.length > 0
    ? row.entry.lineItems.map(lineItem => ({ kind: 'lineItem' as const, lineItem, parentId: row.entry.id }))
    : undefined

const getRowId = (row: JournalRow): string =>
  isEntryRow(row) ? `journal-row-${row.entry.id}` : `journal-lineitem-${row.lineItem.id}`

type JournalTableProps = {
  stringOverrides?: JournalTableStringOverrides
}

export const JournalTable = (props: JournalTableProps) => (
  <ExpandableDataTableProvider defaultExpanded>
    <JournalTableContent {...props} />
  </ExpandableDataTableProvider>
)

const JournalTableContent = ({
  stringOverrides,
}: JournalTableProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const {
    data: rawData,
    isLoading,
    isError,
    isValidating,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    hasMore,
    fetchMore,
    paginationProps,
  } = useContext(JournalContext)

  const { accountingConfiguration } = useLayerContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers

  const { setExpanded } = useContext(ExpandableDataTableContext)

  const entries = rawData ?? EMPTY_ENTRIES

  // `useJournal` supplies pageSize + the reset-on-filter-change ref (it owns the
  // date-range filter and the data); the page index itself lives here in the
  // list. See the same shape in TimeEntries.
  const { pageSize = JOURNAL_PAGE_SIZE, autoResetPageIndexRef } = paginationProps

  const { pageItems, pageIndex, onPageChange } = usePaginatedList({
    data: entries,
    pageSize,
    autoResetPageIndexRef,
  })

  // Re-expand every row on page change. Once a row is collapsed, TanStack rewrites
  // `expanded: true` into a per-row map covering only the current page's slice, so
  // the next page would render collapsed without this reset.
  useLayoutEffect(() => {
    setExpanded(true)
  }, [pageIndex, setExpanded])

  const hasEntries = entries.length > 0

  const slots = useMemo(() => ({
    EmptyState: () => (
      <DataState
        status={DataStateStatus.allDone}
        title={t('generalLedger:empty.entries', 'No entries found')}
        description={t('generalLedger:label.entry_journal', 'There are no entries in the journal.')}
      />
    ),
    ErrorState: () => (
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
        onRefresh={() => { void refetch() }}
        isLoading={isValidating || isLoading}
      />
    ),
  }), [t, refetch, isValidating, isLoading])

  const rows = useMemo<JournalRow[]>(
    () => pageItems.map(entry => ({ kind: 'entry' as const, entry })),
    [pageItems],
  )

  const columnConfig = useMemo<ColumnConfig<JournalRow>>(() => {
    const accountNumberColumn = enableAccountNumbers
      ? [{
        id: 'accountNumber',
        header: stringOverrides?.accountNumberColumnHeader || t('generalLedger:label.account_number', 'Account Number'),
        cell: (row: Row<JournalRow>) =>
          isLineItemRow(row.original)
            ? <Span ellipsis>{row.original.lineItem.account.accountNumber}</Span>
            : null,
      }]
      : []

    return [
      {
        id: 'id',
        header: stringOverrides?.idColumnHeader || t('common:label.id', 'Id'),
        isRowHeader: true,
        cell: (row: Row<JournalRow>) =>
          isEntryRow(row.original) ? <Span>{entryNumber(row.original.entry)}</Span> : null,
      },
      {
        id: 'date',
        header: stringOverrides?.dateColumnHeader || t('common:label.date', 'Date'),
        cell: (row: Row<JournalRow>) =>
          isEntryRow(row.original) ? <Span>{formatDate(row.original.entry.entryAt)}</Span> : null,
      },
      {
        id: 'transaction',
        header: stringOverrides?.transactionColumnHeader || t('common:label.transaction', 'Transaction'),
        cell: (row: Row<JournalRow>) =>
          isEntryRow(row.original) ? <Span>{humanizeEnum(row.original.entry.entryType ?? '')}</Span> : null,
      },
      ...accountNumberColumn,
      {
        id: 'account',
        header: stringOverrides?.accountColumnHeader || t('generalLedger:label.account_name_title_case', 'Account Name'),
        cell: (row: Row<JournalRow>) =>
          isEntryRow(row.original)
            ? <Span>{`(${row.original.entry.lineItems.length})`}</Span>
            : <Span>{row.original.lineItem.account.name}</Span>,
      },
      {
        id: 'debit',
        header: stringOverrides?.debitColumnHeader || t('common:label.debit', 'Debit'),
        alignment: Alignment.Right,
        cell: (row: Row<JournalRow>) => <AmountCell row={row} direction={LedgerEntryDirection.Debit} />,
      },
      {
        id: 'credit',
        header: stringOverrides?.creditColumnHeader || t('common:label.credit', 'Credit'),
        alignment: Alignment.Right,
        cell: (row: Row<JournalRow>) => <AmountCell row={row} direction={LedgerEntryDirection.Credit} />,
      },
    ]
  }, [enableAccountNumbers, stringOverrides, t, formatDate])

  const withClickableRow = useMemo<ClickableRowProps<JournalRow>>(() => ({
    isRowClickable: row => isEntryRow(row.original),
    onRowClick: (row) => {
      if (!isEntryRow(row.original)) return

      const { id } = row.original.entry
      if (selectedEntryId === id) {
        closeSelectedEntry()
      }
      else {
        setSelectedEntryId(id)
      }
    },
  }), [selectedEntryId, setSelectedEntryId, closeSelectedEntry])

  const isRowSelected = useCallback(
    (row: Row<JournalRow>) =>
      isEntryRow(row.original)
        ? row.original.entry.id === selectedEntryId
        : row.original.parentId === selectedEntryId,
    [selectedEntryId],
  )

  return (
    <>
      <ExpandableDataTable<JournalRow>
        componentName={COMPONENT_NAME}
        ariaLabel={t('generalLedger:label.journal', 'Journal')}
        columnConfig={columnConfig}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        slots={slots}
        getSubRows={getSubRows}
        getRowId={getRowId}
        withClickableRow={withClickableRow}
        isRowSelected={isRowSelected}
      />

      {hasEntries && (
        <Pagination
          currentPage={pageIndex + 1}
          totalCount={entries.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      )}
    </>
  )
}

const AmountCell = ({ row, direction }: { row: Row<JournalRow>, direction: LedgerEntryDirection }) => {
  if (isEntryRow(row.original)) {
    return (
      <MoneySpan amount={Math.abs(sumLineItemAmountsByDirection(row.original.entry.lineItems, direction))} />
    )
  }

  const { lineItem } = row.original
  return lineItem.direction === direction && lineItem.amount >= 0
    ? <MoneySpan amount={lineItem.amount} />
    : null
}
