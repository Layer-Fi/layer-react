import { useCallback, useEffect, useState } from 'react'

import { SortOrder } from '@internal-types/utility/pagination'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { LedgerEntriesSortBy, type ListLedgerEntriesReturn, useListLedgerEntries } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useLedgerDateRange } from '@providers/DateStoreProvider/LedgerDateStoreProvider'

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
}

export const useJournal: UseJournal = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })

  // The entry list is filtered by the date range, so a previously selected entry
  // may fall outside the new range and vanish from the list. Clear the selection
  // when the range changes to avoid leaving the detail sidebar open with no entry.
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
    // Changing the date range is a distinct query, not more of the same list, so
    // drop the hook's `keepPreviousData` default: `data` clears and `isLoading`
    // goes true, letting the table show a loading state rather than the previous
    // range's stale entries. `fetchMore` keeps the same key and is unaffected.
    swrOptions: { keepPreviousData: false },
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
  }
}
