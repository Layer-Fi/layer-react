import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useMileageSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

type UseDeleteTripProps = {
  tripId: string
}

export const useDeleteTrip = ({ tripId }: UseDeleteTripProps) => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      tripId,
    })),
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

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { forceReloadTrips } = useTripsGlobalCacheActions()
  const { forceReloadVehicles } = useVehiclesGlobalCacheActions()
  const { invalidateMileageSummary } = useMileageSummaryGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadTrips()
      void forceReloadVehicles()

      // Deleting a trip may change our mileage summary
      void invalidateMileageSummary()

      return triggerResult
    },
    [originalTrigger, forceReloadTrips, forceReloadVehicles, invalidateMileageSummary],
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
