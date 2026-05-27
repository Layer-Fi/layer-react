import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseMetaSchema, type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { BankTransactionCounterparty, BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useCallback } from 'react'

export const LIST_COUNTERPARTIES_TAG_KEY = '#list-counterparties'

type ListCounterpartiesBaseParams = {
  businessId: string
}

export type ListCounterpartiesFilterParams = {
  externalIds?: ReadonlyArray<string>
  q?: string
}

enum SortBy {
  Name = 'name',
}

type ListCounterpartiesOptions = ListCounterpartiesFilterParams & PaginationParams & SortParams<SortBy>

type ListCounterpartiesParams = ListCounterpartiesBaseParams & ListCounterpartiesOptions

const ListCounterpartiesReturnSchema = Schema.Struct({
  data: Schema.Array(BankTransactionCounterpartySchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})

type ListCounterpartiesReturn = typeof ListCounterpartiesReturnSchema.Type

class ListCounterpartiesSWRResponse extends SWRInfiniteResult<ListCounterpartiesReturn> {
  get paginationMeta() {
    return this.data && this.data.length > 0 ? this.data[this.data.length - 1].meta.pagination : undefined
  }

  get hasMore() {
    return this.paginationMeta?.hasMore
  }
}

export const listCounterparties = get<
  ListCounterpartiesReturn,
  ListCounterpartiesParams
>(({ businessId, externalIds, q, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
    externalIds,
    q,
    sortBy,
    sortOrder,
    cursor,
    limit,
    showTotalCount,
  })

  const baseUrl = `/v1/businesses/${businessId}/counterparties`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

function keyLoader(
  previousPageData: ListCounterpartiesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    externalIds,
    q,
    sortBy,
    sortOrder,
    limit,
    showTotalCount,
  }: {
    access_token?: string
    apiUrl?: string
  } & Omit<ListCounterpartiesParams, 'cursor'>,
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      externalIds,
      q,
      cursor: previousPageData?.meta?.pagination.cursor,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
      tags: [LIST_COUNTERPARTIES_TAG_KEY],
    } as const
  }
}

export function useListCounterparties({
  externalIds,
  q,
  sortBy = SortBy.Name,
  sortOrder = SortOrder.ASC,
  limit,
  showTotalCount = true,
}: ListCounterpartiesOptions = {}) {
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCounterpartiesReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
        businessId,
        externalIds,
        q,
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
      externalIds,
      q,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
    }) => listCounterparties(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          externalIds,
          q,
          sortBy,
          sortOrder,
          cursor,
          limit,
          showTotalCount,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCounterpartiesReturnSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return new ListCounterpartiesSWRResponse(swrResponse)
}

const withUpdatedCounterparty = (updated: BankTransactionCounterparty) =>
  (rule: BankTransactionCounterparty): BankTransactionCounterparty => rule.id === updated.id ? updated : rule

export function useCounterpartiesGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchCounterpartyByKey = useCallback((updatedCounterparty: BankTransactionCounterparty) =>
    patchCache<ListCounterpartiesReturn[] | ListCounterpartiesReturn | undefined>(
      ({ tags }) => tags.includes(LIST_COUNTERPARTIES_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListCounterpartiesReturn): ListCounterpartiesReturn => ({
          ...page,
          data: page.data.map(withUpdatedCounterparty(updatedCounterparty)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadCounterparties = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_COUNTERPARTIES_TAG_KEY)),
    [forceReload],
  )

  return { patchCounterpartyByKey, forceReloadCounterparties }
}
