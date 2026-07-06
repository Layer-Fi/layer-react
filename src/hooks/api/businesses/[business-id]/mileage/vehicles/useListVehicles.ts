import { useCallback, useMemo } from 'react'
import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { type Vehicle, VehicleSchema } from '@schemas/vehicle'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

type ListVehiclesParams = {
  businessId: string
  allowArchived?: boolean
}

const ListVehiclesResponseSchema = UnwrappedDataResponseSchema(Schema.Array(VehicleSchema))

const listVehicles = getWithQuery<
  typeof ListVehiclesResponseSchema.Encoded,
  ListVehiclesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/vehicles`,
)

export const VEHICLES_TAG_KEY = '#list-vehicles'

export const useListVehicles = createQueryHook({
  tags: [VEHICLES_TAG_KEY],
  request: listVehicles,
  schema: ListVehiclesResponseSchema,
})

const useVehiclesResourceCacheActions = createResourceGlobalCacheActions<ReadonlyArray<Vehicle>>(VEHICLES_TAG_KEY)

const patchVehicleById = (updatedVehicle: Vehicle) =>
  (vehicles?: ReadonlyArray<Vehicle>) =>
    vehicles?.map(vehicle => vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle)

export function useVehiclesGlobalCacheActions() {
  const actions = useVehiclesResourceCacheActions()

  const patchByKey = useCallback(
    (updatedVehicle: Vehicle) => actions.patchCache(patchVehicleById(updatedVehicle)),
    [actions],
  )

  return useMemo(() => ({
    ...actions,
    patchByKey,
  }), [actions, patchByKey])
}
