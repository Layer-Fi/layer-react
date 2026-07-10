import { CalendarDate } from '@internationalized/date'
import { BigDecimal } from 'effect'

import { type Trip, TripPurpose } from '@schemas/trip'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const baseTrip: Trip = {
  id: '00000000-0000-4000-8000-000000000501',
  vehicle: makeVehicle(),
  externalId: null,
  distance: BigDecimal.unsafeFromString('12.5'),
  tripDate: new CalendarDate(2024, 3, 15),
  purpose: TripPurpose.Business,
  startAddress: '123 Main St, Springfield, IL 62701',
  endAddress: '456 Market St, San Francisco, CA 94105',
  description: 'Client meeting',
  createdAt: new Date('2024-03-15T00:00:00.000Z'),
  updatedAt: new Date('2024-03-15T00:00:00.000Z'),
  deletedAt: null,
}

export const { make: makeTrip, makeMany: makeTrips } =
  createFixtureFactory(baseTrip)
