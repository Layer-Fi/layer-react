import type { Vehicle } from '@schemas/vehicle'

export const getVehicleDisplayName = (vehicle: Vehicle | null | undefined, unnamedVehicleString: string): string => {
  if (!vehicle) return ''

  const makeAndModel = vehicle.makeAndModel.trim()

  if (vehicle.year == null) {
    return makeAndModel || unnamedVehicleString
  }

  return `${vehicle.year} ${makeAndModel}`.trim()
}
