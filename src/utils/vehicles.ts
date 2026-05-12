import type { Vehicle } from '@schemas/vehicle'
import { translationKey } from './i18n/translationKey'
import type { TFunction } from 'i18next'

const unnamedVehicle = translationKey('vehicles:label.unnamed_vehicle', 'Unnamed vehicle')

export const getVehicleDisplayName = (vehicle: Vehicle | null | undefined, t: TFunction): string => {
  if (!vehicle) return ''

  const makeAndModel = vehicle.makeAndModel.trim()

  if (vehicle.year == null) {
    return makeAndModel || t(unnamedVehicle.i18nKey, unnamedVehicle.defaultValue)
  }

  return `${vehicle.year} ${makeAndModel}`.trim()
}
