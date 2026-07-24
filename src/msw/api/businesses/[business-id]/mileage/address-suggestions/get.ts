import { Schema } from 'effect'

import { type PlaceSuggestion, PlaceSuggestionSchema } from '@schemas/place'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { placeSuggestions } from '@fixtures/places/mocks'

const encodePlaceSuggestion = Schema.encodeSync(PlaceSuggestionSchema)

const toResponse = (suggestions: ReadonlyArray<PlaceSuggestion>) =>
  apiData(suggestions.map(suggestion => encodePlaceSuggestion(suggestion)))

export const get = createMockEndpoint<ReadonlyArray<PlaceSuggestion>, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/address-suggestions',
  resolve: ({ override, request }) => {
    if (override) {
      return toResponse(override)
    }

    const query = new URL(request.url).searchParams.get('query') ?? ''

    return toResponse(
      placeSuggestions.filter(({ description }) =>
        description.toLowerCase().includes(query.toLowerCase()),
      ),
    )
  },
})
