import { useCallback, useContext, useMemo, useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { Alignment } from '@schemas/reports/unifiedReport'
import { humanizeEnum } from '@utils/format'
import { entryNumber, sumLineItemAmountsByDirection } from '@utils/journal'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { type ClickableRowProps } from '@components/DataTable/DataTable'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { type JournalTableStringOverrides } from '@components/JournalTable/JournalTableWithPanel'
import { Pagination } from '@components/Pagination/Pagination'

import './journalTable.scss'

const COMPONENT_NAME = 'JournalTable'
const PAGE_SIZE = 15

type LedgerEntryLineItem = LedgerEntry['lineItems'][number]

/**
 * The journal renders two heterogeneous row shapes — a ledger entry and its line
 * items — but TanStack requires parent and child rows to share a type, so we model
 * them as a discriminated union and branch per `kind` in each cell renderer.
 */
type JournalRow =
  | { kind: 'entry', entry: LedgerEntry }
  | { kind: 'lineItem', lineItem: LedgerEntryLineItem, parentId: string }

const getSubRows = (row: JournalRow): JournalRow[] | undefined =>
  row.kind === 'entry' && row.entry.lineItems.length > 0
    ? row.entry.lineItems.map(lineItem => ({ kind: 'lineItem' as const, lineItem, parentId: row.entry.id }))
    : undefined

const getRowId = (row: JournalRow): string =>
  row.kind === 'entry' ? `journal-row-${row.entry.id}` : `journal-lineitem-${row.lineItem.id}`

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
  } = useContext(JournalContext)

  const { accountingConfiguration } = useLayerContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers

  const [currentPage, setCurrentPage] = useState(1)

  const pageData = useMemo(
    () => {
      if (!rawData) return undefined

      const firstPageIndex = (currentPage - 1) * PAGE_SIZE
      return rawData.slice(firstPageIndex, firstPageIndex + PAGE_SIZE)
    },
    [rawData, currentPage],
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (rawData) {
      const requestedItemIndex = (page - 1) * PAGE_SIZE + PAGE_SIZE - 1
      if (requestedItemIndex > rawData.length - 1 && hasMore) {
        fetchMore()
      }
    }
  }

  // ConditionalList renders the loading skeleton ahead of existing rows, so only
  // flag loading on the initial fetch — background validation/pagination keeps
  // the current page visible (SWR retains previous data).
  const isInitialLoading = !!isLoading && !rawData
  const hasEntries = !!rawData?.length

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

  const rows = useMemo<JournalRow[] | undefined>(
    () => pageData?.map(entry => ({ kind: 'entry' as const, entry })),
    [pageData],
  )

  const columnConfig = useMemo<NestedColumnConfig<JournalRow>>(() => {
    const accountNumberColumn = enableAccountNumbers
      ? [{
        id: 'accountNumber',
        header: stringOverrides?.accountNumberColumnHeader || t('generalLedger:label.account_number', 'Account Number'),
        cell: (row: Row<JournalRow>) =>
          row.original.kind === 'lineItem'
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
          row.original.kind === 'entry' ? <Span>{entryNumber(row.original.entry)}</Span> : null,
      },
      {
        id: 'date',
        header: stringOverrides?.dateColumnHeader || t('common:label.date', 'Date'),
        cell: (row: Row<JournalRow>) =>
          row.original.kind === 'entry' ? <Span>{formatDate(row.original.entry.entryAt)}</Span> : null,
      },
      {
        id: 'transaction',
        header: stringOverrides?.transactionColumnHeader || t('common:label.transaction', 'Transaction'),
        cell: (row: Row<JournalRow>) =>
          row.original.kind === 'entry' ? <Span>{humanizeEnum(row.original.entry.entryType ?? '')}</Span> : null,
      },
      ...accountNumberColumn,
      {
        id: 'account',
        header: stringOverrides?.accountColumnHeader || t('generalLedger:label.account_name_title_case', 'Account Name'),
        cell: (row: Row<JournalRow>) =>
          row.original.kind === 'entry'
            ? <Span>{`(${row.original.entry.lineItems.length})`}</Span>
            : <Span>{row.original.lineItem.account.name}</Span>,
      },
      {
        id: 'debit',
        header: stringOverrides?.debitColumnHeader || t('common:label.debit', 'Debit'),
        alignment: Alignment.Right,
        cell: (row: Row<JournalRow>) => renderAmountCell(row, LedgerEntryDirection.Debit),
      },
      {
        id: 'credit',
        header: stringOverrides?.creditColumnHeader || t('common:label.credit', 'Credit'),
        alignment: Alignment.Right,
        cell: (row: Row<JournalRow>) => renderAmountCell(row, LedgerEntryDirection.Credit),
      },
    ]
  }, [enableAccountNumbers, stringOverrides, t, formatDate])

  const withClickableRow = useMemo<ClickableRowProps<JournalRow>>(() => ({
    isRowClickable: row => row.original.kind === 'entry',
    onRowClick: (row) => {
      if (row.original.kind !== 'entry') return

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
      row.original.kind === 'entry'
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
        isLoading={isInitialLoading}
        isError={!!isError}
        slots={slots}
        getSubRows={getSubRows}
        getRowId={getRowId}
        withClickableRow={withClickableRow}
        isRowSelected={isRowSelected}
      />

      {hasEntries && (
        <Pagination
          currentPage={currentPage}
          totalCount={rawData?.length || 0}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      )}
    </>
  )
}

const renderAmountCell = (row: Row<JournalRow>, direction: LedgerEntryDirection) => {
  if (row.original.kind === 'entry') {
    return (
      <MoneySpan amount={Math.abs(sumLineItemAmountsByDirection(row.original.entry.lineItems, direction))} />
    )
  }

  const { lineItem } = row.original
  return lineItem.direction === direction && lineItem.amount >= 0
    ? <MoneySpan amount={lineItem.amount} />
    : null
}
