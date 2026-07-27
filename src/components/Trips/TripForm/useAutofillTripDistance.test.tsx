import { act, renderHook } from '@testing-library/react'
import { BigDecimal as BD } from 'effect'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fromNonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Trip, TripForm, TripPlace } from '@schemas/trip'
import { useMileageDistance } from '@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance'
import { type AppForm, useAppForm } from '@hooks/features/forms/useForm'
import { getTripFormDefaultValues } from '@components/Trips/TripForm/formUtils'
import { useAutofillTripDistance } from '@components/Trips/TripForm/useAutofillTripDistance'

import { makeTrip } from '@fixtures/trips/mocks'

vi.mock('@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance', () => ({
  useMileageDistance: vi.fn(),
}))

const START_PLACE_ID = 'start-a'

/* Built once per key, because SWR hands back the same cached object on a re-render */
const ROUTES: Record<string, BD.BigDecimal> = {
  [`${START_PLACE_ID}|end-b`]: BD.unsafeFromString('12'),
  [`${START_PLACE_ID}|end-c`]: BD.unsafeFromString('30'),
}

beforeEach(() => {
  vi.mocked(useMileageDistance).mockImplementation(params => ({
    data: params?.isEnabled ? ROUTES[`${params.startPlaceId}|${params.endPlaceId}`] : undefined,
    error: undefined,
  }) as ReturnType<typeof useMileageDistance>)
})

const renderAutofill = (trip?: Trip) => renderHook(() => {
  const form = useAppForm<TripForm>({ defaultValues: getTripFormDefaultValues(trip) })
  useAutofillTripDistance({ form, trip })

  return form
})

const makePlace = (placeId: string): TripPlace => ({ placeId, latitude: null, longitude: null })

const setStart = (form: AppForm<TripForm>) => act(() => {
  form.setFieldValue('start', { address: 'Start', place: makePlace(START_PLACE_ID) })
})

const setEnd = (form: AppForm<TripForm>, endPlaceId: string) => act(() => {
  form.setFieldValue('end', { address: 'End', place: makePlace(endPlaceId) })
})

const setRoute = (form: AppForm<TripForm>, endPlaceId: string) => {
  setStart(form)
  setEnd(form, endPlaceId)
}

const enterDistance = (form: AppForm<TripForm>, miles: string | null) => act(() => {
  form.setFieldValue(
    'distance',
    miles === null ? null : toNonRecursiveBigDecimal(BD.unsafeFromString(miles)),
  )
})

const distanceOf = (form: AppForm<TripForm>) => {
  const { distance } = form.state.values

  return distance === null ? null : BD.format(fromNonRecursiveBigDecimal(distance))
}

describe('useAutofillTripDistance', () => {
  it('fills an empty distance once both places are set', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('12')
  })

  it('leaves a user-entered distance alone', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, '99')

    expect(distanceOf(result.current)).toBe('99')
  })

  it('leaves a distance entered before the second address alone', () => {
    const { result } = renderAutofill()

    setStart(result.current)
    enterDistance(result.current, '99')
    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('99')
  })

  it('leaves the field empty when the user empties it', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)

    expect(distanceOf(result.current)).toBeNull()
  })

  it('leaves the field empty when the user empties a distance they typed', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, '99')
    enterDistance(result.current, null)

    expect(distanceOf(result.current)).toBeNull()
  })

  it('leaves a saved distance alone, and empty once the user empties it', () => {
    const { result } = renderAutofill(makeTrip({
      distance: BD.unsafeFromString('7'),
      googleStartPlaceId: START_PLACE_ID,
      googleEndPlaceId: 'end-b',
    }))

    expect(distanceOf(result.current)).toBe('7')

    enterDistance(result.current, null)

    expect(distanceOf(result.current)).toBeNull()
  })

  it('recomputes when the destination changes once the user has emptied the field', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)
    setEnd(result.current, 'end-c')

    expect(distanceOf(result.current)).toBe('30')
  })

  it('keeps recomputing once autofill has reclaimed an emptied field', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)
    setEnd(result.current, 'end-c')
    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('12')
  })
})
