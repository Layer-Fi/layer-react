import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { MileageDistanceSchema } from '@schemas/features/mileage/mileage'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const MILEAGE_DISTANCE_TAG_KEY = '#mileage-distance'

const MileageDistanceResponseSchema = UnwrappedDataResponseSchema(MileageDistanceSchema)

type MileageDistanceParams = {
  businessId: string
  startPlaceId: string
  endPlaceId: string
}

const getMileageDistance = getWithQuery<
  typeof MileageDistanceResponseSchema.Encoded,
  MileageDistanceParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/distance`,
  ({ startPlaceId, endPlaceId }) => ({
    start_place_id: startPlaceId,
    end_place_id: endPlaceId,
  }),
)

export const useGetMileageDistance = createQueryHook({
  tags: [MILEAGE_DISTANCE_TAG_KEY],
  request: getMileageDistance,
  schema: MileageDistanceResponseSchema,
  select: ({ distance }) => distance,
})
