import { Schema } from 'effect'

import { type PlaceDetails, PlaceDetailsSchema } from '@schemas/features/mileage/place'

import { makePlaceDetails, placeSuggestions } from '@fixtures/places/mocks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePlaceDetails = Schema.encodeSync(PlaceDetailsSchema)

const toResponse = (details: PlaceDetails) =>
  apiData(encodePlaceDetails(details))

export const get = createMockEndpoint<PlaceDetails, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/address-details',
  resolve: ({ override, request }) => {
    if (override) {
      return toResponse(override)
    }

    const placeId = new URL(request.url).searchParams.get('place_id') ?? ''
    const suggestion = placeSuggestions.find(candidate => candidate.placeId === placeId)

    return toResponse(makePlaceDetails({
      placeId,
      formattedAddress: suggestion?.description ?? null,
    }))
  },
})
