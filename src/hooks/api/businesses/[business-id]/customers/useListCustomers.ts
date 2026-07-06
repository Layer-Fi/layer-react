import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Customer, CustomerSchema } from '@schemas/customer'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

const ListCustomersRawResultSchema = PaginatedResponseSchema(CustomerSchema)

type ListCustomersPaginatedParams = {
  businessId: string
  query?: string
  cursor?: string
  limit?: number
}

const listCustomers = getWithQuery<
  typeof ListCustomersRawResultSchema.Encoded,
  ListCustomersPaginatedParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/customers`,
  ({ cursor, limit, query }) => ({
    cursor,
    identityStatus: 'IDENTIFIED',
    limit,
    q: query,
  }),
)

export const CUSTOMERS_TAG_KEY = '#customers'

export const useListCustomers = createInfiniteQueryHook({
  tags: [CUSTOMERS_TAG_KEY],
  request: listCustomers,
  schema: ListCustomersRawResultSchema,
  keyDefaults: { limit: 100 },
})

type UseListCustomersParams = Parameters<typeof useListCustomers>[0]

export function usePreloadCustomers(parameters?: UseListCustomersParams) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListCustomers(parameters)
}

export const useCustomersGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Customer>(CUSTOMERS_TAG_KEY)
