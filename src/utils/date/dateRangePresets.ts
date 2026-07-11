import {
  endOfDay,
  endOfMonth, endOfQuarter, endOfYear,
  startOfDay, startOfMonth, startOfQuarter, startOfYear,
  subMonths, subQuarters, subYears,
} from 'date-fns'

import { clampToAfterActivationDate, clampToPresentOrPast, correctDateRange, type DateRange, isSameCalendarDayRange } from '@utils/date/dateRange'
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
  /**
   * Clamped to the business activation date (start) and the present (end).
   * Unlike the other presets, its range cannot be resolved from `now` alone —
   * it requires the business context. See `useResolvedInitialRange`.
   */
  AllTime = 'AllTime',
  /*
  * The custom preset cannot be selected directly by the user. It can only be set by the store if
  * the user sets a date range that is not one of the other presets.
  */
  Custom = 'Custom',
}

// A date preset that can be computed from `now` alone.
export type RelativeDatePreset = Exclude<DatePreset, DatePreset.Custom | DatePreset.AllTime>
// A date preset that can be selected directly by the user.
export type SelectableDatePreset = Exclude<DatePreset, DatePreset.Custom>

/* Range calculation */

/** The full calendar range of the period containing `referenceDate`. */
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

/**
 * The range for a relative preset — a pure function of `now`. Each preset is just
 * a period anchored to `now` (or the one before it), so there is no lookup table:
 * the preset names which period and how far to shift the reference date.
 */
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

/**
 * The `AllTime` range: from the business activation date to the present. Unlike
 * `rangeForPreset` this needs the activation date, so it is resolved wherever the
 * business context is available (the store resolver and the preset combo box).
 */
export function rangeForAllTime(activationDate: Date, now: Date = new Date()): DateRange {
  return correctDateRange({
    startDate: startOfDay(activationDate),
    endDate: endOfDay(now),
  })
}

/**
 * Derives a concrete date range for a preset. Relative presets are pure functions
 * of `now`; `AllTime` needs the business activation date and returns `null` when
 * it isn't available yet (so callers can defer/skip rather than show a wrong range).
 */
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

/**
 * Clamps a date range to a valid window: start clamped to on/after the activation
 * date, end clamped to the present, both at day granularity.
 */
function clampRangeToValid(range: DateRange, activationDate?: Date | null): DateRange {
  const startDate = startOfDay(range.startDate)
  const endDate = endOfDay(range.endDate)

  return {
    startDate: activationDate ? clampToAfterActivationDate(startDate, startOfDay(activationDate)) : startDate,
    endDate: clampToPresentOrPast(endDate),
  }
}

// Order in which a range is matched back to a preset: the first match wins.
// Periodic presets are checked before `AllTime` so a business activated on a
// period boundary (e.g. Jan 1) reports "This Year" rather than "All Time".
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
 * Derives the preset a range represents: a matching periodic preset, then `AllTime`,
 * otherwise `Custom`. `previousPreset` keeps the current selection sticky when the
 * range still matches it.
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
