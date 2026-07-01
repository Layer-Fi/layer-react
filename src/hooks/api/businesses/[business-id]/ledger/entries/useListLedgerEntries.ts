import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type SortOrder } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_LEDGER_ENTRIES_TAG_KEY = '#list-ledger-entries'

export enum LedgerEntriesSortBy {
  EntryAt = 'entry_at',
  EntryNumber = 'entry_number',
  CreatedAt = 'created_at',
}

type GetLedgerEntriesParams = {
  businessId: string
  sortBy?: LedgerEntriesSortBy
  sortOrder?: SortOrder
  cursor?: string
  limit?: number
  showTotalCount?: boolean
}

const ListLedgerEntriesResponseSchema = PaginatedResponseSchema(LedgerEntrySchema)

export type ListLedgerEntriesReturn = typeof ListLedgerEntriesResponseSchema.Type

export const listLedgerEntries = get<
  typeof ListLedgerEntriesResponseSchema.Encoded,
  GetLedgerEntriesParams
>(({ businessId, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
    sortBy,
    sortOrder,
    cursor,
    limit,
    showTotalCount,
  })

  return `/v1/businesses/${businessId}/ledger/entries?${parameters}`
})

const keyLoader = createInfiniteKeyLoader<
  UseListLedgerEntriesOptions & { businessId: string },
  ListLedgerEntriesReturn
>([LIST_LEDGER_ENTRIES_TAG_KEY])

export type UseListLedgerEntriesOptions = {
  sortBy?: LedgerEntriesSortBy
  sortOrder?: SortOrder
  limit?: number
  showTotalCount?: boolean
}

export function useListLedgerEntries({
  sortBy,
  sortOrder,
  limit,
  showTotalCount,
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
        sortBy,
        sortOrder,
        limit,
        showTotalCount,
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
    }) => listLedgerEntries(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          sortBy,
          sortOrder,
          cursor,
          limit,
          showTotalCount,
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

  return useSWRInfiniteResult(swrResponse)
}

export function useLedgerEntriesCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadLedgerEntries = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadLedgerEntries }
}
