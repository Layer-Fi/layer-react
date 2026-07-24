import { useCallback, useEffect, useState } from 'react'

import { SortOrder } from '@internal-types/utility/pagination'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { LedgerEntriesSortBy, type ListLedgerEntriesReturn, useListLedgerEntries } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useLedgerDateRange } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { type TablePaginationProps } from '@blocks/PaginatedDataTable/PaginatedDataTable'

export const JOURNAL_PAGE_SIZE = 15

type UseJournal = () => {
  data: ReadonlyArray<LedgerEntry> | undefined
  isLoading: boolean
  isValidating: boolean
  isError: boolean
  refetch: () => Promise<ListLedgerEntriesReturn[] | undefined>
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  hasMore: boolean
  fetchMore: () => void
  paginationProps: TablePaginationProps
}

export const useJournal: UseJournal = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const dateRange = useLedgerDateRange({ dateSelectionMode: 'full' })
  const { startDate, endDate } = dateRange

  useEffect(() => {
    setSelectedEntryId(undefined)
  }, [startDate, endDate])

  const {
    flattenedData: data,
    isLoading,
    isValidating,
    isError,
    refetch,
    hasMore,
    fetchMore,
  } = useListLedgerEntries({
    sortBy: LedgerEntriesSortBy.EntryAt,
    sortOrder: SortOrder.DESC,
    limit: 150,
    startDate,
    endDate,
    swrOptions: { keepPreviousData: false },
  })

  const paginationProps = useTablePaginationProps({
    filterParams: dateRange,
    data,
    pageSize: JOURNAL_PAGE_SIZE,
    hasMore,
    fetchMore,
  })

  const closeSelectedEntry = useCallback(() => {
    setSelectedEntryId(undefined)
  }, [])

  return {
    data,
    isLoading,
    isValidating,
    isError,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    hasMore,
    fetchMore,
    paginationProps,
  }
}
