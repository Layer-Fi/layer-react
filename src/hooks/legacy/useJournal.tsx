import { useCallback, useState } from 'react'

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
