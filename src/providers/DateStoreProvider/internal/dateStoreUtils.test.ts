import { describe, expect, it } from 'vitest'

import { correctDateRange, getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'

import {
  FIVE_MONTHS_BEFORE_NOW,
  NOW,
  ONE_MONTH_BEFORE_NOW,
  SIX_MONTHS_AFTER_NOW,
  THREE_MONTHS_BEFORE_NOW,
  TWO_MONTHS_BEFORE_NOW,
  TWO_YEARS_BEFORE_NOW,
} from '@test-utils/fixedDates'

describe('getDateRange', () => {
  it('normalizes the end date to the end of its day in full mode without clamping to today', () => {
    expect(getDateRange({
      mode: 'full',
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: SIX_MONTHS_AFTER_NOW,
    })).toEqual({
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: new Date(2026, 11, 15, 23, 59, 59, 999),
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

  it('expands to the full containing month in month mode', () => {
    expect(getDateRange({ mode: 'month', endDate: THREE_MONTHS_BEFORE_NOW })).toEqual({
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
    })

    expect(getDateRange({ mode: 'month', endDate: NOW })).toEqual({
      startDate: new Date(2026, 5, 1),
      endDate: new Date(2026, 5, 30, 23, 59, 59, 999),
    })
  })

  it('expands to the full containing year in year mode', () => {
    expect(getDateRange({ mode: 'year', endDate: TWO_YEARS_BEFORE_NOW })).toEqual({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31, 23, 59, 59, 999),
    })

    expect(getDateRange({ mode: 'year', endDate: NOW })).toEqual({
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 11, 31, 23, 59, 59, 999),
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
