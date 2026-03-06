import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  vehicleId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  vehicleId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      vehicleId,
      tags: [ARCHIVE_VEHICLE_TAG_KEY],
    } as const
  }
}

type UseArchiveVehicleProps = {
  vehicleId: string
}

export const useArchiveVehicle = ({ vehicleId }: UseArchiveVehicleProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      vehicleId,
    }),
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
