import { Schema } from 'effect'
import useSWR from 'swr'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
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

const buildKey = createBuildKey<{ businessId: string, allowArchived?: boolean }>([VEHICLES_TAG_KEY])

class ListVehiclesSWRResponse extends SWRQueryResult<ListVehiclesResponse> {
  // @ts-expect-error override narrows return type to unwrap nested data
  override get data() {
    return this.swrResponse.data?.data
  }
}

export function useListVehicles({ allowArchived }: { allowArchived?: boolean } = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
      allowArchived,
    })),
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

export const useVehiclesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Vehicle>(VEHICLES_TAG_KEY)
