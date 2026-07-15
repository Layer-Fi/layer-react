import { startOfDay } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { DatePreset, derivePresetFromDateRange, rangeForAllTime } from '@utils/date/dateRangePresets'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import {
  CURRENT_YEAR_TO_DATE,
  END_OF_TODAY,
  FIVE_MONTHS_BEFORE_NOW,
  NOW,
  PREVIOUS_MONTH_RANGE,
  SIX_MONTHS_AFTER_NOW,
  THREE_MONTHS_BEFORE_NOW,
  TWO_YEARS_BEFORE_NOW,
} from '@test-utils/fixedDates'

const START_OF_CURRENT_YEAR = CURRENT_YEAR_TO_DATE.startDate

describe('rangeForAllTime', () => {
  setupFakeSystemTime(NOW)

  it('spans the activation date to the present', () => {
    expect(rangeForAllTime(TWO_YEARS_BEFORE_NOW)).toEqual({
      startDate: startOfDay(TWO_YEARS_BEFORE_NOW),
      endDate: END_OF_TODAY,
    })
  })

  it('clamps the start date to today when the activation date is in the future', () => {
    expect(rangeForAllTime(SIX_MONTHS_AFTER_NOW)).toEqual({
      startDate: startOfDay(NOW),
      endDate: END_OF_TODAY,
    })
  })
})

describe('derivePresetFromDateRange', () => {
  setupFakeSystemTime(NOW)

  it('derives a relative preset', () => {
    expect(derivePresetFromDateRange(PREVIOUS_MONTH_RANGE)).toBe(DatePreset.LastMonth)
  })

  it('derives AllTime when the range spans activation to present', () => {
    const preset = derivePresetFromDateRange(
      { startDate: TWO_YEARS_BEFORE_NOW, endDate: NOW },
      null,
      TWO_YEARS_BEFORE_NOW,
    )

    expect(preset).toBe(DatePreset.AllTime)
  })

  it('derives Custom when the range matches no preset', () => {
    const preset = derivePresetFromDateRange(
      { startDate: FIVE_MONTHS_BEFORE_NOW, endDate: THREE_MONTHS_BEFORE_NOW },
      null,
      TWO_YEARS_BEFORE_NOW,
    )

    expect(preset).toBe(DatePreset.Custom)
  })

  it('derives Custom for an activation-spanning range when the activation date is unavailable', () => {
    const preset = derivePresetFromDateRange({ startDate: TWO_YEARS_BEFORE_NOW, endDate: NOW })

    expect(preset).toBe(DatePreset.Custom)
  })

  describe('when the AllTime range coincides with This Year (activation on January 1st)', () => {
    it('keeps a previous ThisYear selection', () => {
      const preset = derivePresetFromDateRange(
        CURRENT_YEAR_TO_DATE,
        DatePreset.ThisYear,
        START_OF_CURRENT_YEAR,
      )

      expect(preset).toBe(DatePreset.ThisYear)
    })

    it('keeps a previous AllTime selection', () => {
      const preset = derivePresetFromDateRange(
        CURRENT_YEAR_TO_DATE,
        DatePreset.AllTime,
        START_OF_CURRENT_YEAR,
      )

      expect(preset).toBe(DatePreset.AllTime)
    })

    it('prefers the relative preset without a previous selection', () => {
      const preset = derivePresetFromDateRange(
        CURRENT_YEAR_TO_DATE,
        null,
        START_OF_CURRENT_YEAR,
      )

      expect(preset).toBe(DatePreset.ThisYear)
    })
  })
})
