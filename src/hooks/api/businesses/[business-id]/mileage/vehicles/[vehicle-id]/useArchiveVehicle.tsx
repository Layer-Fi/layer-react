import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const ARCHIVE_VEHICLE_TAG_KEY = '#archive-vehicle'

const ArchiveVehicleReturnSchema = Schema.Struct({
  data: VehicleSchema,
})

type ArchiveVehicleReturn = typeof ArchiveVehicleReturnSchema.Type

const archiveVehicle = post<
  ArchiveVehicleReturn,
  never,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/archive`)

const buildKey = createBuildKey<{ businessId: string, vehicleId: string }>([ARCHIVE_VEHICLE_TAG_KEY])

type UseArchiveVehicleProps = {
  vehicleId: string
}

export const useArchiveVehicle = ({ vehicleId }: UseArchiveVehicleProps) => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      vehicleId,
    })),
    (
      { accessToken, apiUrl, businessId, vehicleId },
    ) => {
      return archiveVehicle(
        apiUrl,
        accessToken,
        { params: { businessId, vehicleId } },
      ).then(Schema.decodeUnknownPromise(ArchiveVehicleReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { patchVehicleByKey } = useVehiclesGlobalCacheActions()

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
