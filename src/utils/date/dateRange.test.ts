import { endOfDay, startOfDay } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  clampToAfterActivationDate,
  clampToPresentOrPast,
  correctDateRange,
  getDateRange,
  getEffectiveDateForMode,
  getEffectiveDateRangeForMode,
  isSameCalendarDayRange,
  isSameDateRange,
} from '@utils/date/dateRange'

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

describe('correctDateRange', () => {
  it('swaps an inverted range', () => {
    expect(correctDateRange({ startDate: ONE_MONTH_BEFORE_NOW, endDate: TWO_MONTHS_BEFORE_NOW })).toEqual({
      startDate: TWO_MONTHS_BEFORE_NOW,
      endDate: ONE_MONTH_BEFORE_NOW,
    })
  })

  it('passes an ordered range through unchanged', () => {
    const ordered = { startDate: TWO_MONTHS_BEFORE_NOW, endDate: ONE_MONTH_BEFORE_NOW }

    expect(correctDateRange(ordered)).toEqual(ordered)
  })
})

describe('isSameDateRange', () => {
  it('is true for ranges with identical endpoints', () => {
    expect(isSameDateRange(
      { startDate: TWO_MONTHS_BEFORE_NOW, endDate: NOW },
      { startDate: TWO_MONTHS_BEFORE_NOW, endDate: NOW },
    )).toBe(true)
  })

  it('is false when an endpoint differs by time of day (exact-timestamp comparison)', () => {
    expect(isSameDateRange(
      { startDate: TWO_MONTHS_BEFORE_NOW, endDate: NOW },
      { startDate: startOfDay(TWO_MONTHS_BEFORE_NOW), endDate: NOW },
    )).toBe(false)
  })
})

describe('isSameCalendarDayRange', () => {
  it('is true when endpoints fall on the same days, ignoring time of day', () => {
    expect(isSameCalendarDayRange(
      { startDate: startOfDay(TWO_MONTHS_BEFORE_NOW), endDate: endOfDay(NOW) },
      { startDate: TWO_MONTHS_BEFORE_NOW, endDate: NOW },
    )).toBe(true)
  })

  it('is false when the endpoints fall on different days', () => {
    expect(isSameCalendarDayRange(
      { startDate: TWO_MONTHS_BEFORE_NOW, endDate: NOW },
      { startDate: ONE_MONTH_BEFORE_NOW, endDate: NOW },
    )).toBe(false)
  })
})

describe('clampToAfterActivationDate', () => {
  it('returns the date unchanged when it is on/after the activation date', () => {
    expect(clampToAfterActivationDate(NOW, TWO_MONTHS_BEFORE_NOW)).toEqual(NOW)
  })

  it('clamps a date before the activation date up to the activation date', () => {
    expect(clampToAfterActivationDate(TWO_MONTHS_BEFORE_NOW, ONE_MONTH_BEFORE_NOW)).toEqual(ONE_MONTH_BEFORE_NOW)
  })
})

describe('clampToPresentOrPast', () => {
  it('returns a past date unchanged', () => {
    expect(clampToPresentOrPast(ONE_MONTH_BEFORE_NOW)).toEqual(ONE_MONTH_BEFORE_NOW)
  })

  it('clamps a future date to the end of today by default', () => {
    expect(clampToPresentOrPast(SIX_MONTHS_AFTER_NOW)).toEqual(END_OF_TODAY)
  })

  it('clamps to an explicit cutoff when one is provided', () => {
    expect(clampToPresentOrPast(NOW, ONE_MONTH_BEFORE_NOW)).toEqual(ONE_MONTH_BEFORE_NOW)
  })
})

describe('getEffectiveDateForMode', () => {
  it('returns the end of the given day in full mode', () => {
    expect(getEffectiveDateForMode('full', { date: THREE_MONTHS_BEFORE_NOW }))
      .toEqual({ date: new Date(2026, 2, 15, 23, 59, 59, 999) })
  })

  it('returns the end of the containing month in month mode', () => {
    expect(getEffectiveDateForMode('month', { date: THREE_MONTHS_BEFORE_NOW }))
      .toEqual({ date: new Date(2026, 2, 31, 23, 59, 59, 999) })
  })

  it('returns the end of the containing year in year mode', () => {
    expect(getEffectiveDateForMode('year', { date: TWO_YEARS_BEFORE_NOW }))
      .toEqual({ date: new Date(2024, 11, 31, 23, 59, 59, 999) })
  })
})

describe('getEffectiveDateRangeForMode', () => {
  it('passes an explicit range through in full mode, clamping the end to the present', () => {
    expect(getEffectiveDateRangeForMode('full', { startDate: FIVE_MONTHS_BEFORE_NOW, endDate: SIX_MONTHS_AFTER_NOW }))
      .toEqual({ startDate: FIVE_MONTHS_BEFORE_NOW, endDate: END_OF_TODAY })
  })

  it('expands to the containing month in month mode', () => {
    expect(getEffectiveDateRangeForMode('month', { startDate: THREE_MONTHS_BEFORE_NOW, endDate: THREE_MONTHS_BEFORE_NOW }))
      .toEqual({ startDate: new Date(2026, 2, 1), endDate: new Date(2026, 2, 31, 23, 59, 59, 999) })
  })
})
