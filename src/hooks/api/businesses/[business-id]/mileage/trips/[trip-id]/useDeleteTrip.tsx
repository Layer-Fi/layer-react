import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useMileageSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const DELETE_TRIP_TAG_KEY = '#delete-trip'

const deleteTrip = del<
  Record<string, never>,
  { businessId: string, tripId: string }
>(({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`)

const buildKey = createBuildKey<{ businessId: string, tripId: string }>([DELETE_TRIP_TAG_KEY])

type UseDeleteTripProps = {
  tripId: string
}

export const useDeleteTrip = ({ tripId }: UseDeleteTripProps) => {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
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
