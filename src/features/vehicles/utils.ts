import type { Vehicle } from '@schemas/vehicle'

export const getVehicleDisplayName = (vehicle: Vehicle | null | undefined): string =>
  vehicle ? `${vehicle.year} ${vehicle.makeAndModel}` : ''
