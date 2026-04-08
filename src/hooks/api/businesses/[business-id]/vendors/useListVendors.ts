import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseMetaSchema } from '@internal-types/utility/pagination'
import { VendorSchema } from '@schemas/vendor'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const ListVendorsRawResultSchema = Schema.Struct({
  data: Schema.Array(VendorSchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})
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

function keyLoader(
  previousPageData: ListVendorsRawResult | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    query,
    isEnabled,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    query?: string
    isEnabled?: boolean
  },
) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta.pagination.cursor ?? undefined,
      query,
      tags: [VENDORS_TAG_KEY],
    } as const
  }
}

type UseListVendorsParameters = {
  query?: string
  isEnabled?: boolean
}

export function useListVendors({ query, isEnabled = true }: UseListVendorsParameters = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListVendorsRawResult | null) => withLocale(keyLoader(
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

  return new SWRInfiniteResult(swrResponse)
}

export function usePreloadVendors(parameters?: UseListVendorsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListVendors(parameters)
}
