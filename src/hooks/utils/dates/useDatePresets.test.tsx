import { renderHook } from '@testing-library/react'
import { endOfMonth, startOfMonth } from 'date-fns'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ALL_TIME_MIN_DATE, DatePreset } from '@utils/date/dateRange'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { useDatePresets } from '@hooks/utils/dates/useDatePresets'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import { END_OF_TODAY, NOW } from '@test-utils/fixedDates'

vi.mock('@hooks/features/business/useBusinessActivationDate', () => ({
  useBusinessActivationDate: vi.fn(),
}))

const mockedUseBusinessActivationDate = vi.mocked(useBusinessActivationDate)

// Pins the clock so the hook's internal `new Date()` resolves to NOW.
setupFakeSystemTime(NOW)

afterEach(() => vi.restoreAllMocks())

describe('useDatePresets', () => {
  it('reads "now" at call time so ranges roll over without a re-render', () => {
    mockedUseBusinessActivationDate.mockReturnValue(undefined)

    const { result } = renderHook(() => useDatePresets())

    // Initial selection resolves against NOW (June 2026).
    expect(result.current.rangeForSelectablePreset(DatePreset.ThisMonth).startDate)
      .toEqual(startOfMonth(NOW))

    // The app stays open into the next month; activationDate is unchanged, so the
    // hook does not recompute. A later selection must still reflect the new clock.
    const nextMonth = new Date(2026, 6, 3, 12, 0, 0)
    vi.setSystemTime(nextMonth)

    expect(result.current.rangeForSelectablePreset(DatePreset.ThisMonth).startDate)
      .toEqual(startOfMonth(nextMonth))
  })

  it('exposes the business activation date when one exists', () => {
    const activationDate = new Date(2024, 2, 10)
    mockedUseBusinessActivationDate.mockReturnValue(activationDate)

    const { result } = renderHook(() => useDatePresets())

    expect(result.current.activationDate).toEqual(activationDate)
  })

  it('falls back to the fixed minimum when there is no activation date', () => {
    mockedUseBusinessActivationDate.mockReturnValue(undefined)

    const { result } = renderHook(() => useDatePresets())

    expect(result.current.activationDate).toEqual(ALL_TIME_MIN_DATE)
  })

  it('binds "now" into rangeForSelectablePreset', () => {
    mockedUseBusinessActivationDate.mockReturnValue(undefined)

    const { result } = renderHook(() => useDatePresets())
    const range = result.current.rangeForSelectablePreset(DatePreset.ThisMonth)

    expect(range.startDate).toEqual(startOfMonth(NOW))
    expect(range.endDate).toEqual(endOfMonth(NOW))
  })

  it('binds the activation date into rangeForSelectablePreset for AllTime', () => {
    const activationDate = new Date(2024, 2, 10)
    mockedUseBusinessActivationDate.mockReturnValue(activationDate)

    const { result } = renderHook(() => useDatePresets())
    const range = result.current.rangeForSelectablePreset(DatePreset.AllTime)

    expect(range.startDate).toEqual(activationDate)
    expect(range.endDate).toEqual(END_OF_TODAY)
  })

  it('round-trips a preset range back to its preset via findMatchingPresetForDateRange', () => {
    mockedUseBusinessActivationDate.mockReturnValue(undefined)

    const { result } = renderHook(() => useDatePresets())
    const range = result.current.rangeForSelectablePreset(DatePreset.ThisMonth)

    expect(result.current.findMatchingPresetForDateRange(range)).toBe(DatePreset.ThisMonth)
  })

  it('keeps a stable context across renders when the activation date is unchanged', () => {
    mockedUseBusinessActivationDate.mockReturnValue(undefined)

    const { result, rerender } = renderHook(() => useDatePresets())
    const first = result.current.rangeForSelectablePreset

    rerender()

    expect(result.current.rangeForSelectablePreset).toBe(first)
  })
})
