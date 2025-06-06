import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { get } from '../../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'
import { Schema, pipe } from 'effect'
import { CustomerSchema } from '../customersSchemas'

const ListCustomersRawResultSchema = Schema.Struct({
  data: Schema.Array(CustomerSchema),
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
type ListCustomersRawResult = typeof ListCustomersRawResultSchema.Type

type ListCustomersBaseParams = {
  businessId: string
}
type ListCustomersPaginatedParams = ListCustomersBaseParams & {
  cursor?: string
  limit?: number
}

const listCustomers = get<
  Record<string, unknown>,
  ListCustomersPaginatedParams
>(({ businessId, cursor, limit }) => {
  const parameters = toDefinedSearchParameters({ cursor, limit })

  return `/v1/businesses/${businessId}/customers?${parameters}`
})

export const CUSTOMERS_TAG_KEY = '#customers'

function keyLoader(
  previousPageData: ListCustomersRawResult | null,
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
      tags: [CUSTOMERS_TAG_KEY],
    } as const
  }
}

class ListCustomersSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListCustomersRawResult>

  constructor(swrResponse: SWRInfiniteResponse<ListCustomersRawResult>) {
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

export function useListCustomers() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCustomersRawResult | null) => keyLoader(
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
    }) => listCustomers(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 200,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCustomersRawResultSchema)),
    {
      keepPreviousData: true,
      revalidateAll: true,
      initialSize: 1,
    },
  )

  return new ListCustomersSWRResponse(swrResponse)
}
