import { createGenerator } from '@fixtures/utils/createGenerator'
import { schema } from '@fixtures/vehicles/schema'

const generateVehicles = createGenerator(schema, {
  uniqueBy: [
    vehicle => vehicle.id,
    vehicle => vehicle.vin,
  ],
  numRuns: 5,
})

export const generator: typeof generateVehicles = (overrides) => {
  const vehicles = generateVehicles(overrides)

  return vehicles.map((vehicle, index) => ({ ...vehicle, isPrimary: index === 0 }))
}
