import {
  endOfDay,
  endOfMonth, endOfQuarter, endOfYear,
  min,
  startOfDay, startOfMonth, startOfQuarter, startOfYear,
  subMonths, subQuarters, subYears,
} from 'date-fns'

import { clampToAfterActivationDate, clampToPresentOrPast, type DateRange, isSameCalendarDayRange } from '@utils/date/dateRange'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

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
  /** Spans the business activation date to the present; requires the business context to resolve. */
  AllTime = 'AllTime',
  /** Set by the store when a range matches no other preset; not directly selectable. */
  Custom = 'Custom',
}

// A date preset that can be computed from `now` alone.
export type RelativeDatePreset = Exclude<DatePreset, DatePreset.Custom | DatePreset.AllTime>
// A date preset that can be selected directly by the user.
export type SelectableDatePreset = Exclude<DatePreset, DatePreset.Custom>

/* Range calculation */

export function rangeForPeriod(period: Period, referenceDate: Date): DateRange {
  switch (period) {
    case Period.Month:
      return { startDate: startOfMonth(referenceDate), endDate: endOfMonth(referenceDate) }
    case Period.Quarter:
      return { startDate: startOfQuarter(referenceDate), endDate: endOfQuarter(referenceDate) }
    case Period.Year:
      return { startDate: startOfYear(referenceDate), endDate: endOfYear(referenceDate) }
    default:
      return unsafeAssertUnreachable({ value: period, message: `Unhandled period: ${String(period)}` })
  }
}

export function rangeForPreset(preset: RelativeDatePreset, now: Date = new Date()): DateRange {
  switch (preset) {
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
    default:
      return unsafeAssertUnreachable({ value: preset, message: `Unhandled preset: ${String(preset)}` })
  }
}

/** Separate from {@link rangeForPreset} because it needs the business activation date. */
export function rangeForAllTime(activationDate: Date, now: Date = new Date()): DateRange {
  return {
    startDate: min([startOfDay(activationDate), startOfDay(now)]),
    endDate: endOfDay(now),
  }
}

/** Returns `null` for `AllTime` while the activation date is unavailable. */
export function deriveDateRangeFromPreset(
  preset: SelectableDatePreset,
  activationDate?: Date,
): DateRange | null {
  if (preset === DatePreset.AllTime) {
    return activationDate ? rangeForAllTime(activationDate) : null
  }
  return rangeForPreset(preset)
}

/* Range → preset matching */

function clampRangeToValid(range: DateRange, activationDate?: Date | null): DateRange {
  const startDate = startOfDay(range.startDate)
  const endDate = endOfDay(range.endDate)

  return {
    startDate: activationDate ? clampToAfterActivationDate(startDate, startOfDay(activationDate)) : startDate,
    endDate: clampToPresentOrPast(endDate),
  }
}

// First match wins.
const PRESET_MATCH_ORDER = [
  DatePreset.ThisMonth,
  DatePreset.LastMonth,
  DatePreset.ThisQuarter,
  DatePreset.LastQuarter,
  DatePreset.ThisYear,
  DatePreset.LastYear,
  DatePreset.AllTime,
] as const satisfies readonly SelectableDatePreset[]

function rangeMatchesPreset(range: DateRange, preset: SelectableDatePreset, activationDate?: Date): boolean {
  const presetRange = deriveDateRangeFromPreset(preset, activationDate)
  // AllTime without an activation date has no concrete range, so it can't match.
  if (presetRange === null) return false
  return isSameCalendarDayRange(clampRangeToValid(range, activationDate), clampRangeToValid(presetRange, activationDate))
}

/**
 * When a range matches several presets (e.g. `ThisYear` and `AllTime` for a business
 * activated on January 1st), `previousPreset` stays selected; without one, relative presets win.
 */
export function derivePresetFromDateRange(
  input: DateRange,
  previousPreset: DatePreset | null = null,
  activationDate?: Date,
): DatePreset {
  if (
    previousPreset !== null
    && previousPreset !== DatePreset.Custom
    && rangeMatchesPreset(input, previousPreset, activationDate)
  ) {
    return previousPreset
  }

  return PRESET_MATCH_ORDER.find(preset => rangeMatchesPreset(input, preset, activationDate)) ?? DatePreset.Custom
}
