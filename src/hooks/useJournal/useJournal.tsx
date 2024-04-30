import { useState } from 'react'
import { Layer } from '../../api/layer'
import { JournalEntry, JournalEntryLine } from '../../types/journal'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseJournal = () => {
  data?: JournalEntry[]
  entryData?: JournalEntryLine
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
}

export const useJournal: UseJournal = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId && auth?.access_token && `journal-lines-${businessId}`,
    Layer.getJournal(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
  }
}

export const flattenEntries = (entries: JournalEntry[]): JournalEntry[] =>
  entries
    .flatMap(a => [a, flattenEntries(a.line_items || [])])
    .flat()
    .filter(id => id)
