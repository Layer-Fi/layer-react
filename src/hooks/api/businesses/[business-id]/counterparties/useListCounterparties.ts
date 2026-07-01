import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

const ListCounterpartiesReturnSchema = PaginatedResponseSchema(BankTransactionCounterpartySchema)

type ListCounterpartiesReturn = typeof ListCounterpartiesReturnSchema.Type

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

  return useSWRInfiniteResult(swrResponse)
}
