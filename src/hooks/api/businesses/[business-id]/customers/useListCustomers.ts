import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Customer, CustomerSchema } from '@schemas/customer'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCustomersRawResult | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...data,
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

const withUpdatedCustomer = (updated: Customer) =>
  (customer: Customer): Customer => customer.id === updated.id ? updated : customer

export function useCustomersGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchCustomerByKey = useCallback((updatedCustomer: Customer) =>
    patchCache<ListCustomersRawResult[] | ListCustomersRawResult | undefined>(
      ({ tags }) => tags.includes(CUSTOMERS_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListCustomersRawResult): ListCustomersRawResult => ({
          ...page,
          data: page.data.map(withUpdatedCustomer(updatedCustomer)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadCustomers = useCallback(
    () => forceReload(({ tags }) => tags.includes(CUSTOMERS_TAG_KEY)),
    [forceReload],
  )

  return { patchCustomerByKey, forceReloadCustomers }
}
