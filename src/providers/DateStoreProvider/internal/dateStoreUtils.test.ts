import { describe, expect, it, vi } from 'vitest'

import { getDateRange, withCorrectedRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'

const NOW = new Date(2026, 5, 15, 12, 0, 0)
const END_OF_TODAY = new Date(2026, 5, 15, 23, 59, 59, 999)

const ONE_MONTH_BEFORE_NOW = new Date(2026, 4, 15, 12, 0, 0)
const TWO_MONTHS_BEFORE_NOW = new Date(2026, 3, 15, 12, 0, 0)
const THREE_MONTHS_BEFORE_NOW = new Date(2026, 2, 15, 12, 0, 0)
const FIVE_MONTHS_BEFORE_NOW = new Date(2026, 0, 15, 12, 0, 0)
const SIX_MONTHS_AFTER_NOW = new Date(2026, 11, 15, 12, 0, 0)
const TWO_YEARS_BEFORE_NOW = new Date(2024, 5, 15, 12, 0, 0)

setupFakeSystemTime(NOW)

describe('getDateRange', () => {
  it('clamps a future end date to the end of today in full mode', () => {
    expect(getDateRange({
      mode: 'full',
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: SIX_MONTHS_AFTER_NOW,
    })).toEqual({
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: END_OF_TODAY,
    })
  })

  it('normalizes a past end date to the end of its day in full mode', () => {
    expect(getDateRange({
      mode: 'full',
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })).toEqual({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: new Date(2026, 4, 15, 23, 59, 59, 999),
    })
  })

  it('expands to the containing month in month mode, clamping the current month to today', () => {
    expect(getDateRange({ mode: 'month', endDate: THREE_MONTHS_BEFORE_NOW })).toEqual({
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
    })

    expect(getDateRange({ mode: 'month', endDate: NOW })).toEqual({
      startDate: new Date(2026, 5, 1),
      endDate: END_OF_TODAY,
    })
  })

  it('expands to the containing year in year mode, clamping the current year to today', () => {
    expect(getDateRange({ mode: 'year', endDate: TWO_YEARS_BEFORE_NOW })).toEqual({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31, 23, 59, 59, 999),
    })

    expect(getDateRange({ mode: 'year', endDate: NOW })).toEqual({
      startDate: new Date(2026, 0, 1),
      endDate: END_OF_TODAY,
    })
  })
})

describe('withCorrectedRange', () => {
  it('swaps an inverted range and passes an ordered range through unchanged', () => {
    const fn = vi.fn((options: { startDate: Date, endDate: Date }) => options)
    const corrected = withCorrectedRange(fn)

    corrected({ startDate: ONE_MONTH_BEFORE_NOW, endDate: TWO_MONTHS_BEFORE_NOW })
    expect(fn).toHaveBeenLastCalledWith({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })

    corrected({ startDate: TWO_MONTHS_BEFORE_NOW, endDate: ONE_MONTH_BEFORE_NOW })
    expect(fn).toHaveBeenLastCalledWith({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })
  })
})
