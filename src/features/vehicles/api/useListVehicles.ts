import useSWR, { type SWRResponse } from 'swr'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { get } from '@api/layer/authenticated_http'
import { type VehicleEncoded } from '@schemas/vehicle'

type ListVehiclesParams = {
  businessId: string
}

const listVehicles = get<
  { data: ReadonlyArray<VehicleEncoded> },
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
  private swrResponse: SWRResponse<{ data: ReadonlyArray<VehicleEncoded> }>

  constructor(swrResponse: SWRResponse<{ data: ReadonlyArray<VehicleEncoded> }>) {
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
    )(),
  )

  return new ListVehiclesSWRResponse(response)
}
