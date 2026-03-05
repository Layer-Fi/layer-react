import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type ListVehiclesParams = {
  businessId: string
  allowArchived?: boolean
}

const ListVehiclesResponseSchema = Schema.Struct({
  data: Schema.Array(VehicleSchema),
})

type ListVehiclesResponse = typeof ListVehiclesResponseSchema.Type
type ListVehiclesResponseEncoded = typeof ListVehiclesResponseSchema.Encoded

const listVehicles = get<
  ListVehiclesResponseEncoded,
  ListVehiclesParams
>(({ businessId, allowArchived }) => {
  const parameters = toDefinedSearchParameters({ allowArchived })
  return `/v1/businesses/${businessId}/mileage/vehicles?${parameters}`
})

export const VEHICLES_TAG_KEY = '#list-vehicles'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  allowArchived,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  allowArchived?: boolean
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      allowArchived,
      tags: [VEHICLES_TAG_KEY],
    } as const
  }
}

class ListVehiclesSWRResponse extends SWRQueryResult<ListVehiclesResponse> {
  // @ts-expect-error override narrows return type to unwrap nested data
  override get data() {
    return this.swrResponse.data?.data
  }
}

export function useListVehicles({ allowArchived }: { allowArchived?: boolean } = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      allowArchived,
    }),
    ({ accessToken, apiUrl, businessId, allowArchived }) => listVehicles(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          allowArchived,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListVehiclesResponseSchema)),
  )

  return new ListVehiclesSWRResponse(response)
}

const withUpdatedVehicle = (updated: Vehicle) =>
  (vehicle: Vehicle): Vehicle => vehicle.id === updated.id ? updated : vehicle

export function useVehiclesGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchVehicleByKey = useCallback((updatedVehicle: Vehicle) =>
    patchCache<ListVehiclesResponse | undefined>(
      ({ tags }) => tags.includes(VEHICLES_TAG_KEY),
      (currentData) => {
        if (!currentData) return currentData

        return {
          ...currentData,
          data: currentData.data.map(withUpdatedVehicle(updatedVehicle)),
        }
      },
    ),
  [patchCache],
  )

  const forceReloadVehicles = useCallback(
    () => forceReload(({ tags }) => tags.includes(VEHICLES_TAG_KEY)),
    [forceReload],
  )

  return { patchVehicleByKey, forceReloadVehicles }
}
