import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { get } from '../../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'
import { Schema, pipe } from 'effect'
import { VendorSchema } from '../../../schemas/vendor'

const ListVendorsRawResultSchema = Schema.Struct({
  data: Schema.Array(VendorSchema),
  meta: Schema.Struct({
    pagination: Schema.Struct({
      cursor: Schema.NullOr(Schema.String),

      hasMore: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('has_more'),
      ),
    }),
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

class ListVendorsSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListVendorsRawResult>

  constructor(swrResponse: SWRInfiniteResponse<ListVendorsRawResult>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseListVendorsParameters = {
  query?: string
  isEnabled?: boolean
}

export function useListVendors({ query, isEnabled = true }: UseListVendorsParameters = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListVendorsRawResult | null) => keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        query,
        isEnabled,
      },
    ),
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

  return new ListVendorsSWRResponse(swrResponse)
}

export function usePreloadVendors(parameters?: UseListVendorsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useListVendors(parameters)
}
