import type { PlaceDetails, PlaceSuggestion } from '@schemas/place'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

export const placeSuggestions: ReadonlyArray<PlaceSuggestion> = [
  {
    placeId: 'place-springfield-main',
    description: '123 Main St, Springfield, IL 62701, USA',
  },
  {
    placeId: 'place-sf-market',
    description: '456 Market St, San Francisco, CA 94105, USA',
  },
  {
    placeId: 'place-nyc-broadway',
    description: '789 Broadway, New York, NY 10003, USA',
  },
]

const basePlaceDetails: PlaceDetails = {
  placeId: 'place-springfield-main',
  formattedAddress: '123 Main St, Springfield, IL 62701, USA',
  latitude: '39.7817',
  longitude: '-89.6501',
}

export const { make: makePlaceDetails } = createFixtureFactory(basePlaceDetails)
