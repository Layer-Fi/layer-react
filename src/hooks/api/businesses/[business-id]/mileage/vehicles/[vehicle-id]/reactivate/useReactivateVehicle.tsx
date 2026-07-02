import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const REACTIVATE_VEHICLE_TAG_KEY = '#reactivate-vehicle'

const ReactivateVehicleReturnSchema = Schema.Struct({
  data: VehicleSchema,
})

type ReactivateVehicleReturn = typeof ReactivateVehicleReturnSchema.Type

const reactivateVehicle = post<
  ReactivateVehicleReturn,
  never,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/reactivate`)

const buildKey = createBuildKey<{ businessId: string, vehicleId: string }>([REACTIVATE_VEHICLE_TAG_KEY])

type UseReactivateVehicleProps = {
  vehicleId: string
}

export const useReactivateVehicle = ({ vehicleId }: UseReactivateVehicleProps) => {
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
      return reactivateVehicle(
        apiUrl,
        accessToken,
        { params: { businessId, vehicleId } },
      ).then(Schema.decodeUnknownPromise(ReactivateVehicleReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { patchByKey: patchVehicleByKey } = useVehiclesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchVehicleByKey(triggerResult.data)

      return triggerResult
    },
    [originalTrigger, patchVehicleByKey],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
