import { type TripEncoded, TripPurpose } from '@schemas/trip'
import { type VehicleEncoded } from '@schemas/vehicle'
import { BigDecimal as BD, Option } from 'effect'
import { getLocalTimeZone, fromDate, toCalendarDate, today, type ZonedDateTime } from '@internationalized/date'
import { BIG_DECIMAL_ZERO, formatBigDecimalToString } from '@utils/bigDecimalUtils'

export type TripForm = {
  vehicle: VehicleEncoded | null
  tripDate: ZonedDateTime | null
  distance: BD.BigDecimal
  purpose: TripPurpose
  startAddress: string
  endAddress: string
  description: string
}

export const getTripFormDefaultValues = (trip?: TripEncoded): TripForm => {
  if (trip) {
    const distanceOption = BD.fromString(trip.distance)
    const distance = Option.getOrElse(distanceOption, () => BIG_DECIMAL_ZERO)

    return {
      vehicle: trip.vehicle,
      tripDate: fromDate(new Date(trip.trip_date), 'UTC'),
      distance,
      purpose: trip.purpose as TripPurpose,
      startAddress: trip.start_address || '',
      endAddress: trip.end_address || '',
      description: trip.description || '',
    }
  }

  return {
    vehicle: null,
    tripDate: fromDate(new Date(), getLocalTimeZone()),
    distance: BIG_DECIMAL_ZERO,
    purpose: TripPurpose.Unreviewed,
    startAddress: '',
    endAddress: '',
    description: '',
  }
}

export const validateTripForm = ({ trip }: { trip: TripForm }) => {
  const { vehicle, tripDate, distance, purpose } = trip

  const errors = []

  if (vehicle === null) {
    errors.push({ vehicle: 'Vehicle is a required field.' })
  }

  if (tripDate === null) {
    errors.push({ tripDate: 'Trip date is a required field.' })
  }

  if (tripDate && toCalendarDate(tripDate).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ tripDate: 'Trip date cannot be in the future.' })
  }

  if (!BD.isPositive(distance)) {
    errors.push({ distance: 'Distance must be greater than zero.' })
  }

  if (!purpose) {
    errors.push({ purpose: 'Purpose is a required field.' })
  }

  return errors.length > 0 ? errors : null
}

export type TripFormParams = {
  vehicle_id: string
  trip_date: string
  distance: string
  purpose: string
  start_address: string | null
  end_address: string | null
  description: string | null
}

export const convertTripFormToParams = (form: TripForm): TripFormParams => ({
  vehicle_id: form.vehicle!.id,
  trip_date: toCalendarDate(form.tripDate!).toString(),
  distance: formatBigDecimalToString(form.distance),
  purpose: form.purpose,
  start_address: form.startAddress.trim() || null,
  end_address: form.endAddress.trim() || null,
  description: form.description.trim() || null,
})
