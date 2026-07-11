import { endOfMonth, endOfQuarter, endOfYear, startOfMonth, startOfQuarter, startOfYear, subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  DatePreset,
  deriveDateRangeFromPreset,
  derivePresetFromDateRange,
  Period,
  rangeForAllTime,
  rangeForPeriod,
  rangeForPreset,
} from '@utils/date/dateRangePresets'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import { CURRENT_YEAR_TO_DATE, END_OF_TODAY, NOW, THREE_MONTHS_BEFORE_NOW, TWO_YEARS_BEFORE_NOW } from '@test-utils/fixedDates'

setupFakeSystemTime(NOW)

describe('rangeForPeriod', () => {
  it('returns the month containing the reference date', () => {
    expect(rangeForPeriod(Period.Month, THREE_MONTHS_BEFORE_NOW)).toEqual({
      startDate: startOfMonth(THREE_MONTHS_BEFORE_NOW),
      endDate: endOfMonth(THREE_MONTHS_BEFORE_NOW),
    })
  })

  it('returns the quarter containing the reference date', () => {
    expect(rangeForPeriod(Period.Quarter, THREE_MONTHS_BEFORE_NOW)).toEqual({
      startDate: startOfQuarter(THREE_MONTHS_BEFORE_NOW),
      endDate: endOfQuarter(THREE_MONTHS_BEFORE_NOW),
    })
  })

  it('returns the year containing the reference date', () => {
    expect(rangeForPeriod(Period.Year, TWO_YEARS_BEFORE_NOW)).toEqual({
      startDate: startOfYear(TWO_YEARS_BEFORE_NOW),
      endDate: endOfYear(TWO_YEARS_BEFORE_NOW),
    })
  })
})

describe('rangeForPreset', () => {
  it('returns the current month for ThisMonth', () => {
    expect(rangeForPreset(DatePreset.ThisMonth)).toEqual({
      startDate: startOfMonth(NOW),
      endDate: endOfMonth(NOW),
    })
  })

  it('returns the current year for ThisYear', () => {
    expect(rangeForPreset(DatePreset.ThisYear)).toEqual({
      startDate: startOfYear(NOW),
      endDate: endOfYear(NOW),
    })
  })
})

describe('rangeForAllTime', () => {
  it('spans the activation date (start of day) through the end of today', () => {
    const activationDate = new Date(2024, 2, 10, 8, 30)

    expect(rangeForAllTime(activationDate)).toEqual({
      startDate: new Date(2024, 2, 10),
      endDate: END_OF_TODAY,
    })
  })
})

describe('deriveDateRangeFromPreset', () => {
  it('resolves a relative preset without needing an activation date', () => {
    expect(deriveDateRangeFromPreset(DatePreset.ThisYear)).toEqual(rangeForPreset(DatePreset.ThisYear))
  })

  it('resolves AllTime when an activation date is available', () => {
    const activationDate = new Date(2024, 2, 10)

    expect(deriveDateRangeFromPreset(DatePreset.AllTime, activationDate)).toEqual(rangeForAllTime(activationDate))
  })

  it('returns null for AllTime without an activation date (defer rather than guess a range)', () => {
    expect(deriveDateRangeFromPreset(DatePreset.AllTime)).toBeNull()
  })
})

describe('derivePresetFromDateRange', () => {
  it('detects a year-to-date range as ThisYear', () => {
    expect(derivePresetFromDateRange(CURRENT_YEAR_TO_DATE)).toBe(DatePreset.ThisYear)
  })

  it('detects an AllTime range when given the activation date', () => {
    const activationDate = new Date(2024, 2, 10)
    const range = rangeForAllTime(activationDate)

    expect(derivePresetFromDateRange(range, null, activationDate)).toBe(DatePreset.AllTime)
  })

  it('respects a matching previous preset', () => {
    const range = rangeForPreset(DatePreset.ThisMonth)

    expect(derivePresetFromDateRange(range, DatePreset.ThisMonth)).toBe(DatePreset.ThisMonth)
  })

  it('returns Custom for a range that matches no preset', () => {
    const range = { startDate: subDays(NOW, 3), endDate: NOW }

    expect(derivePresetFromDateRange(range)).toBe(DatePreset.Custom)
  })

  // When a business activates on a period boundary (e.g. Jan 1), its AllTime range
  // coincides with ThisYear. AllTime is matched only after the periodic presets, so
  // the more specific ThisYear wins rather than the range being reported as AllTime.
  it('prefers a periodic preset over AllTime when the activation date is a period boundary', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForAllTime(activationDate)

    expect(derivePresetFromDateRange(range, null, activationDate)).toBe(DatePreset.ThisYear)
  })

  // ...unless AllTime was the explicit prior selection, in which case it stays sticky.
  it('keeps an explicitly selected AllTime sticky over an equivalent periodic preset', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForAllTime(activationDate)

    expect(derivePresetFromDateRange(range, DatePreset.AllTime, activationDate)).toBe(DatePreset.AllTime)
  })
})
