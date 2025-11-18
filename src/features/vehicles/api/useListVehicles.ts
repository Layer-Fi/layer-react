import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { VehicleSchema } from '@schemas/vehicle'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type ListVehiclesParams = {
  businessId: string
}

const ListVehiclesResponseSchema = Schema.Struct({
  data: Schema.Array(VehicleSchema),
})

type ListVehiclesResponse = typeof ListVehiclesResponseSchema.Type
type ListVehiclesResponseEncoded = typeof ListVehiclesResponseSchema.Encoded

const listVehicles = get<
  ListVehiclesResponseEncoded,
  ListVehiclesParams
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/mileage/vehicles`
})

export const VEHICLES_TAG_KEY = '#list-vehicles'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  query,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  query?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      query,
      tags: [VEHICLES_TAG_KEY],
    } as const
  }
}

class ListVehiclesSWRResponse {
  private swrResponse: SWRResponse<ListVehiclesResponse>

  constructor(swrResponse: SWRResponse<ListVehiclesResponse>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data?.data
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

export function useListVehicles() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => listVehicles(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListVehiclesResponseSchema)),
  )

  return new ListVehiclesSWRResponse(response)
}
