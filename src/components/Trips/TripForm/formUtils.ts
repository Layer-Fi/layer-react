import { getLocalTimeZone, today } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import { type Trip, type TripForm, TripPurpose } from '@schemas/trip'
import { BIG_DECIMAL_ZERO } from '@utils/bigDecimalUtils'

export const getTripFormDefaultValues = (trip?: Trip): TripForm => {
  if (trip) {
    return {
      vehicle: trip.vehicle ?? null,
      tripDate: trip.tripDate,
      distance: trip.distance,
      purpose: trip.purpose,
      startAddress: trip.startAddress || '',
      endAddress: trip.endAddress || '',
      description: trip.description || '',
    }
  }

  return {
    vehicle: null,
    tripDate: today(getLocalTimeZone()),
    distance: BIG_DECIMAL_ZERO,
    purpose: TripPurpose.Business,
    startAddress: '',
    endAddress: '',
    description: '',
  }
}

export const validateTripForm = ({ trip }: { trip: TripForm }, t: TFunction) => {
  const { tripDate, distance, purpose } = trip

  const errors = []

  if (tripDate === null) {
    errors.push({ tripDate: t('trips:validation.trip_date_required', 'Trip date is a required field.') })
  }

  if (tripDate && tripDate.compare(today(getLocalTimeZone())) > 0) {
    errors.push({ tripDate: t('trips:validation.trip_date_not_future', 'Trip date cannot be in the future.') })
  }

  if (!BD.isPositive(distance)) {
    errors.push({ distance: t('trips:validation.distance_greater_than_zero', 'Distance must be greater than zero.') })
  }

  if (!purpose) {
    errors.push({ purpose: t('trips:validation.purpose_required', 'Purpose is a required field.') })
  }

  return errors.length > 0 ? errors : null
}

export const convertTripFormToUpsertTrip = (form: TripForm): unknown => {
  return {
    vehicleId: form.vehicle?.id,
    tripDate: form.tripDate,
    distance: form.distance,
    purpose: form.purpose,
    startAddress: form.startAddress.trim() || null,
    endAddress: form.endAddress.trim() || null,
    description: form.description.trim() || null,
  }
}
