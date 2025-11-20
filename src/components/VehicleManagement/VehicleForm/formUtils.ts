import { type Vehicle, type VehicleForm } from '@schemas/vehicle'

export const getVehicleFormDefaultValues = (vehicle?: Vehicle): VehicleForm => {
  if (vehicle) {
    return {
      makeAndModel: vehicle.makeAndModel,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      description: vehicle.description || '',
    }
  }

  return {
    makeAndModel: '',
    year: Number.NaN,
    licensePlate: '',
    vin: '',
    description: '',
  }
}

export const validateVehicleForm = ({ vehicle }: { vehicle: VehicleForm }) => {
  const { makeAndModel, year } = vehicle

  const errors = []

  if (!makeAndModel.trim()) {
    errors.push({ makeAndModel: 'Make and model is a required field.' })
  }

  if (Number.isNaN(year)) {
    errors.push({ year: 'Year is a required field.' })
  }

  const currentYear = new Date().getFullYear()
  if (!Number.isNaN(year) && (year < 1900 || year > currentYear + 1)) {
    errors.push({ year: `Year must be between 1900 and ${currentYear + 1}.` })
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
  }
}
