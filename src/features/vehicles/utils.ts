import type { Vehicle } from '@schemas/vehicle'

export const getVehicleDisplayName = (vehicle: Vehicle): string =>
  `${vehicle.year} ${vehicle.makeAndModel}`
