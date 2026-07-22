import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Vendor, VendorSchema } from '@schemas/vendor'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

const ListVendorsRawResultSchema = PaginatedResponseSchema(VendorSchema)

type ListVendorsPaginatedParams = {
  businessId: string
  cursor?: string
  limit?: number
  query?: string
}

const listVendors = getWithQuery<
  typeof ListVendorsRawResultSchema.Encoded,
  ListVendorsPaginatedParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/vendors`,
  ({ cursor, limit, query }) => ({
    cursor,
    identityStatus: 'IDENTIFIED',
    limit,
    q: query,
  }),
)

export const VENDORS_TAG_KEY = '#vendors'

export const useListVendors = createInfiniteQueryHook({
  tags: [VENDORS_TAG_KEY],
  request: listVendors,
  schema: ListVendorsRawResultSchema,
  keyDefaults: { limit: 100 },
})

type UseListVendorsParameters = Parameters<typeof useListVendors>[0]

export function usePreloadVendors(parameters?: UseListVendorsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListVendors(parameters)
}

export const useVendorsGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Vendor>(VENDORS_TAG_KEY)
