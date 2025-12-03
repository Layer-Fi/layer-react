import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { del } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useTripsGlobalCacheActions } from '@features/trips/api/useListTrips'
import { useVehiclesGlobalCacheActions } from '@features/vehicles/api/useListVehicles'

const DELETE_TRIP_TAG_KEY = '#delete-trip'

const deleteTrip = del<
  Record<string, never>,
  { businessId: string, tripId: string }
>(({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  tripId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  tripId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tripId,
      tags: [DELETE_TRIP_TAG_KEY],
    } as const
  }
}

type DeleteTripSWRMutationResponse =
    SWRMutationResponse<Record<string, never>, unknown, Key, never>

class DeleteTripSWRResponse {
  private swrResponse: DeleteTripSWRMutationResponse

  constructor(swrResponse: DeleteTripSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseDeleteTripProps = {
  tripId: string
}

export const useDeleteTrip = ({ tripId }: UseDeleteTripProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      tripId,
    }),
    (
      { accessToken, apiUrl, businessId, tripId },
    ) => {
      return deleteTrip(
        apiUrl,
        accessToken,
        { params: { businessId, tripId } },
      )
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new DeleteTripSWRResponse(rawMutationResponse)

  const { forceReloadTrips } = useTripsGlobalCacheActions()
  const { forceReloadVehicles } = useVehiclesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadTrips()
      void forceReloadVehicles()

      return triggerResult
    },
    [originalTrigger, forceReloadTrips, forceReloadVehicles],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
