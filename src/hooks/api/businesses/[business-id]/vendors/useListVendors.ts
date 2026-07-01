import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { VendorSchema } from '@schemas/vendor'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const ListVendorsRawResultSchema = PaginatedResponseSchema(VendorSchema)
type ListVendorsRawResult = typeof ListVendorsRawResultSchema.Type

type ListVendorsBaseParams = {
  businessId: string
}
type ListVendorsPaginatedParams = ListVendorsBaseParams & {
  cursor?: string
  limit?: number
  query?: string
}

const listVendors = get<
  Record<string, unknown>,
  ListVendorsPaginatedParams
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

  return `/v1/businesses/${businessId}/vendors?${parameters}`
})

export const VENDORS_TAG_KEY = '#vendors'

const keyLoader = createInfiniteKeyLoader<
  { businessId: string, query?: string },
  ListVendorsRawResult
>([VENDORS_TAG_KEY])

type UseListVendorsParameters = {
  query?: string
  isEnabled?: boolean
}

export function useListVendors({ query, isEnabled = true }: UseListVendorsParameters = {}) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListVendorsRawResult | null) => withLocale(keyLoader(
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
    }) => listVendors(
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
    )().then(Schema.decodeUnknownPromise(ListVendorsRawResultSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export function usePreloadVendors(parameters?: UseListVendorsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListVendors(parameters)
}
