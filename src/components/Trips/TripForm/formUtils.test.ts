import { BigDecimal } from 'effect'
import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { NRBD_ZERO, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { TripForm } from '@schemas/trip'
import { convertTripFormToUpsertTrip, getTripFormDefaultValues, validateTripForm } from '@components/Trips/TripForm/formUtils'

import { makeTrip } from '@fixtures/trips/mocks'

const t = ((_key: string, defaultValue: string) => defaultValue) as TFunction

const START_PLACE = { placeId: 'place-start', latitude: '39.78', longitude: '-89.65' }
const END_PLACE = { placeId: 'place-end', latitude: '37.79', longitude: '-122.40' }

const makeForm = (overrides?: Partial<TripForm>): TripForm => ({
  ...getTripFormDefaultValues(),
  ...overrides,
})

type ConvertedTrip = { distance?: BigDecimal.BigDecimal, googleStartPlaceId: string | null }

describe('convertTripFormToUpsertTrip', () => {
  it('omits the distance on create when both places are selected and no distance was entered', () => {
    const converted = convertTripFormToUpsertTrip(
      makeForm({ startPlace: START_PLACE, endPlace: END_PLACE }),
    ) as ConvertedTrip

    expect(converted.distance).toBeUndefined()
    expect(converted.googleStartPlaceId).toBe('place-start')
  })

  it('sends an entered distance on create even when both places are selected', () => {
    const converted = convertTripFormToUpsertTrip(
      makeForm({
        startPlace: START_PLACE,
        endPlace: END_PLACE,
        distance: toNonRecursiveBigDecimal(BigDecimal.unsafeFromString('7.5')),
      }),
    ) as ConvertedTrip

    expect(converted.distance).toEqual(BigDecimal.unsafeFromString('7.5'))
  })

  it('sends the distance on create when places are missing', () => {
    const converted = convertTripFormToUpsertTrip(
      makeForm({ distance: toNonRecursiveBigDecimal(BigDecimal.unsafeFromString('7.5')) }),
    ) as ConvertedTrip

    expect(converted.distance).toEqual(BigDecimal.unsafeFromString('7.5'))
  })

  it('omits an untouched distance on edit so the server can recompute from changed places', () => {
    const trip = makeTrip({})

    const converted = convertTripFormToUpsertTrip(
      makeForm({
        distance: toNonRecursiveBigDecimal(trip.distance),
        startPlace: START_PLACE,
        endPlace: END_PLACE,
      }),
      trip,
    ) as ConvertedTrip

    expect(converted.distance).toBeUndefined()
  })

  it('sends an edited distance on edit as a manual override', () => {
    const trip = makeTrip({})

    const converted = convertTripFormToUpsertTrip(
      makeForm({
        distance: toNonRecursiveBigDecimal(BigDecimal.unsafeFromString('99')),
        startPlace: START_PLACE,
        endPlace: END_PLACE,
      }),
      trip,
    ) as ConvertedTrip

    expect(converted.distance).toEqual(BigDecimal.unsafeFromString('99'))
  })

  it('sends an untouched distance on edit when a place is missing', () => {
    const trip = makeTrip({})

    const converted = convertTripFormToUpsertTrip(
      makeForm({
        distance: toNonRecursiveBigDecimal(trip.distance),
        startPlace: START_PLACE,
      }),
      trip,
    ) as ConvertedTrip

    expect(converted.distance).toBeDefined()
    expect(BigDecimal.equals(converted.distance!, trip.distance)).toBe(true)
  })
})

describe('validateTripForm', () => {
  it('requires a distance when both places are not selected', () => {
    const errors = validateTripForm({ trip: makeForm({ distance: NRBD_ZERO }) }, t)

    expect(errors).toEqual(
      expect.arrayContaining([{ distance: 'Enter a distance or select start and end addresses.' }]),
    )
  })

  it('allows a missing distance when both places are selected', () => {
    const errors = validateTripForm(
      { trip: makeForm({ distance: NRBD_ZERO, startPlace: START_PLACE, endPlace: END_PLACE }) },
      t,
    )

    expect(errors).toBeNull()
  })
})
