import { act, renderHook } from '@testing-library/react'
import { BigDecimal as BD } from 'effect'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fromNonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/common/nonRecursiveBigDecimal'
import type { Trip } from '@schemas/features/mileage/trip'
import type { TripForm, TripPlace } from '@schemas/features/mileage/tripForm'
import { useGetMileageDistance } from '@api/businesses/[business-id]/mileage/distance/get'
import { useAppForm } from '@blocks/Form/useForm'
import { getTripFormDefaultValues } from '@features/mileage/TripForm/formUtils'
import { useAutofillTripDistance } from '@features/mileage/TripForm/useAutofillTripDistance'

import { makeTrip } from '@fixtures/trips/mocks'

vi.mock('@api/businesses/[business-id]/mileage/distance/get', () => ({
  useGetMileageDistance: vi.fn(),
}))

const START_PLACE_ID = 'start-a'

/* Built once per key, because SWR hands back the same cached object on a re-render */
const ROUTES: Record<string, BD.BigDecimal> = {
  [`${START_PLACE_ID}|end-b`]: BD.unsafeFromString('12'),
  [`${START_PLACE_ID}|end-c`]: BD.unsafeFromString('30'),
}

beforeEach(() => {
  vi.mocked(useGetMileageDistance).mockImplementation(params => ({
    data: params?.isEnabled ? ROUTES[`${params.startPlaceId}|${params.endPlaceId}`] : undefined,
    error: undefined,
  }) as ReturnType<typeof useGetMileageDistance>)
})

const renderAutofill = (trip?: Trip) => renderHook(() => {
  const form = useAppForm<TripForm>({ defaultValues: getTripFormDefaultValues(trip) })
  const { notifyAddressChange } = useAutofillTripDistance({ form })

  return { form, notifyAddressChange }
})

type Rendered = ReturnType<typeof renderAutofill>['result']['current']

const makePlace = (placeId: string): TripPlace => ({ placeId, latitude: null, longitude: null })

/* Address helpers notify like TripForm's field onChange listeners do */
const setStart = ({ form, notifyAddressChange }: Rendered) => act(() => {
  form.setFieldValue('start', { address: 'Start', place: makePlace(START_PLACE_ID) })
  notifyAddressChange()
})

const setEnd = ({ form, notifyAddressChange }: Rendered, endPlaceId: string) => act(() => {
  form.setFieldValue('end', { address: 'End', place: makePlace(endPlaceId) })
  notifyAddressChange()
})

const clearEnd = ({ form, notifyAddressChange }: Rendered) => act(() => {
  form.setFieldValue('end', { address: '', place: null })
  notifyAddressChange()
})

const setRoute = (rendered: Rendered, endPlaceId: string) => {
  setStart(rendered)
  setEnd(rendered, endPlaceId)
}

const enterDistance = ({ form }: Rendered, miles: string | null) => act(() => {
  form.setFieldValue(
    'distance',
    miles === null ? null : toNonRecursiveBigDecimal(BD.unsafeFromString(miles)),
  )
})

const distanceOf = ({ form }: Rendered) => {
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

  it('never fills over a distance typed before autofill could, and clearing it stays empty', () => {
    const { result } = renderAutofill()

    setStart(result.current)
    enterDistance(result.current, '99')
    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('99')

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

  it('stays empty after a clear until an address is selected again, even the same one', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)

    expect(distanceOf(result.current)).toBeNull()

    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('12')

    enterDistance(result.current, null)
    clearEnd(result.current)
    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('12')
  })

  it('recomputes for each selection made after the field was emptied', () => {
    const { result } = renderAutofill()

    setRoute(result.current, 'end-b')
    enterDistance(result.current, null)
    setEnd(result.current, 'end-c')

    expect(distanceOf(result.current)).toBe('30')

    setEnd(result.current, 'end-b')

    expect(distanceOf(result.current)).toBe('12')
  })
})
