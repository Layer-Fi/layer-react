import { act, renderHook } from '@testing-library/react'
import { BigDecimal as BD } from 'effect'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { fromNonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { TripForm, TripPlace } from '@schemas/trip'
import { useMileageDistance } from '@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance'
import { useAppForm } from '@hooks/features/forms/useForm'
import { getTripFormDefaultValues } from '@components/Trips/TripForm/formUtils'
import { useAutofillTripDistance } from '@components/Trips/TripForm/useAutofillTripDistance'

vi.mock('@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance', () => ({
  useMileageDistance: vi.fn(),
}))

/* Built once per key: SWR hands back the same cached object on a re-render */
const ROUTES: Record<string, BD.BigDecimal> = {
  'start-a|end-b': BD.unsafeFromString('12'),
  'start-a|end-c': BD.unsafeFromString('30'),
}

/*
 * Stands in for SWR: a disabled query has no data, and an enabled one resolves
 * synchronously from cache — the state both bugs depend on.
 */
vi.mocked(useMileageDistance).mockImplementation((params) => {
  const { startPlaceId, endPlaceId, isEnabled } = params as {
    startPlaceId: string
    endPlaceId: string
    isEnabled: boolean
  }

  return {
    data: isEnabled ? ROUTES[`${startPlaceId}|${endPlaceId}`] : undefined,
    error: undefined,
  } as ReturnType<typeof useMileageDistance>
})

const renderAutofill = () => renderHook(() => {
  const form = useAppForm<TripForm>({ defaultValues: getTripFormDefaultValues() })

  return { form, ...useAutofillTripDistance({ form }) }
})

const distanceOf = (form: { state: { values: TripForm } }) => {
  const { distance } = form.state.values

  return distance === null ? null : BD.format(fromNonRecursiveBigDecimal(distance))
}

const makePlace = (placeId: string): TripPlace =>
  ({ placeId, latitude: null, longitude: null })

const setPlaces = (
  form: ReturnType<typeof renderAutofill>['result']['current']['form'],
  endPlaceId: string,
) => {
  act(() => {
    form.setFieldValue('start', { address: 'A', place: makePlace('start-a') })
    form.setFieldValue('end', { address: 'B', place: makePlace(endPlaceId) })
  })
}

const setDistance = (
  form: ReturnType<typeof renderAutofill>['result']['current']['form'],
  value: string | null,
) => {
  act(() => {
    form.setFieldValue(
      'distance',
      value === null ? null : toNonRecursiveBigDecimal(BD.unsafeFromString(value)),
    )
  })
}

afterEach(() => vi.clearAllMocks())

describe('useAutofillTripDistance', () => {
  it('fills an empty distance once both places are set', () => {
    const { result } = renderAutofill()

    setPlaces(result.current.form, 'end-b')

    expect(distanceOf(result.current.form)).toBe('12')
  })

  it('leaves a user-entered distance alone', () => {
    const { result } = renderAutofill()

    setPlaces(result.current.form, 'end-b')
    setDistance(result.current.form, '99')

    expect(distanceOf(result.current.form)).toBe('99')
  })

  it('refills the distance after the user empties it', () => {
    const { result } = renderAutofill()

    setPlaces(result.current.form, 'end-b')
    setDistance(result.current.form, null)

    expect(distanceOf(result.current.form)).toBe('12')
  })

  it('still recomputes on an address change after an empty-and-refill cycle', () => {
    const { result } = renderAutofill()

    setPlaces(result.current.form, 'end-b')
    setDistance(result.current.form, null)
    setPlaces(result.current.form, 'end-c')

    expect(distanceOf(result.current.form)).toBe('30')
  })
})
