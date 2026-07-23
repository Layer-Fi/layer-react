import { getLocalTimeZone, today } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import { fromNonRecursiveBigDecimal, NRBD_ZERO, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { type Trip, type TripForm, type TripPlace, TripPurpose } from '@schemas/trip'

const getTripPlace = (
  placeId: string | null | undefined,
  latitude: string | null | undefined,
  longitude: string | null | undefined,
): TripPlace | null =>
  placeId ? { placeId, latitude, longitude } : null

export const getTripFormDefaultValues = (trip?: Trip): TripForm => {
  if (trip) {
    return {
      vehicle: trip.vehicle ?? null,
      tripDate: trip.tripDate,
      distance: toNonRecursiveBigDecimal(trip.distance),
      purpose: trip.purpose,
      start: {
        address: trip.startAddress || '',
        place: getTripPlace(trip.googleStartPlaceId, trip.startLatitude, trip.startLongitude),
      },
      end: {
        address: trip.endAddress || '',
        place: getTripPlace(trip.googleEndPlaceId, trip.endLatitude, trip.endLongitude),
      },
      description: trip.description || '',
    }
  }

  return {
    vehicle: null,
    tripDate: today(getLocalTimeZone()),
    distance: NRBD_ZERO,
    purpose: TripPurpose.Business,
    start: { address: '', place: null },
    end: { address: '', place: null },
    description: '',
  }
}

const hasBothPlaces = (trip: TripForm) =>
  trip.start.place !== null && trip.end.place !== null

export const validateTripForm = ({ trip }: { trip: TripForm }, t: TFunction) => {
  const { tripDate, distance, purpose } = trip

  const fields: Partial<Record<'tripDate' | 'distance' | 'purpose', string>> = {}

  if (tripDate === null) {
    fields.tripDate = t('trips:validation.trip_date_required', 'Trip date is a required field.')
  }
  else if (tripDate.compare(today(getLocalTimeZone())) > 0) {
    fields.tripDate = t('trips:validation.trip_date_not_future', 'Trip date cannot be in the future.')
  }

  if (!BD.isPositive(fromNonRecursiveBigDecimal(distance)) && !hasBothPlaces(trip)) {
    fields.distance = t('trips:validation.distance_or_addresses_required', 'Enter a distance or select start and end addresses.')
  }

  if (!purpose) {
    fields.purpose = t('trips:validation.purpose_required', 'Purpose is a required field.')
  }

  return Object.keys(fields).length > 0 ? { fields } : undefined
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
    startAddress: form.start.address.trim() || null,
    endAddress: form.end.address.trim() || null,
    googleStartPlaceId: form.start.place?.placeId,
    googleEndPlaceId: form.end.place?.placeId,
    startLatitude: form.start.place?.latitude,
    startLongitude: form.start.place?.longitude,
    endLatitude: form.end.place?.latitude,
    endLongitude: form.end.place?.longitude,
    description: form.description.trim() || null,
  }
}
