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

export enum VehicleFormInvalidReason {
  MakeAndModelRequired = 'makeAndModelRequired',
  YearRequired = 'yearRequired',
  YearRange = 'yearRange',
}

export type VehicleFormValidationError = {
  field: 'makeAndModel' | 'year'
  reason: VehicleFormInvalidReason
}

export const validateVehicleForm = ({ vehicle }: { vehicle: VehicleForm }) => {
  const { makeAndModel, year } = vehicle

  const errors: VehicleFormValidationError[] = []

  if (!makeAndModel.trim()) {
    errors.push({ field: 'makeAndModel', reason: VehicleFormInvalidReason.MakeAndModelRequired })
  }

  if (Number.isNaN(year)) {
    errors.push({ field: 'year', reason: VehicleFormInvalidReason.YearRequired })
  }

  const currentYear = new Date().getFullYear()
  if (!Number.isNaN(year) && (year < 1900 || year > currentYear + 1)) {
    errors.push({ field: 'year', reason: VehicleFormInvalidReason.YearRange })
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
