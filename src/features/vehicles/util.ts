import type { VehicleEncoded } from '@schemas/vehicle'

export function getVehicleDisplayName(vehicle?: VehicleEncoded | null): string {
  if (!vehicle) {
    return 'Unknown Vehicle'
  }

  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean)

  if (parts.length === 0) {
    return vehicle.license_plate ?? 'Unknown Vehicle'
  }

  return parts.join(' ')
}
