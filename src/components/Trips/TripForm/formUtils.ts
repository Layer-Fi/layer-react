import { getLocalTimeZone, today } from '@internationalized/date'
import type { TFunction } from 'i18next'

import { fromNonRecursiveBigDecimal, NRBD_ZERO, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { type Trip, type TripForm, type TripPlace, TripPurpose } from '@schemas/trip'
import { dateNotInFuture, positiveAmount, required } from '@utils/form/validators'

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

export const validateTripForm = ({ trip }: { trip: TripForm }, t: TFunction) => {
  const { tripDate, distance, purpose } = trip

  const fields = {
    tripDate: required(t('trips:validation.trip_date_required', 'Trip date is a required field.'))(tripDate)
      ?? dateNotInFuture(t('trips:validation.trip_date_not_future', 'Trip date cannot be in the future.'))(tripDate),
    distance: positiveAmount(t('trips:validation.distance_greater_than_zero', 'Distance must be greater than 0 miles.'))(distance),
    purpose: required(t('trips:validation.purpose_required', 'Purpose is a required field.'))(purpose),
  }

  return Object.values(fields).some(Boolean) ? { fields } : undefined
}

export const convertTripFormToUpsertTrip = (form: TripForm): unknown => {
  return {
    vehicleId: form.vehicle?.id,
    tripDate: form.tripDate,
    distance: fromNonRecursiveBigDecimal(form.distance),
    purpose: form.purpose,
    startAddress: form.start.address.trim() || null,
    endAddress: form.end.address.trim() || null,
    /*
     * Explicit nulls, not undefined: JSON.stringify drops undefined keys, and
     * a missing key on PATCH means "leave unchanged" server-side, so clearing
     * a place would otherwise strand its stale ID and coordinates.
     */
    googleStartPlaceId: form.start.place?.placeId ?? null,
    googleEndPlaceId: form.end.place?.placeId ?? null,
    startLatitude: form.start.place?.latitude ?? null,
    startLongitude: form.start.place?.longitude ?? null,
    endLatitude: form.end.place?.latitude ?? null,
    endLongitude: form.end.place?.longitude ?? null,
    description: form.description.trim() || null,
  }
}
