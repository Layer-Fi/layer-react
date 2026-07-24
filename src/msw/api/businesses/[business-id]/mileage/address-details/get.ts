import { Schema } from 'effect'

import { type PlaceDetails, PlaceDetailsSchema } from '@schemas/place'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makePlaceDetails, placeSuggestions } from '@fixtures/places/mocks'

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
