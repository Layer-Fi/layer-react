import { BigDecimal, Schema } from 'effect'

import { type MileageDistance, MileageDistanceSchema } from '@schemas/mileage'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeMileageDistance = Schema.encodeSync(MileageDistanceSchema)

/* Stands in for the server-side Routes API computation. */
const MOCK_ROUTE_DISTANCE: MileageDistance = {
  distance: BigDecimal.unsafeFromString('42.7'),
}

const toResponse = (result: MileageDistance) =>
  apiData(encodeMileageDistance(result))

export const get = createMockEndpoint<MileageDistance, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/distance',
  resolve: ({ override }) => toResponse(override ?? MOCK_ROUTE_DISTANCE),
})
