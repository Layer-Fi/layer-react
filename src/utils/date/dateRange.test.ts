import { endOfDay, endOfMonth, endOfYear, startOfMonth, startOfYear, subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  ALL_TIME_MIN_DATE,
  DatePreset,
  findMatchingPresetForDateRange,
  rangeForSelectablePreset,
} from '@utils/date/dateRange'

import { NOW } from '@test-utils/fixedDates'

describe(rangeForSelectablePreset, () => {
  it('returns the current month for ThisMonth', () => {
    const range = rangeForSelectablePreset(DatePreset.ThisMonth, {
      now: NOW,
      activationDate: ALL_TIME_MIN_DATE,
    })

    expect(range.startDate).toEqual(startOfMonth(NOW))
    expect(range.endDate).toEqual(endOfMonth(NOW))
  })

  it('returns activation date through now for AllTime when an activation date exists', () => {
    const activationDate = new Date(2024, 2, 10)

    const range = rangeForSelectablePreset(DatePreset.AllTime, { now: NOW, activationDate })

    expect(range.startDate).toEqual(activationDate)
    expect(range.endDate).toEqual(endOfDay(NOW))
  })

  it('falls back to the fixed minimum for AllTime without an activation date', () => {
    const range = rangeForSelectablePreset(DatePreset.AllTime, {
      now: NOW,
      activationDate: ALL_TIME_MIN_DATE,
    })

    expect(range.startDate).toEqual(ALL_TIME_MIN_DATE)
    expect(range.endDate).toEqual(endOfDay(NOW))
  })
})

describe(findMatchingPresetForDateRange, () => {
  it('detects a year-to-date range as ThisYear', () => {
    const range = { startDate: startOfYear(NOW), endDate: endOfYear(NOW) }

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate: ALL_TIME_MIN_DATE })).toBe(DatePreset.ThisYear)
  })

  it('detects an AllTime range with an activation date', () => {
    const activationDate = new Date(2024, 2, 10)
    const range = rangeForSelectablePreset(DatePreset.AllTime, { now: NOW, activationDate })

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate })).toBe(DatePreset.AllTime)
  })

  it('detects an AllTime range without an activation date', () => {
    const range = rangeForSelectablePreset(DatePreset.AllTime, {
      now: NOW,
      activationDate: ALL_TIME_MIN_DATE,
    })

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate: ALL_TIME_MIN_DATE })).toBe(DatePreset.AllTime)
  })

  it('prefers ThisYear over AllTime when the activation date is Jan 1 of this year', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForSelectablePreset(DatePreset.AllTime, { now: NOW, activationDate })

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate })).toBe(DatePreset.ThisYear)
  })

  it('keeps an explicitly selected AllTime sticky over an equivalent periodic preset', () => {
    const activationDate = startOfYear(NOW)
    const range = rangeForSelectablePreset(DatePreset.AllTime, { now: NOW, activationDate })

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate }, DatePreset.AllTime)).toBe(DatePreset.AllTime)
  })

  it('returns null for a range matching no preset', () => {
    const range = { startDate: subDays(NOW, 3), endDate: NOW }

    expect(findMatchingPresetForDateRange(range, { now: NOW, activationDate: ALL_TIME_MIN_DATE })).toBeNull()
  })
})
