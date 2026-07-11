import {
  endOfDay,
  endOfMonth,
  endOfYear,
  isEqual,
  max,
  min,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

export type DateSelectionMode = 'full' | 'month' | 'year'

export type DateRange = { startDate: Date, endDate: Date }

/** Exact-timestamp equality: both endpoints must match to the millisecond. */
export function isSameDateRange(a: DateRange, b: DateRange) {
  return isEqual(a.startDate, b.startDate) && isEqual(a.endDate, b.endDate)
}

/**
 * Calendar-day equality: ranges match if they cover the same days, ignoring the
 * time-of-day of each endpoint. Use this (not {@link isSameDateRange}) when
 * comparing a user-supplied range against a preset's canonical range.
 */
export function isSameCalendarDayRange(a: DateRange, b: DateRange) {
  return !!a.startDate && !!b.startDate && !!a.endDate && !!b.endDate
    && isEqual(startOfDay(a.startDate), startOfDay(b.startDate))
    && isEqual(endOfDay(a.endDate), endOfDay(b.endDate))
}

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

export function correctDateRange(range: DateRange): DateRange {
  const { startDate, endDate } = range

  if (startDate > endDate) {
    return { startDate: endDate, endDate: startDate }
  }

  return range
}

type GetDateRangeOptions =
  | { mode: 'full', startDate: Date, endDate: Date }
  | { mode: Exclude<DateSelectionMode, 'full'>, startDate?: Date, endDate: Date }

/**
 * Shapes a range for a selection mode, clamping the end to the present:
 * `month`/`year` snap to the period containing `endDate`; `full` keeps the
 * explicit range.
 */
export function getDateRange(options: GetDateRangeOptions): DateRange {
  const mode = options.mode
  switch (mode) {
    case 'month':
      return {
        startDate: startOfMonth(options.endDate),
        endDate: clampToPresentOrPast(endOfMonth(options.endDate)),
      }
    case 'year':
      return {
        startDate: startOfYear(options.endDate),
        endDate: clampToPresentOrPast(endOfYear(options.endDate)),
      }
    case 'full':
      return {
        startDate: options.startDate,
        endDate: clampToPresentOrPast(endOfDay(options.endDate)),
      }
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid mode',
      })
  }
}

export function getEffectiveDateForMode(mode: DateSelectionMode, { date }: { date: Date }): { date: Date } {
  return { date: getDateRange({ mode, startDate: date, endDate: date }).endDate }
}

export function getEffectiveDateRangeForMode(
  mode: DateSelectionMode,
  { startDate, endDate }: { startDate: Date, endDate: Date },
): { startDate: Date, endDate: Date } {
  return getDateRange({ mode, startDate, endDate })
}
