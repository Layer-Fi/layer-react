import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Customer, CustomerSchema } from '@schemas/customer'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const ListCustomersRawResultSchema = PaginatedResponseSchema(CustomerSchema)
type ListCustomersRawResult = typeof ListCustomersRawResultSchema.Type

type ListCustomersBaseParams = {
  businessId: string
  query?: string
}

type ListCustomersPaginatedParams = ListCustomersBaseParams & {
  cursor?: string
  limit?: number
}

const listCustomers = get<
  Record<string, unknown>,
  ListCustomersPaginatedParams
>(({
  businessId,
  cursor,
  limit,
  query,
}) => {
  const parameters = toDefinedSearchParameters({
    cursor,
    identityStatus: 'IDENTIFIED',
    limit,
    q: query,
  })

  return `/v1/businesses/${businessId}/customers?${parameters}`
})

export const CUSTOMERS_TAG_KEY = '#customers'

const keyLoader = createInfiniteKeyLoader<
  { businessId: string, query?: string },
  ListCustomersRawResult
>([CUSTOMERS_TAG_KEY])

type UseListCustomersParams = {
  query?: string
  isEnabled?: boolean
}

export function useListCustomers({ query, isEnabled = true }: UseListCustomersParams = {}) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCustomersRawResult | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        query,
        isEnabled,
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      query,
    }) => listCustomers(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 100,
          query,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCustomersRawResultSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export function usePreloadCustomers(parameters?: UseListCustomersParams) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListCustomers(parameters)
}

export const useCustomersGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Customer>(CUSTOMERS_TAG_KEY)
