import useSWRInfinite from 'swr/infinite'
import { useLayerContext } from '../../../../contexts/LayerContext'
import { useAuth } from '../../../../hooks/useAuth'
import { useEnvironment } from '../../../../providers/Environment/EnvironmentInputProvider'
import { get } from '../../../../api/layer/authenticated_http'
import type { JournalEntry } from '../../../../types'
import { useGlobalCacheActions } from '../../../../utils/swr/useGlobalCacheActions'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { toDefinedSearchParameters } from '../../../../utils/request/toDefinedSearchParameters'

export const LIST_LEDGER_ENTRIES_TAG_KEY = '#list-ledger-entries'

type GetLedgerEntriesParams = {
  businessId: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  cursor?: string
  limit?: number
  show_total_count?: boolean
}

type ListLedgerEntriesReturn = {
  data: ReadonlyArray<JournalEntry>
  meta?: {
    pagination: {
      cursor?: string
      has_more: boolean
      total_count?: number
    }
  }
}

export const listLedgerEntries = get<
  ListLedgerEntriesReturn,
  GetLedgerEntriesParams
>(({ businessId, sort_by, sort_order, cursor, limit, show_total_count }) => {
  const parameters = toDefinedSearchParameters({
    sort_by,
    sort_order,
    cursor,
    limit,
    show_total_count,
  })

  return `/v1/businesses/${businessId}/ledger/entries?${parameters}`
})

function keyLoader(
  previousPageData: ListLedgerEntriesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    sort_by,
    sort_order,
    limit,
    show_total_count,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    sort_by?: 'entry_at' | 'entry_number' | 'created_at'
    sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
    limit?: number
    show_total_count?: boolean
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta?.pagination.cursor,
      sort_by,
      sort_order,
      limit,
      show_total_count,
      tags: [LIST_LEDGER_ENTRIES_TAG_KEY],
    } as const
  }
}

export type UseListLedgerEntriesOptions = {
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  limit?: number
  show_total_count?: boolean
}

export function useListLedgerEntries({
  sort_by,
  sort_order,
  limit,
  show_total_count,
}: UseListLedgerEntriesOptions = {}) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWRInfinite(
    (_index, previousPageData: ListLedgerEntriesReturn | null) => keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
        businessId,
        sort_by,
        sort_order,
        limit,
        show_total_count,
      },
    ),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      sort_by,
      sort_order,
      limit,
      show_total_count,
    }) => listLedgerEntries(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          sort_by,
          sort_order,
          cursor,
          limit,
          show_total_count,
        },
      },
    )(),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function useLedgerEntriesInvalidator() {
  const { invalidate } = useGlobalCacheActions()

  const invalidateLedgerEntries = useCallback(
    () => invalidate(tags => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidateLedgerEntries = useMemo(
    () => debounce(
      invalidateLedgerEntries,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateLedgerEntries],
  )

  return {
    invalidateLedgerEntries,
    debouncedInvalidateLedgerEntries,
  }
}

export function useLedgerEntriesOptimisticUpdater() {
  const { optimisticUpdate } = useGlobalCacheActions()

  const optimisticallyUpdateLedgerEntries = useCallback(
    (
      transformJournalEntry: (entry: JournalEntry) => JournalEntry,
    ) =>
      optimisticUpdate<ListLedgerEntriesReturn>(
        tags => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY),
        (currentData) => {
          return {
            ...currentData,
            data: currentData.data.map(entry => transformJournalEntry(entry)),
          }
        },
      ),
    [optimisticUpdate],
  )

  return { optimisticallyUpdateLedgerEntries }
}
