import { act, renderHook } from '@testing-library/react'
import { BigDecimal as BD } from 'effect'
import { describe, expect, it, vi } from 'vitest'

import { fromNonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { TripForm, TripPlace } from '@schemas/trip'
import { useMileageDistance } from '@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance'
import { type AppForm, useAppForm } from '@hooks/features/forms/useForm'
import { getTripFormDefaultValues } from '@components/Trips/TripForm/formUtils'
import { useAutofillTripDistance } from '@components/Trips/TripForm/useAutofillTripDistance'

vi.mock('@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance', () => ({
  useMileageDistance: vi.fn(),
}))

const START_PLACE_ID = 'start-a'

/* Built once per key, because SWR hands back the same cached object on a re-render */
const ROUTES: Record<string, BD.BigDecimal> = {
  [`${START_PLACE_ID}|end-b`]: BD.unsafeFromString('12'),
  [`${START_PLACE_ID}|end-c`]: BD.unsafeFromString('30'),
}

/* Stands in for SWR: a disabled query has no data, an enabled one resolves from cache */
vi.mocked(useMileageDistance).mockImplementation(params => ({
  data: params?.isEnabled ? ROUTES[`${params.startPlaceId}|${params.endPlaceId}`] : undefined,
  error: undefined,
}) as ReturnType<typeof useMileageDistance>)

const renderAutofill = () => renderHook(() => {
  const form = useAppForm<TripForm>({ defaultValues: getTripFormDefaultValues() })
  useAutofillTripDistance({ form })

  return form
})

const makePlace = (placeId: string): TripPlace => ({ placeId, latitude: null, longitude: null })

const setRoute = (form: AppForm<TripForm>, endPlaceId: string) => act(() => {
  form.setFieldValue('start', { address: 'Start', place: makePlace(START_PLACE_ID) })
  form.setFieldValue('end', { address: 'End', place: makePlace(endPlaceId) })
})

/* Mirrors the field: handleChange, so the form marks the distance dirty as a user edit would */
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

  it('refills the distance after the user empties it', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)

    expect(distanceOf(result.current)).toBe('12')
  })

  it('still recomputes on an address change after an empty-and-refill cycle', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)
    setRoute(result.current, 'end-c')

    expect(distanceOf(result.current)).toBe('30')
  })
})
