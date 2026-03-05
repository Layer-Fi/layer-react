import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { del } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useVehiclesGlobalCacheActions } from '@features/vehicles/api/useListVehicles'

const DELETE_VEHICLE_TAG_KEY = '#delete-vehicle'

const deleteVehicle = del<
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`)

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
      tags: [DELETE_VEHICLE_TAG_KEY],
    } as const
  }
}

type UseDeleteVehicleProps = {
  vehicleId: string
}

export const useDeleteVehicle = ({ vehicleId }: UseDeleteVehicleProps) => {
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

  const { forceReloadVehicles } = useVehiclesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadVehicles()

      return triggerResult
    },
    [originalTrigger, forceReloadVehicles],
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
