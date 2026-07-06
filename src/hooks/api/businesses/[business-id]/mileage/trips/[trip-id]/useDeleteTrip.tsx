import { useCallback } from 'react'

import { del } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useMileageSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_TRIP_TAG_KEY = '#delete-trip'

const deleteTrip = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, tripId: string }
>(({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`)

const useDeleteTripMutation = createMutationHook({
  tags: [DELETE_TRIP_TAG_KEY],
  request: deleteTrip,
  keyParams: ['tripId'],
  argToBody: (_arg: never) => undefined,
  swrOptions: { throwOnError: true },
})

type UseDeleteTripProps = {
  tripId: string
}

export const useDeleteTrip = ({ tripId }: UseDeleteTripProps) => {
  const mutationResponse = useDeleteTripMutation({ tripId })

  const { forceReload: forceReloadTrips } = useTripsGlobalCacheActions()
  const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()
  const { invalidate: invalidateMileageSummary } = useMileageSummaryGlobalCacheActions()

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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
