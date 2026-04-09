import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
