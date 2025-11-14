import { type Vehicle, type VehicleForm } from '@schemas/vehicle'

export const getVehicleFormDefaultValues = (vehicle?: Vehicle): VehicleForm => {
  if (vehicle) {
    return {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      description: vehicle.description || '',
    }
  }

  return {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    description: '',
  }
}

export const validateVehicleForm = ({ vehicle }: { vehicle: VehicleForm }) => {
  const { make, model, year } = vehicle

  const errors = []

  if (!make.trim()) {
    errors.push({ make: 'Make is a required field.' })
  }

  if (!model.trim()) {
    errors.push({ model: 'Model is a required field.' })
  }

  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear + 1) {
    errors.push({ year: `Year must be between 1900 and ${currentYear + 1}.` })
  }

  return errors.length > 0 ? errors : null
}

export const convertVehicleFormToUpsertVehicle = (form: VehicleForm): unknown => {
  return {
    make: form.make.trim(),
    model: form.model.trim(),
    year: form.year,
    licensePlate: form.licensePlate.trim() || null,
    vin: form.vin.trim() || null,
    description: form.description.trim() || null,
  }
}

