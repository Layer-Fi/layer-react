import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_LEDGER_ENTRIES_TAG_KEY = '#list-ledger-entries'

type GetLedgerEntriesParams = {
  businessId: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  cursor?: string
  limit?: number
  show_total_count?: boolean
}

const ListLedgerEntriesResponseSchema = PaginatedResponseSchema(LedgerEntrySchema)

export type ListLedgerEntriesReturn = typeof ListLedgerEntriesResponseSchema.Type

export const listLedgerEntries = get<
  typeof ListLedgerEntriesResponseSchema.Encoded,
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
      cursor: previousPageData?.meta?.pagination.cursor ?? undefined,
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
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListLedgerEntriesReturn | null) => withLocale(keyLoader(
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
    )),
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
    )().then(Schema.decodeUnknownPromise(ListLedgerEntriesResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return new SWRInfiniteResult(swrResponse)
}

export function useLedgerEntriesCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadLedgerEntries = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadLedgerEntries }
}
