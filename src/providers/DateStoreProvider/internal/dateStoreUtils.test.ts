import { addMonths, endOfDay, endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getDateRange, withCorrectedRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'

const NOW = new Date(2026, 5, 15, 12, 0, 0)
const ONE_MONTH_BEFORE_NOW = subMonths(NOW, 1)
const TWO_MONTHS_BEFORE_NOW = subMonths(NOW, 2)
const THREE_MONTHS_BEFORE_NOW = subMonths(NOW, 3)
const FIVE_MONTHS_BEFORE_NOW = subMonths(NOW, 5)
const SIX_MONTHS_AFTER_NOW = addMonths(NOW, 6)
const TWO_YEARS_BEFORE_NOW = subYears(NOW, 2)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getDateRange', () => {
  it('clamps a future end date to the end of today in full mode', () => {
    expect(getDateRange({
      mode: 'full',
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: SIX_MONTHS_AFTER_NOW,
    })).toEqual({
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: endOfDay(NOW),
    })
  })

  it('normalizes a past end date to the end of its day in full mode', () => {
    expect(getDateRange({
      mode: 'full',
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })).toEqual({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: endOfDay(ONE_MONTH_BEFORE_NOW),
    })
  })

  it('expands to the containing month in month mode, clamping the current month to today', () => {
    expect(getDateRange({ mode: 'month', endDate: THREE_MONTHS_BEFORE_NOW })).toEqual({
      startDate: startOfMonth(THREE_MONTHS_BEFORE_NOW),
      endDate: endOfMonth(THREE_MONTHS_BEFORE_NOW),
    })

    expect(getDateRange({ mode: 'month', endDate: NOW })).toEqual({
      startDate: startOfMonth(NOW),
      endDate: endOfDay(NOW),
    })
  })

  it('expands to the containing year in year mode, clamping the current year to today', () => {
    expect(getDateRange({ mode: 'year', endDate: TWO_YEARS_BEFORE_NOW })).toEqual({
      startDate: startOfYear(TWO_YEARS_BEFORE_NOW),
      endDate: endOfYear(TWO_YEARS_BEFORE_NOW),
    })

    expect(getDateRange({ mode: 'year', endDate: NOW })).toEqual({
      startDate: startOfYear(NOW),
      endDate: endOfDay(NOW),
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
