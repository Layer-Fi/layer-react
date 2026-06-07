import { useCallback, useMemo, useState } from 'react'

import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { post } from '@utils/api/authenticatedHttp'
import { type ListLedgerEntriesReturn, useListLedgerEntries } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const reverseJournalEntry = post<Record<never, never>>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

type UseJournal = () => {
  data?: ReadonlyArray<LedgerEntry>
  isLoading?: boolean
  isValidating?: boolean
  isError?: boolean
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
    data: paginatedData,
    isLoading,
    isValidating,
    isError,
    mutate,
    size,
    setSize,
  } = useListLedgerEntries({
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
  })

  const data = useMemo(() => {
    if (!paginatedData) return undefined

    return paginatedData.flatMap(page => page.data)
  }, [paginatedData])

  const hasMore = useMemo(() => {
    if (paginatedData && paginatedData.length > 0) {
      const lastPage = paginatedData[paginatedData.length - 1]
      return Boolean(
        lastPage.meta?.pagination.cursor
        && lastPage.meta?.pagination.hasMore,
      )
    }
    return false
  }, [paginatedData])

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const refetch = useCallback(() => mutate(), [mutate])

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
