import { createGenerator } from '@fixtures/utils/createGenerator'
import { schema } from '@fixtures/vehicles/schema'

const generateVehicles = createGenerator(schema, {
  uniqueBy: [
    vehicle => vehicle.id,
    vehicle => vehicle.externalId,
    vehicle => vehicle.vin,
  ],
  numRuns: 5,
})

const ARCHIVED_COUNT = 2

export const generator: typeof generateVehicles = (overrides) => {
  const vehicles = generateVehicles(overrides)

  return vehicles.map((vehicle, index) => {
    const isArchived = index >= vehicles.length - ARCHIVED_COUNT

    return {
      ...vehicle,
      isPrimary: index === 0,
      archivedAt: isArchived
        ? new Date(vehicle.updatedAt.getTime() + 1000 * 60 * 60 * 24 * 30)
        : null,
    }
  })
}
