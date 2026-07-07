import { type Vehicle } from '@schemas/vehicle'

import { makeBusiness } from '@fixtures/business/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseVehicle: Vehicle = {
  id: '00000000-0000-4000-8000-000000000401',
  businessId: makeBusiness().id,
  externalId: 'ext_40001',
  makeAndModel: 'Toyota Camry',
  year: 2022,
  licensePlate: 'ABC-1234',
  vin: '1HGCM82633A004352',
  description: 'Primary delivery vehicle',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  deletedAt: null,
  archivedAt: null,
  isPrimary: true,
  isEligibleForDeletion: false,
}

export const { make: makeVehicle, makeMany: makeVehicles } =
  createFixtureFactory(baseVehicle)
