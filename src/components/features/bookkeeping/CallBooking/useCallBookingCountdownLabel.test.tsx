import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCallBookingCountdownLabel } from '@features/bookkeeping/CallBooking/useCallBookingCountdownLabel'

import { setupFakeSystemTime } from '@testUtils/dates/fakeSystemTime'
import { NOW } from '@testUtils/dates/fixedDates'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

setupFakeSystemTime(NOW)

const renderCountdownLabel = (eventStartAt: Date | undefined) =>
  renderHook(() => useCallBookingCountdownLabel(eventStartAt), { wrapper: LayerTestProvider })

describe('useCallBookingCountdownLabel', () => {
  it('returns an empty string when there is no scheduled call', () => {
    const { result } = renderCountdownLabel(undefined)

    expect(result.current).toBe('')
  })

  it('returns an empty string once the call has already started', () => {
    const { result } = renderCountdownLabel(NOW)

    expect(result.current).toBe('')
  })

  it('counts down in whole days when more than a day away', () => {
    const twoDaysOut = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const { result } = renderCountdownLabel(twoDaysOut)

    expect(result.current).toBe('in 2 days')
  })

  it('uses singular day phrasing for exactly one day out', () => {
    const oneDayOut = new Date(NOW.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const { result } = renderCountdownLabel(oneDayOut)

    expect(result.current).toBe('in 1 day')
  })

  it('counts down in whole hours when less than a day but more than an hour away', () => {
    const fiveHoursOut = new Date(NOW.getTime() + 5 * 60 * 60 * 1000)
    const { result } = renderCountdownLabel(fiveHoursOut)

    expect(result.current).toBe('in 5 hours')
  })

  it('uses singular hour phrasing for exactly one hour out', () => {
    const oneHourOut = new Date(NOW.getTime() + 60 * 60 * 1000 + 60 * 1000)
    const { result } = renderCountdownLabel(oneHourOut)

    expect(result.current).toBe('in 1 hour')
  })

  it('shows "starting soon" for less than an hour away', () => {
    const thirtyMinutesOut = new Date(NOW.getTime() + 30 * 60 * 1000)
    const { result } = renderCountdownLabel(thirtyMinutesOut)

    expect(result.current).toBe('starting soon')
  })
})
