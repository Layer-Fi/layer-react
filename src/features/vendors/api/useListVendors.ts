import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { get } from '../../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'
import { Schema, pipe } from 'effect'
import { VendorSchema } from '../vendorsSchemas'

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
}

const listVendors = get<
  Record<string, unknown>,
  ListVendorsPaginatedParams
>(({ businessId, cursor, limit }) => {
  const parameters = toDefinedSearchParameters({ cursor, limit })

  return `/v1/businesses/${businessId}/vendors?${parameters}`
})

export const VENDORS_TAG_KEY = '#vendors'

function keyLoader(
  previousPageData: ListVendorsRawResult | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta.pagination.cursor ?? undefined,
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

export function useListVendors() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListVendorsRawResult | null) => keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
      },
    ),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
    }) => listVendors(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 200,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListVendorsRawResultSchema)),
    {
      keepPreviousData: true,
      revalidateAll: true,
      initialSize: 1,
    },
  )

  return new ListVendorsSWRResponse(swrResponse)
}
