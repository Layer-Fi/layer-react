import { useCallback } from 'react'

import { del } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_VEHICLE_TAG_KEY = '#delete-vehicle'

const deleteVehicle = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`)

const useDeleteVehicleMutation = createMutationHook({
  tags: [DELETE_VEHICLE_TAG_KEY],
  request: deleteVehicle,
  keyParamNames: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  swrOptions: { throwOnError: true },
})

type UseDeleteVehicleProps = {
  vehicleId: string
}

export const useDeleteVehicle = ({ vehicleId }: UseDeleteVehicleProps) => {
  const mutationResponse = useDeleteVehicleMutation({ vehicleId })

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
