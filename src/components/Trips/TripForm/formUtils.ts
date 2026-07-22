import { getLocalTimeZone, today } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import { fromNonRecursiveBigDecimal, NRBD_ZERO, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { type Trip, type TripForm, type TripPlace, TripPurpose } from '@schemas/trip'

const getTripPlace = (
  placeId: string | null | undefined,
  latitude: string | null | undefined,
  longitude: string | null | undefined,
): TripPlace | null => {
  if (!placeId) {
    return null
  }

  return { placeId, latitude: latitude ?? null, longitude: longitude ?? null }
}

export const getTripFormDefaultValues = (trip?: Trip): TripForm => {
  if (trip) {
    return {
      vehicle: trip.vehicle ?? null,
      tripDate: trip.tripDate,
      distance: toNonRecursiveBigDecimal(trip.distance),
      purpose: trip.purpose,
      startAddress: trip.startAddress || '',
      startPlace: getTripPlace(trip.googleStartPlaceId, trip.startLatitude, trip.startLongitude),
      endAddress: trip.endAddress || '',
      endPlace: getTripPlace(trip.googleEndPlaceId, trip.endLatitude, trip.endLongitude),
      description: trip.description || '',
    }
  }

  return {
    vehicle: null,
    tripDate: today(getLocalTimeZone()),
    distance: NRBD_ZERO,
    purpose: TripPurpose.Business,
    startAddress: '',
    startPlace: null,
    endAddress: '',
    endPlace: null,
    description: '',
  }
}

const hasBothPlaces = (trip: TripForm) =>
  trip.startPlace !== null && trip.endPlace !== null

export const validateTripForm = ({ trip }: { trip: TripForm }, t: TFunction) => {
  const { tripDate, distance, purpose } = trip

  const errors = []

  if (tripDate === null) {
    errors.push({ tripDate: t('trips:validation.trip_date_required', 'Trip date is a required field.') })
  }

  if (tripDate && tripDate.compare(today(getLocalTimeZone())) > 0) {
    errors.push({ tripDate: t('trips:validation.trip_date_not_future', 'Trip date cannot be in the future.') })
  }

  if (!BD.isPositive(fromNonRecursiveBigDecimal(distance)) && !hasBothPlaces(trip)) {
    errors.push({ distance: t('trips:validation.distance_or_addresses_required', 'Enter a distance or select start and end addresses.') })
  }

  if (!purpose) {
    errors.push({ purpose: t('trips:validation.purpose_required', 'Purpose is a required field.') })
  }

  return errors.length > 0 ? errors : null
}

export const convertTripFormToUpsertTrip = (form: TripForm, existingTrip?: Trip): unknown => {
  const distance = fromNonRecursiveBigDecimal(form.distance)
  const isDistanceEdited = existingTrip
    ? !BD.equals(distance, existingTrip.distance)
    : BD.isPositive(distance)

  /*
   * An omitted distance tells the server to derive it from the two place IDs
   * (or keep the stored one when the locations are unchanged); an explicit
   * distance always wins and is stored as MANUAL.
   */
  const shouldSendDistance = BD.isPositive(distance)
    && (isDistanceEdited || !hasBothPlaces(form))

  return {
    vehicleId: form.vehicle?.id,
    tripDate: form.tripDate,
    distance: shouldSendDistance ? distance : undefined,
    purpose: form.purpose,
    startAddress: form.startAddress.trim() || null,
    endAddress: form.endAddress.trim() || null,
    googleStartPlaceId: form.startPlace?.placeId ?? null,
    googleEndPlaceId: form.endPlace?.placeId ?? null,
    startLatitude: form.startPlace?.latitude ?? null,
    startLongitude: form.startPlace?.longitude ?? null,
    endLatitude: form.endPlace?.latitude ?? null,
    endLongitude: form.endPlace?.longitude ?? null,
    description: form.description.trim() || null,
  }
}
