import { useCallback, useState } from 'react'

import { SortOrder } from '@internal-types/utility/pagination'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { post } from '@utils/api/authenticatedHttp'
import { LedgerEntriesSortBy, type ListLedgerEntriesReturn, useListLedgerEntries } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const reverseJournalEntry = post<Record<never, never>>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

type UseJournal = () => {
  data: ReadonlyArray<LedgerEntry> | undefined
  isLoading: boolean
  isValidating: boolean
  isError: boolean
  refetch: () => Promise<ListLedgerEntriesReturn[] | undefined>
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  reverseEntry: (entryId: string) => ReturnType<typeof reverseJournalEntry>
  hasMore: boolean
  fetchMore: () => void
}

export const useJournal: UseJournal = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const {
    flattenedData: data,
    isLoading,
    isValidating,
    isError,
    refetch,
    hasMore,
    fetchMore,
  } = useListLedgerEntries({ sortBy: LedgerEntriesSortBy.EntryAt, sortOrder: SortOrder.DESC, limit: 150 })

  const closeSelectedEntry = useCallback(() => {
    setSelectedEntryId(undefined)
  }, [])

  const reverseEntry = useCallback(async (entryId: string) =>
    reverseJournalEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId },
    }), [apiUrl, auth?.access_token, businessId])

  return {
    data,
    isLoading,
    isValidating,
    isError,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    reverseEntry,
    hasMore,
    fetchMore,
  }
}
