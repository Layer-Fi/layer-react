import { describe, expect, it } from 'vitest'

import { correctDateRange, getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import {
  END_OF_TODAY,
  FIVE_MONTHS_BEFORE_NOW,
  NOW,
  ONE_MONTH_BEFORE_NOW,
  SIX_MONTHS_AFTER_NOW,
  THREE_MONTHS_BEFORE_NOW,
  TWO_MONTHS_BEFORE_NOW,
  TWO_YEARS_BEFORE_NOW,
} from '@test-utils/fixedDates'

setupFakeSystemTime(NOW)

// getDateRange clamps the end of every mode to the end of today
// (clampToPresentOrPast). The start is never clamped here — bounding it to the
// business activation date is an edge concern, not the store's job.
describe('getDateRange', () => {
  it('clamps a future end date back to the end of today in full mode', () => {
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

  it('expands to the containing month, clamping the current month to today', () => {
    expect(getDateRange({ mode: 'month', endDate: THREE_MONTHS_BEFORE_NOW })).toEqual({
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
    })

    expect(getDateRange({ mode: 'month', endDate: NOW })).toEqual({
      startDate: new Date(2026, 5, 1),
      endDate: END_OF_TODAY,
    })
  })

  it('expands to the containing year, clamping the current year to today', () => {
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

describe('correctDateRange', () => {
  it('swaps an inverted range and passes an ordered range through unchanged', () => {
    expect(correctDateRange({ startDate: ONE_MONTH_BEFORE_NOW, endDate: TWO_MONTHS_BEFORE_NOW })).toEqual({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })

    expect(correctDateRange({ startDate: TWO_MONTHS_BEFORE_NOW, endDate: ONE_MONTH_BEFORE_NOW })).toEqual({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })
  })
})
