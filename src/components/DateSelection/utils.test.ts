import { endOfMonth, endOfYear, startOfMonth, startOfYear, subDays } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ALL_TIME_MIN_DATE,
  DatePreset,
  presetForDateRange,
  rangeForPreset,
} from '@components/DateSelection/utils'

const NOW = new Date(2026, 5, 15, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe(rangeForPreset, () => {
  it('returns the current month for ThisMonth', () => {
    const range = rangeForPreset(DatePreset.ThisMonth)

    expect(range.startDate).toEqual(startOfMonth(NOW))
    expect(range.endDate).toEqual(endOfMonth(NOW))
  })

  it('returns activation date through now for AllTime when an activation date exists', () => {
    const activationDate = new Date(2024, 2, 10)

    const range = rangeForPreset(DatePreset.AllTime, { activationDate })

    expect(range.startDate).toEqual(activationDate)
    expect(range.endDate).toEqual(NOW)
  })

  it('falls back to the fixed minimum for AllTime without an activation date', () => {
    const range = rangeForPreset(DatePreset.AllTime)

    expect(range.startDate).toEqual(ALL_TIME_MIN_DATE)
    expect(range.endDate).toEqual(NOW)
  })
})

describe(presetForDateRange, () => {
  it('detects a year-to-date range as ThisYear', () => {
    const range = { startDate: startOfYear(NOW), endDate: endOfYear(NOW) }

    expect(presetForDateRange(range)).toBe(DatePreset.ThisYear)
  })

  it('detects an AllTime range with an activation date', () => {
    const activationDate = new Date(2024, 2, 10)
    const range = rangeForPreset(DatePreset.AllTime, { activationDate })

    expect(presetForDateRange(range, null, activationDate)).toBe(DatePreset.AllTime)
  })

  it('detects an AllTime range without an activation date', () => {
    const range = rangeForPreset(DatePreset.AllTime)

    expect(presetForDateRange(range)).toBe(DatePreset.AllTime)
  })

  it('prefers ThisYear over AllTime when the activation date is Jan 1 of this year', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForPreset(DatePreset.AllTime, { activationDate })

    expect(presetForDateRange(range, null, activationDate)).toBe(DatePreset.ThisYear)
  })

  it('keeps an explicitly selected AllTime sticky over an equivalent periodic preset', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForPreset(DatePreset.AllTime, { activationDate })

    expect(presetForDateRange(range, DatePreset.AllTime, activationDate)).toBe(DatePreset.AllTime)
  })

  it('returns null for a range matching no preset', () => {
    const range = { startDate: subDays(NOW, 3), endDate: NOW }

    expect(presetForDateRange(range)).toBeNull()
  })
})
