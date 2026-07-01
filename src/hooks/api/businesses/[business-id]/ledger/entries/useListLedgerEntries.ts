import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type SortOrder } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type LedgerEntry, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListLedgerEntriesReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
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

export const useLedgerEntriesCacheActions = createInfiniteQueryGlobalCacheActions<LedgerEntry>(LIST_LEDGER_ENTRIES_TAG_KEY)
