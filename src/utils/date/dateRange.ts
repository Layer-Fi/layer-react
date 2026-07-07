import {
  endOfDay,
  endOfMonth, endOfQuarter, endOfYear,
  isEqual, isSameDay, max, min,
  startOfDay, startOfMonth, startOfQuarter, startOfYear, subMonths,
  subQuarters,
  subYears,
} from 'date-fns'

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

export type DateSelectionMode = 'full' | 'month' | 'year'

export type DateRange = { startDate: Date, endDate: Date }

export enum Period {
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
}

export enum DatePreset {
  ThisMonth = 'ThisMonth',
  LastMonth = 'LastMonth',
  ThisQuarter = 'ThisQuarter',
  LastQuarter = 'LastQuarter',
  ThisYear = 'ThisYear',
  LastYear = 'LastYear',
  AllTime = 'AllTime',
  Custom = 'Custom',
}

// The user may only select from the presets that are not "Custom".
export type SelectableDatePreset = Exclude<DatePreset, DatePreset.Custom>

// Fallback lower bound for "All Time" when the business has no activation date.
export const ALL_TIME_MIN_DATE = new Date(1970, 0, 1)

type DatePresetContext = {
  now: Date
  activationDate: Date
}

/* Date range clamping helpers */

const clampToValidRange = (range: DateRange, { now, activationDate }: DatePresetContext): DateRange => {
  const rawStartDate = startOfDay(range.startDate)
  const rawEndDate = endOfDay(range.endDate)

  return {
    startDate: max([rawStartDate, startOfDay(activationDate)]),
    endDate: min([rawEndDate, endOfDay(now)]),
  }
}

/* Date range comparison helpers */

export function isSameExactDateRange(a: DateRange, b: DateRange) {
  return isEqual(a.startDate, b.startDate) && isEqual(a.endDate, b.endDate)
}

function isSameDateRangeDayGranularity(a: DateRange, b: DateRange) {
  return !!a.startDate && !!b.startDate && !!a.endDate && !!b.endDate
    && isSameDay(startOfDay(a.startDate), startOfDay(b.startDate))
    && isSameDay(endOfDay(a.endDate), endOfDay(b.endDate))
}

/* Date range calculation helpers */

export function rangeForPeriod(period: Period, referenceDate: Date): DateRange {
  switch (period) {
    case Period.Month: {
      return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate),
      }
    }
    case Period.Quarter: {
      return {
        startDate: startOfQuarter(referenceDate),
        endDate: endOfQuarter(referenceDate),
      }
    }
    case Period.Year: {
      return {
        startDate: startOfYear(referenceDate),
        endDate: endOfYear(referenceDate),
      }
    }
    default:
      return unsafeAssertUnreachable({
        value: period,
        message: `Unhandled period: ${String(period)}`,
      })
  }
}

export function rangeForSelectablePreset(selectedPreset: SelectableDatePreset, { now, activationDate }: DatePresetContext): DateRange {
  switch (selectedPreset) {
    case DatePreset.ThisMonth:
      return rangeForPeriod(Period.Month, now)
    case DatePreset.LastMonth:
      return rangeForPeriod(Period.Month, subMonths(now, 1))
    case DatePreset.ThisQuarter:
      return rangeForPeriod(Period.Quarter, now)
    case DatePreset.LastQuarter:
      return rangeForPeriod(Period.Quarter, subQuarters(now, 1))
    case DatePreset.ThisYear:
      return rangeForPeriod(Period.Year, now)
    case DatePreset.LastYear:
      return rangeForPeriod(Period.Year, subYears(now, 1))
    case DatePreset.AllTime:
      return {
        startDate: activationDate,
        endDate: endOfDay(now),
      }
    default:
      return unsafeAssertUnreachable({
        value: selectedPreset,
        message: `Unhandled preset: ${String(selectedPreset)}`,
      })
  }
}

// Priority order for matching a range back to a preset: the first matching
// preset wins. Periodic presets are checked before AllTime so that a
// business activated on Jan 1 has its range reported as "This Year" rather
// than "All Time".
const DATE_PRESET_MATCH_ORDER = [
  DatePreset.ThisMonth,
  DatePreset.LastMonth,
  DatePreset.ThisQuarter,
  DatePreset.LastQuarter,
  DatePreset.ThisYear,
  DatePreset.LastYear,
  DatePreset.AllTime,
] as const satisfies readonly Exclude<DatePreset, 'Custom'>[]

function dateRangeMatchesPreset(
  dateRange: DateRange,
  preset: SelectableDatePreset,
  { now, activationDate }: DatePresetContext,
): boolean {
  const presetDateRange = clampToValidRange(rangeForSelectablePreset(preset, { now, activationDate }), { now, activationDate })
  return isSameDateRangeDayGranularity(dateRange, presetDateRange)
}

export function findMatchingPresetForDateRange(
  newDateRange: DateRange,
  context: DatePresetContext,
  currentPreset: DatePreset | null = null,
): DatePreset | null {
  const newDateRangeClamped = clampToValidRange(newDateRange, context)

  if (
    currentPreset !== null
    && currentPreset !== DatePreset.Custom
    && dateRangeMatchesPreset(newDateRangeClamped, currentPreset, context)
  ) {
    return currentPreset
  }

  return DATE_PRESET_MATCH_ORDER.find(
    preset => dateRangeMatchesPreset(newDateRangeClamped, preset, context),
  ) ?? null
}
