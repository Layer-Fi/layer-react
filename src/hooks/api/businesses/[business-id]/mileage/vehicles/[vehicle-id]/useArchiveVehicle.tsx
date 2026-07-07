import { useCallback } from 'react'

import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_VEHICLE_TAG_KEY = '#archive-vehicle'

const ArchiveVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const archiveVehicle = post<
  typeof ArchiveVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/archive`)

const useArchiveVehicleMutation = createMutationHook({
  tags: [ARCHIVE_VEHICLE_TAG_KEY],
  request: archiveVehicle,
  keyParams: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  schema: ArchiveVehicleReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseArchiveVehicleProps = {
  vehicleId: string
}

export const useArchiveVehicle = ({ vehicleId }: UseArchiveVehicleProps) => {
  const mutationResponse = useArchiveVehicleMutation({ vehicleId })

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
