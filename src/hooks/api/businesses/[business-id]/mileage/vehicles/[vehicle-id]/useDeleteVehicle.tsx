import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const DELETE_VEHICLE_TAG_KEY = '#delete-vehicle'

const deleteVehicle = del<
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`)

const buildKey = createBuildKey<{ businessId: string, vehicleId: string }>([DELETE_VEHICLE_TAG_KEY])

type UseDeleteVehicleProps = {
  vehicleId: string
}

export const useDeleteVehicle = ({ vehicleId }: UseDeleteVehicleProps) => {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      vehicleId,
    })),
    (
      { accessToken, apiUrl, businessId, vehicleId },
    ) => {
      return deleteVehicle(
        apiUrl,
        accessToken,
        { params: { businessId, vehicleId } },
      )
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadVehicles()

      return triggerResult
    },
    [originalTrigger, forceReloadVehicles],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
