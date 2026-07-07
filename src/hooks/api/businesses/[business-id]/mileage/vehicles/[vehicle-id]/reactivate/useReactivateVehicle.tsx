import { useCallback } from 'react'

import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REACTIVATE_VEHICLE_TAG_KEY = '#reactivate-vehicle'

const ReactivateVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const reactivateVehicle = post<
  typeof ReactivateVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/reactivate`)

const useReactivateVehicleMutation = createMutationHook({
  tags: [REACTIVATE_VEHICLE_TAG_KEY],
  request: reactivateVehicle,
  keyParams: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  schema: ReactivateVehicleReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseReactivateVehicleProps = {
  vehicleId: string
}

export const useReactivateVehicle = ({ vehicleId }: UseReactivateVehicleProps) => {
  const mutationResponse = useReactivateVehicleMutation({ vehicleId })

  const { patchByKey: patchVehicleByKey } = useVehiclesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchVehicleByKey(triggerResult)

      return triggerResult
    },
    [originalTrigger, patchVehicleByKey],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
