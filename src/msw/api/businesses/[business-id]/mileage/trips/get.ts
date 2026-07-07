import { Schema } from 'effect'

import { type Trip, type TripPurpose, TripSchema } from '@schemas/trip'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTrip = Schema.encodeSync(TripSchema)

const toResponse = (trips: readonly Trip[], request: Request) =>
  paginatedApiData(trips.map(trip => encodeTrip(trip)), request)

export const get = createMockEndpoint<readonly Trip[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/trips',
  resolve: ({ override: trips = tripStore.all(), request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase()
    const vehicleId = url.searchParams.get('vehicle_ids')
    const purpose = url.searchParams.get('purpose')
    const year = url.searchParams.get('year')

    const filtered = trips.filter((trip) => {
      const matchesQuery = query == null || query === ''
        || [trip.startAddress, trip.endAddress, trip.description]
          .some(field => field?.toLowerCase()?.includes(query) ?? false)
      const matchesVehicle = vehicleId == null || trip.vehicle?.id === vehicleId
      const matchesPurpose = purpose == null || trip.purpose === (purpose as TripPurpose)
      const matchesYear = year == null || trip.tripDate.year === Number(year)

      return trip.deletedAt == null && matchesQuery && matchesVehicle && matchesPurpose && matchesYear
    })

    return toResponse(filtered, request)
  },
})
