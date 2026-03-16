import type { TFunction } from 'i18next'

import { type Vehicle, type VehicleForm } from '@schemas/vehicle'

export const getVehicleFormDefaultValues = (vehicle?: Vehicle): VehicleForm => {
  if (vehicle) {
    return {
      makeAndModel: vehicle.makeAndModel,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      description: vehicle.description || '',
      isPrimary: vehicle.isPrimary,
    }
  }

  return {
    makeAndModel: '',
    year: Number.NaN,
    licensePlate: '',
    vin: '',
    description: '',
    isPrimary: false,
  }
}

export const validateVehicleForm = ({ vehicle }: { vehicle: VehicleForm }, t: TFunction) => {
  const { makeAndModel, year } = vehicle

  const errors = []

  if (!makeAndModel.trim()) {
    errors.push({ makeAndModel: t('vehicles:makeAndModelIsARequiredField', 'Make and model is a required field.') })
  }

  if (Number.isNaN(year)) {
    errors.push({ year: t('vehicles:yearIsARequiredField', 'Year is a required field.') })
  }

  const currentYear = new Date().getFullYear()
  if (!Number.isNaN(year) && (year < 1900 || year > currentYear + 1)) {
    errors.push({ year: t('vehicles:yearMustBeBetween1900AndMaxYear', 'Year must be between 1900 and {{maxYear}}.', { maxYear: currentYear + 1 }) })
  }

  return errors.length > 0 ? errors : null
}

export const convertVehicleFormToUpsertVehicle = (form: VehicleForm): unknown => {
  return {
    makeAndModel: form.makeAndModel.trim(),
    year: form.year,
    licensePlate: form.licensePlate.trim() || null,
    vin: form.vin.trim() || null,
    description: form.description.trim() || null,
    isPrimary: form.isPrimary,
  }
}
