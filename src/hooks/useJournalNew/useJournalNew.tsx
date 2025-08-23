import { useState, useMemo, useCallback } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'

import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useListLedgerEntries } from '../../features/ledger/entries/api/useListLedgerEntriesNew'
import { LedgerEntry } from '../../schemas/generalLedger/ledgerEntry'

type UseJournal = () => {
  data?: ReadonlyArray<LedgerEntry>
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  reverseEntry: (entryId: string) => ReturnType<typeof Layer.reverseJournalEntry>
  hasMore: boolean
  fetchMore: () => Promise<void>
}

export const useJournal: UseJournal = () => {
  const {
    businessId,
  } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const swrResult = useListLedgerEntries({
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
  })

  const {
    data: paginatedData,
    isLoading,
    isValidating,
    mutate,
    size,
    setSize,
  } = swrResult

  const error: unknown = swrResult.error

  const data = useMemo(() => {
    if (!paginatedData) return undefined

    return paginatedData.flatMap(page => page.data) as ReadonlyArray<LedgerEntry>
  }, [paginatedData])

  const hasMore = useMemo(() => {
    if (paginatedData && paginatedData.length > 0) {
      const lastPage = paginatedData[paginatedData.length - 1]
      return Boolean(
        lastPage.meta?.pagination.cursor
        && lastPage.meta?.pagination.has_more,
      )
    }
    return false
  }, [paginatedData])

  const fetchMore = useCallback(async () => {
    if (hasMore) {
      await setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const refetch = () => {
    void mutate()
  }

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }

  const reverseEntry = async (entryId: string) =>
    Layer.reverseJournalEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId },
    })

  return {
    data,
    isLoading,
    isValidating,
    error,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    reverseEntry,
    hasMore,
    fetchMore,
  }
}
